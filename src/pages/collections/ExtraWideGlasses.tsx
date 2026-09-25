import CollectionPage from "@/components/CollectionPage";

const WIDTH_TABLE = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
<thead><tr><th style="padding:10px;text-align:left;border-bottom:1px solid #A07A2A;">Face width (mm)</th><th style="padding:10px;text-align:left;border-bottom:1px solid #A07A2A;">Frame front (mm)</th><th style="padding:10px;text-align:left;border-bottom:1px solid #A07A2A;">Fit route</th></tr></thead>
<tbody><tr><td style="padding:10px;border-bottom:1px solid #E0D5C5;">145–154 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">145–157 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">Bespoke</td></tr><tr><td style="padding:10px;border-bottom:1px solid #E0D5C5;">155–161 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">158 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">Standard 007 or 009</td></tr><tr><td style="padding:10px;border-bottom:1px solid #E0D5C5;">162–172 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">162–172 mm</td><td style="padding:10px;border-bottom:1px solid #E0D5C5;">Bespoke</td></tr></tbody></table>`;

const ExtraWideGlasses = () => (
  <CollectionPage
    slug="extra-wide-glasses"
    h1="Extra Wide Glasses — Wide Eyeglass Frames 158 mm"
    breadcrumbName="Extra Wide Glasses"
    metaTitle="Extra Wide Glasses & Wide Eyeglass Frames 158 mm | Woolet"
    metaDescription="Extra wide glasses and wide eyeglass frames for 155 mm+ faces: 158 mm front, 21 mm keyhole bridge, Italian acetate. Bespoke 145–172 mm."
    answerBlock={{
      heading: "What counts as extra wide glasses?",
      text: "Extra wide glasses have a total front width of at least 150 mm. Faces measuring 155 mm or more usually need a purpose-built extra-wide fit; Woolet's standard front is 158 mm for the 155–161 mm face range.",
    }}
    intro="Most brands label a frame extra wide once it crosses 142 or 145 mm. That is still narrow for anyone whose face measures 155 mm or more. Woolet's standard front is 158 mm with a 21 mm bridge on 007 and 22 mm on 009, hand made in EU from Italian Mazzucchelli acetate."
    whyThisFits={[
      "Extra wide means different things at different brands. At mainstream retailers it usually means a slightly larger lens on the same 140 mm front, so the frame still pinches at the temples after an hour. Woolet scales front width and lens area together at 158 mm, so the geometry is consistent.",
      "Bridge width is the second variable most extra-wide listings ignore. A wider face usually has a wider nose; we use a 21 mm keyhole bridge (vs the 18–20 mm typical of mainstream wide frames) so the frame sits without riding up or leaving pressure marks.",
      "Both shapes — round 007 and soft-square 009 — are cut from Italian Mazzucchelli cellulose acetate. Hand made in EU, 5-barrel PVD Gunmetal hinges and 150 mm temples. Their generous 52 × 52 mm and 54 × 50 mm lens areas are ready for single-vision or progressive prescription lenses.",
      "The shop is sold out until the Kickstarter campaign ends. A $1 reservation now locks the $114 founding-member price against the $190 MSRP. Confirm 158 mm is right for you with <a href=\"/en/fit\" style=\"color:#A07A2A;\">FitLens</a>. Outside 155–161 mm, <a href=\"/en/fit/bespoke\" style=\"color:#A07A2A;\">Bespoke</a> covers 145 to 172 mm.",
    ]}
    extraSections={[{
      heading: "Extra-wide frame widths",
      html: WIDTH_TABLE,
      paragraphs: [
        "Use total front width, measured outer edge to outer edge. The three numbers printed inside a temple show lens width, bridge width and temple length; they do not disclose the complete front.",
        "Both standard shapes accept single-vision, progressive, blue-light and UV400 sun lenses. The frame geometry remains 158 mm regardless of lens choice.",
      ],
    }]}
    faqs={[
      { question: "What counts as extra wide for glasses?", answer: "Anything above 150 mm of front width. Mainstream brands cap around 145–148 mm even on extra-wide models. Woolet's standard is 158 mm with bespoke from 145–172 mm." },
      { question: "How do I know if I need extra wide?", answer: "Measure your face width temple-to-temple at eye level. 155 mm or above means standard frames will sit too narrow. The AI Fit Wizard does this in 30 seconds using a credit card for scale." },
      { question: "Are these for prescription or sunglasses?", answer: "Both. The frames accept single-vision, progressive, blue-light, and polarised sunglass lenses. Polarised is a paid upgrade." },
      { question: "What about the bridge — will it fit a wider nose?", answer: "The 007 has a 21 mm keyhole bridge and the 009 has a 22 mm keyhole bridge. Both are designed to distribute weight on a wider nose without pinching." },
      { question: "Can I go wider than 158 mm?", answer: "Yes. Bespoke covers 145 to 172 mm of front width in either shape, with temples up to 155 mm. Hand-crafted from your scan." },
      { question: "Can extra-wide frames take progressive lenses?", answer: "Yes. The 52 × 52 mm lens area on 007 and 54 × 50 mm area on 009 leave room for a progressive corridor. An optician can also fit single-vision lenses." },
    ]}
  />
);

export default ExtraWideGlasses;
