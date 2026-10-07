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

import { ROUTE_REDIRECTS } from "./routeRedirects";

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/Home/Blog": "/en/blog",
  "/Home/Fit": "/en/fit",
  "/Home/Fit Guide": "/en/fit",
  "/Home/Size Guide": "/en/blog/eyeglass-frame-size-chart",
  "/Home": "/en",
  "/index.html": "/en",
  "/en/xxl": "/en/collection",
  "/en/xxl/glasses": "/en/collections/extra-large-oversized-eyeglasses",
  "/en/xxl/sunglasses": "/en/collections/sunglasses-for-big-heads",
  "/en/xxl/for-big-heads": "/en/collections/glasses-for-big-heads",
  "/en/xxl/extra-wide-frames": "/en/collections/extra-wide-glasses",
  "/en/blog/best-glasses-for-wide-faces-for-women": "/en/blog/wide-face-glasses-for-women",
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

  // Smart-wallet era URLs still crawled (GSC 07.10.2026).
  "/charging-mousepad": "/en",
  "/about-us": "/en/about",
  "/contact": "/en/about",
  "/en/contact": "/en/about",
  "/blog": "/en/blog",
  "/blog/why-buy-smart-wallet-woolet": "/en/blog",
  "/blog/what-does-a-smart-wallet-do": "/en/blog",
  "/blog/best-smart-wallets-with-the-built-in-powerbank": "/en/blog",
  "/blog/smart-wallets-what-to-know-about-your-new-favorite-gadget": "/en/blog",
  "/blog/woolet-manual-woof-glow-juice-1-0-2-0-juice": "/en/blog",
  "/category/wallets": "/en",
  "/category/wallets.html": "/en",
  "/category/shop-all": "/en",
  "/Woolet-Glow-2-0-Antibacterial-Edition-p188259229": "/en",
  "/Woolet-JUICE-Bifold-BUILT-IN-POWERBANK-p1903443": "/en",
  "/products/wooden-iphone-apple-watch-combo-dock": "/en",
  "/terms/privacy-policy": "/en/privacy-policy",
  "/en/blog/how-to-measure-face-width": "/en/blog/how-to-measure-face-width-for-glasses",
};

/** Every static redirect (legacy + router data map) — one stub per entry. */
export const ALL_REDIRECTS: Record<string, string> = { ...ROUTE_REDIRECTS, ...LEGACY_REDIRECTS };

/** Wildcard rules, checked after the exact map. */
const LEGACY_PREFIX_RULES: { prefix: string; to: string }[] = [
  { prefix: "/home/", to: "/en" }, // any other /Home/* → /en
  { prefix: "/blog/", to: "/en/blog" }, // old smart-wallet posts
  { prefix: "/category/", to: "/en" },
];
const LEGACY_REGEX_RULES: { re: RegExp; to: string }[] = [
  { re: /^\/woolet-[^/]*-p\d+$/, to: "/en" }, // old shop product pages
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
  Object.entries(ALL_REDIRECTS).map(([from, to]) => [normalize(from), to]),
);

/** Target for a legacy path, or null when the path is not a known legacy URL. */
export function resolveLegacyRedirect(path: string): string | null {
  const n = normalize(path);
  const exact = NORMALIZED.get(n);
  if (exact && normalize(exact) !== n) return exact;
  for (const rule of LEGACY_PREFIX_RULES) {
    if (n.startsWith(rule.prefix)) return rule.to;
  }
  for (const rule of LEGACY_REGEX_RULES) {
    if (rule.re.test(n)) return rule.to;
  }
  return null;
}
