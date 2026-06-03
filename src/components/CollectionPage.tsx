import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export interface CollectionFAQ {
  question: string;
  answer: string;
}

export interface CollectionExtraSection {
  heading: string;
  paragraphs: string[];
}

export interface CollectionPageProps {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  whyThisFits: string[];
  faqs: CollectionFAQ[];
  breadcrumbName: string;
  extraSections?: CollectionExtraSection[];
}

const SITE = "https://woolet.co";

const productCards = [
  {
    id: "007",
    name: "Woolet 007 — Round / Panto",
    blurb: "Round Italian acetate frame, 158 mm wide with a 21 mm bridge. Bespoke from 150 to 172 mm.",
    href: "/en/products/007",
  },
  {
    id: "009",
    name: "Woolet 009 — Soft Square",
    blurb: "Soft-square Italian acetate frame, 158 mm wide with a 21 mm bridge. Bespoke from 150 to 172 mm.",
    href: "/en/products/009",
  },
];

const CollectionPage = ({
  slug,
  h1,
  metaTitle,
  metaDescription,
  intro,
  whyThisFits,
  faqs,
  breadcrumbName,
  extraSections,
}: CollectionPageProps) => {
  const path = `/collections/${slug}`;
  const canonical = `${SITE}/en${path}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE}/en/collections` },
      { "@type": "ListItem", position: 3, name: breadcrumbName, item: canonical },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: metaDescription,
    url: canonical,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: productCards.length,
      itemListElement: productCards.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}${p.href}`,
        name: p.name,
      })),
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        lang="en"
        path={path}
        jsonLd={[collectionLd, breadcrumbLd, faqLd]}
      />
      <Navbar />
      <main style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: "'Barlow', sans-serif", color: "#111" }}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ maxWidth: 760, margin: "0 auto", padding: "16px 20px 0", fontSize: 11, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>
          <Link to="/en" style={{ color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span>Collections</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#111" }}>{breadcrumbName}</span>
        </nav>

        {/* Hero */}
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 8px" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 36, lineHeight: 1.15, margin: "0 0 16px" }}>
            {h1}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#333", margin: 0 }}>{intro}</p>
        </header>

        {/* Product cards */}
        <section aria-label="Featured frames" style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {productCards.map((p) => (
              <Link
                key={p.id}
                to={p.href}
                style={{
                  display: "block", padding: "16px 14px", background: "#FFF",
                  border: "1px solid #E0D5C5", borderRadius: 8, textDecoration: "none", color: "#111",
                }}
              >
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, marginBottom: 6 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{p.blurb}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: "#A07A2A", fontWeight: 600, fontSize: 16 }}>$114</span>
                  <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#A07A2A", letterSpacing: "1.5px", textTransform: "uppercase" }}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Why this fits */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "12px 20px 24px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, margin: "0 0 14px" }}>
            Why this fits
          </h2>
          {whyThisFits.map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "#222", margin: "0 0 14px" }} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </section>

        {/* Sizes */}
        <section style={{ background: "#1A1612", color: "#F8F6F1", padding: "20px 20px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 24, margin: "0 0 12px", color: "#F8F6F1" }}>
              One precise size - or go bespoke
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#CCC", margin: "0 0 14px" }}>
              Both shapes ship at 158 mm wide with a 21 mm bridge, engineered for faces in the 155-161 mm range. Outside that, bespoke covers 150 to 172 mm with the same 21 mm bridge.
              Use our AI Fit Wizard to confirm the right fit for your face.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/en/fit" style={{ background: "#CAA449", color: "#080807", padding: "10px 18px", borderRadius: 4, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", fontWeight: 500 }}>
                Find my size →
              </Link>
              <Link to="/en/fit/bespoke" style={{ background: "transparent", color: "#F8F6F1", padding: "10px 18px", borderRadius: 4, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid #555" }}>
                Bespoke
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, margin: "0 0 14px" }}>
            Frequently asked
          </h2>
          {faqs.map((f, i) => (
            <details key={i} style={{ borderBottom: "1px solid #E0D5C5", padding: "12px 0" }}>
              <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#111", listStyle: "none" }}>
                {f.question}
              </summary>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: "#444" }}>{f.answer}</p>
            </details>
          ))}
        </section>

        {/* Related collections — internal linking for SEO discovery */}
        <section aria-label="Related collections" style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 40px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, margin: "0 0 12px", color: "#111" }}>
            Explore related collections
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { slug: "wide-face-glasses", label: "Wide-Face Glasses" },
              { slug: "glasses-for-big-heads", label: "Glasses for Big Heads" },
              { slug: "extra-wide-glasses", label: "Extra Wide Glasses" },
              { slug: "wide-bridge-glasses", label: "Wide Bridge Glasses" },
              { slug: "italian-acetate-sunglasses", label: "Italian Acetate Sunglasses" },
              { slug: "oversized-sunglasses-men", label: "Oversized Sunglasses for Men" },
              { slug: "sunglasses-for-big-heads", label: "Sunglasses for Big Heads" },
              { slug: "oversized-blue-light-glasses", label: "Oversized Blue Light Glasses" },
              { slug: "blue-light-glasses-for-wide-faces", label: "Blue Light Glasses for Wide Faces" },
            ].filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                to={`/en/collections/${c.slug}`}
                style={{
                  fontSize: 12, color: "#222", padding: "6px 12px",
                  border: "1px solid #D6CBB6", borderRadius: 999, textDecoration: "none",
                  background: "#FFF", letterSpacing: "0.3px",
                }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CollectionPage;
