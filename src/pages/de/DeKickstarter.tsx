import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DeReservationCta from "@/components/de/DeReservationCta";
import Footer from "@/components/Footer";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import heroAsset from "@/assets/kickstarter-hero.png.asset.json";
import frame007 from "@/assets/products/woolet-007-round-black-card.webp.asset.json";
import frame009 from "@/assets/products/woolet-009-square-black-card.webp.asset.json";

const SITE = "https://woolet.co";

export default function DeKickstarter() {
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  const offer = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Woolet Founders Edition",
    description: "Breite Acetatbrille in 158 mm, handgefertigt in der EU. Founding-Preis für die ersten 100 Reservierungen.",
    image: `${SITE}${heroAsset.url}`,
    brand: { "@type": "Brand", name: "Woolet" },
    offers: {
      "@type": "Offer",
      url: `${SITE}/de/lp/kickstarter`,
      price: DE_PRICING.founderPriceEur.toFixed(2),
      priceCurrency: "EUR",
      priceValidUntil: DE_PRICING.priceValidUntil,
      availability: "https://schema.org/PreOrder",
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>Woolet Founders Edition - Für 1 € reservieren</title>
        <meta name="description" content="Reserviere eine von 100 Woolet Founders Editions für 1 €. 158 mm breite Acetatfassungen für breite Gesichter, handgefertigt in der EU." />
        <link rel="canonical" href={`${SITE}/de/lp/kickstarter`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de/lp/kickstarter`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en/lp/kickstarter`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en/lp/kickstarter`} />
        <meta property="og:title" content="Woolet Founders Edition - Für 1 € reservieren" />
        <meta property="og:description" content="Eine von 100 Founders Editions sichern. 1 € inkl. MwSt., vollständig anrechenbar und jederzeit erstattbar." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/de/lp/kickstarter`} />
        <meta property="og:image" content={`${SITE}${heroAsset.url}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(offer)}</script>
      </Helmet>

      <header className="absolute inset-x-0 top-0 z-20 px-6 py-5 md:px-10">
        <Link to="/de" className="font-display text-2xl text-foreground no-underline">Woolet</Link>
      </header>

      <section className="relative min-h-[92svh] border-b border-border-sub">
        <img src={heroAsset.url} alt="Woolet Founders Edition Brille für breite Gesichter" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-6xl items-end px-6 pb-14 pt-28 md:items-center md:px-10 md:pb-20">
          <div className="max-w-2xl">
            <p className="mb-5 font-body text-xs uppercase tracking-[0.24em] text-primary">Kickstarter · Founders Edition</p>
            <h1 className="text-5xl font-normal leading-[1.02] text-foreground md:text-7xl">Die Brille, die breite Gesichter endlich ernst nimmt.</h1>
            <p className="mt-6 max-w-xl font-body text-base leading-7 text-cream-dim md:text-lg">158 mm Frontbreite, 21 oder 22 mm Keyhole-Steg und 150 mm Bügel. Italienisches Mazzucchelli-Acetat, handgefertigt in der EU.</p>
            <DeReservationCta source="kickstarter_hero" className="mt-8" />
            <p className="mt-4 max-w-lg font-body text-[13px] leading-5 text-cream-dim">1 € sichert dir eine nummerierte Founders Edition (max. {DE_PRICING.founderLimit}). Voll anrechenbar, jederzeit erstattbar.</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-4 font-body text-xs uppercase tracking-[0.24em] text-primary">Zwei Formen · Eine präzise Breite</p>
            <h2 className="text-4xl font-normal text-foreground md:text-5xl">007 Round/Panto und 009 Soft Square</h2>
          </div>
          <div className="grid gap-px bg-border-sub md:grid-cols-2">
            {[
              { image: frame007.url, model: "007", shape: "Round / Panto", specs: "158 · 21 · 52×52 · 150" },
              { image: frame009.url, model: "009", shape: "Soft Square", specs: "158 · 22 · 54×50 · 150" },
            ].map((frame) => (
              <article key={frame.model} className="bg-secondary p-7 md:p-10">
                <img src={frame.image} alt={`Woolet ${frame.model} ${frame.shape}`} className="aspect-[4/3] w-full object-contain" loading="lazy" />
                <p className="mt-6 font-body text-xs uppercase tracking-[0.22em] text-primary">Woolet {frame.model}</p>
                <h3 className="mt-2 text-3xl font-normal text-foreground">{frame.shape}</h3>
                <p className="mt-3 font-body text-sm text-cream-dim">{frame.specs}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border-sub bg-secondary px-6 py-20 text-center md:px-10 md:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Founding-Preis für die ersten {DE_PRICING.founderLimit}</p>
          <div className="mt-5 flex items-baseline justify-center gap-4">
            <span className="font-display text-3xl text-cream-dim line-through">{formatDePrice(DE_PRICING.regularPriceEur)}</span>
            <strong className="font-display text-6xl font-normal text-foreground">{formatDePrice(DE_PRICING.founderPriceEur)}</strong>
          </div>
          <p className="mt-2 font-body text-sm text-cream-dim">inkl. MwSt. · Kostenloser Versand nach Deutschland</p>
          <DeReservationCta source="kickstarter_price" className="mt-8" />
        </div>
      </section>

      <Footer lang="de" />
    </main>
  );
}