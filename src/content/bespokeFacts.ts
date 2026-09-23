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
      shippingDetails: { "@type": "OfferShippingDetails", shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" }, shippingDestination: { "@type": "DefinedRegion", addressCountry: "Worldwide" }, deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 10, maxValue: 14, unitCode: "DAY" } } },
      hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted", applicableCountry: "Worldwide" },
    },
  };
}

export const bespokeFaqJsonLd = () => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: BESPOKE_FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});