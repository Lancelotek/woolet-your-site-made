#!/usr/bin/env node
/**
 * Sitemap validator.
 *
 * Guarantees:
 *   • the 7 previously-missing URLs are present
 *   • "/" (bare root) is NOT listed — /en is x-default
 *   • no duplicate <loc> entries
 *   • every <loc> is an absolute https://woolet.co URL, no trailing slash
 *     (except the domain root, which is banned anyway), no whitespace,
 *     no query string, no fragment
 *
 * Exits non-zero on any violation so it can gate the build.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SITEMAP = resolve("public/sitemap.xml");
const BASE = "https://woolet.co";

const REQUIRED = [
  "/de/brille-breite-160-mm",
  "/en/blog/best-oversized-sunglasses-big-heads-2026",
  "/en/blog/do-blue-light-glasses-work-wide-face",
  "/en/blog/how-wide-should-glasses-be",
  "/pl/privacy-policy",
  "/pl/process",
  "/pl/return-policy",
];

const FORBIDDEN_LOCS = new Set([
  `${BASE}`,
  `${BASE}/`,
]);

const xml = readFileSync(SITEMAP, "utf8");
const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

const errors = [];
const warnings = [];

// 1. Format checks
const seen = new Map();
for (const loc of locs) {
  if (loc !== loc.trim()) errors.push(`whitespace in <loc>: ${JSON.stringify(loc)}`);
  const raw = loc.trim();
  if (!raw.startsWith(`${BASE}/`) && raw !== BASE) {
    errors.push(`<loc> not under ${BASE}: ${raw}`);
    continue;
  }
  if (FORBIDDEN_LOCS.has(raw)) {
    errors.push(`bare root "/" must not be in sitemap: ${raw}`);
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    errors.push(`invalid URL: ${raw}`);
    continue;
  }
  if (url.search) errors.push(`<loc> has query string: ${raw}`);
  if (url.hash) errors.push(`<loc> has fragment: ${raw}`);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    errors.push(`<loc> ends with trailing slash: ${raw}`);
  }
  if (/[A-Z]/.test(url.pathname)) {
    warnings.push(`<loc> contains uppercase path chars: ${raw}`);
  }
  seen.set(raw, (seen.get(raw) ?? 0) + 1);
}

// 2. Duplicates
for (const [loc, count] of seen) {
  if (count > 1) errors.push(`duplicate <loc> (${count}×): ${loc}`);
}

// 3. Required URLs present
const present = new Set([...seen.keys()].map((u) => u.replace(BASE, "")));
for (const path of REQUIRED) {
  if (!present.has(path)) errors.push(`missing required URL: ${path}`);
}

// Report
console.log(`[audit-sitemap] ${locs.length} <loc> entries, ${seen.size} unique`);
for (const w of warnings) console.warn(`[audit-sitemap] WARN ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`[audit-sitemap] ERROR ${e}`);
  console.error(`[audit-sitemap] FAILED (${errors.length} error${errors.length === 1 ? "" : "s"})`);
  process.exit(1);
}
console.log(`[audit-sitemap] OK — all ${REQUIRED.length} required URLs present, no duplicates, no "/" entry`);
