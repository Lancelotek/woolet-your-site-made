// One-off, admin-protected: moves base64 renders in bespoke_ai_previews into
// the bespoke-renders bucket, creates v1 cache rows and replaces image_url.
// Processes a batch per call; call repeatedly until remaining = 0.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import {
  RENDER_BUCKET, buildKeyV1, buildAlt, buildStoragePath, publicUrlFor, decodeDataUrl,
} from "../_shared/bespoke-render.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const nameOf = (label: string | null) => (label ?? "").replace(/\s*\([^)]*\)\s*$/, "");
const codeOf = (label: string | null) => (label ?? "").match(/\(([^)]+)\)\s*$/)?.[1] ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const pw = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";
  let body: { password?: string; limit?: number } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const provided = body.password ?? req.headers.get("x-admin-password") ?? "";
  if (!pw || provided !== pw) return json({ error: "Invalid password" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: bucket } = await admin.storage.getBucket(RENDER_BUCKET);
  const isPublic = Boolean(bucket?.public);
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 25);

  const { data: rows, error } = await admin
    .from("bespoke_ai_previews")
    .select("id, selection_key, image_url, shape, front_color, temple_color, finish")
    .like("image_url", "data:image%")
    .limit(limit);
  if (error) return json({ error: error.message }, 500);

  let migrated = 0;
  const failures: { id: string; error: string }[] = [];
  for (const r of rows ?? []) {
    try {
      const key = buildKeyV1(r.selection_key);
      const shape = r.shape || r.selection_key.split("|")[0] || "frame";
      const frontName = nameOf(r.front_color);
      const templeName = nameOf(r.temple_color);
      const finish = r.finish || "";
      const alt = buildAlt({ shape, frontName, templeName, finish, lensType: "plano" });

      const { data: existing } = await admin
        .from("bespoke_render_cache").select("public_url").eq("selection_key", key).maybeSingle();
      let publicUrl = existing?.public_url as string | undefined;
      if (!publicUrl) {
        const path = await buildStoragePath({ key, shape, frontName, templeName, finish, lensType: "plano" });
        const { error: upErr } = await admin.storage.from(RENDER_BUCKET)
          .upload(path, decodeDataUrl(r.image_url), { contentType: "image/png", upsert: true, cacheControl: "31536000" });
        if (upErr) throw new Error(upErr.message);
        publicUrl = publicUrlFor(SUPABASE_URL, path, isPublic);
        await admin.from("bespoke_render_cache").upsert({
          selection_key: key, key_version: 1, shape, front_code: codeOf(r.front_color), front_name: frontName,
          temple_code: codeOf(r.temple_color), temple_name: templeName, finish, lens_type: "plano",
          storage_path: path, public_url: publicUrl, alt_text: alt, prompt_version: "v1-backfill",
        }, { onConflict: "selection_key", ignoreDuplicates: true });
        const { data: winner } = await admin
          .from("bespoke_render_cache").select("public_url").eq("selection_key", key).maybeSingle();
        publicUrl = winner?.public_url ?? publicUrl;
      }
      const { error: updErr } = await admin.from("bespoke_ai_previews").update({ image_url: publicUrl }).eq("id", r.id);
      if (updErr) throw new Error(updErr.message);
      migrated++;
    } catch (e) {
      failures.push({ id: r.id, error: (e as Error).message });
    }
  }
  const { count } = await admin
    .from("bespoke_ai_previews").select("id", { count: "exact", head: true }).like("image_url", "data:image%");
  return json({ migrated, failed: failures.length, failures, remaining: count ?? null });
});
