/**
 * Prerender vs. runtime head deduplication.
 *
 * scripts/prerender.mjs stamps every per-route SEO tag with
 * data-seo="prerender". react-helmet-async later writes its own tags
 * (data-rh="true"). We used to delete every prerender tag BEFORE React
 * mounted, which left lazy routes with no title/description/canonical for
 * seconds (or forever when a chunk stalled).
 *
 * Now a prerender tag is removed only once Helmet owns an equivalent:
 *   - meta[name=X] / meta[property=X]  -> when Helmet wrote the same key
 *   - link[rel=canonical]              -> when Helmet wrote a canonical
 *   - hreflang links + JSON-LD         -> when Helmet wrote a canonical
 *                                         (the route's SEO block mounted)
 *                                         or its own JSON-LD / hreflang
 *   - <title>                          -> never removed; Helmet assigns
 *                                         document.title, which rewrites it
 * Pages without any Helmet SEO keep their prerendered head intact.
 *
 * Must be called from src/main.tsx before createRoot().
 */

const SEL = '[data-seo="prerender"]';

function reconcile(head: HTMLHeadElement): void {
  const prerendered = head.querySelectorAll<HTMLElement>(SEL);
  if (prerendered.length === 0) return;
  const rh = (sel: string) => head.querySelector(`${sel}[data-rh]`) !== null;
  const helmetCanonical = rh('link[rel="canonical"]');
  const helmetJsonLd = rh('script[type="application/ld+json"]');
  const helmetHreflang = rh('link[rel="alternate"][hreflang]');

  prerendered.forEach((el) => {
    const tag = el.tagName;
    let remove = false;
    if (tag === "TITLE") {
      if (rh("title") || helmetCanonical) el.removeAttribute("data-seo");
      return;
    }
    if (tag === "META") {
      const name = el.getAttribute("name");
      const prop = el.getAttribute("property");
      if (name) remove = rh(`meta[name="${name}"]`) || helmetCanonical;
      else if (prop) remove = rh(`meta[property="${prop}"]`) || helmetCanonical;
    } else if (tag === "LINK") {
      const rel = el.getAttribute("rel");
      if (rel === "canonical") remove = helmetCanonical;
      else if (rel === "alternate") remove = helmetCanonical || helmetHreflang;
      else remove = helmetCanonical;
    } else if (tag === "SCRIPT") {
      remove = helmetCanonical || helmetJsonLd;
    }
    if (remove) el.parentNode?.removeChild(el);
  });
}

export function stripPrerenderedSeoHead(): void {
  if (typeof document === "undefined" || !document.head) return;
  const head = document.head;
  if (!head.querySelector(SEL)) return;
  const observer = new MutationObserver(() => {
    reconcile(head);
    if (!head.querySelector(SEL)) observer.disconnect();
  });
  observer.observe(head, { childList: true, subtree: true, characterData: true });
}
