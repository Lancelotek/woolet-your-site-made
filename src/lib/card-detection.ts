// Pure helpers for the live card detector used in FitScan.
// Extracted from the camera tick loop so they can be unit-tested.
//
// Single supported placement: credit card laid FLAT on the forehead with the
// long edge HORIZONTAL. We classify based on the per-region pixel-luminance
// gradients sampled around the forehead bounding box:
//   - `vGrad` = average |dL/dy| (vertical gradient) — high when card has a
//     strong horizontal long edge (top/bottom of the card).
//   - `hGrad` = average |dL/dx| (horizontal gradient).

export type CardClassification = {
  cardPresent: boolean;
  cardHorizontal: boolean;
  cardAligned: boolean;
  nextState: "none" | "ok" | "misaligned";
  confidence: number; // 0..100
};

export const CARD_DETECT_THRESHOLDS = {
  /** Minimum max-gradient required to consider any card-like edge present. */
  presenceMinGrad: 7,
  /** Vertical gradient must exceed horizontal by this multiplier to count as horizontal. */
  horizontalDominanceRatio: 1.35,
} as const;

export function classifyCardSample(vGrad: number, hGrad: number): CardClassification {
  const v = Number.isFinite(vGrad) && vGrad > 0 ? vGrad : 0;
  const h = Number.isFinite(hGrad) && hGrad > 0 ? hGrad : 0;
  const maxGrad = Math.max(v, h);
  const { presenceMinGrad, horizontalDominanceRatio } = CARD_DETECT_THRESHOLDS;

  const cardPresent = maxGrad > presenceMinGrad;
  const cardHorizontal =
    cardPresent && v > h * horizontalDominanceRatio && v > presenceMinGrad;
  const cardAligned = cardPresent && cardHorizontal;

  const nextState: CardClassification["nextState"] = !cardPresent
    ? "none"
    : cardAligned
      ? "ok"
      : "misaligned";

  const strength = Math.max(0, Math.min(1, (maxGrad - 2) / 12));
  const dom = v + h > 0 ? Math.max(0, (maxGrad / (v + h) - 0.5) * 2) : 0;
  const confidence = Math.round(strength * (0.45 + 0.55 * dom) * 100);

  return { cardPresent, cardHorizontal, cardAligned, nextState, confidence };
}
