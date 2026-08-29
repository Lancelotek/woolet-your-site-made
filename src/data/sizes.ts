/**
 * Numeric-width SEO landing cluster data.
 * One entry per targeted mm width. Consumed by:
 *   - SizePage component (src/components/SizePage.tsx)
 *   - metadata.ts / prerender (SEO)
 *   - sitemap.xml
 *
 * Data-accuracy rules (do not violate):
 *   - Signature 158 mm, designed fit range 155–161 mm.
 *   - Bespoke range 145–172 mm (172 mm is the maximum we build).
 *   - Widths above 161 mm are bespoke builds, not rejections.
 *   - "Hand made in EU" + material = "Mazzucchelli acetate from Milan, Italy".
 */

export type SizeVerdictKind = "below-signature" | "signature-range" | "top-of-bespoke" | "out-of-range";

export interface SizeFAQ {
  q: string;
  a: string;
}

export interface SizeEntry {
  width: number;              // mm
  slug: string;               // e.g. "158mm"
  inRange: boolean;           // true if we can make it (145–172 inclusive)
  verdictKind: SizeVerdictKind;
  h1: string;
  intro: string;
  fitVerdict: string;
  subhead: string;
  metaDescription: string;
  bespokeNote: string;
  faq: SizeFAQ[];
}

/**
 * Woolet frame specs shared by every size page's comparison table.
 * Numbers reflect the current site source of truth (product pages,
 * seo/metadata product blocks). Temple length 150 mm at 11° drop.
 */
export const FRAME_SPECS = {
  "007": {
    name: "Woolet 007 — Round",
    frameWidth: 158,
    bridge: 21,
    lensWidth: 52,
    lensHeight: 52,
    templeLength: 150,
    templeDrop: 11, // degrees
    href: "/en/products/007",
  },
  "009": {
    name: "Woolet 009 — Soft Square",
    frameWidth: 158,
    bridge: 22,
    lensWidth: 54,
    lensHeight: 50,
    templeLength: 150,
    templeDrop: 11,
    href: "/en/products/009",
  },
} as const;

