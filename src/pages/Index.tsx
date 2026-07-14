import { useEffect, useState } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
const heroManImg = "/hero-man.jpg";
// NOTE: the *-dimensions.png assets were uploaded swapped (007 file contains
// the square frame, 009 file contains the round frame). Import them under
// corrected aliases so the homepage collection cards render the right shape.
import woolet007Asset from "@/assets/woolet-009-dimensions.png.asset.json";
import woolet009Asset from "@/assets/woolet-007-dimensions.png.asset.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import SEO from "@/components/SEO";
import { pushGtmEvent } from "@/lib/gtm";
import { isValidLang, dirForLang, type Lang } from "@/lib/i18n";

const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Woolet — Italian Acetate Eyewear for Wide Faces (155 mm+)",
    description:
      "Too wide for Ray-Ban, Persol or Warby Parker? Woolet designs glasses that finally fit. Mazzucchelli acetate from Milan, Italy — hand made in EU. Pre-order 40% off.",
  },
  pl: {
    title: "Woolet — Włoski octan dla szerokich twarzy (155mm+)",
    description:
      "Za szeroka twarz na Ray-Ban, Persol czy Warby Parker? Woolet projektuje oprawy z włoskiego octanu Mazzucchelli dla twarzy 155–161 mm. Ręcznie w UE.",
  },
  fr: {
    title: "Woolet — Acétate italien pour visages larges (155mm+)",
    description:
      "Trop large pour Ray-Ban, Persol ou Warby Parker ? Woolet conçoit des montures en acétate italien pour visages de 155 à 161 mm. Fabriqué à la main en UE.",
  },
  es: {
    title: "Woolet — Acetato italiano para caras anchas (155mm+)",
    description:
      "¿Demasiado ancho para Ray-Ban, Persol o Warby Parker? Woolet diseña monturas de acetato italiano para caras de 155–161 mm. Hechas a mano en la UE.",
  },
  de: {
    title: "Woolet — Italienisches Acetat für breite Gesichter (ab 155 mm)",
    description:
      "Zu breit für Ray-Ban, Persol oder Warby Parker? Woolet fertigt Brillen aus italienischem Mazzucchelli-Acetat für Gesichter von 155–161 mm. Handgefertigt in der EU.",
  },
  ar: {
    title: "Woolet — نظارات أسيتات إيطالية للوجوه العريضة (155 ملم+)",
    description:
      "وجهك عريض على Ray-Ban أو Persol أو Warby Parker؟ Woolet تصمم إطارات من أسيتات Mazzucchelli الإيطالي للوجوه من 155 إلى 172 ملم. صناعة يدوية في الاتحاد الأوروبي. انضم للقائمة — خصم 40٪.",
  },
  ja: {
    title: "Woolet — 幅広い顔のためのイタリア製アセテートアイウェア (155mm以上)",
    description:
      "Ray-Ban、Persol、Warby Parkerが幅広すぎ？ Wooletは155–161mmの顔に合うイタリア製Mazzucchelliアセテートフレームを設計。EUで手作り。リスト登録で40%オフ。",
  },
  nl: {
    title: "Woolet — Italiaans acetaat voor brede gezichten (155 mm+)",
    description:
      "Te breed voor Ray-Ban, Persol of Warby Parker? Woolet ontwerpt Italiaanse Mazzucchelli-acetaatmonturen voor gezichten van 155–161 mm. Handgemaakt in de EU.",
  },
};

/** Translated copy for the homepage UI. */
type HomeCopy = {
  heroEyebrow: string;
  h1Pre: string;
  h1Em: string;
  h1Post: string;
  heroDesc: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustFit: string;
  trustAcetate: string;
  trustHandmade: string;
  meterFrame: string;
  meterBridge: string;
  meterStandard: string;
  meterYour: string;
  yourRange: string;
  teaserEyebrow: string;
  teaserH2Pre: string;
  teaserH2Em: string;
  viewAll: string;
  viewCta: string;
  shapeRound: string;
  shapeSquare: string;
};

