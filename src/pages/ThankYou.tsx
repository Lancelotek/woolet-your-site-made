import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";

const T = {
  ink: "#141210",
  paper: "#F5F1EB",
  muted: "#8C8680",
  gold: "#B8975A",
  goldLight: "#D4B07A",
  bd: "rgba(245,241,235,0.08)",
  bd2: "rgba(245,241,235,0.12)",
  dim: "rgba(245,241,235,0.55)",
  faint: "rgba(245,241,235,0.25)",
};

const gridOverlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
  backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
  `,
  backgroundSize: "80px 80px",
};

export default function ThankYou() {
  const navigate = useNavigate();
  const { lang = "en" } = useParams();
  const [searchParams] = useSearchParams();
  const spot = searchParams.get("spot") || "219";
  const spotNum = parseInt(spot, 10) || 219;
  const totalSpots = 300;
  const pct = Math.min(Math.round((spotNum / totalSpots) * 100), 100);
  const refLink = `woolet.co/ref/m${spot}x`;

  const [copied, setCopied] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${refLink}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { n: "01", title: "Check your inbox", body: "Confirmation email on its way — add us to contacts so we don't land in spam." },
    { n: "02", title: "We're finishing samples", body: "007 & 009 models are in production. Founding members see them first." },
    { n: "03", title: "Early access & founding price", body: "When we launch, your spot locks in the founding member rate." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.ink, color: T.paper, position: "relative" }}>
      <style>{`
        @keyframes tyFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tyPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .ty-a0 { animation: tyFadeUp 700ms ease both; animation-delay: 0ms; }
        .ty-a1 { animation: tyFadeUp 700ms ease both; animation-delay: 150ms; }
        .ty-a2 { animation: tyFadeUp 700ms ease both; animation-delay: 300ms; }
        .ty-a3 { animation: tyFadeUp 700ms ease both; animation-delay: 450ms; }
        .ty-pulse-dot { animation: tyPulse 2s ease-in-out infinite; }
        @media (max-width: 767px) {
          .ty-grid { grid-template-columns: 1fr !important; }
          .ty-left-col { border-right: none !important; border-bottom: 0.5px solid ${T.bd} !important; padding: 24px 20px !important; }
          .ty-right-col { padding: 24px 20px !important; }
          .ty-right-label { display: none !important; }
          .ty-ghost-num { font-size: 64px !important; }
          .ty-overlay-num { font-size: 26px !important; }
          .ty-headline { font-size: 36px !important; }
          .ty-topbar { padding: 0 20px !important; }
          .ty-footer { padding: 0 20px !important; }
          .ty-footer-left { display: none !important; }
          .ty-footer-right { text-align: center !important; width: 100% !important; }
        }
      `}</style>
      <div style={gridOverlayStyle} />

      {/* top bar */}
      <div
        className="ty-topbar"
        style={{
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", borderBottom: `0.5px solid ${T.bd}`, position: "relative", zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300,
            color: T.paper, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
          }}
          onClick={() => navigate(`/${lang}`)}
        >
          Woolet
        </span>
        <span
          className="ty-right-label"
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.muted,
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}
        >
          Italian Acetate · Wide Frames
        </span>
      </div>

      {/* main grid */}
      <div
        className="ty-grid"
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          minHeight: "calc(100vh - 72px - 52px)", position: "relative", zIndex: 1,
        }}
      >
        {/* LEFT column */}
        <div
          className="ty-left-col"
          style={{
            borderRight: `0.5px solid ${T.bd}`, padding: "52px 40px",
            display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 560, marginLeft: "auto",
          }}
        >
          {/* founding member tag */}
          <div className="ty-a0" style={{ marginBottom: 28 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "0.5px solid rgba(184,151,90,0.4)", borderRadius: 2, padding: "6px 12px",
              }}
            >
              <span className="ty-pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.gold, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                FOUNDING MEMBER CONFIRMED
              </span>
            </span>
          </div>

          {/* headline */}
          <h1
            className="ty-a1 ty-headline"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 300, lineHeight: 1.15, marginBottom: 20 }}
          >
            You're{" "}
            <em style={{ color: T.goldLight, fontStyle: "italic" }}>in.</em>
            <br />
            Now we build.
          </h1>

          {/* subtext */}
          <p className="ty-a2" style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: T.dim, maxWidth: 320, lineHeight: 1.7, marginBottom: 36 }}>
            You'll be among the first to receive Woolet — premium Italian acetate frames made for faces that standard sizing has always ignored. We'll reach out before anyone else.
          </p>

          {/* next steps */}
          <div className="ty-a3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                style={{
                  borderTop: `0.5px solid ${T.bd}`,
                  borderBottom: i === steps.length - 1 ? `0.5px solid ${T.bd}` : undefined,
                  padding: "14px 0", display: "flex", gap: 16, alignItems: "flex-start",
                }}
              >
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: T.gold, minWidth: 20 }}>
                  {s.n}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: T.paper, marginBottom: 2, display: "block" }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: T.dim, lineHeight: 1.5 }}>
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT column */}
        <div
          className="ty-right-col"
          style={{ padding: "52px 40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
          {/* progress bar */}
          <div className="ty-a1" style={{ maxWidth: 300, width: "100%", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                FOUNDING SPOTS CLAIMED
              </span>
              <span style={{ fontSize: 14, fontFamily: "'Cormorant Garamond', serif" }}>
                <span style={{ color: T.goldLight }}>{spotNum}</span>
                <span style={{ color: "rgba(245,241,235,0.5)" }}> / {totalSpots}</span>
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(245,241,235,0.08)", borderRadius: 1, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", width: `${barWidth}%`,
                  background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
                  borderRadius: 1, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>

          {/* member number */}
          <div className="ty-a2" style={{ position: "relative", marginBottom: 32, textAlign: "center" }}>
            <span
              className="ty-ghost-num"
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 96, fontWeight: 300,
                color: "rgba(245,241,235,0.07)", userSelect: "none", lineHeight: 1,
              }}
            >
              #{spot}
            </span>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: T.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                Your spot
              </span>
              <span className="ty-overlay-num" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: T.goldLight }}>
                #{spot}
              </span>
            </div>
          </div>

          {/* referral share */}
          <div className="ty-a3" style={{ maxWidth: 300, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>
              MOVE UP THE LIST — SHARE YOUR LINK
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  flex: 1, background: "rgba(245,241,235,0.05)", border: `0.5px solid ${T.bd2}`,
                  borderRadius: 3, padding: "10px 12px", fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif", color: "rgba(245,241,235,0.4)",
                  textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {refLink}
              </div>
              <button
                onClick={copyLink}
                style={{
                  background: T.gold, color: T.ink, border: "none", borderRadius: 3,
                  padding: "10px 16px", fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div
        className="ty-footer"
        style={{
          height: 52, borderTop: `0.5px solid ${T.bd}`, display: "flex",
          alignItems: "center", justifyContent: "space-between", padding: "0 40px",
          position: "relative", zIndex: 1,
        }}
      >
        <span className="ty-footer-left" style={{ fontSize: 12, color: "rgba(245,241,235,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
          woolet.co · Wide-face eyewear · Italian acetate
        </span>
        <span className="ty-footer-right" style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(245,241,235,0.3)" }}>
          Woolet 007 · Woolet 009 — coming soon
        </span>
      </div>
    </div>
  );
}
