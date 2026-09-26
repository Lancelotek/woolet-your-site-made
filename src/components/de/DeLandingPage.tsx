import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import DeReservationCta from "@/components/de/DeReservationCta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";
import frame007 from "@/assets/frames-2026/oval-crystal.asset.json";
import frame009 from "@/assets/frames-2026/square-crystal.asset.json";
import { homeOnFaceCard } from "@/data/on-face-photos";
import { DEFAULT_FAQS, dePageTitles, dePages, type DePageConfig } from "@/content/de/landingPages";
import DeMobileReservationBar from "@/components/de/DeMobileReservationBar";

const SITE = "https://woolet.co";
const HERO_SRC = "/hero-greg-1000.webp";
const HERO_SRCSET = "/hero-greg-648.webp 648w, /hero-greg-1000.webp 1000w";
const HERO_SIZES = "(min-width: 1024px) 48vw, 100vw";

const ENGLISH_EQUIVALENT: Record<string, string> = {
  "brille-fuer-breites-gesicht": "/en/collections/wide-face-glasses",
  "breite-brille": "/en/collections/extra-wide-glasses",
  "brille-grosse-koepfe": "/en/collections/glasses-for-big-heads",
  "brillen-fuer-grosse-koepfe": "/en/collections/glasses-for-big-heads",
  "xxl-brille-herren": "/en/collections/oversized-sunglasses-men",
  "brille-breite-160-mm": "/en/collections/extra-wide-glasses",
};

function VipForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          ...getAttribution(), email, source: "DE", country: "Germany", country_code: "DE",
          utm_source: "de-landing", utm_campaign: "de-seo",
        },
      });
      if (functionError) throw functionError;
      if (data && !data.success) throw new Error(data.error || "Anmeldung fehlgeschlagen");
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <div className="mx-auto max-w-xl border border-primary/25 bg-primary/5 p-6 font-body text-foreground">Du stehst auf der VIP-Liste. Wir melden uns zum Kickstarter-Start mit deinem Founding-Preis.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-3 text-left">
      <label className="flex flex-col gap-2">
        <span className="font-body text-[11px] uppercase tracking-[0.22em] text-cream-dim">E-Mail</span>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="du@beispiel.de" className="w-full border-0 border-b border-border-sub bg-transparent px-0 py-3 font-body text-[15px] text-foreground outline-none focus:border-primary" />
      </label>
      <label className="mt-1 flex cursor-pointer items-start gap-3 font-body text-xs text-cream-dim">
        <input type="checkbox" checked={consent} onChange={() => setConsent((value) => !value)} className="mt-0.5 h-4 w-4 accent-primary" />
        <span>Ja, schickt mir das Founding-Angebot und Launch-Updates per E-Mail. Abmeldung jederzeit möglich.</span>
      </label>
      {error && <p className="font-body text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={loading || !consent} className="h-auto rounded-sm py-4 text-xs font-semibold uppercase tracking-[0.22em]">
        {loading ? "Wird gesendet..." : "Auf die VIP-Liste"}
      </Button>
    </form>
  );
}

function Section({ children, bordered = false }: { children: ReactNode; bordered?: boolean }) {
  return <section className={`relative px-5 py-16 sm:px-8 lg:px-16 lg:py-24 ${bordered ? "border-t border-border-sub" : ""}`}><div className="mx-auto max-w-[1100px]">{children}</div></section>;
}

const symptoms = [
  { title: "Druckstellen an den Schläfen", note: "Die Fassung klemmt, statt locker aufzuliegen.", icon: "((◉))" },
  { title: "Bügel stehen nach außen", note: "Sie werden aufgebogen und mit der Zeit immer lockerer.", icon: "↙ ─ ↘" },
  { title: "Die Front endet zu früh", note: "Die Gläser sitzen innerhalb deiner Augenlinie.", icon: "⊣ ◎ ⊢" },
];

