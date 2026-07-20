/**
 * XXL / Wide-Face hub cluster (Phase 4).
 *
 * Positioning vs existing collections (anti-cannibalization):
 *  - /collections/wide-face-glasses    → general wide-face (155–161 mm).
 *  - /collections/extra-wide-glasses   → extra-wide category page.
 *  - /collections/glasses-for-big-heads→ general big-head (58–62 cm).
 *  - /xxl (this cluster)               → XXL as a SIZE LABEL: the top
 *      of Woolet's bespoke range — 160–162 mm fronts, 62–64 cm heads,
 *      148–155 mm temples. Targets "XXL glasses" / "size XXL" queries
 *      that the generic collections do NOT rank for.
 *
 * Each spoke page keeps its OWN canonical, its own H1, and links up to
 * the hub. No spoke duplicates the hub's copy. Cross-links point to the
 * generic collections as related, not as canonical alternatives.
 */

export interface XxlFAQ { q: string; a: string; }

export interface XxlEntry {
  slug: string;               // "glasses" | "sunglasses" | "for-big-heads" | "extra-wide-frames"
  h1: string;
  eyebrow: string;
  subhead: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  spec: { label: string; value: string }[];
  faq: XxlFAQ[];
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  related: { label: string; to: string; note: string }[];
}

export const XXL_HUB = {
  slug: "",
  h1: "XXL Eyewear — Sized for the Widest 5% of Faces",
  eyebrow: "XXL Sizing Hub",
  subhead:
    "Woolet's XXL tier: 160–162 mm fronts, 148–155 mm temples, 21–24 mm bridges. Built for faces 160 mm+ and heads 62–64 cm — where mainstream stops.",
  metaTitle: "XXL Glasses & Sunglasses for Wide Faces | Sizing Hub — Woolet",
  metaDescription:
    "XXL eyewear for the widest 5% of faces (160 mm+) and largest heads (62–64 cm). Italian Mazzucchelli acetate, hand made in EU. Signature 158 mm · Bespoke to 162 mm.",
  intro:
    "XXL isn't a marketing label at Woolet — it's the top of our bespoke range. Signature runs 158 mm; XXL bespoke goes to 162 mm with 148–155 mm temples and 21–24 mm bridges. Same Italian Mazzucchelli acetate, hand made in EU, matched to your measurements from an AI scan or manual sizing.",
  spec: [
    { label: "Front width", value: "160–162 mm (bespoke)" },
    { label: "Temple length", value: "148–155 mm (bespoke)" },
    { label: "Bridge", value: "21–24 mm keyhole (bespoke)" },
    { label: "Head circumference", value: "62–64 cm" },
    { label: "Material", value: "Italian Mazzucchelli acetate" },
    { label: "Hinges", value: "5-barrel PVD Gunmetal" },
  ],
  spokes: [
    { slug: "glasses", label: "XXL Glasses", desc: "Optical XXL frames for 160 mm+ faces." },
    { slug: "sunglasses", label: "XXL Sunglasses", desc: "Oversized sunglasses in bespoke XXL sizing." },
    { slug: "for-big-heads", label: "XXL for Big Heads", desc: "62–64 cm head circumference — the XXL tier." },
    { slug: "extra-wide-frames", label: "Extra-Wide Frames", desc: "160–162 mm front — the XXL front-width range." },
  ],
};

