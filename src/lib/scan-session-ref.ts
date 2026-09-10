// Pseudonymous reference for a fit-scan attempt.
//
// Principle: FitLens measures, Woolet identifies. Nothing that identifies a
// person is handed to the scan widget — only this random reference and the
// page language. The link between a scan and a customer is made later, on our
// side, when the order is created.

import { STORAGE_KEY } from "@/lib/bespoke-state";

const randomUuid = (): string => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // RFC 4122 v4 fallback for browsers without randomUUID.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const readConfig = (): Record<string, unknown> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const writeConfig = (next: Record<string, unknown>) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — the reference simply won't survive a reload */
  }
};

/** Existing scan reference for this browser, or null. */
export function readSessionRef(): string | null {
  const value = readConfig().sessionRef;
  return typeof value === "string" && value.length >= 8 ? value : null;
}

/**
 * Reference for the current scan attempt, creating one if needed.
 * Pass `{ fresh: true }` to start a new attempt.
 */
export function getSessionRef(options?: { fresh?: boolean }): string {
  if (typeof window === "undefined") return randomUuid();
  const existing = readSessionRef();
  if (existing && !options?.fresh) return existing;
  const sessionRef = randomUuid();
  writeConfig({ ...readConfig(), sessionRef, updatedAt: new Date().toISOString() });
  return sessionRef;
}

/**
 * Continues an attempt started on another device (QR hand-off): adopts the
 * reference carried in the link so both devices write to the same session.
 */
export function adoptSessionRef(sessionRef: string): void {
  if (typeof window === "undefined") return;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionRef)) return;
  if (readSessionRef() === sessionRef) return;
  writeConfig({ ...readConfig(), sessionRef, updatedAt: new Date().toISOString() });
}
