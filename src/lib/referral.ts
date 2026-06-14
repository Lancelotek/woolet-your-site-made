// Referral attribution persistence across sessions.
// Storage priority on read: URL → localStorage → cookie → sessionStorage.

const KEY = "woolet_ref";
const COOKIE_DAYS = 60;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const readCookie = (name: string): string | null => {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] || "") : null;
};

const writeCookie = (name: string, value: string, days: number) => {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

// Deterministic short code from email (must match KickstarterVipConfirmed)
export const refCodeForEmail = (email: string): string => {
  const s = (email || "").toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 6);
};

// Persist a ref code across sessionStorage, localStorage, and a first-party cookie.
// Never overwrites with an empty value.
export const persistRef = (code: string | null | undefined) => {
  if (!isBrowser()) return;
  const value = (code || "").trim();
  if (!value) return;
  try { sessionStorage.setItem(KEY, value); } catch { /* ignore */ }
  try { localStorage.setItem(KEY, value); } catch { /* ignore */ }
  writeCookie(KEY, value, COOKIE_DAYS);
};

// Read ref with priority: URL → localStorage → cookie → sessionStorage.
export const readRef = (urlRef?: string | null): string | null => {
  if (urlRef && urlRef.trim()) return urlRef.trim();
  if (!isBrowser()) return null;
  try {
    const ls = localStorage.getItem(KEY);
    if (ls && ls.trim()) return ls.trim();
  } catch { /* ignore */ }
  const ck = readCookie(KEY);
  if (ck && ck.trim()) return ck.trim();
  try {
    const ss = sessionStorage.getItem(KEY);
    if (ss && ss.trim()) return ss.trim();
  } catch { /* ignore */ }
  return null;
};

// Drop a stored ref if it equals the signing-up user's own code (self-referral).
export const resolveReferredBy = (email: string, urlRef?: string | null): string | null => {
  const ref = readRef(urlRef);
  if (!ref) return null;
  const own = refCodeForEmail(email);
  if (own && ref.toLowerCase() === own.toLowerCase()) return null;
  return ref;
};
