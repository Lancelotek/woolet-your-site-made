import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FB_GROUP_URL = "https://www.facebook.com/groups/867413636043717";
const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces";

const C = {
  bg: "#080807",
  surface: "#16140F",
  hair: "rgba(255,255,255,0.08)",
  hairStrong: "rgba(255,255,255,0.18)",
  body: "#EDE7D9",
  head: "#F8F8F6",
  muted: "#9A8E7E",
  gold: "#CAA449",
  goldLight: "#DBBE7B",
  goldDim: "#8A6E2C",
  goldWash: "rgba(202,164,73,0.18)",
  success: "#36C46A",
  ink: "#1F1B16",
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
] as const;
const UTM_STORAGE_KEY = "woolet_ty_utms";

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const captureUtms = (): UtmParams => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl: UtmParams = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) fromUrl[k] = v;
  });
  try {
    if (Object.keys(fromUrl).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UtmParams;
  } catch {
    /* ignore */
  }
  return fromUrl;
};

const track = (event: string, extra: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const utms = captureUtms();
  const dl =
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer =
      (window as unknown as { dataLayer?: unknown[] }).dataLayer || []);
  dl.push({ event, ...utms, ...extra });
};

export default function ThankYouFb() {
  useEffect(() => {
    track("ty_page_view");
  }, []);


  const eyebrow: React.CSSProperties = {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 500,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.gold,
  };
  const h1: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    color: C.head,
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  };
  const h2: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    color: C.head,
    lineHeight: 1.15,
    letterSpacing: "-0.005em",
  };
  const body: React.CSSProperties = {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 300,
    color: C.body,
    lineHeight: 1.65,
  };
  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    background: C.gold,
    color: C.ink,
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "18px 28px",
    borderRadius: 0,
    border: "none",
    textDecoration: "none",
    transition: "background 200ms ease",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.body }}>
      <Helmet>
        <title>Thank you — Woolet</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Barlow:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <style>{`
        @keyframes tyFbRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ty-fb-a { opacity: 0; animation: tyFbRise 500ms ease forwards; }
        .ty-fb-a1 { animation-delay: 0ms; }
        .ty-fb-a2 { animation-delay: 500ms; }
        .ty-fb-a3 { animation-delay: 620ms; }
        .ty-fb-card { transition: border-color 200ms ease; }
        .ty-fb-card:hover { border-color: rgba(255,255,255,0.18) !important; }
        .ty-fb-btn-primary:hover { background: ${C.goldDim} !important; }
        @media (prefers-reduced-motion: reduce) {
          .ty-fb-a { opacity: 1; animation: none; }
        }
        @media (max-width: 720px) {
          .ty-fb-card-grid { grid-template-columns: 1fr !important; }
          .ty-fb-step-num { font-size: 48px !important; }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          padding: "28px 20px",
          textAlign: "center",
          borderBottom: `1px solid ${C.hair}`,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.body,
            textDecoration: "none",
          }}
        >
          WOOLET
        </Link>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 20px 40px",
        }}
      >
        {/* Confirmation */}
        <section
          className="ty-fb-a ty-fb-a1"
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: `1px solid ${C.gold}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5l5 5L20 6.5"
                stroke={C.success}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ ...eyebrow, marginBottom: 18 }}>YOUR SPOT IS SAVED</div>
          <h1 style={{ ...h1, fontSize: "clamp(38px, 6vw, 56px)", margin: 0 }}>
            Two steps and you're set.
          </h1>
          <p
            style={{
              ...body,
              maxWidth: "60ch",
              margin: "24px auto 0",
              color: C.body,
              fontSize: 16,
            }}
          >
            You'll be first to hear when the Woolet campaign goes live — and
            you'll get founder pricing before anyone else. Here's how to lock
            that in.
          </p>

          <hr
            style={{
              border: 0,
              borderTop: `1px solid ${C.goldWash}`,
              margin: "56px auto 0",
              width: "100%",
            }}
          />
        </section>

        {/* Step 01 */}
        <section
          className="ty-fb-a ty-fb-a2 ty-fb-card"
          style={{
            marginTop: 40,
            background: C.surface,
            border: `1px solid ${C.hair}`,
            borderTop: `1px solid ${C.gold}`,
            padding: "40px 32px",
          }}
        >
          <div
            className="ty-fb-card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              className="ty-fb-step-num"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 64,
                color: C.gold,
                lineHeight: 1,
              }}
            >
              01
            </div>
            <div>
              <div style={{ ...eyebrow, marginBottom: 12 }}>STEP ONE</div>
              <h2 style={{ ...h2, fontSize: 32, margin: "0 0 16px" }}>
                Join the private Woolet VIP group.
              </h2>
              <p style={{ ...body, margin: 0 }}>
                This is where the frames actually get decided. Vote on the
                final colors and shapes, see acetate samples before anyone
                else, and talk straight to the people building them. No
                surveys, no guessing.
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "24px 0 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  "Prototype photos and colour votes, weeks before launch",
                  "Direct line to the founders",
                  "First access to founder-tier pledges",
                ].map((t) => (
                  <li
                    key={t}
                    style={{
                      ...body,
                      display: "flex",
                      gap: 14,
                      alignItems: "baseline",
                      fontSize: 15,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        background: C.gold,
                        display: "inline-block",
                        flexShrink: 0,
                        transform: "translateY(-2px)",
                      }}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <a
                href={FB_GROUP_URL}
                target="_blank"
                rel="noopener"
                onClick={() => track("ty_join_group")}
                onAuxClick={() => track("ty_join_group")}
                className="ty-fb-btn-primary"
                style={btnPrimary}
              >
                Join the group
              </a>
            </div>
          </div>
        </section>

        {/* Step 02 */}
        <section
          className="ty-fb-a ty-fb-a3 ty-fb-card"
          style={{
            marginTop: 24,
            background: C.surface,
            border: `1px solid ${C.hair}`,
            borderTop: `1px solid ${C.gold}`,
            padding: "40px 32px",
          }}
        >
          <div
            className="ty-fb-card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              className="ty-fb-step-num"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 64,
                color: C.gold,
                lineHeight: 1,
              }}
            >
              02
            </div>
            <div>
              <div style={{ ...eyebrow, marginBottom: 12 }}>Step two</div>
              <h2 style={{ ...h2, fontSize: 32, margin: "0 0 16px" }}>
                Follow the launch on Kickstarter.
              </h2>
              <p style={{ ...body, margin: 0 }}>
                Hit follow and Kickstarter notifies you the minute we go live.
                Early-bird tiers are capped — followers get in first.
              </p>
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: C.muted,
                  margin: "20px 0 32px",
                }}
              >
                Takes ten seconds. No pledge now.
              </p>

              <a
                href={KICKSTARTER_URL}
                target="_blank"
                rel="noopener"
                onClick={() => track("ty_follow_kickstarter")}
                onAuxClick={() => track("ty_follow_kickstarter")}
                className="ty-fb-btn-primary"
                style={btnPrimary}
              >
                Follow on Kickstarter
              </a>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr
          style={{
            border: 0,
            borderTop: `1px solid ${C.hair}`,
            margin: "64px 0 32px",
          }}
        />

        {/* Reassurance strip */}
        <div
          style={{
            border: `1px solid ${C.hair}`,
            padding: "16px 20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px 18px",
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {[
            "Hand made in EU",
            "Mazzucchelli acetate from Milan",
            "158 mm signature fit",
            "Bespoke 145–162 mm",
          ].map((t, i, arr) => (
            <span
              key={t}
              style={{ display: "inline-flex", alignItems: "center", gap: 14 }}
            >
              <span>{t}</span>
              {i < arr.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: C.gold,
                    display: "inline-block",
                  }}
                />
              )}
            </span>
          ))}
        </div>

        {/* Closing */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 22,
              color: C.head,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Built for the faces the big brands stopped measuring.
          </p>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 13,
              color: C.muted,
              margin: "16px 0 0",
            }}
          >
            Nothing else to do right now — we'll email you when the campaign is
            live.
          </p>
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${C.hair}`,
          marginTop: 64,
          padding: "24px 20px",
          textAlign: "center",
          fontFamily: "'Barlow', sans-serif",
          fontSize: 12,
          color: C.muted,
        }}
      >
        © 2026 Woolet by JAY23 LLC ·{" "}
        <Link
          to="/en/privacy-policy"
          style={{ color: C.muted, textDecoration: "none" }}
        >
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link
          to="/en/return-policy"
          style={{ color: C.muted, textDecoration: "none" }}
        >
          Terms
        </Link>
      </footer>
    </div>
  );
}
