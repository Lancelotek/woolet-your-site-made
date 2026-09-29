// Reads GA4 client/session ids from cookies so server-side Measurement
// Protocol events join the visitor's real session. Returns null when the
// cookie is absent (e.g. consent denied) — never invents values.

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
  const out: Record<string, string> = {};
  const cid = getGaClientId();
  const sid = getGaSessionId();
  if (cid) out.ga_client_id = cid;
  if (sid) out.ga_session_id = sid;
  return out;
}
