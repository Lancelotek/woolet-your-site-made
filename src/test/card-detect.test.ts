import { describe, expect, it } from "vitest";
import { CARD_SCORE_MIN, IPD_PX, detectCard } from "@/lib/card-detect";

// A drawn stand-in for a face photo: grey wall, skin-coloured oval, dark hair
// line, and (optionally) a card held against one cheek.
const W = 260;
const H = 320;
const eyes = { left: { x: 130 - IPD_PX / 2, y: 130 }, right: { x: 130 + IPD_PX / 2, y: 130 } };
const face = { x0: 70, y0: 60, x1: 190, y1: 230 };

function scene(card: { x: number; y: number; w: number; h: number; rgb: [number, number, number]; stripe?: boolean } | null) {
  const px = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const inFace = ((x - 130) / 60) ** 2 + ((y - 145) / 85) ** 2 <= 1;
      // Mild shading so the skin is not one flat colour.
      const shade = inFace ? (x - 130) * 0.15 : 0;
      let rgb: [number, number, number] = inFace ? [205 + shade, 160 + shade, 135 + shade] : [120, 125, 128];
      if (card && x >= card.x && x < card.x + card.w && y >= card.y && y < card.y + card.h) {
        rgb = card.stripe && y - card.y > card.h * 0.12 && y - card.y < card.h * 0.3 ? [25, 25, 25] : card.rgb;
      }
      px[i] = rgb[0];
      px[i + 1] = rgb[1];
      px[i + 2] = rgb[2];
      px[i + 3] = 255;
    }
  }
  return px;
}

describe("detectCard", () => {
  it("finds a plain card on the cheek", () => {
    const card = { x: 150, y: 165, w: 80, h: 50, rgb: [150, 200, 235] as [number, number, number] };
    const hit = detectCard(scene(card), W, H, eyes, face);
    expect(hit).not.toBeNull();
    expect(hit!.score).toBeGreaterThanOrEqual(CARD_SCORE_MIN);
    expect(Math.abs(hit!.x + hit!.width / 2 - (card.x + card.w / 2))).toBeLessThan(8);
    expect(Math.abs(hit!.y + hit!.height / 2 - (card.y + card.h / 2))).toBeLessThan(8);
  });

  it("finds a dark card with a magnetic stripe", () => {
    const card = { x: 40, y: 160, w: 84, h: 53, rgb: [40, 50, 110] as [number, number, number], stripe: true };
    const hit = detectCard(scene(card), W, H, eyes, face);
    expect(hit?.score ?? 0).toBeGreaterThanOrEqual(CARD_SCORE_MIN);
  });

  it("reports no card on a face without one", () => {
    const hit = detectCard(scene(null), W, H, eyes, face);
    expect(hit?.score ?? 0).toBeLessThan(CARD_SCORE_MIN);
  });

  it("ignores a skin-coloured patch on the cheek", () => {
    const hit = detectCard(scene({ x: 150, y: 165, w: 80, h: 50, rgb: [200, 157, 132] }), W, H, eyes, face);
    expect(hit?.score ?? 0).toBeLessThan(CARD_SCORE_MIN);
  });
});
