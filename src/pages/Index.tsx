import { useEffect } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import heroManImg from "@/assets/hero-man.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import SEO from "@/components/SEO";
import { pushGtmEvent } from "@/lib/gtm";
import { isValidLang, type Lang } from "@/lib/i18n";

const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Woolet — Italian Acetate Eyewear Built for Wide Faces (155 mm+)",
    description:
      "Too wide for Ray-Ban, Persol or Warby Parker? Woolet designs Italian Mazzucchelli acetate frames for 155–172 mm faces. Handmade in the EU. Join the list — 40% off.",
  },
  pl: {
    title: "Woolet — Włoski octan dla szerokich twarzy (155mm+)",
    description:
      "Za szeroka twarz na Ray-Ban, Persol czy Warby Parker? Woolet projektuje oprawy z włoskiego octanu Mazzucchelli dla twarzy 155–172 mm. Ręcznie w UE.",
  },
  fr: {
    title: "Woolet — Acétate italien pour visages larges (155mm+)",
    description:
      "Trop large pour Ray-Ban, Persol ou Warby Parker ? Woolet conçoit des montures en acétate italien pour visages de 155 à 172 mm. Fabriqué à la main en UE.",
  },
  es: {
    title: "Woolet — Acetato italiano para caras anchas (155mm+)",
    description:
      "¿Demasiado ancho para Ray-Ban, Persol o Warby Parker? Woolet diseña monturas de acetato italiano para caras de 155–172 mm. Hechas a mano en la UE.",
  },
  de: {
    title: "Woolet — Italienisches Acetat für breite Gesichter (ab 155 mm)",
    description:
      "Zu breit für Ray-Ban, Persol oder Warby Parker? Woolet fertigt Brillen aus italienischem Mazzucchelli-Acetat für Gesichter von 155–172 mm. Handgefertigt in der EU.",
  },
};

/** Visual frame-width comparison: Standard 138–148 vs Woolet 155–172 on a 135–175 scale. */
const FrameWidthMeter = () => {
  // scale: 135–175 → 40mm span
  const pct = (mm: number) => ((mm - 135) / 40) * 100;
  const stdLeft = pct(138);
  const stdWidth = pct(148) - pct(138);
  const wlLeft = pct(155);
  const wlWidth = pct(172) - pct(155);

  return (
    <div className="w-full max-w-[460px]">
      <div
        className="flex items-center justify-between mb-3 uppercase tracking-[0.22em]"
        style={{ fontSize: "0.66rem", color: "hsl(var(--gold-dim))" }}
      >
        <span>Frame width</span>
        <span>mm</span>
      </div>

      {/* Labels above bars */}
      <div className="relative h-5 w-full" style={{ fontSize: "0.72rem" }}>
        <span
          className="absolute -translate-x-1/2 text-cream-dim whitespace-nowrap"
          style={{ left: `${stdLeft + stdWidth / 2}%` }}
        >
          <span className="text-cream-dim/70">✕ Standard</span>{" "}
          <span className="text-foreground">138–148</span>
        </span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${wlLeft + wlWidth / 2}%`, color: "hsl(var(--gold-light))" }}
        >
          ✓ Woolet <span className="text-foreground">155–172</span>
        </span>
      </div>

      {/* Track + bars */}
      <div className="relative h-[14px] w-full">
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px"
          style={{ background: "hsl(0 0% 100% / 0.12)" }}
        />
        {/* Standard bar — hatched */}
        <div
          className="absolute top-0 h-full border"
          style={{
            left: `${stdLeft}%`,
            width: `${stdWidth}%`,
            borderColor: "hsl(0 0% 100% / 0.18)",
            backgroundImage:
              "repeating-linear-gradient(135deg, hsl(0 0% 100% / 0.08) 0 4px, transparent 4px 8px)",
          }}
          aria-label="Standard frames 138 to 148 millimetres"
        />
        {/* Woolet bar — gold */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${wlLeft}%`,
            width: `${wlWidth}%`,
            background: "hsl(var(--gold))",
          }}
          aria-label="Woolet frames 155 to 172 millimetres"
        />
      </div>

      {/* Scale */}
      <div
        className="flex justify-between mt-2 text-cream-dim/60 tracking-wider"
        style={{ fontSize: "0.65rem" }}
      >
        <span>135</span>
        <span>155</span>
        <span>175</span>
      </div>
    </div>
  );
};

