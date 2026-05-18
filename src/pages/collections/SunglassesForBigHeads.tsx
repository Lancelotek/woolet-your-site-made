import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE = "https://woolet.co";
const PATH = "/collections/sunglasses-for-big-heads";
const CANONICAL = `${SITE}/en${PATH}`;

const faqs = [
  {
    q: "How many mm is considered wide for sunglasses?",
    a: "Mainstream sunglasses sit at 138 to 148 mm across the front. Anything above 150 mm is wide. Woolet starts at 155 mm and runs to 161 mm in standard sizes, with bespoke up to 172 mm. The first number printed inside the temple is lens width, not front width, so it can be misleading.",
  },
  {
    q: "What head circumference is considered big?",
    a: "Around 58 to 60 cm is large, 60 to 62 cm is XL, and above 62 cm is XXL. Woolet sizes map to these ranges: 155 mm front for 58 to 60 cm, 158 mm for 60 to 62 cm, 161 mm for 62 to 64 cm, and bespoke above 64 cm.",
  },
  {
    q: "Where do you buy sunglasses for big heads?",
    a: "Specialist makers like Woolet design from 155 mm front width upward. Mass-market brands mostly cap at 145 to 148 mm even on their oversized models, so the lenses are larger but the front is the same. If your temples pinch, you need a larger front, not a larger lens.",
  },
  {
    q: "Can I get sunglasses custom-made for my head size?",
    a: "Yes. Bespoke covers 150 to 172 mm of front width in either shape (007 round or 009 soft square), with temples up to 155 mm. Same Italian Mazzucchelli acetate as the standard line, made to your measurement.",
  },
  {
    q: "Are Woolet sunglasses polarized?",
    a: "Polarised lenses are available as an upgrade on both 007 and 009. Standard lenses are CR-39 with UV400 protection.",
  },
  {
    q: "How long is the bespoke wait time?",
    a: "Bespoke ships approximately 6 to 8 weeks after the standard pre-order batch. You will receive a measurement appointment link after ordering.",
  },
];

const sizeRows = [
  { hc: "58 to 60 cm", w: "155 mm" },
  { hc: "60 to 62 cm", w: "158 mm" },
  { hc: "62 to 64 cm", w: "161 mm" },
  { hc: "above 64 cm", w: "Bespoke (up to 172 mm)" },
];

