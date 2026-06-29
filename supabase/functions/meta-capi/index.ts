// Meta Conversions API forwarder.
// Receives an event from the client, derives client IP + User-Agent from
// request headers (never trusted from the body), hashes PII, and forwards to
// the Graph API. Browser pixel and server event share the same `event_id`
// for Meta's native deduplication.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GRAPH_VERSION = "v21.0";

type UserData = {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  external_id?: string;
  fbp?: string;
  fbc?: string;
};

type Body = {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  event_time?: number; // unix seconds
  action_source?: "website" | "email" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  user_data?: UserData;
  custom_data?: Record<string, unknown>;
  test_event_code?: string;
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

const sha256Hex = async (input: string): Promise<string> => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const normEmail = (s: string) => s.trim().toLowerCase();
const normPhone = (s: string) => s.replace(/[^\d]/g, "");
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pixelId = Deno.env.get("META_PIXEL_ID");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !accessToken) {
    console.error("[meta-capi] missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN");
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 500,
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

  const u = body.user_data ?? {};
  const userData: Record<string, unknown> = {};
  if (u.email) userData.em = [await sha256Hex(normEmail(u.email))];
  if (u.phone) userData.ph = [await sha256Hex(normPhone(u.phone))];
  if (u.first_name) userData.fn = [await sha256Hex(normName(u.first_name))];
  if (u.last_name) userData.ln = [await sha256Hex(normName(u.last_name))];
  if (u.country) userData.country = [await sha256Hex(normCountry(u.country))];
  if (u.external_id) userData.external_id = [await sha256Hex(u.external_id.trim().toLowerCase())];
  if (u.fbp) userData.fbp = u.fbp;
  if (u.fbc) userData.fbc = u.fbc;
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;

  const event = {
    event_name: body.event_name,
    event_id: body.event_id,
    event_time: body.event_time ?? Math.floor(Date.now() / 1000),
    action_source: body.action_source ?? "website",
    event_source_url: body.event_source_url,
    user_data: userData,
    custom_data: body.custom_data ?? {},
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (body.test_event_code) payload.test_event_code = body.test_event_code;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[meta-capi] graph error", res.status, text);
      return new Response(JSON.stringify({ error: "graph_error", status: res.status, body: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let parsed: unknown = text;
    try { parsed = JSON.parse(text); } catch { /* keep raw */ }
    return new Response(JSON.stringify({ ok: true, response: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[meta-capi] fetch failed", err);
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
