import { test, expect } from "../playwright-fixture";

/**
 * Browser-level crawl of key DE pages. For each seed page we:
 *   1. Navigate and assert HTTP 200 + no NotFound/Gone markers rendered.
 *   2. Collect every same-origin internal link that points at a DE surface
 *      (or a whitelisted /en/ fallback used by DE footer).
 *   3. Visit each unique link once and assert the same success criteria.
 *
 * Complements the static analysis in src/test/de-internal-links.test.ts by
 * catching runtime-only breakage: client-side redirects to NotFound, missing
 * lazy chunks, and pages that render but throw in effects.
 */

const SEED_PAGES = [
  "/de",
  "/de/fit",
  "/de/collection",
  "/de/bespoke",
  "/de/blog",
  "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
  "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
  "/de/privacy-policy",
  "/de/return-policy",
  "/de/brille-fuer-breites-gesicht",
  "/de/breite-brille",
  "/de/brille-grosse-koepfe",
  "/de/xxl-brille-herren",
  "/de/brille-breite-160-mm",
];

// Paths we tolerate as DE-context outbound links (blog EN guides, KS LP).
const ALLOWED_EN_PREFIXES = [
  "/en/blog/",
  "/en/collections/",
  "/en/lp/",
];

function isCrawlable(pathname: string): boolean {
  if (pathname.startsWith("/de")) return true;
  return ALLOWED_EN_PREFIXES.some((p) => pathname.startsWith(p));
}

async function assertHealthyPage(page: import("@playwright/test").Page, url: string) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status(), `bad HTTP status for ${url}`).toBeLessThan(400);

  // NotFound.tsx renders "404" + "Page not found"; Gone.tsx renders "410 · Gone".
  const body = await page.locator("body").innerText();
  expect(body, `NotFound rendered at ${url}`).not.toMatch(/Page not found/i);
  expect(body, `Gone rendered at ${url}`).not.toMatch(/410\s*[·|-]\s*Gone/i);
}

test.describe("DE crawl — key pages and their internal links resolve", () => {
  test("seed pages render and internal links stay healthy", async ({ page, baseURL }) => {
    test.setTimeout(120_000);

    const visited = new Set<string>();
    const failures: string[] = [];
    const collected = new Set<string>();

    // Pass 1: visit every seed page and harvest internal links.
    for (const seed of SEED_PAGES) {
      try {
        await assertHealthyPage(page, seed);
        visited.add(seed);
      } catch (err) {
        failures.push(`seed ${seed}: ${(err as Error).message}`);
        continue;
      }

      const hrefs = await page.$$eval("a[href]", (nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).getAttribute("href") ?? ""),
      );

      for (const href of hrefs) {
        if (!href || href.startsWith("#")) continue;
        let url: URL;
        try {
          url = new URL(href, baseURL ?? "http://localhost:8080");
        } catch {
          continue;
        }
        if (url.origin !== new URL(baseURL ?? "http://localhost:8080").origin) continue;
        if (!isCrawlable(url.pathname)) continue;
        collected.add(url.pathname + url.search);
      }
    }

    // Pass 2: visit each harvested link once.
    for (const link of collected) {
      if (visited.has(link)) continue;
      try {
        await assertHealthyPage(page, link);
        visited.add(link);
      } catch (err) {
        failures.push(`link ${link}: ${(err as Error).message}`);
      }
    }

    if (failures.length) {
      throw new Error(
        `DE crawl found ${failures.length} broken URL(s):\n  - ${failures.join("\n  - ")}`,
      );
    }

    // Sanity: we visited at least the seed set.
    expect(visited.size).toBeGreaterThanOrEqual(SEED_PAGES.length);
  });
});
