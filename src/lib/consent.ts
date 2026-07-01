// Central consent snapshot reader for analytics events.
// Reads the state saved by CookieBanner (woolet_consent_v1) and returns a
// flat object suitable for GTM dataLayer / Meta CAPI custom_data.

const STORAGE_KEY = "woolet_consent_v1";
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export type ConsentSnapshot = {
  ad_storage: "granted" | "denied" | "unset";
  ad_user_data: "granted" | "denied" | "unset";
  ad_personalization: "granted" | "denied" | "unset";
  analytics_storage: "granted" | "denied" | "unset";
  consent_state: "granted" | "denied" | "partial" | "unset";
};

export const readConsentSnapshot = (): ConsentSnapshot => {
  const base: ConsentSnapshot = {
    ad_storage: "unset",
    ad_user_data: "unset",
    ad_personalization: "unset",
    analytics_storage: "unset",
    consent_state: "unset",
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as { state: Record<string, string>; ts: number };
    if (!parsed?.state || Date.now() - parsed.ts > SIX_MONTHS_MS) return base;
    const s = parsed.state;
    const snap: ConsentSnapshot = {
      ad_storage: (s.ad_storage as ConsentSnapshot["ad_storage"]) ?? "unset",
      ad_user_data: (s.ad_user_data as ConsentSnapshot["ad_user_data"]) ?? "unset",
      ad_personalization:
        (s.ad_personalization as ConsentSnapshot["ad_personalization"]) ?? "unset",
      analytics_storage:
        (s.analytics_storage as ConsentSnapshot["analytics_storage"]) ?? "unset",
      consent_state: "unset",
    };
    const values = [snap.ad_storage, snap.ad_user_data, snap.ad_personalization, snap.analytics_storage];
    const granted = values.filter((v) => v === "granted").length;
    if (granted === values.length) snap.consent_state = "granted";
    else if (granted === 0) snap.consent_state = "denied";
    else snap.consent_state = "partial";
    return snap;
  } catch {
    return base;
  }
};
