// Unified server-side tracking forwarder.
// Receives a single normalized event from the client, derives client IP +
// User-Agent from request headers (never trusted from the body), hashes PII,
// then fans it out in parallel to:
//   - Meta Conversions API       (META_PIXEL_ID + META_CAPI_ACCESS_TOKEN)
//   - TikTok Events API v1.3     (TIKTOK_PIXEL_ID + TIKTOK_ACCESS_TOKEN)
//   - Reddit Conversions API     (REDDIT_PIXEL_ID + REDDIT_CAPI_ACCESS_TOKEN)
//
// Each destination is independent — missing credentials => that platform is
// skipped, never blocks the others. The same `event_id` is shared across all
// destinations so browser pixels can dedupe natively.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return null;
    _supabase = createClient(url, key, { auth: { persistSession: false } });
  }
  return _supabase;
}

async function logServerEvent(row: Record<string, unknown>) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.from("server_event_log").insert(row);
    if (error) console.error("[server_event_log] insert failed", error);
  } catch (e) {
    console.error("[server_event_log] exception", e);
  }
}

const META_GRAPH_VERSION = "v21.0";
const TIKTOK_ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";
const REDDIT_ENDPOINT_TMPL = (pixelId: string) =>
  `https://ads-api.reddit.com/api/v2.0/conversions/events/${pixelId}`;

type UserData = {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  external_id?: string;
  // Browser identifiers (kept raw, NOT hashed — platforms expect them plain)
  fbp?: string;
  fbc?: string;
  ttclid?: string;
  ttp?: string;       // TikTok cookie identifier
  rdt_uuid?: string;  // Reddit visitor cookie
};

type Body = {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  event_time?: number; // unix seconds
  user_data?: UserData;
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    content_category?: string;
    num_items?: number;
    order_id?: string;
    [k: string]: unknown;
  };
  test_event_code?: string;
  /** Per-destination overrides; useful when names differ on each platform. */
  platform_events?: {
    meta?: string;
    tiktok?: string;
    reddit?: string;
  };
};

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Lead",
  "CompleteRegistration",
  "Purchase",
]);

// Default name mapping. Callers can override via `platform_events`.
const TIKTOK_NAME_MAP: Record<string, string> = {
  PageView: "Pageview",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Lead: "SubmitForm",
  CompleteRegistration: "CompleteRegistration",
  Purchase: "CompletePayment",
};

const REDDIT_NAME_MAP: Record<string, string> = {
  PageView: "PageVisit",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "AddToCart",
  Lead: "Lead",
  CompleteRegistration: "SignUp",
  Purchase: "Purchase",
};

const sha256Hex = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const normEmail = (s: string) => s.trim().toLowerCase();
const normPhone = (s: string) => {
  // E.164 digits only; Reddit/TikTok want digits, Meta wants country code prefix.
  return s.replace(/[^\d]/g, "");
};
const normName = (s: string) => s.trim().toLowerCase();
const normCountry = (s: string) => s.trim().toLowerCase().slice(0, 2);

const extractClientIp = (req: Request): string | undefined => {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    undefined
  );
};

type Hashes = {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  country?: string;
  external_id?: string;
};

const buildHashes = async (u: UserData): Promise<Hashes> => {
  const h: Hashes = {};
  if (u.email) h.em = await sha256Hex(normEmail(u.email));
  if (u.phone) h.ph = await sha256Hex(normPhone(u.phone));
  if (u.first_name) h.fn = await sha256Hex(normName(u.first_name));
  if (u.last_name) h.ln = await sha256Hex(normName(u.last_name));
  if (u.country) h.country = await sha256Hex(normCountry(u.country));
  if (u.external_id) h.external_id = await sha256Hex(u.external_id.trim().toLowerCase());
  return h;
};

