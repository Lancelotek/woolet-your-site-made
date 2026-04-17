import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "woolet_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it doesn't fight LCP
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ status: "accepted", ts: Date.now() })
      );
    } catch {
      /* ignore */
    }

    // Google Consent Mode v2 — grant all
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        dataLayer?: Record<string, unknown>[];
        gtag?: (...args: unknown[]) => void;
      };
      w.dataLayer = w.dataLayer || [];
      // Push consent update via dataLayer (works with GTM-managed Consent Mode)
      w.dataLayer.push({
        event: "cmp_accept",
        consent: {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
          functionality_storage: "granted",
          personalization_storage: "granted",
          security_storage: "granted",
        },
      });
      // Also call gtag directly if available
      if (typeof w.gtag === "function") {
        w.gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
          functionality_storage: "granted",
          personalization_storage: "granted",
          security_storage: "granted",
        });
      }
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 340,
        background: "#1a1612",
        border: "1px solid #2a2520",
        borderRadius: 8,
        padding: "16px 18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        fontFamily: "'Barlow', sans-serif",
        color: "#f0ece4",
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 16,
          lineHeight: 1.3,
          color: "#f0ece4",
          marginBottom: 8,
          letterSpacing: "0.01em",
        }}
      >
        Cookies on woolet.co
      </div>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.55,
          color: "#9A8E7E",
          margin: 0,
          marginBottom: 14,
          fontWeight: 300,
        }}
      >
        We use cookies for analytics and marketing to improve your experience. By
        clicking "Accept", you consent to their use.{" "}
        <Link
          to="/en/privacy-policy"
          style={{
            color: "#c9a84c",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Learn more
        </Link>
      </p>
      <button
        type="button"
        onClick={accept}
        style={{
          width: "100%",
          background: "#c9a84c",
          color: "#0f0f0f",
          border: "none",
          padding: "10px 16px",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "pointer",
          borderRadius: 4,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#d4b85e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#c9a84c";
        }}
      >
        Accept
      </button>
    </div>
  );
};

export default CookieConsent;
