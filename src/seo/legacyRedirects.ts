/**
 * SINGLE SOURCE OF TRUTH for legacy URL redirects (SEO audit 05.10.2026).
 *
 * Consumed by:
 *   - src/config/redirects.ts  -> client router (navigate with replace)
 *   - scripts/prerender.mjs    -> static HTML per legacy path with
 *     canonical=TARGET, meta refresh, window.location.replace, no noindex
 *
 * Matching is case-insensitive, ignores a trailing slash and treats
 * "%20" and a space the same. Truly unknown paths are NOT listed here
 * and keep the soft-404 noindex behaviour.
 */

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/Home/Blog": "/en/blog",
  "/Home/Fit": "/en/fit",
  "/Home/Fit Guide": "/en/fit",
  "/Home/Size Guide": "/en/blog/eyeglass-frame-size-chart",
  "/Home": "/en",
  "/index.html": "/en",
  "/brille-breite-160-mm": "/de/brille-breite-160-mm",

  // Widths Woolet no longer makes — widest Woolet front is 160 mm (bespoke).
  "/en/size/162mm": "/en/size/160mm",
  "/en/size/165mm": "/en/size/160mm",
  "/en/size/168mm": "/en/size/160mm",
  "/en/size/170mm": "/en/size/160mm",
  "/en/size/172mm": "/en/size/160mm",
  "/ko/size/165mm": "/ko/size/160mm",

  // Bespoke size guide moved to the corrected 145–160 mm slug.
  "/en/blog/bespoke-eyewear-size-range-145-172mm-guide": "/en/blog/bespoke-eyewear-size-range-145-160mm-guide",
  "/en/blog/bespoke-eyewear-size-range-150-172mm-guide": "/en/blog/bespoke-eyewear-size-range-145-160mm-guide",
  "/blog/bespoke-eyewear-size-range-145-172mm-guide": "/en/blog/bespoke-eyewear-size-range-145-160mm-guide",
  "/blog/bespoke-eyewear-size-range-150-172mm-guide": "/en/blog/bespoke-eyewear-size-range-145-160mm-guide",
};

/** Wildcard rules, checked after the exact map. */
const LEGACY_PREFIX_RULES: { prefix: string; to: string }[] = [
  { prefix: "/home/", to: "/en" }, // any other /Home/* → /en
];

function normalize(path: string): string {
  let p = path;
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep raw */
  }
  p = p.replace(/\+/g, " ").replace(/\/+$/, "");
  return (p || "/").toLowerCase();
}

const NORMALIZED: Map<string, string> = new Map(
  Object.entries(LEGACY_REDIRECTS).map(([from, to]) => [normalize(from), to]),
);

/** Target for a legacy path, or null when the path is not a known legacy URL. */
export function resolveLegacyRedirect(path: string): string | null {
  const n = normalize(path);
  const exact = NORMALIZED.get(n);
  if (exact && normalize(exact) !== n) return exact;
  for (const rule of LEGACY_PREFIX_RULES) {
    if (n.startsWith(rule.prefix)) return rule.to;
  }
  return null;
}
