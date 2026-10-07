import { describe, expect, it } from "vitest";
import images from "@/data/optimized-images.json";
import { imageSrcSet, imageVariant, optimizedImage } from "./optimized-image";

describe("responsive image derivatives", () => {
  const source = Object.keys(images).find((key) => key.endsWith("/woolet-009-black.png")) ?? "";
  it("uses a 240px WebP for small product thumbnails", () => {
    expect(imageVariant(source, 240)).toMatch(/240\.webp$/);
  });
  it("exposes the 480, 800 and 1200px product sources", () => {
    expect(imageSrcSet(source)).toMatch(/480w.*800w.*1200w/);
  });
  it("matches fingerprinted images without changing unknown images", () => {
    expect(optimizedImage("/assets/woolet-009-black-abcdef.png")?.width).toBe(1080);
    expect(imageVariant("/unrelated-photo.webp")).toBe("/unrelated-photo.webp");
  });
});