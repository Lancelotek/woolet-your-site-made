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
/** Days after payment on which the fitting reminders go out. */
const FIT_REMINDER_DAYS = [2, 5] as const;
/** After this many days the order is too old for an automatic reminder. */
const FIT_REMINDER_LAST_DAY = 9;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const now = new Date();
  const result = { checked: 0, reminded: 0, expired: 0, paused: 0, errors: 0, fitReminded: 0 };

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

  // Fitting reminders: a paid order whose fitting form has not arrived gets one
  // email on day 2 and one on day 5. Older orders are left to a personal note.
  try {
    const since = new Date(now.getTime() - FIT_REMINDER_LAST_DAY * 86400000).toISOString();
    const { data: waiting, error: waitErr } = await supabase
      .from("bespoke_orders")
      .select("id, case_no, stripe_session_id, customer_email, customer_name, frame_name, created_at, crm_stage, stage")
      .is("measurements_submitted_at", null)
      .gte("created_at", since)
      .limit(500);
    if (waitErr) throw waitErr;
    for (const o of (waiting ?? []) as Array<Record<string, any>>) {
      try {
        if (!o.customer_email || !o.stripe_session_id || o.stage === "cancelled" || Number(o.crm_stage ?? 1) > 2) continue;
        const ageDays = (now.getTime() - new Date(o.created_at).getTime()) / 86400000;
        const which = ageDays >= FIT_REMINDER_DAYS[1] ? 2 : ageDays >= FIT_REMINDER_DAYS[0] ? 1 : 0;
        if (!which) continue;
        const note = `Fitting reminder ${which} emailed to the customer`;
        const { count } = await supabase
          .from("bespoke_crm_events")
          .select("id", { count: "exact", head: true })
          .eq("order_id", o.id)
          .eq("note", note);
        if ((count ?? 0) > 0) continue;
        // Log first: a failed send is looked at by a person, never repeated daily.
        await supabase.from("bespoke_crm_events").insert({
          order_id: o.id, from_stage: Number(o.crm_stage ?? 1), to_stage: Number(o.crm_stage ?? 1), note, created_by: "system",
        });
        const ref = o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
        const firstName = o.customer_name ? String(o.customer_name).split(" ")[0] : "";
        await sendTemplateEmailAndLog("bespoke-balance-notice", o.customer_email, {
          idempotencyKey: `bespoke-fit-reminder-${which}-${o.id}`,
          templateData: {
            subject: which === 1
              ? `Two minutes so we can start your Woolet Bespoke frame (${ref})`
              : `Your Woolet Bespoke frame is waiting on one photo (${ref})`,
            preview: "One photo with a bank card and the numbers from your current glasses.",
            heading: `${firstName ? `${firstName}, your` : "Your"} frame starts with one photo.`,
            paragraphs: which === 1
              ? [
                  `Your ${o.frame_name ?? "Woolet Bespoke"} order is open, and the workshop is waiting for your fitting.`,
                  "It takes about two minutes: your shipping address, one photo with a bank-size card held against your cheek, and the three numbers printed inside your current glasses.",
                ]
              : [
                  "Your order is still open, and nothing has been cut. The 3D model of your frame starts the day your fitting arrives.",
                  "One photo with a bank-size card held against your cheek, the numbers printed inside your current glasses, and your shipping address. No glasses at hand? Send the photo alone.",
                ],
            rows: [{ label: "Order", value: ref }],
            ctaLabel: "Open my fitting form",
            ctaUrl: `${SITE_ORIGIN}/en/bespoke/measurements?sid=${encodeURIComponent(o.stripe_session_id)}`,
          },
        });
        result.fitReminded += 1;
      } catch (e) {
        result.errors += 1;
        console.error("[bespoke-balance-cron] fitting reminder failed", o.id, e);
      }
    }
  } catch (err) {
    console.error("[bespoke-balance-cron] fitting reminders", err);
  }

  console.log("[bespoke-balance-cron]", JSON.stringify(result));
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
