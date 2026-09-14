// Mirror of src/lib/bespoke-gaps.ts for the Deno runtime (edge functions cannot
// import from src/). Keep the two in step — the admin list, the shipping export
// and the workshop notification must never disagree about what is missing.

export const BRIDGE_MIN_MM = 16;
export const BRIDGE_MAX_MM = 26;
// Inner-canthal distance is a FACE measurement (eye corner to eye corner),
// typically 30-35 mm in an adult. It is never a frame bridge.
export const INNER_CANTHAL_MIN_MM = 25;
export const INNER_CANTHAL_MAX_MM = 45;


const MANUAL_MEASUREMENT_FIELDS = [
  "manual_face_width_mm",
  "manual_temple_to_temple_mm",
  "manual_bridge_width_mm",
  "manual_pd_mm",
  "manual_temple_length_mm",
  "manual_head_circumference_mm",
  "manual_ear_to_ear_mm",
] as const;

export type BespokeGapSource = Record<string, unknown>;

const num = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string => (v == null ? "" : String(v).trim());

export function bespokeOrderGaps(order: BespokeGapSource): string[] {
  const gaps: string[] = [];

  if (!str(order.shipping_phone)) {
    gaps.push("No phone number - couriers will not accept a parcel without one for the recipient");
  }
  if (!str(order.shipping_city)) {
    gaps.push("No city in the delivery address");
  }
  if (!order.shipping_submitted_at) {
    gaps.push("Address not confirmed by the customer");
  }

  // Frame bridge only — the scan's inner-canthal value never lands here.
  for (const key of ["ai_bridge_width_mm", "manual_bridge_width_mm"]) {
    const bridge = num(order[key]);
    if (bridge != null && (bridge < BRIDGE_MIN_MM || bridge > BRIDGE_MAX_MM)) {
      gaps.push(`Bridge ${bridge} mm outside the ${BRIDGE_MIN_MM}-${BRIDGE_MAX_MM} mm range`);
    }
  }

  // Quieter: a face measurement to re-check, not a reason to stop cutting.
  const canthal = num(order.ai_inner_canthal_mm);
  if (canthal != null && (canthal < INNER_CANTHAL_MIN_MM || canthal > INNER_CANTHAL_MAX_MM)) {
    gaps.push(
      `Inner-canthal distance ${canthal} mm looks unusual (${INNER_CANTHAL_MIN_MM}-${INNER_CANTHAL_MAX_MM} mm expected) - worth re-checking the scan`,
    );
  }

  const hasManual = MANUAL_MEASUREMENT_FIELDS.some((f) => num(order[f]) != null);
  if (!hasManual) {
    gaps.push("No manual measurements to check the scan against");
  }

  // One problem, one sentence — the badge counts gaps, not sources.
  return Array.from(new Set(gaps));
}


/** Bridge values (from either source) that sit outside the cuttable range. */
export function bridgeOutOfRange(order: BespokeGapSource): number[] {
  const out = new Set<number>();
  for (const key of ["ai_bridge_width_mm", "manual_bridge_width_mm"]) {
    const bridge = num((order as Record<string, unknown>)[key]);
    if (bridge != null && (bridge < BRIDGE_MIN_MM || bridge > BRIDGE_MAX_MM)) out.add(bridge);
  }
  return Array.from(out);

}

/** Scan/manual pairs that differ by more than the tolerance, in millimetres. */
export function measurementDisagreements(
  order: BespokeGapSource,
  toleranceMm = 3,
): Array<{ label: string; scan: number; manual: number; delta: number }> {
  const pairs: Array<[string, string, string]> = [
    ["Face width", "ai_face_width_mm", "manual_face_width_mm"],
    ["Temple-to-temple", "ai_temple_to_temple_mm", "manual_temple_to_temple_mm"],
    ["Bridge width", "ai_bridge_width_mm", "manual_bridge_width_mm"],
    ["Pupillary distance", "ai_pd_mm", "manual_pd_mm"],
  ];
  const out: Array<{ label: string; scan: number; manual: number; delta: number }> = [];
  for (const [label, aiKey, manualKey] of pairs) {
    const scan = num(order[aiKey]);
    const manual = num(order[manualKey]);
    if (scan == null || manual == null) continue;
    const delta = Math.round(Math.abs(scan - manual) * 10) / 10;
    if (delta > toleranceMm) out.push({ label, scan, manual, delta });
  }
  return out;
}
