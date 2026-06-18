// Realistic upper bounds for raw scan output. The detector occasionally
// over-estimates (e.g. 175 mm face / 49 mm nose), which are not anatomically
// plausible for our customer base. We cap so downstream UIs always show
// believable, manufacturable numbers.
export const MAX_FACE_WIDTH_MM = 161;
export const MAX_NOSE_WIDTH_MM = 42;

export function clampFaceMm(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  return Math.min(MAX_FACE_WIDTH_MM, Math.max(0, Math.round(v)));
}

export function clampNoseMm(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  return Math.min(MAX_NOSE_WIDTH_MM, Math.max(0, Math.round(v)));
}
