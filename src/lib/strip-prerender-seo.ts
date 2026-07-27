/**
 * Prerender vs. runtime head deduplication.
 *
 * `scripts/prerender.mjs` writes every per-route SEO tag (title, meta
 * description, canonical, robots, hreflang, og:*, twitter:*, JSON-LD)
 * into the initial HTML with a `data-seo="prerender"` attribute, so
 * crawlers and LLM bots see real metadata without executing JS.
 *
 * react-helmet-async then wants to render the SAME tags on the client.
 * Helmet only dedupes tags it owns — anything already sitting in
 * document.head that it did not add is left in place, which is exactly
 * how we ended up with 114 pages shipping two <meta name="description">
 * and two <link rel="canonical"> tags.
 *
 * Fix: strip every [data-seo="prerender"] node from document.head
 * exactly once, synchronously, BEFORE React mounts. Helmet then becomes
 * the single owner of the head after hydration. Crawlers still see the
 * prerendered tags because they never run this code.
 *
 * Must be called from src/main.tsx before createRoot().
 */

export function stripPrerenderedSeoHead(): void {
  if (typeof document === "undefined") return;
  const nodes = document.head.querySelectorAll('[data-seo="prerender"]');
  nodes.forEach((n) => n.parentNode?.removeChild(n));
}
