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
  if (req.method !== "POST" && req.method !== "PATCH") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "";
    const token = typeof body?.token === "string" ? body.token : "";
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(id) || token.length < 16 || token.length > 128) {
      return new Response(JSON.stringify({ error: "invalid_params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const update: Record<string, unknown> = {};
    if (typeof body.status === "string" && ALLOWED_STATUS.has(body.status)) {
      update.status = body.status;
    }
    if (Number.isFinite(body.face_width_mm)) {
      update.face_width_mm = Math.max(0, Math.min(400, Math.round(body.face_width_mm)));
    }
    if (Number.isFinite(body.nose_width_mm)) {
      update.nose_width_mm = Math.max(0, Math.min(200, Math.round(body.nose_width_mm)));
    }
    if (typeof body.recommendation_type === "string" && ALLOWED_RECO.has(body.recommendation_type)) {
      update.recommendation_type = body.recommendation_type;
    }
    if (typeof body.confidence === "string" && ALLOWED_CONF.has(body.confidence)) {
      update.confidence = body.confidence;
    }
    if (typeof body.user_agent === "string") {
      update.user_agent = body.user_agent.slice(0, 255);
    }

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: "no_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("scan_sessions")
      .update(update)
      .eq("id", id)
      .eq("access_token", token)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[scan-session-update] update failed", error);
      return new Response(JSON.stringify({ error: "update_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[scan-session-update] error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
