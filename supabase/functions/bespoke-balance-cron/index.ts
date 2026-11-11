// Daily job for the Bespoke deposit plan (pg_cron, see migration
// 20261111120000_bespoke_deposit.sql). Safe to call any number of times: each
// order gets the reminder once and is closed once.
//
// For every deposit order whose 3D model was sent and whose balance is unpaid:
//   day 10  -> one reminder email to the buyer
//   day 14  -> the order closes (deposit kept), support gets an alert
// An open correction request pauses both: the buyer is waiting on us.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  BALANCE_WINDOW_DAYS,
  daysLeft,
  formatDueDate,
  formatUsdCents,
  modelPageUrl,
  reminderDueAt,
} from "../_shared/bespoke-balance.ts";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const SITE_ORIGIN = "https://woolet.co";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const now = new Date();
  const result = { checked: 0, reminded: 0, expired: 0, paused: 0, errors: 0 };

  try {
    const { data: orders, error } = await supabase
      .from("bespoke_orders")
      .select("id, case_no, stripe_session_id, customer_email, customer_name, frame_name, deposit_cents, balance_cents, model_sent_at, balance_due_at, balance_reminder_sent_at")
      .eq("payment_plan", "deposit")
      .not("model_sent_at", "is", null)
      .is("balance_paid_at", null)
      .is("balance_expired_at", null)
      .limit(500);
    if (error) throw error;

    for (const o of (orders ?? []) as Array<Record<string, any>>) {
      result.checked += 1;
      try {
        const { count } = await supabase
          .from("bespoke_model_revisions")
          .select("id", { count: "exact", head: true })
          .eq("order_id", o.id)
          .is("resolved_at", null);
        if ((count ?? 0) > 0) {
          result.paused += 1;
          continue;
        }

        const ref = o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
        const sentAt = new Date(o.model_sent_at);
        const dueAt = new Date(o.balance_due_at ?? sentAt.getTime() + BALANCE_WINDOW_DAYS * 86400000);
        const firstName = o.customer_name ? String(o.customer_name).split(" ")[0] : "";

        if (now.getTime() > dueAt.getTime()) {
          const { data: closed } = await supabase
            .from("bespoke_orders")
            .update({ balance_expired_at: now.toISOString() })
            .eq("id", o.id)
            .is("balance_paid_at", null)
            .is("balance_expired_at", null)
            .select("id");
          if (closed && closed.length > 0) {
            result.expired += 1;
            await sendTemplateEmailAndLog("bespoke-support-alert", undefined, {
              idempotencyKey: `bespoke-balance-expired-${o.id}-${o.model_sent_at}`,
              templateData: {
                heading: `Balance window closed - ${ref}`,
                lines: [
                  `${o.customer_name ?? ""} <${o.customer_email}>`,
                  `No approval within ${BALANCE_WINDOW_DAYS} days of the model sent on ${formatDueDate(sentAt)}. The order is closed and the ${formatUsdCents(o.deposit_cents)} deposit is kept.`,
                  "To reopen it, press \"Model sent\" on the order again - that starts a new 14-day window.",
                  "https://woolet.co/en/admin/bespoke",
                ],
              },
            }).catch((e) => console.error("[bespoke-balance-cron] expiry alert failed", e));
          }
          continue;
        }

        if (!o.balance_reminder_sent_at && now.getTime() >= reminderDueAt(sentAt).getTime()) {
          // Claim the reminder first, so two overlapping runs cannot both send it.
          const { data: claimed } = await supabase
            .from("bespoke_orders")
            .update({ balance_reminder_sent_at: now.toISOString() })
            .eq("id", o.id)
            .is("balance_reminder_sent_at", null)
            .select("id");
          if (!claimed || claimed.length === 0) continue;
          const left = daysLeft(dueAt, now);
          await sendTemplateEmailAndLog("bespoke-balance-notice", o.customer_email, {
            idempotencyKey: `bespoke-balance-reminder-${o.id}-${o.model_sent_at}`,
            templateData: {
              subject: `${left} day${left === 1 ? "" : "s"} left to approve your Woolet Bespoke 3D model (${ref})`,
              preview: `Your 3D model is waiting. Approve it or ask for a correction by ${formatDueDate(dueAt)}.`,
              heading: `${firstName ? `${firstName}, your` : "Your"} 3D model is waiting for you.`,
              paragraphs: [
                `We sent the 3D model of your ${o.frame_name ?? "Woolet Bespoke"} frame on ${formatDueDate(sentAt)} and have not heard back.`,
                `Approve it by paying the balance, or tell us what to correct - the bridge, the width, the temples. Your order stays open until ${formatDueDate(dueAt)}.`,
              ],
              rows: [
                { label: "Order", value: ref },
                { label: "Deposit paid", value: formatUsdCents(o.deposit_cents) },
                { label: "Balance due on approval", value: formatUsdCents(o.balance_cents) },
                { label: "Open until", value: formatDueDate(dueAt) },
              ],
              ctaLabel: "Review my 3D model",
              ctaUrl: modelPageUrl(SITE_ORIGIN, o.stripe_session_id),
              footnote: "After that date the order closes and the deposit is not refunded. Nothing more is charged unless you approve the model.",
            },
          });
          result.reminded += 1;
        }
      } catch (e) {
        result.errors += 1;
        console.error("[bespoke-balance-cron] order failed", o.id, e);
      }
    }
  } catch (err) {
    console.error("[bespoke-balance-cron]", err);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[bespoke-balance-cron]", JSON.stringify(result));
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
