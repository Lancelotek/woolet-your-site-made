import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/* ───────── Config ───────── */
const CONFIG = {
  delayMs: 2500,
  exitIntent: true,
  suppressDays: 14,
  collectPhone: true,
  discountCode: "WOOLET-VIP40",
  mlAccount: "462864",
  mlForm: "181841173137065623",
  blogPathPrefix: "/blog", // matches any path containing /blog (e.g. /en/blog, /en/blog/slug)
  forwardUtms: true, // toggle UTM forwarding to MailerLite (fields[utm_*])
  utmKeys: ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const,
};

const STORAGE_KEY = "wlt_vip_seen";

const COUNTRY_CODES: Array<{ code: string; iso: string; name: string; label: string }> = [
  { code: "+1", iso: "US", name: "United States", label: "US +1" },
  { code: "+1", iso: "CA", name: "Canada", label: "CA +1" },
  { code: "+44", iso: "GB", name: "United Kingdom", label: "UK +44" },
  { code: "+353", iso: "IE", name: "Ireland", label: "IE +353" },
  { code: "+61", iso: "AU", name: "Australia", label: "AU +61" },
  { code: "+64", iso: "NZ", name: "New Zealand", label: "NZ +64" },
  { code: "+48", iso: "PL", name: "Poland", label: "PL +48" },
  { code: "+49", iso: "DE", name: "Germany", label: "DE +49" },
  { code: "+43", iso: "AT", name: "Austria", label: "AT +43" },
  { code: "+41", iso: "CH", name: "Switzerland", label: "CH +41" },
  { code: "+33", iso: "FR", name: "France", label: "FR +33" },
  { code: "+34", iso: "ES", name: "Spain", label: "ES +34" },
  { code: "+351", iso: "PT", name: "Portugal", label: "PT +351" },
  { code: "+39", iso: "IT", name: "Italy", label: "IT +39" },
  { code: "+31", iso: "NL", name: "Netherlands", label: "NL +31" },
  { code: "+32", iso: "BE", name: "Belgium", label: "BE +32" },
  { code: "+352", iso: "LU", name: "Luxembourg", label: "LU +352" },
  { code: "+45", iso: "DK", name: "Denmark", label: "DK +45" },
  { code: "+46", iso: "SE", name: "Sweden", label: "SE +46" },
  { code: "+47", iso: "NO", name: "Norway", label: "NO +47" },
  { code: "+358", iso: "FI", name: "Finland", label: "FI +358" },
  { code: "+354", iso: "IS", name: "Iceland", label: "IS +354" },
  { code: "+372", iso: "EE", name: "Estonia", label: "EE +372" },
  { code: "+371", iso: "LV", name: "Latvia", label: "LV +371" },
  { code: "+370", iso: "LT", name: "Lithuania", label: "LT +370" },
  { code: "+420", iso: "CZ", name: "Czechia", label: "CZ +420" },
  { code: "+421", iso: "SK", name: "Slovakia", label: "SK +421" },
  { code: "+36", iso: "HU", name: "Hungary", label: "HU +36" },
  { code: "+40", iso: "RO", name: "Romania", label: "RO +40" },
  { code: "+359", iso: "BG", name: "Bulgaria", label: "BG +359" },
  { code: "+386", iso: "SI", name: "Slovenia", label: "SI +386" },
  { code: "+385", iso: "HR", name: "Croatia", label: "HR +385" },
  { code: "+30", iso: "GR", name: "Greece", label: "GR +30" },
  { code: "+357", iso: "CY", name: "Cyprus", label: "CY +357" },
  { code: "+356", iso: "MT", name: "Malta", label: "MT +356" },
  { code: "+380", iso: "UA", name: "Ukraine", label: "UA +380" },
  { code: "+90", iso: "TR", name: "Turkey", label: "TR +90" },
  { code: "+971", iso: "AE", name: "United Arab Emirates", label: "AE +971" },
  { code: "+966", iso: "SA", name: "Saudi Arabia", label: "SA +966" },
  { code: "+972", iso: "IL", name: "Israel", label: "IL +972" },
  { code: "+27", iso: "ZA", name: "South Africa", label: "ZA +27" },
  { code: "+52", iso: "MX", name: "Mexico", label: "MX +52" },
  { code: "+55", iso: "BR", name: "Brazil", label: "BR +55" },
  { code: "+54", iso: "AR", name: "Argentina", label: "AR +54" },
  { code: "+56", iso: "CL", name: "Chile", label: "CL +56" },
  { code: "+81", iso: "JP", name: "Japan", label: "JP +81" },
  { code: "+82", iso: "KR", name: "South Korea", label: "KR +82" },
  { code: "+65", iso: "SG", name: "Singapore", label: "SG +65" },
  { code: "+852", iso: "HK", name: "Hong Kong", label: "HK +852" },
  { code: "+91", iso: "IN", name: "India", label: "IN +91" },
];

