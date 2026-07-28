/**
 * Single source of truth for locale-aware INTERNAL LINKS.
 *
 * Motivation: Google Search Console flagged 72 "Page with redirect" URLs
 * because the app used to build internal links by string-prefixing the
 * current locale (`/${lang}/about`, `/${lang}/lp/kickstarter`, …) onto
 * paths that only render 200 under `/en`. Every one of those 3xx URLs
 * was crawler-discoverable purely because THIS APP LINKED TO IT.
 *
 * Rule enforced by this file:
 *   - Every URL returned by `localePath()` or looked up via `ROUTES`
 *     MUST render 200 in the target locale.
 *   - If a page has no translation in `lang`, we return the `/en`
 *     variant directly (no client-side 301 hop) or fall back to
 *     that locale's homepage — never a URL that will redirect.
 *   - NEVER build a locale URL by string-replacing the prefix
 *     (`href.replace(/^\/en/, `/${lang}`)`). That is the exact bug
 *     this registry replaces.
 *
 * Populated from `STATIC_ROUTES` in `src/seo/metadata.ts` and the route
 * table in `src/App.tsx`. Cross-checked against `public/sitemap.xml`
 * (see `scripts/audit-sitemap.mjs`).
 */
import type { Lang } from "@/lib/i18n";

export const SUPPORTED_LOCALES = [
  "en", "pl", "de", "fr", "nl", "ja", "es", "ar",
] as const satisfies readonly Lang[];

// ---------------------------------------------------------------------------
// Logical route → per-locale real URL. A locale key is present ONLY if a
// real page exists at that URL (App.tsx renders it AND it is not a
// <Navigate>/redirect stub).
// ---------------------------------------------------------------------------

