import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { FitClusterNav } from "@/components/FitToolContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SIZE_ROWS: Array<{
  width: string;
  bridge: string;
  path: "stock" | "bespoke";
  pathLabel: string;
  note: string;
}> = [
  { width: "145–154 mm", bridge: "20–22 mm", path: "bespoke", pathLabel: "Bespoke", note: "Below the signature front" },
  { width: "155–161 mm", bridge: "21–22 mm", path: "stock", pathLabel: "Signature · 007 / 009", note: "158 mm front — the signature fit" },
  { width: "162 mm", bridge: "22–24 mm", path: "bespoke", pathLabel: "Bespoke", note: "Ceiling of made-to-measure" },
  { width: "Above 162 mm", bridge: "—", path: "bespoke", pathLabel: "Not built", note: "Wider than we build" },
];

const FAQS = [
  {
    q: "How do I know if I need bespoke instead of stock?",
    a: "Run the AI Fit Scan. If it returns a face width between 155 and 161 mm with a 21–22 mm bridge, stock Woolet 007 or 009 will fit. Below 155 mm, above 161 mm, or any bridge outside 21–22 mm — bespoke is the only path that fits cleanly.",
  },
  {
    q: "What does bespoke actually control?",
    a: "Four dimensions: frame width, bridge width, temple length, and pantoscopic tilt. The lens shape catalog is unchanged — you still pick between 007 round/panto or 009 soft-square. Bespoke scales the chosen shape to your face.",
  },
  {
    q: "What's the lead time?",
    a: "Roughly 8–10 weeks. Week 1: scan and CAD approval. Weeks 2–7: hand-cut and polished at the European atelier. Week 8: QC and shipping. Weeks 9–10: lens fitting at your local optician.",
  },
  {
    q: "How much do bespoke glasses cost?",
    a: "$299 for the first 100 Kickstarter backers (frame only). Comparable atelier-made bespoke acetate frames retail at $900–$2,500. Prescription lenses are ordered separately at your local optician.",
  },
  {
    q: "Do I need to visit a fitter in person?",
    a: "No. The entire process runs from the fit scan on your phone. The atelier receives digitized measurements plus a CAD approval — no in-person fitting needed.",
  },
  {
    q: "What if it doesn't fit when it arrives?",
    a: "Acetate is heat-adjustable at any local optician for free, which resolves ~90% of fit issues. Anything beyond optician adjustment is remade under the bespoke guarantee.",
  },
];

const JSON_LD = [
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
      { "@type": "ListItem", position: 2, name: "Virtual fit", item: "https://woolet.co/en/fit" },
      { "@type": "ListItem", position: 3, name: "Bespoke sizing", item: "https://woolet.co/en/fit/bespoke" },
    ],
  },
];

