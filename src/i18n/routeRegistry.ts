/**
 * SINGLE SOURCE OF TRUTH for locale-aware internal links AND hreflang
 * annotations.
 *
 * A locale key is present in a `ROUTES` entry ONLY when BOTH are true:
 *   (1) the URL is listed in public/sitemap.xml, AND
 *   (2) the page emits a self-referencing <link rel="canonical">
 *       (not canonical=/en).
 *
 * Rebuilt after live production audit revealed that many `/:lang/<x>`
 * routes rendered the homepage fallback shell and canonicalised to /en.
 * Advertising those as translations is worse than not linking to them:
 * Google records the target as "Page with redirect" and drops the
 * hreflang annotation entirely.
 *
 * Consumers:
 *   - `src/seo/metadata.ts` -> prerendered <head> hreflang links
 *   - `src/components/SEO.tsx` -> Helmet-managed hreflang links
 *   - `src/components/Navbar.tsx`, `Footer.tsx`, … -> language switcher
 *     and internal links
 *
 * NEVER build a locale URL by string-replacing the prefix
 * (`href.replace(/^\/en/, `/${lang}`)`). Use `hrefFor()` / `localePath()`.
 */
import type { Lang } from "@/lib/i18n";

export const SUPPORTED_LOCALES = [
  "en", "pl", "de", "fr", "nl", "ja", "es", "ar",
] as const satisfies readonly Lang[];

// ---------------------------------------------------------------------------
// Logical route -> per-locale real URL. Every value must be a URL that
// renders 200 with a self-referencing canonical. Locales absent from an
// entry have NO translation of that page.
// ---------------------------------------------------------------------------

