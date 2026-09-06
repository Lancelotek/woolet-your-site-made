import { describe, it, expect } from "vitest";
import { resolveHeroVariant, DEFAULT_HERO_VARIANT } from "@/content/ksHeroVariants";

describe("resolveHeroVariant", () => {
  const cases: Array<[string | null | undefined, string]> = [
    ["m4-not-the-style-man", "not-the-style"],
    ["m4b-not-the-style-greybeard", "not-the-style"],
    ["r2-not-the-style-man", "not-the-style"],
    ["m2-too-small-man", "too-small"],
    ["r1-too-small-man", "too-small"],
    ["m1-red-marks-man", "red-marks"],
    ["r3-red-marks-man", "red-marks"],
    ["m5-digging-in-real", "digging-in"],
    ["m3-temples-bent-man", "temples-bent"],
    ["r4-temples-bent-man", "temples-bent"],
    ["p4-video-reframe", "default"],
    ["", "default"],
    [null, "default"],
    [undefined, "default"],
    ["M4-Not-The-Style-Man", "not-the-style"],
  ];

  for (const [input, expected] of cases) {
    it(`resolves ${JSON.stringify(input)} to ${expected}`, () => {
      expect(resolveHeroVariant(input).key).toBe(expected);
    });
  }

  it("returns the untouched default copy for unknown values", () => {
    expect(resolveHeroVariant("p1-something-else").variant).toEqual(DEFAULT_HERO_VARIANT);
    expect(DEFAULT_HERO_VARIANT.h1).toBe("Eyewear built for wide faces.");
  });
});
