import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { pushGtmEvent } from "@/lib/gtm";
import { persistRef, resolveReferredBy } from "@/lib/referral";
import heroManAsset from "@/assets/kickstarter-hero.png.asset.json";
import logoAsset from "@/assets/woolet-logo.png.asset.json";
const logo = logoAsset.url;
import w007BlackFrontAsset from "@/assets/woolet-007-black-front.jpeg.asset.json";
import w009BlackFrontAsset from "@/assets/woolet-009-black-front.png.asset.json";
import w009BlackAsset from "@/assets/woolet-009-black.png.asset.json";
import w009GreyAsset from "@/assets/woolet-009-grey.png.asset.json";
import w009TaupeAsset from "@/assets/woolet-009-taupe.png.asset.json";
import w009HavanaAsset from "@/assets/woolet-009-havana-front.png.asset.json";
import marek from "@/assets/author-marek.png";

// Bespoke gallery photos
import wr03 from "@/assets/frames/wr-03.jpg.asset.json";
import wr07 from "@/assets/frames/wr-07.jpg.asset.json";
import wr13 from "@/assets/frames/wr-13.jpg.asset.json";
import wr15 from "@/assets/frames/wr-15.jpg.asset.json";
import wr19 from "@/assets/frames/wr-19.jpg.asset.json";
import wr21 from "@/assets/frames/wr-21.jpg.asset.json";
import wr24 from "@/assets/frames/wr-24.jpg.asset.json";
import wr26 from "@/assets/frames/wr-26.jpg.asset.json";
import wr29 from "@/assets/frames/wr-29.jpg.asset.json";
import wr31 from "@/assets/frames/wr-31.jpg.asset.json";
import wr34 from "@/assets/frames/wr-34.jpg.asset.json";
import wr37 from "@/assets/frames/wr-37.jpg.asset.json";

// ---------- Design tokens ----------
const INK = "#080807";
const CREAM = "#EDE9DE";
const TAUPE = "#BAAFA1";
const GOLD = "#CAA449";
const BRONZE = "#8A6E2E";
const HAIRLINE = "rgba(255,255,255,0.10)";
const HAIRLINE_STRONG = "rgba(255,255,255,0.18)";

// ---------- Hero gallery ----------
const heroGallery: { src: string; alt: string }[] = [
  { src: heroManAsset.url, alt: "Man wearing Woolet wide-face eyewear" },
  { src: w007BlackFrontAsset.url, alt: "Woolet 007 Round — black, front" },
  { src: w007BlackAsset.url, alt: "Woolet 007 Round — black" },
  { src: w007GreyAsset.url, alt: "Woolet 007 Round — grey" },
  { src: w007TaupeAsset.url, alt: "Woolet 007 Round — taupe" },
  { src: w009BlackAsset.url, alt: "Woolet 009 Soft-Square — black" },
  { src: w009GreyAsset.url, alt: "Woolet 009 Soft-Square — grey" },
  { src: w009TaupeAsset.url, alt: "Woolet 009 Soft-Square — taupe" },
  { src: w009HavanaAsset.url, alt: "Woolet 009 Soft-Square — havana" },
];

const bespokeGallery = [
  { src: wr03.url, shape: "Round" },
  { src: wr07.url, shape: "Soft-Square" },
  { src: wr13.url, shape: "Panto" },
  { src: wr15.url, shape: "Rectangle" },
  { src: wr19.url, shape: "Round" },
  { src: wr21.url, shape: "Soft-Square" },
  { src: wr24.url, shape: "Panto" },
  { src: wr26.url, shape: "Rectangle" },
  { src: wr29.url, shape: "Round" },
  { src: wr31.url, shape: "Soft-Square" },
  { src: wr34.url, shape: "Panto" },
  { src: wr37.url, shape: "Rectangle" },
];

