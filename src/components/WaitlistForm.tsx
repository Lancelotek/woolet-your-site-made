import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { t, type Lang } from "@/lib/i18n";

const WaitlistForm = ({ lang = "en" as Lang }: { lang?: Lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(23);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    faceWidth: "",
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
    <>
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-cream-dim uppercase tracking-[0.24em]" style={{ fontSize: "0.56rem" }}>
            Waitlist
          </span>
          <span className="text-primary tracking-wider" style={{ fontSize: "0.58rem" }}>
            {count} / 100 spots
          </span>
        </div>
        <div className="h-px relative overflow-visible" style={{ background: "hsl(0 0% 100% / 0.055)" }}>
          <div
            ref={fillRef}
            className="h-full transition-all duration-[1.8s] ease-out"
            style={{ width: "0%", background: "linear-gradient(90deg, hsl(var(--gold-dim)), hsl(var(--gold-light)))" }}
          />
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-4">
          <div className="flex gap-2.5 flex-col sm:flex-row">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-cream-dim uppercase tracking-[0.22em]" style={{ fontSize: "0.54rem" }}>
                First name
              </label>
              <input
                type="text"
                placeholder="James"
                required
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="bg-transparent border-b border-b-border-sub py-3 text-foreground font-body outline-none focus:border-b-primary transition-colors placeholder:text-cream-dim/30"
                style={{ fontSize: "0.82rem", borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-cream-dim uppercase tracking-[0.22em]" style={{ fontSize: "0.54rem" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="james@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="bg-transparent border-b py-3 text-foreground font-body outline-none focus:border-b-primary transition-colors placeholder:text-cream-dim/30"
                style={{ fontSize: "0.82rem", borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-cream-dim uppercase tracking-[0.22em]" style={{ fontSize: "0.54rem" }}>
              Your face width
            </label>
            <div className="relative">
              <select
                value={formData.faceWidth}
                onChange={(e) => setFormData((f) => ({ ...f, faceWidth: e.target.value }))}
                className="w-full bg-transparent border-b py-3 pr-8 text-foreground font-body outline-none appearance-none focus:border-b-primary transition-colors"
                style={{ fontSize: "0.82rem", borderBottomColor: "hsl(0 0% 100% / 0.055)" }}
              >
                <option value="" className="bg-surface text-foreground">Select — from 155mm</option>
                <option value="155-158" className="bg-surface text-foreground">155 – 158 mm</option>
                <option value="159-162" className="bg-surface text-foreground">159 – 162 mm</option>
                <option value="163+" className="bg-surface text-foreground">163 mm+</option>
                <option value="not-sure" className="bg-surface text-foreground">Not sure — I'll measure</option>
              </select>
              <div className="absolute right-0 top-1/2 w-1.5 h-1.5 border-r border-b border-gold-dim -translate-y-[80%] rotate-45 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-cream-dim uppercase tracking-[0.22em]" style={{ fontSize: "0.54rem" }}>
              Interested in
            </label>
            <div className="flex gap-5 flex-wrap">
              <CheckboxLabel
                label="Woolet 007"
                checked={formData.model007}
                onChange={(v) => setFormData((f) => ({ ...f, model007: v }))}
              />
              <CheckboxLabel
                label="Woolet 009"
                checked={formData.model009}
                onChange={(v) => setFormData((f) => ({ ...f, model009: v }))}
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
              className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-all mt-[1px] ${
                privacyAccepted ? "bg-primary border-primary" : "border-border-sub"
              }`}
              style={{ borderColor: privacyAccepted ? undefined : "hsl(0 0% 100% / 0.055)" }}
            >
              {privacyAccepted && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            <p className="text-red-400 text-center" style={{ fontSize: "0.68rem" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !privacyAccepted}
            className="relative overflow-hidden bg-primary text-primary-foreground border-none py-4 px-8 font-body font-semibold uppercase tracking-[0.28em] w-full transition-all hover:bg-gold-light active:scale-[0.99] group disabled:opacity-60"
            style={{ fontSize: "0.66rem" }}
          >
            <span className="relative z-10">
              {loading ? "Sending..." : "Claim My Spot — 15% Off + Free Shipping"}
            </span>
            <span className="absolute inset-0 bg-woolet-white/15 -translate-x-full group-hover:translate-x-full transition-transform duration-400" />
          </button>

          <p className="text-cream-dim opacity-55 tracking-wider text-center mt-0.5" style={{ fontSize: "0.57rem" }}>
            No credit card. No spam. Unsubscribe anytime.
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-3 p-6 border border-primary/20 animate-fade-in" style={{ background: "hsl(var(--gold) / 0.06)" }}>
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
    </>
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
        className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? "bg-primary border-primary" : "border-border-sub"
        }`}
        style={{ borderColor: checked ? undefined : "hsl(0 0% 100% / 0.055)" }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label}
    </label>
  );
};

export default WaitlistForm;
