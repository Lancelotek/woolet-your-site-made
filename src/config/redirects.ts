/**
 * Centralized redirect layer.
 *
 * All redirect logic lives here so it can be edited without touching the router.
 * - EXACT: exact-path redirects (checked first)
 * - RULES: ordered regex rules (checked after EXACT, first match wins)
 *
 * Targets are app-internal paths (no query/hash — those are preserved by <Redirects />).
 */

export const EXACT: Record<string, string> = {
  // Legacy Shopify product URLs that map to specific eyewear models.
  // Kept here (ahead of the generic /products/* rule) so the centralized
  // layer preserves the existing router behavior for these paths.
  "/products/smart-and-slim-leather-wallet": "/en/products/009",
  "/products/smart-and-slim-travel-wallet-hand-crafted-leather": "/en/products/007",
  "/blog/woolet-howl-3-0-gps-manual-how-setup-gps-wallet": "/en",

  "/en/blog/what-is-italian-acetate": "/en/blog/what-is-italian-acetate-premium-eyewear",
  "/en/blog/round-vs-square": "/en/blog/round-vs-square-glasses-wide-face",
  "/en/blog/why-glasses-dont-fit-155mm": "/en/blog/why-glasses-dont-fit-155mm-problem",
  "/en/blog/wide-frame-professionals": "/en/blog/wide-frame-glasses-professionals",
  "/en/blog/best-glasses-for-wide-faces-for-women": "/en/blog/wide-face-glasses-for-women",
  "/en/blog/xxl-aviator-sunglasses-for-big-heads": "/en/blog/best-oversized-sunglasses-big-heads-2026",
  "/en/blog/glasses-bigger-than-150mm-where-to-find-them": "/en/blog/best-glasses-for-big-heads-2026",
  "/pl/blog/okulary-dla-szerokich-twarzy-przewodnik": "/pl/blog/okulary-na-szeroka-twarz-przewodnik",
  "/pl/blog/jak-zmierzyc-szerokosc-twarzy": "/pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow",
  "/pl/blog/how-to-measure-face-width-for-glasses": "/pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow",
  "/pl/blog/czym-jest-wloski-octan": "/pl/blog/czym-jest-wloski-octan-premium-oprawki",
  "/pl/blog/dlaczego-okulary-nie-pasuja-155mm": "/pl/blog/dlaczego-okulary-nie-pasuja-problem-155mm",
  "/pl/blog/okragle-vs-kwadratowe": "/pl/blog/okragle-czy-kwadratowe-okulary-szeroka-twarz",
  "/pl/blog/szerokie-oprawki-dla-profesjonalistow": "/pl/blog/okulary-na-szeroka-twarz-dla-profesjonalistow",
  "/pl/blog/najlepsze-okulary-dla-duzych-glow-2026": "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",
  "/pl/blog/best-glasses-for-big-heads-2026": "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",
  "/de/blog/best-glasses-for-big-heads-2026": "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
  "/ar/blog/best-glasses-for-big-heads-2026": "/en/blog/best-glasses-for-big-heads-2026",
  "/ja/size/145mm": "/en/size/145mm",
  "/en/compare/warby-parker": "/en/compare/warby-parker-alternative",
  "/en/blue-light-glasses-wide-faces": "/en/collections/blue-light-glasses-for-wide-faces",
  "/blue-light-glasses-wide-faces": "/en/collections/blue-light-glasses-for-wide-faces",
};

export interface RedirectRule {
  test: RegExp;
  to: (m: RegExpMatchArray, path: string) => string;
}

export const RULES: RedirectRule[] = [
  // a) Root → default locale
  {
    test: /^\/$/,
    to: () => "/en",
  },
  // b) Trailing slash → strip, then re-run matching on the stripped path
  {
    test: /^(.+?)\/+$/,
    to: (m) => resolveRedirect(m[1]) ?? m[1],
  },
  // c) Unlocalized legacy Shopify-era blog/products URLs → /en
  {
    test: /^\/(blog|products)(\/.*)?$/,
    to: () => "/en",
  },
  // d) Locale-prefixed EN-only sections → same path under /en
  {
    test: /^\/(pl|de|fr|nl|ja|es|ar)(\/(?:compare|lp|xxl|collections)(?:\/[a-z0-9-]+)*|\/(?:size|bridge|temple)\/\d{2,3}mm)$/,
    to: (m) => `/en${m[2]}`,
  },
];

/**
 * Resolve a pathname to a redirect target, or null when no rule matches.
 * Checks EXACT first, then RULES in order. Never returns the input path itself.
 */
export function resolveRedirect(path: string): string | null {
  const exact = EXACT[path];
  if (exact && exact !== path) return exact;

  for (const rule of RULES) {
    const m = path.match(rule.test);
    if (m) {
      const target = rule.to(m, path);
      if (target && target !== path) return target;
    }
  }
  return null;
}
