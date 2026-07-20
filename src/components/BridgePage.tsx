import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BRIDGES,
  getBridgeBySlug,
  getRelatedBridges,
  type BridgeEntry,
  type BridgeVerdictKind,
} from "@/data/bridges";
import NotFound from "@/pages/NotFound";

const SITE = "https://woolet.co";

const verdictBg: Record<BridgeVerdictKind, string> = {
  "signature-007": "#F3EBD5",
  "signature-009": "#F3EBD5",
  "signature-between": "#EFE9DF",
  "below-signature": "#F5E6DF",
  "wide-bespoke": "#EFE9DF",
  "out-of-range": "#F5E6DF",
};

const verdictLabel: Record<BridgeVerdictKind, string> = {
  "signature-007": "Signature — 007 Keyhole",
  "signature-009": "Signature — 009",
  "signature-between": "Bespoke floor",
  "below-signature": "Below our range",
  "wide-bespoke": "Bespoke — wide bridge",
  "out-of-range": "Outside our range",
};

function BridgePageInner({ b }: { b: BridgeEntry }) {
  const path = `/bridge/${b.slug}`;
  const canonical = `${SITE}/en${path}`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: b.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Bridge Guide", item: `${SITE}/en/collections/wide-bridge-glasses` },
      { "@type": "ListItem", position: 3, name: `${b.width} mm bridge glasses`, item: canonical },
    ],
  };

  const related = getRelatedBridges(b.slug);
  const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

  return (
    <>
      <SEO
        title={`${b.width} mm Bridge Glasses | Wide-Face Bridge Sizing — Woolet`}
        description={b.metaDescription}
        lang="en"
        path={path}
        jsonLd={[breadcrumbLd, faqLd]}
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
          <Link to="/en/collections/wide-bridge-glasses" style={{ color: "#888", textDecoration: "none" }}>Bridge Guide</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0B0A09" }}>{b.width} mm</span>
        </nav>

        {/* Hero */}
        <header style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ display: "inline-block", background: verdictBg[b.verdictKind], padding: "5px 12px", borderRadius: 2, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#3A2E12", marginBottom: 18 }}>
            {verdictLabel[b.verdictKind]}
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
            {b.h1}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333", margin: "0 0 22px", maxWidth: 620 }}>
            {b.subhead}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              007 Keyhole 21 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              009 Bridge 22 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Bespoke 20–24 mm
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
              to={b.verdictKind === "signature-007" ? "/en/products/007" : b.verdictKind === "signature-009" ? "/en/products/009" : "/en/fit/bespoke"}
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
              {b.verdictKind === "signature-007" ? "See 007 Round" : b.verdictKind === "signature-009" ? "See 009 Soft Square" : "Explore bespoke"}
            </Link>
          </div>
        </header>

        {/* Verdict block */}
        <section aria-labelledby="verdict" style={{ ...wrap, padding: "28px 20px 8px" }}>
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
              id="verdict"
              style={{
                fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 22,
                margin: "0 0 10px",
                letterSpacing: "-0.2px",
              }}
            >
              Does Woolet fit a {b.width} mm bridge?
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#222", margin: 0 }}>
              {b.fitVerdict}
            </p>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", margin: "18px 0 0", maxWidth: 620 }}>
            {b.intro}
          </p>
        </section>

        {/* Bridge sizing table */}
        <section aria-labelledby="bridge-table" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="bridge-table"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            Where {b.width} mm sits in Woolet's bridge range
          </h2>
          <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 4, background: "#FFF" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E0D5C5", background: "#FBF7EE" }}>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#666", letterSpacing: "1px", textTransform: "uppercase", fontSize: 11 }}>
                    Bridge (mm)
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#0B0A09", fontSize: 12 }}>
                    Woolet fit
                  </th>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#0B0A09", fontSize: 12 }}>
                    Route
                  </th>
                </tr>
              </thead>
              <tbody>
                {BRIDGES.map((row) => {
                  const isCurrent = row.slug === b.slug;
                  return (
                    <tr key={row.slug} style={{ borderBottom: "1px solid #F0E9DA", background: isCurrent ? "#FBF7EE" : "transparent" }}>
                      <th scope="row" style={{ textAlign: "left", padding: "11px 14px", fontWeight: isCurrent ? 700 : 500, color: "#0B0A09" }}>
                        {row.width} mm{isCurrent ? " ← you" : ""}
                      </th>
                      <td style={{ padding: "11px 14px", color: "#333" }}>{verdictLabel[row.verdictKind]}</td>
                      <td style={{ padding: "11px 14px", color: "#333" }}>{row.bestFor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: "12px 0 0" }}>
            Bridge width scales with front width. Bespoke pairs 20–24 mm bridges with any front from 145 to 162 mm.
          </p>
        </section>

        {/* Frame cards */}
        <section aria-labelledby="frames" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="frames"
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
            <Link
              to="/en/products/007"
              style={{
                display: "block",
                padding: "18px 16px",
                background: "#FFF",
                border: b.verdictKind === "signature-007" ? "2px solid #CAA449" : "1px solid #E0D5C5",
                borderRadius: 4,
                textDecoration: "none",
                color: "#0B0A09",
              }}
            >
              <div style={{ fontFamily: "'Newsreader', 'Cormorant Garamond', serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>
                Woolet 007 — Round
              </div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55, marginBottom: 12 }}>
                21 mm keyhole bridge · 158 mm front · 52 × 52 mm lens · 148 mm temples.
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: "#7A6420", fontWeight: 700, fontSize: 16 }}>$114</span>
                <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#7A6420", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  View →
                </span>
              </div>
            </Link>
            <Link
              to="/en/products/009"
              style={{
                display: "block",
                padding: "18px 16px",
                background: "#FFF",
                border: b.verdictKind === "signature-009" ? "2px solid #CAA449" : "1px solid #E0D5C5",
                borderRadius: 4,
                textDecoration: "none",
                color: "#0B0A09",
              }}
            >
              <div style={{ fontFamily: "'Newsreader', 'Cormorant Garamond', serif", fontWeight: 400, fontSize: 19, marginBottom: 6 }}>
                Woolet 009 — Soft Square
              </div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55, marginBottom: 12 }}>
                22 mm bridge · 158 mm front · 54 × 50 mm lens · 148 mm temples.
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: "#7A6420", fontWeight: 700, fontSize: 16 }}>$114</span>
                <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#7A6420", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  View →
                </span>
              </div>
            </Link>
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
                Build bridge to measure
              </div>
              <div style={{ fontSize: 12, color: "#B9B0A0", lineHeight: 1.55, marginBottom: 12 }}>
                {b.bespokeNote}
              </div>
              <span style={{ fontSize: 11, color: "#CAA449", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Start bespoke →
              </span>
            </Link>
          </div>
        </section>

        {/* Related bridges */}
        {related.length > 0 && (
          <section aria-labelledby="related" style={{ ...wrap, padding: "32px 20px 8px" }}>
            <h2
              id="related"
              style={{
                fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 22,
                margin: "0 0 12px",
                letterSpacing: "-0.2px",
              }}
            >
              Nearby bridge widths
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/en/bridge/${r.slug}`}
                  style={{
                    fontSize: 12,
                    color: "#0B0A09",
                    padding: "8px 14px",
                    border: "1px solid #D6CBB6",
                    borderRadius: 999,
                    textDecoration: "none",
                    background: "#FFF",
                    letterSpacing: "0.3px",
                  }}
                >
                  {r.width} mm bridge
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-links to category hubs */}
        <section style={{ ...wrap, padding: "24px 20px 8px" }}>
          <h2 style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 12px", fontWeight: 500 }}>
            Bridge & sizing hubs
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, fontSize: 13 }}>
            {[
              { href: "/en/collections/wide-bridge-glasses", label: "Wide-bridge glasses — hub" },
              { href: "/en/collections/keyhole-bridge-glasses", label: "Keyhole-bridge glasses — hub" },
              { href: "/en/size/158mm", label: "158 mm — signature front width" },
              { href: "/en/blog/glasses-for-wide-faces-guide", label: "Guide: glasses for wide faces" },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} style={{ color: "#7A6420", textDecoration: "none", borderBottom: "1px solid #E0D5C5", display: "inline-block", paddingBottom: 2 }}>
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" style={{ ...wrap, padding: "32px 20px 40px" }}>
          <h2
            id="faq"
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
          {b.faq.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "14px 0" }}>
              <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#0B0A09", listStyle: "none" }}>
                {f.q}
              </summary>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.75, color: "#444" }}>{f.a}</p>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function BridgePage() {
  const { slug } = useParams<{ slug: string }>();
  const b = slug ? getBridgeBySlug(slug) : undefined;
  if (!b) return <NotFound />;
  return <BridgePageInner b={b} />;
}
