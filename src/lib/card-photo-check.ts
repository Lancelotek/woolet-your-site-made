// "Is there a face and a bank-size card in this photo?" - checked on the
// device before the buyer attaches the photo. Nothing is uploaded for it.

import { getImageLandmarker } from "@/lib/face-landmarker";
import { CARD_SCORE_MIN, IPD_PX, detectCard } from "@/lib/card-detect";

export type CardCheck =
  | { status: "card"; box: { x: number; y: number; width: number; height: number } }
  | { status: "no_card" }
  | { status: "no_face" }
  /** The check itself could not run (model blocked, old browser). */
  | { status: "unavailable" };

/** Largest edge of the canvas the detector works on. */
const WORK_MAX_PX = 1400;

/** `source` is the full photo; the returned box is in its pixel coordinates. */
export async function checkCardPhoto(source: HTMLCanvasElement): Promise<CardCheck> {
  try {
    const landmarker = await getImageLandmarker();
    const faces = landmarker.detect(source).faceLandmarks;
    if (!faces?.length) return { status: "no_face" };
    // The largest face is the buyer.
    const pts = faces
      .map((f) => f.map((p) => ({ x: p.x * source.width, y: p.y * source.height })))
      .sort((a, b) => span(b) - span(a))[0];
    const mid = (i: number, j: number) => ({ x: (pts[i].x + pts[j].x) / 2, y: (pts[i].y + pts[j].y) / 2 });
    const left = mid(33, 133);
    const right = mid(362, 263);
    const ipd = Math.hypot(right.x - left.x, right.y - left.y);
    if (!(ipd > 12)) return { status: "no_face" };

    const scale = Math.min(IPD_PX / ipd, WORK_MAX_PX / Math.max(source.width, source.height));
    const w = Math.max(1, Math.round(source.width * scale));
    const h = Math.max(1, Math.round(source.height * scale));
    const work = document.createElement("canvas");
    work.width = w;
    work.height = h;
    const ctx = work.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { status: "unavailable" };
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h).data;

    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) {
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    }
    const hit = detectCard(
      pixels, w, h,
      { left: { x: left.x * scale, y: left.y * scale }, right: { x: right.x * scale, y: right.y * scale } },
      { x0: x0 * scale, y0: y0 * scale, x1: x1 * scale, y1: y1 * scale },
    );
    if (!hit || hit.score < CARD_SCORE_MIN) return { status: "no_card" };
    return {
      status: "card",
      box: { x: hit.x / scale, y: hit.y / scale, width: hit.width / scale, height: hit.height / scale },
    };
  } catch (err) {
    console.warn("[card-photo-check]", err);
    return { status: "unavailable" };
  }
}

function span(pts: Array<{ x: number; y: number }>): number {
  let lo = Infinity, hi = -Infinity;
  for (const p of pts) { lo = Math.min(lo, p.x); hi = Math.max(hi, p.x); }
  return hi - lo;
}