export const ROUTES = {
  // Every locale has a native homepage under /:lang.
  home: {
    en: "/en", pl: "/pl", de: "/de", fr: "/fr",
    nl: "/nl", ja: "/ja", es: "/es", ar: "/ar",
  },

  // Pages that render for every locale (App.tsx: `/:lang/<x>` -> component).
  collection: {
    en: "/en/collection", pl: "/pl/collection", de: "/de/collection",
    fr: "/fr/collection", nl: "/nl/collection", ja: "/ja/collection",
    es: "/es/collection", ar: "/ar/collection",
  },
  blog: {
    en: "/en/blog", pl: "/pl/blog", de: "/de/blog", fr: "/fr/blog",
    nl: "/nl/blog", ja: "/ja/blog", es: "/es/blog", ar: "/ar/blog",
  },
  fit: {
    en: "/en/fit", pl: "/pl/fit", de: "/de/fit", fr: "/fr/fit",
    nl: "/nl/fit", ja: "/ja/fit", es: "/es/fit", ar: "/ar/fit",
  },
  fitWizard: {
    en: "/en/fit/wizard", pl: "/pl/fit/wizard", de: "/de/fit/wizard",
    fr: "/fr/fit/wizard", nl: "/nl/fit/wizard", ja: "/ja/fit/wizard",
    es: "/es/fit/wizard", ar: "/ar/fit/wizard",
  },
  bespoke: {
    en: "/en/bespoke", pl: "/pl/bespoke", de: "/de/bespoke",
    fr: "/fr/bespoke", nl: "/nl/bespoke", ja: "/ja/bespoke",
    es: "/es/bespoke", ar: "/ar/bespoke",
  },
  bespokeScan: {
    en: "/en/bespoke/scan", pl: "/pl/bespoke/scan", de: "/de/bespoke/scan",
    fr: "/fr/bespoke/scan", nl: "/nl/bespoke/scan", ja: "/ja/bespoke/scan",
    es: "/es/bespoke/scan", ar: "/ar/bespoke/scan",
  },
  bespokeMeasurements: {
    en: "/en/bespoke/measurements", pl: "/pl/bespoke/measurements",
    de: "/de/bespoke/measurements", fr: "/fr/bespoke/measurements",
    nl: "/nl/bespoke/measurements", ja: "/ja/bespoke/measurements",
    es: "/es/bespoke/measurements", ar: "/ar/bespoke/measurements",
  },
  privacyPolicy: {
    en: "/en/privacy-policy", pl: "/pl/privacy-policy",
    de: "/de/privacy-policy", fr: "/fr/privacy-policy",
    nl: "/nl/privacy-policy", ja: "/ja/privacy-policy",
    es: "/es/privacy-policy", ar: "/ar/privacy-policy",
  },
  returnPolicy: {
    en: "/en/return-policy", pl: "/pl/return-policy",
    de: "/de/return-policy", fr: "/fr/return-policy",
    nl: "/nl/return-policy", ja: "/ja/return-policy",
    es: "/es/return-policy", ar: "/ar/return-policy",
  },
  account: {
    en: "/en/account", pl: "/pl/account", de: "/de/account",
    fr: "/fr/account", nl: "/nl/account", ja: "/ja/account",
    es: "/es/account", ar: "/ar/account",
  },
  accountSignIn: {
    en: "/en/account/sign-in", pl: "/pl/account/sign-in",
    de: "/de/account/sign-in", fr: "/fr/account/sign-in",
    nl: "/nl/account/sign-in", ja: "/ja/account/sign-in",
    es: "/es/account/sign-in", ar: "/ar/account/sign-in",
  },
  hatSizeCalculator: {
    en: "/en/hat-size-calculator", pl: "/pl/hat-size-calculator",
    de: "/de/hat-size-calculator", fr: "/fr/hat-size-calculator",
    nl: "/nl/hat-size-calculator", ja: "/ja/hat-size-calculator",
    es: "/es/hat-size-calculator", ar: "/ar/hat-size-calculator",
  },

  // Product pages: native routes exist for en, fr, nl only.
  // App.tsx redirects every other locale's `/:lang/products/:slug` -> /en.
  "products.007": { en: "/en/products/007", fr: "/fr/products/007", nl: "/nl/products/007" },
  "products.009": { en: "/en/products/009", fr: "/fr/products/009", nl: "/nl/products/009" },
  "products.bespoke": {
    en: "/en/products/bespoke",
    fr: "/fr/products/bespoke",
    nl: "/nl/products/bespoke",
  },

  // English-only editorial / marketing pages. Every other locale used to
  // 301 to /en — internal links must point directly at /en.
  about: { en: "/en/about" },
  process: { en: "/en/process" },
  theBox: { en: "/en/the-box" },
  compare: { en: "/en/compare" },
  "compare.fatheadz": { en: "/en/compare/fatheadz-alternative" },
  "compare.eyeshells": { en: "/en/compare/eyeshells-alternative" },
  "compare.zenni": { en: "/en/compare/zenni-alternative" },
  "compare.warbyParker": { en: "/en/compare/warby-parker-alternative" },
  "compare.rayBan": { en: "/en/compare/ray-ban-alternative" },
  "compare.persol": { en: "/en/compare/persol-alternative" },
  "lp.kickstarter": { en: "/en/lp/kickstarter" },
  "lp.whyGlassesFail": { en: "/en/lp/why-glasses-fail" },
  "lp.5reasons": { en: "/en/lp/5-reasons" },
  "lp.wideBridgeFitGuide": { en: "/en/lp/wide-bridge-fit-guide" },

  // Blog posts that have real translations. Every non-EN slug is unique to
  // its locale — never a prefix swap of the EN slug. Kept in sync with
  // src/lib/blog-slug-map.ts.
  "blog.bestGlassesBigHeads2026": {
    en: "/en/blog/best-glasses-for-big-heads-2026",
    pl: "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",
    de: "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
    fr: "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
    nl: "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  },
  "blog.whatSizeSunglassesWide": {
    de: "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
    fr: "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
    nl: "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  },
} as const satisfies Record<string, Partial<Record<Lang, string>>>;

export type RouteKey = keyof typeof ROUTES;

// ---------------------------------------------------------------------------
// Path classification for arbitrary internal links. Used by `localePath()`
// so callers don't need a named RouteKey for every leaf URL (there are
// dozens of `/collections/*`, `/size/*`, `/bridge/*` slugs and hard-coding
// every one would be noise).
// ---------------------------------------------------------------------------

/**
 * Path suffixes (after the /{lang} prefix, leading slash included) that
 * render 200 in EVERY locale. Kept in sync with App.tsx's `/:lang/<x>`
 * routes that point at a real component (not a <Navigate>).
 */
const ALL_LOCALES_PATHS: ReadonlySet<string> = new Set([
  "",
  "/collection",
  "/blog",
  "/fit",
  "/fit/wizard",
  "/bespoke",
  "/bespoke/scan",
  "/bespoke/measurements",
  "/privacy-policy",
  "/return-policy",
  "/account",
  "/account/sign-in",
  "/account/callback",
  "/hat-size-calculator",
  "/vip-join",
  "/thank-you",
  "/thank-you-fb",
  "/payments",
]);

/**
 * Path prefixes that only render under /en. Every other locale 301s to /en
 * (see App.tsx: RedirectToEn / <Navigate to="/en/...">). Internal links
 * must therefore point at /en directly.
 */
const EN_ONLY_PATH_PREFIXES: readonly string[] = [
  "/about",
  "/process",
  "/the-box",
  "/lp/",
  "/collections/",
  "/compare",
  "/size/",
  "/bridge/",
  "/temple/",
  "/xxl",
  "/fit/manual",
  "/fit/quick",
  "/fit/bespoke",
  "/bespoke/configurator",
  "/bespoke/checkout",
];

/** Product pages have native routes in these locales only. */
const PRODUCT_NATIVE_LOCALES: readonly Lang[] = ["en", "fr", "nl"];

/**
 * Return a real, non-redirecting internal href for `path` in `lang`.
 *
 * `path` is the route AFTER the /{lang} prefix (leading slash optional).
 * Examples:
 *   localePath("de", "/collection")       -> "/de/collection"
 *   localePath("de", "/about")            -> "/en/about"      // was /de/about (301)
 *   localePath("ja", "/lp/why-glasses-fail") -> "/en/lp/why-glasses-fail"
 *   localePath("ar", "/products/007")     -> "/en/products/007"
 *   localePath("fr", "/products/009")     -> "/fr/products/009"
 *   localePath("pl", "")                  -> "/pl"
 *
 * Unknown paths default to /en to guarantee the link never 3xx's.
 */
export function localePath(lang: Lang, path: string): string {
  const p = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;

  if (p.startsWith("/products/")) {
    const target = (PRODUCT_NATIVE_LOCALES as readonly string[]).includes(lang)
      ? lang
      : "en";
    return `/${target}${p}`;
  }

  // Blog post slugs are locale-specific — a slug is valid ONLY in the
  // locale where it was authored. We keep the caller-supplied locale
  // untouched here (the blog-slug-map handles translated variants).
  if (p.startsWith("/blog/") && p !== "/blog") {
    return `/${lang}${p}`;
  }

  if (ALL_LOCALES_PATHS.has(p)) return `/${lang}${p}`;

  for (const pref of EN_ONLY_PATH_PREFIXES) {
    if (p === pref || p.startsWith(pref)) return `/en${p}`;
  }

  // Unknown path — safest is /en (never emits a 3xx).
  return `/en${p}`;
}

/**
 * Return the locales in which the named RouteKey has a real page.
 * Used by the language switcher to decide which locales to render as
 * a translation of the current page.
 */
export function localesForRoute(key: RouteKey): Lang[] {
  return Object.keys(ROUTES[key]) as Lang[];
}

/** True iff `key` has a real page in `lang`. */
export function hasLocalized(key: RouteKey, lang: Lang): boolean {
  return Boolean((ROUTES[key] as Partial<Record<Lang, string>>)[lang]);
}

/**
 * Return the real URL for a named RouteKey in `lang`, falling back to
 * `/en` when no translation exists. Never returns a URL that 3xx's.
 */
export function hrefFor(key: RouteKey, lang: Lang): string {
  const entry = ROUTES[key] as Partial<Record<Lang, string>>;
  return entry[lang] ?? entry.en ?? `/${lang}`;
}

// ---------------------------------------------------------------------------
// Reverse lookup: pathname -> RouteKey. Used by the language switcher so
// it can offer the localized version of the CURRENT page when one exists,
// and fall back to the locale homepage otherwise.
// ---------------------------------------------------------------------------

const PATH_TO_KEY: Map<string, RouteKey> = (() => {
  const m = new Map<string, RouteKey>();
  for (const [key, entry] of Object.entries(ROUTES)) {
    for (const url of Object.values(entry)) {
      if (url) m.set(url, key as RouteKey);
    }
  }
  return m;
})();

/**
 * Best-effort: identify the RouteKey for a full pathname (e.g.
 * "/de/blog/beste-brillen-fuer-grosse-koepfe-2026"). Returns undefined
 * for unknown pages — the switcher then falls back to the locale
 * homepage rather than fabricating a translation URL.
 */
export function keyForPath(pathname: string): RouteKey | undefined {
  return PATH_TO_KEY.get(pathname);
}
