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
import { ColourHero, ColourSwatches, useColourGallery, type FrameColour } from "@/components/ProductColourGallery";
import sqHavana from "@/assets/frames-2026/square-havana.asset.json";
import sqBlack from "@/assets/frames-2026/square-black.asset.json";
import sqCrystal from "@/assets/frames-2026/square-crystal.asset.json";

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
  { id: "havana", name: "Honey tortoise", dot: "#8B5A2B", img: sqHavana.url },
  { id: "black", name: "Piano black", dot: "#141414", img: sqBlack.url },
  { id: "crystal", name: "Crystal", dot: "#E8E4DA", img: sqCrystal.url },
];

const specs: [string, string][] = [
  ["Material", "Mazzucchelli acetate from Milan"],
  ["Frame Width", "158 mm (hinge to hinge)"],
  ["Lens", "54 × 50 mm (soft-square)"],
  ["Bridge", "Keyhole 20 mm"],
  ["Temples", "148 mm, 11° angle"],
  ["Hinges", "5-barrel PVD Gunmetal"],
  ["Rivets", "Double, PVD Gunmetal"],
];

const benefits = [
  "Mazzucchelli acetate from Milan — hand made in EU",
  "158 mm — engineered for 155 mm+ faces",
  "5-barrel PVD Gunmetal hinges — built for years of daily wear",
  "Keyhole bridge 20 mm — zero slipping",
  "Hand polish + bevel cut — not machine polish",
];

