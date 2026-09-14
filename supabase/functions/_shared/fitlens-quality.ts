// Scan quality gate (v2).
//
// The partner no longer sends a numeric confidence — they send a tier name and
// a spread in millimetres. Tier names are configurable through
// FITLENS_TIER_ORDER (comma list, lowest→highest) so a partner rename does not
// need a redeploy.

export type QualityVerdict = "pass" | "review" | "fail";

const envNum = (name: string, fallback: number): number => {
  const raw = Deno.env.get(name);
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

export const tierOrder = (): string[] =>
  (Deno.env.get("FITLENS_TIER_ORDER") ?? "low,medium,high")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

export type QualityInput = {
  tier?: string | null;
  spreadMm?: number | null;
  templeToTempleMm?: number | null;
  yawDeg?: number | null;
  semanticsVersion?: string | null;
};

export function qualityVerdict(input: QualityInput): QualityVerdict {
  // The old semantics measured a different distance; those numbers cannot be
  // mapped with v2 rules, whatever the tier says.
  if (input.semanticsVersion === "legacy") return "fail";

  const order = tierOrder();
  const tier = input.tier ? input.tier.toLowerCase() : null;
  const index = tier ? order.indexOf(tier) : -1;
  const highest = order.length ? order[order.length - 1] : null;
  const middle = order.length >= 2 ? order[order.length - 2] : null;

  const passSpread = envNum("QUALITY_SPREAD_PASS_MM", 1.5);
  const reviewSpread = envNum("QUALITY_SPREAD_REVIEW_MM", 3.0);

  const hasFit = input.templeToTempleMm != null && Number.isFinite(input.templeToTempleMm);
  const spread = input.spreadMm;
  const yawOk = input.yawDeg == null || Math.abs(input.yawDeg) <= 5;

  if (
    highest != null &&
    tier === highest &&
    spread != null &&
    spread <= passSpread &&
    hasFit &&
    yawOk
  ) {
    return "pass";
  }

  if ((middle != null && index === order.length - 2) || (spread != null && spread <= reviewSpread)) {
    return "review";
  }

  return "fail";
}
