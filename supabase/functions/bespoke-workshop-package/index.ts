// Workshop package: everything the workshop in Greece needs to build a pair,
// and nothing more. The workshop is a processor — it reads and writes only
// inside Woolet's system, through this token-scoped endpoint.
//
// GET    ?token=<uuid>            → package (signed, short-lived file URLs)
// POST   { token, verification }  → CAD cross-check + sign-off
// POST   { token, rotate: true }  → issue a fresh token, invalidating this one

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const WORKSHOP_NAME = Deno.env.get("WORKSHOP_NAME") ?? "Workshop";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGNED_URL_TTL = 900; // 15 minutes

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number.parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

async function signed(bucket: string, path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

async function loadOrder(token: string) {
  const { data } = await supabase
    .from("bespoke_orders")
    .select(
      "id, stripe_session_id, frame_id, frame_name, front_code, temple_code, finish_id, lens_type, engraving_text, production_blocked, purged_at, ai_face_width_mm, ai_temple_to_temple_mm, ai_bridge_width_mm, ai_pd_mm, manual_face_width_mm, manual_temple_to_temple_mm, manual_bridge_width_mm, manual_pd_mm, manual_temple_length_mm, manual_notes",
    )
    .eq("workshop_token", token)
    .maybeSingle();
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method === "GET") {
      const token = new URL(req.url).searchParams.get("token") ?? "";
      if (!UUID_RE.test(token)) return json({ error: "invalid_token" }, 400);

      const order = await loadOrder(token);
      if (!order) return json({ error: "not_found" }, 404);
      if (order.purged_at) return json({ error: "purged" }, 410);

      const { data: photo } = await supabase
        .from("bespoke_order_photos")
        .select("*")
        .eq("order_id", order.id)
        .maybeSingle();

      const { data: verifications } = await supabase
        .from("bespoke_report_verifications")
        .select("id, revision, cad_values_frame, deltas, verdict, notes, signed_off_by, signed_off_at, cad_image_path, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      return json({
        workshop: WORKSHOP_NAME,
        // Deliberately identity-free: no customer name, email or address.
        order: {
          reference: order.stripe_session_id.slice(-10).toUpperCase(),
          frameId: order.frame_id,
          frameName: order.frame_name,
          frontCode: order.front_code,
          templeCode: order.temple_code,
          finishId: order.finish_id,
          lensType: order.lens_type,
          engravingText: order.engraving_text,
          productionBlocked: order.production_blocked,
        },
        measurements: {
          faceWidthMm: order.manual_face_width_mm ?? order.ai_face_width_mm,
          templeToTempleMm: order.manual_temple_to_temple_mm ?? order.ai_temple_to_temple_mm,
          bridgeWidthMm: order.manual_bridge_width_mm ?? order.ai_bridge_width_mm,
          pdMm: order.manual_pd_mm ?? order.ai_pd_mm,
          templeLengthMm: order.manual_temple_length_mm,
          notes: order.manual_notes,
        },
        photo: photo
          ? {
              status: photo.status,
              mmPerPx: photo.mm_per_px,
              photoTempleToTempleMm: photo.photo_temple_to_temple_mm,
              scanTempleToTempleMm: photo.scan_temple_to_temple_mm,
              deltaMm: photo.delta_mm,
              frameFrontWidthMm: photo.frame_front_width_mm,
              shapeId: photo.shape_id,
              mappingVersion: photo.mapping_version,
              photoUrl: await signed("bespoke-photos", photo.photo_path),
              vtoUrl: await signed("bespoke-photos", photo.vto_path),
              geometryUrl: await signed("bespoke-photos", photo.geometry_path),
            }
          : null,
        verifications: await Promise.all(
          (verifications ?? []).map(async (v) => ({
            ...v,
            cadImageUrl: await signed("bespoke-cad", v.cad_image_path),
          })),
        ),
      });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const token = typeof body?.token === "string" ? body.token : "";
      if (!UUID_RE.test(token)) return json({ error: "invalid_token" }, 400);

      const order = await loadOrder(token);
      if (!order) return json({ error: "not_found" }, 404);

      if (body?.rotate === true) {
        const { data, error } = await supabase
          .from("bespoke_orders")
          .update({ workshop_token: crypto.randomUUID() })
          .eq("id", order.id)
          .select("workshop_token")
          .single();
        if (error) throw error;
        return json({ ok: true, workshopToken: data.workshop_token });
      }

      if (body?.cadUploadFor) {
        const path = `${order.id}/cad-${Date.now()}.${String(body.cadUploadFor).slice(0, 5).replace(/[^a-z0-9]/gi, "") || "png"}`;
        const { data, error } = await supabase.storage.from("bespoke-cad").createSignedUploadUrl(path);
        if (error || !data) throw error ?? new Error("sign_failed");
        return json({ path, token: data.token });
      }

      const v = body?.verification ?? {};
      const cadFrame = {
        frontWidthMm: num(v.frontWidthMm),
        bridgeMm: num(v.bridgeMm),
        templeLengthMm: num(v.templeLengthMm),
        lensWidthMm: num(v.lensWidthMm),
        lensHeightMm: num(v.lensHeightMm),
      };
      const target = order.manual_face_width_mm ?? order.ai_face_width_mm;
      const deltas = {
        frontWidthMm:
          cadFrame.frontWidthMm != null && target != null
            ? Math.round((cadFrame.frontWidthMm - Number(target)) * 100) / 100
            : null,
      };
      const verdict = typeof v.verdict === "string" ? v.verdict.slice(0, 30) : "pending";

      const { error: insErr } = await supabase.from("bespoke_report_verifications").insert({
        order_id: order.id,
        cad_values_frame: cadFrame,
        cad_image_path: typeof v.cadImagePath === "string" ? v.cadImagePath.slice(0, 400) : null,
        deltas,
        verdict,
        notes: typeof v.notes === "string" ? v.notes.slice(0, 2000) : null,
        qc_checklist: v.qcChecklist ?? null,
        signed_off_by: typeof v.signedOffBy === "string" ? v.signedOffBy.slice(0, 120) : null,
        signed_off_at: verdict === "approved" ? new Date().toISOString() : null,
      });
      if (insErr) throw insErr;

      if (verdict === "approved") {
        await supabase.from("bespoke_orders").update({ production_blocked: false }).eq("id", order.id);
      }

      return json({ ok: true, deltas });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (err) {
    console.error("[bespoke-workshop-package]", err);
    return json({ error: "server_error" }, 500);
  }
});