const homeCopy: Record<Lang, HomeCopy> = {
  en: {
    heroEyebrow: "Eyewear built for wide faces",
    h1Pre: "Too wide for ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " or Warby Parker?",
    heroDesc: "Woolet designs glasses that finally fit. Italian Mazzucchelli acetate from Milan, hand made in the EU — and one honest width range you won't find anywhere else.",
    ctaPrimary: "Join the list — 40% off",
    ctaSecondary: "View collection",
    trustFit: "Fit guarantee",
    trustAcetate: "Mazzucchelli acetate",
    trustHandmade: "Handmade in the EU",
    meterFrame: "Frame width",
    meterBridge: "Nose bridge",
    meterStandard: "Standard",
    meterYour: "Woolet",
    yourRange: "↑ Your range",
    teaserEyebrow: "The collection",
    teaserH2Pre: "Two shapes. ",
    teaserH2Em: "One honest range.",
    viewAll: "View all sizes →",
    viewCta: "View →",
    shapeRound: "Round",
    shapeSquare: "Soft-square",
  },
  pl: {
    heroEyebrow: "Stworzone dla szerokich twarzy",
    h1Pre: "Za szeroka twarz na ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " czy Warby Parker?",
    heroDesc: "Woolet projektuje oprawy, które wreszcie pasują. Włoski octan Mazzucchelli, ręcznie wykonane w UE — i jeden uczciwy zakres szerokości, którego nie znajdziesz nigdzie indziej.",
    ctaPrimary: "Dołącz do listy — 40% zniżki",
    ctaSecondary: "Zobacz kolekcję",
    trustFit: "Gwarancja dopasowania",
    trustAcetate: "Octan Mazzucchelli",
    trustHandmade: "Ręcznie w UE",
    meterFrame: "Szerokość oprawy",
    meterBridge: "Mostek",
    meterStandard: "Standard",
    meterYour: "Woolet",
    yourRange: "↑ Twój zakres",
    teaserEyebrow: "Kolekcja",
    teaserH2Pre: "Dwa kształty. ",
    teaserH2Em: "Jeden uczciwy zakres.",
    viewAll: "Zobacz wszystkie rozmiary →",
    viewCta: "Zobacz →",
    shapeRound: "Okrągłe",
    shapeSquare: "Miękki kwadrat",
  },
  fr: {
    heroEyebrow: "Conçues pour les visages larges",
    h1Pre: "Trop large pour ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " ou Warby Parker ?",
    heroDesc: "Woolet conçoit des montures qui s'ajustent enfin. Acétate italien Mazzucchelli, fabriqué à la main en UE — et une seule plage de largeur honnête introuvable ailleurs.",
    ctaPrimary: "Rejoindre la liste — 40% off",
    ctaSecondary: "Voir la collection",
    trustFit: "Garantie d'ajustement",
    trustAcetate: "Acétate Mazzucchelli",
    trustHandmade: "Fabriqué à la main en UE",
    meterFrame: "Largeur monture",
    meterBridge: "Pont nasal",
    meterStandard: "Standard",
    meterYour: "Woolet",
    yourRange: "↑ Votre plage",
    teaserEyebrow: "La collection",
    teaserH2Pre: "Deux formes. ",
    teaserH2Em: "Une plage honnête.",
    viewAll: "Voir toutes les tailles →",
    viewCta: "Voir →",
    shapeRound: "Ronde",
    shapeSquare: "Carrée douce",
  },
  es: {
    heroEyebrow: "Hechas para caras anchas",
    h1Pre: "¿Demasiado ancho para ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " o Warby Parker?",
    heroDesc: "Woolet diseña monturas que por fin encajan. Acetato italiano Mazzucchelli, hecho a mano en la UE — y un único rango de anchos honesto que no encontrarás en ningún otro lugar.",
    ctaPrimary: "Únete a la lista — 40% off",
    ctaSecondary: "Ver colección",
    trustFit: "Garantía de ajuste",
    trustAcetate: "Acetato Mazzucchelli",
    trustHandmade: "Hecho a mano en la UE",
    meterFrame: "Ancho montura",
    meterBridge: "Puente nasal",
    meterStandard: "Estándar",
    meterYour: "Woolet",
    yourRange: "↑ Tu rango",
    teaserEyebrow: "La colección",
    teaserH2Pre: "Dos formas. ",
    teaserH2Em: "Un rango honesto.",
    viewAll: "Ver todas las tallas →",
    viewCta: "Ver →",
    shapeRound: "Redonda",
    shapeSquare: "Cuadrada suave",
  },
  de: {
    heroEyebrow: "Für breite Gesichter gebaut",
    h1Pre: "Zu breit für ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " oder Warby Parker?",
    heroDesc: "Woolet entwirft Brillen, die endlich passen. Italienisches Mazzucchelli-Acetat, handgefertigt in der EU — und ein ehrlicher Breitenbereich, den du nirgends sonst findest.",
    ctaPrimary: "Auf die Liste — 40% Rabatt",
    ctaSecondary: "Kollektion ansehen",
    trustFit: "Passform-Garantie",
    trustAcetate: "Mazzucchelli-Acetat",
    trustHandmade: "Handgefertigt in der EU",
    meterFrame: "Frontbreite",
    meterBridge: "Nasensteg",
    meterStandard: "Standard",
    meterYour: "Woolet",
    yourRange: "↑ Dein Bereich",
    teaserEyebrow: "Die Kollektion",
    teaserH2Pre: "Zwei Formen. ",
    teaserH2Em: "Ein ehrlicher Bereich.",
    viewAll: "Alle Größen ansehen →",
    viewCta: "Ansehen →",
    shapeRound: "Rund",
    shapeSquare: "Weich-eckig",
  },
  ar: {
    heroEyebrow: "صُمّمت للوجوه العريضة",
    h1Pre: "وجهك عريض على ",
    h1Em: "Ray-Ban أو Persol",
    h1Post: " أو Warby Parker؟",
    heroDesc: "Woolet تصمم إطارات تناسبك أخيراً. أسيتات Mazzucchelli الإيطالي، صناعة يدوية في الاتحاد الأوروبي — ونطاق عرض صادق لن تجده في أي مكان آخر.",
    ctaPrimary: "انضم للقائمة — خصم 40٪",
    ctaSecondary: "تصفح المجموعة",
    trustFit: "ضمان المقاس",
    trustAcetate: "أسيتات Mazzucchelli",
    trustHandmade: "صناعة يدوية في الاتحاد الأوروبي",
    meterFrame: "عرض الإطار",
    meterBridge: "جسر الأنف",
    meterStandard: "قياسي",
    meterYour: "Woolet",
    yourRange: "↑ نطاقك",
    teaserEyebrow: "المجموعة",
    teaserH2Pre: "شكلان. ",
    teaserH2Em: "نطاق واحد صادق.",
    viewAll: "عرض جميع المقاسات ←",
    viewCta: "عرض ←",
    shapeRound: "مستدير",
    shapeSquare: "مربع ناعم",
  },
  ja: {
    heroEyebrow: "幅広い顔のために設計",
    h1Pre: "",
    h1Em: "Ray-Ban、Persol",
    h1Post: "、Warby Parkerが幅広すぎませんか？",
    heroDesc: "Wooletはついに合うフレームを設計しています。イタリア製Mazzucchelliアセテート、EUで手作り — そして他では見つからない正直な幅レンジ。",
    ctaPrimary: "リストに登録 — 40%オフ",
    ctaSecondary: "コレクションを見る",
    trustFit: "フィット保証",
    trustAcetate: "Mazzucchelliアセテート",
    trustHandmade: "EUで手作り",
    meterFrame: "フレーム幅",
    meterBridge: "ノーズブリッジ",
    meterStandard: "標準",
    meterYour: "Woolet",
    yourRange: "↑ あなたの範囲",
    teaserEyebrow: "コレクション",
    teaserH2Pre: "2つのシェイプ。",
    teaserH2Em: "一つの正直なレンジ。",
    viewAll: "すべてのサイズを見る →",
    viewCta: "見る →",
    shapeRound: "ラウンド",
    shapeSquare: "ソフトスクエア",
  },
  nl: {
    heroEyebrow: "Ontworpen voor brede gezichten",
    h1Pre: "Te breed voor ",
    h1Em: "Ray-Ban, Persol",
    h1Post: " of Warby Parker?",
    heroDesc: "Woolet ontwerpt monturen die eindelijk passen. Italiaans Mazzucchelli-acetaat, handgemaakt in de EU — en een eerlijk breedtebereik dat je nergens anders vindt.",
    ctaPrimary: "Op de lijst — 40% korting",
    ctaSecondary: "Bekijk collectie",
    trustFit: "Pasgarantie",
    trustAcetate: "Mazzucchelli-acetaat",
    trustHandmade: "Handgemaakt in de EU",
    meterFrame: "Frontbreedte",
    meterBridge: "Neusbrug",
    meterStandard: "Standaard",
    meterYour: "Woolet",
    yourRange: "↑ Jouw bereik",
    teaserEyebrow: "Collectie",
    teaserH2Pre: "Twee vormen. ",
    teaserH2Em: "Eén eerlijk bereik.",
    viewAll: "Bekijk alle maten →",
    viewCta: "Bekijken →",
    shapeRound: "Rond",
    shapeSquare: "Zacht vierkant",
  },
};


