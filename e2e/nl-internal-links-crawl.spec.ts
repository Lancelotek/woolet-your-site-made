import { test, expect } from "../playwright-fixture";

/**
 * Browser-level crawl of key NL pages. Mirrors de-internal-links-crawl.spec.ts:
 *   1. Navigate each seed page and assert HTTP 200 + no NotFound/Gone markers.
 *   2. Collect every same-origin internal link that points at an NL surface
 *      (or a whitelisted /en/ fallback used by NL footer / non-translated guides).
 *   3. Visit each unique link once and assert the same success criteria.
 */

const SEED_PAGES = [
  "/nl",
  "/nl/fit",
  "/nl/collection",
  "/nl/bespoke",
  "/nl/blog",
  "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  "/nl/privacy-policy",
  "/nl/return-policy",
  "/nl/acetaat-bril-op-maat",
  "/nl/grote-brillen-heren",
  "/nl/products/007",
  "/nl/products/009",
  "/nl/products/bespoke",
];

// NL context may link out to non-translated EN guides, collections and LPs.
const ALLOWED_EN_PREFIXES = [
  "/en/blog/",
  "/en/collections/",
  "/en/lp/",
  "/en/fit",
];

function isCrawlable(pathname: string): boolean {
  if (pathname.startsWith("/nl")) return true;
  return ALLOWED_EN_PREFIXES.some((p) => pathname.startsWith(p));
}

async function assertHealthyPage(page: import("@playwright/test").Page, url: string) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  expect(response, `no response for ${url}`).not.toBeNull();
  expect(response!.status(), `bad HTTP status for ${url}`).toBeLessThan(400);

  const body = await page.locator("body").innerText();
  expect(body, `NotFound rendered at ${url}`).not.toMatch(/Page not found/i);
  expect(body, `Gone rendered at ${url}`).not.toMatch(/410\s*[·|-]\s*Gone/i);
}

test.describe("NL crawl — key pages and their internal links resolve", () => {
  test("seed pages render and internal links stay healthy", async ({ page, baseURL }) => {
    test.setTimeout(120_000);

    const visited = new Set<string>();
    const failures: string[] = [];
    const collected = new Set<string>();

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
        `NL crawl found ${failures.length} broken URL(s):\n  - ${failures.join("\n  - ")}`,
      );
    }

    expect(visited.size).toBeGreaterThanOrEqual(SEED_PAGES.length);
  });
});
