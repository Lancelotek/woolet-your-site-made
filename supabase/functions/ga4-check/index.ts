// Lightweight GA4 access probe. Runs a tiny runReport call and returns a
// friendly status so the Acquisition tab can show a clear message when the
// service account isn't granted Viewer on the GA4 property (403).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const GA4_PROPERTY_ID = Deno.env.get("GA4_PROPERTY_ID") ?? "";
const GA4_SERVICE_ACCOUNT_JSON = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON") ?? "";

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getGoogleAccessToken(scope: string, sa: { client_email: string; private_key: string; token_uri?: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope,
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;
  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`google_token_${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const provided = body.password ?? req.headers.get("x-admin-password") ?? "";
    if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ ok: false, status: "unauthorized", message: "Invalid password" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GA4_PROPERTY_ID) {
      return new Response(JSON.stringify({
        ok: false,
        status: "missing_property_id",
        message: "Brak sekretu GA4_PROPERTY_ID. Dodaj ID właściwości GA4 (same cyfry, np. 528040602).",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!GA4_SERVICE_ACCOUNT_JSON) {
      return new Response(JSON.stringify({
        ok: false,
        status: "missing_service_account",
        message: "Brak sekretu GA4_SERVICE_ACCOUNT_JSON. Wklej całą zawartość pliku .json konta serwisowego.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sa: { client_email: string; private_key: string; token_uri?: string };
    try {
      sa = JSON.parse(GA4_SERVICE_ACCOUNT_JSON);
    } catch (_e) {
      return new Response(JSON.stringify({
        ok: false,
        status: "invalid_service_account_json",
        message: "GA4_SERVICE_ACCOUNT_JSON nie jest poprawnym JSON-em. Wklej całą zawartość pliku .json od { do }.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const serviceAccountEmail = sa.client_email;

    let token: string;
    try {
      token = await getGoogleAccessToken("https://www.googleapis.com/auth/analytics.readonly", sa);
    } catch (e) {
      return new Response(JSON.stringify({
        ok: false,
        status: "token_failed",
        service_account_email: serviceAccountEmail,
        message: `Nie udało się uzyskać tokena Google (${(e as Error).message}). Sprawdź, czy private_key w GA4_SERVICE_ACCOUNT_JSON nie został ucięty.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
          metrics: [{ name: "sessions" }],
          limit: 1,
        }),
      },
    );

    if (res.ok) {
      return new Response(JSON.stringify({
        ok: true,
        status: "ok",
        property_id: GA4_PROPERTY_ID,
        service_account_email: serviceAccountEmail,
        message: `GA4 dostępne (property ${GA4_PROPERTY_ID}).`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const text = (await res.text()).slice(0, 400);

    if (res.status === 403) {
      return new Response(JSON.stringify({
        ok: false,
        status: "forbidden",
        http_status: 403,
        property_id: GA4_PROPERTY_ID,
        service_account_email: serviceAccountEmail,
        message:
          `403 Forbidden: konto serwisowe ${serviceAccountEmail} nie ma dostępu do property ${GA4_PROPERTY_ID}. ` +
          `Wejdź w GA4 → Admin → Property Access Management, dodaj powyższy e-mail z rolą Viewer, następnie kliknij "Run ga4 now".`,
        raw: text,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (res.status === 404) {
      return new Response(JSON.stringify({
        ok: false,
        status: "property_not_found",
        http_status: 404,
        property_id: GA4_PROPERTY_ID,
        service_account_email: serviceAccountEmail,
        message: `404 Not Found: property ${GA4_PROPERTY_ID} nie istnieje. Sprawdź GA4_PROPERTY_ID (same cyfry, bez "GA4-" ani "properties/").`,
        raw: text,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      ok: false,
      status: "http_error",
      http_status: res.status,
      property_id: GA4_PROPERTY_ID,
      service_account_email: serviceAccountEmail,
      message: `GA4 API zwróciło ${res.status}. ${text}`,
      raw: text,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, status: "exception", message: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
