// Woolet Bespoke pricing - pure math shared by the checkout function and the
// browser (src/lib/bespoke-pricing.ts imports this file), so the number the
// buyer sees and the number Stripe charges come from the same code.
//
// Live prices sit in table `bespoke_pricing`, one row per key:
//   frame:base          made-to-measure frame
//   frame:<frameId>     optional per-model override
//   lens:<lensTypeId>   lens option (none / plano / blue-light)
//   engraving           temple engraving fee
// DEFAULT_PRICE_TABLE is used for any key the table does not return.
// Keep the defaults equal to src/content/bespokePrices.ts (a test checks).

export type PriceTable = Record<string, number>;

export const DEFAULT_PRICE_TABLE: PriceTable = {
  "frame:base": 480,
  "lens:none": 0,
  "lens:plano": 30,
  "lens:blue-light": 84,
  "engraving": 10,
};

/** Models a buyer can order. Mirrors src/data/frames.ts. */
export const BESPOKE_FRAME_IDS = ["aviator", "rectangle", "crown-panto", "round"] as const;
/** Lens options a buyer can order. Retired options are rejected at checkout. */
export const BESPOKE_LENS_IDS = ["none", "plano", "blue-light"] as const;

export const MAX_PRICE_USD = 10000;

export interface BespokeSelection {
  frameId: string;
  lensTypeId: string;
  engraving: boolean;
}

export interface BespokeQuote {
  baseUsd: number;
  lensUsd: number;
  engravingUsd: number;
  totalUsd: number;
}

/** Merge DB rows over the defaults, dropping anything that is not a sane price. */
export function mergePriceRows(rows: Array<{ key: string; amount_usd: number | string }> | null | undefined): PriceTable {
  const table: PriceTable = { ...DEFAULT_PRICE_TABLE };
  for (const row of rows ?? []) {
    const n = Number(row?.amount_usd);
    if (typeof row?.key === "string" && Number.isFinite(n) && n >= 0 && n <= MAX_PRICE_USD) {
      table[row.key] = Math.round(n * 100) / 100;
    }
  }
  return table;
}

export const framePrice = (table: PriceTable, frameId: string | null | undefined) =>
  table[`frame:${frameId}`] ?? table["frame:base"] ?? DEFAULT_PRICE_TABLE["frame:base"];

export const lensPrice = (table: PriceTable, lensTypeId: string | null | undefined) =>
  table[`lens:${lensTypeId}`] ?? DEFAULT_PRICE_TABLE[`lens:${lensTypeId}`] ?? 0;

export const engravingPrice = (table: PriceTable) =>
  table["engraving"] ?? DEFAULT_PRICE_TABLE["engraving"];

export function quoteBespoke(table: PriceTable, sel: BespokeSelection): BespokeQuote {
  const baseUsd = framePrice(table, sel.frameId);
  const lensUsd = lensPrice(table, sel.lensTypeId);
  const engravingUsd = sel.engraving ? engravingPrice(table) : 0;
  return { baseUsd, lensUsd, engravingUsd, totalUsd: Math.round((baseUsd + lensUsd + engravingUsd) * 100) / 100 };
}

/** Apply a percent-off coupon in cents. Stripe cannot charge $0, so the floor is $1. */
export function applyPercentOff(grossCents: number, percentOff: number): number {
  return Math.max(100, Math.round((grossCents * (100 - percentOff)) / 100));
}
