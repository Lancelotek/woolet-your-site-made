import { test, expect } from "../playwright-fixture";

/**
 * SEO audit for /en/blog/how-wide-should-glasses-be.
 *
 * Asserts (against the rendered DOM, post-Helmet hydration):
 *   - <title> and meta description
 *   - canonical + og:url self-reference woolet.co/en/blog/...
 *   - og:title / og:type=article / og:image present
 *   - FAQPage JSON-LD: exactly 4 Q/A, and each on-page H3/<p>
 *     pair under the FAQ section matches word-for-word
 *   - HowTo JSON-LD: has steps with name + text
 *   - BreadcrumbList JSON-LD: 3 items, last item = current article
 */

const SLUG = "how-wide-should-glasses-be";
const PATH = `/en/blog/${SLUG}`;
const CANONICAL = `https://woolet.co${PATH}`;

const EXPECTED_TITLE = "How Wide Should Glasses Be on Your Face?";

type JsonLd = Record<string, unknown> & { "@type"?: string | string[] };

function flatten(nodes: JsonLd[]): JsonLd[] {
  const out: JsonLd[] = [];
  for (const n of nodes) {
    if (Array.isArray(n)) out.push(...flatten(n as unknown as JsonLd[]));
    else if (n && typeof n === "object") {
      out.push(n);
      const graph = (n as { "@graph"?: JsonLd[] })["@graph"];
      if (Array.isArray(graph)) out.push(...flatten(graph));
    }
  }
  return out;
}

function byType(nodes: JsonLd[], type: string): JsonLd | undefined {
  return nodes.find((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.includes(type) : t === type;
  });
}

test.describe("SEO — /en/blog/how-wide-should-glasses-be", () => {
  test("rendered head + JSON-LD are correct", async ({ page }) => {
    await page.goto(PATH, { waitUntil: "networkidle" });

    // ── Title & meta description ──
    await expect(page).toHaveTitle(new RegExp(EXPECTED_TITLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content");
    expect(description, "meta description").toBeTruthy();
    expect(description!.length).toBeGreaterThanOrEqual(50);
    expect(description!.length).toBeLessThanOrEqual(180);

    // ── Canonical & og:url self-reference ──
    const canonicals = await page.locator('link[rel="canonical"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(canonicals, "at least one canonical").toContain(CANONICAL);

    const ogUrls = await page.locator('meta[property="og:url"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("content")),
    );
    expect(ogUrls, "og:url should self-reference").toContain(CANONICAL);

    // ── og:title / og:type / og:image ──
    const ogTitles = await page.locator('meta[property="og:title"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("content") ?? ""),
    );
    expect(ogTitles.some((t) => t.includes(EXPECTED_TITLE))).toBe(true);

    const ogTypes = await page.locator('meta[property="og:type"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("content")),
    );
    expect(ogTypes).toContain("article");

    const ogImages = await page.locator('meta[property="og:image"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("content") ?? ""),
    );
    expect(ogImages.length).toBeGreaterThan(0);
    expect(ogImages.every((u) => /^https?:\/\//.test(u))).toBe(true);

    // ── Collect all JSON-LD blocks ──
    const jsonLdRaw = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ""));

    const parsed: JsonLd[] = [];
    for (const raw of jsonLdRaw) {
      if (!raw.trim()) continue;
      const node = JSON.parse(raw) as JsonLd | JsonLd[];
      if (Array.isArray(node)) parsed.push(...node);
      else parsed.push(node);
    }
    const all = flatten(parsed);

    // ── Article ──
    const article = byType(all, "Article");
    expect(article, "Article JSON-LD").toBeDefined();
    expect(article!.headline).toBe(EXPECTED_TITLE);
    expect(article!.url).toBe(CANONICAL);
    expect(article!.inLanguage).toBe("en");
    expect(typeof article!.datePublished).toBe("string");

    // ── BreadcrumbList ──
    const crumbs = byType(all, "BreadcrumbList");
    expect(crumbs, "BreadcrumbList JSON-LD").toBeDefined();
    const items = crumbs!.itemListElement as Array<{
      position: number;
      name: string;
      item: string;
    }>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[2].name).toBe(EXPECTED_TITLE);
    expect(items[2].item).toBe(CANONICAL);
    for (const it of items) {
      expect(it.item).toMatch(/^https:\/\/woolet\.co\//);
    }

    // ── HowTo ──
    const howTo = byType(all, "HowTo");
    expect(howTo, "HowTo JSON-LD").toBeDefined();
    expect(typeof howTo!.name).toBe("string");
    const steps = howTo!.step as Array<{ "@type": string; name: string; text: string }>;
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    for (const s of steps) {
      expect(s["@type"]).toBe("HowToStep");
      expect(s.name.length).toBeGreaterThan(2);
      expect(s.text.length).toBeGreaterThan(10);
    }

    // ── FAQPage: schema matches on-page FAQ word-for-word ──
    const faq = byType(all, "FAQPage");
    expect(faq, "FAQPage JSON-LD").toBeDefined();
    const qa = faq!.mainEntity as Array<{
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }>;
    expect(qa).toHaveLength(4);

    // Collect on-page H3 + following <p> pairs inside the article body.
    const onPage = await page.evaluate(() => {
      const article = document.querySelector(".woolet-blog-content");
      if (!article) return [] as Array<{ q: string; a: string }>;
      const h3s = Array.from(article.querySelectorAll("h3"));
      const pairs: Array<{ q: string; a: string }> = [];
      for (const h3 of h3s) {
        let sib = h3.nextElementSibling;
        // Skip empty nodes
        while (sib && sib.tagName !== "P" && sib.tagName !== "H3" && sib.tagName !== "H2") {
          sib = sib.nextElementSibling;
        }
        if (sib && sib.tagName === "P") {
          pairs.push({
            q: (h3.textContent ?? "").trim(),
            a: (sib.textContent ?? "").trim(),
          });
        }
      }
      return pairs;
    });

    for (const { name, acceptedAnswer } of qa) {
      const match = onPage.find((p) => p.q === name.trim());
      expect(match, `On-page H3 matches schema question: "${name}"`).toBeTruthy();
      expect(match!.a, `Answer for "${name}" matches schema word-for-word`).toBe(
        acceptedAnswer.text.trim(),
      );
    }
  });
});
