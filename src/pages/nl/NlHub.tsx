import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { nlPageOrder, nlPages } from "@/content/nl/landingPages";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
import Footer from "@/components/Footer";

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

const secondaryLinks: { to: string; label: string; sub: string }[] = [
  { to: "/nl/collection", label: "De collectie", sub: "Woolet 007 & 009 — 155, 158 en 161 mm" },
  { to: "/nl/blog/beste-brillen-voor-brede-hoofden-2026", label: "Beste brillen voor grote hoofden 2026", sub: "Vergelijking van de breedste monturen die je echt kunt kopen" },
  { to: "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht", label: "Welke maat zonnebril voor een breed gezicht?", sub: "Snelle maatgids: frontbreedte, brug, veren" },
  { to: "/nl/products/007", label: "Woolet 007 — rond, 158 mm", sub: "Sleutelgatbrug, Italiaans Mazzucchelli-acetaat" },
  { to: "/nl/products/009", label: "Woolet 009 — zacht vierkant, 158 mm", sub: "Voor bredere gezichten in professionele context" },
  { to: "/nl/products/bespoke", label: "Bespoke — 145 tot 162 mm op maat", sub: "Front, brug en veren tot op de millimeter" },
];

export default function NlHub() {
  useEffect(() => {
    document.documentElement.lang = "nl";
    document.documentElement.dir = "ltr";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  return (
    <>
      <Helmet>
        <html lang="nl" dir="ltr" />
        <title>Brillen voor brede gezichten & grote hoofden 155–161 mm | Woolet</title>
        <meta
          name="description"
          content="Woolet — brede brillen voor grote hoofden in 155, 158 en 161 mm. Italiaans Mazzucchelli 1849 acetaat, handgemaakt in de EU. Meet je gezicht in 20 seconden."
        />
        <meta name="keywords" content="brillen voor brede gezichten, brede bril, bril grote hoofden, XXL bril heren, 161 mm bril, bril 160 mm, Mazzucchelli acetaat, bril brede neus" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

        <link rel="canonical" href={`${SITE}/nl`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE}/nl`} />
        <link rel="alternate" hrefLang="nl-NL" href={`${SITE}/nl`} />
        <link rel="alternate" hrefLang="nl-BE" href={`${SITE}/nl`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en`} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="nl_NL" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:title" content="Brillen voor brede gezichten & grote hoofden — Woolet 155–161 mm" />
        <meta property="og:description" content="Italiaans Mazzucchelli-acetaat. Drie echte breedtes: 155, 158 en 161 mm. Gemeten, niet gegokt — met FitLens in 20 seconden." />
        <meta property="og:url" content={`${SITE}/nl`} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Woolet — brede brillen van Italiaans acetaat voor grote hoofden" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Brillen voor brede gezichten & grote hoofden — Woolet" />
        <meta name="twitter:description" content="155, 158 en 161 mm. Italiaans Mazzucchelli-acetaat. Meet je gezicht in 20 seconden." />
        <meta name="twitter:image" content={`${SITE}/og-image.png`} />

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Woolet — Brillen voor brede gezichten en grote hoofden",
          url: `${SITE}/nl`,
          inLanguage: "nl-NL",
          isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
          about: { "@type": "Thing", name: "Brillen voor brede gezichten" },
          publisher: {
            "@type": "Organization",
            name: "Woolet",
            url: SITE,
            logo: { "@type": "ImageObject", url: `${SITE}/og-image.png` },
          },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Woolet", item: SITE },
            { "@type": "ListItem", position: 2, name: "Nederland", item: `${SITE}/nl` },
          ],
        })}</script>
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        <header className="px-6 md:px-10" style={{ borderBottom: `1px solid ${colors.line}` }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between py-6">
            <Link to="/nl" aria-label="Woolet — home" style={{ display: "inline-flex" }}>
              <img src={wooletLogo} alt="Woolet" className="h-8" />
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

        <section className="px-6 md:px-10">
          <div className="max-w-5xl mx-auto pt-20 pb-16">
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              Woolet · Nederland
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                lineHeight: 1.08,
                color: colors.cream,
                marginTop: 16,
              }}
            >
              Woolet — brillen voor brede gezichten en grote hoofden
            </h1>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 17,
                lineHeight: 1.7,
                color: colors.creamDim,
                maxWidth: 620,
                marginTop: 18,
              }}
            >
              Italiaans Mazzucchelli 1849 acetaat. Drie echte breedtes: 155, 158 en 161 mm. Gemeten, niet gegokt — met FitLens in 20 seconden.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/nl/fit"
                style={{
                  display: "inline-flex",
                  padding: "16px 28px",
                  background: colors.gold,
                  color: colors.ink,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Meet je gezicht — 20 seconden
              </Link>
              <Link
                to="/nl/collection"
                style={{
                  display: "inline-flex",
                  padding: "16px 28px",
                  border: `1px solid ${colors.gold}`,
                  color: colors.gold,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Bekijk de collectie →
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-5xl mx-auto py-16">
            <h2
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.creamDim,
                marginBottom: 20,
              }}
            >
              Voor brede gezichten
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {nlPageOrder.map((slug) => (
                <Link
                  key={slug}
                  to={`/nl/${slug}`}
                  className="block p-7 transition-colors hover:bg-[rgba(202,164,73,0.05)]"
                  style={{
                    border: `1px solid ${colors.line}`,
                    background: colors.inkSoft,
                    textDecoration: "none",
                    color: colors.cream,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: colors.gold,
                      marginBottom: 12,
                    }}
                  >
                    {nlPages[slug].primaryKeyword}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      lineHeight: 1.3,
                      color: colors.cream,
                    }}
                  >
                    {nlPages[slug].h1}
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 13,
                      color: colors.creamDim,
                      lineHeight: 1.6,
                    }}
                  >
                    {nlPages[slug].sub}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: colors.gold,
                    }}
                  >
                    Lees verder →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-5xl mx-auto py-16">
            <h2
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.creamDim,
                marginBottom: 20,
              }}
            >
              Alle Nederlandse pagina's
            </h2>
            <ul className="divide-y" style={{ borderTop: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}` }}>
              {secondaryLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="flex items-start justify-between gap-6 py-5 transition-colors hover:bg-[rgba(202,164,73,0.04)]"
                    style={{ textDecoration: "none", color: colors.cream, borderColor: colors.line }}
                  >
                    <div className="flex-1">
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, lineHeight: 1.3, color: colors.cream }}>{l.label}</div>
                      <div style={{ marginTop: 4, fontFamily: "'Barlow', sans-serif", fontSize: 13, color: colors.creamDim }}>{l.sub}</div>
                    </div>
                    <span style={{ color: colors.gold, fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>Open →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Footer lang="nl" />
      </main>
    </>
  );
}
