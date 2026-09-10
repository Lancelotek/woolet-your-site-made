// Withdrawal of photo consent: deletes the stored files immediately and stamps
// the withdrawal on the record we are required to keep as proof of consent.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SID_RE = /^[A-Za-z0-9_-]{20,200}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const sid = typeof body?.sid === "string" ? body.sid : "";
    if (!SID_RE.test(sid)) return json({ error: "invalid_sid" }, 400);

    const { data: order } = await supabase
      .from("bespoke_orders")
      .select("id")
      .eq("stripe_session_id", sid)
      .maybeSingle();
    if (!order) return json({ error: "not_found" }, 404);

    const { data: photo } = await supabase
      .from("bespoke_order_photos")
      .select("id, photo_path, geometry_path, vto_path")
      .eq("order_id", order.id)
      .maybeSingle();
    if (!photo) return json({ ok: true, removed: 0 });

    const paths = [photo.photo_path, photo.geometry_path, photo.vto_path].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("bespoke-photos").remove(paths);

    await supabase
      .from("bespoke_order_photos")
      .update({
        status: "withdrawn",
        photo_path: null,
        geometry_path: null,
        vto_path: null,
        consent_withdrawn_at: new Date().toISOString(),
      })
      .eq("id", photo.id);

    return json({ ok: true, removed: paths.length });
  } catch (err) {
    console.error("[bespoke-consent-withdraw]", err);
    return json({ error: "server_error" }, 500);
  }
});
