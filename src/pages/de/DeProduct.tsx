import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeReservationCta from "@/components/de/DeReservationCta";
import DeVipForm from "@/components/de/DeVipForm";
import DeMobileReservationBar from "@/components/de/DeMobileReservationBar";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import { galleryOnFace, type OnFaceColourId } from "@/data/on-face-photos";
import { commerceJson } from "@/lib/schema-offer";
import oval007Havana from "@/assets/frames-2026/oval-havana.asset.json";
import oval007Black from "@/assets/frames-2026/oval-black.asset.json";
import oval007Crystal from "@/assets/frames-2026/oval-crystal.asset.json";
import square009Havana from "@/assets/frames-2026/square-havana.asset.json";
import square009Black from "@/assets/frames-2026/square-black.asset.json";
import square009Crystal from "@/assets/frames-2026/square-crystal.asset.json";

const SITE = "https://woolet.co";

type DeModel = {
  id: "007" | "009";
  shape: string;
  specs: string;
  bridge: string;
  intro: string;
  frames: Record<OnFaceColourId, string>;
};

const MODELS: Record<string, DeModel> = {
  "007": {
    id: "007",
    shape: "Rund / Panto",
    specs: "52□21-150",
    bridge: "21 mm Keyhole-Steg",
    intro: "Die runde Panto-Form mit 158 mm Frontbreite. Der Keyhole-Steg verteilt das Gewicht auf einer breiteren Nase, die 150 mm Bügel drücken nicht an den Schläfen.",
    frames: { havana: oval007Havana.url, black: oval007Black.url, crystal: oval007Crystal.url },
  },
  "009": {
    id: "009",
    shape: "Weiches Quadrat / Soft Square",
    specs: "54□22-150",
    bridge: "22 mm Steg",
    intro: "Die weich-eckige Form mit 158 mm Frontbreite. Klare Linien für breite Gesichter, ohne nur die Gläser zu vergrößern. 150 mm Bügel, die nicht an den Schläfen drücken.",
    frames: { havana: square009Havana.url, black: square009Black.url, crystal: square009Crystal.url },
  },
};

const COLOURS: { id: OnFaceColourId; name: string }[] = [
  { id: "havana", name: "Havana" },
  { id: "black", name: "Schwarz" },
  { id: "crystal", name: "Kristall" },
];

export default function DeProduct({ modelId }: { modelId: "007" | "009" }) {
  const model = MODELS[modelId];
  const [colour, setColour] = useState<OnFaceColourId>("havana");

  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  const path = `/de/produkte/${model.id}`;
  const title = `Woolet ${model.id} ${model.shape} - Brille für breite Gesichter (158 mm) | Woolet`;
  const description = `Woolet ${model.id} ${model.shape}: 158 mm Frontbreite, ${model.bridge}, Mazzucchelli-Acetat, handgefertigt in der EU. Founder-Preis ${formatDePrice(DE_PRICING.founderPriceEur)} statt ${formatDePrice(DE_PRICING.regularPriceEur)} inkl. MwSt.`;
  const onFace = galleryOnFace[model.id][colour];
  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: `Woolet ${model.id} ${model.shape}`,
    description, brand: { "@type": "Brand", name: "Woolet" }, material: "Italienisches Acetat (Mazzucchelli 1849)",
    image: model.frames.havana,
    offers: { "@type": "Offer", url: `${SITE}${path}`, priceCurrency: "EUR", price: DE_PRICING.founderPriceEur.toFixed(2), priceValidUntil: DE_PRICING.priceValidUntil, availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition", seller: { "@type": "Organization", name: "Woolet", url: SITE } },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}${path}`} />
        <link rel="alternate" hrefLang="de" href={`${SITE}${path}`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en/products/${model.id}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/en/products/${model.id}`} />
        <meta property="og:type" content="product" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}${path}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{commerceJson(productJsonLd)}</script>
      </Helmet>
      <Navbar />

      <section className="px-5 pb-12 pt-8 sm:px-8 lg:px-16 lg:pb-16 lg:pt-14">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-6 lg:items-start">
          <div className="aspect-[4/3] overflow-hidden border border-border-sub bg-cream lg:col-start-1 lg:row-start-1">
              <img src={model.frames[colour]} alt={`Woolet ${model.id} ${model.shape} in ${COLOURS.find((c) => c.id === colour)?.name}`} width={1200} height={900} className="h-full w-full object-contain" fetchPriority="high" />
            </div>
          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <nav className="font-body text-xs text-cream-dim"><Link to="/de/kollektion" className="underline underline-offset-4">Kollektion</Link> / Woolet {model.id}</nav>
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.24em] text-primary">Woolet {model.id}</p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,4vw,3.6rem)] font-light leading-[1.05] text-woolet-white">{model.shape}</h1>
              <p className="mt-2 font-body text-sm text-cream-dim">158 mm Frontbreite - {model.specs} - {model.bridge}</p>
            </div>
            <p className="font-body text-base leading-7 text-cream-dim">{model.intro}</p>

            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.22em] text-cream-dim">Farbe: {COLOURS.find((c) => c.id === colour)?.name}</p>
              <div className="mt-3 flex gap-3">
                {COLOURS.map((c) => (
                  <button key={c.id} type="button" onClick={() => setColour(c.id)} aria-pressed={colour === c.id} className={`min-h-[44px] rounded-sm border px-4 font-body text-sm ${colour === c.id ? "border-primary text-foreground" : "border-border-sub text-cream-dim"}`}>{c.name}</button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline gap-3 border-t border-border-sub pt-6">
              <span className="font-display text-xl text-cream-dim line-through">{formatDePrice(DE_PRICING.regularPriceEur)}</span>
              <strong className="font-display text-4xl font-normal text-foreground">{formatDePrice(DE_PRICING.founderPriceEur)}</strong>
              <span className="font-body text-xs text-cream-dim">inkl. MwSt. - nur 30 Fassungen</span>
            </div>

            <div data-de-hero-reservation className="flex flex-col items-start gap-4">
              <DeVipForm placement={`produkt_${model.id}`} variant="hero" />
              <DeReservationCta source={`produkt_${model.id}`} variant="link" />
            </div>

            <ul className="m-0 grid list-none gap-2 p-0 font-body text-sm text-cream-dim">
              <li>✓ Passt Gesichtern mit 153-163 mm Breite - <Link to="/de/fit" className="text-primary underline underline-offset-4">in 60 Sekunden messen</Link></li>
              <li>✓ Mazzucchelli-Acetat, handgefertigt in der EU</li>
              <li>✓ Verglasungsfertig für Einstärken- und Gleitsichtgläser</li>
              <li>✓ Kostenloser Versand nach Deutschland, 30 Tage Rückgabe</li>
            </ul>

            <p className="font-body text-sm text-cream-dim">Schmaler oder breiter? <Link to="/de/bespoke" className="text-primary underline underline-offset-4">Maßanfertigung von 145 bis 160 mm</Link></p>
          </div>
          <div className="order-3 aspect-[3/4] overflow-hidden border border-border-sub sm:aspect-[4/3] lg:order-none lg:col-start-1 lg:row-start-2">
              <img src={onFace.src} alt={`Woolet ${model.id} auf einem 158 mm breiten Gesicht`} width={onFace.width} height={onFace.height} className="h-full w-full object-cover object-[center_30%]" loading="lazy" />
            </div>
        </div>
      </section>

      <Footer lang="de" />
      <DeMobileReservationBar />
    </main>
  );
}
