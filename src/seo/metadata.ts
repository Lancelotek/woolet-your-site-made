/**
 * Pure per-route SEO metadata. No React, no DOM, no side effects.
 *
 * Consumed in two places:
 *   1. scripts/prerender.mjs — injects head HTML into dist/<route>/index.html
 *      so crawlers and LLM bots see real titles / descriptions / JSON-LD
 *      in the initial response without executing JS.
 *   2. (Optional, future) client SEO components, so the static head and
 *      the client Helmet head never drift.
 *
 * Adding a route: append it to `getAllRoutes()` and add a case in
 * `getMetadata()`. Anything not matched falls back to the homepage meta.
 */

import { SUPPORTED_LANGS, INDEXABLE_LANGS, type Lang } from "@/lib/i18n";
import { hreflangAlternates } from "@/i18n/routeRegistry";
import { getBlogPosts } from "@/lib/blog-data";
import { competitors } from "@/data/competitors";
import { PRODUCT_FAQ, GUIDE_FAQS, faqPageJsonLd } from "./faq-data";
import { getProductReviews } from "@/data/product-reviews";
import { getSizeBySlug } from "@/data/sizes";
import { getBridgeBySlug } from "@/data/bridges";
import { getTempleBySlug } from "@/data/temples";
import { XXL_HUB, XXL_PAGES, getXxlBySlug } from "@/data/xxl";
import { dePages, dePageOrder } from "@/content/de/landingPages";
import {
  RETURN_POLICY,
  shippingDetails,
  LIST_PRICE,
  SALE_PRICE,
  BESPOKE_PRICE,
  PRICE_CURRENCY,
  PRICE_VALID_UNTIL,
  LIST_PRICE_SPEC,
} from "./commerce-schema";

export const SITE_URL = "https://woolet.co";
const DEFAULT_OG = `${SITE_URL}/og-image.png`;

export type RouteMeta = {
  title: string;
  description: string;
  canonical: string;
  lang: Lang;
  robots?: string;
  og: {
    title: string;
    description: string;
    image: string;
    type: "website" | "article" | "product";
    locale: string;
  };
  jsonLd: object[];
  /** Plain HTML injected into <noscript> for LLM bots and the no-JS path. */
  noscriptHtml?: string;
  /**
   * Per-language alternate URLs. When set, renderHeadHtml emits ONLY these
   * hreflang links (instead of auto-generating one per SUPPORTED_LANGS).
   * Use for single-language landing pages whose equivalents in other locales
   * live at a different path (or don't exist).
   * Keys are full URLs; one entry must be "x-default".
   */
  alternates?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Shared JSON-LD blocks
// ---------------------------------------------------------------------------

// Organization JSON-LD lives in index.html (single source) — do not duplicate here.

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Woolet",
  url: SITE_URL,
  description: "AI-fit eyewear for wide faces — one precise size (158 mm) per shape, plus bespoke",
  publisher: { "@type": "Organization", name: "Woolet", url: SITE_URL },
};

function productJsonLd(model: "007" | "009", shape: string, lensSize: string) {
  const bridge = model === "009" ? "22 mm" : "21 mm";
  const url = `${SITE_URL}/en/products/${model}`;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: `Woolet ${model} — ${shape} Italian Acetate Eyewear (158 mm)`,
    description: `Woolet ${model} (${shape}) in Italian Mazzucchelli acetate. One precise size — 158 mm front width with a ${bridge} keyhole bridge — engineered for wide faces (155–161 mm). Bespoke tier covers 145–162 mm. Lens ${lensSize}, temples 150 mm, 5-barrel PVD Gunmetal hinges.`,
    brand: { "@type": "Brand", name: "Woolet" },
    image: [`${SITE_URL}/og-${model}.png`, `${SITE_URL}/og-image.png`],
    sku: `WOOLET-${model}`,
    mpn: `WOOLET-${model}-158`,
    material: "Italian Mazzucchelli Acetate",
    category: "Eyewear > Optical frames",
    width: { "@type": "QuantitativeValue", value: 158, unitCode: "MMT", name: "Frame width (hinge to hinge)" },
    audience: { "@type": "PeopleAudience", suggestedGender: "unisex" },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Frame width", value: "158 mm" },
      { "@type": "PropertyValue", name: "Bridge", value: `${bridge} keyhole` },
      { "@type": "PropertyValue", name: "Lens", value: lensSize },
      { "@type": "PropertyValue", name: "Temple length", value: "150 mm" },
      { "@type": "PropertyValue", name: "Hinge", value: "5-barrel PVD Gunmetal" },
      { "@type": "PropertyValue", name: "Frame shape", value: shape },
      { "@type": "PropertyValue", name: "Fit", value: "Wide fit (155 mm+ faces)" },
      { "@type": "PropertyValue", name: "Bespoke range", value: "145–162 mm" },
      { "@type": "PropertyValue", name: "Frame origin", value: "Hand finished in the EU" },
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: PRICE_CURRENCY,
      price: SALE_PRICE,
      priceValidUntil: PRICE_VALID_UNTIL,
      priceSpecification: LIST_PRICE_SPEC,
      url,
      seller: { "@type": "Organization", name: "Woolet", url: SITE_URL },
      itemCondition: "https://schema.org/NewCondition",
      eligibleRegion: { "@type": "Place", name: "Worldwide" },
      hasMerchantReturnPolicy: RETURN_POLICY,
      shippingDetails: shippingDetails(false),
    },
  };

  // Only attach review markup when we have real, verified customer reviews.
  // Empty set → omit entirely (Google penalises fake/zero aggregate ratings).
  const { reviews, ratingValue, reviewCount } = getProductReviews(model);
  if (reviews.length > 0 && reviewCount > 0 && ratingValue > 0) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
    base.review = reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.body,
      datePublished: r.datePublished,
    }));
  }

  return base;
}

function bespokeProductJsonLd() {
  const url = `${SITE_URL}/en/products/bespoke`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: "Woolet Bespoke — Custom Acetate Glasses",
    description:
      "Bespoke Italian Mazzucchelli acetate glasses cut to the buyer's face. Four silhouettes: Aviator, Rectangle, Crown Panto, Round. Sizes 145–162 mm.",
    brand: { "@type": "Brand", name: "Woolet" },
    image: [`${SITE_URL}/og-image.png`],
    sku: "WOOLET-BESPOKE",
    mpn: "WOOLET-BESPOKE",
    material: "Italian Mazzucchelli Acetate",
    category: "Eyewear > Optical frames > Bespoke",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Frame width", value: "145–162 mm" },
      { "@type": "PropertyValue", name: "Fit", value: "Cut to your face" },
      { "@type": "PropertyValue", name: "Frame origin", value: "Hand finished in the EU" },
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: PRICE_CURRENCY,
      price: BESPOKE_PRICE,
      priceValidUntil: PRICE_VALID_UNTIL,
      url,
      seller: { "@type": "Organization", name: "Woolet", url: SITE_URL },
      itemCondition: "https://schema.org/NewCondition",
      eligibleRegion: { "@type": "Place", name: "Worldwide" },
      hasMerchantReturnPolicy: RETURN_POLICY,
      shippingDetails: shippingDetails(true),
    },
  };
}

