import { describe, it, expect } from "vitest";
import { getMetadata, SITE_URL } from "@/seo/metadata";

type JsonLdObj = Record<string, unknown>;

function findHowTo(jsonLd: object[]): JsonLdObj | undefined {
  return jsonLd.find(
    (o): o is JsonLdObj =>
      typeof o === "object" && o !== null && (o as JsonLdObj)["@type"] === "HowTo",
  );
}

describe("SEO metadata — /en/process", () => {
  const meta = getMetadata("/en/process");

  it("has a non-default, branded title under 70 chars", () => {
    expect(meta.title).toBeTruthy();
    expect(meta.title.length).toBeGreaterThan(20);
    expect(meta.title.length).toBeLessThanOrEqual(70);
    expect(meta.title).toMatch(/Woolet/i);
    expect(meta.title).toMatch(/process/i);
  });

  it("has a meaningful description (80–180 chars)", () => {
    expect(meta.description).toBeTruthy();
    expect(meta.description.length).toBeGreaterThanOrEqual(80);
    expect(meta.description.length).toBeLessThanOrEqual(180);
  });

  it("self-canonicalises to https://woolet.co/en/process", () => {
    expect(meta.canonical).toBe(`${SITE_URL}/en/process`);
  });

  it("is indexable (no noindex)", () => {
    expect(meta.robots ?? "index, follow").not.toMatch(/noindex/i);
  });

  it("ships a complete HowTo JSON-LD with all 13 steps", () => {
    const howTo = findHowTo(meta.jsonLd);
    expect(howTo, "HowTo JSON-LD must be present").toBeDefined();
    expect(howTo!["@context"]).toBe("https://schema.org");
    expect(howTo!.name).toBeTruthy();
    expect(howTo!.description).toBeTruthy();
    expect(howTo!.totalTime).toBe("P14D");
    expect(Array.isArray(howTo!.supply)).toBe(true);
    expect(Array.isArray(howTo!.tool)).toBe(true);

    const steps = howTo!.step as JsonLdObj[];
    expect(Array.isArray(steps)).toBe(true);
    expect(steps).toHaveLength(13);

    steps.forEach((step, i) => {
      expect(step["@type"]).toBe("HowToStep");
      expect(step.position).toBe(i + 1);
      expect(typeof step.name).toBe("string");
      expect((step.name as string).length).toBeGreaterThan(2);
      expect(typeof step.text).toBe("string");
      expect((step.text as string).length).toBeGreaterThan(20);
      expect(step.url).toBe(`${SITE_URL}/en/process#day-${i + 1}`);
      expect(step.image).toBeTruthy();
    });
  });
});

describe("SEO metadata — /pl/process", () => {
  const meta = getMetadata("/pl/process");

  it("has a Polish, non-default title under 70 chars", () => {
    expect(meta.title).toBeTruthy();
    expect(meta.title.length).toBeLessThanOrEqual(70);
    expect(meta.title.toLowerCase()).toMatch(/proces|woolet/);
  });

  it("has a meaningful Polish description (80–180 chars)", () => {
    expect(meta.description).toBeTruthy();
    expect(meta.description.length).toBeGreaterThanOrEqual(80);
    expect(meta.description.length).toBeLessThanOrEqual(180);
  });

  it("canonicalises to the EN page and is noindex", () => {
    expect(meta.canonical).toBe(`${SITE_URL}/en/process`);
    expect(meta.robots ?? "").toMatch(/noindex/i);
  });

  it("ships a complete HowTo JSON-LD with all 13 steps", () => {
    const howTo = findHowTo(meta.jsonLd);
    expect(howTo, "HowTo JSON-LD must be present").toBeDefined();
    expect(howTo!.totalTime).toBe("P14D");

    const steps = howTo!.step as JsonLdObj[];
    expect(steps).toHaveLength(13);

    steps.forEach((step, i) => {
      expect(step["@type"]).toBe("HowToStep");
      expect(step.position).toBe(i + 1);
      // Step URLs always point to the EN canonical (PL redirects to EN).
      expect(step.url).toBe(`${SITE_URL}/en/process#day-${i + 1}`);
      expect(typeof step.name).toBe("string");
      expect(typeof step.text).toBe("string");
    });
  });
});
