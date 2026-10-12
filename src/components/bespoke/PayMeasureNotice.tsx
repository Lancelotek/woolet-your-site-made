export function PayMeasureNotice() {
  return (
    <div role="note" className="border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed text-cream-dim">
      <span className="block text-xs uppercase text-gold-light mb-2">Pay → Measure</span>
      <strong className="text-cream font-medium">You pay for your chosen pattern first.</strong>{" "}
      The made-to-measure fit scan is scheduled <em className="text-gold-light">after</em> your payment clears —
      once your measurements are confirmed, your frame is cut in the EU to the exact millimetres of your face.{" "}
      Free worldwide shipping included.
    </div>
  );
}