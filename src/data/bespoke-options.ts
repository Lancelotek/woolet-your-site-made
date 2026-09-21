// All non-frame configuration options + pricing.

import p632 from "@/assets/configurator/acetate/p632-0006.jpg.asset.json";
import a102 from "@/assets/configurator/acetate/a102-8421.jpg.asset.json";
import a332 from "@/assets/configurator/acetate/a332-1203.jpg.asset.json";
import a090 from "@/assets/configurator/acetate/a090-0135.jpg.asset.json";
import a132 from "@/assets/configurator/acetate/a132-1960.jpg.asset.json";
import p610 from "@/assets/configurator/acetate/p610-3013.jpg.asset.json";
import ace3096 from "@/assets/configurator/acetate/3096-1110.jpg.asset.json";
import p601 from "@/assets/configurator/acetate/p601-0009.jpg.asset.json";
import p668 from "@/assets/configurator/acetate/p668-6006.jpg.asset.json";
import p649 from "@/assets/configurator/acetate/p649-2301.jpg.asset.json";
import a078 from "@/assets/configurator/acetate/a078-5208.jpg.asset.json";
import ace3102w from "@/assets/configurator/acetate/3102-7110.jpg.asset.json";
import p554 from "@/assets/configurator/acetate/p554-1365.jpg.asset.json";
import ace3102y from "@/assets/configurator/acetate/3102-1106.jpg.asset.json";
import p844 from "@/assets/configurator/acetate/p844-5962.jpg.asset.json";
import a423 from "@/assets/configurator/acetate/a423-1176.jpg.asset.json";
import p634 from "@/assets/configurator/acetate/p634-0813.jpg.asset.json";
import p685 from "@/assets/configurator/acetate/p685-1583.jpg.asset.json";
import a305 from "@/assets/configurator/acetate/a305-2826.jpg.asset.json";

import shinyImg from "@/assets/configurator/finishes/shiny.jpg";
import matteImg from "@/assets/configurator/finishes/matte.jpg";
import brushedImg from "@/assets/configurator/finishes/brushed.jpg";

import planoImg from "@/assets/configurator/lenses/plano.jpg";
import singleVisionImg from "@/assets/configurator/lenses/single-vision.jpg";
import progressiveImg from "@/assets/configurator/lenses/progressive.jpg";
import sunTintedImg from "@/assets/configurator/lenses/sun-tinted.jpg";
import blueLightImg from "@/assets/configurator/lenses/blue-light.jpg";
import tintBrownImg from "@/assets/configurator/lenses/tint-brown.jpg";
import tintGreenImg from "@/assets/configurator/lenses/tint-green.jpg";
import tintGreyImg from "@/assets/configurator/lenses/tint-grey.jpg";

export type ColorFamily = "tortoise" | "black" | "grey" | "colour" | "translucent";

export interface ColorSwatch {
  id: string;
  /** Internal factory stock code — NEVER surfaced to the customer. */
  code: string;
  /** Human-readable descriptor. */
  name: string;
  /** Fallback hex used in the sidebar summary dot. */
  hex: string;
  /** Macro photograph of the actual acetate sheet. */
  image: string;
  /** Optional short note (translucent, layered, etc.). */
  note?: string;
  /** Visual family used to group similar-looking acetates in the picker. */
  family: ColorFamily;
  /**
   * Sheet thickness in millimetres.
   * Front acetate is cut from 6 mm plates; TEMPLES must be 4 mm.
   * When set, `ColorSwatchGrid` can filter the temple picker to 4 mm-only.
   * TODO(catalog): confirm exact thickness per code with atelier and fill in.
   */
  thicknessMm?: 4 | 6;
}

