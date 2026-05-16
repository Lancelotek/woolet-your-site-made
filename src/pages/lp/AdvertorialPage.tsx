import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";
import beforeAfterImg from "@/assets/before-after-fit.png";
import woolet007Detail from "@/assets/woolet-007-detail.png";
import authorMarek from "@/assets/author-marek.png";
import wooletModelImg from "@/assets/woolet-model.png";

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

      <div
        style={{
          background: "#F8F6F1",
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center" }}>
            <Link to="/en">
              <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
            </Link>
          </div>
          {/* 1. Tag bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              gap: 8,
            }}
          >
            <span
              style={{
                background: "#EDE9E0",
                color: "#5A4020",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
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
                background: "rgba(202,164,73,0.15)",
                color: "#A07A2A",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
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
                fontSize: 10,
                color: "#888",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              8 min
            </span>
          </div>

          {/* 2. Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4vw, 36px)",
              lineHeight: 1.2,
              color: "#111",
              padding: "0 20px",
              margin: "0 0 0 0",
            }}
          >
            For years I searched for glasses that fit my face.{" "}
            <em style={{ color: "#A07A2A", fontStyle: "italic" }}>
              Here's what I discovered.
            </em>
          </h1>

          {/* 3. Author row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: "1px solid #E8E4DC",
              gap: 10,
            }}
          >
            {/* Avatar */}
            <img
              src={authorMarek}
              alt="Marek K. — autor artykułu"
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
                  color: "#111",
                }}
              >
                Marek W.{" "}
                <span style={{ color: "#CAA449" }}>✓</span>
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "#888",
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
                  color: "#111",
                }}
              >
                92K
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 9,
                  color: "#888",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                VIEWS
              </span>
            </div>
          </div>

          {/* 4. Hero image */}
          <div style={{ padding: "14px 20px 0" }}>
            <img
              src={beforeAfterImg}
              alt="Comparison: glasses too small vs perfect fit on a wide face"
              style={{
                width: "100%",
                borderRadius: 8,
                display: "block",
              }}
              loading="eager"
            />
          </div>

          {/* 5. Article body */}
          <div style={{ padding: "0 20px" }}>
            {/* Section 1 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#111",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              It started with one photo from a company meeting.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#3A3A3A",
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
                borderLeft: "3px solid #A07A2A",
                padding: "10px 14px",
                background: "rgba(160,122,42,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#2A1A00",
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
                color: "#3A3A3A",
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
              alt="Man wearing Woolet wide-fit acetate glasses — 158mm frame"
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

            {/* Section 2 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#111",
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
                color: "#3A3A3A",
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
                color: "#111",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              You are not too wide. The frame is too narrow.
            </p>

            {/* Stat strip */}
            <div
              style={{
                background: "#F0EDE6",
                border: "1px solid #E0D9CF",
                borderRadius: 8,
                padding: "14px 16px",
                margin: "14px 0",
                display: "flex",
                gap: 12,
                textAlign: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#A07A2A" }}>130–148mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>standard market</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#A07A2A" }}>155–165mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>wide face range</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, color: "#CAA449" }}>158mm</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>Woolet minimum</div>
              </div>
            </div>

            {/* Section B */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#111",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              Premium doesn't mean expensive. Premium means the right material for you.
            </p>

            <blockquote
              style={{
                borderLeft: "3px solid #A07A2A",
                padding: "10px 14px",
                background: "rgba(160,122,42,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#2A1A00",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
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
                color: "#111",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
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
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              It was the first time in my life anyone had asked me that.
            </p>

            {/* Section D — Testimonials */}
            <blockquote
              style={{
                borderLeft: "3px solid #A07A2A",
                padding: "10px 14px",
                background: "rgba(160,122,42,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#2A1A00",
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
                  fontSize: 9,
                  letterSpacing: "2px",
                  color: "#888",
                  textTransform: "uppercase",
                  marginTop: 6,
                }}
              >
                MAREK W. · 161MM · WARSAW
              </div>
            </blockquote>

            <blockquote
              style={{
                borderLeft: "3px solid #A07A2A",
                padding: "10px 14px",
                background: "rgba(160,122,42,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#2A1A00",
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
                  fontSize: 9,
                  letterSpacing: "2px",
                  color: "#888",
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
                background: "#080807",
                borderRadius: 10,
                padding: 18,
                border: "1px solid #2A2520",
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
                    color: "#CAA449",
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
                    fontSize: 9,
                    color: "#CAA449",
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
                  color: "#F8F8F6",
                  lineHeight: 1.3,
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                Check if your face needs wider frames
              </p>

              {/* CTA button */}
              <button
                onClick={() => navigate("/en/fit/scan")}
                style={{
                  width: "100%",
                  background: "#CAA449",
                  color: "#080807",
                  border: "none",
                  padding: "13px 0",
                  borderRadius: 4,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                SCAN YOUR FACE · RESERVE FOR $1
              </button>
            </div>
          </div>

          {/* Internal links — after CTA */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ margin: "0 0 18px", padding: "14px 0", borderTop: "1px solid #E8E4DC" }}>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
                READ MORE
              </div>
              <Link to="/en/lp/5-reasons" style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 13, color: "#A07A2A", textDecoration: "none", marginBottom: 8, lineHeight: 1.5 }}>
                5 reasons why standard glasses ruin your face proportions →
              </Link>
              <Link to="/en/fit" style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 13, color: "#A07A2A", textDecoration: "none", lineHeight: 1.5 }}>
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
