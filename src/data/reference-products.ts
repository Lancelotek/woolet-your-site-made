/**
 * Reference product pages - /en/ref/:slug
 * Read-only product cards for creator platforms (Influee, Billo, Grin, TikTok Shop briefs).
 * No cart, no checkout. Every image is a public file under https://woolet.co/frames/.
 */

export type RefImage = { src: string; alt: string; caption: string };

export type RefProduct = {
  slug: string;
  model: "007" | "009" | "003" | "bespoke" | "box";
  name: string;            // "Woolet 007 Round / Panto - Black"
  shortName: string;       // "007 Round / Panto"
  colour: string;          // "Black"
  colourDot: string;       // swatch hex
  priceUsd: number;        // frame with demo lens
  priceLabel?: string;     // when set, replaces the "$xxx" price row
  included?: string[];     // rendered as "In the box"
  status?: "pre-production";
  tagline: string;         // one line under the H1
  intro: string;           // colour-specific opening paragraph
  body: string[];          // paragraphs
  specs: [string, string][];
  lensOptions: { name: string; priceUsd: number; note: string }[];
  images: RefImage[];
  siblings: string[];      // other slugs of same model (colour switch)
  shopUrl?: string;
  metaTitle: string;
  metaDescription: string;
};

const F = "https://woolet.co/frames/";

const SPECS_007: [string, string][] = [
  ["Shape", "Round / Panto"],
  ["Frame width", "158 mm - fits faces 155-161 mm"],
  ["Bridge", "21 mm keyhole"],
  ["Lens", "52 x 52 mm"],
  ["Temple length", "150 mm"],
  ["Front height", "52 mm"],
  ["Material", "Italian Mazzucchelli acetate, milled in Milan"],
  ["Production", "Hand made in EU"],
];
const SPECS_009: [string, string][] = [
  ["Shape", "Soft Square"],
  ["Frame width", "158 mm - fits faces 155-161 mm"],
  ["Bridge", "22 mm keyhole"],
  ["Lens", "54 x 50 mm"],
  ["Temple length", "150 mm"],
  ["Front height", "54 mm"],
  ["Material", "Italian Mazzucchelli acetate, milled in Milan"],
  ["Production", "Hand made in EU"],
];
const SPECS_003: [string, string][] = [
  ["Shape", "Bold Round - full-circle lenses"],
  ["Frame width", "158 mm - fits faces 155-161 mm"],
  ["Bridge", "Keyhole"],
  ["Front", "Thick chunky acetate, flat wide temples"],
  ["Temple length", "150 mm"],
  ["Material", "Italian Mazzucchelli acetate, milled in Milan"],
  ["Production", "Hand made in EU"],
  ["Status", "Pre-production sample, September 2026"],
];

const LENSES_STD = [
  { name: "Demo lens (ready for your optician)", priceUsd: 190, note: "Ships with clear demo lenses, ready for prescription glazing." },
  { name: "Sunglasses UV400", priceUsd: 210, note: "Full UVA + UVB block. Polarized on request." },
  { name: "Blue light", priceUsd: 210, note: "Blue-light filter with a faint warm tint, anti-reflective coated." },
  { name: "Readers +1.00 to +3.00", priceUsd: 210, note: "Single-vision magnification to your strength." },
];

const BODY_007 = [
  "Woolet 007 Round / Panto is 158 mm across the front. Most brands build to 138-145 mm and call it one size fits most. It fits most. It never fit you.",
  "An XL version of a standard frame is scaled up from a narrow base, so the bridge and lens spacing still fight a wide face. Woolet 007 was drawn at 158 mm from scratch. The temples sit past your face instead of into it, and the 21 mm keyhole bridge rests on the sides of your nose rather than the top - which is what stops the slide.",
  "Cut by hand from Italian Mazzucchelli acetate milled in Milan, not injection-moulded. Cut acetate keeps its density and stays cool to the touch, and the colour runs through the material, so a scratch never turns white. It is also the only way to build a 158 mm front that does not flex - and a flexing front is why wide frames snap. Hand made in EU.",
  "Not sure of your number? Hold two credit cards end to end across your face, temple to temple. A card is 85.6 mm. When two cards barely span it, you are 155 mm or wider, and this is your size.",
];
const BODY_009 = [
  "Woolet 009 Soft Square is 158 mm across the front. Most brands build to 138-145 mm and call it one size fits most. It fits most. It never fit you.",
  "An XL version of a standard frame is scaled up from a narrow base, so the bridge and lens spacing still fight a wide face. Woolet 009 was drawn at 158 mm from scratch. The temples sit past your face instead of into it, and the 22 mm keyhole bridge rests on the sides of your nose rather than the top - which is what stops the slide.",
  "Cut by hand from Italian Mazzucchelli acetate milled in Milan, not injection-moulded. Cut acetate keeps its density and stays cool to the touch, and the colour runs through the material, so a scratch never turns white. It is also the only way to build a 158 mm front that does not flex - and a flexing front is why wide frames snap. Hand made in EU.",
  "Not sure of your number? Hold two credit cards end to end across your face, temple to temple. A card is 85.6 mm. When two cards barely span it, you are 155 mm or wider, and this is your size.",
];