function breadcrumbJsonLd(parts: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      item: p.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Competitor comparison pages
// ---------------------------------------------------------------------------

function compareFaqJsonLd(c: { faqs: { q: string; a: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function compareProductJsonLd(c: { slug: string; metaDescription: string }) {
  const canonical = `${SITE_URL}/en/compare/${c.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Woolet Wide-Face Eyewear",
    brand: { "@type": "Brand", name: "Woolet" },
    url: SITE_URL,
    description: c.metaDescription,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: PRICE_CURRENCY,
      lowPrice: SALE_PRICE,
      highPrice: BESPOKE_PRICE,
      offerCount: 3,
      availability: "https://schema.org/PreOrder",
      url: canonical,
    },
  };
}

function compareBreadcrumbJsonLd(c: { slug: string; name: string }) {
  const canonical = `${SITE_URL}/en/compare/${c.slug}`;
  return breadcrumbJsonLd([
    { name: "Home", url: `${SITE_URL}/en` },
    { name: "Compare", url: `${SITE_URL}/en/compare` },
    { name: `${c.name} Alternative`, url: canonical },
  ]);
}

function compareIndexBreadcrumbJsonLd() {
  return breadcrumbJsonLd([
    { name: "Home", url: `${SITE_URL}/en` },
    { name: "Compare", url: `${SITE_URL}/en/compare` },
  ]);
}

function compareIndexItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: competitors.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.name} Alternative`,
      url: `${SITE_URL}/en/compare/${c.slug}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Locale helpers
// ---------------------------------------------------------------------------

function ogLocale(lang: Lang): string {
  switch (lang) {
    case "pl": return "pl_PL";
    case "fr": return "fr_FR";
    case "es": return "es_ES";
    case "de": return "de_DE";
    case "ar": return "ar_AR";
    case "ja": return "ja_JP";
    case "nl": return "nl_NL";
    default: return "en_US";
  }
}


function langFromRoute(route: string): Lang {
  const m = route.match(/^\/([a-z]{2})(\/|$)/);
  const lang = m?.[1];
  if (lang && (SUPPORTED_LANGS as readonly string[]).includes(lang)) return lang as Lang;
  return "en";
}

// ---------------------------------------------------------------------------
// Per-route copy
// ---------------------------------------------------------------------------

type Copy = { title: string; description: string; noscriptHtml?: string };

const homeCopy: Record<Lang, Copy> = {
  en: {
    title: "Woolet — Premium Glasses for Wide Faces & Big Heads (158 mm)",
    description:
      "Italian Mazzucchelli acetate glasses engineered for wider faces. One precise 158 mm size, keyhole bridge, Hand finished in the EU. Find your fit in 20s.",
    noscriptHtml: `<h1>Woolet — Premium Glasses for Wide Faces & Big Heads</h1>
<p>Woolet makes premium Italian-acetate eyewear engineered for wide faces — temple-to-temple measurements of 155 mm and above. Two shapes (007 round, 009 soft square), both built in one precise size: 158 mm front width with a 21–22 mm keyhole bridge. A bespoke tier covers 145–162 mm.</p>
<p>Frames are cut from Italian Mazzucchelli cellulose acetate, Hand finished in the EU, with 5-barrel PVD Gunmetal hinges and a 21–22 mm keyhole bridge engineered for wider noses.</p>
<p>Pricing: $114 for founding members at pre-order, $190 at full launch. <a href="/en/fit">Find your size with FitLens</a> · <a href="/en/blog/glasses-for-wide-faces-guide">The complete wide-face guide</a> · <a href="/en/blog/best-sunglasses-for-wide-faces">Best sunglasses for wide faces</a> · <a href="/en/collections/wide-face-glasses">Wide-face collection</a> · <a href="/en/collections/glasses-for-big-heads">Glasses for big heads</a>.</p>`,
  },
  pl: {
    title: "Woolet — Premium okulary na szeroką twarz (155 mm+)",
    description:
      "Premium okulary z włoskiego octanu Mazzucchelli, zaprojektowane dla szerokich twarzy (155 mm+). Trzy mierzone rozmiary plus bespoke. Od $114 w przedsprzedaży.",
  },
  fr: {
    title: "Woolet — Lunettes premium pour visages larges (155 mm+)",
    description:
      "Lunettes premium en acétate italien Mazzucchelli, conçues pour les visages larges (155 mm+). Trois tailles mesurées plus sur-mesure. Dès 114 $ en précommande.",
  },
  es: {
    title: "Woolet — Gafas premium para caras anchas (155 mm+)",
    description:
      "Gafas premium en acetato italiano Mazzucchelli, diseñadas para caras anchas (155 mm+). Tres tamaños medidos más a medida. Desde 114 $ en preventa.",
  },
  de: {
    title: "Woolet — Premium-Brillen für breite Gesichter (ab 155 mm)",
    description:
      "Premium-Brillen aus italienischem Mazzucchelli-Acetat, entwickelt für breite Gesichter (ab 155 mm). Drei gemessene Größen plus Maßanfertigung. Ab 114 $ im Pre-Order.",
  },
  ar: {
    title: "Woolet — نظارات فاخرة للوجوه العريضة (155 ملم+)",
    description:
      "نظارات فاخرة من أسيتات Mazzucchelli الإيطالي، مصممة للوجوه العريضة (155 ملم+). ثلاثة مقاسات مدروسة بالإضافة للصناعة الخاصة. ابتداءً من 114$ في الطلب المسبق.",
  },
  ja: {
    title: "Woolet — 幅広い顔のためのプレミアムアイウェア (155mm以上)",
    description:
      "イタリア製Mazzucchelliアセテートのプレミアムアイウェア、幅広い顔（155mm以上）のために設計。3つの計測サイズとビスポーク。プレオーダー$114から。",
  },
  nl: {
    title: "Woolet — Premium bril voor brede gezichten (158 mm)",
    description:
      "Italiaanse Mazzucchelli-acetaatbril ontworpen voor bredere gezichten. Eén precieze maat 158 mm, keyhole-brug, met de hand afgewerkt in Italië. Vind je pasvorm in 20 seconden.",
  },
};


// ---------------------------------------------------------------------------
// Route builder
// ---------------------------------------------------------------------------

function base(
  route: string,
  lang: Lang,
  copy: Copy,
  og: Partial<RouteMeta["og"]> = {},
  jsonLd: object[] = [],
  alternates?: Record<string, string>,
): RouteMeta {
  const canonical = `${SITE_URL}${route}`;
  return {
    title: copy.title,
    description: copy.description,
    canonical,
    lang,
    og: {
      title: copy.title,
      description: copy.description,
      image: og.image || DEFAULT_OG,
      type: og.type || "website",
      locale: ogLocale(lang),
    },
    jsonLd: jsonLd,
    noscriptHtml: copy.noscriptHtml,
    alternates,
  };
}

export function getMetadata(route: string): RouteMeta {
  const lang = langFromRoute(route);
  const path = route.replace(/^\/[a-z]{2}/, "") || "/";

  // Homepage
  if (path === "/" || path === "") {
    return base(route, lang, homeCopy[lang], { image: DEFAULT_OG }, lang === "en" ? [websiteJsonLd] : []);
  }

  // ----- Products
  if (path === "/products/007") {
    return base(
      route,
      lang,
      {
        title: "007 Round — Wide-Fit Round Glasses, 158 mm | Woolet",
        description:
          "Round glasses built for wider faces: 158 mm front, keyhole bridge, Italian Mazzucchelli acetate, hand-finished in the EU. Made for 155 mm+ faces. See the fit.",
        noscriptHtml: `<h1>Woolet 007 — Round, 158 mm</h1>
<p>The Woolet 007 is a round-panto eyewear shape cut from Italian Mazzucchelli cellulose acetate and Hand finished in the EU. One precise size: 158 mm front width with a 21 mm keyhole bridge. Lens 52 × 52 mm, temples 150 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Dark Tortoise, Black, Honey. Pre-order $114 for founding members ($1 deposit locks the price); $190 MSRP at full launch. Bespoke 145–162 mm available.</p>`,
      },
      { image: `${SITE_URL}/og-007.png`, type: "product" },
      [
        productJsonLd("007", "Round", "52 × 52 mm"),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Products", url: `${SITE_URL}/en` },
          { name: "Woolet 007", url: `${SITE_URL}/en/products/007` },
        ]),
        faqPageJsonLd(PRODUCT_FAQ),
      ],
    );
  }

  if (path === "/products/009") {
    return base(
      route,
      lang,
      {
        title: "009 Square — Wide-Fit Square Glasses, 158 mm | Woolet",
        description:
          "Square glasses built for wider faces: 158 mm front, keyhole bridge, Italian Mazzucchelli acetate, hand-finished in the EU. Made for 155 mm+ faces. See the fit.",
        noscriptHtml: `<h1>Woolet 009 — Soft Square, 158 mm</h1>
<p>The Woolet 009 is a soft-square eyewear shape cut from Italian Mazzucchelli cellulose acetate and Hand finished in the EU. One precise size: 158 mm front width with a 22 mm keyhole bridge. Lens 54 × 50 mm, temples 150 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Black, Dark Tortoise, Smoke Grey. Pre-order $114 for founding members ($1 deposit locks the price); $190 MSRP at full launch. Bespoke 145–162 mm available.</p>`,
      },
      { image: `${SITE_URL}/og-009.png`, type: "product" },
      [
        productJsonLd("009", "Soft Square", "54 × 50 mm"),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Products", url: `${SITE_URL}/en` },
          { name: "Woolet 009", url: `${SITE_URL}/en/products/009` },
        ]),
        faqPageJsonLd(PRODUCT_FAQ),
      ],
    );
  }

  if (path === "/products/bespoke") {
    return base(
      route,
      lang,
      {
        title: "Woolet Bespoke — Custom Acetate Glasses Cut to Your Face",
        description:
          "Bespoke Italian Mazzucchelli acetate glasses cut to your exact face. Four silhouettes, sizes 145–162 mm. From $299 pre-order.",
        noscriptHtml: `<h1>Woolet Bespoke — Custom Acetate Glasses</h1>
<p>Bespoke Italian Mazzucchelli acetate frames cut to your face in four silhouettes: Aviator, Rectangle, Crown Panto and Round. Sizes 145–162 mm. Founding-member pre-order $299; $480 MSRP at full launch.</p>`,
      },
      { image: DEFAULT_OG, type: "product" },
      [
        bespokeProductJsonLd(),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Products", url: `${SITE_URL}/en` },
          { name: "Woolet Bespoke", url: `${SITE_URL}/en/products/bespoke` },
        ]),
      ],
    );
  }

  // ----- About
  if (path === "/about") {
    return base(route, lang, {
      title: "About Woolet — Eyewear Built for Wide Faces",
      description:
        "Why we make one precise size (158 mm) in Italian Mazzucchelli acetate. Founder story, facility, fit philosophy.",
      noscriptHtml: `<h1>About Woolet</h1>
<p>Woolet is an eyewear brand founded in 2026 by JAY23 LLC. We design and manufacture EU-finished acetate frames engineered specifically for wide faces (155 mm and above). The brand is unrelated to the discontinued Woolet smart wallet (2014–2016).</p>`,
    });
  }

  // ----- Process
  if (path === "/process") {
    const isPL = lang === "pl";
    const stepsEN: ReadonlyArray<readonly [string, string, string?]> = [
      ["Digital engineering & CAD", "Your face data becomes a CAD design built for one frame, tailored to your exact measurements rather than a generic mould.", "PT8H"],
      ["Precision cutting", "Front and temples cut from a single Italian Mazzucchelli acetate block — CNC where it counts, by hand where it shows.", "PT6H"],
      ["Component integration", "Rivets, hinges (charnières) and every metal functional element placed and stabilised by hand.", "PT5H"],
      ["Lens grooving (beveling)", "Internal rims precision-beveled to create the exact groove profile, so lenses sit seamlessly inside the frame.", "PT3H"],
      ["Front base curve shaping", "The front is thermally heated under controlled conditions to lock in the precise optical base curve the lenses need.", "PT2H"],
      ["Hand-shaping & filing", "Files, sandpapers and specialised tools work each frame individually into its exact shape and contours.", "PT10H"],
      ["Anatomical bridge sculpting", "Nose bridge hand-sculpted for balanced weight distribution and all-day comfort — the detail that makes a wider frame disappear on your face.", "PT4H"],
      ["Organic sanding (tumbling)", "First tumbling barrel — organic surface smoothing and leveling.", "PT17H"],
      ["Frame & temple alignment", "Front and temples hand-assembled and balanced for perfect symmetry and zero gaps at the joints.", "PT3H"],
      ["First polishing (tumbling)", "Second barrel for the primary polishing stage — the source of the deep base shine.", "PT27H"],
      ["Final hand-buffing", "Hand-finished on specialised wheels with custom waxes — the source of that signature acetate luster.", "PT5H"],
      ["Anatomical tailoring, engraving & QC", "Cold-bend fit adjustment, custom Woolet logo and personal-name engraving, then a rigorous final QC inspection.", "PT3H"],
      ["Ultrasonic cleaning & ship", "Deep ultrasonic-wave clean removes every trace of polishing compound and micro-dust before the frame is packed and shipped.", "PT2H"],
    ];
    const stepsPL: ReadonlyArray<readonly [string, string, string?]> = [
      ["Inżynieria cyfrowa i CAD", "Dane Twojej twarzy zamieniamy w projekt CAD pod jedną oprawę — dopasowany do Twoich wymiarów, a nie do uniwersalnej formy.", "PT8H"],
      ["Precyzyjne cięcie", "Front i zauszniki wycinane z bloku włoskiego octanu Mazzucchelli — CNC tam, gdzie liczy się dokładność, ręcznie tam, gdzie liczy się detal.", "PT6H"],
      ["Integracja komponentów", "Nity, zawiasy (charnières) i każdy metalowy element funkcjonalny osadzany i stabilizowany ręcznie.", "PT5H"],
      ["Frezowanie rowka soczewek", "Wewnętrzne krawędzie precyzyjnie frezowane pod profil soczewki — tak, by soczewka wpadała w oprawę bez śladu szczeliny.", "PT3H"],
      ["Formowanie krzywizny frontu", "Front podgrzewany w kontrolowanych warunkach, by utrwalić dokładną krzywiznę optyczną pod soczewki.", "PT2H"],
      ["Ręczne szlifowanie i pilnikowanie", "Pilniki, papiery ścierne i specjalistyczne narzędzia indywidualnie kształtują każdą oprawę.", "PT10H"],
      ["Anatomiczna rzeźba mostka", "Mostek wyrzeźbiony ręcznie pod równomierne rozłożenie ciężaru — detal, dzięki któremu szersza oprawa znika z twarzy.", "PT4H"],
      ["Bębnowanie organiczne", "Pierwsza beczka bębnująca — organiczne wygładzenie i wyrównanie powierzchni.", "PT17H"],
      ["Składanie i alignment", "Front i zauszniki składane ręcznie i wyważane pod idealną symetrię i zero szczelin na połączeniach.", "PT3H"],
      ["Pierwsze polerowanie", "Druga beczka — pierwszy etap polerowania, źródło głębokiego, bazowego połysku.", "PT27H"],
      ["Finalne polerowanie ręczne", "Wykończenie ręczne na specjalistycznych tarczach z autorskimi woskami — źródło sygnaturowego blasku octanu.", "PT5H"],
      ["Tailoring, grawer i QC", "Anatomiczne korekty na zimno, grawer logo Woolet i Twojego imienia, a następnie rygorystyczna kontrola jakości.", "PT3H"],
      ["Czyszczenie ultradźwiękowe i wysyłka", "Głęboka kąpiel ultradźwiękowa usuwa pozostałości past polerskich i mikropyłu — dopiero potem oprawa trafia do pakowania.", "PT2H"],
    ];
    const steps = isPL ? stepsPL : stepsEN;
    const enCanonical = `${SITE_URL}/en/process`;
    const processImage = `${SITE_URL}/og-image.png`;
    const howTo = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: isPL ? "Jak powstaje oprawa Woolet" : "How a Woolet frame is made",
      description: isPL
        ? "13-etapowy, ok. 14-dniowy proces produkcji oprawy Woolet — od inżynierii CAD na bazie pomiarów Twojej twarzy po czyszczenie ultradźwiękowe. Wykończona ręcznie we Włoszech z octanu Mazzucchelli."
        : "The 13-stage, ~14-day process behind every Woolet frame — from CAD engineering on your face measurements to the final ultrasonic clean. Hand finished in the EU from Mazzucchelli acetate.",
      image: processImage,
      totalTime: "P14D",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "299" },
      supply: [
        { "@type": "HowToSupply", name: isPL ? "Włoski octan Mazzucchelli" : "Italian Mazzucchelli acetate" },
        { "@type": "HowToSupply", name: isPL ? "Zawiasy 5-barrel PVD Gunmetal" : "5-barrel PVD Gunmetal hinges" },
        { "@type": "HowToSupply", name: isPL ? "Autorskie woski polerskie" : "Custom polishing waxes" },
      ],
      tool: [
        { "@type": "HowToTool", name: isPL ? "Frezarka CNC" : "CNC milling machine" },
        { "@type": "HowToTool", name: isPL ? "Beczka bębnująca" : "Tumbling barrel" },
        { "@type": "HowToTool", name: isPL ? "Tarcze polerskie" : "Buffing wheels" },
        { "@type": "HowToTool", name: isPL ? "Myjka ultradźwiękowa" : "Ultrasonic cleaner" },
      ],
      step: steps.map(([name, text, timeRequired], i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name,
        text,
        url: `${enCanonical}#day-${i + 1}`,
        image: processImage,
        ...(timeRequired ? { timeRequired } : {}),
      })),
    };
    const meta = base(
      route,
      lang,
      isPL
        ? {
            title: "Proces Woolet — jak powstają nasze oprawy z włoskiego octanu",
            description:
              "Jak powstaje oprawa Woolet: 13 etapów w ok. 14 dni — od CAD po czyszczenie ultradźwiękowe. Ręcznie wykończona we Włoszech z octanu Mazzucchelli, dopasowana do szerszych twarzy.",
            noscriptHtml: `<h1>Proces Woolet</h1>
<p>Każda oprawa Woolet powstaje wokół jednej twarzy — Twojej. Od pierwszego cyfrowego szkicu po końcowe płukanie ultradźwiękowe przechodzi przez ręce i maszyny kilkanaście razy. 13 etapów. W większości ręcznie. Włoski octan Mazzucchelli.</p>
<ol>${steps.map(([n, t]) => `<li><strong>${escapeHtml(n)}</strong> — ${escapeHtml(t)}</li>`).join("")}</ol>
<p>Wykonane z włoskiego octanu Mazzucchelli. Wykończone ręcznie we Włoszech. <a href="/en/fit">Dobierz rozmiar</a> · <a href="/en/bespoke">Poznaj bespoke</a>.</p>`,
          }
        : {
            title: "The Woolet Process — How Our Italian Acetate Eyewear Is Made",
            description:
              "How a Woolet frame is made: 13 stages across ~14 days, from CAD to ultrasonic cleaning. Hand finished in the EU from Mazzucchelli acetate, tailored for wider faces.",
            noscriptHtml: `<h1>The Woolet Process</h1>
<p>Every Woolet frame is built around one face — yours. From the first digital sketch to the final ultrasonic rinse, it passes through hand and machine more than a dozen times. 13 stages, ~14 days, mostly by hand. Italian Mazzucchelli acetate.</p>
<ol>${steps.map(([n, t]) => `<li><strong>${escapeHtml(n)}</strong> — ${escapeHtml(t)}</li>`).join("")}</ol>
<p>Made from Italian Mazzucchelli acetate. Hand finished in the EU. <a href="/en/fit">Find your fit</a> · <a href="/en/bespoke">Explore bespoke</a>.</p>`,
          },
      { image: processImage, type: "website" },
      [howTo],
    );
    if (isPL) {
      // /pl/process redirects to /en/process in the SPA — canonicalise to EN and noindex the PL shell.
      meta.canonical = enCanonical;
      meta.robots = "noindex, follow";
    }
    return meta;
  }

  // ----- Fit
  if (path === "/fit") {
    return base(route, lang, {
      title: "Find Your Glasses Size in 20 Seconds — FitLens | Woolet",
      description:
        "Scan your face with your phone camera and get a precise frame-size recommendation in about 20 seconds. Built for wide faces. No app, no guesswork.",
    });
  }
  if (path === "/fit/manual") {
    return base(route, lang, {
      title: "Manual Measurement — Woolet Fit",
      description:
        "Measure your face width, bridge and PD with a ruler and a credit card. Manual fallback for the Woolet AI Fit scan.",
    });
  }
  // /fit/scan now redirects to /fit — metadata handled by /fit block above
  if (path === "/fit/bespoke") {
    return base(route, lang, {
      title: "Bespoke Fit — Woolet (145–162 mm)",
      description:
        "If your face falls outside the standard Woolet sizes, bespoke covers 145–162 mm with a 16–26 mm bridge. Hand-crafted by a European atelier from your AI scan.",
    });
  }

  // ----- Collections
  if (path === "/collections/wide-face-glasses") {
    return base(route, lang, {
      title: "Wide-Face Glasses — 158 mm Italian Acetate Frames | Woolet",
      description:
        "Glasses engineered for 155 mm+ faces. Two shapes, 158 mm front, 21–22 mm bridge. Hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Wide Face Glasses</h1>
<p>Italian Mazzucchelli acetate eyewear built for face widths of 155 mm and above. Two shapes (007 round, 009 soft square), one precise 158 mm front width with a 21–22 mm keyhole bridge. Bespoke 145–162 mm. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Wide-Face Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/italian-acetate-sunglasses") {
    return base(route, lang, {
      title: "Italian Acetate Sunglasses — 158 mm | Woolet",
      description:
        "Handmade in the EU from Italian Mazzucchelli acetate sunglasses for wide faces. Round and square. UV400. From $114.",
      noscriptHtml: `<h1>Italian Acetate Sunglasses</h1>
<p>Sunglasses cut from Italian Mazzucchelli cellulose acetate and Hand finished in the EU. Two shapes (Woolet 007 round, 009 soft square), 158 mm front with a 21–22 mm keyhole bridge. UV400, optional polarised lenses. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/italian-mazzucchelli-acetate") {
    return base(route, lang, {
      title: "Italian Mazzucchelli Acetate Glasses 158 mm | Woolet",
      description:
        "Glasses and sunglasses cut from Mazzucchelli 1849 Italian cellulose acetate. Wide 158 mm front, 21–22 mm bridge, hand polished in the EU. From $114.",
      noscriptHtml: `<h1>Italian Mazzucchelli Acetate Glasses</h1>
<p>Wide-face frames cut from Mazzucchelli 1849 cellulose-acetate sheet (Castiglione Olona, Italy) and Hand finished in the EU. Two shapes (Woolet 007 round, 009 soft square), one precise 158 mm front with a 21–22 mm keyhole bridge. Bespoke 145–162 mm. Optical, blue-light, prescription and polarised sunglass options share the same geometry. From $114 pre-order.</p>
<h2>What is Mazzucchelli acetate?</h2>
<p>Cellulose-acetate sheet made by Mazzucchelli 1849, the Italian mill that has produced acetate in Castiglione Olona since 1849. Pigment is layered into a block, batch-cured for weeks and sliced into sheets — denser, more colour-stable and easier to hand-finish than injection-moulded plastic.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Italian Mazzucchelli Acetate", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/oversized-sunglasses-men") {
    return base(route, lang, {
      title: "Oversized Men's Sunglasses — 158 mm Wide | Woolet",
      description:
        "Properly oversized men's sunglasses: 158 mm front, 21–22 mm bridge, Italian acetate. Built for 155 mm+ faces.",
      noscriptHtml: `<h1>Oversized Sunglasses for Men</h1>
<p>Properly oversized men's sunglasses for wide faces (155 mm+). 158 mm front width, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. Two shapes (Woolet 007 round, 009 soft square). Bespoke 145–162 mm. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/sunglasses-for-big-heads") {
    return base(route, lang, {
      title: "Sunglasses for Big Heads — 158 mm, Italian Acetate | Woolet",
      description:
        "Sunglasses that actually fit big heads. 158 mm front, 21–22 mm bridge, hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Sunglasses for Big Heads - 158 mm + Bespoke</h1>
<p>Built from the ground up for wide faces (155 mm+) and head circumference 58 to 64 cm, not retrofitted from standard sizes. Handmade in the EU from Italian Mazzucchelli acetate, two shapes (Woolet 007 round and 009 soft square), one precise 158 mm width plus bespoke up to 165 mm. Pre-order $114 for founding members, $190 at full launch.</p>
<h2>The problem with standard sunglasses</h2>
<ul>
  <li>Frames pinch at the temples within an hour.</li>
  <li>Arms too short to reach behind the ears.</li>
  <li>Lenses sit too close to the eyes and look undersized.</li>
</ul>
<p>Standard eyewear maxes out around 145 to 148 mm of front width. Woolet starts at 158 mm with a 21–22 mm bridge, and bespoke covers anything from 145 to 162 mm. Temples 150 mm standard, up to 155 mm bespoke.</p>
<h2>Size guide</h2>
<table>
  <thead><tr><th>Face / head measurement</th><th>Recommended frame</th></tr></thead>
  <tbody>
    <tr><td>Face width 155–161 mm (head 58–62 cm)</td><td>Woolet 158 mm</td></tr>
    <tr><td>Face width 150–154 mm or 162–165 mm (head 56–58 cm or 62 cm+)</td><td>Bespoke</td></tr>
  </tbody>
</table>
<h2>Frequently asked</h2>
<h3>How many mm is considered wide for sunglasses?</h3>
<p>Mainstream sunglasses sit at 138 to 148 mm across the front. Anything above 150 mm is wide. Woolet's standard size is 158 mm, with bespoke up to 165 mm. The first number printed inside the temple is lens width, not front width.</p>
<h3>What head circumference is considered big?</h3>
<p>Around 58 to 60 cm is large, 60 to 62 cm is XL, and above 62 cm is XXL. Woolet's standard 158 mm covers most XL heads; bespoke handles XXL.</p>
<h3>Where do you buy sunglasses for big heads?</h3>
<p>Specialist makers like Woolet design at 158 mm front width with bespoke above. Mass-market brands mostly cap at 145 to 148 mm even on oversized models, so the lenses are larger but the front is the same.</p>
<h3>Can I get sunglasses custom-made for my head size?</h3>
<p>Yes. Bespoke covers 145 to 162 mm of front width in either shape, with temples up to 155 mm. Same Italian Mazzucchelli acetate as the standard line, made to your measurement.</p>
<h3>Are Woolet sunglasses polarized?</h3>
<p>Polarised lenses are available as an upgrade on both 007 and 009. Standard lenses are CR-39 with UV400 protection.</p>
<h3>How long is the bespoke wait time?</h3>
<p>Bespoke ships approximately 6 to 8 weeks after the standard pre-order batch.</p>
<p><a href="/en/products/007">Shop Woolet 007 (round)</a> | <a href="/en/products/009">Shop Woolet 009 (square)</a> | <a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width</a> | <a href="/en/collections/oversized-sunglasses-men">Oversized sunglasses for men</a></p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Sunglasses for Big Heads", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/glasses-for-big-heads") {
    return base(route, lang, {
      title: "Glasses for Big Heads — 158 mm Italian Acetate | Woolet",
      description:
        "Prescription-ready optical frames for big heads. 158 mm front, 21–22 mm bridge, Italian Mazzucchelli acetate. Bespoke 145–162 mm.",
      noscriptHtml: `<h1>Glasses for Big Heads</h1>
<p>Prescription-ready optical frames for big heads (head circumference 58–64 cm). 158 mm front width, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate Hand finished in the EU. Bespoke 145–162 mm. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Glasses for Big Heads", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/extra-wide-glasses") {
    return base(route, lang, {
      title: "Extra Wide Glasses — 158 mm Italian Acetate Frames | Woolet",
      description:
        "Extra wide glasses engineered for 155 mm+ faces: 158 mm front, 21–22 mm bridge, Italian Mazzucchelli acetate. Bespoke 145–162 mm.",
      noscriptHtml: `<h1>Extra Wide Glasses</h1>
<p>Extra wide optical frames built at 158 mm front width with a 21–22 mm keyhole bridge — properly extra wide, not a stretched standard size. Italian Mazzucchelli acetate, Hand finished in the EU. Bespoke 145–162 mm available. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Extra Wide Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/wide-bridge-glasses") {
    return base(route, lang, {
      title: "Wide Bridge Glasses — 21–22 mm Keyhole Bridge, Acetate | Woolet",
      description:
        "Wide bridge glasses for wider noses: 21–22 mm keyhole bridge, 158 mm front, Italian Mazzucchelli acetate. Bespoke bridge 16–26 mm.",
      noscriptHtml: `<h1>Wide Bridge Glasses</h1>
<p>Glasses with a 21–22 mm keyhole bridge as standard — engineered for wider noses where mainstream 17–19 mm bridges pinch or slide. 158 mm front width, Italian Mazzucchelli acetate. Bespoke bridge 16–26 mm available. From $114 pre-order.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Wide Bridge Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/oversized-blue-light-glasses") {
    return base(route, lang, {
      title: "Oversized Blue Light Glasses — 158 mm Acetate | Woolet",
      description:
        "Truly oversized blue light glasses for wide faces (155 mm+). 158 mm front, 21–22 mm bridge, Italian acetate. HEV 380–460 nm filter lens upgrade.",
      noscriptHtml: `<h1>Oversized Blue Light Glasses for Wide Faces — 158 mm</h1>
<p>Truly oversized blue-light glasses for wide faces (155 mm+). Woolet 007 (round) and 009 (soft square) ship at 158 mm front width with a 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. The HEV 380–460 nm filter is an in-line lens upgrade (+$40), compatible with prescription or plano lenses. Bespoke 145–162 mm available.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Oversized Blue Light Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/blue-light-glasses-for-wide-faces") {
    return base(route, lang, {
      title: "Blue Light Glasses for Wide Faces — 158 mm | Woolet",
      description:
        "Blue light filter glasses for wide faces 155 mm+. 158 mm Italian acetate front, 21–22 mm bridge. HEV 380–460 nm coating upgrade on 007 / 009.",
      noscriptHtml: `<h1>Blue Light Glasses for Wide Faces — 158 mm Acetate</h1>
<p>Blue-light filter glasses designed for wide faces 155 mm+. 158 mm front width, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. HEV 380–460 nm filter is a lens upgrade (+$40) on both Woolet 007 and 009. Pairs with prescription or plano lenses. Bespoke 145–162 mm available.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Blue Light Glasses for Wide Faces", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/thick-frame-glasses") {
    return base(route, lang, {
      title: "Thick Frame Glasses — 7 mm Italian Acetate | Woolet",
      description:
        "Thick frame glasses in 7 mm Italian Mazzucchelli acetate. Two shapes, prescription-ready, 158 mm front for wide faces. Bespoke to 165 mm. From $114.",
      noscriptHtml: `<h1>Thick Frame Glasses — 7 mm Italian Acetate</h1>
<p>Thick frame glasses cut from 7 mm Italian Mazzucchelli acetate — not injection-moulded plastic. Two shapes: round 007 and soft-square 009, both at 158 mm front width with a 21–22 mm keyhole bridge. Hand finished in the EU, prescription-ready, bespoke 145–162 mm. From $114 pre-order.</p>
<p><a href="/en/products/007">Shop Woolet 007 (round)</a> | <a href="/en/products/009">Shop Woolet 009 (soft-square)</a> | <a href="/en/fit">Find my size</a></p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Thick Frame Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }

  // ----- Additional collections (per-route meta so crawlers don't fall back to homepage copy)
  const extraCollections: Record<string, { title: string; description: string; h1: string; intro: string }> = {
    "/collections/big-glasses-frames": {
      title: "Big Glasses Frames for Wide Faces & Big Heads | Woolet",
      description: "Truly big glasses frames: 158 mm front, 21 mm keyhole bridge, hand-finished in the EU from Italian Mazzucchelli acetate. For 155 mm+ faces and 58 cm+ heads.",
      h1: "Big Glasses Frames for Wide Faces & Big Heads",
      intro: "Most 'big' frames at mainstream retailers are 140–148 mm hinge-to-hinge — a larger lens on a standard front. Woolet builds at 158 mm of actual front width with a 21 mm keyhole bridge, in hand-finished in the EU from Italian Mazzucchelli acetate. Bespoke covers 145–162 mm for XXL heads.",
    },
    "/collections/oversized-prescription-glasses": {
      title: "Oversized Prescription Glasses for Wide Faces | Woolet",
      description: "Oversized prescription glasses sized for 155 mm+ faces: 158 mm Italian acetate front, 21–22 mm keyhole bridge, single-vision or progressive lenses.",
      h1: "Oversized Prescription Glasses for Wide Faces & Big Heads",
      intro: "Oversized prescription frames that actually fit a wider face. One precise 158 mm front width with a 21–22 mm keyhole bridge, in Italian Mazzucchelli acetate Hand finished in the EU. Single-vision, progressive and blue-light lens upgrades available. Bespoke 145–162 mm for everything outside the standard range.",
    },
    "/collections/wide-frame-reading-glasses": {
      title: "Wide Frame Reading Glasses for Wide Faces | Woolet",
      description: "Wide frame reading glasses for 155 mm+ faces: 158 mm Italian acetate front, 21–22 mm keyhole bridge, +0.50 to +3.00 readers. Hand finished in the EU.",
      h1: "Wide Frame Reading Glasses for Wide Faces & Big Heads",
      intro: "Reading glasses don't have to mean drugstore frames that pinch. Woolet builds wide-frame readers at 158 mm hinge-to-hinge with a 21–22 mm keyhole bridge, in Italian Mazzucchelli acetate, with reading powers from +0.50 to +3.00. Same frame as the optical line — just dispensed as readers.",
    },
    "/collections/oversized-square-glasses": {
      title: "Oversized Square Glasses for Wide Faces & Big Heads | Woolet",
      description: "Properly oversized square glasses: 158 mm front, 22 mm keyhole bridge, Italian Mazzucchelli acetate. Built for 155 mm+ faces. Bespoke to 165 mm.",
      h1: "Oversized Square Glasses for Wide Faces & Big Heads",
      intro: "Soft-square Italian acetate glasses sized for wider faces. The Woolet 009 ships at a 158 mm front width with a 22 mm keyhole bridge — the geometry that makes a square shape sit balanced on a wider face instead of sliding or pinching. Hand finished in the EU. Bespoke 145–162 mm available.",
    },
    "/collections/oversized-round-glasses": {
      title: "Oversized Round Glasses for Wide Faces & Big Heads | Woolet",
      description: "Properly oversized round glasses: 158 mm front, 21 mm keyhole bridge, Italian Mazzucchelli acetate. Built for 155 mm+ faces. Bespoke to 165 mm.",
      h1: "Oversized Round Glasses for Wide Faces & Big Heads",
      intro: "Round Italian-acetate glasses that read as round, not undersized. The Woolet 007 ships at a 158 mm front width with a 21 mm keyhole bridge — the front-and-bridge combination most round frames lack. Hand finished in the EU. Bespoke 145–162 mm available.",
    },
    "/collections/keyhole-bridge-glasses": {
      title: "Keyhole Bridge Glasses for Wide Faces & Big Heads | Woolet",
      description: "Keyhole bridge glasses with a wider 21–22 mm gap. Italian Mazzucchelli acetate, 158 mm front. Built for wider noses and 155 mm+ faces.",
      h1: "Keyhole Bridge Glasses for Wide Faces & Big Heads",
      intro: "Mainstream bridges sit at 17–20 mm. Woolet's keyhole bridge is 21–22 mm as standard, shaped to load weight on bone rather than cartilage — the difference between a frame that sits balanced and one that slides or pinches a wider nose. 158 mm front, Italian acetate, bespoke bridge 16–26 mm.",
    },
  };
  if (extraCollections[path]) {
    const c = extraCollections[path];
    return base(route, lang, {
      title: c.title,
      description: c.description,
      noscriptHtml: `<h1>${escapeHtml(c.h1)}</h1>\n<p>${escapeHtml(c.intro)}</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: c.h1, url: `${SITE_URL}${route}` },
    ])]);
  }



  // ----- Landing pages
  if (path === "/lp/why-glasses-fail") {
    return base(route, lang, {
      title: "Why Glasses Never Fit Wide Faces — Fix Guide | Woolet",
      description:
        "Most frames top out around 150 mm — too narrow for a wider face. Here's why your glasses pinch or slide, and how to find a pair that actually fits.",
    }, { type: "article" });
  }
  if (path === "/lp/5-reasons") {
    return base(route, lang, {
      title: "5 Reasons Standard Glasses Fail on Wide Faces | Woolet",
      description:
        "Geometry, material, hinges, bridge, market. Five engineering reasons mainstream frames fail on 155 mm+ faces — and what Woolet does differently.",
    }, { type: "article" });
  }

  // ----- Policies
  if (path === "/privacy-policy") {
    return base(route, lang, {
      title: "Privacy Policy | Woolet",
      description: "Woolet privacy policy — how we collect, use and protect your personal information. JAY23 LLC.",
    });
  }
  if (path === "/return-policy") {
    return base(route, lang, {
      title: "Return Policy | Woolet",
      description: "Woolet return and exchange policy — 30-day returns, fit guarantee and hassle-free refunds. JAY23 LLC.",
    });
  }

  // ----- Blog index
  if (path === "/blog") {
    const titles: Record<Lang, Copy> = {
      en: { title: "Blog — Woolet | Wide-Face Eyewear Insights", description: "Expert guides on glasses for wide faces, Italian acetate, frame sizing and finding the perfect fit for 155 mm+ face widths." },
      pl: { title: "Blog — Woolet | Wiedza o okularach na szeroką twarz", description: "Poradniki o okularach na szerokie twarze, włoskim octanie, doborze oprawek i idealnym dopasowaniu dla twarzy 155 mm+." },
      fr: { title: "Blog — Woolet | Conseils lunettes visages larges", description: "Guides experts sur les lunettes pour visages larges, l'acétate italien et le choix des montures pour 155 mm+." },
      es: { title: "Blog — Woolet | Consejos gafas caras anchas", description: "Guías sobre gafas para caras anchas, acetato italiano y cómo encontrar el ajuste perfecto para 155 mm+." },
      de: { title: "Blog — Woolet | Wissen zu Brillen für breite Gesichter", description: "Expertenwissen zu Brillen für breite Gesichter, italienischem Acetat, Fassungsgrößen und der perfekten Passform ab 155 mm." },
      ar: { title: "المدونة — Woolet | رؤى حول نظارات الوجوه العريضة", description: "أدلة الخبراء حول النظارات للوجوه العريضة، الأسيتات الإيطالي، مقاسات الإطار، والمقاس المثالي من 155 ملم فأكثر." },
      ja: { title: "ブログ — Woolet | 幅広い顔のためのアイウェア知見", description: "幅広い顔のためのメガネ、イタリア製アセテート、フレームサイジング、155mm以上の顔幅に最適なフィットに関する専門ガイド。" },
      nl: { title: "Blog — Woolet | Inzichten over bril voor brede gezichten", description: "Expertgidsen over brillen voor brede gezichten, Italiaans acetaat, framematen en de perfecte pasvorm vanaf 155 mm." },

    };
    return base(route, lang, titles[lang]);
  }

  // ----- Blog post
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = getBlogPosts(lang).find((p) => p.slug === slug);
    if (post) {
      const ogImage = post.image
        ? (post.image.startsWith("http") ? post.image : `${SITE_URL}${post.image.startsWith("/") ? post.image : `/${post.image}`}`)
        : `${SITE_URL}/og-${post.slug}.png`;
      return base(
        route,
        lang,
        {
          title: `${post.title} | Woolet`,
          description: post.excerpt,
          // Inject the full article body so Googlebot / ChatGPT-User / no-JS
          // crawlers receive real content in the first response, not the SPA
          // shell. Helmet on the client hydrates the same head on top.
          noscriptHtml: `<article>
<h1>${escapeHtml(post.title)}</h1>
<p><em>${escapeHtml(post.excerpt)}</em></p>
<p><small>Published ${escapeHtml(post.date)} · ${post.readTime} min read</small></p>
${post.content}
</article>`,
        },
        { type: "article", image: ogImage },
        [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: ogImage,
            url: `${SITE_URL}${route}`,
            datePublished: post.date,
            dateModified: post.date,
            author: { "@type": "Organization", name: "Woolet", url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: "Woolet",
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${route}` },
            inLanguage: lang,
            ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
            wordCount: post.readTime * 220,
          },
          breadcrumbJsonLd([
            { name: "Woolet", url: `${SITE_URL}/${lang}` },
            { name: "Blog", url: `${SITE_URL}/${lang}/blog` },
            { name: post.title, url: `${SITE_URL}${route}` },
          ]),
          ...(GUIDE_FAQS[slug] ? [faqPageJsonLd(GUIDE_FAQS[slug])] : []),
        ],
      );
    }
  }

  // ----- JA & FR market SEO landing pages (single-language, custom alternates)
  if (route === "/ja/big-face-glasses") {
    return base(
      route, "ja",
      {
        title: "大きい顔 メガネ 155–161mm | Woolet 幅広イタリア製アセテート",
        description:
          "大きい顔・幅広い顔のためのメガネ。Wooletは155mm・158mm・161mmの実寸フレームをイタリア製マッツケリ・アセテートで手作り。FitLensスキャンで20秒、自分のサイズが分かります。",
        noscriptHtml: `<h1>大きい顔のメガネ — Woolet 155 / 158 / 161 mm</h1>
<p>Wooletは155mm・158mm・161mmの実寸フロント幅を提供する、幅広い顔のためのイタリア製アセテートアイウェアブランドです。素材はMazzucchelli 1849、EUの職人が一本ずつ手作業で仕上げます。FitLensスキャンで顔幅を20秒で計測できます。</p>`,
      },
      { image: DEFAULT_OG },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/ja` },
          { name: "大きい顔 メガネ", url: `${SITE_URL}/ja/big-face-glasses` },
        ]),
      ],
      {
        ja: `${SITE_URL}/ja/big-face-glasses`,
        en: `${SITE_URL}/en/collections/glasses-for-big-heads`,
        "x-default": `${SITE_URL}/en/collections/glasses-for-big-heads`,
      },
    );
  }
  if (route === "/ja/bespoke") {
    return base(
      route, "ja",
      {
        title: "オーダーメイド メガネ 145–162mm | Woolet イタリア製アセテート",
        description:
          "オーダーメイド メガネを145〜162mmまでミリ単位で。Wooletはイタリア製マッツケリ・アセテートを使い、フロント幅・ブリッジ・テンプル長を個別調整。FitLensで顔を測り、職人がEUで手作業仕上げ。",
        noscriptHtml: `<h1>オーダーメイド メガネ — Woolet bespoke 145–162 mm</h1>
<p>Wooletのbespokeはフロント幅、ブリッジ幅、テンプル長、レンズ高さをミリ単位で指定可能。素材はMazzucchelli 1849のイタリア製アセテート、EUで職人が手作業仕上げ。納期は約4〜6週間。</p>`,
      },
      { image: DEFAULT_OG },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/ja` },
          { name: "オーダーメイド メガネ", url: `${SITE_URL}/ja/bespoke` },
        ]),
      ],
      {
        ja: `${SITE_URL}/ja/bespoke`,
        en: `${SITE_URL}/en/bespoke`,
        "x-default": `${SITE_URL}/en/bespoke`,
      },
    );
  }
  if (route === "/fr/lunettes-sur-mesure") {
    return base(
      route, "fr",
      {
        title: "Lunettes sur mesure 145–162 mm | Woolet — acétate italien",
        description:
          "Lunettes sur mesure pour visages larges : 145–162 mm de face, pont 16–26 mm, branches ajustées. Acétate italien Mazzucchelli, fabrication artisanale en UE. Mesure FitLens en 20 s.",
        noscriptHtml: `<h1>Lunettes sur mesure — Woolet bespoke 145–162 mm</h1>
<p>Woolet propose des lunettes sur mesure dont la largeur de face, le pont, la longueur des branches et la hauteur de verre sont ajustés au millimètre. Acétate italien Mazzucchelli 1849, façonné à la main dans l'Union européenne. Délai : 4 à 6 semaines.</p>`,
      },
      { image: DEFAULT_OG },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/fr` },
          { name: "Lunettes sur mesure", url: `${SITE_URL}/fr/lunettes-sur-mesure` },
        ]),
      ],
      {
        fr: `${SITE_URL}/fr/lunettes-sur-mesure`,
        en: `${SITE_URL}/en/bespoke`,
        "x-default": `${SITE_URL}/en/bespoke`,
      },
    );
  }
  if (route === "/pl/okulary-na-zamowienie") {
    return base(
      route, "pl",
      {
        title: "Okulary na zamówienie 145–162 mm | Woolet — włoski octan",
        description:
          "Okulary na zamówienie dla szerszych twarzy: front 145–162 mm, mostek 16–26 mm, zauszniki dopasowane. Włoski octan Mazzucchelli, ręcznie w UE. Pomiar FitLens w 20 s.",
        noscriptHtml: `<h1>Okulary na zamówienie — Woolet bespoke 145–162 mm</h1>
<p>Woolet oferuje okulary szyte na miarę: szerokość frontu, mostek, długość zauszników i wysokość soczewki ustalasz co do milimetra. Materiał: włoski octan Mazzucchelli 1849, ręcznie wykończony w UE. Czas realizacji: 4–6 tygodni.</p>`,
      },
      { image: DEFAULT_OG },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/pl` },
          { name: "Okulary na zamówienie", url: `${SITE_URL}/pl/okulary-na-zamowienie` },
        ]),
      ],
      {
        pl: `${SITE_URL}/pl/okulary-na-zamowienie`,
        en: `${SITE_URL}/en/bespoke`,
        "x-default": `${SITE_URL}/en/bespoke`,
      },
    );
  }

  // ----- Compare / competitor-alternative pages
  if (path === "/compare") {
    return base(
      route,
      lang,
      {
        title: "Woolet vs the Alternatives — Wide-Face Eyewear Comparisons",
        description:
          "Head-to-head comparisons between Woolet and other wide-face eyewear brands — Fatheadz, EYESHELLS, Zenni, Warby Parker, Ray-Ban and Persol.",
      },
      { image: `${SITE_URL}/og-compare-index.png`, type: "website" },
      [compareIndexBreadcrumbJsonLd(), compareIndexItemListJsonLd()],
    );
  }

  const compareMatch = path.match(/^\/compare\/(.+)$/);
  if (compareMatch) {
    const slug = compareMatch[1];
    const c = competitors.find((x) => x.slug === slug);
    if (c) {
      return base(
        route,
        lang,
        {
          title: c.seoTitle,
          description: c.metaDescription,
        },
        { image: `${SITE_URL}/og-compare-${c.slug}.png`, type: "website" },
        [compareFaqJsonLd(c), compareProductJsonLd(c), compareBreadcrumbJsonLd(c)],
      );
    }
  }

  // ----- Numeric size landing cluster
  const sizeMatch = path.match(/^\/size\/(\d+mm)$/);
  if (sizeMatch) {
    const s = getSizeBySlug(sizeMatch[1]);
    if (s) {
      return base(
        route,
        lang,
        {
          title: `${s.width} mm Wide Glasses | Frames That Actually Fit — Woolet`,
          description: s.metaDescription,
          noscriptHtml: `<h1>${s.h1}</h1>
<p>${s.subhead}</p>
<h2>Does 158 mm fit a ${s.width} mm face?</h2>
<p>${s.fitVerdict}</p>
<p>${s.intro}</p>
<p>Signature 158 mm · Bespoke 145–162 mm · Hand made in EU · Mazzucchelli acetate from Milan, Italy.</p>
<p><a href="/en/fit">Measure my face with FitLens</a> · <a href="/en/products/007">Woolet 007 Round</a> · <a href="/en/products/009">Woolet 009 Soft Square</a> · <a href="/en/bespoke">Bespoke 145–162 mm</a></p>`,
        },
        { image: DEFAULT_OG, type: "website" },
        [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: s.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Size Guide", item: `${SITE_URL}/en/blog/glasses-for-wide-faces-guide` },
              { "@type": "ListItem", position: 3, name: `${s.width} mm wide glasses`, item: `${SITE_URL}${route}` },
            ],
          },
        ],
      );
    }
  }

  // ----- Numeric bridge landing cluster
  const bridgeMatch = path.match(/^\/bridge\/(\d+mm)$/);
  if (bridgeMatch) {
    const b = getBridgeBySlug(bridgeMatch[1]);
    if (b) {
      return base(
        route,
        lang,
        {
          title: `${b.width} mm Bridge Glasses | Wide-Face Bridge Sizing — Woolet`,
          description: b.metaDescription,
          noscriptHtml: `<h1>${b.h1}</h1>
<p>${b.subhead}</p>
<h2>Does Woolet fit a ${b.width} mm bridge?</h2>
<p>${b.fitVerdict}</p>
<p>${b.intro}</p>
<p>Signature bridges: 21 mm keyhole (007) · 22 mm (009). Bespoke 20–24 mm.</p>
<p><a href="/en/products/007">Woolet 007 · 21 mm keyhole</a> · <a href="/en/products/009">Woolet 009 · 22 mm</a> · <a href="/en/bespoke">Bespoke bridge</a> · <a href="/en/collections/wide-bridge-glasses">Wide-bridge hub</a></p>`,
        },
        { image: DEFAULT_OG, type: "website" },
        [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: b.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Bridge Guide", item: `${SITE_URL}/en/collections/wide-bridge-glasses` },
              { "@type": "ListItem", position: 3, name: `${b.width} mm bridge glasses`, item: `${SITE_URL}${route}` },
            ],
          },
        ],
      );
    }
  }

  // ----- Numeric temple-length landing cluster
  const templeMatch = path.match(/^\/temple\/(\d+mm)$/);
  if (templeMatch) {
    const t = getTempleBySlug(templeMatch[1]);
    if (t) {
      return base(
        route,
        lang,
        {
          title: `${t.length} mm Temple Glasses | Wide-Face Temple Sizing — Woolet`,
          description: t.metaDescription,
          noscriptHtml: `<h1>${t.h1}</h1>
<p>${t.subhead}</p>
<h2>Does Woolet fit a ${t.length} mm temple?</h2>
<p>${t.fitVerdict}</p>
<p>${t.intro}</p>
<p>Signature temples: 150 mm on both 007 and 009. Bespoke 145–155 mm.</p>
<p><a href="/en/products/007">Woolet 007</a> · <a href="/en/products/009">Woolet 009</a> · <a href="/en/bespoke">Bespoke temples</a> · <a href="/en/fit">FitLens</a></p>`,
        },
        { image: DEFAULT_OG, type: "website" },
        [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Fit Guide", item: `${SITE_URL}/en/fit` },
              { "@type": "ListItem", position: 3, name: `${t.length} mm temple glasses`, item: `${SITE_URL}${route}` },
            ],
          },
        ],
      );
    }
  }

  // ----- XXL / Wide-Face hub cluster
  if (path === "/xxl") {
    return base(
      route,
      lang,
      {
        title: XXL_HUB.metaTitle,
        description: XXL_HUB.metaDescription,
        noscriptHtml: `<h1>${XXL_HUB.h1}</h1>
<p>${XXL_HUB.subhead}</p>
<p>${XXL_HUB.intro}</p>
<h2>Explore the XXL cluster</h2>
<ul>${XXL_PAGES.map((s) => `<li><a href="/en/xxl/${s.slug}">${s.h1}</a></li>`).join("")}</ul>
<p><a href="/en/fit/bespoke">Start XXL bespoke</a> · <a href="/en/fit">FitLens</a> · <a href="/en/collections/wide-face-glasses">Wide-face collection</a></p>`,
      },
      { image: DEFAULT_OG, type: "website" },
      [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
            { "@type": "ListItem", position: 2, name: "XXL Sizing", item: `${SITE_URL}${route}` },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: XXL_PAGES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.h1,
            url: `${SITE_URL}/en/xxl/${s.slug}`,
          })),
        },
      ],
    );
  }

  const xxlMatch = path.match(/^\/xxl\/([a-z0-9-]+)$/);
  if (xxlMatch) {
    const x = getXxlBySlug(xxlMatch[1]);
    if (x) {
      return base(
        route,
        lang,
        {
          title: x.metaTitle,
          description: x.metaDescription,
          noscriptHtml: `<h1>${x.h1}</h1>
<p>${x.subhead}</p>
<p>${x.intro}</p>
<h2>Specification</h2>
<ul>${x.spec.map((s) => `<li><strong>${s.label}:</strong> ${s.value}</li>`).join("")}</ul>
<p><a href="${x.primaryCta.to}">${x.primaryCta.label}</a> · <a href="${x.secondaryCta.to}">${x.secondaryCta.label}</a> · <a href="/en/xxl">XXL hub</a></p>`,
        },
        { image: DEFAULT_OG, type: "website" },
        [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: x.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "XXL Sizing", item: `${SITE_URL}/en/xxl` },
              { "@type": "ListItem", position: 3, name: x.h1, item: `${SITE_URL}${route}` },
            ],
          },
        ],
      );
    }
  }

  // ----- /en/bespoke (canonical bespoke landing)
  if (path === "/bespoke" && lang === "en") {
    return base(
      route,
      lang,
      {
        title: "Bespoke Glasses for Wide Faces — 145–162 mm | Woolet",
        description:
          "Bespoke eyewear for wide faces, 145–162 mm front width. Italian Mazzucchelli acetate, hand made in the EU. From $299 for the first 100 backers.",
        noscriptHtml: `<h1>Woolet Bespoke — 145–162 mm</h1>
<p>Woolet Bespoke is made-to-measure eyewear for faces outside the 155–161 mm core range. Front width covers 145–162 mm, bridge 16–26 mm, temples 145–155 mm. Same Italian Mazzucchelli 1849 cellulose acetate, hand made in the EU. Founding price $299 for the first 100 backers ($480 MSRP).</p>
<p>Choose the 007 round-panto or 009 soft-square silhouette, submit measurements from the AI Fit Scan, and we build a single frame around your exact face. <a href="/en/fit/bespoke">Start the bespoke fit scan</a>.</p>`,
      },
      { image: DEFAULT_OG, type: "website" },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Bespoke", url: `${SITE_URL}/en/bespoke` },
        ]),
        faqPageJsonLd([
          { q: "What face widths does Woolet Bespoke cover?", a: "Bespoke covers 145–162 mm front width, 16–26 mm bridge, and 145–155 mm temples — outside the 155–161 mm core range." },
          { q: "How much does bespoke cost?", a: "$299 USD for the first 100 backers, $480 MSRP after. Includes measurements review, one production run, and free shipping." },
          { q: "How long does bespoke take?", a: "About 6 weeks from confirmed measurements to shipped frame — 13 stages, hand made in the EU from Italian Mazzucchelli acetate." },
        ]),
      ],
    );
  }

  // ----- /de and /de/{slug}: DE landing hub + spokes
  if (lang === "de") {
    const canonical = `${SITE_URL}${route}`;
    if (path === "/") {
      return base(route, lang, {
        title: "Woolet — Brillen für breite Gesichter (155 mm+) aus italienischem Acetat",
        description:
          "Premium-Brillen aus italienischem Mazzucchelli-Acetat für breite Gesichter (ab 155 mm). Eine präzise Größe (158 mm), plus Maßanfertigung 145–162 mm. Ab 114 $ im Pre-Order.",
        noscriptHtml: `<h1>Woolet — Brillen für breite Gesichter</h1>
<p>Woolet fertigt Brillen für breite Gesichter und große Köpfe: 158 mm Frontbreite, 21–22 mm Keyhole-Steg, italienisches Mazzucchelli-Acetat, in der EU handgefertigt. Founding-Preis 114 $ (statt 190 $).</p>
<p>Landingpages: <a href="/de/brille-fuer-breites-gesicht">Brille für breites Gesicht</a> · <a href="/de/breite-brille">Breite Brille</a> · <a href="/de/brille-grosse-koepfe">Brille für große Köpfe</a> · <a href="/de/xxl-brille-herren">XXL Brille Herren</a>.</p>`,
      });
    }
    const slug = path.replace(/^\//, "");
    const de = dePages[slug];
    if (de) {
      return base(
        route,
        lang,
        {
          title: de.metaTitle,
          description: de.metaDescription,
          noscriptHtml: `<h1>${escapeHtml(de.h1)}</h1><p>${escapeHtml(de.sub)}</p>`,
        },
        { image: DEFAULT_OG, type: "website" },
        [
          breadcrumbJsonLd([
            { name: "Woolet", url: `${SITE_URL}/de` },
            { name: de.h1, url: canonical },
          ]),
          ...(de.faqs && de.faqs.length ? [faqPageJsonLd(de.faqs.map((f) => ({ q: f.q, a: f.a })))] : []),
        ],
      );
    }
  }

  // Fallback: home copy for that lang
  return base(route, lang, homeCopy[lang]);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// ---------------------------------------------------------------------------
// Route list
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  "/en",
  "/en/about",
  "/en/process",
  "/en/products/007",
  "/en/products/009",
  "/en/products/bespoke",
  "/en/fit",
  "/en/fit",
  "/en/fit/manual",
  "/en/fit/bespoke",
  "/en/collections/wide-face-glasses",
  "/en/collections/italian-acetate-sunglasses",
  "/en/collections/italian-mazzucchelli-acetate",
  "/en/collections/oversized-sunglasses-men",
  "/en/collections/sunglasses-for-big-heads",
  "/en/collections/glasses-for-big-heads",
  "/en/collections/extra-wide-glasses",
  "/en/collections/wide-bridge-glasses",
  "/en/collections/oversized-blue-light-glasses",
  "/en/collections/blue-light-glasses-for-wide-faces",
  "/en/collections/thick-frame-glasses",
  "/en/collections/big-glasses-frames",
  "/en/collections/oversized-prescription-glasses",
  "/en/collections/wide-frame-reading-glasses",
  "/en/collections/oversized-square-glasses",
  "/en/collections/oversized-round-glasses",
  "/en/collections/keyhole-bridge-glasses",
  "/en/bespoke",
  "/de",
  "/de/brille-fuer-breites-gesicht",
  "/de/breite-brille",
  "/de/brille-grosse-koepfe",
  "/de/xxl-brille-herren",
  "/de/brille-breite-160-mm",
  "/en/lp/why-glasses-fail",
  "/en/lp/5-reasons",
  "/en/privacy-policy",
  "/en/return-policy",
  "/en/blog",
  "/en/compare",
  "/en/compare/fatheadz-alternative",
  "/en/compare/eyeshells-alternative",
  "/en/compare/zenni-alternative",
  "/en/compare/warby-parker-alternative",
  "/en/compare/ray-ban-alternative",
  "/en/compare/persol-alternative",
  "/pl",
  "/pl/process",
  "/pl/blog",
  "/pl/privacy-policy",
  "/pl/return-policy",
  "/pl/okulary-na-zamowienie",
  "/fr",
  "/fr/lunettes-sur-mesure",
  "/es",
  "/ja",
  "/ja/big-face-glasses",
  "/ja/bespoke",
  "/en/size/145mm",
  "/en/size/150mm",
  "/en/size/152mm",
  "/en/size/155mm",
  "/en/size/158mm",
  "/en/size/160mm",
  "/en/size/162mm",
  "/en/size/165mm",
  "/en/bridge/18mm",
  "/en/bridge/19mm",
  "/en/bridge/20mm",
  "/en/bridge/21mm",
  "/en/bridge/22mm",
  "/en/bridge/24mm",
  "/en/temple/140mm",
  "/en/temple/145mm",
  "/en/temple/150mm",
  "/en/temple/152mm",
  "/en/temple/155mm",
  "/en/xxl",
  "/en/xxl/glasses",
  "/en/xxl/sunglasses",
  "/en/xxl/for-big-heads",
  "/en/xxl/extra-wide-frames",
  // Routes previously falling back to the SPA shell — now prerendered so
  // JS-less crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, OAI-SearchBot)
  // receive real per-route head metadata instead of an empty index.html.
  "/ar",
  "/fr",
  "/nl",
  "/en/collection",
  "/fr/collection",
  "/nl/collection",
  "/en/hat-size-calculator",
  "/en/collections/extra-large-oversized-eyeglasses",
  "/en/collections/oversized-black-glasses",
  "/fr/products/007",
  "/fr/products/009",
  "/fr/products/bespoke",
  "/nl/products/007",
  "/nl/products/009",
  "/nl/products/bespoke",
  "/nl/acetaat-bril-op-maat",
  "/nl/grote-brillen-heren",
  "/de/blog",
  "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
  "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
  "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
  "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
  "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  "/en/blog/category/nose-bridge-fit",
  "/en/lp/kickstarter",
  "/en/lp/wide-bridge-fit-guide",
  "/pl/jak-dobrac-okulary-do-twarzy",
];

