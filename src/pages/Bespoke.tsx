import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FAQS = [
  {
    q: "What are bespoke glasses?",
    a: "Bespoke glasses are eyewear made specifically for one person's face — frame width, bridge, temple length, and lens shape are all set from the wearer's measurements rather than chosen from a fixed size range. Woolet bespoke covers face widths from 150 mm to 172 mm, with a 21 mm keyhole bridge, hand-crafted in Italy from Mazzucchelli acetate.",
  },
  {
    q: "How much do bespoke glasses cost?",
    a: "Woolet bespoke frames are $299 for the first 100 Kickstarter backers (frame only, prescription lenses ordered separately at your local optician). Comparable atelier-made bespoke acetate frames typically retail at $900–$2,500.",
  },
  {
    q: "Can you really get glasses custom made to my face?",
    a: "Yes. We use an AI face scan (taken from your phone) that captures face width, bridge width, temple-to-temple distance, and ear position. The atelier translates those measurements into a frame cut from a single block of Italian acetate. Total lead time is roughly 8–10 weeks.",
  },
  {
    q: "Who should choose bespoke over the stock Woolet widths?",
    a: "Stock Woolet comes in three frame widths — 155 / 158 / 161 mm — with a 21–22 mm keyhole bridge. If your ideal frame width falls outside that stock range (below 155 mm or above 161 mm), bespoke covers the full 150–172 mm spectrum. The /en/fit scan tells you which path applies in 90 seconds.",
  },
  {
    q: "Where are Woolet bespoke frames made?",
    a: "Hand-crafted by a small atelier in northern Italy using Mazzucchelli acetate from Castiglione Olona. Each frame is cut, milled, and polished by hand — not CNC-finished — which is what allows the sub-millimeter custom dimensions.",
  },
  {
    q: "Can I get prescription, blue-light, or polarized lenses?",
    a: "Yes. The bespoke frame ships ready for any lens type — single vision, progressive, blue-light filter, or polarized sun (Cat 3). Lenses are fitted by your local optician using the standard PD and prescription details.",
  },
];

