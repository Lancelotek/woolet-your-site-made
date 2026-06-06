// Pure helpers for the live card detector used in FitScan.
// Extracted from the camera tick loop so they can be unit-tested.
//
// Single supported placement: credit card laid FLAT on the forehead with the
// long edge HORIZONTAL. We classify based on the per-region pixel-luminance
// gradients sampled around the forehead bounding box:
//   - `vGrad` = average |dL/dy| (vertical gradient) — high when card has a
//     strong horizontal long edge (top/bottom of the card).
//   - `hGrad` = average |dL/dx| (horizontal gradient).
//
// To reduce false positives from busy backgrounds (hairline, eyebrows,
// shadows, room edges visible through the oval) callers can also pass
// `structural` metrics:
//   - `peakRowV` = max row-mean |dL/dy| over the forehead band — a real
//     card long edge concentrates strong vertical gradient on ONE row, so
//     peakRowV is much larger than the band-average vGrad.
//   - `medianRowV` = median row-mean |dL/dy| — proxy for background noise.
// A clean card top edge gives peakRowV both above an absolute floor AND
// well above the median; noisy scenes do not.

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
  /** Min peak-row vertical gradient (structural) to accept a true card edge. */
  peakRowMinV: 14,
  /** Peak row must exceed band-median row by this ratio (structural). */
  peakRowDominanceRatio: 2.2,
} as const;

export interface StructuralSample {
  /** Max per-row mean |dL/dy| in the sampled forehead band. */
  peakRowV: number;
  /** Median per-row mean |dL/dy| in the sampled forehead band. */
  medianRowV: number;
}

export function classifyCardSample(
  vGrad: number,
  hGrad: number,
  structural?: StructuralSample,
): CardClassification {
  const v = Number.isFinite(vGrad) && vGrad > 0 ? vGrad : 0;
  const h = Number.isFinite(hGrad) && hGrad > 0 ? hGrad : 0;
  const maxGrad = Math.max(v, h);
  const {
    presenceMinGrad,
    horizontalDominanceRatio,
    peakRowMinV,
    peakRowDominanceRatio,
  } = CARD_DETECT_THRESHOLDS;

  let cardPresent = maxGrad > presenceMinGrad;
  let cardHorizontal =
    cardPresent && v > h * horizontalDominanceRatio && v > presenceMinGrad;

  // Structural gate (when provided): a true card top edge produces ONE
  // dominant row of vertical gradient. Without that, we treat the signal as
  // background noise and refuse to flip to "ok"/"misaligned".
  if (structural) {
    const peak = Number.isFinite(structural.peakRowV) && structural.peakRowV > 0
      ? structural.peakRowV
      : 0;
    const median = Number.isFinite(structural.medianRowV) && structural.medianRowV > 0
      ? structural.medianRowV
      : 0;
    const structuralOk =
      peak >= peakRowMinV && peak >= median * peakRowDominanceRatio;
    if (!structuralOk) {
      cardPresent = false;
      cardHorizontal = false;
    }
  }

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
