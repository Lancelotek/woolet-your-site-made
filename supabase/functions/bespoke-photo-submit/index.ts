// Records the post-purchase photo, its derived geometry and the consent that
// permits it. Data controller: JAY23 LLC. The workshop in Greece reads this
// only through the workshop package endpoint; the scan provider never sees it.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SID_RE = /^[A-Za-z0-9_-]{20,200}$/;
const CONSENT_VERSION = "bespoke-photo-v1";
const IP_SALT = Deno.env.get("CONSENT_IP_SALT") ?? "";
/** Anything beyond this gap between photo and scan pauses production. */
const DELTA_BLOCK_MM = 4;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number.parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

async function hashIp(ip: string): Promise<string | null> {
  if (!ip) return null;
  const data = new TextEncoder().encode(`${IP_SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const sid = typeof body?.sid === "string" ? body.sid : "";
    const sessionRef = typeof body?.sessionRef === "string" && UUID_RE.test(body.sessionRef)
      ? body.sessionRef
      : null;
    // Two callers: the post-purchase page (sid) and the configurator's
    // pre-purchase "On your face" panel (sessionRef, no order yet).
    if (!sid && !sessionRef) return json({ error: "invalid_sid" }, 400);
    if (sid && !SID_RE.test(sid)) return json({ error: "invalid_sid" }, 400);

    const consentText = str(body?.consentText, 2000);
    if (!consentText || body?.consentGiven !== true) return json({ error: "consent_required" }, 400);

    let order: { id: string; session_ref: string | null; purged_at: string | null } | null = null;
    if (sid) {
      const { data, error } = await supabase
        .from("bespoke_orders")
        .select("id, session_ref, purged_at")
        .eq("stripe_session_id", sid)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "not_found" }, 404);
      if (data.purged_at) return json({ error: "purged" }, 410);
      order = data;
    }


    const scanRef = order?.session_ref ?? sessionRef;

    // Cross-check the photo against the scan, when we have one to compare to.
    let scanTt: number | null = null;
    if (scanRef) {
      const { data: scan } = await supabase
        .from("bespoke_scan_profiles")
        .select("face_width_mm")
        .eq("session_ref", scanRef)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      scanTt = scan?.face_width_mm != null ? Number(scan.face_width_mm) : null;
    }

    const photoTt = num(body?.photoTempleToTempleMm);
    const delta = photoTt != null && scanTt != null ? Math.round(Math.abs(photoTt - scanTt) * 100) / 100 : null;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "";

    const row = {
      order_id: order?.id ?? null,
      session_ref: scanRef,
      status: order ? "submitted" : "pre_order",
      uploaded_at: new Date().toISOString(),
      photo_path: str(body?.photoPath, 400),
      geometry_path: str(body?.geometryPath, 400),
      vto_path: str(body?.vtoPath, 400),
      photo_width_px: num(body?.photoWidthPx),
      photo_height_px: num(body?.photoHeightPx),
      card_px: num(body?.cardPx),
      mm_per_px: num(body?.mmPerPx),
      temple_left_px: num(body?.templeLeftPx),
      temple_right_px: num(body?.templeRightPx),
      photo_temple_to_temple_mm: photoTt,
      scan_temple_to_temple_mm: scanTt,
      delta_mm: delta,
      frame_front_width_mm: num(body?.frameFrontWidthMm),
      frame_bridge_mm: num(body?.frameBridgeMm),
      shape_id: str(body?.shapeId, 60),
      mapping_version: str(body?.mappingVersion, 30) ?? "frame-dimensions-v0",
      consent_text: consentText,
      consent_version: str(body?.consentVersion, 40) ?? CONSENT_VERSION,
      consent_at: new Date().toISOString(),
      consent_ip_hash: await hashIp(ip),
      consent_locale: str(body?.locale, 10) ?? "en",
      consent_withdrawn_at: null,
    };

    if (order) {
      const { error: upsertErr } = await supabase
        .from("bespoke_order_photos")
        .upsert(row, { onConflict: "order_id" });
      if (upsertErr) throw upsertErr;

      // purge_after is stamped at delivery (90 days later), not here.
      await supabase
        .from("bespoke_orders")
        .update({ production_blocked: delta != null && delta > DELTA_BLOCK_MM })
        .eq("id", order.id);
    } else {
      // Pre-purchase: one row per browsing session, replaced on every save.
      const { data: existing } = await supabase
        .from("bespoke_order_photos")
        .select("id")
        .eq("session_ref", scanRef)
        .is("order_id", null)
        .maybeSingle();
      const write = existing
        ? await supabase.from("bespoke_order_photos").update(row).eq("id", existing.id)
        : await supabase.from("bespoke_order_photos").insert(row);
      if (write.error) throw write.error;
    }


    return json({
      ok: true,
      deltaMm: delta,
      scanTempleToTempleMm: scanTt,
      needsReview: delta != null && delta > DELTA_BLOCK_MM,
    });
  } catch (err) {
    console.error("[bespoke-photo-submit]", err);
    return json({ error: "server_error" }, 500);
  }
});
