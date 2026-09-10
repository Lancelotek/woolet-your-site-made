// Immediate deletion of a pre-purchase fit photo ("Delete my photo").
//
// The files go straight away; the consent record and the millimetre numbers
// stay, because we must be able to show what was agreed and when.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const sessionRef = typeof body?.sessionRef === "string" ? body.sessionRef : "";
    if (!UUID_RE.test(sessionRef)) return json({ error: "invalid_session_ref" }, 400);

    const { data: rows, error } = await supabase
      .from("bespoke_order_photos")
      .select("id, photo_path, geometry_path, vto_path")
      .eq("session_ref", sessionRef)
      .is("order_id", null);
    if (error) throw error;
    if (!rows?.length) return json({ ok: true, removed: 0 });

    const paths = rows
      .flatMap((r) => [r.photo_path, r.geometry_path, r.vto_path])
      .filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("bespoke-photos").remove(paths);

    await supabase
      .from("bespoke_order_photos")
      .update({
        status: "purged",
        photo_path: null,
        geometry_path: null,
        vto_path: null,
        consent_withdrawn_at: new Date().toISOString(),
      })
      .in("id", rows.map((r) => r.id));

    return json({ ok: true, removed: paths.length });
  } catch (err) {
    console.error("[bespoke-photo-delete]", err);
    return json({ error: "server_error" }, 500);
  }
});
