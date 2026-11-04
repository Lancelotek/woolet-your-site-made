import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { BESPOKE_COPY, BESPOKE_PRICES } from "@/content/bespokePrices";
import { INITIAL_CONFIG, computePricing } from "@/lib/bespoke-state";
import { DEFAULT_PRICE_TABLE as DEFAULTS_FOR_RESET, __setPriceTableForTests } from "@/lib/bespoke-pricing";
import {
  BESPOKE_FRAME_IDS,
  BESPOKE_LENS_IDS,
  DEFAULT_PRICE_TABLE,
  applyPercentOff,
  mergePriceRows,
  quoteBespoke,
} from "../../supabase/functions/_shared/bespoke-pricing";
import { FRAMES } from "@/data/frames";
import { ACTIVE_LENS_TYPES } from "@/data/bespoke-options";

afterEach(() => __setPriceTableForTests({ ...DEFAULTS_FOR_RESET }));

describe("bespoke price table", () => {
  it("server defaults equal the copy constants", () => {
    expect(DEFAULT_PRICE_TABLE["frame:base"]).toBe(BESPOKE_PRICES.frameUsd);
    expect(DEFAULT_PRICE_TABLE["lens:plano"]).toBe(BESPOKE_PRICES.planoUsd);
    expect(DEFAULT_PRICE_TABLE["lens:blue-light"]).toBe(BESPOKE_PRICES.blueLightUsd);
    expect(DEFAULT_PRICE_TABLE["engraving"]).toBe(BESPOKE_PRICES.engravingUsd);
    expect(DEFAULT_PRICE_TABLE["lens:none"]).toBe(0);
  });

  it("MCP product list (static, generated into a Deno function) shows the current frame price", () => {
    const src = readFileSync(join(__dirname, "../lib/mcp/tools/list-products.ts"), "utf8");
    expect(src).toMatch(new RegExp(`regularUsd: ${BESPOKE_PRICES.frameUsd},`));
  });

  it("server accepts exactly the frames and lenses the configurator offers", () => {
    expect([...BESPOKE_FRAME_IDS].sort()).toEqual(FRAMES.map((f) => f.id).sort());
    expect([...BESPOKE_LENS_IDS].sort()).toEqual(ACTIVE_LENS_TYPES.map((l) => l.id).sort());
  });

  it("merges DB rows over defaults and drops bad values", () => {
    const t = mergePriceRows([
      { key: "frame:base", amount_usd: "520.00" },
      { key: "lens:plano", amount_usd: -5 },
      { key: "engraving", amount_usd: "abc" },
    ]);
    expect(t["frame:base"]).toBe(520);
    expect(t["lens:plano"]).toBe(DEFAULT_PRICE_TABLE["lens:plano"]);
    expect(t["engraving"]).toBe(DEFAULT_PRICE_TABLE["engraving"]);
  });

  it("quotes frame + lens + engraving, with per-model override", () => {
    const t = { ...DEFAULT_PRICE_TABLE, "frame:round": 450 };
    expect(quoteBespoke(t, { frameId: "aviator", lensTypeId: "blue-light", engraving: true }).totalUsd).toBe(480 + 84 + 10);
    expect(quoteBespoke(t, { frameId: "round", lensTypeId: "none", engraving: false }).totalUsd).toBe(450);
  });

  it("coupon never drops below the $1 Stripe minimum", () => {
    expect(applyPercentOff(48000, 40)).toBe(28800);
    expect(applyPercentOff(48000, 100)).toBe(100);
  });

  it("adds the engraving fee as soon as engraving is selected, before any text", () => {
    const base = { ...INITIAL_CONFIG, frameId: "aviator", lensTypeId: "none" };
    expect(computePricing({ ...base, engravingEnabled: true, engravingText: "" }).totalEur).toBe(BESPOKE_PRICES.frameUsd + BESPOKE_PRICES.engravingUsd);
    expect(computePricing({ ...base, engravingEnabled: false, engravingText: "MC" }).totalEur).toBe(BESPOKE_PRICES.frameUsd);
  });

  it("configurator total follows a live price change at once", () => {
    const config = { ...INITIAL_CONFIG, frameId: "aviator", lensTypeId: "plano" };
    expect(computePricing(config).totalEur).toBe(BESPOKE_PRICES.frameUsd + BESPOKE_PRICES.planoUsd);
    __setPriceTableForTests({ ...DEFAULT_PRICE_TABLE, "frame:base": 520, "lens:plano": 35 });
    expect(computePricing(config).totalEur).toBe(555);
  });
});

// Copy guard: prices are printed only through src/content/bespokePrices.ts.
// When this fails after a price change, the listed files still print the old number.
const ROOT = join(__dirname, "../..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(p) ? [p] : [];
  });

describe("bespoke price copy", () => {
  it("src never hardcodes a Bespoke price", () => {
    const literal = /\$480(?!\d)|\+\$30(?!\d)|\+\$84(?!\d)|\$299(?!\d)|["']480\.00["']/;
    const offenders = walk(join(ROOT, "src"))
      .filter((p) => !/bespokePrices\.ts$|\/test\/|\.test\.tsx?$/.test(p))
      .filter((p) => literal.test(readFileSync(p, "utf8")))
      .map((p) => relative(ROOT, p));
    expect(offenders).toEqual([]);
  });

  it("public AI summaries print the current prices", () => {
    for (const name of ["llms.txt", "llms-full.txt", "pricing.txt"]) {
      const text = readFileSync(join(ROOT, "public", name), "utf8");
      expect(text, name).toContain(BESPOKE_COPY.frame);
      expect(text, name).toContain(BESPOKE_COPY.plano);
      const bespokeLines = text.split("\n").filter((l) => /bespoke|regular price/i.test(l) && /\$\d/.test(l));
      for (const line of bespokeLines) {
        const amounts = line.match(/\$\d+(?:\.\d+)?/g) ?? [];
        const allowed = new Set([
          BESPOKE_COPY.frame, BESPOKE_COPY.kickstarter, `$${BESPOKE_PRICES.planoUsd}`, `$${BESPOKE_PRICES.blueLightUsd}`,
          "$1", "$114", "$190", "$210", "$260",
        ]);
        const stale = amounts.filter((a) => !allowed.has(a) && Number(a.slice(1)) >= 250 && Number(a.slice(1)) <= 700);
        expect(stale, `${name}: ${line.slice(0, 120)}`).toEqual([]);
      }
    }
  });
});
