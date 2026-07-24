import { Helmet } from "react-helmet-async";
import { SUPPORTED_LANGS, INDEXABLE_LANGS, type Lang } from "@/lib/i18n";

interface SEOProps {
  title: string;
  description: string;
  /** Optional shorter description used only for og:description / twitter:description.
   *  Falls back to `description` when omitted. Keep under 160 characters for optimal social previews. */
  ogDescription?: string;
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
  /**
   * Optional author for article-type pages. When provided, emitted as a
   * standalone Person/Organization node with a stable @id, and referenced
   * from BlogPosting.author via that @id so the same entity is reused
   * across every locale (en/nl/de/…).
   */
  author?: {
    type: "Person" | "Organization";
    name: string;
    /** Stable @id — MUST be identical across locales. Defaults to a Woolet Organization id. */
    id?: string;
    url?: string;
    sameAs?: string[];
    jobTitle?: string;
    image?: string;
  };
  availableLangs?: Lang[];
  alternates?: Partial<Record<Lang, string>>;
}

const SITE_URL = "https://woolet.co";
const OG_IMAGE = "https://woolet.co/og-image.png";

// Organization, WebSite, and Product JSON-LD live in index.html as the single source.

const geoMeta: Record<string, { region: string; placename: string }> = {
  en: { region: "US", placename: "United States" },
  pl: { region: "PL", placename: "Polska" },
  fr: { region: "FR", placename: "France" },
  es: { region: "ES", placename: "España" },
  de: { region: "DE", placename: "Deutschland" },
  ar: { region: "AE", placename: "العالم العربي" },
  ja: { region: "JP", placename: "日本" },
  nl: { region: "NL", placename: "Nederland" },
};


