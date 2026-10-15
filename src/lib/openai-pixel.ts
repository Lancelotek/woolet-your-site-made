// OpenAI (ChatGPT Ads) pixel helper. The loader + init live in index.html.
// Every call is a safe no-op when window.oaiq is missing and never throws.
// Consent mirrors the Meta pixel: non-EU-like visitors are allowed by default;
// EU-like visitors only after marketing consent (woolet_consent_v1 ad_storage).

import { isEuLikeVisitor } from "@/lib/meta-pixel";

type Oaiq = (...args: unknown[]) => void;
const OPPREF_KEY = "wlt_openai_oppref";
const CONSENT_KEY = "woolet_consent_v1";

const getOaiq = (): Oaiq | null => {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { oaiq?: Oaiq }).oaiq;
  return typeof fn === "function" ? fn : null;
};

const call = (...args: unknown[]): void => {
  try {
    getOaiq()?.(...args);
  } catch {
    /* never throw */
  }
};

const hasMarketingConsent = (): boolean => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    return JSON.parse(raw)?.state?.ad_storage === "granted";
  } catch {
    return false;
  }
};

export const marketingAllowed = (): boolean => {
  try {
    return !isEuLikeVisitor() || hasMarketingConsent();
  } catch {
    return false;
  }
};

let consentApplied: boolean | null = null;
const applyConsent = (): void => {
  const allowed = marketingAllowed();
  if (consentApplied === allowed) return;
  if (!allowed) call("consent", false);
  else if (consentApplied === false) call("consent", true);
  consentApplied = allowed;
};

const fired = new Set<string>();

export const oaiqMeasure = (
  eventName: string,
  data: Record<string, unknown>,
  options?: Record<string, unknown>,
): void => {
  try {
    applyConsent();
    const dedupe = options?.event_id ? `${eventName}:${String(options.event_id)}` : "";
    if (dedupe) {
      if (fired.has(dedupe)) return;
      fired.add(dedupe);
    }
    if (options) call("measure", eventName, data, options);
    else call("measure", eventName, data);
  } catch {
    /* never throw */
  }
};

const bespokeContents = (amount: number) => ({
  type: "contents",
  amount,
  currency: "USD",
  contents: [
    { id: "bespoke", name: "Woolet Bespoke", content_type: "product", quantity: 1, amount, currency: "USD" },
  ],
});

/** contents_viewed — once per browser session (visit) across /en/bespoke + configurator. */
export const oaiqBespokeViewed = (): void => {
  try {
    const key = "wlt_oaiq_bespoke_viewed";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* fall through: fire anyway */
  }
  oaiqMeasure("contents_viewed", bespokeContents(48000));
};

export const oaiqBespokeCheckoutStarted = (amountCents: number, sessionId: string): void => {
  if (!sessionId || !Number.isFinite(amountCents)) return;
  oaiqMeasure("checkout_started", bespokeContents(Math.round(amountCents)), { event_id: sessionId });
};

/** order_created for a paid Bespoke order; guarded per session id across refreshes. */
export const oaiqBespokeOrderCreated = (amountCents: number, sessionId: string): void => {
  if (!sessionId || !Number.isFinite(amountCents)) return;
  const key = `wlt_oaiq_order_${sessionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* noop */
  }
  oaiqMeasure("order_created", bespokeContents(Math.round(amountCents)), { event_id: sessionId });
};

/** Paid $1 reservation — custom event only, never order_created/checkout_started. */
export const oaiqReservation = (ref?: string): void => {
  const key = `wlt_oaiq_res_${ref || "x"}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* noop */
  }
  oaiqMeasure("custom", { type: "custom" }, { custom_event_name: "reservation_1usd" });
};

export const oaiqLead = (eventId: string): void => {
  if (!eventId) return;
  oaiqMeasure("lead_created", { type: "customer_action" }, { event_id: eventId });
};

// ---- oppref (ChatGPT ad click id) ----------------------------------------
export const captureOppref = (): void => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("oppref");
    const fromCookie = document.cookie.match(/(?:^|;\s*)__oppref=([^;]+)/)?.[1];
    const value = fromUrl || (fromCookie ? decodeURIComponent(fromCookie) : "");
    if (value && value.length <= 500) localStorage.setItem(OPPREF_KEY, value);
  } catch {
    /* noop */
  }
};

export const getOppref = (): string => {
  try {
    captureOppref();
    return localStorage.getItem(OPPREF_KEY) || "";
  } catch {
    return "";
  }
};

/** Mirror meta_lead dataLayer pushes (same event_id as Meta Lead) into lead_created. */
const bridgeLeads = (): void => {
  window.dataLayer = window.dataLayer || [];
  const dl = window.dataLayer as Record<string, unknown>[] & { __wooletOaiqBridged?: boolean };
  if (dl.__wooletOaiqBridged) return;
  dl.__wooletOaiqBridged = true;
  const original = dl.push.bind(dl);
  dl.push = ((...args: Record<string, unknown>[]) => {
    for (const arg of args) {
      try {
        if (arg && arg.meta_event_name === "Lead" && typeof arg.event_id === "string") {
          oaiqLead(arg.event_id);
        }
      } catch {
        /* noop */
      }
    }
    return original(...args);
  }) as typeof dl.push;
};

export const initOpenAiPixel = (): void => {
  if (typeof window === "undefined") return;
  try {
    captureOppref();
    applyConsent();
    bridgeLeads();
    window.addEventListener("woolet-consent-updated", () => applyConsent());
  } catch {
    /* noop */
  }
};
