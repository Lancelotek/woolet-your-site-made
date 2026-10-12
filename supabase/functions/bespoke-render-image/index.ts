// Streams a hosted bespoke render from the bespoke-renders bucket at a stable
// public URL: /functions/v1/bespoke-render-image/renders/{shape}/{file}.png
// Product imagery only (no personal data); paths are restricted to renders/.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { RENDER_BUCKET } from "../_shared/bespoke-render.ts";

const PATH_RE = /^renders\/[a-z0-9-]+\/[a-z0-9-]+\.png$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  const idx = url.pathname.indexOf("/renders/");
  const path = idx >= 0 ? decodeURIComponent(url.pathname.slice(idx + 1)) : "";
  if (!PATH_RE.test(path)) return new Response("Not found", { status: 404 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data, error } = await admin.storage.from(RENDER_BUCKET).download(path);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(req.method === "HEAD" ? null : data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
