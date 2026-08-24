import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  TEMPLES,
  getTempleBySlug,
  getRelatedTemples,
  type TempleEntry,
  type TempleVerdictKind,
} from "@/data/temples";
import NotFound from "@/pages/NotFound";
import ClusterSections from "@/components/ClusterSections";
import { TEMPLE_SECTIONS } from "@/data/cluster-sections";

const SITE = "https://woolet.co";

const verdictBg: Record<TempleVerdictKind, string> = {
  signature: "#F3EBD5",
  "bespoke-long": "#EFE9DF",
  "below-signature": "#F5E6DF",
  "out-of-range": "#F5E6DF",
};

const verdictLabel: Record<TempleVerdictKind, string> = {
  signature: "Signature — 150 mm",
  "bespoke-long": "Bespoke — long temple",
  "below-signature": "Below our range",
  "out-of-range": "Outside our range",
};

function TemplePageInner({ t }: { t: TempleEntry }) {
  const path = `/temple/${t.slug}`;
  const canonical = `${SITE}/en${path}`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Fit Guide", item: `${SITE}/en/fit` },
      { "@type": "ListItem", position: 3, name: `${t.length} mm temple glasses`, item: canonical },
    ],
  };

  const related = getRelatedTemples(t.slug);
  const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

  return (
    <>
      <SEO
        title={t.metaTitle ?? `${t.length} mm Temple Glasses | Wide-Face Temple Sizing — Woolet`}
        description={t.metaDescription}
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
          <Link to="/en/fit" style={{ color: "#888", textDecoration: "none" }}>Fit Guide</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0B0A09" }}>{t.length} mm temples</span>
        </nav>

        {/* Hero */}
        <header style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ display: "inline-block", background: verdictBg[t.verdictKind], padding: "5px 12px", borderRadius: 2, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#3A2E12", marginBottom: 18 }}>
            {verdictLabel[t.verdictKind]}
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
            {t.h1}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333", margin: "0 0 22px", maxWidth: 620 }}>
            {t.subhead}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Signature 150 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              Bespoke 145–155 mm
            </span>
            <span style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666", border: "1px solid #D9C9A8", padding: "5px 10px", borderRadius: 2 }}>
              11° tip bend
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
              to={t.verdictKind === "signature" ? "/en/products/007" : "/en/fit/bespoke"}
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
              {t.verdictKind === "signature" ? "See 007 Round" : "Explore bespoke"}
            </Link>
          </div>
        </header>

        {/* Frame cards — the offer, directly under the hero */}
        <section aria-labelledby="frames" style={{ ...wrap, padding: "28px 20px 8px" }}>
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
            {bespokePrimary && bespokeCard}
            {model007Card}
            {model009Card}
            {bespokePrimary && (
              <p style={{ gridColumn: "1 / -1", fontSize: 12, color: "#666", lineHeight: 1.6, margin: 0 }}>
                Signature runs 150 mm — if that's your number, no bespoke needed.
              </p>
            )}
            {!bespokePrimary && bespokeCard}
          </div>
        </section>


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
              Does Woolet fit a {t.length} mm temple?
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#222", margin: 0 }}>
              {t.fitVerdict}
            </p>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", margin: "18px 0 0", maxWidth: 620 }}>
            {t.intro}
          </p>
        </section>

        {/* Temple sizing table */}
        <section aria-labelledby="temple-table" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id="temple-table"
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            Where {t.length} mm sits in Woolet's temple range
          </h2>
          <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 4, background: "#FFF" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E0D5C5", background: "#FBF7EE" }}>
                  <th scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 600, color: "#666", letterSpacing: "1px", textTransform: "uppercase", fontSize: 11 }}>
                    Temple (mm)
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
                {TEMPLES.map((row) => {
                  const isCurrent = row.slug === t.slug;
                  return (
                    <tr key={row.slug} style={{ borderBottom: "1px solid #F0E9DA", background: isCurrent ? "#FBF7EE" : "transparent" }}>
                      <th scope="row" style={{ textAlign: "left", padding: "11px 14px", fontWeight: isCurrent ? 700 : 500, color: "#0B0A09" }}>
                        {row.length} mm{isCurrent ? " ← you" : ""}
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
            Temple length scales with head circumference. Bespoke pairs 145–155 mm temples with any front from 145 to 162 mm.
          </p>
        </section>

        <ClusterSections sections={TEMPLE_SECTIONS[t.slug]} />

        {t.disambiguation && (
          <section aria-labelledby="disambiguation" style={{ ...wrap, padding: "32px 20px 8px" }}>
            <h2
              id="disambiguation"
              style={{
                fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 26,
                margin: "0 0 14px",
                letterSpacing: "-0.3px",
              }}
            >
              {t.disambiguation.h2}
            </h2>
            {t.disambiguation.body.map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: "#333", margin: "0 0 14px", maxWidth: 660 }}>
                {p}
              </p>
            ))}
          </section>
        )}


        {/* Related temples */}
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
              Nearby temple lengths
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/en/temple/${r.slug}`}
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
                  {r.length} mm temples
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-links */}
        <section style={{ ...wrap, padding: "24px 20px 8px" }}>
          <h2 style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 12px", fontWeight: 500 }}>
            Sizing hubs
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, fontSize: 13 }}>
            {[
              { href: "/en/size/158mm", label: "158 mm — signature front width" },
              { href: "/en/bridge/21mm", label: "21 mm keyhole bridge — 007" },
              { href: "/en/bridge/22mm", label: "22 mm bridge — 009" },
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
          {t.faq.map((f, i) => (
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

export default function TemplePage() {
  const { slug } = useParams<{ slug: string }>();
  const t = slug ? getTempleBySlug(slug) : undefined;
  if (!t) return <NotFound />;
  return <TemplePageInner t={t} />;
}
