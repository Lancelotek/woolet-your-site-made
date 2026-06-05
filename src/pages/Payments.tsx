import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";

const STRIPE_URL = "https://buy.stripe.com/6oU8wQfyBgKm3ERgZnfbq0n";

export default function Payments() {
  const [params] = useSearchParams();
  const product = params.get("product") || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Stripe Payment Links send X-Frame-Options: DENY. The iframe will fail
    // silently — detect by checking that it never loads within 2.5s.
    const timer = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || doc.location.href === "about:blank") setBlocked(true);
      } catch {
        // Cross-origin — that's actually fine, it loaded
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>Secure Checkout — Woolet</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div style={{ minHeight: "100vh", background: "#f0ece4", color: "#0f0f0f", display: "flex", flexDirection: "column" }}>
        {/* Brand header */}
        <header style={{ borderBottom: "1px solid rgba(15,15,15,0.08)", background: "#f0ece4" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/en" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <img src={wooletLogo} alt="Woolet" style={{ height: 26, width: "auto", display: "block" }} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0f0f0f" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Secure
              </span>
              <span style={{ color: "#c9a84c" }}>Stripe</span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex: 1, padding: "32px 16px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, margin: "0 0 8px", color: "#0f0f0f" }}>
                Secure checkout
              </h1>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(15,15,15,0.6)", margin: 0 }}>
                {product ? `Reserving Woolet ${product} · ` : ""}Payment processed by Stripe
              </p>
            </div>

            {!blocked && (
              <div style={{ position: "relative", background: "#fff", borderRadius: 8, border: "1px solid rgba(15,15,15,0.08)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <iframe
                  ref={iframeRef}
                  src={STRIPE_URL}
                  title="Stripe checkout"
                  style={{ width: "100%", height: "min(820px, 80vh)", border: "none", display: "block" }}
                  allow="payment *"
                />
              </div>
            )}

            {blocked && (
              <div style={{ background: "#fff", borderRadius: 8, border: "1px solid rgba(15,15,15,0.08)", padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(15,15,15,0.7)", margin: "0 0 20px", lineHeight: 1.6 }}>
                  For your security, Stripe opens the payment form on its own page.
                  Your card details are never seen by Woolet.
                </p>
                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    background: "#c9a84c",
                    color: "#0f0f0f",
                    padding: "14px 32px",
                    borderRadius: 5,
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 11,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  Continue to secure checkout →
                </a>
              </div>
            )}

            {/* Trust strip */}
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, fontFamily: "'Barlow', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,15,0.55)" }}>
              <span>256-bit SSL</span>
              <span>·</span>
              <span>PCI-DSS Stripe</span>
              <span>·</span>
              <span>30-day returns</span>
              <span>·</span>
              <span>2-year warranty</span>
            </div>

            <div style={{ marginTop: 28, textAlign: "center" }}>
              <Link to="/en" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,15,0.55)", textDecoration: "none" }}>
                ← Back to Woolet
              </Link>
            </div>
          </div>
        </main>

        <footer style={{ padding: "20px 16px", borderTop: "1px solid rgba(15,15,15,0.06)", textAlign: "center", fontFamily: "'Barlow', sans-serif", fontSize: 10, color: "rgba(15,15,15,0.45)" }}>
          © 2024 JAY23 LLC — Woolet.co — Eyewear for Wide Faces
        </footer>
      </div>
    </>
  );
}
