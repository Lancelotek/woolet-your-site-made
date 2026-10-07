/**
 * Router-level redirects expressed as DATA (indexing fix pack 07.10.2026).
 *
 * Every path here used to be a <Navigate> in App.tsx (or an EXACT entry in
 * src/config/redirects.ts). Client-side redirects are invisible to Google:
 * the host served the noindex SPA fallback with HTTP 200. These entries are
 * now consumed by BOTH:
 *   - the router (resolveLegacyRedirect -> <Redirects />, replace navigation)
 *   - scripts/prerender.mjs (static stub: canonical=target, meta refresh 0,
 *     location.replace, no noindex)
 *
 * Rules: never list a path that is a real page in getAllRoutes()
 * (scripts/audit-routes.mjs fails the build if one sneaks in).
 * Pure data, no imports, so the Node prerender bundle can load it.
 */

const NON_EN = ["pl", "de", "fr", "nl", "ja", "es", "ar", "ko"] as const;

const COLLECTION_SLUGS = [
  "wide-face-glasses", "italian-acetate-sunglasses", "italian-mazzucchelli-acetate",
  "oversized-sunglasses-men", "sunglasses-for-big-heads", "glasses-for-big-heads",
  "extra-wide-glasses", "wide-bridge-glasses", "keyhole-bridge-glasses",
  "blue-light-glasses-for-wide-faces", "extra-large-oversized-eyeglasses",
  "big-glasses-frames", "wide-frame-reading-glasses", "oversized-square-glasses",
  "oversized-round-glasses", "oversized-black-glasses", "thick-frame-glasses",
];
const COMPARE_SLUGS = [
  "fatheadz-alternative", "eyeshells-alternative", "zenni-alternative",
  "warby-parker-alternative", "ray-ban-alternative", "persol-alternative",
];
const REF_SLUGS = [
  "007-black", "007-havana", "007-silver-clear", "009-black", "009-havana",
  "009-silver-clear", "003-black", "bespoke", "the-box",
];
const SIZE_SLUGS = ["145mm", "150mm", "152mm", "155mm", "158mm", "160mm"];
const BRIDGE_SLUGS = ["18mm", "19mm", "20mm", "21mm", "22mm", "24mm"];
const TEMPLE_SLUGS = ["140mm", "145mm", "150mm", "152mm", "155mm"];
const LP_SLUGS = ["kickstarter", "why-glasses-fail", "5-reasons", "wide-bridge-fit-guide"];