export const SIZES: SizeEntry[] = [
  {
    width: 145,
    slug: "145mm",
    inRange: true,
    verdictKind: "below-signature",
    h1: "145 mm Wide Glasses — What Actually Fits a 145 mm Face",
    subhead:
      "The signature 158 mm frame is wider than you need. 145 mm sits at the bottom of our bespoke range — this is the route for you.",
    intro:
      "145 mm is roughly where mainstream “wide” models top out and where our bespoke tier begins. If your face measures 145 mm temple-to-temple, our 158 mm signature will look and feel oversized. Bespoke is the honest answer: same Italian Mazzucchelli acetate, made to your millimetre.",
    fitVerdict:
      "Our signature 158 mm runs 13 mm wider than your face — that is a full size and a half in optical terms. Bespoke starts at 145 mm; go there, not signature.",
    metaDescription:
      "145 mm wide glasses: our signature 158 mm frame is wider than you need. Bespoke starts at 145 mm — Mazzucchelli acetate, hand made in EU. Bespoke 145–172 mm.",
    bespokeNote:
      "145 mm sits at the floor of our bespoke range. Same acetate, same shapes (007 or 009), made to your measurement.",
    faq: [
      { q: "Is 145 mm considered wide for glasses?", a: "It sits at the upper edge of mainstream sizing. Most retailers stop between 142 and 148 mm and call it wide. For a 145 mm face, mainstream fits; you don’t need a 158 mm frame." },
      { q: "Should I buy Woolet at 145 mm?", a: "Only via bespoke. Our signature is 158 mm and will look oversized on a 145 mm face. Bespoke 145 mm gives you the same material and shape scaled down." },
      { q: "How long does bespoke take?", a: "Bespoke ships approximately 6 to 8 weeks after the standard pre-order batch. You receive a measurement appointment link after ordering." },
    ],
  },
  {
    width: 150,
    slug: "150mm",
    inRange: true,
    verdictKind: "below-signature",
    h1: "150 mm Wide Glasses — What Actually Fits a 150 mm Face",
    subhead:
      "8 mm narrower than our signature. Bespoke is the honest route — the same Mazzucchelli acetate, scaled to your face.",
    intro:
      "150 mm is a common measurement — wider than what mass retailers reliably stock, still narrower than our 158 mm signature. If your temple-to-temple width is 150 mm, we build to that number in bespoke rather than push you into a frame two sizes too big.",
    fitVerdict:
      "Our signature 158 mm runs 8 mm wider than your face — noticeably oversized. Bespoke starts at 145 mm; 150 mm is a comfortable middle of that range.",
    metaDescription:
      "150 mm wide glasses: signature runs wider. Bespoke 150 mm in Italian Mazzucchelli acetate, hand made in EU. Full range 145–172 mm.",
    bespokeNote:
      "150 mm falls squarely inside our bespoke range. Both shapes (007 Round, 009 Soft Square) can be scaled to 150 mm.",
    faq: [
      { q: "Are 150 mm glasses considered wide?", a: "For mainstream eyewear, yes — most retail frames top out around 145–148 mm. 150 mm is above standard sizing but below Woolet's 158 mm signature." },
      { q: "What temple length works with a 150 mm front?", a: "Our standard temple is 148 mm at an 11° drop. For a 150 mm front (bespoke), that same temple length is right for most head shapes." },
      { q: "Can I get 150 mm frames in Italian acetate?", a: "Yes — bespoke only. Same Mazzucchelli cellulose acetate from Milan, hand made in the EU." },
    ],
  },
  {
    width: 152,
    slug: "152mm",
    inRange: true,
    verdictKind: "below-signature",
    h1: "152 mm Wide Glasses — What Actually Fits a 152 mm Face",
    subhead:
      "Six millimetres under our signature. Close — but not close enough. Bespoke is the fit.",
    intro:
      "152 mm sits between mainstream extra-wide and our signature. Most brands don’t reliably build this width; the ones that do call it XL and stop. We build it in bespoke to your exact measurement, in the same acetate as the signature.",
    fitVerdict:
      "Our signature 158 mm runs 6 mm wider than your face. That is enough to look oversized and feel loose. Bespoke at 152 mm is the honest fit.",
    metaDescription:
      "152 mm wide glasses: bespoke fits, signature 158 mm runs wider. Mazzucchelli acetate, hand made in EU. Bespoke 145–172 mm.",
    bespokeNote:
      "152 mm is well inside bespoke. Same shapes, same finishing, made to your millimetre.",
    faq: [
      { q: "How do I know I'm 152 mm?", a: "Measure temple-to-temple at eye level across the widest point of your face with a ruler flat against a mirror, or use FitLens to measure from your phone camera." },
      { q: "Is 152 mm considered XL?", a: "Yes. Mainstream sizing tops out at 145–148 mm; anything above that is specialist territory. 152 mm is XL but below our signature 158 mm." },
      { q: "How much wider does 158 look on a 152 mm face?", a: "Roughly a full size oversized — visible temple overhang, frames sitting past the sides of the face. Bespoke solves that." },
    ],
  },
  {
    width: 155,
    slug: "155mm",
    inRange: true,
    verdictKind: "signature-range",
    h1: "155 mm Wide Glasses — What Actually Fits a 155 mm Face",
    subhead:
      "Bottom of our signature range. The 158 mm frame is the right fit — no bespoke needed.",
    intro:
      "155 mm is where signature starts to make sense. Our 158 mm frame is engineered for the 155–161 mm band; at 155 mm you are exactly on the lower edge of that range. Bespoke is available if you want a millimetre-exact match, but you don't need it.",
    fitVerdict:
      "Yes — 155 mm is the floor of our signature range. The 158 mm frame fits with 3 mm of easing at the temples, which is designed-in room, not slack.",
    metaDescription:
      "155 mm wide glasses: our signature 158 mm frame fits exactly. Italian Mazzucchelli acetate, hand made in EU. Bespoke 145–172 mm optional.",
    bespokeNote:
      "You don’t need bespoke at 155 mm. It’s available if you want it dead-on, but the signature 158 mm is designed for exactly this face width.",
    faq: [
      { q: "Does 158 mm fit a 155 mm face?", a: "Yes — this is exactly the range the signature 158 mm frame is built for. 3 mm of easing is the correct fit tolerance for wide frames." },
      { q: "Should I still consider bespoke?", a: "Only if you want a millimetre-exact match. At 155 mm the signature is engineered to fit; bespoke is optional." },
      { q: "Are 155 mm glasses hard to find?", a: "In mainstream retail, yes. Standard eyewear stops around 145–148 mm. 155 mm is where signature specialists start." },
    ],
  },
  {
    width: 158,
    slug: "158mm",
    inRange: true,
    verdictKind: "signature-range",
    h1: "158 mm Wide Glasses — The Signature Woolet Fit",
    subhead:
      "This is the width we build to. Not a bespoke variant. Not an upsell. Our two shapes are cut at 158 mm as the canonical fit.",
    intro:
      "158 mm is the number the whole brand is engineered around. Both signature shapes — 007 Round and 009 Soft Square — are cut at 158 mm frame width, in Italian Mazzucchelli acetate, hand made in the EU. If your face measures between 155 and 161 mm, this is your frame. If you're outside that band, bespoke covers 145 to 172 mm.",
    fitVerdict:
      "Yes — 158 mm is exactly the range the signature frame is built for. No bespoke, no upcharge, no waiting on a scan. The 007 and 009 in signature 158 mm are your fit.",
    metaDescription:
      "158 mm wide glasses: the signature Woolet fit. Two shapes in Mazzucchelli acetate, hand made in EU. Built for 155–161 mm faces. Bespoke 145–172 mm.",
    bespokeNote:
      "Bespoke is available in either shape from 145 to 172 mm, but at 158 mm you don't need it — signature is the fit.",
    faq: [
      { q: "Is 158 mm wide for glasses?", a: "Very wide by mainstream standards. Standard retail eyewear tops out around 145–148 mm. Woolet's 158 mm is a specialist size for faces in the 155–161 mm band." },
      { q: "What bridge width comes with a 158 mm front?", a: "The 007 Round uses a 21 mm keyhole bridge; the 009 Soft Square uses a 22 mm bridge. Both are shaped for weight distribution across a wider nose." },
      { q: "Are 158 mm glasses only for men?", a: "No. Frame width is face width, not gender. Women with a 155–161 mm face wear the same signature 158 mm frame." },
      { q: "What lens size comes with 158 mm frames?", a: "007 Round: 52 × 52 mm lens. 009 Soft Square: 54 × 50 mm lens. Both accept single-vision, progressive, blue-light and polarised sunglass lenses." },
      { q: "What temple length pairs with a 158 mm front?", a: "148 mm temples at an 11° drop, standard on both shapes. Bespoke can extend to 155 mm." },
    ],
  },
  {
    width: 160,
    slug: "160mm",
    inRange: true,
    verdictKind: "signature-range",
    h1: "160 mm Wide Glasses — What Actually Fits a 160 mm Face",
    subhead:
      "Comfortably inside the signature band. The 158 mm frame is built for exactly this face width.",
    intro:
      "160 mm sits in the middle of our signature range. Our 158 mm frame is engineered for the 155–161 mm band, and 160 mm is where fit is most forgiving. If you want a millimetre-exact match, bespoke goes to 162 mm — but you don't need it at 160.",
    fitVerdict:
      "Yes — 160 mm is dead centre of our signature 155–161 mm fit range. The 158 mm frame is the fit.",
    metaDescription:
      "160 mm wide glasses: our signature 158 mm fits perfectly. Italian Mazzucchelli acetate, hand made in EU. Bespoke 145–172 mm.",
    bespokeNote:
      "Optional at 160 mm. Bespoke 160 mm gives a millimetre-exact match; signature 158 mm gives a designed-in 2 mm of ease that most wearers prefer.",
    faq: [
      { q: "Are 160 mm glasses considered wide?", a: "Yes, well above mainstream sizing. Standard retail stops at 145–148 mm; 160 mm is specialist territory." },
      { q: "What temple length goes with a 160 mm frame?", a: "148 mm standard, at an 11° drop. That pairs correctly with 155–161 mm face widths." },
      { q: "Can I get 160 mm frames in Italian acetate?", a: "Yes — the signature 158 mm frame is Italian Mazzucchelli acetate, hand made in the EU. Bespoke 160 mm uses the same material." },
      { q: "How do I confirm I'm 160 mm and not 155?", a: "Use FitLens on your phone camera or a ruler across the widest part of your face at eye level. 5 mm is the difference between a signature fit and a slightly loose one." },
    ],
  },
  {
    width: 162,
    slug: "162mm",
    inRange: true,
    verdictKind: "top-of-bespoke",
    h1: "162 mm Wide Glasses — Built to Measure",
    subhead:
      "162 mm is a bespoke width — one millimetre above the signature fit range, well inside what we build to measure.",
    intro:
      "162 mm is a specialist width. Above the 155–161 mm signature range, and squarely inside what we hand-build to measure. Same Italian Mazzucchelli acetate, same shapes, same finishing — cut to 162 mm.",
    fitVerdict:
      "Just above signature. Order bespoke — signature 158 mm will sit 4 mm short across your face and pinch at the temples over time. Bespoke covers any width from 145 to 172 mm.",
    metaDescription:
      "162 mm wide glasses: a bespoke build in Italian Mazzucchelli acetate, hand made in Greece. Bespoke covers 145–172 mm; signature 158 mm fits 155–161 mm faces.",
    bespokeNote:
      "162 mm is a straightforward bespoke width. If you measure wider, we build to 172 mm — see the 165, 168, 170 and 172 mm pages.",
    faq: [
      { q: "How wide are 162 mm frames?", a: "Very. 162 mm is 14–17 mm above standard mainstream sizing. Bespoke only — the signature is cut at 158 mm." },
      { q: "What is the widest frame Woolet builds?", a: "172 mm. Bespoke covers any width from 145 to 172 mm in four shapes." },
      { q: "How long is bespoke at 162 mm?", a: "2 weeks from order to shipping. Same lead time as any bespoke width." },
    ],
  },
  {
    width: 165,
    slug: "165mm",
    inRange: true,
    verdictKind: "top-of-bespoke",
    h1: "165 mm Wide Glasses — Built to Measure",
    subhead:
      "165 mm is a bespoke build. Before you assume you need it, measure properly — most self-estimates come in a few millimetres high.",
    intro:
      "165 mm sits well above the 155–161 mm signature band, so the answer is bespoke: any width from 145 to 172 mm, cut to your measurement in Italian Mazzucchelli acetate and hand made in Greece. Measure first, though — most people who assume 165 mm land at 158–162 mm once they measure correctly, and the signature at $190 is the cheaper honest answer.",
    fitVerdict:
      "Bespoke. Measure temple-to-temple at eye level first — most people over-estimate by 3–5 mm. If you land at 155–161 mm the signature 158 mm at $190 is your frame; anything up to 172 mm is a bespoke build at $480 with lenses included.",
    metaDescription:
      "165 mm front width is a bespoke build. Any width from 145 to 172 mm, made to measure in 2 weeks, $480 with lenses included. Signature 158 mm fits 155–161 mm faces — measure first.",
    bespokeNote:
      "165 mm is a bespoke width: 4 shapes, 60 colour and size combinations, 2 weeks from order to shipping, $480 with lenses included, hand made in Greece.",
    faq: [
      { q: "Do you make 165 mm glasses?", a: "Yes — as a bespoke build. Bespoke covers any front width from 145 to 172 mm; the signature 158 mm is the off-the-shelf size." },
      { q: "How much does a 165 mm bespoke frame cost?", a: "$480 with lenses included, 2 weeks from order to shipping. The signature 158 mm is $190 if you measure 155–161 mm." },
      { q: "How do I measure my face properly?", a: "Ruler flat across the widest point of your face at eye level, straight-on in a mirror. Alternatively FitLens uses your phone camera. Most self-estimates run 3–5 mm high." },
    ],
  },
  {
    width: 168,
    slug: "168mm",
    inRange: true,
    verdictKind: "top-of-bespoke",
    h1: "168 mm Wide Glasses — Built to Measure",
    subhead:
      "168 mm is bespoke-only. The signature 158 mm is 10 mm too narrow at this width — there is no way to make it work.",
    intro:
      "At 168 mm temple-to-temple you are past every mainstream catalogue and past our signature size. The honest route is a bespoke build: your exact front width in Italian Mazzucchelli acetate, hand made in Greece. Measure carefully first — 168 mm is rare, and a 3 mm error changes the whole recommendation.",
    fitVerdict:
      "Bespoke only. The signature 158 mm runs 10 mm narrower than your face; it will pinch at the temples and sit short across the front. Bespoke builds any width from 145 to 172 mm, so 168 mm is comfortably inside range.",
    metaDescription:
      "168 mm front width is a bespoke build. Any width from 145 to 172 mm, made to measure in 2 weeks, $480 with lenses included. Signature 158 mm is too narrow at this width.",
    bespokeNote:
      "168 mm is a bespoke width: 4 shapes, 60 colour and size combinations, 2 weeks from order to shipping, $480 with lenses included, hand made in Greece.",
    faq: [
      { q: "Can I buy the signature 158 mm at 168 mm?", a: "No. Ten millimetres of shortfall is not a fit tolerance — it is a different size. Bespoke is the only honest route at 168 mm." },
      { q: "How long does a 168 mm bespoke build take?", a: "2 weeks from order to shipping, the same as any bespoke width." },
      { q: "Is 168 mm within Woolet's range?", a: "Yes. Bespoke covers 145 to 172 mm, so 168 mm is inside range with room to spare." },
    ],
  },
  {
    width: 170,
    slug: "170mm",
    inRange: true,
    verdictKind: "top-of-bespoke",
    h1: "170 mm Wide Glasses — Built to Measure",
    subhead:
      "170 mm is bespoke-only and near the top of what we build. The signature 158 mm is 12 mm too narrow.",
    intro:
      "170 mm temple-to-temple is a genuinely rare measurement, and almost nothing off the shelf reaches it. We build it to measure: your exact front width, keyhole bridge matched to your nose, Italian Mazzucchelli acetate, hand made in Greece. Verify the number before ordering — measure straight-on at eye level, or use FitLens.",
    fitVerdict:
      "Bespoke only, and close to our maximum. The signature 158 mm runs 12 mm narrower than your face and cannot be adjusted into a fit. Bespoke covers any width from 145 to 172 mm.",
    metaDescription:
      "170 mm front width is a bespoke build, near our 172 mm maximum. Made to measure in 2 weeks, $480 with lenses included. Signature 158 mm is too narrow at this width.",
    bespokeNote:
      "170 mm is a bespoke width: 4 shapes, 60 colour and size combinations, 2 weeks from order to shipping, $480 with lenses included, hand made in Greece.",
    faq: [
      { q: "Is 170 mm the widest Woolet builds?", a: "Close, but not the maximum — 172 mm is. 170 mm is a standard bespoke build with 2 mm of headroom above it." },
      { q: "Why can't the signature stretch to 170 mm?", a: "Acetate fronts are milled at a fixed width; heating and bending changes temple angle, not the front. At 12 mm of shortfall only a new front works." },
      { q: "What does a 170 mm bespoke frame cost?", a: "$480 with lenses included, 2 weeks from order to shipping." },
    ],
  },
  {
    width: 172,
    slug: "172mm",
    inRange: true,
    verdictKind: "top-of-bespoke",
    h1: "172 mm Wide Glasses — Built to Measure",
    subhead:
      "172 mm is the maximum front width Woolet builds. Bespoke only — the signature 158 mm is 14 mm too narrow.",
    intro:
      "172 mm is the widest frame we make. Above it we say no rather than sell you something that will not hold its geometry. At 172 mm the build is fully bespoke: your exact front width, a 20–24 mm keyhole bridge matched to your nose, Italian Mazzucchelli acetate, hand made in Greece. Measure carefully — at this width accuracy matters more than anywhere else on the ladder.",
    fitVerdict:
      "Bespoke only, and this is our ceiling: 172 mm is the maximum width Woolet builds. The signature 158 mm runs 14 mm narrower than your face and is not an option.",
    metaDescription:
      "172 mm is the maximum front width Woolet builds — a bespoke build, made to measure in 2 weeks, $480 with lenses included. Signature 158 mm is far too narrow at this width.",
    bespokeNote:
      "172 mm is our maximum. Bespoke: 4 shapes, 60 colour and size combinations, 2 weeks from order to shipping, $480 with lenses included, hand made in Greece.",
    faq: [
      { q: "Is 172 mm really the maximum?", a: "Yes. 172 mm is the widest front width Woolet builds. Above that we will tell you we cannot help rather than take the order." },
      { q: "What does a 172 mm frame cost?", a: "$480 with lenses included, 2 weeks from order to shipping — the same as any bespoke build." },
      { q: "What if I measure above 172 mm?", a: "Re-measure first; most self-estimates run 3–5 mm high. If you genuinely exceed 172 mm, a local optician doing full custom work is the honest answer." },
    ],
  },
];


export function getSizeBySlug(slug: string): SizeEntry | undefined {
  return SIZES.find((s) => s.slug === slug);
}

/** Returns up to 3 adjacent widths for the "related sizes" strip. */
export function getRelatedSizes(slug: string): SizeEntry[] {
  const i = SIZES.findIndex((s) => s.slug === slug);
  if (i === -1) return [];
  const window = SIZES.slice(Math.max(0, i - 2), i).concat(SIZES.slice(i + 1, i + 3));
  return window.slice(0, 4);
}

/** Band label for the ladder: signature 158 mm, signature-range 155–161 mm, else bespoke. */
export function ladderLabel(width: number): "signature" | "signature-range" | "bespoke" {
  if (width === 158) return "signature";
  if (width >= 155 && width <= 161) return "signature-range";
  return "bespoke";
}

/** Previous / next widths on the 145 → 172 ladder. */
export function getLadderNeighbours(slug: string): { prev?: SizeEntry; next?: SizeEntry } {
  const i = SIZES.findIndex((s) => s.slug === slug);
  if (i === -1) return {};
  return { prev: SIZES[i - 1], next: SIZES[i + 1] };
}
