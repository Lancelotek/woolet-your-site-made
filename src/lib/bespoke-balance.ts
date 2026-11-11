// Bespoke deposit plan - browser side. The rules live in
// supabase/functions/_shared/bespoke-balance.ts and bespoke-pricing.ts so the
// page, the emails and the Stripe charge always agree.

import { BALANCE_WINDOW_DAYS, type DepositSplit } from "../../supabase/functions/_shared/bespoke-pricing";

export {
  balanceState,
  daysLeft,
  formatUsdCents,
  formatDueDate,
  type BalanceState,
} from "../../supabase/functions/_shared/bespoke-balance";
export { BALANCE_WINDOW_DAYS, BALANCE_REMINDER_DAY, type DepositSplit } from "../../supabase/functions/_shared/bespoke-pricing";

const usd = (cents: number) => {
  const n = cents / 100;
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
};

/** The sentence a buyer must read before paying a deposit. Printed at every pay button. */
export function depositTerms(split: DepositSplit): string {
  return `${usd(split.dueNowCents)} today starts your fit scan and 3D model. You pay the remaining ${usd(split.balanceCents)} only after you approve the model. The deposit is non-refundable, and you are free to stop there.`;
}

/** "What happens after payment" - one wording for Review, Checkout and the emails. */
export function afterPaymentSteps(split: DepositSplit): string[] {
  if (split.plan !== "deposit") {
    return [
      "Your order is confirmed and paid.",
      "We email you a private link to the AI fit scan, plus where to upload two photos with a card (front and profile). You also get direct access to our team at support@woolet.co.",
      "Our optician verifies your measurements within 24 h, then we send the 3D model for your approval.",
      "Once you approve it: hand-made in the EU to your exact millimetres - a 2-week build, free worldwide shipping.",
    ];
  }
  return [
    `You pay the ${usd(split.dueNowCents)} deposit. Your order is open.`,
    "We email you a private link to the AI fit scan, plus where to upload two photos with a card (front and profile). You also get direct access to our team at support@woolet.co.",
    "Our optician verifies your measurements within 24 h, then we send the 3D model of your frame.",
    `You approve the model by paying the balance of ${usd(split.balanceCents)}, or ask us to correct it - you have ${BALANCE_WINDOW_DAYS} days.`,
    "Once approved: hand-made in the EU to your exact millimetres - a 2-week build, free worldwide shipping.",
  ];
}
