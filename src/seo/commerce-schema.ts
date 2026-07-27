/**
 * Single source of truth for commerce-related schema.org fragments
 * (MerchantReturnPolicy, OfferShippingDetails, pricing constants).
 *
 * Every Product/Offer JSON-LD across the site MUST use these helpers so
 * that Google Merchant listings never see contradictory nodes on the
 * same URL and so that required fields (notably
 * `returnShippingFeesAmount` when `returnFees` = `ReturnShippingFees`)
 * are always present.
 */

export const SHIP_COUNTRIES = [
  "US",
  "GB",
  "PL",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "AT",
  "IE",
];

/** Canonical pricing (USD) — checkout charges USD in every locale. */
export const LIST_PRICE = "190.00";      // regular price, shown struck through
export const SALE_PRICE = "114.00";      // current pre-order price actually charged
export const BESPOKE_PRICE = "299.00";   // bespoke pre-order price
export const BESPOKE_LIST_PRICE = "480.00";
export const PRICE_CURRENCY = "USD";
export const PRICE_VALID_UNTIL = "2027-12-31";

/**
 * 30-day return window. Return shipping is paid by the customer
 * (flat $10). `returnShippingFeesAmount` is REQUIRED whenever
 * `returnFees` is `ReturnShippingFees` — omitting it is the exact
 * GSC "Missing field 'returnShippingFeesAmount'" warning.
 */
export const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: SHIP_COUNTRIES,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnShippingFees",
  returnShippingFeesAmount: {
    "@type": "MonetaryAmount",
    value: "10.00",
    currency: PRICE_CURRENCY,
  },
} as const;

/**
 * Free outbound shipping to every supported country.
 * `shippingDestination` MUST be an array of separate DefinedRegion
 * objects — one per country code — never a single DefinedRegion whose
 * `addressCountry` is itself an array.
 */
export function shippingDetails(isBespoke = false) {
  return SHIP_COUNTRIES.map((country) => ({
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency: PRICE_CURRENCY,
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: country,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: isBespoke
        ? { "@type": "QuantitativeValue", minValue: 10, maxValue: 14, unitCode: "DAY" }
        : { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 3,
        maxValue: 7,
        unitCode: "DAY",
      },
    },
  }));
}

/** Standard `priceSpecification` — declares $190 as ListPrice. */
export const LIST_PRICE_SPEC = [
  {
    "@type": "UnitPriceSpecification",
    priceType: "https://schema.org/ListPrice",
    price: LIST_PRICE,
    priceCurrency: PRICE_CURRENCY,
  },
];
