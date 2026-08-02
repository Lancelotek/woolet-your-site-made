import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const UTM_STORAGE_KEY = "bespoke-utms";
const ACCESS_CODE = (import.meta.env.VITE_BESPOKE_ACCESS_CODE as string | undefined)?.trim() || "woolet1973";

function readStoredUtms(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}

function captureUtmsFromUrl(): Record<string, string> {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = readStoredUtms();
    let changed = false;
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v && v.trim() && stored[k] !== v.trim()) {
        stored[k] = v.trim();
        changed = true;
      }
    }
    if (changed) {
      try { window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(stored)); } catch {}
    }
    return stored;
  } catch { return {}; }
}

function detectCountryCode(): string | undefined {
  try {
    const lang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (!lang) return undefined;
    const parts = lang.split("-");
    if (parts.length >= 2) return parts[1].toUpperCase();
  } catch {}
  return undefined;
}

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
  const [password, setPassword] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get("access") || params.get("code") || params.get("password") || "").trim();
    } catch { return ""; }
  });
  // Email request is the primary step; the password screen is step two.
  const [mode, setMode] = useState<"password" | "email">(() => (password ? "password" : "email"));
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    captureUtmsFromUrl();
  }, []);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ACCESS_CODE) {
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
      const utms = captureUtmsFromUrl();
      const country_code = detectCountryCode();
      const body: Record<string, unknown> = {
        ...getAttribution(),
        email: email.trim(),
        source: "bespoke",
        event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
        ...utms,
      };
      if (country_code) body.country_code = country_code;
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body,
      });
      // Treat already-subscribed as success too.
      const alreadySubscribed = typeof data?.error === "string" && /already|exists|subscribed/i.test(data.error);
      if ((fnError || !data?.success) && !alreadySubscribed) {
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

        {mode === "password" ? (
          <>
            <h2 className="font-display text-cream text-2xl sm:text-[1.75rem] font-light leading-tight">
              Enter your access password.
            </h2>
            <p className="mt-3 text-cream-dim text-sm leading-relaxed">
              Paste the password we sent you by email to open the Bespoke configurator.
            </p>

            <form onSubmit={submitPassword} className="mt-6 space-y-3">
              <label htmlFor="bespoke-gate-password" className="block text-[0.72rem] uppercase tracking-[0.22em] text-cream-dim">
                Access password
              </label>
              <input
                id="bespoke-gate-password"
                type="text"
                autoFocus
                autoComplete="one-time-code"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                placeholder="Paste your password"
                className={`w-full px-4 py-3 rounded-[10px] bg-cream/[0.04] border text-cream placeholder:text-cream-dim/60 text-sm focus:outline-none transition ${
                  passwordError ? "border-red-400/60 focus:border-red-400" : "border-cream/15 focus:border-gold/60"
                }`}
              />
              {passwordError && (
                <p role="alert" className="text-[0.78rem] text-red-300">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full px-5 py-3 rounded-full bg-gold text-background text-[0.72rem] uppercase tracking-[0.22em] font-medium hover:bg-gold-light transition"
              >
                Unlock configurator
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-cream/10">
              <p className="text-[0.82rem] text-cream-dim mb-3 text-center">Don't have a password yet?</p>

              <ul className="mb-4 space-y-2">
                {[
                  "Made to your exact face measurements",
                  "Early-bird pricing before public launch",
                  "1-on-1 fit review with the design team",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.75rem] text-cream-dim leading-snug">
                    <span className="mt-0.5 text-gold" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setMode("email")}
                className="w-full px-5 py-3 rounded-[2px] border border-gold/50 bg-gold/[0.08] text-gold-light text-[0.72rem] uppercase tracking-[0.22em] font-medium hover:bg-gold/15 hover:text-gold transition"
              >
                Request early access →
              </button>
            </div>
          </>
        ) : (
          <>
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
                    <div className="text-cream text-[0.95rem] font-medium">Check your inbox.</div>
                    <div className="text-cream-dim text-xs mt-1.5 leading-relaxed">
                      We've sent your access code and a link to the configurator to <span className="text-cream break-all">{email.trim()}</span>. It usually arrives within a couple of minutes from <span className="text-cream">support@woolet.co</span>.
                    </div>
                    <div className="text-cream-dim/70 text-[0.78rem] uppercase tracking-[0.18em] mt-3">
                      Tip: check Promotions / Spam just in case.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="mt-4 w-full text-center text-[0.72rem] uppercase tracking-[0.22em] text-gold-light hover:text-gold transition"
                >
                  I already have the password →
                </button>
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
                      if (status === "error") { setStatus("idle"); setError(null); }
                    }}
                    onBlur={() => setEmailTouched(true)}
                    aria-invalid={showEmailError}
                    aria-describedby={showEmailError ? "bespoke-gate-email-error" : undefined}
                    className={`w-full px-4 py-3 rounded-[10px] bg-cream/[0.04] border text-cream placeholder:text-cream-dim/60 text-sm focus:outline-none transition ${
                      showEmailError ? "border-red-400/60 focus:border-red-400" : "border-cream/15 focus:border-gold/60"
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
                      onChange={(e) => { setConsent(e.target.checked); setConsentTouched(true); }}
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

            <div className="mt-6 pt-5 border-t border-cream/10 text-center">
              <button
                type="button"
                onClick={() => setMode("password")}
                className="text-[0.72rem] uppercase tracking-[0.22em] text-cream-dim hover:text-gold-light transition"
              >
                ← Have an access password?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default BespokeWaitlistGate;
