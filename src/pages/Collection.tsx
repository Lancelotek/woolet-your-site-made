import { hrefFor, localePath } from "@/i18n/routeRegistry";
import { useParams, Link } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelPills from "@/components/ModelPills";
import SizeMatrix from "@/components/SizeMatrix";
import SEO from "@/components/SEO";
import WaitlistForm from "@/components/WaitlistForm";
import { pushGtmEvent } from "@/lib/gtm";
import { isValidLang, type Lang } from "@/lib/i18n";
import { FRAMES } from "@/data/frames";
import { collectionJsonLd } from "@/seo/product-collection-jsonld";
import fitTriptych from "@/assets/woolet-fit-triptych.webp.asset.json";



const seoData: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Collection — Woolet 007 & 009 for Wide Faces | 155–161 mm",
    description:
      "Two shapes — round 007 and soft-square 009 — in 155 / 158 / 161 mm widths, plus bespoke up to 172 mm. Italian Mazzucchelli acetate, handmade in the EU.",
  },
  pl: { title: "Kolekcja Woolet — 007 & 009 dla szerokich twarzy", description: "Dwa kształty, szerokości 155–161 mm. Włoski octan Mazzucchelli, ręcznie w UE." },
  fr: { title: "Collection Woolet — 007 & 009 pour visages larges", description: "Deux formes, largeurs 155–161 mm. Acétate italien Mazzucchelli, fait main en UE." },
  es: { title: "Colección Woolet — 007 & 009 para caras anchas", description: "Dos formas, anchos 155–161 mm. Acetato italiano Mazzucchelli, hecho a mano en la UE." },
  de: { title: "Woolet Kollektion — 007 & 009 für breite Gesichter", description: "Zwei Formen, Breiten 155–161 mm. Italienisches Mazzucchelli-Acetat, handgefertigt in der EU." },
  ar: { title: "مجموعة Woolet — 007 و 009 للوجوه العريضة", description: "شكلان، عرض 155–161 ملم. أسيتات Mazzucchelli الإيطالي، صناعة يدوية في الاتحاد الأوروبي." },
  ja: { title: "Wooletコレクション — 幅広い顔のための007 & 009", description: "2つのシェイプ、幅155–161mm。イタリア製Mazzucchelliアセテート、EUで手作り。" },
  nl: { title: "Woolet Collectie — 007 & 009 voor brede gezichten", description: "Twee vormen, breedtes 155–161 mm. Italiaans Mazzucchelli-acetaat, handgemaakt in de EU." },
};


