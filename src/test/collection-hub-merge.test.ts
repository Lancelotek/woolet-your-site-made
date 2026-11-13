import { describe, it, expect } from "vitest";
import { getAllRoutes, getMetadata } from "@/seo/metadata";
import { ALL_REDIRECTS, resolveLegacyRedirect } from "@/seo/legacyRedirects";
import { COLLECTION_HUB, MERGED_COLLECTION_SLUGS } from "@/seo/routeRedirects";

const routes = new Set(getAllRoutes());

describe("keyword collections merged into the wide-faces / big-heads hub", () => {
  it("the hub is a real, indexable page with the purchase title and H1", () => {
    expect(routes.has(COLLECTION_HUB)).toBe(true);
    const meta = getMetadata(COLLECTION_HUB);
    expect(meta.title).toBe("Glasses for Wide Faces & Big Heads - 158 mm Frames | Woolet");
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.noscriptHtml).toContain("<h1>Glasses for Wide Faces and Big Heads</h1>");
    expect(meta.robots ?? "").not.toContain("noindex");
  });

  it.each([...MERGED_COLLECTION_SLUGS])("/en/collections/%s is no longer a page and redirects to the hub", (slug) => {
    const path = `/en/collections/${slug}`;
    expect(routes.has(path)).toBe(false);
    expect(resolveLegacyRedirect(path)).toBe(COLLECTION_HUB);
    expect(resolveLegacyRedirect(`/de/collections/${slug}`)).toBe(COLLECTION_HUB);
  });

  it("no redirect points at another redirect (no chains)", () => {
    const chains = Object.entries(ALL_REDIRECTS).filter(([, to]) => resolveLegacyRedirect(to) !== null);
    expect(chains).toEqual([]);
  });

  it("no prerendered page links to a merged collection", () => {
    const merged = MERGED_COLLECTION_SLUGS.map((s) => `/en/collections/${s}"`);
    const offenders = [...routes].filter((r) => {
      const html = getMetadata(r).noscriptHtml ?? "";
      return merged.some((m) => html.includes(m));
    });
    expect(offenders).toEqual([]);
  });
});