const img007 = (c: string, cn: string): RefImage[] => [
  { src: `${F}woolet-007-round-panto-${c}-eyeglasses.jpg`, alt: `Woolet 007 Round / Panto ${cn} acetate glasses, front view, 158 mm`, caption: "Front" },
  { src: `${F}woolet-007-round-panto-${c}-angle-34.jpg`, alt: `Woolet 007 ${cn} three-quarter view`, caption: "Three-quarter" },
  { src: `${F}woolet-007-round-panto-${c}-detail-1.jpg`, alt: `Woolet 007 ${cn} hinge and rivet detail`, caption: "Hinge detail" },
  { src: `${F}woolet-007-round-panto-${c}-detail-2.jpg`, alt: `Woolet 007 ${cn} acetate detail`, caption: "Acetate detail" },
  { src: `${F}woolet-007-round-panto-${c}-angle-top.jpg`, alt: `Woolet 007 ${cn} top view showing 158 mm front`, caption: "Top view" },
];
const img009 = (c: string, cn: string): RefImage[] => [
  { src: `${F}woolet-009-soft-square-${c}-eyeglasses.jpg`, alt: `Woolet 009 Soft Square ${cn} acetate glasses, front view, 158 mm`, caption: "Front" },
  { src: `${F}woolet-009-soft-square-${c}-angle-34.jpg`, alt: `Woolet 009 ${cn} three-quarter view`, caption: "Three-quarter" },
  { src: `${F}woolet-009-soft-square-${c}-detail-1.jpg`, alt: `Woolet 009 ${cn} hinge and rivet detail`, caption: "Hinge detail" },
  { src: `${F}woolet-009-soft-square-${c}-detail-2.jpg`, alt: `Woolet 009 ${cn} acetate detail`, caption: "Acetate detail" },
  { src: `${F}woolet-009-soft-square-${c}-angle-top.jpg`, alt: `Woolet 009 ${cn} top view showing 158 mm front`, caption: "Top view" },
];

