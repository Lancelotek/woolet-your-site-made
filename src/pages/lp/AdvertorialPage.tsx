import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import Navbar from "@/components/Navbar";
import beforeAfterAsset from "@/assets/standard-vs-155mm.png.asset.json";
import frameWidthChartAsset from "@/assets/frame-width-comparison-chart.png.asset.json";
import noseBridgeAsset from "@/assets/nose-bridge-comparison.png.asset.json";
import wideFaceCompAsset from "@/assets/wide-face-fit-comparison.png.asset.json";
import woolet007Detail from "@/assets/woolet-007-detail.png";
import authorMarek from "@/assets/author-marek.png";
import wooletModelImg from "@/assets/woolet-model.png";

/* ---------- Reading progress bar ---------- */
const ReadingProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setPct(height > 0 ? Math.min(100, (scrolled / height) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "transparent",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "linear-gradient(90deg, #c2a05a, #d8b86a)",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
};

/* ---------- Sticky bottom CTA (appears after ~30% scroll) ---------- */
const StickyCta = ({ onClick }: { onClick: () => void }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const ratio = h.scrollTop / (h.scrollHeight - h.clientHeight);
      setVisible(ratio > 0.28 && ratio < 0.96);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        padding: "12px 16px",
        background: "rgba(11,10,9,0.92)",
        borderTop: "1px solid rgba(216,184,106,0.22)",
        backdropFilter: "blur(10px)",
        transform: visible ? "translateY(0)" : "translateY(110%)",
        transition: "transform 260ms cubic-bezier(.2,.7,.2,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 14,
          color: "#c4bdaf",
          display: "none",
        }}
        className="lp-sticky-label"
      >
        Find your width — and your bridge
      </span>
      <button
        onClick={onClick}
        style={{
          background: "#d8b86a",
          color: "#141210",
          border: "none",
          padding: "12px 22px",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: "2px",
          textTransform: "uppercase",
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        Scan your face — free
      </button>
    </div>
  );
};


const AdvertorialPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "advertorial",
      awareness_stage: "unaware",
    });
    pushGtmEvent("ViewContent", {
      content_name: "advertorial_why_glasses_fail",
    });
  }, []);

  useEffect(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "For years I searched for glasses that fit my face. Here's what I discovered.",
      author: { "@type": "Person", name: "Marek W.", url: "https://woolet.co/en/pages/about" },
      publisher: { "@type": "Organization", name: "Woolet", url: "https://woolet.co" },
      datePublished: "2026-04-01",
      description: "Why standard glasses optically widen broad faces and how 158mm frames solve the problem.",
      mainEntityOfPage: "https://woolet.co/en/lp/why-glasses-fail",
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(articleSchema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <>
      <Helmet>
        <title>Why Do Glasses Widen Your Face? A Guide | Woolet</title>
        <meta
          name="description"
          content="Broad-Faced Professionals: what actually works when searching for 155mm+ glasses. Geometry, material, and why standard opticians fail."
        />
        <link
          rel="canonical"
          href="https://woolet.co/en/lp/why-glasses-fail"
        />
      </Helmet>

      <style>{`
        .lp-article { background: #0b0a09; min-height: 100vh; font-family: 'Barlow', sans-serif; padding-bottom: 88px; }
        .lp-shell { max-width: 680px; margin: 0 auto; }
        .lp-body > p,
        .lp-body > h2,
        .lp-body > blockquote,
        .lp-body > .lp-narrow { max-width: 100%; margin-left: auto; margin-right: auto; }
        .lp-body > p { font-size: 16px; line-height: 1.78; color: #d4ccba; }
        .lp-body > p.lp-cap { font-size: 12.5px; line-height: 1.6; color: #8a8275; font-style: italic; margin: 8px 4px 18px; max-width: 1000px; }
        .lp-body > h2 { margin-top: 28px !important; font-size: 22px !important; }
        .lp-body > img { display: block; width: 100%; max-width: 1000px; margin: 24px auto; border-radius: 8px; }
        .lp-figure { margin: 20px 0; }
        .lp-figure .lp-cap { font-family: 'Barlow', sans-serif; font-weight: 300; font-size: 12.5px; line-height: 1.6; color: #8a8275; margin: 8px 4px 0; font-style: italic; }
        .lp-drop::first-letter {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-style: italic;
          font-size: 68px;
          float: left;
          line-height: 0.85;
          padding: 6px 12px 0 0;
          color: #d8b86a;
        }
        @media (min-width: 900px) {
          .lp-shell { max-width: 1040px; }
          .lp-body > p,
          .lp-body > h2,
          .lp-body > blockquote,
          .lp-body > .lp-narrow,
          .lp-narrow-row { max-width: 680px; }
          .lp-body > p { font-size: 17.5px; line-height: 1.78; }
          .lp-body > h2 { font-size: 26px !important; margin-top: 40px !important; }
          .lp-figure { margin: 36px auto; max-width: 1000px; }
          .lp-sticky-label { display: inline !important; }
          .lp-hero-h1 { font-size: 44px !important; line-height: 1.15 !important; }
        }
      `}</style>

      <ReadingProgress />
      <Navbar />

      <div className="lp-article">

        <div className="lp-shell">

          {/* 1. Tag bar */}
          <div
            className="lp-narrow-row"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "22px 20px 18px",
              gap: 8,
              margin: "0 auto",
            }}
          >
            <span
              style={{
                background: "rgba(216,184,106,0.10)",
                color: "#d8b86a",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.8px",
                fontFamily: "'Barlow', sans-serif",
                textTransform: "uppercase",
              }}
            >
              Eyewear
            </span>
            <span
              style={{
                background: "rgba(216,184,106,0.14)",
                color: "#d8b86a",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.8px",
                fontFamily: "'Barlow', sans-serif",
                textTransform: "uppercase",
              }}
            >
              Editor's Pick
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "#8a8275",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              8 min
            </span>
          </div>

          {/* 2. Headline */}
          <h1
            className="lp-hero-h1 lp-narrow-row"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4vw, 36px)",
              lineHeight: 1.2,
              color: "#f3ece0",
              padding: "0 20px",
              margin: "0 auto",
            }}
          >
            For years I searched for glasses that fit my face.{" "}
            <em style={{ color: "#d8b86a", fontStyle: "italic" }}>
              Here's what I discovered.
            </em>
          </h1>

          {/* 3. Author row */}
          <div
            className="lp-narrow-row"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 20px",
              borderBottom: "1px solid rgba(216,184,106,0.18)",
              gap: 10,
              margin: "0 auto",
            }}
          >
            {/* Avatar */}
            <img
              src={authorMarek}
              alt="Marek K. — Woolet co-founder and author of this article on glasses for wide faces"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />

            {/* Name + date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#f3ece0",
                }}
              >
                Marek W.{" "}
                <span style={{ color: "#d8b86a" }}>✓</span>
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  color: "#8a8275",
                }}
              >
                Published March 31, 2026
              </span>
            </div>

            {/* Views */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#f3ece0",
                }}
              >
                92K
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 12,
                  color: "#8a8275",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                VIEWS
              </span>
            </div>
          </div>

          {/* 4. Hero image — full figure width on desktop */}
          <figure className="lp-figure" style={{ padding: "24px 20px 8px", margin: 0 }}>
            <img
              src={beforeAfterAsset.url}
              alt="Standard narrow eyeglass frames vs Woolet frames built for 155mm+ wide faces — side-by-side fit comparison on a man with a wide head"
              style={{
                width: "100%",
                borderRadius: 8,
                display: "block",
              }}
              loading="eager"
            />
          </figure>

          {/* 4b. Frame width comparison chart */}
          <figure className="lp-figure" style={{ padding: "16px 20px 8px", margin: 0 }}>
            <img
              src={frameWidthChartAsset.url}
              alt="Frame width comparison chart in millimetres: Zenni 140mm, Warby Parker 148mm, Woolet S 155mm, Woolet M 158mm, Woolet L 161mm — wide faces need 155–168mm where most brands stop fitting"
              style={{
                width: "100%",
                borderRadius: 8,
                display: "block",
              }}
              loading="lazy"
            />
            {/* duplicate caption removed — chart subtitle already states this */}
          </figure>

          {/* 5. Article body */}
          <div className="lp-body" style={{ padding: "0 20px" }}>
            {/* Section 1 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              It started with one photo from a company meeting.
            </h2>

            <p
              className="lp-drop"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              My glasses looked expensive. They fit the salesman's hands,
              looked phenomenal in the case. On my face? Something was off.
              Too-narrow lenses optically widened my face instead of framing it.
            </p>


            {/* Pull quote */}
            <blockquote
              style={{
                borderLeft: "3px solid #d8b86a",
                padding: "10px 14px",
                background: "rgba(216,184,106,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#f3ece0",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "For years I thought it was a problem with my face. Turns out
                the problem was in the geometry of the glasses."
              </p>
            </blockquote>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              When the frame ends before the temple — the brain reads the
              exposed skin as extra width. Standard glasses (130–148mm) are
              physically too narrow for faces above 155mm. That's not an
              opinion — it's geometry.
            </p>

            {/* Inline image */}
            <img
              src={wooletModelImg}
              alt="Man with a wide face wearing Woolet 158mm Italian Mazzucchelli acetate glasses — proper wide-fit eyewear with keyhole bridge for 155mm+ faces"
              style={{
                width: "100%",
                height: 580,
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: 6,
                margin: "12px 0",
                display: "block",
              }}
              loading="lazy"
            />

            {/* Section 1b — Nose bridge */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "20px 0 8px",
                lineHeight: 1.3,
              }}
            >
              The second problem nobody fixes: the nose bridge
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              Width is only half of it. And it isn't only a wide-face issue —
              plenty of people with a slim face still have a <strong>wide nose</strong>.
              Standard frames are built around an 18–20mm bridge. If your nose
              is wider than that, the pads dig in, the frame sits too high, and
              it slides the moment you look down — no matter how light the
              acetate is.
            </p>

            <img
              src={noseBridgeAsset.url}
              alt="Glasses nose bridge fit diagram — standard 18–20mm keyhole bridge digging into a wide nose vs Woolet 21mm and 24mm wider bridge sizes sitting level for wide noses and slim-face wearers"
              style={{
                width: "100%",
                borderRadius: 8,
                margin: "12px 0 6px",
                display: "block",
              }}
              loading="lazy"
            />
            <p className="lp-cap" style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: 12,
              lineHeight: 1.6,
              color: "#8a8275",
              margin: "0 2px 14px",
              fontStyle: "italic",
            }}>
              Two keyhole bridge sizes — 21mm and 24mm — matched to your nose by the fit scan. The frame sits level, pads stop pinching, and the slide-down problem goes away. Built for wide noses on any face shape.
            </p>

            {/* Section 2 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              The premium market didn't exist.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              BXL Eyewear: TR90 plastic. Fatheadz: casual sportswear. No
              manufacturer combined 158mm+ width with Italian Mazzucchelli
              acetate. There was no brand positioned like Moscot or Oliver
              Peoples — but built exclusively for wide faces. That's why
              Woolet was created.
            </p>

            {/* Section A */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              The geometry nobody explained to you.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              Picture two rectangles drawn on a piece of paper. One narrow, one wide. Each surrounds the same centre point. The narrow rectangle makes the space on either side of that centre look larger — because it's exposed.
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              That's exactly what a narrow frame does to your face. It ends before your temple. It exposes the sides of your face. Your brain sees the contrast — frame against skin — and reads the skin as extra width.
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              You are not too wide. The frame is too narrow.
            </p>

            {/* Stat strip */}
            <div
              style={{
                background: "#141210",
                border: "1px solid rgba(216,184,106,0.18)",
                borderRadius: 8,
                padding: "14px 16px",
                margin: "14px 0",
                display: "flex",
                gap: 12,
                textAlign: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#d8b86a" }}>130–148mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#8a8275", letterSpacing: "1px", textTransform: "uppercase" }}>standard market</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#d8b86a" }}>155–165mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#8a8275", letterSpacing: "1px", textTransform: "uppercase" }}>wide face range</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#d8b86a" }}>158mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 12, color: "#8a8275", letterSpacing: "1px", textTransform: "uppercase" }}>Woolet minimum</div>
              </div>
            </div>

            {/* Section B */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              What "premium" actually means in eyewear.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              I visited three optical shops with a budget that should have bought me anything. In each one I heard the same line: "We have wide options." What I received were sporty TR90 frames or metal bridges that belonged on a pilot's face.
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              Premium doesn't mean expensive. Premium means the right material for you.
            </p>

            <blockquote
              style={{
                borderLeft: "3px solid #d8b86a",
                padding: "10px 14px",
                background: "rgba(216,184,106,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#f3ece0",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "Premium doesn't mean expensive. It means the right material for you."
              </p>
            </blockquote>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              Italian Mazzucchelli acetate has been produced since 1849. It is not injection-moulded plastic — it's hand-cut from sheets pressed from cotton fibre and cellulose. The colour depth is different. The weight is different. It holds its shape differently.
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              For wider faces this has practical significance: TR90 plastic under the tension of a 158mm spread deforms within weeks. Mazzucchelli acetate does not.
            </p>

            {/* Section C */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#f3ece0",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              Three weeks with the Woolet 007.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              I received a prototype pair. Model 007 — round panto, Dark Tortoise, 158mm. Wide temples. Keyhole bridge 21mm — the wider keyhole-shaped bridge that doesn't slide off your nose every twenty minutes.
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              First reaction when I put them on: surprised that nothing was squeezing.
            </p>

            <img
              src={woolet007Detail}
              alt="Woolet 007 Dark Tortoise acetate frames — front view showing wide 158mm fit, gold rivet details, and keyhole bridge"
              style={{
                width: "100%",
                objectFit: "contain",
                borderRadius: 6,
                margin: "12px 0",
                display: "block",
              }}
              loading="lazy"
            />

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              After three weeks: no headaches after a full day at the computer. No slipping during Zoom calls. No questions of "are those glasses slightly too small?"
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              Instead — twice someone asked: "Where did you get those glasses?"
            </p>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#c4bdaf",
                margin: "0 0 12px",
              }}
            >
              It was the first time in my life anyone had asked me that.
            </p>

            {/* Section D — Testimonials */}
            <blockquote
              style={{
                borderLeft: "3px solid #d8b86a",
                padding: "10px 14px",
                background: "rgba(216,184,106,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#f3ece0",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "I've been searching for frames this wide for years. Woolet is the first brand that actually gets it."
              </p>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  letterSpacing: "2px",
                  color: "#8a8275",
                  textTransform: "uppercase",
                  marginTop: 6,
                }}
              >
                MAREK W. · 161MM · WARSAW
              </div>
            </blockquote>

            <blockquote
              style={{
                borderLeft: "3px solid #d8b86a",
                padding: "10px 14px",
                background: "rgba(216,184,106,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#f3ece0",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "Finally no more marks on my temples at the end of the day. I didn't know glasses could be this comfortable."
              </p>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  letterSpacing: "2px",
                  color: "#8a8275",
                  textTransform: "uppercase",
                  marginTop: 6,
                }}
              >
                JAMES R. · 158MM · LONDON
              </div>
            </blockquote>

          </div>

          {/* 6. CTA block */}
          <div style={{ padding: "0 20px" }}>
            <div
              style={{
                background: "#141210",
                borderRadius: 10,
                padding: 18,
                border: "1px solid rgba(216,184,106,0.22)",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#d8b86a",
                    letterSpacing: "3px",
                    fontWeight: 300,
                  }}
                >
                  WOOLET
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    color: "#d8b86a",
                    letterSpacing: "3px",
                  }}
                >
                  FREE QUIZ
                </span>
              </div>

              {/* Subheadline */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: 15,
                  color: "#f3ece0",
                  lineHeight: 1.3,
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                Check if your face needs wider frames
              </p>

              {/* CTA button */}
              <button
                onClick={() => navigate("/en/fit")}
                style={{
                  width: "100%",
                  background: "#d8b86a",
                  color: "#141210",
                  border: "none",
                  padding: "13px 0",
                  borderRadius: 4,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                SCAN YOUR FACE — FREE
              </button>
            </div>
          </div>

          {/* Internal links — after CTA */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ margin: "0 0 18px", padding: "14px 0", borderTop: "1px solid rgba(216,184,106,0.18)" }}>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: "3px", color: "#8a8275", textTransform: "uppercase", marginBottom: 10 }}>
                READ MORE
              </div>
              <Link to="/en/lp/5-reasons" style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 13, color: "#d8b86a", textDecoration: "none", marginBottom: 8, lineHeight: 1.5 }}>
                5 reasons why standard glasses ruin your face proportions →
              </Link>
              <Link to="/en/fit" style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 13, color: "#d8b86a", textDecoration: "none", lineHeight: 1.5 }}>
                Measure your face → Fit Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvertorialPage;
