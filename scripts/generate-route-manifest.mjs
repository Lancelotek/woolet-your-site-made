#!/usr/bin/env node
/**
 * public/route-manifest.json generator.
 *
 * The Cloudflare Worker in front of Woolet uses this file to decide
 * whether to serve the SPA (HTTP 200) or return a real HTTP 404.
 * Anything absent from `allRoutes` is treated as a 404 by the edge,
 * so an omission here takes a live page offline.
 *
 * Derived from the SAME SSR bundle the sitemap and prerender scripts
 * use (dist-seo/metadata.js). Do NOT hand-maintain — regenerate via
 * `npm run build` or `node scripts/generate-route-manifest.mjs`.
 *
 * Output shape:
 *   {
 *     "generatedAt":   "2026-07-28T…Z",
 *     "totalRoutes":   147,
 *     "blogSlugs":     { "en": [...], "pl": [...], ... },
 *     "allRoutes":     [ "/en", "/en/about", ... ]
 *   }
 *
 * Every entry in `allRoutes` renders real content and returns 200.
 * Conversion / interactive / noindex routes are excluded (matches
 * the sitemap exclusion policy in scripts/generate-sitemap.mjs) so
 * the Worker never advertises them via HTTP 200 to unrelated crawlers.
 * The one exception: routes that ARE valid destinations but should
 * not appear in the sitemap (e.g. `/thank-you`, `/en/account/*`,
 * `/en/upvote`, `/en/bespoke/checkout`) are still real 200s in-app —
 * we DO include them in `allRoutes` so the Worker doesn't 404 real
 * links; the `noindex` meta on those pages keeps them out of search.
 */

import { spawn } from "node:child_process";
import { writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SSR_OUT = resolve(ROOT, "dist-seo");
const MANIFEST_OUT = resolve(ROOT, "public/route-manifest.json");

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))));
    p.on("error", rej);
  });
}

async function ensureBundle() {
  const entry = resolve(SSR_OUT, "metadata.js");
  if (existsSync(entry)) return entry;
  console.log("[route-manifest] building metadata SSR bundle…");
  await rm(SSR_OUT, { recursive: true, force: true });
  await run("npx", [
    "vite", "build", "--ssr", "src/seo/metadata.ts",
    "--outDir", "dist-seo", "--logLevel", "warn",
  ]);
  return entry;
}

// ------------------------------------------------------------------
// Extra routes the app serves at 200 but the sitemap deliberately
// omits. The Worker must NOT 404 these — they are reachable via
// email links, ad landing URLs, FB Lead Ads, OAuth callback, etc.
// Keep in sync with:
//   • src/App.tsx  (every literal <Route path="…"> element)
//   • EXCLUDED_PATH_PATTERNS in scripts/generate-sitemap.mjs
// ------------------------------------------------------------------

