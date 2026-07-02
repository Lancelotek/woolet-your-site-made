import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";
import { Link } from "react-router-dom";

/* Shared dark-luxury modal shell — premium, gold accents, full-screen on mobile */
const shellClass =
  "max-w-lg w-full sm:rounded-md p-0 gap-0 border-[hsl(var(--gold)/0.18)] " +
  "bg-[hsl(var(--background))] text-foreground " +
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 " +
  "max-sm:max-w-none max-sm:w-screen max-sm:h-[100dvh] max-sm:rounded-none max-sm:border-0";

const goldBtn: React.CSSProperties = {
  background: "hsl(var(--gold))",
  color: "hsl(var(--background))",
  fontFamily: "Barlow, sans-serif",
  fontWeight: 500,
  fontSize: "0.7rem",
  padding: "15px 24px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  border: "none",
  cursor: "pointer",
  width: "100%",
  transition: "background 200ms",
};

const ghostLink: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  fontWeight: 300,
  fontSize: "0.78rem",
  color: "hsl(var(--cream-dim))",
  textDecoration: "underline",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid hsl(0 0% 100% / 0.15)",
  color: "hsl(var(--cream))",
  padding: "10px 0",
  fontSize: "0.95rem",
  fontFamily: "Barlow, sans-serif",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  fontWeight: 500,
  fontSize: "0.55rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "hsl(var(--cream-dim))",
  marginBottom: 8,
  display: "block",
};

const eyebrowText: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  fontWeight: 500,
  fontSize: "0.6rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "hsl(var(--gold))",
};

const WIDTH_OPTIONS = [
  { value: "158", label: "158 mm - standard fit (155-161 mm faces)" },
  { value: "bespoke", label: "Bespoke - 150-165 mm" },
  { value: "unsure", label: "Not sure - help me decide" },
];

/* ═══════════════════════════════════════════════════
   MODAL A — Reservation ($1)
   3 steps: Scan / measure → Email + name → Payment (mock)
   ═══════════════════════════════════════════════════ */
