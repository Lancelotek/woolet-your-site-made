/**
 * Multi-touch journey attribution (first touch, last touch, last 10 touches).
 * One touch per browser session landing — in-app route changes never add one.
 * EU/EEA/UK/CH visitors: kept in memory only until analytics consent.
 */
import { isEuLikeVisitor } from "@/lib/meta-pixel";
import { readConsentSnapshot } from "@/lib/consent";

export type Touch = {
  ts: string;
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  landing_path: string;
  referrer_host?: string;
  click_id?: string;
};

export type Journey = {
  visitor_id: string;
  first: Touch;
  last: Touch;
  touches: Touch[];
};

const KEY = "wlt_attr";
const SESSION_KEY = "wlt_attr_session";
const SELF = new Set(["woolet.co", "www.woolet.co", "shop.woolet.co"]);
const IGNORE = new Set(["checkout.stripe.com", "buy.stripe.com"]);
let memory: Journey | null = null;
let sessionCounted = false;

const uuid = () => {
  try { return crypto.randomUUID(); } catch { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
};

export function classifyTouch(search: string, referrer: string, path: string): Touch | null {
  const p = new URLSearchParams(search);
  const base = { ts: new Date().toISOString(), landing_path: path.slice(0, 200) };
  let host = "";
  try { host = referrer ? new URL(referrer).hostname.toLowerCase() : ""; } catch { host = ""; }
  const external = host && !SELF.has(host) && !host.endsWith(".lovable.app") && host !== "localhost";
  if (host && IGNORE.has(host)) return null; // Stripe return — not a new touch
  const refHost = external ? host : undefined;

  const utm = p.get("utm_source");
  if (utm) {
    const src = utm.toLowerCase();
    let medium = p.get("utm_medium") || "";
    if (src.includes("chatgpt")) medium = medium || "ai";
    if (src.startsWith("ml-")) medium = "email";
    return { ...base, source: utm, medium: medium || "(not set)", campaign: p.get("utm_campaign") || undefined, content: p.get("utm_content") || undefined, referrer_host: refHost };
  }
  if (p.get("gclid")) return { ...base, source: "google", medium: "cpc", click_id: "gclid", referrer_host: refHost };
  if (p.get("fbclid")) return { ...base, source: "meta", medium: "click", click_id: "fbclid", referrer_host: refHost };
  if (external) {
    const h = host.replace(/^www\./, "");
    const m = (source: string, medium: string): Touch => ({ ...base, source, medium, referrer_host: host });
    if (h === "mail.google.com" || /(^|\.)outlook\./.test(h)) return m(h, "email");
    if (["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"].includes(h)) return m(h, "ai");
    if (/(^|\.)google\.[a-z.]+$/.test(h)) return m("google", "organic");
    if (h.endsWith("bing.com")) return m("bing", "organic");
    if (h.endsWith("duckduckgo.com")) return m("duckduckgo", "organic");
    if (h.endsWith("yahoo.com")) return m("yahoo", "organic");
    if (h.endsWith("instagram.com") || h.endsWith("facebook.com")) return m("meta", "social");
    if (h.endsWith("tiktok.com")) return m("tiktok", "social");
    if (h.endsWith("kickstarter.com")) return m("kickstarter", "referral");
    return m(h, "referral");
  }
  return { ...base, source: "(direct)", medium: "(none)" };
}

function canStore(): boolean {
  if (!isEuLikeVisitor()) return true;
  return readConsentSnapshot().analytics_storage === "granted";
}

function readStored(): Journey | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Journey;
    return j && j.visitor_id && j.first && j.last ? j : null;
  } catch { return null; }
}

function persist(j: Journey) {
  memory = j;
  if (!canStore()) return;
  try { window.localStorage.setItem(KEY, JSON.stringify(j)); } catch { /* blocked */ }
}

/** Call on app start. Adds one touch per browser session. */
export function captureJourney(): void {
  if (typeof window === "undefined" || sessionCounted) return;
  let isNewSession = true;
  try {
    isNewSession = !window.sessionStorage.getItem(SESSION_KEY);
    if (canStore()) window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch { /* blocked */ }
  sessionCounted = true;
  try { window.addEventListener("woolet-consent-updated", flushJourneyOnConsent); } catch { /* ignore */ }
  const existing = memory ?? readStored();
  if (!isNewSession && existing) { memory = existing; return; }
  const touch = classifyTouch(window.location.search, document.referrer, window.location.pathname);
  if (!touch) { if (existing) memory = existing; return; }
  const j: Journey = existing
    ? { ...existing, last: touch, touches: [...existing.touches, touch].slice(-10) }
    : { visitor_id: uuid(), first: touch, last: touch, touches: [touch] };
  persist(j);
}

/** Flush the in-memory journey once consent arrives. */
export function flushJourneyOnConsent(): void {
  if (!memory) return;
  persist(memory);
  try { if (canStore()) window.sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
}

export function getJourney(): { visitor_id: string; first: Touch; last: Touch; touch_count: number; first_seen_at: string } | null {
  if (typeof window === "undefined") return null;
  const j = memory ?? readStored();
  if (!j) return null;
  if (canStore() && !readStored()) persist(j);
  return { visitor_id: j.visitor_id, first: j.first, last: j.last, touch_count: j.touches.length, first_seen_at: j.first.ts };
}

export const formatTouch = (t: Touch) => [t.source, t.medium, t.campaign].filter(Boolean).join("/").slice(0, 500);

/** Flat string fields for Stripe metadata and signup payloads. */
export function getJourneyFields(): Record<string, string> {
  const j = getJourney();
  if (!j) return {};
  return {
    wlt_visitor_id: j.visitor_id,
    first_touch: formatTouch(j.first),
    last_touch: formatTouch(j.last),
    first_landing: j.first.landing_path.slice(0, 500),
    first_seen_at: j.first_seen_at,
    touch_count: String(j.touch_count),
  };
}

/** Test helper. */
export function __resetJourney(): void { memory = null; sessionCounted = false; }
