import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/attribution";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";
const wooletLogo = wooletLogoAsset.url;
import comparisonAsset from "@/assets/standard-vs-wide-comparison.png.asset.json";

/* ---------- design tokens (scoped to this page only) ---------- */
const C = {
  bg: "#0b0a09",
  bgPanel: "#141210",
  ink: "#f3ece0",
  inkDim: "#c4bdaf",
  inkMute: "#8a8275",
  gold: "#d8b86a",
  goldSoft: "#b89752",
  goldDark: "#3a352d",
  rule: "rgba(216,184,106,0.18)",
  divider: "rgba(244,236,222,0.08)",
};

const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

const REASONS = [
  {
    n: "01",
    tag: "Geometry",
    title: "Too-narrow frames make your face",
    em: "look wider",
    body: "It's physics. When the frame ends before the temple, the eye reads the exposed skin as extra width — the opposite of the effect you wanted.",
    stat: "130–148",
    statUnit: "mm",
    statLabel: "Typical standard width",
    visual: "bar",
  },
  {
    n: "02",
    tag: "Material",
    title: "Stressed plastic",
    em: "deforms in weeks",
    body: "TR90 and cheap acetates warp under the tension of a wider face. Italian Mazzucchelli acetate holds its shape — cotton and cellulose, not petrochemicals.",
    stat: "Mazzucchelli",
    statUnit: "",
    statLabel: "Cotton-cellulose acetate",
    visual: "text",
  },
  {
    n: "03",
    tag: "Hinges",
    title: "5-barrel hinges,",
    em: "not the standard 3",
    body: "Standard hinges snap within the first month at 158 mm. Woolet uses 5-barrel PVD gunmetal hinges, engineered for the load a wider temple puts on the joint.",
    stat: "11",
    statUnit: "°",
    statLabel: "Engineered opening angle",
    visual: "angle",
  },
  {
    n: "04",
    tag: "Bridge",
    title: "A 21 mm keyhole bridge",
    em: "that stops the slip",
    body: "A too-narrow bridge means adjusting your glasses every 20 minutes. The 21 mm keyhole bridge is matched to wider-set eyes — zero slip, all day.",
    stat: "21",
    statUnit: "mm",
    statLabel: "Keyhole bridge",
    visual: "stat",
  },
];

const MARKET = [
  { brand: "Warby Parker", note: "Wide", width: 148, max: 158, dim: true },
  { brand: "Cubitts", note: "XL", width: 140, max: 158, dim: true },
  { brand: "Fatheadz", note: "", width: 150, max: 158, dim: true, label: "sporty plastic" },
  { brand: "Woolet", note: "Wide Fit", width: 158, max: 158, dim: false },
];

const TESTIMONIALS = [
  {
    q: "I've been searching for frames this wide for years. Woolet is the first brand that actually gets it.",
    who: "Marek W.",
    meta: "161 mm · Warsaw",
  },
  {
    q: "Finally no more marks on my temples at the end of the day.",
    who: "James R.",
    meta: "158 mm · London",
  },
];

