// Heuristic card-corner detection from a captured frame.
//
// Given a captured canvas (or image) and a region of interest (ROI) in native
// frame coordinates where the card is expected to be (the forehead band), try
// to locate the card's top horizontal edge and return its two endpoints —
// which we treat as the card's left and right corners along its long edge.
//
// The detector is intentionally simple (no OpenCV / WASM):
//   1. Downsample ROI (slightly expanded) to a small grayscale buffer.
//   2. Compute vertical luminance gradient |dL/dy| per pixel.
//   3. For each row, score = mean of the top-K gradient magnitudes
//      (favours rows containing a contiguous strong horizontal edge over rows
//      with isolated specular highlights).
//   4. Pick the strongest row → top edge of the card.
//   5. Along that row, threshold the gradient to find columns that belong to
//      the edge, then take the longest contiguous run; its endpoints are the
//      card's left/right corners.
//
// Returns null when no sufficiently strong / wide horizontal edge is found.
// In that case the caller should fall back to the manual annotation step.

export interface Point {
  x: number;
  y: number;
}

export interface CardRoi {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectCardCornersResult {
  corners: [Point, Point];
  /** 0..1 — caller can require >= some minimum confidence. */
  confidence: number;
  /** Detected edge width in native pixels. */
  widthPx: number;
}

const DOWN_W = 160;
const DOWN_H = 80;

export function detectCardCornersInRegion(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  roi: CardRoi,
  frameWidth: number,
  frameHeight: number,
): DetectCardCornersResult | null {
  if (!Number.isFinite(roi.w) || !Number.isFinite(roi.h) || roi.w < 40 || roi.h < 20) {
    return null;
  }

  // Expand ROI: card edges often extend past the forehead band.
  const padX = roi.w * 0.5;
  const padY = roi.h * 1.0;
  const ex = Math.max(0, roi.x - padX);
  const ey = Math.max(0, roi.y - padY * 0.5);
  const ew = Math.min(frameWidth - ex, roi.w + padX * 2);
  const eh = Math.min(frameHeight - ey, roi.h + padY);
  if (ew < 60 || eh < 30) return null;

  const cv = document.createElement("canvas");
  cv.width = DOWN_W;
  cv.height = DOWN_H;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(source, ex, ey, ew, eh, 0, 0, DOWN_W, DOWN_H);
  } catch {
    return null;
  }

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, DOWN_W, DOWN_H).data;
  } catch {
    return null;
  }

  const lum = new Float32Array(DOWN_W * DOWN_H);
  for (let i = 0; i < DOWN_W * DOWN_H; i++) {
    const o = i * 4;
    lum[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }

  // |dL/dy| using centred difference; ignore top/bottom row.
  const grad = new Float32Array(DOWN_W * DOWN_H);
  for (let y = 1; y < DOWN_H - 1; y++) {
    for (let x = 0; x < DOWN_W; x++) {
      grad[y * DOWN_W + x] = Math.abs(lum[(y + 1) * DOWN_W + x] - lum[(y - 1) * DOWN_W + x]);
    }
  }

  // Score each row by mean of top 40% pixels (robust to noise).
  const topK = Math.max(8, Math.floor(DOWN_W * 0.4));
  let bestRow = -1;
  let bestScore = 0;
  const rowBuf = new Float32Array(DOWN_W);
  for (let y = 1; y < DOWN_H - 1; y++) {
    for (let x = 0; x < DOWN_W; x++) rowBuf[x] = grad[y * DOWN_W + x];
    // Partial sort — simple: copy + sort desc.
    const sorted = Array.from(rowBuf).sort((a, b) => b - a);
    let sum = 0;
    for (let i = 0; i < topK; i++) sum += sorted[i];
    const score = sum / topK;
    if (score > bestScore) {
      bestScore = score;
      bestRow = y;
    }
  }

  // Minimum edge strength — empirically a real card edge yields >= ~12 here
  // (luminance 0..255). Weak / no edge → bail.
  if (bestRow < 0 || bestScore < 10) return null;

  // Walk the best row + a 3-row neighbourhood and threshold.
  const rowGrad = new Float32Array(DOWN_W);
  let rowMax = 0;
  for (let x = 0; x < DOWN_W; x++) {
    let v = 0;
    for (let dy = -1; dy <= 1; dy++) {
      v = Math.max(v, grad[(bestRow + dy) * DOWN_W + x] || 0);
    }
    rowGrad[x] = v;
    if (v > rowMax) rowMax = v;
  }
  const thresh = Math.max(8, rowMax * 0.45);

  // Longest contiguous run above threshold, allowing small gaps (<=3 px).
  let bestStart = -1, bestEnd = -1, bestLen = 0;
  let curStart = -1, gap = 0;
  for (let x = 0; x < DOWN_W; x++) {
    const on = rowGrad[x] >= thresh;
    if (on) {
      if (curStart < 0) curStart = x;
      gap = 0;
    } else if (curStart >= 0) {
      gap++;
      if (gap > 3) {
        const len = x - gap - curStart;
        if (len > bestLen) { bestLen = len; bestStart = curStart; bestEnd = x - gap - 1; }
        curStart = -1;
        gap = 0;
      }
    }
  }
  if (curStart >= 0) {
    const len = DOWN_W - curStart;
    if (len > bestLen) { bestLen = len; bestStart = curStart; bestEnd = DOWN_W - 1; }
  }

  // Require the detected edge to span a meaningful fraction of the ROI.
  if (bestStart < 0 || bestLen < DOWN_W * 0.4) return null;

  // Map back to native frame coords.
  const sx = ew / DOWN_W;
  const sy = eh / DOWN_H;
  const x1 = ex + bestStart * sx;
  const x2 = ex + bestEnd * sx;
  const yN = ey + bestRow * sy;
  const widthPx = Math.abs(x2 - x1);

  // Sanity: card must be at least 80 px wide on frame to give a usable mm/px.
  if (widthPx < 80) return null;

  // Confidence: combine edge strength and span ratio.
  const strength = Math.min(1, (bestScore - 10) / 30);
  const span = Math.min(1, bestLen / DOWN_W);
  const confidence = Math.max(0, Math.min(1, 0.5 * strength + 0.5 * span));

  return {
    corners: [
      { x: x1, y: yN },
      { x: x2, y: yN },
    ],
    confidence,
    widthPx,
  };
}