// ---------------------------------------------------------------------------
// Meta CAPI
// ---------------------------------------------------------------------------
async function sendMeta(
  body: Body,
  hashes: Hashes,
  ip: string | undefined,
  ua: string | undefined,
): Promise<{ status: "sent" | "skipped" | "error"; detail?: unknown }> {
  const pixelId = Deno.env.get("META_PIXEL_ID");
  const token = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !token) return { status: "skipped", detail: "not_configured" };

  const u = body.user_data ?? {};
  const userData: Record<string, unknown> = {};
  if (hashes.em) userData.em = [hashes.em];
  if (hashes.ph) userData.ph = [hashes.ph];
  if (hashes.fn) userData.fn = [hashes.fn];
  if (hashes.ln) userData.ln = [hashes.ln];
  if (hashes.country) userData.country = [hashes.country];
  if (hashes.external_id) userData.external_id = [hashes.external_id];
  if (u.fbp) userData.fbp = u.fbp;
  if (u.fbc) userData.fbc = u.fbc;
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;

  const event = {
    event_name: body.platform_events?.meta ?? body.event_name,
    event_id: body.event_id,
    event_time: body.event_time ?? Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: body.event_source_url,
    user_data: userData,
    custom_data: body.custom_data ?? {},
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (body.test_event_code) payload.test_event_code = body.test_event_code;

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[track-event:meta] error", res.status, text);
      return { status: "error", detail: { http: res.status, body: text.slice(0, 500) } };
    }
    return { status: "sent" };
  } catch (err) {
    console.error("[track-event:meta] fetch failed", err);
    return { status: "error", detail: String(err) };
  }
}

