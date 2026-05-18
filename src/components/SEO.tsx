import { Helmet } from "react-helmet-async";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

interface SEOProps {
  title: string;
  description: string;
  lang?: Lang;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
  robots?: string;
  article?: {
    readTime: number;
    tags: string[];
  };
  jsonLd?: object | object[];
}

const SITE_URL = "https://woolet.co";
const OG_IMAGE = "https://woolet.co/og-image.png";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Woolet",
  url: SITE_URL,
  description: "AI-fit Italian Mazzucchelli acetate eyewear measured for wide faces (155 mm and above). Three sizes per shape (155 / 158 / 161 mm) plus bespoke (150–172 mm).",
  foundingLocation: "Poland",
  sameAs: [
    "https://www.instagram.com/woolet.eyewear",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@woolet.co",
    contactType: "customer service",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Woolet",
  url: SITE_URL,
  description: "AI-fit eyewear for wide faces — three sizes per shape, plus bespoke",
  publisher: { "@type": "Organization", name: "Woolet", url: SITE_URL },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Woolet Eyewear for Wide Faces — AI-Fit",
  description: "Italian Mazzucchelli acetate glasses measured for wide faces (155 mm+). Two shapes (007 round, 009 square) in three sizes — 155 / 158 / 161 mm — plus a bespoke tier from 150 to 172 mm.",
  brand: { "@type": "Brand", name: "Woolet" },
  image: OG_IMAGE,
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    priceCurrency: "USD",
    price: "99",
    priceValidUntil: "2026-12-31",
    url: "https://woolet.co/en",
    seller: { "@type": "Organization", name: "Woolet" },
  },
  material: "Italian Mazzucchelli Acetate",
  audience: { "@type": "PeopleAudience", suggestedGender: "unisex" },
};

const geoMeta: Record<string, { region: string; placename: string }> = {
  en: { region: "US", placename: "United States" },
  pl: { region: "PL", placename: "Polska" },
  fr: { region: "FR", placename: "France" },
  es: { region: "ES", placename: "España" },
};

const SEO = ({
  title,
  description,
  lang = "en",
  path = "",
  type = "website",
  publishedTime,
  noindex = false,
  robots,
  article,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes("Woolet") ? title : `${title} | Woolet`;
  const canonical = `${SITE_URL}/${lang}${path}`;
  const isHomepage = path === "" || path === "/";
  const geo = geoMeta[lang] || geoMeta.en;

  // Determine robots content
  const robotsContent = robots || (noindex ? "noindex, follow" : "index, follow");

  const articleJsonLd = type === "article" && publishedTime ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonical,
    datePublished: publishedTime,
    dateModified: publishedTime,
    author: { "@type": "Organization", name: "Woolet", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Woolet",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: lang,
    ...(article?.tags?.length ? { keywords: article.tags.join(", ") } : {}),
    ...(article?.readTime ? { wordCount: article.readTime * 220 } : {}),
  } : null;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robotsContent} />

      {/* GEO meta tags */}
      <meta name="geo.region" content={geo.region} />
      <meta name="geo.placename" content={geo.placename} />
      <meta name="content-language" content={lang} />

      {SUPPORTED_LANGS.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={`${SITE_URL}/${l}${path}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en${path}`} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Woolet" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content={lang === "pl" ? "pl_PL" : lang === "fr" ? "fr_FR" : lang === "es" ? "es_ES" : "en_US"} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:site" content="@WooletEyewear" />

      {/* Structured Data — Organization on every page */}
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
      {isHomepage && (
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      )}
      {isHomepage && (
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      )}
      {articleJsonLd && (
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      )}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
