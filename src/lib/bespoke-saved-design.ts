import { COLORS, FINISHES, LENS_TYPES } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import type { BespokeConfig } from "@/lib/bespoke-state";

/**
 * Email captured by "Email me this design" (configurator) — reused to prefill
 * the Stripe checkout, so the buyer types one field less, never one more.
 */
export const SAVED_EMAIL_KEY = "woolet:bespoke:savedEmail";

export const readSavedEmail = (): string | null => {
  try {
    const v = localStorage.getItem(SAVED_EMAIL_KEY);
    return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
  } catch {
    return null;
  }
};

export const writeSavedEmail = (email: string) => {
  try {
    localStorage.setItem(SAVED_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    /* private mode */
  }
};

/** A full combination exists once the buyer has picked the front and the temples. */
export const hasSavableDesign = (c: BespokeConfig) => Boolean(c.frameId && c.frontColorId && c.templeColorId);

/**
 * Restore link built from the configurator's own deep-link params
 * (shape/front/temple/finish/tl, plus lens), landing on the review step.
 */
export function buildDesignUrl(c: BespokeConfig, utmCampaign = "bespoke_saved_design"): string {
  const p = new URLSearchParams();
  if (c.frameId) p.set("shape", c.frameId);
  if (c.frontColorId) p.set("front", c.frontColorId);
  if (c.templeColorId) p.set("temple", c.templeColorId);
  if (c.finishId) p.set("finish", c.finishId);
  if (c.templeLengthMm) p.set("tl", String(c.templeLengthMm));
  if (c.lensTypeId && c.lensTypeId !== "none") p.set("lens", c.lensTypeId);
  p.set("step", "6");
  p.set("utm_source", "ml");
  p.set("utm_medium", "email");
  p.set("utm_campaign", utmCampaign);
  return `https://woolet.co/en/bespoke/configurator?${p.toString()}`;
}

/** "Square · Deep matte black front · Havana temples · Matte" — for emails and Stripe metadata. */
export function designSummary(c: BespokeConfig): string {
  const frame = findFrame(c.frameId);
  const front = COLORS.find((x) => x.id === c.frontColorId);
  const temple = COLORS.find((x) => x.id === c.templeColorId);
  const finish = FINISHES.find((x) => x.id === c.finishId);
  const lens = LENS_TYPES.find((x) => x.id === c.lensTypeId);
  return [
    frame?.name,
    front && `${front.name} front`,
    temple && `${temple.name} temples`,
    finish?.name,
    lens && lens.id !== "none" ? lens.name : null,
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 200);
}
