// Catalogue of 25 Woolet bespoke frames. Images hosted as Lovable assets.
import wr03 from "@/assets/frames/wr-03.jpg.asset.json";
import wr05 from "@/assets/frames/wr-05.jpg.asset.json";
import wr07 from "@/assets/frames/wr-07.jpg.asset.json";
import wr13 from "@/assets/frames/wr-13.jpg.asset.json";
import wr15 from "@/assets/frames/wr-15.jpg.asset.json";
import wr17 from "@/assets/frames/wr-17.jpg.asset.json";
import wr19 from "@/assets/frames/wr-19.jpg.asset.json";
import wr20 from "@/assets/frames/wr-20.jpg.asset.json";
import wr21 from "@/assets/frames/wr-21.jpg.asset.json";
import wr22 from "@/assets/frames/wr-22.jpg.asset.json";
import wr24 from "@/assets/frames/wr-24.jpg.asset.json";
import wr25 from "@/assets/frames/wr-25.jpg.asset.json";
import wr26 from "@/assets/frames/wr-26.jpg.asset.json";
import wr27 from "@/assets/frames/wr-27.jpg.asset.json";
import wr29 from "@/assets/frames/wr-29.jpg.asset.json";
import wr30 from "@/assets/frames/wr-30.jpg.asset.json";
import wr31 from "@/assets/frames/wr-31.jpg.asset.json";
import wr32 from "@/assets/frames/wr-32.jpg.asset.json";
import wr34 from "@/assets/frames/wr-34.jpg.asset.json";
import wr35 from "@/assets/frames/wr-35.jpg.asset.json";
import wr36 from "@/assets/frames/wr-36.jpg.asset.json";
import wr37 from "@/assets/frames/wr-37.jpg.asset.json";
import wr38 from "@/assets/frames/wr-38.jpg.asset.json";
import wr39 from "@/assets/frames/wr-39.jpg.asset.json";
import wr40 from "@/assets/frames/wr-40.jpg.asset.json";

export type FrameShape =
  | "Square"
  | "Round"
  | "Cat-eye"
  | "Panto"
  | "Rectangular"
  | "Aviator"
  | "Geometric"
  | "Browline"
  | "Hexagonal"
  | "Oval"
  | "Tear-drop"
  | "Octagonal";

export interface Frame {
  id: string;
  name: string;
  shape: FrameShape;
  url: string;
  basePriceEur: number;
  /** Total frame front width in millimetres (temple to temple, lens-to-lens). */
  widthMm: number;
  /** Bridge (between-lens gap) width in millimetres. */
  bridgeMm: number;
}

const BASE = 480;

export const FRAMES: Frame[] = [
  { id: "wr-03", name: "Bold square",        shape: "Square",      url: wr03.url, basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "wr-05", name: "Keyhole round",      shape: "Round",       url: wr05.url, basePriceEur: BASE, widthMm: 161, bridgeMm: 23 },
  { id: "wr-07", name: "Soft cat-eye",       shape: "Cat-eye",     url: wr07.url, basePriceEur: BASE, widthMm: 156, bridgeMm: 21 },
  { id: "wr-13", name: "Panto round",        shape: "Panto",       url: wr13.url, basePriceEur: BASE, widthMm: 163, bridgeMm: 22 },
  { id: "wr-15", name: "Rectangular",        shape: "Rectangular", url: wr15.url, basePriceEur: BASE, widthMm: 165, bridgeMm: 22 },
  { id: "wr-17", name: "Aviator",            shape: "Aviator",     url: wr17.url, basePriceEur: BASE, widthMm: 168, bridgeMm: 23 },
  { id: "wr-19", name: "Geometric",          shape: "Geometric",   url: wr19.url, basePriceEur: BASE, widthMm: 159, bridgeMm: 21 },
  { id: "wr-20", name: "Round classic",      shape: "Round",       url: wr20.url, basePriceEur: BASE, widthMm: 162, bridgeMm: 22 },
  { id: "wr-21", name: "Browline",           shape: "Browline",    url: wr21.url, basePriceEur: BASE, widthMm: 166, bridgeMm: 23 },
  { id: "wr-22", name: "Oversized square",   shape: "Square",      url: wr22.url, basePriceEur: BASE, widthMm: 170, bridgeMm: 24 },
  { id: "wr-24", name: "Hexagonal",          shape: "Hexagonal",   url: wr24.url, basePriceEur: BASE, widthMm: 160, bridgeMm: 22 },
  { id: "wr-25", name: "Slim oval",          shape: "Oval",        url: wr25.url, basePriceEur: BASE, widthMm: 155, bridgeMm: 21 },
  { id: "wr-26", name: "Angular cat-eye",    shape: "Cat-eye",     url: wr26.url, basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "wr-27", name: "Round contemporary", shape: "Round",       url: wr27.url, basePriceEur: BASE, widthMm: 164, bridgeMm: 22 },
  { id: "wr-29", name: "Wide panto",         shape: "Panto",       url: wr29.url, basePriceEur: BASE, widthMm: 167, bridgeMm: 23 },
  { id: "wr-30", name: "Pillow square",      shape: "Square",      url: wr30.url, basePriceEur: BASE, widthMm: 162, bridgeMm: 22 },
  { id: "wr-31", name: "Tear-drop",          shape: "Tear-drop",   url: wr31.url, basePriceEur: BASE, widthMm: 161, bridgeMm: 22 },
  { id: "wr-32", name: "Bevelled square",    shape: "Square",      url: wr32.url, basePriceEur: BASE, widthMm: 160, bridgeMm: 22 },
  { id: "wr-34", name: "Round bold",         shape: "Round",       url: wr34.url, basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "wr-35", name: "Octagonal",          shape: "Octagonal",   url: wr35.url, basePriceEur: BASE, widthMm: 163, bridgeMm: 22 },
  { id: "wr-36", name: "Square classic",     shape: "Square",      url: wr36.url, basePriceEur: BASE, widthMm: 172, bridgeMm: 24 },
  { id: "wr-37", name: "Slim rectangle",     shape: "Rectangular", url: wr37.url, basePriceEur: BASE, widthMm: 154, bridgeMm: 21 },
  { id: "wr-38", name: "Round wire-look",    shape: "Round",       url: wr38.url, basePriceEur: BASE, widthMm: 159, bridgeMm: 21 },
  { id: "wr-39", name: "Modern cat-eye",     shape: "Cat-eye",     url: wr39.url, basePriceEur: BASE, widthMm: 156, bridgeMm: 22 },
  { id: "wr-40", name: "Bold panto",         shape: "Panto",       url: wr40.url, basePriceEur: BASE, widthMm: 169, bridgeMm: 23 },
];


export const FRAME_SHAPES: FrameShape[] = Array.from(new Set(FRAMES.map((f) => f.shape))) as FrameShape[];

export const findFrame = (id: string | null | undefined): Frame | undefined =>
  FRAMES.find((f) => f.id === id);
