import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFAQ from "@/components/ProductFAQ";
import LensUpgradeSelector, { lensLabelFor, type LensOption } from "@/components/LensUpgradeSelector";
import wooletHavanaFrontAsset from "@/assets/woolet-009-havana-front.png.asset.json";
import wooletBlackAsset from "@/assets/woolet-009-black.png.asset.json";
import wooletGreyAsset from "@/assets/woolet-009-grey.png.asset.json";
import wooletTaupeAsset from "@/assets/woolet-009-taupe.png.asset.json";

/* ---------- shared tokens (match 5-reasons + homepage) ---------- */
const T = {
  canvas: "#efe9df",
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  dark: "#0b0a09",
  darkPanel: "#141210",
  gold: "#c2a05a",
  goldHi: "#d8b86a",
  hair: "rgba(22,20,15,0.10)",
  hairStrong: "rgba(22,20,15,0.18)",
};
const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

const gallery009 = [
  wooletHavanaFrontAsset.url,
  wooletBlackAsset.url,
  wooletGreyAsset.url,
  wooletTaupeAsset.url,
];

const specs: [string, string][] = [
  ["Material", "Italian Mazzucchelli Acetate"],
  ["Frame Width", "158 mm (hinge to hinge)"],
  ["Lens", "54 × 50 mm (square)"],
  ["Bridge", "Keyhole 22 mm"],
  ["Temples", "148 mm, 11° angle"],
  ["Hinges", "5-barrel PVD Gunmetal"],
  ["Rivets", "Double, PVD Gunmetal"],
];

const benefits = [
  "Italian Mazzucchelli acetate — cotton, not plastic",
  "158 mm — engineered for 155 mm+ faces",
  "5-barrel PVD Gunmetal hinges — built for years of daily wear",
  "Keyhole bridge 22 mm — zero slipping",
  "Hand polish + bevel cut — not machine polish",
];

const guarantees: [string, string][] = [
  ["30-Day Returns", "No questions asked. Full refund if the frames don't meet expectations."],
  ["Fit Guarantee", "Take the fit quiz — if the result fits but the frame doesn't, free exchange."],
  ["Mazzucchelli Since 1849", "Italian acetate used by Tom Ford and Oliver Peoples."],
  ["Free Shipping + Insurance", "Insured courier delivery with real-time tracking."],
];

