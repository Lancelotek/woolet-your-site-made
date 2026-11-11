// Finds a bank-size card held against the cheek in a face photo. Runs in the
// browser, on the pixels only - the photo is not sent anywhere for this.
//
// The check is deliberately a soft one: it confirms "a card is visible" for
// the buyer before the photo is attached. The workshop still measures by eye.
//
// Method: with the eyes located (MediaPipe face landmarks), the image is
// scaled so the eyes are IPD_PX apart. A card is then a rectangle of known
// proportion (85.6 x 54 mm) and roughly known size next to the face, with
//   - a colour step along its top, left and right edge,
//   - an even interior (a magnetic stripe or fingers may break a third of it),
//   - a colour that is not the buyer's skin.
// Tuned on photos with and without a card (11.11.2026); see card-detect.test.

export type Point = { x: number; y: number };
export type Box = { x0: number; y0: number; x1: number; y1: number };
export type CardHit = { x: number; y: number; width: number; height: number; score: number };

/** Eye distance, in pixels, of the image handed to `detectCard`. */
export const IPD_PX = 56;
/** Card long edge / short edge (ISO/IEC 7810 ID-1). */
const CARD_RATIO = 85.6 / 53.98;
/** Lowest score that counts as "card found". Photos without a card stay under 41. */
export const CARD_SCORE_MIN = 50;

const EDGE_MIN = 12;
const EVEN_MAX = 16;
const SKIN_LUMA = 38;
const SKIN_CHROMA = 0.03;
const FACE_OVERLAP = 0.2;

/**
 * @param rgba   pixels of an image scaled so the eyes are ~IPD_PX apart
 * @param eyes   eye centres in that image
 * @param face   bounding box of the face landmarks in that image
 * @returns the best card-like rectangle, or null when nothing passes the gates.
 *          Compare `score` with CARD_SCORE_MIN.
 */
