#!/usr/bin/env node
/**
 * Build-time prerender for crawler-visible <head> metadata.
 *
 * Approach: head-only. We do NOT render the React app on the server.
 * Instead, src/seo/metadata.ts is a pure data module exporting
 * getAllRoutes() + getMetadata(route) + renderHeadHtml(meta). This
 * script:
 *
 *   1. Builds that single TS module as an SSR bundle (no React, no
 *      Radix, no DOM dependencies — guaranteed to load in Node).
 *   2. For each route, generates the per-route <title>, <meta>,
 *      <link rel="canonical">, hreflang, og:*, twitter:* and JSON-LD,
 *      and an optional <noscript> body block for LLM bots.
 *   3. Injects those into the dist/index.html template and writes
 *      dist/<route>/index.html. The SPA still hydrates on top —
 *      Helmet replaces tags client-side after JS runs.
 *
 * No React renderToString, no jsdom, no Playwright. Cheap and stable.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SSR_OUT = resolve(ROOT, "dist-seo");

if (!existsSync(DIST)) {
  console.warn("[prerender] dist/ not found — skipping (run after `vite build`).");
  process.exit(0);
}

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))));
    p.on("error", rej);
  });
}

async function buildMetadataBundle() {
  console.log("[prerender] building metadata bundle…");
  await rm(SSR_OUT, { recursive: true, force: true });
  await run("npx", [
    "vite",
    "build",
    "--ssr",
    "src/seo/metadata.ts",
    "--outDir",
    "dist-seo",
    "--logLevel",
    "warn",
  ]);
}

function injectHead(template, headHtml, noscriptHtml, route) {
  let html = template;

  // Strip whatever generic head bits the SPA template ships so we
  // don't render duplicates next to the per-route ones.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");

  html = html.replace(
    "</head>",
    `    ${headHtml}\n    <!-- prerendered: ${route} -->\n  </head>`,
  );

  if (noscriptHtml) {
    const block = `<noscript data-route="${route}">${noscriptHtml}</noscript>`;
    html = html.replace(/(<div id="root"[^>]*>)/, `${block}\n    $1`);
  }

  return html;
}

async function main() {
  try {
    await buildMetadataBundle();
  } catch (err) {
    console.warn("[prerender] metadata SSR build failed — skipping prerender.");
    console.warn("[prerender]", err.message);
    process.exit(0);
  }

  const entryPath = resolve(SSR_OUT, "metadata.js");
  if (!existsSync(entryPath)) {
    console.warn(`[prerender] metadata bundle not found at ${entryPath} — skipping.`);
    process.exit(0);
  }

  let mod;
  try {
    mod = await import(pathToFileURL(entryPath).href);
  } catch (err) {
    console.warn("[prerender] could not import metadata bundle — skipping.");
    console.warn("[prerender]", err.message);
    process.exit(0);
  }

  const { getAllRoutes, getMetadata, renderHeadHtml } = mod;
  if (!getAllRoutes || !getMetadata || !renderHeadHtml) {
    console.warn("[prerender] metadata bundle missing expected exports — skipping.");
    process.exit(0);
  }

  const template = await readFile(resolve(DIST, "index.html"), "utf8");
  const routes = getAllRoutes();
  console.log(`[prerender] rendering ${routes.length} routes…`);

  let ok = 0;
  let fail = 0;
  for (const route of routes) {
    try {
      const meta = getMetadata(route);
      const headHtml = renderHeadHtml(meta);
      const html = injectHead(template, headHtml, meta.noscriptHtml, route);
      const outDir = resolve(DIST, "." + route);
      await mkdir(outDir, { recursive: true });
      await writeFile(resolve(outDir, "index.html"), html, "utf8");
      ok += 1;
      console.log(`[prerender] ✓ ${route}  →  ${meta.title.slice(0, 70)}`);
    } catch (err) {
      fail += 1;
      console.warn(`[prerender] ✗ ${route} — ${err.message}`);
    }
  }

  console.log(`[prerender] done: ${ok} ok, ${fail} failed, ${routes.length} total`);

  await rm(SSR_OUT, { recursive: true, force: true }).catch(() => {});
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  process.exit(0);
});
