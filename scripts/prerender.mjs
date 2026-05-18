#!/usr/bin/env node
/**
 * Build-time prerender for crawler-visible <head> metadata.
 *
 * After `vite build`, this script:
 *   1. Builds an SSR bundle of src/entry-server.tsx.
 *   2. Sets up a minimal jsdom-backed `window` / `document` so client
 *      components that touch DOM APIs at module load don't crash on
 *      import.
 *   3. For each target route, calls renderHelmet(url) to capture the
 *      per-route <title>, <meta>, <link rel="canonical">, hreflang,
 *      og:*, twitter:*, and JSON-LD that react-helmet-async produces.
 *   4. Injects those tags into the dist/index.html template and writes
 *      dist/<route>/index.html. Static hosting then serves the
 *      per-route HTML to bots and falls back to SPA hydration for
 *      users.
 *
 * No browser binary required — runs in pure Node + jsdom, so it works
 * on Lovable's build sandbox (where the previous Playwright-based
 * implementation silently no-op'd because chromium couldn't be
 * downloaded with its OS dependencies).
 *
 * Safe to fail: any per-route error is logged and the build keeps
 * going. Worst case the route ships as the generic SPA shell, same as
 * before this script existed.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SSR_OUT = resolve(ROOT, "dist-ssr");

if (!existsSync(DIST)) {
  console.warn("[prerender] dist/ not found — skipping (run after `vite build`).");
  process.exit(0);
}

// --------------------------------------------------------------------
// Route list
// --------------------------------------------------------------------

async function getBlogSlugsByLang() {
  try {
    const src = await readFile(resolve(ROOT, "src/lib/blog-data.ts"), "utf8");
    const result = { en: [], pl: [] };
    for (const lang of ["EN", "PL"]) {
      const start = src.indexOf(`blogPosts${lang}`);
      if (start < 0) continue;
      const nextLangs = ["EN", "PL", "FR", "ES"].filter((l) => l !== lang);
      let end = src.length;
      for (const l of nextLangs) {
        const idx = src.indexOf(`blogPosts${l}`, start + 1);
        if (idx > start && idx < end) end = idx;
      }
      const slice = src.slice(start, end);
      const matches = [...slice.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
      result[lang.toLowerCase()] = [...new Set(matches)];
    }
    return result;
  } catch (err) {
    console.warn("[prerender] could not read blog-data.ts:", err.message);
    return { en: [], pl: [] };
  }
}

const BASE_ROUTES = [
  "/en",
  "/en/about",
  "/en/products/007",
  "/en/products/009",
  "/en/fit",
  "/en/fit/manual",
  "/en/fit/bespoke",
  "/en/fit/scan",
  "/en/collections/wide-face-glasses",
  "/en/collections/italian-acetate-sunglasses",
  "/en/collections/oversized-sunglasses-men",
  "/en/lp/why-glasses-fail",
  "/en/lp/5-reasons",
  "/en/privacy-policy",
  "/en/return-policy",
  "/pl",
  "/pl/privacy-policy",
  "/pl/return-policy",
  "/fr",
  "/es",
];

async function getRoutes() {
  const slugs = await getBlogSlugsByLang();
  return [
    ...BASE_ROUTES,
    "/en/blog",
    ...slugs.en.map((s) => `/en/blog/${s}`),
    "/pl/blog",
    ...slugs.pl.map((s) => `/pl/blog/${s}`),
  ];
}

// --------------------------------------------------------------------
// SSR build
// --------------------------------------------------------------------

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))));
    p.on("error", rej);
  });
}

async function buildSsrBundle() {
  console.log("[prerender] building SSR bundle…");
  await rm(SSR_OUT, { recursive: true, force: true });
  await run("npx", [
    "vite",
    "build",
    "--ssr",
    "src/entry-server.tsx",
    "--outDir",
    "dist-ssr",
    "--logLevel",
    "warn",
  ]);
}

// --------------------------------------------------------------------
// jsdom globals — let component modules that reach for window/document
// at import time load without crashing on the server.
// --------------------------------------------------------------------

async function setupDomGlobals() {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://woolet.co/",
    pretendToBeVisual: true,
  });
  const g = globalThis;
  const assign = (key, value) => {
    try {
      Object.defineProperty(g, key, { value, writable: true, configurable: true });
    } catch {
      try { g[key] = value; } catch {}
    }
  };
  assign("window", dom.window);
  assign("document", dom.window.document);
  assign("navigator", dom.window.navigator);
  assign("location", dom.window.location);
  assign("HTMLElement", dom.window.HTMLElement);
  assign("Element", dom.window.Element);
  assign("Node", dom.window.Node);
  assign("getComputedStyle", dom.window.getComputedStyle);
  assign("requestAnimationFrame", (cb) => setTimeout(cb, 0));
  assign("cancelAnimationFrame", (id) => clearTimeout(id));
  g.matchMedia =
    g.matchMedia ||
    (() => ({
      matches: false,
      media: "",
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
  // Stub Worker / IntersectionObserver / ResizeObserver
  g.Worker = class {
    addEventListener() {}
    removeEventListener() {}
    postMessage() {}
    terminate() {}
  };
  g.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  g.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// --------------------------------------------------------------------
// HTML injection
// --------------------------------------------------------------------

function injectHelmet(template, helmet, route) {
  let html = template;

  // Strip the static <title> and <meta name="description"> that ship in
  // dist/index.html so Helmet's per-route values don't render as
  // duplicates alongside them.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  // Remove sitewide canonical from template — Helmet writes the
  // per-route one (and <link> tags don't dedupe by rel).
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

  const headInjection = [
    helmet.title,
    helmet.meta,
    helmet.link,
    helmet.script,
  ]
    .filter(Boolean)
    .join("\n    ");

  html = html.replace("</head>", `    ${headInjection}\n    <!-- prerendered: ${route} -->\n  </head>`);

  // Patch <html lang> if Helmet set htmlAttributes (e.g. lang="pl").
  if (helmet.htmlAttributes) {
    html = html.replace(/<html[^>]*>/i, `<html ${helmet.htmlAttributes}>`);
  }

  return html;
}

// --------------------------------------------------------------------
// Main
// --------------------------------------------------------------------

async function main() {
  await setupDomGlobals();

  try {
    await buildSsrBundle();
  } catch (err) {
    console.warn("[prerender] SSR build failed — skipping prerender.");
    console.warn("[prerender]", err.message);
    process.exit(0);
  }

  const entryPath = resolve(SSR_OUT, "entry-server.js");
  if (!existsSync(entryPath)) {
    console.warn(`[prerender] SSR entry not found at ${entryPath} — skipping.`);
    process.exit(0);
  }

  let renderHelmet;
  try {
    ({ renderHelmet } = await import(pathToFileURL(entryPath).href));
  } catch (err) {
    console.warn("[prerender] could not import SSR bundle — skipping.");
    console.warn("[prerender]", err.message);
    process.exit(0);
  }

  const template = await readFile(resolve(DIST, "index.html"), "utf8");
  const routes = await getRoutes();
  console.log(`[prerender] rendering ${routes.length} routes…`);

  let ok = 0;
  let fail = 0;
  for (const route of routes) {
    try {
      const { ok: rendered, helmet, error } = renderHelmet(route);
      if (!rendered || !helmet) {
        console.warn(`[prerender] ✗ ${route} — ${error || "no helmet"}`);
        fail += 1;
        continue;
      }
      const html = injectHelmet(template, helmet, route);
      const outDir = resolve(DIST, "." + route);
      await mkdir(outDir, { recursive: true });
      await writeFile(resolve(outDir, "index.html"), html, "utf8");
      ok += 1;
      const titleMatch = helmet.title.match(/<title[^>]*>([^<]*)<\/title>/i);
      console.log(`[prerender] ✓ ${route}  →  ${titleMatch ? titleMatch[1].slice(0, 70) : "(no title)"}`);
    } catch (err) {
      fail += 1;
      console.warn(`[prerender] ✗ ${route} — ${err.message}`);
    }
  }

  console.log(`[prerender] done: ${ok} ok, ${fail} failed, ${routes.length} total`);

  // Cleanup SSR bundle — not needed at runtime.
  await rm(SSR_OUT, { recursive: true, force: true }).catch(() => {});
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  // Never break the build over a prerender failure.
  process.exit(0);
});
