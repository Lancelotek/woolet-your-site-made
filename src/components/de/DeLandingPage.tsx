import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_FAQS,
  dePageOrder,
  dePageTitles,
  dePages,
  type DePageConfig,
} from "@/content/de/landingPages";

const SITE = "https://woolet.co";
const SCAN_HREF = "/de/fit";

const ENGLISH_EQUIVALENT: Record<string, string> = {
  "brille-fuer-breites-gesicht": "/en/collections/wide-face-glasses",
  "breite-brille": "/en/collections/extra-wide-glasses",
  "brille-grosse-koepfe": "/en/collections/glasses-for-big-heads",
  "xxl-brille-herren": "/en/collections/oversized-sunglasses-men",
  "brille-breite-160-mm": "/en/collections/extra-wide-glasses",
};

const colors = {
  ink: "#080807",
  inkSoft: "#121110",
  cream: "#EDE7D9",
  creamDim: "#9A8E7E",
  gold: "#CAA449",
  goldDim: "#A07A2A",
  line: "#2a2520",
};

function VipForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email,
          source: "DE",
          country: "Germany",
          country_code: "DE",
          utm_source: "de-landing",
          utm_campaign: "de-seo",
        },
      });
      if (fnError) throw fnError;
      if (data && !data.success) throw new Error(data.error || "Anmeldung fehlgeschlagen");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="p-6 border max-w-xl mx-auto"
        style={{ background: "rgba(202,164,73,0.06)", borderColor: "rgba(202,164,73,0.25)" }}
      >
        <p style={{ color: colors.cream, fontFamily: "'Barlow', sans-serif" }}>
          Du stehst auf der VIP-Liste. Wir melden uns zum Kickstarter-Start mit deinem Founding-Preis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: colors.creamDim,
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          E-Mail
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="du@beispiel.de"
          className="w-full px-0 py-3 bg-transparent outline-none"
          style={{
            color: colors.cream,
            borderBottom: `1px solid ${colors.line}`,
            fontFamily: "'Barlow', sans-serif",
            fontSize: 15,
          }}
        />
      </label>

      <label className="flex items-start gap-3 cursor-pointer mt-1" style={{ color: colors.creamDim, fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>
        <input type="checkbox" checked={consent} onChange={() => setConsent((v) => !v)} className="hidden" />
        <span
          className="flex items-center justify-center flex-shrink-0 mt-[2px]"
          style={{
            width: 14,
            height: 14,
            backgroundColor: consent ? colors.gold : "transparent",
            border: `1px solid ${consent ? colors.gold : colors.line}`,
          }}
        >
          {consent && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span>
          Ja, schickt mir das Founding-Angebot und Launch-Updates per E-Mail. Abmeldung jederzeit möglich.
        </span>
      </label>

      {error && (
        <p style={{ color: "#e25555", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !consent}
        className="w-full py-4 disabled:opacity-60 transition-colors"
        style={{
          background: colors.gold,
          color: colors.ink,
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontSize: 12,
        }}
      >
        {loading ? "Wird gesendet…" : "Auf die VIP-Liste"}
      </button>
    </form>
  );
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="px-6 md:px-10" style={style}>
      <div className="max-w-5xl mx-auto py-20 md:py-28">{children}</div>
    </section>
  );
}

function SizeCard({ mm, label }: { mm: string; label: string }) {
  return (
    <div
      className="p-8 flex flex-col gap-3"
      style={{ border: `1px solid ${colors.line}`, background: colors.inkSoft }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 56,
          lineHeight: 1,
          color: colors.gold,
          fontWeight: 400,
        }}
      >
        {mm}
        <span style={{ fontSize: 18, marginLeft: 6, color: colors.creamDim }}>mm</span>
      </div>
      <div
        style={{
          color: colors.cream,
          fontFamily: "'Barlow', sans-serif",
          fontSize: 14,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: colors.creamDim,
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        gemessen, nicht geraten
      </div>
    </div>
  );
}

function CtaButton({ to, children, variant = "primary" }: { to: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  const isPrimary = variant === "primary";
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center transition-colors"
      style={{
        padding: "16px 28px",
        background: isPrimary ? colors.gold : "transparent",
        color: isPrimary ? colors.ink : colors.gold,
        border: isPrimary ? "none" : `1px solid ${colors.gold}`,
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

export default function DeLandingPage({ config }: { config: DePageConfig }) {
  const faqs = config.faqs ?? DEFAULT_FAQS;
  const canonical = `${SITE}/de/${config.slug}`;
  const englishAlt = ENGLISH_EQUIVALENT[config.slug] || "/en";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Woolet",
    description: config.metaDescription,
    brand: { "@type": "Brand", name: "Woolet" },
    material: "Italienisches Acetat (Mazzucchelli 1849)",
    image: `${SITE}/og-image.png`,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "EUR",
      price: "129.00",
      availability: "https://schema.org/PreOrder",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const vipRef = useRef<HTMLDivElement>(null);
  const scrollToVip = (e: React.MouseEvent) => {
    e.preventDefault();
    vipRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    document.documentElement.lang = "de";
    return () => {
      document.documentElement.lang = "en";
    };
  }, []);

  const related = dePageOrder.filter((s) => s !== config.slug);

  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="de" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE}${englishAlt}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}${englishAlt}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.metaTitle} />
        <meta name="twitter:description" content={config.metaDescription} />
        <meta name="twitter:image" content={`${SITE}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <main style={{ background: colors.ink, color: colors.cream, minHeight: "100vh" }}>
        {/* TOP BAR */}
        <header
          className="px-6 md:px-10 absolute top-0 left-0 right-0 z-20"
          style={{ background: "transparent" }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between py-5">
            <Link to="/de" aria-label="Woolet — Startseite" className="inline-flex items-center">
              <img
                src="/src/assets/woolet-logo.png"
                alt="Woolet"
                className="h-7 md:h-8 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section
          className="px-6 md:px-10 relative overflow-hidden"
          style={{
            background: `radial-gradient(1200px 600px at 80% -10%, rgba(202,164,73,0.08), transparent 60%), ${colors.ink}`,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <div className="max-w-6xl mx-auto pt-24 md:pt-32 pb-20 md:pb-28 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div className="flex flex-col gap-7">
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: colors.gold,
                }}
              >
                Woolet · Made in Italy
              </span>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  lineHeight: 1.08,
                  fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                  color: colors.cream,
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {config.h1}
              </h1>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
                  lineHeight: 1.6,
                  color: colors.creamDim,
                  maxWidth: 560,
                  margin: 0,
                }}
              >
                {config.sub}
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <CtaButton to={SCAN_HREF}>Gesicht in 20 Sekunden messen</CtaButton>
                <a
                  href="#vip"
                  onClick={scrollToVip}
                  className="inline-flex items-center"
                  style={{
                    color: colors.gold,
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    padding: "16px 8px",
                    textDecoration: "none",
                  }}
                >
                  Zur VIP-Liste →
                </a>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src="/og-image.png"
                alt={`Woolet Brillen für ${config.primaryKeyword}`}
                loading="lazy"
                width={520}
                height={520}
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <Section>
          <div className="max-w-3xl">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 400,
                lineHeight: 1.15,
                color: colors.cream,
                margin: 0,
              }}
            >
              Drückt jede Brille nach einer Stunde an den Schläfen?
            </h2>
            <p
              style={{
                marginTop: 20,
                fontFamily: "'Barlow', sans-serif",
                fontSize: 16,
                lineHeight: 1.7,
                color: colors.creamDim,
              }}
            >
              Die meisten Fassungen enden bei 135–145 mm. Wenn dein Gesicht breiter ist, gibt es von der Stange keine echte Passform — du gibst auf, schickst zurück oder trägst etwas, das drückt. Das liegt nicht an dir. Es ist eine Lücke im Markt.
            </p>
          </div>
        </Section>

        {/* SIZE EXPLAINER */}
        <Section style={{ borderTop: `1px solid ${colors.line}` }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 400,
              color: colors.cream,
              margin: 0,
              marginBottom: 12,
            }}
          >
            Drei exakte Breiten — entwickelt für Köpfe, die Standardfassungen ignorieren.
          </h2>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              color: colors.creamDim,
              fontSize: 15,
              marginBottom: 36,
              maxWidth: 620,
            }}
          >
            155, 158 und 161 mm Frontbreite. Keine „large", keine Schätzung — Millimeter, die wirklich passen.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <SizeCard mm="155" label="schmaler" />
            <SizeCard mm="158" label="Standard" />
            <SizeCard mm="161" label="breit" />
          </div>
        </Section>

        {/* FITLENS BAND */}
        <section
          className="px-6 md:px-10"
          style={{
            background: colors.inkSoft,
            borderTop: `1px solid ${colors.line}`,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <div className="max-w-4xl mx-auto py-20 md:py-24 text-center flex flex-col items-center gap-6">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 400,
                color: colors.cream,
                margin: 0,
              }}
            >
              Kenne deine Gesichtsbreite in 20 Sekunden
            </h2>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                color: colors.creamDim,
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 580,
                margin: 0,
              }}
            >
              FitLens misst dein Gesicht mit der Handykamera und empfiehlt die richtige Größe — keine Schätzung, keine Rücksendung.
            </p>
            <div className="mt-2">
              <CtaButton to={SCAN_HREF}>Jetzt messen</CtaButton>
            </div>
          </div>
        </section>

        {/* MATERIAL */}
        <Section>
          <div className="grid md:grid-cols-[1fr_1fr] gap-10 items-start">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 400,
                color: colors.cream,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Italienisches Mazzucchelli-1849-Acetat, in Italien handgefertigt
            </h2>
            <ul className="flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Keyhole-Steg für breitere Nasen",
                "Zwei Formen: 007 rund, 009 eckig",
                "Verglasungsfertig (Sehstärke möglich)",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    color: colors.cream,
                    fontSize: 16,
                    lineHeight: 1.6,
                    paddingLeft: 22,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 10,
                      width: 10,
                      height: 1,
                      background: colors.gold,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* VIP */}
        <section
          id="vip"
          ref={vipRef}
          className="px-6 md:px-10"
          style={{
            background: colors.inkSoft,
            borderTop: `1px solid ${colors.line}`,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <div className="max-w-3xl mx-auto py-20 md:py-24 text-center">
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: colors.gold,
              }}
            >
              Kickstarter · Founding Member
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 400,
                color: colors.cream,
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              Sichere dir den Founding-Preis vor allen anderen
            </h2>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                color: colors.creamDim,
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              VIP-Mitglieder erhalten 48 Stunden vor dem öffentlichen Launch Zugang und den exklusiven Founding-Preis.
            </p>
            <VipForm />
          </div>
        </section>

        {/* FAQ */}
        <Section>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 400,
              color: colors.cream,
              margin: 0,
              marginBottom: 24,
            }}
          >
            Häufige Fragen
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                style={{ borderBottom: `1px solid ${colors.line}` }}
              >
                <AccordionTrigger
                  className="text-left"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    color: colors.cream,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    color: colors.creamDim,
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* RELATED */}
        <Section style={{ borderTop: `1px solid ${colors.line}` }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
              fontWeight: 400,
              color: colors.cream,
              margin: 0,
              marginBottom: 24,
            }}
          >
            Verwandte Seiten
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((slug) => (
              <Link
                key={slug}
                to={`/de/${slug}`}
                className="block p-6 transition-colors hover:bg-[rgba(202,164,73,0.05)]"
                style={{
                  border: `1px solid ${colors.line}`,
                  color: colors.cream,
                  fontFamily: "'Barlow', sans-serif",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: colors.gold, marginBottom: 8 }}>
                  Woolet · DE
                </div>
                <div style={{ fontSize: 17, color: colors.cream }}>{dePages[slug].h1}</div>
                <div style={{ marginTop: 10, fontSize: 12, color: colors.creamDim, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {dePageTitles[slug]} →
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* FOOTER STRIP */}
        <footer
          className="px-6 md:px-10"
          style={{ background: colors.ink, borderTop: `1px solid ${colors.line}` }}
        >
          <div className="max-w-5xl mx-auto py-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/de"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                color: colors.cream,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Woolet
            </Link>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: colors.creamDim }}>
              Made in Italy · Mazzucchelli 1849 Acetat
            </div>
            <Link
              to="/en/privacy-policy"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 12,
                color: colors.creamDim,
                textDecoration: "underline",
                textUnderlineOffset: 4,
              }}
            >
              Datenschutz
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
