// Bespoke deposit plan - the rules for the balance, in one place.
//
// The buyer pays a deposit at checkout. Once the 3D model is sent they have
// BALANCE_WINDOW_DAYS to approve it by paying the balance, or to ask for a
// correction. A corrected model restarts the window. One reminder goes out on
// day BALANCE_REMINDER_DAY. After the window the order closes: the deposit is
// kept and the buyer owes nothing more.
//
// Pure functions only - shared by bespoke-balance, bespoke-balance-cron,
// bespoke-crm-update, payments-webhook and the browser (src/lib/bespoke-balance.ts).

import { BALANCE_REMINDER_DAY, BALANCE_WINDOW_DAYS } from "./bespoke-pricing.ts";

export { BALANCE_REMINDER_DAY, BALANCE_WINDOW_DAYS };

export type BalanceState =
  /** Whole order paid at checkout (orders from before the deposit plan). */
  | "not_applicable"
  /** Deposit paid, model not sent yet. */
  | "awaiting_model"
  /** Model sent, buyer can approve (pay) or ask for a correction. */
  | "awaiting_payment"
  /** Buyer asked for a correction; a new model has not been sent yet. */
  | "revision_requested"
  | "paid"
  | "expired";

export interface BalanceOrder {
  payment_plan?: string | null;
  model_sent_at?: string | null;
  balance_due_at?: string | null;
  balance_paid_at?: string | null;
  balance_expired_at?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function balanceDueAt(modelSentAt: Date): Date {
  return new Date(modelSentAt.getTime() + BALANCE_WINDOW_DAYS * DAY_MS);
}

export function reminderDueAt(modelSentAt: Date): Date {
  return new Date(modelSentAt.getTime() + BALANCE_REMINDER_DAY * DAY_MS);
}

/**
 * `openRevisions` = corrections the buyer asked for that no later model has
 * answered. While one is open the clock is paused: the buyer is waiting on us.
 */
export function balanceState(order: BalanceOrder, openRevisions = 0, now: Date = new Date()): BalanceState {
  if (order.payment_plan !== "deposit") return "not_applicable";
  if (order.balance_paid_at) return "paid";
  if (order.balance_expired_at) return "expired";
  if (!order.model_sent_at) return "awaiting_model";
  if (openRevisions > 0) return "revision_requested";
  const due = order.balance_due_at ? new Date(order.balance_due_at) : balanceDueAt(new Date(order.model_sent_at));
  return now.getTime() > due.getTime() ? "expired" : "awaiting_payment";
}

/** Whole days left in the window, never negative. */
export function daysLeft(dueAt: string | Date | null | undefined, now: Date = new Date()): number {
  if (!dueAt) return 0;
  const ms = new Date(dueAt).getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / DAY_MS);
}

/** "$431" / "$431.50" */
export function formatUsdCents(cents: number | null | undefined): string {
  const n = (cents ?? 0) / 100;
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

/** "November 25, 2026" - the date printed in emails and on the model page. */
export function formatDueDate(dueAt: string | Date): string {
  return new Date(dueAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** The buyer's page for approving the model, paying the balance or asking for a correction. */
export function modelPageUrl(origin: string, stripeSessionId: string): string {
  return `${origin}/en/bespoke/model?sid=${encodeURIComponent(stripeSessionId)}`;
}
