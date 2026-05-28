import { Helmet } from "react-helmet-async";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

interface SEOProps {
  title: string;
  description: string;
  lang?: Lang;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  robots?: string;
  /** Absolute URL OR site-relative path (e.g. "/og-foo.png") for the social preview image. Falls back to brand OG. */
  image?: string;
  article?: {
    readTime: number;
    tags: string[];
  };
  jsonLd?: object | object[];
}

const SITE_URL = "https://woolet.co";
const OG_IMAGE = "https://woolet.co/og-image.png";

// Organization, WebSite, and Product JSON-LD live in index.html as the single source.

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
  modifiedTime,
  noindex = false,
  robots,
  image,
  article,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes("Woolet") ? title : `${title} | Woolet`;
  const canonical = `${SITE_URL}/${lang}${path}`;
  const geo = geoMeta[lang] || geoMeta.en;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`)
    : OG_IMAGE;

  // Determine robots content
  const robotsContent = robots || (noindex ? "noindex, follow" : "index, follow");

  const articleJsonLd = type === "article" && publishedTime ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: ogImage,
    url: canonical,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
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
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "pl" ? "pl_PL" : lang === "fr" ? "fr_FR" : lang === "es" ? "es_ES" : "en_US"} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@WooletEyewear" />

      {/* Organization, WebSite, and Product schemas live in index.html (single source) */}
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