/* ───────── Helpers ───────── */
function isBlogPath(pathname: string, prefix: string): boolean {
  // Matches /blog, /en/blog, /en/blog/slug, /pl/blog/... etc.
  return pathname.includes(prefix);
}

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  if (!CONFIG.forwardUtms) return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  CONFIG.utmKeys.forEach((k) => {
    const v = sp.get(k);
    if (v) out[k] = v;
  });
  return out;
}

/** Map raw UTM values to MailerLite `fields[utm_*]` payload entries. */
export function mapUtmsToFields(utm: Record<string, string>): Record<string, string> {
  if (!CONFIG.forwardUtms) return {};
  return Object.fromEntries(
    Object.entries(utm)
      .filter(([k, v]) => CONFIG.utmKeys.includes(k as typeof CONFIG.utmKeys[number]) && !!v)
      .map(([k, v]) => [`fields[${k}]`, v])
  );
}

/**
 * Submit to MailerLite via our edge function so the lead lands in the
 * "Woolet Waitlist ENG" group (default route in mailerlite-subscribe)
 * with phone + UTM fields properly attached.
 */
async function submitToWaitlist(input: {
  email: string;
  phone?: string;
  utm: Record<string, string>;
}) {
  try {
    const { error } = await supabase.functions.invoke("mailerlite-subscribe", {
      body: {
        email: input.email,
        phone: input.phone,
        source: "kickstarter", // → VIP_GROUP_ID = Woolet Waitlist ENG
        ...input.utm,
      },
    });
    if (error) console.warn("[VipPopup] mailerlite-subscribe error:", error);
  } catch (e) {
    console.warn("[VipPopup] submit failed:", e);
  }
}

function isSuppressed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return false;
    const ts = parseInt(v, 10);
    if (!ts) return false;
    return Date.now() - ts < CONFIG.suppressDays * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setSuppressed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/* ───────── Component ───────── */
type Step = 1 | 2 | 3;