/** Explicit one-off redirects (formerly App.tsx <Navigate> + config EXACT). */
const EXPLICIT: Record<string, string> = {
  // Shopify smart-wallet era
  "/products/smart-and-slim-leather-wallet": "/en/products/009",
  "/products/smart-and-slim-travel-wallet-hand-crafted-leather": "/en/products/007",
  "/products/smart-wallet-howl": "/en",
  "/products/woolet-classic-charging-pad-special-offer": "/en",
  "/products/woolet-tracker": "/en",
  "/products/black-leather-cable-microusb-to-usb": "/en",
  "/products/flash-sale-woolet-travel-xl-2-0-black": "/en",
  "/products/smart-anti-theft-black-italian-leather-wallet": "/en",
  "/blogs/news": "/en/blog",
  "/blog/woolet-howl-3-0-gps-manual-how-setup-gps-wallet": "/en",

  // Root-level legacy pages
  "/privacy": "/en/privacy-policy",
  "/privacy-policy": "/en/privacy-policy",
  "/return-policy": "/en/return-policy",
  "/blue-light-glasses-wide-faces": "/en/collections/blue-light-glasses-for-wide-faces",
  "/en/blue-light-glasses-wide-faces": "/en/collections/blue-light-glasses-for-wide-faces",
  "/en/how-to-measure-face-width": "/en/blog/how-to-measure-face-width-for-glasses",
  "/en/blog/glasses-for-wide-faces": "/en/blog/glasses-for-wide-faces-guide",
  "/en/pages/bespoke": "/en/bespoke",

  // EN blog slug renames
  "/en/blog/what-is-italian-acetate": "/en/blog/what-is-italian-acetate-premium-eyewear",
  "/en/blog/round-vs-square": "/en/blog/round-vs-square-glasses-wide-face",
  "/en/blog/why-glasses-dont-fit-155mm": "/en/blog/why-glasses-dont-fit-155mm-problem",
  "/en/blog/wide-frame-professionals": "/en/blog/wide-frame-glasses-professionals",
  "/en/blog/xxl-aviator-sunglasses-for-big-heads": "/en/blog/best-oversized-sunglasses-big-heads-2026",
  "/en/blog/glasses-bigger-than-150mm-where-to-find-them": "/en/blog/best-glasses-for-big-heads-2026",
  "/en/compare/warby-parker": "/en/compare/warby-parker-alternative",
  "/en/collections/oversized-prescription-glasses": "/en/collections/extra-large-oversized-eyeglasses",
  "/en/collections/oversized-blue-light-glasses": "/en/collections/blue-light-glasses-for-wide-faces",

  // PL blog slug renames
  "/pl/blog/okulary-dla-szerokich-twarzy-przewodnik": "/pl/blog/okulary-na-szeroka-twarz-przewodnik",
  "/pl/blog/jak-zmierzyc-szerokosc-twarzy": "/pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow",
  "/pl/blog/how-to-measure-face-width-for-glasses": "/pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow",
  "/pl/blog/czym-jest-wloski-octan": "/pl/blog/czym-jest-wloski-octan-premium-oprawki",
  "/pl/blog/dlaczego-okulary-nie-pasuja-155mm": "/pl/blog/dlaczego-okulary-nie-pasuja-problem-155mm",
  "/pl/blog/okragle-vs-kwadratowe": "/pl/blog/okragle-czy-kwadratowe-okulary-szeroka-twarz",
  "/pl/blog/szerokie-oprawki-dla-profesjonalistow": "/pl/blog/okulary-na-szeroka-twarz-dla-profesjonalistow",
  "/pl/blog/najlepsze-okulary-dla-duzych-glow-2026": "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",
  "/pl/blog/best-glasses-for-big-heads-2026": "/pl/blog/najlepsze-okulary-na-duza-glowe-2026",

  // DE / NL / FR / AR blog slug redirects
  "/de/blog/best-glasses-for-big-heads-2026": "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
  "/de/blog/what-size-sunglasses-for-wide-faces": "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
  "/de/blog/glasses-for-wide-faces-guide": "/en/blog/glasses-for-wide-faces-guide",
  "/nl/blog/best-glasses-for-big-heads-2026": "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  "/nl/blog/what-size-sunglasses-for-wide-faces": "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  "/fr/blog/best-glasses-for-big-heads-2026": "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
  "/fr/blog/what-size-sunglasses-for-wide-faces": "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
  "/fr/blog/beste-brillen-fuer-grosse-koepfe-2026": "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
  "/fr/blog/welche-groesse-sonnenbrille-breites-gesicht": "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
  "/fr/blog/beste-brillen-voor-brede-hoofden-2026": "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
  "/fr/blog/welke-maat-zonnebril-voor-breed-gezicht": "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
  "/ar/blog/best-glasses-for-big-heads-2026": "/en/blog/best-glasses-for-big-heads-2026",

  // Non-existent locale variants Google discovered (GSC 07.10.2026)
  "/ja/blog/glasses-for-wide-faces-guide": "/en/blog/glasses-for-wide-faces-guide",
  "/pl/blog/glasses-for-wide-faces-guide": "/en/blog/glasses-for-wide-faces-guide",
  "/nl/blog/glasses-for-wide-faces-guide": "/en/blog/glasses-for-wide-faces-guide",
  "/ja/blog/are-my-glasses-too-small-for-my-face": "/en/blog/are-my-glasses-too-small-for-my-face",
  "/ja/blog/how-to-measure-face-width-for-glasses": "/en/blog/how-to-measure-face-width-for-glasses",
  "/fr/blog/how-to-measure-face-width-for-glasses": "/en/blog/how-to-measure-face-width-for-glasses",
  "/de/blog/how-to-measure-face-width-for-glasses": "/en/blog/how-to-measure-face-width-for-glasses",
  "/ja/blog/best-glasses-for-wide-faces-for-women": "/en/blog/wide-face-glasses-for-women",
  "/fr/blog/best-glasses-for-wide-faces-for-women": "/en/blog/wide-face-glasses-for-women",
  "/es/blog/glasses-bigger-than-150mm-where-to-find-them": "/en/blog/best-glasses-for-big-heads-2026",
  "/fr/blog/handcrafted-vs-machine-made-glasses": "/en/blog/handcrafted-vs-machine-made-glasses",
  "/ja/xxl-brille-herren": "/en/collections/extra-large-oversized-eyeglasses",
  "/fr/brille-grosse-koepfe": "/en/collections/glasses-for-big-heads",

  // DE specifics
  "/de/collection": "/de/kollektion",
  "/de/xxl": "/de/brillen-fuer-grosse-koepfe",
  "/de/xxl/extra-wide-frames": "/de/brillen-fuer-grosse-koepfe",
  "/de/return-policy": "/de/widerruf",
};