// ---------------------------------------------------------------------------
// TikTok Events API v1.3
// ---------------------------------------------------------------------------
async function sendTikTok(
  body: Body,
  hashes: Hashes,
  ip: string | undefined,
  ua: string | undefined,
): Promise<{ status: "sent" | "skipped" | "error"; detail?: unknown }> {
  const pixelId = Deno.env.get("TIKTOK_PIXEL_ID");
  const token = Deno.env.get("TIKTOK_ACCESS_TOKEN");
  if (!pixelId || !token) return { status: "skipped", detail: "not_configured" };

  const u = body.user_data ?? {};
  const user: Record<string, unknown> = {};
  if (hashes.em) user.email = hashes.em;
  if (hashes.ph) user.phone = hashes.ph;
  if (hashes.external_id) user.external_id = hashes.external_id;
  if (u.ttclid) user.ttclid = u.ttclid;
  if (u.ttp) user.ttp = u.ttp;
  if (ip) user.ip = ip;
  if (ua) user.user_agent = ua;

  const tiktokEventName =
    body.platform_events?.tiktok ?? TIKTOK_NAME_MAP[body.event_name] ?? body.event_name;

  const properties: Record<string, unknown> = {};
  const c = body.custom_data ?? {};
  if (typeof c.value === "number") properties.value = c.value;
  if (c.currency) properties.currency = String(c.currency).toUpperCase();
  if (c.content_ids) properties.contents = c.content_ids.map((id) => ({ content_id: id }));
  if (c.content_type) properties.content_type = c.content_type;
  if (c.content_name) properties.description = c.content_name;
  if (c.order_id) properties.order_id = String(c.order_id);

  const payload = {
    event_source: "web",
    event_source_id: pixelId,
    test_event_code: body.test_event_code,
    data: [
      {
        event: tiktokEventName,
        event_time: body.event_time ?? Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        user,
        properties,
        page: body.event_source_url ? { url: body.event_source_url } : undefined,
      },
    ],
  };

  try {
    const res = await fetch(TIKTOK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": token,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch { /* keep raw */ }
    if (!res.ok || parsed?.code !== 0) {
      console.error("[track-event:tiktok] error", res.status, text);
      return { status: "error", detail: { http: res.status, body: text.slice(0, 500) } };
    }
    return { status: "sent" };
  } catch (err) {
    console.error("[track-event:tiktok] fetch failed", err);
    return { status: "error", detail: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Reddit Conversions API
// ---------------------------------------------------------------------------
async function sendReddit(
  body: Body,
  hashes: Hashes,
  ip: string | undefined,
  ua: string | undefined,
): Promise<{ status: "sent" | "skipped" | "error"; detail?: unknown }> {
  const pixelId = Deno.env.get("REDDIT_PIXEL_ID");
  const token = Deno.env.get("REDDIT_CAPI_ACCESS_TOKEN");
  if (!pixelId || !token) return { status: "skipped", detail: "not_configured" };

  const u = body.user_data ?? {};
  const user: Record<string, unknown> = {};
  if (hashes.em) user.email = hashes.em;
  if (hashes.external_id) user.external_id = hashes.external_id;
  if (ip) user.ip_address = ip;
  if (ua) user.user_agent = ua;
  if (u.rdt_uuid) user.uuid = u.rdt_uuid;
  if (body.event_source_url) {
    try {
      user.screen = { url: body.event_source_url };
    } catch { /* noop */ }
  }

  const trackingType =
    body.platform_events?.reddit ?? REDDIT_NAME_MAP[body.event_name] ?? "Custom";

  const c = body.custom_data ?? {};
  const event_metadata: Record<string, unknown> = {};
  if (typeof c.value === "number") {
    event_metadata.value_decimal = c.value;
    event_metadata.value = Math.round(c.value * 100); // legacy field in cents
  }
  if (c.currency) event_metadata.currency = String(c.currency).toUpperCase();
  if (c.order_id) event_metadata.conversion_id = String(c.order_id);
  if (c.num_items) event_metadata.item_count = c.num_items;
  if (c.content_ids?.length) {
    event_metadata.products = c.content_ids.map((id) => ({ id }));
  }

  const payload = {
    test_mode: !!body.test_event_code,
    events: [
      {
        event_at: new Date((body.event_time ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        event_type: { tracking_type: trackingType },
        click_id: undefined, // Reddit accepts rdt_cid if available; not modeled here
        event_metadata,
        user,
        conversion_id: body.event_id, // dedupes with pixel
      },
    ],
  };

  try {
    const res = await fetch(REDDIT_ENDPOINT_TMPL(pixelId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[track-event:reddit] error", res.status, text);
      return { status: "error", detail: { http: res.status, body: text.slice(0, 500) } };
    }
    return { status: "sent" };
  } catch (err) {
    console.error("[track-event:reddit] fetch failed", err);
    return { status: "error", detail: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body?.event_name || !ALLOWED_EVENTS.has(body.event_name)) {
    return new Response(JSON.stringify({ error: "invalid_event_name" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body?.event_id || typeof body.event_id !== "string" || body.event_id.length > 100) {
    return new Response(JSON.stringify({ error: "invalid_event_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = extractClientIp(req);
  const ua = req.headers.get("user-agent") ?? undefined;
  const hashes = await buildHashes(body.user_data ?? {});

  // Fan out in parallel; never let one slow destination block the others.
  const [meta, tiktok, reddit] = await Promise.all([
    sendMeta(body, hashes, ip, ua),
    sendTikTok(body, hashes, ip, ua),
    sendReddit(body, hashes, ip, ua),
  ]);

  const u = body.user_data ?? {};
  const destinations = { meta, tiktok, reddit };
  const anySent = [meta, tiktok, reddit].some((d) => d.status === "sent");
  const anyError = [meta, tiktok, reddit].some((d) => d.status === "error");
  await logServerEvent({
    source: "track-event",
    event_name: body.event_name,
    event_id: body.event_id,
    email_hash: hashes.em ?? null,
    phone_hash: hashes.ph ?? null,
    external_id_hash: hashes.external_id ?? null,
    event_source_url: body.event_source_url ?? null,
    client_ip: ip ?? null,
    user_agent: ua ?? null,
    fbp: u.fbp ?? null,
    fbc: u.fbc ?? null,
    ttclid: u.ttclid ?? null,
    rdt_uuid: u.rdt_uuid ?? null,
    custom_data: body.custom_data ?? null,
    user_data_hashed: hashes,
    destinations,
    request_summary: {
      test_event_code: body.test_event_code ?? null,
      platform_events: body.platform_events ?? null,
      event_time: body.event_time ?? null,
    },
    status: anyError ? (anySent ? "partial" : "error") : anySent ? "sent" : "skipped",
  });

  return new Response(
    JSON.stringify({
      ok: true,
      event_id: body.event_id,
      event_name: body.event_name,
      destinations,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
