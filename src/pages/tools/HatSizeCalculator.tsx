import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { HAT_SIZE_FAQ } from "@/seo/hat-size-faq";

/* ── Size table (single source of truth) ── */
type Row = { cm: number; inches: string; us: string; uk: string; letter: string; band: "S" | "M" | "L" | "XL" | "XXL"; note?: string };

const ROWS: Row[] = [
  { cm: 53, inches: "20⅞", us: "6⅝", uk: "6½", letter: "XXS", band: "S" },
  { cm: 54, inches: "21¼", us: "6¾", uk: "6⅝", letter: "XS", band: "S" },
  { cm: 55, inches: "21⅝", us: "6⅞", uk: "6¾", letter: "S", band: "S" },
  { cm: 56, inches: "22", us: "7", uk: "6⅞", letter: "S / M", band: "M" },
  { cm: 57, inches: "22⅜", us: "7⅛", uk: "7", letter: "M", band: "M" },
  { cm: 58, inches: "22¾", us: "7¼", uk: "7⅛", letter: "M", band: "M" },
  { cm: 59, inches: "23¼", us: "7⅜", uk: "7¼", letter: "L", band: "L" },
  { cm: 60, inches: "23⅝", us: "7½", uk: "7⅜", letter: "L / XL", band: "L", note: "Top of mainstream range." },
  { cm: 61, inches: "24", us: "7⅝", uk: "7½", letter: "XL", band: "XL", note: "Specialist territory for felt hats." },
  { cm: 62, inches: "24⅜", us: "7¾", uk: "7⅝", letter: "XL", band: "XL", note: "Above most brand catalogues." },
  { cm: 63, inches: "24¾", us: "7⅞", uk: "7¾", letter: "XXL", band: "XXL", note: "Specialist / DTC only." },
  { cm: 64, inches: "25¼", us: "8", uk: "7⅞", letter: "XXL", band: "XXL", note: "3–4 brands worldwide off-the-shelf." },
  { cm: 65, inches: "25⅝", us: "8⅛", uk: "8", letter: "XXXL", band: "XXL", note: "Custom / made-to-order." },
  { cm: 66, inches: "26", us: "8¼", uk: "8⅛", letter: "XXXL", band: "XXL", note: "Custom / made-to-order." },
];

const MIN_CM = 50;
const MAX_CM = 68;

/* ── helpers ── */
function findRow(cm: number): Row {
  const rounded = Math.max(MIN_CM, Math.min(MAX_CM, Math.round(cm)));
  const exact = ROWS.find(r => r.cm === rounded);
  if (exact) return exact;
  if (rounded < ROWS[0].cm) return ROWS[0];
  return ROWS[ROWS.length - 1];
}

function cmToInches(cm: number) {
  return cm / 2.54;
}

