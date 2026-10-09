import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { getBlogPost } from "@/lib/blog-data";
import { blogModifiedMonthLabel, getMetadata } from "@/seo/metadata";

const source = readFileSync("scripts/prerender.mjs", "utf8");
const functionSource = source.match(/function getNoscriptContent\(route, fallback\) \{[\s\S]*?\n\}/)?.[0];
if (!functionSource) throw new Error("getNoscriptContent not found");

function resolver(label?: (slug: string) => unknown, overrides = {}) {
  return runInNewContext(`${functionSource}; getNoscriptContent`, {
    NOSCRIPT_OVERRIDES: overrides,
    __wooletBlogMonthLabel: label,
  }) as (route: string, fallback?: string) => string | undefined;
}

describe("prerender blog month placeholders", () => {
  it("renders the real crawler byline with the shared date and the exact corrected paragraph for visitors", () => {
    const route = "/en/blog/glasses-for-wide-faces-guide";
    const override = source.match(/"\/en\/blog\/glasses-for-wide-faces-guide": `([\s\S]*?)`,/)?.[1];
    expect(override).toBeDefined();
    const html = resolver(blogModifiedMonthLabel, { [route]: override })(route, getMetadata(route).noscriptHtml);
    expect(html).toContain(`Last updated: ${blogModifiedMonthLabel("glasses-for-wide-faces-guide")}`);
    expect(html).not.toContain("{{");
    const paragraph = "<p>Faces at <strong>155mm or more</strong> from temple to temple — the point where the market stops offering anything at all — represent a significant portion of the population. The problem isn't your face. The problem is that the eyewear industry was designed around a bell curve that cuts off precisely where you begin.</p>";
    expect(getBlogPost("en", "glasses-for-wide-faces-guide")?.content).toContain(paragraph);
    expect(getBlogPost("en", "glasses-for-wide-faces-guide")?.content).not.toContain("Wide faces — defined as faces measuring");
    expect(override).not.toContain("Wide faces — defined as faces measuring");
  });

  it("uses the rendered route's slug, including a second blog route", () => {
    const resolve = resolver((slug) => slug === "glasses-for-wide-faces-guide" ? "October 2026" : "September 2026");
    expect(resolve("/en/blog/glasses-for-wide-faces-guide", "Updated: {{BLOG_UPDATED_MONTH}}" )).toBe("Updated: October 2026");
    expect(resolve("/en/blog/second-guide", "{{BLOG_UPDATED_MONTH}} / {{BLOG_UPDATED_MONTH}}" )).toBe("September 2026 / September 2026");
  });

  it("uses the owner's 155 mm definition in visitor and curated crawler content", () => {
    const route = "/en/blog/glasses-for-wide-faces-guide";
    const visitor = getBlogPost("en", "glasses-for-wide-faces-guide")?.content;
    const override = source.match(/"\/en\/blog\/glasses-for-wide-faces-guide": `([\s\S]*?)`,/)?.[1];
    const definition = "A wide face in eyewear terms means 155 mm or more measured temple-to-temple. Standard eyewear frames top out at 140–145 mm, so anything past that is already wider than the market is built for: frames pinch at the temples, bow at the arms, and sit off-center on the face. At 155 mm the mainstream market offers nothing at all — and that is where Woolet's standard 158 mm frames begin.";
    for (const html of [visitor, override]) {
      expect(html).toContain(definition);
      expect(html).not.toContain("A wide face in eyewear terms starts above 145 mm");
      expect(html).not.toContain("150 mm and above is a wide face.");
      expect(html).not.toContain("A wide face measures 150 mm or more");
      expect(html).toContain("If your face is between 145 mm and 160 mm, the bespoke tier covers that full range.");
      expect(html).toContain("Faces wider than 145 mm push the temples outward");
    }
    expect(visitor).toContain("Under 140 mm is average. 140–149 mm is large-average. 150–154 mm is extra-wide — where specialist brands start. 155 mm and above is a wide face — and where the mainstream market has nothing for you at all.");
    expect(visitor).toContain("<strong>A wide face measures 155 mm or more temple-to-temple, and it needs glasses with a total front width of about 158 mm.</strong>");
  });

  it("prefers curated overrides and leaves content without placeholders unchanged", () => {
    const resolve = resolver(() => "October 2026", { "/en/blog/example": "{{BLOG_UPDATED_MONTH}}" });
    expect(resolve("/en/blog/example", "fallback")).toBe("October 2026");
    expect(resolver()("/en/collection", "unchanged")).toBe("unchanged");
    expect(resolver()("/en/collection")).toBeUndefined();
  });

  it.each([undefined, () => "", () => "   ", () => undefined, () => "undefined ", () => "undefined undefined"])("rejects missing or invalid labels with route and export in the error", (label) => {
    expect(() => resolver(label)("/en/blog/example", "Last updated: {{BLOG_UPDATED_MONTH}}"))
      .toThrow("/en/blog/example: missing or unresolved blogModifiedMonthLabel export");
  });

  it("does not borrow a blog date for a non-blog route", () => {
    expect(() => resolver(() => "October 2026")("/en/collection", "{{BLOG_UPDATED_MONTH}}"))
      .toThrow("/en/collection: missing or unresolved blogModifiedMonthLabel export");
  });

  it("preflights placeholders before writing routes and exits non-zero on failure", () => {
    const preflightStart = source.indexOf("// Validate date placeholders");
    const firstRouteWrite = source.indexOf('await writeFile(resolve(outDir, "index.html")');
    expect(preflightStart).toBeGreaterThan(0);
    expect(preflightStart).toBeLessThan(firstRouteWrite);
    expect(source.slice(preflightStart, source.indexOf("// Keep both public AI summaries"))).toContain("process.exit(1)");
    expect(source.slice(source.indexOf("mod = await import"), preflightStart)).toContain("process.exit(1)");
  });
});