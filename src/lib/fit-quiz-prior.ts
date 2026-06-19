// Quiz prior — persisted answers from /fit/quick used as a sanity check
// against the AI scan. Scans occasionally return inconsistent widths (Gemini
// mis-marks the temple at hair edge vs skull). The quiz gives us a rough
// independent estimate we can blend or warn against.

const STORAGE_KEY = "woolet_fit_quiz_v1";
const TTL_DAYS = 30;

export type HatSize = "s" | "m" | "l" | "xl" | "xxl" | "unknown";
export type NoseWidth = "narrow" | "average" | "wide" | "unknown";

export interface QuizPrior {
  hat: HatSize | null;
  nose: NoseWidth | null;
  /** User's self-reported current frame width in mm (most reliable when present). */
  currentFrameMm: number | null;
  /** Face-width estimate derived from hat size (or fallback). */
  faceEstimateMm: number;
  /** ms since epoch */
  savedAt: number;
}

// Hat → face-width mapping (rough, based on head circumference → bizygomatic).
const HAT_TO_FACE_MM: Record<HatSize, number> = {
  s: 138,
  m: 146,
  l: 154,
  xl: 159,
  xxl: 164,
  unknown: 152,
};

// Nose category → typical nose-width mm (alar-to-alar).
const NOSE_TO_MM: Record<NoseWidth, number | null> = {
  narrow: 32,
  average: 36,
  wide: 40,
  unknown: null,
};

export function deriveFaceEstimate(hat: HatSize | null): number {
  return HAT_TO_FACE_MM[hat ?? "unknown"];
}

export function deriveNoseEstimate(nose: NoseWidth | null): number | null {
  if (!nose) return null;
  return NOSE_TO_MM[nose];
}

export function saveQuizPrior(
  input: Pick<QuizPrior, "hat" | "nose" | "currentFrameMm">,
): QuizPrior {
  const prior: QuizPrior = {
    hat: input.hat,
    nose: input.nose,
    currentFrameMm: input.currentFrameMm,
    faceEstimateMm: deriveFaceEstimate(input.hat),
    savedAt: Date.now(),
  };
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prior));
    }
  } catch {
    /* quota / private mode — ignore */
  }
  return prior;
}

export function loadQuizPrior(): QuizPrior | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizPrior;
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

export function clearQuizPrior(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ── Reconciliation ───────────────────────────────────────────────────────

export type ScanConfidence = "low" | "medium" | "high";

export interface ReconcileInput {
  scanFaceMm: number;
  scanNoseMm: number;
  scanConfidence: ScanConfidence;
  prior: QuizPrior | null;
}

export interface ReconcileResult {
  /** Final face width used for recommendation. */
  faceWidthMm: number;
  /** Final nose width used for recommendation. */
  noseWidthMm: number;
  /** True if either value was overridden / blended. */
  adjusted: boolean;
  /** Human-readable reason (shown to the user as a note). */
  reason: string | null;
  /** True if scan and prior disagree heavily — user should consider retaking. */
  warn: boolean;
  /** Delta between scan and the best prior signal, mm. Null if no prior. */
  deltaMm: number | null;
  /** What value the prior contributed (face mm), for analytics. */
  priorFaceMm: number | null;
}

/**
 * Blend scan output with quiz prior.
 *
 * Strategy
 * - No prior → trust scan.
 * - Prior has `currentFrameMm` (user typed their actual frame width) →
 *   strongest signal. Override scan when disagreement is large AND scan
 *   confidence is not high.
 * - Otherwise use hat-derived estimate:
 *     delta < 6 mm  → use scan
 *     6–12 mm       → blend (60/40 scan/prior) when scan confidence is low/med
 *     > 12 mm       → still use scan but flag warn + suggest retake
 * - Nose: when scan nose is implausible (<16 or >30 mm) OR scan confidence
 *   is low AND quiz nose is set, swap in quiz-derived mm.
 */
export function reconcileScan({
  scanFaceMm,
  scanNoseMm,
  scanConfidence,
  prior,
}: ReconcileInput): ReconcileResult {
  if (!prior) {
    return {
      faceWidthMm: scanFaceMm,
      noseWidthMm: scanNoseMm,
      adjusted: false,
      reason: null,
      warn: false,
      deltaMm: null,
      priorFaceMm: null,
    };
  }

  const priorFaceMm = prior.currentFrameMm ?? prior.faceEstimateMm;
  const delta = scanFaceMm - priorFaceMm;
  const absDelta = Math.abs(delta);

  let faceWidthMm = scanFaceMm;
  let reason: string | null = null;
  let adjusted = false;
  let warn = false;

  // Case A — user typed their actual current frame width.
  if (prior.currentFrameMm != null) {
    if (absDelta >= 8 && scanConfidence !== "high") {
      faceWidthMm = Math.round((scanFaceMm + prior.currentFrameMm * 2) / 3); // weight prior 2x
      adjusted = true;
      reason = `Scan read ${Math.round(scanFaceMm)} mm but you reported your current frames as ${Math.round(prior.currentFrameMm)} mm. We averaged toward your frames.`;
      if (absDelta >= 14) warn = true;
    } else if (absDelta >= 14) {
      // Even at high confidence a 14+ mm gap deserves a warning.
      warn = true;
      reason = `Your current frames (${Math.round(prior.currentFrameMm)} mm) and the scan (${Math.round(scanFaceMm)} mm) disagree by ${Math.round(absDelta)} mm. Consider retaking the scan.`;
    }
  } else {
    // Case B — hat-derived prior only.
    if (absDelta >= 6 && absDelta < 12 && scanConfidence !== "high") {
      faceWidthMm = Math.round(scanFaceMm * 0.6 + priorFaceMm * 0.4);
      adjusted = true;
      reason = `Scan said ${Math.round(scanFaceMm)} mm, your hat size suggests ~${priorFaceMm} mm. Combined estimate: ${faceWidthMm} mm.`;
    } else if (absDelta >= 12) {
      warn = true;
      reason = `Scan (${Math.round(scanFaceMm)} mm) is ${Math.round(absDelta)} mm off your hat-size estimate (~${priorFaceMm} mm). Retake the scan for a reliable number.`;
    }
  }

  // Nose reconciliation.
  let noseWidthMm = scanNoseMm;
  const priorNoseMm = deriveNoseEstimate(prior.nose);
  const noseImplausible = !Number.isFinite(scanNoseMm) || scanNoseMm < 16 || scanNoseMm > 30;
  if (priorNoseMm != null) {
    if (noseImplausible) {
      noseWidthMm = priorNoseMm;
      adjusted = true;
      reason = reason
        ? `${reason} Nose set from your quiz answer (${prior.nose}).`
        : `Nose width from your quiz answer (${prior.nose}).`;
    } else if (scanConfidence === "low" && Math.abs(scanNoseMm - priorNoseMm) >= 4) {
      noseWidthMm = Math.round(scanNoseMm * 0.5 + priorNoseMm * 0.5);
      adjusted = true;
    }
  }

  return {
    faceWidthMm,
    noseWidthMm,
    adjusted,
    reason,
    warn,
    deltaMm: Math.round(absDelta),
    priorFaceMm,
  };
}
