/**
 * Numeric temple-length SEO landing cluster (Phase 3).
 * Complements /en/size/* (front width) and /en/bridge/* (nose bridge)
 * by targeting temple-length queries ("150mm temples glasses",
 * "long temple arms 155mm", "148mm temple length").
 *
 * Rules:
 *  - Signature temple length: 150 mm on both 007 and 009.
 *  - Bespoke covers 145–155 mm temple length.
 *  - No "Made in Italy" — Italian Mazzucchelli acetate, hand made in EU.
 */

export type TempleVerdictKind =
  | "below-signature"      // shorter than we build in signature
  | "signature"            // matches signature 150 mm
  | "bespoke-long"         // 150–155 mm bespoke territory
  | "out-of-range";        // beyond bespoke (>155 mm)

export interface TempleFAQ { q: string; a: string; }

export interface TempleEntry {
  length: number;             // mm
  slug: string;               // "148mm"
  inRange: boolean;
  verdictKind: TempleVerdictKind;
  h1: string;
  subhead: string;
  intro: string;
  fitVerdict: string;
  metaDescription: string;
  bespokeNote: string;
  bestFor: string;
  faq: TempleFAQ[];
}

export const TEMPLES: TempleEntry[] = [
  {
    length: 140,
    slug: "140mm",
    inRange: false,
    verdictKind: "below-signature",
    h1: "140 mm Temple Glasses — Shorter Than We Build",
    subhead:
      "140 mm is standard-short temple length. Our signature is 148 mm, engineered for the wider heads that come with 155 mm+ faces.",
    intro:
      "140 mm temples are the mainstream default for narrow-to-average heads and 140–148 mm front widths. Woolet is built for wider faces (155 mm+), which almost always come with a wider head circumference — and that needs 148 mm or longer temples to reach the ears without pinching.",
    fitVerdict:
      "We don't build at 140 mm. Signature is 148 mm; bespoke floor is 145 mm. If 140 mm is genuinely your fit, mainstream 140–148 mm frames will match you better than forcing a wider front.",
    metaDescription:
      "140 mm temple length: below Woolet's 145 mm bespoke floor. Honest guide to temple sizing for wide faces. Signature temples 150 mm.",
    bespokeNote:
      "We don't offer 140 mm temples. Wide-face frames need longer arms to clear the temples and hook the ears without pressure.",
    bestFor: "Narrow-to-average heads on 140–148 mm mainstream frames.",
    faq: [
      { q: "Is 140 mm a long temple?", a: "No. 140 mm is short-to-standard. Long temples for wide faces start around 148 mm; extra-long runs 150–155 mm." },
      { q: "Why doesn't Woolet make 140 mm temples?", a: "A 158 mm front with 140 mm arms won't reach past the temples — the frame sits forward, slides down and puts pressure on the sides of the head." },
      { q: "How do I measure temple length?", a: "Measure the arm from the hinge screw straight along the top edge to the tip bend, then follow the curve down to the tip. Or use FitLens." },
    ],
  },
  {
    length: 145,
    slug: "145mm",
    inRange: true,
    verdictKind: "bespoke-long",
    h1: "145 mm Temple Glasses — Bespoke Floor",
    subhead:
      "145 mm is the shortest temple we build. Bespoke only — signature runs 148 mm on both shapes.",
    intro:
      "145 mm is where wide-face temple sizing begins. Signature 150 mm sits 3 mm above this, so 145 mm requires bespoke. Same Italian Mazzucchelli acetate, scaled to your measurement — useful when your ears sit forward relative to your face width.",
    fitVerdict:
      "Bespoke only. Signature is 148 mm. If your temple-to-ear distance measures shorter than average for a 155 mm+ face, 145 mm bespoke is the honest fit — signature would push past the ear.",
    metaDescription:
      "145 mm temple glasses: bespoke floor. Italian Mazzucchelli acetate. Signature temples 150 mm · Bespoke 145–155 mm.",
    bespokeNote:
      "145 mm sits at the floor of our bespoke temple range. Same acetate and shapes as signature, cut 3 mm shorter.",
    bestFor: "Wide faces with slightly forward-set ears — shorter arms than typical.",
    faq: [
      { q: "Is 145 mm a long temple?", a: "It's the transitional length between mainstream (140–145 mm) and wide-face (148–155 mm). Woolet uses 145 mm only in bespoke." },
      { q: "Can I get 145 mm arms on the signature 007?", a: "Only via bespoke. Signature 007 and 009 are both fixed at 148 mm temples. Bespoke drops to 145 mm on either shape." },
      { q: "Does shorter temple mean the frame fits looser?", a: "Not necessarily — temple length controls where the tip bends behind the ear. Too long and the tip pushes past the ear; too short and it pinches in front of it." },
    ],
  },
  {
    length: 148,
    slug: "148mm",
    inRange: true,
    verdictKind: "signature",
    h1: "148 mm Temple Glasses — The Woolet Signature Length",
    subhead:
      "This is the signature temple on both the 007 Round and 009 Soft Square. 148 mm at an 11° bend, matched to the 158 mm front width.",
    intro:
      "148 mm is the signature temple length on both Woolet shapes. It's the honest match for a 158 mm front on a 155–161 mm face — long enough to reach past the temples and hook the ear cleanly, short enough not to overshoot. 11° tip bend, 5-barrel PVD Gunmetal hinges, Italian Mazzucchelli acetate.",
    fitVerdict:
      "Yes — 148 mm is exactly the signature temple on both 007 and 009. No bespoke, no upcharge. This is the fit.",
    metaDescription:
      "148 mm temple glasses: the Woolet signature. Italian Mazzucchelli acetate, hand made in EU. 158 mm front · 21–22 mm keyhole bridge · 148 mm temples.",
    bespokeNote:
      "Bespoke keeps 148 mm as the default and lets you shift 3 mm shorter or 7 mm longer if your measurement demands it.",
    bestFor: "Wide faces (155–161 mm) with average head circumference — the canonical Woolet fit.",
    faq: [
      { q: "Why 148 mm and not 145 mm?", a: "148 mm matches a 158 mm front on a wider head. Shorter temples on a wider front push the tip in front of the ear; longer temples overshoot." },
      { q: "What's the tip bend angle on the signature 150 mm temple?", a: "11°. Enough to hook the ear on a wider head without the tip poking straight back." },
      { q: "Can I get 148 mm temples on a bespoke front width?", a: "Yes. Bespoke lets you keep 148 mm temples on any front from 145 to 162 mm, or scale 145–155 mm." },
      { q: "How does 148 mm compare to Ray-Ban temples?", a: "Ray-Ban runs 140–150 mm across their line; 145 mm is typical. 148 mm is on the longer end for standard eyewear and specifically matched to a 158 mm front." },
    ],
  },
  {
    length: 150,
    slug: "150mm",
    inRange: true,
    verdictKind: "bespoke-long",
    h1: "150 mm Temple Glasses — Long Temple Bespoke",
    subhead:
      "150 mm is 2 mm above signature. Bespoke only — for slightly wider heads or ears set further back.",
    intro:
      "150 mm temples pair well with 158–160 mm fronts on wider heads. It's a small step above signature but often decisive: the tip finally reaches past the ear on a 60+ cm head circumference. Signature stays at 148 mm; 150 mm is bespoke.",
    fitVerdict:
      "Bespoke only. Signature is 148 mm; 150 mm is 2 mm longer. Worth it if signature temples land in front of your ear.",
    metaDescription:
      "150 mm temple glasses: long-temple bespoke in Italian Mazzucchelli acetate. Signature 150 mm · Bespoke 145–155 mm.",
    bespokeNote:
      "150 mm sits in the bespoke long-temple range. Same shapes and acetate as signature, arms cut 2 mm longer.",
    bestFor: "Wide faces with head circumference 60+ cm — arms sit past the ear.",
    faq: [
      { q: "Is 150 mm a long temple arm?", a: "Yes — 150 mm is on the long end. Mainstream tops out around 145–148 mm; 150 mm is where wide-head sizing starts." },
      { q: "150 mm vs 148 mm — how much does 2 mm matter?", a: "On a wider head, 2 mm decides whether the tip hooks the ear or lands in front of it. If signature temples feel short, 150 mm bespoke is usually the fix." },
      { q: "What head circumference matches 150 mm temples?", a: "Typically 60–62 cm. Below that, 148 mm signature is enough; above 62 cm, consider 152–155 mm bespoke." },
    ],
  },
  {
    length: 152,
    slug: "152mm",
    inRange: true,
    verdictKind: "bespoke-long",
    h1: "152 mm Temple Glasses — Extra-Long Bespoke",
    subhead:
      "152 mm is 4 mm above signature. Bespoke, for larger heads (62–63 cm) where signature arms sit forward.",
    intro:
      "152 mm temples are extra-long territory — designed for face widths at the top of our signature range (159–161 mm) paired with a head circumference around 62–63 cm. Bespoke, in the same Italian Mazzucchelli acetate.",
    fitVerdict:
      "Bespoke only. Signature caps at 148 mm; 152 mm is 4 mm longer. If your head measures 62 cm+ and signature arms sit forward of the ear, this is the right fit.",
    metaDescription:
      "152 mm temple glasses: extra-long bespoke. Italian Mazzucchelli acetate, hand made in EU. Signature 150 mm · Bespoke 145–155 mm.",
    bespokeNote:
      "152 mm is extra-long bespoke — pairs well with 160–162 mm bespoke fronts.",
    bestFor: "Widest faces (159–161 mm) with 62–63 cm head circumference.",
    faq: [
      { q: "How long is a 152 mm temple in inches?", a: "About 6.0 in. Mainstream tops out around 5.7 in (145 mm); 152 mm is firmly extra-long." },
      { q: "Do I need 152 mm temples if I have a wide face?", a: "Only if your head circumference is also large (~62 cm+). Face width and head circumference are different measurements — FitLens or a soft tape confirms." },
      { q: "Is 152 mm the longest temple Woolet builds?", a: "No — bespoke goes to 155 mm. Above 155 mm the arm becomes structurally unstable on our current frame geometry." },
    ],
  },
  {
    length: 155,
    slug: "155mm",
    inRange: true,
    verdictKind: "bespoke-long",
    h1: "155 mm Temple Glasses — Longest We Build",
    subhead:
      "155 mm is the ceiling of our bespoke temple range. For the largest heads paired with our widest bespoke fronts.",
    intro:
      "155 mm is the longest temple we make. It's specialist territory — pairs with 160–162 mm bespoke fronts on head circumferences of 63 cm and above. Bespoke only, same Italian Mazzucchelli acetate as signature.",
    fitVerdict:
      "Bespoke ceiling. Signature is 148 mm; 155 mm is 7 mm longer. If mainstream and even our signature arms end in front of your ear, 155 mm is the answer.",
    metaDescription:
      "155 mm temple glasses: longest bespoke arm Woolet builds. Italian Mazzucchelli acetate, hand made in EU. Signature 150 mm · Bespoke 145–155 mm.",
    bespokeNote:
      "155 mm is the maximum bespoke temple length. Above this the frame geometry stops working reliably.",
    bestFor: "Largest heads (63 cm+) with the widest bespoke fronts (160–162 mm).",
    faq: [
      { q: "Is 155 mm the longest temple length in glasses?", a: "For premium acetate frames, effectively yes. Beyond 155 mm the arm flexes too much on typical hinge hardware." },
      { q: "What if I need longer than 155 mm?", a: "We honestly don't build it — the arm-to-front ratio breaks down. Sports-wrap and safety eyewear categories offer 158–160 mm in nylon; premium acetate does not." },
      { q: "Does 155 mm cost more than 148 mm bespoke?", a: "No — bespoke temple length is part of the standard bespoke tier. No per-millimetre upcharge." },
    ],
  },
];

export function getTempleBySlug(slug: string): TempleEntry | undefined {
  return TEMPLES.find((t) => t.slug === slug);
}

export function getRelatedTemples(slug: string): TempleEntry[] {
  const i = TEMPLES.findIndex((t) => t.slug === slug);
  if (i === -1) return [];
  return TEMPLES.slice(Math.max(0, i - 2), i).concat(TEMPLES.slice(i + 1, i + 3)).slice(0, 4);
}
