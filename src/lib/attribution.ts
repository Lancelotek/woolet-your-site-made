/**
 * First-touch marketing attribution capture.
 *
 * Reads UTM + click IDs from the current URL / cookies on every page load,
 * persists them in localStorage (first-touch wins), and exposes
 * `getAttribution()` for outgoing MailerLite subscribe calls.
 *
 * SSR/prerender safe: all window/document/localStorage access is guarded.
 *
 * iOS in-app browsers (Instagram/Facebook webviews) intermittently block
 * localStorage, so `getAttribution()` merges three sources with fallback:
 * current URL params → in-memory cache → localStorage.
 */

const STORAGE_KEY = "woolet_attribution";
const LAST_TOUCH_KEY = "wlt_last_touch";
const LAST_TOUCH_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const LAST_TOUCH_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid", "gbraid", "wbraid", "fbclid"] as const;

const LT_COOKIE = "wlt_lt";
let memoryLastTouch: Record<string, string> | null = null;

function writeLtCookie(json: string): void {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LT_COOKIE}=${encodeURIComponent(json)}; max-age=${30 * 86400}; path=/; SameSite=Lax${secure}`;
  } catch { /* ignore */ }
}

function readLtRaw(): string | null {
  try {
    const ls = window.localStorage.getItem(LAST_TOUCH_KEY);
    if (ls) return ls;
  } catch { /* storage blocked */ }
  if (memoryLastTouch) return JSON.stringify(memoryLastTouch);
  try {
    const c = document.cookie.split("; ").find((r) => r.startsWith(`${LT_COOKIE}=`));
    if (c) return decodeURIComponent(c.slice(LT_COOKIE.length + 1));
  } catch { /* ignore */ }
  return null;
}

/** One campaign landing, kept together. Never mix parameters from separate visits. */
export function captureLastTouch(): void {
  if (typeof window === "undefined") return;
  let values: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of LAST_TOUCH_KEYS) {
      const value = params.get(key);
      if (value) values[key] = value.slice(0, 500);
    }
  } catch { values = {}; }
  if (!Object.keys(values).length) return;
  const touch = { ...values, touch_at: new Date().toISOString() };
  memoryLastTouch = touch;
  const json = JSON.stringify(touch);
  try { window.localStorage.setItem(LAST_TOUCH_KEY, json); } catch { /* storage blocked */ }
  writeLtCookie(json);
}

function readLastTouch(): Record<string, unknown> | null {
  const raw = readLtRaw();
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const touch = data as Record<string, unknown>;
    const at = typeof touch.touch_at === "string" ? Date.parse(touch.touch_at) : NaN;
    if (!Number.isFinite(at) || at > Date.now() || Date.now() - at > LAST_TOUCH_MAX_AGE) {
      try { window.localStorage.removeItem(LAST_TOUCH_KEY); } catch { /* ignore */ }
      memoryLastTouch = null;
      try { document.cookie = `${LT_COOKIE}=; max-age=0; path=/`; } catch { /* ignore */ }
      return null;
    }
    return touch;
  } catch { return null; }
}

export function getLastTouchCheckoutMetadata(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    // Capture the checkout URL too, even if the route effect has not run yet.
    captureLastTouch();
    const touch = readLastTouch();
    if (!touch) return {};
    const metadata: Record<string, string> = { lt_touch_at: touch.touch_at as string };
    for (const key of LAST_TOUCH_KEYS) {
      if (key === "fbclid") continue; // stored for attribution, not sent as checkout metadata
      const value = touch[key];
      if (typeof value === "string" && value) metadata[`lt_${key}`] = value.slice(0, 500);
    }
    return metadata;
  } catch { return {}; }
}

/** Last-touch UTM values (un-prefixed) for email capture payloads. */
export function getLastTouchUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const touch = readLastTouch();
  if (!touch) return {};
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"]) {
    const v = touch[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}

/** Test helper. */
export function __resetLastTouchMemory(): void { memoryLastTouch = null; }

// Keys where FIRST touch wins (never overwrite once set).
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

// Click IDs — first-touch preferred, but backfill if missing.
const CLICK_ID_KEYS = ["fbp", "fbc", "ttclid", "rdt_uuid"] as const;

type UtmKey = (typeof UTM_KEYS)[number];
type ClickIdKey = (typeof CLICK_ID_KEYS)[number];

export type Attribution = Partial<
  Record<
    UtmKey | ClickIdKey | "event_source_url" | "landing_url" | "referrer",
    string
  >
>;

// In-memory fallback for environments where localStorage is blocked
// (iOS Instagram/Facebook in-app browser).
let memoryAttribution: Attribution = {};

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith(`${name}=`));
  return match?.split("=")[1];
}

function readStored(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(data: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

/**
 * Capture attribution from the current URL + cookies.
 * - UTM keys: first-touch only (never overwritten).
 * - Click IDs (fbp/fbc/ttclid/rdt_uuid): backfilled if currently empty.
 * - landing_url / referrer: captured once, never overwritten.
 * - event_source_url: always the most recent URL.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  captureLastTouch();

  const stored = { ...readStored(), ...memoryAttribution };
  const next: Attribution = { ...stored };

  const params = new URLSearchParams(window.location.search);

  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v && !next[k]) next[k] = v;
  }

  const fbclid = params.get("fbclid");
  const fbcFromUrl = fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
  const fbc = fbcFromUrl || readCookie("_fbc");
  const fbp = readCookie("_fbp");
  const ttclid = params.get("ttclid") || readCookie("ttclid");
  const rdt_uuid =
    params.get("rdt_uuid") ||
    params.get("rdt_cid") ||
    readCookie("_rdt_uuid");

  const clickIds: Record<ClickIdKey, string | undefined> = {
    fbp,
    fbc,
    ttclid: ttclid || undefined,
    rdt_uuid: rdt_uuid || undefined,
  };

  for (const k of CLICK_ID_KEYS) {
    const v = clickIds[k];
    if (v && !next[k]) next[k] = v;
  }

  // First-capture-only context fields.
  if (!next.landing_url) next.landing_url = window.location.href;
  if (!next.referrer && typeof document !== "undefined" && document.referrer) {
    next.referrer = document.referrer;
  }

  // Always refresh the landing URL (useful for CAPI event_source_url).
  next.event_source_url = window.location.href;

  memoryAttribution = next;
  writeStored(next);
}

/**
 * Returns a compact object suitable for merging into a mailerlite-subscribe
 * request body. Merges three sources — current URL params, in-memory cache,
 * localStorage — later sources fill only keys that are still empty.
 * Empty/undefined keys are omitted. Never throws.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const merged: Attribution = {};

    const fill = (source: Attribution) => {
      for (const [k, v] of Object.entries(source)) {
        if (typeof v === "string" && v.length > 0 && !merged[k as keyof Attribution]) {
          merged[k as keyof Attribution] = v;
        }
      }
    };

    // a) current URL params
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl: Attribution = {};
      for (const k of [...UTM_KEYS, "utm_id", "fbclid"] as const) {
        const v = params.get(k);
        if (v) (fromUrl as Record<string, string>)[k] = v;
      }
      fill(fromUrl);
    } catch {
      /* ignore */
    }

    // b) in-memory cache, c) localStorage
    fill(memoryAttribution);
    fill(readStored());
    // d) last touch fills anything still empty (e.g. /thank-you-fb landing)
    fill(getLastTouchUtms() as Attribution);

    return merged;
  } catch {
    return {};
  }
}
