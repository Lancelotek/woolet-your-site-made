import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { t, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";

const inputStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  backgroundColor: "transparent",
  color: "#f0ece4",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "1px solid #2a2520",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#7a7570",
  textTransform: "uppercase" as const,
  marginBottom: "8px",
};

const WaitlistForm = ({ lang = "en" as Lang, prefilledWidth }: { lang?: Lang; prefilledWidth?: string }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(23);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    faceWidth: prefilledWidth || "",
    model007: true,
    model009: true,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = count + "%";
    }, 400);
    return () => clearTimeout(t);
  }, [count]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const models = [
        formData.model007 && "Woolet 007",
        formData.model009 && "Woolet 009",
      ]
        .filter(Boolean)
        .join(", ");

      const { data, error: fnError } = await supabase.functions.invoke(
        "mailerlite-subscribe",
        {
          body: {
            email: formData.email,
            name: formData.name,
            face_width: formData.faceWidth,
            models,
          },
        }
      );

      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Subscription failed");

      pushGtmEvent("waitlist_signup", {
        waitlist_name: formData.name,
        waitlist_email: formData.email,
        waitlist_face_width: formData.faceWidth,
        waitlist_models: models,
      });

      setSubmitted(true);
      setCount((c) => c + 1);
    } catch (err: unknown) {
      console.error("Waitlist error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="waitlist-form" style={{ paddingBottom: "40px" }}>
      {/* Desktop progress */}
      <div className="hidden md:flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span style={{ ...labelStyle, fontSize: "0.56rem", letterSpacing: "0.24em" }}>Waitlist</span>
          <span className="text-primary tracking-wider" style={{ fontSize: "0.58rem" }}>
            {count} / 100 spots
          </span>
        </div>
        <div className="h-px relative overflow-visible" style={{ background: "#2a2520" }}>
          <div
            ref={fillRef}
            className="h-full transition-all duration-[1.8s] ease-out"
            style={{ width: "0%", background: "linear-gradient(90deg, hsl(var(--gold-dim)), hsl(var(--gold-light)))" }}
          />
        </div>
      </div>

      {/* Mobile progress pill */}
      <div className="md:hidden flex flex-col gap-1.5 mb-1">
        <div
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{
            background: "#1a1612",
            borderRadius: "999px",
            padding: "6px 16px",
            height: "32px",
          }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-[1.8s] ease-out"
            style={{
              width: `${count}%`,
              background: "#c9a84c",
              borderRadius: "999px",
            }}
          />
          <span
            className="relative z-10 font-bold tracking-wider"
            style={{ fontSize: "13px", color: "#0f0f0f" }}
          >
            {count} of 100 founding member spots remaining
          </span>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-4">
          <div className="flex gap-2.5 flex-col sm:flex-row">
            <div className="flex-1 flex flex-col">
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                placeholder="James"
                required
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="woolet-input py-3 font-body placeholder:text-cream-dim/30 focus:border-b-primary transition-colors"
                style={inputStyle}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="james@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="woolet-input py-3 font-body placeholder:text-cream-dim/30 focus:border-b-primary transition-colors"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label style={labelStyle}>Preferred frame width</label>
            <div className="relative">
              <select
                value={formData.faceWidth}
                onChange={(e) => setFormData((f) => ({ ...f, faceWidth: e.target.value }))}
                className="woolet-input w-full py-3 pr-8 font-body appearance-none focus:border-b-primary transition-colors"
                style={{ ...inputStyle, fontSize: "max(0.82rem, 16px)" }}
              >
                <option value="" style={{ background: "#1a1612", color: "#f0ece4" }}>Select your frame width</option>
                <option value="unknown" style={{ background: "#1a1612", color: "#f0ece4" }}>I don't know yet — help me measure</option>
                <option value="138" style={{ background: "#1a1612", color: "#f0ece4" }}>138–144 mm (Wide)</option>
                <option value="145" style={{ background: "#1a1612", color: "#f0ece4" }}>145–154 mm (Extra-Wide)</option>
                <option value="155" style={{ background: "#1a1612", color: "#f0ece4" }}>155–161 mm (XL)</option>
                <option value="162" style={{ background: "#1a1612", color: "#f0ece4" }}>162 mm+ (XXL)</option>
              </select>
              <div
                className="absolute right-0 top-1/2 -translate-y-[80%] rotate-45 pointer-events-none"
                style={{ width: "6px", height: "6px", borderRight: "1px solid #c9a84c", borderBottom: "1px solid #c9a84c" }}
              />
            </div>
          </div>

          {/* Privacy policy checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer text-cream-dim hover:text-foreground transition-colors mt-1" style={{ fontSize: "0.68rem" }}>
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={() => setPrivacyAccepted((v) => !v)}
              className="hidden"
            />
            <div
              className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-all mt-[1px]`}
              style={{
                backgroundColor: privacyAccepted ? "#c9a84c" : "transparent",
                borderColor: privacyAccepted ? "#c9a84c" : "#2a2520",
              }}
            >
              {privacyAccepted && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span>
              {t(lang, "waitlist.privacy").split("{link}")[0]}
              <Link to={`/${lang}/privacy-policy`} className="text-primary underline underline-offset-2 hover:text-gold-light transition-colors">
                {t(lang, "waitlist.privacy").split("{link}")[1]?.split("{/link}")[0]}
              </Link>
              {t(lang, "waitlist.privacy").split("{/link}")[1] || ""}
            </span>
          </label>

          {error && (
            <p className="text-center" style={{ fontSize: "0.68rem", color: "#e25555" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !privacyAccepted}
            className="relative overflow-hidden bg-primary text-primary-foreground border-none font-body w-full transition-all hover:bg-gold-light active:scale-[0.99] group disabled:opacity-60 flex flex-col items-center justify-center"
            style={{ minHeight: "56px", padding: "12px 24px" }}
          >
            <span className="relative z-10 font-semibold uppercase tracking-[0.28em]" style={{ fontSize: "0.72rem" }}>
              {loading ? "Sending..." : "Claim My Spot"}
            </span>
            {!loading && (
              <span className="relative z-10 uppercase tracking-[0.2em]" style={{ fontSize: "11px", color: "#a07a2a" }}>
                15% Off + Free Shipping
              </span>
            )}
            <span className="absolute inset-0 bg-woolet-white/15 -translate-x-full group-hover:translate-x-full transition-transform duration-400" />
          </button>

          <p className="text-cream-dim opacity-55 tracking-wider text-center mt-0.5" style={{ fontSize: "0.57rem" }}>
            No credit card. No spam. Unsubscribe anytime.
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-3 p-6 border animate-fade-in" style={{ background: "hsl(var(--gold) / 0.06)", borderColor: "hsl(var(--gold) / 0.2)" }}>
          <div className="w-7 h-7 border border-primary rounded-full flex items-center justify-center text-primary" style={{ fontSize: "0.8rem" }}>✓</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>You're on the list — benefits locked in.</div>
          <div className="text-cream-dim leading-relaxed" style={{ fontSize: "0.74rem" }}>Check your inbox for confirmation. Your exclusive benefits at launch:</div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[
              "15% off your first Woolet order — applied automatically",
              "Free worldwide shipping — no minimum",
              "48h early access before the public launch",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2.5 text-cream-dim" style={{ fontSize: "0.68rem" }}>
                <span className="text-primary flex-shrink-0" style={{ fontSize: "0.65rem" }}>✓</span>
                {perk}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CheckboxLabel = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-cream-dim hover:text-foreground transition-colors" style={{ fontSize: "0.74rem" }}>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} className="hidden" />
      <div
        className="w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          backgroundColor: checked ? "#c9a84c" : "transparent",
          borderColor: checked ? "#c9a84c" : "#2a2520",
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label}
    </label>
  );
};

export default WaitlistForm;