export default function VipPopup() {
  const { pathname } = useLocation();
  const onBlog = isBlogPath(pathname, CONFIG.blogPathPrefix);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+1");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const shownThisSession = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  /* Trigger: delay + exit-intent, once per session, suppressed for 14d */
  useEffect(() => {
    if (!onBlog) return;
    if (shownThisSession.current) return;
    if (isSuppressed()) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      shownThisSession.current = true;
      setOpen(true);
    };

    const t = window.setTimeout(fire, CONFIG.delayMs);

    const onMouseOut = (e: MouseEvent) => {
      if (!CONFIG.exitIntent) return;
      if (e.clientY <= 0 && !e.relatedTarget) fire();
    };
    if (CONFIG.exitIntent) document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [onBlog]);

  /* Body scroll lock + focus + Escape */
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);

    const focusT = window.setTimeout(() => {
      if (step === 1) emailRef.current?.focus();
      if (step === 2) phoneRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  if (!onBlog) return null;

  function handleClose() {
    setOpen(false);
    setSuppressed();
  }

  function validateEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailErr("Please enter a valid email.");
      return;
    }
    if (!consent) {
      setEmailErr("Please agree to receive launch updates.");
      return;
    }
    setEmailErr(null);
    setSubmitting(true);

    const utm = readUtm();
    await submitToWaitlist({ email: email.trim(), utm });
    setSubmitting(false);

    if (CONFIG.collectPhone) {
      setStep(2);
    } else {
      setStep(3);
      setSuppressed();
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 6) {
      setPhoneErr("Please enter a valid phone number.");
      return;
    }
    setPhoneErr(null);
    setSubmitting(true);

    const fullPhone = `${country} ${phone.trim()}`;
    const utm = readUtm();
    await submitToWaitlist({ email: email.trim(), phone: fullPhone, utm });
    setSubmitting(false);
    setStep(3);
    setSuppressed();
  }

  function handleSkipPhone() {
    setStep(3);
    setSuppressed();
  }

  if (!open) return null;

  return (
    <>
      <style>{css}</style>
      <div
        className="wlt-vip-backdrop"
        onClick={handleClose}
        role="presentation"
      >
        <div
          className="wlt-vip-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wlt-vip-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="wlt-vip-close"
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>

          {/* LEFT */}
          <div className="wlt-vip-left">
            <svg
              className="wlt-vip-glasses"
              width="56"
              height="22"
              viewBox="0 0 56 22"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="9" stroke="#c6a15b" strokeWidth="1.4" />
              <circle cx="45" cy="11" r="9" stroke="#c6a15b" strokeWidth="1.4" />
              <path d="M20 11h16" stroke="#c6a15b" strokeWidth="1.4" />
            </svg>
            <div className="wlt-vip-kicker">VIP early access</div>
            <div className="wlt-vip-offer">
              <div className="wlt-vip-offer-num">40%</div>
              <div className="wlt-vip-offer-sub">off founding price</div>
            </div>
            <div className="wlt-vip-offer-note">
              + priority Kickstarter access — no payment today
            </div>
          </div>

          {/* RIGHT */}
          <div className="wlt-vip-right">
            <div className="wlt-vip-wordmark">W O O L E T</div>

            {step === 2 && (
              <div className="wlt-vip-progress" aria-hidden="true">
                <span className="wlt-vip-seg filled" />
                <span className="wlt-vip-seg filled" />
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} noValidate>
                <h2 id="wlt-vip-title" className="wlt-vip-h">
                  Be first. Save 40%.
                </h2>
                <p className="wlt-vip-p">
                  Join the VIP list for our Kickstarter launch — lock in the
                  founding price on Italian acetate frames built for wider
                  faces. Reserve your spot, pay nothing today.
                </p>

                <label className="wlt-vip-label" htmlFor="wlt-vip-email">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="wlt-vip-email"
                  className="wlt-vip-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <label className="wlt-vip-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Yes, send me the founding offer and launch updates by email
                    and text. I can unsubscribe anytime. See our{" "}
                    <a href="/en/privacy-policy" target="_blank" rel="noreferrer">
                      privacy
                    </a>{" "}
                    &amp;{" "}
                    <a href="/en/return-policy" target="_blank" rel="noreferrer">
                      terms
                    </a>
                    .
                  </span>
                </label>

                {emailErr && <div className="wlt-vip-err">{emailErr}</div>}

                <button
                  type="submit"
                  className="wlt-vip-btn"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Claim my 40% off"}
                </button>
                <button
                  type="button"
                  className="wlt-vip-link"
                  onClick={handleClose}
                >
                  No thanks, I’ll pay full price
                </button>

                <div className="wlt-vip-trust">
                  Handmade in Italy · 30-day returns · No payment today
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handlePhoneSubmit} noValidate>
                <button
                  type="button"
                  className="wlt-vip-back"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <h2 className="wlt-vip-h">Want a launch-day text?</h2>
                <p className="wlt-vip-p">
                  You’re on the list. Add your number and we’ll text you the
                  second the Kickstarter goes live — so the founding price
                  doesn’t slip past you.
                </p>

                <label className="wlt-vip-label" htmlFor="wlt-vip-phone">
                  Mobile number
                </label>
                <div className="wlt-vip-phone-row">
                  <select
                    className="wlt-vip-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    aria-label="Country code"
                  >
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={`${c.label}-${i}`} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    ref={phoneRef}
                    id="wlt-vip-phone"
                    className="wlt-vip-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(201) 555-0123"
                    autoComplete="tel"
                  />
                </div>

                {phoneErr && <div className="wlt-vip-err">{phoneErr}</div>}

                <button
                  type="submit"
                  className="wlt-vip-btn"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Text me at launch"}
                </button>
                <button
                  type="button"
                  className="wlt-vip-link"
                  onClick={handleSkipPhone}
                >
                  Skip — email is fine
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="wlt-vip-success">
                <div className="wlt-vip-check" aria-hidden="true">✓</div>
                <h2 className="wlt-vip-h">You’re on the VIP list.</h2>
                <p className="wlt-vip-p">
                  We’ll text and email you the moment the Kickstarter goes live
                  — with your 40% founding price locked in.
                </p>
                <div className="wlt-vip-code">{CONFIG.discountCode}</div>
                <button
                  type="button"
                  className="wlt-vip-btn"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── Styles ───────── */
const css = `
.wlt-vip-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(10, 11, 13, 0.62);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: wltFade .25s ease-out;
}
.wlt-vip-card {
  position: relative;
  width: 100%; max-width: 820px;
  background: #faf7f2;
  border-radius: 16px;
  overflow: hidden;
  display: grid; grid-template-columns: 320px 1fr;
  box-shadow: 0 30px 80px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.2);
  animation: wltSlide .35s cubic-bezier(.2,.7,.2,1);
}
@keyframes wltFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes wltSlide { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }

.wlt-vip-close {
  position: absolute; top: 12px; right: 14px; z-index: 2;
  width: 32px; height: 32px; border-radius: 999px;
  background: rgba(255,255,255,.85); border: 0;
  font-size: 22px; line-height: 1; color: #2c3036;
  cursor: pointer; display: grid; place-items: center;
}
.wlt-vip-close:hover { background: #fff; }

.wlt-vip-left {
  position: relative;
  background: radial-gradient(circle at 30% 25%, #2c3036 0%, #16181b 75%);
  color: #fff;
  padding: 36px 28px;
  display: flex; flex-direction: column; justify-content: center;
}
.wlt-vip-glasses { position: absolute; top: 24px; left: 24px; opacity: .9; }
.wlt-vip-kicker {
  text-transform: uppercase; letter-spacing: .22em;
  font-size: 10px; color: #c6a15b; margin-bottom: 16px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.wlt-vip-offer { font-family: Georgia, "Times New Roman", serif; line-height: 1; }
.wlt-vip-offer-num { font-size: 74px; font-weight: 400; letter-spacing: -.02em; }
.wlt-vip-offer-sub { font-size: 30px; color: #c6a15b; margin-top: 6px; }
.wlt-vip-offer-note {
  margin-top: 24px; font-size: 12px; line-height: 1.6;
  color: rgba(255,255,255,.72);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.wlt-vip-right {
  padding: 36px 36px 30px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #2c3036;
  display: flex; flex-direction: column;
}
.wlt-vip-wordmark {
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: .35em; font-size: 11px;
  color: #6b6f76; margin-bottom: 18px;
}
.wlt-vip-progress { display: flex; gap: 6px; margin-bottom: 12px; }
.wlt-vip-seg {
  flex: 1; height: 3px; border-radius: 2px;
  background: rgba(44,48,54,.12);
}
.wlt-vip-seg.filled { background: #c6a15b; }

.wlt-vip-back {
  background: none; border: 0; padding: 0;
  color: #6b6f76; font-size: 12px; cursor: pointer;
  margin-bottom: 8px; align-self: flex-start;
}
.wlt-vip-back:hover { color: #2c3036; }

.wlt-vip-h {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 28px; line-height: 1.15; margin: 0 0 10px;
  color: #16181b; font-weight: 500;
}
.wlt-vip-p {
  font-size: 13.5px; line-height: 1.55; color: #4a4f57;
  margin: 0 0 18px;
}

.wlt-vip-label {
  display: block; font-size: 11px; text-transform: uppercase;
  letter-spacing: .14em; color: #6b6f76; margin-bottom: 6px;
}
.wlt-vip-input, .wlt-vip-select {
  width: 100%; padding: 12px 14px;
  border: 1px solid rgba(44,48,54,.18);
  border-radius: 8px; background: #fff;
  font-size: 14px; color: #16181b;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.wlt-vip-input:focus, .wlt-vip-select:focus {
  outline: none; border-color: #c6a15b;
  box-shadow: 0 0 0 3px rgba(198,161,91,.22);
}
.wlt-vip-phone-row { display: grid; grid-template-columns: 110px 1fr; gap: 8px; }

.wlt-vip-consent {
  display: flex; gap: 10px; align-items: flex-start;
  margin: 14px 0 4px; font-size: 11.5px; line-height: 1.5; color: #5a5f67;
}
.wlt-vip-consent input { margin-top: 3px; accent-color: #c6a15b; }
.wlt-vip-consent a { color: #2c3036; text-decoration: underline; }

.wlt-vip-err {
  margin-top: 10px; font-size: 12px; color: #a8331f;
}

.wlt-vip-btn {
  margin-top: 18px; width: 100%;
  background: #16181b; color: #faf7f2;
  border: 0; padding: 14px 18px; border-radius: 8px;
  font-size: 13px; letter-spacing: .08em; text-transform: uppercase;
  font-weight: 600; cursor: pointer;
  transition: background .18s, color .18s;
}
.wlt-vip-btn:hover:not(:disabled) { background: #c6a15b; color: #16181b; }
.wlt-vip-btn:disabled { opacity: .6; cursor: default; }

.wlt-vip-link {
  margin-top: 10px; background: none; border: 0;
  color: #6b6f76; font-size: 12px; cursor: pointer;
  text-decoration: underline; align-self: center;
}
.wlt-vip-link:hover { color: #2c3036; }

.wlt-vip-trust {
  margin-top: 16px; font-size: 10.5px; letter-spacing: .14em;
  text-transform: uppercase; color: #8a8e95; text-align: center;
}

.wlt-vip-success { text-align: center; padding: 8px 0 4px; }
.wlt-vip-check {
  width: 56px; height: 56px; border-radius: 999px;
  background: rgba(198,161,91,.15); color: #c6a15b;
  font-size: 30px; line-height: 56px; margin: 0 auto 14px;
  border: 1px solid rgba(198,161,91,.5);
}
.wlt-vip-code {
  margin: 14px auto 0; max-width: 260px;
  padding: 12px 16px; border: 1.5px dashed #c6a15b;
  border-radius: 8px; color: #c6a15b;
  font-family: Georgia, serif; letter-spacing: .18em;
  font-size: 15px;
}

@media (max-width: 680px) {
  .wlt-vip-card { grid-template-columns: 1fr; max-width: 460px; }
  .wlt-vip-left { padding: 26px 22px 22px; }
  .wlt-vip-glasses { display: none; }
  .wlt-vip-offer-num { font-size: 52px; }
  .wlt-vip-offer-sub { font-size: 22px; }
  .wlt-vip-right { padding: 24px 22px 22px; }
  .wlt-vip-h { font-size: 22px; }
}
`;