export const COLORS: ColorSwatch[] = [
  // Atelier confirmed: all sheets below are stocked in both 4 mm (temples) and 6 mm (front) plates.
  { id: "p632-0006", code: "P632 0006", name: "Dark tortoise",          hex: "#3a1a05", image: p632.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p601-0009", code: "P601 0009", name: "Amber tortoise",         hex: "#4a2306", image: p601.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p554-1365", code: "P554 1365", name: "Bordeaux marble",        hex: "#4b1210", image: p554.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p610-3013", code: "P610 3013", name: "Honey tortoise",         hex: "#a26b26", image: p610.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p634-0813", code: "P634 0813", name: "Amber mint chip",        hex: "#b46a12", image: p634.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p649-2301", code: "P649 2301", name: "Ember sparkle",          hex: "#2a1a10", image: p649.url,      family: "tortoise", thicknessMm: 4 },
  { id: "p685-1583", code: "P685 1583", name: "Emerald rose",           hex: "#2a3a2a", image: p685.url,      family: "colour",   thicknessMm: 4 },
  { id: "3096-1110", code: "3096 1110", name: "Piano black",            hex: "#0a0a0a", image: ace3096.url,   family: "black",    thicknessMm: 4 },
  { id: "a305-2826", code: "A305 2826", name: "Deep matte black",       hex: "#050505", image: a305.url,      family: "black",    thicknessMm: 4 },
  { id: "a423-1176", code: "A423 1176", name: "Black · red core",       hex: "#0d0505", image: a423.url,      family: "black",    note: "Red layer inside", thicknessMm: 4 },
  { id: "p668-6006", code: "P668 6006", name: "Slate grain",            hex: "#2a2c30", image: p668.url,      family: "grey",     thicknessMm: 4 },
  { id: "a132-1960", code: "A132 1960", name: "Smoke translucent",      hex: "#8892a0", image: a132.url,      family: "translucent", note: "Translucent", thicknessMm: 4 },
  { id: "3102-7110", code: "3102 7110", name: "Ice translucent",        hex: "#e7e6e2", image: ace3102w.url,  family: "translucent", note: "Translucent", thicknessMm: 4 },
  { id: "a102-8421", code: "A102 8421", name: "Nude beige",             hex: "#e6d3c0", image: a102.url,      family: "translucent", note: "Translucent", thicknessMm: 4 },
  { id: "a332-1203", code: "A332 1203", name: "British racing green",   hex: "#0f4c34", image: a332.url,      family: "colour",   thicknessMm: 4 },
  { id: "a078-5208", code: "A078 5208", name: "Navy",                   hex: "#0f1a5a", image: a078.url,      family: "colour",   thicknessMm: 4 },
  { id: "a090-0135", code: "A090 0135", name: "Rouge",                  hex: "#a02030", image: a090.url,      family: "colour",   thicknessMm: 4 },
  { id: "3102-1106", code: "3102 1106", name: "Sunflower",              hex: "#f4b410", image: ace3102y.url,  family: "colour",   thicknessMm: 4 },
  { id: "p844-5962", code: "P844 5962", name: "Olive marble",           hex: "#8a7a1a", image: p844.url,      family: "colour",   thicknessMm: 4 },
];

/** Front plates are 6 mm; temples must be 4 mm (only sheets stocked at 4 mm show up in the temple grid). */
export const TEMPLE_THICKNESS_MM = 4 as const;
export const FRONT_THICKNESS_MM = 6 as const;

/** Convenience helpers used by the configurator to filter the picker. */
export const templeColors = () => COLORS.filter((c) => c.thicknessMm === TEMPLE_THICKNESS_MM);
export const frontColors = () => COLORS.filter((c) => c.thicknessMm === undefined || c.thicknessMm === FRONT_THICKNESS_MM);

export const FINISHES = [
  { id: "shiny",   name: "Shiny hand-polished", image: shinyImg },
  { id: "matte",   name: "Matte",               image: matteImg },
  { id: "brushed", name: "Scratched / brushed", image: brushedImg },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

export const ENGRAVING_FEE_EUR = 10;
export const ENGRAVING_MAX_CHARS = 20;
// Customer name is engraved CNC on the LEFT temple only.
// Right temple always carries the Woolet logo.
export const ENGRAVING_POSITIONS = [
  { id: "inner-left", name: "Inner left temple (right temple carries the Woolet logo)" },
] as const;
// Single house font for personal engraving. Loaded from Google Fonts so it renders
// identically on Mac/Linux/iOS previews (Malgun Gothic ships only with Windows;
// Noto Sans KR is Google's cross-platform equivalent from the same humanist family).
export const ENGRAVING_FONTS = [
  { id: "malgun", name: "Malgun Gothic", cssFamily: "'Noto Sans KR', 'Malgun Gothic', 'Segoe UI', sans-serif" },
] as const;

export interface LensType {
  id: string;
  name: string;
  priceEur: number;
  description: string;
  /** Studio shot of the lens type. */
  image: string;
}

// Prices are USD. Each lens = supplier price (EUR) + $20 fitting, converted to USD.
export const LENS_TYPES: LensType[] = [
  { id: "blue-light",  name: "Blue Light Lenses",                 priceEur: 84, description: "Optional filter coating for screen use.",        image: blueLightImg },
  { id: "reading",     name: "Reading Lenses",                    priceEur: 60, description: "Single-vision magnification for near work.",     image: singleVisionImg },
  { id: "photochromic",name: "Photochromic",                      priceEur: 84, description: "Clear indoors, darkens in daylight.",            image: progressiveImg },
  { id: "sun-uv400",   name: "Sun Lenses (UV400)",                priceEur: 48, description: "Full UV400 tinted sun lenses.",                  image: sunTintedImg },
];

/* ───── Photochromic lens tint ─────
   Only applies to the "photochromic" lens type. No price impact.
   `code` is the production code: it goes into the order (Stripe metadata
   `lens_tint` + `lens_type` string, DB column lens_type, admin + emails)
   so the lab knows exactly which tint to fit. Never change an existing code. */
export interface LensTint {
  id: string;
  code: string;
  name: string;
  /** Darkest activated shade, used for the swatch gradient. */
  hex: string;
  /** Frame with activated lens + clear-to-dark lens progression. */
  image: string;
  short: string;
  description: string;
}

export const LENS_TINTS: LensTint[] = [
  {
    id: "brown",
    code: "PH-BRN",
    image: tintBrownImg,
    name: "Espresso Brown",
    hex: "#4a2c17",
    short: "Warm contrast that sharpens every edge.",
    description:
      "Clear indoors, a deep espresso tint outdoors. Brown pulls up contrast and depth, so road markings, terrain and faces read sharper in shifting light. The natural partner for Havana and tortoise acetate - warm on warm, no clash.",
  },
  {
    id: "green",
    code: "PH-GRN",
    image: tintGreenImg,
    name: "Bottle Green",
    hex: "#243d29",
    short: "The classic tint. True colour, calm eyes.",
    description:
      "The tint behind the most iconic sunglasses of the last century. Green cuts glare and keeps colours close to how you see them, with a touch of added contrast. Clear at your desk, rich green in full sun. Looks deliberate against Havana, Noir and Crystal frames.",
  },
  {
    id: "grey",
    code: "PH-GRY",
    image: tintGreyImg,
    name: "Graphite Grey",
    hex: "#2e3032",
    short: "Neutral tint. Colours stay exactly as they are.",
    description:
      "The purist's choice. Grey lowers brightness evenly across the spectrum, so a blue sky stays blue and a red light stays red. Built for hard sun, water and long days outdoors. Clear inside, graphite outside - one pair from morning coffee to afternoon on the terrace.",
  },
];

export const LENS_TINT_NOTE =
  "Photochromic - clear indoors, darkens in UV light in under a minute, back to clear in a few minutes. 100% UV400 protection.";

export const findLensTint = (id: string | null | undefined): LensTint | undefined =>
  id ? LENS_TINTS.find((t) => t.id === id) : undefined;

/* ───── Reading strength (dioptre) ─────
   Only applies to the "reading" lens type. No price impact. */
export const READING_STRENGTHS = [
  "+0.75", "+1.00", "+1.25", "+1.50", "+1.75", "+2.00", "+2.25",
  "+2.50", "+2.75", "+3.00", "+3.25", "+3.50", "+3.75", "+4.00",
] as const;

export type ReadingStrength = (typeof READING_STRENGTHS)[number];

export const LENS_MATERIALS = [
  { id: "cr-39",         name: "CR-39 (standard)" },
  { id: "polycarbonate", name: "Polycarbonate (impact)" },
  { id: "hi-167",        name: "1.67 Hi-index (thin)" },
  { id: "hi-174",        name: "1.74 Ultra hi-index" },
] as const;

export const LENS_COATINGS = [
  { id: "none",         name: "None" },
  { id: "ar",           name: "Anti-reflective" },
  { id: "ar-blue",      name: "AR + Blue-light" },
  { id: "ar-photo",     name: "AR + Photochromic" },
] as const;

// Plausible ranges (mm) for tape-measurement validation.
export const MEASUREMENT_RANGES = {
  pd:            { min: 50, max: 80,  label: "Pupillary distance (PD)" },
  templeToTemple:{ min: 120, max: 160, label: "Temple-to-temple width" },
  bridge:        { min: 14,  max: 26,  label: "Bridge width" },
  templeLength:  { min: 120, max: 160, label: "Temple length" },
  lensHeight:    { min: 28,  max: 55,  label: "Lens height" },
  faceWidth:     { min: 125, max: 175, label: "Face width" },
} as const;

export type MeasurementKey = keyof typeof MEASUREMENT_RANGES;

/* ───── Temple length ─────
   The arm from hinge to the bend behind the ear. Included in the price —
   all lengths cost the same. */
export interface TempleLengthOption {
  mm: number;
  label: string;
  descriptor: string;
  recommended?: boolean;
}

export const TEMPLE_LENGTHS: TempleLengthOption[] = [
  { mm: 145, label: "145 mm", descriptor: "Shorter reach. Ears sit forward or higher." },
  { mm: 150, label: "150 mm", descriptor: "Woolet standard. Fits most wide-face builds.", recommended: true },
  { mm: 155, label: "155 mm", descriptor: "Extended reach. Deeper head, ears set further back." },
];

export const TEMPLE_LENGTH_CUSTOM_RANGE = { min: 145, max: 155 } as const;

export const DEFAULT_TEMPLE_LENGTH_MM = 150;

export const isValidTempleLength = (mm: number | null | undefined): mm is number =>
  typeof mm === "number" &&
  Number.isFinite(mm) &&
  mm >= TEMPLE_LENGTH_CUSTOM_RANGE.min &&
  mm <= TEMPLE_LENGTH_CUSTOM_RANGE.max;

/** "150 mm" or "152 mm · custom" */
export const formatTempleLength = (mm: number | null | undefined, isCustom?: boolean) =>
  typeof mm === "number" ? `${mm} mm${isCustom ? " · custom" : ""}` : "—";
