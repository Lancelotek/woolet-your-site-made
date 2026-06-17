// All non-frame configuration options + pricing.

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
}

export const COLORS: ColorSwatch[] = [
  { id: "noir",          name: "Noir",          hex: "#111111" },
  { id: "havana",        name: "Havana",        hex: "#5b3a1e" },
  { id: "crystal",       name: "Crystal",       hex: "#e8e6df" },
  { id: "dark-tortoise", name: "Dark Tortoise", hex: "#3a2412" },
  { id: "forest",        name: "Forest",        hex: "#2c4030" },
  { id: "smoke-grey",    name: "Smoke Grey",    hex: "#6b6b6b" },
  { id: "honey-amber",   name: "Honey Amber",   hex: "#b7782e" },
  { id: "bordeaux",      name: "Bordeaux",      hex: "#5a1a22" },
  { id: "cobalt",        name: "Cobalt",        hex: "#1f3a8a" },
  { id: "ivory",         name: "Ivory",         hex: "#efe7d6" },
];

export const FINISHES = [
  { id: "shiny",   name: "Shiny hand-polished" },
  { id: "matte",   name: "Matte" },
  { id: "brushed", name: "Scratched / brushed" },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

export const ENGRAVING_FEE_EUR = 45;
export const ENGRAVING_MAX_CHARS = 20;
export const ENGRAVING_POSITIONS = [
  { id: "inner-left",  name: "Inner left temple" },
  { id: "inner-right", name: "Inner right temple" },
  { id: "both",        name: "Both temples" },
  { id: "bridge",      name: "Bridge" },
] as const;
export const ENGRAVING_FONTS = [
  { id: "serif",  name: "Serif" },
  { id: "sans",   name: "Sans" },
  { id: "script", name: "Script" },
  { id: "mono",   name: "Mono" },
] as const;

export interface LensType {
  id: string;
  name: string;
  priceEur: number;
  description: string;
}

export const LENS_TYPES: LensType[] = [
  { id: "plano",         name: "Plano (no correction)",  priceEur: 0,   description: "Frame-ready, no prescription." },
  { id: "single-vision", name: "Single vision",          priceEur: 120, description: "Distance, intermediate or reading." },
  { id: "progressive",   name: "Progressive",            priceEur: 280, description: "Seamless near-to-far vision." },
  { id: "sun-tinted",    name: "Sun / tinted",           priceEur: 90,  description: "Category 2–3 UV tint." },
  { id: "blue-light",    name: "Blue-light only",        priceEur: 70,  description: "Screen filter, no correction." },
];

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
