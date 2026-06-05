import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";
import TrustGuarantee from "@/components/TrustGuarantee";
import ProductFAQ from "@/components/ProductFAQ";
import LensUpgradeSelector, { lensLabelFor, type LensOption } from "@/components/LensUpgradeSelector";
import imgTortoise from "@/assets/woolet-007-dark-tortoise.png";
import imgBlack from "@/assets/woolet-007-black.png";
import imgHoney from "@/assets/woolet-007-honey.png";
import faceBefore from "@/assets/face-before-007.jpg";
import faceAfter from "@/assets/face-after-007.jpg";

const colors007 = [
  { name: "Dark Tortoise", dot: "#5C3317", img: imgTortoise },
  { name: "Black", dot: "#141414", img: imgBlack },
  { name: "Honey", dot: "#C8832A", img: imgHoney },
];

const specs = [
  ["Material", "Italian Mazzucchelli Acetate"],
  ["Frame Width", "158mm (hinge to hinge)"],
  ["Lens", "52 × 52mm (round panto)"],
  ["Bridge", "Keyhole 21mm"],
  ["Temples", "148mm, 11° angle"],
  ["Hinges", "5-barrel PVD Gunmetal"],
  ["Rivets", "Double, PVD Gunmetal"],
];

const benefits = [
  "Italian Mazzucchelli acetate — cotton, not plastic",
  "158mm — engineered for 155mm+ faces",
  "5-barrel PVD Gunmetal hinges — engineered for years of daily wear",
  "Keyhole bridge 21mm — zero slipping",
  "Hand polish + bevel cut — not machine polish",
];

