import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { langFromPath, productBreadcrumbJsonLd, productJsonLd, SITE_URL, localeCtx } from "@/seo/product-collection-jsonld";
import { pushGtmEvent } from "@/lib/gtm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFAQ from "@/components/ProductFAQ";
import LensOptions from "@/components/LensOptions";
import { lensOffers } from "@/data/lensOptions";
import { ColourSwatches, useColourGallery, type FrameColour } from "@/components/ProductColourGallery";
import ProductGalleryStage from "@/components/ProductGalleryStage";
import { PDP_COPY, pdpLang, usd } from "@/i18n/productPageCopy";
import imgHavana from "@/assets/frames-2026/oval-havana.asset.json";
import imgBlackAsset from "@/assets/frames-2026/oval-black.asset.json";
import imgCrystal from "@/assets/frames-2026/oval-crystal.asset.json";

const T = {
  canvas: "#efe9df",
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  dark: "#080807",
  darkText: "#EDE7D9",
  gold: "#CAA449",
  goldHi: "#d8b86a",
  goldDim: "#8A6E2C",
  hair: "rgba(22,20,15,0.10)",
  hairStrong: "rgba(22,20,15,0.18)",
};
const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

const launchColors: FrameColour[] = [
  { id: "havana", name: "Honey tortoise", dot: "#8B5A2B", img: imgHavana.url },
  { id: "black", name: "Piano black", dot: "#141414", img: imgBlackAsset.url },
  { id: "crystal", name: "Crystal", dot: "#E8E4DA", img: imgCrystal.url },
];

