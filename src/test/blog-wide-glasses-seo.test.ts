import { describe, it, expect } from "vitest";
import { getMetadata, SITE_URL } from "@/seo/metadata";
import { getBlogPost } from "@/lib/blog-data";

/**
 * SEO audit for the rendered route /en/blog/how-wide-should-glasses-be.
 *
 * Validates two layers:
 *
 *  1. Prerendered head (what Googlebot sees in the first response, before JS):
 *     title, description, canonical, og:*, Article + BreadcrumbList JSON-LD.
 *     Driven by src/seo/metadata.ts → scripts/prerender.mjs.
 *
 *  2. Per-post FAQ + HowTo (what Helmet adds client-side in BlogPost.tsx):
 *     the FAQPage schema must match the on-page H3/<p> pairs word-for-word,
 *     and the HowTo schema must declare valid HowToStep entries.
 */

const SLUG = "how-wide-should-glasses-be";
const ROUTE = `/en/blog/${SLUG}`;
const CANONICAL = `${SITE_URL}${ROUTE}`;
const EXPECTED_TITLE = "How Wide Should Glasses Be on Your Face?";

type JsonLd = Record<string, unknown> & { "@type"?: string };

function pick(nodes: object[], type: string): JsonLd | undefined {
  return nodes.find(
    (o): o is JsonLd =>
      typeof o === "object" && o !== null && (o as JsonLd)["@type"] === type,
  );
}

describe("SEO — /en/blog/how-wide-should-glasses-be", () => {
  const meta = getMetadata(ROUTE);
  const post = getBlogPost("en", SLUG);

  it("post entry exists in blog data", () => {
    expect(post).toBeDefined();
  });

  it("has the expected branded title", () => {
    expect(meta.title).toContain(EXPECTED_TITLE);
    expect(meta.title.toLowerCase()).toContain("woolet");
    expect(meta.title.length).toBeLessThanOrEqual(80);
  });

  it("has a meaningful description (50–180 chars)", () => {
    expect(meta.description.length).toBeGreaterThanOrEqual(50);
    expect(meta.description.length).toBeLessThanOrEqual(180);
  });

  it("self-canonicalises and is indexable", () => {
    expect(meta.canonical).toBe(CANONICAL);
    expect(meta.robots ?? "index, follow").not.toMatch(/noindex/i);
  });

  it("ships article-typed Open Graph pointing at the route", () => {
    expect(meta.og.type).toBe("article");
    expect(meta.og.title).toContain(EXPECTED_TITLE);
    expect(meta.og.image).toMatch(/^https?:\/\//);
    expect(meta.og.locale).toBe("en_US");
  });

  it("emits Article JSON-LD with correct headline, url, language and date", () => {
    const article = pick(meta.jsonLd, "Article");
    expect(article, "Article JSON-LD must be present").toBeDefined();
    expect(article!.headline).toBe(EXPECTED_TITLE);
    expect(article!.url).toBe(CANONICAL);
    expect(article!.inLanguage).toBe("en");
    expect(typeof article!.datePublished).toBe("string");
    expect((article!.datePublished as string).length).toBeGreaterThan(0);
    expect(article!.image).toMatch(/^https?:\/\//);
  });

  it("emits a 3-item BreadcrumbList ending at the article", () => {
    const crumbs = pick(meta.jsonLd, "BreadcrumbList");
    expect(crumbs, "BreadcrumbList JSON-LD must be present").toBeDefined();
    const items = crumbs!.itemListElement as Array<{
      position: number;
      name: string;
      item: string;
    }>;
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ position: 1, name: "Woolet" });
    expect(items[1]).toMatchObject({ position: 2, name: "Blog" });
    expect(items[2]).toMatchObject({ position: 3, name: EXPECTED_TITLE, item: CANONICAL });
    for (const it of items) {
      expect(it.item).toMatch(/^https:\/\/woolet\.co\//);
    }
  });

  it("declares a FAQ block with 4 entries", () => {
    expect(post!.faq).toBeDefined();
    expect(post!.faq).toHaveLength(4);
  });

  it("declares a HowTo block whose steps are well-formed", () => {
    expect(post!.howTo).toBeDefined();
    const steps = post!.howTo!.step;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    for (const s of steps) {
      expect(s.name.length).toBeGreaterThan(2);
      expect(s.text.length).toBeGreaterThan(10);
    }
  });

  it("FAQ schema matches on-page H3/<p> pairs word-for-word", () => {
    // Parse post.content (HTML string) for H3 + immediately-following <p>.
    // Mirrors what BlogPost.tsx renders via dangerouslySetInnerHTML.
    const html = post!.content;
    const pairs: Array<{ q: string; a: string }> = [];
    const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m: RegExpExecArray | null;
    while ((m = h3Re.exec(html)) !== null) {
      const strip = (s: string) =>
        s
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
      pairs.push({ q: strip(m[1]), a: strip(m[2]) });
    }

    expect(pairs.length, "post.content must contain H3/P FAQ pairs").toBeGreaterThanOrEqual(
      post!.faq!.length,
    );

    for (const { q, a } of post!.faq!) {
      const match = pairs.find((p) => p.q === q.trim());
      expect(match, `On-page H3 must match schema question word-for-word: "${q}"`).toBeTruthy();
      expect(
        match!.a,
        `On-page answer for "${q}" must match FAQPage schema word-for-word`,
      ).toBe(a.trim().replace(/\s+/g, " "));
    }
  });
});
