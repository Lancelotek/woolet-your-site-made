// Geometry helpers for the post-purchase "Photo for the workshop" step.
//
// Data controller: JAY23 LLC. Nothing here leaves the browser except through
// Woolet's own private storage — the scan provider never sees a photograph.

import { BESPOKE_SPEC } from "@/lib/bespoke-spec";

/** ISO/IEC 7810 ID-1 — the long edge of every bank card, worldwide. */
export const CARD_WIDTH_MM = 85.6;

/**
 * Below this the card edge is too short to scale from: one stray pixel would
 * move the whole measurement by more than a millimetre.
 */
export const MIN_CARD_PX = 380;

export type Point = { x: number; y: number };

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const mmPerPxFromCard = (cardPx: number): number | null =>
  cardPx >= MIN_CARD_PX ? CARD_WIDTH_MM / cardPx : null;

/**
 * The front width the workshop cuts to.
 *
 * Interim rule until map-v2 lands: a scan's temple-to-temple plus 2 mm of
 * clearance, clamped to the bespoke range; otherwise whatever width the
 * configurator carries. Swap the body of this function for the map-v2 lookup
 * and nothing else in the photo step has to change.
 */
export function frameFrontWidthMm(args: {
  scanTempleToTempleMm?: number | null;
  configuratorWidthMm: number;
}): { mm: number; source: "scan+2mm" | "configurator"; mappingVersion: string } {
  const scan = args.scanTempleToTempleMm;
  if (typeof scan === "number" && Number.isFinite(scan) && scan > 0) {
    const clamped = Math.min(
      BESPOKE_SPEC.frontWidthMax,
      Math.max(BESPOKE_SPEC.frontWidthMin, scan + 2),
    );
    return { mm: Math.round(clamped * 10) / 10, source: "scan+2mm", mappingVersion: "frame-dimensions-v0" };
  }
  return {
    mm: args.configuratorWidthMm,
    source: "configurator",
    mappingVersion: "frame-dimensions-v0",
  };
}

/**
 * Turns a configurator pattern image (dark line drawing on a light ground)
 * into a coloured outline with no background, by keying out everything above a
 * luminance threshold. The ink is then scaled with the frame so a 158 mm front
 * and a 172 mm front carry visually the same line weight.
 */
export function keyOutOutline(
  source: HTMLImageElement,
  targetWidthPx: number,
  ink = "#0B0A09",
): HTMLCanvasElement {
  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const [r, g, b] = hexToRgb(ink);
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    // 1 at pure black, 0 from mid-grey upwards — keeps anti-aliased edges soft.
    const alpha = Math.max(0, Math.min(1, (150 - lum) / 150));
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = Math.round(alpha * 255 * (d[i + 3] / 255));
  }
  ctx.putImageData(img, 0, 0);

  // Ink-width scaling: redraw at the on-photo size so the stroke thins or
  // thickens with the frame instead of staying at artwork resolution.
  const scaled = document.createElement("canvas");
  scaled.width = Math.max(1, Math.round(targetWidthPx));
  scaled.height = Math.max(1, Math.round((targetWidthPx * h) / w));
  const sctx = scaled.getContext("2d")!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(off, 0, 0, scaled.width, scaled.height);
  return scaled;
}

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const n = Number.parseInt(v.length === 3 ? v.replace(/./g, (c) => c + c) : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
