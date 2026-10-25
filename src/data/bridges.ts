/**
 * Numeric bridge-width SEO landing cluster data.
 * Complements the /en/collections/wide-bridge-glasses and
 * /en/collections/keyhole-bridge-glasses category pages by targeting
 * specific millimetre queries ("26mm bridge glasses", "25mm nose bridge",
 * "wide bridge 24mm frames") that a category hub can't rank for alone.
 *
 * Rules (do not violate):
 *  - Signature bridges: 26 mm (007 keyhole), 25 mm (009). Official since 2026-10-25.
 *  - Bespoke bridge range 20–26 mm, any front width 145–160 mm.
 *  - No "Made in Italy" — Italian Mazzucchelli acetate, hand made in EU.
 */

export type BridgeVerdictKind =
  | "below-signature"      // narrower than we build in signature
  | "signature-007"        // matches 007 keyhole (26 mm)
  | "signature-009"        // matches 009 (25 mm)
  | "signature-between"    // 20 mm — bespoke floor
  | "bespoke-narrower"     // 21–24 mm — narrower than signature, bespoke
  | "wide-bespoke"         // wider bespoke territory
  | "out-of-range";        // beyond bespoke

export interface BridgeFAQ { q: string; a: string; }

export interface BridgeEntry {
  width: number;              // mm
  slug: string;               // "21mm"
  inRange: boolean;
  verdictKind: BridgeVerdictKind;
  h1: string;
  subhead: string;
  intro: string;
  fitVerdict: string;
  metaDescription: string;
  bespokeNote: string;
  bestFor: string;            // one-line "who this bridge suits"
  faq: BridgeFAQ[];
}

