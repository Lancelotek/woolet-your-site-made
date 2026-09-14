// Admin-only bespoke production console. Password-gated (ADMIN_CRM_PASSWORD).
// Returns bespoke orders with their photo/consent record, scan profile and
// short-lived signed links to the private photo files.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";

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
    if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
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

      const scan = order.session_ref
        ? (
            await admin
              .from("bespoke_scan_profiles")
              .select("*")
              .eq("session_ref", order.session_ref)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          ).data
        : null;

      const sign = async (path?: string | null) => {
        if (!path || photo?.consent_withdrawn_at) return null;
        const { data } = await admin.storage.from("bespoke-photos").createSignedUrl(path, SIGNED_TTL);
        return data?.signedUrl ?? null;
      };

      return json({
        order,
        photo: photo ?? null,
        scan: scan ?? null,
        files: {
          photo_url: await sign(photo?.photo_path),
          vto_url: await sign(photo?.vto_path),
          geometry_url: await sign(photo?.geometry_path),
        },
      });
    }

    const { data: orders, error: listError } = await admin
      .from("bespoke_orders")
      .select(
        "id, created_at, customer_email, customer_name, frame_name, front_code, temple_code, finish_id, lens_type, engraving_text, amount_cents, currency, environment, measurements_submitted_at, session_ref, production_blocked, stripe_session_id",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (listError) throw listError;

    const refs = (orders ?? []).map((o) => o.session_ref).filter(Boolean) as string[];
    const ids = (orders ?? []).map((o) => o.id);
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
        unused: { refs: refs.length, ids: ids.length },
      },
    });
  } catch (err) {
    console.error("[bespoke-admin-orders]", err);
    return json({ error: "server_error" }, 500);
  }
});
