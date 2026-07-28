#!/usr/bin/env node
/**
 * public/sitemap.xml generator.
 *
 * The sitemap USED to be hand-edited, which caused three classes of
 * drift the audit kept catching:
 *   1. /de/* entries missed xhtml:link alternates
 *   2. seven prerendered routes were absent entirely
 *   3. conversion pages (/thank-you*, /vip-join, /payments) were listed
 *      even though they are noindex
 *
 * The sitemap is now derived at build time from the exact same source
 * as the prerendered <head>:
 *   • route list           -> src/seo/metadata.ts :: getAllRoutes()
 *   • per-route metadata   -> src/seo/metadata.ts :: getMetadata()
 *   • hreflang cluster     -> src/i18n/routeRegistry.ts :: hreflangAlternates()
 *
 * If someone adds a route without wiring it through the registry, the
 * audit script (scripts/audit-sitemap.mjs) fails the build.
 *
 * Emits <loc> only, plus xhtml:link alternates when the route belongs
 * to a translation cluster. No <priority> / <changefreq> (Google
 * ignores both). No <lastmod> (we cannot derive a real page-specific
 * content-change date at build time; a build-timestamp stamped on
 * every URL is worse than nothing).
 */

import { spawn } from "node:child_process";
import { writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SSR_OUT = resolve(ROOT, "dist-seo");
const SITEMAP_OUT = resolve(ROOT, "public/sitemap.xml");
const SITE_URL = "https://woolet.co";

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))));
    p.on("error", rej);
  });
}

async function ensureBundle() {
  const entry = resolve(SSR_OUT, "metadata.js");
  if (existsSync(entry)) return entry;
  console.log("[generate-sitemap] building metadata SSR bundle…");
  await rm(SSR_OUT, { recursive: true, force: true });
  await run("npx", [
    "vite", "build", "--ssr", "src/seo/metadata.ts",
    "--outDir", "dist-seo", "--logLevel", "warn",
  ]);
  return entry;
}

// -----------------------------------------------------------------------
// Exclusion policy — mirrors the request in the "sitemap and robots"
// task. The sitemap must NOT advertise conversion pages, interactive
// tools, or any route that emits <meta name="robots" content="noindex">.
// -----------------------------------------------------------------------

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

const emitsNoindex = (meta) =>
  typeof meta?.robots === "string" && /noindex/i.test(meta.robots);

// -----------------------------------------------------------------------

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlBlock({ loc, alternates }) {
  const lines = [`  <url>`, `    <loc>${xmlEscape(loc)}</loc>`];
  for (const { lang, href } of alternates ?? []) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}"/>`,
    );
  }
  lines.push(`  </url>`);
  return lines.join("\n");
}

async function main() {
  const entry = await ensureBundle();
  const mod = await import(pathToFileURL(entry).href);
  const { getAllRoutes, getMetadata } = mod;

  // Import the registry the same way — it's transitively bundled with
  // metadata.ts, so a second SSR build isn't needed; re-export it from
  // metadata.ts is not required either because hreflangAlternates is
  // already used inside renderHeadHtml(). We recompute here for the
  // sitemap so both surfaces share ONE truth.
  const { hreflangAlternates } = await import(
    pathToFileURL(resolve(SSR_OUT, "metadata.js")).href
  ).then(async () => {
    // The registry is not re-exported by metadata.ts. Build a second
    // SSR bundle for the registry so we can consume it here.
    const REG_ENTRY = resolve(SSR_OUT, "routeRegistry.js");
    if (!existsSync(REG_ENTRY)) {
      await run("npx", [
        "vite", "build", "--ssr", "src/i18n/routeRegistry.ts",
        "--outDir", "dist-seo", "--logLevel", "warn",
      ]);
    }
    return import(pathToFileURL(REG_ENTRY).href);
  });

  const routes = getAllRoutes();
  const kept = [];
  const dropped = [];

  for (const route of routes) {
    if (isExcludedPath(route)) {
      dropped.push({ route, reason: "excluded pattern (conversion/interactive)" });
      continue;
    }
    let meta;
    try {
      meta = getMetadata(route);
    } catch (err) {
      dropped.push({ route, reason: `getMetadata threw: ${err.message}` });
      continue;
    }
    if (emitsNoindex(meta)) {
      dropped.push({ route, reason: `noindex in <head> (${meta.robots})` });
      continue;
    }
    const alternates = hreflangAlternates(route, SITE_URL);
    kept.push({
      loc: `${SITE_URL}${route}`,
      alternates: alternates ?? [],
    });
  }

  // De-dupe by <loc> (STATIC_ROUTES currently has a couple of intentional
  // duplicates like /en/fit and /fr; a sitemap URL must appear once).
  const seen = new Set();
  const unique = [];
  for (const entry of kept) {
    if (seen.has(entry.loc)) continue;
    seen.add(entry.loc);
    unique.push(entry);
  }

  // Deterministic ordering: sort by <loc> so diffs are meaningful.
  unique.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!-- Generated by scripts/generate-sitemap.mjs — do not edit by hand. -->`,
    `<!-- Source of truth: src/seo/metadata.ts + src/i18n/routeRegistry.ts. -->`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...unique.map(urlBlock),
    `</urlset>`,
    ``,
  ].join("\n");

  await writeFile(SITEMAP_OUT, xml, "utf8");

  console.log(
    `[generate-sitemap] wrote ${unique.length} URLs (of ${routes.length} routes, ` +
      `${dropped.length} dropped)`,
  );
  const grouped = new Map();
  for (const d of dropped) {
    const list = grouped.get(d.reason) ?? [];
    list.push(d.route);
    grouped.set(d.reason, list);
  }
  for (const [reason, list] of grouped) {
    console.log(`[generate-sitemap]   • ${list.length} dropped — ${reason}`);
    for (const r of list.slice(0, 5)) console.log(`[generate-sitemap]       ${r}`);
    if (list.length > 5) console.log(`[generate-sitemap]       …and ${list.length - 5} more`);
  }
}

main().catch((err) => {
  console.error("[generate-sitemap] FAILED —", err);
  process.exit(1);
});
