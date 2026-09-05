// Real on-face photography of the founder wearing Woolet 007 / 009.
// Hosted on GitHub raw - referenced by URL, never re-hosted or renamed.

export const ON_FACE_BASE =
  "https://raw.githubusercontent.com/Lancelotek/woolet-marketing/main/real-fit-marek/on-face/";

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
    black: slide("007", "black", "woolet-007-round-panto-black-on-face-01"),
    havana: slide("007", "havana", "woolet-007-round-panto-havana-on-face-01"),
    crystal: slide("007", "crystal", "woolet-007-round-panto-silver-clear-on-face-01"),
  },
  "009": {
    black: slide("009", "black", "woolet-009-soft-square-black-on-face-01"),
    havana: slide("009", "havana", "woolet-009-soft-square-havana-on-face-01"),
    crystal: slide("009", "crystal", "woolet-009-soft-square-silver-clear-on-face-04"),
  },
};

function slide(model: OnFaceModel, colour: OnFaceColourId, name: string): OnFaceSlide {
  return {
    src: `${ON_FACE_BASE}${name}-3x4-1500x2000.jpg`,
    width: 1500,
    height: 2000,
    alt: `${modelLabel[model]} in ${colourLabel[colour]} worn on a 158 mm wide face - real fit, front view`,
  };
}

/** Home page shape cards (square 1:1, hover reveal) */
export const homeOnFaceCard: Record<OnFaceModel, string> = {
  "007": `${ON_FACE_BASE}woolet-007-round-panto-havana-on-face-01-1x1-1200.jpg`,
  "009": `${ON_FACE_BASE}woolet-009-soft-square-silver-clear-on-face-04-1x1-1200.jpg`,
};
