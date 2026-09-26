import { SHIP_COUNTRIES, shippingDetails } from "@/seo/commerce-schema";

export const BESPOKE_FACTS = {
  name: "Woolet Bespoke - made-to-measure eyeglasses",
  h1: "Woolet Bespoke - glasses made to your exact face",
  frontWidth: "145-172 mm",
  bridge: "20-24 mm",
  temples: "145-155 mm",
  regularPrice: 480,
  regularPriceLabel: "$480 USD",
  kickstarterPrice: 299,
  kickstarterPriceLabel: "$299 USD",
  kickstarterLabel: "Kickstarter backer price: $299 (campaign only)",
  kickstarterPath: "/en/lp/kickstarter",
  leadTime: "2 weeks of production from approval of the 3D model, then shipping",
  material: "Italian Mazzucchelli 1849 cellulose acetate",
  origin: "Hand made in Greece (EU)",
  warranty: "10 years",
  shipping: "Free worldwide shipping",
  lenses: "Standard prescription lenses included; specialty lens upgrades such as photochromic and progressive are paid add-ons",
  shapes: ["Aviator", "Rectangle", "Crown Panto", "Round"],
  process: [
    "AI fit scan with a phone camera in about 20 seconds",
    "Configure shape, acetate colour, finish and lenses",
    "Preview the selected frame on your face",
    "Review and approve the made-to-measure 3D model",
    "Handmade production in Greece (EU)",
    "Free worldwide shipping",
  ],
} as const;

export const BESPOKE_META_DESCRIPTION =
  "Made-to-measure glasses in any width from 145-172 mm. $480 with prescription lenses and worldwide shipping. Hand made in Greece from Italian acetate.";

export const BESPOKE_GUIDE = [
  {
    heading: "A frame built around your measurements",
    text: "Made to measure means the front width, bridge and temples are chosen for one person, not picked from an existing shelf size. Woolet Bespoke covers front widths from 145-172 mm, bridges from 20-24 mm and temple lengths from 145-155 mm. Those numbers describe the frame, not a guarantee that every face of the same width needs identical glasses. The measurement and model-review steps establish the dimensions for your individual build. If you are deciding between a stock frame and a custom one, start with a face-width measurement rather than guessing from your hat size or an old pair of glasses.",
  },
  {
    heading: "When a standard Woolet frame is enough",
    text: "The standard Woolet 007 Round/Panto and 009 Soft Square both have a 158 mm front and generally fit face widths around 155-161 mm. Their bridges measure 21 mm and 22 mm respectively, and both have 150 mm temples. If those fixed dimensions suit your face, a standard frame may be the simpler choice. Bespoke is not a larger version of either stock silhouette. Its four available shapes - Aviator, Rectangle, Crown Panto and Round - are distinct configurator designs. The fit scan helps you compare your own numbers with the standard dimensions before you commit to a made-to-measure order.",
  },
  {
    heading: "A narrower or wider face can need the same process",
    text: "Bespoke is not limited to people who find regular glasses too small. A 145 mm front can be made for a narrower fit, while a 172 mm front covers the upper end of the available build range. Between those limits, the bridge and temple dimensions also matter. A frame may be wide enough at the front but still sit poorly if its bridge or temples are wrong for the wearer. Conversely, someone in the typical stock face-width band may choose a custom shape or need a different bridge. The recommended path depends on the complete set of measurements rather than one number in isolation.",
  },
  {
    heading: "How the remote fitting works",
    text: "The process begins with a phone-camera fit scan. Measurements provide a starting point for the frame geometry, and the order flow allows you to confirm or supplement them. The scan is not a substitute for reviewing the proposed fit: the made-to-measure 3D model is prepared and shown for approval before production starts. If a measurement needs clarification, it can be checked during that review instead of silently treated as final. The production clock begins only after the 3D model has been approved. The goal is a frame made to a verified specification, not a stock frame chosen by an algorithm alone.",
  },
  {
    heading: "Choosing among the four shapes",
    text: "Aviator, Rectangle, Crown Panto and Round are the four live Woolet Bespoke configurator shapes. Shape is an aesthetic choice made after you establish the fit. An Aviator has a different outline from a Round, and a Rectangle is not the same design as the standard 009 Soft Square. Likewise, Crown Panto is not the standard 007 Round/Panto. The configurator lets you review the available acetate colours, finish and lens choices with your selected shape. Whichever silhouette you choose, the front width, bridge and temples remain tied to the measurements agreed for your individual frame.",
  },
  {
    heading: "What the regular price includes",
    text: "The regular Woolet Bespoke price is $480 USD. Standard prescription lenses and free worldwide shipping are included in that price. Specialty lens choices, including photochromic and progressive options, are paid add-ons in the configurator; check the total shown there before paying. The $299 amount is a Kickstarter backer price during the campaign only, not a regular offer on the Woolet site and not the price of the product in search results. The order summary shows your selected lens options and any applicable upgrade charges separately, so the quoted total reflects what you actually chose.",
  },
  {
    heading: "Material and place of manufacture",
    text: "Woolet Bespoke uses Italian Mazzucchelli 1849 cellulose acetate. Italian describes the material's origin, not where the finished frame is made. The frame is hand made in Greece, within the EU, then checked against the approved model before dispatch. Acetate is selected for its appearance and suitability for shaping a measured frame; choosing it does not replace accurate fitting. The finished frame carries a 10-year warranty. If you are comparing brands, distinguish a material-origin claim from a manufacturing-origin claim and look at the actual frame dimensions, lens inclusion and production process rather than a broad description such as custom or premium.",
  },
  {
    heading: "Approval, production and delivery",
    text: "The six steps are a phone-camera fit scan, configuration, a preview, approval of the made-to-measure 3D model, handmade production and worldwide shipping. Production takes 2 weeks from model approval, then shipping begins. Two weeks is not a promise that an order placed today will arrive in two weeks: measurement review and delivery transit are separate stages. Free worldwide shipping is part of the regular $480 USD offer. First Bespoke pairs have already shipped internationally, including to Vietnam. The delivery destination affects transit time, while the approved model establishes when the production period starts.",
  },
] as const;