function FitSymptoms() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-[520px] flex-col gap-5">
      <p className="m-0 font-display text-[1.35rem] italic text-woolet-white">Kommt dir das bekannt vor?</p>
      <ul className="m-0 grid list-none grid-cols-1 border-y border-border-sub p-0 text-woolet-white sm:grid-cols-3">
        {symptoms.map((symptom, index) => (
          <li key={symptom.title} className={`flex flex-col items-center gap-3 px-4 py-5 text-center sm:items-start sm:px-0 sm:text-left ${index > 0 ? "border-t border-border-sub sm:border-l sm:border-t-0 sm:pl-4" : ""}`}>
            <span className="font-body text-xl text-primary" aria-hidden="true">{symptom.icon}</span>
            <span className="font-body text-sm font-medium leading-snug">{symptom.title}</span>
            <span className="font-body text-xs leading-relaxed text-cream-dim">{symptom.note}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 font-body text-sm leading-relaxed text-cream-dim">Alle drei Zeichen bedeuten dasselbe: <strong className="font-semibold text-primary">Deine Fassung ist etwa 10-15 mm zu schmal.</strong> Woolet beginnt dort, wo andere aufhören.</p>
      <div className="border border-border-sub">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="h-auto w-full justify-between rounded-none px-4 py-3 font-body text-[10px] uppercase tracking-[0.2em] text-cream-dim hover:bg-secondary hover:text-foreground">
          Kennst du dein Maß? Zahlen ansehen <span className="text-primary">{open ? "-" : "+"}</span>
        </Button>
        {open && <div className="px-4 pb-5"><WidthMeter /></div>}
      </div>
    </div>
  );
}

function WidthMeter() {
  return (
    <div className="space-y-5 pt-3 font-body">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.22em] text-cream-dim"><span>Frontbreite</span><span>mm</span></div>
      <div className="relative h-6 border-y border-border-sub">
        <div className="absolute left-[8%] top-1/2 h-3 w-[28%] -translate-y-1/2 border border-border-sub bg-secondary" />
        <div className="absolute left-1/2 top-0 h-full w-[30%] bg-primary" />
      </div>
      <div className="flex justify-between text-[11px] text-cream-dim"><span>135</span><span>155</span><span>161</span><span>175</span></div>
      <div className="flex justify-between text-xs"><span className="text-cream-dim">Standard 138-148</span><span className="font-semibold text-primary">Woolet 155-161</span></div>
    </div>
  );
}

function FoundingBenefitsDe() {
  const benefits = [
    ["Founding-Preis 109 €", "statt 179 € - bei der Bestellung gesichert"],
    ["Kostenloser Versand nach Deutschland", "Kein Mindestbestellwert"],
    ["48 Stunden früher Zugang", "Farben und Modelle vor dem öffentlichen Start wählen"],
  ];
  return (
    <div className="overflow-hidden border border-primary/25 bg-primary/5" aria-label="Vorteile für Founding Member">
      <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Founding Member</div>
      {benefits.map(([title, text], index) => (
        <div key={title} className={`flex items-start gap-3 px-4 py-3 ${index < benefits.length - 1 ? "border-b border-border-sub" : ""}`}>
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-primary/45 text-[10px] text-primary">✓</span>
          <div><div className="font-body text-[13px] font-medium text-woolet-white">{title}</div><div className="mt-0.5 font-body text-xs leading-relaxed text-cream-dim">{text}</div></div>
        </div>
      ))}
    </div>
  );
}