export function getAllRoutes(): string[] {
  const blogRoutes: string[] = [];
  for (const lang of ["en", "pl"] as Lang[]) {
    for (const post of getBlogPosts(lang)) {
      blogRoutes.push(`/${lang}/blog/${post.slug}`);
    }
  }
  return [...STATIC_ROUTES, ...blogRoutes];
}

let _knownRouteSet: Set<string> | null = null;
function getKnownRouteSet(): Set<string> {
  if (!_knownRouteSet) _knownRouteSet = new Set(getAllRoutes());
  return _knownRouteSet;
}

// ---------------------------------------------------------------------------
// HTML rendering — used by the prerender script.
// ---------------------------------------------------------------------------

export function renderHeadHtml(meta: RouteMeta): string {
  // Every tag emitted by the prerender is stamped with data-seo="prerender".
  // At runtime, src/lib/strip-prerender-seo.ts removes every element matching
  // that selector from document.head BEFORE react-helmet-async mounts, so the
  // Helmet-managed tags become the only copy in the DOM after hydration.
  // This is the single mechanism that prevents duplicate <title>,
  // <meta name="description">, <link rel="canonical"> and hreflang links.
  const D = ` data-seo="prerender"`;
  const tags: string[] = [];
  tags.push(`<title${D}>${escapeHtml(meta.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(meta.description)}"${D} />`);
  tags.push(`<link rel="canonical" href="${meta.canonical}"${D} />`);
  if (meta.robots) tags.push(`<meta name="robots" content="${meta.robots}"${D} />`);

  // hreflang — always reciprocal. Only emit alternates for locales whose
  // localized route actually exists (present in STATIC_ROUTES or a known
  // blog slug). Non-existent alternates break reciprocity and get dropped
  // by Google, so we never fabricate them here.
  if (meta.alternates) {
    for (const [hreflang, href] of Object.entries(meta.alternates)) {
      tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${href}"${D} />`);
    }
  } else {
    const path = meta.canonical.replace(SITE_URL, "").replace(/^\/[a-z]{2}/, "");
    const known = getKnownRouteSet();
    const availableLangs = INDEXABLE_LANGS.filter((l) =>
      known.has(`/${l}${path}`),
    );
    for (const l of availableLangs) {
      tags.push(`<link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${path}"${D} />`);
    }
    if (availableLangs.includes("en" as typeof INDEXABLE_LANGS[number])) {
      tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path}"${D} />`);
    }
  }

  // OpenGraph
  tags.push(`<meta property="og:title" content="${escapeHtml(meta.og.title)}"${D} />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(meta.og.description)}"${D} />`);
  tags.push(`<meta property="og:url" content="${meta.canonical}"${D} />`);
  tags.push(`<meta property="og:type" content="${meta.og.type}"${D} />`);
  tags.push(`<meta property="og:site_name" content="Woolet"${D} />`);
  tags.push(`<meta property="og:image" content="${meta.og.image}"${D} />`);
  tags.push(`<meta property="og:locale" content="${meta.og.locale}"${D} />`);

  // Twitter
  tags.push(`<meta name="twitter:card" content="summary_large_image"${D} />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.og.title)}"${D} />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.og.description)}"${D} />`);
  tags.push(`<meta name="twitter:image" content="${meta.og.image}"${D} />`);
  tags.push(`<meta name="twitter:site" content="@WooletEyewear"${D} />`);

  for (const obj of meta.jsonLd) {
    tags.push(`<script type="application/ld+json"${D}>${JSON.stringify(obj)}</script>`);
  }

  return tags.join("\n    ");
}
