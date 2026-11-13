import { describe, it, expect } from "vitest";
import { getMetadata, getAllRoutes } from "@/seo/metadata";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON-LD is untyped data
type Ld = Record<string, any>;

const collectionRoutes = getAllRoutes().filter((r) => /^\/en\/collections\/[a-z0-9-]+$/.test(r));

describe("keyword collections carry Product/Offer in the prerendered JSON-LD", () => {
  it("covers every /en/collections/* route", () => {
    expect(collectionRoutes.length).toBeGreaterThanOrEqual(17);
  });

  it.each(collectionRoutes)("%s lists 007 and 009 with a pre-order offer", (route) => {
    const meta = getMetadata(route);
    const pages = (meta.jsonLd as Ld[]).filter((n) => n["@type"] === "CollectionPage");
    expect(pages).toHaveLength(1);
    const page = pages[0];
    expect(page.url).toBe(`https://woolet.co${route}`);
    expect(page.name).not.toMatch(/&(amp|lt|gt|quot|#\d+);/);
    expect(page.name.length).toBeGreaterThan(5);

    const items = page.mainEntity.itemListElement as Ld[];
    expect(items.map((i) => i.item.url)).toEqual([
      "https://woolet.co/en/products/007",
      "https://woolet.co/en/products/009",
    ]);
    for (const { item } of items) {
      expect(item["@type"]).toBe("Product");
      expect(item.description.length).toBeGreaterThan(50);
      expect(item.offers.price).toBe("114.00");
      expect(item.offers.priceCurrency).toBe("USD");
      expect(item.offers.availability).toBe("https://schema.org/PreOrder");
      expect(item.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(30);
      expect(item.offers.shippingDetails.length).toBeGreaterThan(0);
    }
  });

  it("does not touch non-collection routes", () => {
    const ld = getMetadata("/en/blog/glasses-for-wide-faces-guide").jsonLd as Ld[];
    expect(ld.some((n) => n["@type"] === "CollectionPage")).toBe(false);
  });
});
