import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";

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
      author: { "@type": "Person", name: "Marek K.", url: "https://woolet.co/en/pages/about" },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
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
              5 min
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
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#1A1612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#CAA449",
                }}
              >
                W
              </span>
            </div>

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
                Marek K.{" "}
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
                Published 2 days ago
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
              src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&q=80&auto=format&fit=crop"
              alt="Glasses on background — frame geometry"
              style={{
                width: "100%",
                height: 130,
                objectFit: "cover",
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

            {/* Internal links */}
            <div style={{ margin: "18px 0 0", padding: "14px 0", borderTop: "1px solid #E8E4DC" }}>
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
                onClick={() => navigate("/en/fit")}
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
                MEASURE YOUR FACE WIDTH →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvertorialPage;
