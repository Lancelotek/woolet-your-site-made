/**
 * Numeric bridge-width SEO landing cluster data.
 * Complements the /en/collections/wide-bridge-glasses and
 * /en/collections/keyhole-bridge-glasses category pages by targeting
 * specific millimetre queries ("21mm bridge glasses", "22mm nose bridge",
 * "wide bridge 24mm frames") that a category hub can't rank for alone.
 *
 * Rules (do not violate):
 *  - Signature bridges: 21 mm (007 keyhole), 22 mm (009).
 *  - Bespoke can adjust bridge within the 145–172 mm front-width range.
 *  - No "Made in Italy" — Italian Mazzucchelli acetate, hand made in EU.
 */

export type BridgeVerdictKind =
  | "below-signature"      // narrower than we build in signature
  | "signature-007"        // matches 007 keyhole (21 mm)
  | "signature-009"        // matches 009 (22 mm)
  | "signature-between"    // 20 mm — under both but very close
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
      "18 mm is standard-narrow bridge territory. Our signature keyhole is 21 mm, built for wider noses. If 18 mm is genuinely your fit, mainstream retail is the honest answer.",
    intro:
      "18 mm bridges are the mainstream default — designed for average-width noses on 140–148 mm frames. Woolet is built for wider faces (155 mm+), which almost always come with a wider nose bridge (20–22 mm). We don't build 18 mm because a narrow bridge on a wide front pinches and slides.",
    fitVerdict:
      "We don't build at 18 mm. Our signature runs 21 mm keyhole (007) and 22 mm (009). If 18 mm is genuinely your fit, a mainstream 140–148 mm frame is a better match than forcing a wider front.",
    metaDescription:
      "18 mm bridge glasses: below Woolet's signature 21–22 mm bridge range. Honest guide to bridge sizing for wide faces. Signature 158 mm · Bespoke 145–172 mm.",
    bespokeNote:
      "We don't offer 18 mm bridges. Wide-face frames need wider bridges to sit correctly. See the 20 mm and 21 mm pages for the honest floor.",
    bestFor: "Narrow noses on 140–148 mm mainstream frames.",
    faq: [
      { q: "Is 18 mm a wide bridge?", a: "No. 18 mm is standard-to-narrow. Wide bridges start around 20 mm; keyhole bridges for wide faces are typically 21–24 mm." },
      { q: "Why doesn't Woolet make 18 mm bridges?", a: "Wide-face frames (155 mm+ front) need wider bridges to distribute weight across a wider nose. An 18 mm bridge on a 158 mm front rides up and pinches." },
      { q: "How do I measure my nose bridge?", a: "Measure the horizontal gap between where the frame would sit on either side of the nose, at the top of the bridge. Or use FitLens." },
    ],
  },
  {
    width: 19,
    slug: "19mm",
    inRange: false,
    verdictKind: "below-signature",
    h1: "19 mm Bridge Glasses — Just Below Our Signature Range",
    subhead:
      "19 mm sits between standard and wide. Our floor is 21 mm keyhole. If you need exactly 19 mm, mainstream extra-wide models fit better than forcing a Woolet front.",
    intro:
      "19 mm is the transition zone between mainstream and wide-face eyewear. Standard bridges run 16–18 mm; wide bridges start at 20 mm. Our signature 21 mm keyhole is engineered specifically for wider noses that come with 155 mm+ faces.",
    fitVerdict:
      "Not built at 19 mm. Signature is 21 mm (007) and 22 mm (009). Bespoke doesn't go below 20 mm — bridge width scales with front width, and our front starts at 145 mm.",
    metaDescription:
      "19 mm bridge glasses: below Woolet's 21 mm keyhole. Guide to bridge sizing for wide faces. Signature 158 mm · Keyhole bridge 21 mm.",
    bespokeNote:
      "Bespoke floor is 20 mm bridge; 19 mm is out of range. For narrower noses, mainstream extra-wide models are the fit.",
    bestFor: "Average noses on 148–152 mm frames.",
    faq: [
      { q: "Is a 19 mm bridge considered wide?", a: "It's borderline. Standard bridges are 16–18 mm, wide bridges start at 20 mm. 19 mm is the transitional width." },
      { q: "What bridge does Woolet start at?", a: "20 mm bespoke floor; 21 mm keyhole in the 007 signature; 22 mm in the 009 signature." },
    ],
  },
  {
    width: 20,
    slug: "20mm",
    inRange: true,
    verdictKind: "signature-between",
    h1: "20 mm Bridge Glasses — Bespoke Floor",
    subhead:
      "20 mm is the narrowest bridge we build. Bespoke only — signature runs 21 mm (keyhole) and 22 mm.",
    intro:
      "20 mm is where wide-face bridge sizing begins. Woolet's signature 21 mm keyhole and 22 mm bridges sit just above this, so 20 mm requires bespoke. Same Italian Mazzucchelli acetate, scaled to your bridge measurement.",
    fitVerdict:
      "Bespoke only. Signature runs 21 or 22 mm. If your bridge measures 20 mm exactly, bespoke is 1–2 mm tighter than signature — worth the wait if millimetre-exact matters.",
    metaDescription:
      "20 mm bridge glasses: bespoke floor. Italian Mazzucchelli acetate, hand made in EU. Signature 21 mm keyhole (007) and 22 mm (009).",
    bespokeNote:
      "20 mm sits at the floor of our bespoke bridge range. Same acetate, same shapes, made to your measurement.",
    bestFor: "Wide faces with a slightly narrower-than-typical nose bridge.",
    faq: [
      { q: "Is 20 mm a wide bridge?", a: "Yes — it's the entry point to wide-bridge sizing. Standard bridges run 16–18 mm; keyhole bridges for wider noses run 20–24 mm." },
      { q: "Can I get a 20 mm bridge on the signature 007?", a: "Only via bespoke. The signature 007 is fixed at 21 mm keyhole. Bespoke lets you drop to 20 mm on either shape." },
      { q: "How much does bespoke bridge adjustment add?", a: "Nothing beyond the standard bespoke tier price. Bridge width is part of the same made-to-measure process as front width." },
    ],
  },
  {
    width: 21,
    slug: "21mm",
    inRange: true,
    verdictKind: "signature-007",
    h1: "21 mm Keyhole Bridge Glasses — The Woolet 007 Signature",
    subhead:
      "This is the signature bridge on the 007 Round. Keyhole geometry, 21 mm across, engineered for wider noses on 155–161 mm faces.",
    intro:
      "21 mm is the bridge on the 007 Round in signature 158 mm. Keyhole shape — an open notch rather than a saddle — distributes weight along the sides of the nose instead of the top, which matters on a wider face where the frame is heavier. Italian Mazzucchelli acetate, hand made in the EU.",
    fitVerdict:
      "Yes — 21 mm is exactly the signature keyhole bridge on the 007 Round. No bespoke, no upcharge. This is the fit.",
    metaDescription:
      "21 mm keyhole bridge glasses: the Woolet 007 signature. Italian Mazzucchelli acetate. Signature 158 mm front · Bespoke 145–172 mm.",
    bespokeNote:
      "Bespoke lets you keep the 21 mm bridge on any shape, at any front width from 145 to 162 mm.",
    bestFor: "Wide noses on 155–161 mm faces — the canonical Woolet fit.",
    faq: [
      { q: "What's a keyhole bridge?", a: "An open, notched bridge shape (vs a rounded saddle bridge) that rests on the sides of the nose rather than the top. Better for wider noses because it distributes weight without pinching." },
      { q: "Is 21 mm the same as 22 mm bridge?", a: "No. 21 mm on the 007 uses keyhole geometry; 22 mm on the 009 uses a standard bridge. The 1 mm and the shape both matter." },
      { q: "Can I get 21 mm on the 009?", a: "Only bespoke. Signature 009 is fixed at 22 mm. Bespoke lets you pair 21 mm with the soft-square shape." },
      { q: "Does the keyhole leave marks on the nose?", a: "Less than a saddle bridge on the same face. The keyhole geometry spreads pressure along a longer contact line." },
    ],
  },
  {
    width: 22,
    slug: "22mm",
    inRange: true,
    verdictKind: "signature-009",
    h1: "22 mm Bridge Glasses — The Woolet 009 Signature",
    subhead:
      "This is the signature bridge on the 009 Soft Square. 22 mm across, matched to the 54 × 50 mm lens and 158 mm signature front.",
    intro:
      "22 mm is the bridge on the 009 Soft Square in signature 158 mm. Slightly wider than the 007 keyhole, matched to the larger 54 × 50 mm lens area. Italian Mazzucchelli acetate, hand made in the EU.",
    fitVerdict:
      "Yes — 22 mm is exactly the signature bridge on the 009 Soft Square. No bespoke needed. This is the fit.",
    metaDescription:
      "22 mm bridge glasses: the Woolet 009 signature. Soft-square Italian acetate. Signature 158 mm front · Bespoke 145–172 mm.",
    bespokeNote:
      "Bespoke lets you keep the 22 mm bridge on the 007 Round, or on any bespoke front from 145 to 162 mm.",
    bestFor: "Wider noses on 155–161 mm faces who want the larger soft-square lens.",
    faq: [
      { q: "Is 22 mm a very wide bridge?", a: "Yes. Standard bridges run 16–18 mm; wide bridges start at 20 mm. 22 mm is firmly in wide-bridge territory, sized for wider noses." },
      { q: "22 mm vs 21 mm keyhole — which fits better?", a: "Neither is objectively better. 22 mm (009) is a standard bridge on a larger soft-square lens; 21 mm keyhole (007) uses open geometry on a round lens. Nose shape and lens preference decide." },
      { q: "Can I get 22 mm bridge in a round frame?", a: "Only bespoke. Signature 007 is 21 mm keyhole. Bespoke lets you specify 22 mm on the round shape." },
    ],
  },
  {
    width: 24,
    slug: "24mm",
    inRange: true,
    verdictKind: "wide-bespoke",
    h1: "24 mm Bridge Glasses — Bespoke Wide-Bridge",
    subhead:
      "24 mm is a specialist bridge width — 2–3 mm above our signature. Bespoke only, for the widest noses.",
    intro:
      "24 mm bridges are for the widest noses that come with 160+ mm faces. This isn't a stock size; we build it in bespoke on either shape, matched to a signature or bespoke front width. Same Italian Mazzucchelli acetate as the standard line.",
    fitVerdict:
      "Bespoke only. Signature caps at 22 mm; 24 mm is 2 mm above that. If you measure at 24 mm, mainstream eyewear won't fit at all — bespoke is the answer.",
    metaDescription:
      "24 mm bridge glasses: bespoke wide-bridge in Italian Mazzucchelli acetate. Hand made in EU. Signature 158 mm · Bespoke 145–172 mm front.",
    bespokeNote:
      "24 mm is the widest bridge we build. Pairs with any front width from 145 to 162 mm, in either the round or soft-square shape.",
    bestFor: "Widest noses on 158–162 mm faces — bespoke-only territory.",
    faq: [
      { q: "How wide is a 24 mm bridge?", a: "Very wide. Standard is 16–18 mm; wide is 20–22 mm; 24 mm is specialist wide-bridge sizing, typically only available bespoke." },
      { q: "Is 24 mm the widest bridge Woolet offers?", a: "Yes. Above 24 mm the frame geometry stops working — the front becomes structurally unstable at that bridge-to-lens ratio." },
      { q: "What front width goes with a 24 mm bridge?", a: "Usually 158–162 mm. A wider bridge pairs with a wider front; you can spec both in the bespoke process." },
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
