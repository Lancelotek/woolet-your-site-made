/**
 * Locale-aware JSON-LD builders for product and collection pages.
 * Ensures NL (and future locale) routes emit schema.org data whose URLs,
 * language, and price context match the rendered page — rather than
 * hardcoded EN values that mismatch the actual URL in the browser.
 */

import type { Lang } from "@/lib/i18n";

export const SITE_URL = "https://woolet.co";

const productBaseByLang: Partial<Record<Lang, { home: string; collection: string; collectionLabel: string; framesLabel: string; homeLabel: string }>> = {
  en: { home: "/en", collection: "/en/collection", collectionLabel: "Collection", framesLabel: "Frames", homeLabel: "Home" },
  nl: { home: "/nl", collection: "/nl/collection", collectionLabel: "Collectie", framesLabel: "Monturen", homeLabel: "Home" },
  de: { home: "/de", collection: "/de/collection", collectionLabel: "Kollektion", framesLabel: "Fassungen", homeLabel: "Startseite" },
  pl: { home: "/pl", collection: "/pl/collection", collectionLabel: "Kolekcja", framesLabel: "Oprawki", homeLabel: "Strona główna" },
  fr: { home: "/fr", collection: "/fr/collection", collectionLabel: "Collection", framesLabel: "Montures", homeLabel: "Accueil" },
  es: { home: "/es", collection: "/es/collection", collectionLabel: "Colección", framesLabel: "Monturas", homeLabel: "Inicio" },
  ja: { home: "/ja", collection: "/ja/collection", collectionLabel: "コレクション", framesLabel: "フレーム", homeLabel: "ホーム" },
  ar: { home: "/ar", collection: "/ar/collection", collectionLabel: "المجموعة", framesLabel: "الإطارات", homeLabel: "الرئيسية" },
};

export function localeCtx(lang: Lang) {
  return productBaseByLang[lang] ?? productBaseByLang.en!;
}

export type ProductInfo = {
  id: string; // path segment: "007" | "009" | "bespoke"
  name: string; // "Woolet 007"
  description: string;
  image: string; // absolute URL
  price: string; // "114.00"
  priceCurrency?: string; // "USD"
  availability?: string; // schema.org URL
  sku?: string;
};

export function productJsonLd(lang: Lang, p: ProductInfo) {
  const url = `${SITE_URL}/${lang}/products/${p.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.sku ?? `WOOLET-${p.id.toUpperCase()}`,
    brand: { "@type": "Brand", name: "Woolet" },
    material: "Italian Mazzucchelli acetate",
    inLanguage: lang,
    offers: {
      "@type": "Offer",
      url,
      price: p.price,
      priceCurrency: p.priceCurrency ?? "USD",
      availability: p.availability ?? "https://schema.org/PreOrder",
      priceValidUntil: "2027-12-31",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US", "GB", "EU", "NL", "DE", "PL", "FR", "ES", "IT"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: p.priceCurrency ?? "USD" },
        shippingDestination: [
          { "@type": "DefinedRegion", addressCountry: "US" },
          { "@type": "DefinedRegion", addressCountry: "NL" },
          { "@type": "DefinedRegion", addressCountry: "DE" },
          { "@type": "DefinedRegion", addressCountry: "GB" },
        ],
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
        },
      },
    },
  };
}

export function productBreadcrumbJsonLd(lang: Lang, name: string, id: string) {
  const ctx = localeCtx(lang);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}${ctx.home}` },
      { "@type": "ListItem", position: 2, name: ctx.collectionLabel, item: `${SITE_URL}${ctx.collection}` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/${lang}/products/${id}` },
    ],
  };
}

export function collectionJsonLd(
  lang: Lang,
  name: string,
  description: string,
  items: { id: string; name: string }[],
) {
  const url = `${SITE_URL}/${lang}/collection`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      url,
      name,
      description,
      inLanguage: lang,
      isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE_URL },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/${lang}/products/${it.id}`,
          name: it.name,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${lang}` },
        { "@type": "ListItem", position: 2, name: localeCtx(lang).collectionLabel, item: url },
      ],
    },
  ];
}

/** Derive locale from a pathname first segment, defaulting to "en". */
export function langFromPath(pathname: string, fallback: Lang = "en"): Lang {
  const seg = pathname.split("/").filter(Boolean)[0];
  const known: Lang[] = ["en", "pl", "fr", "es", "de", "ar", "ja", "nl"];
  return (known as string[]).includes(seg) ? (seg as Lang) : fallback;
}
