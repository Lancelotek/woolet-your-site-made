import { hreflangAlternates } from "@/i18n/routeRegistry";

const SITE_URL = "https://woolet.co";

/**
 * Helmet-ready hreflang <link> elements for a pathname, sourced from the
 * route registry (same source as the prerendered head and the sitemap).
 * Returns an empty array when the page has no reciprocal 1:1 cluster.
 * Must be spread directly inside <Helmet> (Helmet ignores wrapper components).
 */
export function hreflangLinks(pathname: string) {
  const alts = hreflangAlternates(pathname, SITE_URL) ?? [];
  return alts.map(({ lang, href }) => (
    <link key={`hl-${lang}`} rel="alternate" hrefLang={lang} href={href} />
  ));
}
