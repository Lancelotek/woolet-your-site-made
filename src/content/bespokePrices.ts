// Woolet Bespoke price list - the ONE place prices live in code.
//
// Two layers:
// 1. Live prices: table `bespoke_pricing` (edited in /en/admin/bespoke → Pricing).
//    The configurator, checkout and Stripe charge read it at runtime, so a change
//    there is live within seconds, no deploy.
// 2. These constants: defaults when the table is unreachable, and the numbers that
//    copy, FAQ, blog, JSON-LD and llms.txt print. Change a price in the admin
//    panel AND here, then publish - `bespoke-price-copy.test.ts` lists every file
//    that still prints the old number.
//
// Keep in sync with supabase/functions/_shared/bespoke-pricing.ts (a test checks).

export const BESPOKE_PRICES = {
  /** Made-to-measure frame, free worldwide shipping included. */
  frameUsd: 480,
  /** Clear lenses, no correction. */
  planoUsd: 30,
  /** Blue-light filter lenses. */
  blueLightUsd: 84,
  /** Temple engraving. */
  engravingUsd: 10,
  /** Kickstarter backer price - campaign only, never sold on woolet.co. */
  kickstarterUsd: 299,
} as const;

const usd = (n: number) => `$${n}`;

/** Ready-to-print labels for copy written in template strings. */
export const BESPOKE_COPY = {
  frame: usd(BESPOKE_PRICES.frameUsd),
  plano: `+${usd(BESPOKE_PRICES.planoUsd)}`,
  blueLight: `+${usd(BESPOKE_PRICES.blueLightUsd)}`,
  engraving: `+${usd(BESPOKE_PRICES.engravingUsd)}`,
  kickstarter: usd(BESPOKE_PRICES.kickstarterUsd),
  /** Schema.org Offer price, e.g. "480.00". */
  frameSchema: BESPOKE_PRICES.frameUsd.toFixed(2),
} as const;
