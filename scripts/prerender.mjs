#!/usr/bin/env node
/**
 * Build-time prerender for crawler-visible HTML.
 *
 * After `vite build`, this script:
 *   1. Boots `vite preview` on a free port.
 *   2. For each target route, opens it in headless Chromium (Playwright),
 *      waits for React to hydrate + react-helmet-async to flush, and
 *      snapshots `document.documentElement.outerHTML`.
 *   3. Writes the snapshot to `dist/<route>/index.html` so static hosting
 *      serves it before falling back to the SPA shell.
 *
 * Safe to fail: if Playwright's chromium binary isn't installed (e.g. in
 * a CI environment that doesn't cache it), this script logs a warning
 * and exits 0. The build still succeeds — crawlers just see the SPA
 * shell as before.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");

if (!existsSync(DIST)) {
  console.warn("[prerender] dist/ not found — skipping (run after `vite build`).");
  process.exit(0);
}

// Extract blog slugs per language from src/lib/blog-data.ts without importing the TS file.
async function getBlogSlugsByLang() {
  try {
    const src = await readFile(resolve(ROOT, "src/lib/blog-data.ts"), "utf8");
    const result = { en: [], pl: [] };
    for (const lang of ["EN", "PL"]) {
      const start = src.indexOf(`blogPosts${lang}`);
      if (start < 0) continue;
      // slice until the next blogPosts<X> declaration or end of file
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
  // EN
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
  // Other language homes (hreflang anchors)
  "/pl",
  "/fr",
  "/es",
  "/pl/privacy-policy",
  "/pl/return-policy",
];

async function getRoutes() {
  const slugs = await getBlogSlugsByLang();
  const blogRoutes = [
    "/en/blog",
    ...slugs.en.map((s) => `/en/blog/${s}`),
    "/pl/blog",
    ...slugs.pl.map((s) => `/pl/blog/${s}`),
  ];
  return [...BASE_ROUTES, ...blogRoutes];
}

// Ensure Playwright's chromium binary is available; download on-demand if missing.
async function ensureChromium() {
  return new Promise((res) => {
    const proc = spawn("npx", ["playwright", "install", "chromium"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    proc.on("exit", (code) => {
      if (code !== 0) console.warn(`[prerender] playwright install chromium exited ${code}`);
      res();
    });
    proc.on("error", (err) => {
      console.warn("[prerender] playwright install failed:", err.message);
      res();
    });
  });
}

function getFreePort() {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", rej);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

function waitForServer(url, timeoutMs = 15000) {
  return new Promise((res, rej) => {
    const start = Date.now();
    const tick = async () => {
      try {
        const r = await fetch(url);
        if (r.ok || r.status === 304) return res();
      } catch {}
      if (Date.now() - start > timeoutMs) return rej(new Error(`server didn't start: ${url}`));
      setTimeout(tick, 200);
    };
    tick();
  });
}

async function main() {
  // Lazy-load Playwright so missing chromium fails gracefully.
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (err) {
    console.warn("[prerender] playwright not installed — skipping prerender.");
    console.warn("[prerender]", err.message);
    process.exit(0);
  }

  const routes = await getRoutes();
  console.log(`[prerender] target routes: ${routes.length}`);

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  // Spawn `vite preview` against the freshly built dist/.
  const preview = spawn(
    "npx",
    ["vite", "preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
  );
  let previewExited = false;
  preview.on("exit", () => {
    previewExited = true;
  });
  preview.stderr.on("data", (b) => process.stderr.write(`[vite preview] ${b}`));

  let browser;
  try {
    await waitForServer(baseUrl + "/");

    try {
      browser = await chromium.launch({ args: ["--no-sandbox"] });
    } catch (err) {
      console.warn("[prerender] chromium launch failed — attempting `playwright install chromium`...");
      console.warn("[prerender]", err.message);
      await ensureChromium();
      try {
        browser = await chromium.launch({ args: ["--no-sandbox"] });
      } catch (err2) {
        console.warn("[prerender] chromium still unavailable after install — skipping prerender.");
        console.warn("[prerender]", err2.message);
        preview.kill();
        process.exit(0);
      }
    }

    const ctx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (compatible; WooletPrerender/1.0; +https://woolet.co)",
    });

    let written = 0;
    for (const route of routes) {
      if (previewExited) throw new Error("vite preview exited unexpectedly");
      const url = baseUrl + route;
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
        // Wait for React to hydrate + Helmet to flush a real <title>.
        await page
          .waitForFunction(
            () => {
              const t = document.title || "";
              const root = document.getElementById("root");
              return t.length > 0 && !!root && root.children.length > 0;
            },
            { timeout: 10000 },
          )
          .catch(() => {
            console.warn(`[prerender] ${route} — hydration check timed out, snapshotting anyway`);
          });

        // Strip Vite preview's HMR / dev injections (none in preview, but be safe).
        const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
        const outDir = resolve(DIST, "." + route);
        await mkdir(outDir, { recursive: true });
        await writeFile(resolve(outDir, "index.html"), html, "utf8");
        written += 1;
        console.log(`[prerender] ✓ ${route}`);
      } catch (err) {
        console.warn(`[prerender] ✗ ${route} — ${err.message}`);
      } finally {
        await page.close();
      }
    }

    console.log(`[prerender] wrote ${written} / ${routes.length} routes`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    preview.kill();
  }
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  // Don't fail the build — the SPA shell still works.
  process.exit(0);
});
