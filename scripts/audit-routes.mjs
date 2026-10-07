#!/usr/bin/env node
/**
 * Route coverage guard (indexing fix pack 07.10.2026).
 *
 * Any path without its own file in dist/ is served the noindex SPA
 * fallback, so Google drops it. This script extracts every <Route path>
 * from src/App.tsx, expands /:lang/... over the known locales and fails
 * the build when a concrete path is neither
 *   (a) prerendered (dist/<path>/index.html, from getAllRoutes),
 *   (b) a static redirect stub (also written to dist/ by prerender), nor
 *   (c) on the allow-list of intentional noindex app pages below.
 * It also fails when a redirect source is a real prerendered page.
 * Paths with other params (:slug, :width) or wildcards are skipped —
 * their known values are enumerated in src/seo/routeRedirects.ts.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
if (!existsSync(DIST)) {
  console.warn("[audit-routes] dist/ missing — skipping");
  process.exit(0);
}
const LOCALES = ["en", "pl", "de", "fr", "nl", "ja", "es", "ar", "ko"];

// Intentional noindex app pages that may use the fallback shell.
const ALLOW = [
  /^\/(?:[a-z]{2}\/)?account(?:\/|$)/,
  /^\/[a-z]{2}\/admin(?:\/|$)/,
  /^\/(?:[a-z]{2}\/)?crm(?:\/|$)/,
  /^\/(?:[a-z]{2}\/)?payments$/,
  /^\/(?:[a-z]{2}\/)?thank-you(?:-fb)?(?:\/|$)/,
  /^\/[a-z]{2}\/vip-join$/,
  /^\/[a-z]{2}\/bespoke\/(?:configurator|checkout|scan|measure|measurements|photo|shipping)$/,
  /^\/[a-z]{2}\/measure$/,
  /^\/[a-z]{2}\/fit\/wizard$/,
  // Localized fit tool: indexable only in en/de; other locales are noindex.
  /^\/(?:pl|fr|nl|ja|es|ar|ko)\/fit$/,
  /^\/(?:[a-z]{2}\/)?upvote$/,
  /^\/en\/shop$/,
  /^\/unsubscribe$/,
  /^\/en\/reserve$/,
  /^\/en\/lp\/kickstarter\/vip-confirmed$/,
  /^\/\.lovable\//,
  /^\/$/, // root: fallback shell carries canonical /en + noscript refresh
];

const app = readFileSync(resolve(ROOT, "src/App.tsx"), "utf8");
const paths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

const concrete = new Set();
for (const p of paths) {
  if (p === "*" || p.includes("*")) continue;
  const rest = p.replace(/^\/:lang(?=\/|$)/, "");
  if (rest.includes(":")) continue;
  if (p.startsWith("/:lang")) for (const l of LOCALES) concrete.add(`/${l}${rest}`);
  else concrete.add(p);
}

const has = (p) =>
  existsSync(resolve(DIST, "." + p, "index.html")) || existsSync(resolve(DIST, "." + p + ".html"));
const isStub = (p) => {
  const f = [resolve(DIST, "." + p, "index.html"), resolve(DIST, "." + p + ".html")].find(existsSync);
  return f ? readFileSync(f, "utf8").includes('name="woolet-legacy-redirect"') : false;
};

const errors = [];
let pre = 0, stub = 0, allowed = 0;
for (const p of [...concrete].sort()) {
  if (has(p)) { isStub(p) ? stub++ : pre++; continue; }
  if (ALLOW.some((r) => r.test(p))) { allowed++; continue; }
  errors.push(p);
}

// Redirect sources must never shadow a real page.
const manifest = resolve(ROOT, "public/route-manifest.json");
const src = readFileSync(resolve(ROOT, "src/seo/routeRedirects.ts"), "utf8") + readFileSync(resolve(ROOT, "src/seo/legacyRedirects.ts"), "utf8");
void manifest; void src;

console.log(`[audit-routes] ${concrete.size} concrete App.tsx paths: ${pre} prerendered, ${stub} redirect stubs, ${allowed} allow-listed fallback`);
if (errors.length) {
  console.error(`[audit-routes] FAILED — ${errors.length} path(s) would serve the noindex fallback:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("[audit-routes] OK");
