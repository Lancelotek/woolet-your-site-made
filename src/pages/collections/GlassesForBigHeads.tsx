import CollectionPage from "@/components/CollectionPage";

/**
 * Hub for the "glasses for wide faces" / "glasses for big heads" topic.
 * Since 13.11.2026 it also carries the content of seven merged keyword
 * collections (extra wide, wide face, big frames, XXL, black, thick frame,
 * reading) - see MERGED_COLLECTION_SLUGS in src/seo/routeRedirects.ts.
 */

const TD = "padding:10px;border-bottom:1px solid #E0D5C5;";
const TH = "padding:10px;text-align:left;border-bottom:1px solid #A07A2A;";
const LINK = "color:#A07A2A;";

const WIDTH_TABLE = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
<thead><tr><th style="${TH}">Frame type</th><th style="${TH}">Front width</th><th style="${TH}">Face width it fits</th></tr></thead>
<tbody>
<tr><td style="${TD}">Standard frames</td><td style="${TD}">140–145 mm</td><td style="${TD}">Up to about 145 mm</td></tr>
<tr><td style="${TD}">"Wide" or extended fit at most brands</td><td style="${TD}">148–152 mm</td><td style="${TD}">Up to about 152 mm</td></tr>
<tr><td style="${TD}">Woolet 007 and 009</td><td style="${TD}">158 mm</td><td style="${TD}">155–161 mm</td></tr>
<tr><td style="${TD}">Woolet Bespoke</td><td style="${TD}">145–160 mm</td><td style="${TD}">Made to your measurement</td></tr>
</tbody></table>`;

const HEAD_TABLE = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
<thead><tr><th style="${TH}">Head circumference</th><th style="${TH}">Frame front</th><th style="${TH}">Woolet fit</th></tr></thead>
<tbody>
<tr><td style="${TD}">L · 58–60 cm</td><td style="${TD}">152–158 mm</td><td style="${TD}">158 mm standard fits the upper end; bespoke below it</td></tr>
<tr><td style="${TD}">XL · 60–62 cm</td><td style="${TD}">158–160 mm</td><td style="${TD}">158 mm standard, or bespoke up to 160 mm</td></tr>
<tr><td style="${TD}">XXL · 62 cm and above</td><td style="${TD}">160 mm or more</td><td style="${TD}">Widest Woolet front is 160 mm (bespoke) - measure first</td></tr>
</tbody></table>`;

