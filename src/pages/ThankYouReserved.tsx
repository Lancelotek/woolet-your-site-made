import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import wooletLogoAsset from "@/assets/woolet-logo.png.asset.json";

const wooletLogo = wooletLogoAsset.url;

const FB_GROUP_URL = "https://www.facebook.com/groups/867413636043717";
const FIT_URL = "/en/fit";
const SUPPORT_EMAIL = "support@woolet.co";

const T = {
  bg: "#080807",
  surface: "#16140F",
  hairline: "rgba(255,255,255,0.08)",
  body: "#EDE7D9",
  heading: "#F8F8F6",
  muted: "#9A8E7E",
  gold: "#CAA449",
  goldDim: "#8A6E2C",
  success: "#36C46A",
  dark: "#1F1B16",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "Barlow, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 11,
  color: T.gold,
};

const STEPS = [
  {
    n: "01",
    title: "Launch day",
    body: "A private pledge link lands in your inbox before the public page opens.",
  },
  {
    n: "02",
    title: "Pledge at $114",
    body: "Your $1 is credited to the pledge. Pick 007 Round or 009 Soft Square, in Black, Havana or Silver Clear.",
  },
  {
    n: "03",
    title: "Frames ship after the campaign",
    body: "158 mm front, Italian Mazzucchelli acetate, hand made in EU, felt case in the box.",
  },
];

