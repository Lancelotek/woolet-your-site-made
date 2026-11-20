// Acetate sheet stock at the atelier (Warren, Thessaloniki).
//
// ONE place to update when the workshop sends a new stock list. The
// configurator greys out anything not stocked, and create-bespoke-checkout
// rejects an order that names an out-of-stock sheet, so a buyer can never pay
// for a colour the workshop cannot cut.
//
// Fronts are cut from 6 mm plates, temples from 4 mm plates, so stock is kept
// per plate thickness: a sheet held only at 4 mm can be a temple, not a front.
//
// How to update: set `front` (6 mm) / `temple` (4 mm) to true or false for the
// code, and bump ACETATE_STOCK_UPDATED. A code missing from this table counts
// as out of stock. Codes are written as on the workshop list ("P632 0006").
//
// Pure TypeScript, no imports: used by the browser bundle and by Deno.

export const ACETATE_STOCK_UPDATED = "2026-11-20";
export const ACETATE_STOCK_SOURCE = "Warren stock list (stock acetate.pdf), orders 2024 to 2026b";

export interface AcetateStock {
  /** 6 mm plate in stock: can be cut as a FRONT. */
  front: boolean;
  /** 4 mm plate in stock: can be cut as TEMPLES. */
  temple: boolean;
}

export type AcetatePart = keyof AcetateStock;

const STOCK_BY_CODE: Record<string, AcetateStock> = {
  // Sheets offered in the configurator
  "P632 0006": { front: true,  temple: true  }, // Dark tortoise
  "P601 0009": { front: false, temple: false }, // Amber tortoise - 6 mm OUT OF STOCK, no 4 mm
  "P634 0813": { front: false, temple: true  }, // Amber mint chip - 4 mm only
  "P685 1583": { front: false, temple: true  }, // Emerald rose - 4 mm only
  "A305 2826": { front: true,  temple: true  }, // Deep matte black - restocked in order 2026b
  "P668 6006": { front: true,  temple: false }, // Slate grain - 6 mm only
  "A132 1960": { front: true,  temple: true  }, // Smoke translucent
  "3102 7110": { front: true,  temple: false }, // Ice translucent - 6 mm only
  "A102 8421": { front: true,  temple: true  }, // Nude beige
  "A332 1203": { front: true,  temple: true  }, // British racing green
  "A078 5208": { front: false, temple: true  }, // Navy - 4 mm only

  // Retired from the picker (stay retired; stock kept here for reference)
  "P554 1365": { front: true,  temple: false }, // Bordeaux marble
  "P610 3013": { front: true,  temple: true  }, // Honey tortoise
  "P649 2301": { front: false, temple: false }, // Ember sparkle - OUT OF STOCK
  "3096 1110": { front: false, temple: false }, // Piano black - OUT OF STOCK (4 and 6 mm)
  "A423 1176": { front: false, temple: false }, // Black · red core - OUT OF STOCK
  "A090 0135": { front: true,  temple: true  }, // Rouge
  "3102 1106": { front: true,  temple: false }, // Sunflower
  "P844 5962": { front: false, temple: true  }, // Olive marble

  // On the workshop list, not in the configurator yet (no swatch photo / name)
  "P654 7243": { front: true,  temple: false },
  "A497 3008": { front: true,  temple: true  },
  "P634 0815": { front: true,  temple: true  },
  "P619 1476": { front: true,  temple: true  },
  "A132 1957": { front: true,  temple: true  },
  "P605 0527": { front: true,  temple: true  },
  "P629 1069": { front: true,  temple: false },
  "P679 1763": { front: false, temple: true  },
  "P634 0811": { front: false, temple: false }, // OUT OF STOCK
};

/** "P632 0006", "p632-0006", "Dark tortoise (P632 0006)" -> "P6320006". */
export const normalizeAcetateCode = (value: string | null | undefined): string => {
  if (!value) return "";
  const inParens = /\(([^()]*)\)\s*$/.exec(value);
  return (inParens ? inParens[1] : value).toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const STOCK = new Map(Object.entries(STOCK_BY_CODE).map(([code, s]) => [normalizeAcetateCode(code), s]));

/** Stock for a code or colour id. Unknown sheets are out of stock. */
export const acetateStock = (codeOrId: string | null | undefined): AcetateStock =>
  STOCK.get(normalizeAcetateCode(codeOrId)) ?? { front: false, temple: false };

/** Can this sheet be cut as the given part right now? */
export const isAcetateInStock = (codeOrId: string | null | undefined, part: AcetatePart): boolean =>
  acetateStock(codeOrId)[part];

/**
 * Server-side check of an order's acetates. Returns an error code, or null when
 * both sheets are in stock for their part.
 */
export function acetateSelectionError(front: string | null | undefined, temple: string | null | undefined): string | null {
  if (!normalizeAcetateCode(front) || !normalizeAcetateCode(temple)) return "acetate_missing";
  if (!isAcetateInStock(front, "front")) return "front_acetate_out_of_stock";
  if (!isAcetateInStock(temple, "temple")) return "temple_acetate_out_of_stock";
  return null;
}