// ---------- CTA button ----------
const ctaButtonStyle: React.CSSProperties = {
  background: GOLD,
  color: INK,
  border: "none",
  borderRadius: 0,
  padding: "16px 28px",
  fontFamily: "Barlow, sans-serif",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontSize: "12px",
  cursor: "pointer",
  transition: "background 0.2s ease",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  color: CREAM,
  border: `1px solid ${HAIRLINE_STRONG}`,
  borderRadius: 0,
  padding: "14px 16px",
  fontFamily: "Barlow, sans-serif",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: GOLD,
};

// ---------- VIP Form (email + consent only) ----------
const VipForm = ({
  utmSource,
  idSuffix = "",
  referredBy,
  compact = false,
}: {
  utmSource: string;
  idSuffix?: string;
  referredBy?: string | null;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const models = "Kickstarter VIP";
      const resolvedRef = resolveReferredBy(email, referredBy);
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email,
          name: "",
          source: "kickstarter",
          referred_by: resolvedRef,
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Subscription failed");

      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "waitlist_signup",
          user_email: email,
          user_first_name: "",
          waitlist_models: models,
          referred_by: resolvedRef,
        });
      }
      pushGtmEvent("generate_lead", {
        awareness_stage: "solution_aware",
        source: utmSource,
      });

      navigate("/en/lp/kickstarter/vip-confirmed", {
        state: { email, name: "" },
      });
    } catch (err: unknown) {
      console.error("KS VIP error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      id={`vip-form${idSuffix}`}
      onSubmit={onSubmit}
      className="flex flex-col gap-3"
      style={{ maxWidth: compact ? 560 : "100%", margin: compact ? "0 auto" : undefined }}
    >
      <div className={compact ? "flex flex-col sm:flex-row gap-3" : "flex flex-col gap-3"}>
        <input
          type="email"
          placeholder="Your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE_STRONG)}
        />
        <button
          type="submit"
          disabled={loading || !accepted}
          style={{
            ...ctaButtonStyle,
            width: compact ? "auto" : "100%",
            whiteSpace: "nowrap",
            opacity: !accepted || loading ? 0.55 : 1,
            cursor: !accepted || loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.background = BRONZE;
          }}
          onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
        >
          {loading ? "Sending…" : "Claim Your Early Access"}
        </button>
      </div>

      <label
        className="flex items-start gap-3 cursor-pointer select-none"
        style={{ fontFamily: "Barlow, sans-serif", fontSize: "13px", color: TAUPE, lineHeight: 1.5 }}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={() => setAccepted((v) => !v)}
          className="sr-only"
        />
        <span
          aria-hidden
          style={{
            width: 18,
            height: 18,
            border: `1px solid ${accepted ? GOLD : HAIRLINE_STRONG}`,
            background: accepted ? GOLD : "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
            flexShrink: 0,
          }}
        >
          {accepted && (
            <svg width="10" height="8" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span>
          Get early access and launch updates. Accept the{" "}
          <Link to="/en/privacy-policy" style={{ color: CREAM, textDecoration: "underline", textUnderlineOffset: 2 }}>
            privacy policy
          </Link>
          .
        </span>
      </label>

      {error && (
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#e25555" }}>{error}</p>
      )}

      <p
        style={{
          fontFamily: "Barlow, sans-serif",
          fontSize: 11,
          color: TAUPE,
          letterSpacing: "0.04em",
          textAlign: compact ? "center" : "left",
          marginTop: 2,
        }}
      >
        No payment now · Just your email · Unsubscribe anytime.
      </p>
    </form>
  );
};

// ---------- Section helpers ----------
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p style={eyebrowStyle}>{children}</p>
);

const Hairline = () => (
  <div style={{ height: 1, background: HAIRLINE, width: "100%" }} />
);

// ---------- Page ----------
const KickstarterPrelaunch = () => {
  const [params] = useSearchParams();
  const utmSource = params.get("utm_source") || "direct";
  const referredBy = params.get("ref");

  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (referredBy) {
      persistRef(referredBy);
      pushGtmEvent("vip_referral_visit", { ref: referredBy });
    }
  }, [referredBy]);

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "kickstarter_prelaunch",
      awareness_stage: "solution_aware",
    });
  }, []);

  const faqs = useMemo(
    () => [
      {
        q: "Do I pay anything now?",
        a: "No. This page only joins you to the VIP list. You'll pledge on Kickstarter at launch if you want a pair.",
      },
      {
        q: "What if 158 mm doesn't fit me?",
        a: "Bespoke covers any width from 145 to 162 mm, built to measure with FitLens — our AI fit app that measures your face with your phone camera.",
      },
      {
        q: "Can I get prescription lenses?",
        a: "Yes. Every Woolet frame is prescription-ready. You can order frame-only and take them to your optician, or add prescription lenses at checkout.",
      },
      {
        q: "Where are they made and from what?",
        a: "Mazzucchelli acetate milled in Milan, then hand made in the EU. The material comes from Milan; the craftsmanship happens in our European atelier.",
      },
      {
        q: "How is this different from a Ray-Ban or Persol XL?",
        a: "XL models are scaled-up versions of frames designed for a ~137 mm face. Woolet is engineered wide from the first millimetre — 158 mm front, 20–21 mm keyhole bridge, proportions built for 155–161 mm faces.",
      },
      {
        q: "What exactly do VIPs get?",
        a: "Four things: early access to FitLens, the Bespoke configurator, up to 40% off retail, and the private VIP Facebook group with direct access to the founder.",
      },
    ],
    []
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: INK,
        color: CREAM,
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <Helmet>
        <title>Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)</title>
        <meta
          name="description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. Join the VIP list for early access and up to 40% off the $190 retail price."
        />
        <link rel="canonical" href="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:title" content="Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)" />
        <meta
          property="og:description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. VIP early access and up to 40% off."
        />
        <meta property="og:url" content="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2">
            <img src={logo} alt="Woolet" style={{ height: 26, width: "auto" }} />
          </Link>
          <span
            style={{
              ...eyebrowStyle,
              color: GOLD,
              border: `1px solid ${GOLD}`,
              padding: "6px 14px",
            }}
          >
            Soon on Kickstarter
          </span>
        </div>
      </header>

      {/* HERO */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 md:items-center">
          {/* Left — gallery */}
          <div>
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 5",
                background: "#0f0e0c",
                border: `1px solid ${HAIRLINE}`,
                overflow: "hidden",
              }}
            >
              <img
                src={heroGallery[activeImg].src}
                alt={heroGallery[activeImg].alt}
                loading="eager"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div
              className="mt-4 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {heroGallery.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Show image ${i + 1}`}
                  style={{
                    flex: "0 0 72px",
                    width: 72,
                    height: 72,
                    padding: 0,
                    border: `1px solid ${i === activeImg ? GOLD : HAIRLINE}`,
                    background: "#0f0e0c",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.src}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right — copy + form */}
          <div>
            <Eyebrow>VIP Early Access</Eyebrow>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'Newsreader', serif",
                fontWeight: 300,
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                lineHeight: 1.05,
                color: CREAM,
                marginTop: 16,
                letterSpacing: "-0.01em",
              }}
            >
              Eyewear built for wide faces.
            </h1>
            <p
              style={{
                color: TAUPE,
                fontSize: "1.05rem",
                lineHeight: 1.6,
                marginTop: 20,
                maxWidth: 520,
              }}
            >
              Premium Milanese acetate, hand made in the EU, engineered for faces the industry forgot — 155 mm and up. Launching soon on Kickstarter. Join the VIP list for early access and up to <span style={{ color: CREAM }}>40% off</span>.
            </p>

            <div id="vip-form-hero" style={{ marginTop: 28 }}>
              <VipForm utmSource={utmSource} idSuffix="-hero" referredBy={referredBy} />
            </div>

            {/* Trust row */}
            <div
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2"
              style={{ fontSize: 12.5, color: CREAM, letterSpacing: "0.02em" }}
            >
              <span>Milanese acetate</span>
              <span style={{ color: TAUPE }}>·</span>
              <span>Hand made in the EU</span>
              <span style={{ color: TAUPE }}>·</span>
              <span>155 mm+ wide fit</span>
            </div>
          </div>
        </div>
        <Hairline />
      </section>

      {/* WHAT VIPs GET */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
          <Eyebrow>The VIP list</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Four things only VIPs get.
          </h2>

          <div className="grid sm:grid-cols-2 gap-px mt-10" style={{ background: HAIRLINE }}>
            {[
              {
                t: "Access to FitLens",
                d: "First access to our AI fit app — measure your face with your phone camera and get your exact Woolet size before you pledge.",
              },
              {
                t: "Bespoke configurator",
                d: "Design your own frame: 4 shapes, 60 colour and size combinations, any width from 145 to 162 mm, built to measure.",
              },
              {
                t: "Up to 40% off",
                d: "Lock the lowest price we'll ever offer — up to 40% off the $190 retail, reserved for VIPs at launch.",
              },
              {
                t: "Facebook VIP group",
                d: "Join the private VIP group: behind-the-scenes updates, early votes on colours, and a direct line to the founder.",
              },
            ].map((p, i) => (
              <div key={p.t} style={{ background: INK, padding: "36px 28px" }}>
                <div style={{ ...eyebrowStyle, marginBottom: 12 }}>0{i + 1}</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    color: CREAM,
                    marginBottom: 10,
                  }}
                >
                  {p.t}
                </h3>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.65 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* PROBLEM / REFRAME */}
      <section style={{ background: "#0b0a09" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-28">
          <Eyebrow>The wide-face problem</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
            }}
          >
            You're not too wide.<br />
            <em style={{ color: GOLD, fontStyle: "italic" }}>The frame is too narrow.</em>
          </h2>
          <p style={{ color: TAUPE, marginTop: 20, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 620 }}>
            Standard frames are drawn for a face around <span style={{ color: CREAM }}>137 mm</span> wide. Wide faces measure <span style={{ color: CREAM }}>155 mm+</span>. Woolet begins at <span style={{ color: CREAM }}>158 mm</span> — engineered wide from the first millimetre. Built for the faces the industry forgot.
          </p>

          <div
            className="mt-10 grid sm:grid-cols-3"
            style={{ borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}
          >
            {[
              { n: "137 mm", d: "Industry standard face width" },
              { n: "155 mm+", d: "A typical wide face" },
              { n: "158 mm", d: "Where Woolet begins" },
            ].map((s, i) => (
              <div
                key={s.n}
                style={{
                  padding: "28px 8px",
                  borderRight: i < 2 ? `1px solid ${HAIRLINE}` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: i === 2 ? GOLD : CREAM,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ ...eyebrowStyle, color: TAUPE, marginTop: 6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE SHAPES */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>Signature shapes</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            One precise size. <em style={{ color: GOLD, fontStyle: "italic" }}>158 mm.</em> Fits 155–161 mm faces.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[
              {
                name: "Woolet 007",
                shape: "Round",
                img: w007BlackFrontAsset.url,
                specs: [
                  ["Front width", "158 mm"],
                  ["Bridge", "21 mm keyhole"],
                  ["Lens", "54 × 42 mm"],
                  ["Temple", "103 mm"],
                  ["Front height", "52 mm"],
                ],
              },
              {
                name: "Woolet 009",
                shape: "Soft-Square",
                img: w009BlackFrontAsset.url,
                specs: [
                  ["Front width", "158 mm"],
                  ["Bridge", "20 mm keyhole"],
                  ["Lens", "51 × 45 mm"],
                  ["Temple", "103 mm"],
                  ["Front height", "54 mm"],
                ],
              },
            ].map((m) => (
              <article key={m.name} style={{ border: `1px solid ${HAIRLINE}` }}>
                <div style={{ background: CREAM, aspectRatio: "4 / 3", overflow: "hidden" }}>
                  <img
                    src={m.img}
                    alt={`${m.name} — ${m.shape}`}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div style={{ padding: "28px 24px" }}>
                  <div style={{ ...eyebrowStyle, color: TAUPE }}>{m.shape}</div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: "1.75rem",
                      color: CREAM,
                      marginTop: 4,
                    }}
                  >
                    {m.name}
                  </h3>
                  <dl className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4">
                    {m.specs.map(([k, v]) => (
                      <div key={k} style={{ display: "contents" }}>
                        <dt style={{ ...eyebrowStyle, color: TAUPE }}>{k}</dt>
                        <dd style={{ fontSize: 14, color: CREAM, textAlign: "right" }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* WHAT MAKES A WOOLET FIT */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>What makes a Woolet fit</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Three details. <em style={{ color: GOLD, fontStyle: "italic" }}>One frame that stays put.</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mt-12">
            {[
              {
                t: "FitLens",
                sub: "Know your size before you pledge",
                d: "Our AI fit app measures your face temple-to-temple with your phone camera and recommends the exact Woolet size — so the frame you back is the frame that fits.",
              },
              {
                t: "Keyhole Bridge",
                sub: "20–21 mm, rests on the sides of the nose",
                d: "The bridge sits on the sides of the nose rather than the top, so the frame sits level, doesn't slide, and leaves no red marks at the end of the day.",
              },
              {
                t: "Milanese Acetate",
                sub: "Mazzucchelli, milled in Milan",
                d: "Sheet acetate from Mazzucchelli in Milan, then hand made in the EU. Denser and longer-lasting than injection-moulded plastic, with warmer colour depth.",
              },
            ].map((b) => (
              <div key={b.t}>
                <div style={{ height: 1, background: GOLD, width: 32, marginBottom: 20 }} />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    color: CREAM,
                  }}
                >
                  {b.t}
                </h3>
                <p style={{ ...eyebrowStyle, color: TAUPE, marginTop: 6 }}>{b.sub}</p>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.7, marginTop: 14 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID CTA BAND */}
      <section style={{ background: "#0b0a09", borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <Eyebrow>Join the VIP list</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              lineHeight: 1.15,
              color: CREAM,
              marginTop: 12,
              marginBottom: 24,
            }}
          >
            Early access, up to <em style={{ color: GOLD, fontStyle: "italic" }}>40% off</em>, and FitLens before launch.
          </h2>
          <div id="vip-form-mid">
            <VipForm utmSource={utmSource} idSuffix="-mid" referredBy={referredBy} compact />
          </div>
        </div>
      </section>

      {/* BESPOKE GALLERY */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>Bespoke</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 720,
            }}
          >
            If none of these are wide enough, <em style={{ color: GOLD, fontStyle: "italic" }}>we build yours.</em>
          </h2>
          <div
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2"
            style={{ fontSize: 13, color: TAUPE, letterSpacing: "0.02em" }}
          >
            <span>4 shapes</span>
            <span>·</span>
            <span>60 colour and size combinations</span>
            <span>·</span>
            <span>Any width 145–162 mm</span>
            <span>·</span>
            <span>Built to measure with FitLens</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {bespokeGallery.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${HAIRLINE}` }}>
                <div style={{ background: CREAM, aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <img
                    src={f.src}
                    alt={`Bespoke ${f.shape}`}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="flex items-center justify-between" style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, color: CREAM }}>{f.shape}</span>
                  <span
                    style={{
                      ...eyebrowStyle,
                      color: GOLD,
                      border: `1px solid ${GOLD}`,
                      padding: "2px 8px",
                      fontSize: 10,
                    }}
                  >
                    Bespoke
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* FOUNDER */}
      <section style={{ background: "#0b0a09" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-24 flex flex-col sm:flex-row gap-10 items-start">
          <img
            src={marek}
            alt="Marek Ciesla — Woolet founder"
            loading="lazy"
            style={{
              width: 128,
              height: 128,
              objectFit: "cover",
              border: `1px solid ${HAIRLINE_STRONG}`,
              flexShrink: 0,
            }}
          />
          <div>
            <Eyebrow>A note from the founder</Eyebrow>
            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
                lineHeight: 1.35,
                color: CREAM,
                marginTop: 16,
                fontStyle: "italic",
              }}
            >
              "I'm 161 mm across. For twenty years I gave up on glasses that actually fit. So I built the brand I wanted to buy from — Milanese acetate, made wide from the first millimetre. Kickstarter is how we get the first pairs to the people who need them most."
            </blockquote>
            <p style={{ ...eyebrowStyle, color: TAUPE, marginTop: 20 }}>— Marek Ciesla, Founder</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            Three steps.
          </h2>
          <div className="grid md:grid-cols-3 gap-px mt-12" style={{ background: HAIRLINE }}>
            {[
              { n: "01", t: "Join the VIP list", d: "Email only — no payment, no commitment." },
              { n: "02", t: "We email you at launch", d: "You'll be first in line the moment we go live on Kickstarter." },
              { n: "03", t: "Pledge & lock the reward", d: "Back on Kickstarter to secure your VIP tier and price." },
            ].map((s) => (
              <div key={s.n} style={{ background: INK, padding: "32px 24px" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: GOLD,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.35rem",
                    color: CREAM,
                    marginTop: 8,
                  }}
                >
                  {s.t}
                </h3>
                <p style={{ color: TAUPE, fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
        <Hairline />
      </section>

      {/* FAQ */}
      <section>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 md:py-24">
          <Eyebrow>FAQ</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              marginBottom: 28,
            }}
          >
            Questions before you join.
          </h2>
          <div style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "22px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      color: CREAM,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        color: CREAM,
                      }}
                    >
                      {f.q}
                    </span>
                    <span
                      style={{
                        color: GOLD,
                        fontSize: 20,
                        transform: open ? "rotate(45deg)" : "rotate(0)",
                        transition: "transform 0.25s",
                        display: "inline-block",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p
                      style={{
                        color: TAUPE,
                        fontSize: 14,
                        lineHeight: 1.7,
                        paddingBottom: 24,
                        maxWidth: 620,
                      }}
                    >
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#0b0a09", borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
          <Eyebrow>Last thing</Eyebrow>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              lineHeight: 1.1,
              color: CREAM,
              marginTop: 12,
              marginBottom: 20,
            }}
          >
            Be first when the campaign <em style={{ color: GOLD, fontStyle: "italic" }}>goes live.</em>
          </h2>
          <p style={{ color: TAUPE, fontSize: 15, lineHeight: 1.6, marginBottom: 28, maxWidth: 520, marginInline: "auto" }}>
            One email. Early access to FitLens, the Bespoke configurator, and up to 40% off the $190 retail price.
          </p>
          <div id="vip-form-final">
            <VipForm utmSource={utmSource} idSuffix="-final" referredBy={referredBy} compact />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div
          className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ fontSize: 12, color: TAUPE, letterSpacing: "0.04em" }}
        >
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: CREAM, letterSpacing: "0.24em" }}>
            WOOLET
          </div>
          <p>© {new Date().getFullYear()} Woolet · JAY23 LLC · Hand made in the EU</p>
          <div className="flex gap-5">
            <Link to="/en/privacy-policy" style={{ color: TAUPE }}>Privacy</Link>
            <Link to="/en/return-policy" style={{ color: TAUPE }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default KickstarterPrelaunch;
