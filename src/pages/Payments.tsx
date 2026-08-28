import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
const wooletLogo = wooletLogoAsset.url;

const BUY_BUTTON_ID = "buy_btn_1Tf0naLEPUSL9e9mbcfVXmQb";
const PUBLISHABLE_KEY = "pk_live_51IZBv9LEPUSL9e9m7dWKqimMZLNFxfjVfjAlLlXaSVqJ3emyB9v12FRo2ytUn9WszI84SRDb3kQxJmzKy7Qcoeih00lUJL9roa";
const STRIPE_FALLBACK_URL = "https://buy.stripe.com/6oU8wQfyBgKm3ERgZnfbq0n";

type Product = "007" | "009" | "bespoke";

function normalizeProduct(raw: string): Product {
  const v = raw.toLowerCase();
  if (v.includes("bespoke")) return "bespoke";
  if (v.includes("009")) return "009";
  return "007";
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cardBadgeBase: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 24, minWidth: 38, padding: "0 6px", borderRadius: 3,
  border: "1px solid rgba(15,15,15,0.12)", background: "#fff",
};

const CardBadges = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }} role="img" aria-label="Accepted payment methods: Visa, Mastercard, American Express">
    <span style={cardBadgeBase}>
      <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true"><text x="0" y="8.5" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="bold" fontStyle="italic" fill="#1A1F71">VISA</text></svg>
    </span>
    <span style={cardBadgeBase}>
      <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true"><circle cx="10" cy="8" r="7" fill="#EB001B"/><circle cx="18" cy="8" r="7" fill="#F79E1B" fillOpacity="0.85"/></svg>
    </span>
    <span style={cardBadgeBase}>
      <svg width="30" height="12" viewBox="0 0 30 12" aria-hidden="true"><rect width="30" height="12" rx="2" fill="#2E77BC"/><text x="15" y="9" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="bold" fill="#fff">AMEX</text></svg>
    </span>
  </div>
);

export default function Payments() {
  const [params] = useSearchParams();
  const productParam = params.get("product") || "007";
  const product: Product = normalizeProduct(productParam);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // once true → show Stripe button

  useEffect(() => {
    if (!ready) return;
    if (document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/buy-button.js";
    s.async = true;
    document.head.appendChild(s);
  }, [ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!emailRe.test(trimmedEmail) || trimmedEmail.length > 320) {
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmedPhone && trimmedPhone.length > 40) {
      setError("Phone number is too long.");
      return;
    }
    if (!consent) {
      setError("Please accept the confirmation email consent to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const utm = {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      };
      const { error: insertError } = await supabase.from("reservation_leads").insert({
        email: trimmedEmail,
        phone: trimmedPhone || null,
        product,
        locale: navigator.language?.slice(0, 5) || null,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent?.slice(0, 500) || null,
      });
      if (insertError) throw insertError;
      try { sessionStorage.setItem("woolet_reservation_email", trimmedEmail); } catch { /* noop */ }
      setReady(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontFamily: "'Barlow', sans-serif",
    fontSize: 15, border: "1px solid rgba(15,15,15,0.18)", borderRadius: 4,
    background: "#fff", color: "#0f0f0f", outline: "none", boxSizing: "border-box",
  };

  const productLabel = product === "bespoke" ? "Bespoke" : product;

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
              <img src={wooletLogo} alt="Woolet" style={{ height: 32, width: "auto", display: "block" }} />
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
                Reserving Woolet {productLabel} · Payment processed by Stripe
              </p>
            </div>

            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid rgba(15,15,15,0.08)", padding: "28px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(15,15,15,0.55)", margin: "0 0 12px", textAlign: "center" }}>
                Woolet {productLabel} — Reserve for $1
              </p>

              <div style={{ background: "rgba(194,160,90,0.08)", border: "1px solid rgba(194,160,90,0.35)", borderRadius: 4, padding: "12px 14px", marginBottom: 20, fontFamily: "'Barlow', sans-serif", fontSize: 13, lineHeight: 1.6, color: "rgba(15,15,15,0.75)" }}>
                <strong style={{ color: "#0f0f0f" }}>How the $1 reservation works:</strong> reserve now for $1 and lock the founding price of <strong>$114</strong> instead of $190 (save 40%) when the Kickstarter launches. The $1 counts toward your purchase. Free shipping, 30-day returns, 2-year warranty.
              </div>

              {!ready ? (
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(15,15,15,0.7)" }}>
                      Email <span style={{ color: "#c9a84c" }}>*</span>
                    </span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(15,15,15,0.7)" }}>
                      Phone <span style={{ color: "rgba(15,15,15,0.4)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "rgba(15,15,15,0.7)", lineHeight: 1.5 }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      Send me the reservation confirmation and shipping updates. See our{" "}
                      <Link to="/en/privacy" style={{ color: "#0f0f0f" }}>privacy policy</Link>.
                    </span>
                  </label>

                  {error && (
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#b3261e", background: "rgba(179,38,30,0.06)", padding: "8px 12px", borderRadius: 4 }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 4, width: "100%", padding: "14px 0",
                      background: "#c2a05a", color: "#0b0a09", border: "none",
                      borderRadius: 2, cursor: submitting ? "wait" : "pointer",
                      fontFamily: "'Barlow', sans-serif", fontWeight: 600,
                      fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? "Saving…" : "Continue to payment →"}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "rgba(15,15,15,0.6)", marginBottom: 14 }}>
                    Confirmation will be sent to <strong>{email}</strong>
                  </div>
                  {/* @ts-expect-error - Stripe web component */}
                  <stripe-buy-button
                    buy-button-id={BUY_BUTTON_ID}
                    publishable-key={PUBLISHABLE_KEY}
                    customer-email={email}
                  />
                  <div style={{ marginTop: 18, fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "rgba(15,15,15,0.55)" }}>
                    Button not loading?{" "}
                    <a
                      href={`${STRIPE_FALLBACK_URL}?prefilled_email=${encodeURIComponent(email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0f0f0f", textDecoration: "underline" }}
                    >
                      Continue to Stripe →
                    </a>
                  </div>
                </div>
              )}
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
