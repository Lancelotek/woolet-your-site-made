import { describe, it, expect } from "vitest";
import { classifyCardSample, CARD_DETECT_THRESHOLDS } from "./card-detection";

describe("classifyCardSample", () => {
  it("returns nextState='none' when no edge is detected", () => {
    const r = classifyCardSample(2, 2);
    expect(r.cardPresent).toBe(false);
    expect(r.cardHorizontal).toBe(false);
    expect(r.cardAligned).toBe(false);
    expect(r.nextState).toBe("none");
  });

  it("returns nextState='none' at exactly the presence threshold (strict >)", () => {
    const t = CARD_DETECT_THRESHOLDS.presenceMinGrad;
    expect(classifyCardSample(t, t).nextState).toBe("none");
  });

  it("returns nextState='ok' when card is laid flat horizontally on forehead", () => {
    // strong vertical gradient (horizontal long edge), weak horizontal gradient
    const r = classifyCardSample(14, 4);
    expect(r.cardPresent).toBe(true);
    expect(r.cardHorizontal).toBe(true);
    expect(r.cardAligned).toBe(true);
    expect(r.nextState).toBe("ok");
    expect(r.confidence).toBeGreaterThan(0);
  });

  it("returns nextState='misaligned' when an edge exists but the card is vertical/tilted", () => {
    // Both gradients above presence floor, h below texture cap, but v does
    // not dominate h enough → card present but not horizontal.
    const r = classifyCardSample(13, 10);
    expect(r.cardPresent).toBe(true);
    expect(r.cardHorizontal).toBe(false);
    expect(r.cardAligned).toBe(false);
    expect(r.nextState).toBe("misaligned");
  });

  it("requires vGrad to dominate hGrad by the configured ratio", () => {
    const { horizontalDominanceRatio } = CARD_DETECT_THRESHOLDS;
    const h = 8; // below maxBandTexture
    const justBelow = h * horizontalDominanceRatio - 0.01;
    const justAbove = h * horizontalDominanceRatio + 0.01;
    expect(classifyCardSample(justBelow, h).nextState).toBe("misaligned");
    expect(classifyCardSample(justAbove, h).nextState).toBe("ok");
  });

  it("rejects high-texture bands (hair/eyebrows) even with strong vertical gradient", () => {
    // Mimics hairline-against-wall: strong vGrad but the surrounding band is
    // textured (high hGrad) → must NOT be treated as a card.
    const r = classifyCardSample(30, 15);
    expect(r.cardPresent).toBe(false);
    expect(r.nextState).toBe("none");
  });

  it("clamps and handles invalid inputs safely", () => {
    expect(classifyCardSample(NaN, NaN).nextState).toBe("none");
    expect(classifyCardSample(-5, -5).nextState).toBe("none");
    expect(classifyCardSample(1000, 1).cardAligned).toBe(true);
    expect(classifyCardSample(1000, 1).confidence).toBeLessThanOrEqual(100);
  });

  it("yields higher confidence the more vGrad dominates", () => {
    const balanced = classifyCardSample(10, 9).confidence;
    const dominant = classifyCardSample(20, 3).confidence;
    expect(dominant).toBeGreaterThan(balanced);
  });
});
