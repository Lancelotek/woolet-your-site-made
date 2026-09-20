import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeReservationCta from "@/components/de/DeReservationCta";
import DeMobileReservationBar from "@/components/de/DeMobileReservationBar";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import frame007 from "@/assets/products/woolet-007-round-black-card.webp.asset.json";
import frame009 from "@/assets/products/woolet-009-square-black-card.webp.asset.json";

const SITE = "https://woolet.co";
const HERO_SRC = "/hero-greg-1000.webp";
const HERO_SRCSET = "/hero-greg-648.webp 648w, /hero-greg-1000.webp 1000w";

export default function DeHub() {
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  const title = "Brillen für breite Gesichter und große Köpfe | Woolet";
  const description = `Woolet Brillen mit 158 mm Frontbreite. Mazzucchelli-Acetat, handgefertigt in der EU. Founding-Preis ${formatDePrice(DE_PRICING.founderPriceEur)} inkl. MwSt.`;
  const models = [
    { id: "007", shape: "Rund / Panto", specs: "52□21-150", image: frame007.url },
    { id: "009", shape: "Weiches Quadrat", specs: "54□22-150", image: frame009.url },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}/de`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      <section className="px-5 pb-12 pt-8 sm:px-8 lg:px-16 lg:pb-16 lg:pt-14">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="flex flex-col justify-center gap-6 lg:py-8">
            <div className="woolet-eyebrow"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Brillen für breite Gesichter</span></div>
            <h1 className="max-w-[680px] font-display text-[clamp(2.5rem,5vw,4.8rem)] font-light leading-[1.01] text-woolet-white">
              Endlich eine Brille, die <em className="text-gold-light">wirklich passt.</em>
            </h1>
            <p className="max-w-[590px] font-body text-base leading-7 text-cream-dim sm:text-lg">
              158 mm Frontbreite für breite Gesichter und große Köpfe. Mazzucchelli-Acetat, handgefertigt in der EU.
            </p>
            <div data-de-hero-reservation className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <DeReservationCta source="home_hero" />
              <Link to="/de/fit" className="inline-flex min-h-12 items-center border border-border-sub px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-cream-dim no-underline hover:border-primary/40 hover:text-foreground">Erst Passform messen</Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border-sub pt-5 font-body text-xs text-cream-dim">
              <span>109 € statt 179 € inkl. MwSt.</span><span>Kostenloser Versand nach Deutschland</span><span>Sichere Zahlung über Stripe</span>
            </div>
          </div>
          <Link to="/de/kollektion" aria-label="Deutsche Woolet Kollektion ansehen" className="relative block min-h-[390px] overflow-hidden border border-border-sub sm:aspect-[4/5] lg:min-h-[600px]">
            <img src={HERO_SRC} srcSet={HERO_SRCSET} sizes="(min-width: 1024px) 48vw, 100vw" alt="Greg trägt Woolet 009 mit 158 mm Frontbreite" width={1000} height={1250} className="absolute inset-0 h-full w-full object-cover object-[center_25%]" fetchPriority="high" />
            <div className="absolute inset-x-0 bottom-0 bg-background/80 px-5 py-4 font-body text-sm text-foreground backdrop-blur-md">Greg - Woolet 009</div>
          </Link>
        </div>
      </section>

      <section className="border-t border-border-sub px-5 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Die Kollektion</p><h2 className="mt-3 font-display text-4xl font-light text-foreground">Zwei Formen. <em className="text-gold-light">Eine ehrliche Breite.</em></h2></div>
            <Link to="/de/kollektion" className="font-body text-xs uppercase tracking-[0.18em] text-primary">Kollektion ansehen →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {models.map((model) => (
              <Link key={model.id} to="/de/kollektion" className="group border border-border-sub bg-secondary no-underline transition-colors hover:border-primary/50">
                <div className="aspect-[4/3] bg-background"><img src={model.image} alt={`Woolet ${model.id} ${model.shape}`} width={1200} height={900} loading="lazy" className="h-full w-full object-contain" /></div>
                <div className="flex items-end justify-between gap-4 p-5"><div><p className="font-body text-[10px] uppercase tracking-[0.24em] text-primary">Woolet {model.id}</p><h3 className="mt-1 font-display text-2xl text-foreground">{model.shape}</h3><p className="mt-1 font-body text-xs text-cream-dim">158 mm - {model.specs}</p></div><span className="font-body text-[10px] uppercase tracking-[0.18em] text-primary">Ansehen →</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border-sub bg-secondary px-5 py-16 sm:px-8 lg:px-16 lg:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-2 md:items-center">
          <div><p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Nicht raten</p><h2 className="mt-3 font-display text-4xl font-light text-foreground">Gesicht in etwa 20 Sekunden messen.</h2><p className="mt-4 max-w-xl font-body leading-7 text-cream-dim">FitLens misst deine Gesichtsbreite und zeigt dir, ob Woolet 007, 009 oder eine Maßanfertigung zu dir passt.</p></div>
          <Link to="/de/fit" className="inline-flex min-h-12 items-center justify-center justify-self-start bg-primary px-7 font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground no-underline">Passform messen</Link>
        </div>
      </section>

      <Footer lang="de" />
      <DeMobileReservationBar />
    </main>
  );
}