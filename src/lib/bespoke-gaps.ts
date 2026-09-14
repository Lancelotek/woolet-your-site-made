// Single source of truth for "what is still missing before this parcel can go
// out". The list badge, the detail card and the shipping export all read from
// this helper so the three can never disagree.

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

  for (const key of ["ai_bridge_width_mm", "manual_bridge_width_mm"]) {
    const bridge = num(order[key]);
    if (bridge != null && (bridge < BRIDGE_MIN_MM || bridge > BRIDGE_MAX_MM)) {
      gaps.push(`Bridge ${bridge} mm outside the ${BRIDGE_MIN_MM}-${BRIDGE_MAX_MM} mm range`);
    }
  }

  const hasManual = MANUAL_MEASUREMENT_FIELDS.some((f) => num(order[f]) != null);
  if (!hasManual) {
    gaps.push("No manual measurements to check the scan against");
  }

  return gaps;
}

export function bespokeShippingStatus(order: BespokeGapSource): string {
  if (order.delivered_at) return "Delivered";
  if (order.shipped_at) return "Shipped";
  return bespokeOrderGaps(order).length > 0 ? "On hold" : "Ready to ship";
}
