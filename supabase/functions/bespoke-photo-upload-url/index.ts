// Issues short-lived signed upload URLs for the fit-photo step.
//
// Two callers:
//  · post-purchase page — `sid` (Stripe session) → orders/{order_id}/…
//  · configurator step 3 — `sessionRef` (pseudonymous) → sessions/{ref}/…
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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    const sessionRef =
      typeof body?.sessionRef === "string" && UUID_RE.test(body.sessionRef) ? body.sessionRef : null;
    const probe = body?.probe === true;

    if (!sid && !sessionRef) return json({ error: "invalid_sid" }, 400);
    if (sid && !SID_RE.test(sid)) return json({ error: "invalid_sid" }, 400);

    let order: { id: string; frame_id: string | null; purged_at: string | null } | null = null;
    if (sid) {
      const { data, error } = await supabase
        .from("bespoke_orders")
        .select("id, frame_id, purged_at")
        .eq("stripe_session_id", sid)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "not_found" }, 404);
      if (data.purged_at) return json({ error: "purged" }, 410);
      order = data;
    }

    // Does a photo already exist for this order/session?
    const q = supabase.from("bespoke_order_photos").select("status, uploaded_at, session_ref").limit(1);
    const { data: existingRows } = order
      ? await q.eq("order_id", order.id)
      : await q.eq("session_ref", sessionRef!).is("order_id", null);
    const existing = existingRows?.[0] ?? null;

    if (probe) {
      return json({ existing: existing?.status === "pending" ? null : existing });
    }

    const prefix = order ? `orders/${order.id}` : `sessions/${sessionRef}`;
    const stamp = Date.now();
    const uploads: Record<string, { path: string; token: string }> = {};
    for (const kind of KINDS) {
      const path = `${prefix}/${kind}-${stamp}.${EXT[kind]}`;
      const { data, error: signErr } = await supabase.storage
        .from("bespoke-photos")
        .createSignedUploadUrl(path);
      if (signErr || !data) throw signErr ?? new Error("sign_failed");
      uploads[kind] = { path, token: data.token };
    }

    // Open the record as `pending` for orders; the pre-purchase row is written
    // by bespoke-photo-submit once consent has actually been given.
    if (order) {
      await supabase.from("bespoke_order_photos").upsert(
        {
          order_id: order.id,
          status: "pending",
          consent_text: "",
          consent_version: "bespoke-photo-v1",
          consent_at: new Date().toISOString(),
        },
        { onConflict: "order_id", ignoreDuplicates: true },
      );
    }

    return json({ orderId: order?.id ?? null, frameId: order?.frame_id ?? null, existing, uploads });
  } catch (err) {
    console.error("[bespoke-photo-upload-url]", err);
    return json({ error: "server_error" }, 500);
  }
});
