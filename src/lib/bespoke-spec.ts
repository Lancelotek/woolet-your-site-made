/**
 * Single source of truth for the bespoke frame dimensions.
 *
 * These are THREE different measurements — never merge them:
 *  - front width  145–172 mm  (the bespoke size range)
 *  - bridge        20–24 mm
 *  - temple length 145–155 mm
 *
 * Stock frames are a fixed 158 mm front, fitting faces 155–161 mm.
 */
export const BESPOKE_SPEC = {
  frontWidthMin: 145,
  frontWidthMax: 172,
  bridgeMin: 20,
  bridgeMax: 24,
  templeMin: 145,
  templeMax: 155,
  stockFrontWidth: 158,
  stockFitMin: 155,
  stockFitMax: 161,
} as const;

/** "145–172 mm" — en dash, the canonical way the front width is written in copy. */
export const BESPOKE_FRONT_WIDTH_RANGE = `${BESPOKE_SPEC.frontWidthMin}–${BESPOKE_SPEC.frontWidthMax} mm`;
/** "20–24 mm" */
export const BESPOKE_BRIDGE_RANGE = `${BESPOKE_SPEC.bridgeMin}–${BESPOKE_SPEC.bridgeMax} mm`;
/** "145–155 mm" — temple length, NOT the front width range. */
export const BESPOKE_TEMPLE_RANGE = `${BESPOKE_SPEC.templeMin}–${BESPOKE_SPEC.templeMax} mm`;
/** "155–161 mm" — the stock fit band. */
export const STOCK_FIT_RANGE = `${BESPOKE_SPEC.stockFitMin}–${BESPOKE_SPEC.stockFitMax} mm`;
