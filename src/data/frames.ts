// Bespoke frame templates. Four canonical silhouettes rendered as line-drawing
// references — the frame is cut to the buyer's measurements after payment.

import aviatorImg from "@/assets/configurator/frames/aviator.png.asset.json";
import rectangleImg from "@/assets/configurator/frames/rectangle.png.asset.json";
import crownPantoImg from "@/assets/configurator/frames/crown-panto.png.asset.json";
import roundImg from "@/assets/configurator/frames/round.png.asset.json";

export type FrameShape = "Aviator" | "Rectangle" | "Crown Panto" | "Round";

export interface Frame {
  id: string;
  name: string;
  shape: FrameShape;
  /** Silhouette artwork. */
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

const FRAMES_BASE: Omit<Frame, "gallery">[] = [
  { id: "aviator",     name: "Aviator",     shape: "Aviator",     url: aviatorImg.url,    basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "rectangle",   name: "Rectangle",   shape: "Rectangle",   url: rectangleImg.url,  basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "crown-panto", name: "Crown Panto", shape: "Crown Panto", url: crownPantoImg.url, basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
  { id: "round",       name: "Round",       shape: "Round",       url: roundImg.url,      basePriceEur: BASE, widthMm: 158, bridgeMm: 22 },
];

export const FRAMES: Frame[] = FRAMES_BASE.map((f) => ({ ...f, gallery: [f.url] }));

export const FRAME_SHAPES: FrameShape[] = Array.from(new Set(FRAMES.map((f) => f.shape))) as FrameShape[];

export const findFrame = (id: string | null | undefined): Frame | undefined =>
  FRAMES.find((f) => f.id === id);
