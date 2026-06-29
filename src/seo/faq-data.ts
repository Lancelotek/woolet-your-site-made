export type FaqItem = { q: string; a: string };

// Shared between ProductFAQ.tsx (UI) and metadata.ts (prerendered JSON-LD).
// Must remain React/DOM-free so the SSR metadata bundle can import it.
export const PRODUCT_FAQ: FaqItem[] = [
  {
    q: "How will I know if the frames fit my face?",
    a: "Measure your face width from temple to temple. If the result is 155mm or more — Woolet is designed specifically for you. Our fit quiz at /en/fit will help you confirm your size in 60 seconds. If the frames still don't fit — we'll exchange them for free under our Fit Guarantee.",
  },
  {
    q: "Can I return the glasses if they don't suit me?",
    a: "Yes. You have 30 days to return them with no questions asked. We'll refund the full amount to your original payment method. Just send the frames back in the original packaging.",
  },
  {
    q: "How is Woolet different from cheaper wide-face glasses?",
    a: "Most brands offering wide frames (Fatheadz, BXL, Zenni) use TR90 plastic or cheap acetate. Woolet uses Italian Mazzucchelli acetate — the same material found in $500+ frames. We add 5-barrel PVD Gunmetal hinges, a 21mm keyhole bridge, and hand polishing. Premium quality at the Founding Member price of $114 (regular $190, save 40%).",
  },
  {
    q: "When will I receive my order?",
    a: "As a Founding Member, you'll receive your frames in the first production batch. Shipped via courier with full insurance and tracking. Estimated delivery: 5–7 business days (EU), 7–12 days (rest of world).",
  },
  {
    q: "Does Woolet offer prescription lenses (Rx)?",
    a: "Yes, Woolet frames are prescription-ready. You can have lenses fitted at any optician. The base curve 4 is compatible with most corrections. We're also planning a built-in Rx service in the future.",
  },
];

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// ---------------------------------------------------------------------------
// Per-guide FAQ sets — used to attach FAQPage JSON-LD to long-form guides.
// Keep answers concise, factual, citation-ready (good for AI Overviews / LLMs).
// ---------------------------------------------------------------------------

export const GUIDE_FAQS: Record<string, FaqItem[]> = {
  "glasses-for-wide-faces-guide": [
    {
      q: "What face width is considered wide for glasses?",
      a: "Anything above 145 mm temple-to-temple is wide. Standard eyewear frames cap at 135–145 mm of front width. Woolet starts at 158 mm and bespoke covers 150–172 mm.",
    },
    {
      q: "How do I measure my face width for glasses?",
      a: "Use a ruler or tape measure across the widest point of your face — usually cheekbone to cheekbone, just below the eyes. Record the value in millimetres. 155 mm and above is the Woolet 158 mm standard range; 150–172 mm is covered by bespoke.",
    },
    {
      q: "Why don't standard glasses fit wide faces?",
      a: "Most frames are built at 135–145 mm of total width, optimised for the average face. Above 145 mm the temples bow outward, the arms press against the sides of the head, and the optical centres misalign with the pupils. No adjustment fixes a frame that was never built for that measurement.",
    },
    {
      q: "What's the difference between Woolet and Zenni or Warby Parker wide frames?",
      a: "Zenni Extended Fit and Warby Parker Wide top out around 138–148 mm. Woolet starts at 158 mm and is built exclusively for wide faces in Italian Mazzucchelli acetate, hand-finished in Italy.",
    },
    {
      q: "Do Woolet frames work with prescription lenses?",
      a: "Yes. Both 007 (round) and 009 (soft square) accept single-vision, bifocal, and progressive Rx lenses. The 21–22 mm keyhole bridge accommodates the fitting height progressive lenses require.",
    },
  ],
  "best-sunglasses-for-wide-faces": [
    {
      q: "What sunglasses are best for wide faces?",
      a: "Frames at 155 mm of front width or wider. Mainstream sunglasses cap around 138–148 mm even on oversized models. Look for 158 mm fronts, 21–22 mm bridges and acetate construction that holds tension at wider dimensions.",
    },
    {
      q: "Are Woolet sunglasses polarised?",
      a: "Polarised lenses are available as an upgrade on both 007 and 009. Standard lenses are CR-39 with UV400 protection.",
    },
    {
      q: "How big is too big for sunglasses on a wide face?",
      a: "If the frame front is wider than 172 mm it starts to overhang the face. Woolet's standard 158 mm covers 155–161 mm faces; bespoke extends to 172 mm before overhang becomes a problem.",
    },
    {
      q: "Round or square sunglasses for a wide face?",
      a: "Both work at the right width. Round (007) softens a stronger jawline; soft-square (009) holds structure on rounder faces. Same 158 mm front in either shape.",
    },
    {
      q: "Can I get prescription sunglasses in wide-fit frames?",
      a: "Yes — both Woolet 007 and 009 accept prescription, polarised and gradient sun lenses with the same 158 mm front and 21–22 mm bridge.",
    },
  ],
  "how-to-measure-face-width-for-glasses": [
    {
      q: "How do I measure my face width for glasses at home?",
      a: "Stand in front of a mirror with a ruler held horizontally across the widest part of your face — usually cheekbone to cheekbone, just under the eyes. Record the measurement in millimetres. A credit card (85.6 mm) held up to the face is a useful reference.",
    },
    {
      q: "Where exactly do I measure — temples or cheekbones?",
      a: "Measure at the widest point. For most adults that's cheekbone-to-cheekbone; for some it's temple-to-temple just above the ears. Both produce a usable face-width number for frame sizing.",
    },
    {
      q: "What face width counts as wide for glasses?",
      a: "Above 145 mm. Standard frames cap at 135–145 mm of total width. 155 mm and above is wide-face territory — the Woolet 158 mm standard range.",
    },
    {
      q: "How accurate does the measurement need to be?",
      a: "Within ±2 mm is enough to pick the right size band. Woolet's FitLens scan uses your phone camera and a credit card for calibration to get to ±1 mm without a tape measure.",
    },
    {
      q: "What if my measurement falls between sizes?",
      a: "If you're between 150–154 mm or above 161 mm, you fall outside the 158 mm standard size. Woolet bespoke covers the full 150–172 mm range to the millimetre.",
    },
  ],
};