const SEO = ({
  title,
  description,
  ogDescription,
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
  author,
  availableLangs,
  alternates,
}: SEOProps) => {
  const fullTitle = title.includes("Woolet") ? title : `${title} | Woolet`;
  const socialDescription = ogDescription || description;
  const canonical = `${SITE_URL}/${lang}${path}`;
  const geo = geoMeta[lang] || geoMeta.en;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`)
    : OG_IMAGE;

  // Determine robots content
  const robotsContent = robots || (noindex ? "noindex, follow" : "index, follow");

  // BlogPosting is a subtype of Article and is the preferred schema.org
  // type for editorial blog content. Google renders it identically to
  // Article for rich results, but the more specific type gives translated
  // language versions (nl-NL, de-DE, en-US, …) a cleaner semantic anchor
  // and pairs well with the sitewide WebSite entity from index.html.
  const localeMap: Record<string, string> = {
    en: "en-US", pl: "pl-PL", fr: "fr-FR", es: "es-ES",
    de: "de-DE", ar: "ar-AR", ja: "ja-JP", nl: "nl-NL",
  };
  const bcp47 = localeMap[lang] ?? "en-US";
  // Stable, locale-independent @id for the author entity. When no explicit
  // author is passed, we fall back to the Woolet Organization so BlogPosting
  // still points at a real node.
  const ORG_ID = `${SITE_URL}/#organization`;
  const resolvedAuthor = author ?? {
    type: "Organization" as const,
    name: "Woolet",
    id: ORG_ID,
    url: SITE_URL,
    sameAs: [
      "https://www.facebook.com/wooleteyewear",
      "https://www.instagram.com/wooleteyewear/",
    ],
  };
  const authorId = resolvedAuthor.id
    ?? (resolvedAuthor.type === "Organization"
      ? ORG_ID
      : `${SITE_URL}/authors/${resolvedAuthor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}#person`);

  const authorNode = type === "article" && publishedTime ? {
    "@context": "https://schema.org",
    "@type": resolvedAuthor.type,
    "@id": authorId,
    name: resolvedAuthor.name,
    ...(resolvedAuthor.url ? { url: resolvedAuthor.url } : {}),
    ...(resolvedAuthor.jobTitle ? { jobTitle: resolvedAuthor.jobTitle } : {}),
    ...(resolvedAuthor.image ? { image: resolvedAuthor.image } : {}),
    ...(resolvedAuthor.sameAs?.length ? { sameAs: resolvedAuthor.sameAs } : {}),
    ...(resolvedAuthor.type === "Person"
      ? { worksFor: { "@type": "Organization", "@id": ORG_ID, name: "Woolet", url: SITE_URL } }
      : {}),
  } : null;

  const articleJsonLd = type === "article" && publishedTime ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: {
      "@type": "ImageObject",
      url: ogImage,
      contentUrl: ogImage,
      caption: title,
      description,
      representativeOfPage: true,
      creditText: "Woolet",
      creator: { "@type": "Organization", name: "Woolet", url: SITE_URL },
      copyrightNotice: `© ${new Date().getFullYear()} Woolet`,
      license: `${SITE_URL}/terms`,
      acquireLicensePage: `${SITE_URL}/contact`,
    },
    url: canonical,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: { "@type": resolvedAuthor.type, "@id": authorId, name: resolvedAuthor.name },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Woolet",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
      sameAs: [
        "https://www.facebook.com/wooleteyewear",
        "https://www.instagram.com/wooleteyewear/",
      ],
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}#website`, url: SITE_URL, name: "Woolet" },
    inLanguage: bcp47,
    ...(article?.tags?.length ? { keywords: article.tags.join(", ") } : {}),
    ...(article?.readTime ? { timeRequired: `PT${article.readTime}M`, wordCount: article.readTime * 220 } : {}),
  } : null;

  // Build hreflang links as a flat array — react-helmet-async does NOT
  // traverse React Fragments as direct children of <Helmet>, so wrapping
  // conditional groups in <>...</> silently drops them.
  const hreflangLinks: JSX.Element[] = [];
  if (path === "") {
    INDEXABLE_LANGS.forEach((l) => {
      hreflangLinks.push(
        <link key={`hl-${l}`} rel="alternate" hrefLang={l} href={`${SITE_URL}/${l}`} />
      );
    });
    hreflangLinks.push(
      <link key="hl-xdef" rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en`} />
    );
  } else if (availableLangs && availableLangs.length > 0) {
    availableLangs.forEach((l) => {
      const overridePath = alternates?.[l];
      const href = overridePath
        ? `${SITE_URL}/${l}${overridePath.startsWith("/") ? overridePath : `/${overridePath}`}`
        : `${SITE_URL}/${l}${path}`;
      hreflangLinks.push(
        <link key={`hl-${l}`} rel="alternate" hrefLang={l} href={href} />
      );
    });
    const xdef = alternates?.en
      ? `${SITE_URL}/en${alternates.en.startsWith("/") ? alternates.en : `/${alternates.en}`}`
      : `${SITE_URL}/en${path}`;
    hreflangLinks.push(
      <link key="hl-xdef" rel="alternate" hrefLang="x-default" href={xdef} />
    );
  } else {
    hreflangLinks.push(
      <link key="hl-self" rel="alternate" hrefLang={lang} href={canonical} />,
      <link key="hl-xdef" rel="alternate" hrefLang="x-default" href={canonical} />
    );
  }

  return (
    <Helmet>
      <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robotsContent} />

      {/* GEO meta tags */}
      <meta name="geo.region" content={geo.region} />
      <meta name="geo.placename" content={geo.placename} />
      <meta name="content-language" content={lang} />

      {hreflangLinks}




      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={socialDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Woolet" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "pl" ? "pl_PL" : lang === "fr" ? "fr_FR" : lang === "es" ? "es_ES" : lang === "de" ? "de_DE" : lang === "ar" ? "ar_AR" : lang === "ja" ? "ja_JP" : lang === "nl" ? "nl_NL" : "en_US"} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={socialDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@WooletEyewear" />

      {/* Organization, WebSite, and Product schemas live in index.html (single source) */}
      {articleJsonLd && (
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      )}
      {authorNode && (
        <script type="application/ld+json">{JSON.stringify(authorNode)}</script>
      )}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
