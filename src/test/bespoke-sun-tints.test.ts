import { describe, expect, it } from "vitest";
import { SUN_TINTS, SUN_TINT_NOTE, findSunTint } from "@/data/bespoke-options";
import { INITIAL_CONFIG, isStepComplete, lensOrderValue, lensTintCode, selectedLensTint } from "@/lib/bespoke-state";

describe("Bespoke sun lens colours", () => {
  it("keeps stable production codes and distinct swatches", () => {
    expect(SUN_TINTS.map((t) => t.code)).toEqual(["SUN-GRY", "SUN-BRN", "SUN-G15", "SUN-BGR"]);
    expect(new Set(SUN_TINTS.map((t) => t.image)).size).toBe(4);
    expect(findSunTint("brown-gradient")?.hex).toContain("linear-gradient");
    expect(SUN_TINT_NOTE).toContain("category 2-3");
  });

  it("requires a sun tint and includes its name and code in the order", () => {
    const noTint = { ...INITIAL_CONFIG, lensTypeId: "sun-uv400" };
    expect(isStepComplete(6, noTint)).toBe(false);
    const chosen = { ...noTint, lensTintId: "g15" };
    expect(isStepComplete(6, chosen)).toBe(true);
    expect(lensTintCode(chosen)).toBe("SUN-G15");
    expect(lensOrderValue("Sun Lenses (UV400)", chosen)).toBe("Sun Lenses (UV400) - G-15 Green (SUN-G15)");
    expect(selectedLensTint({ ...chosen, lensTypeId: "blue-light" })).toBeUndefined();
  });
});