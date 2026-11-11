import type { DepositSplit } from "@/lib/bespoke-pricing";
import { depositTerms } from "@/lib/bespoke-balance";

/** The terms of the payment, printed right above the payment form. */
export function PayMeasureNotice({ split }: { split?: DepositSplit }) {
  if (split?.plan === "deposit") {
    return (
      <div role="note" className="border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-cream-dim">
        <span className="block text-xs uppercase text-gold-light mb-2">Deposit → 3D model → balance</span>
        <strong className="text-cream font-medium">{depositTerms(split)}</strong>{" "}
        Once you approve, your frame is cut in the EU to the exact millimetres of your face. Free worldwide shipping included.
      </div>
    );
  }
  return (
    <div role="note" className="border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-cream-dim">
      <span className="block text-xs uppercase text-gold-light mb-2">Pay → Measure</span>
      <strong className="text-cream font-medium">You pay for your chosen pattern first.</strong>{" "}
      Your fitting - one photo with a card and the numbers from your current glasses - comes <em className="text-gold-light">after</em> your payment clears -
      once your measurements are confirmed, your frame is cut in the EU to the exact millimetres of your face.{" "}
      Free worldwide shipping included.
    </div>
  );
}
