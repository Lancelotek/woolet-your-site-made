import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import gregHeroAsset from "@/assets/greg-woolet-009.webp.asset.json";
import woolet007Asset from "@/assets/frames-2026/oval-crystal.asset.json";
import woolet009Asset from "@/assets/frames-2026/square-crystal.asset.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { FoundingBenefits } from "@/components/FoundingBenefits";
import SEO from "@/components/SEO";
import HeroSymptoms from "@/components/HeroSymptoms";
import { pushGtmEvent } from "@/lib/gtm";
import { isValidLang, dirForLang, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/i18n/routeRegistry";
import {
  assignHeroVariant,
  setHeroVariantUserProperty,
  trackHeroExposure,
  trackHeroCtaClick,
} from "@/lib/hero-experiment";

const seoData: Record<Lang, { title: string; description: string; ogDescription: string }> = {
  en: {
    title: "Woolet — Mazzucchelli Acetate Eyewear for Wide Faces (155 mm+)",
    description:
      "Too wide for Ray-Ban or Warby Parker? Woolet glasses finally fit. Mazzucchelli acetate, hand made in the EU. Pre-order for $114 (40% off).",
    ogDescription:
      "Woolet — Mazzucchelli acetate eyewear for wide faces (155–161 mm). Hand made in the EU. Pre-order for $114 and save 40%.",

  },
  pl: {
    title: "Woolet — Oprawy z octanu Mazzucchelli dla szerokich twarzy (155 mm+)",
    description:
      "Za szeroka twarz na Ray-Ban czy Warby Parker? Oprawy Woolet wreszcie pasują. Octan Mazzucchelli, ręcznie w UE. Pre-order za $114 (40% zniżki).",
    ogDescription:
      "Woolet — oprawy z octanu Mazzucchelli dla szerokich twarzy (155–161 mm). Ręcznie w UE. Pre-order za $114 z 40% rabatem.",
  },
  fr: {
    title: "Woolet — Montures en acétate Mazzucchelli pour visages larges (155 mm+)",
    description:
      "Trop large pour Ray-Ban ou Warby Parker ? Les montures Woolet s'ajustent enfin. Acétate Mazzucchelli, fabriqué à la main dans l'UE. Précommande à $114 (-40%).",
    ogDescription:
      "Woolet — montures en acétate Mazzucchelli pour visages larges (155–161 mm). Fabriquées à la main dans l'UE. Précommande à $114 (-40%).",
  },
  es: {
    title: "Woolet — Monturas de acetato Mazzucchelli para caras anchas (155 mm+)",
    description:
      "¿Demasiado ancho para Ray-Ban o Warby Parker? Las monturas Woolet por fin encajan. Acetato Mazzucchelli, hecho a mano en la UE. Reserva por $114 (40% off).",
    ogDescription:
      "Woolet — monturas de acetato Mazzucchelli para caras anchas (155–161 mm). Hechas a mano en la UE. Reserva por $114 (40% de descuento).",
  },
  de: {
    title: "Woolet — Brillen aus Mazzucchelli-Acetat für breite Gesichter (ab 155 mm)",
    description:
      "Zu breit für Ray-Ban oder Warby Parker? Woolet-Brillen passen endlich. Mazzucchelli-Acetat, handgefertigt in der EU. Vorbestellen für $114 (40% Rabatt).",
    ogDescription:
      "Woolet — Brillen aus Mazzucchelli-Acetat für breite Gesichter (155–161 mm). Handgefertigt in der EU. Vorbestellen für $114 (40% Rabatt).",
  },
  ar: {
    title: "Woolet — نظارات أسيتات Mazzucchelli للوجوه العريضة (155 ملم+)",
    description:
      "وجهك عريض على Ray-Ban أو Warby Parker؟ نظارات Woolet تناسبك أخيراً. أسيتات Mazzucchelli، صناعة يدوية في الاتحاد الأوروبي. احجز مسبقاً بـ $114 (خصم 40%).",
    ogDescription:
      "Woolet — نظارات أسيتات Mazzucchelli للوجوه العريضة (155–161 ملم). صناعة يدوية في الاتحاد الأوروبي. احجز مسبقاً بـ $114 (خصم 40%).",
  },
  ja: {
    title: "Woolet — 幅広い顔のためのMazzucchelliアセテートアイウェア (155mm以上)",
    description:
      "Ray-BanやWarby Parkerが幅広すぎ？ Wooletメガネがついにフィット。Mazzucchelliアセテート、EUで手作り。$114で先行予約（40%オフ）。",
    ogDescription:
      "Woolet — 幅広い顔のためのMazzucchelliアセテートアイウェア (155–161mm)。EUで手作り。$114で先行予約（40%オフ）。",
  },
  nl: {
    title: "Woolet — Mazzucchelli-acetaatmonturen voor brede gezichten (155 mm+)",
    description:
      "Te breed voor Ray-Ban of Warby Parker? Woolet-monturen passen eindelijk. Mazzucchelli-acetaat, handgemaakt in de EU. Pre-order voor $114 (40% korting).",
    ogDescription:
      "Woolet — Mazzucchelli-acetaatbrillen voor brede gezichten (155–161 mm). Handgemaakt in de EU. Pre-order voor $114 (40% korting).",
  },
  ko: {
    title: "Woolet — 대두 안경테, 마주켈리 아세테이트 (155mm+)",
    description:
      "레이밴이나 와비파커가 좁게 느껴지나요? Woolet 프레임은 마침내 맞습니다. 이탈리아 마주켈리 아세테이트, EU 수제 제작. $114 선주문 (40% 할인).",
    ogDescription:
      "Woolet — 대두 안경테, 마주켈리 아세테이트 (155–161mm). EU 수제 제작. $114 선주문 (40% 할인).",
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
    heroDesc: "Woolet designs glasses that finally fit. Mazzucchelli acetate, hand made in the EU — one honest width range (155–161 mm) built for faces the big brands ignore.",
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
    heroDesc: "Woolet projektuje oprawy, które wreszcie pasują. Octan Mazzucchelli, ręcznie wykonane w UE — jeden uczciwy zakres szerokości (155–161 mm) stworzony dla twarzy, które duże marki pomijają.",
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
    heroDesc: "Woolet conçoit des montures qui s'ajustent enfin. Acétate Mazzucchelli, fabriqué à la main en UE — une seule plage de largeur honnête (155–161 mm) conçue pour les visages que les grandes marques ignorent.",
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
    heroDesc: "Woolet diseña monturas que por fin encajan. Acetato Mazzucchelli, hecho a mano en la UE — un único rango de anchos honesto (155–161 mm) diseñado para caras que las grandes marcas ignoran.",
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
    heroDesc: "Woolet entwirft Brillen, die endlich passen. Mazzucchelli-Acetat, handgefertigt in der EU — ein ehrlicher Breitenbereich (155–161 mm), gebaut für Gesichter, die große Marken ignorieren.",
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
    heroDesc: "Woolet تصمم إطارات تناسبك أخيراً. أسيتات Mazzucchelli، صناعة يدوية في الاتحاد الأوروبي — نطاق عرض صادق (155–161 ملم) مُصمم للوجوه التي تتجاهلها العلامات التجارية الكبرى.",
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
    heroDesc: "Wooletはついに合うフレームを設計しています。Mazzucchelliアセテート、EUで手作り — 大きなブランドが見落とす顔のための正直な幅レンジ（155–161 mm）。",
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
    heroDesc: "Woolet ontwerpt monturen die eindelijk passen. Mazzucchelli-acetaat, handgemaakt in de EU — een eerlijk breedtebereik (155–161 mm), gebouwd voor gezichten die grote merken negeren.",
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
  ko: {
    heroEyebrow: "대두를 위해 설계",
    h1Pre: "레이밴, 페르솔, 와비파커가 ",
    h1Em: "너무 좁으신가요",
    h1Post: "?",
    heroDesc: "Woolet은 마침내 맞는 프레임을 만듭니다. 이탈리아 마주켈리 아세테이트, EU 수제 제작 — 대형 브랜드가 놓친 얼굴을 위한 정직한 폭 범위 (155–161mm).",
    ctaPrimary: "대기자 등록 — 40% 할인",
    ctaSecondary: "컬렉션 보기",
    trustFit: "핏 보증",
    trustAcetate: "마주켈리 아세테이트",
    trustHandmade: "EU 수제 제작",
    meterFrame: "전면 폭",
    meterBridge: "브리지",
    meterStandard: "일반 브랜드",
    meterYour: "Woolet",
    yourRange: "↑ 당신의 범위",
    teaserEyebrow: "컬렉션",
    teaserH2Pre: "두 가지 형태. ",
    teaserH2Em: "하나의 정직한 범위.",
    viewAll: "모든 사이즈 보기 →",
    viewCta: "보기 →",
    shapeRound: "라운드",
    shapeSquare: "소프트 스퀘어",
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
          style={{ left: `${stdLeft + stdWidth / 2}%`, color: "hsl(var(--cream-dim))" }}
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
        style={{ fontSize: "0.66rem", color: "hsl(var(--cream-dim))" }}
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
            color: "hsl(var(--cream-dim))",
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

  // ── Hero headline A/B test (see src/lib/hero-experiment.ts) ──────────────
  // Assigned synchronously on first render → no flash of the control copy.
  // English hero only; other locales keep their translated copy.
  const [heroAssignment] = useState(assignHeroVariant);
  const heroVariant = heroAssignment.variant;
  const heroExperimentActive = lang === "en";
  const heroTracked = heroExperimentActive && !heroAssignment.forced;
  const exposureFired = useRef(false);

  useEffect(() => {
    if (!heroTracked || exposureFired.current) return;
    exposureFired.current = true;
    setHeroVariantUserProperty(heroVariant.id);
    trackHeroExposure(heroVariant.id);
  }, [heroTracked, heroVariant.id]);

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
    // Invalid locale segment (e.g. /xx/): render NotFound rather than
    // silently redirecting to /en. Redirect-to-parent hides bad links
    // from crawlers and produces a soft-404.
    return <NotFound />;
  }

  const seo = seoData[lang];
  const copy = homeCopy[lang];

  const models = [
    { id: "007", name: "Woolet 007", shape: copy.shapeRound, img: woolet007Asset.url, alt: "Woolet 007 — round panto Italian Mazzucchelli acetate glasses, 158 mm front, 21 mm keyhole bridge, for wide faces 155 mm+" },
    { id: "009", name: "Woolet 009", shape: copy.shapeSquare, img: woolet009Asset.url, alt: "Woolet 009 — soft-square Italian Mazzucchelli acetate glasses, 158 mm front, 22 mm keyhole bridge, for wide faces 155 mm+" },
  ];

  return (
    <>
      <SEO title={seo.title} description={seo.description} ogDescription={seo.ogDescription} lang={lang} />
      {/* Preload the LCP hero portrait so it starts fetching before hydration */}
      <link
        rel="preload"
        as="image"
        href={gregHeroAsset.url}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ fetchpriority: "high" } as any)}
      />


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
        <section className="relative px-5 sm:px-8 lg:px-16 pt-8 lg:pt-14 pb-10 lg:pb-14">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-7 lg:gap-14 items-stretch">
            {/* LEFT — copy.
                On phones the column dissolves (display: contents) so the
                portrait can slot between the headline and the CTAs; from lg
                up it behaves as a normal flex column again. */}
            <div className="contents lg:flex lg:flex-col lg:gap-7 lg:py-2">
              {/* Copy block gets a min-height sized to the longest variant so
                  switching headlines never moves the CTA (see .woolet-hero-copy). */}
              <div className="woolet-hero-copy order-1 lg:order-none flex flex-col gap-5 lg:gap-7">

                <div className="woolet-eyebrow">
                  <div className="woolet-eyebrow-line" />
                  <span className="woolet-eyebrow-text">
                    {heroExperimentActive ? heroVariant.eyebrow : copy.heroEyebrow}
                  </span>
                </div>

                <h1
                  className="font-display text-woolet-white leading-[1.02] max-w-[620px]"
                  style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", fontWeight: 300 }}
                >
                  {heroExperimentActive ? (
                    heroVariant.headlineParts.map((part, i) =>
                      part.accent ? (
                        <em key={i} className="text-gold-light" style={{ fontStyle: "italic" }}>
                          {part.text}
                        </em>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )
                  ) : (
                    <>
                      {copy.h1Pre}
                      <em className="text-gold-light" style={{ fontStyle: "italic" }}>
                        {copy.h1Em}
                      </em>
                      {copy.h1Post}
                    </>
                  )}
                </h1>

                <p
                  className="text-cream-dim leading-relaxed max-w-[520px]"
                  style={{ fontSize: "1.02rem" }}
                >
                  {heroExperimentActive ? heroVariant.sub : copy.heroDesc}
                </p>
              </div>

              <div className="order-5 lg:order-none pt-1">
                {lang === "en" ? (
                  <HeroSymptoms meter={<FrameWidthMeter copy={copy} />} />
                ) : (
                  <FrameWidthMeter copy={copy} />
                )}
              </div>

              <div className="order-3 lg:order-none flex flex-col sm:flex-row gap-3 lg:pt-2">

                <Link
                  to={hrefFor("lp.kickstarter", lang)}
                  onClick={() => {
                    pushGtmEvent("hero_cta_primary_click", {
                      location: "home_hero",
                      dest: "lp_kickstarter",
                    });
                    if (heroTracked) trackHeroCtaClick(heroVariant.id, "join_list");
                  }}
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
                  to={hrefFor("collection", lang)}
                  onClick={() => {
                    pushGtmEvent("hero_cta_secondary_click", {
                      location: "home_hero",
                      dest: "collection",
                    });
                    if (heroTracked) trackHeroCtaClick(heroVariant.id, "view_collection");
                  }}
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

              {/* Founding-member benefits — mirrors /en/lp/kickstarter */}
              {lang === "en" && (
                <div className="order-6 lg:order-none lg:pt-3 max-w-[520px]">
                  <FoundingBenefits />
                </div>
              )}

              {/* Trust strip */}
              <div
                className="order-4 lg:order-none flex flex-wrap items-center gap-x-6 gap-y-2 lg:pt-1 text-cream-dim"
                style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
              >
                <span>{copy.trustFit}</span>
                <span className="text-cream-dim/60" aria-hidden="true">·</span>
                <span>{copy.trustAcetate}</span>
                <span className="text-cream-dim/60" aria-hidden="true">·</span>
                <span>{copy.trustHandmade}</span>
              </div>


              {/* JP-only SEO landing links */}
              {lang === "ja" && (
                <div
                  className="order-7 lg:order-none flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
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
                  className="order-7 lg:order-none flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
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
                  className="order-7 lg:order-none flex flex-wrap items-center gap-x-5 gap-y-2 pt-3"
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
              className="order-2 lg:order-none relative w-full aspect-[4/3] sm:aspect-[4/5] lg:aspect-auto lg:h-auto lg:min-h-[560px] xl:min-h-[600px] lg:self-stretch overflow-hidden max-h-[58vh] sm:max-h-[680px] lg:max-h-none rounded-sm"
              style={{
                border: "1px solid hsl(0 0% 100% / 0.08)",
                background:
                  "linear-gradient(180deg, hsl(0 0% 100% / 0.02) 0%, hsl(0 0% 100% / 0.005) 100%)",
              }}
            >
              <img
                src={gregHeroAsset.url}
                sizes="(min-width: 1024px) 48vw, 100vw"
                alt="Greg wearing Woolet 009 soft-square tortoise acetate glasses — 158 mm wide-fit frame for medium-to-large faces"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1000}
                height={1250}
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
                className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 md:left-6 md:bottom-6 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 backdrop-blur-md rounded-sm max-w-[calc(100%-2rem)]"
                style={{
                  background: "hsl(var(--background) / 0.78)",
                  border: "1px solid hsl(0 0% 100% / 0.1)",
                  padding: "10px 14px",
                }}
              >
                <span
                  className="text-foreground text-xs sm:text-[0.85rem]"
                  style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                >
                  Greg
                </span>
                <span
                  className="hidden sm:block w-px h-3"
                  style={{ background: "hsl(0 0% 100% / 0.18)" }}
                />
                <span
                  className="tracking-wider text-xs sm:text-[0.85rem]"
                  style={{
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  user of <span className="font-wordmark">WOOLET</span> 009
                </span>
              </div>
            </div>
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
                to={hrefFor("collection", lang)}
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
                  to={hrefFor("collection", lang)}
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
                  {/* Unified product photo panel — edge-to-edge, matches pack background */}
                  <div
                    className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden flex items-center justify-center"
                    style={{ background: "#000" }}
                  >
                    <img
                      src={m.img}
                      alt={m.alt}
                      className="block w-full h-full object-contain sm:object-cover object-center scale-[1.15] sm:scale-100 transition-transform duration-500 group-hover:scale-[1.18] sm:group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      width={1600}
                      height={1000}
                      sizes="(min-width: 640px) 46vw, 90vw"
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
              <Link to={`${hrefFor("bespoke", lang)}#bespoke-eyewear`} className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                bespoke eyewear
              </Link>{" "}
              — or go straight to{" "}
              <Link to={`${hrefFor("bespoke", lang)}#bespoke-glasses-for-wide-faces`} className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                bespoke glasses for wide faces
              </Link>. Bespoke covers any width from 145 to 172 mm, 4 frame shapes, 60 colour &amp; size
              combinations — built to measure, for everyone.
            </p>

            {/* Stat row */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-2"
              style={{ background: "hsl(0 0% 100% / 0.08)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              {[
                { v: "145–172", unit: "mm", label: "Any width" },
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
                to={hrefFor("bespoke", lang)}
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
