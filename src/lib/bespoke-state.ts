import { useCallback, useEffect, useMemo, useState } from "react";
import { ENGRAVING_FEE_EUR, LENS_TYPES, type MeasurementKey } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";

export type Measurements = Partial<Record<MeasurementKey, number>>;

export interface BespokeConfig {
  frameId: string | null;
  frontColorId: string | null;
  templeColorId: string | null;
  finishId: string | null;
  measurementMethod: "scan" | "tape" | null;
  measurements: Measurements;
  consentTimestamp: string | null;
  engravingEnabled: boolean;
  engravingText: string;
  engravingPositionId: string | null;
  engravingFontId: string | null;
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
  measurementMethod: null,
  measurements: {},
  consentTimestamp: null,
  engravingEnabled: false,
  engravingText: "",
  engravingPositionId: null,
  engravingFontId: null,
  lensTypeId: "plano",
  lensMaterialId: null,
  lensCoatingId: "none",
  prescriptionFileName: null,
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = "woolet:bespoke:v1";

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

export const formatEur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepMeta {
  id: StepId;
  label: string;
  shortLabel: string;
}

export const STEPS: StepMeta[] = [
  { id: 1, label: "Choose frame",          shortLabel: "Frame" },
  { id: 2, label: "Compose colour",        shortLabel: "Colour" },
  { id: 3, label: "Engraving",             shortLabel: "Engraving" },
  { id: 4, label: "Lenses & prescription", shortLabel: "Lenses" },
  { id: 5, label: "Measure your fit",      shortLabel: "Fit" },
  { id: 6, label: "Review",                shortLabel: "Review" },
];

export function isStepComplete(step: StepId, config: BespokeConfig): boolean {
  switch (step) {
    case 1: return Boolean(config.frameId);
    case 2: return Boolean(config.frontColorId && config.templeColorId && config.finishId);
    case 3: return !config.engravingEnabled || Boolean(config.engravingText.trim() && config.engravingPositionId && config.engravingFontId);
    case 4: return Boolean(config.lensTypeId);
    case 5: return Boolean(config.measurements.pd && (config.consentTimestamp !== null || config.measurementMethod === "tape"));
    case 6: return true;
  }
}
