// What we would cut today from whatever the order already holds, and how far
// to trust it (decision 17.11.2026).
//
// The customer owes us one thing: the front photo with a card. A scan, a side
// photo and the numbers from their current glasses are no longer conditions -
// they raise the confidence of the recommendation. The system asks for ONE of
// them at a time, the one that helps most, instead of all three.
//
// Rules that do not bend:
//   - a width is only ever taken from a measured source (scan, card photo,
//     tape). A lens width alone is not a face width.
//   - the bridge comes from glasses that already fit. The inner-canthal
//     distance is a face measurement and never lands in the bridge.
//   - nothing here is a production dimension until the customer approves the
//     3D model.
//
// Pure functions only: the edge functions and the tests both import this file.

/** Mirror of src/lib/bespoke-spec.ts (edge functions cannot import from src/). */
export const REC_SPEC = {
  frontWidthMin: 145,
  frontWidthMax: 160,
  bridgeMin: 20,
  bridgeMax: 24,
  templeMin: 145,
  templeMax: 155,
} as const;

/** Clearance added to a temple-to-temple measurement - same rule as frameFrontWidthMm. */
export const FRONT_CLEARANCE_MM = 2;
/** Two width sources further apart than this are a disagreement, not a confirmation. */
export const WIDTH_AGREE_MM = 4;

export type FitTier = "A" | "B" | "C" | "none";
export type FitAsk = "photo" | "glasses" | "profile" | "scan";
export type WidthSource = "scan" | "card photo" | "tape";

export interface FitValue {
  mm: number;
  basis: string;
  /** Set when the raw number was pulled into the cuttable range. */
  clampedFrom?: number;
}

export interface FitRecommendation {
  tier: FitTier;
  /** One sentence: what the tier means for this order. */
  tierLine: string;
  frontWidth: FitValue | null;
  bridge: FitValue | null;
  templeLength: FitValue | null;
  /** Every measured temple-to-temple we hold, best source first. */
  widthSources: Array<{ source: WidthSource; mm: number }>;
  /** Largest gap between two width sources, when there are two. */
  widthSpreadMm: number | null;
  /** Things to know before cutting, in plain sentences. */
  warnings: string[];
  /** The one thing that would raise the confidence most. Null: nothing to ask. */
  nextAsk: FitAsk | null;
  nextAskLine: string;
}

type Row = Record<string, unknown>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const has = (v: unknown): boolean => v !== null && v !== undefined && String(v).trim() !== "";
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export interface GlassesNumbers {
  lens: number | null;
  bridge: number | null;
  temple: number | null;
}

/**
 * The numbers inside the temple of the customer's current glasses, from
 * wherever they were typed: "52-18 145", "cgop 1386 01 52 21-145", the form's
 * own note line "Current glasses: lens 60 · bridge 18 · temple 145 mm", or the
 * two manual fields.
 */
export function parseGlasses(order: Row): GlassesNumbers {
  const out: GlassesNumbers = { lens: null, bridge: null, temple: null };
  const inRange = (n: number, lo: number, hi: number) => (n >= lo && n <= hi ? n : null);

  const notes = typeof order.manual_notes === "string" ? order.manual_notes : "";
  const line = notes.split("\n").find((l) => /^Current glasses:/i.test(l)) ?? "";
  const pick = (re: RegExp) => {
    const m = line.match(re);
    return m ? Number(m[1]) : null;
  };
  out.lens = pick(/lens\s+(\d{2})\b/i);
  out.bridge = pick(/bridge\s+(\d{2})\b/i);
  out.temple = pick(/temple\s+(\d{3})\b/i);

  const raw = typeof order.reference_glasses_raw === "string" ? order.reference_glasses_raw : "";
  // lens 40-65, bridge 12-26, temple 120-160: the last triple in the text that fits.
  const triples = [...raw.matchAll(/(\d{2})\s*[-–□ ]\s*(\d{2})\s*[-–/ ]\s*(\d{3})/g)];
  for (const m of triples) {
    const lens = inRange(Number(m[1]), 40, 65);
    const bridge = inRange(Number(m[2]), 12, 26);
    const temple = inRange(Number(m[3]), 120, 160);
    if (lens && bridge && temple) {
      out.lens = lens;
      out.bridge = bridge;
      out.temple = temple;
    }
  }

  // The form's own fields win over free text: the customer typed them into a labelled box.
  out.bridge = num(order.manual_bridge_width_mm) ?? out.bridge;
  out.temple = num(order.manual_temple_length_mm) ?? out.temple;

  out.lens = out.lens != null ? inRange(out.lens, 40, 65) : null;
  out.bridge = out.bridge != null ? inRange(out.bridge, 12, 26) : null;
  out.temple = out.temple != null ? inRange(out.temple, 120, 160) : null;
  return out;
}

