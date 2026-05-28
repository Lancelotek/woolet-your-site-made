import CollectionPage from "@/components/CollectionPage";

const ExtraWideGlasses = () => (
  <CollectionPage
    slug="extra-wide-glasses"
    h1="Extra Wide Glasses — 158 mm Front, 21 mm Bridge"
    breadcrumbName="Extra Wide Glasses"
    metaTitle="Extra Wide Glasses — 158 mm Italian Acetate Frames | Woolet"
    metaDescription="Extra wide glasses engineered for 155 mm+ faces: 158 mm front, 21 mm bridge, Italian Mazzucchelli acetate. Bespoke 150–172 mm."
    intro="Most brands label a frame <em>extra wide</em> once it crosses 142 or 145 mm. That is still narrow for anyone whose face measures 155 mm or more. Woolet's standard front is 158 mm — properly extra wide — with a 21 mm keyhole bridge, in hand-finished Italian acetate."
    whyThisFits={[
      "Extra wide means different things at different brands. At mainstream retailers it usually means a slightly larger lens on the same 140 mm front, so the frame still pinches at the temples after an hour. Woolet scales front width and lens area together at 158 mm, so the geometry is consistent.",
      "Bridge width is the second variable most extra-wide listings ignore. A wider face usually has a wider nose; we use a 21 mm keyhole bridge (vs the 18–20 mm typical of mainstream wide frames) so the frame sits without riding up or leaving pressure marks.",
      "Both shapes — round 007 and soft-square 009 — are cut from Italian Mazzucchelli cellulose acetate, the same block material used by Persol and Tom Ford. Hand-finished in Italy, 5-barrel PVD Gunmetal hinges, 148 mm temples at 11°.",
      "Pricing: $133 founding-member pre-order, $190 at full launch. Confirm 158 mm is right for you with the <a href=\"/en/fit\" style=\"color:#A07A2A;\">AI Fit Wizard</a>, or run the <a href=\"/en/fit/manual\" style=\"color:#A07A2A;\">credit-card manual method</a>. Outside 155–161 mm? <a href=\"/en/fit/bespoke\" style=\"color:#A07A2A;\">Bespoke</a> covers 150 to 172 mm.",
    ]}
    faqs={[
      { question: "What counts as extra wide for glasses?", answer: "Anything above 150 mm of front width. Mainstream brands cap around 145–148 mm even on extra-wide models. Woolet's standard is 158 mm with bespoke up to 172 mm." },
      { question: "How do I know if I need extra wide?", answer: "Measure your face width temple-to-temple at eye level. 155 mm or above means standard frames will sit too narrow. The AI Fit Wizard does this in 30 seconds using a credit card for scale." },
      { question: "Are these for prescription or sunglasses?", answer: "Both. The frames accept single-vision, progressive, blue-light, and polarised sunglass lenses. Polarised is a paid upgrade." },
      { question: "What about the bridge — will it fit a wider nose?", answer: "The 21 mm keyhole bridge is wider than the 18–20 mm bridges typical of mainstream extra-wide frames, designed to distribute weight evenly on a wider nose." },
      { question: "Can I go wider than 158 mm?", answer: "Yes. Bespoke covers 150 to 172 mm of front width in either shape, with temples up to 155 mm. Hand-crafted from your scan." },
      { question: "How does pre-order shipping work?", answer: "Founding-member pre-orders ship in waves through 2026. The exact wave is shown on your order confirmation. Bespoke takes an additional 6 to 8 weeks." },
    ]}
  />
);

export default ExtraWideGlasses;