/* ── styles (inline, brand tokens) ── */
const S = {
  wrap: {
    background: "#F8F6F1",
    minHeight: "100vh",
    fontFamily: "'Barlow', sans-serif",
    color: "#111",
  } as const,
  container: {
    maxWidth: 780,
    margin: "0 auto",
    padding: "56px 20px 80px",
  } as const,
  eyebrow: {
    fontSize: 11,
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 14,
    fontWeight: 500,
  } as const,
  h1: {
    fontFamily: "'Newsreader', 'Barlow', serif",
    fontWeight: 400,
    fontSize: "clamp(1.9rem, 3.8vw, 2.75rem)",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    margin: "0 0 14px 0",
    color: "#0B0A09",
  } as const,
  h1Accent: {
    fontStyle: "italic",
    color: "#A07A2A",
    fontWeight: 400,
  } as const,
  lede: {
    fontSize: 16,
    lineHeight: 1.65,
    color: "#3A3A3A",
    margin: "0 0 32px 0",
    maxWidth: 620,
  } as const,
  card: {
    background: "#fff",
    border: "1px solid #E8E4DC",
    borderRadius: 6,
    padding: 28,
    boxShadow: "0 1px 2px rgba(11,10,9,0.04)",
  } as const,
  tabs: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid #E8E4DC",
    marginBottom: 24,
  } as const,
  tab: (active: boolean) => ({
    flex: 1,
    padding: "12px 16px",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #0B0A09" : "2px solid transparent",
    fontFamily: "'Barlow', sans-serif",
    fontSize: 12,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    fontWeight: 500,
    color: active ? "#0B0A09" : "#888",
    cursor: "pointer",
    transition: "color 0.15s",
  }),
  label: {
    display: "block",
    fontSize: 11,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#666",
    marginBottom: 10,
    fontWeight: 500,
  } as const,
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 18,
    fontFamily: "'Barlow', sans-serif",
    border: "1px solid #D8D2C4",
    borderRadius: 2,
    background: "#fff",
    color: "#0B0A09",
    boxSizing: "border-box" as const,
  } as const,
  hint: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    lineHeight: 1.5,
  } as const,
  result: {
    marginTop: 28,
    padding: "24px 24px 20px",
    background: "#0B0A09",
    color: "#EFE9DF",
    borderRadius: 4,
  } as const,
  resultLabel: {
    fontSize: 10,
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "#C2A05A",
    marginBottom: 12,
    fontWeight: 500,
  } as const,
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 20,
    marginBottom: 14,
  } as const,
  resultCell: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  } as const,
  resultKey: {
    fontSize: 10,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#8a827a",
    fontWeight: 500,
  } as const,
  resultVal: {
    fontFamily: "'Newsreader', serif",
    fontSize: 28,
    lineHeight: 1,
    color: "#fff",
    fontWeight: 400,
  } as const,
  resultNote: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#C7BEB0",
    borderTop: "1px solid #26231d",
    paddingTop: 14,
    marginTop: 6,
  } as const,
  cta: {
    display: "inline-block",
    padding: "12px 22px",
    background: "#C2A05A",
    color: "#0B0A09",
    fontSize: 12,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: 2,
    marginTop: 16,
  } as const,
  ctaGhost: {
    display: "inline-block",
    padding: "12px 22px",
    background: "transparent",
    color: "#EFE9DF",
    fontSize: 12,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid #3a352e",
    borderRadius: 2,
    marginTop: 16,
    marginLeft: 10,
  } as const,
  section: {
    marginTop: 56,
  } as const,
  h2: {
    fontFamily: "'Newsreader', serif",
    fontSize: "1.55rem",
    fontWeight: 400,
    color: "#0B0A09",
    margin: "0 0 16px 0",
    letterSpacing: "-0.01em",
  } as const,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 14,
    background: "#fff",
    border: "1px solid #E8E4DC",
    borderRadius: 4,
    overflow: "hidden",
  } as const,
  th: {
    textAlign: "left" as const,
    padding: "12px 14px",
    background: "#F8F6F1",
    borderBottom: "2px solid #0B0A09",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  } as const,
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #EFE9DF",
  } as const,
  highlight: {
    background: "#FBF7ED",
    fontWeight: 600 as const,
  } as const,
  link: {
    color: "#A07A2A",
    textDecoration: "underline",
    textDecorationColor: "#e0d3b5",
    textUnderlineOffset: 3,
  } as const,
};

/* ── FAQ ── */
const FAQ = HAT_SIZE_FAQ;

