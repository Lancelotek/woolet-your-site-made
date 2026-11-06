// GA4 optimisation funnel (06.11.2026).
//
// Why: campaign decisions need the cost of each funnel step close to money,
// split by how well the visitor fits the frame. Before this module the funnel
// steps that matter (finished scan, bespoke start / preview / checkout) either
// never reached GA4 (GTM only forwards ^(scan|fit)_ events and drops their
// params) or were spread over method-specific names (fitlens_result,
// scan_completed, fit_result_shown), which made one key event impossible.
//
// What it sends (dataLayer → GTM → GA4):
//   fit_scan_complete  {fit_method, fit_result, face_width_bucket}  once per session
//   bespoke_start      {bespoke_step}                                once per session
//   bespoke_preview    {preview_status}                              once per session
//   bespoke_checkout   {bespoke_step}                                every pay click
// plus persistent dataLayer keys read by GTM as user properties:
//   wlt_fit_result, wlt_hero_variant
//
// Privacy: only the 5 mm bucket and the fit class leave the page, never mm.
// Fit ranges follow the 04.11.2026 decision: standard 158 mm frame fits
// 155-161 mm, 145-154 mm → Bespoke, outside → contact support.

import { pushGtmEvent } from "@/lib/gtm";
import { getTrackedVariantId } from "@/lib/hero-experiment";

export const FIT_STANDARD_MIN = 155;
export const FIT_STANDARD_MAX = 161;
export const FIT_BESPOKE_MIN = 145;

export type FitResult =
  | "standard"
  | "bespoke"
  | "over_range"
  | "under_range"
  | "edge"
  | "unknown";

export type FitMethod = "fitlens" | "camera_native" | "wizard";

/** Exact face width (mm) → fit class. */
export function classifyFaceWidth(mm: number | null | undefined): FitResult {
  if (typeof mm !== "number" || !Number.isFinite(mm) || mm < 100 || mm > 220) return "unknown";
  if (mm < FIT_BESPOKE_MIN) return "under_range";
  if (mm < FIT_STANDARD_MIN) return "bespoke";
  if (mm <= FIT_STANDARD_MAX) return "standard";
  return "over_range";
}

/**
 * 5 mm bucket ("155-160") → fit class. A bucket that straddles a range edge
 * (e.g. "160-165": 160-161 fits the standard frame, 162+ does not) is "edge",
 * so reports never claim a fit the bucket cannot prove.
 */
export function classifyBucket(bucket: string | null | undefined): FitResult {
  const m = typeof bucket === "string" ? bucket.match(/^(\d{2,3})-(\d{2,3})$/) : null;
  if (!m) return "unknown";
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (!(hi > lo)) return "unknown";
  const top = hi - 1; // buckets are [lo, hi): "155-160" covers 155..159.x
  const a = classifyFaceWidth(lo);
  const b = classifyFaceWidth(top);
  return a === b ? a : "edge";
}

/** Exact mm → privacy bucket ("157" → "155-160"). */
export function toBucket(mm: number): string {
  const lo = Math.floor(mm / 5) * 5;
  return `${lo}-${lo + 5}`;
}

const SESSION_PREFIX = "wlt_ga4_once:";
// In-memory fallback when sessionStorage is blocked (private mode).
const memoryOnce = new Set<string>();

/** true the first time a key is seen in this browser session. */
export function firstInSession(key: string): boolean {
  const full = SESSION_PREFIX + key;
  if (memoryOnce.has(full)) return false;
  memoryOnce.add(full);
  try {
    if (typeof sessionStorage === "undefined") return true;
    if (sessionStorage.getItem(full) === "1") return false;
    sessionStorage.setItem(full, "1");
  } catch {
    // Storage blocked: the in-memory set still dedupes within this page.
  }
  return true;
}

/** Test helper. */
export function __resetGa4Funnel(): void {
  memoryOnce.clear();
  try {
    if (typeof sessionStorage === "undefined") return;
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(SESSION_PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* noop */
  }
}

/** Persistent dataLayer keys (no `event`) — GTM data layer variables keep them for every later tag. */
function pushContext(ctx: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(ctx);
}

/**
 * One `fit_scan_complete` per session, whichever method finished first.
 * Pass the exact mm (never sent) and/or the FitLens bucket.
 */
export function trackFitScanComplete(input: {
  method: FitMethod;
  faceWidthMm?: number | null;
  bucket?: string | null;
}): boolean {
  const fromMm = classifyFaceWidth(input.faceWidthMm ?? null);
  const fitResult = fromMm !== "unknown" ? fromMm : classifyBucket(input.bucket ?? null);
  const bucket =
    input.bucket && /^\d{2,3}-\d{2,3}$/.test(input.bucket)
      ? input.bucket
      : fromMm !== "unknown"
        ? toBucket(input.faceWidthMm as number)
        : "";

  // The user property always reflects the latest measurement…
  if (fitResult !== "unknown") pushContext({ wlt_fit_result: fitResult });
  // …but the key event counts once per session.
  if (!firstInSession("fit_scan_complete")) return false;
  pushGtmEvent("fit_scan_complete", {
    fit_method: input.method,
    fit_result: fitResult,
    face_width_bucket: bucket || "unknown",
  });
  return true;
}

export type BespokeStage = "start" | "preview" | "checkout";

/** Bespoke funnel steps as GA4 key events. start/preview once per session, checkout on every pay click. */
export function trackBespokeStage(
  stage: BespokeStage,
  data: Record<string, string | number | boolean> = {},
): boolean {
  if (stage !== "checkout" && !firstInSession(`bespoke_${stage}`)) return false;
  pushGtmEvent(`bespoke_${stage}`, data);
  return true;
}

/** Expose the sticky hero headline variant to GTM (user property headline_variant). */
export function syncHeroVariantContext(): void {
  const id = getTrackedVariantId();
  if (id) pushContext({ wlt_hero_variant: id });
}
