// Reddit Ads Pixel — consent-gated.
// Loads only after the user grants MARKETING consent
// (woolet_consent_v1 → state.ad_storage === "granted").

const PIXEL_ID = "a2_j7603b9m9mmv";
const CONSENT_KEY = "woolet_consent_v1";

let initialized = false;

type RdtFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    rdt?: RdtFn & {
      sendEvent?: RdtFn;
      callQueue?: unknown[][];
    };
  }
}

export const hasMarketingConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      state?: { ad_storage?: string };
    };
    return parsed?.state?.ad_storage === "granted";
  } catch {
    return false;
  }
};

export const loadRedditPixel = (): void => {
  if (initialized) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!hasMarketingConsent()) return;

  // Mark initialized BEFORE any rdt() call so that re-entrant invocations
  // (consent-update event firing during/after init) cannot trigger a second
  // init() or duplicate PageVisit.
  initialized = true;

  // Official Reddit pixel loader
  if (!window.rdt) {
    const p = function (...args: unknown[]) {
      if (p.sendEvent) p.sendEvent.apply(p, args);
      else p.callQueue!.push(args);
    } as RdtFn & { sendEvent?: RdtFn; callQueue?: unknown[][] };
    p.callQueue = [];
    window.rdt = p;
    const t = document.createElement("script");
    t.src = "https://www.redditstatic.com/ads/pixel.js";
    t.async = true;
    const s = document.getElementsByTagName("script")[0];
    s.parentNode!.insertBefore(t, s);
  }

  window.rdt?.("init", PIXEL_ID);
  window.rdt?.("track", "PageVisit");
};

export const initRedditPixel = (): void => {
  if (typeof window === "undefined") return;
  if (hasMarketingConsent()) {
    loadRedditPixel();
    return;
  }
  const onConsent = (e: Event) => {
    const detail = (e as CustomEvent<{ ad_storage?: string }>).detail;
    if (detail?.ad_storage === "granted") {
      loadRedditPixel();
      window.removeEventListener("woolet-consent-updated", onConsent);
    }
  };
  window.addEventListener("woolet-consent-updated", onConsent);
};

const fire = (event: string, params?: Record<string, unknown>) => {
  if (!initialized) return;
  if (typeof window === "undefined" || typeof window.rdt !== "function") return;
  if (params) window.rdt("track", event, params);
  else window.rdt("track", event);
};

export const rdtPageVisit = () => fire("PageVisit");
export const rdtViewContent = (params?: Record<string, unknown>) => fire("ViewContent", params);
export const rdtAddToCart = (params?: Record<string, unknown>) => fire("AddToCart", params);
export const rdtLead = (params?: Record<string, unknown>) => fire("Lead", params);
export const rdtPurchase = (params?: Record<string, unknown>) => fire("Purchase", params);
export const rdtCustom = (params: { customEventName: string } & Record<string, unknown>) =>
  fire("Custom", params);
