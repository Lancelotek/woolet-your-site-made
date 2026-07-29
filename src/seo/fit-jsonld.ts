import { FIT_FAQ } from "./fit-faq";

const SITE_URL = "https://woolet.co";

/** SoftwareApplication schema for the FitLens virtual-fit tool. */
export const fitSoftwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/en/fit#fitlens`,
  name: "FitLens",
  alternateName: "Woolet Virtual Fit",
  url: `${SITE_URL}/en/fit`,
  applicationCategory: "LifestyleApplication",
  applicationSubCategory: "Eyewear fitting tool",
  operatingSystem: "Web browser (iOS, Android, desktop)",
  browserRequirements: "Requires a modern browser with camera access. No download required.",
  installUrl: `${SITE_URL}/en/fit`,
  softwareRequirements: "No installation required — runs in the browser",
  featureList: [
    "Temple-to-temple face width measurement in millimetres",
    "Nose bridge width measurement (21 mm / 22 mm keyhole)",
    "Pupillary distance estimate",
    "Recommended frame front width for faces 155 mm and wider",
  ],
  description:
    "FitLens measures your face with your phone camera and a credit card as scale reference, returning face width, bridge width and the frame front width that fits. Built for wide faces (155 mm+).",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Woolet", url: SITE_URL },
};

export const fitFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FIT_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const fitBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Woolet", item: `${SITE_URL}/en` },
    { "@type": "ListItem", position: 2, name: "Virtual fit", item: `${SITE_URL}/en/fit` },
  ],
};

export const FIT_JSONLD = [fitSoftwareApplicationJsonLd, fitFaqJsonLd, fitBreadcrumbJsonLd];
