// Pure helpers for mapping FitLens iframe postMessages onto funnel events.

export const FITLENS_KNOWN_TYPES = [
  "ready", "consent_shown", "consent_accepted", "camera_requested", "camera_granted",
  "camera_denied", "scan_started", "capture_done", "result", "error", "close",
] as const;

/**
 * Legacy embed sends every step as
 * `{ source: "fitlens", type: "fitlens:event", name: "<step>", data: {} }`.
 * Legacy step names pass through unchanged: ready, intro_shown, camera_prompt,
 * camera_granted, camera_denied, capture_started, camera_unsuitable,
 * measure_failed, result_shown, widget_closed, pricing_viewed,
 * form_field_focus, form_submit_attempt.
 */

/** Types that always pass the dedupe and feed the `fitlens_error` tag. */
export const FITLENS_ERROR_LIKE_TYPES = [
  "error",
  "camera_unsuitable",
  "measure_failed",
] as const;

export function isFitLensErrorLike(type: string): boolean {
  return (FITLENS_ERROR_LIKE_TYPES as readonly string[]).includes(type);
}

/** Normalize both message formats into `{ type, payload }`. */
export function parseFitLensMessage(data: Record<string, unknown>): {
  type: string;
  payload: Record<string, unknown>;
} {
  if (data.type === "fitlens:event") {
    const payload =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : {};
    return { type: sanitizeFitLensType(data.name), payload };
  }
  const payload =
    data.payload && typeof data.payload === "object"
      ? (data.payload as Record<string, unknown>)
      : data;
  return { type: sanitizeFitLensType(data.type), payload };
}

/** `type` → lowercase-safe event suffix; anything malformed becomes `unknown`. */
export function sanitizeFitLensType(type: unknown): string {
  if (typeof type !== "string" || type.length === 0 || type.length > 40) return "unknown";
  return /^[a-z0-9_]+$/.test(type) ? type : "unknown";
}

/** Once-per-open dedupe; error-like types are always allowed through. */
export function createFitLensDedupe() {
  let seen = new Set<string>();
  return {
    reset() { seen = new Set(); },
    shouldFire(type: string): boolean {
      if (isFitLensErrorLike(type)) return true;
      if (seen.has(type)) return false;
      seen.add(type);
      return true;
    },
  };
}

/**
 * Face width for the Clarity tag, read from every payload shape FitLens uses:
 * `faceWidthMm` / `faceWidth` at the top level or inside `measurement`.
 * Never logged raw — callers bucket it before sending.
 */
export function pickFitLensFaceWidthMm(payload: Record<string, unknown>): number | null {
  const candidates: unknown[] = [payload.faceWidthMm, payload.faceWidth];
  const measurement = payload.measurement;
  if (measurement && typeof measurement === "object") {
    const m = measurement as Record<string, unknown>;
    candidates.push(m.faceWidthMm, m.faceWidth);
  }
  for (const v of candidates) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/** 5 mm privacy bucket: 147.6 → "145-150". */
export function bucketFaceWidth(fw: number): string {
  const lo = Math.floor(fw / 5) * 5;
  return `${lo}-${lo + 5}`;
}

const BUCKET_RE = /^\d{2,3}-\d{2,3}$/;

/** FitLens-provided `face_width_bucket` ("145-150"), or null if absent/malformed. */
export function pickFitLensBucket(payload: Record<string, unknown>): string | null {
  const b = payload.face_width_bucket;
  return typeof b === "string" && BUCKET_RE.test(b) ? b : null;
}

const TOKEN_RE = /^[a-z0-9_-]{1,40}$/;

/** Short identifier token (reason, last_state, code); anything else → null. */
export function sanitizeFitLensToken(v: unknown): string | null {
  return typeof v === "string" && TOKEN_RE.test(v) ? v : null;
}

/** Clarity `fitlens_error` value: `code` plus `:reason` when present. */
export function fitLensErrorTag(type: string, payload: Record<string, unknown>): string {
  const code = sanitizeFitLensToken(payload.code);
  const reason = sanitizeFitLensToken(payload.reason);
  if (code && reason) return `${code}:${reason}`;
  return code || reason || type;
}

/** `reason` + `last_state` for fitlens_closed / fitlens_abandoned. */
export function pickFitLensCloseParams(payload: Record<string, unknown>): {
  reason?: string;
  last_state?: string;
} {
  const out: { reason?: string; last_state?: string } = {};
  const reason = sanitizeFitLensToken(payload.reason);
  const lastState = sanitizeFitLensToken(payload.last_state);
  if (reason) out.reason = reason;
  if (lastState) out.last_state = lastState;
  return out;
}

/** Whitelisted dataLayer params — never the raw payload. */
export function pickFitLensParams(
  payload: Record<string, unknown>,
  secondsSinceOpen: number | null,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const k of ["step", "code", "reason", "tier"] as const) {
    const v = payload[k];
    if (typeof v === "string" && v.length <= 80) out[k] = v;
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  const lastState = sanitizeFitLensToken(payload.last_state);
  if (lastState) out.last_state = lastState;
  if (secondsSinceOpen != null) out.seconds_since_open = secondsSinceOpen;
  return out;
}

/** Types counted as a failed scan attempt for the tape-measure fallback. */
export function isFitLensFailure(type: string): boolean {
  return isFitLensErrorLike(type);
}

/**
 * Per-open failure counter. `onMessage` returns the failure count when the
 * tape-measure fallback should appear (2nd failure, no result yet, once per open),
 * otherwise null.
 */
export function createFitLensFailureCounter(threshold = 2) {
  let failures = 0;
  let resultSeen = false;
  let shown = false;
  return {
    reset() { failures = 0; resultSeen = false; shown = false; },
    get failures() { return failures; },
    onMessage(type: string): number | null {
      if (type === "result" || type === "result_shown") { resultSeen = true; return null; }
      if (!isFitLensFailure(type)) return null;
      failures += 1;
      if (resultSeen || shown || failures < threshold) return null;
      shown = true;
      return failures;
    },
  };
}
