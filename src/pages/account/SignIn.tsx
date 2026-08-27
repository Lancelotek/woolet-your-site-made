import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { isValidLang, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const GOLD = "#c9a84c";
const emailSchema = z.string().trim().email("Enter a valid email").max(255);

// A caller (e.g. the OAuth consent screen) can pass ?next=/... to have the
// magic link return the user to that path instead of /account. Only same-origin
// relative paths are honored.
function safeNext(): string | null {
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default function SignIn() {
  const { lang: paramLang } = useParams();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = typeof window !== "undefined" ? safeNext() : null;
  if (!loading && session) {
    return <Navigate to={nextPath ?? `/${lang}/account`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    if (!agreed) {
      setError("Please accept the privacy policy.");
      return;
    }
    setSubmitting(true);
    // Preserve `next` through the round trip for the link fallback.
    const callback = new URL(`${window.location.origin}/${lang}/account/callback`);
    if (nextPath) callback.searchParams.set("next", nextPath);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callback.toString(),
        data: { locale: lang },
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = code.replace(/\D/g, "");
    if (token.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email: emailSchema.parse(email),
      token,
      type: "email",
    });
    if (err) {
      setVerifying(false);
      setError("That code is invalid or expired. Request a new one.");
      return;
    }
    // Link any scans / orders already made with this email.
    try {
      await supabase.rpc("link_user_data_by_email");
    } catch {
      /* non-blocking */
    }
    window.location.replace(nextPath ?? `/${lang}/account`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Sign in — Woolet" description="Sign in to view your fit scan history and orders." noindex />
      <Navbar />
      <main className="flex-1 px-5 py-16 flex justify-center">
        <div className="w-full max-w-[480px] flex flex-col gap-8">
          <div>
            <p className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.65rem" }}>
              Account
            </p>
            <h1 className="font-display text-foreground mt-3" style={{ fontSize: "2.25rem", fontWeight: 300, lineHeight: 1.1 }}>
              Sign in to <em className="italic" style={{ color: GOLD }}>your Woolet</em>
            </h1>
            <p className="text-cream-dim mt-4" style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
              We'll email you a 6-digit code each time. No password to remember — your bespoke build and fit scans stay saved to your account.
            </p>
          </div>

          {sent ? (
            <form
              onSubmit={handleVerify}
              className="flex flex-col gap-4 p-6"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)" }}
              noValidate
            >
              <p className="font-display text-foreground" style={{ fontSize: "1.4rem", fontWeight: 300 }}>
                Enter your code
              </p>
              <p className="text-cream-dim" style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>
                We sent a 6-digit code to <strong style={{ color: "white" }}>{email}</strong>. It expires in 60 minutes.
              </p>
              <label htmlFor="signin-code" className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.7rem" }}>
                Sign-in code
              </label>
              <input
                id="signin-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                autoFocus
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  padding: "14px 16px",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "1.4rem",
                  letterSpacing: "0.5em",
                  textAlign: "center",
                  borderRadius: 4,
                }}
              />
              {error && (
                <span style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem" }}>{error}</span>
              )}
              <button
                type="submit"
                disabled={verifying}
                style={{
                  background: verifying ? "rgba(201,168,76,0.4)" : GOLD,
                  color: "#0f0f0f",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  padding: "18px 28px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: verifying ? "wait" : "pointer",
                  height: 52,
                }}
              >
                {verifying ? "Verifying…" : "Sign in"}
              </button>
              <p className="text-cream-dim" style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                Didn't get it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setCode("");
                    setError(null);
                  }}
                  className="underline bg-transparent border-none p-0 cursor-pointer"
                  style={{ color: GOLD }}
                >
                  use a different email
                </button>
                .
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <label htmlFor="signin-email" className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.7rem" }}>
                Your email
              </label>
              <input
                id="signin-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  padding: "14px 16px",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "1rem",
                  borderRadius: 4,
                }}
              />
              <label className="flex items-start gap-2 cursor-pointer text-cream-dim" style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3, accentColor: GOLD }}
                />
                <span>
                  I agree to the{" "}
                  <Link to={`/${lang}/privacy-policy`} style={{ color: GOLD }}>
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {error && (
                <span style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem" }}>{error}</span>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 8,
                  background: submitting ? "rgba(201,168,76,0.4)" : GOLD,
                  color: "#0f0f0f",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  padding: "18px 28px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: submitting ? "wait" : "pointer",
                  height: 52,
                }}
              >
                {submitting ? "Sending…" : "Email me the link"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
