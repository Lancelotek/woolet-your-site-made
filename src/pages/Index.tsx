import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import heroManImg from "@/assets/hero-man.jpg";
import heroMobileImg from "@/assets/hero-mobile.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import WaitlistForm from "@/components/WaitlistForm";
import Testimonials from "@/components/Testimonials";
import ModelPills from "@/components/ModelPills";
import BenefitsBar from "@/components/BenefitsBar";

import SEO from "@/components/SEO";
import { t, isValidLang, type Lang } from "@/lib/i18n";
import { Navigate } from "react-router-dom";

const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Woolet — Premium Eyewear for Wide Faces (155mm+)",
    description: "Italian acetate glasses engineered for faces 155mm and wider. Woolet 007 & 009 — extended temples, wider bridge, zero compromise on style. Join the waitlist.",
  },
  pl: {
    title: "Woolet — Okulary premium na szeroką twarz (155mm+)",
    description: "Okulary z włoskiego octanu zaprojektowane na twarze 155mm+. Woolet 007 i 009 — wydłużone zauszniki, szerszy mostek, zero kompromisów. Dołącz do listy.",
  },
  fr: {
    title: "Woolet — Lunettes premium pour visages larges (155mm+)",
    description: "Lunettes en acétate italien pour visages de 155mm+. Woolet 007 & 009 — branches allongées, pont élargi, aucun compromis. Rejoignez la liste d'attente.",
  },
  es: {
    title: "Woolet — Gafas premium para caras anchas (155mm+)",
    description: "Gafas de acetato italiano para caras de 155mm+. Woolet 007 y 009 — patillas alargadas, puente más ancho, sin compromisos. Únete a la lista de espera.",
  },
};

const Index = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const [heroVisible, setHeroVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isIPhone = typeof navigator !== "undefined" && /iPhone/i.test(navigator.userAgent);

  useEffect(() => {
    const readScrollTop = () =>
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const updateHeroVisibility = () => {
      const currentY = readScrollTop();

      if (currentY <= 1) {
        setHeroVisible(true);
      } else if (currentY > lastScrollYRef.current) {
        setHeroVisible(false);
      }

      lastScrollYRef.current = currentY;
      rafIdRef.current = null;
    };

    const onScroll = () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateHeroVisibility);
    };

    updateHeroVisibility();

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("touchmove", onScroll, { passive: true, capture: true });
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("touchmove", onScroll, true);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
    };
  }, []);

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];

  return (
    <>
      <SEO title={seo.title} description={seo.description} lang={lang} />

      {/* ===== MOBILE LAYOUT — plain document flow, no flex/grid tricks ===== */}
      <div className="relative z-[1] lg:hidden">
        {/* Ambient glows */}
        <div className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }} />
        <div className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }} />

        <Navbar />

        {/* Hero image — hidden entirely on iPhone */}
        {!isIPhone && (
          <div
            className="w-full overflow-hidden transition-[height,opacity] duration-300 ease-out"
            style={{
              height: heroVisible ? "56vw" : "0px",
              maxHeight: heroVisible ? "260px" : "0px",
              opacity: heroVisible ? 1 : 0,
            }}
            aria-hidden={!heroVisible}
          >
            <img src={heroMobileImg} alt="Man wearing Woolet eyewear" className="w-full h-full object-cover object-top" />
          </div>
        )}

        <div className="px-5 py-8 sm:p-8 flex flex-col gap-8 sm:gap-10">
          <div>
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text animate-pulse-gold">{t(lang, "hero.eyebrow")}</span>
            </div>
            <h1 className="font-display text-woolet-white leading-none mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
              {t(lang, "hero.title_1")}<br />
              {t(lang, "hero.title_2")} <em className="italic text-gold-light">{t(lang, "hero.title_3")}</em>
            </h1>
            <p className="sr-only">Woolet — Premium Glasses for Wide Faces 155mm+ | Italian Acetate Eyewear</p>
            <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
              {t(lang, "hero.desc")}
            </p>
          </div>

          <WaitlistForm lang={lang} />
          <Testimonials />
          <div className="woolet-divider" />
          <ModelPills />

          <div>
            <div className="flex flex-col gap-1.5 mb-5">
              <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>{t(lang, "benefits.title")}</div>
              <div className="text-cream-dim tracking-wider" style={{ fontSize: "0.62rem" }}>{t(lang, "benefits.subtitle")}</div>
            </div>
            <BenefitsBar />
          </div>
        </div>

        {/* Spacer for sticky mobile CTA */}
        <div className="h-16" />
        <Footer />
        <StickyMobileCTA />
      </div>

      {/* ===== DESKTOP LAYOUT — split panel with locked scroll ===== */}
      <div className="relative z-[1] hidden lg:flex flex-col h-screen overflow-hidden">
        {/* Ambient glows */}
        <div className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }} />
        <div className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }} />

        <Navbar />

        <div className="grid grid-cols-[1fr_580px] flex-1 min-h-0 animate-fade-in">
          {/* Left image — fixed, no scroll */}
          <div className="relative overflow-hidden bg-surface border-r"
            style={{ borderRightColor: "hsl(0 0% 100% / 0.055)" }}>
            <div className="absolute inset-0 flex items-end overflow-hidden">
              <img src={heroManImg} alt="Man wearing Woolet wide-face eyewear" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 50%, hsl(var(--background) / 0.4) 100%)" }} />
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent 60%, hsl(var(--background) / 0.35) 100%)" }} />
          </div>

          {/* Right panel — scrollable */}
          <div className="flex flex-col overflow-y-auto border-l"
            style={{ borderLeftColor: "hsl(0 0% 100% / 0.055)" }}>
            <div className="flex flex-col px-10 py-10 gap-10">
              <div>
                <div className="woolet-eyebrow mb-5">
                  <div className="woolet-eyebrow-line" />
                  <span className="woolet-eyebrow-text animate-pulse-gold">{t(lang, "hero.eyebrow")}</span>
                </div>
                <h1 className="font-display text-woolet-white leading-none mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
                  {t(lang, "hero.title_1")}<br />
                  {t(lang, "hero.title_2")} <em className="italic text-gold-light">{t(lang, "hero.title_3")}</em>
                </h1>
                <p className="sr-only">Woolet — Premium Glasses for Wide Faces 155mm+ | Italian Acetate Eyewear</p>
                <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
                  {t(lang, "hero.desc")}
                </p>
              </div>

              <WaitlistForm lang={lang} />
              <Testimonials />
              <div className="woolet-divider" />
              <ModelPills />

              <div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>{t(lang, "benefits.title")}</div>
                  <div className="text-cream-dim tracking-wider" style={{ fontSize: "0.62rem" }}>{t(lang, "benefits.subtitle")}</div>
                </div>
                <BenefitsBar />
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
