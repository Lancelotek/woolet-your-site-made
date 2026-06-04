import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Ruler } from "lucide-react";
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
      "Italian Mazzucchelli acetate eyewear for wide faces (155 mm+). Two shapes - Round and Square - both 158 mm wide. Bespoke from 150 mm. AI-fit in 30 seconds.",
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
    pushGtmEvent("hero_see_sizes_click", { source: "hero" });
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

      {/* Product claim — main H1 */}
      {semantic ? (
        <h1
          className="font-display text-woolet-white leading-[0.95]"
          style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 300 }}
        >
          <em className="italic text-gold-light">Measured</em> for you — AI-Fit Eyewear for Wide Faces
        </h1>
      ) : (
        <div
          aria-hidden="true"
          className="font-display text-woolet-white leading-[0.95]"
          style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 300 }}
        >
          <em className="italic text-gold-light">Measured</em> for you — AI-Fit Eyewear for Wide Faces
        </div>
      )}

      <p className="text-cream-dim leading-relaxed tracking-wider max-w-xl" style={{ fontSize: "0.88rem" }}>
        Italian Mazzucchelli acetate. AI-fit precision. Two shapes — both
        <span className="text-foreground"> 158 mm wide</span> with a 21 mm bridge, plus bespoke from 150 mm. For faces 155 mm and above.
      </p>

      {/* SINGLE primary CTA + price subline */}
      <div className="flex flex-col gap-2 pt-2">
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
        {/* Tiny waitlist alternative — link to product 007 */}
        <a
          href={`/${lang}/lp/kickstarter`}
          onClick={() => pushGtmEvent("hero_link_waitlist_click", { source: "hero", dest: "lp_kickstarter" })}
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
          Not ready? Join the waitlist for up to 40% off →
        </a>
      </div>

      {/* Trust badges row — 2 only */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 6 }}>
        {[
          { icon: <Ruler size={11} strokeWidth={1.5} color="#9A8E7E" />, text: "Fit Guarantee" },
          { icon: <span style={{ fontSize: 11, lineHeight: 1 }}>🇮🇹</span>, text: "Italian Mazzucchelli Acetate" },
          { icon: (
            <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true">
              <path d="M0.5 0.5 H8.5 V8 Q8.5 10 4.5 10.5 Q0.5 10 0.5 8 Z" fill="#fff" stroke="#9A8E7E" strokeWidth="0.5" />
              <path d="M3.6 0.5 H5.4 V4.2 H8.5 V5.8 H5.4 V10.3 H3.6 V5.8 H0.5 V4.2 H3.6 Z" fill="#D02030" />
            </svg>
          ), text: "Made in Milano" },
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

        </div>

        {isEn && <SizeMatrix fitHref={`/${lang}/fit/scan`} sectionId="size-matrix-mobile" />}

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

            </div>
            {isEn && <SizeMatrix fitHref={`/${lang}/fit/scan`} semantic={false} sectionId="size-matrix-desktop" />}
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