const ProductPage007 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = langFromPath(location.pathname);
  const ctx = localeCtx(lang);
  const canonical = `${SITE_URL}/${lang}/products/007`;
  const gallery = useColourGallery("007", launchColors);
  const pl = pdpLang(lang);
  const c = PDP_COPY[pl];
  const m = c.models["007"];
  const specs = m.specs;
  const enSpecs = PDP_COPY.en.models["007"].specs;
  const benefits = m.benefits;
  const localColours = launchColors.map((col) => ({ ...col, name: c.colourNames[col.id] ?? col.name }));
  const activeColourName = c.colourNames[gallery.active.id] ?? gallery.active.name;
  const productPath = (id: string) => (pl === "en" ? `/en/products/${id}` : `/${lang}/products/${id}`);
  const [showSticky, setShowSticky] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  useEffect(() => {
    pushGtmEvent("view_item", { item_name: "Woolet 007", awareness_stage: "most_aware" });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    onScroll();
    const onScrollDepth = (() => {
      let f50 = false, f90 = false;
      return () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        if (!f50 && p >= 0.5) { f50 = true; pushGtmEvent("scroll_50", { page: "pdp_007" }); }
        if (!f90 && p >= 0.9) { f90 = true; pushGtmEvent("scroll_90", { page: "pdp_007" }); }
      };
    })();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScrollDepth, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScrollDepth);
    };
  }, []);

  const handleReserve = () => {
    pushGtmEvent("click_reserve", {
      product_id: "007", item_name: "Woolet 007",
      value: 1, currency: "USD",
    });
    try { sessionStorage.setItem("woolet_lens_pref", "clear"); } catch { /* noop */ }
    window.location.href = "/en/payments?product=007";
  };
  const handleFitQuiz = () => {
    pushGtmEvent("click_fit_quiz", { product_id: "007" });
    navigate("/en/fit");
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{m.title}</title>
        <meta name="description" content={m.metaDescription} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/products/007`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE_URL}/nl/products/007`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE_URL}/fr/products/007`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en/products/007`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={m.title} />
        <meta property="og:description" content={m.ogDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://woolet.co/og-007.png" />
        <meta property="og:locale" content={lang === "nl" ? "nl_NL" : lang === "fr" ? "fr_FR" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(productJsonLd(lang, { id: "007", name: "Woolet 007", description: m.jsonLdDescription, image: "https://woolet.co/og-007.png", price: "114.00", variantOffers: lensOffers(canonical, "114.00", "USD") }))}</script>
        <script type="application/ld+json">{JSON.stringify(productBreadcrumbJsonLd(lang, "Woolet 007", "007"))}</script>
      </Helmet>

      <Navbar />

      <div style={{ background: T.dark, borderBottom: "1px solid rgba(216,184,106,0.10)" }}>
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "10px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(243,236,224,0.55)" }}>
          <Link to={ctx.home} style={{ color: "inherit", textDecoration: "none" }}>{ctx.homeLabel}</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <Link to={ctx.collection} style={{ color: "inherit", textDecoration: "none" }}>{ctx.framesLabel}</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <span style={{ color: T.goldHi }}>Woolet 007</span>
        </div>
      </div>

      <main style={{ background: T.canvas, color: T.ink, fontFamily: SANS, boxShadow: "inset 0 1px 0 rgba(216,184,106,0.18), inset 0 12px 28px -22px rgba(11,10,9,0.65)", paddingBottom: 80 }}>
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "28px 20px 0" }}>
          <style>{`
            @media (min-width: 900px) {
              .pdp-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) !important; gap: 56px !important; }
              .pdp-gallery { position: sticky; top: 88px; align-self: start; }
              .pdp-hero-img { max-height: none !important; }
            }
            @media (max-width: 899px) {
              .pdp-hero-wrap { max-height: 40vh; padding: 20px !important; }
              .pdp-hero-img { max-height: calc(40vh - 40px); }
            }
            .pdp-cta:hover { filter: brightness(1.04); }
          `}</style>

          <div className="pdp-grid grid" style={{ gap: 40, gridTemplateColumns: "minmax(0,1fr)" }}>
            {/* GALLERY */}
            <section className="pdp-gallery">
              <ProductGalleryStage model="007" colourId={gallery.active.id} colourName={activeColourName} lang={pl} />
            </section>

            {/* BUY PANEL */}
            <section style={{ maxWidth: 540 }}>
              {/* a) Scarcity bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.gold, boxShadow: `0 0 0 3px rgba(202,164,73,0.18)` }} />
                <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDim, fontWeight: 600 }}>
                  {c.scarcity}
                </span>
              </div>

              {/* b) Name */}
              <h1 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(34px, 4vw, 46px)", lineHeight: 1.05, color: T.ink, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                Woolet 007 <em style={{ fontStyle: "italic", color: T.gold }}>{m.shapeEm}</em>
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim, marginBottom: 6, letterSpacing: "0.02em" }}>
                {c.subline}
              </div>
              <div style={{ marginBottom: 24 }}>
                <button onClick={() => navigate(productPath("009"))} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 13, color: T.goldDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {m.crossLink}
                </button>
              </div>

              {/* c) Fit-first headline */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(28px, 3.2vw, 36px)", lineHeight: 1.12, color: T.ink, margin: "0 0 10px", letterSpacing: "-0.005em" }}>
                  {c.headlinePre}<em style={{ fontStyle: "italic", color: T.gold }}>{c.headlineEm}</em>{c.headlinePost}
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 15, color: T.inkDim, margin: 0, lineHeight: 1.55 }}>
                  {m.intro}
                </p>
              </div>

              {/* d) Price block — two numbers */}
              <div style={{ padding: "20px 0", borderTop: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}`, margin: "0 0 20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 56, lineHeight: 1, color: T.ink }}>{usd(pl, 1)}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15, color: T.inkDim, letterSpacing: "0.04em" }}>{c.today}</span>
                </div>
                <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 14, color: T.inkDim, lineHeight: 1.5 }}>
                  {c.locksPre}<strong style={{ color: T.ink }}>{usd(pl, 114)}</strong>{c.locksMid}<span style={{ textDecoration: "line-through", color: T.inkMute }}>{usd(pl, 190)}</span>{c.locksPost}
                </div>
              </div>

              {/* e) Primary CTA */}
              <button onClick={handleReserve} className="pdp-cta" style={{ width: "100%", minHeight: 60, background: T.gold, color: "#1F1B16", border: "none", padding: "18px 0", borderRadius: 2, fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}>
                {c.cta}
              </button>

              {/* f) Trust microcopy */}
              <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>
                {c.trust}
              </div>

              {/* g) Fit quiz link */}
              <div style={{ marginTop: 14 }}>
                <button onClick={handleFitQuiz} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 13, color: T.goldDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {c.fitQuiz}
                </button>
              </div>

              {/* h) Lens reassurance */}
              <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 12.5, color: T.inkMute, lineHeight: 1.55 }}>
                {c.lensReassure}
              </div>

              <ColourSwatches
                colours={localColours}
                index={gallery.index}
                onSelect={gallery.select}
                label={c.coloursLabel}
                note={c.coloursNote}
                showLabel={c.showColour}
              />
            </section>
          </div>

          
        </div>

        {/* ============ BELOW THE FOLD ============ */}
        <div className="mx-auto" style={{ maxWidth: 980, padding: "72px 20px 0" }}>

          {/* 1. Feature list */}
          <section style={{ marginTop: 56 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: T.goldDim, marginBottom: 14 }}>{c.whatYouGet}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              {benefits.map((b, i) => (
                <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: T.ink }}>
                  <span aria-hidden style={{ color: T.gold, marginTop: 3, flex: "0 0 auto" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Specs accordion */}
          <section style={{ marginTop: 40, borderTop: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}` }}>
            <button onClick={() => setSpecsOpen((v) => !v)} style={{ width: "100%", background: "none", border: "none", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: T.ink, fontWeight: 600 }}>
                {c.specsTitle}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 22, color: T.inkDim, lineHeight: 1 }}>{specsOpen ? "–" : "+"}</span>
            </button>
            {specsOpen && (
              <dl style={{ margin: 0, padding: "0 0 20px", display: "grid", gap: 0 }}>
                {specs.map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderTop: i === 0 ? `1px solid ${T.hair}` : `1px solid ${T.hair}` }}>
                    <dt style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim }}>{k}</dt>
                    <dd style={{ margin: 0, fontFamily: SANS, fontSize: 13, color: T.ink, textAlign: "right" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* 3b. Lens options */}
          <LensOptions productId="007" specs={enSpecs} framePrice="114" lang={pl} />


          {/* 4. What happens after your $1 */}
          <section style={{ marginTop: 56 }}>
            <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 30, color: T.ink, margin: "0 0 24px", lineHeight: 1.15 }}>
              {c.afterTitlePre}<em style={{ color: T.gold, fontStyle: "italic" }}>{usd(pl, 1)}</em>
            </h3>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {c.steps.map(([step, body], i) => (
                <li key={i} style={{ borderTop: `1px solid ${T.gold}`, paddingTop: 16 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: T.goldDim, marginBottom: 8 }}>{c.stepLabel} {i + 1} · {step}</div>
                  <div style={{ fontFamily: SANS, fontSize: 14, color: T.ink, lineHeight: 1.55 }}>{body}</div>
                </li>
              ))}
            </ol>
          </section>

          {/* 5. Cross-links */}
          <section style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${T.hair}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <button onClick={() => navigate(productPath("009"))} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 14, color: T.ink, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
              {m.crossLink}
            </button>
            <button onClick={() => navigate("/en/bespoke")} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 14, color: T.inkDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
              {c.crossBespoke}
            </button>
          </section>
        </div>

        <div style={{ borderTop: `1px solid ${T.hair}`, marginTop: 56 }}>
          <ProductFAQ productId="007" lang={pl} />
        </div>
      </main>

      {/* Sticky mobile CTA */}
      <div
        aria-hidden={!showSticky}
        className="md:hidden"
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          background: T.dark, borderTop: "1px solid rgba(202,164,73,0.28)",
          transform: showSticky ? "translateY(0)" : "translateY(110%)",
          transition: "transform 260ms ease", zIndex: 60,
          height: 64,
        }}
      >
        <div style={{ padding: "10px 14px calc(10px + env(safe-area-inset-bottom, 0px))", display: "flex", alignItems: "center", gap: 12, height: "100%" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, color: T.darkText, lineHeight: 1.25 }}>
              <strong style={{ fontWeight: 700 }}>{c.stickyToday}</strong>
              <span style={{ opacity: 0.7 }}>{c.stickyLocks}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,231,217,0.55)", marginTop: 2 }}>{c.stickyRefundable}</div>
          </div>
          <button onClick={handleReserve} style={{ background: T.gold, color: "#1F1B16", border: "none", padding: "12px 20px", borderRadius: 2, cursor: "pointer", fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {c.stickyReserve}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage007;