const BespokePage = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Woolet Bespoke Eyewear",
      serviceType: "Custom prescription eyewear",
      provider: {
        "@type": "Organization",
        name: "Woolet",
        url: "https://woolet.co",
      },
      areaServed: "Worldwide",
      description:
        "Bespoke (made-to-measure) acetate eyewear for face widths 150–172 mm. Italian Mazzucchelli acetate, 21 mm keyhole bridge, built from your AI face scan.",
      offers: {
        "@type": "Offer",
        price: "299",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
        url: "https://woolet.co/en/bespoke",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
        { "@type": "ListItem", position: 2, name: "Bespoke", item: "https://woolet.co/en/bespoke" },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Bespoke Eyewear — Custom Glasses Made to Your Face (150–172 mm)"
        description="Bespoke acetate glasses hand-crafted in Italy from your AI face scan. Face widths 150–172 mm, 21 mm keyhole bridge, Mazzucchelli acetate. $299 for the first 100 backers."
        lang="en"
        path="/bespoke"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="bg-background text-foreground min-h-screen">
        {/* Hero */}
        <section className="relative w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">BESPOKE · 150–172 MM</span>
            </div>
            <h1
              className="font-display text-woolet-white leading-[0.95] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}
            >
              Bespoke eyewear. <em className="italic text-gold-light">Made to your face.</em>
            </h1>
            <p className="text-cream-dim leading-relaxed max-w-2xl mb-10" style={{ fontSize: "1.05rem" }}>
              Custom glasses cut from a single block of Italian Mazzucchelli acetate, hand-crafted by a small atelier in northern Italy from your AI face scan.
              Frame widths from <span className="text-foreground">150 mm to 172 mm</span>, 21 mm keyhole bridge,
              ready for any lens — prescription, progressive, blue-light, or polarized sun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/en/fit"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                style={{
                  background: "hsl(var(--gold))",
                  color: "hsl(var(--background))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "18px 32px",
                }}
              >
                Scan your face · Reserve $299 spot
              </Link>
              <Link
                to="/en/fit/bespoke"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                style={{
                  border: "1px solid hsl(var(--gold) / 0.5)",
                  color: "hsl(var(--gold-light))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "18px 32px",
                }}
              >
                Learn about the process
              </Link>
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Who is bespoke for */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Who bespoke is <em className="italic text-gold-light">actually for</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
              Most wide-face wearers fit the stock Woolet range — three frame widths (155 / 158 / 161 mm) with a 21–22 mm keyhole bridge, engineered for faces around 155 mm and above. Bespoke exists for the people the stock range cannot serve: anyone whose ideal frame width sits below 155 mm or above 161 mm, covering 150–172 mm in total.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {[
                "Frame width 150–172 mm (outside the stock 155 / 158 / 161 mm widths)",
                "Asymmetric ears or significant pantoscopic-tilt needs",
                "Very high or very low nose bridge — beyond what acetate reshaping can correct",
                "Wearers who simply want a one-of-one frame, cut to their face",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-cream-dim leading-relaxed"
                  style={{ fontSize: "0.9rem" }}
                >
                  <span className="text-gold-light flex-shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Process */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">THE PROCESS · 8–10 WEEKS</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Four steps from your face to a finished frame.
            </h2>
            <ol className="space-y-8">
              {[
                {
                  n: "01",
                  t: "AI face scan",
                  d: "Take a 90-second scan from your phone. We capture face width, bridge, temple-to-temple, and ear position to sub-millimeter precision.",
                },
                {
                  n: "02",
                  t: "Frame design",
                  d: "Pick a shape — round/panto (007) or soft square (009). We translate your measurements into a CAD drawing and send it back for approval.",
                },
                {
                  n: "03",
                  t: "Italian atelier",
                  d: "The frame is cut, milled, and hand-polished from a single block of Mazzucchelli acetate in northern Italy. No CNC finishing — each piece is shaped by hand.",
                },
                {
                  n: "04",
                  t: "Shipped to you",
                  d: "Frame arrives ready for lenses. Take it to your local optician with your prescription, PD, and preferred lens type (clear, blue-light, polarized, or progressive).",
                },
              ].map((s) => (
                <li key={s.n} className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
                  <span
                    className="font-display text-gold-light"
                    style={{ fontSize: "1.6rem", fontWeight: 300, lineHeight: 1 }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-woolet-white mb-2" style={{ fontSize: "1.15rem", fontWeight: 400 }}>
                      {s.t}
                    </h3>
                    <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.9rem" }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Materials */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              <em className="italic text-gold-light">Mazzucchelli</em> acetate. Hand-crafted in Italy.
            </h2>
            <p className="text-cream-dim leading-relaxed max-w-2xl" style={{ fontSize: "0.95rem" }}>
              Every bespoke frame uses Mazzucchelli acetate from Castiglione Olona — the same material used by Cutler &amp; Gross, Jacques Marie Mage, and most premium Italian houses. It is denser and heavier than TR90 thermoplastic, but it can be heat-adjusted by any optician for ongoing fit corrections. That post-purchase adjustability is the difference between a frame that fits for a week and one that fits for a decade.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Pricing */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">PRICING · LIMITED TO 100 BACKERS</span>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8"
              style={{ border: "1px solid hsl(var(--gold) / 0.25)", background: "hsl(var(--gold) / 0.03)" }}
            >
              <div>
                <div className="text-cream-dim uppercase tracking-[0.2em] mb-2" style={{ fontSize: "0.6rem" }}>
                  Kickstarter price
                </div>
                <div className="font-display text-gold-light" style={{ fontSize: "2.4rem", fontWeight: 300, lineHeight: 1 }}>
                  $299
                </div>
                <div className="text-cream-dim mt-2" style={{ fontSize: "0.8rem" }}>
                  First 100 backers · frame only
                </div>
              </div>
              <div>
                <div className="text-cream-dim uppercase tracking-[0.2em] mb-2" style={{ fontSize: "0.6rem" }}>
                  Comparable atelier-made
                </div>
                <div className="font-display" style={{ fontSize: "2.4rem", fontWeight: 300, lineHeight: 1, color: "hsl(var(--cream-dim))", textDecoration: "line-through" }}>
                  $900+
                </div>
                <div className="text-cream-dim mt-2" style={{ fontSize: "0.8rem" }}>
                  Typical bespoke acetate retail
                </div>
              </div>
            </div>
            <p className="text-cream-dim leading-relaxed mt-6" style={{ fontSize: "0.85rem" }}>
              Reservation is $1 to hold your spot. Full $299 charged when production starts. Prescription lenses are ordered separately at your local optician.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* FAQ */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Bespoke eyewear — common questions
            </h2>
            <div className="space-y-8">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="font-display text-woolet-white mb-3" style={{ fontSize: "1.1rem", fontWeight: 400 }}>
                    {f.q}
                  </h3>
                  <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.92rem" }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-24" style={{ background: "hsl(var(--gold) / 0.04)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300 }}
            >
              Reserve your <em className="italic text-gold-light">bespoke</em> spot.
            </h2>
            <p className="text-cream-dim leading-relaxed mb-8 max-w-xl mx-auto" style={{ fontSize: "0.95rem" }}>
              100 spots at $299. Reservation costs $1 and is fully refundable.
            </p>
            <Link
              to="/en/fit"
              className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
              style={{
                background: "hsl(var(--gold))",
                color: "hsl(var(--background))",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                fontSize: "0.72rem",
                padding: "18px 32px",
              }}
            >
              Start AI face scan
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BespokePage;