const Index = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const location = useLocation();

  // Smooth scroll for in-page anchors
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [location.hash]);

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];

  return (
    <>
      <SEO title={seo.title} description={seo.description} lang={lang} />

      <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
        {/* Ambient gold glow */}
        <div
          className="absolute pointer-events-none rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full w-[600px] h-[600px] -bottom-[200px] -left-[200px]"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)",
          }}
        />

        <Navbar />

        <main className="relative flex-1 px-5 sm:px-8 lg:px-16 py-12 lg:py-20">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            {/* LEFT — copy */}
            <div className="flex flex-col gap-7">
              <div className="woolet-eyebrow">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">Built for wide faces</span>
              </div>

              <h1
                className="font-display text-woolet-white leading-[1.02]"
                style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.2rem)", fontWeight: 300 }}
              >
                Too wide for{" "}
                <em className="italic text-gold-light not-italic-fallback" style={{ fontStyle: "italic" }}>
                  Ray-Ban, Persol
                </em>{" "}
                or Warby Parker?
              </h1>

              <p
                className="text-cream-dim leading-relaxed max-w-[520px]"
                style={{ fontSize: "1.02rem" }}
              >
                Woolet designs frames that finally fit. Italian Mazzucchelli acetate,
                handmade in the EU — and one honest width range you won't find
                anywhere else.
              </p>

              <div className="pt-2">
                <FrameWidthMeter />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link
                  to={`/${lang}/lp/kickstarter`}
                  onClick={() =>
                    pushGtmEvent("hero_cta_primary_click", {
                      location: "home_hero",
                      dest: "lp_kickstarter",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "hsl(var(--gold-light))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(var(--gold))")
                  }
                >
                  Join the list — 40% off
                </Link>
                <Link
                  to={`/${lang}/collection`}
                  onClick={() =>
                    pushGtmEvent("hero_cta_secondary_click", {
                      location: "home_hero",
                      dest: "collection",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-colors text-foreground"
                  style={{
                    border: "1px solid hsl(0 0% 100% / 0.18)",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.6)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.18)")
                  }
                >
                  View collection
                </Link>
              </div>

              {/* Trust strip */}
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-cream-dim/80"
                style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
              >
                <span>Fit guarantee</span>
                <span className="text-cream-dim/30">·</span>
                <span>Mazzucchelli acetate</span>
                <span className="text-cream-dim/30">·</span>
                <span>Handmade in the EU</span>
              </div>
            </div>

            {/* RIGHT — portrait card */}
            <div
              className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[640px] overflow-hidden"
              style={{
                border: "1px solid hsl(0 0% 100% / 0.08)",
                background:
                  "linear-gradient(180deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
              }}
            >
              <img
                src={heroManImg}
                alt="Customer wearing Woolet wide-face Italian acetate eyewear"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--background) / 0) 55%, hsl(var(--background) / 0.55) 100%)",
                }}
              />
              {/* Customer badge */}
              <div
                className="absolute left-5 bottom-5 flex items-center gap-3 px-4 py-2.5 backdrop-blur-md"
                style={{
                  background: "hsl(var(--background) / 0.78)",
                  border: "1px solid hsl(0 0% 100% / 0.1)",
                }}
              >
                <span
                  className="text-foreground"
                  style={{ fontSize: "0.82rem", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                >
                  Marek W.
                </span>
                <span
                  className="tracking-wider"
                  style={{
                    fontSize: "0.82rem",
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  161 mm
                </span>
              </div>
            </div>
          </div>
        </main>

        <div className="h-16 lg:hidden" />
        <Footer />
        <StickyMobileCTA />
      </div>
    </>
  );
};

export default Index;
