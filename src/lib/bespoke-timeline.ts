// One timeline per Bespoke order: every step of the customer journey, who
// ticks it and when it happened. Built from fields the order already has, so
// it is never a second status to keep in sync - the stage in the orders table
// (CRM_STAGES) is only the short name of where this list currently stands.

export type TimelineAction =
  | { type: "stage"; to: number; back: number }
  | { type: "check"; key: "model_received" | "delivered" }
  | { type: "model_sent" }
  | { type: "ship" };

export interface TimelineStep {
  key: string;
  label: string;
  /** When it happened; null while open. */
  at: string | null;
  done: boolean;
  /** `system` rows tick themselves, `you` rows are ticked in the panel. */
  by: "system" | "you" | "customer";
  /** What to do, or why the box cannot be ticked yet. */
  hint?: string;
  /** Present when the box can be clicked. */
  action?: TimelineAction;
  locked?: boolean;
}

import {
  MAX_MODEL_CORRECTIONS,
  PREVIEW_REMINDER_DAY,
  PREVIEW_WINDOW_DAYS,
  correctionLabel,
  isPreviewFirst,
  modelStatus,
  previewState,
} from "@/lib/bespoke-flow";

type Rec = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v ? v : null);

export const MODEL_RECEIVED_NOTE = "3D model received from the workshop";
const UNTICKED = " - unticked";

/** Latest tick of a log-based step. Events arrive newest first. */
export function checkedAt(events: Array<{ note: string | null; created_at: string }>, note: string): string | null {
  for (const e of events) {
    if (e.note === note) return e.created_at;
    if (e.note === `${note}${UNTICKED}`) return null;
  }
  return null;
}

export function buildTimeline(input: {
  order: Rec;
  photo: Rec | null;
  events: Array<{ note: string | null; created_at: string }>;
  revisions: Array<{ note: string; created_at: string; resolved_at: string | null }>;
}): TimelineStep[] {
  if (isPreviewFirst(input.order)) return buildPreviewFirstTimeline(input);
  const { order: o, photo, events, revisions } = input;
  const deposit = o.payment_plan === "deposit";
  const stage = Math.max(1, Number(o.crm_stage ?? 1) || 1);
  const stageAt = (n: number) => (stage >= n ? str(o[`crm_stage_${n}_at`]) : null);

  const formAt = str(o.measurements_submitted_at);
  const addressAt = str(o.shipping_submitted_at) ?? (str(o.shipping_line1) ? formAt : null);
  const photoOk = photo && photo.status !== "pending" && photo.status !== "purged" && !photo.consent_withdrawn_at;
  const photoAt = photoOk ? str(photo.uploaded_at) ?? str(photo.consent_at) : null;

  const briefDone = stage >= 3;
  const modelReceivedAt = checkedAt(events, MODEL_RECEIVED_NOTE);
  const modelSentAt = deposit ? str(o.model_sent_at) : stageAt(4);
  const modelSent = deposit ? Boolean(o.model_sent_at) : stage >= 4;
  const paidAt = str(o.balance_paid_at);
  const openRevision = revisions.find((r) => !r.resolved_at) ?? null;
  const lastRevision = revisions[0] ?? null;
  const inProduction = stage >= 5;
  const shipped = stage >= 6;
  const deliveredAt = str(o.delivered_at);

  const steps: TimelineStep[] = [
    { key: "paid", label: deposit ? "Deposit paid" : "Paid in full", at: str(o.created_at), done: true, by: "system" },
    { key: "address", label: "Shipping address", at: addressAt, done: Boolean(addressAt), by: "customer", hint: addressAt ? undefined : "Comes with the fitting form." },
    { key: "photo", label: "Photo with a card and consent", at: photoAt, done: Boolean(photoAt), by: "customer", hint: photoAt ? undefined : "Comes with the fitting form." },
    { key: "numbers", label: "Glasses numbers and measurements", at: formAt, done: Boolean(formAt), by: "customer", hint: formAt ? undefined : "One reminder goes out on day 3. On day 6 you get an alert - then send the fitting form invitation below." },
    {
      key: "brief", label: "Brief sent to the workshop", at: stageAt(3), done: briefDone, by: "you",
      action: stage <= 3 ? { type: "stage", to: 3, back: formAt ? 2 : 1 } : undefined,
      locked: stage > 3,
    },
    {
      key: "model_received", label: "3D model received from the workshop", at: modelReceivedAt, done: Boolean(modelReceivedAt), by: "you",
      action: { type: "check", key: "model_received" },
    },
    {
      key: "model_sent", label: deposit ? "3D model sent to the customer - 14 days start" : "3D model sent to the customer", at: modelSentAt, done: modelSent, by: "you",
      hint: deposit && !modelSent ? "Emails the customer their approval link." : undefined,
      action: modelSent ? undefined : deposit ? { type: "model_sent" } : { type: "stage", to: 4, back: 3 },
      locked: modelSent,
    },
  ];

  if (deposit) {
    steps.push({
      key: "correction",
      label: openRevision ? "Correction requested - waiting for you" : lastRevision ? "Correction requested and answered" : "Correction request",
      at: openRevision?.created_at ?? lastRevision?.created_at ?? null,
      done: Boolean(lastRevision) && !openRevision,
      by: "customer",
      hint: openRevision
        ? `"${openRevision.note}" - send the corrected model with "Corrected model sent" in the balance block.`
        : lastRevision ? `"${lastRevision.note}"` : "Only when the customer asks for one.",
    });
    steps.push({
      key: "approved", label: "Model approved, balance paid", at: paidAt, done: Boolean(paidAt), by: "customer",
      hint: paidAt ? undefined : o.balance_expired_at ? "The 14 days ran out. The order is closed." : modelSent ? "Reminder goes out on day 10." : undefined,
    });
  }

  const productionLocked = deposit && !paidAt;
  steps.push(
    {
      key: "production", label: "In production", at: stageAt(5), done: inProduction, by: "you",
      hint: productionLocked ? "Unlocks when the balance is paid." : undefined,
      action: productionLocked || stage > 5 ? undefined : { type: "stage", to: 5, back: 4 },
      locked: productionLocked || stage > 5,
    },
    {
      key: "shipped", label: "Shipped, tracking number sent", at: stageAt(6) ?? (shipped ? str(o.shipped_at) : null), done: shipped, by: "you",
      hint: shipped ? undefined : productionLocked ? undefined : "Asks for the tracking number and emails it to the customer.",
      action: productionLocked ? undefined : shipped ? { type: "stage", to: 6, back: 5 } : { type: "ship" },
      locked: productionLocked,
    },
    {
      key: "delivered", label: "Delivered", at: deliveredAt, done: Boolean(deliveredAt), by: "you",
      action: shipped || deliveredAt ? { type: "check", key: "delivered" } : undefined,
      locked: !shipped && !deliveredAt,
    },
  );
  return steps;
}

