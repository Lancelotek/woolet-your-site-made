// FitLens (external widget) → Woolet bespoke bridge.
//
// The embed dispatches a bubbling `fitlens:result` CustomEvent whose `detail`
// is the widget's measurement object. The field naming is not contractually
// fixed, so we accept a generous set of aliases (camelCase / snake_case, with
// or without a `_mm` suffix, optionally nested under `measurements`) and keep
// only values that fall inside our own plausibility ranges.

import { MEASUREMENT_RANGES, type MeasurementKey } from "@/data/bespoke-options";
import { STORAGE_KEY } from "@/lib/bespoke-state";

export type FitLensMeasurements = Partial<Record<MeasurementKey, number>>;

/**
 * Everything the embed hands over, not just the six numbers.
 * `measurements` stays the validated six-number object existing callers use.
 */
export type FitLensEvent = {
  measurements: FitLensMeasurements;
  /** Stable scan reference (`measurementId` in the event). */
  measurementId: string | null;
  /** JWT signed by FitLens — the only part we can actually verify. */
  signedPayload: string | null;
  confidence: { tier: string | null; spreadMm: number | null };
  /** Echo of the `data-session-ref` / `sessionRef` we passed to the widget. */
  sessionRef: string | null;
  /**
   * Nasal sidewall width between MediaPipe points 134-363 (`noseBridgeEstimateMm`).
   * Not the exact frame-to-nose contact width - FitLens does not validate that.
   */
  noseBridgeEstimateMm: number | null;
  /** Inner eye corners 133-362 (`intercanthalDistanceMm`; legacy alias `noseBridgeMm`). */
  intercanthalMm: number | null;
  /** Unknown/extra fields, kept verbatim. */
  raw: Record<string, unknown>;
  /**
   * `faceWidthMm` changed meaning on 2026-09-08 (now temple-to-temple at eye
   * level, 9-12 mm smaller). Anything stamped before that is `legacy`.
   */
  semanticsVersion: "current" | "legacy";
};

export const FITLENS_SEMANTICS_CUTOVER_MS = Date.parse("2026-09-08T00:00:00Z");

const ALIASES: Record<MeasurementKey, string[]> = {
  faceWidth: ["facewidth", "facewidthmm", "face_width", "facepx", "width", "faceWidthMm"],
  // `noseBridgeMm` is a deprecated alias of the intercanthal distance - never a bridge.
  bridge: ["bridge", "bridgewidth", "bridgewidthmm", "nosebridgewidth", "nosewidth"],
  pd: ["pd", "pdmm", "pupillarydistance", "interpupillarydistance", "ipd"],
  templeToTemple: ["templetotemple", "templetotemplemm", "tempTotemp", "templewidth", "headwidth"],
  templeLength: ["templelength", "templelengthmm", "armlength", "templearmlength"],
  lensHeight: ["lensheight", "lensheightmm", "bheight"],
};

/** Strip separators / units so `face_width_mm` and `faceWidthMM` collapse to one key. */
const canon = (k: string) => k.toLowerCase().replace(/[\s_-]/g, "").replace(/mm$/, "");

function flatten(input: unknown, out: Record<string, unknown> = {}, depth = 0): Record<string, unknown> {
  if (!input || typeof input !== "object" || depth > 3) return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, out, depth + 1);
      continue;
    }
    const c = canon(key);
    if (!(c in out)) out[c] = value;
  }
  return out;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Map a raw `fitlens:result` detail onto bespoke measurement keys.
 * Values outside MEASUREMENT_RANGES are dropped rather than clamped — a wrong
 * millimetre silently written into an order is worse than a missing one.
 */
export function normalizeFitLensResult(detail: unknown): FitLensMeasurements {
  const flat = flatten(detail);
  const result: FitLensMeasurements = {};

  (Object.keys(ALIASES) as MeasurementKey[]).forEach((key) => {
    const candidates = [canon(key), ...ALIASES[key].map(canon)];
    for (const c of candidates) {
      if (!(c in flat)) continue;
      const n = toNumber(flat[c]);
      if (n === null) continue;
      const rounded = Math.round(n * 10) / 10;
      const { min, max } = MEASUREMENT_RANGES[key];
      if (rounded < min || rounded > max) continue;
      result[key] = rounded;
      break;
    }
  });

  return result;
}

