/**
 * Lens options — single source of truth for both PDPs (/en/products/007, /009).
 *
 * COMPLIANCE: blue-light copy must never claim a health benefit (eye strain,
 * sleep, headaches, eye protection). The Cochrane review (Singh et al., 2023)
 * found blue-light filtering lenses probably make no difference. We describe
 * the filter as a measurable technical property and an optional coating only.
 *
 * PLACEHOLDERS: LENS_PRICE and FILTER_SPEC are supplied by the brand owner.
 * While either is unresolved the blue-light option renders visible but
 * DISABLED ("Blue-light filter — coming soon"). Never invent a price or a
 * filtration figure.
 */

/** Supplier price delta in USD for the blue-light coating. `null` = not supplied yet. */
export const LENS_PRICE: number | null = null; // ← set to the real figure when supplied
/** Real supplier filtration spec, e.g. "415–455 nm". `null` = not supplied yet. */
export const FILTER_SPEC: string | null = null; // ← set to the real supplier figure

export type LensOption = {
  id: "clear" | "blue-light" | "prescription";
  label: string;
  /** USD delta on top of the frame price. `null` = quoted separately. */
  priceDelta: number | null;
  description: string;
  default: boolean;
  /** Visible but not selectable (missing supplier data, or quoted elsewhere). */
  disabled?: boolean;
  /** Route for options that are quoted/configured elsewhere. */
  href?: string;
};

const blueLightReady = LENS_PRICE !== null && FILTER_SPEC !== null;

export const lensOptions: LensOption[] = [
  {
    id: "clear",
    label: "Clear lenses",
    priceDelta: 0,
    description: "Standard clear lenses. UV400.",
    default: true,
  },
  {
    id: "blue-light",
    label: blueLightReady ? "Blue-light filter" : "Blue-light filter — coming soon",
    priceDelta: blueLightReady ? LENS_PRICE : null,
    description: blueLightReady
      ? `Optional coating that filters blue light in the ${FILTER_SPEC} range. UV400. An optional lens coating, not a medical device.`
      : "Optional coating, UV400. An optional lens coating, not a medical device. Filtration range and price are confirmed before the founding batch ships.",
    default: false,
    disabled: !blueLightReady,
  },
  {
    id: "prescription",
    label: "Prescription (Rx)",
    priceDelta: null,
    description: "Your own prescription, fitted to a 158 mm front. Quoted separately.",
    default: false,
    href: "/en/fit",
  },
];

export const defaultLensOptionId = (lensOptions.find((o) => o.default) ?? lensOptions[0]).id;

/** USD formatting shared with the PDP price block. */
export function formatPriceDelta(delta: number | null): string {
  if (delta === null) return "Quoted separately";
  if (delta === 0) return "Included";
  return `+$${delta.toFixed(delta % 1 === 0 ? 0 : 2)}`;
}

/**
 * Internal link to the blue-light cluster page. The route is built in a later
 * step — keep `enabled` false until it exists so we never render a dead link.
 */
export const blueLightArticleLink = {
  enabled: false,
  href: "/en/blue-light-glasses-wide-faces",
  label: "Blue-light glasses that actually fit a wide face",
};

/**
 * Schema.org Offers for the lens variants. Options that are disabled or have
 * a null price are intentionally omitted — we never advertise a price we
 * do not have.
 */
export function lensOffers(baseUrl: string, framePrice: string, currency: string) {
  return lensOptions
    .filter((o) => !o.disabled && o.priceDelta !== null)
    .map((o) => ({
      "@type": "Offer",
      url: `${baseUrl}?lens=${o.id}`,
      name: o.label,
      price: (Number(framePrice) + (o.priceDelta ?? 0)).toFixed(2),
      priceCurrency: currency,
      availability: "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: (Number(framePrice) + (o.priceDelta ?? 0)).toFixed(2),
        priceCurrency: currency,
      },
    }));
}
