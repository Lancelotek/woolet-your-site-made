export const wooletColumn: Record<string, string> = {
  "Designed for": "Wide faces first — every frame engineered for 145–162 mm faces",
  "Fit range": "145–162 mm (Bespoke tier), frames built from scratch for wide faces",
  "Material": "Mazzucchelli 1849 bio-acetate, Hand Finished in the EU",
  "Fit technology": "FitLens — 20-second phone face scan that confirms your fit before you buy",
  "Made to order": "Yes — bespoke sizing, optional laser engraving",
  "Fit guarantee": "30-day fit guarantee",
  "Shipping": "Free worldwide shipping",
  "Price": "From $190",
};

export interface MeasurementRow {
  label: string;
  woolet: string;
  competitor: string;
  note?: string;
}

export interface Competitor {
  slug: string;
  /** Extra URLs that should resolve to this page (301 / canonical redirect). */
  aliases?: string[];
  name: string;
  keyword: string;
  seoTitle: string;
  metaDescription: string;
  heroH1: string;
  heroSub: string;
  verdict: string;
  table: Record<string, string>;
  /** Optional millimetre-level spec comparison rendered above the feature table. */
  measurements?: { intro: string; rows: MeasurementRow[] };
  fitRange: { min: number; max: number; label: string };
  advantages: { title: string; text: string }[];
  whereTheyWin: string[];
  faqs: { q: string; a: string }[];
}

/** Resolve a URL slug (canonical or alias) to its canonical competitor slug. */
export const resolveCompetitorSlug = (slug?: string): string | undefined => {
  if (!slug) return undefined;
  if (competitors.some((c) => c.slug === slug)) return slug;
  return competitors.find((c) => c.aliases?.includes(slug))?.slug;
};


