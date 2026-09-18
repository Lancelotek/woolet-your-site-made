// Admin-only CRM pipeline for a bespoke order. Writes the pipeline columns
// (crm_stage, the per-stage timestamps, crm_notes) plus courier/tracking when
// the order reaches "Shipped", and logs every stage change. Measurements, the
// specification, consent records and the shipping address are never touched.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHIPPED = 6;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const text = (v: unknown, max = 500) => {
  if (v == null) return null;
  const t = String(v).trim().slice(0, max);
  return t === "" ? null : t;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const provided = (body.password as string) ?? req.headers.get("x-admin-password") ?? "";
    const ok =
      (!!ADMIN_PASSWORD && provided === ADMIN_PASSWORD) ||
      (!!BESPOKE_PASSWORD && provided === BESPOKE_PASSWORD);
    if (!ok) return json({ error: "Invalid password" }, 401);

    const id = String(body.id ?? "");
    if (!UUID_RE.test(id)) return json({ error: "invalid_id" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { data: order, error: readErr } = await admin
      .from("bespoke_orders")
      .select("id, crm_stage, crm_notes, courier, tracking_number")
      .eq("id", id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!order) return json({ error: "not_found" }, 404);

    const action = String(body.action ?? "events");

    if (action === "events") {
      const { data: events } = await admin
        .from("bespoke_crm_events")
        .select("id, from_stage, to_stage, note, created_by, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(100);
      return json({ events: events ?? [] });
    }

    if (action === "notes") {
      const notes = text(body.crm_notes, 4000);
      const { error } = await admin.from("bespoke_orders").update({ crm_notes: notes }).eq("id", id);
      if (error) throw error;
      return json({ ok: true, crm_notes: notes });
    }

    if (action === "stage") {
      const to = Number(body.stage);
      if (!Number.isInteger(to) || to < 1 || to > SHIPPED) return json({ error: "invalid_stage" }, 400);
      const from = Number((order as { crm_stage?: number }).crm_stage ?? 1);

      const carrier = text(body.carrier, 120);
      const tracking = text(body.tracking_number, 120);
      if (to === SHIPPED && !tracking) return json({ error: "tracking_required" }, 400);

      const patch: Record<string, unknown> = { crm_stage: to };
      // Reaching a stage stamps it once; stepping back clears the stages the
      // order no longer holds, so the stepper never shows a future date.
      const now = new Date().toISOString();
      for (let s = 1; s <= SHIPPED; s += 1) {
        if (s > to) patch[`crm_stage_${s}_at`] = null;
      }
      patch[`crm_stage_${to}_at`] = now;
      if (to === SHIPPED) {
        patch.tracking_number = tracking;
        if (carrier) patch.courier = carrier;
      }

      const { error } = await admin.from("bespoke_orders").update(patch).eq("id", id);
      if (error) throw error;

      await admin.from("bespoke_crm_events").insert({
        order_id: id,
        from_stage: from,
        to_stage: to,
        note: text(body.note, 1000),
        created_by: "admin",
      });

      const { data: events } = await admin
        .from("bespoke_crm_events")
        .select("id, from_stage, to_stage, note, created_by, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(100);

      return json({ ok: true, crm_stage: to, patch, events: events ?? [] });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    console.error("[bespoke-crm-update]", err);
    return json({ error: "server_error" }, 500);
  }
});
