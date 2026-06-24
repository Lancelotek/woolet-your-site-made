import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";

const BUY_BUTTON_ID = "buy_btn_1Tf0naLEPUSL9e9mbcfVXmQb";
const PUBLISHABLE_KEY = "pk_live_51IZBv9LEPUSL9e9m7dWKqimMZLNFxfjVfjAlLlXaSVqJ3emyB9v12FRo2ytUn9WszI84SRDb3kQxJmzKy7Qcoeih00lUJL9roa";
const STRIPE_FALLBACK_URL = "https://buy.stripe.com/6oU8wQfyBgKm3ERgZnfbq0n";

export default function Payments() {
  const [params] = useSearchParams();
  const product = params.get("product") || "";

  useEffect(() => {
    if (document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/buy-button.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <Helmet>
        <title>Secure Checkout — Woolet</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div style={{ minHeight: "100vh", background: "#f0ece4", color: "#0f0f0f", display: "flex", flexDirection: "column" }}>
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

        <main style={{ flex: 1, padding: "32px 16px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, margin: "0 0 8px", color: "#0f0f0f" }}>
                Secure checkout
              </h1>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "rgba(15,15,15,0.6)", margin: 0 }}>
                {product ? `Reserving Woolet ${product} · ` : ""}Payment processed by Stripe
              </p>
            </div>

            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid rgba(15,15,15,0.08)", padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(15,15,15,0.55)", margin: "0 0 18px" }}>
                Woolet {product || "007 / 009"} — Reserve for $1
              </p>

              {/* @ts-expect-error - Stripe web component */}
              <stripe-buy-button
                buy-button-id={BUY_BUTTON_ID}
                publishable-key={PUBLISHABLE_KEY}
              />

              <div style={{ marginTop: 18, fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "rgba(15,15,15,0.55)" }}>
                Button not loading?{" "}
                <a
                  href={STRIPE_FALLBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0f0f0f", textDecoration: "underline" }}
                >
                  Continue to Stripe →
                </a>
              </div>
            </div>


            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(15,15,15,0.55)" }}>
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

        <footer style={{ padding: "20px 16px", borderTop: "1px solid rgba(15,15,15,0.06)", textAlign: "center", fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "rgba(15,15,15,0.45)" }}>
          © 2024 JAY23 LLC — Woolet.co — Eyewear for Wide Faces
        </footer>
      </div>
    </>
  );
}
