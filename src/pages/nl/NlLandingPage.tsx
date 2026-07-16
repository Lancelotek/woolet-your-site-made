import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
import Footer from "@/components/Footer";
import { nlPageOrder, nlPages, type NlPageConfig } from "@/content/nl/landingPages";

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

export default function NlLandingPage({ config }: { config: NlPageConfig }) {
  const canonical = `${SITE}/nl/${config.slug}`;
  const englishAlt = `${SITE}${config.englishEquivalent}`;

  useEffect(() => {
    document.documentElement.lang = "nl";
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
    material: "Italiaans Mazzucchelli 1849 acetaat",
    image: `${SITE}/og-image.png`,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "USD",
      price: "114.00",
      availability: "https://schema.org/PreOrder",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Woolet", item: SITE },
      { "@type": "ListItem", position: 2, name: "Nederland", item: `${SITE}/nl` },
      { "@type": "ListItem", position: 3, name: config.primaryKeyword, item: canonical },
    ],
  };

  const related = nlPageOrder.filter((s) => s !== config.slug);

  return (
    <>
      <Helmet>
        <html lang="nl" dir="ltr" />
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta name="keywords" content={`${config.primaryKeyword}, brede bril, grote bril heren, acetaat bril, Mazzucchelli, bril 155 mm, bril 158 mm, bril 161 mm, bril op maat`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="nl" href={canonical} />
        <link rel="alternate" hrefLang="nl-NL" href={canonical} />
        <link rel="alternate" hrefLang="nl-BE" href={canonical} />
        <link rel="alternate" hrefLang="en" href={englishAlt} />
        <link rel="alternate" hrefLang="x-default" href={englishAlt} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="nl_NL" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.metaTitle} />
        <meta name="twitter:description" content={config.metaDescription} />
        <meta name="twitter:image" content={`${SITE}/og-image.png`} />

        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        <header className="px-6 md:px-10 absolute top-0 left-0 right-0 z-20" style={{ background: "transparent" }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between py-5">
            <Link to="/nl" aria-label="Woolet — home" className="inline-flex items-center">
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
              <img src="/og-image.png" alt={`Woolet ${config.primaryKeyword}`} loading="lazy" width={520} height={520} style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} />
            </div>
          </div>
        </section>

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

        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}`, background: colors.inkSoft }}>
          <div className="max-w-3xl mx-auto py-20 md:py-28">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.3, color: colors.cream, margin: 0, marginBottom: 28 }}>
              Veelgestelde vragen
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
                const r = nlPages[slug];
                return (
                  <Link key={slug} to={`/nl/${slug}`} className="block p-7 transition-colors hover:bg-[rgba(202,164,73,0.05)]" style={{ border: `1px solid ${colors.line}`, background: colors.inkSoft, textDecoration: "none", color: colors.cream }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold, marginBottom: 12 }}>{r.primaryKeyword}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.35, color: colors.cream }}>{r.h1}</div>
                    <div style={{ marginTop: 18, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold }}>Lees verder →</div>
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
