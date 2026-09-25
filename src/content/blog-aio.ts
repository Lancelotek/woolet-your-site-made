export const BLOG_AIO_UPDATED = "2026-09-25";

type BlogAioEnhancement = {
  quickAnswer: string;
  question: string;
  directAnswer: string;
  anchor: string;
  linkSentence: string;
  table?: string;
};

const tableStyle = "width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;";
const thStyle = "text-align:left;padding:10px 12px;border-bottom:1px solid #C2A05A;";
const tdStyle = "padding:10px 12px;border-bottom:1px solid #2A251C;";

export const BLOG_AIO_ENHANCEMENTS: Record<string, BlogAioEnhancement> = {
  "how-to-tell-if-your-face-is-wide-or-narrow": {
    quickAnswer: "For eyewear sizing, a face under 130 mm is Narrow; 130–137 mm is Standard; 138–144 mm is Wide; 145–154 mm is Extra-wide; and 155 mm or more is XL / specialty wide. Measure temple to temple, then compare that number with total frame front width rather than lens width.",
    question: "How wide is a wide face?",
    directAnswer: "A face under 130 mm is Narrow, 130–137 mm is Standard, 138–144 mm is Wide, 145–154 mm is Extra-wide, and 155 mm or more is XL / specialty wide.",
    anchor: "extra wide glasses",
    linkSentence: "If your measurement is 155 mm or above, compare it with our guide to <a href=\"/en/collections/extra-wide-glasses\">extra wide glasses</a> before choosing a frame.",
  },
  "round-vs-square-glasses-wide-face": {
    quickAnswer: "Square glasses add definition to a round wide face, while round glasses soften angular features; either shape must still match the face in width. For a face measuring 155 mm or more, start with a front near 158 mm, then choose square or round according to the contrast you want.",
    question: "Are round or square glasses better for a wide face?",
    directAnswer: "Square glasses usually add structure, while round glasses soften angles, but both need a front width close to the wearer's measurement.",
    anchor: "extra wide eyeglass frames",
    linkSentence: "See the available shapes among our <a href=\"/en/collections/extra-wide-glasses\">extra wide eyeglass frames</a> after you choose the visual effect you prefer.",
    table: `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Face shape</th><th style="${thStyle}">Frame shape</th><th style="${thStyle}">Minimum front width (mm)</th></tr></thead><tbody><tr><td style="${tdStyle}">Round</td><td style="${tdStyle}">Soft square</td><td style="${tdStyle}">Match measured face width</td></tr><tr><td style="${tdStyle}">Angular</td><td style="${tdStyle}">Round / panto</td><td style="${tdStyle}">Match measured face width</td></tr><tr><td style="${tdStyle}">Wide, 155 mm+</td><td style="${tdStyle}">Either</td><td style="${tdStyle}">155 mm+</td></tr></tbody></table>`,
  },
  "eyeglass-frame-size-chart": {
    quickAnswer: "Eyeglass frame sizes run from roughly 122 mm at XS to about 150 mm at XXL, measured across the total front. Match the frame front to your face within about 3 mm; faces measuring 155–161 mm sit beyond the standard chart and need a front around 158 mm.",
    question: "What eyeglass frame size matches my face width?",
    directAnswer: "Choose a total frame front within about 3 mm of your temple-to-temple face width.",
    anchor: "frames for 155 mm and wider faces",
    linkSentence: "The standard chart ends before our <a href=\"/en/collections/extra-wide-glasses\">frames for 155 mm and wider faces</a>, which start with a 158 mm front.",
  },
  "glasses-for-wide-faces-guide": {
    quickAnswer: "A face measuring 155 mm or more needs a frame with a total front width of at least 155 mm; a 158 mm front fits the common 155–161 mm range. Measure temple to temple and ignore vague labels such as wide or oversized unless the product page publishes total front width.",
    question: "What frame width fits a wide face?",
    directAnswer: "A wide face needs a frame front close to its temple-to-temple width, with 158 mm fitting the 155–161 mm range.",
    anchor: "genuinely extra wide glasses",
    linkSentence: "Use the measurements on our <a href=\"/en/collections/extra-wide-glasses\">genuinely extra wide glasses</a> page as a practical reference when comparing brands.",
  },
  "numbers-on-glasses-frames-meaning": {
    quickAnswer: "The three numbers on glasses mean lens width, bridge width and temple length, all in millimetres; 52□21-150 means a 52 mm lens, 21 mm bridge and 150 mm temple. They do not state total front width, so measure the frame outer edge to outer edge before judging fit.",
    question: "What do the three numbers on glasses mean?",
    directAnswer: "The three numbers show lens width, bridge width and temple length in millimetres, not the frame's total front width.",
    anchor: "158 mm extra wide frames",
    linkSentence: "For a complete published front measurement, compare those markings with our <a href=\"/en/collections/extra-wide-glasses\">158 mm extra wide frames</a>.",
  },
  "how-to-measure-face-width-for-glasses": {
    quickAnswer: "Measure face width in millimetres from temple to temple across the widest point, keeping the ruler level and looking straight ahead. Under 130 mm is Narrow, 130–137 mm is Standard, 138–144 mm is Wide, 145–154 mm is Extra-wide, and 155 mm or more is XL / specialty wide.",
    question: "How do you measure face width for glasses?",
    directAnswer: "Measure horizontally from temple to temple at the widest point and record the result in millimetres.",
    anchor: "glasses built for wider faces",
    linkSentence: "Once you have the number, compare it with <a href=\"/en/collections/extra-wide-glasses\">glasses built for wider faces</a> rather than relying on a retailer's size label.",
  },
  "are-my-glasses-too-small-for-my-face": {
    quickAnswer: "Glasses are too small when the temples bow outward, the frame leaves marks in front of your ears, or pressure builds at the sides within one to two hours. Compare face width with total frame width; lens width alone cannot show whether the overall frame fits.",
    question: "How can I tell if my glasses are too small?",
    directAnswer: "Your glasses are too small if the arms bow outward at the hinges, the frame leaves pressure marks, or it pinches within one to two hours.",
    anchor: "properly sized extra wide frames",
    linkSentence: "If the mismatch is structural, review <a href=\"/en/collections/extra-wide-glasses\">properly sized extra wide frames</a> instead of repeatedly adjusting the arms.",
    table: `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Observed sign</th><th style="${thStyle}">Measurement check</th><th style="${thStyle}">Likely cause</th></tr></thead><tbody><tr><td style="${tdStyle}">Arms bow outward</td><td style="${tdStyle}">Compare face and front widths</td><td style="${tdStyle}">Front too small</td></tr><tr><td style="${tdStyle}">Marks at temples</td><td style="${tdStyle}">Compare face and front widths</td><td style="${tdStyle}">Side pressure</td></tr><tr><td style="${tdStyle}">Pain behind ears</td><td style="${tdStyle}">Check temple length</td><td style="${tdStyle}">Arm bend or length</td></tr></tbody></table>`,
  },
  "glasses-for-wide-nose-bridge-21-22mm-explained": {
    quickAnswer: "A 21–22 mm bridge is a useful starting point for a wider nose when common 17–19 mm bridges pinch, sit high or leave pressure marks. Bridge width is the gap between the lenses, not total frame width, so it must be evaluated alongside the full front measurement.",
    question: "What bridge width fits a wide nose?",
    directAnswer: "A 21–22 mm bridge often fits a wider nose better than the common 17–19 mm range, provided the bridge shape also matches.",
    anchor: "extra wide frames with wider bridges",
    linkSentence: "Compare both measurements on our <a href=\"/en/collections/extra-wide-glasses\">extra wide frames with wider bridges</a> page.",
    table: `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Bridge width (mm)</th><th style="${thStyle}">Typical fit</th><th style="${thStyle}">What to check</th></tr></thead><tbody><tr><td style="${tdStyle}">17–19 mm</td><td style="${tdStyle}">Mainstream range</td><td style="${tdStyle}">Pinching or high sitting</td></tr><tr><td style="${tdStyle}">20 mm</td><td style="${tdStyle}">Bespoke lower range</td><td style="${tdStyle}">Bridge shape</td></tr><tr><td style="${tdStyle}">21–22 mm</td><td style="${tdStyle}">Wider nose starting point</td><td style="${tdStyle}">Keyhole contact</td></tr><tr><td style="${tdStyle}">23–24 mm</td><td style="${tdStyle}">Bespoke wider range</td><td style="${tdStyle}">Custom measurement</td></tr></tbody></table>`,
  },
  "what-size-glasses-for-a-large-head": {
    quickAnswer: "For a large head, choose glasses by measured face width: 150–154 mm usually needs an extra-large front, while 155–161 mm is best matched by a front around 158 mm. The printed lens-bridge-temple code does not reveal total width, so measure the frame across its outer edges.",
    question: "What size glasses fit a large head?",
    directAnswer: "A 155–161 mm face generally fits a frame front around 158 mm, while other widths should be matched as closely as possible.",
    anchor: "wide glasses measured in millimetres",
    linkSentence: "Compare your result with <a href=\"/en/collections/extra-wide-glasses\">wide glasses measured in millimetres</a> before buying by an XL label.",
    table: `<table style="${tableStyle}"><thead><tr><th style="${thStyle}">Face width (mm)</th><th style="${thStyle}">Suggested front width (mm)</th><th style="${thStyle}">Fit category</th></tr></thead><tbody><tr><td style="${tdStyle}">140–149 mm</td><td style="${tdStyle}">Within about 3 mm</td><td style="${tdStyle}">Large-average</td></tr><tr><td style="${tdStyle}">150–154 mm</td><td style="${tdStyle}">150–157 mm</td><td style="${tdStyle}">Extra large</td></tr><tr><td style="${tdStyle}">155–161 mm</td><td style="${tdStyle}">158 mm</td><td style="${tdStyle}">Specialty wide</td></tr><tr><td style="${tdStyle}">162–172 mm</td><td style="${tdStyle}">Made to measure</td><td style="${tdStyle}">Bespoke</td></tr></tbody></table>`,
  },
  "what-size-sunglasses-for-wide-faces": {
    quickAnswer: "Wide-face sunglasses should match temple-to-temple width, with a 155–161 mm face typically needing a front around 158 mm. Sunglass lenses may be larger for coverage, but lens width is not total frame width; check the outer edge-to-outer edge measurement and bridge width before buying.",
    question: "What size sunglasses fit a wide face?",
    directAnswer: "A face measuring 155–161 mm generally needs sunglasses with a total front width around 158 mm.",
    anchor: "extra wide sunglasses-ready frames",
    linkSentence: "The same sizing logic applies to our <a href=\"/en/collections/extra-wide-glasses\">extra wide sunglasses-ready frames</a> with UV400 lens options.",
  },
};

export function enrichBlogContent(slug: string, content: string): string {
  const enhancement = BLOG_AIO_ENHANCEMENTS[slug];
  if (!enhancement) return content;
  const section = `<h2>${enhancement.question}</h2>\n<p>${enhancement.directAnswer}</p>\n${enhancement.table ?? ""}\n<p>${enhancement.linkSentence}</p>`;
  return `${section}\n${content}`;
}

export function blogModifiedDate(slug: string, publishedDate: string): string {
  return BLOG_AIO_ENHANCEMENTS[slug] ? BLOG_AIO_UPDATED : publishedDate;
}