import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_TEMPLE_LENGTH_MM, ENGRAVING_FEE_EUR, isValidTempleLength, LENS_TYPES, type MeasurementKey } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";

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
  lensMaterialId: string | null;
  lensCoatingId: string | null;
  prescriptionFileName: string | null;
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
  lensTypeId: "plano",
  lensMaterialId: null,
  lensCoatingId: "none",
  prescriptionFileName: null,
  updatedAt: new Date().toISOString(),
};

export const STORAGE_KEY = "woolet:bespoke:v1";

const loadInitial = (): BespokeConfig => {
  if (typeof window === "undefined") return INITIAL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CONFIG;
    const parsed = JSON.parse(raw) as BespokeConfig;
    return { ...INITIAL_CONFIG, ...parsed };
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

  const pricing = useMemo(() => computePricing(config), [config]);

  return { config, update, reset, replace, pricing };
}

export interface Pricing {
  basePriceEur: number;
  engravingEur: number;
  lensEur: number;
  totalEur: number;
}

export function computePricing(config: BespokeConfig): Pricing {
  const frame = findFrame(config.frameId);
  const basePriceEur = frame?.basePriceEur ?? 0;
  const engravingEur = config.engravingEnabled ? ENGRAVING_FEE_EUR : 0;
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);
  const lensEur = lens?.priceEur ?? 0;
  return {
    basePriceEur,
    engravingEur,
    lensEur,
    totalEur: basePriceEur + engravingEur + lensEur,
  };
}

// Kept name for import stability; formats USD.
export const formatEur = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** Consistent add-on display: "Included" at zero, otherwise "+ $10". */
export const formatAddOn = (n: number) => (n === 0 ? "Included" : `+ ${formatEur(n)}`);

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepMeta {
  id: StepId;
  label: string;
  shortLabel: string;
}

// Measurement is intentionally NOT a pre-payment step — it happens after the
// buyer pays for their chosen pattern. See StepReview + configurator banner.
export const STEPS: StepMeta[] = [
  { id: 1, label: "Choose pattern",        shortLabel: "Pattern" },
  { id: 2, label: "Choose acetate",        shortLabel: "Acetate" },
  { id: 3, label: "Temple length",         shortLabel: "Temples" },
  { id: 4, label: "Engraving",             shortLabel: "Engraving" },
  { id: 5, label: "Lenses & prescription", shortLabel: "Lenses" },
  { id: 6, label: "Review & pay",          shortLabel: "Review" },
];

export function isStepComplete(step: StepId, config: BespokeConfig): boolean {
  switch (step) {
    case 1: return Boolean(config.frameId);
    case 2: return Boolean(config.frontColorId && config.templeColorId && config.finishId);
    case 3: return isValidTempleLength(config.templeLengthMm);
    case 4: return !config.engravingEnabled || Boolean(config.engravingText.trim() && config.engravingPositionId && config.engravingFontId);
    case 5: return Boolean(config.lensTypeId);
    case 6: return true;
  }
}
