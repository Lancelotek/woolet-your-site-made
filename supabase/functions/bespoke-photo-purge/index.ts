// Daily retention job, scoped to pre-purchase fit photos only.
//
// Rule: a photo saved before any order is deleted 30 days after upload. The
// consent record and the millimetre numbers are kept as proof of what was
// agreed; only the image files and their paths go.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const RETENTION_DAYS = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();

    const { data: rows, error } = await supabase
      .from("bespoke_order_photos")
      .select("id, photo_path, geometry_path, vto_path")
      .eq("status", "pre_order")
      .lt("uploaded_at", cutoff);
    if (error) throw error;
    if (!rows?.length) return json({ ok: true, purged: 0, files: 0 });

    const paths = rows
      .flatMap((r) => [r.photo_path, r.geometry_path, r.vto_path])
      .filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("bespoke-photos").remove(paths);

    const { error: updErr } = await supabase
      .from("bespoke_order_photos")
      .update({ status: "purged", photo_path: null, geometry_path: null, vto_path: null })
      .in("id", rows.map((r) => r.id));
    if (updErr) throw updErr;

    return json({ ok: true, purged: rows.length, files: paths.length });
  } catch (err) {
    console.error("[bespoke-photo-purge]", err);
    return json({ error: "server_error" }, 500);
  }
});