const ASK_LINES: Record<FitAsk, string> = {
  photo: "Front photo with a card - without it there is no scale to measure from.",
  glasses: "The numbers inside the temple of the current glasses - they give the bridge and the temple length.",
  profile: "Side photo with a card - it shows how high the nose bridge sits, which sets the pad depth.",
  scan: "A phone scan - a second width to confirm the first.",
};

export function recommendFit(input: {
  order: Row;
  photo?: Row | null;
  /** Rows of bespoke_scan_profiles for this order, any order. */
  scans?: Row[];
}): FitRecommendation {
  const { order: o } = input;
  const photo = input.photo && !has(input.photo.consent_withdrawn_at) ? input.photo : null;
  const scans = [...(input.scans ?? [])].sort(
    (x, y) => Date.parse(String(y.created_at ?? "")) - Date.parse(String(x.created_at ?? "")),
  );
  const warnings: string[] = [];

  // Width: measured sources only, best first.
  const widthSources: Array<{ source: WidthSource; mm: number }> = [];
  const scanT2t =
    scans.map((s) => num(s.temple_to_temple_mm)).find((v) => v != null) ?? num(o.ai_temple_to_temple_mm);
  if (scanT2t != null) widthSources.push({ source: "scan", mm: scanT2t });
  const photoT2t = photo ? num(photo.photo_temple_to_temple_mm) : null;
  if (photoT2t != null) widthSources.push({ source: "card photo", mm: photoT2t });
  const tapeT2t = num(o.manual_temple_to_temple_mm);
  if (tapeT2t != null) widthSources.push({ source: "tape", mm: tapeT2t });

  const widthSpreadMm =
    widthSources.length >= 2
      ? round1(Math.max(...widthSources.map((w) => w.mm)) - Math.min(...widthSources.map((w) => w.mm)))
      : null;
  const widthsAgree = widthSpreadMm != null && widthSpreadMm <= WIDTH_AGREE_MM;
  if (widthSpreadMm != null && !widthsAgree) {
    warnings.push(
      `Width sources disagree by ${widthSpreadMm} mm (${widthSources.map((w) => `${w.source} ${w.mm}`).join(", ")}) - re-measure before the model.`,
    );
  }

  let frontWidth: FitValue | null = null;
  if (widthSources.length > 0) {
    const best = widthSources[0];
    const raw = round1(best.mm + FRONT_CLEARANCE_MM);
    const mm = round1(clamp(raw, REC_SPEC.frontWidthMin, REC_SPEC.frontWidthMax));
    frontWidth = {
      mm,
      basis: `${best.source} temple-to-temple ${best.mm} mm + ${FRONT_CLEARANCE_MM} mm`,
      ...(mm !== raw ? { clampedFrom: raw } : {}),
    };
    if (mm !== raw) {
      warnings.push(
        `Front width ${raw} mm is outside the ${REC_SPEC.frontWidthMin}-${REC_SPEC.frontWidthMax} mm range - held at ${mm} mm.`,
      );
    }
  }

  const glasses = parseGlasses(o);

  let bridge: FitValue | null = null;
  if (glasses.bridge != null) {
    const mm = clamp(glasses.bridge, REC_SPEC.bridgeMin, REC_SPEC.bridgeMax);
    bridge = {
      mm,
      basis: `bridge of the current glasses (${glasses.bridge} mm)`,
      ...(mm !== glasses.bridge ? { clampedFrom: glasses.bridge } : {}),
    };
    if (mm !== glasses.bridge) {
      warnings.push(
        `Current glasses have a ${glasses.bridge} mm bridge, outside the ${REC_SPEC.bridgeMin}-${REC_SPEC.bridgeMax} mm we cut - held at ${mm} mm, ask how they sit.`,
      );
    }
  }

  let templeLength: FitValue | null = null;
  const meta = (o.metadata && typeof o.metadata === "object" ? o.metadata : {}) as Row;
  const configuredTemple = num(String(meta.temple_length ?? "").replace(/[^\d.]/g, ""));
  if (glasses.temple != null) {
    const mm = clamp(glasses.temple, REC_SPEC.templeMin, REC_SPEC.templeMax);
    templeLength = {
      mm,
      basis: `temple of the current glasses (${glasses.temple} mm)`,
      ...(mm !== glasses.temple ? { clampedFrom: glasses.temple } : {}),
    };
  } else if (configuredTemple != null) {
    templeLength = { mm: configuredTemple, basis: "chosen in the configurator" };
  }

  if (glasses.lens != null && frontWidth == null) {
    warnings.push(
      `Current glasses have a ${glasses.lens} mm lens${glasses.bridge == null ? " (bridge not given)" : ""} - a reference for the look, not a face width.`,
    );
  }
  if (num(o.ai_inner_canthal_mm) != null && bridge == null) {
    warnings.push("Inner-canthal distance is on file but is a face measurement - the bridge still needs glasses numbers or a side photo.");
  }

  const photoOnFile = Boolean(photo) && has(photo!.photo_path);
  const profileOnFile = Boolean(photo) && has(photo!.profile_path);
  if (photoOnFile && photoT2t == null) {
    warnings.push("The front photo is on file but has not been measured - mark the card and the temples to get a width from it.");
  }

  // Tier.
  let tier: FitTier;
  if (widthSources.length >= 2 && widthsAgree && bridge) tier = "A";
  else if (widthSources.length >= 1 && (widthSpreadMm == null || widthsAgree) && (bridge || widthsAgree)) tier = "B";
  else if (widthSources.length >= 1 || photoOnFile) tier = "C";
  else tier = "none";

  const tierLine = {
    A: "Confidence A - two measured widths agree and the bridge comes from glasses that fit.",
    B: "Confidence B - one solid width source plus a second anchor. Good to model.",
    C: "Confidence C - provisional. Model it, mark it provisional for the workshop, expect a correction round.",
    none: "No recommendation yet - nothing on file to measure from.",
  }[tier];

  // One ask: the thing that helps most, in the order customers manage best.
  let nextAsk: FitAsk | null = null;
  if (!photoOnFile && widthSources.length === 0) nextAsk = "photo";
  else if (!bridge) nextAsk = "glasses";
  else if (!profileOnFile) nextAsk = "profile";
  else if (widthSources.length < 2) nextAsk = "scan";
  if (tier === "A") nextAsk = null;

  return {
    tier,
    tierLine,
    frontWidth,
    bridge,
    templeLength,
    widthSources,
    widthSpreadMm,
    warnings,
    nextAsk,
    nextAskLine: nextAsk ? ASK_LINES[nextAsk] : "",
  };
}

/** The recommendation as label/value rows, for emails and the panel. */
export function recommendationRows(rec: FitRecommendation): Array<{ label: string; value: string }> {
  const val = (v: FitValue | null, missing: string) => (v ? `${v.mm} mm - ${v.basis}` : missing);
  return [
    { label: "Front width", value: val(rec.frontWidth, "not known - no measured width on file") },
    { label: "Bridge", value: val(rec.bridge, "not known - needs glasses numbers or a side photo") },
    { label: "Temple length", value: val(rec.templeLength, "not known") },
  ];
}