export const ROUTES = {
  // Homepages. Every locale ships a native `/:lang` page.
  home: {
    en: "/en", pl: "/pl", de: "/de", fr: "/fr",
    nl: "/nl", ja: "/ja", es: "/es", ar: "/ar",
  },

  // -----------------------------------------------------------------------
  // Site pages. Only locales with REAL translated content are listed.
  // -----------------------------------------------------------------------

  // /collection — real pages in en, fr, nl. Every other locale used to
  // render the EN component and canonicalise to /en (soft 404).
  collection: {
    en: "/en/collection",
    fr: "/fr/collection",
    nl: "/nl/collection",
  },

  // /blog index — real translated indexes in en, pl, de.
  blog: {
    en: "/en/blog",
    pl: "/pl/blog",
    de: "/de/blog",
  },

  // /bespoke landing — real in en + ja. Other locales use dedicated
  // landing pages (e.g. /pl/okulary-na-zamowienie), tracked separately.
  bespoke: {
    en: "/en/bespoke",
    ja: "/ja/bespoke",
  },

  // /process — real translation in pl (/pl/process).
  process: {
    en: "/en/process",
    pl: "/pl/process",
  },

  // Legal — pl has real translations, no other locale does.
  privacyPolicy: {
    en: "/en/privacy-policy",
    pl: "/pl/privacy-policy",
  },
  returnPolicy: {
    en: "/en/return-policy",
    pl: "/pl/return-policy",
  },

  // Products — native routes exist in en, fr, nl only.
  "products.007":     { en: "/en/products/007",     fr: "/fr/products/007",     nl: "/nl/products/007" },
  "products.009":     { en: "/en/products/009",     fr: "/fr/products/009",     nl: "/nl/products/009" },
  "products.bespoke": { en: "/en/products/bespoke", fr: "/fr/products/bespoke", nl: "/nl/products/bespoke" },

  // -----------------------------------------------------------------------
  // EN-only editorial / app pages. No hreflang cluster emitted for these.
  // -----------------------------------------------------------------------
  about:                 { en: "/en/about" },
  theBox:                { en: "/en/the-box" },
  fit:                   { en: "/en/fit" },
  fitWizard:             { en: "/en/fit/wizard" },
  bespokeScan:           { en: "/en/bespoke/scan" },
  bespokeMeasurements:   { en: "/en/bespoke/measurements" },
  bespokeConfigurator:   { en: "/en/bespoke/configurator" },
  account:               { en: "/en/account" },
  accountSignIn:         { en: "/en/account/sign-in" },
  hatSizeCalculator:     { en: "/en/hat-size-calculator" },
  compare:               { en: "/en/compare" },
  "compare.fatheadz":    { en: "/en/compare/fatheadz-alternative" },
  "compare.eyeshells":   { en: "/en/compare/eyeshells-alternative" },
  "compare.zenni":       { en: "/en/compare/zenni-alternative" },
  "compare.warbyParker": { en: "/en/compare/warby-parker-alternative" },
  "compare.rayBan":      { en: "/en/compare/ray-ban-alternative" },
  "compare.persol":      { en: "/en/compare/persol-alternative" },
  "lp.kickstarter":      { en: "/en/lp/kickstarter" },
  "lp.whyGlassesFail":   { en: "/en/lp/why-glasses-fail" },
  "lp.5reasons":         { en: "/en/lp/5-reasons" },
  "lp.wideBridgeFitGuide": { en: "/en/lp/wide-bridge-fit-guide" },

  // -----------------------------------------------------------------------
  // Locale-specific landing pages that are advertised as translations of
  // an EN evergreen page (matches sitemap.xml xhtml:link declarations).
  // -----------------------------------------------------------------------
  "landing.bespoke.nl": {
    en: "/en/bespoke",
    nl: "/nl/acetaat-bril-op-maat",
  },
  "landing.collection.nl": {
    en: "/en/collection",
    nl: "/nl/grote-brillen-heren",
  },
  "landing.bespoke.pl": {
    en: "/en/bespoke",
    pl: "/pl/okulary-na-zamowienie",
  },
  "landing.fit.pl": {
    en: "/en/fit",
    pl: "/pl/jak-dobrac-okulary-do-twarzy",
  },
  "landing.bespoke.fr": {
    en: "/en/bespoke",
    fr: "/fr/lunettes-sur-mesure",
  },
  "landing.bespoke.ja": {
    en: "/en/bespoke",
    ja: "/ja/big-face-glasses",
  },

  // DE SEO landing pages — each targets a different EN evergreen. Only the
  // DE variant self-canonicalises; the EN side is a many-to-one anchor,
  // so we still expose the pair so the DE page carries a proper hreflang
  // cluster back to EN.
  "landing.collection.de.breite-brille":            { en: "/en/collection", de: "/de/breite-brille" },
  "landing.collection.de.brille-fuer-breites-gesicht": { en: "/en/collection", de: "/de/brille-fuer-breites-gesicht" },
  "landing.collection.de.brille-grosse-koepfe":     { en: "/en/collection", de: "/de/brille-grosse-koepfe" },
  "landing.collection.de.xxl-brille-herren":        { en: "/en/collection", de: "/de/xxl-brille-herren" },
  "landing.collection.de.brille-breite-160-mm":     { en: "/en/collection", de: "/de/brille-breite-160-mm" },

  // Blue-light + wide-head cluster. Reciprocal 1:1 pair (EN anchor is not
  // shared with any other entry), so both sides emit en + de + x-default.
  "landing.blueLight.de": {
    en: "/en/collections/blue-light-glasses-for-wide-faces",
    de: "/de/blaulichtfilter-brille-herren",
  },

  // -----------------------------------------------------------------------
  // Translated blog posts. Sourced from public/sitemap.xml alternates and
  // src/lib/blog-slug-map.ts. Every non-EN slug is unique to its locale
  // (never a prefix swap of the EN slug).
  // -----------------------------------------------------------------------
  "blog.bestGlassesBigHeads2026": {
    en: "/en/blog/best-glasses-for-big-heads-2026",
    pl: "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",
    de: "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
    fr: "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
    nl: "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  },
  "blog.whatSizeSunglassesWide": {
    en: "/en/blog/what-size-sunglasses-for-wide-faces",
    de: "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
    fr: "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
    nl: "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  },
  "blog.whatIsItalianAcetate": {
    en: "/en/blog/what-is-italian-acetate-premium-eyewear",
    pl: "/pl/blog/czym-jest-wloski-octan-premium-oprawki",
  },
  "blog.whyGlassesDontFit155mm": {
    en: "/en/blog/why-glasses-dont-fit-155mm-problem",
    pl: "/pl/blog/dlaczego-okulary-nie-pasuja-problem-155mm",
  },
  "blog.howToMeasureFaceWidth": {
    en: "/en/blog/how-to-measure-face-width-for-glasses",
    pl: "/pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow",
  },
  "blog.roundVsSquareWide": {
    en: "/en/blog/round-vs-square-glasses-wide-face",
    pl: "/pl/blog/okragle-czy-kwadratowe-okulary-szeroka-twarz",
  },
  "blog.wideFrameProfessionals": {
    en: "/en/blog/wide-frame-glasses-professionals",
    pl: "/pl/blog/okulary-na-szeroka-twarz-dla-profesjonalistow",
  },
  "blog.glassesForWideFacesGuide": {
    en: "/en/blog/glasses-for-wide-faces-guide",
    pl: "/pl/blog/okulary-na-szeroka-twarz-przewodnik",
  },
} as const satisfies Record<string, Partial<Record<Lang, string>>>;

export type RouteKey = keyof typeof ROUTES;

// ---------------------------------------------------------------------------
// Derived tables — generated from ROUTES so they cannot drift.
//
// DEFECT-2 FIX: the previous version hand-maintained EN_ONLY_PATH_PREFIXES
// and PARTIAL_LOCALE_ROUTES. `"/bespoke"` sat in EN_ONLY even though
// ROUTES.bespoke has a real `ja` entry (/ja/bespoke), so
// localePath("ja", "/bespoke") returned "/en/bespoke" and silently
// dropped the Japanese translation. We now derive per-path locale sets
// FROM ROUTES and assert at module load that hand-maintained hints do
// not contradict the registry.
// ---------------------------------------------------------------------------

const stripLang = (url: string): string => {
  // /en, /en/foo → "", "/foo".  /ja/bespoke → "/bespoke".
  const m = url.match(/^\/[a-z]{2}(\/.*)?$/);
  return m ? (m[1] ?? "") : url;
};

/** For each canonical suffix (e.g. "/collection", "/bespoke"), the set of
 *  locales that have a real translated page, plus the per-locale URL. */
const SUFFIX_TO_LOCALES: Map<string, Partial<Record<Lang, string>>> = (() => {
  const m = new Map<string, Partial<Record<Lang, string>>>();
  for (const entry of Object.values(ROUTES)) {
    const enUrl = (entry as Partial<Record<Lang, string>>).en;
    if (!enUrl) continue;
    const suffix = stripLang(enUrl);
    const prev = m.get(suffix) ?? {};
    for (const [lang, url] of Object.entries(entry) as [Lang, string][]) {
      // Only accept a locale's URL when the suffix under its own prefix
      // matches the EN suffix — otherwise it's a landing page with a
      // different slug and belongs to its own cluster, not this suffix.
      if (stripLang(url) === suffix) prev[lang] = url;
    }
    m.set(suffix, prev);
  }
  return m;
})();

/** Path suffixes (after /{lang}) that render 200 in EVERY locale. */
const ALL_LOCALES_PATHS: ReadonlySet<string> = new Set([
  "", // /:lang homepage
  "/vip-join",
  "/thank-you",
  "/thank-you-fb",
  "/payments",
  "/account/callback",
]);

/** Prefixes for paths that have no registry entry AND no per-locale
 *  translation. These are always served under /en. Validated below
 *  against ROUTES so a real translation cannot silently be masked. */
const EN_ONLY_PATH_PREFIXES: readonly string[] = [
  "/the-box",
  "/lp/",
  "/collections/",
  "/compare",
  "/size/",
  "/bridge/",
  "/temple/",
  "/xxl",
  "/hat-size-calculator",
];

// Build-time assertion: no EN-only prefix may collide with a suffix that
// actually has a non-EN translation in ROUTES.
if (typeof console !== "undefined") {
  for (const pref of EN_ONLY_PATH_PREFIXES) {
    for (const [suffix, langs] of SUFFIX_TO_LOCALES) {
      const nonEn = Object.keys(langs).filter((l) => l !== "en");
      if (nonEn.length === 0) continue;
      if (suffix === pref || suffix.startsWith(pref)) {
        console.warn(
          `[routeRegistry] EN_ONLY_PATH_PREFIXES contains "${pref}" but ROUTES has non-EN locales (${nonEn.join(",")}) for suffix "${suffix}". Remove the prefix or the translation.`,
        );
      }
    }
  }
}

/**
 * Return a real, non-redirecting internal href for `path` in `lang`.
 * `path` is the route AFTER the /{lang} prefix (leading slash optional).
 * Unknown paths default to /en to guarantee no 3xx hop.
 */
export function localePath(lang: Lang, path: string): string {
  const p = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;

  // Blog post slugs are locale-specific; leave the caller-supplied locale
  // untouched — the blog-slug-map handles translated variants elsewhere.
  if (p.startsWith("/blog/") && p !== "/blog") return `/${lang}${p}`;

  if (ALL_LOCALES_PATHS.has(p)) return `/${lang}${p}`;

  // Registry-derived lookup: does this suffix have a real translation?
  const langs = SUFFIX_TO_LOCALES.get(p);
  if (langs) {
    return langs[lang] ?? langs.en ?? `/en${p}`;
  }

  for (const pref of EN_ONLY_PATH_PREFIXES) {
    if (p === pref || p.startsWith(pref)) return `/en${p}`;
  }

  return `/en${p}`;
}

/** Locales in which the named RouteKey has a real page. */
export function localesForRoute(key: RouteKey): Lang[] {
  return Object.keys(ROUTES[key]) as Lang[];
}

/** True iff `key` has a real page in `lang`. */
export function hasLocalized(key: RouteKey, lang: Lang): boolean {
  return Boolean((ROUTES[key] as Partial<Record<Lang, string>>)[lang]);
}

/**
 * Real URL for a named RouteKey in `lang`, falling back to /en, then to
 * the locale homepage. Never returns a URL that 3xx's.
 */
export function hrefFor(key: RouteKey, lang: Lang): string {
  const entry = ROUTES[key] as Partial<Record<Lang, string>>;
  return entry[lang] ?? entry.en ?? `/${lang}`;
}

// ---------------------------------------------------------------------------
// Reverse lookup: pathname -> RouteKey[]
//
// DEFECT-1 FIX: the previous Map<string,RouteKey> overwrote earlier
// entries whenever the same URL appeared in multiple ROUTES values
// (five DE landing pages all anchor /en/collection; four bespoke
// landings all anchor /en/bespoke). Only the last entry survived and
// keyForPath("/en/collection") returned a DE landing key, causing the
// emitted hreflang cluster to drop /fr/collection and /nl/collection.
//
// The map now stores EVERY key that references a URL. Cluster
// resolution then picks the correct entry per the rules in
// hreflangAlternates() below.
// ---------------------------------------------------------------------------

const PATH_TO_KEYS: Map<string, RouteKey[]> = (() => {
  const m = new Map<string, RouteKey[]>();
  for (const [key, entry] of Object.entries(ROUTES)) {
    for (const url of Object.values(entry)) {
      if (!url) continue;
      const list = m.get(url) ?? [];
      list.push(key as RouteKey);
      m.set(url, list);
    }
  }
  return m;
})();

// Build-time diagnostic: log every many-to-one cluster so we can see
// which EN anchors are shared. This is expected for /en/collection and
// /en/bespoke; anything unexpected should be reviewed.
if (typeof console !== "undefined") {
  for (const [url, keys] of PATH_TO_KEYS) {
    if (keys.length > 1) {
      console.info(
        `[routeRegistry] Many-to-one anchor: ${url} is referenced by ${keys.length} entries: ${keys.join(", ")}`,
      );
    }
  }
}

/** RouteKey list for a full pathname (empty when pathname is unknown). */
export function keysForPath(pathname: string): RouteKey[] {
  return PATH_TO_KEYS.get(pathname) ?? [];
}

/** Backwards-compatible single-key lookup: returns the "primary" entry
 *  (a non-`landing.*` key when one exists, else the first match). Prefer
 *  keysForPath() in new code; hreflangAlternates() no longer relies on
 *  this. */
export function keyForPath(pathname: string): RouteKey | undefined {
  const keys = keysForPath(pathname);
  if (keys.length === 0) return undefined;
  return keys.find((k) => !String(k).startsWith("landing.")) ?? keys[0];
}

/**
 * hreflang alternates for a pathname, as absolute URLs.
 * Returns `null` when the page has no translation cluster.
 *
 * Resolution rules (see DEFECT-1 spec):
 *   • If `pathname` appears as a NON-EN URL in some entry, use that
 *     entry (that landing is unambiguously "the" translation).
 *   • Otherwise `pathname` is an EN anchor; use the primary
 *     (non-`landing.*`) entry — landing pages that share the anchor do
 *     NOT get merged in, because five different DE landings cannot all
 *     be "the" German version of /en/collection.
 */
export function hreflangAlternates(
  pathname: string,
  siteUrl: string,
): { lang: string; href: string }[] | null {
  const keys = keysForPath(pathname);
  if (keys.length === 0) return null;

  // 1. Non-EN URL match wins.
  const nonEnMatch = keys.find((k) => {
    const entry = ROUTES[k] as Partial<Record<Lang, string>>;
    return Object.entries(entry).some(([l, u]) => l !== "en" && u === pathname);
  });

  // 2. Otherwise treat as EN anchor and prefer the non-landing entry.
  const chosenKey =
    nonEnMatch ??
    keys.find((k) => !String(k).startsWith("landing.")) ??
    keys[0];

  const entry = ROUTES[chosenKey] as Partial<Record<Lang, string>>;
  const langs = Object.keys(entry) as Lang[];
  if (langs.length < 2) return null;

  const list: { lang: string; href: string }[] = langs.map((l) => ({
    lang: l,
    href: `${siteUrl}${entry[l]}`,
  }));
  if (entry.en) list.push({ lang: "x-default", href: `${siteUrl}${entry.en}` });
  return list;
}
