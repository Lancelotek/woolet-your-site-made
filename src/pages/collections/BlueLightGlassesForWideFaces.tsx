import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LensOptions from "@/components/LensOptions";
import { FRAME_SPECS } from "@/data/sizes";

/**
 * Commercial landing page for the blue-light + wide-face intent.
 *
 * ONE PAGE PER INTENT: this route already existed and already ranks
 * (impressions on "blue light glasses wide face" / "for big heads"), so the
 * cluster is built out HERE rather than on a competing new URL.
 * /en/blue-light-glasses-wide-faces redirects to this page (see App.tsx).
 *
 * COMPLIANCE: no health claims anywhere on this page. The filter is described
 * as a technical option only, and section 6 states the Cochrane 2023 finding
 * plainly. Do not soften or remove it.
 */

const SITE = "https://woolet.co";
const PATH = "/collections/blue-light-glasses-for-wide-faces";
const CANONICAL = `${SITE}/en${PATH}`;

const T = {
  ink: "#0B0A09",
  dark: "#080807",
  cream: "#EDE7D9",
  surface: "#F8F6F1",
  panel: "#FFFFFF",
  hair: "#E0D5C5",
  gold: "#CAA449",
  goldDim: "#8A6E2C",
  ctaInk: "#1F1B16",
  body: "#333333",
};
const SANS = "'Archivo', 'Barlow', sans-serif";
const SERIF = "'Newsreader', 'Cormorant Garamond', serif";

const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

const S007 = FRAME_SPECS["007"];
const S009 = FRAME_SPECS["009"];

const badges = ["Signature 158 mm", "Bespoke 145–162 mm", "Hand made in EU", "UV400"];

const tableRows: [string, string, string, string][] = [
  ["Frame width", "130–145 mm", `${S007.frameWidth} mm`, `${S009.frameWidth} mm`],
  ["Bridge", "varies", `${S007.bridge} mm keyhole`, `${S009.bridge} mm keyhole`],
  ["Lens width", "varies", `${S007.lensWidth} mm`, `${S009.lensWidth} mm`],
  ["Temple length", "varies", `${S007.templeLength} mm`, `${S009.templeLength} mm`],
  ["Available with blue-light filter", "varies", "Yes (lens option)", "Yes (lens option)"],
];

const segments = [
  {
    title: "Screen workers with wide faces",
    body: "Eight hours in a frame that leaves marks on your temples is a fit problem, not a lens problem. A 158 mm front puts the hinges outside the widest point of your face, so the arms run straight back instead of splaying. The filter is an option on top of that.",
  },
  {
    title: "Gamers who wear headsets",
    body: `Headset cups press the temples of a narrow frame into the side of your head, and that is where the pain starts. A ${S007.frameWidth} mm front with ${S007.templeLength} mm temples sits further out and further back, so the arm passes behind the cup rather than under it.`,
  },
  {
    title: "Drivers",
    body: "Every Woolet lens is UV400 as standard, clear or tinted. The blue-light filter is optional and independent of that. What matters behind the wheel is that the frame does not shift when you check a mirror — which is a function of front width and temple length.",
  },
  {
    title: "Anyone whose 145 mm frames leave marks",
    body: "If you take your glasses off and find two indentations at your temples, or a sore spot behind the ear, the front is too narrow for your face. Measure temple-to-temple first; the number decides the frame, and the lens choice comes afterwards.",
  },
];

const faqs = [
  {
    q: "What size are blue light glasses for a wide face?",
    a: `If you measure 155 mm or more temple-to-temple, look for a front width of 155 mm or above — not a lens width. Woolet builds at ${S007.frameWidth} mm across the front with a ${S007.bridge}–${S009.bridge} mm keyhole bridge and ${S007.templeLength} mm temples, and the blue-light filter is a lens option on either shape.`,
  },
  {
    q: "Do you have blue light glasses for big heads?",
    a: `Yes. The same ${S007.frameWidth} mm signature front covers roughly a 58–62 cm head circumference, and the ${S007.templeLength} mm temples reach back far enough that the arms are not pulling forward on your ears. Choose 007 Round or 009 Soft Square, then add the blue-light filter as a lens option.`,
  },
  {
    q: "What is the widest blue-light frame you make?",
    a: "The signature runs 158 mm. Beyond that, bespoke covers any front width from 145 to 162 mm in the same Mazzucchelli acetate, hand made in EU. 162 mm is our ceiling — we would rather say no than sell you a frame that does not fit.",
  },
  {
    q: "Can I get a blue-light filter with my prescription?",
    a: "Yes — the filter is a coating on the lens, so it pairs with a single-vision or progressive prescription cut to the same 158 mm front. Start with FitLens so the front width and bridge are confirmed first; the prescription and lens options are quoted after that.",
  },
  {
    q: "Do blue light glasses actually work?",
    a: "A 2023 Cochrane review of 17 randomised trials found blue-light filtering lenses probably make no measurable difference to eye strain, eye health or sleep quality, and rated the evidence low-to-moderate certainty. We offer the filter because people ask for it. The claim we stand behind is the measurement, not the coating.",
  },
  {
    q: "How do I know if 158 mm is right for me?",
    a: "Measure across the widest point of your face, temple to temple. 155–161 mm is the signature range. Under 155 mm or over 161 mm, bespoke covers 145–162 mm. FitLens does the same measurement from your phone camera in about a minute if you would rather not use a ruler.",
  },
];

