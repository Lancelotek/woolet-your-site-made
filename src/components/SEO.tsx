import { Helmet } from "react-helmet-async";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

interface SEOProps {
  title: string;
  description: string;
  lang?: Lang;
  path?: string; // path without lang prefix, e.g. "/blog/some-slug"
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
}

const SITE_URL = "https://woolet.co";

const SEO = ({
  title,
  description,
  lang = "en",
  path = "",
  type = "website",
  publishedTime,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title.includes("Woolet") ? title : `${title} | Woolet`;
  const canonical = `${SITE_URL}/${lang}${path}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* hreflang for all supported languages */}
      {SUPPORTED_LANGS.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={`${SITE_URL}/${l}${path}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en${path}`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Woolet" />
      <meta property="og:locale" content={lang === "pl" ? "pl_PL" : lang === "fr" ? "fr_FR" : lang === "es" ? "es_ES" : "en_US"} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
};

export default SEO;
