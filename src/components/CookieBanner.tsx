import { useEffect, useState } from "react";

const STORAGE_KEY = "woolet_consent_v1";
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

type ConsentState = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const gtag = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  // Use dataLayer.push directly so it works regardless of when GTM loads
  window.dataLayer.push(args as unknown as Record<string, unknown>);
};

const updateConsent = (state: ConsentState) => {
  gtag("consent", "update", state);
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, ts: Date.now() })
    );
  } catch {
    // ignore
  }
};

const readSavedConsent = (): ConsentState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state: ConsentState; ts: number };
    if (Date.now() - parsed.ts > SIX_MONTHS_MS) return null;
    return parsed.state;
  } catch {
    return null;
  }
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  useEffect(() => {
    const saved = readSavedConsent();
    if (saved) {
      // Re-apply on every load so GTM gets the right state in this session
      gtag("consent", "update", saved);
      return;
    }
    setVisible(true);
  }, []);

  const acceptAll = () => {
    updateConsent({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    setVisible(false);
  };

  const rejectAll = () => {
    updateConsent({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    setVisible(false);
  };

  const saveCustom = () => {
    updateConsent({
      ad_storage: ads ? "granted" : "denied",
      ad_user_data: ads ? "granted" : "denied",
      ad_personalization: ads ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 10000,
        maxWidth: 520,
        margin: "0 auto",
        background: "#0f0f0f",
        color: "#f0ece4",
        borderRadius: 10,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        padding: 20,
        fontFamily: "'Barlow', sans-serif",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <p style={{ margin: 0, marginBottom: 14 }}>
        We use cookies to improve your experience, measure traffic and show
        relevant ads. You can accept all, reject all, or choose what to allow.
        See our{" "}
        <a
          href="/en/privacy-policy"
          style={{ color: "#c9a84c", textDecoration: "underline" }}
        >
          Privacy Policy
        </a>
        .
      </p>

      {customizing && (
        <div style={{ marginBottom: 14, display: "grid", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            Analytics (page views, performance)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={ads}
              onChange={(e) => setAds(e.target.checked)}
            />
            Marketing (ad measurement & personalization)
          </label>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {!customizing && (
          <>
            <button onClick={acceptAll} style={btnPrimary}>
              Accept all
            </button>
            <button onClick={rejectAll} style={btnGhost}>
              Reject all
            </button>
            <button onClick={() => setCustomizing(true)} style={btnGhost}>
              Customize
            </button>
          </>
        )}
        {customizing && (
          <>
            <button onClick={saveCustom} style={btnPrimary}>
              Save preferences
            </button>
            <button onClick={acceptAll} style={btnGhost}>
              Accept all
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const btnBase: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: 12,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  padding: "10px 16px",
  borderRadius: 4,
  cursor: "pointer",
  border: "1px solid transparent",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#c9a84c",
  color: "#0f0f0f",
  borderColor: "#c9a84c",
  fontWeight: 600,
};

const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "#f0ece4",
  borderColor: "rgba(240,236,228,0.4)",
};

export default CookieBanner;