const ListiclePage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: { ...getAttribution(), email, name: "", face_width: "", models: "Woolet 007, Woolet 009" },
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
    pushGtmEvent("page_view", { page_type: "listicle", awareness_stage: "problem_aware" });
  }, []);

  return (
    <>
      <Helmet>
        <title>5 Reasons Standard Glasses Ruin Wide Faces | Woolet</title>
        <meta
          name="description"
          content="Geometry, material, hinges, bridge, market. Five engineering reasons standard 130–148 mm frames fail on 155 mm+ faces — and what Woolet does differently."
        />
        <link rel="canonical" href="https://woolet.co/en/lp/5-reasons" />
      </Helmet>

      <div
        className="lp5"
        style={{
          background: C.bg,
          color: C.ink,
          minHeight: "100vh",
          fontFamily: SANS,
          fontWeight: 300,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* ---------- Top bar ---------- */}
        <header
          style={{
            borderBottom: `1px solid ${C.divider}`,
            padding: "22px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link to="/en" style={{ textDecoration: "none" }}>
            <img src={wooletLogo} alt="Woolet" style={{ height: 28, display: "block" }} />
          </Link>
          <nav
            style={{
              display: "flex",
              gap: 42,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.inkDim,
            }}
          >
            <Link to="/en/collection" style={navLink}>Frames</Link>
            <Link to="/en/fit" style={navLink}>Find your fit</Link>
            <Link to="/en/bespoke" style={navLink}>Bespoke</Link>
            <Link to="/en/process" style={navLink}>Process</Link>
            <Link to="/en/blog" style={{ ...navLink, color: C.ink }}>Blog</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.22em", color: C.inkDim }}>EN</span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                color: C.ink,
                border: `1px solid ${C.gold}`,
                padding: "10px 18px",
              }}
            >
              SHOP — SOON
            </span>
          </div>
        </header>

        {/* ---------- Hero ---------- */}
        <section style={{ padding: "88px 48px 56px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <span style={{ width: 28, height: 1, background: C.gold }} />
                <span style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold }}>
                  The Fit Guide
                </span>
                <span style={{ fontSize: 11, letterSpacing: "0.18em", color: C.inkMute }}>
                  · 4,900+ on the waitlist
                </span>
              </div>

              <h1
                style={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: "clamp(40px, 4.4vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  color: C.ink,
                  maxWidth: 680,
                }}
              >
                5 reasons standard glasses{" "}
                <em style={{ color: C.gold, fontStyle: "italic", fontWeight: 400 }}>
                  ruin your face proportions
                </em>
              </h1>

              <p
                style={{
                  marginTop: 28,
                  maxWidth: 480,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: C.inkDim,
                }}
              >
                Frames that looked sharp in the case were squeezing your temples by noon.
                The stylish options stopped at 148 mm. Here's the engineering — and what
                actually fits.
              </p>
            </div>

            {/* Right: comparison image */}
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                border: `1px solid ${C.divider}`,
                background: C.bgPanel,
              }}
            >
              <img
                src={comparisonAsset.url}
                alt="Standard frames vs. Woolet built for 155 mm+ — face fit comparison"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* ---------- Reasons table ---------- */}
        <section style={{ padding: "20px 48px 40px", maxWidth: 1320, margin: "0 auto" }}>
          {REASONS.map((r) => (
            <article
              key={r.n}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 280px",
                gap: 48,
                padding: "48px 0",
                borderTop: `1px solid ${C.divider}`,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 56,
                  fontWeight: 400,
                  color: C.gold,
                  lineHeight: 1,
                  fontStyle: "italic",
                }}
              >
                {r.n}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: C.inkMute,
                    marginBottom: 16,
                  }}
                >
                  {r.tag}
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 28,
                    lineHeight: 1.2,
                    color: C.ink,
                    margin: 0,
                  }}
                >
                  {r.title}{" "}
                  <em style={{ color: C.gold, fontStyle: "italic", fontWeight: 400 }}>{r.em}</em>
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    maxWidth: 560,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: C.inkDim,
                  }}
                >
                  {r.body}
                </p>

                {r.visual === "bar" && (
                  <div style={{ marginTop: 28, maxWidth: 520 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        color: C.inkMute,
                        marginBottom: 8,
                      }}
                    >
                      <span>× Frame stops short</span>
                      <span style={{ color: C.gold }}>✓ Covers the temple</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 10,
                          background:
                            "repeating-linear-gradient(45deg, rgba(244,236,222,0.12), rgba(244,236,222,0.12) 4px, transparent 4px, transparent 8px)",
                          border: `1px solid rgba(244,236,222,0.18)`,
                        }}
                      />
                      <div style={{ flex: 1, height: 10, background: C.gold }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: r.visual === "text" ? SERIF : SERIF,
                    fontSize: r.visual === "text" ? 32 : 44,
                    fontWeight: 400,
                    color: C.ink,
                    lineHeight: 1,
                  }}
                >
                  {r.stat}
                  {r.statUnit && (
                    <span style={{ fontSize: 16, color: C.inkMute, marginLeft: 4 }}>{r.statUnit}</span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 10.5,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: C.inkMute,
                  }}
                >
                  {r.statLabel}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ---------- 05 Market card ---------- */}
        <section style={{ padding: "20px 48px 80px", maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              border: `1px solid ${C.rule}`,
              background: "linear-gradient(180deg, rgba(216,184,106,0.04), rgba(216,184,106,0))",
              padding: "48px 56px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 48 }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 56,
                  fontStyle: "italic",
                  color: C.gold,
                  lineHeight: 1,
                }}
              >
                05
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: C.inkMute,
                    marginBottom: 16,
                  }}
                >
                  The Market
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 32,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Premium <em style={{ color: C.gold, fontStyle: "italic" }}>and</em> 158 mm didn't
                  exist — until Woolet
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    maxWidth: 640,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: C.inkDim,
                  }}
                >
                  The widest mainstream options top out below 150 mm, and the truly wide brands use
                  sporty plastic. No one paired real width with Italian acetate in the premium
                  segment.
                </p>

                {/* market bars */}
                <div style={{ marginTop: 36, display: "grid", gap: 14, maxWidth: 880 }}>
                  {MARKET.map((m) => {
                    const pct = (m.width / 165) * 100;
                    return (
                      <div
                        key={m.brand}
                        style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px", alignItems: "center", gap: 24 }}
                      >
                        <div style={{ fontSize: 14, color: m.dim ? C.inkDim : C.ink }}>
                          {m.brand}{" "}
                          {m.note && (
                            <span style={{ color: m.dim ? C.inkMute : C.gold, marginLeft: 6, fontSize: 12 }}>
                              {m.note}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            position: "relative",
                            height: m.dim ? 8 : 14,
                            background: "rgba(244,236,222,0.05)",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: m.dim ? "rgba(196,189,175,0.35)" : C.gold,
                              boxShadow: m.dim ? "none" : `0 0 18px rgba(216,184,106,0.35)`,
                            }}
                          />
                          {m.label && (
                            <span
                              style={{
                                position: "absolute",
                                left: `${pct + 1}%`,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 11,
                                color: C.inkMute,
                                fontStyle: "italic",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {m.label}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: m.dim ? C.inkMute : C.ink,
                            textAlign: "right",
                          }}
                        >
                          {m.width} mm
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* price + CTA */}
                <div
                  style={{
                    marginTop: 44,
                    paddingTop: 28,
                    borderTop: `1px solid ${C.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: C.inkMute,
                      }}
                    >
                      Founding Member
                    </span>
                    <span style={{ fontFamily: SERIF, fontSize: 36, color: C.ink }}>$114</span>
                    <span style={{ fontSize: 16, color: C.inkMute, textDecoration: "line-through" }}>
                      $190
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        color: C.gold,
                        border: `1px solid ${C.gold}`,
                        padding: "6px 10px",
                      }}
                    >
                      40% OFF AT LAUNCH
                    </span>
                  </div>
                  <a
                    href="#waitlist"
                    onClick={() =>
                      pushGtmEvent("listicle_cta_click", { location: "market_card", dest: "waitlist" })
                    }
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: C.bg,
                      background: C.gold,
                      padding: "16px 28px",
                      textDecoration: "none",
                    }}
                  >
                    Join the Waitlist
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Testimonials ---------- */}
        <section style={{ padding: "0 48px 80px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.who}
                style={{
                  margin: 0,
                  padding: "24px 28px",
                  borderLeft: `2px solid ${C.gold}`,
                  background: "rgba(216,184,106,0.04)",
                }}
              >
                <p style={{ fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: C.ink, margin: 0, lineHeight: 1.4 }}>
                  "{t.q}"
                </p>
                <footer
                  style={{
                    marginTop: 14,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.inkMute,
                  }}
                >
                  {t.who} · {t.meta}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ---------- Waitlist ---------- */}
        <section
          id="waitlist"
          style={{ padding: "0 48px 96px", maxWidth: 1320, margin: "0 auto" }}
        >
          <div
            style={{
              border: `1px solid ${C.rule}`,
              padding: "64px 56px",
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(216,184,106,0.05), rgba(216,184,106,0))",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.gold,
                marginBottom: 18,
              }}
            >
              Woolet · Wide Fit 158
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 1.2,
                margin: 0,
                color: C.ink,
                maxWidth: 640,
                marginInline: "auto",
              }}
            >
              Join 4,900+ people already waiting for frames that fit.
            </h2>

            {!submitted ? (
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  gap: 10,
                  maxWidth: 520,
                  marginInline: "auto",
                }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && subscribe()}
                  style={{
                    flex: 1,
                    padding: "16px 18px",
                    background: "rgba(244,236,222,0.04)",
                    border: `1px solid ${C.divider}`,
                    color: C.ink,
                    fontFamily: SANS,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={subscribe}
                  disabled={loading || !email}
                  style={{
                    background: C.gold,
                    color: C.bg,
                    border: "none",
                    padding: "0 28px",
                    fontFamily: SANS,
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    cursor: loading ? "wait" : "pointer",
                    opacity: !email ? 0.55 : 1,
                  }}
                >
                  {loading ? "..." : "Get 40% off"}
                </button>
              </div>
            ) : (
              <p style={{ marginTop: 28, color: C.gold, fontSize: 14 }}>
                ✓ You're on the list — check your inbox.
              </p>
            )}

            <p style={{ marginTop: 18, fontSize: 12, color: C.inkMute }}>
              Italian Mazzucchelli acetate · PVD gunmetal · 158 mm · No spam, unsubscribe anytime
            </p>
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <footer
          style={{
            borderTop: `1px solid ${C.divider}`,
            padding: "56px 48px 32px",
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: 48,
            }}
          >
            <div>
              <img src={wooletLogo} alt="Woolet" style={{ height: 28, marginBottom: 18 }} />
              <p style={{ fontSize: 13, color: C.inkDim, lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
                Eyewear engineered for wide faces. Italian acetate, handmade in the EU.
              </p>
              <div style={{ display: "flex", gap: 18, marginTop: 22, fontSize: 11, letterSpacing: "0.22em", color: C.inkMute, textTransform: "uppercase" }}>
                <a href="https://www.instagram.com/woolet.co" target="_blank" rel="noopener" style={footLink}>Instagram</a>
                <a href="https://www.facebook.com/woolet.co" target="_blank" rel="noopener" style={footLink}>Facebook</a>
              </div>
            </div>

            <FooterCol title="Shop" links={[
              ["Frames", "/en/collection"],
              ["Bespoke", "/en/bespoke"],
              ["Find your fit", "/en/fit"],
              ["Kickstarter", "/en/lp/kickstarter"],
            ]} />
            <FooterCol title="Learn" links={[
              ["Why glasses fail", "/en/lp/why-glasses-fail"],
              ["Bridge fit guide", "/en/lp/wide-bridge-fit-guide"],
              ["The process", "/en/process"],
              ["Blog", "/en/blog"],
            ]} />
            <FooterCol title="Company" links={[
              ["Support", "/en/contact"],
              ["Return policy", "/en/return-policy"],
              ["Privacy", "/en/privacy-policy"],
              ["Cookie settings", "/en/cookie-policy"],
            ]} />
          </div>

          <div
            style={{
              maxWidth: 1320,
              margin: "40px auto 0",
              paddingTop: 24,
              borderTop: `1px solid ${C.divider}`,
              fontSize: 11,
              color: C.inkMute,
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} JAY23 LLC — woolet.co · 412 N. Main Street, STE 100 · Buffalo, Wyoming 82834
          </div>
        </footer>
      </div>
    </>
  );
};

/* ---------- helpers ---------- */
const navLink: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};
const footLink: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
};


const FooterCol = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div>
    <div
      style={{
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 18,
      }}
    >
      {title}
    </div>
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
      {links.map(([label, href]) => (
        <li key={href}>
          <Link to={href} style={{ color: C.inkDim, textDecoration: "none", fontSize: 13 }}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default ListiclePage;
