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
