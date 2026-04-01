import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";

const CARDS = [
  {
    num: "01",
    tag: "GEOMETRY",
    title: "Too-narrow frames optically WIDEN your face",
    body: "It's physics. When the frame ends before the temple, the brain interprets exposed skin as extra width. Standard 130–148mm → the opposite of the intended effect.",
  },
  {
    num: "02",
    tag: "MATERIAL",
    title: "Stressed plastic deforms within weeks",
    body: "TR90 and cheap acetates deform under the tension of wider faces. Italian Mazzucchelli acetate holds its shape — cotton and cellulose, not petrochemicals.",
  },
  {
    num: "03",
    tag: "HINGES",
    title: "5-barrel hinges vs. standard 3-barrel",
    body: "Standard hinges snap within the first month at 158mm. Woolet uses 5-barrel PVD Gunmetal hinges, engineered for an 11° opening angle.",
  },
  {
    num: "04",
    tag: "BRIDGE",
    title: "21mm keyhole bridge eliminates slipping",
    body: "Too-narrow bridge = adjusting your glasses every 20 minutes. The 21mm keyhole bridge is matched to wider-set eyes. Zero slip.",
  },
  {
    num: "05",
    tag: "MARKET",
    title: "Premium + 158mm didn't exist before Woolet",
    body: "Warby Parker Wide: max 148mm. Cubitts XL: 140mm. Fatheadz: sporty plastic. Woolet = the only brand combining 158mm with Mazzucchelli acetate in the premium segment. Founding Member: €189 (standard: €239).",
  },
];

const ListiclePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "listicle",
      awareness_stage: "problem_aware",
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>5 Reasons Why Standard Glasses Don't Fit Wide Faces | Woolet</title>
        <meta
          name="description"
          content="5 technical reasons why 130–148mm glasses don't fit 155mm+ faces. Geometry, Mazzucchelli acetate, 5-barrel hinges, 21mm keyhole bridge."
        />
        <link rel="canonical" href="https://woolet.co/en/lp/5-reasons" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        style={{
          background: "#080807",
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ padding: "16px 20px 0" }}>
            <Link to="/en">
              <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
            </Link>
          </div>

          {/* 1. Hero */}
          <div
            style={{
              background: "linear-gradient(180deg, #1A1000 0%, #080807 100%)",
              padding: "20px 20px 0",
            }}
          >
            {/* Stars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 8,
              }}
            >
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: "#CAA449", fontSize: 11 }}>
                  ★
                </span>
              ))}
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "#7A7570",
                  marginLeft: 6,
                }}
              >
                4.9 · 4,900+ reviews
              </span>
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                lineHeight: 1.2,
                color: "#F8F8F6",
                margin: 0,
              }}
            >
              5 reasons why standard glasses{" "}
              <em style={{ color: "#DBC184", fontStyle: "italic" }}>
                ruin your face proportions
              </em>
            </h1>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 11,
                color: "#9A8E7E",
                marginTop: 6,
                marginBottom: 4,
              }}
            >
              (and why it's not your face that's the problem)
            </p>
          </div>

          {/* 2. Gold separator */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #A07A2A, transparent)",
            }}
          />

          {/* 3. Photo strip */}
          <div
            style={{
              display: "flex",
              gap: 2,
              height: 80,
              padding: "8px 20px 0",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80&auto=format&fit=crop"
              alt="Man wearing glasses"
              style={{
                flex: 1.5,
                objectFit: "cover",
                borderRadius: "6px 0 0 6px",
                minWidth: 0,
              }}
              loading="eager"
            />
            <img
              src="https://images.unsplash.com/photo-1574258495973-c54d73bfec77?w=700&q=80&auto=format&fit=crop"
              alt="Frame details"
              style={{
                flex: 1,
                objectFit: "cover",
                borderRadius: "0 6px 6px 0",
                borderLeft: "1px solid #2A2520",
                minWidth: 0,
              }}
              loading="eager"
            />
          </div>

          {/* 4. Issue cards */}
          <div style={{ padding: "10px 20px 0" }}>
            {CARDS.map((card) => (
              <div
                key={card.num}
                style={{
                  background: "#1A1612",
                  borderRadius: 10,
                  padding: 14,
                  border: "1px solid #2A2520",
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Left accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: "#CAA449",
                  }}
                />

                <div style={{ paddingLeft: 10 }}>
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#CAA449",
                      }}
                    >
                      {card.num}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 8,
                        letterSpacing: "2px",
                        color: "#7A7570",
                        background: "#2A2520",
                        padding: "2px 6px",
                        borderRadius: 3,
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: "#F8F8F6",
                      lineHeight: 1.3,
                      margin: "5px 0 4px",
                    }}
                  >
                    {card.title}
                  </p>

                  {/* Body */}
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: 12,
                      color: "#BBBBBB",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 5. CTA block */}
          <div style={{ margin: "14px 20px 24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #A07A2A, #CAA449)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              {/* Brand row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: 12,
                    color: "#080807",
                    letterSpacing: "3px",
                  }}
                >
                  WOOLET
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 8,
                    color: "#080807",
                    letterSpacing: "2px",
                  }}
                >
                  WIDE FIT 158
                </span>
              </div>

              {/* Headline */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: 18,
                  color: "#080807",
                  lineHeight: 1.2,
                  marginBottom: 14,
                  marginTop: 0,
                }}
              >
                The first premium eyewear built for wider faces
              </p>

              {/* Button */}
              <button
                onClick={() => navigate("/en")}
                style={{
                  width: "100%",
                  background: "#080807",
                  color: "#CAA449",
                  border: "none",
                  padding: "13px 0",
                  borderRadius: 5,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                CHECK YOUR FIT →
              </button>

              {/* Subtext */}
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "rgba(8,8,7,0.55)",
                  textAlign: "center",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                Italian Mazzucchelli Acetate · PVD Gunmetal · 158mm
              </p>
            </div>
          </div>

          {/* Internal links — product recommendations */}
          <div style={{ padding: "14px 20px 24px" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#7A7570", textTransform: "uppercase", marginBottom: 10 }}>
              RECOMMENDED
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/en/products/007" style={{ flex: 1, background: "#1A1612", borderRadius: 8, border: "1px solid #2A2520", padding: 12, textDecoration: "none", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2A2520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#CAA449", fontWeight: 300 }}>007</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: "#F8F8F6", margin: 0, lineHeight: 1.3 }}>Woolet 007 — Panto / Round</p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A7570", margin: "2px 0 0" }}>158mm · Mazzucchelli · from €189</p>
                </div>
              </Link>
              <Link to="/en/products/009" style={{ flex: 1, background: "#1A1612", borderRadius: 8, border: "1px solid #2A2520", padding: 12, textDecoration: "none", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2A2520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#CAA449", fontWeight: 300 }}>009</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: "#F8F8F6", margin: 0, lineHeight: 1.3 }}>Woolet 009 — Square</p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A7570", margin: "2px 0 0" }}>158mm · Mazzucchelli · from €189</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListiclePage;
