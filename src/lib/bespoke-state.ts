import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_TEMPLE_LENGTH_MM, findLensTint, findSunTint, isValidTempleLength, ACTIVE_LENS_TYPES, resolveActiveColorId, type LensTint, type MeasurementKey, type ReadingStrength } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import { getPriceTable, quoteBespoke, usePriceTable, type PriceTable } from "@/lib/bespoke-pricing";

export type Measurements = Partial<Record<MeasurementKey, number>>;

export interface BespokeConfig {
  frameId: string | null;
  frontColorId: string | null;
  templeColorId: string | null;
  finishId: string | null;
  templeLengthMm: number | null;
  templeLengthIsCustom: boolean;
  measurementMethod: "scan" | "tape" | null;
  measurements: Measurements;
  consentTimestamp: string | null;
  scanContactEmail: string | null;
  scanContactPhone: string | null;
  scanRequestedAt: string | null;
  scanSessionId: string | null;
  scanSessionToken: string | null;
  scanCompletedAt: string | null;
  scanMeasurementsUnlocked: boolean;
  engravingEnabled: boolean;
  engravingText: string;
  engravingPositionId: string | null;
  engravingFontId: string | null;
  engravingOffset: { x: number; y: number };
  lensTypeId: string | null;
  /** Reading lens only — dioptre strength. */
  readingStrengthMode: "same" | "different" | "confirm_later" | null;
  readingStrength: ReadingStrength | null;
  readingStrengthLeft: ReadingStrength | null;
  readingStrengthRight: ReadingStrength | null;
  /** Photochromic or sun lens tint id, resolved by lens type. */
  lensTintId: string | null;
  lensMaterialId: string | null;
  lensCoatingId: string | null;
  prescriptionFileName: string | null;
  /** "On your face" panel (step 3) — calibration only; the photo itself lives
   *  in its own localStorage key, never in the synced config. */
  facePhotoCardPoints: { x: number; y: number }[] | null;
  facePhotoTemplePoints: { x: number; y: number }[] | null;
  facePhotoSavedAt: string | null;
  updatedAt: string;
}


export const INITIAL_CONFIG: BespokeConfig = {
  frameId: null,
  frontColorId: null,
  templeColorId: null,
  finishId: null,
  templeLengthMm: DEFAULT_TEMPLE_LENGTH_MM,
  templeLengthIsCustom: false,
  measurementMethod: null,
  measurements: {},
  consentTimestamp: null,
  scanContactEmail: null,
  scanContactPhone: null,
  scanRequestedAt: null,
  scanSessionId: null,
  scanSessionToken: null,
  scanCompletedAt: null,
  scanMeasurementsUnlocked: false,

  engravingEnabled: false,
  engravingText: "",
  engravingPositionId: null,
  engravingFontId: null,
  engravingOffset: { x: 0, y: 0 },
  // Default: frame only - the total starts at the bare frame price.
  lensTypeId: "none",
  readingStrengthMode: null,
  readingStrength: null,
  readingStrengthLeft: null,
  readingStrengthRight: null,
  lensTintId: null,
  lensMaterialId: null,
  lensCoatingId: "none",
  prescriptionFileName: null,
  facePhotoCardPoints: null,
  facePhotoTemplePoints: null,
  facePhotoSavedAt: null,
  updatedAt: new Date().toISOString(),
};

const LEGACY_DEFAULT_ENGRAVING = "tom smith";

/** Clears the retired "Tom Smith" default so returning visitors aren't charged for it. */
export function clearLegacyEngraving(c: BespokeConfig): BespokeConfig {
  if ((c.engravingText ?? "").trim().toLowerCase() !== LEGACY_DEFAULT_ENGRAVING) return c;
  return { ...c, engravingText: "", engravingEnabled: false };
}

/** Engraving is charged only when the customer actually typed text. */
export const hasEngraving = (c: BespokeConfig) => c.engravingEnabled && Boolean((c.engravingText ?? "").trim());

export const STORAGE_KEY = "woolet:bespoke:v1";

const loadInitial = (): BespokeConfig => {
  if (typeof window === "undefined") return INITIAL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CONFIG;
    const parsed = JSON.parse(raw) as BespokeConfig;
    const next = clearLegacyEngraving({ ...INITIAL_CONFIG, ...parsed });
    // Unpicked or retired lens options fall back to the "No lenses" default.
    if (!ACTIVE_LENS_TYPES.some((l) => l.id === next.lensTypeId)) {
      next.lensTypeId = "none";
      next.lensMaterialId = null;
      next.lensCoatingId = null;
    }
    if (next.lensTypeId === "sun-uv400" && !findSunTint(next.lensTintId)) next.lensTintId = "grey";
    if (next.lensTypeId === "photochromic" && !findLensTint(next.lensTintId)) next.lensTintId = null;
    if (next.lensTypeId !== "sun-uv400" && next.lensTypeId !== "photochromic") next.lensTintId = null;
    // Retired acetates fall back to Deep matte black so restored sessions stay valid.
    next.frontColorId = resolveActiveColorId(next.frontColorId);
    next.templeColorId = resolveActiveColorId(next.templeColorId);
    return next;
  } catch {
    return INITIAL_CONFIG;
  }
};

export function useBespokeConfig() {
  const [config, setConfig] = useState<BespokeConfig>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* quota / private mode — silent */
    }
  }, [config]);

  const update = useCallback(<K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }));
  }, []);

  const reset = useCallback(() => {
    setConfig({ ...INITIAL_CONFIG, updatedAt: new Date().toISOString() });
  }, []);

  const replace = useCallback((next: BespokeConfig) => {
    setConfig({ ...next, updatedAt: new Date().toISOString() });
  }, []);

  // Live prices: re-computes the moment a price changes in the admin panel.
  const prices = usePriceTable();
  const pricing = useMemo(() => computePricing(config, prices), [config, prices]);

  return { config, update, reset, replace, pricing };
}

