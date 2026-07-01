import { useParams, Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelPills from "@/components/ModelPills";
import SizeMatrix from "@/components/SizeMatrix";
import SEO from "@/components/SEO";
import { pushGtmEvent } from "@/lib/gtm";
import { isValidLang, type Lang } from "@/lib/i18n";
import { FRAMES } from "@/data/frames";



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
  ar: { title: "مجموعة Woolet — 007 و 009 للوجوه العريضة", description: "شكلان، عرض 155–172 ملم. أسيتات Mazzucchelli الإيطالي، صناعة يدوية في الاتحاد الأوروبي." },
  ja: { title: "Wooletコレクション — 幅広い顔のための007 & 009", description: "2つのシェイプ、幅155–172mm。イタリア製Mazzucchelliアセテート、EUで手作り。" },
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

              {/* Primary CTA → Fit Wizard */}
              <div className="pt-7">
                <Link
                  to={`/${lang}/fit`}
                  onClick={() =>
                    pushGtmEvent("collection_cta_fit_wizard_click", {
                      location: "collection_hero",
                      dest: "fit_wizard",
                      cta_label: "Find your FIT",
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
                  Find your FIT
                </Link>
              </div>
            </div>
          </section>

          {/* Models */}
          <section className="px-5 sm:px-8 lg:px-16 pb-4">
            <div className="max-w-5xl mx-auto">
              <ModelPills />
            </div>
          </section>

          {/* Bespoke */}
          <section className="px-5 sm:px-8 lg:px-16 py-16 lg:py-24">
            <div className="max-w-5xl mx-auto">
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">Bespoke</span>
              </div>
              <h2
                className="font-display text-woolet-white leading-[1.05] mb-5"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 300 }}
              >
                Not a standard size?{" "}
                <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                  Go bespoke.
                </em>
              </h2>
              <p
                className="text-cream-dim leading-relaxed max-w-2xl mb-10"
                style={{ fontSize: "1rem" }}
              >
                Every frame can be made to your exact measurements — from 150 mm up to
                172 mm front width, with a bridge tailored to your nose. Choose your
                acetate colour, finish, engraving, and lenses in the configurator.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {FRAMES.map((f) => (
                  <Link
                    key={f.id}
                    to="/en/bespoke/configurator"
                    onClick={() =>
                      pushGtmEvent("collection_bespoke_shape_click", {
                        location: "collection_bespoke",
                        shape: f.id,
                        shape_name: f.name,
                      })
                    }
                    className="group block border border-cream/10 bg-background/40 transition-all hover:border-gold/60 hover:bg-gold/[0.04]"
                    style={{ borderRadius: 2 }}
                  >
                    <div
                      className="relative overflow-hidden flex items-center justify-center"
                      style={{ background: "#EFE9DF", aspectRatio: "16 / 9" }}
                    >
                      <img
                        src={f.url}
                        alt={`${f.name} bespoke silhouette`}
                        loading="lazy"
                        className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="px-4 py-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-display text-cream" style={{ fontSize: 17, fontWeight: 400 }}>
                          {f.name}
                        </div>
                        <div className="font-display text-gold-light" style={{ fontSize: 17, fontWeight: 400 }}>
                          $480
                        </div>
                      </div>
                      <div className="text-cream-dim/80 mt-1" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                        Cut to your face · reference {f.widthMm} mm
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/en/bespoke/configurator"
                onClick={() =>
                  pushGtmEvent("collection_cta_bespoke_configurator_click", {
                    location: "collection_bespoke",
                    dest: "bespoke_configurator",
                    cta_label: "Configure bespoke",
                  })
                }
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                style={{
                  border: "1px solid hsl(var(--gold) / 0.55)",
                  color: "hsl(var(--gold-light))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  padding: "16px 28px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--gold))")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.55)")}
              >
                Configure bespoke →
              </Link>
            </div>
          </section>


          {/* Fit / size matrix */}
          <SizeMatrix
            fitHref={`/${lang}/fit`}
            bespokeHref={`/${lang}/bespoke`}
            sectionId="size-matrix"
            lang={lang}
            showCta={false}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Collection;