/** A single fit meter: Standard (hatched) vs Woolet (gold) on a numeric mm scale. */
type MeterCfg = {
  key: string;
  label: string;
  scaleMin: number;
  scaleMax: number;
  standard: [number, number];
  woolet: [number, number];
  wooletLabel?: string;
  ticks: number[];
};

const MeterRow = ({
  cfg,
  standardLabel,
  yourRangeLabel,
}: {
  cfg: MeterCfg;
  standardLabel: string;
  yourRangeLabel: string;
}) => {
  const pct = (mm: number) =>
    ((mm - cfg.scaleMin) / (cfg.scaleMax - cfg.scaleMin)) * 100;
  const stdLeft = pct(cfg.standard[0]);
  const stdWidth = pct(cfg.standard[1]) - stdLeft;
  const wlLeft = pct(cfg.woolet[0]);
  const wlWidth = pct(cfg.woolet[1]) - wlLeft;


  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between mb-4 uppercase tracking-[0.22em]"
        style={{ fontSize: "0.68rem", color: "hsl(var(--gold-dim))" }}
      >
        <span>{cfg.label}</span>
        <span>mm</span>
      </div>

      <div className="relative h-6 w-full" style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${stdLeft + stdWidth / 2}%`, color: "hsl(var(--cream-dim) / 0.7)" }}
        >
          <span>✕ {standardLabel}</span>{" "}
          <span className="text-foreground/85" style={{ fontWeight: 500 }}>
            {cfg.standard[0]}–{cfg.standard[1]}
          </span>
        </span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${wlLeft + wlWidth / 2}%`, color: "hsl(var(--gold-light))", fontWeight: 500 }}
        >
          ✓ {cfg.wooletLabel ?? "Woolet"}{" "}
          <span className="text-foreground" style={{ fontWeight: 600 }}>
            {cfg.woolet[0]}–{cfg.woolet[1]}
          </span>
        </span>
      </div>

      <div className="relative h-[22px] w-full">
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px"
          style={{ background: "hsl(0 0% 100% / 0.1)" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 border"
          style={{
            left: `${stdLeft}%`,
            width: `${stdWidth}%`,
            height: "14px",
            borderColor: "hsl(0 0% 100% / 0.18)",
            backgroundImage:
              "repeating-linear-gradient(135deg, hsl(0 0% 100% / 0.09) 0 4px, transparent 4px 8px)",
          }}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${wlLeft}%`,
            width: `${wlWidth}%`,
            height: "22px",
            background: "hsl(var(--gold))",
            boxShadow:
              "0 0 0 1px hsl(var(--gold-light) / 0.55), 0 8px 24px -6px hsl(var(--gold) / 0.55)",
          }}
        />
      </div>

      <div
        className="flex justify-between mt-2.5 tracking-wider"
        style={{ fontSize: "0.66rem", color: "hsl(var(--cream-dim) / 0.55)" }}
      >
        {cfg.ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className="relative mt-3 h-4 w-full">
        <span
          className="absolute -translate-x-1/2 uppercase tracking-[0.24em] whitespace-nowrap"
          style={{
            left: `${wlLeft + wlWidth / 2}%`,
            fontSize: "0.62rem",
            color: "hsl(var(--gold-light))",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
          }}
        >
          {yourRangeLabel}

        </span>
      </div>
    </div>
  );
};

const makeMeters = (copy: HomeCopy): MeterCfg[] => [
  {
    key: "frame",
    label: copy.meterFrame,
    scaleMin: 135,
    scaleMax: 175,
    standard: [138, 148],
    woolet: [155, 161],
    ticks: [135, 155, 175],
  },
  {
    key: "bridge",
    label: copy.meterBridge,
    scaleMin: 16,
    scaleMax: 26,
    standard: [16, 20],
    woolet: [21, 24],
    wooletLabel: copy.meterBridge,
    ticks: [16, 21, 26],
  },
];

const FrameWidthMeter = ({ copy }: { copy: HomeCopy }) => {
  const [active, setActive] = useState(0);
  const meters = makeMeters(copy);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % meters.length);
    }, 5200);
    return () => clearInterval(t);
  }, [meters.length]);

  return (
    <div className="w-full max-w-[520px]">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {meters.map((m) => (
            <div key={m.key} className="w-full shrink-0 pr-px">
              <MeterRow
                cfg={m}
                standardLabel={copy.meterStandard}
                yourRangeLabel={copy.yourRange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex items-center gap-2 mt-4">
        {meters.map((m, i) => (
          <button
            key={m.key}
            type="button"
            aria-label={`Show ${m.label}`}
            onClick={() => setActive(i)}
            className="transition-all"
            style={{
              width: i === active ? 22 : 8,
              height: 2,
              background:
                i === active
                  ? "hsl(var(--gold))"
                  : "hsl(0 0% 100% / 0.18)",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
        <span
          className="ml-2 uppercase tracking-[0.22em]"
          style={{
            fontSize: "0.62rem",
            color: "hsl(var(--cream-dim) / 0.55)",
            fontFamily: "Barlow, sans-serif",
          }}
        >
          {meters[active].label}
        </span>
      </div>
    </div>
  );
};


const Index = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [location.hash]);

  // Toggle RTL on <html> for Arabic; restore on cleanup.
  useEffect(() => {
    const html = document.documentElement;
    const prevDir = html.getAttribute("dir");
    html.setAttribute("dir", dirForLang(lang));
    return () => {
      if (prevDir) html.setAttribute("dir", prevDir);
      else html.removeAttribute("dir");
    };
  }, [lang]);

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];
  const copy = homeCopy[lang];

  const models = [
    { id: "007", name: "Woolet 007", shape: copy.shapeRound, img: woolet007Asset.url, alt: "Woolet 007 — round panto Italian Mazzucchelli acetate glasses, 158 mm front, 21 mm keyhole bridge, for wide faces 155 mm+" },
    { id: "009", name: "Woolet 009", shape: copy.shapeSquare, img: woolet009Asset.url, alt: "Woolet 009 — soft-square Italian Mazzucchelli acetate glasses, 158 mm front, 22 mm keyhole bridge, for wide faces 155 mm+" },
  ];

  return (
    <>
      <SEO title={seo.title} description={seo.description} lang={lang} />


      <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
        {/* Ambient gold glow */}
        <div
          className="absolute pointer-events-none rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full w-[600px] h-[600px] -bottom-[200px] -left-[200px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)",
          }}
        />

        <Navbar />

        {/* HERO */}
        <section className="relative px-5 sm:px-8 lg:px-16 pt-10 lg:pt-14 pb-10 lg:pb-14">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-stretch">
            {/* LEFT — copy */}
            <div className="flex flex-col gap-6 lg:gap-7 lg:py-2">
              <div className="woolet-eyebrow">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">{copy.heroEyebrow}</span>
              </div>

              <h1
                className="font-display text-woolet-white leading-[1.02] max-w-[620px]"
                style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", fontWeight: 300 }}
              >
                {copy.h1Pre}
                <em className="text-gold-light" style={{ fontStyle: "italic" }}>
                  {copy.h1Em}
                </em>
                {copy.h1Post}
              </h1>

              <p
                className="text-cream-dim leading-relaxed max-w-[520px]"
                style={{ fontSize: "1.02rem" }}
              >
                {copy.heroDesc}
              </p>

              <div className="pt-1">
                <FrameWidthMeter copy={copy} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
                >
                  {copy.ctaPrimary}
                </Link>
                <Link
                  to={`/${lang}/collection`}
                  onClick={() =>
                    pushGtmEvent("hero_cta_secondary_click", {
                      location: "home_hero",
                      dest: "collection",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-colors text-cream-dim"
                  style={{
                    border: "1px solid hsl(0 0% 100% / 0.12)",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.45)";
                    e.currentTarget.style.color = "hsl(var(--foreground))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.12)";
                    e.currentTarget.style.color = "hsl(var(--cream-dim))";
                  }}
                >
                  {copy.ctaSecondary}
                </Link>
              </div>

              {/* Trust strip */}
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-cream-dim/80"
                style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
              >
                <span>{copy.trustFit}</span>
                <span className="text-cream-dim/30">·</span>
                <span>{copy.trustAcetate}</span>
                <span className="text-cream-dim/30">·</span>
                <span>{copy.trustHandmade}</span>
              </div>

              {/* JP-only SEO landing links */}
              {lang === "ja" && (
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
                  style={{ fontSize: "0.8rem", fontFamily: "Barlow, 'Noto Sans JP', sans-serif" }}
                >
                  <Link
                    to="/ja/big-face-glasses"
                    className="text-gold hover:text-gold-light no-underline border-b border-gold/40 hover:border-gold-light pb-0.5 transition-colors"
                  >
                    大きい顔のメガネ →
                  </Link>
                  <Link
                    to="/ja/bespoke"
                    className="text-gold hover:text-gold-light no-underline border-b border-gold/40 hover:border-gold-light pb-0.5 transition-colors"
                  >
                    オーダーメイド メガネ →
                  </Link>
                </div>
              )}

              {/* FR-only SEO landing link */}
              {lang === "fr" && (
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
                  style={{ fontSize: "0.8rem", fontFamily: "Barlow, sans-serif" }}
                >
                  <Link
                    to="/fr/lunettes-sur-mesure"
                    className="text-gold hover:text-gold-light no-underline border-b border-gold/40 hover:border-gold-light pb-0.5 transition-colors"
                  >
                    Lunettes sur mesure →
                  </Link>
                </div>
              )}

              {/* PL-only SEO landing link */}
              {lang === "pl" && (
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
                  style={{ fontSize: "0.8rem", fontFamily: "Barlow, sans-serif" }}
                >
                  <Link
                    to="/pl/okulary-na-zamowienie"
                    className="text-gold hover:text-gold-light no-underline border-b border-gold/40 hover:border-gold-light pb-0.5 transition-colors"
                  >
                    Okulary na zamówienie →
                  </Link>
                </div>
              )}

            </div>


            {/* RIGHT — portrait card, stretches to match left column */}

            <div
              className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-auto lg:min-h-[560px] lg:self-stretch overflow-hidden"
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
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={1600}
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
                className="absolute left-5 bottom-5 flex items-center gap-4 backdrop-blur-md"
                style={{
                  background: "hsl(var(--background) / 0.78)",
                  border: "1px solid hsl(0 0% 100% / 0.1)",
                  padding: "12px 18px",
                }}
              >
                <span
                  className="text-foreground"
                  style={{ fontSize: "0.85rem", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                >
                  Marek W.
                </span>
                <span
                  className="w-px h-3"
                  style={{ background: "hsl(0 0% 100% / 0.18)" }}
                />
                <span
                  className="tracking-wider"
                  style={{
                    fontSize: "0.85rem",
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  161 mm
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FITLENS STRIP — slim band, light surface */}
        <section
          aria-label="FitLens"
          className="relative"
          style={{ background: "#F8F6F1", color: "#1F1B16", borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}
        >
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-16 py-5 lg:py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div
              className="uppercase tracking-[0.24em] shrink-0"
              style={{ fontSize: "0.7rem", color: "#CAA449", fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
            >
              FitLens
            </div>
            <div className="flex-1 min-w-0" style={{ fontSize: "0.94rem", lineHeight: 1.5, fontFamily: "Barlow, sans-serif" }}>
              <span style={{ fontWeight: 600 }}>Measure your fit in 30 seconds.</span>{" "}
              <span style={{ color: "#1F1B16", opacity: 0.78 }}>
                Your phone camera measures temple-to-temple width and recommends your exact size before you buy.
              </span>
            </div>
            <Link
              to={`/${lang}/fit`}
              onClick={() => pushGtmEvent("home_fitlens_strip_click", { location: "home_fitlens_strip", dest: "fit" })}
              className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-colors shrink-0 self-start md:self-auto"
              style={{
                background: "#CAA449",
                color: "#1F1B16",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 600,
                fontSize: "0.74rem",
                padding: "14px 22px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#D8B86A")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#CAA449")}
            >
              Find your fit →
            </Link>
          </div>
        </section>

        {/* TEASER — two models, encourages scroll */}

        <section
          className="relative px-5 sm:px-8 lg:px-16 py-12 lg:py-16"
          style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}
        >
          <div className="max-w-[1320px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <div className="woolet-eyebrow mb-3">
                  <div className="woolet-eyebrow-line" />
                  <span className="woolet-eyebrow-text">{copy.teaserEyebrow}</span>
                </div>
                <h2
                  className="font-display text-woolet-white leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 300 }}
                >
                  {copy.teaserH2Pre}
                  <em className="text-gold-light" style={{ fontStyle: "italic" }}>
                    {copy.teaserH2Em}
                  </em>
                </h2>
              </div>
              <Link
                to={`/${lang}/collection`}
                onClick={() =>
                  pushGtmEvent("home_teaser_view_all_click", { dest: "collection" })
                }
                className="text-cream-dim hover:text-foreground no-underline uppercase tracking-[0.22em] transition-colors self-start sm:self-auto"
                style={{ fontSize: "0.72rem", fontFamily: "Barlow, sans-serif" }}
              >
                {copy.viewAll}

              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {models.map((m) => (
                <Link
                  key={m.id}
                  to={`/${lang}/collection`}
                  onClick={() =>
                    pushGtmEvent("home_teaser_model_click", { model: m.id, dest: "collection" })
                  }
                  className="group block no-underline transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: "1px solid hsl(0 0% 100% / 0.08)",
                    background: "#16140f",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.55)";
                    e.currentTarget.style.boxShadow = "0 18px 40px -20px rgba(0,0,0,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Unified product photo panel — same warm off-white, same padding, same crop */}
                  <div
                    className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden flex items-center justify-center"
                    style={{ background: "#efe9df" }}
                  >
                    <img
                      src={m.img}
                      alt={m.alt}
                      className="block object-contain transition-transform duration-500 group-hover:scale-[1.03] max-w-[92%] max-h-[88%]"
                      loading="lazy"
                    />


                  </div>

                  {/* Meta strip */}
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="min-w-0">
                      <div
                        className="uppercase tracking-[0.28em] mb-1"
                        style={{ fontSize: "0.68rem", color: "hsl(var(--gold))" }}
                      >
                        {m.id}
                      </div>
                      <div
                        className="font-display text-woolet-white truncate"
                        style={{ fontSize: "1.15rem" }}
                      >
                        {m.name}
                      </div>
                      <div
                        className="uppercase tracking-[0.22em] text-cream-dim mt-1"
                        style={{ fontSize: "0.65rem", fontFamily: "Barlow, sans-serif" }}
                      >
                        {m.shape} · 155–161 mm
                      </div>
                    </div>
                    <div
                      className="uppercase tracking-[0.28em] text-cream-dim group-hover:text-gold-light transition-colors"
                      style={{ fontSize: "0.65rem", fontFamily: "Barlow, sans-serif" }}
                    >
                      {copy.viewCta}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* BESPOKE — outside the standard range */}
        <section
          aria-label="Bespoke"
          className="relative px-5 sm:px-8 lg:px-16 py-16 lg:py-24"
          style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}
        >
          <div className="max-w-[1100px] mx-auto flex flex-col gap-8 lg:gap-10">
            <div className="woolet-eyebrow">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">Bespoke</span>
            </div>

            <h2
              className="font-display text-woolet-white leading-[1.05] max-w-[820px]"
              style={{ fontSize: "clamp(1.9rem, 3.6vw, 3rem)", fontWeight: 300 }}
            >
              Outside the range?{" "}
              <em className="text-gold-light" style={{ fontStyle: "italic" }}>
                We'll build to yours.
              </em>
            </h2>

            <p
              className="text-cream-dim leading-relaxed max-w-[680px]"
              style={{ fontSize: "1.02rem" }}
            >
              Our signature frames fit 155–161 mm. For measurements outside that range, explore our{" "}
              <Link to="/en/bespoke#bespoke-eyewear" className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                bespoke eyewear
              </Link>{" "}
              — or go straight to{" "}
              <Link to="/en/bespoke#bespoke-glasses-for-wide-faces" className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                bespoke glasses for wide faces
              </Link>. Bespoke covers any width from 145 to 162 mm, 4 frame shapes, 60 colour &amp; size
              combinations — built to measure, for everyone.
            </p>

            {/* Stat row */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-2"
              style={{ background: "hsl(0 0% 100% / 0.08)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              {[
                { v: "145–162", unit: "mm", label: "Any width" },
                { v: "4", unit: "", label: "Frame shapes" },
                { v: "60", unit: "", label: "Colour & size combos" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-2 px-6 py-7"
                  style={{ background: "hsl(var(--background))" }}
                >
                  <div
                    className="font-display text-woolet-white leading-none"
                    style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: 300 }}
                  >
                    {s.v}
                    {s.unit && (
                      <span
                        className="ml-1.5 text-cream-dim"
                        style={{ fontSize: "0.9rem", fontFamily: "Barlow, sans-serif", fontWeight: 400, letterSpacing: "0.06em" }}
                      >
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <div
                    className="uppercase tracking-[0.24em] text-cream-dim"
                    style={{ fontSize: "0.66rem", fontFamily: "Barlow, sans-serif" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to={`/${lang}/bespoke`}
                onClick={() =>
                  pushGtmEvent("home_bespoke_cta_click", { location: "home_bespoke_section", dest: "bespoke" })
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
              >
                Start bespoke →
              </Link>
            </div>
          </div>
        </section>

        <div className="h-16 lg:hidden" />
        <Footer />
        <StickyMobileCTA />
      </div>
    </>
  );
};

export default Index;
