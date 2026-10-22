import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DE_PRICING, formatDePrice, markDeReserved } from "@/content/de/pricing";

/**
 * Stripe redirect target for the DE 1 € reservation link (plink_1UTMPa...).
 * Replaces the old hosted confirmation on stripe.com, after which a buyer
 * returned to the site and paid a second time (21.10.2026).
 */
export default function DeDanke() {
  // Set during render: child effects (the Navbar reservation CTA) run before
  // this component's own effect and must already see the reserved flag.
  if (typeof window !== "undefined") markDeReserved();
  useEffect(() => {
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = "en"; };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang="de" />
        <title>Danke - deine Reservierung steht | Woolet</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="woolet-eyebrow mb-5"><div className="woolet-eyebrow-line" /><span className="woolet-eyebrow-text">Reservierung bestätigt</span></div>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-light leading-[1.05] text-woolet-white">Danke. Dein Founder-Preis ist <em className="text-gold-light">gesichert.</em></h1>
          <p className="mt-6 font-body text-base leading-7 text-cream-dim">
            Du zahlst {formatDePrice(DE_PRICING.founderPriceEur)} statt {formatDePrice(DE_PRICING.regularPriceEur)}. Dein Euro wird voll angerechnet. Eine Bestätigung von Stripe ist unterwegs in dein Postfach.
          </p>
          <ol className="mt-8 grid list-none gap-4 p-0 font-body text-[15px] leading-7 text-foreground">
            <li><strong className="text-primary">1.</strong> Am 29. Oktober startet Woolet auf Kickstarter. Du bekommst deinen Zugang per E-Mail, eine Stunde vor allen anderen.</li>
            <li><strong className="text-primary">2.</strong> Unsicher bei der Größe? Miss dein Gesicht in 60 Sekunden.</li>
            <li><strong className="text-primary">3.</strong> Fragen? Schreib an <a href="mailto:support@woolet.co" className="text-primary underline underline-offset-4">support@woolet.co</a>.</li>
          </ol>
          <Link to="/de/fit" className="mt-10 inline-flex min-h-12 items-center bg-primary px-7 font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground no-underline">Passform messen</Link>
        </div>
      </section>
      <Footer lang="de" />
    </main>
  );
}