const SunglassesForBigHeads = () => {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE}/en` },
      { "@type": "ListItem", position: 3, name: "Sunglasses for Big Heads", item: CANONICAL },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sunglasses for Big Heads",
    description:
      "Sunglasses for big heads in 155, 158 and 161 mm front width, plus bespoke to 172 mm. Italian Mazzucchelli acetate, handmade, from $133 pre-order.",
    url: CANONICAL,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

  return (
    <>
      <SEO
        title="Sunglasses for Big Heads - 155mm to 161mm | Woolet"
        description="Sunglasses for big heads and huge heads. Handmade Italian Mazzucchelli acetate in 155, 158, 161mm plus bespoke. Pre-order from $133 (30% off $190)."
        lang="en"
        path={PATH}
        jsonLd={[collectionLd, breadcrumbLd, faqLd]}
      />
      <Navbar />
      <main style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: "'Barlow', sans-serif", color: "#111" }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: 16, fontSize: 11, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span>Collections</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#111" }}>Sunglasses for Big Heads</span>
        </nav>

        {/* Hero */}
        <header style={{ ...wrap, padding: "24px 20px 8px" }}>
          <div style={{ display: "inline-block", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#A07A2A", border: "1px solid #D9C9A8", padding: "4px 10px", borderRadius: 2, marginBottom: 14 }}>
            155 / 158 / 161 mm + Bespoke
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 38, lineHeight: 1.1, margin: "0 0 14px" }}>
            Sunglasses for Big Heads - 155mm, 158mm, 161mm + Bespoke
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#333", margin: "0 0 18px" }}>
            Built from the ground up for head circumference 58 to 64 cm and above, not retrofitted from standard sizes. Handmade Italian Mazzucchelli acetate, two shapes, three measured fronts plus bespoke to 172 mm.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="#size-finder" style={{ background: "#111", color: "#F8F6F1", padding: "11px 20px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2 }}>
              Find your size
            </a>
            <Link to="/en/products/007" style={{ background: "transparent", color: "#111", padding: "11px 20px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #111", borderRadius: 2 }}>
              Shop 007 (Round)
            </Link>
            <Link to="/en/products/009" style={{ background: "transparent", color: "#111", padding: "11px 20px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #111", borderRadius: 2 }}>
              Shop 009 (Square)
            </Link>
          </div>
        </header>

        {/* Problem framing */}
        <section style={{ ...wrap, padding: "28px 20px 8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
            {[
              "Frames pinch at the temples within an hour.",
              "Arms too short to reach behind your ears.",
              "Lenses sit too close to your eyes and look undersized.",
            ].map((t, i) => (
              <div key={i} style={{ background: "#FFF", border: "1px solid #E0D5C5", padding: "14px 14px", borderRadius: 4, fontSize: 13, lineHeight: 1.55, color: "#333" }}>
                {t}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", margin: 0 }}>
            Standard eyewear maxes out around 145 to 148 mm of front width. Woolet starts at 155 mm and runs to 161 mm, with bespoke covering anything up to 172 mm.
          </p>
        </section>

        {/* Product grid */}
        <section aria-label="Featured frames" style={{ ...wrap, padding: "28px 20px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, margin: "0 0 14px" }}>
            Two shapes, three sizes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {[
              { id: "007", name: "Woolet 007 - Round", href: "/en/products/007", alt: "Woolet 007 round sunglasses for big heads - 155 to 161mm" },
              { id: "009", name: "Woolet 009 - Soft Square", href: "/en/products/009", alt: "Woolet 009 square sunglasses for big heads - 155 to 161mm" },
            ].map((p) => (
              <Link key={p.id} to={p.href} aria-label={p.alt} style={{ display: "block", padding: "18px 16px", background: "#FFF", border: "1px solid #E0D5C5", borderRadius: 6, textDecoration: "none", color: "#111" }}>
                <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#A07A2A", marginBottom: 6 }}>
                  Sun variant available
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>155 / 158 / 161 mm</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: "#A07A2A", fontWeight: 600, fontSize: 17 }}>$133</span>
                  <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#A07A2A", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    Shop {p.id === "007" ? "Round" : "Square"} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Size finder */}
        <section id="size-finder" style={{ background: "#1A1612", color: "#F8F6F1", padding: "32px 20px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 28, margin: "0 0 16px", color: "#F8F6F1" }}>
              Find your size in 3 steps
            </h2>
            <ol style={{ paddingLeft: 18, margin: "0 0 18px", color: "#DCD3C0", fontSize: 14, lineHeight: 1.7 }}>
              <li>Measure your head circumference at the widest point, just above the ears.</li>
              <li>Match the measurement to the chart below.</li>
              <li>If you are above 64 cm, choose bespoke.</li>
            </ol>

            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#F8F6F1", minWidth: 320 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #3A3530" }}>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 500, color: "#CAA449", letterSpacing: "1px", textTransform: "uppercase", fontSize: 11 }}>Head circumference</th>
                    <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 500, color: "#CAA449", letterSpacing: "1px", textTransform: "uppercase", fontSize: 11 }}>Frame width</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map((r) => (
                    <tr key={r.hc} style={{ borderBottom: "1px solid #2A2622" }}>
                      <td style={{ padding: "10px 8px" }}>{r.hc}</td>
                      <td style={{ padding: "10px 8px" }}>{r.w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/en/how-to-measure-face-width" style={{ background: "#CAA449", color: "#080807", padding: "10px 18px", borderRadius: 2, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", fontWeight: 500 }}>
                Measurement guide
              </Link>
              <Link to="/en/fit/bespoke" style={{ background: "transparent", color: "#F8F6F1", padding: "10px 18px", borderRadius: 2, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #555" }}>
                Bespoke
              </Link>
            </div>
          </div>
        </section>

        {/* Why Woolet */}
        <section style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, margin: "0 0 14px" }}>
            Why Woolet
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { t: "Italian Mazzucchelli acetate", b: "Cellulose acetate sheet from the same Italian supplier used by major luxury houses. Holds its set under heat, unlike injection-moulded TR-90." },
              { t: "Sized for big heads from day one", b: "Three measured fronts at 155, 158 and 161 mm. Bridge scales with each size: 19, 21, 23 mm. Temples 150 mm standard, up to 155 mm bespoke." },
              { t: "Bespoke above 161 mm", b: "Custom fronts from 150 to 172 mm in either shape. Same material, same finishing, made to your measurement." },
            ].map((c) => (
              <div key={c.t} style={{ background: "#FFF", border: "1px solid #E0D5C5", padding: "16px 14px", borderRadius: 4 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, marginBottom: 8 }}>{c.t}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "#444" }}>{c.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section style={{ ...wrap, padding: "28px 20px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 24, margin: "0 0 12px" }}>
            Oversized vs big-head specific
          </h2>
          <div style={{ background: "#FFF", border: "1px solid #E0D5C5", borderRadius: 4, padding: "16px 18px", fontSize: 13, lineHeight: 1.7, color: "#333" }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong>Oversized.</strong> Larger lenses on a standard 138 to 148 mm front. Looks bigger, fits the same.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong>Big-head specific.</strong> Larger front and bridge, not just larger lenses. Woolet 161 mm has a 23 mm bridge; most oversized frames stay at 18 to 20 mm.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Volume options.</strong> Fatheadz and similar specialists focus on plastic injection at one or two widths. Woolet is acetate, three widths, plus bespoke.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ ...wrap, padding: "8px 20px 28px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, margin: "0 0 14px" }}>
            Frequently asked
          </h2>
          {faqs.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "12px 0" }}>
              <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#111", listStyle: "none" }}>
                {f.q}
              </summary>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: "#444" }}>{f.a}</p>
            </details>
          ))}
        </section>

        {/* Internal links */}
        <section style={{ ...wrap, padding: "8px 20px 28px" }}>
          <h2 style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 12px", fontWeight: 500 }}>
            Keep exploring
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, fontSize: 13 }}>
            {[
              { href: "/en/collections/oversized-sunglasses-men", label: "Oversized sunglasses for men" },
              { href: "/en/blog/best-glasses-for-big-heads-2026", label: "Best glasses for big heads (2026)" },
              { href: "/en/blog/glasses-for-wide-faces", label: "Glasses for wide faces - guide" },
              { href: "/en/how-to-measure-face-width", label: "How to measure your face width" },
              { href: "/en/products/007", label: "Woolet 007 - Round" },
              { href: "/en/products/009", label: "Woolet 009 - Soft Square" },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} style={{ color: "#A07A2A", textDecoration: "none", borderBottom: "1px solid #E0D5C5", display: "inline-block", paddingBottom: 2 }}>
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section style={{ background: "#111", color: "#F8F6F1", padding: "36px 20px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 28, margin: "0 0 10px", color: "#F8F6F1" }}>
              Join 4,900+ on the waitlist
            </h2>
            <p style={{ fontSize: 14, color: "#CCC", margin: "0 0 18px" }}>
              30% off at launch. Pre-order $133 instead of $190.
            </p>
            <Link to="/en#waitlist" style={{ background: "#CAA449", color: "#080807", padding: "12px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 500, display: "inline-block" }}>
              Reserve my pair
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SunglassesForBigHeads;
