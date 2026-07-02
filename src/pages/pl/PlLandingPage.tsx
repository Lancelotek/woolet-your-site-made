import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
import Footer from "@/components/Footer";
import { plPageOrder, plPages, type PlPageConfig, type PlExtendedContent } from "@/content/pl/landingPages";

const wooletLogo = wooletLogoAsset.url;
const SITE = "https://woolet.co";

const colors = {
  ink: "#080807",
  inkSoft: "#121110",
  cream: "#EDE7D9",
  creamDim: "#9A8E7E",
  gold: "#CAA449",
  line: "#2a2520",
};

export default function PlLandingPage({ config }: { config: PlPageConfig }) {
  const canonical = `${SITE}/pl/${config.slug}`;
  const englishAlt = config.englishEquivalent ? `${SITE}${config.englishEquivalent}` : null;
  const ogImageUrl = config.ogImage
    ? (config.ogImage.startsWith("http") ? config.ogImage : `${SITE}${config.ogImage}`)
    : `${SITE}/og-image.png`;

  useEffect(() => {
    document.documentElement.lang = "pl";
    document.documentElement.dir = "ltr";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Woolet",
    description: config.metaDescription,
    brand: { "@type": "Brand", name: "Woolet" },
    material: "Włoski octan Mazzucchelli 1849",
    image: ogImageUrl,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "USD",
      price: "133.00",
      availability: "https://schema.org/PreOrder",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Woolet", item: SITE },
      { "@type": "ListItem", position: 2, name: "Polska", item: `${SITE}/pl` },
      { "@type": "ListItem", position: 3, name: config.primaryKeyword, item: canonical },
    ],
  };

  const related = plPageOrder.filter((s) => s !== config.slug);

  return (
    <>
      <Helmet>
        <html lang="pl" dir="ltr" />
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta name="keywords" content={`${config.primaryKeyword}, okulary na szeroką twarz, oprawki szerokie, włoski octan, Mazzucchelli, okulary 155 mm, okulary 158 mm, okulary 161 mm`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="pl" href={canonical} />
        <link rel="alternate" hrefLang="pl-PL" href={canonical} />
        {englishAlt && <link rel="alternate" hrefLang="en" href={englishAlt} />}
        {englishAlt && <link rel="alternate" hrefLang="x-default" href={englishAlt} />}
        {!englishAlt && <link rel="alternate" hrefLang="x-default" href={canonical} />}

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="pl_PL" />
        {englishAlt && <meta property="og:locale:alternate" content="en_US" />}
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1216" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content={config.h1} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.metaTitle} />
        <meta name="twitter:description" content={config.metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />

        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {config.extendedContent?.measureSteps && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: config.extendedContent.measureSteps.h2,
            description: config.metaDescription,
            totalTime: "PT5M",
            supply: [
              { "@type": "HowToSupply", name: "Linijka lub miarka krawiecka" },
              { "@type": "HowToSupply", name: "Lustro" },
            ],
            tool: [{ "@type": "HowToTool", name: "Telefon z aparatem (opcjonalnie — FitLens)" }],
            step: config.extendedContent.measureSteps.steps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.body,
            })),
          })}</script>
        )}
        {config.extendedContent && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: config.h1,
            description: config.metaDescription,
            image: ogImageUrl,
            author: { "@type": "Organization", name: "Woolet" },
            publisher: { "@type": "Organization", name: "Woolet", logo: { "@type": "ImageObject", url: `${SITE}/og-image.png` } },
            inLanguage: "pl-PL",
            mainEntityOfPage: canonical,
          })}</script>
        )}
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        <header className="px-6 md:px-10 absolute top-0 left-0 right-0 z-20" style={{ background: "transparent" }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between py-5">
            <Link to="/pl" aria-label="Woolet — strona główna" className="inline-flex items-center">
              <img src={wooletLogo} alt="Woolet" className="h-8 md:h-9 w-auto" />
            </Link>
            <Link
              to="/en"
              style={{
                color: colors.creamDim,
                fontFamily: "'Barlow', sans-serif",
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

        {/* HERO */}
        <section
          className="px-6 md:px-10 relative overflow-hidden"
          style={{
            background: `radial-gradient(1200px 600px at 80% -10%, rgba(202,164,73,0.08), transparent 60%), ${colors.ink}`,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <div className="max-w-6xl mx-auto pt-28 md:pt-32 pb-20 md:pb-28 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div className="flex flex-col gap-7">
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: colors.gold }}>
                {config.eyebrow}
              </span>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, lineHeight: 1.2, fontSize: "clamp(2rem, 4.2vw, 3.4rem)", color: colors.cream, letterSpacing: "-0.005em", margin: 0 }}>
                {config.h1}
              </h1>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)", lineHeight: 1.8, color: colors.creamDim, maxWidth: 560, margin: 0 }}>
                {config.sub}
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <Link to={config.ctaPrimaryHref} className="inline-flex items-center justify-center" style={{ padding: "16px 28px", background: colors.gold, color: colors.ink, fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textDecoration: "none" }}>
                  {config.ctaPrimaryLabel}
                </Link>
                <Link to={config.ctaSecondaryHref} className="inline-flex items-center justify-center" style={{ padding: "16px 28px", border: `1px solid ${colors.gold}`, color: colors.gold, fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textDecoration: "none" }}>
                  {config.ctaSecondaryLabel} →
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <figure style={{ margin: 0 }}>
                <div style={{ background: config.heroImage ? "#f0ece4" : "transparent", padding: config.heroImage ? 20 : 0 }}>
                  <img
                    src={config.heroImage || "/og-image.png"}
                    alt={config.heroAlt || `Woolet — ${config.primaryKeyword}`}
                    loading="lazy"
                    width={520}
                    height={520}
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                  />
                </div>
                {config.heroCaption && (
                  <figcaption
                    style={{
                      marginTop: 10,
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: colors.creamDim,
                      textAlign: "center",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {config.heroCaption}
                  </figcaption>
                )}
              </figure>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="px-6 md:px-10">
          <div className="max-w-3xl mx-auto py-20 md:py-28">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.3, color: colors.cream, margin: 0 }}>
              {config.problemH2}
            </h2>
            <p style={{ marginTop: 20, fontFamily: "'Barlow', sans-serif", fontSize: 16, lineHeight: 1.85, color: colors.creamDim }}>
              {config.problemBody}
            </p>
          </div>
        </section>

        {/* PROOF */}
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}`, background: colors.inkSoft }}>
          <div className="max-w-5xl mx-auto py-20 md:py-28">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.3, color: colors.cream, margin: 0, maxWidth: 620 }}>
              {config.proofH2}
            </h2>
            <p style={{ marginTop: 20, fontFamily: "'Barlow', sans-serif", fontSize: 16, lineHeight: 1.85, color: colors.creamDim, maxWidth: 620 }}>
              {config.proofBody}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mt-14" style={{ background: colors.line }}>
              {config.proofBullets.map((b) => (
                <div key={b.label} className="p-7" style={{ background: colors.ink }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.creamDim }}>{b.label}</div>
                  <div style={{ marginTop: 10, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.3, color: colors.cream }}>{b.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {config.extendedContent && (
          <ExtendedSections content={config.extendedContent} colors={colors} />
        )}

        {/* CLOSING */}
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-3xl mx-auto py-20 md:py-28 text-center flex flex-col items-center gap-6">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", fontWeight: 400, lineHeight: 1.3, color: colors.cream, margin: 0 }}>
              {config.closingH2}
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 16, lineHeight: 1.85, color: colors.creamDim, maxWidth: 560, margin: 0 }}>
              {config.closingBody}
            </p>
            <Link to={config.ctaPrimaryHref} className="inline-flex items-center justify-center mt-2" style={{ padding: "16px 28px", background: colors.gold, color: colors.ink, fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textDecoration: "none" }}>
              {config.ctaPrimaryLabel}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}`, background: colors.inkSoft }}>
          <div className="max-w-3xl mx-auto py-20 md:py-28">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.3, color: colors.cream, margin: 0, marginBottom: 28 }}>
              Najczęstsze pytania
            </h2>
            <div className="flex flex-col">
              {config.faqs.map((f, i) => (
                <details key={i} className="group py-6" style={{ borderTop: i === 0 ? `1px solid ${colors.line}` : "none", borderBottom: `1px solid ${colors.line}` }}>
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, lineHeight: 1.6, color: colors.cream }}>
                    <span>{f.q}</span>
                    <span style={{ color: colors.gold, flexShrink: 0 }}>+</span>
                  </summary>
                  <p className="mt-3" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14.5, lineHeight: 1.85, color: colors.creamDim }}>
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
            <div className="max-w-5xl mx-auto py-20 grid sm:grid-cols-2 gap-5">
              {related.map((slug) => {
                const r = plPages[slug];
                return (
                  <Link key={slug} to={`/pl/${slug}`} className="block p-7 transition-colors hover:bg-[rgba(202,164,73,0.05)]" style={{ border: `1px solid ${colors.line}`, background: colors.inkSoft, textDecoration: "none", color: colors.cream }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold, marginBottom: 12 }}>{r.primaryKeyword}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.35, color: colors.cream }}>{r.h1}</div>
                    <div style={{ marginTop: 18, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold }}>Czytaj dalej →</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}