/* ── Page ── */
const HatSizeCalculator = () => {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [cm, setCm] = useState<number>(58);
  const [inches, setInches] = useState<number>(22.83);

  const currentCm = unit === "cm" ? cm : inches * 2.54;
  const clamped = Math.max(MIN_CM, Math.min(MAX_CM, currentCm));
  const row = useMemo(() => findRow(clamped), [clamped]);
  const currentInches = cmToInches(clamped);

  const isBig = row.cm >= 60;

  const jsonLd = useMemo(() => ([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Hat Size Calculator",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      description: "Free hat size calculator. Convert your head circumference (cm or inches) into US, UK, EU and letter hat sizes instantly.",
      url: "https://woolet.co/en/hat-size-calculator",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ]), []);

  return (
    <>
      <SEO
        title="Hat Size Calculator — Head Circumference to US, UK, EU & cm"
        description="Free hat size calculator. Enter your head circumference in cm or inches and get your US, UK, EU and letter hat size instantly — with sizing advice for bigger heads."
        lang="en"
        path="/hat-size-calculator"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main style={S.wrap}>
        <div style={S.container}>
          <div style={S.eyebrow}>Free tool · No sign-up</div>
          <h1 style={S.h1}>
            Hat Size <span style={S.h1Accent}>Calculator</span>
          </h1>
          <p style={S.lede}>
            Enter your head circumference. Get your US, UK, EU and letter hat size instantly — with honest advice on what to do when mainstream brands stop stocking your size.
          </p>

          {/* Calculator card */}
          <div style={S.card}>
            <div style={S.tabs} role="tablist" aria-label="Measurement unit">
              <button
                role="tab"
                aria-selected={unit === "cm"}
                style={S.tab(unit === "cm")}
                onClick={() => setUnit("cm")}
              >
                Centimetres
              </button>
              <button
                role="tab"
                aria-selected={unit === "in"}
                style={S.tab(unit === "in")}
                onClick={() => setUnit("in")}
              >
                Inches
              </button>
            </div>

            {unit === "cm" ? (
              <div>
                <label htmlFor="hat-cm" style={S.label}>Head circumference (cm)</label>
                <input
                  id="hat-cm"
                  type="number"
                  inputMode="decimal"
                  min={MIN_CM}
                  max={MAX_CM}
                  step={0.5}
                  value={cm}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) setCm(v);
                  }}
                  style={S.input}
                />
                <input
                  type="range"
                  min={MIN_CM}
                  max={MAX_CM}
                  step={0.5}
                  value={cm}
                  onChange={(e) => setCm(parseFloat(e.target.value))}
                  style={{ width: "100%", marginTop: 14, accentColor: "#C2A05A" }}
                  aria-label="Head circumference slider (cm)"
                />
                <p style={S.hint}>
                  Measure around the widest part of your head — about 2.5 cm above your eyebrows and ears. <Link to="/en/blog/how-to-measure-your-head-for-a-hat" style={S.link}>How to measure →</Link>
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="hat-in" style={S.label}>Head circumference (inches)</label>
                <input
                  id="hat-in"
                  type="number"
                  inputMode="decimal"
                  min={cmToInches(MIN_CM)}
                  max={cmToInches(MAX_CM)}
                  step={0.125}
                  value={inches}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) setInches(v);
                  }}
                  style={S.input}
                />
                <input
                  type="range"
                  min={cmToInches(MIN_CM)}
                  max={cmToInches(MAX_CM)}
                  step={0.125}
                  value={inches}
                  onChange={(e) => setInches(parseFloat(e.target.value))}
                  style={{ width: "100%", marginTop: 14, accentColor: "#C2A05A" }}
                  aria-label="Head circumference slider (inches)"
                />
                <p style={S.hint}>
                  Standard hat sizing rounds inches to the nearest 1/8. <Link to="/en/blog/how-to-measure-your-head-for-a-hat" style={S.link}>How to measure →</Link>
                </p>
              </div>
            )}

            {/* Result */}
            <div style={S.result} aria-live="polite">
              <div style={S.resultLabel}>Your hat size</div>
              <div style={S.resultGrid}>
                <div style={S.resultCell}>
                  <span style={S.resultKey}>US</span>
                  <span style={S.resultVal}>{row.us}</span>
                </div>
                <div style={S.resultCell}>
                  <span style={S.resultKey}>UK</span>
                  <span style={S.resultVal}>{row.uk}</span>
                </div>
                <div style={S.resultCell}>
                  <span style={S.resultKey}>EU / cm</span>
                  <span style={S.resultVal}>{row.cm}</span>
                </div>
                <div style={S.resultCell}>
                  <span style={S.resultKey}>Letter</span>
                  <span style={S.resultVal}>{row.letter}</span>
                </div>
              </div>
              <div style={S.resultNote}>
                {clamped.toFixed(1)} cm · {currentInches.toFixed(2)} in
                {row.note ? <> — <span style={{ color: "#EFE9DF" }}>{row.note}</span></> : null}
                {" "}Between sizes? Always size up and pad with a sizing strip.
              </div>

              {isBig && (
                <div style={{ marginTop: 18 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#EFE9DF", margin: "0 0 6px 0" }}>
                    Head this size usually means glasses don't fit either. Woolet frames start at 158&nbsp;mm — built for exactly this crowd.
                  </p>
                  <Link to="/en/collections/glasses-for-big-heads" style={S.cta}>
                    Glasses for big heads →
                  </Link>
                  <Link to="/en/fit/wizard" style={S.ctaGhost}>
                    Try AI Fit Wizard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* How the math works */}
          <section style={S.section}>
            <h2 style={S.h2}>How the calculator works</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#3A3A3A", margin: 0 }}>
              Every hat size in the world is derived from one number: your head circumference. The US size is the hat's internal diameter in inches — circumference (in) ÷ π ≈ 3.1416, rounded to the nearest eighth. UK sizes shift exactly 1/8 smaller. EU sizes are the raw circumference in cm. This tool applies all three conversions at once so you don't have to.
            </p>
          </section>

          {/* Full chart */}
          <section style={S.section}>
            <h2 style={S.h2}>Full hat size chart</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Head (cm)</th>
                    <th style={S.th}>Head (in)</th>
                    <th style={S.th}>US</th>
                    <th style={S.th}>UK</th>
                    <th style={S.th}>Letter</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(r => {
                    const isActive = r.cm === row.cm;
                    const big = r.cm >= 60;
                    return (
                      <tr key={r.cm} style={{
                        ...(big ? S.highlight : {}),
                        ...(isActive ? { outline: "2px solid #C2A05A", outlineOffset: -2 } : {}),
                      }}>
                        <td style={S.td}>{r.cm}</td>
                        <td style={S.td}>{r.inches}</td>
                        <td style={S.td}>{r.us}</td>
                        <td style={S.td}>{r.uk}</td>
                        <td style={S.td}>{r.letter}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 10, lineHeight: 1.5 }}>
              Cream rows (60&nbsp;cm+) are where most mainstream brands stop stocking. Full context: <Link to="/en/blog/hat-size-chart-guide-cm-inches-us-uk-eu" style={S.link}>hat size chart guide</Link>.
            </p>
          </section>

          {/* FAQ */}
          <section style={S.section}>
            <h2 style={S.h2}>Common questions</h2>
            {FAQ.map((f, i) => (
              <details
                key={i}
                style={{
                  borderBottom: "1px solid #E8E4DC",
                  padding: "14px 0",
                }}
              >
                <summary style={{
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#0B0A09",
                  listStyle: "none",
                }}>
                  {f.q}
                </summary>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#3A3A3A", margin: "10px 0 4px 0" }}>
                  {f.a}
                </p>
              </details>
            ))}
          </section>

          {/* Related */}
          <section style={S.section}>
            <h2 style={S.h2}>Related guides</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2, fontSize: 15 }}>
              <li><Link to="/en/blog/how-to-measure-your-head-for-a-hat" style={S.link}>How to measure your head for a hat (60-second method)</Link></li>
              <li><Link to="/en/blog/hat-size-chart-guide-cm-inches-us-uk-eu" style={S.link}>Complete hat size chart (US, UK, EU, cm & inches)</Link></li>
              <li><Link to="/en/blog/what-size-hat-do-i-wear-big-heads-guide" style={S.link}>Big head? What hat size you actually wear (7¾ and up)</Link></li>
              <li><Link to="/en/fit/wizard" style={S.link}>Measure your face with your phone — AI Fit Wizard</Link></li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HatSizeCalculator;
