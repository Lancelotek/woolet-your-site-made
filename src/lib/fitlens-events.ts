// Pure helpers for mapping FitLens iframe postMessages onto funnel events.

export const FITLENS_KNOWN_TYPES = [
  "ready", "consent_shown", "consent_accepted", "camera_requested", "camera_granted",
  "camera_denied", "scan_started", "capture_done", "result", "error", "close",
] as const;

/** `type` → lowercase-safe event suffix; anything malformed becomes `unknown`. */
export function sanitizeFitLensType(type: unknown): string {
  if (typeof type !== "string" || type.length === 0 || type.length > 40) return "unknown";
  return /^[a-z0-9_]+$/.test(type) ? type : "unknown";
}

/** Once-per-open dedupe; `error` is always allowed through. */
export function createFitLensDedupe() {
  let seen = new Set<string>();
  return {
    reset() { seen = new Set(); },
    shouldFire(type: string): boolean {
      if (type === "error") return true;
      if (seen.has(type)) return false;
      seen.add(type);
      return true;
    },
  };
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
  if (secondsSinceOpen != null) out.seconds_since_open = secondsSinceOpen;
  return out;
}
