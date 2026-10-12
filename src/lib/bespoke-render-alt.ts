// Deterministic ALT text for bespoke AI renders.
// Mirror of supabase/functions/_shared/bespoke-render.ts (buildAlt) — keep in sync.
import { COLORS, FINISHES, LENS_TYPES } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import { lensTintCode } from "@/lib/bespoke-state";
import type { BespokeConfig } from "@/lib/bespoke-state";

const SUN: Record<string, string> = {
  "SUN-GRY": "smoke grey", "SUN-BRN": "espresso brown", "SUN-G15": "G-15 green", "SUN-BGR": "brown gradient",
};
const PHOTO: Record<string, string> = { "PH-BRN": "espresso brown", "PH-GRN": "bottle green", "PH-GRY": "graphite grey" };
const FINISH_WORD: Record<string, string> = { shiny: "hand-polished", matte: "matte", brushed: "brushed" };

export function lensDescription(lensType?: string | null, tint?: string | null): string {
  const t = (tint ?? "").toUpperCase();
  switch (lensType ?? "plano") {
    case "sun-uv400": return SUN[t] ? `UV400 sun lenses in ${SUN[t]}` : "UV400 sun lenses";
    case "photochromic": return PHOTO[t] ? `photochromic lenses in ${PHOTO[t]}` : "photochromic lenses";
    case "blue-light": return "clear lenses with an optional blue-light filter coating";
    case "reading": return "clear reading lenses";
    default: return "clear plano lenses";
  }
}

/** ALT for the render of a config. Pass includeLens=false for clear-lens (pre-lens step) renders. */
export function renderAltForConfig(config: BespokeConfig, includeLens = true): string {
  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = includeLens ? LENS_TYPES.find((l) => l.id === config.lensTypeId) : undefined;
  if (!frame || !front || !temple || !finish) return "AI preview of a Woolet Bespoke made-to-measure frame";
  return `Woolet Bespoke ${frame.shape} eyeglasses, front in ${front.name} Mazzucchelli acetate, temples in ${temple.name}, ${FINISH_WORD[finish.id] ?? finish.name.toLowerCase()} finish, ${lensDescription(lens?.id, lens ? lensTintCode(config) : null)} - AI preview of a made-to-measure frame`;
}
