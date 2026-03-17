import { useParams } from "react-router-dom";
import heroManImg from "@/assets/hero-man.jpg";
import heroMobileImg from "@/assets/hero-mobile.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import WaitlistForm from "@/components/WaitlistForm";
import Testimonials from "@/components/Testimonials";
import ModelPills from "@/components/ModelPills";
import BenefitsBar from "@/components/BenefitsBar";
import BeforeAfter from "@/components/BeforeAfter";
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

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];

  return (
    <div className="relative z-[1] flex flex-col h-screen overflow-hidden">
      <SEO title={seo.title} description={seo.description} lang={lang} />

      {/* Ambient glows */}
      <div className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }} />
      <div className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }} />

      <Navbar />

      {/* HERO — full height below navbar, no page scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_580px] flex-1 min-h-0 animate-fade-in">
        {/* Mobile hero image — scrolls with right panel on mobile */}
        <div className="block lg:hidden w-full max-h-[50vh] overflow-hidden flex-shrink-0">
          <img src={heroMobileImg} alt="Man wearing Woolet eyewear" className="w-full h-full object-cover object-top" />
        </div>

        {/* Desktop left image — fixed, no scroll */}
        <div className="relative overflow-hidden bg-surface border-r hidden lg:block"
          style={{ borderRightColor: "hsl(0 0% 100% / 0.055)" }}>
          <div className="absolute inset-0 flex items-end overflow-hidden">
            <img src={heroManImg} alt="Man wearing Woolet wide-face eyewear" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 50%, hsl(var(--background) / 0.4) 100%)" }} />
          </div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 60%, hsl(var(--background) / 0.35) 100%)" }} />
        </div>

        {/* Right panel — this is the ONLY scrollable area */}
        <div className="flex flex-col overflow-y-auto lg:border-l"
          style={{ borderLeftColor: "hsl(0 0% 100% / 0.055)" }}>
          <div className="flex flex-col px-5 py-8 sm:p-8 lg:px-10 lg:py-10 gap-8 sm:gap-10">
            <div>
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text animate-pulse-gold">{t(lang, "hero.eyebrow")}</span>
              </div>
              <h1 className="font-display text-woolet-white leading-none mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
                {t(lang, "hero.title_1")}<br />
                {t(lang, "hero.title_2")} <em className="italic text-gold-light">{t(lang, "hero.title_3")}</em>
              </h1>
              <p className="sr-only">
                Woolet — Premium Glasses for Wide Faces 155mm+ | Italian Acetate Eyewear
              </p>
              <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
                {t(lang, "hero.desc")}
              </p>
            </div>

            <Countdown />
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
  );
};

export default Index;
