import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
import { koPages, koPageOrder, type KoPageConfig } from "@/content/ko/landingPages";

const wooletLogo = wooletLogoAsset.url;
const SITE = "https://woolet.co";

// Noto Sans KR is already requested once in index.html (bespoke engraving
// preview). Reuse it here — never add a second Google Fonts request.
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
        {config.englishEquivalent ? (
          <link rel="alternate" hrefLang="en" href={enAlt} />
        ) : null}
        <link rel="alternate" hrefLang="x-default" href={enAlt} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <main style={{ background: c.ink, color: c.cream, minHeight: "100vh", fontFamily: KO_SANS }}>
        <header className="px-6 md:px-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between py-6">
            <Link to="/ko" aria-label="Woolet — 홈" className="inline-flex items-center">
              <img src={wooletLogo} alt="Woolet" className="h-8 w-auto" />
            </Link>
            <Link
              to="/en"
              style={{
                color: c.creamDim,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              EN
            </Link>
          </div>
        </header>

        <section className="px-6 md:px-10" style={{ borderBottom: `1px solid ${c.line}` }}>
          <div className="max-w-3xl mx-auto pt-16 pb-20 flex flex-col gap-6">
            <span style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: c.gold }}>
              {config.eyebrow}
            </span>
            <h1
              style={{
                fontFamily: KO_SERIF,
                fontWeight: 400,
                lineHeight: 1.25,
                fontSize: "clamp(2rem, 4.4vw, 3.2rem)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {config.h1}
            </h1>
            <p style={{ color: c.creamDim, lineHeight: 1.85, fontSize: "1rem", margin: 0, maxWidth: 620 }}>
              {config.sub}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                to="/en/fit"
                style={{
                  padding: "15px 26px",
                  background: c.gold,
                  color: c.ink,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  borderRadius: 2,
                  textDecoration: "none",
                }}
              >
                내 사이즈 찾기
              </Link>
              <Link
                to="/ko/guide/frame-size"
                style={{
                  padding: "15px 26px",
                  border: `1px solid ${c.line}`,
                  color: c.cream,
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  borderRadius: 2,
                  textDecoration: "none",
                }}
              >
                사이즈 재는 법
              </Link>
            </div>
          </div>
        </section>

        {config.sections.map((s) => (
          <section key={s.h2} className="px-6 md:px-10" style={{ borderBottom: `1px solid ${c.line}` }}>
            <div className="max-w-3xl mx-auto py-14 flex flex-col gap-5">
              <h2 style={{ fontFamily: KO_SERIF, fontWeight: 400, fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", margin: 0 }}>
                {s.h2}
              </h2>
              <p style={{ color: c.creamDim, lineHeight: 1.9, margin: 0 }}>{s.body}</p>
              {s.bullets?.length ? (
                <dl className="grid sm:grid-cols-2 gap-px mt-2" style={{ background: c.line }}>
                  {s.bullets.map((b) => (
                    <div key={b.label} style={{ background: c.panel, padding: "16px 18px" }}>
                      <dt style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: c.creamDim }}>
                        {b.label}
                      </dt>
                      <dd style={{ margin: "6px 0 0", fontSize: "1.05rem", color: c.cream }}>{b.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>
        ))}

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

        <nav aria-label="한국어 페이지" className="px-6 md:px-10">
          <div className="max-w-3xl mx-auto py-14 flex flex-col gap-4">
            <h2 style={{ fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: c.gold, margin: 0 }}>
              한국어 페이지
            </h2>
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

        <footer className="px-6 md:px-10" style={{ borderTop: `1px solid ${c.line}` }}>
          <div className="max-w-3xl mx-auto py-10" style={{ color: c.creamDim, fontSize: 12, lineHeight: 1.9 }}>
            <p style={{ margin: 0 }}>Woolet — 넓은 얼굴을 위한 이탈리아 아세테이트 아이웨어. EU 수작업.</p>
            <p style={{ margin: "8px 0 0" }}>
              <Link to="/en" style={{ color: c.creamDim }}>English site</Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
