// Admin-only CRM pipeline for a bespoke order. Writes the pipeline columns
// (crm_stage, the per-stage timestamps, crm_notes) plus courier/tracking when
// the order reaches "Shipped", and logs every stage change. Measurements, the
// specification, consent records and the shipping address are never touched.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  BALANCE_WINDOW_DAYS,
  balanceDueAt,
  balanceState,
  formatDueDate,
  formatUsdCents,
  modelPageUrl,
} from "../_shared/bespoke-balance.ts";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";

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
const IN_PRODUCTION = 5;
const SITE_ORIGIN = "https://woolet.co";

const PAYMENT_COLUMNS =
  "payment_plan, amount_cents, total_cents, deposit_cents, balance_cents, model_sent_at, balance_due_at, balance_reminder_sent_at, balance_expired_at, balance_paid_at, balance_paid_cents, balance_paid_manually, balance_session_id, balance_payment_intent_id";

// deno-lint-ignore no-explicit-any
async function paymentSnapshot(admin: any, id: string) {
  const { data: order } = await admin
    .from("bespoke_orders")
    .select(`id, stripe_session_id, ${PAYMENT_COLUMNS}`)
    .eq("id", id)
    .maybeSingle();
  const { data: revisions } = await admin
    .from("bespoke_model_revisions")
    .select("id, note, created_at, resolved_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const open = ((revisions ?? []) as Array<{ resolved_at: string | null }>).filter((r) => !r.resolved_at).length;
  return {
    payment: order ?? null,
    revisions: revisions ?? [],
    state: order ? balanceState(order, open) : "not_applicable",
    modelUrl: order?.stripe_session_id ? modelPageUrl(SITE_ORIGIN, order.stripe_session_id) : null,
  };
}

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

    // --- Deposit plan -------------------------------------------------------
    if (action === "payment") {
      return json(await paymentSnapshot(admin, id));
    }

    // "Model sent": starts (or, after a correction, restarts) the 14-day window,
    // answers every open correction request and emails the buyer their link.
    if (action === "model_sent") {
      const { data: full, error: fullErr } = await admin
        .from("bespoke_orders")
        .select(`id, case_no, stripe_session_id, customer_email, customer_name, frame_name, crm_stage, ${PAYMENT_COLUMNS}`)
        .eq("id", id)
        .maybeSingle();
      if (fullErr) throw fullErr;
      const o = full as Record<string, any> | null;
      if (!o) return json({ error: "not_found" }, 404);
      if (o.payment_plan !== "deposit") return json({ error: "not_deposit_order" }, 400);
      if (o.balance_paid_at) return json({ error: "balance_already_paid" }, 409);

      const now = new Date();
      const due = balanceDueAt(now);
      const resend = Boolean(o.model_sent_at);
      const { error: upErr } = await admin
        .from("bespoke_orders")
        .update({
          model_sent_at: now.toISOString(),
          balance_due_at: due.toISOString(),
          balance_reminder_sent_at: null,
          balance_expired_at: null,
        })
        .eq("id", id);
      if (upErr) throw upErr;
      await admin
        .from("bespoke_model_revisions")
        .update({ resolved_at: now.toISOString() })
        .eq("order_id", id)
        .is("resolved_at", null);
      await admin.from("bespoke_crm_events").insert({
        order_id: id,
        from_stage: Number(o.crm_stage ?? 1),
        to_stage: Number(o.crm_stage ?? 1),
        note: `${resend ? "Corrected 3D model sent" : "3D model sent"} - balance ${formatUsdCents(o.balance_cents)} due by ${formatDueDate(due)}`,
        created_by: "admin",
      });

      const ref = o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
      const firstName = o.customer_name ? String(o.customer_name).split(" ")[0] : "";
      let emailed = false;
      if (body.send_email !== false) {
        try {
          await sendTemplateEmailAndLog("bespoke-balance-notice", o.customer_email, {
            idempotencyKey: `bespoke-model-sent-${id}-${now.toISOString()}`,
            templateData: {
              subject: resend
                ? `Your corrected Woolet Bespoke 3D model is ready (${ref})`
                : `Your Woolet Bespoke 3D model is ready (${ref})`,
              preview: "Approve your 3D model or ask for a correction.",
              heading: `${firstName ? `${firstName}, your` : "Your"} ${resend ? "corrected " : ""}3D model is ready.`,
              paragraphs: [
                "We sent the video and the drawing of your frame in a separate email from support@woolet.co.",
                `Approve the model by paying the balance, or tell us what to correct - the bridge, the width, the temples. You have ${BALANCE_WINDOW_DAYS} days, until ${formatDueDate(due)}.`,
              ],
              rows: [
                { label: "Order", value: ref },
                { label: "Frame", value: o.frame_name ?? "Woolet Bespoke" },
                { label: "Deposit paid", value: formatUsdCents(o.deposit_cents) },
                { label: "Balance due on approval", value: formatUsdCents(o.balance_cents) },
              ],
              ctaLabel: "Review my 3D model",
              ctaUrl: modelPageUrl(SITE_ORIGIN, o.stripe_session_id),
              footnote: "The deposit is non-refundable. You are free to stop here - nothing more is charged unless you approve the model.",
            },
          });
          emailed = true;
        } catch (e) {
          console.error("[bespoke-crm-update] model email failed", e);
        }
      }
      return json({ ok: true, emailed, ...(await paymentSnapshot(admin, id)) });
    }

    // Balance settled outside the site (bank transfer, Stripe invoice).
    if (action === "mark_balance_paid") {
      const { data: full } = await admin.from("bespoke_orders").select(`id, crm_stage, ${PAYMENT_COLUMNS}`).eq("id", id).maybeSingle();
      const o = full as Record<string, any> | null;
      if (!o) return json({ error: "not_found" }, 404);
      if (o.payment_plan !== "deposit") return json({ error: "not_deposit_order" }, 400);
      if (o.balance_paid_at) return json({ error: "balance_already_paid" }, 409);
      const { error: upErr } = await admin
        .from("bespoke_orders")
        .update({
          balance_paid_at: new Date().toISOString(),
          balance_paid_cents: o.balance_cents ?? null,
          balance_paid_manually: true,
          balance_expired_at: null,
        })
        .eq("id", id);
      if (upErr) throw upErr;
      await admin
        .from("bespoke_model_revisions")
        .update({ resolved_at: new Date().toISOString() })
        .eq("order_id", id)
        .is("resolved_at", null);
      await admin.from("bespoke_crm_events").insert({
        order_id: id,
        from_stage: Number(o.crm_stage ?? 1),
        to_stage: Number(o.crm_stage ?? 1),
        note: `Balance ${formatUsdCents(o.balance_cents)} marked as paid by hand${text(body.note, 300) ? ` - ${text(body.note, 300)}` : ""}`,
        created_by: "admin",
      });
      return json({ ok: true, ...(await paymentSnapshot(admin, id)) });
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

      // Deposit plan: nothing is cut before the buyer approves the model by
      // paying the balance.
      if (to >= IN_PRODUCTION) {
        const { data: pay } = await admin
          .from("bespoke_orders")
          .select("payment_plan, balance_paid_at")
          .eq("id", id)
          .maybeSingle();
        const p = pay as { payment_plan?: string; balance_paid_at?: string | null } | null;
        if (p?.payment_plan === "deposit" && !p.balance_paid_at) return json({ error: "balance_unpaid" }, 409);
      }

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
