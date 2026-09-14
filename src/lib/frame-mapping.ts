// Face measurement → frame value mapping.
//
// v2 (2026-09): FitLens changed what `faceWidthMm` means on 2026-09-08 — it is
// now temple-to-temple at eye level, 9-12 mm smaller than the old value. So the
// mapping takes `templeToTemple` as THE fit measurement and accepts `faceWidth`
// only as its alias.
//
// Two things are deliberately NOT derived from the face any more:
//  - bridge comes from the chosen shape, never from `noseBridge`. The partner's
//    `noseBridge` is the inner-canthal distance (eye corner to eye corner), not
//    the gap a frame bridge spans. It is printed on the report as a FACE value.
//  - temple length and lens height are FRAME values chosen in the wizard.

import { FRAMES } from "@/data/frames";

export const MAPPING_VERSION = "map-v2";

/** Front width stays inside the bespoke build range whatever the scan says. */
export const FRONT_WIDTH_MIN_MM = 145;
export const FRONT_WIDTH_MAX_MM = 172;

/** Allowance added to temple-to-temple. Rule range +0..3 mm; we cut at +2. */
export const FRONT_WIDTH_ALLOWANCE_MM = 2;

/** Bridge defaults per product. Overridable by hand in the wizard. */
export const BRIDGE_DEFAULTS_MM: Record<string, number> = {
  "007": 21,
  "009": 22,
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export type MappedValue = {
  value: number;
  rule: string;
  source_measurement: string;
  mapping_version: string;
};

export type FaceInput = {
  /** THE fit measurement: temple-to-temple at eye level. */
  templeToTempleMm?: number | null;
  /** Alias of templeToTemple after 2026-09-08. Never used on its own meaning. */
  faceWidthMm?: number | null;
  /** Inner-canthal distance. Reported, never mapped to a frame value. */
  noseBridgeMm?: number | null;
};

/** Resolve the fit measurement, preferring the explicit temple-to-temple. */
export function fitMeasurementMm(face: FaceInput): { mm: number; key: string } | null {
  if (typeof face.templeToTempleMm === "number" && Number.isFinite(face.templeToTempleMm)) {
    return { mm: face.templeToTempleMm, key: "templeToTemple" };
  }
  if (typeof face.faceWidthMm === "number" && Number.isFinite(face.faceWidthMm)) {
    return { mm: face.faceWidthMm, key: "faceWidth (alias of templeToTemple)" };
  }
  return null;
}

export function mapFrontWidth(face: FaceInput): MappedValue | null {
  const fit = fitMeasurementMm(face);
  if (!fit) return null;
  const raw = round1(fit.mm + FRONT_WIDTH_ALLOWANCE_MM);
  const value = Math.min(FRONT_WIDTH_MAX_MM, Math.max(FRONT_WIDTH_MIN_MM, raw));
  return {
    value,
    rule:
      `front_width = templeToTemple + ${FRONT_WIDTH_ALLOWANCE_MM} mm ` +
      `(rule range +0..3 mm, clamped ${FRONT_WIDTH_MIN_MM}-${FRONT_WIDTH_MAX_MM} mm)`,
    source_measurement: fit.key,
    mapping_version: MAPPING_VERSION,
  };
}

/**
 * Bridge is a frame value: the shape's default, or the wizard override.
 * `noseBridge` is never an input here.
 */
export function mapBridge(shapeId: string, overrideMm?: number | null): MappedValue {
  if (typeof overrideMm === "number" && Number.isFinite(overrideMm)) {
    return {
      value: round1(overrideMm),
      rule: "bridge = manual override entered in the wizard",
      source_measurement: "wizard override",
      mapping_version: MAPPING_VERSION,
    };
  }
  const fromCatalog = FRAMES.find((f) => f.id === shapeId)?.bridgeMm;
  const value = BRIDGE_DEFAULTS_MM[shapeId] ?? fromCatalog ?? 22;
  return {
    value,
    rule: `bridge = ${shapeId} shape default`,
    source_measurement: "shape default",
    mapping_version: MAPPING_VERSION,
  };
}

/**
 * The inner-canthal distance, for the FACE block of the measurement report.
 * Explicitly labelled so nobody reads it as a frame bridge.
 */
export function reportInnerCanthal(face: FaceInput): MappedValue | null {
  if (typeof face.noseBridgeMm !== "number" || !Number.isFinite(face.noseBridgeMm)) return null;
  return {
    value: round1(face.noseBridgeMm),
    rule: "FACE value only - inner-canthal distance, not a frame bridge",
    source_measurement: "noseBridge",
    mapping_version: MAPPING_VERSION,
  };
}

export function mapFrame(
  face: FaceInput,
  shapeId: string,
  bridgeOverrideMm?: number | null,
): { front_width: MappedValue | null; bridge: MappedValue; inner_canthal: MappedValue | null } {
  return {
    front_width: mapFrontWidth(face),
    bridge: mapBridge(shapeId, bridgeOverrideMm),
    inner_canthal: reportInnerCanthal(face),
  };
}
