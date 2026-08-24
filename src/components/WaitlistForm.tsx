import { useState, useRef, useEffect, useId } from "react";
import { RotateCcw, Ruler, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import { t, type Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";
import { trackWaitlistSignupExperiment } from "@/lib/hero-experiment";
import { rdtLead } from "@/lib/reddit-pixel";
import { trackMetaEvent } from "@/lib/meta-capi";

const inputStyle: React.CSSProperties = {
  fontSize: "12px",
  backgroundColor: "transparent",
  color: "#f0ece4",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "1px solid #2a2520",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.15em",
  color: "#7a7570",
  textTransform: "uppercase" as const,
  marginBottom: "8px",
};

const WaitlistForm = ({ lang = "en" as Lang, prefilledWidth, fitLink, utmSource = "direct", utmCampaign = "" }: { lang?: Lang; prefilledWidth?: string; fitLink?: string; utmSource?: string; utmCampaign?: string }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(23);
  const fillRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    faceWidth: prefilledWidth || "",
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
      const models = "Woolet 007, Woolet 009";

      // Capture marketing identifiers from cookies / URL for server-side attribution
      const readCookie = (n: string) =>
        typeof document !== "undefined"
          ? document.cookie.split("; ").find((r) => r.startsWith(`${n}=`))?.split("=")[1]
          : undefined;
      const urlParams =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const fbclid = urlParams?.get("fbclid");
      const fbp = readCookie("_fbp");
      const fbc =
        readCookie("_fbc") ||
        (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
      const ttclid = urlParams?.get("ttclid") || readCookie("ttclid");
      const rdt_uuid = readCookie("_rdt_uuid");
      const event_source_url =
        typeof window !== "undefined" ? window.location.href : undefined;
      const meta_event_id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const { data, error: fnError } = await supabase.functions.invoke(
        "mailerlite-subscribe",
        {
          body: {
            ...getAttribution(),
            email: formData.email,
            name: formData.name,
            face_width: formData.faceWidth,
            models,
            fbp,
            fbc,
            ttclid: ttclid || undefined,
            rdt_uuid,
            event_source_url,
            meta_event_id,
          },
        }
      );

      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Subscription failed");

      // GTM Enhanced Conversions — exact key names required by GTM container
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "waitlist_signup",
          user_email: formData.email,
          user_first_name: formData.name,
          frame_width_preference: formData.faceWidth || null,
          waitlist_models: models,
        });
      }

      pushGtmEvent("generate_lead", {
        awareness_stage: "solution_aware",
        source: utmSource,
      });

      // Hero headline A/B test conversion (GA4) — success only.
      trackWaitlistSignupExperiment();

      rdtLead({ value: 114, currency: "USD" });

      // Meta CAPI — server-side Lead with hashed PII + fbp/fbc + IP/UA
      void trackMetaEvent("Lead", {
        eventId: meta_event_id,
        user: {
          email: formData.email,
          first_name: formData.name,
        },
        custom: {
          value: 114,
          currency: "USD",
          content_name: "Waitlist signup",
        },
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

  const trustStripRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const trustStripFired = useRef(false);
  const socialProofFired = useRef(false);

  useEffect(() => {
    const obs1 = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !trustStripFired.current) {
        trustStripFired.current = true;
        pushGtmEvent("view_trust_strip", { page_type: "homepage" });
        obs1.disconnect();
      }
    }, { threshold: 0.5 });
    if (trustStripRef.current) obs1.observe(trustStripRef.current);

    const obs2 = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !socialProofFired.current) {
        socialProofFired.current = true;
        pushGtmEvent("view_social_proof", { count: 4900 });
        obs2.disconnect();
      }
    }, { threshold: 0.5 });
    if (socialProofRef.current) obs2.observe(socialProofRef.current);

    return () => { obs1.disconnect(); obs2.disconnect(); };
  }, []);

  return (
    <div id="waitlist-form" style={{ paddingBottom: "8px" }}>
      {/* Trust strip */}
      <div ref={trustStripRef} style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: "8px 0", marginBottom: 12 }}>
        {[
          { icon: <RotateCcw size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "30-Day Returns" },
          { icon: <Ruler size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "Fit Guarantee" },
          { icon: <span style={{ fontSize: 11, lineHeight: 1 }}>🇪🇺</span>, text: "Mazzucchelli acetate" },
          { icon: (
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="5" fill="none" stroke="#9A8E7E" strokeWidth="0.6" />
              <path d="M3 6.2 Q4 7 5.5 7 T8 6.2" fill="none" stroke="#9A8E7E" strokeWidth="0.6" strokeLinecap="round" />
            </svg>
          ), text: "Hand-crafted in EU" },
          { icon: <Package size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "Free Shipping" },
        ].map((item, i) => (
          <span key={i} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#9A8E7E", display: "flex", alignItems: "center", gap: 4 }}>
            {item.icon} <span>{item.text}</span>
          </span>
        ))}
      </div>
      {/* Desktop progress */}
      <div className="hidden md:flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span style={{ ...labelStyle, fontSize: "12px", letterSpacing: "0.24em" }}>Waitlist</span>
          <span className="text-primary tracking-wider" style={{ fontSize: "12px" }}>
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
              <label style={labelStyle}>First name <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: "0.05em", opacity: 0.6 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="James"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="woolet-input py-3 font-body placeholder:text-cream-dim/30 focus:border-b-primary transition-colors"
                style={inputStyle}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label style={labelStyle}>Email</label>
              <input
                ref={emailRef}
                type="email"
                placeholder="james@example.com"
                required
                autoFocus
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="woolet-input py-3 font-body placeholder:text-cream-dim/30 focus:border-b-primary transition-colors"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label style={labelStyle}>Preferred frame width <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: "0.05em", opacity: 0.6 }}>(optional)</span></label>
            <div className="relative">
              <select
                value={formData.faceWidth}
                onChange={(e) => setFormData((f) => ({ ...f, faceWidth: e.target.value }))}
                className="woolet-input w-full py-3 pr-8 font-body appearance-none focus:border-b-primary transition-colors"
                style={{ ...inputStyle, fontSize: "max(0.82rem, 16px)" }}
              >
                <option value="" style={{ background: "#1a1612", color: "#f0ece4" }}>Select your frame width</option>
                <option value="unknown" style={{ background: "#1a1612", color: "#f0ece4" }}>I don't know, will measure it</option>
                <option value="145" style={{ background: "#1a1612", color: "#f0ece4" }}>145 mm to 155 mm</option>
                <option value="155" style={{ background: "#1a1612", color: "#f0ece4" }}>155 mm to 161 mm</option>
                <option value="bespoke" style={{ background: "#1a1612", color: "#f0ece4" }}>Bespoke — any size</option>
              </select>
              <div
                className="absolute right-0 top-1/2 -translate-y-[80%] rotate-45 pointer-events-none"
                style={{ width: "6px", height: "6px", borderRight: "1px solid #c9a84c", borderBottom: "1px solid #c9a84c" }}
              />
            </div>
          </div>

          {error && (
            <p className="text-center" style={{ fontSize: "12px", color: "#e25555" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden bg-primary text-primary-foreground border-none font-body w-full transition-all hover:bg-gold-light active:scale-[0.99] group disabled:opacity-60 flex flex-col items-center justify-center"
            style={{ minHeight: "56px", padding: "12px 24px" }}
          >
            <span className="relative z-10 font-semibold uppercase tracking-[0.28em]" style={{ fontSize: "12px" }}>
              {loading ? "Sending..." : "Claim My Spot — 40% Off + Free Shipping"}
            </span>
           <span className="absolute inset-0 bg-woolet-white/15 -translate-x-full group-hover:translate-x-full transition-transform duration-400" />
          </button>

          {/* Inline consent notice */}
          <p className="text-cream-dim/70 text-center mt-1" style={{ fontSize: "11px" }}>
            By joining you agree to our{" "}
            <Link to={`/${lang}/privacy-policy`} className="text-primary underline underline-offset-2 hover:text-gold-light transition-colors">
              Privacy Policy
            </Link>.
          </p>


          {/* Visible price for Google Merchant / Search Console compliance */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#7A7570", textDecoration: "line-through" }}>$190</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 14, color: "#C8A968" }}>$114 USD</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 12, color: "#9A8E7E", letterSpacing: "0.08em", textTransform: "uppercase" }}>pre-order · save 40%</span>
          </div>

          {/* Social proof */}
          <div ref={socialProofRef} style={{ textAlign: "center", paddingTop: 8 }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#7A7570", margin: 0 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, color: "#CAA449" }}>4,900+</span> people on the waitlist
            </p>
          </div>

          {/* Urgency micro-copy for BoF/retarget */}
          {(utmCampaign.includes('bof') || utmCampaign.includes('retarget')) && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#A07A2A", textAlign: "center", marginTop: 6 }}>
              Founding Member: $114 instead of $190 — waitlist exclusive
            </p>
          )}

          <p className="text-cream-dim opacity-55 tracking-wider text-center mt-0.5" style={{ fontSize: "12px" }}>
            No credit card. No spam. Unsubscribe anytime.
          </p>
          {fitLink && (
            <a
              href={fitLink}
              onClick={(e) => { e.preventDefault(); window.location.href = fitLink; }}
              className="block text-center w-full mt-3 py-2.5 px-5 rounded-md text-[12px] tracking-[0.04em] transition-colors duration-150 cursor-pointer"
              style={{
                border: "0.5px solid rgba(184,151,90,0.5)",
                color: "rgba(212,176,122,0.85)",
                background: "transparent",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(184,151,90,0.8)"; e.currentTarget.style.color = "rgba(212,176,122,1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(184,151,90,0.5)"; e.currentTarget.style.color = "rgba(212,176,122,0.85)"; }}
            >
              Not sure if you need wide frames? Check your fit →
            </a>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-3 p-6 border animate-fade-in" style={{ background: "hsl(var(--gold) / 0.06)", borderColor: "hsl(var(--gold) / 0.2)" }}>
          <div className="w-7 h-7 border border-primary rounded-full flex items-center justify-center text-primary" style={{ fontSize: "12px" }}>✓</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "12px" }}>You're on the list — benefits locked in.</div>
          <div className="text-cream-dim leading-relaxed" style={{ fontSize: "12px" }}>Check your inbox for confirmation. Your exclusive benefits at launch:</div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[
              "40% off your first Woolet order — $114 instead of $190",
              "Free worldwide shipping — no minimum",
              "48h early access before the public launch",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2.5 text-cream-dim" style={{ fontSize: "12px" }}>
                <span className="text-primary flex-shrink-0" style={{ fontSize: "12px" }}>✓</span>
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
    <label className="flex items-center gap-2 cursor-pointer text-cream-dim hover:text-foreground transition-colors" style={{ fontSize: "12px" }}>
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
