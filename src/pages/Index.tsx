import { useEffect, useState } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import heroManImg from "@/assets/hero-man.jpg";
import woolet007Asset from "@/assets/woolet-007-black-front.jpeg.asset.json";
import woolet009Asset from "@/assets/woolet-009-black-front.png.asset.json";
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

const MeterRow = ({ cfg }: { cfg: MeterCfg }) => {
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
          <span>✕ Standard</span>{" "}
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
          ↑ Your range
        </span>
      </div>
    </div>
  );
};

const METERS: MeterCfg[] = [
  {
    key: "frame",
    label: "Frame width",
    scaleMin: 135,
    scaleMax: 175,
    standard: [138, 148],
    woolet: [155, 172],
    ticks: [135, 155, 175],
  },
  {
    key: "bridge",
    label: "Nose bridge",
    scaleMin: 16,
    scaleMax: 26,
    standard: [18, 20],
    woolet: [21, 24],
    wooletLabel: "Woolet keyhole",
    ticks: [16, 21, 26],
  },
];

const FrameWidthMeter = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % METERS.length);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-[520px]">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {METERS.map((m) => (
            <div key={m.key} className="w-full shrink-0 pr-px">
              <MeterRow cfg={m} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex items-center gap-2 mt-4">
        {METERS.map((m, i) => (
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
          {METERS[active].label}
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

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en" replace />;
  }

  const seo = seoData[lang];

  const models = [
    { id: "007", name: "Woolet 007", shape: "Round", img: woolet007Asset.url, alt: "Woolet 007 round Italian acetate frame for wide faces" },
    { id: "009", name: "Woolet 009", shape: "Soft-square", img: woolet009Asset.url, alt: "Woolet 009 soft-square Italian acetate frame for wide faces" },
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
                <span className="woolet-eyebrow-text">Built for wide faces</span>
              </div>

              <h1
                className="font-display text-woolet-white leading-[1.02] max-w-[620px]"
                style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", fontWeight: 300 }}
              >
                Too wide for{" "}
                <em className="text-gold-light" style={{ fontStyle: "italic" }}>
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

              <div className="pt-1">
                <FrameWidthMeter />
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
                  View collection
                </Link>
              </div>

              {/* Trust strip */}
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-cream-dim/80"
                style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
              >
                <span>Fit guarantee</span>
                <span className="text-cream-dim/30">·</span>
                <span>Mazzucchelli acetate</span>
                <span className="text-cream-dim/30">·</span>
                <span>Handmade in the EU</span>
              </div>
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
                  <span className="woolet-eyebrow-text">The collection</span>
                </div>
                <h2
                  className="font-display text-woolet-white leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 300 }}
                >
                  Two shapes.{" "}
                  <em className="text-gold-light" style={{ fontStyle: "italic" }}>
                    One honest range.
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
                View all sizes →
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
                      className={`block object-contain transition-transform duration-500 group-hover:scale-[1.04] ${
                        m.id === "009"
                          ? "max-w-[46%] max-h-[46%]"
                          : "max-w-[78%] max-h-[78%]"
                      }`}
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
                    <div className="text-right shrink-0">
                      <div
                        className="font-display text-woolet-white leading-none"
                        style={{ fontSize: "1.05rem" }}
                      >
                        From $114
                      </div>
                      <div
                        className="uppercase tracking-[0.28em] text-cream-dim group-hover:text-gold-light transition-colors mt-2"
                        style={{ fontSize: "0.65rem", fontFamily: "Barlow, sans-serif" }}
                      >
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
