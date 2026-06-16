import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_STATUS = new Set(["pending", "connected", "completed", "failed"]);
const ALLOWED_RECO = new Set([
  "standard_fit",
  "standard_face_wide_bridge",
  "wide_face_wide_bridge",
  "wide_face_narrow_bridge",
  "narrow_fit",
]);
const ALLOWED_CONF = new Set(["low", "medium", "high"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "invalid_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken =
      crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");

    const row: Record<string, unknown> = {
      email,
      access_token: accessToken,
      status: ALLOWED_STATUS.has(body?.status) ? body.status : "pending",
    };
    if (Number.isFinite(body?.face_width_mm)) {
      row.face_width_mm = Math.max(0, Math.min(400, Math.round(body.face_width_mm)));
    }
    if (Number.isFinite(body?.nose_width_mm)) {
      row.nose_width_mm = Math.max(0, Math.min(200, Math.round(body.nose_width_mm)));
    }
    if (typeof body?.recommendation_type === "string" && ALLOWED_RECO.has(body.recommendation_type)) {
      row.recommendation_type = body.recommendation_type;
    }
    if (typeof body?.confidence === "string" && ALLOWED_CONF.has(body.confidence)) {
      row.confidence = body.confidence;
    }
    if (typeof body?.user_agent === "string") {
      row.user_agent = body.user_agent.slice(0, 255);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("scan_sessions")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) {
      console.error("[scan-session-create] insert failed", error);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: data.id, token: accessToken }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[scan-session-create] error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
