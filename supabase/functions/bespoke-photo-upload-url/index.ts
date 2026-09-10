// Issues short-lived signed upload URLs for the post-purchase photo step.
//
// Data controller: JAY23 LLC. Files land in the private `bespoke-photos`
// bucket; nothing is publicly readable and no URL here is shareable for reads.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SID_RE = /^[A-Za-z0-9_-]{20,200}$/;
const KINDS = ["photo", "geometry", "vto"] as const;
type Kind = (typeof KINDS)[number];

const EXT: Record<Kind, string> = { photo: "jpg", geometry: "png", vto: "png" };

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

    const { data: order, error } = await supabase
      .from("bespoke_orders")
      .select("id, frame_id, frame_name, purged_at")
      .eq("stripe_session_id", sid)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: "not_found" }, 404);
    if (order.purged_at) return json({ error: "purged" }, 410);

    const stamp = Date.now();
    const uploads: Record<string, { path: string; token: string }> = {};
    for (const kind of KINDS) {
      const path = `${order.id}/${kind}-${stamp}.${EXT[kind]}`;
      const { data, error: signErr } = await supabase.storage
        .from("bespoke-photos")
        .createSignedUploadUrl(path);
      if (signErr || !data) throw signErr ?? new Error("sign_failed");
      uploads[kind] = { path, token: data.token };
    }

    // Open the record as `pending`; bespoke-photo-submit flips it to `submitted`.
    await supabase
      .from("bespoke_order_photos")
      .upsert(
        {
          order_id: order.id,
          status: "pending",
          consent_text: "",
          consent_version: "bespoke-photo-v1",
          consent_at: new Date().toISOString(),
        },
        { onConflict: "order_id", ignoreDuplicates: true },
      );

    return json({ orderId: order.id, frameId: order.frame_id, uploads });
  } catch (err) {
    console.error("[bespoke-photo-upload-url]", err);
    return json({ error: "server_error" }, 500);
  }
});
