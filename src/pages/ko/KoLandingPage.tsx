import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { koPages, koPageOrder, type KoPageConfig, type KoSection } from "@/content/ko/landingPages";

const SITE = "https://woolet.co";

// Noto Sans KR is already requested once in index.html — never add a second
// Google Fonts request.
const KO_SANS = "'Archivo', 'Noto Sans KR', sans-serif";
const KO_SERIF = "'Newsreader', 'Noto Sans KR', serif";

const c = {
  ink: "#0B0A09",
  panel: "#16140F",
  cream: "#EFE9DF",
  creamDim: "#9A8E7E",
  gold: "#C2A05A",
  line: "#2A2520",
};

function SectionBlock({ s }: { s: KoSection }) {
  const ListTag = s.ordered ? "ol" : "ul";

  return (
    <section className="px-6 md:px-10" style={{ borderBottom: `1px solid ${c.line}` }}>
      <div className="max-w-3xl mx-auto py-14 flex flex-col gap-5">
        <h2 style={{ fontFamily: KO_SERIF, fontWeight: 400, fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", margin: 0 }}>
          {s.h2}
        </h2>
        <p style={{ color: c.creamDim, lineHeight: 1.9, margin: 0 }}>{s.body}</p>

        {s.paras?.map((p) => (
          <p key={p} style={{ color: c.creamDim, lineHeight: 1.9, margin: 0 }}>
            {p}
          </p>
        ))}

        {s.list?.length ? (
          <ListTag
            style={{
              margin: 0,
              paddingLeft: s.ordered ? 22 : 18,
              color: c.creamDim,
              lineHeight: 2,
              listStyle: s.ordered ? "decimal" : "disc",
            }}
          >
            {s.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        ) : null}

        {s.code ? (
          <pre
            style={{
              margin: 0,
              padding: "18px 20px",
              background: c.panel,
              border: `1px solid ${c.gold}`,
              borderRadius: 2,
              color: c.gold,
              fontFamily: "'Archivo', 'Noto Sans KR', monospace",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            }}
          >
            <code>{s.code}</code>
          </pre>
        ) : null}

        {s.emphasis ? (
          <p
            style={{
              margin: 0,
              padding: "4px 0 4px 20px",
              borderLeft: `2px solid ${c.gold}`,
              color: c.cream,
              fontSize: "1.05rem",
              lineHeight: 1.85,
            }}
          >
            {s.emphasis}
          </p>
        ) : null}

        {s.table ? (
          <div className="overflow-x-auto" style={{ border: `1px solid ${c.line}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr>
                  {s.table.head.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        background: c.panel,
                        color: c.gold,
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        borderBottom: `1px solid ${c.line}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td
                        key={`${row[0]}-${i}`}
                        style={{
                          padding: "12px 14px",
                          borderBottom: `1px solid ${c.line}`,
                          color: i === 0 ? c.cream : c.creamDim,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {s.callout?.length ? (
          <div
            style={{
              border: `1px solid ${c.gold}`,
              background: c.panel,
              padding: "18px 20px",
              borderRadius: 2,
            }}
          >
            {s.callout.map((line) => (
              <p key={line} style={{ margin: "0 0 6px", color: c.cream, lineHeight: 1.8 }}>
                {line}
              </p>
            ))}
          </div>
        ) : null}

        {s.bullets?.length ? (
          <dl className="grid sm:grid-cols-2 gap-px mt-2" style={{ background: c.line }}>
            {s.bullets.map((b) => (
              <div key={b.label} style={{ background: c.panel, padding: "16px 18px" }}>
                <dt style={{ fontSize: 11, letterSpacing: "0.2em", color: c.creamDim }}>{b.label}</dt>
                <dd style={{ margin: "6px 0 0", fontSize: "1.05rem", color: c.cream }}>{b.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {s.ctas?.length ? (
          <div className="flex flex-wrap gap-3 mt-1">
            {s.ctas.map((cta) => (
              <Link
                key={cta.href + cta.label}
                to={cta.href}
                style={{
                  padding: "15px 26px",
                  background: cta.primary ? c.gold : "transparent",
                  border: cta.primary ? `1px solid ${c.gold}` : `1px solid ${c.line}`,
                  color: cta.primary ? c.ink : c.cream,
                  fontWeight: cta.primary ? 600 : 500,
                  fontSize: 13,
                  borderRadius: 2,
                  textDecoration: "none",
                }}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}

        {s.link ? (
          <p style={{ margin: 0 }}>
            <Link to={s.link.href} style={{ color: c.gold, textDecoration: "none", lineHeight: 1.9 }}>
              {s.link.label} →
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function KoLandingPage({ config }: { config: KoPageConfig }) {
  const canonical = `${SITE}${config.path}`;
  const enAlt = config.englishEquivalent ? `${SITE}${config.englishEquivalent}` : `${SITE}/en`;

  useEffect(() => {
    document.documentElement.lang = "ko";
    document.documentElement.dir = "ltr";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ko",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const related = koPageOrder.filter((p) => p !== config.path);

  return (
    <>
      <Helmet>
        <html lang="ko" dir="ltr" />
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="ko" href={canonical} />
        {config.englishEquivalent ? <link rel="alternate" hrefLang="en" href={enAlt} /> : null}
        <link rel="alternate" hrefLang="x-default" href={enAlt} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        {config.noindex ? <meta name="robots" content="noindex, follow" /> : null}
        {config.faqs.length ? (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        ) : null}
      </Helmet>

      <div style={{ background: c.ink, color: c.cream, minHeight: "100vh", fontFamily: KO_SANS }}>
        <Navbar />

        <main>
          <section className="px-6 md:px-10" style={{ borderBottom: `1px solid ${c.line}` }}>
            <div className="max-w-3xl mx-auto pt-16 pb-20 flex flex-col gap-6">
              <span style={{ fontSize: 11, letterSpacing: "0.28em", color: c.gold }}>{config.eyebrow}</span>
              <h1
                style={{
                  fontFamily: KO_SERIF,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  fontSize: "clamp(2rem, 4.2vw, 3rem)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {config.h1}
              </h1>
              <p style={{ color: c.creamDim, lineHeight: 1.85, fontSize: "1.05rem", margin: 0, maxWidth: 620 }}>
                {config.sub}
              </p>
            </div>
          </section>

          {config.sections.map((s) => (
            <SectionBlock key={s.h2} s={s} />
          ))}

          {config.faqs.length ? (
          <section className="px-6 md:px-10" style={{ borderBottom: `1px solid ${c.line}` }}>
            <div className="max-w-3xl mx-auto py-14 flex flex-col gap-6">
              <h2 style={{ fontFamily: KO_SERIF, fontWeight: 400, fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", margin: 0 }}>
                자주 묻는 질문
              </h2>
              {config.faqs.map((f) => (
                <div key={f.q} className="flex flex-col gap-2">
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{f.q}</h3>
                  <p style={{ color: c.creamDim, lineHeight: 1.85, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
          ) : null}

          <nav aria-label="한국어 페이지" className="px-6 md:px-10">
            <div className="max-w-3xl mx-auto py-14 flex flex-col gap-4">
              <h2 style={{ fontSize: 11, letterSpacing: "0.24em", color: c.gold, margin: 0 }}>한국어 페이지</h2>
              <ul className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {related.map((p) => (
                  <li key={p}>
                    <Link to={p} style={{ color: c.cream, textDecoration: "none", lineHeight: 1.9 }}>
                      {koPages[p].h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </main>

        <Footer />
      </div>
    </>
  );
}