export const BESPOKE_DISCOVERY_SOURCES = [
  "ChatGPT", "Other AI assistant (Perplexity, Gemini, Claude)", "Google", "Instagram",
  "TikTok", "Facebook", "Friend", "Other",
] as const;
export type BespokeDiscoverySource = (typeof BESPOKE_DISCOVERY_SOURCES)[number];
export const isBespokeDiscoverySource = (value: unknown): value is BespokeDiscoverySource =>
  typeof value === "string" && BESPOKE_DISCOVERY_SOURCES.includes(value as BespokeDiscoverySource);

export const BESPOKE_FAQS = [
  { q: "Can I get custom-fit glasses online without visiting a store?", a: "Yes. Woolet Bespoke uses a phone-camera fit scan that takes about 20 seconds. We use the measurements to prepare a made-to-measure 3D model for your approval, so no store or atelier visit is required." },
  { q: "How much do custom-made glasses cost?", a: "Woolet Bespoke costs $480 USD including standard prescription lenses and free worldwide shipping. Specialty lens upgrades such as photochromic and progressive remain paid add-ons in the configurator. During the Kickstarter campaign, backers get Bespoke for $299. The $299 Kickstarter backer price is available only through the campaign and is not sold as a $299 offer on woolet.co." },
  { q: "Are bespoke glasses worth it?", a: "Bespoke can be worth it when standard frames pinch, slide, sit crooked or never align correctly with your face. It also suits someone who wants a one-of-one frame. The value is the individually set width, bridge and temple length rather than a logo or a stock size." },
  { q: "Can you make glasses for an asymmetrical face?", a: "Yes. The scan and review process can account for differences between the two sides of a face, including ear height and how a frame sits. The final geometry is reviewed before the 3D model is approved and production begins." },
  { q: "Can I order custom glasses for a narrow face?", a: "Yes. Woolet Bespoke is not only for wide faces. It covers any front width from 145-172 mm, including narrower measurements below the stock Woolet fit range." },
  { q: "How do you measure my face remotely?", a: "A phone-camera AI fit scan measures the face in about 20 seconds. The order flow also lets you confirm measurements and provide supporting information before the workshop cuts the frame." },
  { q: "Can I use my prescription?", a: "Yes. The $480 regular price includes standard prescription lenses and free worldwide shipping. Specialty lens upgrades such as photochromic and progressive cost extra as shown in the configurator. You provide the required prescription details before production." },
  { q: "What if my bespoke glasses do not fit?", a: "Woolet checks the scan, measurements and approved 3D model before cutting. The frame is covered by the Woolet Fit Promise and a 10-year warranty. Contact support if the delivered fit does not match the approved specification." },
  { q: "Do you ship bespoke glasses to my country?", a: "Woolet Bespoke includes free worldwide shipping. First Bespoke pairs have already shipped to customers abroad, including Vietnam." },
  { q: "How long does Woolet Bespoke take?", a: "Production takes 2 weeks from your approval of the made-to-measure 3D model. Shipping starts after production, and transit time depends on the destination." },
] as const;

export function bespokeProductJsonLd(url = "https://woolet.co/en/bespoke", image = "https://woolet.co/og-image.png") {
  return {
    "@context": "https://schema.org", "@type": "Product", "@id": `${url}#product`,
    name: BESPOKE_FACTS.name, url,
    description: `${BESPOKE_FACTS.frontWidth} made-to-measure eyeglasses in ${BESPOKE_FACTS.material}, hand made in Greece (EU). Standard prescription lenses and free worldwide shipping included; specialty lens upgrades cost extra.`,
    image: [image], brand: { "@type": "Brand", name: "Woolet" }, material: BESPOKE_FACTS.material, sku: "WOOLET-BESPOKE",
    warranty: { "@type": "WarrantyPromise", durationOfWarranty: { "@type": "QuantitativeValue", value: 10, unitCode: "ANN" } },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Front width", value: BESPOKE_FACTS.frontWidth },
      { "@type": "PropertyValue", name: "Bridge", value: BESPOKE_FACTS.bridge },
      { "@type": "PropertyValue", name: "Temples", value: BESPOKE_FACTS.temples },
      { "@type": "PropertyValue", name: "Production time", value: BESPOKE_FACTS.leadTime },
    ],
    offers: {
      "@type": "Offer", price: "480.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url,
      itemCondition: "https://schema.org/NewCondition", eligibleRegion: { "@type": "Place", name: "Worldwide" },
      // ISO 3166-1 alpha-2 codes + transitTime via the shared helper (GSC Merchant listings).
      shippingDetails: shippingDetails(true),
      hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted", applicableCountry: SHIP_COUNTRIES },
    },
  };
}

export const bespokeFaqJsonLd = () => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: BESPOKE_FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});