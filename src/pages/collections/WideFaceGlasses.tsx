import CollectionPage from "@/components/CollectionPage";

const WideFaceGlasses = () => (
  <CollectionPage
    slug="wide-face-glasses"
    h1="Glasses for Wide Faces — Frames for Wide Faces 155 mm+"
    breadcrumbName="Glasses for Wide Faces"
    metaTitle="Glasses for Wide Faces — Wide Frames 155 mm+ | Woolet"
    metaDescription="Glasses for wide faces and large faces: 158 mm front, 21 mm keyhole bridge, Italian acetate. Extended fit, prescription-ready, bespoke to 162 mm."
    intro="Most premium eyewear stops at 148 mm. Woolet starts at 158 mm. Each shape — the 007 round and the 009 soft square — is offered in one precise off-the-shelf size (158 mm front with a 21 mm bridge), plus a bespoke tier from 145 to 162 mm. All cut from Italian Mazzucchelli acetate and Hand made in EU."
    whyThisFits={[
      "The eyewear industry runs on a 130–148 mm bell curve. If your temples sit at 155 mm or above, mainstream <em>wide</em> frames are still narrow — they pinch, leave marks, and slide forward through the day. The fix is not adjustment. The fix is a frame engineered for your width from the first sketch.",
      "Woolet's standard 158 mm size — with a 21 mm keyhole bridge — covers most adults in the 155–161 mm face-width range. The mould is purpose-built at that width, not a stretched copy of a smaller frame. Bridge geometry, lens area and temple length are all balanced around it. The result feels precise rather than oversized.",
      "If your face sits outside that range, the <a href=\"/en/fit/bespoke\" style=\"color:#A07A2A;\">bespoke tier</a> goes from 145 to 162 mm with a fixed 21 mm bridge. Same Italian Mazzucchelli acetate, same hand-finishing — just measured to you. Run the <a href=\"/en/fit\" style=\"color:#A07A2A;\">AI Fit Wizard</a> first; it tells you whether you fit the standard 158 mm or the bespoke route.",
      "Pricing is honest: $114 for founding members at pre-order, $190 at full launch. No fake discounts, no inflated MSRP. The same price applies to either shape.",
    ]}
    faqs={[
      { question: "How do I know if I have a wide face?", answer: "Measure temple to temple at the widest point with a flexible tape or ruler. If you read 155 mm or more, mainstream frames will compress your temples. Our AI Fit Wizard does the same measurement from a single front-facing photo." },
      { question: "What is temple width and why does 158 mm matter?", answer: "Temple width is the total front width of the frame, measured hinge to hinge. 158 mm is Woolet's precise standard — engineered as the sweet spot for face widths around 155–161 mm. Outside that range, the bespoke tier (145–172 mm) takes over." },
      { question: "Are Woolet frames adjustable after purchase?", answer: "Yes — any qualified optician can do micro-adjustments on the temples and nose pads. But adjustment cannot add real width to a frame that was molded too narrow. Starting from the correct size is the only way to a clean, all-day fit." },
      { question: "Can I get prescription lenses?", answer: "Yes. Woolet frames accept standard single-vision and progressive Rx lenses. Take your prescription and the frame to your optician — frame width does not affect lens compatibility." },
      { question: "How long does pre-order shipping take?", answer: "Founding-member pre-orders ship in waves through 2026. You will see your wave assignment in the confirmation email and on the thank-you page after checkout." },
      { question: "What if the fit is wrong when the frames arrive?", answer: "We offer a 30-day return window. If 158 mm does not feel right in person, exchange for bespoke or refund." },
    ]}
  />
);

export default WideFaceGlasses;
