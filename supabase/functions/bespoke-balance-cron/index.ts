// Hourly job for Bespoke orders (pg_cron, see migrations
// 20261111120000_bespoke_deposit.sql and 20261116120000_bespoke_fitting_followup.sql). Safe to call any number of times: each
// order gets the reminder once and is closed once.
//
// For every deposit order whose 3D model was sent and whose balance is unpaid:
//   day 10  -> one reminder email to the buyer
//   day 14  -> the order closes (deposit kept), support gets an alert
// An open correction request pauses both: the buyer is waiting on us.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  BALANCE_WINDOW_DAYS,
  balanceClock,
  daysLeft,
  formatDueDate,
  formatUsdCents,
  modelPageUrl,
} from "../_shared/bespoke-balance.ts";
import { PREVIEW_WINDOW_DAYS, isPreviewFirst } from "../_shared/bespoke-flow.ts";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { MAREK_SENDER } from "../_shared/transactional-email-templates/send-email.ts";
import {
  FITTING_MAX_AGE_DAYS,
  FITTING_NOTES,
  FITTING_STEP_DAYS,
  fittingAsks,
  fittingLinks,
  fittingMissing,
  nextFittingAction,
  nextFormAction,
} from "../_shared/bespoke-fitting.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const SITE_ORIGIN = "https://woolet.co";
/** A form that never arrived: after this many days the order is left to a personal note. */
const FIT_REMINDER_LAST_DAY = 9;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const now = new Date();
  const result = { checked: 0, reminded: 0, expired: 0, paused: 0, errors: 0, fitRequested: 0, fitReminded: 0, fitAlerted: 0 };

  try {
    const { data: orders, error } = await supabase
      .from("bespoke_orders")
      .select("id, case_no, stripe_session_id, customer_email, customer_name, frame_name, deposit_cents, balance_cents, model_sent_at, balance_due_at, balance_reminder_sent_at, flow_version, preview_sent_at")
      .eq("payment_plan", "deposit")
      .or("model_sent_at.not.is.null,preview_sent_at.not.is.null")
      .is("balance_paid_at", null)
      .is("balance_expired_at", null)
      .limit(500);
    if (error) throw error;

    for (const o of (orders ?? []) as Array<Record<string, any>>) {
      result.checked += 1;
      try {
        // Flow 2: the clock runs from the visualization and nothing pauses it -
        // corrections belong to the 3D model, which comes after the payment.
        const v2 = isPreviewFirst(o);
        if (v2 && !o.preview_sent_at) continue;
        if (!v2 && !o.model_sent_at) continue;
        if (!v2) {
        const { count } = await supabase
          .from("bespoke_model_revisions")
          .select("id", { count: "exact", head: true })
          .eq("order_id", o.id)
          .is("resolved_at", null);
        if ((count ?? 0) > 0) {
          result.paused += 1;
          continue;
        }
        }

        const ref = o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
        const clock = balanceClock(o);
        const sentAt = clock.sentAt!;
        const dueAt = clock.dueAt!;
        const windowDays = v2 ? PREVIEW_WINDOW_DAYS : BALANCE_WINDOW_DAYS;
        const sentKey = v2 ? o.preview_sent_at : o.model_sent_at;
        const what = v2 ? "visualization" : "3D model";
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
              idempotencyKey: `bespoke-balance-expired-${o.id}-${sentKey}`,
              templateData: {
                heading: `Balance window closed - ${ref}`,
                lines: [
                  `${o.customer_name ?? ""} <${o.customer_email}>`,
                  `No approval within ${windowDays} days of the ${what} sent on ${formatDueDate(sentAt)}. The order is closed and the ${formatUsdCents(o.deposit_cents)} deposit is kept.`,
                  v2
                    ? `To reopen it, press "Visualization sent" on the order again - that starts a new ${windowDays}-day window.`
                    : "To reopen it, press \"Model sent\" on the order again - that starts a new 14-day window.",
                  "https://woolet.co/en/admin/bespoke",
                ],
              },
            }).catch((e) => console.error("[bespoke-balance-cron] expiry alert failed", e));
          }
          continue;
        }

        if (!o.balance_reminder_sent_at && now.getTime() >= clock.reminderAt!.getTime()) {
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
            idempotencyKey: `bespoke-balance-reminder-${o.id}-${sentKey}`,
            templateData: v2
              ? {
                  subject: `${left} day${left === 1 ? "" : "s"} left to accept your Woolet Bespoke visualization (${ref})`,
                  preview: `Your visualization is waiting. Accept it by ${formatDueDate(dueAt)}.`,
                  heading: `${firstName ? `${firstName}, your` : "Your"} visualization is waiting for you.`,
                  paragraphs: [
                    `We sent the visualization of your ${o.frame_name ?? "Woolet Bespoke"} frame on ${formatDueDate(sentAt)} and have not heard back.`,
                    `Accept it by paying the balance - the workshop then draws your 3D model. Want something changed first? Reply to this email. Your order stays open until ${formatDueDate(dueAt)}.`,
                  ],
                  rows: [
                    { label: "Order", value: ref },
                    { label: "Deposit paid", value: formatUsdCents(o.deposit_cents) },
                    { label: "Balance to accept", value: formatUsdCents(o.balance_cents) },
                    { label: "Open until", value: formatDueDate(dueAt) },
                  ],
                  ctaLabel: "Accept my visualization",
                  ctaUrl: modelPageUrl(SITE_ORIGIN, o.stripe_session_id),
                  footnote: "After that date the order closes and the deposit is not refunded. Nothing more is charged unless you accept the visualization.",
                }
              : {
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

  // Fitting follow-up (see _shared/bespoke-fitting.ts). Two cases, one rhythm:
  //   A. the form never arrived      -> reminder on day 3, support alert on day 6
  //   B. the form arrived with holes -> ask, reminder 3 days later, support alert 3 days after that
  // Every step is written to bespoke_crm_events first, so it happens once.
  const stepsFor = async (orderId: string): Promise<Record<string, string>> => {
    const { data } = await supabase
      .from("bespoke_crm_events")
      .select("note, created_at")
      .eq("order_id", orderId)
      .in("note", Object.values(FITTING_NOTES))
      .order("created_at", { ascending: true });
    const seen: Record<string, string> = {};
    for (const e of (data ?? []) as Array<{ note: string; created_at: string }>) seen[e.note] ??= e.created_at;
    return seen;
  };
  const logStep = (o: Record<string, any>, note: string) =>
    supabase.from("bespoke_crm_events").insert({
      order_id: o.id, from_stage: Number(o.crm_stage ?? 1), to_stage: Number(o.crm_stage ?? 1), note, created_by: "system",
    });
  const refOf = (o: Record<string, any>) => o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
  const firstNameOf = (o: Record<string, any>) => (o.customer_name ? String(o.customer_name).split(" ")[0] : "");
  const alertSupport = (key: string, heading: string, lines: string[]) =>
    sendTemplateEmailAndLog("bespoke-support-alert", undefined, { idempotencyKey: key, templateData: { heading, lines } })
      .catch((e) => console.error("[bespoke-balance-cron] support alert failed", e));
  // From marek@woolet.co. If the mail provider refuses that sender, the note
  // still goes out from noreply@ with replies to Marek; if that fails too,
  // support hears about it - the step is logged, so nothing retries by itself.
  const sendFromMarek = async (o: Record<string, any>, key: string, templateData: Record<string, unknown>) => {
    try {
      return await sendTemplateEmailAndLog("bespoke-fitting-request", o.customer_email, {
        idempotencyKey: key, templateData, ...MAREK_SENDER,
      });
    } catch (first) {
      console.error("[bespoke-balance-cron] send as marek@ failed, retrying from noreply@", o.id, first);
      try {
        return await sendTemplateEmailAndLog("bespoke-fitting-request", o.customer_email, {
          idempotencyKey: `${key}-noreply`, templateData, fromName: MAREK_SENDER.fromName, replyTo: MAREK_SENDER.replyTo,
        });
      } catch (second) {
        await alertSupport(`${key}-failed`, `Fitting email failed to send - ${refOf(o)}`, [
          `${o.customer_name ?? ""} <${o.customer_email}>`,
          `Error: ${second instanceof Error ? second.message : String(second)}`,
          "The step is logged, so it will not retry. Write to the customer by hand.",
          "https://woolet.co/en/admin/bespoke",
        ]);
        throw second;
      }
    }
  };
  const open = (o: Record<string, any>) =>
    Boolean(o.customer_email && o.stripe_session_id) && o.stage !== "cancelled" && Number(o.crm_stage ?? 1) <= 2;
  const COUNT = ["", "one more thing", "two more things", "three more things"];

  // A. The fitting form never arrived.
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
        if (!open(o)) continue;
        const seen = await stepsFor(o.id);
        const action = nextFormAction({
          now, paidAt: o.created_at,
          reminderAt: seen[FITTING_NOTES.formReminder] ?? null,
          alertAt: seen[FITTING_NOTES.formAlert] ?? null,
        });
        if (!action) continue;
        const ref = refOf(o);
        const links = fittingLinks(SITE_ORIGIN, o as any);
        if (action === "reminder") {
          await logStep(o, FITTING_NOTES.formReminder);
          await sendFromMarek(o, `bespoke-fit-reminder-1-${o.id}`, {
            subject: `Two minutes so the workshop can start your frame (${ref})`,
            preview: "One photo with a bank card and the numbers from your current glasses.",
            firstName: firstNameOf(o),
            intro: ["Your order is open and nothing has been cut. The workshop starts your 3D model the day your fitting arrives."],
            asks: [{
              title: "Your fitting",
              body: "About two minutes: your shipping address, one photo with a bank card on your cheek, and the three numbers printed inside your current glasses.",
              linkLabel: "Open my fitting form",
              linkUrl: links.form,
            }],
            outro: "Stuck on any of it? Reply and I'll help.",
            orderRef: ref,
          });
          result.fitReminded += 1;
        } else {
          await logStep(o, FITTING_NOTES.formAlert);
          await alertSupport(`bespoke-fit-form-alert-${o.id}`, `No fitting form after ${2 * FITTING_STEP_DAYS} days - ${ref}`, [
            `${o.customer_name ?? ""} <${o.customer_email}>`,
            "One reminder went out and the form is still missing. No more automatic emails - write or call.",
            links.form,
            "https://woolet.co/en/admin/bespoke",
          ]);
          result.fitAlerted += 1;
        }
      } catch (e) {
        result.errors += 1;
        console.error("[bespoke-balance-cron] fitting form follow-up failed", o.id, e);
      }
    }
  } catch (err) {
    console.error("[bespoke-balance-cron] fitting form follow-up", err);
  }

  // B. The form arrived. Ask for the one thing that would firm up the recommendation most.
  try {
    const since = new Date(now.getTime() - FITTING_MAX_AGE_DAYS * 86400000).toISOString();
    const { data: partial, error: partErr } = await supabase
      .from("bespoke_orders")
      .select("id, case_no, stripe_session_id, session_ref, scan_token, customer_email, customer_name, frame_name, created_at, crm_stage, stage, measurements_submitted_at, scan_source, scan_received_at, ai_face_width_mm, ai_temple_to_temple_mm, ai_inner_canthal_mm, reference_glasses_raw, manual_notes, manual_bridge_width_mm, manual_temple_length_mm, manual_temple_to_temple_mm, metadata")
      .not("measurements_submitted_at", "is", null)
      .gte("created_at", since)
      .limit(500);
    if (partErr) throw partErr;
    for (const o of (partial ?? []) as Array<Record<string, any>>) {
      try {
        if (!open(o)) continue;
        const seen = await stepsFor(o.id);
        const action = nextFittingAction({
          now, submittedAt: o.measurements_submitted_at,
          requestAt: seen[FITTING_NOTES.request] ?? null,
          reminderAt: seen[FITTING_NOTES.reminder] ?? null,
          alertAt: seen[FITTING_NOTES.alert] ?? null,
        });
        if (!action) continue;

        const { data: photos } = await supabase
          .from("bespoke_order_photos")
          .select("photo_path, photo_temple_to_temple_mm, profile_path, consent_withdrawn_at")
          .eq("order_id", o.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const scanFilter = [`order_id.eq.${o.id}`, o.session_ref ? `session_ref.eq.${o.session_ref}` : null].filter(Boolean).join(",");
        const { data: scans } = await supabase
          .from("bespoke_scan_profiles")
          .select("created_at, temple_to_temple_mm")
          .or(scanFilter)
          .order("created_at", { ascending: false })
          .limit(10);
        const missing = fittingMissing({ order: o, photo: photos?.[0] ?? null, scans: scans ?? [] });
        if (missing.length === 0) continue;

        const ref = refOf(o);
        const links = fittingLinks(SITE_ORIGIN, o as any);
        const asks = fittingAsks(missing, links);
        const things = COUNT[missing.length];
        if (action === "request") {
          await logStep(o, FITTING_NOTES.request);
          await sendFromMarek(o, `bespoke-fit-items-request-${o.id}`, {
            subject: `${things[0].toUpperCase()}${things.slice(1)} before your 3D model (${ref})`,
            preview: asks.map((a) => a.title).join(" · "),
            firstName: firstNameOf(o),
            intro: [
              "Your fitting form came through. Thanks.",
              `The workshop in Greece builds your 3D model next. ${things[0].toUpperCase()}${things.slice(1)} from you makes it more precise:`,
            ],
            asks,
            outro: "Nothing is cut before you approve the 3D model.",
            orderRef: ref,
          });
          result.fitRequested += 1;
        } else if (action === "reminder") {
          await logStep(o, FITTING_NOTES.reminder);
          await sendFromMarek(o, `bespoke-fit-items-reminder-${o.id}`, {
            subject: `One thing for a more precise 3D model (${ref})`,
            preview: asks.map((a) => a.title).join(" · "),
            firstName: firstNameOf(o),
            intro: ["Your order is open and nothing has been cut. Your 3D model gets more precise with this:"],
            asks,
            outro: "Stuck on any of it? Reply and I'll help.",
            orderRef: ref,
          });
          result.fitReminded += 1;
        } else {
          await logStep(o, FITTING_NOTES.alert);
          await alertSupport(`bespoke-fit-items-alert-${o.id}`, `Fitting still incomplete - ${ref}`, [
            `${o.customer_name ?? ""} <${o.customer_email}>`,
            `Missing: ${asks.map((a) => a.title).join(", ")}.`,
            "The request and one reminder went out. No more automatic emails - write or call.",
            "https://woolet.co/en/admin/bespoke",
          ]);
          result.fitAlerted += 1;
        }
      } catch (e) {
        result.errors += 1;
        console.error("[bespoke-balance-cron] fitting items follow-up failed", o.id, e);
      }
    }
  } catch (err) {
    console.error("[bespoke-balance-cron] fitting items follow-up", err);
  }

  console.log("[bespoke-balance-cron]", JSON.stringify(result));
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
