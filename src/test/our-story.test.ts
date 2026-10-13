import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { getAllRoutes, getMetadata, renderHeadHtml } from "@/seo/metadata";
import { STORY_TITLE, STORY_DESCRIPTION, STORY_H1, STORY_HTML, STORY_PHOTOS, STORY_JSONLD } from "@/content/our-story";
import organization from "@/content/organization.json";

describe("Owner-approved Our story", () => {
  const meta = getMetadata("/en/our-story");
  it("registers an indexable English route with exact head and no translation cluster", () => {
    expect(getAllRoutes()).toContain("/en/our-story");
    expect(meta.title).toBe(STORY_TITLE);
    expect(meta.description).toBe(STORY_DESCRIPTION);
    expect(meta.canonical).toBe("https://woolet.co/en/our-story");
    expect(meta.robots ?? "index, follow").not.toContain("noindex");
    expect(renderHeadHtml(meta)).not.toContain("hreflang=");
    expect(meta.jsonLd).toContainEqual(STORY_JSONLD);
  });
  it("preserves the exact headline, story facts and no payment asks", () => {
    const text = STORY_HTML.replace(/<[^>]*>/g, "");
    expect(text).toContain(STORY_H1);
    expect(text).toContain("2,627 backers pledged $332,694.");
    expect(text).toContain("Bielsko-Biała, Poland - four people, Italian acetate.");
    expect(text).toContain("Woolet launches on Kickstarter on October 29.");
    expect(text).not.toContain("—");
    expect(text).not.toMatch(/\$1\b|reservation|pay now/i);
    expect(meta.noscriptHtml).toContain('href="/en/lp/kickstarter"');
    expect(meta.noscriptHtml).toContain('href="/en/fit"');
  });
  it("includes original JPGs, WebP sources, exact ALT and reserved dimensions", () => {
    for (const photo of Object.values(STORY_PHOTOS)) {
      expect(existsSync(`public/images/${photo.file}.jpg`)).toBe(true);
      expect(existsSync(`public/images/${photo.file}.webp`)).toBe(true);
      expect(STORY_HTML).toContain(`alt="${photo.alt}"`);
      expect(STORY_HTML).toContain(`width="${photo.width}" height="${photo.height}"`);
    }
    expect(STORY_HTML.match(/loading="eager"/g)).toHaveLength(1);
    expect(STORY_HTML.match(/loading="lazy"/g)).toHaveLength(5);
  });
  it("keeps one consistent Organization definition and AboutPage references", () => {
    const html = readFileSync("index.html", "utf8");
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(blocks.filter((o) => o["@type"] === "Organization")).toEqual([organization]);
    expect(organization.founder.name).toBe("Marek Cieśla");
    expect(STORY_JSONLD.mainEntity).toEqual({ "@id": organization["@id"] });
    const footer = readFileSync("src/components/Footer.tsx", "utf8");
    expect(footer).toContain('lang === "en" ? [{ label: "Our story", href: "/en/our-story" }]');
    expect(readFileSync("src/components/Navbar.tsx", "utf8")).not.toContain("/en/our-story");
  });
});