// Admin-only bespoke production console. Password-gated (ADMIN_CRM_PASSWORD).
// Returns bespoke orders with their photo/consent record, scan profile and
// short-lived signed links to the private photo files.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { PREVIEW_BUCKET, generateOrderPreview } from "../_shared/bespoke-preview.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const SIGNED_TTL = 60 * 15;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as {
      password?: string;
      action?: "list" | "detail";
      id?: string;
    };
    const provided = body.password ?? req.headers.get("x-admin-password") ?? "";
    const ok =
      (!!ADMIN_PASSWORD && provided === ADMIN_PASSWORD) ||
      (!!BESPOKE_PASSWORD && provided === BESPOKE_PASSWORD);
    if (!ok) {
      return json({ error: "Invalid password" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    if (body.action === "detail") {
      const id = body.id ?? "";
      if (!UUID_RE.test(id)) return json({ error: "invalid_id" }, 400);

      const { data: order, error } = await admin
        .from("bespoke_orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!order) return json({ error: "not_found" }, 404);

      const { data: photo } = await admin
        .from("bespoke_order_photos")
        .select("*")
        .or(
          order.session_ref
            ? `order_id.eq.${order.id},session_ref.eq.${order.session_ref}`
            : `order_id.eq.${order.id}`,
        )
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Every scan of this order, newest first — a second scan never replaces
      // the first, so the two can be compared before anything is cut.
      const { data: scanRows } = await admin
        .from("bespoke_scan_profiles")
        .select("*")
        .or(
          order.session_ref
            ? `order_id.eq.${order.id},session_ref.eq.${order.session_ref}`
            : `order_id.eq.${order.id}`,
        )
        .order("created_at", { ascending: false })
        .limit(20);
      const scans = scanRows ?? [];
      const scan = scans[0] ?? null;

      const sign = async (path?: string | null) => {
        if (!path || photo?.consent_withdrawn_at) return null;
        const { data } = await admin.storage.from("bespoke-photos").createSignedUrl(path, SIGNED_TTL);
        return data?.signedUrl ?? null;
      };
      const signPreview = async (path?: string | null) => {
        if (!path) return null;
        const { data } = await admin.storage
          .from(PREVIEW_BUCKET)
          .createSignedUrl(path, SIGNED_TTL);
        return data?.signedUrl ?? null;
      };

      // Pipeline history for the CRM panel — newest first.
      const { data: crmEvents } = await admin
        .from("bespoke_crm_events")
        .select("id, from_stage, to_stage, note, created_by, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(100);

      return json({
        order,
        photo: photo ?? null,
        scan: scan ?? null,
        scans,
        crm_events: crmEvents ?? [],
        files: {
          photo_url: await sign(photo?.photo_path),
          vto_url: await sign(photo?.vto_path),
          geometry_url: await sign(photo?.geometry_path),
          preview_url: await signPreview((order as any).ai_preview_path),
        },
      });
    }

    if (body.action === "render_preview") {
      const id = body.id ?? "";
      if (!UUID_RE.test(id)) return json({ error: "invalid_id" }, 400);
      const { data: order, error } = await admin
        .from("bespoke_orders")
        .select("id, frame_name, front_code, temple_code, finish_id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!order) return json({ error: "not_found" }, 404);

      const path = await generateOrderPreview(admin as any, order as any);
      if (!path) return json({ error: "render_failed" }, 502);
      const { data: signed } = await admin.storage
        .from(PREVIEW_BUCKET)
        .createSignedUrl(path, SIGNED_TTL);
      return json({ preview_url: signed?.signedUrl ?? null });
    }

    const { data: orders, error: listError } = await admin
      .from("bespoke_orders")
      .select(
        "id, case_no, created_at, customer_email, customer_name, source, frame_name, front_code, temple_code, finish_id, lens_type, reading_strength_mode, reading_strength, reading_strength_left, reading_strength_right, engraving_text, amount_cents, currency, environment, measurements_submitted_at, session_ref, production_blocked, stripe_session_id, metadata, delivered_at, shipping_submitted_at, shipping_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, courier, tracking_number, parcel_weight_kg, shipped_at, dispatch_note, crm_stage, crm_stage_1_at, crm_stage_2_at, crm_stage_3_at, crm_stage_4_at, crm_stage_5_at, crm_stage_6_at, crm_notes, ai_bridge_width_mm, ai_inner_canthal_mm, manual_bridge_width_mm, manual_face_width_mm, manual_temple_to_temple_mm, manual_pd_mm, manual_temple_length_mm, manual_head_circumference_mm, manual_ear_to_ear_mm",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (listError) throw listError;

    const { data: photos } = await admin
      .from("bespoke_order_photos")
      .select("order_id, session_ref, photo_path, vto_path, consent_at, consent_withdrawn_at");

    const rows = (orders ?? []).map((o) => {
      const p = (photos ?? []).find(
        (x) => x.order_id === o.id || (o.session_ref && x.session_ref === o.session_ref),
      );
      return {
        ...o,
        has_photo: Boolean(p?.photo_path),
        has_tryon: Boolean(p?.vto_path),
        consent_at: p?.consent_at ?? null,
        consent_withdrawn_at: p?.consent_withdrawn_at ?? null,
      };
    });

    return json({
      rows,
      summary: {
        total: rows.length,
        with_measurements: rows.filter((r) => r.measurements_submitted_at).length,
        with_photo: rows.filter((r) => r.has_photo).length,
        blocked: rows.filter((r) => r.production_blocked).length,
      },
    });
  } catch (err) {
    console.error("[bespoke-admin-orders]", err);
    return json({ error: "server_error" }, 500);
  }
});