const ProductPage009 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = langFromPath(location.pathname);
  const ctx = localeCtx(lang);
  const canonical = `${SITE_URL}/${lang}/products/009`;
  const [showSticky, setShowSticky] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const gallery = useColourGallery("009", launchColors);

  useEffect(() => {
    pushGtmEvent("view_item", { item_name: "Woolet 009", awareness_stage: "most_aware" });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    onScroll();
    const onScrollDepth = (() => {
      let f50 = false, f90 = false;
      return () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        if (!f50 && p >= 0.5) { f50 = true; pushGtmEvent("scroll_50", { page: "pdp_009" }); }
        if (!f90 && p >= 0.9) { f90 = true; pushGtmEvent("scroll_90", { page: "pdp_009" }); }
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
      product_id: "009", item_name: "Woolet 009",
      value: 1, currency: "USD",
    });
    try { sessionStorage.setItem("woolet_lens_pref", "clear"); } catch { /* noop */ }
    window.location.href = "/en/payments?product=009";
  };
  const handleFitQuiz = () => {
    pushGtmEvent("click_fit_quiz", { product_id: "009" });
    navigate("/en/fit");
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{({ en: "Woolet 009 — Soft-Square Acetate Glasses, 158 mm", nl: "Woolet 009 — vierkante acetaatbril, 158 mm", fr: "Woolet 009 — lunettes carrées en acétate, 158 mm" } as Record<string,string>)[lang] ?? "Woolet 009 — Soft-Square Acetate Glasses, 158 mm"}</title>
        <meta name="description" content={({ en: "Soft-square acetate frame, 158 mm wide with 20 mm bridge. Engineered for 155 mm+ faces. Reserve for $1, locks $114 founding price.", nl: "Zachte vierkante acetaatbril, 158 mm breed met 20 mm brug. Voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast.", fr: "Monture carrée douce en acétate, 158 mm de large avec pont 20 mm. Conçue pour les visages de 155 mm+. Réservez pour 1 $ et bloquez le prix fondateur de 114 $." } as Record<string,string>)[lang] ?? "Soft-square acetate frame, 158 mm wide with 20 mm bridge. Engineered for 155 mm+ faces. Reserve for $1, locks $114 founding price."} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/products/009`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE_URL}/nl/products/009`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE_URL}/fr/products/009`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en/products/009`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="Woolet 009 — Soft-Square Acetate Glasses, 158 mm" />
        <meta property="og:description" content="Reserve for $1, refundable. Locks $114 founding price (SRP $190). 158 mm front, 20 mm bridge." />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://woolet.co/og-009.png" />
        <meta property="og:locale" content={lang === "nl" ? "nl_NL" : lang === "fr" ? "fr_FR" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(productJsonLd(lang, { id: "009", name: "Woolet 009", description: "Soft-square acetate frame, 158 mm wide with a 22 mm bridge. Mazzucchelli acetate from Milan, hand made in EU. Engineered for faces 155 mm and wider.", image: "https://woolet.co/og-009.png", price: "114.00", variantOffers: lensOffers(canonical, "114.00", "USD") }))}</script>
        <script type="application/ld+json">{JSON.stringify(productBreadcrumbJsonLd(lang, "Woolet 009", "009"))}</script>
      </Helmet>

      <Navbar />

      <div style={{ background: T.dark, borderBottom: "1px solid rgba(216,184,106,0.10)" }}>
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "10px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(243,236,224,0.55)" }}>
          <Link to={ctx.home} style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <Link to={ctx.collection} style={{ color: "inherit", textDecoration: "none" }}>{ctx.framesLabel}</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <span style={{ color: T.goldHi }}>Woolet 009</span>
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
            <section className="pdp-gallery">
              <ColourHero colour={gallery.active} alt={`Woolet 009 — soft-square acetate glasses in ${gallery.active.name.toLowerCase()}, 158 mm front · 20 mm bridge, wide-face fit`} />
            </section>

            <section style={{ maxWidth: 540 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.gold, boxShadow: `0 0 0 3px rgba(202,164,73,0.18)` }} />
                <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: T.goldDim, fontWeight: 600 }}>
                  4,900+ on the waitlist · Founding run limited to 300 pairs
                </span>
              </div>

              <h1 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(34px, 4vw, 46px)", lineHeight: 1.05, color: T.ink, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                Woolet 009 <em style={{ fontStyle: "italic", color: T.gold }}>Soft-Square</em>
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim, marginBottom: 6, letterSpacing: "0.02em" }}>
                158 mm · Hand made in EU · Mazzucchelli acetate from Milan
              </div>
              <div style={{ marginBottom: 24 }}>
                <button onClick={() => navigate("/en/products/007")} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 13, color: T.goldDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Prefer a round panto? See the Woolet 007 →
                </button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(28px, 3.2vw, 36px)", lineHeight: 1.12, color: T.ink, margin: "0 0 10px", letterSpacing: "-0.005em" }}>
                  Finally, glasses that don't <em style={{ fontStyle: "italic", color: T.gold }}>pinch</em>.
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 15, color: T.inkDim, margin: 0, lineHeight: 1.55 }}>
                  Engineered for faces 155 mm and wider. 158 mm front, 20 mm bridge.
                </p>
              </div>

              <div style={{ padding: "20px 0", borderTop: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}`, margin: "0 0 20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 56, lineHeight: 1, color: T.ink }}>$1</span>
                  <span style={{ fontFamily: SANS, fontSize: 15, color: T.inkDim, letterSpacing: "0.04em" }}>today</span>
                </div>
                <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 14, color: T.inkDim, lineHeight: 1.5 }}>
                  locks your founding price of <strong style={{ color: T.ink }}>$114</strong> — SRP <span style={{ textDecoration: "line-through", color: T.inkMute }}>$190</span> at launch
                </div>
              </div>

              <button onClick={handleReserve} className="pdp-cta" style={{ width: "100%", minHeight: 60, background: T.gold, color: "#1F1B16", border: "none", padding: "18px 0", borderRadius: 2, fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer" }}>
                Reserve your pair — $1
              </button>

              <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>
                Fully refundable, anytime · No further charge today · Founding price locked for good
              </div>

              <div style={{ marginTop: 14 }}>
                <button onClick={handleFitQuiz} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 13, color: T.goldDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Not sure about your size? Check your fit in 30 seconds →
                </button>
              </div>

              <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 12.5, color: T.inkMute, lineHeight: 1.55 }}>
                Prescription, blue-light and polarized options are chosen later — after your frame ships. Nothing extra is charged today.
              </div>

              <ColourSwatches colours={launchColors} index={gallery.index} onSelect={gallery.select} />
            </section>
          </div>
        </div>

        <div className="mx-auto" style={{ maxWidth: 980, padding: "72px 20px 0" }}>

          <section style={{ marginTop: 56 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: T.goldDim, marginBottom: 14 }}>What you get</div>
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

          <section style={{ marginTop: 40, borderTop: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}` }}>
            <button onClick={() => setSpecsOpen((v) => !v)} style={{ width: "100%", background: "none", border: "none", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: T.ink, fontWeight: 600 }}>
                Full specifications & dimensions
              </span>
              <span style={{ fontFamily: SANS, fontSize: 22, color: T.inkDim, lineHeight: 1 }}>{specsOpen ? "–" : "+"}</span>
            </button>
            {specsOpen && (
              <dl style={{ margin: 0, padding: "0 0 20px", display: "grid", gap: 0 }}>
                {specs.map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderTop: `1px solid ${T.hair}` }}>
                    <dt style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim }}>{k}</dt>
                    <dd style={{ margin: 0, fontFamily: SANS, fontSize: 13, color: T.ink, textAlign: "right" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* Lens options */}
          <LensOptions productId="009" specs={specs} framePrice="114" />


          <section style={{ marginTop: 56 }}>
            <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 30, color: T.ink, margin: "0 0 24px", lineHeight: 1.15 }}>
              What happens after your <em style={{ color: T.gold, fontStyle: "italic" }}>$1</em>
            </h3>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {[
                ["Today", "You pay $1. Fully refundable. Your founding price is locked."],
                ["At launch", "We email you. You choose colour, lens type and prescription."],
                ["Q3 2026", "Your frame ships. The $1 is deducted from the final price."],
              ].map(([step, body], i) => (
                <li key={i} style={{ borderTop: `1px solid ${T.gold}`, paddingTop: 16 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: T.goldDim, marginBottom: 8 }}>Step {i + 1} · {step}</div>
                  <div style={{ fontFamily: SANS, fontSize: 14, color: T.ink, lineHeight: 1.55 }}>{body}</div>
                </li>
              ))}
            </ol>
          </section>

          <section style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${T.hair}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/en/products/007")} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 14, color: T.ink, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Prefer a round panto? See the Woolet 007 →
            </button>
            <button onClick={() => navigate("/en/bespoke")} style={{ background: "none", border: "none", padding: 0, fontFamily: SANS, fontSize: 14, color: T.inkDim, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Need a different width? Explore Bespoke →
            </button>
          </section>
        </div>

        <div style={{ borderTop: `1px solid ${T.hair}`, marginTop: 56 }}>
          <ProductFAQ productId="009" />
        </div>
      </main>

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
              <strong style={{ fontWeight: 700 }}>$1 today</strong>
              <span style={{ opacity: 0.7 }}> · locks $114</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,231,217,0.55)", marginTop: 2 }}>Fully refundable</div>
          </div>
          <button onClick={handleReserve} style={{ background: T.gold, color: "#1F1B16", border: "none", padding: "12px 20px", borderRadius: 2, cursor: "pointer", fontFamily: SANS, fontWeight: 700, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Reserve
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage009;