export const BRIDGES: BridgeEntry[] = [
  {
    width: 18,
    slug: "18mm",
    inRange: false,
    verdictKind: "below-signature",
    h1: "18 mm Bridge Glasses — Narrower Than We Build",
    subhead:
      "18 mm is standard-narrow bridge territory. Woolet signature bridges are 25 mm (009) and 26 mm (007 keyhole), built for wider noses. If 18 mm is genuinely your fit, mainstream retail is the honest answer.",
    intro:
      "18 mm bridges are the mainstream default — designed for average-width noses on 140–148 mm frames. Woolet is built for wider faces (155 mm+), which usually come with a wider nose. We don't build 18 mm because a narrow bridge on a wide front pinches and slides.",
    fitVerdict:
      "We don't build at 18 mm. Signature runs 26 mm keyhole (007) and 25 mm (009); bespoke starts at 20 mm.",
    metaDescription:
      "18 mm bridge glasses: below Woolet's bridge range. Honest guide to bridge sizing for wide faces. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "We don't offer 18 mm bridges. See the 20 mm page for the bespoke floor.",
    bestFor: "Narrow noses on 140–148 mm mainstream frames.",
    faq: [
      { q: "Is 18 mm a wide bridge?", a: "No. 18 mm is standard-to-narrow. Wide bridges start around 20 mm." },
      { q: "Why doesn't Woolet make 18 mm bridges?", a: "Wide-face frames (155 mm+ front) need wider bridges to spread weight across a wider nose. An 18 mm bridge on a 158 mm front rides up and pinches." },
      { q: "How do I measure my nose bridge?", a: "Use FitLens, or measure the gap between where the frame would rest on either side of the nose. Your nose measurement is not the same number as the bridge printed on a frame." },
    ],
  },
  {
    width: 19,
    slug: "19mm",
    inRange: false,
    verdictKind: "below-signature",
    h1: "19 mm Bridge Glasses — Below Our Range",
    subhead:
      "19 mm sits between standard and wide. Woolet bespoke starts at 20 mm and signature frames run 25–26 mm.",
    intro:
      "19 mm is the transition zone between mainstream and wide-face eyewear. Standard bridges run 16–18 mm; wide bridges start at 20 mm. Woolet signature bridges are 25 mm (009) and 26 mm (007 keyhole).",
    fitVerdict:
      "Not built at 19 mm. Signature is 26 mm (007) and 25 mm (009). Bespoke doesn't go below 20 mm.",
    metaDescription:
      "19 mm bridge glasses: below Woolet's range. Guide to bridge sizing for wide faces. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "Bespoke floor is 20 mm; 19 mm is out of range.",
    bestFor: "Average noses on 148–152 mm frames.",
    faq: [
      { q: "Is a 19 mm bridge considered wide?", a: "It's borderline. Standard bridges are 16–18 mm, wide bridges start at 20 mm." },
      { q: "What bridge does Woolet start at?", a: "20 mm in bespoke. Signature frames: 26 mm keyhole on the 007, 25 mm on the 009." },
    ],
  },
  {
    width: 20,
    slug: "20mm",
    inRange: true,
    verdictKind: "signature-between",
    h1: "20 mm Bridge Glasses — Bespoke Floor",
    subhead:
      "20 mm is the narrowest bridge we build. Bespoke only — signature runs 26 mm (007 keyhole) and 25 mm (009).",
    intro:
      "20 mm is where wide-face bridge sizing begins. It sits well below the 25–26 mm signature bridges, so it is a bespoke build. Same Italian Mazzucchelli acetate, cut to your measurement.",
    fitVerdict:
      "Bespoke only. Signature runs 25 or 26 mm.",
    metaDescription:
      "20 mm bridge glasses: bespoke floor. Italian Mazzucchelli acetate, hand made in EU. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "20 mm sits at the floor of our bespoke bridge range. Same acetate, same shapes, made to your measurement.",
    bestFor: "Wide faces with a narrower-than-typical nose.",
    faq: [
      { q: "Is 20 mm a wide bridge?", a: "It's the entry point to wide-bridge sizing. Standard bridges run 16–18 mm." },
      { q: "Can I get a 20 mm bridge on the signature 007?", a: "Only via bespoke. The signature 007 is fixed at 26 mm keyhole and the 009 at 25 mm." },
      { q: "How much does bespoke bridge adjustment add?", a: "Nothing beyond the standard bespoke price. Bridge width is part of the same made-to-measure process as front width." },
    ],
  },
  {
    width: 21,
    slug: "21mm",
    inRange: true,
    verdictKind: "bespoke-narrower",
    h1: "21 mm Bridge Glasses — Bespoke",
    subhead:
      "21 mm is a wide bridge, but narrower than the Woolet signature (25 mm on the 009, 26 mm on the 007 keyhole). We build 21 mm in bespoke.",
    intro:
      "21 mm is firmly wide-bridge territory — wider than almost anything in mainstream retail. The Woolet signature frames go further: 25 mm on the 009 Soft Square and 26 mm on the 007 keyhole. If your frame needs exactly 21 mm, bespoke builds it on any front from 145 to 160 mm.",
    fitVerdict:
      "Bespoke. Signature runs 25 mm (009) and 26 mm (007); a 21 mm bridge is a made-to-measure order.",
    metaDescription:
      "21 mm bridge glasses: bespoke in Italian Mazzucchelli acetate, hand made in EU. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "Bespoke pairs a 21 mm bridge with any front width from 145 to 160 mm, in any bespoke shape.",
    bestFor: "Wide faces whose frame bridge needs to sit between mainstream and the Woolet signature.",
    faq: [
      { q: "Is 21 mm a wide bridge?", a: "Yes. Standard bridges run 16–18 mm; wide bridges start at 20 mm." },
      { q: "Can I get 21 mm on the 007 or 009?", a: "Only via bespoke. Signature 007 is 26 mm keyhole, signature 009 is 25 mm." },
      { q: "What does the bridge number on a frame mean?", a: "It is the gap between the lenses at the bridge (DBL), in millimetres. It is not the same number as a measurement of your nose." },
    ],
  },
  {
    width: 22,
    slug: "22mm",
    inRange: true,
    verdictKind: "bespoke-narrower",
    h1: "22 mm Bridge Glasses — Bespoke",
    subhead:
      "22 mm is a wide bridge, but narrower than the Woolet signature (25 mm on the 009, 26 mm on the 007 keyhole). We build 22 mm in bespoke.",
    intro:
      "22 mm is firmly wide-bridge territory — wider than almost anything in mainstream retail. The Woolet signature frames go further: 25 mm on the 009 Soft Square and 26 mm on the 007 keyhole. If your frame needs exactly 22 mm, bespoke builds it on any front from 145 to 160 mm.",
    fitVerdict:
      "Bespoke. Signature runs 25 mm (009) and 26 mm (007); a 22 mm bridge is a made-to-measure order.",
    metaDescription:
      "22 mm bridge glasses: bespoke in Italian Mazzucchelli acetate, hand made in EU. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "Bespoke pairs a 22 mm bridge with any front width from 145 to 160 mm, in any bespoke shape.",
    bestFor: "Wide faces whose frame bridge needs to sit between mainstream and the Woolet signature.",
    faq: [
      { q: "Is 22 mm a wide bridge?", a: "Yes. Standard bridges run 16–18 mm; wide bridges start at 20 mm." },
      { q: "Can I get 22 mm on the 007 or 009?", a: "Only via bespoke. Signature 007 is 26 mm keyhole, signature 009 is 25 mm." },
      { q: "What does the bridge number on a frame mean?", a: "It is the gap between the lenses at the bridge (DBL), in millimetres. It is not the same number as a measurement of your nose." },
    ],
  },
  {
    width: 24,
    slug: "24mm",
    inRange: true,
    verdictKind: "bespoke-narrower",
    h1: "24 mm Bridge Glasses — Bespoke",
    subhead:
      "24 mm is a wide bridge, but narrower than the Woolet signature (25 mm on the 009, 26 mm on the 007 keyhole). We build 24 mm in bespoke.",
    intro:
      "24 mm is firmly wide-bridge territory — wider than almost anything in mainstream retail. The Woolet signature frames go further: 25 mm on the 009 Soft Square and 26 mm on the 007 keyhole. If your frame needs exactly 24 mm, bespoke builds it on any front from 145 to 160 mm.",
    fitVerdict:
      "Bespoke. Signature runs 25 mm (009) and 26 mm (007); a 24 mm bridge is a made-to-measure order.",
    metaDescription:
      "24 mm bridge glasses: bespoke in Italian Mazzucchelli acetate, hand made in EU. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "Bespoke pairs a 24 mm bridge with any front width from 145 to 160 mm, in any bespoke shape.",
    bestFor: "Wide faces whose frame bridge needs to sit between mainstream and the Woolet signature.",
    faq: [
      { q: "Is 24 mm a wide bridge?", a: "Yes. Standard bridges run 16–18 mm; wide bridges start at 20 mm." },
      { q: "Can I get 24 mm on the 007 or 009?", a: "Only via bespoke. Signature 007 is 26 mm keyhole, signature 009 is 25 mm." },
      { q: "What does the bridge number on a frame mean?", a: "It is the gap between the lenses at the bridge (DBL), in millimetres. It is not the same number as a measurement of your nose." },
    ],
  },
  {
    width: 25,
    slug: "25mm",
    inRange: true,
    verdictKind: "signature-009",
    h1: "25 mm Bridge Glasses — The Woolet 009 Signature",
    subhead:
      "This is the signature bridge on the 009 Soft Square: 25 mm, matched to the 54 × 44 mm lens and the 158 mm front.",
    intro:
      "25 mm is the bridge on the 009 Soft Square, 54□25-150. Almost nothing in mainstream retail is built this wide. It pairs with the flatter soft-square top line and a 54 × 44 mm lens. Italian Mazzucchelli acetate, hand made in the EU.",
    fitVerdict:
      "Yes — 25 mm is exactly the signature bridge on the 009 Soft Square. No bespoke needed.",
    metaDescription:
      "25 mm bridge glasses: the Woolet 009 Soft Square, 54□25-150. Italian acetate. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "Bespoke lets you keep a 25 mm bridge on any bespoke shape and any front from 145 to 160 mm.",
    bestFor: "Wide noses on 153–163 mm faces who want the soft-square shape.",
    faq: [
      { q: "Is 25 mm a very wide bridge?", a: "Yes. Standard bridges run 16–18 mm and most brands stop at 18–20 mm. 25 mm is built for wide noses on wide faces." },
      { q: "25 mm vs the 26 mm keyhole — which fits better?", a: "25 mm (009) sits on a soft-square lens; 26 mm keyhole (007) uses open geometry on a round lens. Shape preference and nose shape decide." },
      { q: "Can I get 25 mm in a round frame?", a: "Only bespoke. Signature 007 is 26 mm keyhole." },
    ],
  },
  {
    width: 26,
    slug: "26mm",
    inRange: true,
    verdictKind: "signature-007",
    h1: "26 mm Keyhole Bridge Glasses — The Woolet 007 Signature",
    subhead:
      "This is the signature bridge on the 007 Round: a 26 mm keyhole, matched to the 53 × 47.6 mm lens and the 158 mm front.",
    intro:
      "26 mm is the bridge on the 007 Round / Panto, 53□26-150. The keyhole shape — an open notch rather than a saddle — rests on the sides of the nose instead of the top, which matters on a wide face where the frame carries more acetate. Italian Mazzucchelli acetate, hand made in the EU.",
    fitVerdict:
      "Yes — 26 mm is exactly the signature keyhole bridge on the 007 Round. No bespoke needed.",
    metaDescription:
      "26 mm keyhole bridge glasses: the Woolet 007 Round, 53□26-150. Italian acetate. Signature 158 mm front · 007 26 mm keyhole · 009 25 mm · Bespoke 20–26 mm.",
    bespokeNote:
      "26 mm is also the widest bridge we build in bespoke, on any shape and any front from 145 to 160 mm.",
    bestFor: "Wide noses on 153–163 mm faces — the widest Woolet bridge.",
    faq: [
      { q: "What's a keyhole bridge?", a: "An open, notched bridge shape that rests on the sides of the nose rather than the top. It spreads weight on a wider nose without pinching." },
      { q: "Is 26 mm the widest bridge Woolet offers?", a: "Yes. 26 mm is the 007 signature and the top of the bespoke range." },
      { q: "Can I get 26 mm on the 009?", a: "Only bespoke. Signature 009 is 25 mm." },
    ],
  },
];

export function getBridgeBySlug(slug: string): BridgeEntry | undefined {
  return BRIDGES.find((b) => b.slug === slug);
}

export function getRelatedBridges(slug: string): BridgeEntry[] {
  const i = BRIDGES.findIndex((b) => b.slug === slug);
  if (i === -1) return [];
  return BRIDGES.slice(Math.max(0, i - 2), i).concat(BRIDGES.slice(i + 1, i + 3)).slice(0, 4);
}
