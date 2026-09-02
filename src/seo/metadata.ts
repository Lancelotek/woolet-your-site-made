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
import { blogMetaBySlug } from "@/lib/blog-meta";
import { hreflangAlternates } from "@/i18n/routeRegistry";
// Re-export so scripts/generate-sitemap.mjs can consume the SAME cluster
// resolver as renderHeadHtml() from a single SSR bundle (no drift).
export { hreflangAlternates } from "@/i18n/routeRegistry";
import { getBlogPosts } from "@/lib/blog-data";
import { competitors, wooletColumn } from "@/data/competitors";
import { PRODUCT_FAQ, GUIDE_FAQS, faqPageJsonLd } from "./faq-data";
import { getProductReviews } from "@/data/product-reviews";
import { getSizeBySlug, SIZES } from "@/data/sizes";
import { REF_PRODUCTS, refProductBySlug } from "@/data/reference-products";
import { FIT_FAQ, FIT_BANDS } from "./fit-faq";
import { FIT_JSONLD } from "./fit-jsonld";
import { getBridgeBySlug } from "@/data/bridges";
import { getTempleBySlug } from "@/data/temples";
import { XXL_HUB, XXL_PAGES, getXxlBySlug } from "@/data/xxl";
import { dePages, dePageOrder } from "@/content/de/landingPages";
import { nlPages } from "@/content/nl/landingPages";
import { plPages } from "@/content/pl/landingPages";
import { koPages, KO_ROUTES } from "@/content/ko/landingPages";
import { collectionSeo, COLLECTION_ITEMS } from "./collection-copy";
import { collectionJsonLd } from "./product-collection-jsonld";
import { HAT_SIZE_FAQ } from "./hat-size-faq";
import ksHeroAsset from "@/assets/kickstarter-hero.png.asset.json";
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
  /**
   * Real, page-specific content-change date (ISO yyyy-mm-dd) — emitted as
   * <lastmod> in the sitemap. Only set when a genuine date exists (e.g. a
   * blog post's publication date). NEVER a build timestamp.
   */
  lastmod?: string;
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

