// Shared crypto for the one-time measurement invitation.
//
// The plain token is only ever in the email link and in the customer's URL bar.
// The database keeps an HMAC of it (pepper: MEASURE_INVITE_PEPPER), so a dump of
// the table cannot be replayed.
//
// Deviation from the FitLens guide, on purpose: the guide asks for an
// HttpOnly session cookie on /pomiar. Our backend lives on a different host
// than the site, so a cookie set there is cross-site and dropped by default
// browser settings. We issue an opaque session token instead, kept in
// sessionStorage for the length of the measurement and stored hashed on the
// server. It is never put in the URL, never given to the FitLens iframe, and
// dies after 30 minutes.

const enc = new TextEncoder();

const PEPPER = Deno.env.get("MEASURE_INVITE_PEPPER") ?? "";

async function hmac(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const hasPepper = () => PEPPER.length > 0;

/** Stored form of an invitation token. Never store the token itself. */
export const hashToken = (token: string) => hmac(PEPPER, `invite:${token}`);

/** Stored form of a measurement session token. */
export const hashSession = (token: string) => hmac(PEPPER, `session:${token}`);

export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-safe comparison so a wrong guess costs the same time as a right one. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * A CSRF value bound to one invitation: it carries the hash of that token, so
 * a CSRF issued for invitation A cannot authorise the exchange of token B.
 */
export async function issueCsrf(tokenHash: string, ttlSeconds = 900): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await hmac(PEPPER, `csrf:${tokenHash}:${exp}`);
  return `${exp}.${sig}`;
}

export async function verifyCsrf(tokenHash: string, csrf: string): Promise<boolean> {
  const [expPart, sig] = (csrf ?? "").split(".");
  const exp = Number(expPart);
  if (!Number.isFinite(exp) || !sig) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(sig, await hmac(PEPPER, `csrf:${tokenHash}:${exp}`));
}

/**
 * Origins allowed to drive the invitation flow. The site and the backend sit on
 * different hosts, so the browser reports `cross-site`; the guide's
 * `Sec-Fetch-Site: same-origin` rule is replaced by an exact allow-list plus the
 * invitation-bound CSRF, which is what the rule was protecting.
 */
export function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin") ?? "";
  if (!origin) return false;
  const configured = (Deno.env.get("WOOLET_APP_ORIGIN") ?? "https://woolet.co")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowed = new Set([...configured, "https://www.woolet.co", "http://localhost:8080"]);
  if (allowed.has(origin)) return true;
  // Lovable preview builds of this same project.
  return /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin);
}

export const NEUTRAL = { status: "unavailable" as const };