export const competitors: Competitor[] = [
  {
    slug: "fatheadz-alternative",
    name: "Fatheadz",
    keyword: "Fatheadz alternative",
    seoTitle: "Fatheadz Alternative for Wide Faces: Woolet vs Fatheadz (2026)",
    metaDescription:
      "Looking for a Fatheadz alternative? Compare Fatheadz vs Woolet — Italian Mazzucchelli acetate, frames engineered for 145–162mm faces, and a 20-second fit scan.",
    heroH1: "Fatheadz Alternative for Wide Faces & Big Heads",
    heroSub:
      "Fatheadz proved that big heads deserve real eyewear. Woolet takes the same mission upmarket: Mazzucchelli 1849 acetate, bespoke sizing for 145–162 mm faces, and a fit you can verify with a 20-second phone scan.",
    verdict:
      "Choose Fatheadz if you want a proven, affordable oversized frame for sport and everyday utility. Choose Woolet if you want the wide-face fit <em>and</em> the craftsmanship of a premium Italian frame — designed from scratch for your measurements, not scaled up from a standard mold.",
    table: {
      "Designed for": "Big heads — oversized versions across sun, optical and readers (since 2004)",
      "Fit range": "Extended temples and wider bridges; widths typically up to ~160 mm",
      "Material": "Monel, titanium, TR90 nylon, acetate",
      "Fit technology": "Standard size charts",
      "Made to order": "No — off-the-shelf sizes",
      "Fit guarantee": "Standard returns (varies by retailer)",
      "Shipping": "Varies by retailer",
      "Price": "≈ $75–206 (sunglasses)",
    },
    fitRange: { min: 145, max: 160, label: "Fatheadz (approx. published range)" },
    advantages: [
      {
        title: "Luxury materials, not utility plastics",
        text: "Fatheadz leans on TR90 nylon and monel — durable, but utilitarian. Woolet frames are cut from Mazzucchelli 1849 bio-acetate, the same Italian acetate used by the world's top luxury houses, and Hand Finished in the EU.",
      },
      {
        title: "Bespoke sizing up to 162 mm",
        text: "Fatheadz stops where its size chart stops. Woolet's Bespoke tier is made to order for face widths from 145 to 162 mm — the widths the rest of the industry pretends don't exist.",
      },
      {
        title: "Proof of fit before you pay",
        text: "No guessing from a size chart: FitLens scans your face from your phone in 20 seconds and tells you exactly which frame and size fits.",
      },
      {
        title: "Editorial style, not sport-shop style",
        text: "Fatheadz styling skews sporty and practical. Woolet is quiet luxury — panto, keyhole round, browline and bold square shapes that look at home next to Persol, not next to safety glasses.",
      },
    ],
    whereTheyWin: [
      "Lower price point — if budget is the deciding factor, Fatheadz wins on cost.",
      "Sport and wrap styles — for golf or driving-specific sunglasses, Fatheadz has purpose-built models.",
      "Instant availability at big optical retailers (FramesDirect, Amazon, local opticians).",
    ],
    faqs: [
      {
        q: "Is Woolet a good alternative to Fatheadz?",
        a: "Yes — if you want a premium option. Both brands build for wide faces, but Woolet frames are made to order from Italian Mazzucchelli 1849 acetate for face widths of 145–162 mm, verified with a 20-second phone fit scan, and covered by a 30-day fit guarantee.",
      },
      {
        q: "How is Woolet's fit different from Fatheadz?",
        a: "Fatheadz sells off-the-shelf oversized sizes. Woolet designs every frame for wide faces from scratch and offers a Bespoke tier made to your measurements — up to 162 mm face width.",
      },
      {
        q: "Is Woolet more expensive than Fatheadz?",
        a: "Generally yes. Fatheadz sunglasses run roughly $75–206; Woolet frames start at $190 with free worldwide shipping — handmade in the EU from Italian acetate rather than molded TR90.",
      },
      {
        q: "Does Woolet make prescription glasses?",
        a: "Woolet frames are prescription-ready optical frames; lens and prescription options are handled during the made-to-order process.",
      },
    ],
  },
  {
    slug: "eyeshells-alternative",
    name: "EYESHELLS",
    keyword: "EYESHELLS alternative",
    seoTitle: "EYESHELLS Alternative: Premium Wide-Face Glasses | Woolet",
    metaDescription:
      "EYESHELLS alternative for wide faces: handmade in the EU from Italian acetate frames, bespoke sizing to 172mm, 20-second fit scan and 30-day guarantee.",
    heroH1: "EYESHELLS Alternative for Wide Faces & Big Heads",
    heroSub:
      "EYESHELLS made extended-fit glasses cheap. Woolet makes them beautiful — handmade in the EU from Italian bio-acetate, bespoke sizing from 145 to 162 mm, and a fit scan that proves it fits before you order.",
    verdict:
      "Choose EYESHELLS if you need functional extra-wide frames at factory-direct prices. Choose Woolet if your face deserves more than a budget frame — made-to-order Italian acetate with verified fit, engraving, and a 30-day fit guarantee.",
    table: {
      "Designed for": "Big heads & wide faces — factory-direct budget frames",
      "Fit range": "Frame widths ~150–160 mm, lens widths 56–62 mm",
      "Material": "Mostly injected plastics and metal alloys; some titanium",
      "Fit technology": "Size specs listed per frame",
      "Made to order": "No — mass-produced stock frames",
      "Fit guarantee": "Standard return policy",
      "Shipping": "Standard e-commerce shipping",
      "Price": "Budget (factory-direct, low overhead)",
    },
    fitRange: { min: 150, max: 160, label: "EYESHELLS (published range)" },
    advantages: [
      {
        title: "Hand made in EU vs factory-direct",
        text: "EYESHELLS keeps prices low with minimal-overhead factory distribution. Woolet goes the other way: Mazzucchelli 1849 bio-acetate cut and Hand Finished in the EU, in small numbered batches.",
      },
      {
        title: "12 mm more head room",
        text: "EYESHELLS tops out around 160 mm. Woolet's Bespoke tier covers 145–162 mm — made to your actual measurements, not the widest stock size.",
      },
      {
        title: "FitLens verified fit",
        text: "A 20-second phone scan measures your face and matches it to your frame before you pay — no ordering three sizes to try.",
      },
      {
        title: "A frame you'd wear to a board meeting",
        text: "Budget extended-fit frames solve width, not style. Woolet's editorial shapes — panto, browline, keyhole round — solve both.",
      },
    ],
    whereTheyWin: [
      "Price — EYESHELLS is one of the cheapest ways to get a genuinely wide frame.",
      "Huge stock catalogue with instant shipping.",
      "Integrated cheap prescription lenses at checkout.",
    ],
    faqs: [
      {
        q: "What is the best premium alternative to EYESHELLS?",
        a: "Woolet — frames engineered exclusively for wide faces (145–162 mm), handmade from Mazzucchelli 1849 acetate, finished in the EU, with a 20-second phone fit scan and a 30-day fit guarantee.",
      },
      {
        q: "Is Woolet wider than EYESHELLS?",
        a: "EYESHELLS publishes frame widths of roughly 150–160 mm. Woolet's Bespoke tier is made to order up to 162 mm.",
      },
      {
        q: "Why is Woolet more expensive than EYESHELLS?",
        a: "EYESHELLS ships mass-produced factory frames; Woolet frames are made to order in the EU from luxury-grade bio-acetate, with bespoke sizing and optional laser engraving. From $190 with free worldwide shipping.",
      },
      {
        q: "Can I check the fit before buying a Woolet frame?",
        a: "Yes — FitLens scans your face from your phone in about 20 seconds and confirms which frame fits your measurements.",
      },
    ],
  },
  {
    slug: "zenni-alternative",
    name: "Zenni",
    keyword: "Zenni alternative",
    seoTitle: "Zenni Alternative for Wide Faces & Big Heads | Woolet",
    metaDescription:
      "Looking for a Zenni alternative that actually fits a wide face? Woolet builds handmade in the EU from Italian acetate frames for 145–162mm faces, with a 20-second fit scan.",
    heroH1: "Zenni Alternative for Wide Faces & Big Heads",
    heroSub:
      "Zenni's Extended Fit is a big catalogue stretched a little wider. Woolet is the opposite: one obsession — faces 150 mm and up — served with handmade in the EU from Italian acetate and a fit scan that ends the guesswork.",
    verdict:
      "Choose Zenni if you want the cheapest possible glasses and a standard-width face. Choose Woolet if glasses have pinched, slid, or sat crooked your whole life — because your face was never the problem; the frame was.",
    table: {
      "Designed for": "Everyone — mass online retail; Extended Fit is one collection among thousands of frames",
      "Fit range": "Extended Fit ~138 mm+ total width; longer temples on select frames",
      "Material": "Injected plastics, metal alloys; some premium lines",
      "Fit technology": "Virtual try-on and size filters",
      "Made to order": "No — stock frames with custom lenses",
      "Fit guarantee": "Store-credit-based returns",
      "Shipping": "Paid/thresholds vary",
      "Price": "Frames from ~$7 + lenses",
    },
    fitRange: { min: 135, max: 150, label: "Zenni Extended Fit (approx.)" },
    advantages: [
      {
        title: "Wide-face-first, not wide-face-also",
        text: "Zenni added Extended Fit to a mass catalogue built for average faces. Woolet designs every single frame for wide faces and broader nose bridges from the first sketch — nothing is a stretched version of a standard frame.",
      },
      {
        title: "Mazzucchelli 1849, not commodity plastic",
        text: "At $7 a frame, material is the compromise. Woolet uses the Italian bio-acetate chosen by the world's top luxury houses, hand-finished in Milan-quality workshops.",
      },
      {
        title: "A real fit measurement, not a filter",
        text: "Zenni gives you width filters and a mirror-style try-on. FitLens measures your actual face in 20 seconds and tells you what fits — before you spend anything.",
      },
      {
        title: "Made for 145–162 mm faces",
        text: "Zenni's extended sizing helps up to a point. Woolet's Bespoke tier is built to order for faces up to 162 mm wide — with a 30-day fit guarantee.",
      },
    ],
    whereTheyWin: [
      "Price — nothing beats Zenni on cost; it's a fraction of any premium frame.",
      "Selection — thousands of styles, colors and lens options in one place.",
      "Fast, cheap replacement pairs and backup glasses.",
    ],
    faqs: [
      {
        q: "What's a good Zenni alternative for big heads?",
        a: "Woolet — a premium brand that only makes frames for wide faces (145–162 mm), handmade from Mazzucchelli 1849 acetate, finished in the EU, from $190 with free worldwide shipping and a 30-day fit guarantee.",
      },
      {
        q: "Are Zenni Extended Fit frames wide enough for a 160 mm face?",
        a: "Sometimes — Zenni recommends ~138 mm+ total width for larger heads, and select frames go wider. For faces 155 mm and up, purpose-built wide-face frames like Woolet's (up to 162 mm bespoke) fit without temple pressure.",
      },
      {
        q: "Why choose a $190 frame over a $7 frame?",
        a: "Materials, fit and longevity: hand made in EU from Italian bio-acetate, made-to-order sizing verified by a face scan, optional engraving, and a frame designed for your width rather than adjusted to it.",
      },
      {
        q: "Does Woolet offer a try-on like Zenni?",
        a: "Better — FitLens is a 20-second phone face scan that measures your face and confirms the fit, rather than overlaying a picture of glasses on your photo.",
      },
    ],
  },
  {
    slug: "warby-parker-alternative",
    aliases: ["warby-parker"],
    name: "Warby Parker",

    keyword: "Warby Parker alternative",
    seoTitle: "Warby Parker Alternative for Wide Faces | Woolet",
    metaDescription:
      "The Warby Parker alternative engineered for 145–162mm faces — handmade in the EU from Italian acetate, 20-second fit scan, 30-day fit guarantee.",
    heroH1: "Warby Parker Alternative for Wide Faces & Big Heads",
    heroSub:
      "Warby Parker offers up to five widths of frames designed for the average face. Woolet designs for one face type only — wide — from the first millimetre: 145 to 162 mm, handmade in the EU from Italian acetate, fit verified by a 20-second scan.",
    verdict:
      "Choose Warby Parker for affordable, well-styled glasses if you're near the middle of their size range. Choose Woolet if you're the person who tried their widest frame and still felt the temples flex — because scaling a standard design up is not the same as designing for a wide face.",
    table: {
      "Designed for": "Average faces, offered in up to five widths (extra narrow → extra wide) + Low Bridge Fit",
      "Fit range": "Wide/extra-wide collections; widths generally below true wide-face territory (~150 mm+)",
      "Material": "Cellulose acetate, metal; in-house designs, mass-produced",
      "Fit technology": "App-based virtual try-on; home try-on program",
      "Made to order": "No — stock sizes",
      "Fit guarantee": "30-day free returns/exchanges",
      "Shipping": "Free (US)",
      "Price": "From ~$95 incl. Rx lenses",
    },
    measurements: {
      intro:
        "The difference is not styling — it is millimetres. Woolet 007 Round and 009 Soft-Square both run a 158 mm front, built for faces measuring 155 mm and wider. Warby Parker's widest \"Extended Fit\" / extra-wide models generally top out around 145–148 mm, which is where a wide face starts, not where it ends.",
      rows: [
        {
          label: "Front width (hinge to hinge)",
          woolet: "158 mm (007 Round & 009 Soft-Square)",
          competitor: "≈ 145–148 mm on the widest Extended Fit models",
          note: "A 10 mm gap is the difference between the temples resting behind the ears and pressing on the head.",
        },
        {
          label: "Face width served",
          woolet: "155–161 mm signature · 145–162 mm bespoke",
          competitor: "≈ 138–148 mm",
        },
        {
          label: "Temple length",
          woolet: "150 mm, 11° tip bend (148–155 mm bespoke)",
          competitor: "≈ 140–145 mm typical",
          note: "Short temples on a wide head push the bend in front of the ear and slide the frame down the nose.",
        },
        {
          label: "Bridge",
          woolet: "21–22 mm keyhole (up to 24 mm bespoke)",
          competitor: "≈ 18–20 mm, plus a Low Bridge Fit variant",
        },
        {
          label: "Lens width",
          woolet: "50–54 mm, proportioned to a 158 mm front",
          competitor: "≈ 49–56 mm across the range",
        },
        {
          label: "Sizing method",
          woolet: "FitLens — 20-second phone face scan returns your measurement in mm",
          competitor: "Virtual try-on and home try-on — visual, not measured",
        },
      ],
    },

    fitRange: { min: 130, max: 150, label: "Warby Parker wide/extra-wide (approx.)" },
    advantages: [
      {
        title: "Designed wide, not sized up",
        text: "Warby Parker's wide and extra-wide frames are wider cuts of designs proportioned for average faces. Woolet frames are engineered from scratch for wide faces and broader nose bridges — the proportions, bridge, and temple geometry all start at 150 mm.",
      },
      {
        title: "Bespoke to 162 mm",
        text: "When extra-wide isn't extra enough, Warby has nothing left to offer. Woolet's Bespoke tier is made to order for face widths from 145 to 162 mm.",
      },
      {
        title: "Measured fit, not try-on roulette",
        text: "Home try-on is five guesses. FitLens is one answer: a 20-second phone scan that measures your face and confirms your size before you order.",
      },
      {
        title: "Italian hands, luxury acetate",
        text: "Woolet frames are cut from Mazzucchelli 1849 bio-acetate and Hand Finished in the EU — a materials-and-craft tier above direct-to-consumer retail frames.",
      },
    ],
    whereTheyWin: [
      "Price — from ~$95 including prescription lenses is hard to beat.",
      "Retail stores and home try-on if you want to touch frames first.",
      "Great choice if your face width is average to slightly wide.",
    ],
    faqs: [
      {
        q: "What's the best Warby Parker alternative for wide faces?",
        a: "Woolet — every frame is designed exclusively for wide faces (145–162 mm), handmade from Mazzucchelli 1849 acetate, finished in the EU, with a 20-second FitLens face scan, free worldwide shipping and a 30-day fit guarantee. From $190.",
      },
      {
        q: "Are Warby Parker extra-wide frames big enough for a 160 mm face?",
        a: "Often not — their extra-wide line extends standard designs, and many wearers above ~155 mm still report temple pressure. Woolet builds for exactly this range, up to 162 mm bespoke.",
      },
      {
        q: "Is Woolet more expensive than Warby Parker?",
        a: "Yes — from $190 vs from ~$95. The difference buys made-to-order sizing, luxury Italian acetate, hand finishing and optional laser engraving.",
      },
      {
        q: "Does Woolet have home try-on?",
        a: "No — it has something more precise: FitLens, a 20-second phone face scan that measures your face and confirms which frame fits, plus a 30-day fit guarantee after delivery.",
      },
    ],
  },
  {
    slug: "ray-ban-alternative",
    name: "Ray-Ban",
    keyword: "Ray-Ban alternative",
    seoTitle: "Ray-Ban Alternative for Wide Faces & Big Heads | Woolet",
    metaDescription:
      "Ray-Ban pinching? Woolet is the Ray-Ban alternative for wide faces: handmade in the EU from Italian acetate, 145–162mm sizing, 20-second fit scan.",
    heroH1: "Ray-Ban Alternative for Wide Faces & Big Heads",
    heroSub:
      "Ray-Ban sizes run XXS to XXL — of frames proportioned for the average head. If Wayfarers leave marks at your temples, the problem isn't you. Woolet builds classic shapes for faces 145–162 mm wide, in hand made in EU from Italian acetate.",
    verdict:
      "Choose Ray-Ban for iconic styling at standard sizes. Choose Woolet if you love those silhouettes but your face is 150 mm or wider — you get the classic shapes, cut for your actual head, with fit verified before you buy.",
    table: {
      "Designed for": "Average faces — iconic models in sizes XXS–XXL (lens widths ~47–62 mm)",
      "Fit range": "Wide fit on select square models; total widths still made for standard heads",
      "Material": "Acetate, nylon, metal — mass-produced (Luxottica)",
      "Fit technology": "Size guide + virtual try-on",
      "Made to order": "No",
      "Fit guarantee": "Standard returns",
      "Shipping": "Free over threshold",
      "Price": "≈ $150–300+",
    },
    fitRange: { min: 125, max: 150, label: "Ray-Ban incl. wide fits (approx.)" },
    advantages: [
      {
        title: "Classic shapes, wide-face geometry",
        text: "A Wayfarer scaled to XXL is still a Wayfarer proportioned for a standard skull. Woolet redraws classic silhouettes — square, panto, browline — around wide-face geometry: broader bridges, longer temples, wider frame fronts (145–162 mm).",
      },
      {
        title: "Hand-finished vs mass-produced",
        text: "Ray-Ban is a brilliant industrial product. Woolet is a craft product: Mazzucchelli 1849 bio-acetate, Hand Finished in the EU, made to order, numbered batches.",
      },
      {
        title: "Fit you can verify in 20 seconds",
        text: "Instead of hoping the 'L' fits differently than the 'M' did, FitLens scans your face from your phone and confirms your exact fit before checkout.",
      },
      {
        title: "A 30-day fit guarantee",
        text: "Wear them in the real world. If the fit isn't right, Woolet fixes it — that's the point of a wide-face-first brand.",
      },
    ],
    whereTheyWin: [
      "Iconic, universally recognized styling and resale value.",
      "Instant availability everywhere, including prescription networks and insurance.",
      "Broad sunglasses tech (polarization options, Meta smart glasses line).",
    ],
    faqs: [
      {
        q: "What's a good Ray-Ban alternative for a big head?",
        a: "Woolet — classic silhouettes engineered for wide faces (145–162 mm), handmade from Mazzucchelli 1849 acetate, finished in the EU. From $190 with free worldwide shipping and a 30-day fit guarantee.",
      },
      {
        q: "Do Ray-Bans come in wide sizes?",
        a: "Ray-Ban offers sizes up to XXL and wide fits on select square models, but the designs are proportioned for average heads — wearers above ~155 mm commonly report temple pressure and slipping.",
      },
      {
        q: "Is Woolet cheaper than Ray-Ban?",
        a: "Comparable: Woolet starts at $190, in the range of Ray-Ban's acetate models — but made to order in the EU with bespoke wide-face sizing rather than mass-produced.",
      },
      {
        q: "How do I know a Woolet frame will fit before ordering?",
        a: "FitLens — a 20-second phone face scan that measures your face width, nose bridge and temples and tells you exactly which frame and size fits.",
      },
    ],
  },
  {
    slug: "persol-alternative",
    name: "Persol",
    keyword: "Persol alternative",
    seoTitle: "Persol Alternative for Wide Faces (145–162mm) | Woolet",
    metaDescription:
      "Persol craftsmanship, built for wide faces. Woolet is the Persol alternative for 145–162mm faces: Mazzucchelli 1849 acetate, Hand Finished in the EU, bespoke sizing.",
    heroH1: "Persol Alternative for Wide Faces & Big Heads",
    heroSub:
      "Same Italian soul — Mazzucchelli acetate, hand finishing, quiet luxury. One difference: Woolet frames are engineered for faces 145 to 162 mm wide, the range where even the most beautiful Persol starts to pinch.",
    verdict:
      "Choose Persol if you want a heritage icon and your face fits standard proportions. Choose Woolet if you've picked up a Persol, loved everything about it, and put it back because it sat crooked or gripped your temples — Woolet exists precisely for you.",
    table: {
      "Designed for": "Average faces — heritage Italian designs since 1917",
      "Fit range": "Standard size runs; larger calibers exist but proportions remain standard",
      "Material": "Italian acetate, Meflecto flexible temples — mass-produced (Luxottica)",
      "Fit technology": "Size guide",
      "Made to order": "No",
      "Fit guarantee": "Standard returns",
      "Shipping": "Standard",
      "Price": "≈ $250–450",
    },
    fitRange: { min: 125, max: 148, label: "Persol standard sizes (approx.)" },
    advantages: [
      {
        title: "The same acetate heritage — sized for you",
        text: "Woolet uses Mazzucchelli 1849 bio-acetate, the benchmark Italian acetate, Hand Finished in the EU. The craft language of Persol, redrawn around wide-face geometry from the first sketch.",
      },
      {
        title: "145–162 mm, guaranteed",
        text: "Persol's most generous sizes still follow standard proportions. Woolet's Bespoke tier is made to order up to 162 mm face width — with a 30-day fit guarantee.",
      },
      {
        title: "Made to order, numbered, engravable",
        text: "Every Woolet frame is produced for its owner — bespoke measurements, optional laser engraving, small numbered batches. Not a shelf product.",
      },
      {
        title: "Fit verified before you spend $190",
        text: "FitLens scans your face in 20 seconds from your phone. You see what fits before you order — something no heritage house offers.",
      },
    ],
    whereTheyWin: [
      "Heritage and collectability — a century of icons (649, 714) with real resale value.",
      "Wider availability in optical shops, sunglass boutiques and duty-free.",
      "Signature details like the Supreme Arrow and folding models.",
    ],
    faqs: [
      {
        q: "What is the best Persol alternative for wide faces?",
        a: "Woolet — the same Italian materials (Mazzucchelli 1849 acetate, hand finishing) engineered specifically for faces 145–162 mm wide, made to order from $190 with a 30-day fit guarantee.",
      },
      {
        q: "Do Persol frames fit wide faces?",
        a: "Persol offers larger calibers, but the designs follow standard facial proportions; wearers above ~150 mm often find them tight at the temples. Woolet builds exclusively for that 145–162 mm range.",
      },
      {
        q: "Is Woolet real Italian acetate like Persol?",
        a: "Yes — Woolet frames are cut from Mazzucchelli 1849 bio-acetate, the Italian acetate used by top luxury houses, and Hand Finished in the EU.",
      },
      {
        q: "Is Woolet cheaper than Persol?",
        a: "Usually — Woolet starts at $190 versus roughly $250–450 for Persol, and includes bespoke wide-face sizing, free worldwide shipping and optional engraving.",
      },
    ],
  },
];
