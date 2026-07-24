import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
}

async function saveAttribution(
  email: string,
  payload: {
    fbp?: string;
    fbc?: string;
    ttclid?: string;
    rdt_uuid?: string;
    event_source_url?: string;
    meta_event_id?: string;
  },
  req: Request,
) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  try {
    const supabase = createClient(url, key);
    const row = {
      email: email.trim().toLowerCase(),
      ip_address: getClientIp(req),
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
      fbp: payload.fbp || null,
      fbc: payload.fbc || null,
      ttclid: payload.ttclid || null,
      rdt_uuid: payload.rdt_uuid || null,
      event_source_url: payload.event_source_url?.slice(0, 500) || null,
      meta_event_id: payload.meta_event_id || null,
    };
    const { error } = await supabase
      .from("waitlist_attribution")
      .upsert(row, { onConflict: "email" });
    if (error) console.error("[waitlist_attribution] upsert error", error);
  } catch (e) {
    console.error("[waitlist_attribution] failed", e);
  }
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Structured log line — one JSON object per event for easy log filtering.
function logStructured(level: "info" | "warn" | "error", fields: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

async function persistCapiLog(row: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  try {
    const supabase = createClient(url, key);
    const { error } = await supabase.from("meta_capi_lead_log").insert(row);
    if (error) console.error("[meta_capi_lead_log] insert error", error);
  } catch (e) {
    console.error("[meta_capi_lead_log] failed", e);
  }
}

// Send server-side Lead event to Meta Conversions API.
// Deduplicated with browser pixel via shared meta_event_id.
async function sendMetaCapiLead(params: {
  email: string;
  phone?: string;
  country_code?: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
  meta_event_id?: string;
  source?: string;
  correlation_id: string;
  req: Request;
}) {
  const pixelId = Deno.env.get("META_PIXEL_ID");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  const email = params.email.trim().toLowerCase();
  const emailHash = await sha256Hex(email);
  const event_id = params.meta_event_id || crypto.randomUUID();
  const base = {
    correlation_id: params.correlation_id,
    event_id,
    event_name: "Lead",
    source: params.source ?? null,
    email_hash: emailHash,
    meta_event_id: params.meta_event_id ?? null,
  };

  if (!pixelId || !accessToken) {
    logStructured("warn", { ...base, msg: "capi_skipped_not_configured" });
    await persistCapiLog({ ...base, ok: false, error: "not_configured" });
    return;
  }

  const startedAt = Date.now();
  try {
    const user_data: Record<string, unknown> = { em: [emailHash] };
    if (params.phone) {
      const phoneDigits = params.phone.replace(/[^\d]/g, "");
      if (phoneDigits) user_data.ph = [await sha256Hex(phoneDigits)];
    }
    if (params.country_code) {
      user_data.country = [await sha256Hex(params.country_code.trim().toLowerCase().slice(0, 2))];
    }
    if (params.fbp) user_data.fbp = params.fbp;
    if (params.fbc) user_data.fbc = params.fbc;
    const ip = getClientIp(params.req);
    if (ip) user_data.client_ip_address = ip;
    const ua = params.req.headers.get("user-agent");
    if (ua) user_data.client_user_agent = ua;

    const payload = {
      data: [{
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url: params.event_source_url,
        action_source: "website",
        user_data,
        custom_data: {
          currency: "USD",
          value: 5,
          lead_source: params.source || "waitlist",
        },
      }],
    };

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const bodyText = await res.text();
    const durationMs = Date.now() - startedAt;
    const snippet = bodyText.slice(0, 500);

    if (!res.ok) {
      logStructured("error", {
        ...base,
        msg: "capi_lead_failed",
        http_status: res.status,
        duration_ms: durationMs,
        response_snippet: snippet,
      });
      await persistCapiLog({
        ...base,
        ok: false,
        http_status: res.status,
        duration_ms: durationMs,
        response_snippet: snippet,
        error: `http_${res.status}`,
      });
    } else {
      logStructured("info", {
        ...base,
        msg: "capi_lead_sent",
        http_status: res.status,
        duration_ms: durationMs,
      });
      await persistCapiLog({
        ...base,
        ok: true,
        http_status: res.status,
        duration_ms: durationMs,
        response_snippet: snippet,
      });
    }
  } catch (e) {
    const durationMs = Date.now() - startedAt;
    const errMsg = e instanceof Error ? e.message : String(e);
    logStructured("error", { ...base, msg: "capi_lead_error", duration_ms: durationMs, error: errMsg });
    await persistCapiLog({ ...base, ok: false, duration_ms: durationMs, error: errMsg });
  }
}

const MAILERLITE_API = "https://connect.mailerlite.com/api";

// MailerLite group IDs
const VIP_GROUP_ID = "192429285503403097";          // Kickstarter VIP (dedicated)
const WAITLIST_ENG_GROUP_ID = "181841182994728358"; // Woolet Waitlist ENG (general)
const AI_SCAN_GROUP_ID = "189356132351870087";      // AI Scan leads
const BESPOKE_GROUP_ID = "189449279680546761";      // Bespoke configurator waitlist

async function mlFetch(apiKey: string, path: string, method: string, body?: unknown) {
  const res = await fetch(`${MAILERLITE_API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, data: await res.json() };
}

async function ensureCustomFields(apiKey: string) {
  // Idempotent: MailerLite returns 422 if a field already exists.
  // `phone` is a default MailerLite field (id=6), no need to recreate.
  const fields = [
    { name: "face_width", type: "text" },
    { name: "interested_models", type: "text" },
    { name: "scan_device", type: "text" },
    { name: "sms", type: "text" },
    { name: "country", type: "text" },
    { name: "country_code", type: "text" },
    { name: "utm_source", type: "text" },
    { name: "utm_medium", type: "text" },
    { name: "utm_campaign", type: "text" },
    { name: "utm_content", type: "text" },
    { name: "utm_term", type: "text" },
  ];

  for (const field of fields) {
    const { status } = await mlFetch(apiKey, "/fields", "POST", field);
    if (status === 200) {
      console.log(`Created custom field: ${field.name}`);
    } else {
      console.log(`Field ${field.name} skipped (status: ${status})`);
    }
  }
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlation_id =
    req.headers.get("x-correlation-id") || crypto.randomUUID();

  try {
    const apiKey = Deno.env.get("MAILERLITE_API_KEY");
    if (!apiKey) {
      throw new Error("MAILERLITE_API_KEY is not configured");
    }

    const {
      email,
      name,
      phone,
      face_width,
      models,
      source,
      device,
      country,
      country_code,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      fbp,
      fbc,
      ttclid,
      rdt_uuid,
      event_source_url,
      meta_event_id,
    } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Capture marketing attribution (IP/UA from headers + browser identifiers)
    // so payments-webhook can match a later Stripe Purchase back to this lead.
    await saveAttribution(
      email,
      { fbp, fbc, ttclid, rdt_uuid, event_source_url, meta_event_id },
      req,
    );

    await ensureCustomFields(apiKey);

    // Route by source
    const groups: string[] = [];
    if (source === "scan") {
      groups.push(AI_SCAN_GROUP_ID);
    } else if (source === "bespoke") {
      groups.push(BESPOKE_GROUP_ID);
    } else if (source === "kickstarter") {
      // Dedicated Kickstarter VIP group for campaign reporting
      groups.push(VIP_GROUP_ID);
    } else if (source === "DE" || source === "de") {
      // DE landing pages stay in the general Woolet Waitlist ENG group
      groups.push(WAITLIST_ENG_GROUP_ID);
    } else {
      // Default/missing — general waitlist
      groups.push(WAITLIST_ENG_GROUP_ID);
    }

    const subscriberFields: Record<string, string> = {
      name: name || "",
      face_width: face_width || "",
      interested_models: models || "",
      scan_device: device || "",
    };
    if (phone) {
      subscriberFields.phone = String(phone);
      subscriberFields.sms = String(phone);
    }
    if (utm_source) subscriberFields.utm_source = String(utm_source);
    if (utm_medium) subscriberFields.utm_medium = String(utm_medium);
    if (utm_campaign) subscriberFields.utm_campaign = String(utm_campaign);
    if (utm_content) subscriberFields.utm_content = String(utm_content);
    if (utm_term) subscriberFields.utm_term = String(utm_term);
    if (country) subscriberFields.country = String(country);
    if (country_code) subscriberFields.country_code = String(country_code);

    const { status, data } = await mlFetch(apiKey, "/subscribers", "POST", {
      email,
      fields: subscriberFields,
      groups,
      status: "active",                    // skip MailerLite double opt-in
      subscribed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    });


    if (status >= 400) {
      console.error("MailerLite API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || `MailerLite API error [${status}]`,
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      "Subscriber added:", email,
      "| source:", source || "default",
      "| phone:", phone ? "yes" : "-",
      "| device:", device || "-",
      "| face_width:", face_width || "-",
      "| models:", models || "-",
    );

    // Fire server-side Meta CAPI Lead event (deduped with browser pixel via meta_event_id)
    await sendMetaCapiLead({
      email,
      phone,
      country_code,
      fbp,
      fbc,
      event_source_url,
      meta_event_id,
      source,
      correlation_id,
      req,
    });

    return new Response(
      JSON.stringify({ success: true, correlation_id, subscriber: { email: data.data?.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "x-correlation-id": correlation_id } }
    );
  } catch (error: unknown) {
    console.error("Error in mailerlite-subscribe:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
