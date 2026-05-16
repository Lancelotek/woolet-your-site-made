import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { RotateCcw, Ruler, Package } from "lucide-react";
import heroManImg from "@/assets/hero-man.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Testimonials from "@/components/Testimonials";
import ModelPills from "@/components/ModelPills";
import BenefitsBar from "@/components/BenefitsBar";

import SizeMatrix from "@/components/SizeMatrix";
import SEO from "@/components/SEO";
import { ReserveModal, WaitlistModal } from "@/components/HeroModals";
import { pushGtmEvent } from "@/lib/gtm";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import { Navigate } from "react-router-dom";


const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Woolet — AI-Fit Italian Acetate Eyewear for Wide Faces",
    description:
      "Premium eyewear measured for your face. Three sizes per shape (155 / 158 / 161 mm) plus bespoke. Italian acetate. AI-fit in 30 seconds.",
  },
  pl: {
    title: "Woolet — Okulary premium na szeroką twarz (155mm+)",
    description:
      "Okulary z włoskiego octanu zaprojektowane na twarze 155mm+. Woolet 007 i 009 — wydłużone zauszniki, szerszy mostek, zero kompromisów. Dołącz do listy.",
  },
  fr: {
    title: "Woolet — Lunettes premium pour visages larges (155mm+)",
    description:
      "Lunettes en acétate italien pour visages de 155mm+. Woolet 007 & 009 — branches allongées, pont élargi, aucun compromis. Rejoignez la liste d'attente.",
  },
  es: {
    title: "Woolet — Gafas premium para caras anchas (155mm+)",
    description:
      "Gafas de acetato italiano para caras de 155mm+. Woolet 007 y 009 — patillas alargadas, puente más ancho, sin compromisos. Únete a la lista de espera.",
  },
};

