import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { langFromPath, productBreadcrumbJsonLd, SITE_URL, localeCtx } from "@/seo/product-collection-jsonld";
import { pushGtmEvent } from "@/lib/gtm";
import { trackMetaEventOnce } from "@/lib/meta-capi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BESPOKE_COPY, pdpLang, usd } from "@/i18n/productPageCopy";
import { BESPOKE_FACTS } from "@/content/bespokeFacts";
import aviatorImg from "@/assets/configurator/frames/aviator.png.asset.json";
import rectangleImg from "@/assets/configurator/frames/rectangle.png.asset.json";
import crownPantoImg from "@/assets/configurator/frames/crown-panto.png.asset.json";
import roundImg from "@/assets/configurator/frames/round.png.asset.json";

/* ---------- shared tokens (match 007 / 009) ---------- */
const T = {
  canvas: "#efe9df",
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  dark: "#0b0a09",
  gold: "#c2a05a",
  goldHi: "#d8b86a",
  hair: "rgba(22,20,15,0.10)",
  hairStrong: "rgba(22,20,15,0.18)",
};
const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

const galleryBespoke = [
  aviatorImg.url,
  rectangleImg.url,
  crownPantoImg.url,
  roundImg.url,
];

const ProductPageBespoke = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = langFromPath(location.pathname);
  const ctx = localeCtx(lang);
  const canonical = `${SITE_URL}/en/bespoke`;
  const pl = pdpLang(lang);
  const b = BESPOKE_COPY[pl];
  const { specs, benefits, guarantees } = b;
  const productPath = (id: string) => `/${pl === "en" ? "en" : lang}/products/${id}`;
  const [activeImg, setActiveImg] = useState<string>(galleryBespoke[0]);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    pushGtmEvent("view_item", {
      item_name: "Woolet Bespoke",
      awareness_stage: "most_aware",
      item_variant: "Founders Bespoke",
    });
    // Meta upper funnel — browser pixel + CAPI on one event_id, once per session.
    trackMetaEventOnce("ViewContent", "viewcontent:bespoke-product", {
      custom: {
        content_type: "product",
        content_ids: ["bespoke"],
        content_name: "Woolet Bespoke",
        value: 480,
        currency: "USD",
      },
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCTA = () => {
    pushGtmEvent("click_reserve", {
      product_id: "bespoke",
      item_name: "Woolet Bespoke",
      item_variant: "Bespoke",
      total_price: BESPOKE_FACTS.regularPrice,
      value: 1,
      currency: "USD",
    });
    pushGtmEvent("begin_checkout", {
      item_name: "Woolet Bespoke",
      item_variant: "Bespoke",
      total_price: BESPOKE_FACTS.regularPrice,
      value: 1,
      currency: "USD",
    });
    navigate("/en/bespoke");
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{b.title}</title>
        <meta name="description" content={b.metaDescription} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/bespoke`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en/bespoke`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={b.ogTitle} />
        <meta property="og:description" content={b.ogDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={lang === "nl" ? "nl_NL" : lang === "fr" ? "fr_FR" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(productBreadcrumbJsonLd(lang, "Woolet Bespoke", "bespoke"))}</script>

      </Helmet>

      <Navbar />

      {/* Breadcrumb */}
      <div style={{ background: T.dark, borderBottom: "1px solid rgba(216,184,106,0.10)" }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: 1240, padding: "10px 20px",
            fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(243,236,224,0.55)",
          }}
        >
          <Link to={ctx.home} style={{ color: "inherit", textDecoration: "none" }}>{ctx.homeLabel}</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <Link to={ctx.collection} style={{ color: "inherit", textDecoration: "none" }}>{ctx.framesLabel}</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <span style={{ color: T.goldHi }}>Woolet Bespoke</span>
        </div>
      </div>

      <main
        style={{
          background: T.canvas,
          color: T.ink,
          fontFamily: SANS,
          boxShadow: "inset 0 1px 0 rgba(216,184,106,0.18), inset 0 12px 28px -22px rgba(11,10,9,0.65)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "36px 20px 80px" }}>
          <style>{`
            @media (min-width: 900px) {
              .pdp-grid { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) !important; }
              .pdp-gallery { position: sticky; top: 96px; align-self: start; }
            }
            .pdp-cta:hover { filter: brightness(1.04); }
            .pdp-thumb:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 3px; }
          `}</style>

          <div className="pdp-grid grid" style={{ gap: 48, gridTemplateColumns: "minmax(0,1fr)" }}>
            {/* LEFT — Gallery */}
            <section className="pdp-gallery">
              <div
                style={{
                  background: "#f3ece0",
                  border: `1px solid ${T.hair}`,
                  borderRadius: 4,
                  padding: "48px 40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "4 / 3",
                }}
              >
                <img
                  src={activeImg}
                  alt={b.heroAlt}
                  width={800}
                  height={600}
                  fetchPriority="high"
                  style={{ width: "100%", maxWidth: 560, height: "auto", objectFit: "contain", display: "block" }}
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {galleryBespoke.map((src, i) => {
                  const active = activeImg === src;
                  const shapeName = ["Aviator", "Rectangle", "Crown Panto", "Round"][i];
                  return (
                    <button
                      key={src}
                      onClick={() => setActiveImg(src)}
                      className="pdp-thumb"
                      aria-label={b.viewShape(shapeName)}
                      style={{
                        width: 84, height: 64, flexShrink: 0, padding: 6,
                        background: "#f3ece0",
                        border: `1px solid ${active ? T.gold : T.hair}`,
                        boxShadow: active ? `inset 0 0 0 1px ${T.gold}` : "none",
                        borderRadius: 3, cursor: "pointer",
                      }}
                    >
                      <img src={src} alt={b.thumbAlt(shapeName)} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* RIGHT — Buy panel */}
            <section style={{ maxWidth: 520 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {b.tags.map((tag) => (
                  <span key={tag} style={{
                    fontFamily: SANS, fontSize: 11, letterSpacing: "0.12em",
                    textTransform: "uppercase", padding: "4px 10px",
                    border: `1px solid ${T.hairStrong}`, color: T.inkDim, borderRadius: 999,
                  }}>{tag}</span>
                ))}
                <span style={{
                  fontFamily: SANS, fontSize: 11, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "4px 10px",
                  color: T.gold, borderRadius: 999,
                }}>{b.cutToFace}</span>
              </div>

              <div style={{
                fontFamily: SANS, fontSize: 11, letterSpacing: "0.28em",
                textTransform: "uppercase", color: T.gold, marginBottom: 10,
              }}>
                {b.eyebrow}
              </div>

              <h1 style={{
                fontFamily: SERIF, fontWeight: 300,
                fontSize: "clamp(34px, 4vw, 46px)", lineHeight: 1.05,
                color: T.ink, margin: "0 0 6px", letterSpacing: "-0.01em",
              }}>
                Woolet <em style={{ fontStyle: "italic", color: T.gold }}>Bespoke</em>
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 14, color: T.inkDim, marginBottom: 10 }}>
                {b.subline}
              </div>
              <h2 style={{
                fontFamily: SANS, fontWeight: 500, fontSize: 13,
                letterSpacing: "0.04em", color: T.inkDim,
                margin: "0 0 22px", lineHeight: 1.5,
              }}>
                {b.h2}
              </h2>

              {/* Price hierarchy */}
              <div style={{
                padding: "18px 0 20px",
                borderTop: `1px solid ${T.hair}`,
                borderBottom: `1px solid ${T.hair}`,
                margin: "0 0 22px",
              }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.gold, marginBottom: 8,
                }}>Regular price</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 48, lineHeight: 1, color: T.ink }}>{usd(pl, BESPOKE_FACTS.regularPrice)}</span>
                </div>
                <div style={{
                  marginTop: 10, fontFamily: SANS, fontSize: 13, color: T.inkDim, lineHeight: 1.55,
                }}>
                  {BESPOKE_FACTS.lenses}. {BESPOKE_FACTS.shipping}. <Link to={BESPOKE_FACTS.kickstarterPath}>{BESPOKE_FACTS.kickstarterLabel}</Link>.
                </div>
              </div>

              {/* Model toggle */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.inkMute, marginBottom: 8,
                }}>{b.modelLabel}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate(productPath("007"))}
                    style={{
                      flex: "1 1 120px", padding: "11px 14px", cursor: "pointer",
                      background: "transparent", color: T.inkDim,
                      border: `1px solid ${T.hairStrong}`,
                      fontFamily: SERIF, fontSize: 16,
                    }}
                  >
                    007 Panto
                  </button>
                  <button
                    onClick={() => navigate(productPath("009"))}
                    style={{
                      flex: "1 1 120px", padding: "11px 14px", cursor: "pointer",
                      background: "transparent", color: T.inkDim,
                      border: `1px solid ${T.hairStrong}`,
                      fontFamily: SERIF, fontSize: 16,
                    }}
                  >
                    {b.model009}
                  </button>
                  <button
                    style={{
                      flex: "1 1 120px", padding: "11px 14px", cursor: "pointer",
                      background: T.canvas, color: T.ink,
                      border: `1px solid ${T.gold}`,
                      boxShadow: `inset 0 0 0 1px ${T.gold}`,
                      fontFamily: SERIF, fontSize: 16,
                    }}
                  >
                    <em style={{ color: T.gold, fontStyle: "italic" }}>Bespoke</em>
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleCTA}
                className="pdp-cta"
                style={{
                  width: "100%", background: T.gold, color: T.dark, border: "none",
                  padding: "16px 0", borderRadius: 2,
                  fontFamily: SANS, fontWeight: 600, fontSize: 13,
                  letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer",
                }}
              >
                Explore Woolet Bespoke
              </button>
              <button
                onClick={() => navigate("/en/fit")}
                style={{
                  width: "100%", marginTop: 10,
                  background: "transparent", color: T.ink,
                  border: `1px solid ${T.hairStrong}`,
                  padding: "13px 0", borderRadius: 2,
                  fontFamily: SANS, fontSize: 12, letterSpacing: "0.18em",
                  textTransform: "uppercase", cursor: "pointer",
                }}
              >
                {b.fitCta}
              </button>

              {/* Benefits */}
              <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 10 }}>
                {benefits.map((b, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: T.ink }}>
                    <span aria-hidden style={{ color: T.gold, marginTop: 2, flex: "0 0 auto" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Specs */}
              <div style={{
                marginTop: 28, padding: "18px 20px",
                border: `1px solid ${T.hair}`,
                background: "rgba(255,255,255,0.35)",
              }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.gold, marginBottom: 12,
                }}>{b.specsTitle}</div>
                <dl style={{ margin: 0, display: "grid", gap: 0 }}>
                  {specs.map(([k, v], i) => (
                    <div key={k} style={{
                      display: "flex", justifyContent: "space-between", gap: 16,
                      padding: "10px 0",
                      borderTop: i === 0 ? "none" : `1px solid ${T.hair}`,
                    }}>
                      <dt style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim }}>{k}</dt>
                      <dd style={{ margin: 0, fontFamily: SANS, fontSize: 13, color: T.ink, textAlign: "right" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Guarantee */}
              <div style={{
                marginTop: 16, padding: "18px 20px",
                border: `1px solid ${T.hair}`,
                background: "rgba(255,255,255,0.35)",
              }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.gold, marginBottom: 14,
                }}>{b.guaranteeTitle}</div>
                <div style={{ display: "grid", gap: 14 }}>
                  {guarantees.map(([title, desc]) => (
                    <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span aria-hidden style={{ color: T.gold, flex: "0 0 auto", marginTop: 2 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      </span>
                      <div>
                        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: T.ink, marginBottom: 2 }}>{title}</div>
                        <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.inkDim, lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 22 }}>
                <Link
                  to={pl === "en" ? "/en#collection" : ctx.collection}
                  style={{
                    fontFamily: SANS, fontSize: 12, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: T.inkDim, textDecoration: "none",
                    borderBottom: `1px solid ${T.hairStrong}`, paddingBottom: 2,
                  }}
                >
                  {b.backToCollection}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Sticky buy bar */}
      <div
        aria-hidden={!showSticky}
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          background: T.dark,
          borderTop: "1px solid rgba(216,184,106,0.22)",
          transform: showSticky ? "translateY(0)" : "translateY(110%)",
          transition: "transform 260ms ease",
          zIndex: 60,
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "10px 16px calc(10px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: "#f3ece0", lineHeight: 1.1 }}>
              Woolet <em style={{ color: T.goldHi, fontStyle: "italic" }}>Bespoke</em>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(243,236,224,0.62)" }}>
              <span style={{ color: "#f3ece0", fontWeight: 600 }}>{usd(pl, BESPOKE_FACTS.regularPrice)}</span>
            </div>
          </div>
          <button
            onClick={handleCTA}
            style={{
              background: T.gold, color: T.dark, border: "none",
              padding: "12px 18px", borderRadius: 2, cursor: "pointer",
              fontFamily: SANS, fontWeight: 600, fontSize: 12,
              letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap",
            }}
          >
            {b.stickyReserve}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPageBespoke;
