// Reads GA4 client/session ids from cookies so server-side Measurement
// Protocol events join the visitor's real session. Returns null when the
// cookie is absent (e.g. consent denied) — never invents values.

import { getJourneyFields } from "@/lib/journey";

const GA_SESSION_COOKIE = "_ga_SYJZL72DWB";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

/** "GA1.1.123456789.1700000000" → "123456789.1700000000" */
export function getGaClientId(): string | null {
  const raw = readCookie("_ga");
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 4) return null;
  const id = parts.slice(-2).join(".");
  return /^\d+\.\d+$/.test(id) ? id : null;
}

/** Supports "GS1.1.<sid>.…" and "GS2.1.s<sid>$o…". */
export function getGaSessionId(): string | null {
  const raw = readCookie(GA_SESSION_COOKIE);
  if (!raw) return null;
  const gs2 = raw.match(/^GS2\.\d+\.s(\d+)/);
  if (gs2) return gs2[1];
  const gs1 = raw.match(/^GS1\.\d+\.(\d+)/);
  return gs1 ? gs1[1] : null;
}

/** Stripe metadata fields; keys only present when the cookie exists. */
export function getGaCheckoutMetadata(): Record<string, string> {
  const out: Record<string, string> = { ...getJourneyFields() };
  const cid = getGaClientId();
  const sid = getGaSessionId();
  if (cid) out.ga_client_id = cid;
  if (sid) out.ga_session_id = sid;
  return out;
}

// ---------------------------------------------------------------------------
// Async fallback (SEO + GA4 fix pack 20.10.2026).
// server_event_log 20.09-20.10: 10 of 69 paid reservations carried
// ga_session_id but no ga_client_id, so GA4 put the Measurement Protocol
// purchase under Direct / (not set). When the _ga cookie cannot be parsed we
// ask gtag for the client id (bounded wait) and record which path produced
// it, plus a masked shape of the raw cookie, so the next audit can tell why.

const GA_MEASUREMENT_ID = "G-SYJZL72DWB";

export type GaCidSource = "cookie" | "gtag" | "none";

/** Masked cookie shape for diagnostics: digits -> 9, letters kept, max 40 chars. */
function cookieShape(raw: string | null): string {
  if (raw === null) return "absent";
  return raw.replace(/\d/g, "9").slice(0, 40) || "empty";
}

/** client_id via gtag('get'); null after timeoutMs or when gtag is missing. */
export function getGaClientIdFromGtag(timeoutMs = 400): Promise<string | null> {
  return new Promise((resolve) => {
    const w = typeof window !== "undefined" ? (window as unknown as { gtag?: (...args: unknown[]) => void }) : undefined;
    if (!w?.gtag) return resolve(null);
    let done = false;
    const finish = (v: string | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    try {
      w.gtag("get", GA_MEASUREMENT_ID, "client_id", (id: unknown) => {
        clearTimeout(timer);
        finish(typeof id === "string" && /^\d+\.\d+$/.test(id) ? id : null);
      });
    } catch {
      clearTimeout(timer);
      finish(null);
    }
  });
}

/** Checkout metadata with the gtag fallback; use when creating a Stripe session. */
export async function getGaCheckoutMetadataAsync(timeoutMs = 400): Promise<Record<string, string>> {
  const out = getGaCheckoutMetadata();
  if (out.ga_client_id) {
    out.ga_cid_src = "cookie";
    return out;
  }
  const fromGtag = await getGaClientIdFromGtag(timeoutMs);
  if (fromGtag) {
    out.ga_client_id = fromGtag;
    out.ga_cid_src = "gtag";
  } else {
    out.ga_cid_src = "none";
  }
  out.ga_cookie_shape = cookieShape(readCookie("_ga"));
  return out;
}

/**
 * Encodes GA ids into a Stripe Payment Link client_reference_id suffix
 * (Stripe allows [A-Za-z0-9_-], max 200 chars). The webhook parses
 * "__ga_<cidA>_<cidB>[_<sid>]" back into ga_client_id / ga_session_id.
 */
export function withGaClientReference(base: string): string {
  const cid = getGaClientId();
  if (!cid) return base;
  const sid = getGaSessionId();
  const suffix = `__ga_${cid.replace(".", "_")}${sid ? `_${sid}` : ""}`;
  const safeBase = base.replace(/__ga_.*$/, "").replace(/[^A-Za-z0-9_-]/g, "-");
  return `${safeBase}${suffix}`.slice(0, 200);
}

/** Adds client_reference_id with GA ids to a buy.stripe.com URL (keeps an existing base ref). */
export function withGaPaymentLink(href: string, baseRef = "site"): string {
  try {
    const url = new URL(href);
    const existing = url.searchParams.get("client_reference_id") || baseRef;
    url.searchParams.set("client_reference_id", withGaClientReference(existing));
    return url.toString();
  } catch {
    return href;
  }
}
