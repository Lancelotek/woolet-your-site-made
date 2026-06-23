import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAILERLITE_API = "https://connect.mailerlite.com/api";

// MailerLite group IDs
const VIP_GROUP_ID = "181841182994728358";          // Kickstarter VIP (default)
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
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await ensureCustomFields(apiKey);

    // Route by source
    const groups: string[] = [];
    if (source === "scan") {
      groups.push(AI_SCAN_GROUP_ID);
    } else if (source === "bespoke") {
      groups.push(BESPOKE_GROUP_ID);
    } else if (source === "kickstarter") {
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
    if (phone) subscriberFields.phone = String(phone);
    if (utm_source) subscriberFields.utm_source = String(utm_source);
    if (utm_medium) subscriberFields.utm_medium = String(utm_medium);
    if (utm_campaign) subscriberFields.utm_campaign = String(utm_campaign);
    if (utm_content) subscriberFields.utm_content = String(utm_content);
    if (utm_term) subscriberFields.utm_term = String(utm_term);

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