export function ReserveModal({
  open,
  onOpenChange,
  onSwitchToWaitlist,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSwitchToWaitlist?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [width, setWidth] = useState("158");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeLabel = width === "bespoke" ? "Bespoke" : "Standard fit";

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setError(null);
      }, 250);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || !email || !name) return;
    setSubmitting(true);
    setError(null);
    try {
      // TODO: Stripe Payment Element — Phase 4
      const { error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email,
          name,
          face_width: width,
          models: "reservation",
        },
      });
      if (fnError) throw fnError;
      pushGtmEvent("reservation_completed", { face_width: width, amount: 1 });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shellClass}>
        <div className="p-7 sm:p-8 flex flex-col gap-6 max-sm:h-full max-sm:overflow-y-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-between">
            <span style={eyebrowText}>
              {step < 4 ? `Reserve · Step ${step} of 3` : "Confirmed"}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  style={{
                    width: 18,
                    height: 2,
                    background: step === 4 || n <= step ? "hsl(var(--gold))" : "hsl(0 0% 100% / 0.12)",
                    transition: "background 200ms",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Step 1 — Measure (AI scan only) */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <DialogTitle asChild>
                <h2 className="font-display text-woolet-white" style={{ fontSize: "1.7rem", fontWeight: 300, lineHeight: 1.1 }}>
                  First — your <em className="italic text-gold-light">measurement</em>.
                </h2>
              </DialogTitle>
              <DialogDescription className="text-cream-dim leading-relaxed" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                30 seconds. Your phone or laptop camera. AI maps your face for sub-millimeter accuracy — this is the whole point. No camera access, no measurement, no $1 reserve.
              </DialogDescription>

              <Link
                to="/en/fit"
                onClick={() => {
                  pushGtmEvent("reservation_open_full_scan");
                  onOpenChange(false);
                }}
                style={{
                  ...goldBtn,
                  minHeight: 64,
                  padding: "20px 24px",
                  fontSize: "0.72rem",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Open the full AI scan — 30 seconds
              </Link>

              <ul className="flex flex-col gap-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "We never store the photo",
                  "Works on phone or laptop camera",
                  "You can retake until it's right",
                ].map((line) => (
                  <li
                    key={line}
                    style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.75rem",
                      color: "hsl(var(--cream-dim))",
                      lineHeight: 1.5,
                    }}
                  >
                    · {line}
                  </li>
                ))}
              </ul>

              <div style={{ height: 1, background: "hsl(0 0% 100% / 0.06)", marginTop: 4 }} />

              <a
                href="/en/lp/kickstarter"
                onClick={() => {
                  pushGtmEvent("reservation_switch_to_waitlist", { dest: "lp_kickstarter" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.8rem",
                  color: "hsl(var(--cream-dim))",
                  textAlign: "center",
                  padding: 0,
                  textDecoration: "none",
                }}
              >
                Can't scan right now?{" "}
                <span style={{ color: "hsl(var(--gold-light, var(--gold)))", textDecoration: "underline" }}>
                  Join the waitlist instead →
                </span>
              </a>
            </div>
          )}

          {/* Step 2 — Confirm measurement + identity */}
          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name && email) setStep(3);
              }}
              className="flex flex-col gap-5 animate-fade-in"
            >
              <div className="flex flex-col gap-1">
                <span style={{ ...eyebrowText, color: "hsl(var(--cream-dim))" }}>Your measurement</span>
                <DialogTitle asChild>
                  <h2 className="font-display text-woolet-white" style={{ fontSize: "1.7rem", fontWeight: 300, lineHeight: 1.1 }}>
                    <em className="italic text-gold-light">{width} mm</em> — {sizeLabel}
                  </h2>
                </DialogTitle>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setAdjustOpen((v) => !v)}
                  style={{ ...ghostLink, fontSize: "0.78rem" }}
                >
                  {adjustOpen ? "Close adjust ↑" : "Doesn't feel right? Adjust →"}
                </button>
                {adjustOpen && (
                  <div className="flex flex-col gap-2 mt-3 animate-fade-in">
                    {WIDTH_OPTIONS.filter((o) => o.value !== "unsure").map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWidth(opt.value)}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          background: width === opt.value ? "hsl(var(--gold) / 0.08)" : "transparent",
                          border: `1px solid ${width === opt.value ? "hsl(var(--gold))" : "hsl(0 0% 100% / 0.1)"}`,
                          color: "hsl(var(--cream))",
                          fontFamily: "Barlow, sans-serif",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          borderRadius: 2,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <DialogDescription className="text-cream-dim" style={{ fontSize: "0.82rem" }}>
                Where do we send the confirmation?
              </DialogDescription>

              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="woolet-input"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="woolet-input"
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={!name || !email} style={{ ...goldBtn, opacity: !name || !email ? 0.55 : 1 }}>
                Continue to payment →
              </button>
            </form>
          )}

          {/* Step 3 — Payment (mock until Stripe Phase 4) */}
          {step === 3 && (
            <form onSubmit={submit} className="flex flex-col gap-5 animate-fade-in">
              <DialogTitle asChild>
                <h2 className="font-display text-woolet-white" style={{ fontSize: "1.7rem", fontWeight: 300, lineHeight: 1.1 }}>
                  Lock your fit for <em className="italic text-gold-light">$1</em>.
                </h2>
              </DialogTitle>
              <DialogDescription className="text-cream-dim leading-relaxed" style={{ fontSize: "0.85rem" }}>
                Refundable any time. Final pre-order price <span className="text-foreground">$114</span> (was $190) — paid only when the Kickstarter launches in October 2026.
              </DialogDescription>

              <div
                style={{
                  border: "1px solid hsl(var(--gold) / 0.25)",
                  background: "hsl(var(--gold) / 0.04)",
                  padding: "14px 16px",
                  fontSize: "0.78rem",
                  color: "hsl(var(--cream-dim))",
                  fontFamily: "Barlow, sans-serif",
                  lineHeight: 1.5,
                }}
              >
                Payment processing goes live closer to launch. Your spot is held with email today —
                we'll email a one-click $1 payment link 24 h before the campaign opens.
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required style={{ marginTop: 4 }} />
                <span className="text-cream-dim" style={{ fontSize: "0.75rem", fontFamily: "Barlow, sans-serif" }}>
                  I accept the <Link to="/en/privacy-policy" className="text-gold-light underline">Privacy Policy</Link>.
                </span>
              </label>

              {error && <p style={{ color: "hsl(var(--woolet-red))", fontSize: "0.8rem" }}>{error}</p>}

              <button type="submit" disabled={submitting || !agree} style={{ ...goldBtn, opacity: submitting || !agree ? 0.6 : 1 }}>
                {submitting ? "Reserving…" : "Reserve my fit"}
              </button>
            </form>
          )}

          {/* Step 4 — Confirmation */}
          {step === 4 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <DialogTitle asChild>
                <h2 className="font-display text-woolet-white" style={{ fontSize: "1.9rem", fontWeight: 300, lineHeight: 1.05 }}>
                  You're <em className="italic text-gold-light">reserved</em>.
                </h2>
              </DialogTitle>
              <DialogDescription className="text-cream-dim leading-relaxed" style={{ fontSize: "0.9rem" }}>
                Final pre-order $114 (was $190) ships when the Kickstarter wraps — first deliveries November 2026.
                Check <span className="text-foreground">{email}</span> for confirmation.
              </DialogDescription>
              <button onClick={() => onOpenChange(false)} style={goldBtn}>
                Done
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════
   MODAL B — Waitlist (single screen)
   ═══════════════════════════════════════════════════ */
export function WaitlistModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [width, setWidth] = useState("158");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setTimeout(() => { setSubmitted(false); setError(null); }, 250);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email,
          name: name || undefined,
          face_width: width,
          models: "waitlist",
        },
      });
      if (fnError) throw fnError;
      pushGtmEvent("waitlist_completed", { face_width: width });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shellClass}>
        <div className="p-7 sm:p-8 flex flex-col gap-6 max-sm:h-full max-sm:overflow-y-auto">
          {!submitted ? (
            <form onSubmit={submit} className="flex flex-col gap-5 animate-fade-in">
              <span style={eyebrowText}>Waitlist · 40% off at launch</span>
              <DialogTitle asChild>
                <h2 className="font-display text-woolet-white" style={{ fontSize: "1.7rem", fontWeight: 300, lineHeight: 1.1 }}>
                  Get the launch <em className="italic text-gold-light">first</em>.
                </h2>
              </DialogTitle>
              <DialogDescription className="text-cream-dim" style={{ fontSize: "0.85rem" }}>
                We'll email you 24 hours before the Kickstarter opens — and you keep the founding-member 40% discount.
              </DialogDescription>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="woolet-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>First name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="woolet-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Preferred frame width</label>
                <select
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="woolet-input"
                  style={{ ...inputStyle, appearance: "none", background: "transparent" }}
                >
                  {WIDTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ background: "#1a1612", color: "#f0ece4" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required style={{ marginTop: 4 }} />
                <span className="text-cream-dim" style={{ fontSize: "0.75rem", fontFamily: "Barlow, sans-serif" }}>
                  I accept the <Link to="/en/privacy-policy" className="text-gold-light underline">Privacy Policy</Link>.
                </span>
              </label>

              {error && <p style={{ color: "hsl(var(--woolet-red))", fontSize: "0.8rem" }}>{error}</p>}

              <button type="submit" disabled={submitting || !agree || !email} style={{ ...goldBtn, opacity: submitting || !agree || !email ? 0.55 : 1 }}>
                {submitting ? "Adding…" : "Add me to the waitlist (40% off when launched)"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5 animate-fade-in">
              <DialogTitle asChild>
                <h2 className="font-display text-woolet-white" style={{ fontSize: "1.9rem", fontWeight: 300, lineHeight: 1.05 }}>
                  You're <em className="italic text-gold-light">on the list</em>.
                </h2>
              </DialogTitle>
              <DialogDescription className="text-cream-dim leading-relaxed" style={{ fontSize: "0.9rem" }}>
                We'll email you 24 hours before launch. Check <span className="text-foreground">{email}</span>.
              </DialogDescription>
              <button onClick={() => onOpenChange(false)} style={goldBtn}>
                Done
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
