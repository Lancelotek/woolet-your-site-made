import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";
import TrustGuarantee from "@/components/TrustGuarantee";
import ProductFAQ from "@/components/ProductFAQ";
import LensUpgradeSelector, { lensLabelFor, type LensOption } from "@/components/LensUpgradeSelector";
import havanaFoundersAsset from "@/assets/woolet-009-havana-founders.png.asset.json";
import havanaFoundersAltAsset from "@/assets/woolet-009-havana-founders-alt.jpeg.asset.json";

const colors009 = [
  { name: "Havana — Founders", dot: "#A56A2E", img: havanaFoundersAsset.url, gallery: [havanaFoundersAsset.url, havanaFoundersAltAsset.url], limited: true },
] as const;

const specs = [
  ["Material", "Italian Mazzucchelli Acetate"],
  ["Frame Width", "158mm (hinge to hinge)"],
  ["Lens", "54 × 50mm (square)"],
  ["Bridge", "Keyhole 22mm"],
  ["Temples", "148mm, 11° angle"],
  ["Hinges", "5-barrel PVD Gunmetal"],
  ["Rivets", "Double, PVD Gunmetal"],
];

const benefits = [
  "Italian Mazzucchelli acetate — cotton, not plastic",
  "158mm — engineered for 155mm+ faces",
  "5-barrel PVD Gunmetal hinges — engineered for years of daily wear",
  "Keyhole bridge 22mm — zero slipping",
  "Hand polish + bevel cut — not machine polish",
];