export default function DeLandingPage({ config }: { config: DePageConfig }) {
  const faqs = config.faqs ?? DEFAULT_FAQS;
  const canonical = config.canonicalOverride ?? `${SITE}/de/${config.slug}`;
  const englishAlt = ENGLISH_EQUIVALENT[config.slug] || "/en";
  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: `Woolet - ${config.h1}`,
    description: config.metaDescription, brand: { "@type": "Brand", name: "Woolet" },
    material: "Italienisches Acetat (Mazzucchelli 1849)", image: `${SITE}${HERO_SRC}`,
    offers: { "@type": "Offer", url: canonical, priceCurrency: "EUR", price: DE_PRICING.founderPriceEur.toFixed(2), priceValidUntil: DE_PRICING.priceValidUntil, availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition", seller: { "@type": "Organization", name: "Woolet", url: SITE } },
  };
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) };

  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  const models = [
    { id: "007", shape: "Rund / Panto", specs: "52□21-150", image: frame007.url, onFace: homeOnFaceCard["007"] },
    { id: "009", shape: "Weiches Quadrat", specs: "54□22-150", image: frame009.url, onFace: homeOnFaceCard["009"] },
  ];

  return (
    <>
      <Helmet>
        <html lang="de" /><title>{config.metaTitle}</title><meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={canonical} /><link rel="alternate" hrefLang="de" href={canonical} /><link rel="alternate" hrefLang="en" href={`${SITE}${englishAlt}`} /><link rel="alternate" hrefLang="x-default" href={`${SITE}${englishAlt}`} />
        <meta property="og:type" content="website" /><meta property="og:locale" content="de_DE" /><meta property="og:title" content={config.metaTitle} /><meta property="og:description" content={config.metaDescription} /><meta property="og:url" content={canonical} /><meta property="og:image" content={`${SITE}${HERO_SRC}`} />
        <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={config.metaTitle} /><meta name="twitter:description" content={config.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script><script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <link rel="preload" as="image" type="image/webp" href={HERO_SRC} imageSrcSet={HERO_SRCSET} imageSizes={HERO_SIZES} />

      <main className="min-h-screen overflow-hidden bg-background text-foreground">
        <Navbar />
        <section className="relative px-5 pb-10 pt-8 sm:px-8 lg:px-16 lg:pb-14 lg:pt-14">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-7 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="contents lg:flex lg:flex-col lg:gap-7 lg:py-2">
              <div className="order-1 flex flex-col gap-5 lg:order-none lg:gap-7">
                <div className="woolet-eyebrow"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">155-161 mm - handgefertigt in der EU</span></div>
                <h1 className="max-w-[650px] font-display text-woolet-white" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", fontWeight: 300, lineHeight: 1.02 }}>
                  {config.h1Pre}<em className="text-gold-light">{config.h1Em}</em>{config.h1Post}
                </h1>
                <p className="max-w-[560px] font-body text-[1.02rem] leading-relaxed text-cream-dim">{config.sub}</p>
                {config.kurzeAntwort && (
                  <aside className="max-w-[560px] border-l-2 border-primary bg-primary/5 px-5 py-4">
                    <p className="m-0 font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Kurze Antwort</p>
                    <p className="m-0 mt-2 font-body text-[15px] leading-7 text-foreground">{config.kurzeAntwort}</p>
                  </aside>
                )}
              </div>

              <div className="order-5 lg:order-none"><FitSymptoms /></div>

              <div data-de-hero-reservation className="order-2 flex flex-col items-start gap-4 lg:order-none">
                <DeReservationCta source={config.slug} />
                <Button asChild variant="outline" className="h-auto rounded-sm border-border-sub bg-transparent px-7 py-4 font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream-dim hover:border-primary/40 hover:bg-transparent hover:text-foreground"><Link to="/de/fit">Erst Gesicht messen</Link></Button>
                <p className="max-w-xl font-body text-[13px] leading-5 text-cream-dim">1 € sichert dir eine nummerierte Founders Edition. Voll anrechenbar und jederzeit erstattbar.</p>
              </div>

              <div className="order-6 max-w-[520px] lg:order-none"><FoundingBenefitsDe /></div>
              <div className="order-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[0.78rem] text-cream-dim lg:order-none sm:gap-x-6"><span>Passform-Garantie</span><span aria-hidden="true">·</span><span>Mazzucchelli-Acetat</span><span aria-hidden="true">·</span><span>Handgefertigt in der EU</span></div>
            </div>

            <div className="order-3 relative max-h-[58vh] min-h-[360px] w-full overflow-hidden rounded-sm border border-border-sub sm:aspect-[4/5] sm:max-h-[680px] lg:order-none lg:aspect-auto lg:max-h-none lg:min-h-[600px]">
              <img src={HERO_SRC} srcSet={HERO_SRCSET} sizes={HERO_SIZES} alt={config.heroAlt} className="absolute inset-0 h-full w-full object-cover object-[center_25%]" loading="eager" fetchPriority="high" width={1000} height={1250} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/55" />
              <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-sm border border-border-sub bg-background/80 px-3 py-2 font-body text-xs backdrop-blur-md sm:bottom-5 sm:left-5"><span>Greg</span><span className="text-primary">Nutzer von WOOLET 009</span></div>
            </div>
          </div>
        </section>

        <Section bordered>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div><div className="woolet-eyebrow mb-5"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Passform verstehen</span></div><h2 className="font-display text-4xl leading-tight text-woolet-white lg:text-5xl">{config.problemTitle}</h2></div>
            <div className="space-y-8 font-body text-base leading-8 text-cream-dim"><p>{config.problemBody}</p><div className="border-l border-primary pl-6"><h3 className="mb-3 font-display text-2xl text-foreground">{config.detailTitle}</h3><p>{config.detailBody}</p></div></div>
          </div>
        </Section>

        <Section bordered>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="woolet-eyebrow mb-4"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Die Kollektion</span></div><h2 className="font-display text-3xl text-woolet-white lg:text-4xl">Zwei Formen. <em className="text-gold-light">Eine ehrliche Breite.</em></h2></div><Link to="/de/kollektion" className="font-body text-xs uppercase tracking-[0.22em] text-cream-dim no-underline hover:text-foreground">Kollektion ansehen -&gt;</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {models.map((model) => <Link key={model.id} to="/de/kollektion" className="group block border border-border-sub bg-secondary no-underline transition-all hover:-translate-y-1 hover:border-primary/50"><div className="relative aspect-[4/3] overflow-hidden bg-background"><img src={model.image} alt={`Woolet ${model.id} ${model.shape} breite Brille`} className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0" loading="lazy" /><img src={model.onFace} alt={`Woolet ${model.id} ${model.shape} auf einem breiten Gesicht`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" loading="lazy" /></div><div className="flex items-end justify-between gap-4 px-5 py-4"><div><div className="font-body text-[11px] uppercase tracking-[0.28em] text-primary">{model.id}</div><div className="mt-1 font-display text-xl text-woolet-white">Woolet {model.id}</div><div className="mt-1 font-body text-[10px] uppercase tracking-[0.2em] text-cream-dim">{model.shape} · {model.specs}</div></div><span className="font-body text-[10px] uppercase tracking-[0.2em] text-cream-dim">Ansehen -&gt;</span></div></Link>)}
          </div>
        </Section>

        <section className="border-y border-border-sub bg-secondary px-5 py-16 text-center sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Founding-Preis</p><h2 className="mt-4 font-display text-4xl text-foreground md:text-5xl">Breite Passform. Klarer Preis.</h2><div className="mt-6 flex items-baseline justify-center gap-4"><span className="font-display text-3xl text-cream-dim line-through">{formatDePrice(DE_PRICING.regularPriceEur)}</span><strong className="font-display text-6xl font-normal text-foreground">{formatDePrice(DE_PRICING.founderPriceEur)}</strong></div><p className="mt-3 font-body text-sm text-cream-dim">inkl. MwSt. · Kostenloser Versand nach Deutschland</p><DeReservationCta source={`${config.slug}_pricing`} className="mt-8" /></div></section>

        <section id="vip" className="border-b border-border-sub bg-secondary px-5 py-16 text-center sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><div className="woolet-eyebrow mb-4 justify-center"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Kickstarter · Founding Member</span></div><h2 className="font-display text-4xl text-foreground">Noch nicht bereit? Founding-Preis per E-Mail sichern.</h2><p className="mx-auto mb-8 mt-4 max-w-xl font-body text-[15px] leading-7 text-cream-dim">VIP-Mitglieder erhalten 48 Stunden vor dem öffentlichen Launch Zugang.</p><DeReservationCta source={`${config.slug}_vip`} variant="link" className="mb-7 inline-block font-body text-sm text-primary underline underline-offset-4" /><VipForm /></div></section>

        <Section bordered><h2 className="mb-6 font-display text-4xl text-foreground">Häufige Fragen</h2><Accordion type="single" collapsible>{faqs.map((faq, index) => <AccordionItem key={faq.q} value={`item-${index}`} className="border-border-sub"><AccordionTrigger className="text-left font-body text-base font-medium text-foreground">{faq.q}</AccordionTrigger><AccordionContent className="font-body text-[15px] leading-7 text-cream-dim">{faq.a}</AccordionContent></AccordionItem>)}</Accordion></Section>

        <Section bordered><div className="woolet-eyebrow mb-5"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Weiterlesen</span></div><h2 className="mb-7 font-display text-3xl text-foreground">Passende Ratgeber</h2><div className="grid gap-4 sm:grid-cols-2">{config.related.map((slug) => <Link key={slug} to={`/de/${slug}`} className="border border-border-sub bg-secondary p-6 no-underline transition-colors hover:border-primary/50"><div className="font-body text-[10px] uppercase tracking-[0.22em] text-primary">Woolet · DE</div><div className="mt-3 font-display text-2xl text-foreground">{dePages[slug].h1}</div><div className="mt-4 font-body text-[10px] uppercase tracking-[0.2em] text-cream-dim">{dePageTitles[slug]} -&gt;</div></Link>)}</div></Section>
        <Footer lang="de" />
        <DeMobileReservationBar />
      </main>
    </>
  );
}
