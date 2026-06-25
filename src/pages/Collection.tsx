import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ModelPills from "@/components/ModelPills";
import SizeMatrix from "@/components/SizeMatrix";
import SEO from "@/components/SEO";
import { isValidLang, type Lang } from "@/lib/i18n";

const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Collection — Woolet 007 & 009 for Wide Faces | 155–172 mm",
    description:
      "Two shapes — round 007 and soft-square 009 — in 155 / 158 / 161 mm widths, plus bespoke up to 172 mm. Italian Mazzucchelli acetate, handmade in the EU.",
  },
  pl: { title: "Kolekcja Woolet — 007 & 009 dla szerokich twarzy", description: "Dwa kształty, szerokości 155–172 mm. Włoski octan Mazzucchelli, ręcznie w UE." },
  fr: { title: "Collection Woolet — 007 & 009 pour visages larges", description: "Deux formes, largeurs 155–172 mm. Acétate italien Mazzucchelli, fait main en UE." },
  es: { title: "Colección Woolet — 007 & 009 para caras anchas", description: "Dos formas, anchos 155–172 mm. Acetato italiano Mazzucchelli, hecho a mano en la UE." },
  de: { title: "Woolet Kollektion — 007 & 009 für breite Gesichter", description: "Zwei Formen, Breiten 155–172 mm. Italienisches Mazzucchelli-Acetat, handgefertigt in der EU." },
};

const Collection = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  if (paramLang && !isValidLang(paramLang)) {
    return <Navigate to="/en/collection" replace />;
  }

  const seo = seoData[lang];

  return (
    <>
      <SEO title={seo.title} description={seo.description} lang={lang} />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

        <main className="flex-1">
          {/* Intro */}
          <section className="px-5 sm:px-8 lg:px-16 pt-12 lg:pt-20 pb-10">
            <div className="max-w-5xl mx-auto">
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">The collection</span>
              </div>
              <h1
                className="font-display text-woolet-white leading-[1.05] mb-5"
                style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)", fontWeight: 300 }}
              >
                Two shapes.{" "}
                <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                  One honest width range.
                </em>
              </h1>
              <p
                className="text-cream-dim leading-relaxed max-w-2xl"
                style={{ fontSize: "1rem" }}
              >
                Woolet 007 (round) and 009 (soft-square) — built only in 155, 158 and 161 mm,
                with bespoke up to 172 mm. Italian Mazzucchelli acetate, hand-finished in the EU.
              </p>
            </div>
          </section>

          {/* Models */}
          <section className="px-5 sm:px-8 lg:px-16 pb-4">
            <div className="max-w-5xl mx-auto">
              <ModelPills />
            </div>
          </section>

          {/* Fit / size matrix */}
          <SizeMatrix
            fitHref={`/${lang}/fit`}
            bespokeHref={`/${lang}/bespoke`}
            sectionId="size-matrix"
            lang={lang}
          />
        </main>

        <Footer />
        <StickyMobileCTA />
      </div>
    </>
  );
};

export default Collection;
