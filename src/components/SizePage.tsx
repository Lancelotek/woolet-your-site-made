import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FRAME_SPECS,
  SIZES,
  getSizeBySlug,
  ladderLabel,
  getLadderNeighbours,
  type SizeEntry,
  type SizeVerdictKind,
} from "@/data/sizes";
import NotFound from "@/pages/NotFound";
import ClusterSections from "@/components/ClusterSections";
import { SIZE_SECTIONS } from "@/data/size-sections";
import { RETURN_POLICY, shippingDetails, LIST_PRICE_SPEC, PRICE_VALID_UNTIL, SALE_PRICE, PRICE_CURRENCY } from "@/seo/commerce-schema";

const SITE = "https://woolet.co";

const verdictBg: Record<SizeVerdictKind, string> = {
  "signature-range": "#F3EBD5",
  "top-of-bespoke": "#EFE9DF",
  "below-signature": "#EFE9DF",
  "out-of-range": "#F5E6DF",
};

const verdictLabel: Record<SizeVerdictKind, string> = {
  "signature-range": "Signature fit",
  "top-of-bespoke": "Bespoke — top of range",
  "below-signature": "Bespoke",
  "out-of-range": "Outside our range",
};

const productCards = [
  {
    id: "007",
    name: "Woolet 007 — Round",
    blurb: "Round Italian acetate. 158 mm signature, 21 mm keyhole bridge.",
    href: "/en/products/007",
  },
  {
    id: "009",
    name: "Woolet 009 — Soft Square",
    blurb: "Soft-square Italian acetate. 158 mm signature, 22 mm bridge.",
    href: "/en/products/009",
  },
];

