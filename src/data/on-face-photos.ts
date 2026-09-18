// Real on-face photography of the founder wearing Woolet 007 / 009.
// Self-hosted WebP (src/assets/on-face) - Vite fingerprints them into /assets/*
// so they are served from woolet.co with a 1-year immutable cache.
// Originals (JPG): github.com/Lancelotek/woolet-marketing/real-fit-marek/on-face

import b007Black from "@/assets/on-face/woolet-007-round-panto-black-on-face-01-3x4-1200x1600.webp";
import b007Havana from "@/assets/on-face/woolet-007-round-panto-havana-on-face-01-3x4-1200x1600.webp";
import b007Crystal from "@/assets/on-face/woolet-007-round-panto-silver-clear-on-face-01-3x4-1200x1600.webp";
import b009Black from "@/assets/on-face/woolet-009-soft-square-black-on-face-01-3x4-1200x1600.webp";
import b009Havana from "@/assets/on-face/woolet-009-soft-square-havana-on-face-01-3x4-1200x1600.webp";
import b009Crystal from "@/assets/on-face/woolet-009-soft-square-silver-clear-on-face-04-3x4-1200x1600.webp";
import card007 from "@/assets/on-face/woolet-007-round-panto-havana-on-face-01-1x1-1000.webp";
import card009 from "@/assets/on-face/woolet-009-soft-square-silver-clear-on-face-04-1x1-1000.webp";

export type OnFaceModel = "007" | "009";

/** Colour ids used by the PDP swatches */
export type OnFaceColourId = "black" | "havana" | "crystal";

export type OnFaceSlide = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const modelLabel: Record<OnFaceModel, string> = {
  "007": "Woolet 007 Round / Panto",
  "009": "Woolet 009 Soft Square",
};

const colourLabel: Record<OnFaceColourId, string> = {
  black: "Black",
  havana: "Havana",
  crystal: "Silver Clear",
};

/** One on-face slide per model + colour, for the PDP gallery (natural 3:4). */
export const galleryOnFace: Record<OnFaceModel, Record<OnFaceColourId, OnFaceSlide>> = {
  "007": {
    black: slide("007", "black", b007Black),
    havana: slide("007", "havana", b007Havana),
    crystal: slide("007", "crystal", b007Crystal),
  },
  "009": {
    black: slide("009", "black", b009Black),
    havana: slide("009", "havana", b009Havana),
    crystal: slide("009", "crystal", b009Crystal),
  },
};

function slide(model: OnFaceModel, colour: OnFaceColourId, src: string): OnFaceSlide {
  return {
    src,
    width: 1200,
    height: 1600,
    alt: `${modelLabel[model]} in ${colourLabel[colour]} worn on a 158 mm wide face - real fit, front view`,
  };
}

/** Home page shape cards (square 1:1, hover reveal) */
export const homeOnFaceCard: Record<OnFaceModel, string> = {
  "007": card007,
  "009": card009,
};
