import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { REF_PRODUCTS } from "@/data/reference-products";

const T = {
  canvas: "#efe9df",
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  dark: "#080807",
  gold: "#CAA449",
  goldHi: "#d8b86a",
  goldDim: "#8A6E2C",
  hair: "rgba(22,20,15,0.10)",
  hairStrong: "rgba(22,20,15,0.18)",
};
const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const rel = (src: string) => src.replace("https://woolet.co", "");
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

const RefIndex = () => (
  <>
    <Helmet>
      <html lang="en" />
      <title>Woolet reference product pages</title>
      <meta name="description" content="Read-only reference product pages for partners and creators. Specs, photography and copy for every Woolet frame." />
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href="https://woolet.co/en/ref" />
    </Helmet>

    <Navbar />

    <div style={{ background: T.dark, borderBottom: "1px solid rgba(216,184,106,0.10)" }}>
      <div className="mx-auto" style={{ maxWidth: 1240, padding: "10px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(243,236,224,0.55)" }}>
        <Link to="/en" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
        <span style={{ color: T.goldHi }}>Reference pages</span>
      </div>
    </div>

    <main style={{ background: T.canvas, color: T.ink, fontFamily: SANS, paddingBottom: 80 }}>
      <div className="mx-auto" style={{ maxWidth: 1240, padding: "40px 20px 0" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: T.goldDim }}>
          Reference pages · not a checkout
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.08, fontWeight: 400, margin: "12px 0 10px" }}>
          Woolet product reference
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: T.inkDim, maxWidth: 560, margin: 0 }}>
          Specs, photography and approved copy for every frame. For partners and creators - no purchase on these pages.
        </p>

        <style>{`
          .refIndexGrid { display: grid; grid-template-columns: repeat(1, minmax(0,1fr)); gap: 28px; margin-top: 40px; }
          @media (min-width: 640px) { .refIndexGrid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
          @media (min-width: 1000px) { .refIndexGrid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
        `}</style>

        <div className="refIndexGrid">
          {REF_PRODUCTS.map((p) => (
            <Link key={p.slug} to={`/en/ref/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ background: T.dark, aspectRatio: "1 / 1", border: `1px solid ${T.hairStrong}` }}>
                <img src={rel(p.images[0].src)} alt={p.images[0].alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.2, marginTop: 12 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: T.inkMute, marginTop: 4 }}>
                {p.model === "box" ? "Included with every pair" : `$${p.priceUsd} · ${p.model === "bespoke" ? "lenses included" : "frame with demo lens"}`}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>

    <Footer />
  </>
);

export default RefIndex;