export interface Pricing {
  basePriceEur: number;
  engravingEur: number;
  lensEur: number;
  totalEur: number;
}

/**
 * Price a configuration. Uses the live table from `bespoke_pricing` (see
 * src/lib/bespoke-pricing.ts); the checkout function runs the same
 * `quoteBespoke`, so the shown total is the charged total.
 */
export function computePricing(config: BespokeConfig, prices: PriceTable = getPriceTable()): Pricing {
  const q = quoteBespoke(prices, {
    frameId: findFrame(config.frameId)?.id ?? config.frameId ?? "",
    lensTypeId: config.lensTypeId ?? "none",
    // Charge from the moment the buyer picks "Add engraving", not after the
    // first keystroke. Step 4 cannot be completed (so checkout cannot open)
    // while engraving is on and the text is empty.
    engraving: config.engravingEnabled,
  });
  return {
    basePriceEur: q.baseUsd,
    engravingEur: q.engravingUsd,
    lensEur: config.lensTypeId ? q.lensUsd : 0,
    totalEur: q.totalUsd,
  };
}

// Kept name for import stability; formats USD.
export const formatEur = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** Consistent add-on display: "Included" at zero, otherwise "+ $10". */
export const formatAddOn = (n: number) => (n === 0 ? "Included" : `+${formatEur(n)}`);

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepMeta {
  id: StepId;
  label: string;
  shortLabel: string;
}

// Measurement is intentionally NOT a pre-payment step — it happens after the
// buyer pays for their chosen pattern. See StepReview + configurator banner.
// There is no separate preview step: the live render follows the build from
// step 1 (front colour) through review.
export const STEPS: StepMeta[] = [
  { id: 1, label: "Choose pattern",        shortLabel: "Pattern" },
  { id: 2, label: "Choose acetate",        shortLabel: "Acetate" },
  { id: 3, label: "Temple length",         shortLabel: "Temples" },
  { id: 4, label: "Engraving",             shortLabel: "Engraving" },
  { id: 5, label: "Lenses", shortLabel: "Lenses" },
  { id: 6, label: "Review & pay",          shortLabel: "Review" },
];

export function isStepComplete(step: StepId, config: BespokeConfig): boolean {
  switch (step) {
    case 1: return Boolean(config.frameId);
    case 2: return Boolean(config.frontColorId && config.templeColorId && config.finishId);
    case 3: return isValidTempleLength(config.templeLengthMm);
    case 4: return !config.engravingEnabled || Boolean(config.engravingText.trim() && config.engravingPositionId && config.engravingFontId);
    case 5: {
      if (!config.lensTypeId) return false;
      if (config.lensTypeId === "photochromic") return Boolean(findLensTint(config.lensTintId));
      if (config.lensTypeId === "sun-uv400") return Boolean(findSunTint(config.lensTintId));
      if (config.lensTypeId !== "reading") return true;
      return isReadingStrengthComplete(config);
    }
    case 6: return true;
  }
}

/* ───── Reading strength ───── */

export const isReadingStrengthComplete = (config: BespokeConfig): boolean => {
  switch (config.readingStrengthMode) {
    case "same": return Boolean(config.readingStrength);
    case "different": return Boolean(config.readingStrengthLeft && config.readingStrengthRight);
    case "confirm_later": return true;
    default: return false;
  }
};

/** Short label for summaries: "+2.00", "L +1.75 / R +2.25", "strength to confirm". */
export const formatReadingStrength = (config: BespokeConfig): string | null => {
  if (config.lensTypeId !== "reading") return null;
  switch (config.readingStrengthMode) {
    case "same": return config.readingStrength;
    case "different":
      return config.readingStrengthLeft && config.readingStrengthRight
        ? `L ${config.readingStrengthLeft} / R ${config.readingStrengthRight}`
        : null;
    case "confirm_later": return "strength to confirm";
    default: return null;
  }
};

/** Machine value for Stripe metadata / database: "+2.00", "L .. / R ..", "confirm_later". */
export const readingStrengthMetaValue = (config: BespokeConfig): string => {
  if (config.lensTypeId !== "reading") return "";
  if (config.readingStrengthMode === "confirm_later") return "confirm_later";
  return formatReadingStrength(config) ?? "";
};

/** Lens name with the strength appended, for order summaries. */
export const formatLensWithStrength = (lensName: string, config: BespokeConfig): string => {
  const tint = selectedLensTint(config);
  const name = tint ? `${lensName} · ${tint.name} (${tint.code})` : lensName;
  const strength = formatReadingStrength(config);
  return strength ? `${name} · ${strength}` : name;
};

/** Production string for the order: lens name + tint name + tint code,
 *  e.g. "Photochromic / Transition · Espresso Brown (PH-BRN)". */
export const lensOrderValue = (lensName: string, config: BespokeConfig): string => {
  const tint = selectedLensTint(config);
  if (config.lensTypeId === "none") return "No lenses (frame only)";
  if (config.lensTypeId === "plano") return `${lensName} (no Rx)`;
  return tint ? `${lensName} - ${tint.name} (${tint.code})` : lensName;
};

export const selectedLensTint = (config: BespokeConfig): LensTint | undefined =>
  config.lensTypeId === "sun-uv400" ? findSunTint(config.lensTintId) :
    config.lensTypeId === "photochromic" ? findLensTint(config.lensTintId) : undefined;

/** Tint code only (empty when no tint selected) — Stripe metadata `lens_tint`. */
export const lensTintCode = (config: BespokeConfig): string =>
  selectedLensTint(config)?.code ?? "";
