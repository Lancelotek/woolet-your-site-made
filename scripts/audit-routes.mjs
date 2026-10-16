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
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
if (!existsSync(DIST)) {
  console.warn("[audit-routes] dist/ missing — skipping");
  process.exit(0);
}
const LOCALES = ["en", "pl", "de", "fr", "nl", "ja", "es", "ar", "ko"];

// Only deliberate NotFound routes and the bare-root redirect may use the shell.
// Being noindex is NOT an exemption from having a real page title.
const ALLOW = [
  /^\/(?:[a-z]{2}\/)?crm(?:\/|$)/,
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
  if (has(p)) {
    if (isStub(p)) { stub++; continue; }
    const f = [resolve(DIST, "." + p, "index.html"), resolve(DIST, "." + p + ".html")].find(existsSync);
    const html = f ? readFileSync(f, "utf8") : "";
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    if (!title || /Page not found|Lovable App/i.test(title) || !/<meta\b[^>]*name="description"[^>]*content="[^"]+"/i.test(html)) {
      errors.push(`${p}: missing real page title/description`);
    }
    pre++;
    continue;
  }
  if (ALLOW.some((r) => r.test(p))) { allowed++; continue; }
  errors.push(p);
}

// Redirect-stub guard (15.10.2026): every stub must open with meta refresh,
// canonical and robots "noindex, follow", and must not ship copied content.
const bad = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const f = resolve(dir, name);
    const st = statSync(f);
    if (st.isDirectory()) { walk(f); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(f, "utf8");
    if (!html.includes('name="woolet-legacy-redirect"')) continue;
    const head = html.split(/<head>/i)[1] ?? "";
    const ok =
      /^\s*<meta http-equiv="refresh" content="0; url=https:\/\/[^"]+">\s*<link rel="canonical" href="https:\/\/[^"]+">\s*<meta name="robots" content="noindex, follow">/.test(head) &&
      st.size < 2048;
    if (!ok) bad.push(`${f.slice(DIST.length)} (${st.size} B)`);
  }
};
walk(DIST);
if (bad.length) errors.push(...bad.map((x) => `malformed redirect stub: ${x}`));

console.log(`[audit-routes] ${concrete.size} concrete App.tsx paths: ${pre} prerendered, ${stub} redirect stubs, ${allowed} allow-listed fallback`);
if (errors.length) {
  console.error(`[audit-routes] FAILED — ${errors.length} path(s) failed (noindex fallback or thin stub):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("[audit-routes] OK");
