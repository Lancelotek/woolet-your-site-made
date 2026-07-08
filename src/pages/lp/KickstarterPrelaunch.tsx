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
import bespokeAviatorTortoiseSun from "@/assets/bespoke/aviator-tortoise-sun.png.asset.json";
import bespokeAviatorHavana from "@/assets/bespoke/aviator-havana.png.asset.json";
import bespokeAviatorCaramel from "@/assets/bespoke/aviator-caramel.png.asset.json";
import bespokeAviatorGreyStripe from "@/assets/bespoke/aviator-grey-stripe.png.asset.json";
import bespokeGreenRectangle from "@/assets/bespoke/green-rectangle.png.asset.json";
import bespokeGreenPinkPattern from "@/assets/bespoke/green-pink-pattern.png.asset.json";
import bespokeGreyStripeRect from "@/assets/bespoke/grey-stripe-rect.png.asset.json";
import bespokeBurgundy from "@/assets/bespoke/burgundy.png.asset.json";
import bespokePantoBlackRed from "@/assets/bespoke/panto-black-red.png.asset.json";
import bespokePantoNavy from "@/assets/bespoke/panto-navy.png.asset.json";
import bespokePantoHoney from "@/assets/bespoke/panto-honey.png.asset.json";
import bespokePantoGreenStripe from "@/assets/bespoke/panto-green-stripe.png.asset.json";
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
  { src: w009BlackAsset.url, alt: "Woolet 009 Soft-Square — black" },
  { src: w009GreyAsset.url, alt: "Woolet 009 Soft-Square — grey" },
  { src: w009TaupeAsset.url, alt: "Woolet 009 Soft-Square — taupe" },
  { src: w009HavanaAsset.url, alt: "Woolet 009 Soft-Square — havana" },
  { src: bespokeAviatorTortoiseSun.url, alt: "Woolet Bespoke Aviator — tortoise sun" },
  { src: bespokeAviatorHavana.url, alt: "Woolet Bespoke Aviator — havana" },
  { src: bespokeAviatorCaramel.url, alt: "Woolet Bespoke Aviator — caramel" },
  { src: bespokeAviatorGreyStripe.url, alt: "Woolet Bespoke Aviator — grey stripe" },
];

