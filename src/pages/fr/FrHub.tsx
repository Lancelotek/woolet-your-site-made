import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { frPageOrder, frPages } from "@/content/fr/landingPages";
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
  { to: "/fr/collection", label: "La collection", sub: "Woolet 007 & 009 — 155, 158 et 161 mm" },
  { to: "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026", label: "Meilleures lunettes pour grosses têtes 2026", sub: "Comparatif des montures les plus larges réellement disponibles" },
  { to: "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large", label: "Quelle taille de solaires pour un visage large ?", sub: "Guide rapide : largeur de face, pont, branches" },
  { to: "/fr/products/007", label: "Woolet 007 — rond, 158 mm", sub: "Pont keyhole, acétate italien Mazzucchelli" },
  { to: "/fr/products/009", label: "Woolet 009 — carré adouci, 158 mm", sub: "Pour visages larges en contexte professionnel" },
  { to: "/fr/products/bespoke", label: "Bespoke — 145 à 162 mm sur mesure", sub: "Face, pont et branches au millimètre" },
];

export default function FrHub() {
  useEffect(() => {
    document.documentElement.lang = "fr";
    document.documentElement.dir = "ltr";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  return (
    <>
      <Helmet>
        <html lang="fr" dir="ltr" />
        <title>Lunettes pour visages larges et grosses têtes 155–161 mm | Woolet</title>
        <meta
          name="description"
          content="Woolet — lunettes larges pour grosses têtes en 155, 158 et 161 mm. Acétate italien Mazzucchelli 1849, fait main en UE. Mesurez votre visage en 20 secondes."
        />
        <meta name="keywords" content="lunettes pour visages larges, lunettes larges, lunettes grosses têtes, lunettes XXL homme, lunettes 161 mm, lunettes 160 mm, acétate Mazzucchelli, lunettes nez large" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

        <link rel="canonical" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="fr-FR" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="fr-BE" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="fr-CH" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="fr-CA" href={`${SITE}/fr`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE}/nl`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en`} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Woolet" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:title" content="Lunettes pour visages larges et grosses têtes — Woolet 155–161 mm" />
        <meta property="og:description" content="Acétate italien Mazzucchelli. Trois vraies largeurs : 155, 158 et 161 mm. Mesuré, pas deviné — avec FitLens en 20 secondes." />
        <meta property="og:url" content={`${SITE}/fr`} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Woolet — lunettes larges en acétate italien pour grosses têtes" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lunettes pour visages larges et grosses têtes — Woolet" />
        <meta name="twitter:description" content="155, 158 et 161 mm. Acétate italien Mazzucchelli. Mesurez votre visage en 20 secondes." />
        <meta name="twitter:image" content={`${SITE}/og-image.png`} />

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Woolet — Lunettes pour visages larges et grosses têtes",
          url: `${SITE}/fr`,
          inLanguage: "fr-FR",
          isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
          about: { "@type": "Thing", name: "Lunettes pour visages larges" },
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
            { "@type": "ListItem", position: 2, name: "France", item: `${SITE}/fr` },
          ],
        })}</script>
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        <header className="px-6 md:px-10" style={{ borderBottom: `1px solid ${colors.line}` }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between py-6">
            <Link to="/fr" aria-label="Woolet — accueil" style={{ display: "inline-flex" }}>
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
              Woolet · France
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
              Woolet — lunettes pour visages larges et grosses têtes
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
              Acétate italien Mazzucchelli 1849. Trois vraies largeurs : 155, 158 et 161 mm. Mesuré, pas deviné — avec FitLens en 20 secondes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/fr/fit"
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
                Mesurer mon visage — 20 s
              </Link>
              <Link
                to="/fr/collection"
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
                Voir la collection →
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
              Pour visages larges
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {frPageOrder.map((slug) => (
                <Link
                  key={slug}
                  to={`/fr/${slug}`}
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
                    {frPages[slug].primaryKeyword}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      lineHeight: 1.3,
                      color: colors.cream,
                    }}
                  >
                    {frPages[slug].h1}
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
                    {frPages[slug].sub}
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
                    Lire →
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
              Toutes les pages françaises
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
                    <span style={{ color: colors.gold, fontFamily: "'Barlow', sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>Ouvrir →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Footer lang="fr" />
      </main>
    </>
  );
}
