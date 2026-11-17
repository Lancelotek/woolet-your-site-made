// Bespoke deposit plan - browser side. The rules live in
// supabase/functions/_shared/bespoke-balance.ts and bespoke-pricing.ts so the
// page, the emails and the Stripe charge always agree.

import { type DepositSplit } from "../../supabase/functions/_shared/bespoke-pricing";
import { previewFlowSteps, previewTerms } from "../../supabase/functions/_shared/bespoke-flow";

export {
  balanceState,
  daysLeft,
  formatUsdCents,
  formatDueDate,
  type BalanceState,
} from "../../supabase/functions/_shared/bespoke-balance";
export { BALANCE_WINDOW_DAYS, BALANCE_REMINDER_DAY, type DepositSplit } from "../../supabase/functions/_shared/bespoke-pricing";


/** The sentence a buyer must read before paying a deposit. Printed at every pay button. */
export function depositTerms(split: DepositSplit): string {
  return previewTerms(split);
}

/** "What happens after payment" - one wording for Review, Checkout and the emails. */
export function afterPaymentSteps(split: DepositSplit): string[] {
  if (split.plan !== "deposit") {
    return [
      "Your order is confirmed and paid.",
      "We email you a private link to your fitting: one photo with a bank-size card for scale, plus the numbers printed on your current glasses. You also get direct access to our team at support@woolet.co.",
      "Our optician verifies your measurements within 24 h, then we send the 3D model for your approval.",
      "Once you approve it: hand-made in the EU to your exact millimetres - a 2-week build, free worldwide shipping.",
    ];
  }
  // New deposit orders run visualization first (bespoke-flow.ts).
  return previewFlowSteps(split);
}
