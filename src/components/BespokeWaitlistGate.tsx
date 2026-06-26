import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// RFC 5322-inspired pragmatic email pattern.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function validateEmail(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Please enter your email.";
  if (value.length > 254) return "Email is too long.";
  if (/\s/.test(value)) return "Email can't contain spaces.";
  if ((value.match(/@/g) ?? []).length !== 1) return "Email must contain exactly one “@”.";
  const [local, domain] = value.split("@");
  if (!local) return "Add the part before the “@”.";
  if (!domain) return "Add the domain after the “@”.";
  if (!domain.includes(".")) return "Domain must include a dot (e.g. gmail.com).";
  if (domain.startsWith(".") || domain.endsWith(".")) return "Domain can't start or end with a dot.";
  if (domain.endsWith("-") || domain.startsWith("-")) return "Domain can't start or end with a hyphen.";
  const tld = domain.split(".").pop() ?? "";
  if (tld.length < 2) return "Domain ending looks too short.";
  if (!EMAIL_RE.test(value)) return "That doesn't look like a valid email.";
  return null;
}

const BespokeWaitlistGate = () => {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentTouched, setConsentTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"email" | "password">("email");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === "woolet") {
      try {
        window.localStorage.setItem("bespoke-gate-bypass", "woolet-preview");
      } catch {}
      window.location.reload();
    } else {
      setPasswordError("Incorrect password.");
    }
  };


  const emailError = validateEmail(email);
  const showEmailError = emailTouched && !!emailError;
  const showConsentError = consentTouched && !consent;
  const valid = !emailError && consent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setConsentTouched(true);
    if (!valid || status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: { email: email.trim(), source: "bespoke" },
      });
      if (fnError || !data?.success) {
        throw new Error(data?.error || fnError?.message || "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pt-20 pb-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70"
        style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
        aria-hidden
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-[18px] border border-cream/15 bg-background/95 p-7 sm:p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold-light text-[0.78rem] uppercase tracking-[0.22em] mb-5">
          <Lock size={11} />
          Private preview
        </div>

        <h2 className="font-display text-cream text-2xl sm:text-[1.75rem] font-light leading-tight">
          The Bespoke configurator is by invitation.
        </h2>
        <p className="mt-3 text-cream-dim text-sm leading-relaxed">
          Leave your email and we'll send you early access — together with your AI face scan results, so the configurator opens pre-measured.
        </p>

        {status === "success" ? (
          <div role="status" aria-live="polite" className="mt-6 rounded-[14px] border border-gold/40 bg-gold/[0.08] p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                <Check size={16} className="text-gold" />
              </div>
              <div className="min-w-0">
                <div className="text-cream text-[0.95rem] font-medium">You're on the Bespoke list.</div>
                <div className="text-cream-dim text-xs mt-1.5 leading-relaxed">
                  We've added <span className="text-cream break-all">{email.trim()}</span> to the waitlist.
                  Look out for an email from <span className="text-cream">hello@woolet.co</span> with your early-access invite — usually within 48 hours.
                </div>
                <div className="text-cream-dim/70 text-[0.78rem] uppercase tracking-[0.18em] mt-3">
                  Tip: check Promotions / Spam just in case.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="bespoke-gate-email" className="sr-only">Email</label>
              <input
                id="bespoke-gate-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setError(null);
                  }
                }}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={showEmailError}
                aria-describedby={showEmailError ? "bespoke-gate-email-error" : undefined}
                className={`w-full px-4 py-3 rounded-[10px] bg-cream/[0.04] border text-cream placeholder:text-cream-dim/60 text-sm focus:outline-none transition ${
                  showEmailError
                    ? "border-red-400/60 focus:border-red-400"
                    : "border-cream/15 focus:border-gold/60"
                }`}
              />
              {showEmailError && (
                <p id="bespoke-gate-email-error" role="alert" className="mt-2 text-[0.78rem] text-red-300">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setConsentTouched(true);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-cream/30 bg-transparent accent-gold cursor-pointer shrink-0"
                />
                <span className="text-[0.72rem] leading-relaxed text-cream-dim">
                  I agree to the{" "}
                  <Link to="/en/privacy" target="_blank" className="text-cream underline underline-offset-2 hover:text-gold-light">
                    Privacy Policy
                  </Link>{" "}
                  and to receiving updates about Woolet Bespoke.
                </span>
              </label>
              {showConsentError && (
                <p role="alert" className="mt-2 text-[0.78rem] text-red-300">
                  Please accept the Privacy Policy to continue.
                </p>
              )}
            </div>

            {error && (
              <div role="alert" className="text-[0.72rem] text-red-300 bg-red-500/10 border border-red-500/30 rounded-[8px] px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              aria-disabled={!valid || status === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gold text-background text-[0.72rem] uppercase tracking-[0.22em] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                "Request access"
              )}
            </button>

            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-cream-dim/70 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default BespokeWaitlistGate;