/**
 * Flow 2 - visualization first (decision 17.11.2026): the balance is paid on
 * the visualization, the workshop draws only after that, and the model gets
 * up to three corrections before it is final. See bespoke-flow.ts.
 *
 * The new rows carry no click action yet: the panel buttons for them come
 * with the customer pages. No order is on flow 2 before that.
 */
function buildPreviewFirstTimeline(input: {
  order: Rec;
  photo: Rec | null;
  events: Array<{ note: string | null; created_at: string }>;
  revisions: Array<{ note: string; created_at: string; resolved_at: string | null }>;
}): TimelineStep[] {
  const { order: o, photo, events, revisions } = input;
  const stage = Math.max(1, Number(o.crm_stage ?? 1) || 1);
  const stageAt = (n: number) => (stage >= n ? str(o[`crm_stage_${n}_at`]) : null);

  const formAt = str(o.measurements_submitted_at);
  const addressAt = str(o.shipping_submitted_at) ?? (str(o.shipping_line1) ? formAt : null);
  const photoOk = photo && photo.status !== "pending" && photo.status !== "purged" && !photo.consent_withdrawn_at;
  const photoAt = photoOk ? str(photo.uploaded_at) ?? str(photo.consent_at) : null;

  const preview = previewState(o);
  const previewSentAt = str(o.preview_sent_at);
  const paidAt = str(o.balance_paid_at);
  const model = modelStatus(o, revisions);
  const modelReceivedAt = checkedAt(events, MODEL_RECEIVED_NOTE);
  const modelSentAt = str(o.model_sent_at);
  const approvedAt = str(o.model_approved_at);
  const openRevision = revisions.find((r) => !r.resolved_at) ?? null;
  const lastRevision = revisions[0] ?? null;
  const workshopLocked = !paidAt;
  const productionLocked = !model.productionUnlocked;
  const inProduction = stage >= 5;
  const shipped = stage >= 6;
  const deliveredAt = str(o.delivered_at);

  return [
    { key: "paid", label: "Deposit paid", at: str(o.created_at), done: true, by: "system" },
    { key: "address", label: "Shipping address", at: addressAt, done: Boolean(addressAt), by: "customer", hint: addressAt ? undefined : "Comes with the fitting form." },
    { key: "photo", label: "Photo with a card and consent", at: photoAt, done: Boolean(photoAt), by: "customer", hint: photoAt ? undefined : "Comes with the fitting form." },
    { key: "numbers", label: "Glasses numbers and measurements", at: formAt, done: Boolean(formAt), by: "customer", hint: formAt ? undefined : "One reminder goes out on day 3. On day 6 you get an alert." },
    {
      key: "preview_sent", label: `Visualization with dimensions sent - ${PREVIEW_WINDOW_DAYS} days start`,
      at: previewSentAt, done: Boolean(previewSentAt), by: "you",
      hint: previewSentAt ? undefined : photoAt ? "The customer's photo wearing the chosen frame, plus the proposed dimensions." : "Needs the photo with a card first.",
      locked: Boolean(previewSentAt) || !photoAt,
    },
    {
      key: "preview_paid", label: "Visualization accepted, balance paid", at: paidAt, done: Boolean(paidAt), by: "customer",
      hint: paidAt
        ? undefined
        : preview === "expired"
          ? `The ${PREVIEW_WINDOW_DAYS} days ran out. The order is closed and the deposit is kept.`
          : previewSentAt ? `Reminder goes out on day ${PREVIEW_REMINDER_DAY}.` : undefined,
    },
    {
      key: "brief", label: "Brief sent to the workshop", at: stageAt(3), done: stage >= 3, by: "you",
      hint: workshopLocked ? "Unlocks when the balance is paid - the workshop does not draw before that." : undefined,
      action: workshopLocked || stage > 3 ? undefined : { type: "stage", to: 3, back: formAt ? 2 : 1 },
      locked: workshopLocked || stage > 3,
    },
    {
      key: "model_received", label: "3D model received from the workshop", at: modelReceivedAt, done: Boolean(modelReceivedAt), by: "you",
      action: workshopLocked ? undefined : { type: "check", key: "model_received" },
      locked: workshopLocked,
    },
    {
      key: "model_sent", label: "3D model sent to the customer", at: modelSentAt, done: Boolean(modelSentAt), by: "you",
      hint: workshopLocked ? undefined : modelSentAt ? undefined : "Emails the customer their approval link. No payment on this step.",
      locked: workshopLocked || Boolean(modelSentAt),
    },
    {
      key: "correction",
      label: openRevision
        ? `${correctionLabel(model.correctionsUsed)} requested - waiting for you`
        : lastRevision ? `${correctionLabel(model.correctionsUsed)} answered` : `Correction request (up to ${MAX_MODEL_CORRECTIONS})`,
      at: openRevision?.created_at ?? lastRevision?.created_at ?? null,
      done: Boolean(lastRevision) && !openRevision,
      by: "customer",
      hint: openRevision
        ? `"${openRevision.note}" - send the corrected model.`
        : lastRevision ? `"${lastRevision.note}"` : "Only when the customer asks for one.",
    },
    {
      key: "approved",
      label: model.state === "final_by_limit" ? `Final after ${MAX_MODEL_CORRECTIONS} corrections - built to the last version` : "3D model approved",
      at: approvedAt ?? (model.state === "final_by_limit" ? modelSentAt : null),
      done: model.productionUnlocked, by: model.state === "final_by_limit" ? "system" : "customer",
      hint: model.productionUnlocked ? undefined : modelSentAt ? `${model.correctionsLeft} of ${MAX_MODEL_CORRECTIONS} corrections left.` : undefined,
    },
    {
      key: "production", label: "In production - 2-week build", at: stageAt(5), done: inProduction, by: "you",
      hint: productionLocked ? "Unlocks when the 3D model is approved or the last correction is answered." : undefined,
      action: productionLocked || stage > 5 ? undefined : { type: "stage", to: 5, back: 4 },
      locked: productionLocked || stage > 5,
    },
    {
      key: "shipped", label: "Shipped, tracking number sent", at: stageAt(6) ?? (shipped ? str(o.shipped_at) : null), done: shipped, by: "you",
      hint: shipped || productionLocked ? undefined : "Asks for the tracking number and emails it to the customer.",
      action: productionLocked ? undefined : shipped ? { type: "stage", to: 6, back: 5 } : { type: "ship" },
      locked: productionLocked,
    },
    {
      key: "delivered", label: "Delivered", at: deliveredAt, done: Boolean(deliveredAt), by: "you",
      action: shipped || deliveredAt ? { type: "check", key: "delivered" } : undefined,
      locked: !shipped && !deliveredAt,
    },
  ];
}

/** "5 of 12 done" for the panel header. Optional rows (correction) do not count. */
export function timelineProgress(steps: TimelineStep[]) {
  const counted = steps.filter((s) => s.key !== "correction");
  return { done: counted.filter((s) => s.done).length, total: counted.length };
}