const Collection = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  if (paramLang && !isValidLang(paramLang)) {
    // Invalid locale in URL: render NotFound instead of soft-redirecting
    // to /en/collection (which would silently rewrite the URL and drop
    // the mistake from crawlers' error signals).
    return <NotFound />;
  }

  const seo = seoData[lang];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        lang={lang}
        path="/collection"
        availableLangs={["en", "pl", "fr", "es", "de", "ar", "ja", "nl"]}
        jsonLd={collectionJsonLd(lang, seo.title, seo.description, [
          { id: "007", name: "Woolet 007 — Round Panto" },
          { id: "009", name: "Woolet 009 — Soft Square" },
          { id: "bespoke", name: "Woolet Bespoke — Custom" },
        ])}
      />
      {/* Preload LCP triptych so it starts fetching before React hydrates the <img> */}
      <link
        rel="preload"
        as="image"
        href={fitTriptych.url}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ fetchpriority: "high" } as any)}
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

        <main className="flex-1">
          {/* Waitlist band — above the fold */}
          <section className="px-5 sm:px-8 lg:px-16 pt-10 lg:pt-14 pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="woolet-eyebrow mb-4 justify-center">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">Founding members</span>
                <div className="woolet-eyebrow-line" />
              </div>
              <h2
                className="font-display text-woolet-white leading-[1.1] mb-3"
                style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", fontWeight: 300 }}
              >
                Wide-face frames drop soon —{" "}
                <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                  claim 40% off + free shipping.
                </em>
              </h2>
              <p className="text-cream-dim mb-6" style={{ fontSize: "0.95rem" }}>
                100 founding-member spots. No credit card.
              </p>
              <WaitlistForm lang={lang} utmSource="collection" />
            </div>
          </section>

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
                  to={hrefFor("fit", lang)}
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

          {/* Fit range triptych — visual proof of who Woolet fits */}
          <section className="px-5 sm:px-8 lg:px-16 pb-10">
            <div className="max-w-5xl mx-auto">
              <figure className="m-0">
                {/* Tablet & desktop: single triptych, aspect reserved to prevent CLS */}
                <img
                  src={fitTriptych.url}
                  alt="Three men wearing Woolet frames side by side — 150 mm bespoke fit on an average-to-wide face, 158 mm signature on a medium-to-large head, and 162 mm bespoke extra wide on a large head with a broad face."
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1920}
                  height={787}
                  sizes="(min-width: 1024px) 960px, (min-width: 640px) 92vw, 100vw"
                  className="hidden sm:block w-full h-auto"
                  style={{ aspectRatio: "1920 / 787", borderRadius: 2 }}
                />

                {/* Mobile: stack the three portraits with individual alts, each slot pre-sized */}
                <div className="grid sm:hidden grid-cols-1 gap-2">
                  {[
                    {
                      pos: "0% 0%",
                      eyebrow: "Average-to-wide faces",
                      label: "150 mm · Bespoke fit",
                      alt: "Man with average-to-wide face wearing Woolet 150 mm bespoke acetate glasses.",
                    },
                    {
                      pos: "50% 0%",
                      eyebrow: "Medium-to-large heads",
                      label: "158 mm · The Signature",
                      alt: "Bearded man with medium-to-large head wearing Woolet 158 mm signature acetate glasses.",
                    },
                    {
                      pos: "100% 0%",
                      eyebrow: "Large heads & broad faces",
                      label: "162 mm · Bespoke extra wide",
                      alt: "Bearded man with a large head and broad face wearing Woolet 162 mm bespoke extra-wide acetate glasses.",
                    },
                  ].map((panel) => (
                    <div key={panel.label} className="relative w-full overflow-hidden" style={{ borderRadius: 2 }}>
                      <div
                        role="img"
                        aria-label={panel.alt}
                        className="w-full"
                        style={{
                          aspectRatio: "640 / 787",
                          backgroundImage: `url(${fitTriptych.url})`,
                          backgroundSize: "300% 100%",
                          backgroundPosition: panel.pos,
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <div
                        className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-4 text-center"
                        style={{
                          background: "linear-gradient(to top, rgba(11,10,9,0.78) 0%, rgba(11,10,9,0) 100%)",
                        }}
                      >
                        <div
                          className="text-gold-light/80"
                          style={{ fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase" }}
                        >
                          {panel.eyebrow}
                        </div>
                        <div
                          className="text-cream mt-1"
                          style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500 }}
                        >
                          {panel.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <figcaption
                  className="text-cream-dim/80 mt-4 text-center hidden sm:block"
                  style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
                >
                  150 mm bespoke · 158 mm signature · 162 mm bespoke extra wide
                </figcaption>
              </figure>
            </div>
          </section>


          {/* Models */}
          <section className="px-5 sm:px-8 lg:px-16 pb-4">
            <div className="max-w-5xl mx-auto">
              <ModelPills waitlistAnchor="waitlist-form" />
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
                Every frame can be made to your exact measurements — from 145 mm up to
                162 mm front width, with a bridge tailored to your nose. Learn more about{" "}
                <Link to="/en/bespoke#bespoke-eyewear" className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                  bespoke eyewear
                </Link>{" "}
                or{" "}
                <Link to="/en/bespoke#bespoke-glasses-for-wide-faces" className="text-gold-light hover:text-gold no-underline border-b border-gold/40 hover:border-gold-light transition-colors">
                  bespoke glasses for wide faces
                </Link>, then choose your
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
            fitHref={hrefFor("fit", lang)}
            bespokeHref={hrefFor("bespoke", lang)}
            sectionId="size-matrix"
            lang={lang}
            showCta={false}
          />

          {/* Check also — internal links to bespoke anchors */}
          <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20" style={{ background: "hsl(var(--gold) / 0.03)" }}>
            <div className="max-w-4xl mx-auto">
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">Check also</span>
              </div>
              <h2
                className="font-display text-woolet-white leading-[1.05] mb-5"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
              >
                Still exploring?{" "}
                <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                  Go deeper.
                </em>
              </h2>
              <p
                className="text-cream-dim leading-relaxed max-w-2xl mb-8"
                style={{ fontSize: "1rem" }}
              >
                Learn how Woolet bespoke compares to traditional ateliers, and why our made-to-measure range is built for wide faces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/en/bespoke#bespoke-eyewear"
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "16px 28px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
                >
                  What is bespoke eyewear
                </Link>
                <Link
                  to="/en/bespoke#bespoke-glasses-for-wide-faces"
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    border: "1px solid hsl(var(--gold) / 0.55)",
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "16px 28px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--gold))")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.55)")}
                >
                  Bespoke glasses for wide faces
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Collection;