function ExtendedSections({
  content,
  colors,
}: {
  content: PlExtendedContent;
  colors: { ink: string; inkSoft: string; cream: string; creamDim: string; gold: string; line: string };
}) {
  const h2Style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)",
    fontWeight: 400,
    lineHeight: 1.3,
    color: colors.cream,
    margin: 0,
    marginBottom: 24,
  };
  const bodyStyle: React.CSSProperties = {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 16,
    lineHeight: 1.85,
    color: colors.creamDim,
  };

  return (
    <>
      {content.faceShapes && (
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-4xl mx-auto py-20 md:py-24">
            <h2 style={h2Style}>{content.faceShapes.h2}</h2>
            {content.faceShapes.intro && (
              <p style={{ ...bodyStyle, marginBottom: 28, maxWidth: 640 }}>{content.faceShapes.intro}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-px" style={{ background: colors.line }}>
              {content.faceShapes.items.map((it) => (
                <div key={it.shape} className="p-6" style={{ background: colors.ink }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: colors.cream, marginBottom: 8 }}>
                    {it.shape}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14.5, lineHeight: 1.7, color: colors.creamDim }}>
                    {it.recommendation}
                  </div>
                </div>
              ))}
            </div>
            {content.faceShapes.counterpoint && (
              <p style={{ ...bodyStyle, marginTop: 28, borderLeft: `2px solid ${colors.gold}`, paddingLeft: 18, color: colors.cream, fontStyle: "italic" }}>
                {content.faceShapes.counterpoint}
              </p>
            )}
          </div>
        </section>
      )}

      {content.sizeExplainer && (
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}`, background: colors.inkSoft }}>
          <div className="max-w-4xl mx-auto py-20 md:py-24">
            <h2 style={h2Style}>{content.sizeExplainer.h2}</h2>
            <p style={{ ...bodyStyle, maxWidth: 720 }}>{content.sizeExplainer.intro}</p>
            {content.sizeExplainer.formula && (
              <div className="mt-8 p-6" style={{ border: `1px solid ${colors.line}`, background: colors.ink }}>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold, marginBottom: 8 }}>
                  {content.sizeExplainer.formulaLabel}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: colors.cream }}>
                  {content.sizeExplainer.formula}
                </div>
              </div>
            )}
            {content.sizeExplainer.bandsTitle && (
              <h3 style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.creamDim, marginTop: 40, marginBottom: 16 }}>
                {content.sizeExplainer.bandsTitle}
              </h3>
            )}
            <div style={{ borderTop: `1px solid ${colors.line}` }}>
              {content.sizeExplainer.bands.map((b) => (
                <div
                  key={b.range}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-4"
                  style={{
                    borderBottom: `1px solid ${colors.line}`,
                    background: b.highlight ? "rgba(202,164,73,0.06)" : "transparent",
                    paddingLeft: b.highlight ? 16 : 0,
                    paddingRight: b.highlight ? 16 : 0,
                  }}
                >
                  <div style={{ minWidth: 160, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: b.highlight ? colors.gold : colors.cream }}>
                    {b.range}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14.5, lineHeight: 1.7, color: colors.creamDim }}>
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.measureSteps && (
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-4xl mx-auto py-20 md:py-24">
            <h2 style={h2Style}>{content.measureSteps.h2}</h2>
            <ol className="grid gap-px mt-6" style={{ background: colors.line, listStyle: "none", padding: 0 }}>
              {content.measureSteps.steps.map((s, i) => (
                <li key={s.title} className="p-6 flex gap-5" style={{ background: colors.ink }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, lineHeight: 1, color: colors.gold, minWidth: 40 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: colors.cream, marginBottom: 6 }}>
                      {s.title}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14.5, lineHeight: 1.75, color: colors.creamDim }}>
                      {s.body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div
              className="mt-10 p-7 flex flex-col md:flex-row md:items-center gap-6"
              style={{ border: `1px solid ${colors.gold}`, background: "rgba(202,164,73,0.05)" }}
            >
              <p style={{ ...bodyStyle, color: colors.cream, margin: 0, flex: 1 }}>
                {content.measureSteps.ctaCard.text}
              </p>
              <Link
                to={content.measureSteps.ctaCard.ctaHref}
                className="inline-flex items-center justify-center whitespace-nowrap"
                style={{
                  padding: "14px 24px",
                  background: colors.gold,
                  color: colors.ink,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                {content.measureSteps.ctaCard.ctaLabel}
              </Link>
            </div>
          </div>
        </section>
      )}

      {content.fitRules && (
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}`, background: colors.inkSoft }}>
          <div className="max-w-4xl mx-auto py-20 md:py-24">
            <h2 style={h2Style}>{content.fitRules.h2}</h2>
            <div className="grid md:grid-cols-3 gap-px mt-6" style={{ background: colors.line }}>
              {content.fitRules.rules.map((r, i) => (
                <div key={r.title} className="p-6" style={{ background: colors.ink }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold, marginBottom: 12 }}>
                    Zasada {i + 1}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: colors.cream, marginBottom: 10 }}>
                    {r.title}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14.5, lineHeight: 1.75, color: colors.creamDim }}>
                    {r.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.brandSection && (
        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-3xl mx-auto py-20 md:py-24">
            <h2 style={h2Style}>{content.brandSection.h2}</h2>
            <p style={{ ...bodyStyle, marginBottom: 28 }}>{content.brandSection.body}</p>
            <div className="flex flex-wrap gap-4">
              {content.brandSection.ctas.map((c) => (
                <Link
                  key={c.label}
                  to={c.href}
                  className="inline-flex items-center justify-center"
                  style={{
                    padding: "16px 28px",
                    background: c.primary ? colors.gold : "transparent",
                    color: c.primary ? colors.ink : colors.gold,
                    border: c.primary ? "none" : `1px solid ${colors.gold}`,
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textDecoration: "none",
                    textTransform: "uppercase",
                  }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
