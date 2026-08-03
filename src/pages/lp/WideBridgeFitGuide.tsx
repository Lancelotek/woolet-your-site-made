import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import noseBridgeAsset from "@/assets/nose-bridge-comparison.png.asset.json";

const SITE = "https://woolet.co";
const PATH = "/lp/wide-bridge-fit-guide";
const CANONICAL = `${SITE}/en${PATH}`;

const FAQS = [
  {
    q: "How do I know if I need a wider bridge?",
    a: "Three quick signs: your current glasses leave red marks on the sides of your nose (not the top), they slide down within an hour of wearing them, or they sit so high that you keep looking through the upper edge of the lens. Any of those points to a bridge that's too narrow — usually 18 mm or under — for the width of your nose.",
  },
  {
    q: "What's a wide bridge measurement in mm?",
    a: "Mainstream eyewear sits at 17–20 mm. We call 21 mm and above a wide bridge. 21–22 mm fits most wide noses; 23–26 mm is bespoke territory for high or unusually broad bridges.",
  },
  {
    q: "Keyhole or saddle bridge for a wide nose?",
    a: "Keyhole. A saddle bridge wraps the sides of the nose and pinches anything broader than average. A keyhole bridge lifts the frame onto the bone at the top of the nose, so weight sits on hard tissue instead of cartilage — that's what stops the slide and the red marks.",
  },
  {
    q: "Why do my glasses slide down even when the bridge feels okay?",
    a: "Sliding is usually a bridge-width problem before it's a temple-tightness problem. If the bridge is too narrow, the frame floats on cartilage with no real anchor and gravity wins. Widening the bridge by 2–4 mm and switching to a keyhole shape fixes it without overtightening the temples behind your ears.",
  },
  {
    q: "Can I just have an optician adjust my current frames?",
    a: "An optician can widen nose pads on metal frames a millimetre or two, and re-bend temples. They can't widen the bridge itself on an acetate frame — the geometry is cut into the block. If the bridge is too narrow, adjustment delays the problem, it doesn't solve it.",
  },
  {
    q: "How do I measure my own nose bridge?",
    a: "Take a straight-on photo at eye level with a credit card held against your forehead for scale. Measure the width of your nose at the point where glasses would rest (about 12 mm below the eyebrow line). That number is your minimum bridge width. Our AI Fit Wizard does the same measurement from a single photo automatically.",
  },
];

const guideLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Wide Bridge Fit Guide — How to Pick Bridge Width & Stop Glasses Sliding",
  description:
    "A practical guide to bridge width for glasses: how to measure your nose bridge, when to choose 21 mm or 22 mm, keyhole vs saddle, and how to stop glasses sliding down your nose.",
  inLanguage: "en",
  url: CANONICAL,
  mainEntityOfPage: CANONICAL,
  author: { "@type": "Organization", name: "Woolet" },
  publisher: {
    "@type": "Organization",
    name: "Woolet",
    logo: { "@type": "ImageObject", url: `${SITE}/og-image.jpg` },
  },
  image: `${SITE}${noseBridgeAsset.url}`,
  datePublished: "2026-06-25",
  dateModified: "2026-06-25",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/en` },
    { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/en/blog` },
    { "@type": "ListItem", position: 3, name: "Wide Bridge Fit Guide", item: CANONICAL },
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

