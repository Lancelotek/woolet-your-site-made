// OpenAI (ChatGPT Ads) pixel helper. The loader + init live in index.html.
// Every call is a safe no-op when window.oaiq is missing and never throws.
// Consent mirrors the Meta pixel: non-EU-like visitors are allowed by default;
// EU-like visitors only after marketing consent (woolet_consent_v1 ad_storage).

import { isEuLikeVisitor } from "@/lib/meta-pixel";
import { getJourney } from "@/lib/journey";
import { supabase } from "@/integrations/supabase/client";

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
  // ref = Stripe session id → same id as the server reservation_1usd event.
  const key = `wlt_oaiq_res_${ref || "x"}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* noop */
  }
  oaiqMeasure(
    "custom",
    { type: "custom" },
    { custom_event_name: "reservation_1usd", ...(ref ? { event_id: ref } : {}) },
  );
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

// ---- user identity (hashed only) ------------------------------------------
const PIXEL_ID = "PZ4o6trkntv1aiioMM7GJ7";
const EMAIL_HASH_KEY = "wlt_openai_em";

export const sha256Hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Persistent first-party visitor ID, used when the attribution journey has no
// ID yet (e.g. a direct landing before any touch is captured). Stored in
// localStorage + a 2-year first-party cookie; EU-like visitors without
// marketing consent keep it in memory only (mirrors the journey rule).
const VISITOR_ID_KEY = "wlt_vid";
const VISITOR_ID_COOKIE = "wlt_vid";
let memoryVisitorId = "";

const readStoredVisitorId = (): string => {
  try {
    const fromLs = localStorage.getItem(VISITOR_ID_KEY);
    if (fromLs) return fromLs;
  } catch { /* noop */ }
  try {
    const fromCookie = document.cookie.match(new RegExp(`(?:^|;\\s*)${VISITOR_ID_COOKIE}=([^;]+)`))?.[1];
    if (fromCookie) return decodeURIComponent(fromCookie);
  } catch { /* noop */ }
  return "";
};

const persistVisitorId = (id: string): void => {
  if (!marketingAllowed()) return; // EU-like without consent: memory only
  try { localStorage.setItem(VISITOR_ID_KEY, id); } catch { /* noop */ }
  try {
    const maxAge = 2 * 365 * 24 * 60 * 60; // 2 years
    document.cookie = `${VISITOR_ID_COOKIE}=${encodeURIComponent(id)}; max-age=${maxAge}; path=/; SameSite=Lax`;
  } catch { /* noop */ }
};

export const getVisitorId = (): string => {
  try {
    const journeyId = getJourney()?.visitor_id?.trim();
    if (journeyId) return journeyId;
  } catch { /* noop */ }
  if (memoryVisitorId) return memoryVisitorId;
  const stored = readStoredVisitorId();
  if (stored) {
    memoryVisitorId = stored;
    return stored;
  }
  try {
    memoryVisitorId = crypto.randomUUID();
  } catch {
    memoryVisitorId = `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
  persistVisitorId(memoryVisitorId);
  return memoryVisitorId;
};

/** Re-inits the pixel with hashed email/external id. Never sends raw values. */
export const oaiqIdentify = async (email?: string): Promise<void> => {
  try {
    if (!getOaiq() || !crypto?.subtle) return;
    const user: Record<string, string> = {};
    const em = (email ?? "").trim().toLowerCase();
    if (em && em.includes("@")) {
      user.email_sha256 = await sha256Hex(em);
      try { localStorage.setItem(EMAIL_HASH_KEY, user.email_sha256); } catch { /* noop */ }
    } else {
      try {
        const stored = localStorage.getItem(EMAIL_HASH_KEY);
        if (stored && /^[a-f0-9]{64}$/.test(stored)) user.email_sha256 = stored;
      } catch { /* noop */ }
    }
    const vid = getVisitorId();
    if (vid) user.external_id_sha256 = await sha256Hex(vid);
    if (!Object.keys(user).length) return;
    call("init", { pixelId: PIXEL_ID, user });
  } catch {
    /* never throw */
  }
};

export const getObref = (): string => {
  try {
    const m = document.cookie.match(/(?:^|;\s*)__obref=([^;]+)/)?.[1];
    return m ? decodeURIComponent(m).slice(0, 500) : "";
  } catch {
    return "";
  }
};

/** Fields the server needs for the OpenAI Conversions API (empty values omitted). */
export const getOpenAiServerFields = (): Record<string, string> => {
  const out: Record<string, string> = { openai_consent: marketingAllowed() ? "1" : "0" };
  const oppref = getOppref();
  if (oppref) out.openai_oppref = oppref;
  const vid = getVisitorId();
  if (vid) out.wlt_visitor_id = vid;
  try { out.openai_source_url = window.location.href.slice(0, 500); } catch { /* noop */ }
  return out;
};

const SIGNUP_FNS = new Set(["mailerlite-subscribe"]);
const CHECKOUT_FNS = new Set(["create-checkout", "create-bespoke-checkout"]);

/**
 * One place that enriches every signup/checkout request: identifies the
 * visitor (hashed email) BEFORE the request — so lead_created/checkout_started
 * that follow carry user data — and adds oppref/obref/visitor id/consent.
 */
const patchInvoke = (): void => {
  // supabase.functions is a getter returning a new FunctionsClient each time,
  // so patch the prototype to cover every instance.
  const proto = Object.getPrototypeOf(supabase.functions) as {
    invoke: (name: string, opts?: { body?: unknown }) => Promise<unknown>;
    __wltOaiq?: boolean;
  };
  if (!proto || proto.__wltOaiq) return;
  proto.__wltOaiq = true;
  const original = proto.invoke;
  proto.invoke = async function (this: unknown, name: string, opts?: { body?: unknown }) {
    try {
      const isSignup = SIGNUP_FNS.has(name);
      const isCheckout = CHECKOUT_FNS.has(name);
      const body = opts?.body as Record<string, unknown> | undefined;
      if ((isSignup || isCheckout) && body && typeof body === "object" && !(body instanceof FormData)) {
        const email = String(body.email ?? body.customerEmail ?? "");
        await oaiqIdentify(email || undefined);
        const fields = getOpenAiServerFields();
        const obref = getObref();
        if (isSignup) {
          opts = {
            ...opts,
            body: {
              ...body,
              openai_oppref: fields.openai_oppref,
              openai_consent: fields.openai_consent,
              obref: obref || undefined,
              wlt_visitor_id: body.wlt_visitor_id ?? fields.wlt_visitor_id,
            },
          };
        } else {
          const meta = { ...((body.metadata as Record<string, string>) ?? {}), ...fields };
          if (obref) meta.openai_obref = obref;
          opts = { ...opts, body: { ...body, metadata: meta } };
        }
      }
    } catch {
      /* never block the request */
    }
    return original.call(this, name, opts);
  };
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
    patchInvoke();
    void oaiqIdentify();
    window.addEventListener("woolet-consent-updated", () => applyConsent());
  } catch {
    /* noop */
  }
};