export default function ThankYouReserved() {
  const [preparing, setPreparing] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "usd1_reservation_thankyou",
        source: "mailerlite_product",
        value: 1,
        currency: "USD",
      });
    }
  }, []);

  const downloadPdf = async () => {
    if (preparing) return;
    setPreparing(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const M = 18;

      // Page background
      doc.setFillColor(248, 246, 241);
      doc.rect(0, 0, 210, 297, "F");

      // Top band
      doc.setFillColor(8, 8, 7);
      doc.rect(0, 0, 210, 88, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(202, 164, 73);
      doc.text("F O U N D E R   R E S E R V A T I O N   ·   4 0 %   O F F   R E T A I L", M, 38);

      doc.setFont("times", "normal");
      doc.setFontSize(30);
      doc.setTextColor(237, 231, 217);
      doc.text("Your price is locked.", M, 56);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(154, 142, 126);
      doc.text("You hold a numbered spot in the first run of 100 Woolet frames.", M, 68);

      let y = 108;
      const section = (label: string, lines: string[], dimLast = false) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(202, 164, 73);
        doc.text(label, M, y);
        doc.setDrawColor(202, 164, 73);
        doc.setLineWidth(0.4);
        doc.line(M, y + 3, M + 12, y + 3);
        y += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        lines.forEach((line, i) => {
          const dim = dimLast && i === lines.length - 1;
          doc.setTextColor(...(dim ? [138, 110, 44] : [31, 27, 22]) as [number, number, number]);
          doc.text(line, M, y);
          y += 7;
        });
        y += 10;
      };

      section("WHAT YOU JUST DID", [
        "$1 today reserves 40% off retail on your Woolet frame during the Kickstarter campaign.",
        "Retail $190 - your founder price $114. Sun, blue light and readers priced the same way.",
      ]);

      section("WHAT HAPPENS NEXT", [
        "1. Launch day: you get a private pledge link by email, before the public sees the page.",
        "2. Pledge at your founder price. Your $1 is credited to the pledge.",
        "3. Pick your shape and colour: 007 Round or 009 Soft Square, Black, Havana or Silver Clear.",
        "4. Frames ship after the campaign, in the box with the felt case.",
      ]);

      section(
        "THE NUMBERS",
        [
          "Front width 158 mm · fit range 155-161 mm · Italian Mazzucchelli acetate · hand made in EU",
          "Not sure about your width? Twenty seconds with your phone camera: woolet.co/en/fit",
        ],
        true,
      );

      section("REFUNDS", [
        "Changed your mind? Reply to any Woolet email and the $1 goes back the same day. No questions.",
      ]);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(154, 142, 126);
      doc.text("Woolet · JAY23 LLC · support@woolet.co · woolet.co", M, 285);

      doc.save("Woolet-Founder-Reservation.pdf");

      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "usd1_summary_download" });
      }
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.body, fontFamily: "Barlow, sans-serif" }}>
      <Helmet>
        <title>Reservation confirmed - Woolet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <style>{`
        .tyr-wrap { max-width: 720px; margin: 0 auto; padding: 0 32px; }
        .tyr-h1 { font-family: "Cormorant Garamond", Cormorant, serif; font-weight: 300; font-size: 52px; line-height: 1.08; color: ${T.heading}; margin: 20px 0 0; }
        .tyr-section { padding: 64px 0; }
        .tyr-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 0; min-height: 48px; padding: 0 28px; font-family: Barlow, sans-serif; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; cursor: pointer; }
        .tyr-btn-primary { background: ${T.gold}; color: ${T.dark}; border: none; }
        .tyr-btn-secondary { background: transparent; color: ${T.body}; border: 1px solid ${T.hairline}; }
        .tyr-btn-secondary:disabled { opacity: 0.5; cursor: default; }
        .tyr-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        @media (max-width: 767px) {
          .tyr-wrap { padding: 0 20px; }
          .tyr-h1 { font-size: 34px; }
          .tyr-section { padding: 40px 0; }
          .tyr-actions { flex-direction: column; align-items: stretch; }
          .tyr-btn { width: 100%; min-height: 52px; }
        }
      `}</style>

      {/* 1. Header */}
      <header style={{ borderBottom: `1px solid ${T.hairline}`, padding: "24px 0", textAlign: "center" }}>
        <Link to="/en" aria-label="Woolet home">
          <img src={wooletLogo} alt="Woolet" width={104} height={24} style={{ height: 24, width: "auto", display: "inline-block" }} />
        </Link>
      </header>

      <main className="tyr-wrap">
        {/* 2. Confirmation */}
        <section className="tyr-section" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%", border: `1px solid ${T.gold}`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12.5 L9.5 18 L20 6.5" />
            </svg>
          </div>
          <div style={{ ...eyebrow, marginTop: 24 }}>Reservation confirmed</div>
          <h1 className="tyr-h1">Your price is locked.</h1>
          <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 460, margin: "20px auto 0" }}>
            $1 received. 40% off retail is yours for the whole Kickstarter campaign - $190 becomes $114 on any Woolet frame.
          </p>
          <p style={{ color: T.goldDim, fontSize: 13, marginTop: 16 }}>
            Numbered spot in the first run of 100. Fully refundable until launch.
          </p>
        </section>

        {/* 3. What happens next */}
        <section className="tyr-section" style={{ borderTop: `1px solid ${T.hairline}` }}>
          <div style={eyebrow}>What happens next</div>
          <div style={{ marginTop: 28 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                style={{
                  display: "flex", gap: 24, padding: "24px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${T.hairline}`,
                }}
              >
                <div style={{ ...eyebrow, paddingTop: 3, minWidth: 28 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 500, color: T.heading, fontSize: 16 }}>{s.title}</div>
                  <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, margin: "8px 0 0" }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. VIP group card */}
        <section style={{ paddingBottom: 8 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, padding: 32 }}>
            <div style={eyebrow}>One more thing</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond", Cormorant, serif', fontWeight: 300, fontSize: 30, color: T.heading, margin: "14px 0 0" }}>
              Join the private Woolet VIP group.
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, margin: "14px 0 24px" }}>
              Founders vote on colours and shapes, see acetate samples first, and talk straight to the people building the frames.
            </p>
            <a className="tyr-btn tyr-btn-primary" href={FB_GROUP_URL} target="_blank" rel="noopener">
              Join the group
            </a>
          </div>
        </section>

        {/* 5. Secondary actions */}
        <section className="tyr-section">
          <div className="tyr-actions">
            <button type="button" className="tyr-btn tyr-btn-secondary" onClick={downloadPdf} disabled={preparing}>
              {preparing ? "Preparing..." : "Download your summary"}
            </button>
            <Link to={FIT_URL} style={{ color: T.gold, fontSize: 14, textDecoration: "none" }}>
              Not sure about your width? Measure it in 20 seconds →
            </Link>
          </div>

          {/* 6. Refund line */}
          <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, textAlign: "center", marginTop: 40 }}>
            Changed your mind? Reply to any Woolet email or write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: T.gold, textDecoration: "none" }}>{SUPPORT_EMAIL}</a>{" "}
            - the $1 goes back the same day.
          </p>
        </section>
      </main>

      {/* 7. Footer */}
      <footer style={{ borderTop: `1px solid ${T.hairline}`, padding: "24px 0", textAlign: "center" }}>
        <div style={{ color: T.muted, fontSize: 12 }}>
          © 2026 Woolet by JAY23 LLC ·{" "}
          <Link to="/en/privacy-policy" style={{ color: T.muted }}>Privacy Policy</Link> ·{" "}
          <Link to="/en/return-policy" style={{ color: T.muted }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
