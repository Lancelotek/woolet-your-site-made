#!/usr/bin/env node
/**
 * Sitemap validator + drift guard.
 *
 * Since `scripts/generate-sitemap.mjs` derives `public/sitemap.xml`
 * from the registry, this script re-runs the same derivation and
 * asserts:
 *
 *   • sitemap URL set === generator URL set
 *       (no hand-edits, no stale entries, no missing routes)
 *   • per-URL xhtml:link alternates === hreflangAlternates() output
 *       (sitemap alternates must never drift from the emitted <head>)
 *   • no duplicate <loc>
 *   • no bare "/" root (canonical homepage is /en)
 *   • no <loc> with query string, fragment, or trailing slash
 *   • every prerendered route not on the explicit exclusion list is
 *     represented in the sitemap
 *
 * Any mismatch exits non-zero and fails the build.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITEMAP = resolve(ROOT, "public/sitemap.xml");
const SSR_OUT = resolve(ROOT, "dist-seo");
const BASE = "https://woolet.co";

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
    p.on("error", rej);
  });
}

async function loadModule() {
  const entry = resolve(SSR_OUT, "metadata.js");
  if (!existsSync(entry)) {
    await rm(SSR_OUT, { recursive: true, force: true });
    await run("npx", [
      "vite", "build", "--ssr", "src/seo/metadata.ts",
      "--outDir", "dist-seo", "--logLevel", "warn",
    ]);
  }
  return import(pathToFileURL(entry).href);
}

// Same exclusion policy as the generator — keep in sync.
const EXCLUDED_PATH_PATTERNS = [
  /^\/(?:[a-z]{2}\/)?thank-you(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?thank-you-fb(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?vip-join(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?payments(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?upvote(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?account(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?crm(?:$|\/)/,
  /^\/(?:[a-z]{2}\/)?bespoke\/(?:configurator|checkout|scan|measurements)(?:$|\/)/,
];
const isExcludedPath = (p) => EXCLUDED_PATH_PATTERNS.some((r) => r.test(p));
const emitsNoindex = (m) => typeof m?.robots === "string" && /noindex/i.test(m.robots);

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------
// 1. Parse sitemap: build { loc -> [{lang, href}] } from <url> blocks.
// ---------------------------------------------------------------------
const xml = readFileSync(SITEMAP, "utf8");
const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
const sitemap = new Map(); // loc -> alternates[]
const locOrder = [];
for (const block of urlBlocks) {
  const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
  if (!locMatch) {
    errors.push(`<url> block without <loc>`);
    continue;
  }
  const loc = locMatch[1].trim();
  const alts = [...block.matchAll(
    /<xhtml:link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g,
  )].map(([, lang, href]) => ({ lang, href }));
  if (sitemap.has(loc)) errors.push(`duplicate <loc>: ${loc}`);
  sitemap.set(loc, alts);
  locOrder.push(loc);
}

// ---------------------------------------------------------------------
// 2. URL format checks
// ---------------------------------------------------------------------
for (const loc of sitemap.keys()) {
  if (!loc.startsWith(`${BASE}/`) && loc !== BASE) {
    errors.push(`<loc> not under ${BASE}: ${loc}`);
    continue;
  }
  if (loc === BASE || loc === `${BASE}/`) errors.push(`bare root "/" must not be in sitemap: ${loc}`);
  let url;
  try { url = new URL(loc); } catch { errors.push(`invalid URL: ${loc}`); continue; }
  if (url.search) errors.push(`<loc> has query string: ${loc}`);
  if (url.hash) errors.push(`<loc> has fragment: ${loc}`);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    errors.push(`<loc> ends with trailing slash: ${loc}`);
  }
  if (/[A-Z]/.test(url.pathname)) warnings.push(`<loc> contains uppercase: ${loc}`);
}

// ---------------------------------------------------------------------
// 3. Drift check: sitemap set === registry-derived set
//                sitemap alternates === hreflangAlternates()
// ---------------------------------------------------------------------
const mod = await loadModule();
const { getAllRoutes, getMetadata, hreflangAlternates } = mod;

const expected = new Map(); // loc -> alternates[]
for (const route of getAllRoutes()) {
  if (isExcludedPath(route)) continue;
  let meta;
  try { meta = getMetadata(route); } catch { continue; }
  if (emitsNoindex(meta)) continue;
  const loc = `${BASE}${route}`;
  if (expected.has(loc)) continue; // getAllRoutes has intentional duplicates
  expected.set(loc, hreflangAlternates(route, BASE) ?? []);
}

// 3a. missing from sitemap
for (const loc of expected.keys()) {
  if (!sitemap.has(loc)) errors.push(`missing from sitemap: ${loc}`);
}
// 3b. surplus in sitemap
for (const loc of sitemap.keys()) {
  if (!expected.has(loc)) errors.push(`sitemap has URL not in registry (excluded / noindex / stale): ${loc}`);
}
// 3c. alternate drift
const eqAlts = (a, b) => {
  if (a.length !== b.length) return false;
  const key = (x) => `${x.lang}|${x.href}`;
  const A = new Set(a.map(key));
  return b.every((x) => A.has(key(x)));
};
for (const [loc, exp] of expected) {
  const got = sitemap.get(loc);
  if (!got) continue;
  if (!eqAlts(got, exp)) {
    errors.push(
      `hreflang drift at ${loc}\n  sitemap:  ${JSON.stringify(got)}\n  expected: ${JSON.stringify(exp)}`,
    );
  }
}

// ---------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------
console.log(`[audit-sitemap] ${sitemap.size} URLs in sitemap`);
console.log(`[audit-sitemap] ${expected.size} URLs expected from registry`);
for (const w of warnings) console.warn(`[audit-sitemap] WARN ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`[audit-sitemap] ERROR ${e}`);
  console.error(`[audit-sitemap] FAILED (${errors.length} error${errors.length === 1 ? "" : "s"})`);
  process.exit(1);
}
console.log(`[audit-sitemap] OK — sitemap and registry are in sync, no hreflang drift`);