export const REF_PRODUCTS: RefProduct[] = [
  // ---------- 007 ----------
  {
    slug: "007-black",
    model: "007",
    name: "Woolet 007 Round / Panto - Black",
    shortName: "007 Round / Panto",
    colour: "Black",
    colourDot: "#141414",
    priceUsd: 190,
    tagline: "158 mm round panto in piano-black Italian acetate. Built for faces 155 mm and wider.",
    intro: "Black is the pair you reach for when you want the glasses to be glasses, not a statement. On a wide face it draws one clean line across the front - no pattern competing with your features, nothing to match your shirt to.",
    body: BODY_007,
    specs: SPECS_007,
    lensOptions: LENSES_STD,
    images: [
      ...img007("black", "Black"),
      { src: `${F}woolet-007-round-panto-black-eyeglasses-on-face.jpg`, alt: "Woolet 007 Black worn on a wide face", caption: "On face" },
      { src: `${F}woolet-007-round-panto-black-worn.jpg`, alt: "Woolet 007 Black worn, lifestyle", caption: "Worn" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["007-havana", "007-silver-clear"],
    shopUrl: "https://shop.woolet.co/products/woolet-007-round-panto-black",
    metaTitle: "Woolet 007 Round / Panto - Black | 158 mm acetate glasses for wide faces",
    metaDescription: "Round panto frame, 158 mm front, 21 mm keyhole bridge, hand-cut Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },
  {
    slug: "007-havana",
    model: "007",
    name: "Woolet 007 Round / Panto - Havana",
    shortName: "007 Round / Panto",
    colour: "Havana",
    colourDot: "#8B5A2B",
    priceUsd: 190,
    tagline: "158 mm round panto in warm tortoise Italian acetate. Built for faces 155 mm and wider.",
    intro: "Havana does something black cannot on a large frame: the tortoise pattern breaks up the front, so 158 mm of acetate reads as texture rather than as a slab. It also sits warmer against most skin tones - which is why people who find black too severe usually end up here. The pattern is in the block itself, not printed on, so no two frames are identical.",
    body: BODY_007,
    specs: SPECS_007,
    lensOptions: LENSES_STD,
    images: [
      ...img007("havana", "Havana"),
      { src: `${F}woolet-007-round-panto-havana-eyeglasses-on-face.jpg`, alt: "Woolet 007 Havana worn on a wide face", caption: "On face" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["007-black", "007-silver-clear"],
    shopUrl: "https://shop.woolet.co/products/woolet-007-round-panto-havana",
    metaTitle: "Woolet 007 Round / Panto - Havana | 158 mm tortoise acetate glasses",
    metaDescription: "Round panto frame in Havana tortoise, 158 mm front, 21 mm keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },
  {
    slug: "007-silver-clear",
    model: "007",
    name: "Woolet 007 Round / Panto - Silver Clear",
    shortName: "007 Round / Panto",
    colour: "Silver Clear",
    colourDot: "#E8E4DA",
    priceUsd: 190,
    tagline: "158 mm round panto in transparent Italian acetate. Same width, half the visual weight.",
    intro: "Silver Clear is for the person who needs a 158 mm frame but does not want a 158 mm frame to be the first thing anyone notices. Transparent acetate lets your skin through, so the front reads as an outline rather than a mass. You can also see the thickness of the acetate and the pins in the hinge - the construction becomes the detail.",
    body: BODY_007,
    specs: SPECS_007,
    lensOptions: LENSES_STD,
    images: [
      { src: `${F}woolet-007-round-panto-silver-clear-eyeglasses.jpg`, alt: "Woolet 007 Round / Panto Silver Clear acetate glasses, front view, 158 mm", caption: "Front" },
      { src: `${F}woolet-007-round-panto-silver-clear-angle-34.jpg`, alt: "Woolet 007 Silver Clear three-quarter view", caption: "Three-quarter" },
      { src: `${F}woolet-007-round-panto-silver-clear-detail-1.jpg`, alt: "Woolet 007 Silver Clear hinge detail", caption: "Hinge detail" },
      { src: `${F}woolet-007-round-panto-silver-clear-detail-2.jpg`, alt: "Woolet 007 Silver Clear acetate detail", caption: "Acetate detail" },
      { src: `${F}woolet-007-round-panto-silver-clear-angle-top.jpg`, alt: "Woolet 007 Silver Clear top view", caption: "Top view" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["007-black", "007-havana"],
    shopUrl: "https://shop.woolet.co/products/woolet-007-round-panto-silver-clear",
    metaTitle: "Woolet 007 Round / Panto - Silver Clear | 158 mm clear acetate glasses",
    metaDescription: "Round panto frame in transparent acetate, 158 mm front, 21 mm keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },

  // ---------- 009 ----------
  {
    slug: "009-black",
    model: "009",
    name: "Woolet 009 Soft Square - Black",
    shortName: "009 Soft Square",
    colour: "Black",
    colourDot: "#141414",
    priceUsd: 190,
    tagline: "158 mm soft square in piano-black Italian acetate. Built for faces 155 mm and wider.",
    intro: "A softened square front carries a wide face better than a round one when your jaw is strong - it echoes the line instead of arguing with it. In black, that effect is at its most direct: one clean rectangle, nothing decorative, works with everything you own.",
    body: BODY_009,
    specs: SPECS_009,
    lensOptions: LENSES_STD,
    images: [
      ...img009("black", "Black"),
      { src: `${F}woolet-009-soft-square-black-eyeglasses-on-face.jpg`, alt: "Woolet 009 Black worn on a wide face", caption: "On face" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["009-havana", "009-silver-clear"],
    shopUrl: "https://shop.woolet.co/products/woolet-009-soft-square-black",
    metaTitle: "Woolet 009 Soft Square - Black | 158 mm acetate glasses for wide faces",
    metaDescription: "Soft square frame, 158 mm front, 22 mm keyhole bridge, hand-cut Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },
  {
    slug: "009-havana",
    model: "009",
    name: "Woolet 009 Soft Square - Havana",
    shortName: "009 Soft Square",
    colour: "Havana",
    colourDot: "#8B5A2B",
    priceUsd: 190,
    tagline: "158 mm soft square in warm tortoise Italian acetate. Structure without the severity.",
    intro: "The square front is the more assertive of the two signature shapes. Havana takes the edge off it - the tortoise pattern breaks up 158 mm of acetate so the frame reads as texture rather than a block, and warms against the skin in a way black does not. When you want the structure without the severity, this is the pair.",
    body: BODY_009,
    specs: SPECS_009,
    lensOptions: LENSES_STD,
    images: [
      ...img009("havana", "Havana"),
      { src: `${F}woolet-009-soft-square-havana-eyeglasses-on-face.jpg`, alt: "Woolet 009 Havana worn on a wide face", caption: "On face" },
      { src: `${F}woolet-009-soft-square-havana-worn.jpg`, alt: "Woolet 009 Havana worn, lifestyle", caption: "Worn" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["009-black", "009-silver-clear"],
    shopUrl: "https://shop.woolet.co/products/woolet-009-soft-square-havana",
    metaTitle: "Woolet 009 Soft Square - Havana | 158 mm tortoise acetate glasses",
    metaDescription: "Soft square frame in Havana tortoise, 158 mm front, 22 mm keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },
  {
    slug: "009-silver-clear",
    model: "009",
    name: "Woolet 009 Soft Square - Silver Clear",
    shortName: "009 Soft Square",
    colour: "Silver Clear",
    colourDot: "#E8E4DA",
    priceUsd: 190,
    tagline: "158 mm soft square in transparent Italian acetate. Same width, half the presence.",
    intro: "A 158 mm square front is a lot of frame. Silver Clear is how you wear it without announcing it - transparent acetate lets your skin through, so the shape stays and the weight disappears. It is also the version where you can see how the frame is made: the thickness of the block, the pins set into the hinge.",
    body: BODY_009,
    specs: SPECS_009,
    lensOptions: LENSES_STD,
    images: [
      ...img009("silver-clear", "Silver Clear"),
      { src: `${F}woolet-009-soft-square-silver-clear-eyeglasses-on-face.jpg`, alt: "Woolet 009 Silver Clear worn on a wide face", caption: "On face" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: ["009-black", "009-havana"],
    shopUrl: "https://shop.woolet.co/products/woolet-009-soft-square-silver-clear",
    metaTitle: "Woolet 009 Soft Square - Silver Clear | 158 mm clear acetate glasses",
    metaDescription: "Soft square frame in transparent acetate, 158 mm front, 22 mm keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Reference product page.",
  },

  // ---------- 003 (new) ----------
  {
    slug: "003-black",
    model: "003",
    name: "Woolet 003 Bold Round - Black",
    shortName: "003 Bold Round",
    colour: "Black",
    colourDot: "#141414",
    priceUsd: 190,
    status: "pre-production",
    tagline: "Full-circle lenses in thick piano-black Italian acetate. The boldest shape in the range, cut at 158 mm.",
    intro: "The 003 is the statement frame. Fully circular lenses, a chunky acetate front and flat wide temples - nothing runs straight across your brow, so nothing marks the width, and the frame reads as a shape rather than a measurement. A true circle at 158 mm is a large circle, which is why almost nobody offers one above 145 mm.",
    body: [
      "Woolet 003 Bold Round is 158 mm across the front, the same signature width as the 007 and 009. The keyhole bridge rests on the sides of your nose rather than the top - which is what stops the slide - and the flat, wide temples clear a wide head before the bend.",
      "Cut by hand from Italian Mazzucchelli acetate milled in Milan, not injection-moulded. The thick front is the point: cut acetate at this depth does not flex, and the black runs through the block, so a scratch never turns white. Hand made in EU.",
      "This page shows the pre-production sample from September 2026. Final rivets, temple tips and lens height are being confirmed before the first run. Photography is a studio render of the sample.",
    ],
    specs: SPECS_003,
    lensOptions: LENSES_STD,
    images: [
      { src: `${F}woolet-003-bold-round-black-eyeglasses.jpg`, alt: "Woolet 003 Bold Round Black acetate glasses, front view, 158 mm", caption: "Front" },
      { src: `${F}woolet-003-bold-round-black-angle-34.jpg`, alt: "Woolet 003 Bold Round Black three-quarter view", caption: "Three-quarter" },
      { src: `${F}woolet-003-bold-round-black-studio-front.jpg`, alt: "Woolet 003 Bold Round Black on light studio background", caption: "Studio" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: [],
    metaTitle: "Woolet 003 Bold Round - Black | 158 mm full-round acetate glasses",
    metaDescription: "Bold full-circle frame in thick piano-black Italian Mazzucchelli acetate, 158 mm front, keyhole bridge, hand made in EU. Pre-production reference page.",
  },

  // ---------- Bespoke ----------
  {
    slug: "bespoke",
    model: "bespoke",
    name: "Woolet Bespoke - Made to Your Measurements",
    shortName: "Bespoke",
    colour: "Any Mazzucchelli colour",
    colourDot: "#CAA449",
    priceUsd: 480,
    tagline: "Four shapes, 60 colour and size combinations, any width 145-172 mm. Hand made in Greece. Lenses included.",
    intro: "The signature frames are 158 mm and fit faces from 155 to 161 mm. When you sit outside that - narrower, or wider than 161 - this is the one built to your numbers instead of to a size chart. An AI-Fit measurement reads your temple-to-temple width, bridge and temple length, and the frame is cut to those figures.",
    body: [
      "Crown Panto - a straight brow line gives you the structure of a rectangle across the top, then the lens curves away underneath. On a wide face with a strong jaw it is the most reliable shape in the range. This is the silhouette the Woolet 007 is drawn from.",
      "Round - fully circular lenses, a keyhole bridge, no horizontal line anywhere. Because nothing runs straight across your brow, nothing marks the width.",
      "Rectangle - a heavy flat brow and tall squared lens openings. The least apologetic option: it does not soften the width, it frames it.",
      "Aviator - the double bridge draws a horizontal line across the top of your face, and a wide face reads that line as balance rather than width. Cut in acetate, not wire.",
      "Every frame is cut by hand from Italian Mazzucchelli acetate in Greece. Production time: 2 weeks from order to shipping. Bespoke frames are cut to your individual measurements, so they are non-returnable except in the case of a manufacturing defect.",
    ],
    specs: [
      ["Shapes", "Crown Panto, Round, Rectangle, Aviator"],
      ["Width", "Any width 145-172 mm, built to measure"],
      ["Colours", "Full Mazzucchelli range - 60 colour and size combinations"],
      ["Lenses", "Reading, sun UV400, blue light or photochromic - included"],
      ["Measurement", "AI-Fit scan from your phone camera"],
      ["Material", "Italian Mazzucchelli acetate, milled in Milan"],
      ["Production", "Hand made in Greece"],
      ["Lead time", "2 weeks from order to shipping"],
    ],
    lensOptions: [
      { name: "Reading", priceUsd: 480, note: "Single-vision magnification to your strength. Included." },
      { name: "Sun UV400", priceUsd: 480, note: "Full UVA and UVB block. Included." },
      { name: "Blue light", priceUsd: 480, note: "Filtering with a faint warm tint, anti-reflective coated. Included." },
      { name: "Photochromic", priceUsd: 480, note: "Clear indoors, darkens in sunlight. Included." },
    ],
    images: [
      { src: `${F}woolet-bespoke-shape-crown-panto-black.jpg`, alt: "Woolet Bespoke Crown Panto shape in black acetate", caption: "Crown Panto" },
      { src: `${F}woolet-bespoke-shape-round-black.jpg`, alt: "Woolet Bespoke Round shape in black acetate", caption: "Round" },
      { src: `${F}woolet-bespoke-shape-rectangle-black.jpg`, alt: "Woolet Bespoke Rectangle shape in black acetate", caption: "Rectangle" },
      { src: `${F}woolet-bespoke-shape-aviator-black.jpg`, alt: "Woolet Bespoke Aviator shape in black acetate", caption: "Aviator" },
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box with felt pouch and microfiber pouch - included with every pair", caption: "In the box" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine - included with every pair", caption: "The box" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Woolet charcoal felt pouch with the yellow w - included with every pair", caption: "Felt pouch" },
    ],
    included: ["Rigid magnetic gift box, 180 x 80 x 55 mm ($45 value)", "Charcoal felt pouch with the yellow w", "Microfiber cleaning pouch on a clip"],
    siblings: [],
    shopUrl: "https://shop.woolet.co/products/woolet-bespoke-custom-fit-eyewear",
    metaTitle: "Woolet Bespoke - Made-to-measure acetate glasses, 145-172 mm",
    metaDescription: "Four shapes, any width 145-172 mm, Italian Mazzucchelli acetate, hand made in Greece, lenses included at $480. Reference product page.",
  },
  // ---------- The Box ----------
  {
    slug: "the-box",
    model: "box",
    name: "The Woolet Box",
    shortName: "The Box",
    colour: "Soft-touch black · gold foil",
    colourDot: "#080807",
    priceUsd: 45,
    priceLabel: "Included with every pair · $45 value",
    tagline: "A rigid magnetic gift box, 180 x 80 x 55 mm. Hand made in EU. Ships with every Woolet frame.",
    intro: "Every Woolet ships in a rigid, matte-black gift box - a gold-foil w on the lid, HAND MADE IN EU underneath it, and the number this whole brand is built around printed on the spine: 158 MM. Open the magnetic lid and the inside reads MADE FOR WIDE FACES. Inside: a charcoal felt pouch with the yellow w for the frames, and a small microfiber cleaning pouch on a clip.",
    body: [
      "It is a $45 box, and it costs nothing extra. Not an upsell, not an add-on - it is in every order, from the 158 mm frames to Bespoke.",
      "Rigid FSC-certified board, soft-touch black, no plastic laminate, soy inks. The single gold w is hot-stamped on the lid, with HAND MADE IN EU under the wordmark. WOOLET and 158 MM run along the spine. The inside of the lid is black too, with MADE FOR WIDE FACES and woolet.co printed in cream.",
      "The box is designed to be kept - a place to leave your frames at the end of the day, not something to throw away on the first. For creators: the box is the unboxing. Film the lid opening, the number on the spine, the pouch coming out.",
    ],
    specs: [
      ["Dimensions", "180 x 80 x 55 mm"],
      ["Shell", "Rigid FSC-certified board, soft-touch black"],
      ["Closure", "Magnetic lid"],
      ["Mark", "Gold foil, hot-stamped w on the lid"],
      ["Spine", "WOOLET · 158 MM"],
      ["Inside lid", "MADE FOR WIDE FACES · woolet.co, printed in cream on black"],
      ["Production", "Hand made in EU"],
      ["Availability", "Included with every pair - not sold separately"],
    ],
    lensOptions: [],
    included: ["Charcoal felt pouch with the yellow w - holds the frames", "Microfiber cleaning pouch on a clip, yellow w", "Rigid magnetic box, 180 x 80 x 55 mm"],
    images: [
      { src: `${F}woolet-box-open-frames-cloth.jpg`, alt: "Woolet gift box open - felt pouch and microfiber pouch inside, MADE FOR WIDE FACES on the lid", caption: "Open" },
      { src: `${F}woolet-box-render-closed.jpg`, alt: "Woolet gift box closed - gold w, WOOLET, HAND MADE IN EU on the lid, 158 MM on the spine", caption: "Closed" },
      { src: `${F}woolet-felt-pouch.jpg`, alt: "Two Woolet charcoal felt pouches with the yellow w, frames inside", caption: "Felt pouch" },
      { src: "https://woolet.co/box/woolet-box-3D-closed.png", alt: "Woolet gift box 3D render, closed", caption: "3D render" },
    ],
    siblings: [],
    metaTitle: "The Woolet Box - rigid magnetic gift box, included with every pair",
    metaDescription: "Rigid matte-black gift box, 180 x 80 x 55 mm, gold-foil w, 158 MM on the spine, MADE FOR WIDE FACES inside the lid. Felt pouch and microfiber pouch inside. Hand made in EU. Reference page.",
  },
];

export const refProductBySlug = (slug: string) => REF_PRODUCTS.find((p) => p.slug === slug);