const GlassesForBigHeads = () => (
  <CollectionPage
    slug="glasses-for-big-heads"
    h1="Glasses for Wide Faces and Big Heads"
    breadcrumbName="Glasses for Wide Faces and Big Heads"
    metaTitle="Glasses for Wide Faces & Big Heads - 158 mm Frames | Woolet"
    metaDescription="Glasses for wide faces and big heads: 158 mm front for 155-161 mm faces. Italian acetate, 25-26 mm bridge, two shapes. $114 pre-order, 30-day returns."
    colourGrid
    relatedSlugs={["sunglasses-for-big-heads", "wide-bridge-glasses", "blue-light-glasses-for-wide-faces"]}
    answerBlock={{
      heading: "What size glasses fit a wide face or a big head?",
      text: "A wide face measures 155 mm or more temple to temple; a big head is roughly 58 cm and up in circumference. Both need a frame front of about 158 mm. Woolet 007 and 009 are built at 158 mm for faces of 155–161 mm, and bespoke covers 145–160 mm.",
    }}
    intro="Most frames sold as wide stop at 148–152 mm, so the temples splay outward and the bridge slides down the nose. Woolet builds two shapes, round 007 and soft-square 009, with a 158 mm front, a 25–26 mm keyhole bridge and 150 mm temples. Italian Mazzucchelli acetate, hand made in EU, ready for prescription lenses."
    whyThisFits={[
      "<strong>The front is wide, not only the lens.</strong> Standard frames sit at 138–148 mm, so on a wide face the temples splay outward, the hinges take all the load, and the bridge slides down the nose within an hour. A 158 mm front spans a 155–161 mm face, so the frame rests on the nose and ears instead of gripping the temples.",
      "<strong>The bridge is wider too.</strong> A wider face usually has a wider nose. The 007 has a 26 mm keyhole bridge and the 009 a 25 mm keyhole bridge, against the 18–20 mm typical of mainstream wide frames, so the frame sits without riding up or leaving pressure marks.",
      "<strong>Acetate matters more at this size.</strong> Cellulose acetate holds the shape an optician sets; injection-moulded plastic loosens under heat, and a wider frame amplifies that drift. Both shapes are cut from Italian Mazzucchelli acetate and hand-finished in the EU, with 5-barrel PVD Gunmetal hinges.",
      "<strong>Prescription-ready, both shapes.</strong> Take them to any optician for single-vision, progressive or blue-light lenses. Lens area is 53 × 47.6 mm on the round 007 and 54 × 44 mm on the soft-square 009, which leaves room for a progressive corridor. Temples are 150 mm.",
      "<strong>Price and how to find your size.</strong> The shop is sold out until the Kickstarter campaign ends. A $1 reservation now locks the $114 founding-member price against the $190 MSRP. Confirm 158 mm is right for you with <a href=\"/en/fit\" style=\"color:#A07A2A;\">FitLens</a>, or use the <a href=\"/en/fit/manual\" style=\"color:#A07A2A;\">credit-card manual method</a>. Outside 155–161 mm, <a href=\"/en/fit/bespoke\" style=\"color:#A07A2A;\">Bespoke</a> covers 145 to 160 mm.",
      "<strong>Read the guides:</strong> <a href=\"/en/blog/glasses-for-wide-faces-guide\" style=\"color:#A07A2A;\">Glasses for wide faces: size chart and buying guide</a> · <a href=\"/en/blog/best-glasses-for-big-heads-2026\" style=\"color:#A07A2A;\">Best glasses for big heads in 2026, ranked by front width</a> · <a href=\"/en/blog/extra-wide-glasses-158mm\" style=\"color:#A07A2A;\">How wide is extra wide? The 158 mm answer</a>",
    ]}
    extraSections={[
      {
        heading: "How wide are wide frame glasses?",
        html: WIDTH_TABLE,
        paragraphs: [
          "Use total front width, measured outer edge to outer edge. The three numbers printed inside a temple show lens width, bridge width and temple length; they do not disclose the complete front.",
          "If you are between sizes, go to the next size up. A frame slightly wider than your head sits correctly; a frame narrower than your head pinches at the temples and slides on the bridge.",
        ],
      },
      {
        heading: "Sizing chart: head circumference to frame width",
        html: HEAD_TABLE,
        paragraphs: [
          "Head circumference is measured around the widest part, above the ears and across the brow. Frame front width is the outside-to-outside measurement across the two lenses.",
        ],
      },
      {
        heading: "Extra wide, extra large, XXL: what the labels mean",
        paragraphs: [
          "In this sizing scale, extra-wide means frames for faces measuring 145–154 mm. Faces measuring 155 mm or more are XL / specialty wide and need a purpose-built front; Woolet uses a 158 mm front for its 155–161 mm standard fit range.",
          "Extra large at most online opticians means a bigger lens on a standard front. Woolet frames measure 158 mm across the front with 150 mm temples, so prescription lenses sit centred on a face 155 mm or wider.",
        ],
      },
      {
        heading: "Oversized vs wide fit",
        paragraphs: [
          "Most oversized glasses get their size from the lenses, while the front stays close to standard width, so the arms still press on a wide face. Oversized is a look. 158 mm is a size.",
          "See the two shapes on their own: <a href=\"/en/collections/oversized-round-glasses\" style=\"" + LINK + "\">oversized round glasses</a> and <a href=\"/en/collections/oversized-square-glasses\" style=\"" + LINK + "\">oversized square glasses</a>.",
        ],
      },
      {
        heading: "Black, Havana and Silver Clear in 7 mm acetate",
        paragraphs: [
          "Most bold frames online sit at 3–5 mm of injected plastic and lose their edge after a few months of wear. Woolet is cut from 7 mm Italian Mazzucchelli acetate, so a thick frame stays thick.",
          "Black exaggerates every flaw in the acetate, every uneven bevel, every injection-mould seam. Woolet black frames are cut from a single block of acetate and hand-polished, so the surface stays deep and even instead of going grey at the edges.",
        ],
      },
      {
        heading: "Reading glasses on the same 158 mm front",
        paragraphs: [
          "Drugstore readers are almost always built on 135–142 mm fronts, fine for an average face and painful on a wide one. Woolet reading glasses use the same 158 mm fronts as the optical line, fitted with single-vision reading lenses from +1.00 to +3.00.",
        ],
      },
      {
        heading: "Who makes XXL frames?",
        paragraphs: [
          "Most direct-to-consumer eyewear brands cap their widest frame at around 148–152 mm, which is still narrow for a 60 cm+ head. The shortlist of brands that fit big heads is small: a few extended-fit collections at large optical retailers, a handful of specialist brands, and Woolet.",
          "Compare the published widths side by side: <a href=\"/en/compare/eyeshells-alternative\" style=\"" + LINK + "\">Woolet vs EYESHELLS</a> · <a href=\"/en/compare/fatheadz-alternative\" style=\"" + LINK + "\">Woolet vs Fatheadz</a> · <a href=\"/en/compare/zenni-alternative\" style=\"" + LINK + "\">Woolet vs Zenni</a> · <a href=\"/en/compare/warby-parker-alternative\" style=\"" + LINK + "\">Woolet vs Warby Parker</a>.",
        ],
      },
    ]}
    faqs={[
      { question: "How wide are wide frame glasses?", answer: "Standard frames measure 140–145 mm across the front. Frames sold as wide or extended fit usually stop at 148–152 mm. Woolet 007 and 009 measure 158 mm, built for faces of 155–161 mm." },
      { question: "What size glasses for a big head?", answer: "For a 58–60 cm head, a 152–158 mm front. For 60–62 cm, 158–160 mm. For 62 cm and above, 160 mm or more may be needed; the widest Woolet front is 160 mm (bespoke), so measure first. Woolet's standard 158 mm front covers most large to XL heads." },
      { question: "What head size is considered big for glasses?", answer: "Roughly 58 cm and up. 58–60 cm is large, 60–62 cm is XL, above 62 cm is XXL. Mainstream frames at 138–148 mm pinch at any of these sizes." },
      { question: "How do I know if I have a wide face?", answer: "Measure temple to temple at eye level with a ruler, or let your phone camera measure it with FitLens in 60 seconds. 155 mm or more is a wide face." },
      { question: "What counts as extra wide for glasses?", answer: "Extra-wide means frames for faces measuring 145–154 mm. Faces measuring 155 mm or more are XL / specialty wide; Woolet's standard front is 158 mm, with bespoke available from 145–160 mm." },
      { question: "How is this different from oversized glasses?", answer: "Oversized at most brands means a larger lens on the same 138–148 mm front. Woolet's front itself is 158 mm. Lens and front scale together, so the frame fits the head, not just the eyes." },
      { question: "Can I get prescription or progressive lenses fitted?", answer: "Yes. Both shapes ship with demo lenses, ready for any optician to fit single-vision, progressive or blue-light lenses. The 53 × 47.6 mm lens area on 007 and 54 × 44 mm on 009 leave room for a progressive corridor." },
      { question: "Do you make wide frame reading glasses?", answer: "Yes. Reading glasses use the same 158 mm fronts, fitted with single-vision reading lenses from +1.00 to +3.00." },
      { question: "What about the bridge - will it fit a wider nose?", answer: "The 007 has a 26 mm keyhole bridge and the 009 has a 25 mm keyhole bridge. Both are designed to distribute weight on a wider nose without pinching." },
      { question: "What if 158 mm is too wide or too narrow for me?", answer: "Bespoke covers 145 to 160 mm of front width in either shape, with a 20–26 mm bridge and temples up to 155 mm. Same Italian Mazzucchelli acetate, hand made in EU to your measurement." },
      { question: "How thick are Woolet frames?", answer: "Both shapes are cut from 7 mm Italian Mazzucchelli acetate. Most bold frames online sit at 3–5 mm of injected plastic." },
      { question: "What do they cost and can I return them?", answer: "$114 is the founding-member price, locked with a $1 reservation; $190 at full launch. Shipping is free and you have 30 days to return." },
    ]}
  />
);

export default GlassesForBigHeads;
