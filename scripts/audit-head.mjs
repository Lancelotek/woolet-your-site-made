#!/usr/bin/env node
/**
 * Lightweight pre-release audit for prerendered <head>.
 *
 * Scans every dist/**\/index.html produced by `vite build` +
 * scripts/prerender.mjs and flags:
 *
 *   - duplicate <title>
 *   - duplicate <meta name="description">
 *   - duplicate <link rel="canonical">
 *   - duplicate og:title / og:description / og:url / twitter:title / twitter:description
 *   - prerendered SEO tags missing the data-seo="prerender" stamp
 *     (breaks the runtime dedup in src/lib/strip-prerender-seo.ts)
 *   - default Lovable placeholders shipping to production
 *   - canonical / og:url that don't self-reference the route
 *
 * Exits non-zero when any critical issue is found so CI/`npm run build`
 * blocks the release. Run manually with `node scripts/audit-head.mjs`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const SITE_ORIGIN = "https://woolet.co";

if (!existsSync(DIST)) {
  console.error("[audit-head] dist/ not found — run `vite build` first.");
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function count(html, re) {
  return (html.match(re) || []).length;
}

function firstAttr(html, tagRe, attr) {
  const m = html.match(tagRe);
  if (!m) return null;
  const a = new RegExp(`${attr}=["']([^"']+)["']`, "i").exec(m[0]);
  return a ? a[1] : null;
}

function routeFromPath(file) {
  const rel = "/" + relative(DIST, file).replace(/\\/g, "/");
  // dist/en/about/index.html -> /en/about ; dist/en/about.html -> /en/about
  return rel.replace(/\/index\.html$/, "").replace(/\.html$/, "") || "/";
}

const issues = [];
const warnings = [];

// Cross-file indexes — populated in the per-file loop below.
const titleIndex = new Map(); // title -> [route]
const descIndex = new Map(); // description -> [route]
const homeCopyByLang = new Map(); // lang -> { title, description }
const routeMetaByFile = new Map(); // file -> { route, lang, title, description }

/**
 * Genuine cross-locale twins: routes that legitimately share a title or a
 * description with another route (same copy served under two paths).
 * Anything NOT listed here must be unique.
 */
const DUPLICATE_ALLOW_LIST = [
  // Locale root aliases of the same page.
  ["/en", "/"],
];

const isAllowedDuplicate = (routes) =>
  DUPLICATE_ALLOW_LIST.some((group) => routes.every((r) => group.includes(r)));


function add(list, file, msg) {
  list.push(`${relative(ROOT, file)}: ${msg}`);
}

