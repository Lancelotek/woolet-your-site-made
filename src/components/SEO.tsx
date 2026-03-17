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
  article?: {
    readTime: number;
    tags: string[];
  };
}

const SITE_URL = "https://woolet.co";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2fc83e0d-dae0-45c7-9556-41dea78535f7/id-preview-09959508--db6d8b13-643f-4791-aab7-db9fbd5ea35d.lovable.app-1773304979945.png";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Woolet",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description: "Premium eyewear engineered for wide faces (155mm+). Italian Mazzucchelli acetate frames.",
  brand: { "@type": "Brand", name: "Woolet" },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Woolet",
  url: SITE_URL,
  description: "Premium eyewear for wide faces",
  publisher: { "@type": "Organization", name: "Woolet", url: SITE_URL },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Woolet Eyewear for Wide Faces",
  description: "Italian Mazzucchelli acetate glasses precision-engineered for 155mm+ face widths. Models 007 (round) & 009 (square).",
  brand: { "@type": "Brand", name: "Woolet" },
  image: OG_IMAGE,
  offers: {
    "@type": "AggregateOffer",
    availability: "https://schema.org/PreOrder",
    priceCurrency: "USD",
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
  article,
}: SEOProps) => {
  const fullTitle = title.includes("Woolet") ? title : `${title} | Woolet`;
  const canonical = `${SITE_URL}/${lang}${path}`;
  const isHomepage = path === "" || path === "/";
  const geo = geoMeta[lang] || geoMeta.en;

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

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Structured Data */}
      {isHomepage && (
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
      )}
      {isHomepage && (
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      )}
      {isHomepage && (
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      )}
      {articleJsonLd && (
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
