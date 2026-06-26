import { useParams, Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ModelPills from "@/components/ModelPills";
import SizeMatrix from "@/components/SizeMatrix";
import SEO from "@/components/SEO";
import { pushGtmEvent } from "@/lib/gtm";
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
                The collection —{" "}
                <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                  built only in wide.
                </em>
              </h1>
              <p
                className="text-cream-dim leading-relaxed max-w-2xl"
                style={{ fontSize: "1rem" }}
              >
                Two shapes — round 007 and soft-square 009 — in 155, 158 and 161 mm widths,
                with bespoke up to 172 mm. Italian Mazzucchelli acetate, hand-finished in the EU.
              </p>

              {/* Primary CTAs → Fit Wizard */}
              <div className="flex flex-col sm:flex-row gap-3 pt-7">
                <Link
                  to={`/${lang}/fit`}
                  onClick={() =>
                    pushGtmEvent("collection_cta_fit_wizard_click", {
                      location: "collection_hero",
                      dest: "fit_wizard",
                      cta_label: "Find your size",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
                >
                  Find your size — Fit Wizard
                </Link>
                <Link
                  to={`/${lang}/fit/wizard`}
                  onClick={() =>
                    pushGtmEvent("collection_cta_fit_wizard_click", {
                      location: "collection_hero",
                      dest: "fit_wizard_quiz",
                      cta_label: "60-second quiz",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-colors text-foreground"
                  style={{
                    border: "1px solid hsl(0 0% 100% / 0.18)",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    padding: "18px 28px",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.6)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.18)")}
                >
                  Take the 60-sec quiz
                </Link>
              </div>
            </div>
          </section>

          {/* Models */}
          <section className="px-5 sm:px-8 lg:px-16 pb-4">
            <div className="max-w-5xl mx-auto">
              <ModelPills />

              {/* Inline CTA between models and size matrix */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-5 border" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
                <div>
                  <div className="text-cream-dim uppercase tracking-[0.22em] mb-1" style={{ fontSize: "0.7rem" }}>
                    Not sure which size?
                  </div>
                  <div className="text-foreground" style={{ fontSize: "0.95rem" }}>
                    Get a personal recommendation in 60 seconds.
                  </div>
                </div>
                <Link
                  to={`/${lang}/fit`}
                  onClick={() =>
                    pushGtmEvent("collection_cta_fit_wizard_click", {
                      location: "collection_inline",
                      dest: "fit_wizard",
                      cta_label: "Find your fit",
                    })
                  }
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all whitespace-nowrap"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.76rem",
                    padding: "14px 22px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
                >
                  Find your fit

                </Link>
              </div>
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