const ProductPage007 = () => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("Dark Tortoise");
  const [lens, setLens] = useState<LensOption>("clear");
  const [total, setTotal] = useState(114);
  const selectedColorObj = colors007.find((c) => c.name === selectedColor) || colors007[0];

  useEffect(() => {
    pushGtmEvent("view_item", {
      item_name: "Woolet 007",
      awareness_stage: "most_aware",
      item_variant: selectedColor,
    });
  }, [selectedColor]);

  useEffect(() => {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Woolet 007 — Wide Fit Round Panto Eyeglasses",
      description: "Premium wide-fit round panto eyeglasses crafted from Italian Mazzucchelli acetate. 158mm frame width designed for faces 155mm and wider. 5-barrel PVD Gunmetal hinges, 21mm keyhole bridge.",
      brand: { "@type": "Brand", name: "Woolet" },
      sku: "WOOLET-007",
      material: "Italian Mazzucchelli Acetate",
      width: { "@type": "QuantitativeValue", value: 158, unitCode: "MMT", name: "Frame width (hinge to hinge)" },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        priceCurrency: "USD",
        price: "114",
        priceValidUntil: "2026-12-31",
        url: "https://woolet.co/en/products/007",
        seller: { "@type": "Organization", name: "Woolet" },
      },
      image: "https://woolet.co/images/woolet-007-dark-tortoise.jpg",
      url: "https://woolet.co/en/products/007",
      additionalProperty: [
        { "@type": "PropertyValue", name: "Lens Width", value: "52mm" },
        { "@type": "PropertyValue", name: "Lens Height", value: "52mm" },
        { "@type": "PropertyValue", name: "Bridge", value: "21mm keyhole" },
        { "@type": "PropertyValue", name: "Temple Length", value: "148mm" },
        { "@type": "PropertyValue", name: "Hinge", value: "5-barrel PVD Gunmetal" },
        { "@type": "PropertyValue", name: "Frame Shape", value: "Round Panto" },
        { "@type": "PropertyValue", name: "Fit", value: "Wide Fit (155mm+ faces)" },
      ],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(productSchema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleCTA = () => {
    pushGtmEvent("begin_checkout", {
      item_name: "Woolet 007",
      item_variant: selectedColor,
      lens_option: lens,
      total_price: total,
      value: 1,
      currency: "USD",
    });
    try { sessionStorage.setItem("woolet_lens_pref", lens); } catch { /* noop */ }
    setShowCheckout(true);
  };

  return (
    <>
      <Helmet>
        <title>Woolet 007 — Round Panto Acetate Glasses, 158 mm</title>
        <meta name="description" content="Round panto Italian acetate frame, 158 mm wide with 21 mm bridge. Engineered for 155 mm+ faces. From $114 pre-order." />
        <link rel="canonical" href="https://woolet.co/en/products/007" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content="Woolet 007 — Round Panto Acetate Glasses, 158 mm" />
        <meta property="og:description" content="Round panto Italian Mazzucchelli acetate frame, 158 mm wide with a 21 mm keyhole bridge. Engineered for 155 mm+ faces. From $114 pre-order." />
        <meta property="og:url" content="https://woolet.co/en/products/007" />
        <meta property="og:image" content="https://woolet.co/og-007.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Woolet 007 — Round Panto Acetate Glasses, 158 mm" />
        <meta name="twitter:description" content="Round panto Italian Mazzucchelli acetate frame, 158 mm wide. From $114 pre-order." />
        <meta name="twitter:image" content="https://woolet.co/og-007.png" />
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
          <img
            src={selectedColorObj.img}
            alt={`Woolet 007 — ${selectedColor}`}
            width={800}
            height={600}
            fetchPriority="high"
            style={{ width: "100%", maxWidth: 520, height: "auto", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Thumbnail strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "12px 16px 8px" }}>
          {colors007.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.name)}
              style={{
                width: 56, height: 42, padding: 0, borderRadius: 6, overflow: "hidden", cursor: "pointer",
                border: selectedColor === c.name ? "2px solid #CAA449" : "2px solid #DDD",
                background: "#FFF",
              }}
            >
              <img src={c.img} alt={c.name} width={56} height={42} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
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

          {/* Product name */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#111", marginBottom: 4, marginTop: 0 }}>
            Woolet 007 <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#888" }}>— Panto / Round</em>
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
                007 Panto
              </button>
              <button
                onClick={() => navigate("/en/products/009")}
                style={{ border: "2px solid #DDD", background: "#FFF", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 12, color: "#111", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}
              >
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
              {colors007.map((c) => (
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
            productId="007"
            basePrice={114}
            onChange={(opt, t) => { setLens(opt); setTotal(t); }}
          />

          {/* Benefits list */}
          <div style={{ background: "#1A1612", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < benefits.length - 1 ? 6 : 0 }}>
                <span style={{ color: "#CAA449", fontSize: 12, flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#CCC", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Trust & Guarantee */}
          <TrustGuarantee productId="007" />

          {/* Primary CTA */}
          <button
            onClick={handleCTA}
            style={{
              width: "100%", background: "#CAA449", color: "#080807", border: "none",
              padding: "15px 0", borderRadius: 5, fontFamily: "'Barlow', sans-serif",
              fontWeight: 500, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", marginBottom: 8,
            }}
          >
            RESERVE FOR $1 — LOCK $114 (−40%) →
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate("/en/fit")}
            style={{
              width: "100%", background: "transparent", color: "#444", border: "2px solid #DDD",
              padding: "12px 0", borderRadius: 5, fontFamily: "'Barlow', sans-serif",
              fontWeight: 300, fontSize: 12, cursor: "pointer", marginBottom: 14,
            }}
          >
            Check your fit (quiz)
          </button>

          {/* Trust footer */}
          <div style={{ display: "flex" }}>
            {["Secure Payment", "30-Day Returns", "Made in Italy"].map((t, i) => (
              <div key={i} style={{ flex: 1, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 9, color: "#AAA", textAlign: "center", padding: "0 4px", lineHeight: 1.4 }}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Spec table */}
        <div style={{ background: "#1A1612", padding: "16px 20px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#7A7570", textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>
              Specifications
            </h2>
            {specs.map(([key, val], i) => (
              <div
                key={i}
                style={{
                  display: "flex", justifyContent: "space-between", padding: "7px 0",
                  borderBottom: i < specs.length - 1 ? "1px solid #2A2520" : "none", fontSize: 11,
                }}
              >
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, color: "#7A7570" }}>{key}</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, color: "#F8F8F6", textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. FAQ */}
        <ProductFAQ productId="007" />
      </main>

      {showCheckout && (
        <StripeCheckoutModal
          priceId={FOUNDING_DEPOSIT_PRICE_ID}
          returnUrl={`${window.location.origin}/en/thank-you?sku=WOOLET-007`}
          metadata={{
            recommended_sku: "WOOLET-007",
            source: "product_page_007",
            color: selectedColor,
            lens_option: lens,
            locked_total: String(total),
          }}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default ProductPage007;
