import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAILERLITE_API = "https://connect.mailerlite.com/api";

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
  // Try to create fields — MailerLite returns 422 if they already exist, which is fine
  const fields = [
    { name: "face_width", type: "text" },
    { name: "interested_models", type: "text" },
  ];

  for (const field of fields) {
    const { status } = await mlFetch(apiKey, "/fields", "POST", field);
    if (status === 200) {
      console.log(`Created custom field: ${field.name}`);
    } else {
      console.log(`Field ${field.name} already exists or skipped (status: ${status})`);
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

    const { email, name, face_width, models } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure custom fields exist in MailerLite (idempotent)
    await ensureCustomFields(apiKey);

    // Subscribe with all fields
    const { status, data } = await mlFetch(apiKey, "/subscribers", "POST", {
      email,
      fields: {
        name: name || "",
        face_width: face_width || "",
        interested_models: models || "",
      },
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

    console.log("Subscriber added:", email, "| face_width:", face_width, "| models:", models);

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
