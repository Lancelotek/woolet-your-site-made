import CollectionPage from "@/components/CollectionPage";

const WideFaceGlasses = () => (
  <CollectionPage
    slug="wide-face-glasses"
    h1="Wide-Face Glasses Built for 155 mm+ Temples"
    breadcrumbName="Wide-Face Glasses"
    metaTitle="Wide-Face Glasses — Italian Acetate, 155 / 158 / 161 mm | Woolet"
    metaDescription="Wide-face glasses engineered above 155 mm. Italian Mazzucchelli acetate, three measured sizes per shape, plus bespoke. From $133 pre-order."
    intro="Most premium eyewear stops at 148 mm. Woolet starts at 155 mm. Each shape — the 007 round and the 009 soft square — is offered in three measured sizes (155 / 158 / 161 mm) plus a bespoke tier from 150 to 172 mm, all cut from Italian Mazzucchelli acetate and hand-finished in Italy."
    whyThisFits={[
      "The eyewear industry runs on a 130–148 mm bell curve. If your temples sit at 155 mm or above, mainstream <em>wide</em> frames are still narrow — they pinch, leave marks, and slide forward through the day. The fix is not adjustment. The fix is a frame that was engineered at your width from the first sketch.",
      "Woolet's three measured sizes — 155, 158 and 161 mm — cover most adults in the 152–168 mm face-width range. Each one is a discrete mould, not a stretched copy of a smaller frame. Bridges scale (19 / 21 / 23 mm), lens area scales, temple geometry scales. The result feels balanced rather than oversized.",
      "If your face sits outside that range, the <a href=\"/en/fit/bespoke\" style=\"color:#A07A2A;\">bespoke tier</a> goes from 150 to 172 mm. Same Italian Mazzucchelli acetate, same hand-finishing — just measured to you. Run the <a href=\"/en/fit\" style=\"color:#A07A2A;\">AI Fit Wizard</a> first; it tells you which of the four routes (S / M / L / bespoke) is yours.",
      "Pricing is honest: $133 for founding members at pre-order, $190 at full launch. No fake discounts, no inflated MSRP. The same price applies to either shape, in any of the three sizes.",
    ]}
    faqs={[
      { question: "How do I know if I have a wide face?", answer: "Measure temple to temple at the widest point with a flexible tape or ruler. If you read 155 mm or more, mainstream frames will compress your temples. Our AI Fit Wizard does the same measurement from a single front-facing photo." },
      { question: "What is temple width and why does 158 mm matter?", answer: "Temple width is the total front width of the frame, measured hinge to hinge. 158 mm is Woolet's middle size and the sweet spot for face widths around 155–161 mm. Above and below that, the 155 mm and 161 mm sizes pick up the range, with bespoke beyond." },
      { question: "Are Woolet frames adjustable after purchase?", answer: "Yes — any qualified optician can do micro-adjustments on the temples and nose pads. But adjustment cannot add real width to a frame that was molded too narrow. Starting from the correct size is the only way to a clean, all-day fit." },
      { question: "Can I get prescription lenses?", answer: "Yes. Woolet frames accept standard single-vision and progressive Rx lenses. Take your prescription and the frame to your optician — frame width does not affect lens compatibility." },
      { question: "How long does pre-order shipping take?", answer: "Founding-member pre-orders ship in waves through 2026. You will see your wave assignment in the confirmation email and on the thank-you page after checkout." },
      { question: "What if my size is wrong when the frames arrive?", answer: "We offer a 30-day return window. If the AI Fit Wizard recommended a size that does not feel right in person, exchange it for the next size up or down, or move to bespoke." },
    ]}
  />
);

export default WideFaceGlasses;
