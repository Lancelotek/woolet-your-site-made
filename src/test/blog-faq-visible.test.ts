import { describe, expect, it } from "vitest";
import { getBlogPosts } from "@/lib/blog-data";
import { BLOG_AIO_ENHANCEMENTS, enrichBlogContent, withVisibleFaq } from "@/content/blog-aio";
import { getMetadata } from "@/seo/metadata";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// The bridge post keeps its own FAQ section, escaped by metadata.ts (quotes included).
const escapeAttr = (text: string) => escapeHtml(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

describe("blog FAQ schema is visible in the article", () => {
  const posts = getBlogPosts("en").filter((post) => post.faq?.length);

  it.each(posts.map((post) => [post.slug, post] as const))("%s exposes every FAQ question to crawlers", (slug, post) => {
    const html = getMetadata(`/en/blog/${slug}`).noscriptHtml ?? "";
    for (const item of post.faq ?? []) {
      expect(html.includes(item.q) || html.includes(escapeHtml(item.q)) || html.includes(escapeAttr(item.q))).toBe(true);
    }
  });

  it("does not repeat a question the article already carries", () => {
    for (const post of posts) {
      const html = withVisibleFaq(post.slug, enrichBlogContent(post.slug, post.content), post.faq);
      for (const item of post.faq ?? []) {
        const heading = `<h3>${escapeHtml(item.q)}</h3>`;
        expect(html.split(heading).length - 1).toBeLessThanOrEqual(1);
      }
    }
  });

  it("keeps quick-answer-only posts free of a prepended section", () => {
    for (const slug of ["how-wide-should-glasses-be", "best-glasses-for-oval-face", "how-to-measure-your-head-for-a-hat"]) {
      const post = getBlogPosts("en").find((p) => p.slug === slug)!;
      expect(BLOG_AIO_ENHANCEMENTS[slug].quickAnswer.length).toBeGreaterThan(80);
      expect(enrichBlogContent(slug, post.content)).toBe(post.content);
      expect(getMetadata(`/en/blog/${slug}`).noscriptHtml).toContain("Quick answer");
    }
  });
});
