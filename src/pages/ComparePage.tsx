import { Link, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FitRangeChart from "@/components/compare/FitRangeChart";
import { competitors, wooletColumn, Competitor } from "@/data/competitors";
import productImage from "@/assets/woolet-007-black.png";

const SITE = "https://woolet.co";

const heading: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300,
};

const body = "'Barlow', sans-serif";

const ComparePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const competitor = competitors.find((c) => c.slug === slug);
  // Unknown competitor slug: render NotFound in-place. Do NOT redirect
  // to `/en/404` (that URL isn't a route, it just re-renders NotFound
  // one hop later) or to `/en/compare` (soft-404 to the hub).
  if (!competitor) return <NotFound />;

  return <ComparePageInner competitor={competitor} />;
};

const ComparePageInner = ({ competitor: c }: { competitor: Competitor }) => {
  const path = `/compare/${c.slug}`;
  const canonical = `${SITE}/en${path}`;
  const ctaHref = (suffix = "") =>
    `/en/fit?utm_source=seo&utm_medium=organic&utm_campaign=compare&utm_content=${c.slug}${suffix}`;

  const rowKeys = Object.keys(wooletColumn);

  const idx = competitors.findIndex((x) => x.slug === c.slug);
  const prev = competitors[(idx - 1 + competitors.length) % competitors.length];
  const next = competitors[(idx + 1) % competitors.length];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE}/en/compare` },
      { "@type": "ListItem", position: 3, name: `${c.name} Alternative`, item: canonical },
    ],
  };

  return (
    <>
      <SEO
        title={c.seoTitle}
        description={c.metaDescription}
        lang="en"
        path={path}
        image={`/og-compare-${c.slug}.png`}
        jsonLd={[faqLd, breadcrumbLd]}
      />

      <Navbar />
      <main style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: body, color: "#111" }}>
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "16px 20px 0",
            fontSize: 11,
            color: "#888",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link to="/en/compare" style={{ color: "#888", textDecoration: "none" }}>Compare</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#111" }}>{c.name} Alternative</span>
        </nav>

        {/* Hero */}
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 24px", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "#A07A2A",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {c.name} vs Woolet · Wide-Face Eyewear
          </div>
          <h1 style={{ ...heading, fontSize: 40, lineHeight: 1.15, margin: "0 0 18px", color: "#111" }}>
            {c.heroH1}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "#555", margin: "0 auto 26px", maxWidth: 620 }}>
            {c.heroSub}
          </p>
          <Link
            to={ctaHref()}
            style={{
              display: "inline-block",
              background: "#CAA449",
              color: "#080807",
              padding: "13px 24px",
              borderRadius: 4,
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Scan your fit in 20 seconds →
          </Link>
          <div style={{ fontSize: 11, color: "#888", marginTop: 14, letterSpacing: 0.3 }}>
            Free worldwide shipping · 30-day fit guarantee · From $190
          </div>
        </header>

        {/* Verdict */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 28px" }}>
          <div
            style={{
              border: "1px solid rgba(202,164,73,0.5)",
              background: "rgba(202,164,73,0.05)",
              padding: "20px 22px",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#A07A2A",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              The quick verdict
            </div>
            <p
              style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#222" }}
              dangerouslySetInnerHTML={{ __html: c.verdict }}
            />
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 24px" }}>
          <h2 style={{ ...heading, fontSize: 28, margin: "0 0 16px" }}>
            Woolet vs {c.name}: side by side
          </h2>
          <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 8, background: "#FFF" }}>
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F1EBDD" }}>
                  <th style={thStyle}></th>
                  <th style={{ ...thStyle, color: "#A07A2A", background: "rgba(202,164,73,0.07)" }}>Woolet</th>
                  <th style={thStyle}>{c.name}</th>
                </tr>
              </thead>
              <tbody>
                {rowKeys.map((k, i) => (
                  <tr key={k} style={{ borderTop: i === 0 ? "none" : "1px solid #EEE7D6" }}>
                    <td style={{ ...tdStyle, fontWeight: 500, color: "#555", width: "22%" }}>{k}</td>
                    <td style={{ ...tdStyle, background: "rgba(202,164,73,0.07)", color: "#222" }}>
                      {wooletColumn[k]}
                    </td>
                    <td style={{ ...tdStyle, color: "#444" }}>{c.table[k] ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "#888", marginTop: 10, lineHeight: 1.6 }}>
            Comparison based on publicly available information as of July 2026. {c.name} specifications vary by model — always check the current listing.
          </p>
        </section>

        {/* Chart */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "16px 20px 32px" }}>
          <h2 style={{ ...heading, fontSize: 28, margin: "0 0 14px" }}>
            Face-width coverage, visualised
          </h2>
          <div
            style={{
              background: "#FFF",
              border: "1px solid #E0D5C5",
              borderRadius: 8,
              padding: "20px 20px 8px",
            }}
          >
            <FitRangeChart
              competitorMin={c.fitRange.min}
              competitorMax={c.fitRange.max}
              competitorLabel={c.fitRange.label}
            />
          </div>
          <p style={{ fontSize: 12, color: "#666", marginTop: 12, lineHeight: 1.65 }}>
            Approximate ranges based on published size information. If your face is 150 mm or wider, you're in the gold zone — the range Woolet was built for.
          </p>
        </section>

        {/* Advantages */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 24px" }}>
          <h2 style={{ ...heading, fontSize: 28, margin: "0 0 20px" }}>
            Why wide-faced wearers switch to Woolet
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {c.advantages.map((a) => (
              <div
                key={a.title}
                style={{
                  background: "#FFF",
                  border: "1px solid #E0D5C5",
                  borderRadius: 8,
                  padding: "18px 18px",
                }}
              >
                <h3
                  style={{
                    ...heading,
                    fontSize: 19,
                    margin: "0 0 8px",
                    color: "#A07A2A",
                    fontWeight: 400,
                  }}
                >
                  {a.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "#444" }}>{a.text}</p>
              </div>
            ))}
          </div>
          <figure style={{ margin: "26px 0 0" }}>
            <img
              src={productImage}
              alt="Woolet handmade acetate frame designed for wide faces"
              loading="lazy"
              style={{
                width: "100%",
                maxWidth: 620,
                height: "auto",
                display: "block",
                margin: "0 auto",
                borderRadius: 8,
                background: "#1A1612",
              }}
            />
          </figure>
        </section>

        {/* Where they win */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "16px 20px 24px" }}>
          <h2 style={{ ...heading, fontSize: 26, margin: "0 0 12px" }}>
            Where {c.name} still wins
          </h2>
          <p style={{ fontSize: 14, color: "#555", margin: "0 0 12px" }}>
            Honest comparison — {c.name} is the right call in some cases:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {c.whereTheyWin.map((w, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "#333", marginBottom: 6 }}>
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 16px" }}>
          <h2 style={{ ...heading, fontSize: 28, margin: "0 0 12px" }}>
            Frequently asked
          </h2>
          {c.faqs.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "14px 0" }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "#111",
                  listStyle: "none",
                }}
              >
                {f.q}
              </summary>
              <p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.75, color: "#444" }}>{f.a}</p>
            </details>
          ))}
        </section>

        {/* Final CTA */}
        <section
          style={{
            background: "#1A1612",
            color: "#F8F6F1",
            padding: "48px 20px",
            marginTop: 24,
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ ...heading, fontSize: 32, margin: "0 0 14px", color: "#F8F6F1" }}>
              Your face was never the problem.
            </h2>
            <p style={{ fontSize: 15, color: "#CCC", lineHeight: 1.7, margin: "0 0 22px" }}>
              FitLens measures your face from your phone in 20 seconds and tells you exactly which Woolet frame fits — before you spend a cent.
            </p>
            <Link
              to={ctaHref("-footer")}
              style={{
                display: "inline-block",
                background: "#CAA449",
                color: "#080807",
                padding: "13px 26px",
                borderRadius: 4,
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Find your fit →
            </Link>
          </div>
        </section>

        {/* Prev/next comparisons */}
        <nav
          aria-label="Other comparisons"
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "28px 20px 12px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            to={`/en/compare/${prev.slug}`}
            style={{ fontSize: 12, color: "#A07A2A", textDecoration: "none", letterSpacing: 1 }}
          >
            ← {prev.name} Alternative
          </Link>
          <Link
            to={`/en/compare/${next.slug}`}
            style={{ fontSize: 12, color: "#A07A2A", textDecoration: "none", letterSpacing: 1 }}
          >
            {next.name} Alternative →
          </Link>
        </nav>

        {/* Legal disclaimer */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "8px 20px 40px",
            fontSize: 11,
            color: "#999",
            lineHeight: 1.6,
          }}
        >
          Woolet is not affiliated with {c.name}. All trademarks belong to their respective owners. Comparison reflects publicly available information as of July 2026.
        </div>
      </main>
      <Footer />
    </>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  fontFamily: body,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "#111",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "top",
  lineHeight: 1.55,
};

export default ComparePage;