const Index = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const [searchParams] = useSearchParams();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const utmCampaign = searchParams.get("utm_campaign") || "";
  const utmSource = searchParams.get("utm_source") || "direct";
  void utmSource;
  const isUtmVariant = /meta|lp/i.test(utmCampaign);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const openReserve = () => {
    pushGtmEvent("hero_cta_reserve_click", { source: "hero" });
    setReserveOpen(true);
  };
  const openWaitlist = () => {
    pushGtmEvent("hero_link_waitlist_click", { source: "hero" });
    setWaitlistOpen(true);
  };
  const scrollToCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = window.matchMedia("(min-width: 1024px)").matches ? "collection-desktop" : "collection";
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  // Auto-scroll to hash anchors (handles duplicate desktop/mobile ids)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    setTimeout(() => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (hash === "#waitlist") {
        document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#size-matrix") {
        const id = isDesktop ? "size-matrix-desktop" : "size-matrix-mobile";
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (hash === "#collection") {
        const id = isDesktop ? "collection-desktop" : "collection";
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  }, []);

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];

  const renderH1 = () => {
    if (isUtmVariant) {
      return (
        <>
          Looking for glasses that fit a wide face?{" "}
          <em className="italic" style={{ color: "#DBC184" }}>You just found them.</em>
        </>
      );
    }
    return (
      <>
        {t(lang, "hero.title_1")}
        <br />
        {t(lang, "hero.title_2")} <em className="italic text-gold-light">{t(lang, "hero.title_3")}</em>
      </>
    );
  };

  /** EN-only AI-Fit dual-claim hero block (Brand v2). */
  const EnHero = ({ semantic = true }: { semantic?: boolean }) => (
    <div className="flex flex-col gap-6">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text animate-pulse-gold">AI-FIT · MEASURED FOR YOU</span>
      </div>

      {/* Brand claim — italic gold */}
      <p
        className="font-display italic leading-tight"
        style={{ fontSize: "clamp(1.4rem, 2vw, 1.9rem)", color: "#DBC184", fontWeight: 300 }}
      >
        “Standard frames weren’t built for you —<br />
        and that’s not your problem to solve. It’s ours.”
      </p>

      {/* Product claim — main H1 (only on the visible/semantic instance) */}
      {semantic ? (
        <h1
          className="font-display text-woolet-white leading-[0.95]"
          style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 300 }}
        >
          <em className="italic text-gold-light">Measured</em> for you.
        </h1>
      ) : (
        <div
          aria-hidden="true"
          className="font-display text-woolet-white leading-[0.95]"
          style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 300 }}
        >
          <em className="italic text-gold-light">Measured</em> for you.
        </div>
      )}

      <p className="text-cream-dim leading-relaxed tracking-wider max-w-xl" style={{ fontSize: "0.88rem" }}>
        Italian Mazzucchelli acetate. AI-fit precision. Three sizes per shape
        (<span className="text-foreground">155 / 158 / 161 mm</span>), one bespoke. For faces 155 mm and above.
      </p>

      {/* SINGLE primary CTA */}
      <div className="flex flex-col gap-3 pt-2">
        <a
          href={`/${lang}/fit/scan`}
          onClick={() => pushGtmEvent("cta_scan_click", { location: "hero_primary" })}
          className="inline-flex items-center justify-center uppercase tracking-[0.22em] transition-all no-underline"
          style={{
            background: "hsl(var(--gold))",
            color: "hsl(var(--background))",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "17px 24px",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
        >
          Scan your face · Reserve for $1
        </a>

        {/* Tiny waitlist alternative — muted gold underlined link */}
        <button
          type="button"
          onClick={openWaitlist}
          className="self-start"
          style={{
            background: "transparent",
            border: "none",
            padding: "2px 0",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 300,
            fontSize: "0.875rem",
            color: "hsl(var(--gold-dim))",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            cursor: "pointer",
          }}
        >
          Not ready? Join the waitlist for 30% off →
        </button>
      </div>

      {/* Trust badges row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 6 }}>
        {[
          { icon: <RotateCcw size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "30-Day Returns" },
          { icon: <Ruler size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "Fit Guarantee" },
          { icon: <span style={{ fontSize: 11, lineHeight: 1 }}>🇮🇹</span>, text: "Italian Mazzucchelli Acetate" },
          { icon: <Package size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "Free Shipping" },
        ].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: 10,
              color: "#9A8E7E",
              display: "flex",
              alignItems: "center",
              gap: 5,
              letterSpacing: "0.04em",
            }}
          >
            {item.icon} <span>{item.text}</span>
          </span>
        ))}
      </div>

      {/* Social proof line */}
      <p
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 300,
          fontSize: "0.8125rem",
          color: "#7a7570",
          margin: 0,
          marginTop: -10,
        }}
      >
        4,900+ on waitlist · only 23/100 reservation spots left
      </p>

      {/* Price hint — plain text, $1 bold */}
      <p
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 300,
          fontSize: "0.8125rem",
          color: "#7a7570",
          margin: 0,
          marginTop: -14,
        }}
      >
        Reserve for <strong style={{ fontWeight: 600, color: "#9A8E7E" }}>$1</strong> today · final pre-order price <span style={{ color: "#9A8E7E" }}>$133</span> (was $190)
      </p>

      {/* See all sizes — text link */}
      <a
        href="#collection"
        onClick={scrollToCollection}
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 300,
          fontSize: "0.8125rem",
          color: "hsl(var(--gold-dim))",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          alignSelf: "flex-start",
          marginTop: -10,
        }}
      >
        See all sizes →
      </a>
    </div>
  );

  const isEn = lang === "en";

  return (
    <>
      <SEO title={seo.title} description={seo.description} lang={lang} />

      {/* ===== MOBILE LAYOUT — no hero image, straight to content ===== */}
      <main className={`relative z-[1] ${isIOS ? "" : "lg:hidden"}`}>
        {/* Ambient glows */}
        <div
          className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }}
        />
        <div
          className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }}
        />

        <Navbar />

        <div className="px-5 py-8 sm:p-8 flex flex-col gap-8 sm:gap-10">
          {isEn ? (
            <EnHero />
          ) : (
            <div>
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text animate-pulse-gold">{t(lang, "hero.eyebrow")}</span>
              </div>
              <h1 className="font-display text-woolet-white leading-none mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
                {renderH1()}
              </h1>
              <p className="sr-only">Woolet — Premium Glasses for Wide Faces 155mm+ | Italian Acetate Eyewear</p>
              <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
                {t(lang, "hero.desc")}
              </p>
            </div>
          )}

          <Testimonials />
          <div className="woolet-divider" />
          <div id="collection"><ModelPills /></div>

          <div>
            <div className="flex flex-col gap-1.5 mb-5">
              <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>
                {t(lang, "benefits.title")}
              </div>
              <div className="text-cream-dim tracking-wider" style={{ fontSize: "0.62rem" }}>
                {t(lang, "benefits.subtitle")}
              </div>
            </div>
            <BenefitsBar />
          </div>
        </div>

        {isEn && <SizeMatrix fitHref={`/${lang}/fit`} sectionId="size-matrix-mobile" />}

        {/* Spacer for sticky mobile CTA */}
        <div className="h-16" />
        <Footer />
        <StickyMobileCTA />
      </main>

      {/* ===== DESKTOP LAYOUT — split panel with locked scroll ===== */}
      <main className={`relative z-[1] ${isIOS ? "hidden" : "hidden lg:flex"} flex-col h-screen overflow-hidden`}>
        {/* Ambient glows */}
        <div
          className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }}
        />
        <div
          className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }}
        />

        <Navbar />

        <div className="grid grid-cols-[1fr_580px] flex-1 min-h-0 animate-fade-in">
          {/* Left image — fixed, no scroll */}
          <div className="relative overflow-hidden bg-surface border-r" style={{ borderRightColor: "hsl(0 0% 100% / 0.055)" }}>
            <div className="absolute inset-0 flex items-end overflow-hidden">
              <img src={heroManImg} alt="Man wearing Woolet wide-face eyewear" className="woolet-desktop-hero-image w-full h-full object-cover object-top" loading="eager" fetchPriority="high" width={800} height={1000} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 50%, hsl(var(--background) / 0.4) 100%)" }} />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 60%, hsl(var(--background) / 0.35) 100%)" }} />
          </div>

          {/* Right panel — scrollable */}
          <div className="flex flex-col overflow-y-auto border-l" style={{ borderLeftColor: "hsl(0 0% 100% / 0.055)" }}>
            <div className="flex flex-col px-10 py-10 gap-10">
              {isEn ? (
                <EnHero semantic={false} />
              ) : (
                <div>
                  <div className="woolet-eyebrow mb-5">
                    <div className="woolet-eyebrow-line" />
                    <span className="woolet-eyebrow-text animate-pulse-gold">{t(lang, "hero.eyebrow")}</span>
                  </div>
                  <div role="presentation" aria-hidden="true" className="font-display text-woolet-white leading-none mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
                    {renderH1()}
                  </div>
                  <p className="sr-only">Woolet — Premium Glasses for Wide Faces 155mm+ | Italian Acetate Eyewear</p>
                  <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
                    {t(lang, "hero.desc")}
                  </p>
                </div>
              )}

              
              <Testimonials />
              <div className="woolet-divider" />
              <div id="collection-desktop"><ModelPills /></div>

              <div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>
                    {t(lang, "benefits.title")}
                  </div>
                  <div className="text-cream-dim tracking-wider" style={{ fontSize: "0.62rem" }}>
                    {t(lang, "benefits.subtitle")}
                  </div>
                </div>
                <BenefitsBar />
              </div>
            </div>
            {isEn && <SizeMatrix fitHref={`/${lang}/fit`} semantic={false} sectionId="size-matrix-desktop" />}
            <Footer />
          </div>
        </div>
      </main>

      <ReserveModal
        open={reserveOpen}
        onOpenChange={setReserveOpen}
        onSwitchToWaitlist={() => {
          setReserveOpen(false);
          setTimeout(() => setWaitlistOpen(true), 200);
        }}
      />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
};

export default Index;
