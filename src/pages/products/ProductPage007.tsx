import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";
import TrustGuarantee from "@/components/TrustGuarantee";
import ProductFAQ from "@/components/ProductFAQ";

const colors007 = [
  { name: "Dark Tortoise", dot: "#5C3317", img: "https://images.unsplash.com/photo-1574258495973-c54d73bfec77?w=700&q=80&auto=format&fit=crop" },
  { name: "Black", dot: "#141414", img: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=700&q=80&auto=format&fit=crop" },
  { name: "Honey", dot: "#C8832A", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&q=80&auto=format&fit=crop" },
  { name: "Crystal", dot: "#D8D8DE", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&q=80&auto=format&fit=crop" },
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
      offers: { "@type": "Offer", price: "499", priceCurrency: "PLN", availability: "https://schema.org/PreOrder", priceValidUntil: "2026-12-31", itemCondition: "https://schema.org/NewCondition" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "4900" },
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
    pushGtmEvent("add_to_cart", { item_name: "Woolet 007" });
    navigate("/en#waitlist");
  };

  return (
    <>
      <Helmet>
        <title>Woolet 007 — Premium Wide-Fit Acetate Eyewear (158mm) | Woolet</title>
        <meta name="description" content="Woolet 007 — round panto frames in Italian Mazzucchelli acetate for 158mm+ faces. PVD Gunmetal hinges, 21mm keyhole bridge. Founding Member: €189." />
        <link rel="canonical" href="https://woolet.co/en/products/007" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
        {/* Logo */}
        <div style={{ padding: "12px 16px", background: "#F8F6F1" }}>
          <Link to="/en">
            <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
          </Link>
        </div>

        {/* 1. Main image */}
        <div style={{ position: "relative", overflow: "hidden", height: 240 }}>
          <img
            src={selectedColorObj.img}
            alt={`Woolet 007 — ${selectedColor}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,7,0.5), transparent 55%)" }} />

          <span style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 14, color: "#CAA449", letterSpacing: "3px" }}>
            WOOLET
          </span>
          <span style={{ position: "absolute", bottom: 14, right: 16, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "1.5px" }}>
            007 · {selectedColor.toUpperCase()}
          </span>

          {/* Thumbnail strip */}
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {colors007.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                style={{
                  width: 28, height: 28, padding: 0, borderRadius: 4, overflow: "hidden", cursor: "pointer",
                  border: selectedColor === c.name ? "2px solid #CAA449" : "2px solid rgba(255,255,255,0.3)",
                  background: "none",
                }}
              >
                <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        </div>

        {/* 2. Product info */}
        <div style={{ padding: "14px 16px 24px" }}>
          {/* Trust badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ background: "#FFF3E0", color: "#7A3800", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>Selling Fast</span>
            <span style={{ background: "#E8F5E9", color: "#1B5E20", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>Mazzucchelli</span>
            <span style={{ background: "rgba(202,164,73,0.1)", color: "#A07A2A", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>PVD Gunmetal</span>
          </div>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 8 }}>
            {[...Array(5)].map((_, i) => (<span key={i} style={{ color: "#CAA449", fontSize: 11 }}>★</span>))}
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", marginLeft: 5 }}>4.9 · 4,900+ reviews</span>
          </div>

          {/* Product name */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#111", marginBottom: 4, marginTop: 0 }}>
            Woolet 007 <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#888" }}>— Panto / Round</em>
          </h1>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 14px" }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 22, color: "#A07A2A" }}>€189</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 14, color: "#BBB", textDecoration: "line-through" }}>€239</span>
            <span style={{ background: "#CAA449", color: "#080807", padding: "2px 8px", borderRadius: 3, fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9 }}>FOUNDING −€50</span>
          </div>

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
            JOIN AS FOUNDING MEMBER →
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
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#7A7570", textTransform: "uppercase", marginBottom: 10 }}>
              Specifications
            </div>
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
      </div>
    </>
  );
};

export default ProductPage007;
