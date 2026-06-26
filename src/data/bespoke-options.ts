// All non-frame configuration options + pricing.

import noirImg from "@/assets/configurator/colors/noir.jpg";
import havanaImg from "@/assets/configurator/colors/havana.jpg";
import crystalImg from "@/assets/configurator/colors/crystal.jpg";
import darkTortoiseImg from "@/assets/configurator/colors/dark-tortoise.jpg";
import forestImg from "@/assets/configurator/colors/forest.jpg";
import smokeGreyImg from "@/assets/configurator/colors/smoke-grey.jpg";
import honeyAmberImg from "@/assets/configurator/colors/honey-amber.jpg";
import bordeauxImg from "@/assets/configurator/colors/bordeaux.jpg";
import cobaltImg from "@/assets/configurator/colors/cobalt.jpg";
import ivoryImg from "@/assets/configurator/colors/ivory.jpg";

import shinyImg from "@/assets/configurator/finishes/shiny.jpg";
import matteImg from "@/assets/configurator/finishes/matte.jpg";
import brushedImg from "@/assets/configurator/finishes/brushed.jpg";

import planoImg from "@/assets/configurator/lenses/plano.jpg";
import singleVisionImg from "@/assets/configurator/lenses/single-vision.jpg";
import progressiveImg from "@/assets/configurator/lenses/progressive.jpg";
import sunTintedImg from "@/assets/configurator/lenses/sun-tinted.jpg";
import blueLightImg from "@/assets/configurator/lenses/blue-light.jpg";

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  /** Macro studio photograph of the acetate tile. */
  image: string;
}

export const COLORS: ColorSwatch[] = [
  { id: "noir",          name: "Noir",          hex: "#111111", image: noirImg },
  { id: "havana",        name: "Havana",        hex: "#5b3a1e", image: havanaImg },
  { id: "crystal",       name: "Crystal",       hex: "#e8e6df", image: crystalImg },
  { id: "dark-tortoise", name: "Dark Tortoise", hex: "#3a2412", image: darkTortoiseImg },
  { id: "forest",        name: "Forest",        hex: "#2c4030", image: forestImg },
  { id: "smoke-grey",    name: "Smoke Grey",    hex: "#6b6b6b", image: smokeGreyImg },
  { id: "honey-amber",   name: "Honey Amber",   hex: "#b7782e", image: honeyAmberImg },
  { id: "bordeaux",      name: "Bordeaux",      hex: "#5a1a22", image: bordeauxImg },
  { id: "cobalt",        name: "Cobalt",        hex: "#1f3a8a", image: cobaltImg },
  { id: "ivory",         name: "Ivory",         hex: "#efe7d6", image: ivoryImg },
];

export const FINISHES = [
  { id: "shiny",   name: "Shiny hand-polished", image: shinyImg },
  { id: "matte",   name: "Matte",               image: matteImg },
  { id: "brushed", name: "Scratched / brushed", image: brushedImg },
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
  /** Studio shot of the lens type. */
  image: string;
}

export const LENS_TYPES: LensType[] = [
  { id: "plano",         name: "Plano (no correction)",  priceEur: 0,   description: "Frame-ready, no prescription.",       image: planoImg },
  { id: "single-vision", name: "Single vision",          priceEur: 120, description: "Distance, intermediate or reading.",  image: singleVisionImg },
  { id: "progressive",   name: "Progressive",            priceEur: 280, description: "Seamless near-to-far vision.",        image: progressiveImg },
  { id: "sun-tinted",    name: "Sun / tinted",           priceEur: 90,  description: "Category 2–3 UV tint.",               image: sunTintedImg },
  { id: "blue-light",    name: "Blue-light only",        priceEur: 70,  description: "Screen filter, no correction.",       image: blueLightImg },
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
