// Bespoke "visualization first" plan - the rules, in one place (decision 17.11.2026).
//
// Flow 1 (orders up to the switch): deposit -> workshop 3D model -> the buyer
// approves it by paying the balance. The workshop drew a model before the
// order was fully paid.
//
// Flow 2: the deposit buys a visualization - the buyer's own photo wearing the
// chosen frame, with the proposed dimensions. Accepting it means paying the
// balance, within PREVIEW_WINDOW_DAYS. Only then does the workshop draw the 3D
// model. The buyer approves the model or asks for a correction, at most
// MAX_MODEL_CORRECTIONS times; after the last one the frame is built to the
// latest version. Bespoke is custom work: there are no refunds at any step.
//
// Orders in flight keep the flow they were sold under - `flow_version` on the
// order decides, never the date.
//
// Pure functions only: shared by the edge functions, the panel and the tests.

export const FLOW_MODEL_FIRST = 1;
export const FLOW_PREVIEW_FIRST = 2;

/** Days the buyer has to accept the visualization by paying the balance. */
export const PREVIEW_WINDOW_DAYS = 6;
/** One reminder, on this day after the visualization went out - two days before the order closes. */
export const PREVIEW_REMINDER_DAY = 4;
/** Corrections to the 3D model included in the price. */
export const MAX_MODEL_CORRECTIONS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface FlowOrder {
  flow_version?: number | null;
  payment_plan?: string | null;
  preview_sent_at?: string | null;
  balance_due_at?: string | null;
  balance_paid_at?: string | null;
  balance_expired_at?: string | null;
  model_sent_at?: string | null;
  model_approved_at?: string | null;
}

export interface FlowRevision {
  created_at: string;
  resolved_at: string | null;
}

export const isPreviewFirst = (order: FlowOrder | null | undefined): boolean =>
  Number(order?.flow_version ?? FLOW_MODEL_FIRST) === FLOW_PREVIEW_FIRST;

export const previewDueAt = (sentAt: Date): Date => new Date(sentAt.getTime() + PREVIEW_WINDOW_DAYS * DAY_MS);
export const previewReminderDueAt = (sentAt: Date): Date => new Date(sentAt.getTime() + PREVIEW_REMINDER_DAY * DAY_MS);

export type PreviewState =
  /** Deposit paid, the visualization has not gone out yet. */
  | "awaiting_preview"
  /** Visualization sent: the buyer accepts it by paying the balance. */
  | "awaiting_payment"
  | "paid"
  /** The window ran out. The order is closed and the deposit is kept. */
  | "expired";

export function previewState(order: FlowOrder, now: Date = new Date()): PreviewState {
  if (order.balance_paid_at) return "paid";
  if (order.balance_expired_at) return "expired";
  if (!order.preview_sent_at) return "awaiting_preview";
  const due = order.balance_due_at ? new Date(order.balance_due_at) : previewDueAt(new Date(order.preview_sent_at));
  return now.getTime() > due.getTime() ? "expired" : "awaiting_payment";
}

export type ModelState =
  /** The balance is not paid: the workshop does not start. */
  | "locked"
  /** Paid, the workshop is drawing (or redrawing after a correction). */
  | "awaiting_model"
  /** Model with the buyer: approve it or ask for a correction. */
  | "awaiting_approval"
  /** The buyer asked for a correction and the new model has not gone out. */
  | "correction_requested"
  | "approved"
  /** All corrections used and the last model is out: built to that version. */
  | "final_by_limit";

export interface ModelStatus {
  state: ModelState;
  correctionsUsed: number;
  correctionsLeft: number;
  canRequestCorrection: boolean;
  /** True once the frame can be cut: approved, or final after the last correction. */
  productionUnlocked: boolean;
}

export function modelStatus(order: FlowOrder, revisions: FlowRevision[] = []): ModelStatus {
  const used = revisions.length;
  const left = Math.max(0, MAX_MODEL_CORRECTIONS - used);
  const open = revisions.some((r) => !r.resolved_at);
  const base = { correctionsUsed: used, correctionsLeft: left };
  const out = (state: ModelState): ModelStatus => ({
    ...base,
    state,
    canRequestCorrection: state === "awaiting_approval" && left > 0,
    productionUnlocked: state === "approved" || state === "final_by_limit",
  });

  if (!order.balance_paid_at) return out("locked");
  if (order.model_approved_at) return out("approved");
  if (!order.model_sent_at) return out("awaiting_model");
  if (open) return out("correction_requested");
  // Every included correction has been asked for and answered: nothing is left
  // to decide, the frame is built to the model that is on the table.
  if (used >= MAX_MODEL_CORRECTIONS) return out("final_by_limit");
  return out("awaiting_approval");
}

/** "Correction 2 of 3" - for the buyer's page and the panel. */
export const correctionLabel = (used: number): string =>
  `Correction ${Math.min(used, MAX_MODEL_CORRECTIONS)} of ${MAX_MODEL_CORRECTIONS}`;

const usd = (cents: number) => {
  const n = cents / 100;
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
};

export interface FlowSplit {
  dueNowCents: number;
  balanceCents: number;
}

/** The sentence a buyer must read before paying the deposit. Printed at every pay button. */
export function previewTerms(split: FlowSplit): string {
  return `${usd(split.dueNowCents)} today buys your visualization: your own photo wearing the frame you chose, with the proposed dimensions. You pay the remaining ${usd(split.balanceCents)} when you accept it. Bespoke is custom work, so no payment is refundable.`;
}

/** "What happens after payment" - one wording for Review, Checkout and the emails. */
export function previewFlowSteps(split: FlowSplit): string[] {
  return [
    `You pay the ${usd(split.dueNowCents)} deposit. Your order is open.`,
    "You send one photo with a bank-size card for scale, plus the numbers printed on your current glasses.",
    "We send your visualization: your photo wearing the frame, with the proposed dimensions.",
    `You accept it by paying the balance of ${usd(split.balanceCents)} - you have ${PREVIEW_WINDOW_DAYS} days.`,
    `The workshop draws your 3D model. You approve it or ask for a correction, up to ${MAX_MODEL_CORRECTIONS} times.`,
    "Once approved: hand-made in the EU to your exact millimetres - a 2-week build, free worldwide shipping.",
  ];
}