const WideBridgeFitGuide = () => {
  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <SEO
        title="Wide Bridge Fit Guide — How to Pick Bridge Width & Stop Glasses Sliding | Woolet"
        description="How to measure your nose bridge, when to pick 21 mm or 22 mm, keyhole vs saddle, and the real reason glasses slide down your nose — plus how to fix it."
        lang="en"
        path={PATH}
        jsonLd={[guideLd, breadcrumbLd, faqLd]}
      />

      <div
        className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }}
      />

      <Navbar />

      <main className="relative z-[1] max-w-[760px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-cream-dim"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          <Link to="/en" className="text-cream-dim hover:text-gold-light no-underline">Home</Link>
          <span className="opacity-30 mx-2">/</span>
          <Link to="/en/blog/category/nose-bridge-fit" className="text-cream-dim hover:text-gold-light no-underline">Nose-Bridge Fit</Link>
          <span className="opacity-30 mx-2">/</span>
          <span className="text-woolet-white">Wide Bridge Fit Guide</span>
        </nav>

        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">Fit Guide</span>
        </div>

        <h1
          className="font-display text-woolet-white leading-tight mb-5"
          style={{ fontSize: "clamp(2rem, 4.2vw, 3.2rem)", fontWeight: 400 }}
        >
          Wide bridge fit — how to pick bridge width and stop glasses from sliding
        </h1>
        <p
          className="text-cream-dim leading-relaxed mb-10 pb-8"
          style={{
            fontSize: "1rem",
            borderBottom: "1px solid hsl(0 0% 100% / 0.055)",
            maxWidth: 640,
          }}
        >
          If your glasses slide down your nose, leave deep marks on the sides, or
          sit so high that you peer over the rim by lunch, the problem is almost
          never your face — it's bridge geometry. Mainstream frames cap at
          17–20&nbsp;mm bridges built around average noses. Anyone outside that
          range needs a wider keyhole bridge. This is how to figure out which
          width and shape you need.
        </p>

        {/* Hero image */}
        <figure className="mb-14">
          <img
            src={noseBridgeAsset.url}
            alt="Nose bridge fit diagram for glasses — standard 18–20 mm saddle bridge pinching the sides of a wide nose vs Woolet 21 mm and 24 mm wider keyhole bridges sitting level on the top of the nose"
            className="w-full h-auto block"
            style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}
            loading="lazy"
          />
          <figcaption
            className="text-cream-dim italic mt-3 leading-relaxed tracking-wider"
            style={{ fontSize: "0.75rem" }}
          >
            Standard 18–20&nbsp;mm bridges dig into the sides of a wider nose.
            21&nbsp;mm and 24&nbsp;mm keyhole bridges sit on the bone at the top,
            level and stable — no slide, no red marks, no overtightened temples.
          </figcaption>
        </figure>

        {/* Section 1 */}
        <section className="mb-16">
          <div
            className="text-primary uppercase mb-3"
            style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}
          >
            Part 1
          </div>
          <h2
            className="font-display text-woolet-white mb-6 leading-tight"
            style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)", fontWeight: 400 }}
          >
            How to pick the right bridge width
          </h2>

          <p className="text-cream-light leading-relaxed mb-5" style={{ fontSize: "0.95rem" }}>
            Bridge width is the millimetre measurement between the two lenses —
            the second number on every frame spec (e.g. <em>52□18</em> means a
            52&nbsp;mm lens and an 18&nbsp;mm bridge). It controls one thing:
            where the frame rests on your nose. Get it wrong and no amount of
            temple adjustment will hold the glasses in place.
          </p>

          <h3
            className="font-display text-woolet-white mt-10 mb-3"
            style={{ fontSize: "1.15rem", fontWeight: 400 }}
          >
            Step 1 — find your current bridge number
          </h3>
          <p className="text-cream-light leading-relaxed mb-5" style={{ fontSize: "0.95rem" }}>
            Look on the inside of one temple arm. You'll see three numbers like
            <em> 54 □ 18 — 145</em>. The middle one is your current bridge. If
            it's 17–20&nbsp;mm and your glasses still slide, you're below the
            width your nose actually needs.
          </p>

          <h3
            className="font-display text-woolet-white mt-10 mb-3"
            style={{ fontSize: "1.15rem", fontWeight: 400 }}
          >
            Step 2 — measure your nose
          </h3>
          <p className="text-cream-light leading-relaxed mb-5" style={{ fontSize: "0.95rem" }}>
            Take a straight-on photo at eye level with a credit card held flat
            against your forehead for scale (a card is 85.6&nbsp;mm wide).
            Measure the width of your nose at the point about 12&nbsp;mm below
            your brow line — that's where the bridge will sit. The number you
            get is your <strong>minimum</strong> bridge width.
          </p>
          <p className="text-cream-light leading-relaxed mb-5" style={{ fontSize: "0.95rem" }}>
            Prefer to skip the ruler? The{" "}
            <Link to="/en/fit" className="text-primary hover:text-gold-light no-underline" style={{ borderBottom: "1px solid hsl(var(--gold) / 0.4)" }}>
              AI Fit Wizard
            </Link>{" "}
            does this from a single phone photo — bridge width, nose height and
            face width in about 20&nbsp;seconds.
          </p>

          <h3
            className="font-display text-woolet-white mt-10 mb-4"
            style={{ fontSize: "1.15rem", fontWeight: 400 }}
          >
            Step 3 — match width to the right band
          </h3>
          <div
            className="mb-6"
            style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}
          >
            {[
              { range: "< 17 mm", label: "Narrow", note: "Most petite frames. Will pinch a wide nose immediately." },
              { range: "17–20 mm", label: "Mainstream", note: "Standard for off-the-shelf eyewear. Works for average noses." },
              { range: "21–22 mm", label: "Wide (Woolet 007 / 009)", note: "Stops the slide for the majority of wider noses without going bespoke." },
              { range: "23–26 mm", label: "Bespoke", note: "For high or unusually broad bridges. Custom-cut from Italian acetate." },
            ].map((row, i, arr) => (
              <div
                key={row.range}
                className="flex flex-col sm:flex-row gap-2 sm:gap-6 p-4 sm:p-5"
                style={i < arr.length - 1 ? { borderBottom: "1px solid hsl(0 0% 100% / 0.055)" } : undefined}
              >
                <div className="text-primary font-mono shrink-0" style={{ fontSize: "0.85rem", minWidth: 90 }}>
                  {row.range}
                </div>
                <div className="text-woolet-white shrink-0" style={{ fontSize: "0.85rem", minWidth: 200 }}>
                  {row.label}
                </div>
                <div className="text-cream-dim leading-relaxed" style={{ fontSize: "0.82rem" }}>
                  {row.note}
                </div>
              </div>
            ))}
          </div>
          <p className="text-cream-dim leading-relaxed italic" style={{ fontSize: "0.85rem" }}>
            Rule of thumb: pick the bridge width closest to your measurement,
            rounding <strong>up</strong>. A bridge 1&nbsp;mm too wide sits fine;
            a bridge 1&nbsp;mm too narrow will pinch.
          </p>

          <h3
            className="font-display text-woolet-white mt-10 mb-3"
            style={{ fontSize: "1.15rem", fontWeight: 400 }}
          >
            Step 4 — choose the bridge shape
          </h3>
          <p className="text-cream-light leading-relaxed mb-4" style={{ fontSize: "0.95rem" }}>
            <strong>Saddle bridge</strong> — continuous curve that wraps the
            sides of the nose. Fine for average and lower bridges; pinches
            anything broader.
          </p>
          <p className="text-cream-light leading-relaxed mb-4" style={{ fontSize: "0.95rem" }}>
            <strong>Keyhole bridge</strong> — small inverted-keyhole opening
            that lifts the frame onto the bone at the top of the nose. Doesn't
            slide, doesn't leave marks on the sides. The right answer for almost
            every wide or high-bridge wearer.
          </p>
          <p className="text-cream-light leading-relaxed" style={{ fontSize: "0.95rem" }}>
            Both Woolet standards are keyhole: the round{" "}
            <Link to="/en/products/007" className="text-primary hover:text-gold-light no-underline" style={{ borderBottom: "1px solid hsl(var(--gold) / 0.4)" }}>
              007 at 21&nbsp;mm
            </Link>{" "}
            and the soft-square{" "}
            <Link to="/en/products/009" className="text-primary hover:text-gold-light no-underline" style={{ borderBottom: "1px solid hsl(var(--gold) / 0.4)" }}>
              009 at 22&nbsp;mm
            </Link>
            . Bespoke covers 16–26&nbsp;mm in 1&nbsp;mm increments.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-16">
          <div
            className="text-primary uppercase mb-3"
            style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}
          >
            Part 2
          </div>
          <h2
            className="font-display text-woolet-white mb-6 leading-tight"
            style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)", fontWeight: 400 }}
          >
            How to stop glasses sliding down your nose
          </h2>

          <p className="text-cream-light leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
            Sliding looks like a tightness problem. It almost never is. Below
            are the five real causes, in order of how often they're the
            culprit, and the fix for each.
          </p>

          {[
            {
              n: "01",
              title: "The bridge is too narrow",
              body:
                "By far the most common cause. The frame floats on cartilage instead of resting on bone, so any head movement or skin oil sends it down. No temple tightening fixes this — you need a bridge 2–4 mm wider, ideally in a keyhole shape so it sits on the bony ridge at the top.",
            },
            {
              n: "02",
              title: "Saddle bridge on a wide nose",
              body:
                "Even at the right width, a saddle bridge wraps the sides and slides as soon as the skin warms up. Switching to a keyhole geometry — same width, different shape — usually solves it on its own.",
            },
            {
              n: "03",
              title: "Pantoscopic tilt is wrong",
              body:
                "The angle the lens makes with the vertical (pantoscopic tilt) should be 8–12°. Too vertical and the frame pivots forward down your nose. An optician can re-bend metal temples; on acetate the angle is set at the hinge — 11° on the Woolet 007 and 009.",
            },
            {
              n: "04",
              title: "Temples that grip the head, not hook the ears",
              body:
                "Straight-back temples rely on side pressure to stay put. Once skin warms and oils up they slip forward, taking the frame with them. Temples should have a slight curve that hooks behind the ear without pressing on the skull. 148 mm at an 11° drop is the Woolet standard.",
            },
            {
              n: "05",
              title: "Frame is too heavy for the bridge surface area",
              body:
                "Thicker acetate, oversized lenses, and metal cores all add weight. A wider bridge spreads that weight across more skin, which is why wide-bridge keyhole geometry handles a heavier, more architectural frame without sliding. A narrow bridge under a thick frame fails fast.",
            },
          ].map((row) => (
            <div
              key={row.n}
              className="grid sm:grid-cols-[60px_1fr] gap-3 sm:gap-6 py-6"
              style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}
            >
              <div className="text-primary font-mono" style={{ fontSize: "0.85rem" }}>
                {row.n}
              </div>
              <div>
                <h3
                  className="font-display text-woolet-white mb-2"
                  style={{ fontSize: "1.05rem", fontWeight: 400 }}
                >
                  {row.title}
                </h3>
                <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.88rem" }}>
                  {row.body}
                </p>
              </div>
            </div>
          ))}

          <div
            className="mt-10 p-6 sm:p-8"
            style={{
              border: "1px solid hsl(var(--gold) / 0.25)",
              background: "hsl(var(--gold) / 0.04)",
            }}
          >
            <h3
              className="font-display text-woolet-white mb-3"
              style={{ fontSize: "1.05rem", fontWeight: 400 }}
            >
              The short version
            </h3>
            <p className="text-cream-light leading-relaxed" style={{ fontSize: "0.9rem" }}>
              If your glasses slide, fix the <strong>bridge</strong> first, the{" "}
              <strong>shape</strong> second, and the <strong>temples</strong>{" "}
              third. In that order. Solving 1 and 2 makes 3 a non-issue for
              almost every wide-bridge wearer.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section
          className="mb-14 p-7 sm:p-10"
          style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}
        >
          <h2
            className="font-display text-woolet-white mb-3 leading-tight"
            style={{ fontSize: "1.5rem", fontWeight: 400 }}
          >
            See your bridge width in 20 seconds
          </h2>
          <p className="text-cream-dim leading-relaxed mb-6" style={{ fontSize: "0.9rem" }}>
            The AI Fit Wizard measures bridge width, nose height and face width
            from a single phone photo and tells you whether 21&nbsp;mm,
            22&nbsp;mm or a bespoke width is right for you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/en/fit"
              className="text-woolet-white no-underline px-5 py-3 hover:bg-primary/10 transition-colors"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                border: "1px solid hsl(var(--gold) / 0.5)",
              }}
            >
              Start the Fit Wizard
            </Link>
            <Link
              to="/en/collections/keyhole-bridge-glasses"
              className="text-cream-dim hover:text-gold-light no-underline px-5 py-3"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                border: "1px solid hsl(0 0% 100% / 0.08)",
              }}
            >
              Shop Keyhole 21–22 mm
            </Link>
            <Link
              to="/en/fit/bespoke"
              className="text-cream-dim hover:text-gold-light no-underline px-5 py-3"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                border: "1px solid hsl(0 0% 100% / 0.08)",
              }}
            >
              Bespoke 20–24 mm
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <div
            className="text-primary uppercase mb-3"
            style={{ fontSize: "0.55rem", letterSpacing: "0.28em" }}
          >
            Quick answers
          </div>
          <h2
            className="font-display text-woolet-white mb-5"
            style={{ fontSize: "1.4rem", fontWeight: 400 }}
          >
            Bridge fit FAQ
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
                  style={{ fontSize: "0.85rem" }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="pt-6" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}>
          <Link
            to="/en/blog/category/nose-bridge-fit"
            className="text-cream-dim hover:text-gold-light no-underline uppercase"
            style={{ fontSize: "0.6rem", letterSpacing: "0.28em" }}
          >
            ← Back to Nose-Bridge Fit hub
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WideBridgeFitGuide;
