// Retention sweep. Deletes stored customer photos once their retention window
// has passed; the consent record itself is kept as proof, without the files.
// Backend-only: requires the service-role key.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isServiceRoleRequest } from "../_shared/require-service-role.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!isServiceRoleRequest(req)) return json({ error: "forbidden" }, 403);

  try {
    const now = new Date().toISOString();
    const { data: orders, error } = await supabase
      .from("bespoke_orders")
      .select("id")
      .lte("purge_after", now)
      .is("purged_at", null)
      .limit(200);
    if (error) throw error;

    let files = 0;
    for (const order of orders ?? []) {
      const { data: photo } = await supabase
        .from("bespoke_order_photos")
        .select("id, photo_path, geometry_path, vto_path")
        .eq("order_id", order.id)
        .maybeSingle();

      const paths = [photo?.photo_path, photo?.geometry_path, photo?.vto_path].filter(Boolean) as string[];
      if (paths.length) {
        await supabase.storage.from("bespoke-photos").remove(paths);
        files += paths.length;
      }
      if (photo) {
        await supabase
          .from("bespoke_order_photos")
          .update({ status: "purged", photo_path: null, geometry_path: null, vto_path: null })
          .eq("id", photo.id);
      }
      await supabase.from("bespoke_orders").update({ purged_at: now }).eq("id", order.id);
    }

    return json({ ok: true, orders: orders?.length ?? 0, files });
  } catch (err) {
    console.error("[bespoke-photo-purge]", err);
    return json({ error: "server_error" }, 500);
  }
});
