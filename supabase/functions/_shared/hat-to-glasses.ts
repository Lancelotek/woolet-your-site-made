// Single source of truth for hat size ↔ glasses width. Pure TS, no deps —
// imported by the web app (src/lib/hat-to-glasses.ts) and edge functions.
// Mapping published in /en/blog/hat-size-chart-guide-cm-inches-us-uk-eu (ANSUR II):
// temple width (mm) ≈ 1.91 × head circumference (cm) + 44.7

export type HatRow = {
  cm: number; inches: string; us: string; uk: string; letter: string;
  band: "S" | "M" | "L" | "XL" | "XXL"; note?: string;
};

export const HAT_ROWS: HatRow[] = [
  { cm: 53, inches: "20⅞", us: "6⅝", uk: "6½", letter: "XXS", band: "S" },
  { cm: 54, inches: "21¼", us: "6¾", uk: "6⅝", letter: "XS", band: "S" },
  { cm: 55, inches: "21⅝", us: "6⅞", uk: "6¾", letter: "S", band: "S" },
  { cm: 56, inches: "22", us: "7", uk: "6⅞", letter: "S / M", band: "M" },
  { cm: 57, inches: "22⅜", us: "7⅛", uk: "7", letter: "M", band: "M" },
  { cm: 58, inches: "22¾", us: "7¼", uk: "7⅛", letter: "M", band: "M" },
  { cm: 59, inches: "23¼", us: "7⅜", uk: "7¼", letter: "L", band: "L" },
  { cm: 60, inches: "23⅝", us: "7½", uk: "7⅜", letter: "L / XL", band: "L", note: "Top of mainstream range." },
  { cm: 61, inches: "24", us: "7⅝", uk: "7½", letter: "XL", band: "XL", note: "Specialist territory for felt hats." },
  { cm: 62, inches: "24⅜", us: "7¾", uk: "7⅝", letter: "XL", band: "XL", note: "Above most brand catalogues." },
  { cm: 63, inches: "24¾", us: "7⅞", uk: "7¾", letter: "XXL", band: "XXL", note: "Specialist / DTC only." },
  { cm: 64, inches: "25¼", us: "8", uk: "7⅞", letter: "XXL", band: "XXL", note: "3–4 brands worldwide off-the-shelf." },
  { cm: 65, inches: "25⅝", us: "8⅛", uk: "8", letter: "XXXL", band: "XXL", note: "Custom / made-to-order." },
  { cm: 66, inches: "26", us: "8¼", uk: "8⅛", letter: "XXXL", band: "XXL", note: "Custom / made-to-order." },
];

export const HAT_MIN_CM = 50;
export const HAT_MAX_CM = 68;
export const STANDARD_FRAME_MAX_MM = 148;

export function findHatRow(cm: number): HatRow {
  const r = Math.max(HAT_MIN_CM, Math.min(HAT_MAX_CM, Math.round(cm)));
  return HAT_ROWS.find((x) => x.cm === r) ?? (r < HAT_ROWS[0].cm ? HAT_ROWS[0] : HAT_ROWS[HAT_ROWS.length - 1]);
}

export function templeWidthMm(headCm: number): number {
  return Math.round(1.91 * headCm + 44.7);
}

export type GlassesBand = "mainstream" | "borderline" | "woolet" | "bespoke";

export function glassesBand(headCm: number): GlassesBand {
  const c = Math.round(headCm);
  if (c <= 55) return "mainstream";
  if (c <= 57) return "borderline";
  if (c <= 61) return "woolet";
  return "bespoke";
}

export const BAND_VERDICT: Record<GlassesBand, { title: string; body: string }> = {
  mainstream: {
    title: "Mainstream frames will fit you.",
    body: "Most standard frames are made for your size — no special width needed.",
  },
  borderline: {
    title: "Borderline — look for \"wide\" or \"XL\".",
    body: "Look for frames labelled wide or XL, with 148–152 mm fronts.",
  },
  woolet: {
    title: "Woolet 158 mm is built for this.",
    body: "Your head sits in the range Woolet's 158 mm frames were designed for.",
  },
  bespoke: {
    title: "Bespoke is your fit.",
    body: "Beyond standard sizing — Woolet Bespoke is cut to your measured width (145–172 mm).",
  },
};

export function hatToGlasses(headCm: number) {
  const row = findHatRow(headCm);
  const band = glassesBand(headCm);
  return { headCm, row, templeMm: templeWidthMm(headCm), band, verdict: BAND_VERDICT[band] };
}
