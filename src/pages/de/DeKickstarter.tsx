import { hreflangLinks } from "@/seo/hreflangLinks";
import { commerceJson } from "@/lib/schema-offer";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DeReservationCta from "@/components/de/DeReservationCta";
import DeFounderSteps from "@/components/de/DeFounderSteps";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import heroAsset from "@/assets/kickstarter-hero.png.asset.json";
import frame007 from "@/assets/products/woolet-007-round-black-card.webp.asset.json";
import frame009 from "@/assets/products/woolet-009-square-black-card.webp.asset.json";
import ksFit158 from "@/assets/ks-fit/woolet-158-signature.jpg.asset.json";
import gregSquare from "@/assets/testimonials/greg-woolet-tester-square.webp";
import w009BlackAsset from "@/assets/woolet-009-black.png.asset.json";
import w009GreyAsset from "@/assets/woolet-009-grey.png.asset.json";
import w009TaupeAsset from "@/assets/woolet-009-taupe.png.asset.json";
import w009HavanaAsset from "@/assets/woolet-009-havana-front.png.asset.json";
import { imageSrcSet, imageVariant } from "@/lib/optimized-image";

const SITE = "https://woolet.co";

// Same hero gallery as /en/lp/kickstarter.
const GALLERY: { src: string; alt: string }[] = [
  { src: ksFit158.url, alt: "158 mm - The Signature: Woolet auf einem mittelgroßen bis großen Kopf" },
  { src: gregSquare, alt: "Greg, Woolet-Tester, trägt eine breite Woolet Fassung in Havana-Acetat" },
  { src: w009BlackAsset.url, alt: "Woolet 009 Soft Square - Black" },
  { src: w009GreyAsset.url, alt: "Woolet 009 Soft Square - Grau" },
  { src: w009TaupeAsset.url, alt: "Woolet 009 Soft Square - Taupe" },
  { src: w009HavanaAsset.url, alt: "Woolet 009 Soft Square - Havana" },
];

export default function DeKickstarter() {
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);
  const [activeImg, setActiveImg] = useState(0);
  const move = (direction: number) => setActiveImg((current) => (current + direction + GALLERY.length) % GALLERY.length);

  const offer = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Woolet Founders Edition",
    description: "Breite Acetatbrille in 158 mm, handgefertigt in der EU. Founding-Preis für die ersten 100 Reservierungen.",
    image: ["https://woolet.co/og-image.png", "https://woolet.co/og-007.png", "https://woolet.co/og-009.png"],
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
        <meta name="description" content="Reserviere für 1 € den Founding-Preis: 30 Fassungen für 109 €, danach 179 €. 158 mm breite Acetatfassungen für breite Gesichter, handgefertigt in der EU." />
        <link rel="canonical" href={`${SITE}/de/lp/kickstarter`} />
        {hreflangLinks("/de/lp/kickstarter")}
        <meta property="og:title" content="Woolet Founders Edition - Für 1 € reservieren" />
        <meta property="og:description" content="30 Fassungen für 109 €, danach 179 €. 1 € inkl. MwSt., vollständig anrechenbar und jederzeit erstattbar." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/de/lp/kickstarter`} />
        <meta property="og:image" content={`${SITE}${heroAsset.url}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{commerceJson(offer)}</script>
      </Helmet>

      <Navbar />

      <section className="border-b border-border-sub px-5 pb-14 pt-10 sm:px-8 md:pt-14 lg:px-16 lg:pb-20">
        <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 min-w-0 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden border border-border-sub bg-secondary">
              <img
                src={imageVariant(GALLERY[activeImg].src, 1000)}
                srcSet={imageSrcSet(GALLERY[activeImg].src, [640, 1000])}
                sizes="(min-width: 1024px) 46vw, 100vw"
                alt={GALLERY[activeImg].alt}
                width={1000}
                height={1250}
                className={`absolute inset-0 h-full w-full ${activeImg < 2 ? "object-cover" : "object-contain p-6"}`}
                fetchPriority="high"
              />
              <button type="button" aria-label="Vorheriges Bild" onClick={() => move(-1)} className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 border border-border bg-background/90 text-2xl text-foreground">‹</button>
              <button type="button" aria-label="Nächstes Bild" onClick={() => move(1)} className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 border border-border bg-background/90 text-2xl text-foreground">›</button>
              <span className="pointer-events-none absolute bottom-3 right-3 bg-background/90 px-3 py-2 font-body text-xs text-foreground" aria-live="polite">{activeImg + 1} / {GALLERY.length}</span>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {GALLERY.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Bild ${i + 1} zeigen: ${img.alt}`}
                  aria-pressed={i === activeImg}
                  className={`h-[72px] w-[72px] shrink-0 overflow-hidden bg-secondary p-0 ${i === activeImg ? "border-2 border-primary" : "border border-border-sub"}`}
                >
                  <img src={imageVariant(img.src, 160)} alt="" width={72} height={72} loading="lazy" className={`h-full w-full ${i < 2 ? "object-cover" : "object-contain"}`} />
                </button>
              ))}
            </div>
            <p className="mt-3 font-body text-[13px] text-cream-dim">{GALLERY[activeImg].alt}</p>
          </div>
          <div data-de-hero-reservation className="order-1 min-w-0 lg:order-2">
            <p className="mb-5 font-body text-xs uppercase tracking-[0.24em] text-primary">Founders Edition · {formatDePrice(DE_PRICING.founderPriceEur)} statt {formatDePrice(DE_PRICING.regularPriceEur)}</p>
            <h1 className="text-5xl font-normal leading-[1.04] text-foreground md:text-6xl">Brillen für breite Gesichter.</h1>
            <p className="mt-6 max-w-xl font-body text-base leading-7 text-cream-dim md:text-lg">Premium-Acetat aus Mailand, in der EU handgefertigt, gebaut für Gesichter ab 155 mm. Die Founder Edition 009 Black ist fertig und kommt aus Polen (EU), ohne Zoll.</p>
            <DeFounderSteps placement="kickstarter_hero" className="mt-8" />
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-body text-[13px] text-cream-dim">
              <span>Acetat aus Mailand</span><span>In der EU handgefertigt</span><span>Ab 155 mm Breite</span><span>Von unseren Testern getragen</span>
            </div>
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
              { image: frame007.url, model: "007", shape: "Round / Panto", specs: "158 · 21 · 53×47.6 · 150" },
              { image: frame009.url, model: "009", shape: "Soft Square", specs: "158 · 22 · 54×44 · 150" },
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