function productJsonLd(model: "007" | "009", shape: string, lensSize: string, lang: Lang = "en") {
  const bridge = model === "009" ? "22 mm" : "21 mm";
  const url = `${SITE_URL}/${lang}/products/${model}`;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    inLanguage: lang,
    name: `Woolet ${model} — ${shape} Italian Acetate Eyewear (158 mm)`,
    description: `Woolet ${model} (${shape}) in Italian Mazzucchelli acetate. One precise size — 158 mm front width with a ${bridge} keyhole bridge — engineered for wide faces (155–161 mm). Bespoke tier covers 145–172 mm. Lens ${lensSize}, temples 150 mm, 5-barrel PVD Gunmetal hinges.`,
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
      { "@type": "PropertyValue", name: "Bespoke range", value: "145–172 mm" },
      { "@type": "PropertyValue", name: "Frame origin", value: "Hand made in EU" },
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

function bespokeProductJsonLd(lang: Lang = "en") {
  const url = `${SITE_URL}/${lang}/products/bespoke`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    inLanguage: lang,
    name: "Woolet Bespoke — Custom Acetate Glasses",
    description:
      "Bespoke Italian Mazzucchelli acetate glasses cut to the buyer's face. Four silhouettes: Aviator, Rectangle, Crown Panto, Round. Sizes 145–172 mm.",
    brand: { "@type": "Brand", name: "Woolet" },
    image: [`${SITE_URL}/og-image.png`],
    sku: "WOOLET-BESPOKE",
    mpn: "WOOLET-BESPOKE",
    material: "Italian Mazzucchelli Acetate",
    category: "Eyewear > Optical frames > Bespoke",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Frame width", value: "145–172 mm" },
      { "@type": "PropertyValue", name: "Fit", value: "Cut to your face" },
      { "@type": "PropertyValue", name: "Frame origin", value: "Hand made in EU" },
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
    case "ko": return "ko_KR";
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

type Copy = { title: string; description: string; noscriptHtml?: string   /** Real page-specific content-change date (ISO), e.g. a post date. */
  lastmod?: string;
};

const homeCopy: Record<Lang, Copy> = {
  ko: {
    title: koPages["/ko"].metaTitle,
    description: koPages["/ko"].metaDescription,
  },
  en: {
    title: "Woolet — Premium Glasses for Wide Faces & Big Heads (158 mm)",
    description:
      "Italian Mazzucchelli acetate glasses engineered for wider faces. One precise 158 mm size, keyhole bridge, Hand made in EU. Find your fit in 20s.",
    noscriptHtml: `<h1>Woolet — Premium Glasses for Wide Faces & Big Heads</h1>
<p>Woolet makes premium Italian-acetate eyewear engineered for wide faces — temple-to-temple measurements of 155 mm and above. Two shapes (007 round, 009 soft square), both built in one precise size: 158 mm front width with a 21–22 mm keyhole bridge. A bespoke tier covers 145–172 mm.</p>
<p>Frames are cut from Italian Mazzucchelli cellulose acetate, Hand made in EU, with 5-barrel PVD Gunmetal hinges and a 21–22 mm keyhole bridge engineered for wider noses.</p>
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
    // The /de hub is the only inbound link to the DE landing pages in the
    // JS-free HTML — all six must be listed here or they stay orphaned.
    noscriptHtml: `<h1>Woolet — Brillen für breite Gesichter</h1>
<p>Woolet fertigt Brillen für breite Gesichter und große Köpfe: 158 mm Frontbreite, 21–22 mm Keyhole-Steg, italienisches Mazzucchelli-Acetat, in der EU handgefertigt. Founding-Preis 114 $ (statt 190 $).</p>
<p>Landingpages: <a href="/de/brille-fuer-breites-gesicht">Brille für breites Gesicht</a> · <a href="/de/breite-brille">Breite Brille</a> · <a href="/de/brille-grosse-koepfe">Brille für große Köpfe</a> · <a href="/de/xxl-brille-herren">XXL Brille Herren</a> · <a href="/de/blaulichtfilter-brille-herren">Blaulichtfilter-Brille Herren</a> · <a href="/de/brille-breite-160-mm">Brille Breite 160 mm</a>.</p>`,
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
      "Italiaanse Mazzucchelli-acetaatbril ontworpen voor bredere gezichten. Eén precieze maat 158 mm, keyhole-brug, met de hand afgewerkt in de EU. Vind je pasvorm in 20 seconden.",
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
    lastmod: copy.lastmod,
    noscriptHtml: copy.noscriptHtml,
    alternates,
  };
}

/**
 * Korean routes. Copy comes exclusively from src/content/ko/landingPages.ts,
 * which throws at import time when a Korean string is missing — there is NO
 * English fallback for /ko by design.
 */
function koMetadata(route: string): RouteMeta | null {
  const cfg = koPages[route];
  if (!cfg) return null;

  const renderSection = (sec: (typeof cfg.sections)[number]) => {
    const parts: string[] = [`<h2>${escapeHtml(sec.h2)}</h2>`, `<p>${escapeHtml(sec.body)}</p>`];
    for (const p of sec.paras ?? []) parts.push(`<p>${escapeHtml(p)}</p>`);
    if (sec.list?.length) {
      const tag = sec.ordered ? "ol" : "ul";
      parts.push(`<${tag}>${sec.list.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</${tag}>`);
    }
    if (sec.table) {
      const head = sec.table.head.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join("");
      const rows = sec.table.rows
        .map((r) => `<tr>${r.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("");
      parts.push(`<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`);
    }
    if (sec.callout?.length) {
      parts.push(`<blockquote>${sec.callout.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}</blockquote>`);
    }
    if (sec.code) parts.push(`<pre><code>${escapeHtml(sec.code)}</code></pre>`);
    if (sec.emphasis) parts.push(`<p><strong>${escapeHtml(sec.emphasis)}</strong></p>`);
    if (sec.bullets?.length) {
      parts.push(
        `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b.label)}: ${escapeHtml(b.value)}</li>`).join("")}</ul>`,
      );
    }
    for (const cta of sec.ctas ?? []) {
      parts.push(`<p><a href="${cta.href}">${escapeHtml(cta.label)}</a></p>`);
    }
    if (sec.link) parts.push(`<p><a href="${sec.link.href}">${escapeHtml(sec.link.label)}</a></p>`);
    return parts.join("\n");
  };

  const body = cfg.sections.map(renderSection).join("\n");
  const links = KO_ROUTES.filter((p) => p !== route)
    .map((p) => `<li><a href="${p}">${escapeHtml(koPages[p].h1)}</a></li>`)
    .join("");
  const faqs = cfg.faqs
    .map((f) => `<h3>${escapeHtml(f.q)}</h3>\n<p>${escapeHtml(f.a)}</p>`)
    .join("\n");
  const faqBlock = cfg.faqs.length ? `<h2>자주 묻는 질문</h2>\n${faqs}` : "";

  const noscriptHtml = `<h1>${escapeHtml(cfg.h1)}</h1>
<p>${escapeHtml(cfg.sub)}</p>
${body}
${faqBlock}
<nav><ul>${links}</ul></nav>`;


  const alternates = cfg.englishEquivalent
    ? undefined // registry cluster (ROUTES.home / size.*) emits en + ko + x-default
    : {
        ko: `${SITE_URL}${route}`,
        "x-default": `${SITE_URL}/en`,
      };

  const meta = base(
    route,
    "ko",
    { title: cfg.metaTitle, description: cfg.metaDescription, noscriptHtml },
    { image: DEFAULT_OG },
    [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: cfg.h1,
        description: cfg.metaDescription,
        url: `${SITE_URL}${route}`,
        inLanguage: "ko",
        isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE_URL },
      },
      breadcrumbJsonLd(
        route === "/ko"
          ? [{ name: "Woolet", url: `${SITE_URL}/ko` }]
          : [
              { name: "Woolet", url: `${SITE_URL}/ko` },
              { name: cfg.h1, url: `${SITE_URL}${route}` },
            ],
      ),
      ...(cfg.faqs.length ? [faqPageJsonLd(cfg.faqs.map((f) => ({ q: f.q, a: f.a })))] : []),
    ],
    alternates,
  );

  if (cfg.noindex) meta.robots = "noindex, follow";
  return meta;
}

export function getMetadata(route: string): RouteMeta {
  const lang = langFromRoute(route);
  const path = route.replace(/^\/[a-z]{2}/, "") || "/";

  // ----- Reference product pages (partners / creators), English only
  if (path === "/ref" || path.startsWith("/ref/")) {
    if (path === "/ref") {
      const meta = base(
        "/en/ref",
        "en",
        {
          title: "Woolet reference product pages",
          description:
            "Read-only reference product pages for partners and creators. Specs, photography and copy for every Woolet frame.",
          noscriptHtml: `<h1>Woolet product reference</h1>
<p>${REF_PRODUCTS.map((p) => `<a href="/en/ref/${p.slug}">${escapeHtml(p.name)}</a>`).join(" · ")}</p>`,
        },
        { image: DEFAULT_OG },
      );
      meta.robots = "noindex, follow";
      return meta;
    }
    const p = refProductBySlug(path.replace("/ref/", ""));
    if (p) {
      const canonical = `${SITE_URL}/en/ref/${p.slug}`;
      return base(
        `/en/ref/${p.slug}`,
        "en",
        {
          title: p.metaTitle,
          description: p.metaDescription,
          noscriptHtml: `<h1>${escapeHtml(p.name)}</h1>
<p>${escapeHtml(p.tagline)}</p>
<p>$${p.priceUsd} — ${p.model === "bespoke" ? "lenses included" : "frame with demo lens"}</p>
<p>${escapeHtml(p.intro)}</p>
${p.body.map((b) => `<p>${escapeHtml(b)}</p>`).join("")}
<h2>Specifications</h2>
<ul>${p.specs.map(([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(v)}</li>`).join("")}</ul>
<h2>Lens options</h2>
<ul>${p.lensOptions.map((l) => `<li>${escapeHtml(l.name)} — $${l.priceUsd}. ${escapeHtml(l.note)}</li>`).join("")}</ul>
<p>${REF_PRODUCTS.filter((o) => o.slug !== p.slug).map((o) => `<a href="/en/ref/${o.slug}">${escapeHtml(o.name)}</a>`).join(" · ")}</p>
<p><a href="/en/fit">Check your fit in 30 seconds</a></p>`,
        },
        { image: p.images[0].src, type: "product" },
        [
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            image: p.images.map((im) => im.src),
            description: p.intro,
            brand: { "@type": "Brand", name: "Woolet" },
            color: p.colour,
            material: "Mazzucchelli acetate",
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: p.priceUsd,
              availability: p.model === "003" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
              url: canonical,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Frames", item: `${SITE_URL}/en/collection` },
              { "@type": "ListItem", position: 3, name: p.name, item: canonical },
            ],
          },
        ],
      );
    }
  }


  // Korean locale — handled before every generic branch so a /ko route can
  // never fall through to English copy.
  if (route === "/ko" || route.startsWith("/ko/")) {
    const ko = koMetadata(route);
    if (ko) return ko;
  }

  // Homepage
  if (path === "/" || path === "") {
    return base(route, lang, homeCopy[lang], { image: DEFAULT_OG }, lang === "en" ? [websiteJsonLd] : []);
  }

  // ----- Products
  if (path === "/products/007") {
    const copy: Partial<Record<Lang, Copy>> = {
      en: {
        title: "007 Round — Wide-Fit Round Glasses, 158 mm | Woolet",
        description:
          "Round glasses built for wider faces: 158 mm front, keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Made for 155 mm+ faces. See the fit.",
        noscriptHtml: `<h1>Woolet 007 — Round, 158 mm</h1>
<p>The Woolet 007 is a round-panto eyewear shape cut from Italian Mazzucchelli cellulose acetate and Hand made in EU. One precise size: 158 mm front width with a 21 mm keyhole bridge. Lens 52 × 52 mm, temples 150 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Honey tortoise, Piano black, Crystal. Pre-order $114 for founding members ($1 deposit locks the price); $190 MSRP at full launch. Bespoke 145–172 mm available.</p>`,
      },
      nl: {
        title: "Woolet 007 — ronde panto acetaatbril, 158 mm",
        description:
          "Ronde panto in acetaat, 158 mm breed met 21 mm brug. Ontworpen voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast.",
        noscriptHtml: `<h1>Woolet 007 — ronde panto acetaatbril, 158 mm</h1>
<p>Ronde panto in Italiaans Mazzucchelli-acetaat, 158 mm breed met een 21 mm keyhole-brug. Glas 52 × 52 mm, veren 150 mm. Handgemaakt in de EU. Ontworpen voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast (adviesprijs $190). Bespoke 145–172 mm beschikbaar.</p>`,
      },
      fr: {
        title: "Woolet 007 — lunettes rondes panto en acétate, 158 mm",
        description:
          "Monture ronde panto en acétate, 158 mm de large avec pont keyhole 21 mm. Conçue pour les visages de 155 mm+. Réservez pour 1 $ et bloquez le prix fondateur de 114 $.",
        noscriptHtml: `<h1>Woolet 007 — lunettes rondes panto en acétate, 158 mm</h1>
<p>Monture ronde panto en acétate italien Mazzucchelli, 158 mm de large avec un pont keyhole de 21 mm. Verres 52 × 52 mm, branches 150 mm. Façonnée à la main dans l'Union européenne. Conçue pour les visages de 155 mm et plus. Réservez pour 1 $ et bloquez le prix fondateur de 114 $ (prix public 190 $). Sur mesure 145–172 mm.</p>`,
      },
    };
    return base(
      route,
      lang,
      copy[lang] ?? copy.en!,
      { image: `${SITE_URL}/og-007.png`, type: "product" },
      [
        productJsonLd("007", "Round", "52 × 52 mm", lang),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/${lang}` },
          { name: "Products", url: `${SITE_URL}/${lang}` },
          { name: "Woolet 007", url: `${SITE_URL}/${lang}/products/007` },
        ]),
        faqPageJsonLd(PRODUCT_FAQ),
      ],
    );
  }

  if (path === "/products/009") {
    const copy: Partial<Record<Lang, Copy>> = {
      en: {
        title: "009 Square — Wide-Fit Square Glasses, 158 mm | Woolet",
        description:
          "Square glasses built for wider faces: 158 mm front, keyhole bridge, Italian Mazzucchelli acetate, hand made in EU. Made for 155 mm+ faces. See the fit.",
        noscriptHtml: `<h1>Woolet 009 — Soft Square, 158 mm</h1>
<p>The Woolet 009 is a soft-square eyewear shape cut from Italian Mazzucchelli cellulose acetate and Hand made in EU. One precise size: 158 mm front width with a 22 mm keyhole bridge. Lens 54 × 50 mm, temples 150 mm at 11°, 5-barrel PVD Gunmetal hinges.</p>
<p>Colours: Honey tortoise, Piano black, Crystal. Pre-order $114 for founding members ($1 deposit locks the price); $190 MSRP at full launch. Bespoke 145–172 mm available.</p>`,
      },
      nl: {
        title: "Woolet 009 — vierkante acetaatbril, 158 mm",
        description:
          "Zachte vierkante acetaatbril, 158 mm breed met 20 mm brug. Voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast.",
        noscriptHtml: `<h1>Woolet 009 — vierkante acetaatbril, 158 mm</h1>
<p>Zacht vierkant model in Italiaans Mazzucchelli-acetaat, 158 mm breed met keyhole-brug. Glas 54 × 50 mm, veren 150 mm. Handgemaakt in de EU. Voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast (adviesprijs $190). Bespoke 145–172 mm beschikbaar.</p>`,
      },
      fr: {
        title: "Woolet 009 — lunettes carrées en acétate, 158 mm",
        description:
          "Monture carrée douce en acétate, 158 mm de large avec pont 20 mm. Conçue pour les visages de 155 mm+. Réservez pour 1 $ et bloquez le prix fondateur de 114 $.",
        noscriptHtml: `<h1>Woolet 009 — lunettes carrées en acétate, 158 mm</h1>
<p>Monture carrée douce en acétate italien Mazzucchelli, 158 mm de large avec pont keyhole. Verres 54 × 50 mm, branches 150 mm. Façonnée à la main dans l'Union européenne. Conçue pour les visages de 155 mm et plus. Réservez pour 1 $ et bloquez le prix fondateur de 114 $ (prix public 190 $). Sur mesure 145–172 mm.</p>`,
      },
    };
    return base(
      route,
      lang,
      copy[lang] ?? copy.en!,
      { image: `${SITE_URL}/og-009.png`, type: "product" },
      [
        productJsonLd("009", "Soft Square", "54 × 50 mm", lang),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/${lang}` },
          { name: "Products", url: `${SITE_URL}/${lang}` },
          { name: "Woolet 009", url: `${SITE_URL}/${lang}/products/009` },
        ]),
        faqPageJsonLd(PRODUCT_FAQ),
      ],
    );
  }

  if (path === "/products/bespoke") {
    const copy: Partial<Record<Lang, Copy>> = {
      en: {
        title: "Woolet Bespoke — Custom Acetate Glasses Cut to Your Face",
        description:
          "Bespoke Italian Mazzucchelli acetate glasses cut to your exact face. Four silhouettes, sizes 145–172 mm. From $299 pre-order.",
        noscriptHtml: `<h1>Woolet Bespoke — Custom Acetate Glasses</h1>
<p>Bespoke Italian Mazzucchelli acetate frames cut to your face in four silhouettes: Aviator, Rectangle, Crown Panto and Round. Sizes 145–172 mm. Founding-member pre-order $299; $480 MSRP at full launch.</p>`,
      },
      nl: {
        title: "Woolet Bespoke — acetaatbril op maat van je gezicht",
        description:
          "Bespoke Italiaanse Mazzucchelli-acetaatbril, gesneden op jouw gezicht. Vier silhouetten, maten 145–172 mm. Vanaf $299 in pre-order.",
        noscriptHtml: `<h1>Woolet Bespoke — acetaatbril op maat</h1>
<p>Bespoke Italiaanse Mazzucchelli-acetaatbril, gesneden op jouw gezicht, in vier silhouetten: Aviator, Rectangle, Crown Panto en Round. Maten 145–172 mm. Handgemaakt in de EU. Vanaf $299 in pre-order ($480 adviesprijs).</p>`,
      },
      fr: {
        title: "Woolet Bespoke — lunettes en acétate sur mesure, taillées pour votre visage",
        description:
          "Lunettes bespoke en acétate italien Mazzucchelli, taillées pour votre visage. Quatre silhouettes, tailles 145–172 mm. Dès 299 $ en pré-commande.",
        noscriptHtml: `<h1>Woolet Bespoke — lunettes en acétate sur mesure</h1>
<p>Lunettes bespoke en acétate italien Mazzucchelli, taillées pour votre visage, en quatre silhouettes : Aviator, Rectangle, Crown Panto et Round. Tailles 145–172 mm. Façonnées à la main dans l'Union européenne. Dès 299 $ en pré-commande (prix public 480 $).</p>`,
      },
    };
    return base(
      route,
      lang,
      copy[lang] ?? copy.en!,
      { image: DEFAULT_OG, type: "product" },
      [
        bespokeProductJsonLd(lang),
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/${lang}` },
          { name: "Products", url: `${SITE_URL}/${lang}` },
          { name: "Woolet Bespoke", url: `${SITE_URL}/${lang}/products/bespoke` },
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
        ? "13-etapowy, ok. 14-dniowy proces produkcji oprawy Woolet — od inżynierii CAD na bazie pomiarów Twojej twarzy po czyszczenie ultradźwiękowe. Ręcznie wykończona w UE z octanu Mazzucchelli z Mediolanu."
        : "The 13-stage, ~14-day process behind every Woolet frame — from CAD engineering on your face measurements to the final ultrasonic clean. Hand made in EU from Mazzucchelli acetate.",
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
              "Jak powstaje oprawa Woolet: 13 etapów w ok. 14 dni — od CAD po czyszczenie ultradźwiękowe. Ręcznie wykończona w UE z octanu Mazzucchelli z Mediolanu, dopasowana do szerszych twarzy.",
            noscriptHtml: `<h1>Proces Woolet</h1>
<p>Każda oprawa Woolet powstaje wokół jednej twarzy — Twojej. Od pierwszego cyfrowego szkicu po końcowe płukanie ultradźwiękowe przechodzi przez ręce i maszyny kilkanaście razy. 13 etapów. W większości ręcznie. Włoski octan Mazzucchelli.</p>
<ol>${steps.map(([n, t]) => `<li><strong>${escapeHtml(n)}</strong> — ${escapeHtml(t)}</li>`).join("")}</ol>
<p>Wykonane z włoskiego octanu Mazzucchelli z Mediolanu. Wykończone ręcznie w UE. <a href="/en/fit">Dobierz rozmiar</a> · <a href="/en/bespoke">Poznaj bespoke</a>.</p>`,
          }
        : {
            title: "The Woolet Process — How Our Italian Acetate Eyewear Is Made",
            description:
              "How a Woolet frame is made: 13 stages across ~14 days, from CAD to ultrasonic cleaning. Hand made in EU from Mazzucchelli acetate, tailored for wider faces.",
            noscriptHtml: `<h1>The Woolet Process</h1>
<p>Every Woolet frame is built around one face — yours. From the first digital sketch to the final ultrasonic rinse, it passes through hand and machine more than a dozen times. 13 stages, ~14 days, mostly by hand. Italian Mazzucchelli acetate.</p>
<ol>${steps.map(([n, t]) => `<li><strong>${escapeHtml(n)}</strong> — ${escapeHtml(t)}</li>`).join("")}</ol>
<p>Made from Italian Mazzucchelli acetate. Hand made in EU. <a href="/en/fit">Find your fit</a> · <a href="/en/bespoke">Explore bespoke</a>.</p>`,
          },
      { image: processImage, type: "website" },
      [howTo],
    );
    // /pl/process is a real translated page — the prerendered <head>
    // ships fully-localised PL title/description/HowTo schema and it is
    // listed as `process.pl` in the route registry, so it must
    // self-canonicalise and remain indexable (was previously noindex +
    // canonical=/en, which contradicted the registry cluster).
    return meta;
  }

  // ----- Fit
  if (path === "/fit") {
    return base(
      route,
      lang,
      {
        title: "Frame Finder for Wide Faces — 155 mm+ | Woolet FitLens",
        description:
          "A frame finder built for wide faces. Scan with your phone camera and get your face width in millimetres plus the frame size that fits, in about 20 seconds.",
        noscriptHtml: `<h1>Frame Finder for Wide Faces — Measure Your Face in 20 Seconds</h1>
<p>FitLens is a frame finder for 155&nbsp;mm+ faces: it returns your face width in millimetres and the frame front width that fits, instead of guessing from photos.</p>
<p>FitLens is a virtual fit tool, not a virtual try-on. It uses your phone camera and a credit card (85.6&nbsp;mm) as a scale reference to return your temple-to-temple face width, your nose bridge width and your pupillary distance in millimetres — then tells you whether our 158&nbsp;mm front width fits. No app, no account, about 20 seconds.</p>
<h2>How it works</h2>
<ol>
<li><strong>Open the camera</strong> — runs in your phone browser, nothing to install.</li>
<li><strong>Hold the phone at arm's length</strong> — face the camera straight on with a card held flat on your forehead.</li>
<li><strong>Get your measurement</strong> — temple-to-temple face width plus the recommended frame front width.</li>
</ol>
<h2>What it measures and what it does not</h2>
<p>It measures face width, bridge width, pupillary distance and the front width that fits you. It does not render frames on your face, does not replace an eye test or prescription, and does not guess: outside 145–172&nbsp;mm it says so.</p>
<h2>Virtual try-on vs virtual fit</h2>
<p>A virtual try-on shows how frames look. FitLens shows whether they will actually fit a 155&nbsp;mm+ face. Appearance is subjective; fit is a number in millimetres.</p>
<h2>Your result explained</h2>
<ul>${FIT_BANDS.map((b) => `<li><strong>${escapeHtml(b.range)}</strong> — ${escapeHtml(b.verdict)}. ${escapeHtml(b.size)}.</li>`).join("")}</ul>
<h2>Privacy</h2>
<p>The camera frame is processed to extract measurements and is not kept as an identifiable profile. Only the resulting numbers persist, and only if you save or email your result.</p>
<h2>FAQ</h2>
<dl>${FIT_FAQ.map((f) => `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`).join("")}</dl>
<p>Fit tools: <a href="/en/fit">virtual fit scan</a> · <a href="/en/fit/manual">manual measurement</a> · <a href="/en/fit/bespoke">bespoke fit (145–172 mm)</a>.</p>`,
      },
      {},
      FIT_JSONLD,
    );
  }
  if (path === "/fit/manual") {
    return base(route, lang, {
      title: "Manual Measurement — Woolet Fit",
      description:
        "Measure your face width, bridge and PD with a ruler and a credit card. Manual fallback for the Woolet AI Fit scan.",
      noscriptHtml: `<h1>Manual Measurement — Woolet Fit</h1>
<p>Measure your face width, bridge width and pupillary distance with a ruler and a standard card, no camera required. Same size recommendation as the camera scan.</p>
<p>Fit tools: <a href="/en/fit">virtual fit scan</a> · <a href="/en/fit/manual">manual measurement</a> · <a href="/en/fit/bespoke">bespoke fit (145–172 mm)</a>.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Virtual fit", url: `${SITE_URL}/en/fit` },
      { name: "Manual measurement", url: `${SITE_URL}/en/fit/manual` },
    ])]);
  }
  // /fit/scan now redirects to /fit — metadata handled by /fit block above
  if (path === "/fit/bespoke") {
    return base(route, lang, {
      title: "Bespoke Fit — Woolet (145–172 mm)",
      description:
        "If your face falls outside the standard Woolet sizes, bespoke covers 145–172 mm with a 20–24 mm bridge. Hand-crafted by a European atelier from your AI scan.",
      noscriptHtml: `<h1>Bespoke Fit — Woolet (145–172 mm)</h1>
<p>Outside the 155–161 mm signature range? Bespoke builds your frame to the millimetre across 145–172 mm, with a 20–24 mm bridge, from your fit measurement.</p>
<p>Fit tools: <a href="/en/fit">virtual fit scan</a> · <a href="/en/fit/manual">manual measurement</a> · <a href="/en/fit/bespoke">bespoke fit (145–172 mm)</a>.</p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Virtual fit", url: `${SITE_URL}/en/fit` },
      { name: "Bespoke fit", url: `${SITE_URL}/en/fit/bespoke` },
    ])]);
  }

  // ----- Collections
  if (path === "/collections/wide-face-glasses") {
    return base(route, lang, {
      title: "Wide-Face Glasses — 158 mm Italian Acetate Frames | Woolet",
      description:
        "Glasses engineered for 155 mm+ faces. Two shapes, 158 mm front, 21–22 mm bridge. Hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Wide Face Glasses</h1>
<p>Italian Mazzucchelli acetate eyewear built for face widths of 155 mm and above. Two shapes (007 round, 009 soft square), one precise 158 mm front width with a 21–22 mm keyhole bridge. Bespoke 145–172 mm. From $114 pre-order.</p>`,
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
<p>Sunglasses cut from Italian Mazzucchelli cellulose acetate and Hand made in EU. Two shapes (Woolet 007 round, 009 soft square), 158 mm front with a 21–22 mm keyhole bridge. UV400, optional polarised lenses. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/italian-mazzucchelli-acetate") {
    return base(route, lang, {
      title: "Italian Mazzucchelli Acetate Glasses 158 mm | Woolet",
      description:
        "Glasses and sunglasses cut from Mazzucchelli 1849 Italian cellulose acetate. Wide 158 mm front, 21–22 mm bridge, hand polished in the EU. From $114.",
      noscriptHtml: `<h1>Italian Mazzucchelli Acetate Glasses</h1>
<p>Wide-face frames cut from Mazzucchelli 1849 cellulose-acetate sheet (Milan, Italy) and Hand made in EU. Two shapes (Woolet 007 round, 009 soft square), one precise 158 mm front with a 21–22 mm keyhole bridge. Bespoke 145–172 mm. Optical, blue-light, prescription and polarised sunglass options share the same geometry. From $114 pre-order.</p>
<h2>What is Mazzucchelli acetate?</h2>
<p>Cellulose-acetate sheet made by Mazzucchelli 1849, the Italian mill that has produced acetate near Milan since 1849. Pigment is layered into a block, batch-cured for weeks and sliced into sheets — denser, more colour-stable and easier to hand-finish than injection-moulded plastic.</p>`,
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
<p>Properly oversized men's sunglasses for wide faces (155 mm+). 158 mm front width, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. Two shapes (Woolet 007 round, 009 soft square). Bespoke 145–172 mm. From $114 pre-order.</p>`,
    });
  }
  if (path === "/collections/sunglasses-for-big-heads") {
    return base(route, lang, {
      title: "Sunglasses for Big Heads — 158 mm, Italian Acetate | Woolet",
      description:
        "Sunglasses that actually fit big heads. 158 mm front, 21–22 mm bridge, hand-finished Mazzucchelli acetate.",
      noscriptHtml: `<h1>Sunglasses for Big Heads - 158 mm + Bespoke</h1>
<p>Built from the ground up for wide faces (155 mm+) and head circumference 58 to 64 cm, not retrofitted from standard sizes. Handmade in the EU from Italian Mazzucchelli acetate, two shapes (Woolet 007 round and 009 soft square), one precise 158 mm width plus bespoke up to 172 mm. Pre-order $114 for founding members, $190 at full launch.</p>
<h2>The problem with standard sunglasses</h2>
<ul>
  <li>Frames pinch at the temples within an hour.</li>
  <li>Arms too short to reach behind the ears.</li>
  <li>Lenses sit too close to the eyes and look undersized.</li>
</ul>
<p>Standard eyewear maxes out around 145 to 148 mm of front width. Woolet starts at 158 mm with a 21–22 mm bridge, and bespoke covers anything from 145 to 172 mm. Temples 150 mm standard, up to 155 mm bespoke.</p>
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
<p>Mainstream sunglasses sit at 138 to 148 mm across the front. Anything above 150 mm is wide. Woolet's standard size is 158 mm, with bespoke up to 172 mm. The first number printed inside the temple is lens width, not front width.</p>
<h3>What head circumference is considered big?</h3>
<p>Around 58 to 60 cm is large, 60 to 62 cm is XL, and above 62 cm is XXL. Woolet's standard 158 mm covers most XL heads; bespoke handles XXL.</p>
<h3>Where do you buy sunglasses for big heads?</h3>
<p>Specialist makers like Woolet design at 158 mm front width with bespoke above. Mass-market brands mostly cap at 145 to 148 mm even on oversized models, so the lenses are larger but the front is the same.</p>
<h3>Can I get sunglasses custom-made for my head size?</h3>
<p>Yes. Bespoke covers 145 to 172 mm of front width in either shape, with temples up to 155 mm. Same Italian Mazzucchelli acetate as the standard line, made to your measurement.</p>
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
        "Prescription-ready optical frames for big heads. 158 mm front, 21–22 mm bridge, Italian Mazzucchelli acetate. Bespoke 145–172 mm.",
      noscriptHtml: `<h1>Glasses for Big Heads</h1>
<p>Prescription-ready optical frames for big heads (head circumference 58–64 cm). 158 mm front width, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate Hand made in EU. Bespoke 145–172 mm. From $114 pre-order.</p>`,
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
        "Extra wide glasses engineered for 155 mm+ faces: 158 mm front, 21–22 mm bridge, Italian Mazzucchelli acetate. Bespoke 145–172 mm.",
      noscriptHtml: `<h1>Extra Wide Glasses</h1>
<p>Extra wide optical frames built at 158 mm front width with a 21–22 mm keyhole bridge — properly extra wide, not a stretched standard size. Italian Mazzucchelli acetate, Hand made in EU. Bespoke 145–172 mm available. From $114 pre-order.</p>`,
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
        "Wide bridge glasses for wider noses: 21–22 mm keyhole bridge, 158 mm front, Italian Mazzucchelli acetate. Bespoke bridge 20–24 mm.",
      noscriptHtml: `<h1>Wide Bridge Glasses</h1>
<p>Glasses with a 21–22 mm keyhole bridge as standard — engineered for wider noses where mainstream 17–19 mm bridges pinch or slide. 158 mm front width, Italian Mazzucchelli acetate. Bespoke bridge 20–24 mm available. From $114 pre-order.</p>`,
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
<p>Truly oversized blue-light glasses for wide faces (155 mm+). Woolet 007 (round) and 009 (soft square) ship at 158 mm front width with a 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. The HEV 380–460 nm filter is an in-line lens upgrade (+$40), compatible with prescription or plano lenses. Bespoke 145–172 mm available.</p>
<p>Read the fit breakdown: <a href="/en/blog/oversized-blue-light-glasses-vs-wide-fit">oversized blue-light glasses vs a true wide fit</a> · <a href="/en/collections/blue-light-glasses-for-wide-faces">Blue light glasses for wide faces</a></p>`,
    }, {}, [breadcrumbJsonLd([
      { name: "Woolet", url: `${SITE_URL}/en` },
      { name: "Collections", url: `${SITE_URL}/en` },
      { name: "Oversized Blue Light Glasses", url: `${SITE_URL}${route}` },
    ])]);
  }
  if (path === "/collections/blue-light-glasses-for-wide-faces") {
    return base(route, lang, {
      title: "Blue Light Glasses for Wide Faces — 158 mm Fit | Woolet",
      
      description:
        "Most blue-light frames stop at 145 mm. Woolet's front is 158 mm with 148 mm temples, blue-light filter optional. Bespoke 145–172 mm. Hand made in EU.",
      noscriptHtml: `<h1>Blue Light Glasses for Wide Faces — 158 mm Fit</h1>
<p>Most blue-light frames are built 130–145 mm across, which is why they pinch a wide face. Woolet's front is 158 mm with 148 mm temples and a 21–22 mm keyhole bridge, and the blue-light filter is a lens option on both shapes (007 Round, 009 Soft Square). Bespoke covers 145–172 mm. Mazzucchelli acetate, hand made in EU. A 2023 Cochrane review found blue-light filtering lenses probably make no measurable difference to eye strain or sleep — we sell the measurement, not the coating.</p>
<p>Read the fit breakdown: <a href="/en/blog/oversized-blue-light-glasses-vs-wide-fit">oversized blue-light glasses vs a true wide fit</a> · <a href="/en/collections/oversized-blue-light-glasses">Oversized blue light glasses</a></p>`,
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
<p>Thick frame glasses cut from 7 mm Italian Mazzucchelli acetate — not injection-moulded plastic. Two shapes: round 007 and soft-square 009, both at 158 mm front width with a 21–22 mm keyhole bridge. Hand made in EU, prescription-ready, bespoke 145–172 mm. From $114 pre-order.</p>
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
      description: "Truly big glasses frames: 158 mm front, 21 mm keyhole bridge, hand made in EU from Italian Mazzucchelli acetate. For 155 mm+ faces and 58 cm+ heads.",
      h1: "Big Glasses Frames for Wide Faces & Big Heads",
      intro: "Most 'big' frames at mainstream retailers are 140–148 mm hinge-to-hinge — a larger lens on a standard front. Woolet builds at 158 mm of actual front width with a 21 mm keyhole bridge, in hand made in EU from Italian Mazzucchelli acetate. Bespoke covers 145–172 mm for XXL heads.",
    },
    "/collections/oversized-prescription-glasses": {
      title: "Oversized Prescription Glasses for Wide Faces | Woolet",
      description: "Oversized prescription glasses sized for 155 mm+ faces: 158 mm Italian acetate front, 21–22 mm keyhole bridge, single-vision or progressive lenses.",
      h1: "Oversized Prescription Glasses for Wide Faces & Big Heads",
      intro: "Oversized prescription frames that actually fit a wider face. One precise 158 mm front width with a 21–22 mm keyhole bridge, in Italian Mazzucchelli acetate Hand made in EU. Single-vision, progressive and blue-light lens upgrades available. Bespoke 145–172 mm for everything outside the standard range.",
    },
    "/collections/wide-frame-reading-glasses": {
      title: "Wide Frame Reading Glasses for Wide Faces | Woolet",
      description: "Wide frame reading glasses for 155 mm+ faces: 158 mm Italian acetate front, 21–22 mm keyhole bridge, +0.50 to +3.00 readers. Hand made in EU.",
      h1: "Wide Frame Reading Glasses for Wide Faces & Big Heads",
      intro: "Reading glasses don't have to mean drugstore frames that pinch. Woolet builds wide-frame readers at 158 mm hinge-to-hinge with a 21–22 mm keyhole bridge, in Italian Mazzucchelli acetate, with reading powers from +0.50 to +3.00. Same frame as the optical line — just dispensed as readers.",
    },
    "/collections/oversized-square-glasses": {
      title: "Oversized Square Glasses for Wide Faces & Big Heads | Woolet",
      description: "Properly oversized square glasses: 158 mm front, 22 mm keyhole bridge, Italian Mazzucchelli acetate. Built for 155 mm+ faces. Bespoke to 165 mm.",
      h1: "Oversized Square Glasses for Wide Faces & Big Heads",
      intro: "Soft-square Italian acetate glasses sized for wider faces. The Woolet 009 ships at a 158 mm front width with a 22 mm keyhole bridge — the geometry that makes a square shape sit balanced on a wider face instead of sliding or pinching. Hand made in EU. Bespoke 145–172 mm available.",
    },
    "/collections/oversized-round-glasses": {
      title: "Oversized Round Glasses for Wide Faces & Big Heads | Woolet",
      description: "Properly oversized round glasses: 158 mm front, 21 mm keyhole bridge, Italian Mazzucchelli acetate. Built for 155 mm+ faces. Bespoke to 165 mm.",
      h1: "Oversized Round Glasses for Wide Faces & Big Heads",
      intro: "Round Italian-acetate glasses that read as round, not undersized. The Woolet 007 ships at a 158 mm front width with a 21 mm keyhole bridge — the front-and-bridge combination most round frames lack. Hand made in EU. Bespoke 145–172 mm available.",
    },
    "/collections/extra-large-oversized-eyeglasses": {
      title: "Extra Large Oversized Eyeglasses — 158 mm Frames | Woolet",
      description: "Genuinely oversized: 158 mm front, 54 mm lens, 21 mm keyhole bridge. Mazzucchelli acetate from Milan, hand made in EU. Built for faces 155 mm and wider.",
      h1: "Extra Large Oversized Eyeglasses — 158 mm Front, Italian Acetate",
      intro: "Extra large at most online opticians means a slightly bigger lens on the same 140 mm front. Woolet's extra large oversized eyeglasses are properly large: 158 mm front-to-front, 21 mm keyhole bridge, and lens area sized to match. Two shapes — round 007 and soft-square 009 — both prescription-ready. Bespoke covers 145–172 mm.",
    },
    "/collections/oversized-black-glasses": {
      title: "Oversized Black Glasses — 158 mm for Wide Faces | Woolet",
      description: "Oversized black glasses in hand made in EU from Italian Mazzucchelli acetate. 158 mm front, 21 mm keyhole bridge, built for 155 mm+ faces. Round 007 and soft-square 009.",
      h1: "Oversized Black Glasses — 158 mm Italian Acetate",
      intro: "Black is the default oversized colourway for a reason — it sharpens the silhouette and pairs with everything. The catch is that black exaggerates every flaw in the acetate, every uneven bevel, every injection-mould seam. The Woolet oversized black glasses are cut from a single block of Italian Mazzucchelli acetate and hand-polished, so the black surface stays deep and even instead of going grey at the edges. 158 mm front, round 007 or soft-square 009.",
    },
    "/collections/keyhole-bridge-glasses": {
      title: "Keyhole Bridge Glasses for Wide Faces & Big Heads | Woolet",
      description: "Keyhole bridge glasses with a wider 21–22 mm gap. Italian Mazzucchelli acetate, 158 mm front. Built for wider noses and 155 mm+ faces.",
      h1: "Keyhole Bridge Glasses for Wide Faces & Big Heads",
      intro: "Mainstream bridges sit at 17–20 mm. Woolet's keyhole bridge is 21–22 mm as standard, shaped to load weight on bone rather than cartilage — the difference between a frame that sits balanced and one that slides or pinches a wider nose. 158 mm front, Italian acetate, bespoke bridge 20–24 mm.",
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
      noscriptHtml: `<h1>Why Glasses Never Fit Wide Faces</h1>
<p>Most mainstream frames top out around 150 mm of front width. A face measuring 155 mm or more pushes the temples outward, so the arms bow, the frame pinches and the optical centres drift off your pupils.</p>
<h2>The measurement that decides everything</h2>
<p>Measure temple-to-temple at the widest point of your face — the credit-card method in our guide on <a href="/en/blog/how-to-measure-face-width-for-glasses">how to measure your face width for glasses</a> takes about a minute. Above 155 mm you are outside standard sizing. Woolet's signature front width is 158 mm (fit range 155–161 mm), with a bespoke tier covering 145–172 mm.</p>
<h2>What a frame built for a wide face looks like</h2>
<p>A 158 mm front, a 21–22 mm keyhole bridge and long temples, cut from Mazzucchelli acetate from Milan, Italy and hand made in EU — acetate holds tension at that width where thinner plastics relax over time. If your arms feel short before they reach your ears, the temple length matters as much as the front: see what <a href="/en/temple/150mm">150 mm temple arms</a> change day to day, and read the wider context in the <a href="/en/blog/glasses-for-wide-faces-guide">complete guide to glasses for wide faces</a>.</p>
<h2>Find your size</h2>
<p>Once you know your number, <a href="/en/products/007">Woolet 007</a> gives you the rounded 158 mm front and <a href="/en/products/009">Woolet 009</a> the squared one. <a href="/en/fit">Run the 20-second FitLens scan</a> · <a href="/en/collection">See the collection</a></p>`,
    }, { type: "article" });
  }
  if (path === "/lp/5-reasons") {
    return base(route, lang, {
      title: "5 Reasons Standard Glasses Fail on Wide Faces | Woolet",
      description:
        "Geometry, material, hinges, bridge, market. Five engineering reasons mainstream frames fail on 155 mm+ faces — and what Woolet does differently.",
      noscriptHtml: `<h1>5 Reasons Standard Glasses Fail on Wide Faces</h1>
<p>Standard eyewear is engineered around a 140 mm face. Five things break once you pass 155 mm.</p>
<h2>The five failure points</h2>
<ol>
<li><strong>Geometry:</strong> a 140–150 mm front cannot span a 155 mm+ face, so the frame sits on your temples instead of your nose — the <a href="/en/blog/glasses-for-wide-faces-guide">complete guide to glasses for wide faces</a> walks through the geometry.</li>
<li><strong>Material:</strong> thin plastics lose tension when stretched; Mazzucchelli acetate from Milan, Italy holds its shape at 158 mm, which is why a budget <a href="/en/compare/zenni-alternative">Zenni alternative built for wide faces</a> reads differently on the face.</li>
<li><strong>Hinges:</strong> constant outward pressure loosens standard hinges within months, and short arms make it worse — <a href="/en/temple/150mm">150 mm temple arms</a> keep the load off the joint.</li>
<li><strong>Bridge:</strong> narrow 16–18 mm bridges pinch; the 21 mm keyhole bridge on <a href="/en/products/007">Woolet 007</a> and the 22 mm on <a href="/en/products/009">Woolet 009</a> distribute weight instead.</li>
<li><strong>Market:</strong> wide sizing is treated as a filter, not a design brief; past 161 mm the <a href="/en/bespoke">bespoke programme</a> covers 145–172 mm.</li>
</ol>
<h2>What Woolet does differently</h2>
<p>Every Woolet frame is built at a 158 mm signature front width (fit range 155–161 mm), hand made in EU from Mazzucchelli acetate from Milan, Italy, with a bespoke tier covering 145–172 mm. <a href="/en/fit">Check your fit in 20 seconds</a>.</p>`,
    }, { type: "article" });
  }
  if (path === "/lp/wide-bridge-fit-guide") {
    return base(route, lang, {
      title: "Wide Bridge Glasses — Fit Guide for a Wide Nose Bridge | Woolet",
      description:
        "A wide nose bridge changes where glasses sit, pinch and slide. How to size one, what bridge width to look for, and why Woolet uses a 20–21 mm keyhole bridge on a 158 mm front. Hand made in EU.",
      noscriptHtml: `<h1>Wide Bridge Fit Guide</h1>
<p>A wide nose bridge changes where a frame sits, where it pinches and how fast it slides. Most mainstream frames use a 16–18 mm bridge; a wider or higher nose usually needs 20–22 mm before the frame stops sliding or leaving marks.</p>
<h2>How to measure your bridge width</h2>
<p>Measure the gap between the inner edges of your lenses on a pair that already sits well, or measure across the top of your nose where the frame rests. Under 17 mm is narrow, 17–20 mm is mainstream, 21 mm and above is wide.</p>
<h2>Why a keyhole bridge works on a wide nose</h2>
<p>A keyhole bridge rides on the top ridge of the nose instead of pinching the sides, so the weight sits on bone rather than cartilage. That removes the two usual failure modes: sliding and red pressure marks.</p>
<h2>Woolet's bridge specs</h2>
<p>Woolet 007 ships with a 21 mm keyhole bridge, Woolet 009 with 22 mm, both on a 158 mm signature front width (fit range 155–161 mm). Bespoke covers fronts from 145 to 172 mm with bridges from 20 to 24 mm. Cut from Mazzucchelli acetate from Milan, Italy, hand made in EU.</p>
<p><a href="/en/fit">Measure your bridge in 20 seconds</a> · <a href="/en/collections/wide-bridge-glasses">See wide bridge glasses</a></p>`,
    }, { type: "article" });
  }




  // ----- Policies
  if (path === "/privacy-policy") {
    const copy: Partial<Record<Lang, Copy>> = {
      en: {
        title: "Privacy Policy | Woolet",
        description: "Woolet privacy policy — how we collect, use and protect your personal information. JAY23 LLC.",
      },
      pl: {
        title: "Polityka prywatności | Woolet",
        description: "Polityka prywatności Woolet — jak zbieramy, wykorzystujemy i chronimy Twoje dane osobowe. JAY23 LLC.",
      },
    };
    return base(route, lang, copy[lang] ?? copy.en!);
  }
  if (path === "/return-policy") {
    const copy: Partial<Record<Lang, Copy>> = {
      en: {
        title: "Return Policy | Woolet",
        description: "Woolet return and exchange policy — 30-day returns, fit guarantee and hassle-free refunds. JAY23 LLC.",
      },
      pl: {
        title: "Polityka zwrotów | Woolet",
        description: "Polityka zwrotów i wymiany Woolet — 30 dni na zwrot, gwarancja dopasowania i zwrot pieniędzy bez formalności. JAY23 LLC.",
      },
    };
    return base(route, lang, copy[lang] ?? copy.en!);
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
      ko: { title: "블로그 — Woolet | 대두 안경테 인사이트", description: "대두 안경테, 이탈리아 아세테이트, 프레임 사이즈, 155mm 이상 얼굴 폭에 맞는 핏에 대한 전문 가이드." },


    };
    const posts = getBlogPosts(lang);
    const links = posts
      .map(
        (p) =>
          `<li><a href="/${lang}/blog/${p.slug}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.excerpt)}</li>`,
      )
      .join("\n");
    const hub =
      lang === "en"
        ? `<p>Topic hub: <a href="/en/blog/category/nose-bridge-fit">Nose-bridge fit</a>.</p>`
        : "";
    return base(route, lang, {
      ...titles[lang],
      noscriptHtml: `<h1>${escapeHtml(titles[lang].title)}</h1>
<p>${escapeHtml(titles[lang].description)}</p>
${hub}
<ul>
${links}
</ul>`,
    });
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
      // Head title/description come from the same CTR override map the
      // client-side <SEO/> uses, so SSG output and hydrated head match.
      const override = blogMetaBySlug[post.slug];
      const headTitle = override
        ? (override.exactTitle || override.metaTitle.includes("Woolet")
            ? override.metaTitle
            : `${override.metaTitle} | Woolet`)
        : `${post.title} | Woolet`;
      const headDescription = override?.metaDescription ?? post.excerpt;
      return base(
        route,
        lang,
        {
          title: headTitle,
          description: headDescription,
          // post.date is a real publication date, so it is a legitimate
          // <lastmod> signal for the sitemap.
          lastmod: /^\d{4}-\d{2}-\d{2}$/.test(post.date) ? post.date : undefined,
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
        noscriptHtml: `<h1>大きい顔のメガネ — Woolet 158 mm</h1>
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
        title: "オーダーメイド メガネ 145–172mm | Woolet イタリア製アセテート",
        description:
          "オーダーメイド メガネを145〜162mmまでミリ単位で。Wooletはイタリア製マッツケリ・アセテートを使い、フロント幅・ブリッジ・テンプル長を個別調整。FitLensで顔を測り、職人がEUで手作業仕上げ。",
        noscriptHtml: `<h1>オーダーメイド メガネ — Woolet bespoke 145–172 mm</h1>
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
        title: "Lunettes sur mesure 145–172 mm | Woolet — acétate italien",
        description:
          "Lunettes sur mesure pour visages larges : 145–172 mm de face, pont 20–24 mm, branches ajustées. Acétate italien Mazzucchelli, fabrication artisanale en UE. Mesure FitLens en 20 s.",
        noscriptHtml: `<h1>Lunettes sur mesure — Woolet bespoke 145–172 mm</h1>
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
  // ----- Compare / competitor-alternative pages
  if (path === "/compare") {
    return base(
      route,
      lang,
      {
        title: "Woolet vs the Alternatives — Wide-Face Eyewear Comparisons",
        description:
          "Head-to-head comparisons between Woolet and other wide-face eyewear brands — Fatheadz, EYESHELLS, Zenni, Warby Parker, Ray-Ban and Persol.",
        noscriptHtml: `<h1>Woolet vs Other Wide-Fit Eyewear Brands</h1>
<p>Side-by-side comparisons between Woolet and the brands wide-faced wearers usually consider first. Woolet frames have a 158 mm signature front width (fit range 155–161 mm), a bespoke tier covering 145–172 mm, and are made from Mazzucchelli acetate from Milan, Italy, hand made in EU.</p>
<h2>All comparisons</h2>
<ul>${competitors
          .map(
            (c) =>
              `<li><a href="/en/compare/${c.slug}">${escapeHtml(c.name)} Alternative for Wide Faces &amp; Big Heads</a> — ${escapeHtml(c.metaDescription)}</li>`,
          )
          .join("")}</ul>
<h2>How we compare</h2>
<p>Every comparison covers materials, fit range in millimetres, sizing, price and where the competitor still wins. Not sure of your own measurement? <a href="/en/fit">Run the 20-second FitLens scan</a>.</p>`,
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
          noscriptHtml: `<h1>${escapeHtml(c.name)} Alternative for Wide Faces &amp; Big Heads</h1>
<p>${escapeHtml(c.heroSub)}</p>
<h2>Woolet vs ${escapeHtml(c.name)} — the specs</h2>
<ul>${Object.entries(c.table)
            .map(
              ([k, v]) =>
                `<li><strong>${escapeHtml(k)}:</strong> Woolet — ${escapeHtml(wooletColumn[k] ?? "")}; ${escapeHtml(c.name)} — ${escapeHtml(v)}</li>`,
            )
            .join("")}</ul>
<h2>Why wide-face wearers switch to Woolet</h2>
<ul>${c.advantages
            .map((a) => `<li><strong>${escapeHtml(a.title)}:</strong> ${escapeHtml(a.text)}</li>`)
            .join("")}</ul>
<h2>Where ${escapeHtml(c.name)} still wins</h2>
<ul>${c.whereTheyWin.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>
<h2>Frequently asked questions</h2>
${c.faqs.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join("")}
<p>Woolet: 158 mm signature front width (fit range 155–161 mm), bespoke 145–172 mm, Mazzucchelli acetate from Milan, Italy, hand made in EU. <a href="/en/fit">Check your fit in 20 seconds</a> · <a href="/en/compare">All comparisons</a></p>`,
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
<h2>Bespoke at ${s.width} mm</h2>
<p>${s.bespokeNote}</p>
<p>Bespoke: 4 shapes, 60 colour and size combinations, any width 145–172 mm (172 mm maximum), 2 weeks from order to shipping, $480 with lenses included, hand made in Greece. Signature 158 mm $190, fits 155–161 mm faces, hand made in EU from Mazzucchelli acetate milled in Milan.</p>
<h2>Every width we cover — 145 to 172 mm</h2>
<p>${SIZES.map((r) => `<a href="/en/size/${r.slug}">${r.width} mm${r.width === 158 ? " (signature)" : r.width >= 155 && r.width <= 161 ? " (signature fit)" : " (bespoke)"}</a>`).join(" · ")}</p>
<p><a href="/en/fit">Measure my face with FitLens</a> · <a href="/en/products/007">Woolet 007 Round</a> · <a href="/en/products/009">Woolet 009 Soft Square</a> · <a href="/en/fit/bespoke">Bespoke 145–172 mm</a></p>`,

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
          title: t.metaTitle ?? `${t.length} mm Temple Glasses | Wide-Face Temple Sizing — Woolet`,
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
        title: "Bespoke Glasses for Wide Faces — 145–172 mm | Woolet",
        description:
          "Bespoke eyewear for wide faces, 145–172 mm front width. Italian Mazzucchelli acetate, hand made in the EU. From $299 for the first 100 backers.",
        noscriptHtml: `<h1>Woolet Bespoke — 145–172 mm</h1>
<p>Woolet Bespoke is made-to-measure eyewear for faces outside the 155–161 mm core range. Front width covers 145–172 mm, bridge 20–24 mm, temples 145–155 mm. Same Italian Mazzucchelli 1849 cellulose acetate, hand made in the EU. Founding price $299 for the first 100 backers ($480 MSRP).</p>
<p>Choose the 007 round-panto or 009 soft-square silhouette, submit measurements from the AI Fit Scan, and we build a single frame around your exact face. <a href="/en/fit/bespoke">Start the bespoke fit scan</a>.</p>`,
      },
      { image: DEFAULT_OG, type: "website" },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/en` },
          { name: "Bespoke", url: `${SITE_URL}/en/bespoke` },
        ]),
        faqPageJsonLd([
          { q: "What face widths does Woolet Bespoke cover?", a: "Bespoke covers 145–172 mm front width, 20–24 mm bridge, and 145–155 mm temples — outside the 155–161 mm core range." },
          { q: "How much does bespoke cost?", a: "$299 USD for the first 100 backers, $480 MSRP after. Includes measurements review, one production run, and free shipping." },
          { q: "How long does bespoke take?", a: "About 6 weeks from confirmed measurements to shipped frame — 13 stages, hand made in the EU from Italian Mazzucchelli acetate." },
        ]),
      ],
    );
  }

  // ----- DE: Blaulichtfilter-Brille Herren (blue-light × breite Köpfe)
  if (route === "/de/blaulichtfilter-brille-herren") {
    return base(
      route,
      "de",
      {
        title: "Blaulichtfilter-Brille Herren — 158 mm für breite Köpfe | Woolet",
        description:
          "Die meisten Blaulichtfilter-Brillen enden bei 145 mm. Woolet: 158 mm Fassung, 148 mm Bügel, Blaulichtfilter optional. Maßanfertigung 145–172 mm. Handgefertigt in der EU.",
        noscriptHtml: `<h1>Blaulichtfilter-Brille Herren — 158 mm für breite Köpfe</h1>
<p>Die meisten Blaulichtfilter-Brillen sind 130–145 mm breit — deshalb drücken sie auf einem breiten Kopf. Woolets Front misst 158 mm, die Bügel 148 mm, der Keyhole-Steg 21–22 mm. Den Blaulichtfilter gibt es als Glasoption, mit oder ohne Sehstärke. Maßanfertigung 145–172 mm, Mazzucchelli-Acetat, handgefertigt in der EU.</p>
<p>Eine Cochrane-Übersichtsarbeit von 2023 (17 randomisierte Studien) fand keinen messbaren Nutzen von Blaulichtfilter-Gläsern. Wir versprechen die Millimeter, nicht die Beschichtung.</p>`,
      },
      { image: DEFAULT_OG, type: "website" },
      [
        breadcrumbJsonLd([
          { name: "Woolet", url: `${SITE_URL}/de` },
          { name: "Blaulichtfilter-Brille Herren", url: `${SITE_URL}/de/blaulichtfilter-brille-herren` },
        ]),
        faqPageJsonLd([
          { q: "Welche Brillenbreite brauche ich bei einem breiten Kopf?", a: "Ab 155 mm Gesichtsbreite brauchst du eine Fassungsbreite ab 155 mm. Woolet baut 158 mm Front mit 21–22 mm Keyhole-Steg und 148 mm Bügeln, Maßanfertigung 145–172 mm." },
          { q: "Gibt es Blaulichtfilter-Brillen in XXL für Herren?", a: "Ja. 007 Rund und 009 Soft Square haben beide 158 mm Frontbreite (ca. 58–62 cm Kopfumfang). Der Blaulichtfilter ist bei beiden eine Glasoption." },
          { q: "Wie breit ist die Woolet-Fassung genau?", a: "158 mm Fassungsbreite, 21 mm Steg (007) bzw. 22 mm (009), Glasbreite 52 mm bzw. 54 mm, Bügellänge 148 mm. Mazzucchelli-Acetat, handgefertigt in der EU." },
          { q: "Blaulichtfilter mit Sehstärke — geht das?", a: "Ja. Der Filter ist eine Beschichtung und lässt sich mit Einstärken- oder Gleitsichtgläsern kombinieren. Ohne Sehstärke geht genauso: gleiche Fassung, planes Glas." },
          { q: "Sind Blaulichtfilter-Brillen sinnvoll?", a: "Eine Cochrane-Übersichtsarbeit von 2023 mit 17 randomisierten Studien fand keinen messbaren Unterschied bei Ermüdung am Bildschirm oder beim Schlaf. Wir bieten den Filter als Option an, versprechen aber nur die Passform." },
          { q: "Woher weiß ich, ob 158 mm zu mir passen?", a: "158 mm passen typischerweise bei 155–161 mm Gesichtsbreite. Miss von Schläfe zu Schläfe oder nutze FitLens mit der Handykamera." },
        ]),
      ],
    );
  }

  // ----- /de and /de/{slug}: DE landing hub + spokes
  if (lang === "de") {
    const canonical = `${SITE_URL}${route}`;
    // NOTE: path === "/" never reaches here — the homepage branch at the top
    // of getMetadata() handles /de via homeCopy.de (which carries the hub's
    // outbound links in its noscriptHtml).
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

  // ----- /{lang}/collection — copy shared with src/pages/Collection.tsx
  if (path === "/collection") {
    const c = collectionSeo[lang];
    return base(
      route,
      lang,
      {
        title: c.title,
        description: c.description,
        noscriptHtml: `<h1>${escapeHtml(c.title)}</h1>
<p>${escapeHtml(c.description)}</p>
<ul>
${COLLECTION_ITEMS.map((it) => `<li><a href="/${lang}/products/${it.id}">${escapeHtml(it.name)}</a></li>`).join("\n")}
</ul>`,
      },
      { image: DEFAULT_OG },
      collectionJsonLd(lang, c.title, c.description, COLLECTION_ITEMS),
    );
  }

  // ----- /en/hat-size-calculator — copy shared with src/pages/tools/HatSizeCalculator.tsx
  if (path === "/hat-size-calculator") {
    return base(
      route,
      lang,
      {
        title: "Hat Size Calculator — Head Circumference to US, UK, EU & cm | Woolet",
        description:
          "Free hat size calculator. Enter your head circumference in cm or inches and get your US, UK, EU and letter hat size instantly — with sizing advice for bigger heads.",
        noscriptHtml: `<h1>Hat Size Calculator — Head Circumference to US, UK, EU &amp; cm</h1>
<p>Free hat size calculator. Enter your head circumference in cm or inches and get your US, UK, EU and letter hat size instantly — with sizing advice for bigger heads.</p>
<p>Bigger head? Frame width matters too: <a href="/en/collections/glasses-for-big-heads">glasses for big heads</a> · <a href="/en/fit">measure your face width in 20 seconds</a>.</p>`,
      },
      { image: DEFAULT_OG },
      [
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Hat Size Calculator",
          applicationCategory: "UtilityApplication",
          operatingSystem: "Web",
          description:
            "Free hat size calculator. Convert your head circumference (cm or inches) into US, UK, EU and letter hat sizes instantly.",
          url: `${SITE_URL}/en/hat-size-calculator`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        faqPageJsonLd(HAT_SIZE_FAQ),
      ],
    );
  }

  // ----- /en/lp/kickstarter — copy shared with src/pages/lp/KickstarterPrelaunch.tsx
  if (path === "/lp/kickstarter") {
    const ksImage = `${SITE_URL}${ksHeroAsset.url}`;
    return base(
      route,
      lang,
      {
        title: "Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)",
        description:
          "Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. Join the VIP list for early access and up to 40% off the $190 retail price.",
        noscriptHtml: `<h1>Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)</h1>
<p>Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. Join the VIP list for early access and up to 40% off the $190 retail price.</p>
<p><a href="/en/products/007">Woolet 007 — Round</a> · <a href="/en/products/009">Woolet 009 — Soft-Square</a> · <a href="/en/fit">Find your fit</a></p>`,
      },
      { image: ksImage, type: "website" },
      [
        breadcrumbJsonLd([
          { name: "Home", url: `${SITE_URL}/en` },
          { name: "Kickstarter VIP", url: `${SITE_URL}/en/lp/kickstarter` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Woolet Kickstarter — signature frames",
          itemListElement: [
            {
              "@type": "Product",
              name: "Woolet 007 — Round",
              description:
                "Round Milanese acetate frame, 158 mm wide with a 21 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}/en/lp/kickstarter`,
                priceCurrency: PRICE_CURRENCY,
                price: SALE_PRICE,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: PRICE_VALID_UNTIL,
                priceSpecification: LIST_PRICE_SPEC,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Woolet", url: SITE_URL },
                hasMerchantReturnPolicy: RETURN_POLICY,
                shippingDetails: shippingDetails(false),
              },
            },
            {
              "@type": "Product",
              name: "Woolet 009 — Soft-Square",
              description:
                "Soft-square Milanese acetate frame, 158 mm wide with a 20 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}/en/lp/kickstarter`,
                priceCurrency: PRICE_CURRENCY,
                price: SALE_PRICE,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: PRICE_VALID_UNTIL,
                priceSpecification: LIST_PRICE_SPEC,
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: "Woolet", url: SITE_URL },
                hasMerchantReturnPolicy: RETURN_POLICY,
                shippingDetails: shippingDetails(false),
              },
            },
          ],
        },
      ],
      {
        en: `${SITE_URL}/en/lp/kickstarter`,
        "x-default": `${SITE_URL}/en/lp/kickstarter`,
      },
    );
  }

  // ----- /en/blog/category/nose-bridge-fit — topic hub
  // The blog-post regex below forbids a second slash, so this needs its own
  // branch. Its noscriptHtml carries the hub's real outbound links, otherwise
  // the whole nose-bridge cluster is orphaned in the JS-free HTML.
  if (path === "/blog/category/nose-bridge-fit") {
    const canonical = `${SITE_URL}/en/blog/category/nose-bridge-fit`;
    const NB_FAQS = [
      {
        q: "What counts as a wide nose bridge?",
        a: "Bridges under 17 mm are narrow, 17–20 mm is the mainstream range, and 21 mm and above is wide. Most brands top out at 18 mm — anyone with a wider or higher nose typically needs 21 mm or more for the frame to sit on bone instead of pinching cartilage.",
      },
      {
        q: "Where do I start if my glasses always slide or pinch?",
        a: "Read the pillar guide first — it explains what the bridge number on your current frames means and what 21–22 mm actually changes. Then use the AI Fit Wizard to confirm width and bridge from a single photo.",
      },
      {
        q: "Keyhole or saddle bridge for a wide nose?",
        a: "Keyhole. Saddle bridges wrap the sides of the nose and pinch wider noses; keyhole bridges sit across the top ridge and distribute weight on bone. Both Woolet 007 (21 mm) and 009 (22 mm) are keyhole.",
      },
    ];
    const NB_RELATED = [
      "how-to-measure-face-width-for-glasses",
      "glasses-for-wide-faces-guide",
      "why-glasses-dont-fit-155mm-problem",
      "round-vs-square-glasses-wide-face",
    ];
    const enPosts = getBlogPosts("en");
    const nbLink = (slug: string) => {
      const post = enPosts.find((p) => p.slug === slug);
      return post ? `<li><a href="/en/blog/${slug}">${escapeHtml(post.title)}</a></li>` : "";
    };
    return base(
      route,
      "en",
      {
        title: "Nose-Bridge Fit for Glasses — Guides, Sizing & Collections | Woolet",
        description:
          "Hub for nose-bridge fit: what bridge width means, what counts as wide, keyhole vs saddle, and how to measure. Pillar guide plus the 21–22 mm Woolet collections.",
        noscriptHtml: `<h1>Nose-Bridge Fit</h1>
<p>Everything we've written on bridge width, keyhole geometry, and what 21–22 mm actually fixes for wider or higher noses. Start with the pillar guide, then measure, then pick a shape.</p>
<h2>Start here — pillar guide</h2>
<ul>
${nbLink("glasses-for-wide-nose-bridge-21-22mm-explained")}
</ul>
<h2>Shop the fit</h2>
<ul>
<li><a href="/en/collections/wide-bridge-glasses">Wide Bridge Glasses</a> — 21–22 mm keyhole while most brands cap at 18 mm.</li>
<li><a href="/en/collections/keyhole-bridge-glasses">Keyhole Bridge Glasses</a> — round 007 (21 mm) and soft-square 009 (22 mm).</li>
<li><a href="/en/products/007">Woolet 007 — 21 mm</a></li>
<li><a href="/en/products/009">Woolet 009 — 22 mm</a></li>
<li><a href="/en/fit">AI Fit Wizard</a></li>
<li><a href="/en/fit/bespoke">Bespoke 20–24 mm</a></li>
</ul>
<h2>Related guides</h2>
<ul>
${NB_RELATED.map(nbLink).join("\n")}
</ul>
<p><a href="/en/blog">All articles</a></p>`,
      },
      { image: DEFAULT_OG },
      [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Nose-Bridge Fit — Guides & Resources",
          url: canonical,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE_URL },
          description:
            "A complete hub on nose-bridge fit for glasses: what bridge width means, what counts as wide, keyhole vs saddle, and how to measure.",
        },
        breadcrumbJsonLd([
          { name: "Home", url: `${SITE_URL}/en` },
          { name: "Blog", url: `${SITE_URL}/en/blog` },
          { name: "Nose-Bridge Fit", url: canonical },
        ]),
        faqPageJsonLd(NB_FAQS),
      ],
    );
  }

  // ----- /nl/{slug} and /pl/{slug}: landing hub spokes (mirrors the DE block)
  if (lang === "nl" || lang === "pl") {
    const canonical = `${SITE_URL}${route}`;
    const slug = path.replace(/^\//, "");
    const page = (lang === "nl" ? nlPages : plPages)[slug] as
      | {
          h1: string;
          sub: string;
          metaTitle: string;
          metaDescription: string;
          faqs?: { q: string; a: string }[];
          ogImage?: string;
          englishEquivalent?: string;
        }
      | undefined;
    if (page) {
      return base(
        route,
        lang,
        {
          title: page.metaTitle,
          description: page.metaDescription,
          noscriptHtml: `<h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.sub)}</p>`,
        },
        {
          image: page.ogImage
            ? page.ogImage.startsWith("http")
              ? page.ogImage
              : `${SITE_URL}${page.ogImage}`
            : DEFAULT_OG,
          type: "website",
        },
        [
          breadcrumbJsonLd([
            { name: "Woolet", url: `${SITE_URL}/${lang}` },
            { name: page.h1, url: canonical },
          ]),
          ...(page.faqs && page.faqs.length
            ? [faqPageJsonLd(page.faqs.map((f) => ({ q: f.q, a: f.a })))]
            : []),
        ],
        page.englishEquivalent
          ? {
              [lang]: canonical,
              en: `${SITE_URL}${page.englishEquivalent}`,
              "x-default": `${SITE_URL}${page.englishEquivalent}`,
            }
          : undefined,
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
  "/de/blaulichtfilter-brille-herren",
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
  "/en/size/168mm",
  "/en/size/170mm",
  "/en/size/172mm",
  "/en/ref",
  "/en/ref/007-black",
  "/en/ref/007-havana",
  "/en/ref/007-silver-clear",
  "/en/ref/009-black",
  "/en/ref/009-havana",
  "/en/ref/009-silver-clear",
  "/en/ref/003-black",
  "/en/ref/bespoke",
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
  "/en/blog/category/nose-bridge-fit",
  "/en/lp/kickstarter",
  "/en/lp/wide-bridge-fit-guide",
  "/pl/jak-dobrac-okulary-do-twarzy",
  // Korean locale (ASCII slugs; Korean copy lives in src/content/ko).
  ...KO_ROUTES,
];

export function getAllRoutes(): string[] {
  const blogRoutes: string[] = [];
  for (const lang of ["en", "pl", "de", "fr", "nl"] as Lang[]) {
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

  // hreflang — sourced from src/i18n/routeRegistry.ts (single source of
  // truth). Only emit alternates when the canonical URL belongs to a
  // multi-locale cluster where every URL renders 200 with a
  // self-referencing canonical. Pages with no translation cluster get
  // NO hreflang block (a lone self-reference is noise). Pages that
  // define custom `meta.alternates` (e.g. many-to-one landing groups)
  // bypass this and emit whatever they declared.
  if (meta.alternates) {
    for (const [hreflang, href] of Object.entries(meta.alternates)) {
      tags.push(`<link rel="alternate" hreflang="${hreflang}" href="${href}"${D} />`);
    }
  } else {
    const path = meta.canonical.replace(SITE_URL, "");
    const alts = hreflangAlternates(path, SITE_URL);
    if (alts) {
      for (const { lang, href } of alts) {
        tags.push(`<link rel="alternate" hreflang="${lang}" href="${href}"${D} />`);
      }
    }
  }

  // OpenGraph
  tags.push(`<meta property="og:title" content="${escapeHtml(meta.og.title)}"${D} />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(meta.og.description)}"${D} />`);
  tags.push(`<meta property="og:url" content="${meta.canonical}"${D} />`);
  tags.push(`<meta property="og:type" content="${meta.og.type}"${D} />`);
  tags.push(`<meta property="og:site_name" content="Woolet"${D} />`);
  tags.push(`<meta property="og:image" content="${meta.og.image}"${D} />`);
  tags.push(`<meta property="og:image:secure_url" content="${meta.og.image}"${D} />`);
  tags.push(`<meta property="og:image:width" content="1200"${D} />`);
  tags.push(`<meta property="og:image:height" content="630"${D} />`);
  tags.push(
    `<meta property="og:image:type" content="${meta.og.image.endsWith(".jpg") || meta.og.image.endsWith(".jpeg") ? "image/jpeg" : meta.og.image.endsWith(".webp") ? "image/webp" : "image/png"}"${D} />`,
  );
  tags.push(`<meta property="og:image:alt" content="${escapeHtml(meta.og.title)}"${D} />`);
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