const relatedLinks = [
  { href: "/en/collections/oversized-blue-light-glasses", label: "oversized vs wide-fit blue light glasses" },
  { href: "/en/blog/extra-wide-glasses-158mm", label: "extra wide glasses 158 mm" },
  { href: "/en/blog/glasses-too-tight-on-side-of-head", label: "glasses too tight on the side of the head" },
  { href: "/en/blog/do-blue-light-glasses-work-wide-face", label: "do blue light glasses work on a wide face" },
  { href: "/en/fit", label: "measure your face with FitLens" },
  { href: "/en/products/007", label: "Woolet 007 Round — 158 mm" },
  { href: "/en/products/009", label: "Woolet 009 Soft Square — 158 mm" },
];

const h2: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 300,
  fontSize: 28,
  lineHeight: 1.15,
  letterSpacing: "-0.3px",
  margin: "0 0 14px",
  color: T.ink,
};
const p: React.CSSProperties = { fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: T.body, margin: "0 0 14px" };
const cell: React.CSSProperties = { padding: "11px 14px", fontFamily: SANS, fontSize: 13.5, borderTop: `1px solid ${T.hair}` };

function Faq({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ borderBottom: `1px solid ${T.hair}` }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            width: "100%",
            display: "flex",
            gap: 14,
            alignItems: "baseline",
            justifyContent: "space-between",
            background: "transparent",
            border: 0,
            padding: "16px 0",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 600,
            color: T.ink,
          }}
        >
          {q}
          <span aria-hidden="true" style={{ color: T.goldDim, fontSize: 20, lineHeight: 1 }}>{open ? "–" : "+"}</span>
        </button>
      </h3>
      {open && <p style={{ ...p, margin: "0 0 18px", maxWidth: 660 }}>{a}</p>}
    </div>
  );
}

