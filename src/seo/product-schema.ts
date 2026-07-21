/**
 * Canonical Product JSON-LD builder for Google Merchant listings.
 *
 * Fixes the three GSC "Merchant listings" errors:
 *   - Missing "image" (must be an array of absolute https:// URLs)
 *   - Missing "hasMerchantReturnPolicy" in offers
 *   - Missing "shippingDetails" in offers
 *
 * Consumed by:
 *   - <ProductJsonLd/> (react-helmet-async, per-page hydrated head)
 *   - src/seo/metadata.ts prerender (crawler-visible static head)
 *
 * Kept in a pure module so both consumers share one source of truth.
 */

export const SITE_URL = "https://woolet.co";

// EU markets Woolet ships to (also used for return policy applicability).
const EU_COUNTRIES = ["PL", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE"];

export interface ProductSchemaInput {
  /** e.g. "007", "009", "bespoke" — becomes SKU suffix */
  id: string;
  name: string;
  description: string;
  /** Absolute page URL, e.g. "https://woolet.co/en/products/007" */
  url: string;
  /**
   * Site-relative or absolute image URLs. Relative URLs are prefixed with
   * SITE_URL so the array Google sees is fully qualified.
   */
  images: string[];
  price: string | number;
  /** ISO 4217, defaults to "USD" (site pricing currency). */
  priceCurrency?: string;
  /** schema.org availability URL, defaults to InStock. */
  availability?: string;
  /** Ready-made (false, default) vs made-to-measure (true). */
  isBespoke?: boolean;
  brand?: string;
  material?: string;
  colors?: string[];
  category?: string;
  /**
   * Optional PAID express shipping fee. Provide ONLY when a real fee is
   * configured — otherwise omit and standard free shipping is emitted alone.
   * TODO: wire up when the checkout exposes a real express rate.
   */
  expressShippingFee?: string | number;
}

const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`);

export function buildProductJsonLd(p: ProductSchemaInput): Record<string, unknown> {
  const currency = p.priceCurrency ?? "USD";
  const image = Array.from(new Set(p.images.map(abs)));

  const returnPolicy = p.isBespoke
    ? {
        "@type": "MerchantReturnPolicy",
        applicableCountry: EU_COUNTRIES,
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      }
    : {
        "@type": "MerchantReturnPolicy",
        applicableCountry: EU_COUNTRIES,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      };

  // Free standard shipping — bespoke has longer handling (production lead time).
  const standardShipping = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: "0", currency },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: EU_COUNTRIES,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: p.isBespoke
        ? { "@type": "QuantitativeValue", minValue: 10, maxValue: 14, unitCode: "DAY" }
        : { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
      transitTime: p.isBespoke
        ? { "@type": "QuantitativeValue", minValue: 2, maxValue: 4, unitCode: "DAY" }
        : { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
    },
  };

  const shippingDetails: Record<string, unknown>[] = [standardShipping];

  if (p.expressShippingFee !== undefined && p.expressShippingFee !== null && p.expressShippingFee !== "") {
    shippingDetails.push({
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: String(p.expressShippingFee),
        currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: EU_COUNTRIES,
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
      },
    });
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image,
    brand: { "@type": "Brand", name: p.brand ?? "Woolet" },
    sku: `WOOLET-${p.id.toUpperCase()}`,
    mpn: `WOOLET-${p.id.toUpperCase()}`,
    ...(p.material ? { material: p.material } : {}),
    ...(p.category ? { category: p.category } : {}),
    ...(p.colors && p.colors.length ? { color: p.colors } : {}),
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: currency,
      price: String(p.price),
      availability: p.availability ?? "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: p.brand ?? "Woolet", url: SITE_URL },
      hasMerchantReturnPolicy: returnPolicy,
      shippingDetails,
    },
  };

  return schema;
}
