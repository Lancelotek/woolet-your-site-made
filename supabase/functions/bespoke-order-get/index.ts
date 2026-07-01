import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const sid = new URL(req.url).searchParams.get("sid");
    if (!sid || sid.length < 20 || sid.length > 200 || !/^[A-Za-z0-9_-]+$/.test(sid)) {
      return new Response(JSON.stringify({ error: "invalid_sid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data, error } = await supabase
      .from("bespoke_orders")
      .select(
        "stripe_session_id, customer_email, customer_name, frame_name, front_code, temple_code, finish_id, lens_type, engraving_text, amount_cents, currency, ai_preview_url, measurements_submitted_at, ai_face_width_mm, ai_temple_to_temple_mm, ai_bridge_width_mm, ai_pd_mm, ai_notes, manual_face_width_mm, manual_temple_to_temple_mm, manual_bridge_width_mm, manual_pd_mm, manual_temple_length_mm, manual_head_circumference_mm, manual_ear_to_ear_mm, manual_notes",
      )
      .eq("stripe_session_id", sid)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Redact full email in response — return only the masked version so a
    // guessed session ID can't leak the buyer's address.
    const em = (data as any).customer_email as string;
    const masked = em ? em.replace(/^(.).*(@.*)$/, "$1***$2") : null;
    return new Response(
      JSON.stringify({ ...data, customer_email_masked: masked, customer_email: undefined }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[bespoke-order-get]", err);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
