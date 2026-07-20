import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { XXL_HUB, XXL_PAGES, getXxlBySlug, type XxlEntry } from "@/data/xxl";
import NotFound from "@/pages/NotFound";

const SITE = "https://woolet.co";

const shellStyle: React.CSSProperties = {
  background: "#F8F6F1",
  minHeight: "100vh",
  fontFamily: "'Archivo', 'Barlow', sans-serif",
  color: "#0B0A09",
};
const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

const eyebrowStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#F3EBD5",
  padding: "5px 12px",
  borderRadius: 2,
  fontSize: 11,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#3A2E12",
  marginBottom: 18,
};
const h1Style: React.CSSProperties = {
  fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
  fontWeight: 300,
  fontSize: 40,
  lineHeight: 1.1,
  letterSpacing: "-0.5px",
  margin: "0 0 14px",
};
const h2Style: React.CSSProperties = {
  fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
  fontWeight: 300,
  fontSize: 26,
  margin: "0 0 14px",
  letterSpacing: "-0.3px",
};

function specTable(rows: { label: string; value: string }[]) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 4, background: "#FFF" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid #F0E9DA" }}>
              <th scope="row" style={{ textAlign: "left", padding: "11px 14px", fontWeight: 500, color: "#666", letterSpacing: "0.4px", fontSize: 12, textTransform: "uppercase", width: "42%" }}>
                {r.label}
              </th>
              <td style={{ padding: "11px 14px", color: "#0B0A09", fontWeight: 500 }}>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------- HUB ------------------------------- */

function XxlHubInner() {
  const path = "/xxl";
  const canonical = `${SITE}/en${path}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "XXL Sizing", item: canonical },
    ],
  };
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: XXL_PAGES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.h1,
      url: `${SITE}/en/xxl/${s.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title={XXL_HUB.metaTitle}
        description={XXL_HUB.metaDescription}
        lang="en"
        path={path}
        jsonLd={[breadcrumbLd, itemListLd]}
      />
      <Navbar />
      <main style={shellStyle}>
        <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: 16, fontSize: 11, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0B0A09" }}>XXL Sizing</span>
        </nav>

        <header style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={eyebrowStyle}>{XXL_HUB.eyebrow}</div>
          <h1 style={h1Style}>{XXL_HUB.h1}</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333", margin: "0 0 22px", maxWidth: 620 }}>
            {XXL_HUB.subhead}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <Link to="/en/fit/bespoke" style={{ background: "#CAA449", color: "#1F1B16", padding: "12px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 600 }}>
              Start XXL bespoke
            </Link>
            <Link to="/en/fit" style={{ background: "transparent", color: "#0B0A09", padding: "12px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #0B0A09", borderRadius: 2 }}>
              Measure with FitLens
            </Link>
          </div>
        </header>

        <section aria-labelledby="what-is-xxl" style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ background: "#FFF", border: "1px solid #E0D5C5", borderLeft: "3px solid #CAA449", padding: "22px 24px", borderRadius: 4 }}>
            <h2 id="what-is-xxl" style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 22, margin: "0 0 10px", letterSpacing: "-0.2px" }}>
              What XXL means at Woolet
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#222", margin: 0 }}>{XXL_HUB.intro}</p>
          </div>
        </section>

        <section style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2 style={h2Style}>XXL specification</h2>
          {specTable(XXL_HUB.spec)}
        </section>

        <section aria-labelledby="xxl-spokes" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2 id="xxl-spokes" style={h2Style}>Explore the XXL cluster</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {XXL_HUB.spokes.map((s) => (
              <Link key={s.slug} to={`/en/xxl/${s.slug}`} style={{ display: "block", padding: "18px 18px", background: "#FFF", border: "1px solid #E0D5C5", borderRadius: 4, textDecoration: "none", color: "#0B0A09" }}>
                <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 20, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 10 }}>{s.desc}</div>
                <span style={{ fontSize: 11, color: "#7A6420", letterSpacing: "1.5px", textTransform: "uppercase" }}>Read →</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ ...wrap, padding: "24px 20px 40px" }}>
          <h2 style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 12px", fontWeight: 500 }}>
            Related — one tier below XXL
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, fontSize: 13 }}>
            {[
              { href: "/en/collections/wide-face-glasses", label: "Wide-face collection (155–161 mm)" },
              { href: "/en/collections/extra-wide-glasses", label: "Extra-wide glasses (155–160 mm)" },
              { href: "/en/collections/glasses-for-big-heads", label: "Glasses for big heads (58–62 cm)" },
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
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------ SPOKE ------------------------------ */

function XxlSpokeInner({ x }: { x: XxlEntry }) {
  const path = `/xxl/${x.slug}`;
  const canonical = `${SITE}/en${path}`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: x.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "XXL Sizing", item: `${SITE}/en/xxl` },
      { "@type": "ListItem", position: 3, name: x.h1, item: canonical },
    ],
  };

  return (
    <>
      <SEO
        title={x.metaTitle}
        description={x.metaDescription}
        lang="en"
        path={path}
        jsonLd={[breadcrumbLd, faqLd]}
      />
      <Navbar />
      <main style={shellStyle}>
        <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: 16, fontSize: 11, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link to="/en/xxl" style={{ color: "#888", textDecoration: "none" }}>XXL Sizing</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0B0A09" }}>{x.eyebrow}</span>
        </nav>

        <header style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={eyebrowStyle}>{x.eyebrow}</div>
          <h1 style={h1Style}>{x.h1}</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#333", margin: "0 0 22px", maxWidth: 620 }}>{x.subhead}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <Link to={x.primaryCta.to} style={{ background: "#CAA449", color: "#1F1B16", padding: "12px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 600 }}>
              {x.primaryCta.label}
            </Link>
            <Link to={x.secondaryCta.to} style={{ background: "transparent", color: "#0B0A09", padding: "12px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #0B0A09", borderRadius: 2 }}>
              {x.secondaryCta.label}
            </Link>
          </div>
        </header>

        <section style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ background: "#FFF", border: "1px solid #E0D5C5", borderLeft: "3px solid #CAA449", padding: "22px 24px", borderRadius: 4 }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#222", margin: 0 }}>{x.intro}</p>
          </div>
        </section>

        <section style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2 style={h2Style}>Specification</h2>
          {specTable(x.spec)}
        </section>

        <section aria-labelledby="related" style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2 id="related" style={h2Style}>Related sizing pages</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {x.related.map((r) => (
              <Link key={r.to} to={r.to} style={{ display: "block", padding: "14px 16px", background: "#FFF", border: "1px solid #E0D5C5", borderRadius: 4, textDecoration: "none", color: "#0B0A09" }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{r.note}</div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq" style={{ ...wrap, padding: "32px 20px 24px" }}>
          <h2 id="faq" style={h2Style}>Frequently asked</h2>
          {x.faq.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "14px 0" }}>
              <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#0B0A09", listStyle: "none" }}>
                {f.q}
              </summary>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.75, color: "#444" }}>{f.a}</p>
            </details>
          ))}
        </section>

        <section style={{ ...wrap, padding: "8px 20px 40px" }}>
          <Link to="/en/xxl" style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#7A6420", textDecoration: "none" }}>
            ← Back to XXL sizing hub
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function XxlHubPage() {
  return <XxlHubInner />;
}

export default function XxlPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <XxlHubInner />;
  const x = getXxlBySlug(slug);
  if (!x) return <NotFound />;
  return <XxlSpokeInner x={x} />;
}
