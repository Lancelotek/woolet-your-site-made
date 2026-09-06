/**
 * Message-match variants for the Kickstarter VIP landing page.
 * Chosen by the `utm_content` URL parameter; unknown values fall back to
 * DEFAULT, which is byte-for-byte the original page copy.
 */

export type HeroVariant = {
  eyebrow: string;
  h1: string;
  /** may contain the token {{40off}} */
  sub: string;
  /** step-2 first paragraph, may contain {{40OFF}} and {{$1}} */
  reserveLead: string;
};

export const DEFAULT_HERO_VARIANT: HeroVariant = {
  eyebrow: "VIP Early Access",
  h1: "Eyewear built for wide faces.",
  sub: "Premium Milanese acetate, hand made in the EU, engineered for faces the industry forgot — 155 mm and up. Launching soon on Kickstarter. Join the VIP list for early access and up to {{40off}}.",
  reserveLead:
    "You're on the VIP list. Lock your {{40OFF}} founding price with a refundable {{$1}} reservation — it holds your spot when the campaign opens.",
};

export const VARIANTS: Record<string, HeroVariant> = {
  "not-the-style": {
    eyebrow: "Not a style problem",
    h1: "It was never the style. It was the width.",
    sub: "158 mm across the front, built for heads from 155 to 161 mm — the width the industry stops measuring at 145. Italian Mazzucchelli acetate, hand made in the EU. Join the VIP list for early access and up to {{40off}} at the Kickstarter launch.",
    reserveLead:
      "You found the width. Now hold the price: a refundable {{$1}} reservation keeps your {{40OFF}} Founder pledge waiting when the campaign opens.",
  },
  "too-small": {
    eyebrow: "Sound familiar?",
    h1: "Your glasses look too small for your face. Because they are.",
    sub: "Most frames stop at 145 mm. Woolet starts at 158 — two shapes built for heads from 155 to 161 mm, in Italian Mazzucchelli acetate, hand made in the EU. Join the VIP list for early access and up to {{40off}}.",
    reserveLead:
      "Frames that finally reach your temples. A refundable {{$1}} reservation holds your {{40OFF}} Founder price when the campaign opens.",
  },
  "red-marks": {
    eyebrow: "The 3 pm test",
    h1: "Red marks behind your ears by 3 pm? The frame is too narrow.",
    sub: "Woolet 007 and 009 measure 158 mm across the front and fit heads from 155 to 161 mm, so the temples sit without pressing. Join the VIP list for early access and up to {{40off}}.",
    reserveLead:
      "No more marks by 3 pm. A refundable {{$1}} reservation holds your {{40OFF}} Founder price when the campaign opens.",
  },
  "digging-in": {
    eyebrow: "It's not your face. It's the frame.",
    h1: "Twelve years of frames digging into your head. Ends here.",
    sub: "Nobody made them wide enough — until 158 mm. Woolet fits heads from 155 to 161 mm, Italian Mazzucchelli acetate, hand made in the EU. Join the VIP list for early access and up to {{40off}}.",
    reserveLead:
      "The last pair that digs in. A refundable {{$1}} reservation holds your {{40OFF}} Founder price when the campaign opens.",
  },
  "temples-bent": {
    eyebrow: "Every pair you've owned",
    h1: "Stop bending the temples. Get the width.",
    sub: "A 158 mm front and a 21 mm keyhole bridge, built for heads from 155 to 161 mm. Italian Mazzucchelli acetate, hand made in the EU. Join the VIP list for early access and up to {{40off}}.",
    reserveLead:
      "Temples that sit where they should. A refundable {{$1}} reservation holds your {{40OFF}} Founder price when the campaign opens.",
  },
};

const PREFIXES = ["m1-", "m2-", "m3-", "m4b-", "m4-", "m5-", "p1-", "p4-", "r1-", "r2-", "r3-", "r4-"];
const SUFFIXES = ["-man", "-real", "-greybeard", "-lead"];

export function resolveHeroVariant(
  utmContent: string | null | undefined,
): { key: string; variant: HeroVariant } {
  let value = (utmContent || "").trim().toLowerCase();
  if (!value) return { key: "default", variant: DEFAULT_HERO_VARIANT };

  for (const p of PREFIXES) {
    if (value.startsWith(p)) {
      value = value.slice(p.length);
      break;
    }
  }
  for (const s of SUFFIXES) {
    if (value.endsWith(s)) {
      value = value.slice(0, -s.length);
      break;
    }
  }

  for (const key of Object.keys(VARIANTS)) {
    if (value.startsWith(key)) return { key, variant: VARIANTS[key] };
  }
  return { key: "default", variant: DEFAULT_HERO_VARIANT };
}