export default function FitBespoke() {
  return (
    <>
      <SEO
        title="Bespoke Sizing 145–172 mm — Woolet Made-to-Measure"
        description="Made-to-measure Woolet frames from 145 mm to 162 mm front width, 20–24 mm bridge. Hand made in EU from Mazzucchelli acetate from Milan."
        lang="en"
        path="/fit/bespoke"
        jsonLd={JSON_LD}
      />
      <Navbar />

      <main className="bg-background text-foreground min-h-screen">
        {/* Hero */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 text-cream-dim"
              style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
            >
              <Link to="/en" className="text-cream-dim hover:text-gold-light no-underline">Home</Link>
              <span className="opacity-30 mx-2">/</span>
              <Link to="/en/fit" className="text-cream-dim hover:text-gold-light no-underline">Virtual fit</Link>
              <span className="opacity-30 mx-2">/</span>
              <span className="text-woolet-white">Bespoke sizing</span>
            </nav>

            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">BESPOKE · 145–172 MM</span>
            </div>

            <h1
              className="font-display text-woolet-white leading-[0.95] mb-6"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", fontWeight: 300 }}
            >
              Bespoke sizing, <em className="italic text-gold-light">in one table.</em>
            </h1>
            <p className="text-cream-dim leading-relaxed max-w-2xl" style={{ fontSize: "1rem" }}>
              The reference for everyone deciding between the signature Woolet (158 mm) and a made-to-measure
              frame. Total frame width from <span className="text-foreground">145 mm to 162 mm</span>, bridge
              20 to 24 mm, hand-cut in the EU from Mazzucchelli acetate from Milan.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Size table */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">THE FULL SIZE TABLE</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-8"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Stock or <em className="italic text-gold-light">bespoke</em>, at a glance.
            </h2>

            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table
                className="w-full"
                style={{
                  borderCollapse: "collapse",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.9rem",
                  minWidth: 640,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--gold) / 0.3)" }}>
                    {["Face width", "Bridge", "Path", "Notes"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-cream-dim"
                        style={{
                          padding: "14px 18px",
                          fontWeight: 500,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          fontSize: "0.62rem",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_ROWS.map((r, i) => (
                    <tr
                      key={r.width}
                      style={{
                        borderBottom: "1px solid hsl(0 0% 100% / 0.06)",
                        background: i % 2 === 1 ? "hsl(var(--gold) / 0.025)" : "transparent",
                      }}
                    >
                      <td className="text-woolet-white" style={{ padding: "16px 18px", fontWeight: 500 }}>
                        {r.width}
                      </td>
                      <td className="text-cream-dim" style={{ padding: "16px 18px" }}>
                        {r.bridge}
                      </td>
                      <td
                        style={{
                          padding: "16px 18px",
                          color: r.path === "bespoke" ? "hsl(var(--gold-light))" : "hsl(var(--woolet-white))",
                          fontWeight: 500,
                        }}
                      >
                        {r.pathLabel}
                      </td>
                      <td className="text-cream-dim" style={{ padding: "16px 18px" }}>
                        {r.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-cream-dim leading-relaxed mt-8 max-w-2xl" style={{ fontSize: "0.85rem" }}>
              "Face width" is the total horizontal width of the frame (lens + bridge + lens + hinge allowance),
              not just lens width. Bespoke covers everything the signature 158 mm can't — 145–154 mm below and
              162 mm above. Wider than 162 mm we do not build.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Decision matrix */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-8"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              The <em className="italic text-gold-light">honest</em> decision.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "Stock wins",
                  body: "Face 155–161 mm with a 21–22 mm bridge. Same Mazzucchelli acetate, $114–$190, 2–3 week lead time.",
                  cta: { label: "See 007 / 009", to: "/en/products/009" },
                },
                {
                  title: "Bespoke wins",
                  body: "Face outside 155–161 mm or bridge outside 21–22 mm. Asymmetric ears. Unusual pantoscopic tilt. Stock can't fit. See why our bespoke glasses for wide faces are the right path.",
                  cta: { label: "Bespoke glasses for wide faces", to: "/en/bespoke#bespoke-glasses-for-wide-faces" },
                },
                {
                  title: "Not sure",
                  body: "Run the 90-second AI Fit Scan. It returns your face width and bridge, then routes you to stock or bespoke automatically.",
                  cta: { label: "Start AI Fit Scan", to: "/en/fit" },
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex flex-col p-7"
                  style={{ border: "1px solid hsl(0 0% 100% / 0.08)", background: "hsl(var(--gold) / 0.03)" }}
                >
                  <h3
                    className="font-display text-woolet-white mb-3"
                    style={{ fontSize: "1.1rem", fontWeight: 400 }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-cream-dim leading-relaxed mb-6 flex-1"
                    style={{ fontSize: "0.88rem" }}
                  >
                    {c.body}
                  </p>
                  <Link
                    to={c.cta.to}
                    className="text-gold-light no-underline uppercase"
                    style={{ fontSize: "0.62rem", letterSpacing: "0.24em" }}
                  >
                    {c.cta.label} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* FAQ */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">BESPOKE FAQ</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Common questions, plain answers.
            </h2>
            <div>
              {FAQS.map((f, i) => (
                <details
                  key={f.q}
                  className="py-5"
                  style={{
                    borderTop: i === 0 ? "1px solid hsl(0 0% 100% / 0.08)" : undefined,
                    borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
                  }}
                >
                  <summary
                    className="cursor-pointer text-woolet-white font-display"
                    style={{ fontSize: "1.02rem", fontWeight: 400, listStyle: "none" }}
                  >
                    {f.q}
                  </summary>
                  <p
                    className="text-cream-dim leading-relaxed mt-3"
                    style={{ fontSize: "0.92rem" }}
                  >
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Check also — internal links to bespoke anchors */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">Check also</span>
            </div>
            <h2
              className="font-display text-woolet-white leading-[1.05] mb-5"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Compare the full bespoke{" "}
              <em className="italic text-gold-light" style={{ fontStyle: "italic" }}>
                offering.
              </em>
            </h2>
            <p
              className="text-cream-dim leading-relaxed max-w-2xl mb-8"
              style={{ fontSize: "1rem" }}
            >
              See how Woolet defines bespoke eyewear and why our 145–172 mm range is made for faces standard brands ignore.
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
              >
                Bespoke glasses for wide faces
              </Link>
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Final CTA */}
        <section
          className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-24"
          style={{ background: "hsl(var(--gold) / 0.04)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="font-display text-woolet-white mb-5"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300 }}
            >
              Get your size in <em className="italic text-gold-light">90 seconds.</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-8 max-w-xl mx-auto" style={{ fontSize: "0.95rem" }}>
              The AI Fit Scan tells you stock or bespoke before you commit to anything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                Start AI Fit Scan
              </Link>
              <Link
                to="/en/blog/bespoke-eyewear-size-range-145-172mm-guide"
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
                Read the full size guide
              </Link>
            </div>
          </div>
          <div className="max-w-3xl mx-auto" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid hsl(var(--gold) / 0.16)" }}>
            <FitClusterNav current="/en/fit/bespoke" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
