// Buyer-facing side of the Bespoke deposit plan. Keyed by the Stripe session id
// of the deposit (the same `sid` the measurements page uses).
//
// POST { action: "status",   sid }
// POST { action: "checkout", sid, returnUrl }   -> Stripe session for the balance
// POST { action: "revision", sid, note }        -> ask for a correction of the 3D model
//
// The amount is always read from the order - never from the browser.

import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { balanceState, daysLeft, formatDueDate, formatUsdCents } from "../_shared/bespoke-balance.ts";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const SID_RE = /^[A-Za-z0-9_-]{20,200}$/;
const RETURN_URL_RE = /^https:\/\/(woolet\.co|[a-z0-9-]+\.lovable\.app|[a-z0-9-]+\.lovableproject\.com)\/|^http:\/\/localhost(:\d+)?\//;
const MAX_REVISIONS = 5;

// Attribution captured at the deposit checkout, carried onto the balance
// payment so both conversions join the same visitor in GA4 and Meta.
const ATTRIBUTION_KEYS = [
  "ga_client_id", "ga_session_id", "ga_cid_src", "wlt_visitor_id",
  "meta_fbp", "meta_fbc", "meta_client_ip_address", "meta_client_user_agent", "meta_event_source_url",
  "utm_source", "utm_medium", "utm_campaign", "lt_utm_source", "lt_utm_medium", "lt_utm_campaign",
  "lt_gclid", "lt_gbraid", "lt_wbraid", "first_touch", "last_touch",
];

const ORDER_COLUMNS =
  "id, case_no, stripe_session_id, customer_email, customer_name, environment, frame_id, frame_name, front_code, temple_code, finish_id, lens_type, engraving_text, ai_preview_url, metadata, payment_plan, total_cents, deposit_cents, balance_cents, model_sent_at, balance_due_at, balance_paid_at, balance_expired_at";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const sid = String(body.sid ?? "");
    if (!SID_RE.test(sid)) return json({ error: "invalid_sid" }, 400);

    const { data, error } = await supabase.from("bespoke_orders").select(ORDER_COLUMNS).eq("stripe_session_id", sid).maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "not_found" }, 404);
    const order = data as Record<string, any>;

    const { data: revisionRows } = await supabase
      .from("bespoke_model_revisions")
      .select("id, note, created_at, resolved_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const revisions = (revisionRows ?? []) as Array<{ id: string; note: string; created_at: string; resolved_at: string | null }>;
    const openRevisions = revisions.filter((r) => !r.resolved_at).length;
    const state = balanceState(order, openRevisions);
    const ref = order.case_no || `WLT-${String(order.id).slice(0, 8).toUpperCase()}`;
    const action = String(body.action ?? "status");

    if (action === "status") {
      return json({
        state,
        orderRef: ref,
        firstName: order.customer_name ? String(order.customer_name).split(" ")[0] : null,
        frameName: order.frame_name ?? "Woolet Bespoke",
        frontCode: order.front_code ?? null,
        templeCode: order.temple_code ?? null,
        finish: order.finish_id ?? null,
        lens: order.lens_type ?? null,
        engraving: order.engraving_text ?? null,
        previewUrl: /^https:\/\//.test(String(order.ai_preview_url ?? "")) ? order.ai_preview_url : null,
        totalCents: order.total_cents ?? null,
        depositCents: order.deposit_cents ?? null,
        balanceCents: order.balance_cents ?? null,
        modelSentAt: order.model_sent_at ?? null,
        balanceDueAt: order.balance_due_at ?? null,
        dueDateLabel: order.balance_due_at ? formatDueDate(order.balance_due_at) : null,
        daysLeft: daysLeft(order.balance_due_at),
        balancePaidAt: order.balance_paid_at ?? null,
        // The buyer's own requests, newest first.
        revisions: revisions.map((r) => ({ note: r.note, createdAt: r.created_at, answered: Boolean(r.resolved_at) })),
        canRequestRevision: (state === "awaiting_payment" || state === "revision_requested") && revisions.length < MAX_REVISIONS,
      });
    }

    if (action === "revision") {
      if (state !== "awaiting_payment" && state !== "revision_requested") return json({ error: "not_open", state }, 409);
      if (revisions.length >= MAX_REVISIONS) return json({ error: "too_many_revisions" }, 409);
      const note = String(body.note ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, "").trim().slice(0, 2000);
      if (note.length < 3) return json({ error: "note_required" }, 400);

      const { error: insErr } = await supabase.from("bespoke_model_revisions").insert({ order_id: order.id, note });
      if (insErr) throw insErr;
      try {
        await sendTemplateEmailAndLog("bespoke-support-alert", undefined, {
          idempotencyKey: `bespoke-revision-${order.id}-${revisions.length + 1}`,
          templateData: {
            heading: `3D model correction requested - ${ref}`,
            lines: [
              `${order.customer_name ?? ""} <${order.customer_email}>`,
              `Request: ${note}`,
              "The 14-day clock is paused until you press \"Model sent\" on the order again.",
              "https://woolet.co/en/admin/bespoke",
            ],
          },
        });
      } catch (e) {
        console.error("[bespoke-balance] revision alert failed", e);
      }
      return json({ ok: true, state: "revision_requested" });
    }

    if (action === "checkout") {
      if (state !== "awaiting_payment" && state !== "revision_requested") return json({ error: "not_open", state }, 409);
      const balanceCents = Number(order.balance_cents);
      if (!Number.isInteger(balanceCents) || balanceCents < 100) return json({ error: "no_balance" }, 409);
      const returnUrl = String(body.returnUrl ?? "");
      if (!RETURN_URL_RE.test(returnUrl)) return json({ error: "invalid_return_url" }, 400);

      const env: StripeEnv = order.environment === "sandbox" ? "sandbox" : "live";
      const stripe = createStripeClient(env);
      const orderMeta = (order.metadata ?? {}) as Record<string, unknown>;
      const meta: Record<string, string> = {
        flow: "bespoke_balance",
        order_id: order.id,
        order_ref: ref,
        deposit_session_id: order.stripe_session_id,
        order_total_usd: ((order.total_cents ?? 0) / 100).toFixed(2),
        frame: String(order.frame_id ?? ""),
        frame_name: String(order.frame_name ?? "Woolet Bespoke"),
      };
      for (const k of ATTRIBUTION_KEYS) {
        const v = orderMeta[k];
        if (typeof v === "string" && v && v.length <= 500) meta[k] = v;
      }
      const name = `${order.frame_name ?? "Woolet Bespoke"} - balance (${ref})`;
      const note = `You are approving your 3D model. Production starts after this payment. Deposit already paid: ${formatUsdCents(order.deposit_cents)}.`;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name, description: note },
              unit_amount: balanceCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: returnUrl,
        customer_email: String(order.customer_email).slice(0, 200),
        custom_text: { submit: { message: note } },
        payment_intent_data: { description: name, metadata: meta },
        metadata: meta,
      });
      return json({ clientSecret: session.client_secret, sessionId: session.id, amountCents: balanceCents });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    console.error("[bespoke-balance]", err instanceof Error ? err.message : err);
    return json({ error: "server_error" }, 500);
  }
});
