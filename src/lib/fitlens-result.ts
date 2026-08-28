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

const ALIASES: Record<MeasurementKey, string[]> = {
  faceWidth: ["facewidth", "facewidthmm", "face_width", "facepx", "width", "faceWidthMm"],
  bridge: ["bridge", "bridgewidth", "bridgewidthmm", "nosebridge", "nosebridgewidth", "nosewidth"],
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
