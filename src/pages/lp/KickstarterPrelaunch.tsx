import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";
import Countdown from "@/components/Countdown";
import heroMan from "@/assets/hero-man.jpg";
import logo from "@/assets/woolet-logo.png";
import w007 from "@/assets/woolet-007.png";
import w009 from "@/assets/woolet-009.png";
import marek from "@/assets/author-marek.png";
import beforeAfter from "@/assets/before-after-fit.png";

const KS_LAUNCH_DATE = new Date("2026-09-19T16:00:00+02:00");
const KICKSTARTER_URL = "https://www.kickstarter.com/projects/wooletco/your-public-prelaunch-url";
const LAUNCH_DATE_LABEL = KS_LAUNCH_DATE.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const FOUNDING_SPOTS_TOTAL = 300;
const FOUNDING_SPOTS_LEFT = 247;

const inputStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "#f0ece4",
  border: "1px solid rgba(216,212,204,0.35)",
  borderRadius: "4px",
  padding: "12px 14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.15em",
  color: "#D8D4CC",
  textTransform: "uppercase",
  marginBottom: "8px",
};

type FormState = { name: string; email: string; faceWidth: string };

const VipForm = ({
  utmSource,
  idSuffix = "",
}: {
  utmSource: string;
  idSuffix?: string;
}) => {
  const [form, setForm] = useState<FormState>({ name: "", email: "", faceWidth: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const models = "Kickstarter VIP";
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email: form.email,
          name: form.name,
          face_width: form.faceWidth,
          models,
          source: "kickstarter",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Subscription failed");

      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "waitlist_signup",
          user_email: form.email,
          user_first_name: form.name,
          frame_width_preference: form.faceWidth || null,
          waitlist_models: models,
        });
      }
      pushGtmEvent("generate_lead", {
        awareness_stage: "solution_aware",
        source: utmSource,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("KS VIP error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        id={`vip-form${idSuffix}`}
        className="flex flex-col gap-4 p-6 border animate-fade-in"
        style={{ background: "hsl(var(--gold) / 0.06)", borderColor: "hsl(var(--gold) / 0.2)" }}
      >
        <div className="w-7 h-7 border border-primary rounded-full flex items-center justify-center text-primary text-sm">✓</div>
        <div className="font-display text-woolet-white text-xl">You're on the VIP list.</div>
        <p className="text-cream-dim text-sm leading-relaxed">
          We'll email you the moment we go live on Kickstarter — and you'll get first access to the founding-backer reward.
        </p>
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-cream-dim/80 text-xs leading-relaxed">
            Two taps = guaranteed you won't miss launch: you're on our VIP list, now let Kickstarter remind you too.
          </p>
          <a
            href={KICKSTARTER_URL}
            target="_blank"
            rel="noopener"
            onClick={() => pushGtmEvent("click_kickstarter_notify", { location: "thank_you" })}
            className="inline-flex items-center justify-center w-full border border-primary/60 text-primary font-body uppercase tracking-[0.24em] text-xs py-3 px-4 rounded-sm hover:bg-primary/10 transition-colors"
          >
            Also tap "Notify me on launch" on Kickstarter →
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      id={`vip-form${idSuffix}`}
      onSubmit={onSubmit}
      className="flex flex-col gap-2.5 mt-4"
    >
      <div className="flex gap-2.5 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col">
          <label style={labelStyle}>First name</label>
          <input
            type="text"
            placeholder="James"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="font-body focus:border-primary transition-colors"
            style={{ ...inputStyle }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="james@example.com"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="font-body focus:border-primary transition-colors"
            style={{ ...inputStyle }}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label style={labelStyle}>
          Preferred frame width{" "}
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: "0.05em", color: "#B8B3A8" }}>(optional)</span>
        </label>
        <select
          value={form.faceWidth}
          onChange={(e) => setForm((f) => ({ ...f, faceWidth: e.target.value }))}
          className="w-full font-body appearance-none focus:border-primary transition-colors"
          style={{ ...inputStyle, fontSize: "max(0.95rem, 16px)", paddingRight: "32px" }}
        >
          <option value="" style={{ background: "#1a1612", color: "#f0ece4" }}>Select your frame width</option>
          <option value="unknown" style={{ background: "#1a1612", color: "#f0ece4" }}>I don't know yet</option>
          <option value="145" style={{ background: "#1a1612", color: "#f0ece4" }}>145–154 mm (bespoke only)</option>
          <option value="155" style={{ background: "#1a1612", color: "#f0ece4" }}>155–161 mm (XL)</option>
          <option value="162" style={{ background: "#1a1612", color: "#f0ece4" }}>162 mm+ (XXL)</option>
        </select>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer hover:text-woolet-white transition-colors mt-1" style={{ fontSize: "12px", color: "#B8B3A8" }}>
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={() => setPrivacyAccepted((v) => !v)}
          className="hidden"
        />
        <div
          className="w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all mt-[1px]"
          style={{
            backgroundColor: privacyAccepted ? "#c9a84c" : "transparent",
            borderColor: privacyAccepted ? "#c9a84c" : "#8A857B",
          }}
        >
          {privacyAccepted && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span>
          I agree to receive launch emails and accept the{" "}
          <Link to="/en/privacy-policy" className="text-primary underline underline-offset-2 hover:text-gold-light transition-colors">
            privacy policy
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-center text-xs" style={{ color: "#e25555" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading || !privacyAccepted}
        className="relative overflow-hidden bg-primary text-primary-foreground border-none font-body w-full transition-all hover:bg-gold-light active:scale-[0.99] disabled:opacity-60 flex items-center justify-center"
        style={{ minHeight: "56px", padding: "12px 24px" }}
      >
        <span className="font-semibold uppercase tracking-[0.24em] text-xs">
          {loading ? "Sending..." : "Join the VIP list — lock 40% off"}
        </span>
      </button>

      <p className="text-center mt-1" style={{ fontSize: "11px", color: "#B8B3A8", letterSpacing: "0.04em" }}>
        Only <span style={{ color: "#c9a84c", fontWeight: 600 }}>{FOUNDING_SPOTS_LEFT}</span> of {FOUNDING_SPOTS_TOTAL} founding-backer spots left
      </p>

      <p className="text-center mt-0.5" style={{ fontSize: "11px", color: "#B8B3A8", letterSpacing: "0.02em" }}>
        No payment now · No spam · Unsubscribe anytime
      </p>
    </form>
  );
};

const KickstarterNotifyButton = ({ location }: { location: "hero" | "footer" }) => (
  <a
    href={KICKSTARTER_URL}
    target="_blank"
    rel="noopener"
    onClick={() => pushGtmEvent("click_kickstarter_notify", { location })}
    className="inline-flex items-center justify-center w-full border border-primary/60 text-primary font-body uppercase tracking-[0.24em] text-xs py-3 px-4 rounded-sm hover:bg-primary/10 transition-colors"
  >
    Also tap "Notify me on launch" on Kickstarter →
  </a>
);

const KickstarterPrelaunch = () => {
  const [params] = useSearchParams();
  const utmSource = params.get("utm_source") || "direct";

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "kickstarter_prelaunch",
      awareness_stage: "solution_aware",
    });
  }, []);

  const isLaunchPast = useMemo(() => !KS_LAUNCH_DATE || KS_LAUNCH_DATE.getTime() <= Date.now(), []);

  const scrollToForm = () => {
    document.getElementById("vip-form-hero")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-woolet-white font-body">
      <Helmet>
        <title>Woolet on Kickstarter — VIP Early Access | Wide-Face Eyewear</title>
        <meta
          name="description"
          content="Join the Woolet VIP list for the Kickstarter launch. Get notified the moment we go live, plus 48-hour early access and founding-backer rewards."
        />
        <link rel="canonical" href="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:title" content="Woolet on Kickstarter — VIP Early Access" />
        <meta property="og:description" content="Italian acetate eyewear built for wide faces (155mm+). Coming to Kickstarter." />
        <meta property="og:url" content="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Top bar */}
      <header className="border-b border-[#1a1612]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2">
            <img src={logo} alt="Woolet" className="h-6 w-auto" />
          </Link>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-primary border border-primary/40 rounded-full px-3 py-1">
            Launching on Kickstarter
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#080807]">
        <div className="max-w-6xl mx-auto px-5 py-10 sm:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-primary uppercase tracking-[0.28em] text-[10px] mb-4">VIP Early Access</p>
            <h1 className="font-display text-woolet-white leading-[1.05] text-[2.1rem] sm:text-[3rem]">
              Eyewear built for wide faces — coming to Kickstarter
            </h1>
            <p className="text-cream-dim mt-5 text-base sm:text-lg leading-relaxed">
              Woolet launches on Kickstarter on <span className="text-woolet-white">{LAUNCH_DATE_LABEL}</span>.
              Join the VIP list to lock <span className="text-primary">40% off the $190 retail price</span> (founding-backer spots, limited) and 48-hour early access before the public.
            </p>

            <div id="vip-form-hero" className="mt-6">
              <VipForm utmSource={utmSource} idSuffix="-hero" />
            </div>


            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2" style={{ fontSize: "12px", color: "#D8D4CC" }}>
              <span>🇮🇹 Italian Mazzucchelli Acetate</span>
              <span style={{ color: "#8A857B" }}>·</span>
              <span>155mm+ wide fit</span>
              <span style={{ color: "#8A857B" }}>·</span>
              <span><span style={{ color: "#c9a84c", fontWeight: 600 }}>4,900+</span> on the waitlist</span>
            </div>

            {/* Testimonials */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { q: "I've been searching for frames this wide for years. Woolet is the first brand that gets it.", a: "Marek W. · 161mm · Warsaw" },
                { q: "Finally no more marks on my temples at the end of the day.", a: "James R. · 158mm · London" },
              ].map((t) => (
                <div key={t.a} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-woolet-white italic leading-relaxed" style={{ fontSize: "13px" }}>"{t.q}"</p>
                  <p className="mt-2 uppercase tracking-[0.18em]" style={{ fontSize: "10px", color: "#8A857B" }}>{t.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-first md:order-last">
            <img
              src={heroMan}
              alt="Man wearing Woolet wide-face eyewear"
              className="w-full h-auto object-cover rounded-sm"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="border-y border-[#1a1612] bg-[#0a0908]">
        <div className="max-w-3xl mx-auto px-5 py-10 flex flex-col items-center text-center gap-4">
          {isLaunchPast ? (
            <>
              <p className="text-cream-dim uppercase tracking-[0.28em] text-[10px]">
                Launch status
              </p>
              <p className="font-display text-woolet-white text-xl sm:text-2xl">
                Launching soon on Kickstarter — exact date announced to the VIP list.
              </p>
            </>
          ) : (
            <>
              <p className="text-cream-dim uppercase tracking-[0.28em] text-[10px]">
                Kickstarter launches in
              </p>
              <Countdown targetDate={KS_LAUNCH_DATE} />
              <p className="text-cream-dim text-sm mt-2">Target launch: {LAUNCH_DATE_LABEL}</p>
            </>
          )}
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl text-center text-woolet-white mb-10">
          Why join the VIP list
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              t: "Founding-backer price",
              d: "Lock 40% off the $190 retail price — 300 founding spots, only on Kickstarter. Gone the moment they sell out.",
            },
            {
              t: "48-hour early access",
              d: "Pledge two full days before the public sees the campaign. No fighting for limited tiers.",
            },
            {
              t: "Founding-backer extras",
              d: "Exclusive perks reserved for the people who back us first — only the VIP list will hear about them.",
            },
          ].map((p) => (
            <div key={p.t} className="border border-[#1a1612] p-6 rounded-sm bg-[#0a0908]">
              <div className="text-primary text-xs uppercase tracking-[0.24em] mb-3">Perk</div>
              <h3 className="font-display text-xl text-woolet-white mb-2">{p.t}</h3>
              <p className="text-cream-dim text-sm leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT TEASER */}
      <section className="bg-[#080807] border-y border-[#1a1612]">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl text-center text-woolet-white mb-3">
            Two frames. Built wide from the start.
          </h2>
          <p className="text-cream-dim text-center max-w-xl mx-auto text-sm">
            Italian acetate, sizes 155 / 158 / 161 mm + bespoke.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 mt-10">
            {[
              { img: w007, name: "Woolet 007", shape: "Round / Panto" },
              { img: w009, name: "Woolet 009", shape: "Soft Square" },
            ].map((m) => (
              <div key={m.name} className="text-center">
                <img src={m.img} alt={m.name} className="w-full max-w-sm mx-auto h-auto" loading="lazy" />
                <h3 className="font-display text-2xl text-woolet-white mt-4">{m.name}</h3>
                <p className="text-cream-dim text-xs uppercase tracking-[0.24em] mt-1">{m.shape}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WIDE FACE PROBLEM */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl text-woolet-white mb-5">
          You're not too wide — the frame is too narrow.
        </h2>
        <p className="text-cream-dim text-base leading-relaxed mb-4">
          Standard frames are built for a ~137 mm face. A wide face runs 155–161 mm.
        </p>
        <p className="text-cream-dim text-base leading-relaxed">
          Woolet starts at 155 mm and goes up to 161 mm + bespoke — designed from day one for the faces the industry forgot.
        </p>
        <img
          src={beforeAfter}
          alt="Before and after — wide-face fit"
          className="w-full mt-8 rounded-sm border border-[#1a1612]"
          loading="lazy"
        />
      </section>

      {/* FOUNDER */}
      <section className="bg-[#080807] border-y border-[#1a1612]">
        <div className="max-w-3xl mx-auto px-5 py-14 flex flex-col sm:flex-row gap-6 items-center">
          <img src={marek} alt="Marek Ciesla — Woolet founder" className="w-24 h-24 rounded-full object-cover" loading="lazy" />
          <div>
            <p className="text-primary uppercase tracking-[0.22em] text-[10px] mb-2">A note from the founder</p>
            <p className="text-cream-dim text-base leading-relaxed">
              "I'm 161 mm across. For 20 years I gave up on glasses that actually fit. So I built the brand I wanted to buy from —
              Italian acetate, made wide from the first millimeter. Kickstarter is how we get the first pairs into the hands of people who need them most."
            </p>
            <p className="text-woolet-white font-display text-lg mt-3">— Marek Ciesla</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl text-center text-woolet-white mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Join the VIP list", d: "Drop your email — no payment, no commitment." },
            { n: "02", t: "We email you at launch", d: "You'll be first in line the moment we go live on Kickstarter." },
            { n: "03", t: "Pledge & lock the reward", d: "Back on Kickstarter to secure the founding-backer tier." },
          ].map((s) => (
            <div key={s.n} className="border border-[#1a1612] p-6 rounded-sm">
              <div className="font-display text-primary text-3xl mb-3">{s.n}</div>
              <h3 className="font-display text-xl text-woolet-white mb-2">{s.t}</h3>
              <p className="text-cream-dim text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-cream-dim/70 text-xs mt-8 uppercase tracking-[0.24em]">
          No payment is taken on this page
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-[#080807] border-y border-[#1a1612]">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl text-center text-woolet-white mb-10">FAQ</h2>
          <div className="flex flex-col divide-y divide-[#1a1612]">
            {[
              { q: "When does it launch?", a: `Kickstarter goes live on ${LAUNCH_DATE_LABEL}. VIPs get a launch-day email.` },
              { q: "Do I pay now?", a: "No. This page only joins you to the VIP list. You pledge on Kickstarter on launch day if you want a pair." },
              { q: "What's the VIP discount?", a: "40% off the $190 retail price for 300 founding-backer spots, plus extras you won't see on the public page." },
              { q: "Which faces is this for?", a: "Faces measuring 155 mm or wider, temple-to-temple. Frames come in 155 / 158 / 161 mm — plus bespoke for 162 mm+." },
            ].map((f) => (
              <details key={f.q} className="py-5 group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-display text-lg text-woolet-white">{f.q}</span>
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-cream-dim text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CAPTURE */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl sm:text-4xl text-center text-woolet-white mb-3">
          Be first when the campaign goes live.
        </h2>
        <p className="text-cream-dim text-center text-sm mb-6">
          Only VIPs get the launch-day email and the founding-backer tier.
        </p>
        <VipForm utmSource={utmSource} idSuffix="-final" />
      </section>

      <footer className="border-t border-[#1a1612] py-8 text-center">
        <p className="text-cream-dim/60 text-[11px]">
          © {new Date().getFullYear()} Woolet · <Link to="/en/privacy-policy" className="hover:text-primary">Privacy</Link>
        </p>
      </footer>

      {/* Sticky mobile CTA */}
      <button
        onClick={scrollToForm}
        className="md:hidden fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground py-4 font-semibold uppercase tracking-[0.24em] text-xs shadow-xl z-50 rounded-sm"
      >
        Join the VIP list
      </button>
    </div>
  );
};

export default KickstarterPrelaunch;
