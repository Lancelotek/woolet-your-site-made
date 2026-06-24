import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { dePageOrder, dePageTitles, dePages } from "@/content/de/landingPages";

const SITE = "https://woolet.co";

const colors = {
  ink: "#080807",
  inkSoft: "#121110",
  cream: "#EDE7D9",
  creamDim: "#9A8E7E",
  gold: "#CAA449",
  line: "#2a2520",
};

export default function DeHub() {
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>Woolet – Brillen für breite Gesichter und große Köpfe</title>
        <meta
          name="description"
          content="Woolet fertigt Brillen für breite Gesichter und große Köpfe – 155, 158, 161 mm aus italienischem Mazzucchelli-Acetat. Miss dein Gesicht in 20 Sekunden mit FitLens."
        />
        <link rel="canonical" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en`} />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content="Woolet – Brillen für breite Gesichter und große Köpfe" />
        <meta property="og:url" content={`${SITE}/de`} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        <section className="px-6 md:px-10">
          <div className="max-w-5xl mx-auto pt-28 pb-16">
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              Woolet · Deutschland
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
              Woolet – Brillen für breite Gesichter und große Köpfe
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
              Italienisches Mazzucchelli-1849-Acetat. Drei echte Breiten: 155, 158 und 161 mm. Gemessen, nicht geraten — mit FitLens in 20 Sekunden.
            </p>
            <div className="mt-8">
              <Link
                to="/de/fit"
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
                Gesicht in 20 Sekunden messen
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-10" style={{ borderTop: `1px solid ${colors.line}` }}>
          <div className="max-w-5xl mx-auto py-20 grid sm:grid-cols-2 gap-5">
            {dePageOrder.map((slug) => (
              <Link
                key={slug}
                to={`/de/${slug}`}
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
                  {dePageTitles[slug]}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    lineHeight: 1.2,
                    color: colors.cream,
                  }}
                >
                  {dePages[slug].h1}
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
                  {dePages[slug].sub}
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
                  Mehr lesen →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
