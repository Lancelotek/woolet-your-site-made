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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    } else if (source === "kickstarter" || source === "DE" || source === "de") {
      // DE landing pages route into the same Woolet Waitlist ENG group
      groups.push(VIP_GROUP_ID);
    } else {
      // Default/missing — keep current behavior (VIP / Woolet Waitlist ENG)
      groups.push(VIP_GROUP_ID);
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

    return new Response(
      JSON.stringify({ success: true, subscriber: { email: data.data?.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in mailerlite-subscribe:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