function build(): Record<string, string> {
  const out: Record<string, string> = { ...EXPLICIT };
  const add = (from: string, to: string) => {
    if (from !== to && !(from in out)) out[from] = to;
  };

  for (const l of NON_EN) {
    add(`/${l}/about`, "/en/about");
    add(`/${l}/process`, "/en/process");
    add(`/${l}/the-box`, "/en/the-box");
    add(`/${l}/hat-size-calculator`, "/en/hat-size-calculator");
    add(`/${l}/compare`, "/en/compare");
    add(`/${l}/ref`, "/en/ref");
    add(`/${l}/blog/category/nose-bridge-fit`, "/en/blog/category/nose-bridge-fit");
    add(`/${l}/bespoke/configurator`, "/en/bespoke/configurator");
    add(`/${l}/bespoke/checkout`, "/en/bespoke/checkout");
    add(`/${l}/pages/bespoke`, "/en/bespoke");
    add(`/${l}/fit/bespoke`, "/en/fit/bespoke");
    if (l !== "de") {
      add(`/${l}/xxl`, "/en/collection");
      add(`/${l}/fit/manual`, "/en/fit/manual");
      add(`/${l}/fit/quick`, "/en/fit/quick");
    }
    for (const s of LP_SLUGS) if (!(l === "de" && s === "kickstarter")) add(`/${l}/lp/${s}`, `/en/lp/${s}`);
    if (l !== "fr" && l !== "nl") for (const s of ["007", "009", "bespoke"]) add(`/${l}/products/${s}`, `/en/products/${s}`);
    for (const s of COLLECTION_SLUGS) add(`/${l}/collections/${s}`, `/en/collections/${s}`);
    for (const s of COMPARE_SLUGS) add(`/${l}/compare/${s}`, `/en/compare/${s}`);
    for (const s of REF_SLUGS) add(`/${l}/ref/${s}`, `/en/ref/${s}`);
    if (l !== "ko") for (const s of SIZE_SLUGS) add(`/${l}/size/${s}`, `/en/size/${s}`);
    for (const s of BRIDGE_SLUGS) add(`/${l}/bridge/${s}`, `/en/bridge/${s}`);
    for (const s of TEMPLE_SLUGS) add(`/${l}/temple/${s}`, `/en/temple/${s}`);
  }

  // English-content pages under a foreign prefix -> the English page.
  for (const l of ["pl", "fr", "nl", "es", "ar", "ko"]) add(`/${l}/bespoke`, "/en/bespoke");
  for (const l of ["pl", "es", "ar", "ja", "ko"]) add(`/${l}/collection`, "/en/collection");
  for (const l of ["es", "ar", "ja", "ko"]) add(`/${l}/blog`, "/en/blog");
  for (const l of ["de", "fr", "nl", "ja", "es", "ar", "ko"]) {
    add(`/${l}/privacy-policy`, "/en/privacy-policy");
    add(`/${l}/return-policy`, "/en/return-policy");
  }
  // /:lang/fit/scan -> /:lang/fit
  for (const l of ["en", ...NON_EN]) add(`/${l}/fit/scan`, `/${l}/fit`);

  return out;
}

export const ROUTE_REDIRECTS: Record<string, string> = build();
