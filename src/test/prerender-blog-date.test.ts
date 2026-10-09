import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

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
  it("uses the rendered route's slug, including a second blog route", () => {
    const resolve = resolver((slug) => slug === "glasses-for-wide-faces-guide" ? "October 2026" : "September 2026");
    expect(resolve("/en/blog/glasses-for-wide-faces-guide", "Updated: {{BLOG_UPDATED_MONTH}}" )).toBe("Updated: October 2026");
    expect(resolve("/en/blog/second-guide", "{{BLOG_UPDATED_MONTH}} / {{BLOG_UPDATED_MONTH}}" )).toBe("September 2026 / September 2026");
  });

  it("prefers curated overrides and leaves content without placeholders unchanged", () => {
    const resolve = resolver(() => "October 2026", { "/en/blog/example": "{{BLOG_UPDATED_MONTH}}" });
    expect(resolve("/en/blog/example", "fallback")).toBe("October 2026");
    expect(resolver()("/en/collection", "unchanged")).toBe("unchanged");
    expect(resolver()("/en/collection")).toBeUndefined();
  });

  it.each([undefined, () => "", () => "   ", () => undefined])("rejects missing or empty labels with route and export in the error", (label) => {
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