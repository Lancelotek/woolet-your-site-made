// Bespoke frame templates. We show four canonical silhouettes (Aviator,
// Rectangle, Crown Panto, Round) as clean line drawings — the finished frame
// is cut to the buyer's measurements after payment, so a photo would be
// misleading.

export type FrameShape = "Aviator" | "Rectangle" | "Crown Panto" | "Round";

export interface Frame {
  id: string;
  name: string;
  shape: FrameShape;
  /** Inline SVG data URL — outline template rendered anywhere an <img src=""> is used. */
  url: string;
  /** Same URL repeated so any legacy gallery viewer still works. */
  gallery: string[];
  basePriceEur: number;
  /** Reference front width in millimetres. Actual width is cut to the buyer's face. */
  widthMm: number;
  /** Reference bridge width. Cut to the buyer's nose after the scan. */
  bridgeMm: number;
}

const BASE = 480;

/* ─── SVG outline templates ─────────────────────────────────────── */

const svg = (inner: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" fill="none" stroke="#0B0A09" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`,
  )}`;

// Aviator — teardrop lenses, small keyhole notch, hockey-stick temples.
const AVIATOR_SVG = svg(`
  <path d="M60 70 C60 55 78 48 104 48 C138 48 168 58 178 72 C186 84 182 118 170 132 C158 146 132 152 110 148 C86 144 66 128 60 108 Z"/>
  <path d="M222 72 C232 58 262 48 296 48 C322 48 340 55 340 70 C334 128 314 144 290 148 C268 152 242 146 230 132 C218 118 214 84 222 72 Z"/>
  <path d="M178 72 L192 68 L196 82 L204 82 L208 68 L222 72"/>
  <path d="M60 72 L30 82"/>
  <path d="M340 72 L370 82"/>
`);

// Rectangle — soft-cornered rectangles, chunky rims, slim keyhole bridge.
const RECTANGLE_SVG = svg(`
  <path d="M46 62 h140 a10 10 0 0 1 10 10 v56 a10 10 0 0 1 -10 10 h-140 a10 10 0 0 1 -10 -10 v-56 a10 10 0 0 1 10 -10 Z"/>
  <path d="M64 78 h104 a6 6 0 0 1 6 6 v32 a6 6 0 0 1 -6 6 h-104 a6 6 0 0 1 -6 -6 v-32 a6 6 0 0 1 6 -6 Z"/>
  <path d="M214 62 h140 a10 10 0 0 1 10 10 v56 a10 10 0 0 1 -10 10 h-140 a10 10 0 0 1 -10 -10 v-56 a10 10 0 0 1 10 -10 Z"/>
  <path d="M232 78 h104 a6 6 0 0 1 6 6 v32 a6 6 0 0 1 -6 6 h-104 a6 6 0 0 1 -6 -6 v-32 a6 6 0 0 1 6 -6 Z"/>
  <path d="M196 92 h18"/>
  <path d="M36 78 l-14 -4"/>
  <path d="M364 78 l14 -4"/>
`);

// Crown Panto — rounded lens with a flat 'crown' top edge, keyhole bridge.
const CROWN_PANTO_SVG = svg(`
  <path d="M58 60 h108 a4 4 0 0 1 4 4 v18 c0 32 -26 58 -58 58 -32 0 -58 -26 -58 -58 v-18 a4 4 0 0 1 4 -4 Z"/>
  <path d="M234 60 h108 a4 4 0 0 1 4 4 v18 c0 32 -26 58 -58 58 -32 0 -58 -26 -58 -58 v-18 a4 4 0 0 1 4 -4 Z"/>
  <path d="M170 80 c4 -4 12 -6 18 -6 h24 c6 0 14 2 18 6 v10 c-6 -4 -14 -6 -22 -6 h-16 c-8 0 -16 2 -22 6 Z"/>
  <path d="M58 66 l-32 -2"/>
  <path d="M346 66 l32 -2"/>
`);

// Round — perfect circles, prominent keyhole bridge, thin straight temples.
const ROUND_SVG = svg(`
  <circle cx="120" cy="102" r="48"/>
  <circle cx="120" cy="102" r="34"/>
  <circle cx="280" cy="102" r="48"/>
  <circle cx="280" cy="102" r="34"/>
  <path d="M168 92 c6 -6 16 -8 22 -8 h20 c6 0 16 2 22 8 v14 c-6 -6 -16 -8 -22 -8 h-20 c-6 0 -16 2 -22 8 Z"/>
  <path d="M72 96 l-42 -6 v14"/>
  <path d="M328 96 l42 -6 v14"/>
`);

const FRAMES_BASE: Omit<Frame, "gallery">[] = [
  { id: "aviator",     name: "Aviator",     shape: "Aviator",     url: AVIATOR_SVG,     basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "rectangle",   name: "Rectangle",   shape: "Rectangle",   url: RECTANGLE_SVG,   basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "crown-panto", name: "Crown Panto", shape: "Crown Panto", url: CROWN_PANTO_SVG, basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "round",       name: "Round",       shape: "Round",       url: ROUND_SVG,       basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
];

export const FRAMES: Frame[] = FRAMES_BASE.map((f) => ({ ...f, gallery: [f.url] }));

export const FRAME_SHAPES: FrameShape[] = Array.from(new Set(FRAMES.map((f) => f.shape))) as FrameShape[];

export const findFrame = (id: string | null | undefined): Frame | undefined =>
  FRAMES.find((f) => f.id === id);