const ProductPage009 = () => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string>("Havana — Founders");
  const [lens, setLens] = useState<LensOption>("clear");
  const [total, setTotal] = useState(114);
  const selectedColorObj = colors009.find((c) => c.name === selectedColor) || colors009[0];
  const gallery = selectedColorObj.gallery ?? [selectedColorObj.img];
  const [activeImg, setActiveImg] = useState<string>(gallery[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  useEffect(() => { setActiveImg(gallery[0]); }, [selectedColor]);
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightboxOpen]);

  useEffect(() => {
    pushGtmEvent("view_item", {
      item_name: "Woolet 009",
      awareness_stage: "most_aware",
      item_variant: selectedColor,
    });
  }, [selectedColor]);

  // Product JSON-LD lives in src/seo/metadata.ts (prerendered into <head>)
  // — single source of truth, visible to crawlers without JS execution.
  // Do not duplicate it here.




  const handleCTA = () => {
    pushGtmEvent("click_reserve", {
      product_id: "009",
      item_name: "Woolet 009",
      item_variant: selectedColor,
      lens_option: lens,
      total_price: total,
      value: 1,
      currency: "USD",
    });
    pushGtmEvent("begin_checkout", {
      item_name: "Woolet 009",
      item_variant: selectedColor,
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
        <title>Woolet 009 — Square Acetate Glasses, 158 mm Wide</title>
        <meta name="description" content="Soft-square Italian acetate frame for wide faces. 158 mm front, 22 mm keyhole bridge. $114 pre-order, $190 retail." />
        <link rel="canonical" href="https://woolet.co/en/products/009" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="Woolet 009 — Square Acetate Glasses, 158 mm Wide" />
        <meta property="og:description" content="Soft-square Italian Mazzucchelli acetate frame for wide faces. 158 mm front, 22 mm keyhole bridge. $114 pre-order, $190 retail." />
        <meta property="og:url" content="https://woolet.co/en/products/009" />
        <meta property="og:image" content="https://woolet.co/og-009.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Woolet 009 — Square Acetate Glasses, 158 mm Wide" />
        <meta name="twitter:description" content="Soft-square Italian Mazzucchelli acetate frame for wide faces. 158 mm front, $114 pre-order." />
        <meta name="twitter:image" content="https://woolet.co/og-009.png" />
      </Helmet>

      <main style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        {/* Logo */}
        <div style={{ padding: "12px 16px", background: "#F8F6F1" }}>
          <Link to="/en">
            <img src={wooletLogo} alt="Woolet" style={{ height: 22, width: "auto" }} height={22} />
          </Link>
        </div>

        {/* 1. Main product image */}
        <div style={{ position: "relative", background: "#F8F6F1", padding: "20px 16px 0", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => { setLightboxOpen(true); pushGtmEvent("zoom_product_image", { item_name: "Woolet 009", item_variant: selectedColor }); }}
            aria-label="Zoom image"
            style={{ background: "transparent", border: "none", padding: 0, cursor: "zoom-in", display: "block", width: "100%", maxWidth: 520, position: "relative" }}
          >
            <img
              src={activeImg}
              alt={`Woolet 009 — ${selectedColor}`}
              width={800}
              height={600}
              fetchPriority="high"
              style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
            />
            <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(26,22,18,0.78)", color: "#F0ECE4", fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "1.5px", padding: "5px 9px", borderRadius: 999, textTransform: "uppercase", backdropFilter: "blur(6px)" }}>⤢ Zoom</span>
          </button>
        </div>

        {/* Thumbnail strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "12px 16px 8px" }}>
          {gallery.map((src, i) => (
            <button
              key={src}
              onClick={() => setActiveImg(src)}
              style={{
                width: 56, height: 42, padding: 0, borderRadius: 6, overflow: "hidden", cursor: "pointer",
                border: activeImg === src ? "2px solid #CAA449" : "2px solid #DDD",
                background: "#FFF",
              }}
              aria-label={`View ${selectedColor} angle ${i + 1}`}
            >
              <img src={src} alt={`${selectedColor} ${i + 1}`} width={56} height={42} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </button>
          ))}
        </div>

        {/* 2. Product info */}
        <div style={{
          maxWidth: 480,
          margin: "16px auto 24px",
          padding: "18px 18px 20px",
          background: "#FFFFFF",
          border: "1px solid #E6DFD2",
          borderRadius: 12,
          boxShadow: "0 8px 24px -12px rgba(20,16,8,0.18), 0 2px 6px -2px rgba(20,16,8,0.08)",
        }}>
          {/* Pre-order widget header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px dashed #E6DFD2" }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "2px", color: "#A07A2A", textTransform: "uppercase" }}>Pre-order · Founding Run</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "1.5px", color: "#888", textTransform: "uppercase" }}>Ships Q3 2026</span>
          </div>

          {/* Lens options available */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ background: "#F1ECE1", color: "#3A2E15", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>Rx / Progressive</span>
            <span style={{ background: "#E8EEF6", color: "#1F3A66", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>Blue Light</span>
            <span style={{ background: "#1A1612", color: "#CAA449", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>Polarized Sun</span>
          </div>

          {/* Waitlist count */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888" }}>4,900+ on the waitlist</span>
          </div>

          {/* Founders Edition badge */}
          {selectedColorObj.name === "Havana — Founders" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "4px 10px", background: "linear-gradient(135deg, #1A1612 0%, #2A2218 100%)", border: "1px solid #CAA449", borderRadius: 4 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "2px", color: "#CAA449", textTransform: "uppercase" }}>★ Founders Edition</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 9, letterSpacing: "1px", color: "#E8DCC0", textTransform: "uppercase" }}>· Limited · 100 units only</span>
            </div>
          )}

          {/* Product name */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#111", marginBottom: 4, marginTop: 0 }}>
            Woolet 009 <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#888" }}>— {selectedColorObj.name === "Havana — Founders" ? "Havana" : "Square"}</em>
          </h1>

          {/* Price — $1 deposit today, $114 guaranteed at Kickstarter */}
          <div style={{ margin: "8px 0 14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 28, color: "#111", lineHeight: 1 }}>$1</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>today · refundable deposit</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#FDF6EB", border: "1px solid #EFE2C8", borderRadius: 6 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "1.5px", color: "#A07A2A", textTransform: "uppercase" }}>Locks in</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 13, color: "#BBB", textDecoration: "line-through" }}>$190</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 18, color: "#A07A2A" }}>$114</span>
              <span style={{ background: "#CAA449", color: "#080807", padding: "2px 8px", borderRadius: 3, fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "1px" }}>−40%</span>
            </div>
            <div style={{ marginTop: 6, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", lineHeight: 1.5 }}>
              Early-bird price guaranteed at Kickstarter launch. SRP $190 after.
            </div>
          </div>

          {total > 114 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "-4px 0 14px", fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#444" }}>
              <span style={{ letterSpacing: "1.5px", textTransform: "uppercase", fontSize: 9, color: "#888" }}>Your locked-in total</span>
              <span style={{ fontWeight: 600, color: "#A07A2A", fontSize: 15 }}>${total}</span>
              <span style={{ color: "#888" }}>· {lensLabelFor(lens)}</span>
            </div>
          )}


          {/* Model selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "2px", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>MODEL</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ border: "2px solid #A07A2A", background: "#FDF6EB", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 12, color: "#111", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>
                009 Square
              </button>
            </div>
          </div>

          {/* Color selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "2px", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>
              COLOR: <span style={{ color: "#111" }}>{selectedColor}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {colors009.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    width: 26, height: 26, borderRadius: "50%", background: c.dot, cursor: "pointer", padding: 0,
                    border: selectedColor === c.name ? "3px solid #A07A2A" : "3px solid transparent",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Lens upgrade selector */}
          <LensUpgradeSelector
            productId="009"
            basePrice={114}
            onChange={(opt, t) => { setLens(opt); setTotal(t); }}
          />

          {/* Benefits */}
          <div style={{ background: "#1A1612", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < benefits.length - 1 ? 6 : 0 }}>
                <span style={{ color: "#CAA449", fontSize: 12, flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#CCC", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Trust & Guarantee */}
          <TrustGuarantee productId="009" />

          {/* Primary CTA */}
          <button onClick={handleCTA} style={{ width: "100%", background: "#CAA449", color: "#080807", border: "none", padding: "15px 0", borderRadius: 5, fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", marginBottom: 8 }}>
            RESERVE FOR $1 — LOCK $114 (−40%) →
          </button>

          {/* Free shipping line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10, padding: "6px 10px", background: "#FDF6EB", border: "1px solid #EFE2C8", borderRadius: 5 }}>
            <span aria-hidden style={{ fontSize: 12, color: "#A07A2A" }}>✈</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: "1.5px", color: "#A07A2A", textTransform: "uppercase" }}>Free worldwide shipping</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A6A45" }}>· tracked & insured</span>
          </div>

          {/* Secondary CTA */}
          <button onClick={() => navigate("/en/fit")} style={{ width: "100%", background: "transparent", color: "#444", border: "2px solid #DDD", padding: "12px 0", borderRadius: 5, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, cursor: "pointer", marginBottom: 14 }}>
            Check your fit (quiz)
          </button>

          {/* Trust footer */}
          <div style={{ display: "flex" }}>
            {["Secure Payment", "Free Shipping", "30-Day Returns"].map((t, i) => (
              <div key={i} style={{ flex: 1, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 9, color: "#AAA", textAlign: "center", padding: "0 4px", lineHeight: 1.4 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* 3. Spec table */}
        <div style={{ background: "#1A1612", padding: "16px 20px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#7A7570", textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>Specifications</h2>
            {specs.map(([key, val], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < specs.length - 1 ? "1px solid #2A2520" : "none", fontSize: 11 }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "#7A7570" }}>{key}</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, color: "#F8F8F6", textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. FAQ */}
        <ProductFAQ productId="009" />
      </main>

    </>
  );
};

export default ProductPage009;
