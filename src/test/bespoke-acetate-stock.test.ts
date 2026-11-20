import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  acetateSelectionError,
  isAcetateInStock,
  normalizeAcetateCode,
} from "../../supabase/functions/_shared/bespoke-acetate-stock";
import { ACTIVE_COLORS, COLORS, frontColors, resolveColorForPart, templeColors } from "@/data/bespoke-options";
import { INITIAL_CONFIG, isStepComplete } from "@/lib/bespoke-state";

describe("acetate stock", () => {
  it("normalises codes, ids and order strings the same way", () => {
    expect(normalizeAcetateCode("P632 0006")).toBe("P6320006");
    expect(normalizeAcetateCode("p632-0006")).toBe("P6320006");
    expect(normalizeAcetateCode("Dark tortoise (P632 0006)")).toBe("P6320006");
    expect(normalizeAcetateCode("Black · red core (A423 1176)")).toBe("A4231176");
  });

  it("follows the 20.11.2026 workshop list", () => {
    expect(isAcetateInStock("p601-0009", "front")).toBe(false); // Amber tortoise
    expect(isAcetateInStock("p601-0009", "temple")).toBe(false);
    expect(isAcetateInStock("a078-5208", "front")).toBe(false); // Navy: 4 mm only
    expect(isAcetateInStock("a078-5208", "temple")).toBe(true);
    expect(isAcetateInStock("p668-6006", "temple")).toBe(false); // Slate grain: 6 mm only
    expect(isAcetateInStock("a305-2826", "front")).toBe(true); // restocked 2026b
    expect(isAcetateInStock("unknown-code", "front")).toBe(false);
  });

  it("every colour in the catalogue has a stock entry", () => {
    const table = readFileSync("supabase/functions/_shared/bespoke-acetate-stock.ts", "utf8");
    for (const c of COLORS) expect(table.includes(`"${c.code}"`), c.code).toBe(true);
  });

  it("pickers only offer in-stock sheets, and the house default is in stock", () => {
    expect(frontColors().every((c) => isAcetateInStock(c.code, "front"))).toBe(true);
    expect(templeColors().every((c) => isAcetateInStock(c.code, "temple"))).toBe(true);
    expect(frontColors().length).toBeGreaterThan(0);
    expect(templeColors().length).toBeGreaterThan(0);
    expect(resolveColorForPart("a305-2826", "front")).toBe("a305-2826");
    expect(resolveColorForPart("a305-2826", "temple")).toBe("a305-2826");
  });

  it("drops out-of-stock sheets from restored sessions and links", () => {
    expect(resolveColorForPart("p601-0009", "front")).toBeNull();
    expect(resolveColorForPart("a078-5208", "front")).toBeNull();
    expect(resolveColorForPart("a078-5208", "temple")).toBe("a078-5208");
    // Retired sheets still map to the house black.
    expect(resolveColorForPart("3096-1110", "front")).toBe("a305-2826");
  });

  it("step 2 cannot complete with an out-of-stock sheet", () => {
    const base = { ...INITIAL_CONFIG, frontColorId: "a305-2826", templeColorId: "a305-2826", finishId: "matte" };
    expect(isStepComplete(2, base)).toBe(true);
    expect(isStepComplete(2, { ...base, frontColorId: "p601-0009" })).toBe(false);
    expect(isStepComplete(2, { ...base, templeColorId: "p668-6006" })).toBe(false);
  });

  it("server check rejects out-of-stock or missing acetates", () => {
    expect(acetateSelectionError("p632-0006", "p632-0006")).toBeNull();
    expect(acetateSelectionError("Dark tortoise (P632 0006)", "Navy (A078 5208)")).toBeNull();
    expect(acetateSelectionError("Amber tortoise (P601 0009)", "p632-0006")).toBe("front_acetate_out_of_stock");
    expect(acetateSelectionError("p632-0006", "p668-6006")).toBe("temple_acetate_out_of_stock");
    expect(acetateSelectionError("", "p632-0006")).toBe("acetate_missing");
    expect(acetateSelectionError(undefined, undefined)).toBe("acetate_missing");
  });

  it("checkout function runs the stock check and the browser sends the colour ids", () => {
    const fn = readFileSync("supabase/functions/create-bespoke-checkout/index.ts", "utf8");
    expect(fn).toContain("acetateSelectionError(frontAcetate, templeAcetate)");
    const page = readFileSync("src/pages/bespoke/Checkout.tsx", "utf8");
    expect(page).toContain("frontColorId: config.frontColorId");
    expect(page).toContain("templeColorId: config.templeColorId");
  });

  it("active catalogue still has something to show", () => {
    expect(ACTIVE_COLORS.length).toBeGreaterThan(0);
  });
});
