// Direct Meta Pixel loader for visitors outside the EU/EEA/UK/CH.
// EU-like visitors stay on the GTM consent path — this file no-ops for them.
// Production hosts only. Deduplicates with the Conversions API via event_id.

import { trackMetaEvent, uuid, isProdHost } from "@/lib/meta-capi";
import "@/types/global";

const PIXEL_ID = "1951914478320328";

/** EU / EEA / UK / CH country codes (ISO 3166-1 alpha-2). */
const EU_LIKE_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", // EU
  "IS", "LI", "NO", // EEA
  "GB", "UK", "CH", // UK + Switzerland
]);

const EU_LIKE_TIMEZONES = new Set([
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Atlantic/Azores",
]);

/**
 * Conservative EU/EEA/UK/CH detection. Unknown → treated as EU-like.
 */
export const isEuLikeVisitor = (): boolean => {
  if (typeof window === "undefined") return true;

  let tz: string | undefined;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return true;
  }
  if (!tz) return true;
  if (tz.startsWith("Europe/")) return true;
  if (EU_LIKE_TIMEZONES.has(tz)) return true;

  // Language region hint (e.g. "de-DE", "en-GB").
  const langs =
    typeof navigator !== "undefined"
      ? [navigator.language, ...(navigator.languages ?? [])]
      : [];
  for (const l of langs) {
    if (!l) continue;
    const region = l.split("-")[1]?.toUpperCase();
    if (region && EU_LIKE_COUNTRIES.has(region)) return true;
  }

  return false;
};

const fbqTrack = (
  eventName: string,
  custom: Record<string, unknown>,
  eventId: string,
): void => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", eventName, custom, { eventID: eventId });
};

/** Wrap dataLayer.push so meta_* events also reach the direct browser pixel. */
const bridgeDataLayer = (): void => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const dl = window.dataLayer as Record<string, unknown>[] & {
    __wooletMetaBridged?: boolean;
  };
  if (dl.__wooletMetaBridged) return;
  dl.__wooletMetaBridged = true;

  const originalPush = dl.push.bind(dl);
  dl.push = ((...args: Record<string, unknown>[]) => {
    for (const arg of args) {
      if (!arg || typeof arg !== "object") continue;
      const event = arg.event;
      const metaEventName = arg.meta_event_name;
      const eventId = arg.event_id;
      if (
        typeof event === "string" &&
        event.startsWith("meta_") &&
        typeof metaEventName === "string" &&
        typeof eventId === "string"
      ) {
        const {
          event: _e,
          meta_event_name: _n,
          event_id: _i,
          ...custom
        } = arg;
        fbqTrack(metaEventName, custom, eventId);
      }
    }
    return originalPush(...args);
  }) as typeof dl.push;
};

let initialized = false;

/**
 * Load the Meta Pixel directly for non-EU-like visitors on production hosts.
 * No-ops if GTM already defined window.fbq.
 */
export const initMetaPixelDirect = (): void => {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (!isProdHost()) return;
  if (isEuLikeVisitor()) return;
  if (typeof window.fbq !== "undefined") return;
  initialized = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable @typescript-eslint/no-explicit-any */

  window.fbq?.("init", PIXEL_ID);
  window.__wooletMetaDirect = true;

  bridgeDataLayer();

  const eventId = uuid();
  fbqTrack("PageView", {}, eventId);
  void trackMetaEvent("PageView", { eventId, serverOnly: true });
};

/** Fire exactly one PageView per navigation (caller guards on pathname). */
export const trackMetaPixelPageView = (): void => {
  if (typeof window === "undefined") return;
  if (!window.__wooletMetaDirect) return;
  const eventId = uuid();
  fbqTrack("PageView", {}, eventId);
  void trackMetaEvent("PageView", { eventId, serverOnly: true });
};