/**
 * Merge validated measurements into the locally persisted bespoke config so
 * the configurator picks them up (measurement step reads the same key).
 * Returns false when there is nothing usable to store.
 */
export function applyFitLensToBespokeConfig(measurements: FitLensMeasurements): boolean {
  if (typeof window === "undefined") return false;
  if (Object.keys(measurements).length === 0) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const next = {
      ...parsed,
      // Replace, never merge: a new scan must not inherit millimetres from an
      // earlier run for fields it did not return.
      measurements: { ...measurements },

      measurementMethod: "scan",
      scanCompletedAt: new Date().toISOString(),
      scanMeasurementsUnlocked: false,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/**
 * Best-effort extraction of a "produced at" timestamp (ms epoch) from a
 * FitLens result payload, so callers can drop replays of an older scan.
 */
export function readResultTimestamp(detail: unknown): number | null {
  const flat = flatten(detail);
  for (const key of ["timestamp", "createdat", "completedat", "measuredat", "time", "ts", "date"]) {
    if (!(key in flat)) continue;
    const raw = flat[key];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw < 1e12 ? raw * 1000 : raw;
    }
    if (typeof raw === "string") {
      const parsed = Date.parse(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

/** Read a top-level field, or the same field under `payload` / `measurement`. */
function readField(detail: unknown, key: string): unknown {
  if (!detail || typeof detail !== "object") return null;
  const d = detail as Record<string, unknown>;
  for (const src of [d, d.payload, d.measurement]) {
    if (src && typeof src === "object" && key in (src as Record<string, unknown>)) {
      const v = (src as Record<string, unknown>)[key];
      if (v !== null && v !== undefined && v !== "") return v;
    }
  }
  return null;
}

function readMm(detail: unknown, key: string, min: number, max: number): number | null {
  const v = readField(detail, key);
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) return null;
  return Math.round(v * 10) / 10;
}

/**
 * Full read of a `fitlens:result` detail: the validated six numbers plus the
 * scan id, the signed token and the confidence/raw blocks. Unknown fields are
 * preserved in `raw` instead of being dropped — the partner adds fields
 * without warning and the workshop report benefits from them.
 */
export function parseFitLensEvent(detail: unknown): FitLensEvent {
  const flat = flatten(detail);
  const pick = (...keys: string[]): unknown => {
    for (const k of keys) {
      const c = canon(k);
      if (c in flat && flat[c] !== null && flat[c] !== "") return flat[c];
    }
    return null;
  };

  const measurementId = ((): string | null => {
    const v = pick("measurementId", "scanId", "id");
    return typeof v === "string" && v.length > 0 && v.length <= 200 ? v : null;
  })();

  const signedPayload = ((): string | null => {
    const v = pick("signedPayload", "signedToken", "jwt", "token");
    // A JWT and nothing else — never forward an arbitrary string to the verifier.
    return typeof v === "string" && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v) ? v : null;
  })();

  // `confidence` arrives either as a string tier ("high") or as an object with `tier`.
  const tierRaw = pick("tier", "confidenceTier", "quality") ?? (typeof flat.confidence === "string" ? flat.confidence : null);
  const spreadRaw = pick("spreadMm", "spread");
  const spread = toNumber(spreadRaw);

  const stamp = readResultTimestamp(detail);
  const semanticsVersion: "current" | "legacy" =
    stamp != null && stamp < FITLENS_SEMANTICS_CUTOVER_MS ? "legacy" : "current";

  return {
    measurements: normalizeFitLensResult(detail),
    measurementId,
    signedPayload,
    confidence: {
      tier: typeof tierRaw === "string" && tierRaw ? tierRaw.toLowerCase() : null,
      spreadMm: spread,
    },
    sessionRef: ((): string | null => {
      const v = readField(detail, "sessionRef");
      return typeof v === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v) ? v : null;
    })(),
    noseBridgeEstimateMm: readMm(detail, "noseBridgeEstimateMm", 5, 40),
    intercanthalMm: readMm(detail, "intercanthalDistanceMm", 20, 50),
    raw: detail && typeof detail === "object" ? ({ ...(detail as Record<string, unknown>) }) : {},
    semanticsVersion,
  };
}
