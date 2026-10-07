import { resolveLegacyRedirect } from "@/seo/legacyRedirects";
/**
 * Centralized redirect layer.
 *
 * All redirect logic lives here so it can be edited without touching the router.
 * - EXACT: exact-path redirects (checked first)
 * - RULES: ordered regex rules (checked after EXACT, first match wins)
 *
 * Targets are app-internal paths (no query/hash — those are preserved by <Redirects />).
 */

// Exact redirects now live in src/seo/routeRedirects.ts + legacyRedirects.ts
// (one data map shared with the static stub generator).
export const EXACT: Record<string, string> = {};


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
  // c) Unlocalized legacy Shopify-era URLs: blog → /en/blog, products → /en
  {
    test: /^\/blog(\/.*)?$/,
    to: () => "/en/blog",
  },
  {
    test: /^\/products(\/.*)?$/,
    to: () => "/en",
  },
  // d) Locale-prefixed EN-only sections → same path under /en
  {
    test: /^\/(pl|fr|nl|ja|es|ar)(\/(?:compare|lp|xxl|collections)(?:\/[a-z0-9-]+)*|\/(?:size|bridge|temple)\/\d{2,3}mm)$/,
    to: (m) => `/en${m[2]}`,
  },
];

/**
 * Resolve a pathname to a redirect target, or null when no rule matches.
 * Checks EXACT first, then RULES in order. Never returns the input path itself.
 */
export function resolveRedirect(path: string): string | null {
  const legacy = resolveLegacyRedirect(path);
  if (legacy) return legacy;

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
