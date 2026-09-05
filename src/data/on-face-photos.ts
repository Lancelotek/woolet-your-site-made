// Real on-face photography of the founder wearing Woolet 007 / 009.
// Hosted on GitHub raw - referenced by URL, never re-hosted or renamed.

export const ON_FACE_BASE =
  "https://raw.githubusercontent.com/Lancelotek/woolet-marketing/main/real-fit-marek/on-face/";

export type OnFacePhoto = {
  /** File stem, without format suffix */
  name: string;
  /** Portrait 1500x2000 */
  portrait: string;
  /** Square 1200x1200 */
  square: string;
  /** Short view label, e.g. "front view" */
  view: string;
  alt: string;
};

export type OnFaceModel = "007" | "009";
/** Colour ids used by the PDP swatches */
export type OnFaceColourId = "black" | "havana" | "crystal";

const modelSlug: Record<OnFaceModel, string> = {
  "007": "woolet-007-round-panto",
  "009": "woolet-009-soft-square",
};

const modelLabel: Record<OnFaceModel, string> = {
  "007": "Woolet 007 Round / Panto",
  "009": "Woolet 009 Soft Square",
};

const colourSlug: Record<OnFaceColourId, string> = {
  black: "black",
  havana: "havana",
  crystal: "silver-clear",
};

const colourLabel: Record<OnFaceColourId, string> = {
  black: "Black",
  havana: "Havana",
  crystal: "Silver Clear",
};

/** Index -> view label, per model + colour */
const views: Record<OnFaceModel, Record<OnFaceColourId, string[]>> = {
  "007": {
    black: ["front view", "front view, closer"],
    havana: ["front view", "three-quarter view"],
    crystal: ["front view", "side angle", "three-quarter view, smiling"],
  },
  "009": {
    black: ["front view"],
    havana: ["front view, smiling", "three-quarter view"],
    crystal: [
      "front view, indoors",
      "three-quarter view, indoors",
      "side view, indoors",
      "front view, outdoors",
      "front view, outdoors",
      "front view, outdoors",
    ],
  },
};

function build(model: OnFaceModel, colour: OnFaceColourId): OnFacePhoto[] {
  return views[model][colour].map((view, i) => {
    const name = `${modelSlug[model]}-${colourSlug[colour]}-on-face-0${i + 1}`;
    return {
      name,
      portrait: `${ON_FACE_BASE}${name}-3x4-1500x2000.jpg`,
      square: `${ON_FACE_BASE}${name}-1x1-1200.jpg`,
      view,
      alt: `${modelLabel[model]} in ${colourLabel[colour]} worn on a 158 mm wide face - real fit, ${view}`,
    };
  });
}

export const onFacePhotos: Record<OnFaceModel, Record<OnFaceColourId, OnFacePhoto[]>> = {
  "007": { black: build("007", "black"), havana: build("007", "havana"), crystal: build("007", "crystal") },
  "009": { black: build("009", "black"), havana: build("009", "havana"), crystal: build("009", "crystal") },
};

export function onFaceFor(model: OnFaceModel, colourId: string): OnFacePhoto[] {
  return onFacePhotos[model][colourId as OnFaceColourId] ?? [];
}

/** Square preview per colour, for swatch pickers */
export function onFaceSwatchPreviews(model: OnFaceModel): Record<string, string> {
  return {
    black: onFacePhotos[model].black[0].square,
    havana: onFacePhotos[model].havana[0].square,
    crystal: onFacePhotos[model].crystal[0].square,
  };
}

/** Home page shape cards */
export const homeOnFaceCard: Record<OnFaceModel, string> = {
  "007": `${ON_FACE_BASE}woolet-007-round-panto-havana-on-face-01-1x1-1200.jpg`,
  "009": `${ON_FACE_BASE}woolet-009-soft-square-silver-clear-on-face-04-1x1-1200.jpg`,
};
