import { useEffect, useState, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { pushGtmEvent } from "@/lib/gtm";
import { REF_PRODUCTS, refProductBySlug, type RefProduct, type RefImage } from "@/data/reference-products";

const NotFound = lazy(() => import("@/pages/NotFound.tsx"));

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
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SITE_URL = "https://woolet.co";
/** Render images from the same origin so they resolve in preview and on the live domain. */
const rel = (src: string) => src.replace(SITE_URL, "");

/* ---------------- Gallery ---------------- */

const Gallery = ({ images, name }: { images: RefImage[]; name: string }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    images.forEach((im) => { const p = new Image(); p.src = im.src; });
  }, [images]);

  const go = (d: number) => setI((v) => (v + d + images.length) % images.length);
  const active = images[i];
  if (!active) return null;

  const arrow: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 40, height: 40, borderRadius: 2,
    border: "1px solid rgba(216,184,106,0.35)", background: "rgba(8,8,7,0.55)",
    color: "#EDE7D9", fontFamily: SANS, fontSize: 16, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  };

  return (
    <div>
      <div style={{ position: "relative", background: T.dark, aspectRatio: "1 / 1", border: `1px solid ${T.hairStrong}` }}>
        <img
          src={rel(active.src)}
          alt={active.alt}
          loading="eager"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} style={{ ...arrow, left: 12 }}>‹</button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} style={{ ...arrow, right: 12 }}>›</button>
          </>
        )}
      </div>

      <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: T.inkMute }}>
        {active.caption} · {name}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {images.map((im, idx) => (
            <button
              key={im.src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={im.caption}
              style={{
                width: 64, height: 64, padding: 0, cursor: "pointer",
                background: T.dark,
                border: idx === i ? `1px solid ${T.gold}` : `1px solid ${T.hairStrong}`,
                outline: idx === i ? `1px solid ${T.gold}` : "none",
                outlineOffset: 1,
              }}
            >
              <img src={rel(im.src)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- Page ---------------- */

const modelLabel: Record<RefProduct["model"], string> = {
  "007": "007",
  "009": "009",
  "003": "003",
  bespoke: "Bespoke",
};

const firstSlugForModel = (m: RefProduct["model"]) =>
  REF_PRODUCTS.find((p) => p.model === m)?.slug ?? "";

const RefProductPage = () => {
  const { slug = "" } = useParams();
  const product = refProductBySlug(slug);

  useEffect(() => {
    if (product) pushGtmEvent("view_item", { item_name: product.name, page: "ref_" + slug });
  }, [product, slug]);

  if (!product) return <NotFound />;

  const canonical = `${SITE_URL}/en/ref/${product.slug}`;
  const hero = product.images[0];
  const isBespoke = product.model === "bespoke";
  const swatches = [product.slug, ...product.siblings]
    .map((s) => refProductBySlug(s))
    .filter(Boolean) as RefProduct[];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((im) => im.src),
    description: product.intro,
    brand: { "@type": "Brand", name: "Woolet" },
    color: product.colour,
    material: "Mazzucchelli acetate",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.priceUsd,
      availability: product.model === "003" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      url: canonical,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
      { "@type": "ListItem", position: 2, name: "Frames", item: `${SITE_URL}/en/collection` },
      { "@type": "ListItem", position: 3, name: product.name, item: canonical },
    ],
  };

  const label: React.CSSProperties = {
    fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em",
    textTransform: "uppercase", color: T.goldDim,
  };
  const h2: React.CSSProperties = {
    fontFamily: SERIF, fontSize: 24, lineHeight: 1.15, color: T.ink,
    margin: "0 0 14px", fontWeight: 400,
  };

  const otherModels = (["007", "009", "003", "bespoke"] as RefProduct["model"][]).filter((m) => m !== product.model);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{product.metaTitle}</title>
        <meta name="description" content={product.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.metaTitle} />
        <meta property="og:description" content={product.metaDescription} />
        <meta property="og:image" content={hero.src} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <Navbar />

      <div style={{ background: T.dark, borderBottom: "1px solid rgba(216,184,106,0.10)" }}>
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "10px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(243,236,224,0.55)" }}>
          <Link to="/en" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <Link to="/en/collection" style={{ color: "inherit", textDecoration: "none" }}>Frames</Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>/</span>
          <span style={{ color: T.goldHi }}>{product.name}</span>
        </div>
      </div>

      <main style={{ background: T.canvas, color: T.ink, fontFamily: SANS, paddingBottom: 80 }}>
        <div className="mx-auto" style={{ maxWidth: 1240, padding: "34px 20px 0" }}>
          <style>{`
            .refGrid { display: grid; grid-template-columns: 1fr; gap: 40px; }
            @media (min-width: 900px) {
              .refGrid { grid-template-columns: 1.05fr 1fr; gap: 64px; align-items: start; }
              .refGalleryCol { position: sticky; top: 24px; }
            }
          `}</style>

          <div className="refGrid">
            <div className="refGalleryCol">
              <Gallery images={product.images} name={product.shortName} />
            </div>

            <div>
              <div style={label}>Reference page · not a checkout</div>

              <h1 style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1.08, fontWeight: 400, margin: "12px 0 10px", color: T.ink }}>
                {product.name}
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: T.inkDim, margin: 0, maxWidth: 520 }}>{product.tagline}</p>

              {product.status === "pre-production" && (
                <div style={{ display: "inline-block", marginTop: 16, padding: "6px 12px", border: `1px solid ${T.gold}`, borderRadius: 2, color: T.goldDim, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Pre-production sample · Sept 2026
                </div>
              )}

              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 26, paddingTop: 22, borderTop: `1px solid ${T.hair}` }}>
                <span style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1 }}>${product.priceUsd}</span>
                <span style={{ fontSize: 13, color: T.inkMute }}>{isBespoke ? "lenses included" : "frame with demo lens"}</span>
              </div>

              {swatches.length > 1 && (
                <div style={{ marginTop: 26 }}>
                  <div style={label}>Colour</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                    {swatches.map((s) => {
                      const current = s.slug === product.slug;
                      return (
                        <Link
                          key={s.slug}
                          to={`/en/ref/${s.slug}`}
                          aria-label={s.colour}
                          title={s.colour}
                          style={{
                            width: 26, height: 26, borderRadius: "50%", background: s.colourDot,
                            border: `1px solid ${T.hairStrong}`,
                            boxShadow: current ? `0 0 0 2px ${T.canvas}, 0 0 0 3px ${T.gold}` : "none",
                            display: "block",
                          }}
                        />
                      );
                    })}
                    <span style={{ fontSize: 13, color: T.inkDim, marginLeft: 4 }}>{product.colour}</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 28, maxWidth: 560 }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: T.ink, margin: "0 0 16px" }}>{product.intro}</p>
                {product.body.map((p) => (
                  <p key={p.slice(0, 40)} style={{ fontSize: 15, lineHeight: 1.6, color: T.inkDim, margin: "0 0 16px" }}>{p}</p>
                ))}
              </div>

              <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${T.hair}` }}>
                <h2 style={h2}>Specifications</h2>
                <dl style={{ margin: 0 }}>
                  {product.specs.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 18, padding: "9px 0", borderBottom: `1px solid ${T.hair}` }}>
                      <dt style={{ flex: "0 0 150px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: T.inkMute }}>{k}</dt>
                      <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: T.ink }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${T.hair}` }}>
                <h2 style={h2}>Lens options</h2>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: T.inkMute, margin: "0 0 16px" }}>
                  {isBespoke
                    ? "All lens types included at $480."
                    : "Frame with demo lens $190. Any lens that does something (sun, blue light, reading) is $210."}
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {product.lensOptions.map((l) => (
                    <li key={l.name} style={{ padding: "12px 0", borderBottom: `1px solid ${T.hair}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
                        <span style={{ fontSize: 14, color: T.ink }}>{l.name}</span>
                        <span style={{ fontFamily: SERIF, fontSize: 17 }}>${l.priceUsd}</span>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.55, color: T.inkMute, marginTop: 4 }}>{l.note}</div>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${T.hair}` }}>
                <div style={{ fontSize: 14, color: T.inkDim }}>
                  See the{" "}
                  {otherModels.map((m, idx) => (
                    <span key={m}>
                      <Link to={`/en/ref/${firstSlugForModel(m)}`} style={{ color: T.ink, textDecoration: "underline" }}>
                        {modelLabel[m]}
                      </Link>
                      {idx < otherModels.length - 1 ? " / " : ""}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Link to="/en/fit" style={{ fontSize: 13, color: T.inkMute, textDecoration: "none" }}>
                    Check your fit in 30 seconds →
                  </Link>
                </div>
              </section>

              <p style={{ marginTop: 34, fontSize: 11.5, lineHeight: 1.6, color: T.inkMute, maxWidth: 520 }}>
                Reference page for partners and creators. Product photography and copy may be used in content about Woolet. Contact support@woolet.co.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default RefProductPage;
