import CollectionPage from "@/components/CollectionPage";

const SPEC_TABLE = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
<thead><tr style="background:#F8F6F1;"><th style="padding:10px;text-align:left;">Frame</th><th style="padding:10px;text-align:right;">Front width</th><th style="padding:10px;text-align:right;">Bridge</th><th style="padding:10px;text-align:right;">Lens</th><th style="padding:10px;text-align:right;">Temple</th></tr></thead>
<tbody>
<tr style="border-top:1px solid #E0D5C5;"><td style="padding:10px;"><a href="/en/products/007" style="color:#A07A2A;">Woolet 007 Round / Panto</a></td><td style="padding:10px;text-align:right;">158 mm</td><td style="padding:10px;text-align:right;">21 mm</td><td style="padding:10px;text-align:right;">52 × 52 mm</td><td style="padding:10px;text-align:right;">150 mm</td></tr>
<tr style="border-top:1px solid #E0D5C5;"><td style="padding:10px;"><a href="/en/products/009" style="color:#A07A2A;">Woolet 009 Soft Square</a></td><td style="padding:10px;text-align:right;">158 mm</td><td style="padding:10px;text-align:right;">22 mm</td><td style="padding:10px;text-align:right;">54 × 50 mm</td><td style="padding:10px;text-align:right;">150 mm</td></tr>
</tbody></table>`;

const BigGlassesFrames = () => (
  <CollectionPage
    slug="big-glasses-frames"
    breadcrumbName="Oversized Glasses"
    h1="Oversized Glasses That Fit a 155 mm+ Face"
    metaTitle="Oversized Glasses for Wide Faces: 158 mm Frames | Woolet"
    metaDescription="Oversized is a look. 158 mm is a size. Round and square frames 158 mm across with 150 mm temples, for faces 155 mm+. From $190. Measure in 20 s."
    intro="Most oversized glasses get their size from the lenses, while the front stays close to standard width, so the arms still press on a wide face. Woolet frames measure 158 mm across the front with 150 mm temples, in two shapes: 007 Round and 009 Soft Square. Italian Mazzucchelli acetate, hand made in EU, from $190."
    whyThisFits={[
      "<strong>Big lenses, same squeeze.</strong> Oversized is a style label, not a size. The number that decides fit is front width, hinge to hinge. Woolet's is 158 mm, built for faces 155-161 mm temple to temple.",
      "<strong>Arms that reach your ears.</strong> 150 mm temples clear the widest part of a larger head before they bend, so the bend sits behind the ear instead of pressing above it.",
      "<strong>A bridge for a wider nose.</strong> 21 mm on the 007 Round, 22 mm on the 009 Soft Square.",
      "<strong>Italian Mazzucchelli acetate, hand made in EU.</strong> Acetate holds the shape an optician sets, which matters more the wider the frame.",
      "<strong>Eyeglasses $190. Sunglasses, blue light or readers $210.</strong> Outside 155-161 mm? <a href=\"/en/bespoke\" style=\"color:#A07A2A;\">Bespoke</a> covers any width from 145 to 172 mm, hand made in Greece. Check your width with <a href=\"/en/fit\" style=\"color:#A07A2A;\">FitLens</a> in 20 seconds.",
    ]}
    extraSections={[
      {
        heading: "Oversized vs wide fit: the numbers",
        html: SPEC_TABLE,
        paragraphs: [
          "Any frame you already own tells you its size. The three numbers on the inside of the temple are lens width, bridge and temple length, for example 54□18-145. They do not include the rims, so estimate the front: two lenses plus the bridge plus about 6 mm. 54 + 54 + 18 + 6 = 132 mm.",
          "Measure your face temple to temple. At 155 mm or more, a 132 mm front leaves the arms bent outward, however large the lenses look. Full method: <a href=\"/en/blog/how-to-measure-face-width-for-glasses\" style=\"color:#A07A2A;\">how to measure face width for glasses</a>.",
        ],
      },
      {
        heading: "Which oversized shape suits your face",
        paragraphs: [
          "<strong>007 Round / Panto</strong> softens a square jaw and a strong brow. The 52 mm lens height gives a full, classic oversized look.",
          "<strong>009 Soft Square</strong> adds structure to a round or full face. The 54 mm lens width reads wide without looking heavy.",
          "Not sure? <a href=\"/en/blog/round-vs-square-glasses-wide-face\" style=\"color:#A07A2A;\">Round vs square glasses for a wide face</a> walks through the rule and the exceptions.",
        ],
      },
      {
        heading: "Oversized collections by shape and lens",
        paragraphs: [
          "<a href=\"/en/collections/oversized-square-glasses\" style=\"color:#A07A2A;\">Oversized square glasses</a> · <a href=\"/en/collections/oversized-round-glasses\" style=\"color:#A07A2A;\">Oversized round glasses</a> · <a href=\"/en/collections/oversized-black-glasses\" style=\"color:#A07A2A;\">Oversized black glasses</a> · <a href=\"/en/collections/oversized-sunglasses-men\" style=\"color:#A07A2A;\">Oversized sunglasses for men</a> · <a href=\"/en/collections/blue-light-glasses-for-wide-faces\" style=\"color:#A07A2A;\">Oversized blue light glasses</a>",
        ],
      },
    ]}
    faqs={[
      {
        question: "What size are oversized glasses?",
        answer:
          "There is no standard size. Oversized describes the lenses and the look, not the front width. Read the numbers on the temple, add two lens widths, the bridge and about 6 mm for the rims, and you get the front width. For a face 155 mm or wider, look for a front of 155 mm or more. Woolet frames are 158 mm.",
      },
      {
        question: "Who looks good in oversized glasses?",
        answer:
          "Oversized frames suit larger features, strong jaws and wide faces, because the frame scale matches the face. Fit matters more than face shape: the front should be as wide as your face at the temples, with no gap and no pressure.",
      },
      {
        question: "What are oversized glasses called?",
        answer:
          "Retailers use oversized, big frame, XL, extra large and wide fit. Only wide fit and XL usually say something about front width. Oversized and big frame usually describe the lenses, so check the millimetres before you buy.",
      },
      {
        question: "Where can I buy oversized glasses for a big head?",
        answer:
          "Look for a listed front width of 150 mm or more rather than the word oversized. Woolet 007 and 009 are 158 mm with 150 mm temples, and Bespoke covers any width from 145 to 172 mm.",
      },
      {
        question: "Can I put prescription lenses in Woolet oversized glasses?",
        answer:
          "Yes. The $190 eyeglasses ship with demo lenses cut for the 158 mm front, ready for your optician to fit single-vision or progressive lenses. Sunglasses (UV400), blue light and readers are $210.",
      },
      {
        question: "What if 158 mm is too wide or too narrow for me?",
        answer:
          "Bespoke is built to your measurement: any front width from 145 to 172 mm, four frame shapes, hand made in Greece. Production takes 2 weeks after you approve the 3D model.",
      },
    ]}
  />
);

export default BigGlassesFrames;
