import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BESPOKE_LENS_IDS, DEFAULT_PRICE_TABLE } from "../../supabase/functions/_shared/bespoke-pricing";
import { BESPOKE_PRICES } from "@/content/bespokePrices";
import { ACTIVE_LENS_TYPES } from "@/data/bespoke-options";
import { INITIAL_CONFIG, computePricing } from "@/lib/bespoke-state";

// 20.11.2026: Plano demo lenses are included and the default; frame only is no longer sold.
describe("Plano included, no frame-only option", () => {
  it("offers Plano and Blue Light only", () => {
    expect(ACTIVE_LENS_TYPES.map((l) => l.id)).toEqual(["plano", "blue-light"]);
    expect([...BESPOKE_LENS_IDS]).toEqual(["plano", "blue-light"]);
  });

  it("Plano is free and the default, Blue Light keeps its price", () => {
    expect(BESPOKE_PRICES.planoUsd).toBe(0);
    expect(DEFAULT_PRICE_TABLE["lens:plano"]).toBe(0);
    expect(BESPOKE_PRICES.blueLightUsd).toBe(84);
    expect(INITIAL_CONFIG.lensTypeId).toBe("plano");
    expect(computePricing({ ...INITIAL_CONFIG, frameId: "aviator" }).totalEur).toBe(BESPOKE_PRICES.frameUsd);
  });

  it("migration sets the live Plano price to 0 and drops the frame-only row", () => {
    const sql = readFileSync("supabase/migrations/20261120120000_bespoke_plano_included.sql", "utf8");
    expect(sql).toMatch(/amount_usd = 0[\s\S]*key = 'lens:plano'/);
    expect(sql).toContain("delete from public.bespoke_pricing where key = 'lens:none'");
  });
});
