// Dedupe for `fitlens:result` CustomEvents.
//
// The embed can dispatch its own result event while our message bridge in
// use-fitlens-script.ts dispatches a second copy of the same payload a few
// hundred milliseconds later. Every page that listens to `fitlens:result`
// must drop the duplicate before applying measurements or saving server-side.
//
// Rule: a result whose `measurementId` equals the last processed one is a
// duplicate. When the payload carries no id, fall back to a hash of the six
// normalized measurements plus the result timestamp — identical values within
// a 10 s window count as the same scan.

import { parseFitLensEvent, readResultTimestamp } from "@/lib/fitlens-result";

const WINDOW_MS = 10_000;

export type FitLensResultDedupe = {
  /** True when this detail was already processed; false on first sight. */
  isDuplicate: (detail: unknown, now?: number) => boolean;
  reset: () => void;
};

export function createFitLensResultDedupe(): FitLensResultDedupe {
  let lastId: string | null = null;
  let lastHash: string | null = null;
  let lastStamp = 0;

  return {
    isDuplicate(detail, now = Date.now()) {
      const parsed = parseFitLensEvent(detail);

      if (parsed.measurementId) {
        if (parsed.measurementId === lastId) return true;
        lastId = parsed.measurementId;
        lastHash = null;
        return false;
      }

      const hash = JSON.stringify(parsed.measurements);
      const stamp = readResultTimestamp(detail) ?? now;
      if (hash === lastHash && Math.abs(stamp - lastStamp) <= WINDOW_MS) return true;
      lastHash = hash;
      lastStamp = stamp;
      return false;
    },
    reset() {
      lastId = null;
      lastHash = null;
      lastStamp = 0;
    },
  };
}