export const XXL_PAGES: XxlEntry[] = [
  {
    slug: "glasses",
    eyebrow: "XXL Optical",
    h1: "XXL Glasses — Optical Frames for the Widest 5% of Faces",
    subhead:
      "160–162 mm fronts, 148–155 mm temples, 21–24 mm bridges. Bespoke Italian acetate, sized past mainstream XL.",
    metaTitle: "XXL Glasses for Wide Faces & Big Heads (160–162 mm) — Woolet",
    metaDescription:
      "XXL optical glasses in Italian Mazzucchelli acetate. Bespoke 160–162 mm front, 148–155 mm temples. For faces 160 mm+ and heads 62–64 cm.",
    intro:
      "XXL optical glasses are the top of our bespoke range. Signature 158 mm covers most wide faces; XXL adds 2–4 mm of front width and 2–7 mm of temple length for faces that end up on the edges of even our signature range. Same Italian Mazzucchelli acetate, same 5-barrel PVD Gunmetal hinges, cut to your measurements.",
    spec: [
      { label: "Front width", value: "160–162 mm" },
      { label: "Lens", value: "52 × 52 mm (007) or 54 × 50 mm (009)" },
      { label: "Temple", value: "148–155 mm at 11° bend" },
      { label: "Bridge", value: "21–24 mm keyhole" },
      { label: "Best for face width", value: "160–162 mm" },
      { label: "Best for head circumference", value: "62–64 cm" },
    ],
    faq: [
      { q: "What size is XXL glasses?", a: "For Woolet, XXL = 160–162 mm front width. Mainstream 'XL' tops out around 148–150 mm; XXL starts where XL ends." },
      { q: "How do XXL glasses differ from XL?", a: "Both front width and temple length step up. XL for wide faces is ~155–158 mm; XXL is 160–162 mm with 150–155 mm temples for heads 62 cm and above." },
      { q: "Is XXL only available bespoke?", a: "Yes. Signature runs 158 mm. XXL (160–162 mm) is bespoke — same Italian Mazzucchelli acetate, matched to your scan or manual measurement." },
    ],
    primaryCta: { label: "Start XXL bespoke", to: "/en/fit/bespoke" },
    secondaryCta: { label: "Measure with FitLens", to: "/en/fit" },
    related: [
      { label: "158 mm signature glasses", to: "/en/size/158mm", note: "One size below XXL." },
      { label: "162 mm bespoke frames", to: "/en/size/162mm", note: "XXL front-width ceiling." },
      { label: "155 mm bespoke temples", to: "/en/temple/155mm", note: "Longest arm we build." },
      { label: "24 mm bridge glasses", to: "/en/bridge/24mm", note: "Widest keyhole bridge." },
    ],
  },
  {
    slug: "sunglasses",
    eyebrow: "XXL Sunglasses",
    h1: "XXL Sunglasses — Bespoke Oversized for Wide Faces",
    subhead:
      "The 007 and 009 shapes in bespoke 160–162 mm with UV400 or polarised lenses. Sized past mainstream oversized.",
    metaTitle: "XXL Sunglasses for Wide Faces (160–162 mm Bespoke) — Woolet",
    metaDescription:
      "XXL sunglasses in Italian Mazzucchelli acetate, bespoke 160–162 mm. UV400 and polarised options. For 160 mm+ faces and 62–64 cm heads.",
    intro:
      "XXL sunglasses take the signature 007 round and 009 soft-square shapes into bespoke sizing — 160–162 mm across the front, 148–155 mm temples, 21–24 mm bridges. UV400 standard, polarised optional. Frame geometry stays balanced because temples and bridge scale with the front, not just the lens.",
    spec: [
      { label: "Front width", value: "160–162 mm" },
      { label: "Lens", value: "UV400 · optional polarised" },
      { label: "Shapes", value: "007 Round · 009 Soft Square" },
      { label: "Temple", value: "148–155 mm at 11° bend" },
      { label: "Bridge", value: "21–24 mm keyhole" },
      { label: "Best for face width", value: "160–162 mm" },
    ],
    faq: [
      { q: "Are XXL sunglasses the same as oversized?", a: "Not quite. Mainstream 'oversized' means a larger lens on a standard front. XXL means the entire frame — front, bridge, temples — scales up together, so it fits a wider face without sliding." },
      { q: "Can I get polarised in XXL bespoke?", a: "Yes. Polarised is an option on any bespoke sunglass build with no upcharge to the frame width." },
      { q: "How long is XXL sunglasses production?", a: "Bespoke lead time applies — 5–7 weeks from measurement to ship, same as any bespoke frame." },
    ],
    primaryCta: { label: "Start XXL bespoke", to: "/en/fit/bespoke" },
    secondaryCta: { label: "Explore signature sunglasses", to: "/en/collections/italian-acetate-sunglasses" },
    related: [
      { label: "Oversized sunglasses (signature)", to: "/en/collections/oversized-sunglasses-men", note: "158 mm signature line." },
      { label: "Sunglasses for big heads", to: "/en/collections/sunglasses-for-big-heads", note: "General big-head category." },
      { label: "160 mm sunglasses", to: "/en/size/160mm", note: "Dead centre of XXL front-width." },
    ],
  },
  {
    slug: "for-big-heads",
    eyebrow: "XXL for Big Heads",
    h1: "XXL Glasses for Big Heads — 62–64 cm Head Circumference",
    subhead:
      "The tier above 'big head' — for 62–64 cm circumferences where mainstream even in XL stops fitting.",
    metaTitle: "XXL Glasses for Big Heads (62–64 cm) — Bespoke Fit — Woolet",
    metaDescription:
      "XXL glasses for big heads 62–64 cm circumference. Bespoke 160–162 mm front, 150–155 mm temples. Italian Mazzucchelli acetate, hand made in EU.",
    intro:
      "Head circumference and face width are different measurements. A 160 mm face on a 62–64 cm head needs both a wider front AND longer temples — that's the XXL tier. Signature 148 mm temples end in front of the ear on a 63 cm head; XXL bespoke moves them to 150–155 mm so the tip hooks behind the ear cleanly.",
    spec: [
      { label: "Head circumference", value: "62–64 cm" },
      { label: "Front width", value: "160–162 mm bespoke" },
      { label: "Temple", value: "150–155 mm at 11° bend" },
      { label: "Bridge", value: "21–24 mm keyhole" },
      { label: "Hat size (US)", value: "7 ¾ – 8" },
      { label: "Hinges", value: "5-barrel PVD Gunmetal" },
    ],
    faq: [
      { q: "What glasses fit a 63 cm head?", a: "You need 150+ mm temples and a 160+ mm front. Mainstream tops out around 148 mm temples on a 148 mm front — the arms overshoot before they reach the ear." },
      { q: "Is head circumference the same as face width?", a: "No. Face width is temple-to-temple across the front; circumference wraps the whole head. A wide face doesn't always mean a large head, and vice versa — but XXL usually needs both." },
      { q: "How do I measure my head circumference?", a: "Wrap a soft tape just above the ears, across the forehead. Use the hat-size calculator to convert to US/EU hat sizes." },
    ],
    primaryCta: { label: "Start XXL bespoke", to: "/en/fit/bespoke" },
    secondaryCta: { label: "Hat size calculator", to: "/en/hat-size-calculator" },
    related: [
      { label: "Glasses for big heads (general)", to: "/en/collections/glasses-for-big-heads", note: "58–62 cm — one tier below XXL." },
      { label: "150 mm temples", to: "/en/temple/150mm", note: "Start of XXL temple range." },
      { label: "155 mm temples", to: "/en/temple/155mm", note: "XXL temple ceiling." },
    ],
  },
  {
    slug: "extra-wide-frames",
    eyebrow: "XXL Front Width",
    h1: "Extra-Wide Frames — 160–162 mm XXL Front",
    subhead:
      "The widest fronts Woolet builds. Bespoke 160–162 mm, matched with bespoke bridge and temples so the whole frame scales together.",
    metaTitle: "Extra-Wide Frames 160–162 mm — XXL Bespoke — Woolet",
    metaDescription:
      "Extra-wide 160–162 mm bespoke frames in Italian Mazzucchelli acetate. XXL front width for faces at the top of the wide-face range.",
    intro:
      "160 mm is dead centre of Woolet's XXL bespoke range; 162 mm is the ceiling. Above 162 mm the frame stops being structurally sound — we don't build wider. Below 160 mm signature 158 mm usually fits, so XXL is specifically for 160–162 mm faces that measurably exceed signature.",
    spec: [
      { label: "Front width range", value: "160–162 mm" },
      { label: "Signature reference", value: "158 mm (2–4 mm below XXL)" },
      { label: "Absolute maximum", value: "162 mm — we don't build wider" },
      { label: "Bridge", value: "21–24 mm keyhole (bespoke)" },
      { label: "Temple", value: "148–155 mm (bespoke)" },
      { label: "Best for face width", value: "160–162 mm measured" },
    ],
    faq: [
      { q: "What's the widest glasses front you make?", a: "162 mm bespoke. Above that, the front becomes unstable on our hinge geometry — we honestly don't build it." },
      { q: "Is 160 mm the same as extra-wide?", a: "In our terms, 160 mm is XXL. 'Extra-wide' collections typically span 155–160 mm; XXL is the 160–162 mm slice at the top." },
      { q: "Do I need XXL or is 158 mm signature enough?", a: "FitLens or manual measurement decides. If your face measures 158–160 mm, signature works. Only measured 160 mm+ needs XXL bespoke." },
    ],
    primaryCta: { label: "Start XXL bespoke", to: "/en/fit/bespoke" },
    secondaryCta: { label: "Measure with FitLens", to: "/en/fit" },
    related: [
      { label: "Extra-wide glasses (155–160 mm)", to: "/en/collections/extra-wide-glasses", note: "One tier below XXL." },
      { label: "162 mm bespoke", to: "/en/size/162mm", note: "XXL front-width ceiling." },
      { label: "160 mm bespoke", to: "/en/size/160mm", note: "XXL centre." },
      { label: "165 mm — out of range", to: "/en/size/165mm", note: "Above the ceiling — honest verdict." },
    ],
  },
];

export function getXxlBySlug(slug: string): XxlEntry | undefined {
  return XXL_PAGES.find((x) => x.slug === slug);
}