const EXTRA_APP_ROUTES = [
  // Conversion pages (noindex, still 200)
  "/thank-you",
  "/thank-you-fb",
  "/en/thank-you",
  "/en/thank-you-fb",
  "/pl/thank-you",
  "/pl/thank-you-fb",
  "/de/thank-you",
  "/de/thank-you-fb",
  "/fr/thank-you",
  "/fr/thank-you-fb",
  "/nl/thank-you",
  "/nl/thank-you-fb",
  "/ja/thank-you",
  "/ja/thank-you-fb",
  "/ar/thank-you",
  "/ar/thank-you-fb",
  "/es/thank-you",
  "/es/thank-you-fb",

  // Payments (noindex, still 200)
  "/en/payments",
  "/pl/payments",
  "/de/payments",
  "/fr/payments",
  "/nl/payments",
  "/ja/payments",
  "/ar/payments",
  "/es/payments",

  // VIP join (noindex)
  "/en/vip-join",
  "/pl/vip-join",
  "/de/vip-join",
  "/fr/vip-join",
  "/nl/vip-join",
  "/ja/vip-join",
  "/ar/vip-join",
  "/es/vip-join",

  // Hidden badge host (noindex, third-party embed target)
  "/upvote",
  "/en/upvote",

  // Hidden shop landing
  "/en/shop",

  // Bespoke funnel (interactive tools, noindex)
  "/en/bespoke/configurator",
  "/en/bespoke/scan",
  "/en/bespoke/checkout",
  "/en/bespoke/measurements",
  "/pl/bespoke/scan",
  "/de/bespoke/scan",
  "/fr/bespoke/scan",
  "/nl/bespoke/scan",
  "/ja/bespoke/scan",
  "/ar/bespoke/scan",
  "/es/bespoke/scan",
  "/pl/bespoke/measurements",
  "/de/bespoke/measurements",
  "/fr/bespoke/measurements",
  "/nl/bespoke/measurements",
  "/ja/bespoke/measurements",
  "/ar/bespoke/measurements",
  "/es/bespoke/measurements",

  // Account (auth-gated, noindex)
  "/en/account",
  "/en/account/sign-in",
  "/en/account/callback",
  "/pl/account",
  "/pl/account/sign-in",
  "/pl/account/callback",
  "/de/account",
  "/de/account/sign-in",
  "/de/account/callback",
  "/fr/account",
  "/fr/account/sign-in",
  "/fr/account/callback",
  "/nl/account",
  "/nl/account/sign-in",
  "/nl/account/callback",
  "/ja/account",
  "/ja/account/sign-in",
  "/ja/account/callback",
  "/ar/account",
  "/ar/account/sign-in",
  "/ar/account/callback",
  "/es/account",
  "/es/account/sign-in",
  "/es/account/callback",

  // OAuth consent (system route)
  "/.lovable/oauth/consent",

  // Unsubscribe (email link target)
  "/unsubscribe",

  // Fit sub-routes (some emit real content per lang via /:lang/fit)
  "/en/fit/wizard",
  "/pl/fit/wizard",
  "/de/fit/wizard",
  "/fr/fit/wizard",
  "/nl/fit/wizard",
  "/ja/fit/wizard",
  "/ar/fit/wizard",
  "/es/fit/wizard",
  "/en/fit/scan",
  "/pl/fit/scan",
  "/de/fit/scan",
  "/fr/fit/scan",
  "/nl/fit/scan",
  "/ja/fit/scan",
  "/ar/fit/scan",
  "/es/fit/scan",

  // /:lang variants of localised pages that redirect to /en but still
  // serve HTTP 200 through the SPA shell
  "/pl/about",
  "/de/about",
  "/fr/about",
  "/nl/about",
  "/ja/about",
  "/ar/about",
  "/es/about",
  "/pl/the-box",
  "/de/the-box",
  "/fr/the-box",
  "/nl/the-box",
  "/ja/the-box",
  "/ar/the-box",
  "/es/the-box",

  // Hat size calculator (all locales via /:lang route)
  "/pl/hat-size-calculator",
  "/de/hat-size-calculator",
  "/fr/hat-size-calculator",
  "/nl/hat-size-calculator",
  "/ja/hat-size-calculator",
  "/ar/hat-size-calculator",
  "/es/hat-size-calculator",

  // Bespoke fallback per locale (renders bespoke or NotFound based on lang)
  "/pl/bespoke",
  "/de/bespoke",
  "/fr/bespoke",
  "/nl/bespoke",
  "/ja/bespoke",
  "/ar/bespoke",
  "/es/bespoke",

  // Legacy Shopify path-based redirects — Worker must let these
  // through as 200 so React Router can issue the client-side 301.
  "/products/smart-and-slim-leather-wallet",
  "/products/smart-and-slim-travel-wallet-hand-crafted-leather",
  "/products/smart-wallet-howl",
  "/products/woolet-classic-charging-pad-special-offer",
  "/products/woolet-tracker",
  "/products/black-leather-cable-microusb-to-usb",
  "/products/flash-sale-woolet-travel-xl-2-0-black",
  "/products/smart-anti-theft-black-italian-leather-wallet",
  "/blogs/news",
  "/blog/woolet-howl-3-0-gps-manual-how-setup-gps-wallet",

  // Legacy policy paths (unprefixed → redirect to /en/…)
  "/privacy-policy",
  "/return-policy",
  "/privacy",
  "/en/how-to-measure-face-width",
  "/en/blog/glasses-for-wide-faces",
];

// ------------------------------------------------------------------

async function main() {
  const entry = await ensureBundle();
  const mod = await import(pathToFileURL(entry).href);
  const { getAllRoutes } = mod;
  if (!getAllRoutes) {
    throw new Error("metadata bundle missing getAllRoutes export");
  }

  // Union of prerendered / indexable routes and app-serves-200 extras.
  const all = new Set([...getAllRoutes(), ...EXTRA_APP_ROUTES]);
  const allRoutes = [...all].sort((a, b) => a.localeCompare(b));

  // Group blog post slugs by locale from the same source.
  const blogSlugs = {};
  const BLOG_RE = /^\/([a-z]{2})\/blog\/([^/]+)$/;
  for (const route of allRoutes) {
    const m = BLOG_RE.exec(route);
    if (!m) continue;
    const [, lang, slug] = m;
    // Exclude the /blog index itself (already handled) and category hubs.
    if (slug === "category") continue;
    (blogSlugs[lang] ??= []).push(slug);
  }
  for (const lang of Object.keys(blogSlugs)) {
    blogSlugs[lang] = [...new Set(blogSlugs[lang])].sort();
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalRoutes: allRoutes.length,
    blogSlugs,
    allRoutes,
  };

  await writeFile(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log(
    `[route-manifest] wrote ${allRoutes.length} routes ` +
      `(${Object.entries(blogSlugs)
        .map(([l, s]) => `${l}=${s.length}`)
        .join(", ")} blog posts)`,
  );
}

main().catch((err) => {
  console.error("[route-manifest] FAILED —", err);
  process.exit(1);
});