export function detectCard(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  eyes: { left: Point; right: Point },
  face: Box,
): CardHit | null {
  const w = width;
  const h = height;
  const d = Math.hypot(eyes.right.x - eyes.left.x, eyes.right.y - eyes.left.y);
  if (!(d > 8) || w < 40 || h < 40) return null;

  // Summed-area tables, one per channel.
  const stride = w + 1;
  const sat = [0, 1, 2].map(() => new Float64Array(stride * (h + 1)));
  for (let y = 0; y < h; y++) {
    let r = 0, g = 0, b = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      r += rgba[i];
      g += rgba[i + 1];
      b += rgba[i + 2];
      const o = (y + 1) * stride + x + 1;
      sat[0][o] = sat[0][o - stride] + r;
      sat[1][o] = sat[1][o - stride] + g;
      sat[2][o] = sat[2][o - stride] + b;
    }
  }
  const clampX = (v: number) => Math.max(0, Math.min(w, Math.round(v)));
  const clampY = (v: number) => Math.max(0, Math.min(h, Math.round(v)));
  const out = new Float64Array(3);
  /** Mean colour of a rectangle into `target`; false when it has no area. */
  const mean = (x0: number, y0: number, x1: number, y1: number, target: Float64Array | number[]): boolean => {
    const ax = clampX(x0), bx = clampX(x1), ay = clampY(y0), by = clampY(y1);
    const area = (bx - ax) * (by - ay);
    if (area <= 0) return false;
    for (let c = 0; c < 3; c++) {
      const s = sat[c];
      target[c] = (s[by * stride + bx] - s[ay * stride + bx] - s[by * stride + ax] + s[ay * stride + ax]) / area;
    }
    return true;
  };
  const inA = new Float64Array(3);
  const outA = new Float64Array(3);
  const step4 = new Float64Array(4);
  /** Colour step across one edge: second-weakest of four stretches. */
  const edge = (
    horizontal: boolean, from: number, to: number,
    in0: number, in1: number, out0: number, out1: number,
  ): number => {
    const len = (to - from) / 4;
    for (let k = 0; k < 4; k++) {
      const a = from + len * k;
      const b = a + len;
      const okIn = horizontal ? mean(a, in0, b, in1, inA) : mean(in0, a, in1, b, inA);
      const okOut = horizontal ? mean(a, out0, b, out1, outA) : mean(out0, a, out1, b, outA);
      if (!okIn || !okOut) return 0;
      step4[k] = Math.hypot(inA[0] - outA[0], inA[1] - outA[1], inA[2] - outA[2]);
    }
    const sorted = Array.from(step4).sort((p, q) => p - q);
    return sorted[1];
  };
  const luma = (c: ArrayLike<number>) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];

  const cx = (eyes.left.x + eyes.right.x) / 2;
  const ey = (eyes.left.y + eyes.right.y) / 2;
  // Skin reference: the forehead just above the brows.
  const skin = [0, 0, 0];
  if (!mean(cx - 0.2 * d, ey - 0.75 * d, cx + 0.2 * d, ey - 0.45 * d, skin)) return null;
  const skinSum = skin[0] + skin[1] + skin[2] + 1e-6;
  const skinLuma = luma(skin);

  const cells = new Float64Array(12 * 3);
  const devs = new Float64Array(12);
  const med = [0, 0, 0];
  const column = new Float64Array(12);
  const M = 0.14;
  let best: CardHit | null = null;

  for (let W = d; W < 1.95 * d; W += 0.06 * d) {
    const H = W / CARD_RATIO;
    const t = Math.max(2, 0.05 * H);
    const step = Math.max(1, W / 30);
    const yEnd = Math.min(h - H - t, ey + 2.4 * d);
    const xEnd = Math.min(w - W - t, cx + 2.2 * d - W);
    for (let y = ey - 0.15 * d; y < yEnd; y += step) {
      for (let x = Math.max(t, cx - 2.2 * d); x <= xEnd; x += step) {
        const ox = Math.max(0, Math.min(x + W, face.x1) - Math.max(x, face.x0));
        const oy = Math.max(0, Math.min(y + H, face.y1) - Math.max(y, face.y0));
        if (ox * oy < FACE_OVERLAP * W * H) continue;
        const coversLeft = x < eyes.left.x && eyes.left.x < x + W && y < eyes.left.y && eyes.left.y < y + H;
        const coversRight = x < eyes.right.x && eyes.right.x < x + W && y < eyes.right.y && eyes.right.y < y + H;
        if (coversLeft && coversRight) continue;

        const xa = x + W * M, xb = x + W * (1 - M);
        const ya = y + H * M, yb = y + H * (1 - M);
        const top = edge(true, xa, xb, y + 1, y + 1 + t, y - 1 - t, y - 1);
        if (top < EDGE_MIN) continue;
        const left = edge(false, ya, yb, x + 1, x + 1 + t, x - 1 - t, x - 1);
        if (left < EDGE_MIN) continue;
        const right = edge(false, ya, yb, x + W - 1 - t, x + W - 1, x + W + 1, x + W + 1 + t);
        if (right < EDGE_MIN) continue;

        // Evenness: 4 x 3 cells of the inner part, 8th-smallest distance to the median colour.
        let n = 0;
        let ok = true;
        for (let r = 0; r < 3 && ok; r++) {
          for (let c = 0; c < 4; c++) {
            ok = mean(xa + ((xb - xa) * c) / 4, ya + ((yb - ya) * r) / 3, xa + ((xb - xa) * (c + 1)) / 4, ya + ((yb - ya) * (r + 1)) / 3, out);
            if (!ok) break;
            cells[n * 3] = out[0];
            cells[n * 3 + 1] = out[1];
            cells[n * 3 + 2] = out[2];
            n++;
          }
        }
        if (!ok) continue;
        for (let c = 0; c < 3; c++) {
          for (let i = 0; i < 12; i++) column[i] = cells[i * 3 + c];
          const s = Array.from(column).sort((p, q) => p - q);
          med[c] = (s[5] + s[6]) / 2;
        }
        for (let i = 0; i < 12; i++) {
          devs[i] = Math.hypot(cells[i * 3] - med[0], cells[i * 3 + 1] - med[1], cells[i * 3 + 2] - med[2]);
        }
        const even = Array.from(devs).sort((p, q) => p - q)[7];
        if (even > EVEN_MAX) continue;

        const medSum = med[0] + med[1] + med[2] + 1e-6;
        const dl = Math.abs(luma(med) - skinLuma);
        const dc = Math.hypot(med[0] / medSum - skin[0] / skinSum, med[1] / medSum - skin[1] / skinSum);
        if (dl < SKIN_LUMA && dc < SKIN_CHROMA) continue;

        // The bottom edge is often under the fingers, so it only adds to the score.
        const bottom = edge(true, xa, xb, y + H - 1 - t, y + H - 1, y + H + 1, y + H + 1 + t);
        const score = Math.min(top, left, right) + 0.3 * Math.min(bottom, 40) - 0.5 * even;
        if (!best || score > best.score) best = { x, y, width: W, height: H, score };
      }
    }
  }
  return best;
}
