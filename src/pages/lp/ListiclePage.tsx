import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import { supabase } from "@/integrations/supabase/client";
import wooletLogo from "@/assets/woolet-logo.png";
import woolet009Img from "@/assets/woolet-009.png";
import woolet007Img from "@/assets/woolet-007.png";
import wooletModelImg from "@/assets/woolet-model.png";
import listicleHeroLeft from "@/assets/listicle-hero-left.png";

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
    body: "Warby Parker Wide: max 148mm. Cubitts XL: 140mm. Fatheadz: sporty plastic. Woolet = the only brand combining 158mm with Mazzucchelli acetate in the premium segment. Founding Member: 499 zł (standard: 589 zł).",
  },
];

const TESTIMONIALS = [
  {
    quote: "I've been searching for frames this wide for years. Woolet is the first brand that actually gets it.",
    attribution: "MAREK W. · 161MM · WARSAW",
  },
  {
    quote: "Finally no more marks on my temples at the end of the day.",
    attribution: "JAMES R. · 158MM · LONDON",
  },
];

const ListiclePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: { email, name: "", face_width: "", models: "Woolet 007, Woolet 009" },
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);
      pushGtmEvent("waitlist_signup", { waitlist_email: email, waitlist_models: "Woolet 007, Woolet 009" });
      pushGtmEvent("generate_lead", { awareness_stage: "solution_aware", source: "listicle" });
      setSubmitted(true);
    } catch (err) {
      console.error("Listicle subscribe error:", err);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Hero */}
          <div
            style={{
              background: "linear-gradient(180deg, #1A1000 0%, #080807 100%)",
              padding: "20px 20px 0",
            }}
          >
            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A7570" }}>
                4,900+ on the waitlist
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

          {/* CHANGE 3 — Intro paragraph */}
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: "#9A8E7E",
              lineHeight: 1.7,
              padding: "8px 20px 4px",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            You've tried. Frames that looked great in the display case were squeezing your temples by noon. Stylish options stopped at 148mm. Here's the engineering explanation — and what actually fits.
          </p>

          {/* Gold separator */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, #A07A2A, transparent)",
            }}
          />

          {/* Photo strip — CHANGE 1 & 2 */}
          <div
            style={{
              display: "flex",
              gap: 2,
              height: 240,
              padding: "8px 20px 0",
            }}
          >
            <img
              src={listicleHeroLeft}
              alt="Man wearing wide-fit tortoise acetate glasses"
              style={{
                flex: 1.5,
                objectFit: "cover",
                objectPosition: "top center",
                borderRadius: "6px 0 0 6px",
                minWidth: 0,
              }}
              loading="eager"
            />
            <img
              src={wooletModelImg}
              alt="Dark tortoise acetate wide-fit frames — Woolet 158mm"
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

          {/* Issue cards */}
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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 500, color: "#CAA449" }}>
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

          {/* CHANGE 5 — Testimonials */}
          <div style={{ padding: "4px 20px 10px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "2px solid #A07A2A",
                  background: "rgba(160,122,42,0.06)",
                  padding: "10px 14px",
                  marginBottom: 10,
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: 12,
                    color: "#BBBBBB",
                    lineHeight: 1.7,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  "{t.quote}"
                </p>
                <p
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: 9,
                    letterSpacing: "2px",
                    color: "#888",
                    textTransform: "uppercase",
                    marginTop: 6,
                    marginBottom: 0,
                  }}
                >
                  {t.attribution}
                </p>
              </div>
            ))}
          </div>

          {/* CHANGE 4 — CTA block */}
          <div style={{ margin: "14px 20px 24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #A07A2A, #CAA449)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
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
                Join 4,900+ people already waiting for Woolet.
              </p>

              {!submitted ? (
                <>
                  {/* Email input */}
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#1A1612",
                      border: "1px solid #2A2520",
                      color: "#F8F8F6",
                      borderRadius: 4,
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: 13,
                      fontWeight: 300,
                      outline: "none",
                      marginBottom: 8,
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Privacy checkbox */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      cursor: "pointer",
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: 10,
                      color: "rgba(8,8,7,0.65)",
                      marginBottom: 8,
                    }}
                  >
                    <input type="checkbox" checked={privacyAccepted} onChange={() => setPrivacyAccepted(v => !v)} style={{ display: "none" }} />
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: `1px solid ${privacyAccepted ? "#CAA449" : "#ccc"}`,
                        backgroundColor: privacyAccepted ? "#CAA449" : "transparent",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {privacyAccepted && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <span>
                      I agree to the{" "}
                      <Link to="/en/privacy-policy" style={{ color: "#CAA449", textDecoration: "underline" }}>Privacy Policy</Link>
                    </span>
                  </label>

                  {/* Button */}
                  <button
                    onClick={handleEmailSubmit}
                    disabled={loading || !email || !privacyAccepted}
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
                      cursor: loading ? "wait" : "pointer",
                      opacity: (!email || !privacyAccepted) ? 0.5 : 1,
                    }}
                  >
                    {loading ? "SENDING..." : "CLAIM MY FOUNDING SPOT →"}
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
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: 18, color: "#CAA449", marginBottom: 6 }}>✓</div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 13, color: "#080807", margin: 0 }}>
                    You're on the list — check your inbox.
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "rgba(8,8,7,0.55)", marginTop: 6, marginBottom: 0 }}>
                    15% off + free shipping locked in.
                  </p>
                </div>
              )}

              {/* Secondary link */}
              <span
                onClick={() => navigate("/en/fit")}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 11,
                  color: "#9A8E7E",
                  textAlign: "center",
                  display: "block",
                  marginTop: 10,
                  cursor: "pointer",
                }}
              >
                Not sure about your size? Check your fit first →
              </span>
            </div>
          </div>

          {/* CHANGE 6 — Recommended with images */}
          <div style={{ padding: "14px 20px 24px" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "3px", color: "#7A7570", textTransform: "uppercase", marginBottom: 10 }}>
              RECOMMENDED
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/en/products/007" style={{ flex: 1, background: "#1A1612", borderRadius: 8, border: "1px solid #2A2520", textDecoration: "none", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 120, padding: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#141210", borderRadius: "6px 6px 0 0" }}>
                  <img
                    src={woolet007Img}
                    alt="Woolet 007 — Panto / Round"
                    style={{ maxWidth: "80%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                    loading="lazy"
                  />
                </div>
                <div style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2A2520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#CAA449", fontWeight: 300 }}>007</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: "#F8F8F6", margin: 0, lineHeight: 1.3 }}>Woolet 007 — Panto / Round</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A7570", margin: "2px 0 0" }}>158mm · Mazzucchelli · from 499 zł</p>
                  </div>
                </div>
              </Link>
              <Link to="/en/products/009" style={{ flex: 1, background: "#1A1612", borderRadius: 8, border: "1px solid #2A2520", textDecoration: "none", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 120, padding: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#141210", borderRadius: "6px 6px 0 0" }}>
                  <img
                    src={woolet009Img}
                    alt="Woolet 009 — Square"
                    style={{ maxWidth: "80%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                    loading="lazy"
                  />
                </div>
                <div style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2A2520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#CAA449", fontWeight: 300 }}>009</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: "#F8F8F6", margin: 0, lineHeight: 1.3 }}>Woolet 009 — Square</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#7A7570", margin: "2px 0 0" }}>158mm · Mazzucchelli · from 499 zł</p>
                  </div>
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