const ProductPage009 = () => {
  const navigate = useNavigate();
  const colorName = "Havana — Founders";
  const [activeImg, setActiveImg] = useState<string>(gallery009[0]);
  const [lens, setLens] = useState<LensOption>("clear");
  const [total, setTotal] = useState(114);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    pushGtmEvent("view_item", {
      item_name: "Woolet 009",
      awareness_stage: "most_aware",
      item_variant: colorName,
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
      product_id: "009",
      item_name: "Woolet 009",
      item_variant: colorName,
      lens_option: lens,
      total_price: total,
      value: 1,
      currency: "USD",
    });
    pushGtmEvent("begin_checkout", {
      item_name: "Woolet 009",
      item_variant: colorName,
      lens_option: lens,
      total_price: total,
      value: 1,
      currency: "USD",
    });
    try { sessionStorage.setItem("woolet_lens_pref", lens); } catch { /* noop */ }
    window.location.href = "/en/payments?product=009";
  };

  return (
    <>
      <Helmet>
        <title>Woolet 009 — Square Acetate Glasses, 158 mm</title>
        <meta name="description" content="Square Italian acetate frame, 158 mm wide with 22 mm bridge. Engineered for 155 mm+ faces. From $114 pre-order." />
        <link rel="canonical" href="https://woolet.co/en/products/009" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="Woolet 009 — Square Acetate Glasses, 158 mm" />
        <meta property="og:description" content="Square Italian Mazzucchelli acetate frame, 158 mm wide with a 22 mm keyhole bridge. From $114 pre-order." />
        <meta property="og:url" content="https://woolet.co/en/products/009" />
        <meta property="og:image" content="https://woolet.co/og-009.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Woolet 009 — Square Acetate Glasses",
          sku: "WOOLET-009",
          mpn: "WOOLET-009",
          brand: { "@type": "Brand", name: "Woolet" },
          category: "Eyewear > Prescription Glasses",
          description: "Square Italian Mazzucchelli acetate frame, 158 mm wide with a 22 mm keyhole bridge. Engineered for 155 mm+ faces. Hand-polished in the EU.",
          image: gallery009,
          material: "Italian Mazzucchelli 1849 cotton acetate",
          color: ["Havana", "Black", "Grey", "Taupe"],
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: "114",
            highPrice: "190",
            offerCount: 4,
            availability: "https://schema.org/PreOrder",
            url: "https://woolet.co/en/products/009",
            seller: { "@type": "Organization", name: "Woolet" },
          },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
            { "@type": "ListItem", position: 2, name: "Collection", item: "https://woolet.co/en/collection" },
            { "@type": "ListItem", position: 3, name: "Woolet 009", item: "https://woolet.co/en/products/009" },
          ],
        })}</script>
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
          <Link to="/en" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <Link to="/en/collection" style={{ color: "inherit", textDecoration: "none" }}>Frames</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <span style={{ color: T.goldHi }}>Woolet 009</span>
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
            .pdp-thumb:focus-visible, .pdp-swatch:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 3px; }
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
                  alt={`Woolet 009 — soft-square Italian acetate glasses in ${colorName}, 158 mm front · 22 mm keyhole bridge, wide-face fit`}
                  width={800}
                  height={600}
                  fetchPriority="high"
                  style={{ width: "100%", maxWidth: 560, height: "auto", objectFit: "contain", display: "block" }}
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {gallery009.map((src, i) => {
                  const active = activeImg === src;
                  return (
                    <button
                      key={src}
                      onClick={() => setActiveImg(src)}
                      className="pdp-thumb"
                      aria-label={`View ${i + 1}`}
                      style={{
                        width: 84, height: 64, flexShrink: 0, padding: 6,
                        background: "#f3ece0",
                        border: `1px solid ${active ? T.gold : T.hair}`,
                        boxShadow: active ? `inset 0 0 0 1px ${T.gold}` : "none",
                        borderRadius: 3, cursor: "pointer",
                      }}
                    >
                      <img src={src} alt={`Woolet 009 wide-fit square acetate glasses — view ${i + 1}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* RIGHT — Buy panel */}
            <section style={{ maxWidth: 520 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {["Rx / Progressive", "Blue Light", "Polarized Sun"].map((tag) => (
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
                }}>· 4,900+ on the waitlist</span>
              </div>

              <div style={{
                fontFamily: SANS, fontSize: 11, letterSpacing: "0.28em",
                textTransform: "uppercase", color: T.gold, marginBottom: 10,
              }}>
                Pre-order · Founders Edition · Ships Q3 2026
              </div>

              <h1 style={{
                fontFamily: SERIF, fontWeight: 300,
                fontSize: "clamp(34px, 4vw, 46px)", lineHeight: 1.05,
                color: T.ink, margin: "0 0 6px", letterSpacing: "-0.01em",
              }}>
                Woolet 009 <em style={{ fontStyle: "italic", color: T.gold }}>Square</em>
              </h1>
              <div style={{ fontFamily: SANS, fontSize: 14, color: T.inkDim, marginBottom: 10 }}>
                Square · 158 mm · {colorName}
              </div>
              <h2 style={{
                fontFamily: SANS, fontWeight: 500, fontSize: 13,
                letterSpacing: "0.04em", color: T.inkDim,
                margin: "0 0 22px", lineHeight: 1.5,
              }}>
                Wide-fit soft-square acetate glasses engineered for faces 155&nbsp;mm and above — 158&nbsp;mm front, 22&nbsp;mm keyhole bridge, Italian Mazzucchelli acetate.
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
                }}>Founding Price</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 48, lineHeight: 1, color: T.ink }}>$114</span>
                  <span style={{ fontFamily: SANS, fontSize: 18, color: T.inkMute, textDecoration: "line-through" }}>$190</span>
                  <span style={{
                    background: T.gold, color: T.dark, fontFamily: SANS, fontWeight: 600,
                    fontSize: 11, letterSpacing: "0.14em", padding: "4px 9px", borderRadius: 2,
                  }}>−40%</span>
                </div>
                <div style={{
                  marginTop: 10, fontFamily: SANS, fontSize: 13, color: T.inkDim, lineHeight: 1.55,
                }}>
                  Reserve today for <strong style={{ color: T.ink }}>$1</strong> — fully refundable deposit. Locks in the founding price; SRP $190 at launch.
                </div>
                {total > 114 && (
                  <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 13, color: T.inkDim }}>
                    Your locked-in total: <strong style={{ color: T.gold }}>${total}</strong> · {lensLabelFor(lens)}
                  </div>
                )}
              </div>

              {/* Model toggle */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.inkMute, marginBottom: 8,
                }}>Model</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/en/products/007")}
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
                    style={{
                      flex: "1 1 120px", padding: "11px 14px", cursor: "pointer",
                      background: T.canvas, color: T.ink,
                      border: `1px solid ${T.gold}`,
                      boxShadow: `inset 0 0 0 1px ${T.gold}`,
                      fontFamily: SERIF, fontSize: 16,
                    }}
                  >
                    009 <em style={{ color: T.gold, fontStyle: "italic" }}>Square</em>
                  </button>
                  <button
                    onClick={() => navigate("/en/products/bespoke")}
                    style={{
                      flex: "1 1 120px", padding: "11px 14px", cursor: "pointer",
                      background: "transparent", color: T.inkDim,
                      border: `1px solid ${T.hairStrong}`,
                      fontFamily: SERIF, fontSize: 16,
                    }}
                  >
                    Bespoke
                  </button>
                </div>
              </div>

              {/* Color (single founders) */}
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: T.inkMute, marginBottom: 10,
                }}>
                  Color — <span style={{ color: T.ink, letterSpacing: "0.06em" }}>Havana</span>
                  <span style={{ color: T.gold, marginLeft: 10 }}>Founders edition</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span
                    aria-label="Havana"
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "#8B4513", display: "inline-block",
                      boxShadow: `0 0 0 2px ${T.gold}, 0 2px 4px rgba(0,0,0,0.18)`,
                    }}
                  />
                </div>
              </div>

              {/* Lenses */}
              <div style={{ marginBottom: 22 }}>
                <LensUpgradeSelector
                  productId="009"
                  basePrice={114}
                  onChange={(opt, t) => { setLens(opt); setTotal(t); }}
                />
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
                Reserve for $1 — Lock $114
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
                Check your fit — Free quiz
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
                }}>Specifications</div>
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
                }}>Woolet Guarantee</div>
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
                  to="/en#collection"
                  style={{
                    fontFamily: SANS, fontSize: 12, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: T.inkDim, textDecoration: "none",
                    borderBottom: `1px solid ${T.hairStrong}`, paddingBottom: 2,
                  }}
                >
                  ← Back to collection
                </Link>
              </div>
            </section>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.hair}` }}>
          <ProductFAQ productId="009" />
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
              Woolet 009 <em style={{ color: T.goldHi, fontStyle: "italic" }}>Square</em>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(243,236,224,0.62)" }}>
              <span style={{ color: "#f3ece0", fontWeight: 600 }}>$114</span>
              <span style={{ textDecoration: "line-through", margin: "0 6px" }}>$190</span>
              <span style={{ color: T.goldHi }}>−40%</span>
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
            Reserve for $1
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage009;