function SizePageInner({ size }: { size: SizeEntry }) {
  const path = `/size/${size.slug}`;
  const canonical = `${SITE}/en${path}`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: size.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "Size Guide", item: `${SITE}/en/blog/glasses-for-wide-faces-guide` },
      { "@type": "ListItem", position: 3, name: `${size.width} mm wide glasses`, item: canonical },
    ],
  };

  const productLd = [FRAME_SPECS["007"], FRAME_SPECS["009"]].map((p) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: "Woolet" },
    description: `${p.name} — ${p.frameWidth} mm frame width, ${p.bridge} mm bridge, ${p.lensWidth} × ${p.lensHeight} mm lens, ${p.templeLength} mm temple. Italian Mazzucchelli acetate, hand made in EU.`,
    url: `${SITE}${p.href}`,
    material: "Italian Mazzucchelli cellulose acetate",
    offers: {
      "@type": "Offer",
      price: SALE_PRICE,
      priceCurrency: PRICE_CURRENCY,
      priceValidUntil: PRICE_VALID_UNTIL,
      priceSpecification: LIST_PRICE_SPEC,
      availability: "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      url: `${SITE}${p.href}`,
      seller: { "@type": "Organization", name: "Woolet", url: SITE },
      hasMerchantReturnPolicy: RETURN_POLICY,
      shippingDetails: shippingDetails(false),
    },
  }));

  const { prev, next } = getLadderNeighbours(size.slug);

  const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

  return (
    <>
      <SEO
        title={`${size.width} mm Wide Glasses | Frames That Actually Fit — Woolet`}
        description={size.metaDescription}
        lang="en"
        path={path}
        jsonLd={[breadcrumbLd, faqLd, ...productLd]}
      />
      <Navbar />
      <main
        style={{
          background: "#F8F6F1",
          minHeight: "100vh",
          fontFamily: "'Archivo', 'Barlow', sans-serif",
          color: "#0B0A09",
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{ ...wrap, paddingTop: 16, fontSize: 11, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}
        >
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link to="/en/blog/glasses-for-wide-faces-guide" style={{ color: "#888", textDecoration: "none" }}>Size Guide</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0B0A09" }}>{size.width} mm</span>
        </nav>

        {/* Hero */}
        <header style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ display: "inline-block", background: verdictBg[size.verdictKind], padding: "5px 12px", borderRadius: 2, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#3A2E12", marginBottom: 18 }}>
            {verdictLabel[size.verdictKind]}
          </div>
          <h1
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 40,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              margin: "0 0 14px",
            }}
          >
            {size.h1}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333", margin: "0 0 22px", maxWidth: 620 }}>
            {size.subhead}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Signature 158 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Bespoke 145–172 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Hand made in EU
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <Link
              to="/en/fit"
              style={{
                background: "#CAA449",
                color: "#1F1B16",
                padding: "12px 22px",
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Measure my face with FitLens
            </Link>
            <Link
              to={size.inRange && size.verdictKind === "signature-range" ? "/en/collection" : "/en/fit/bespoke"}
              style={{
                background: "transparent",
                color: "#0B0A09",
                padding: "12px 22px",
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1px solid #0B0A09",
                borderRadius: 2,
              }}
            >
              {size.verdictKind === "signature-range" ? "See the frames" : "Explore bespoke"}
            </Link>
          </div>
        </header>

        {/* Verdict block — the featured-snippet answer */}
        <section aria-labelledby="verdict-heading" style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div
            style={{
              background: "#FFF",
              border: "1px solid #E0D5C5",
              borderLeft: "3px solid #CAA449",
              padding: "22px 24px",
              borderRadius: 4,
            }}
          >
            <h2
              id="verdict-heading"
              style={{
                fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 22,
                margin: "0 0 10px",
                letterSpacing: "-0.2px",
              }}
            >
              Does 158 mm fit a {size.width} mm face?
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#222", margin: 0 }}>
              {size.fitVerdict}
            </p>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", margin: "18px 0 0", maxWidth: 620 }}>
            {size.intro}
          </p>
        </section>

        {/* Spec comparison table */}
        <section aria-labelledby="spec-heading" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="spec-heading"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            Frame specifications — 007 vs 009
          </h2>
          <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 4, background: "#FFF" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E0D5C5", background: "#FBF7EE" }}>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#666", letterSpacing: "1px", textTransform: "uppercase", fontSize: 11 }}>
                    Dimension (mm)
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#0B0A09", letterSpacing: "0.2px", fontSize: 12 }}>
                    007 Round
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#0B0A09", letterSpacing: "0.2px", fontSize: 12 }}>
                    009 Soft Square
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Frame Width", a: FRAME_SPECS["007"].frameWidth, b: FRAME_SPECS["009"].frameWidth },
                  { label: "Bridge", a: FRAME_SPECS["007"].bridge, b: FRAME_SPECS["009"].bridge },
                  { label: "Lens Width", a: FRAME_SPECS["007"].lensWidth, b: FRAME_SPECS["009"].lensWidth },
                  { label: "Lens Height", a: FRAME_SPECS["007"].lensHeight, b: FRAME_SPECS["009"].lensHeight },
                  { label: "Temple Length", a: FRAME_SPECS["007"].templeLength, b: FRAME_SPECS["009"].templeLength },
                  { label: "Temple Drop (°)", a: FRAME_SPECS["007"].templeDrop, b: FRAME_SPECS["009"].templeDrop },
                ].map((r) => (
                  <tr key={r.label} style={{ borderBottom: "1px solid #F0E9DA" }}>
                    <th scope="row" style={{ textAlign: "left", padding: "11px 14px", fontWeight: 500, color: "#555", fontSize: 13 }}>
                      {r.label}
                    </th>
                    <td style={{ padding: "11px 14px", color: "#0B0A09" }}>{r.a}</td>
                    <td style={{ padding: "11px 14px", color: "#0B0A09" }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: "12px 0 0" }}>
            Bespoke: 4 frame shapes, 60 colour and size combinations, any width 145–172 mm, built to measure.
          </p>
        </section>

        {/* How to measure */}
        <section aria-labelledby="measure-heading" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="measure-heading"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            How to measure your face width
          </h2>
          <ol style={{ padding: "0 0 0 22px", margin: 0, color: "#333", fontSize: 14, lineHeight: 1.75 }}>
            <li>Stand square to a mirror. Look straight ahead.</li>
            <li>Hold a ruler flat across your face at eye level, at the widest point (usually just above the ears).</li>
            <li>Read temple-to-temple in millimetres. Or let FitLens do it from your phone camera in 30 seconds.</li>
          </ol>
          <div
            style={{
              marginTop: 20,
              padding: "18px 20px",
              background: "#F8F6F1",
              border: "1px solid #CAA449",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div style={{ color: "#1F1B16" }}>
              <div style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "#7A6420", marginBottom: 4 }}>
                FitLens
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                Measure your face width in 30 seconds from your phone camera.
              </div>
            </div>
            <Link
              to="/en/fit"
              style={{
                background: "#CAA449",
                color: "#1F1B16",
                padding: "10px 18px",
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Start FitLens
            </Link>
          </div>
        </section>

        <ClusterSections sections={SIZE_SECTIONS[size.slug]} />

        {/* Frame cards */}
        <section aria-labelledby="frames-heading" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="frames-heading"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            The frames
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            {productCards.map((p) => (
              <Link
                key={p.id}
                to={p.href}
                style={{
                  display: "block",
                  padding: "18px 16px",
                  background: "#FFF",
                  border: "1px solid #E0D5C5",
                  borderRadius: 4,
                  textDecoration: "none",
                  color: "#0B0A09",
                }}
              >
                <div style={{ fontFamily: "'Newsreader', 'Cormorant Garamond', serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55, marginBottom: 12 }}>{p.blurb}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: "#7A6420", fontWeight: 700, fontSize: 16 }}>$114</span>
                  <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#7A6420", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    View →
                  </span>
                </div>
              </Link>
            ))}
            <Link
              to="/en/bespoke"
              style={{
                display: "block",
                padding: "18px 16px",
                background: "#16140F",
                border: "1px solid #16140F",
                borderRadius: 4,
                textDecoration: "none",
                color: "#EFE9DF",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#CAA449", marginBottom: 8 }}>
                Bespoke
              </div>
              <div style={{ fontFamily: "'Newsreader', 'Cormorant Garamond', serif", fontWeight: 400, fontSize: 19, marginBottom: 6, color: "#EFE9DF" }}>
                Build it bespoke
              </div>
              <div style={{ fontSize: 12, color: "#B9B0A0", lineHeight: 1.55, marginBottom: 12 }}>
                {size.bespokeNote}
              </div>
              <span style={{ fontSize: 11, color: "#CAA449", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Start bespoke →
              </span>
            </Link>
          </div>
        </section>

        {/* Full width ladder 145 → 172 */}
        <section aria-labelledby="related-sizes" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="related-sizes"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 22,
              margin: "0 0 6px",
              letterSpacing: "-0.2px",
            }}
          >
            Every width we cover — 145 to 172 mm
          </h2>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 14px" }}>
            Signature 158 mm fits 155–161 mm faces. Everything outside that band is a bespoke build,
            up to our 172 mm maximum.
          </p>
          <nav aria-label="Frame width ladder" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SIZES.map((r) => {
              const band = ladderLabel(r.width);
              const current = r.slug === size.slug;
              return (
                <Link
                  key={r.slug}
                  to={`/en/size/${r.slug}`}
                  aria-current={current ? "page" : undefined}
                  style={{
                    fontSize: 12,
                    color: "#0B0A09",
                    padding: "8px 14px",
                    border: current ? "1px solid #CAA449" : "1px solid #D6CBB6",
                    borderRadius: 999,
                    textDecoration: "none",
                    background: band === "signature" ? "#F3EBD5" : "#FFF",
                    fontWeight: current || band === "signature" ? 600 : 400,
                    letterSpacing: "0.3px",
                  }}
                >
                  {r.width} mm
                  <span style={{ color: "#7A6420", marginLeft: 6, fontSize: 11 }}>
                    {band === "signature" ? "signature" : band === "signature-range" ? "signature fit" : "bespoke"}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 16, fontSize: 13 }}>
            {prev ? (
              <Link to={`/en/size/${prev.slug}`} style={{ color: "#7A6420", fontWeight: 600, textDecoration: "none" }}>
                ← {prev.width} mm wide glasses
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/en/size/${next.slug}`} style={{ color: "#7A6420", fontWeight: 600, textDecoration: "none" }}>
                {next.width} mm wide glasses →
              </Link>
            ) : <span />}
          </div>
        </section>


        {/* FAQ */}
        <section aria-labelledby="faq-heading" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="faq-heading"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            Frequently asked
          </h2>
          {size.faq.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "14px 0" }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0B0A09",
                  listStyle: "none",
                }}
              >
                {f.q}
              </summary>
              <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.75, color: "#444" }}>{f.a}</p>
            </details>
          ))}
        </section>

        {/* Closing hub link */}
        <section style={{ ...wrap, padding: "24px 20px 48px" }}>
          <div
            style={{
              padding: "18px 20px",
              background: "#FFF",
              border: "1px solid #E0D5C5",
              borderRadius: 4,
              fontSize: 13,
              lineHeight: 1.7,
              color: "#333",
            }}
          >
            Not sure whether {size.width} mm is the right measurement for you?{" "}
            <Link to="/en/blog/glasses-for-wide-faces-guide" style={{ color: "#7A6420", fontWeight: 600 }}>
              Read the full wide-face fit guide
            </Link>{" "}
            — it covers what the millimetres mean and how to measure without guessing.
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/**
 * Route wrapper. Loads size data from :slug, 404s if unknown.
 * Renders SizePageInner so the component can consume `size` directly.
 */
const SizePage = () => {
  const { slug } = useParams();
  const size = slug ? getSizeBySlug(slug) : undefined;
  if (!size) return <NotFound />;
  return <SizePageInner size={size} />;
};

export default SizePage;

// Re-export SIZES for prerender/sitemap use elsewhere.
export { SIZES };
