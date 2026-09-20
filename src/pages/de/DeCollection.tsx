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
import fitTriptych from "@/assets/woolet-fit-triptych.webp.asset.json";

const SITE = "https://woolet.co";

export default function DeCollection() {
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  const products = [
    { id: "007", shape: "Rund / Panto", bridge: 21, image: frame007.url },
    { id: "009", shape: "Eckig / Soft Square", bridge: 22, image: frame009.url },
  ];
  const title = "Brillen für breite Gesichter - 158 mm Frontbreite | Woolet";
  const description = `Woolet 007 und 009 für breite Gesichter: 158 mm Frontbreite, 21-22 mm Steg, Mazzucchelli-Acetat. Founding-Preis ${formatDePrice(DE_PRICING.founderPriceEur)} inkl. MwSt.`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}/de/kollektion`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}/de/kollektion`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en/collection`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en/collection`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/de/kollektion`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <section className="px-5 pb-10 pt-12 sm:px-8 lg:px-16 lg:pb-14 lg:pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="woolet-eyebrow mb-5"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Die Kollektion</span></div>
          <h1 className="max-w-4xl font-display text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-[1.02] text-woolet-white">Brillen für breite Gesichter - <em className="text-gold-light">158 mm Frontbreite</em></h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-7 text-cream-dim">Zwei klare Formen für breite Gesichter. Mazzucchelli-Acetat, handgefertigt in der EU.</p>
          <div data-de-hero-reservation className="mt-8"><DeReservationCta source="kollektion_hero" /></div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-5xl">
          <figure className="m-0 overflow-hidden border border-border-sub">
            <Link to="/de/kollektion" aria-label="Zur deutschen Woolet Kollektion">
              <img src={fitTriptych.url} alt="Drei Männer mit Woolet Brillen in unterschiedlichen Breiten" width={1920} height={787} className="aspect-[1920/787] w-full object-cover" fetchPriority="high" />
            </Link>
          </figure>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="border border-border-sub bg-secondary">
                <div className="aspect-[4/3] overflow-hidden bg-cream"><img src={product.image} alt={`Woolet ${product.id} ${product.shape} in Havana Founder Acetate`} width={1200} height={900} className="h-full w-full object-contain" loading="lazy" /></div>
                <div className="p-6 sm:p-8">
                  <p className="font-body text-[10px] uppercase tracking-[0.24em] text-primary">Woolet {product.id}</p>
                  <h2 className="mt-2 font-display text-3xl font-normal text-foreground">{product.shape}</h2>
                  <p className="mt-3 font-body text-sm text-cream-dim">158 mm Frontbreite - Steg {product.bridge} mm - Havana Founder Acetat</p>
                  <div className="mt-6 flex items-baseline gap-3"><span className="font-display text-xl text-cream-dim line-through">{formatDePrice(DE_PRICING.regularPriceEur)}</span><strong className="font-display text-4xl font-normal text-foreground">{formatDePrice(DE_PRICING.founderPriceEur)}</strong><span className="font-body text-xs text-cream-dim">inkl. MwSt.</span></div>
                  <DeReservationCta source={`kollektion_${product.id}`} className="mt-6" />
                  <Link to="/de/fit" className="mt-5 inline-block font-body text-sm text-primary underline underline-offset-4">Erst Gesicht messen →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border-sub bg-secondary px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl"><p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Maßanfertigung</p><h2 className="mt-4 font-display text-4xl font-normal text-foreground">Außerhalb der Standardbreite?</h2><p className="mt-4 font-body leading-7 text-cream-dim">Für individuelle Maße fertigen wir Fassungen von 150 bis 172 mm.</p><Link to="/de/bespoke" className="mt-5 inline-block font-body text-sm text-primary underline underline-offset-4">Maßanfertigung ansehen →</Link></div>
      </section>
      <Footer lang="de" />
      <DeMobileReservationBar />
    </main>
  );
}