const bespokeGallery = [
  { src: bespokeAviatorTortoiseSun.url, shape: "Aviator", alt: "Woolet Bespoke Aviator sunglasses in tortoise acetate with warm amber lenses" },
  { src: bespokeAviatorHavana.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in classic Havana Mazzucchelli acetate" },
  { src: bespokeAviatorCaramel.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in caramel translucent acetate" },
  { src: bespokeAviatorGreyStripe.url, shape: "Aviator", alt: "Woolet Bespoke Aviator glasses in grey layered stripe acetate" },
  { src: bespokeGreenRectangle.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in deep green Italian acetate" },
  { src: bespokeGreenPinkPattern.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in green and pink marbled acetate pattern" },
  { src: bespokeGreyStripeRect.url, shape: "Rectangle", alt: "Woolet Bespoke Rectangle glasses in grey pinstripe layered acetate" },
  { src: bespokeBurgundy.url, shape: "Soft-Square", alt: "Woolet Bespoke Soft-Square glasses in rich burgundy acetate" },
  { src: bespokePantoBlackRed.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in black with red interior acetate" },
  { src: bespokePantoNavy.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in navy blue Italian acetate" },
  { src: bespokePantoHoney.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in warm honey translucent acetate" },
  { src: bespokePantoGreenStripe.url, shape: "Panto", alt: "Woolet Bespoke Panto glasses in green striped Mazzucchelli acetate" },
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
  fontSize: "12px",
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
    const models = "Kickstarter VIP";
    const resolvedRef = resolveReferredBy(email, referredBy);
    const formLocation = idSuffix ? idSuffix.replace(/^-/, "") : "default";

    // Fire an attempt event first — independent of success/failure/redirect,
    // so we can measure submit intent even if the network call never returns.
    pushGtmEvent("kickstarter_form_submit_attempt", {
      form_location: formLocation,
      source: utmSource,
      referred_by: resolvedRef,
    });

    try {
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
      // Explicit success event so it can be verified in GA/GTM even if the
      // navigate() below unloads the page before other tags flush.
      pushGtmEvent("kickstarter_form_submit_success", {
        form_location: formLocation,
        source: utmSource,
        referred_by: resolvedRef,
        provider: "mailerlite",
      });

      navigate("/en/lp/kickstarter/vip-confirmed", {
        state: { email, name: "" },
      });
    } catch (err: unknown) {
      console.error("KS VIP error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      pushGtmEvent("kickstarter_form_submit_error", {
        form_location: formLocation,
        source: utmSource,
        referred_by: resolvedRef,
        provider: "mailerlite",
        error_message: message.slice(0, 200),
      });
      setError(message);
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (referredBy) {
      persistRef(referredBy);
      pushGtmEvent("vip_referral_visit", { ref: referredBy });
    }
  }, [referredBy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i - 1 + heroGallery.length) % heroGallery.length);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i + 1) % heroGallery.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
      className="min-h-screen ks-lp"
      style={{
        background: INK,
        color: CREAM,
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <Helmet prioritizeSeoTags>
        <html lang="en" dir="ltr" />
        <title>Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)</title>
        <meta
          name="description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. Join the VIP list for early access and up to 40% off the $190 retail price."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://woolet.co/en/lp/kickstarter" />
        <link rel="alternate" hrefLang="en" href="https://woolet.co/en/lp/kickstarter" />
        <link rel="alternate" hrefLang="x-default" href="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:title" content="Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)" />
        <meta
          property="og:description"
          content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. VIP early access and up to 40% off."
        />
        <meta property="og:url" content="https://woolet.co/en/lp/kickstarter" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:image" content={heroManAsset.url} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Woolet Kickstarter VIP — Eyewear for Wide Faces (155 mm+)" />
        <meta name="twitter:description" content="Premium Milanese acetate eyewear, hand made in the EU, engineered for wide faces 155 mm+. VIP early access and up to 40% off." />
        <meta name="twitter:image" content={heroManAsset.url} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
            { "@type": "ListItem", position: 2, name: "Kickstarter VIP", item: "https://woolet.co/en/lp/kickstarter" },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Woolet Kickstarter — signature frames",
          itemListElement: [
            {
              "@type": "Product",
              name: "Woolet 007 — Round",
              description: "Round Milanese acetate frame, 158 mm wide with a 21 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              image: w007BlackFrontAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: "USD",
                price: "114",
                availability: "https://schema.org/PreOrder",
                priceValidUntil: "2026-12-31",
              },
            },
            {
              "@type": "Product",
              name: "Woolet 009 — Soft-Square",
              description: "Soft-square Milanese acetate frame, 158 mm wide with a 20 mm keyhole bridge. Engineered for wide faces 155–161 mm.",
              image: w009BlackFrontAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: "USD",
                price: "114",
                availability: "https://schema.org/PreOrder",
                priceValidUntil: "2026-12-31",
              },
            },
            {
              "@type": "Product",
              name: "Woolet Bespoke — built to measure",
              description: "Bespoke Milanese acetate frames, 4 shapes, 60 colour and size combinations, any width from 145 to 162 mm.",
              image: heroManAsset.url,
              brand: { "@type": "Brand", name: "Woolet" },
              category: "Eyewear",
              offers: {
                "@type": "Offer",
                url: "https://woolet.co/en/lp/kickstarter",
                priceCurrency: "USD",
                price: "299",
                availability: "https://schema.org/PreOrder",
                priceValidUntil: "2026-12-31",
              },
            },
          ],
        })}</script>
      </Helmet>

      {/* Mobile refinements — scoped to this LP */}
      <style>{`
        @media (min-width: 768px) {
          .ks-hero-image { aspect-ratio: 4 / 5 !important; }
        }
        @media (max-width: 767px) {
          .ks-lp section > div.max-w-6xl,
          .ks-lp section > div.max-w-4xl,
          .ks-lp section > div.max-w-3xl { padding-top: 44px !important; padding-bottom: 44px !important; }
          .ks-lp section:first-of-type > div.max-w-6xl { padding-top: 24px !important; padding-bottom: 24px !important; }

          /* Tighter, more editorial heading rhythm on mobile */
          .ks-lp h1 { font-size: 2rem !important; line-height: 1.08 !important; margin-top: 12px !important; }
          .ks-lp h2 { font-size: 1.6rem !important; line-height: 1.12 !important; margin-top: 10px !important; }
          .ks-lp h3 { font-size: 1.2rem !important; line-height: 1.2 !important; }
          .ks-lp p  { max-width: 60ch; }
        }
      `}</style>



      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link to="/en" className="flex items-center gap-2" aria-label="Woolet home">
            <img src={logo} alt="Woolet" style={{ height: 32, width: "auto" }} />
          </Link>
          <span
            style={{
              ...eyebrowStyle,
              color: GOLD,
              border: `1px solid ${GOLD}`,
              padding: "5px 10px",
              fontSize: 10,
              letterSpacing: "0.14em",
              whiteSpace: "nowrap",
            }}
          >
            Soon on Kickstarter
          </span>
        </div>
      </header>

      {/* HERO */}
      <section>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 md:items-center min-w-0">
          {/* Left — gallery */}
          <div>
            <div
              onClick={() => openLightbox(activeImg)}
              className="ks-hero-image"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#0f0e0c",
                border: `1px solid ${HAIRLINE}`,
                overflow: "hidden",
                cursor: "zoom-in",
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
                  onClick={() => {
                    setActiveImg(i);
                    openLightbox(i);
                  }}
                  aria-label={`Open image ${i + 1} in lightbox`}
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
                    alt={img.alt}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              {
                name: "Woolet 007",
                shape: "Round",
                img: w007BlackFrontAsset.url,
                srp: 190,
                kickstarter: 114,
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
                srp: 190,
                kickstarter: 114,
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
                <div style={{ background: CREAM, aspectRatio: "4 / 3", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={m.img}
                    alt={`${m.name} — ${m.shape}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: m.name === "Woolet 009" ? "scale(0.82)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                </div>
                <div style={{ padding: "28px 24px" }}>
                  <div style={{ ...eyebrowStyle, color: TAUPE }}>{m.shape}</div>
                  <div className="flex items-start justify-between gap-4" style={{ marginTop: 4 }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontSize: "1.75rem",
                        color: CREAM,
                      }}
                    >
                      {m.name}
                    </h3>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end" }}>
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 400,
                            fontSize: "1.5rem",
                            color: GOLD,
                          }}
                        >
                          ${m.kickstarter}
                        </span>
                        <span
                          style={{
                            fontFamily: "Barlow, sans-serif",
                            fontSize: 13,
                            color: TAUPE,
                            textDecoration: "line-through",
                          }}
                        >
                          ${m.srp}
                        </span>
                      </div>
                      <span
                        style={{
                          ...eyebrowStyle,
                          color: GOLD,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        Kickstarter
                      </span>
                    </div>
                  </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
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
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2" style={{ fontSize: 13, color: TAUPE, letterSpacing: "0.02em" }}>
            <span>4 shapes</span>
            <span>·</span>
            <span>60 colour and size combinations</span>
            <span>·</span>
            <span>Any width 145–162 mm</span>
            <span>·</span>
            <span>Built to measure with FitLens</span>
            <span style={{ color: CREAM, marginLeft: 4 }}>
              Kickstarter <span style={{ color: GOLD, fontWeight: 600 }}>$299</span>
            </span>
            <span style={{ textDecoration: "line-through" }}>SRP $480</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {bespokeGallery.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${HAIRLINE}` }}>
                <div style={{ background: CREAM, aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <img
                    src={f.src}
                    alt={f.alt}
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
                      padding: "3px 8px",
                      fontSize: 11,
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mt-12" style={{ background: HAIRLINE }}>
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
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(8,8,7,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 44,
              height: 44,
              background: "transparent",
              border: "none",
              color: CREAM,
              fontSize: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i - 1 + heroGallery.length) % heroGallery.length);
            }}
            aria-label="Previous image"
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${HAIRLINE}`,
              color: CREAM,
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % heroGallery.length);
            }}
            aria-label="Next image"
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${HAIRLINE}`,
              color: CREAM,
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(100%, 900px)",
              maxHeight: "min(90vh, 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <img
              src={heroGallery[lightboxIndex].src}
              alt={heroGallery[lightboxIndex].alt}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(90vh - 80px)",
                objectFit: "contain",
                display: "block",
                border: `1px solid ${HAIRLINE}`,
              }}
            />
            <p
              style={{
                color: TAUPE,
                fontSize: 13,
                letterSpacing: "0.04em",
                fontFamily: "Barlow, sans-serif",
                textAlign: "center",
              }}
            >
              {lightboxIndex + 1} / {heroGallery.length}
            </p>
          </div>
        </div>
      )}
    </div>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>© {new Date().getFullYear()} Woolet · JAY23 LLC · Hand made in the EU</p>
          <div className="flex gap-2">
            <Link to="/en/privacy-policy" style={{ color: TAUPE, fontSize: 13, padding: "12px 14px", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Privacy</Link>
            <Link to="/en/return-policy" style={{ color: TAUPE, fontSize: 13, padding: "12px 14px", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default KickstarterPrelaunch;
