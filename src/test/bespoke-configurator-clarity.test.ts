import { describe, expect, it, vi } from "vitest";
import { computePricing, INITIAL_CONFIG } from "@/lib/bespoke-state";
import { LENS_TYPES } from "@/data/bespoke-options";
import { selectPatternRenders } from "@/lib/bespoke-pattern-renders";
import { trackBespokeFunnel } from "@/pages/bespoke/cfg-shell";

describe("Bespoke configurator clarity", () => {
  it("shows the $480 base even before choosing a pattern", () => {
    expect(computePricing(INITIAL_CONFIG).totalEur).toBe(480);
  });

  it.each(LENS_TYPES)("itemizes $name without hidden acetate/finish charges", (lens) => {
    const price = computePricing({ ...INITIAL_CONFIG, frameId: "round", frontColorId: "a332-1203", finishId: "brushed", lensTypeId: lens.id, engravingEnabled: true });
    expect(price.basePriceEur).toBe(480);
    expect(price.engravingEur).toBe(10);
    expect(price.lensEur).toBe(lens.priceEur);
    expect(price.totalEur).toBe(price.basePriceEur + price.engravingEur + price.lensEur);
  });

  it("keeps the first most-served/newest example per canonical shape", () => {
    const rows = [
      { shape: "Round", public_url: "popular.png", alt_text: "Round render" },
      { shape: "round", public_url: "other.png", alt_text: "Other render" },
      { shape: "Crown Panto", public_url: "crown.png", alt_text: "Crown render" },
    ];
    expect(selectPatternRenders(rows).round).toEqual(rows[0]);
    expect(selectPatternRenders(rows)["crown-panto"]).toEqual(rows[2]);
    expect(selectPatternRenders([])).toEqual({});
  });

  it("emits funnel dataLayer events even if Clarity throws", () => {
    const w = window as typeof window & { clarity?: (...args: unknown[]) => void; dataLayer?: Record<string, unknown>[] };
    w.dataLayer = [];
    w.clarity = vi.fn(() => { throw new Error("unavailable"); });
    expect(() => trackBespokeFunnel("bespoke_step_view", { step: 1, step_name: "pattern" })).not.toThrow();
    expect(w.clarity).toHaveBeenCalledWith("event", "bespoke_step_view");
    expect(w.dataLayer).toContainEqual({ event: "bespoke_step_view", step: 1, step_name: "pattern" });
    delete w.clarity;
  });
});
describe("Engraving default", () => {
  it("charges nothing for enabled-but-empty engraving and clears legacy Tom Smith", async () => {
    const { clearLegacyEngraving } = await import("@/lib/bespoke-state");
    expect(computePricing({ ...INITIAL_CONFIG, engravingEnabled: true, engravingText: "" }).totalEur).toBe(480);
    const cleared = clearLegacyEngraving({ ...INITIAL_CONFIG, engravingEnabled: true, engravingText: "Tom Smith" });
    expect(cleared.engravingText).toBe("");
    expect(computePricing(cleared).totalEur).toBe(480);
    expect(clearLegacyEngraving({ ...INITIAL_CONFIG, engravingEnabled: true, engravingText: "Anna" }).engravingText).toBe("Anna");
  });
});