const files = await walk(DIST);
console.log(`[audit-head] scanning ${files.length} html file(s)…`);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const route = routeFromPath(file);

  // Cross-file index -----------------------------------------------------
  {
    const t = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
    const d = firstAttr(
      html,
      /<meta\s+[^>]*name=["']description["'][^>]*>/i,
      "content",
    );
    const lang = /^\/([a-z]{2})(?:\/|$)/.exec(route)?.[1] ?? "en";
    routeMetaByFile.set(file, { route, lang, title: t, description: d });
    if (route === `/${lang}` || route === "/") {
      homeCopyByLang.set(lang, { title: t, description: d });
    }
    if (t) titleIndex.set(t, [...(titleIndex.get(t) ?? []), route]);
    if (d) descIndex.set(d, [...(descIndex.get(d) ?? []), route]);
  }

  // Duplicates ---------------------------------------------------------
  const titleCount = count(html, /<title[\s>]/gi);
  if (titleCount > 1) add(issues, file, `${titleCount} <title> tags`);

  const descCount = count(html, /<meta\s+[^>]*name=["']description["']/gi);
  if (descCount > 1) add(issues, file, `${descCount} meta description tags`);

  const canonCount = count(html, /<link\s+[^>]*rel=["']canonical["']/gi);
  if (canonCount > 1) add(issues, file, `${canonCount} canonical tags`);

  for (const prop of ["og:title", "og:description", "og:url", "og:type"]) {
    const n = count(html, new RegExp(`<meta\\s+[^>]*property=["']${prop}["']`, "gi"));
    if (n > 1) add(issues, file, `${n} ${prop} tags`);
  }
  for (const name of ["twitter:title", "twitter:description", "twitter:card"]) {
    const n = count(html, new RegExp(`<meta\\s+[^>]*name=["']${name}["']`, "gi"));
    if (n > 1) add(issues, file, `${n} ${name} tags`);
  }

  // Prerender stamp ----------------------------------------------------
  // Any SEO tag inside <head> that isn't stamped will survive hydration
  // and duplicate whatever Helmet renders on the client.
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : "";
  const seoTagRe =
    /<(title|link|meta|script)\b[^>]*(?:rel=["']canonical["']|rel=["']alternate["'][^>]*hreflang|name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["']|type=["']application\/ld\+json["'])[^>]*>|<title>[\s\S]*?<\/title>/gi;
  const seoTags = head.match(seoTagRe) || [];
  for (const tag of seoTags) {
    if (!/data-seo=["']prerender["']/i.test(tag)) {
      add(
        issues,
        file,
        `SEO tag missing data-seo="prerender" stamp → ${tag.slice(0, 90)}${tag.length > 90 ? "…" : ""}`,
      );
      break; // one report per file is enough
    }
  }

  // Placeholder defaults ----------------------------------------------
  if (/<title>\s*Lovable (?:App|Generated Project)\s*<\/title>/i.test(html)) {
    add(issues, file, `default Lovable <title> still present`);
  }
  if (/content=["']Lovable Generated Project["']/i.test(html)) {
    add(issues, file, `default Lovable description still present`);
  }

  // Self-reference -----------------------------------------------------
  if (route !== "/") {
    const canonical = firstAttr(
      html,
      /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
      "href",
    );
    const ogUrl = firstAttr(
      html,
      /<meta\s+[^>]*property=["']og:url["'][^>]*>/i,
      "content",
    );
    const expected = `${SITE_ORIGIN}${route}`;
    if (canonical && canonical !== expected) {
      add(warnings, file, `canonical ${canonical} != ${expected}`);
    }
    if (ogUrl && ogUrl !== expected) {
      add(warnings, file, `og:url ${ogUrl} != ${expected}`);
    }
  }
}

// -------------------------------------------------------------------------
// Cross-file pass — the guard that catches routes silently shipping the
// homepage's <title>/<meta description> (the metadata.ts fallback), and any
// title/description shared by more than one route.
// -------------------------------------------------------------------------
for (const [file, meta] of routeMetaByFile) {
  const home = homeCopyByLang.get(meta.lang);
  if (!home) continue;
  const isHome = meta.route === `/${meta.lang}` || meta.route === "/";
  if (isHome) continue;
  if (meta.title && home.title && meta.title === home.title) {
    add(issues, file, `ships homeCopy[${meta.lang}] <title> — missing getMetadata() branch`);
  }
  if (meta.description && home.description && meta.description === home.description) {
    add(
      issues,
      file,
      `ships homeCopy[${meta.lang}] meta description — missing getMetadata() branch`,
    );
  }
}

for (const [title, routes] of titleIndex) {
  const uniq = [...new Set(routes)];
  if (uniq.length > 1 && !isAllowedDuplicate(uniq)) {
    issues.push(`duplicate <title> across ${uniq.length} routes (${uniq.join(", ")}): ${title}`);
  }
}
for (const [desc, routes] of descIndex) {
  const uniq = [...new Set(routes)];
  if (uniq.length > 1 && !isAllowedDuplicate(uniq)) {
    issues.push(
      `duplicate meta description across ${uniq.length} routes (${uniq.join(", ")}): ${desc.slice(0, 80)}…`,
    );
  }
}

function print(label, list) {
  if (!list.length) return;
  console.log(`\n${label} (${list.length}):`);
  for (const line of list.slice(0, 50)) console.log("  - " + line);
  if (list.length > 50) console.log(`  … +${list.length - 50} more`);
}

print("WARNINGS", warnings);
print("ISSUES", issues);

if (issues.length) {
  console.error(`\n[audit-head] FAILED — ${issues.length} issue(s).`);
  process.exit(1);
}
console.log(
  `\n[audit-head] OK — ${files.length} files, 0 issues, ${warnings.length} warning(s).`,
);
