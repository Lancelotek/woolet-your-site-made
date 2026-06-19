// Lightweight persistence for the last completed AI fit scan, so other parts
// of the app (e.g. the bespoke configurator) can prefill measurement tables
// from a recent scan without forcing the user to start a new scan session.

const STORAGE_KEY = "woolet_last_scan_v1";
const TTL_DAYS = 30;

export interface StoredScanResult {
  faceWidthMm: number;
  noseWidthMm: number;
  confidence: "low" | "medium" | "high";
  /** ms since epoch */
  savedAt: number;
}

export function saveScanResult(input: Omit<StoredScanResult, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredScanResult = { ...input, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function loadScanResult(): StoredScanResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredScanResult;
    if (!Number.isFinite(parsed.faceWidthMm) || !Number.isFinite(parsed.noseWidthMm)) return null;
    const ageDays = (Date.now() - parsed.savedAt) / (1000 * 60 * 60 * 24);
    if (ageDays > TTL_DAYS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearScanResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
