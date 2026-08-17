/**
 * Hat size calculator FAQ — shared by the React page
 * (src/pages/tools/HatSizeCalculator.tsx) and the prerender layer
 * (src/seo/metadata.ts) so the FAQPage JSON-LD can never drift.
 */

export const HAT_SIZE_FAQ = [
  {
    q: "How accurate is this hat size calculator?",
    a: "The calculator uses the international standard hat size conversion (circumference ÷ π, rounded to the nearest 1/8 inch). Match a correct tape measurement and it's exact. The most common source of error isn't the math — it's measuring at the hairline instead of ~2.5 cm above the eyebrows, which underestimates by a full size.",
  },
  {
    q: "Should I round up or down if I'm between sizes?",
    a: "Always up. A hat can be padded down with a $3 self-adhesive sizing strip in 60 seconds; a hat that's a full size too small will squeeze, leave a red ring, and can only be stretched 3–4 mm without deforming.",
  },
  {
    q: "Does the calculator work for baseball fitted caps?",
    a: "Yes — fitted caps use the same US fractional sizing. Add one half-size if you like a very relaxed fit, since fitted-cap polyester/wool shells run about 3–5 mm tighter than felt at the same labelled size.",
  },
  {
    q: "What if my head is bigger than 66 cm?",
    a: "Above 66 cm (US 8¼) you're in made-to-order territory. Optimo (Chicago) and Bencraft (London) will block a felt hat to spec; expect a 6–12 week wait and starting prices around $400.",
  },
];