const BlueLightGlassesForWideFaces = () => {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE}/en` },
      { "@type": "ListItem", position: 3, name: "Blue Light Glasses for Wide Faces", item: CANONICAL },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blue Light Glasses for Wide Faces — 158 mm Fit",
    url: CANONICAL,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [S007, S009].map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${SITE}${s.href}`,
      })),
    },
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

  return (
    <>
      <SEO
        title="Blue Light Glasses for Wide Faces — 158 mm Fit | Woolet"
        exactTitle
        description="Most blue-light frames stop at 145 mm. Woolet's front is 158 mm with 148 mm temples, blue-light filter optional. Bespoke 145–162 mm. Hand made in EU."
        lang="en"
        path={PATH}
        jsonLd={[collectionLd, breadcrumbLd, faqLd]}
      />
      <Navbar />

      <main style={{ background: T.surface, minHeight: "100vh", fontFamily: SANS, color: T.ink }}>
        {/* 1 — Hero */}
        <header style={{ background: T.dark, color: T.cream, paddingTop: 64 }}>
          <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: 18, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(237,231,217,0.55)" }}>
            <Link to="/en" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>Collections</span>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: T.cream }}>Blue light — wide faces</span>
          </nav>

          <div style={{ ...wrap, padding: "26px 20px 44px" }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 42, lineHeight: 1.08, letterSpacing: "-0.6px", margin: "0 0 14px", color: T.cream }}>
              Blue Light Glasses for Wide Faces — <em style={{ fontStyle: "italic", color: T.gold }}>158 mm</em> Fit
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.6, color: "rgba(237,231,217,0.82)", margin: "0 0 22px", maxWidth: 620 }}>
              Most blue-light frames stop at 145 mm across the front; ours start at 158 mm.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
              {badges.map((b) => (
                <span key={b} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(237,231,217,0.75)", border: "1px solid rgba(202,164,73,0.45)", padding: "5px 10px", borderRadius: 2 }}>
                  {b}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                to="/en/fit"
                style={{ background: T.gold, color: T.ctaInk, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 700 }}
              >
                Measure my face with FitLens
              </Link>
              <a
                href="#frames"
                style={{ background: "transparent", color: T.cream, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(237,231,217,0.45)", borderRadius: 2 }}
              >
                See the frames
              </a>
            </div>
          </div>
        </header>

        {/* 2 — Answer block */}
        <section aria-labelledby="answer-heading" style={{ ...wrap, padding: "30px 20px 8px" }}>
          <div style={{ background: T.panel, border: `1px solid ${T.hair}`, borderLeft: `3px solid ${T.gold}`, padding: "22px 24px", borderRadius: 4 }}>
            <h2 id="answer-heading" style={{ ...h2, fontSize: 22, fontWeight: 400, margin: "0 0 10px" }}>
              What size are blue light glasses for a wide face?
            </h2>
            <p style={{ ...p, fontSize: 15.5, color: "#222", margin: 0 }}>
              Most blue-light frames are built 130–145 mm across, which is why they pinch a wide face. Woolet's front
              is {S007.frameWidth} mm with {S007.templeLength} mm temples and a {S007.bridge}–{S009.bridge} mm keyhole
              bridge, and the blue-light filter is a lens option on both shapes. Bespoke covers 145–162 mm.
            </p>
          </div>
        </section>

        {/* 3 — Comparison table */}
        <section aria-labelledby="compare-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="compare-heading" style={h2}>Why 145 mm blue-light frames don't fit</h2>
          <p style={{ ...p, maxWidth: 660 }}>
            The lens coating is identical across the market. The measurement is not. Below is the geometry of a typical
            wide-frame blue light glasses listing against the two Woolet shapes.
          </p>
          <div style={{ overflowX: "auto", border: `1px solid ${T.hair}`, borderRadius: 4, background: T.panel }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <caption className="sr-only">Frame geometry: typical blue-light frame compared with Woolet 007 and 009</caption>
              <thead>
                <tr style={{ background: "#FBF7EE" }}>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#666" }}>
                    Measurement
                  </th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>
                    Typical blue-light frame (130–145 mm)
                  </th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>Woolet 007 Round</th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>Woolet 009 Soft Square</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, typical, a, b]) => (
                  <tr key={label}>
                    <th scope="row" style={{ ...cell, textAlign: "left", fontWeight: 600, color: "#555" }}>{label}</th>
                    <td style={{ ...cell, color: "#8A7F6C" }}>{typical}</td>
                    <td style={{ ...cell, color: T.ink }}>{a}</td>
                    <td style={{ ...cell, color: T.ink }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...p, fontSize: 13, color: "#7A7263", margin: "10px 0 0" }}>
            "Varies" means exactly that: the typical column is a market range, not a specific product. We do not publish
            measurements for frames we have not measured.
          </p>
        </section>

        {/* 4 — Segments */}
        <section aria-labelledby="who-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="who-heading" style={h2}>Who extra wide blue-light glasses are for</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {segments.map((s) => (
              <article key={s.title} style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px" }}>
                <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: T.ink }}>{s.title}</h3>
                <p style={{ ...p, margin: 0, fontSize: 14.5 }}>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 5 — Lens options (single source of truth) */}
        <section aria-label="Lens options" style={{ ...wrap, padding: "20px 20px 0" }}>
          <LensOptions productId="007" specs={[["Frame Width", `${S007.frameWidth} mm`], ["Lens", `${S007.lensWidth} × ${S007.lensHeight} mm`]]} framePrice="114" />
        </section>

        {/* 6 — Honesty section */}
        <section aria-labelledby="evidence-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="evidence-heading" style={h2}>Does a blue-light filter actually work?</h2>
          <p style={{ ...p, maxWidth: 660 }}>
            Probably not in the way the category advertises. A 2023 Cochrane review of 17 randomised controlled trials
            concluded that blue-light filtering spectacle lenses probably make no measurable difference to visual
            fatigue with computer use, and found no reliable evidence of an effect on eye health or on sleep quality.
            The certainty of that evidence was rated low to moderate.
          </p>
          <p style={{ ...p, maxWidth: 660 }}>
            We offer the filter because people ask for it, and because a lens coating is a preference like a tint is a
            preference. We are not going to tell you it will fix your evenings. The claim we will stand behind is the
            measurement: a {S007.frameWidth} mm front, a {S007.bridge}–{S009.bridge} mm keyhole bridge and{" "}
            {S007.templeLength} mm temples, cut to fit a face the rest of the market stopped designing for.
          </p>
          <p style={{ ...p, maxWidth: 660 }}>
            Read the fit breakdown:{" "}
            <Link to="/en/blog/oversized-blue-light-glasses-vs-wide-fit" style={{ color: T.goldDim, textUnderlineOffset: 3 }}>
              oversized blue-light glasses vs a true wide fit
            </Link>{" "}
            ·{" "}
            <Link to="/en/collections/oversized-blue-light-glasses" style={{ color: T.goldDim, textUnderlineOffset: 3 }}>
              oversized blue light glasses
            </Link>
          </p>
          <p style={{ ...p, fontSize: 13, color: "#7A7263", maxWidth: 660 }}>
            Source:{" "}
            <a
              href="https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD013244.pub2/full"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.goldDim, textUnderlineOffset: 3 }}
            >
              Cochrane Database of Systematic Reviews, 2023
            </a>
            .
          </p>
        </section>

        {/* 7 — Frame cards */}
        <section id="frames" aria-labelledby="frames-heading" style={{ ...wrap, padding: "34px 20px 8px", scrollMarginTop: 80 }}>
          <h2 id="frames-heading" style={h2}>158 mm blue-light glasses — both shapes</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
            {[S007, S009].map((s) => (
              <Link
                key={s.href}
                to={s.href}
                style={{ display: "block", background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px", textDecoration: "none", color: T.ink }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 10 }}>
                  {s.frameWidth} mm front · {s.bridge} mm keyhole bridge · {s.lensWidth} mm lens · {s.templeLength} mm temples.
                </div>
                <div style={{ fontSize: 12.5, color: T.goldDim, marginBottom: 12 }}>Blue-light filter available as a lens option.</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: T.goldDim, fontWeight: 700, fontSize: 16 }}>$114</span>
                  <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>$190</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: T.goldDim, letterSpacing: "1.5px", textTransform: "uppercase" }}>View →</span>
                </div>
              </Link>
            ))}
            <Link
              to="/en/bespoke"
              style={{ display: "block", background: T.dark, border: "1px solid rgba(202,164,73,0.4)", borderRadius: 4, padding: "18px 20px", textDecoration: "none", color: T.cream }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 6 }}>Build it bespoke — 145 to 162 mm</div>
              <div style={{ fontSize: 13, color: "rgba(237,231,217,0.7)", lineHeight: 1.55, marginBottom: 12 }}>
                Outside the 155–161 mm signature range? Same Mazzucchelli acetate, your front width, hand made in EU.
              </div>
              <span style={{ fontSize: 11, color: T.gold, letterSpacing: "1.5px", textTransform: "uppercase" }}>Explore bespoke →</span>
            </Link>
          </div>
        </section>

        {/* 8 — FitLens */}
        <section aria-labelledby="fitlens-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <div style={{ background: "#F8F6F1", border: `1px solid ${T.gold}`, borderRadius: 4, padding: "24px 24px", color: T.ctaInk }}>
            <h2 id="fitlens-heading" style={{ ...h2, margin: "0 0 12px", color: T.ctaInk }}>Measure first, choose lenses second</h2>
            <ol style={{ margin: "0 0 18px", padding: "0 0 0 20px", fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: T.ctaInk }}>
              <li>Measure temple to temple, across the widest point of your face.</li>
              <li>Hold the ruler flat against a mirror so it stays level with your eyes.</li>
              <li>Or let FitLens do it from your phone camera — about a minute, no ruler.</li>
            </ol>
            <Link
              to="/en/fit"
              style={{ display: "inline-block", background: T.gold, color: T.ctaInk, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 700 }}
            >
              Start FitLens
            </Link>
          </div>
        </section>

        {/* 9 — FAQ */}
        <section aria-labelledby="faq-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="faq-heading" style={h2}>Blue light glasses for large heads — questions</h2>
          <div style={{ borderTop: `1px solid ${T.hair}` }}>
            {faqs.map((f, i) => (
              <Faq key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </section>

        {/* 10 — Related links */}
        <section aria-labelledby="related-heading" style={{ ...wrap, padding: "34px 20px 60px" }}>
          <h2 id="related-heading" style={{ ...h2, fontSize: 22 }}>Keep reading</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {relatedLinks.map((l) => (
              <li key={l.href}>
                <Link to={l.href} style={{ fontFamily: SANS, fontSize: 14.5, color: T.goldDim, textUnderlineOffset: 3 }}>
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlueLightGlassesForWideFaces;
