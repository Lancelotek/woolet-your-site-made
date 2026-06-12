import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getBlogPost } from "@/lib/blog-data";

const SITE = "https://woolet.co";
const PATH = "/blog/category/nose-bridge-fit";
const CANONICAL = `${SITE}/en${PATH}`;

const PILLAR_SLUG = "glasses-for-wide-nose-bridge-21-22mm-explained";
const RELATED_SLUGS = [
  "how-to-measure-face-width-for-glasses",
  "glasses-for-wide-faces-guide",
  "why-glasses-dont-fit-155mm-problem",
  "round-vs-square-glasses-wide-face",
];

const FAQS = [
  {
    q: "What counts as a wide nose bridge?",
    a: "Bridges under 17 mm are narrow, 17–20 mm is the mainstream range, and 21 mm and above is wide. Most brands top out at 18 mm — anyone with a wider or higher nose typically needs 21 mm or more for the frame to sit on bone instead of pinching cartilage.",
  },
  {
    q: "Where do I start if my glasses always slide or pinch?",
    a: "Read the pillar guide first — it explains what the bridge number on your current frames means and what 21–22 mm actually changes. Then use the AI Fit Wizard to confirm width and bridge from a single photo.",
  },
  {
    q: "Keyhole or saddle bridge for a wide nose?",
    a: "Keyhole. Saddle bridges wrap the sides of the nose and pinch wider noses; keyhole bridges sit across the top ridge and distribute weight on bone. Both Woolet 007 (21 mm) and 009 (22 mm) are keyhole.",
  },
];

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Nose-Bridge Fit — Guides & Resources",
  url: CANONICAL,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
  description:
    "A complete hub on nose-bridge fit for glasses: what bridge width means, what counts as wide, keyhole vs saddle, and how to measure.",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/en/blog` },
    { "@type": "ListItem", position: 3, name: "Nose-Bridge Fit", item: CANONICAL },
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const NoseBridgeFitHub = () => {
  const pillar = getBlogPost("en", PILLAR_SLUG);
  const related = RELATED_SLUGS
    .map((s) => getBlogPost("en", s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <SEO
        title="Nose-Bridge Fit for Glasses — Guides, Sizing & Collections | Woolet"
        description="Hub for nose-bridge fit: what bridge width means, what counts as wide, keyhole vs saddle, and how to measure. Pillar guide plus the 21–22 mm Woolet collections."
        lang="en"
        path={PATH}
        jsonLd={[itemListLd, breadcrumbLd, faqLd]}
      />

      <div
        className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }}
      />

      <Navbar />

      <main className="relative z-[1] max-w-[860px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-cream-dim" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <Link to="/en" className="text-cream-dim hover:text-gold-light no-underline">Home</Link>
          <span className="opacity-30 mx-2">/</span>
          <Link to="/en/blog" className="text-cream-dim hover:text-gold-light no-underline">Blog</Link>
          <span className="opacity-30 mx-2">/</span>
          <span className="text-woolet-white">Nose-Bridge Fit</span>
        </nav>

        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">Topic Hub</span>
        </div>

        <h1
          className="font-display text-woolet-white leading-tight mb-4"
          style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
        >
          Nose-Bridge Fit
        </h1>
        <p
          className="text-cream-dim tracking-wider mb-10 pb-8 leading-relaxed"
          style={{ fontSize: "0.9rem", borderBottom: "1px solid hsl(0 0% 100% / 0.055)", maxWidth: 640 }}
        >
          Everything we've written on bridge width, keyhole geometry, and what 21–22 mm
          actually fixes for wider or higher noses. Start with the pillar guide, then
          measure, then pick a shape.
        </p>

        {/* Pillar */}
        {pillar && (
          <section className="mb-14">
            <div className="text-primary uppercase mb-3" style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}>
              Start here — Pillar guide
            </div>
            <Link
              to={`/en/blog/${pillar.slug}`}
              className="group no-underline block p-7 sm:p-10 transition-colors"
              style={{ border: "1px solid hsl(var(--gold) / 0.25)", background: "hsl(var(--gold) / 0.04)" }}
            >
              <h2
                className="font-display text-woolet-white group-hover:text-gold-light transition-colors leading-snug mb-3"
                style={{ fontSize: "1.6rem", fontWeight: 400 }}
              >
                {pillar.title}
              </h2>
              <p className="text-cream-dim leading-relaxed tracking-wider mb-4" style={{ fontSize: "0.85rem" }}>
                {pillar.excerpt}
              </p>
              <span
                className="text-primary uppercase group-hover:tracking-[0.3em] transition-all"
                style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}
              >
                Read the pillar →
              </span>
            </Link>
          </section>
        )}

        {/* Shop the fit */}
        <section className="mb-14">
          <div className="text-primary uppercase mb-3" style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}>
            Shop the fit
          </div>
          <h2 className="font-display text-woolet-white mb-5" style={{ fontSize: "1.4rem", fontWeight: 400 }}>
            Collections built around the bridge
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                to: "/en/collections/wide-bridge-glasses",
                label: "Wide Bridge Glasses",
                blurb: "Glasses for a wide nose bridge — 21–22 mm keyhole while most brands cap at 18 mm.",
              },
              {
                to: "/en/collections/keyhole-bridge-glasses",
                label: "Keyhole Bridge Glasses",
                blurb: "Heritage keyhole geometry in Italian acetate. Round 007 (21 mm) and soft-square 009 (22 mm).",
              },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group no-underline block p-6 transition-colors hover:bg-surface/40"
                style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}
              >
                <h3
                  className="font-display text-woolet-white group-hover:text-gold-light transition-colors mb-2"
                  style={{ fontSize: "1.15rem", fontWeight: 400 }}
                >
                  {c.label}
                </h3>
                <p className="text-cream-dim leading-relaxed tracking-wider mb-3" style={{ fontSize: "0.78rem" }}>
                  {c.blurb}
                </p>
                <span className="text-primary uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.24em" }}>
                  Browse →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/en/products/007"
              className="text-cream-dim hover:text-gold-light no-underline px-4 py-2"
              style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              Woolet 007 — 21 mm
            </Link>
            <Link
              to="/en/products/009"
              className="text-cream-dim hover:text-gold-light no-underline px-4 py-2"
              style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              Woolet 009 — 22 mm
            </Link>
            <Link
              to="/en/fit"
              className="text-cream-dim hover:text-gold-light no-underline px-4 py-2"
              style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              AI Fit Wizard
            </Link>
            <Link
              to="/en/fit/bespoke"
              className="text-cream-dim hover:text-gold-light no-underline px-4 py-2"
              style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid hsl(0 0% 100% / 0.08)" }}
            >
              Bespoke 16–26 mm
            </Link>
          </div>
        </section>

        {/* Related reading */}
        {related.length > 0 && (
          <section className="mb-14">
            <div className="text-primary uppercase mb-3" style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}>
              Go deeper
            </div>
            <h2 className="font-display text-woolet-white mb-5" style={{ fontSize: "1.4rem", fontWeight: 400 }}>
              Related guides
            </h2>
            <div className="flex flex-col">
              {related.map((post, i) => (
                <Link
                  key={post.slug}
                  to={`/en/blog/${post.slug}`}
                  className="group no-underline block py-6 transition-colors hover:bg-surface/40"
                  style={i < related.length - 1 ? { borderBottom: "1px solid hsl(0 0% 100% / 0.055)" } : undefined}
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.55rem" }}>
                      {post.readTime} min read
                    </span>
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-primary/70 uppercase tracking-[0.2em] border border-primary/15 px-2 py-0.5"
                        style={{ fontSize: "0.48rem" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3
                    className="font-display text-woolet-white group-hover:text-gold-light transition-colors leading-snug mb-2"
                    style={{ fontSize: "1.15rem", fontWeight: 400 }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.78rem" }}>
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-10">
          <div className="text-primary uppercase mb-3" style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}>
            Quick answers
          </div>
          <h2 className="font-display text-woolet-white mb-5" style={{ fontSize: "1.4rem", fontWeight: 400 }}>
            Nose-bridge fit FAQ
          </h2>
          <div>
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="py-4"
                style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.055)" }}
              >
                <summary
                  className="cursor-pointer text-woolet-white"
                  style={{ fontSize: "0.9rem", listStyle: "none" }}
                >
                  {f.q}
                </summary>
                <p
                  className="text-cream-dim leading-relaxed tracking-wider mt-3"
                  style={{ fontSize: "0.8rem" }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="pt-6" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}>
          <Link
            to="/en/blog"
            className="text-cream-dim hover:text-gold-light no-underline uppercase"
            style={{ fontSize: "0.6rem", letterSpacing: "0.28em" }}
          >
            ← All articles
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoseBridgeFitHub;
