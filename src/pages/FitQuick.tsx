import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { saveQuizPrior } from "@/lib/fit-quiz-prior";

const GOLD = "#CAA449";
const INK = "#0f0f0f";
const PAPER = "#f0ece4";
const MUTED = "rgba(240,236,228,0.65)";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

// ── Quiz model ───────────────────────────────────────────────────────────

type HatSize = "s" | "m" | "l" | "xl" | "xxl" | "unknown";
type NoseWidth = "narrow" | "average" | "wide" | "unknown";

interface QuizState {
  hat: HatSize | null;
  nose: NoseWidth | null;
  currentFrameMm: number | null; // optional, 130–170
}

const HAT_OPTIONS: { value: HatSize; label: string; sub: string }[] = [
  { value: "s", label: "S", sub: "≤ 56 cm / 7" },
  { value: "m", label: "M", sub: "57–58 cm / 7⅛–7¼" },
  { value: "l", label: "L", sub: "59–60 cm / 7⅜–7½" },
  { value: "xl", label: "XL", sub: "61–62 cm / 7⅝–7¾" },
  { value: "xxl", label: "XXL+", sub: "63+ cm / 7⅞+" },
  { value: "unknown", label: "Not sure", sub: "Skip this question" },
];

const NOSE_OPTIONS: { value: NoseWidth; label: string; sub: string }[] = [
  { value: "narrow", label: "Narrow", sub: "Glasses slide down easily" },
  { value: "average", label: "Average", sub: "Most frames sit fine" },
  { value: "wide", label: "Wide", sub: "Bridge pinches or marks the nose" },
  { value: "unknown", label: "Not sure", sub: "Skip this question" },
];

interface Recommendation {
  faceWidthMm: number; // estimated
  bridgeMm: number;    // 21 / 22 / 23
  model: "007" | "009" | "bespoke" | "off-brand";
  headline: string;
  body: string;
  cta: { label: string; href: string };
  confidence: "low" | "medium" | "high";
}

function recommend(state: QuizState): Recommendation {
  // If user typed their current frame width, that overrides everything.
  if (state.currentFrameMm && state.currentFrameMm >= 130 && state.currentFrameMm <= 175) {
    const w = state.currentFrameMm;
    const bridge = state.nose === "wide" ? 23 : state.nose === "narrow" ? 21 : 22;
    if (w >= 165) return mk(w, bridge, "bespoke", "high",
      "You need bespoke (165–172 mm).",
      "Off-the-shelf wide frames top out around 158–161 mm. We make bespoke up to 172 mm with the same Italian acetate.");
    if (w >= 156) return mk(w, bridge, "009", "high",
      "Woolet 009 at 158 mm is your size.",
      "009 (soft square) sits at 158 mm with a 22 mm keyhole bridge — built for your width.");
    if (w >= 150) return mk(w, bridge, "007", "high",
      "Woolet 007 at 155 mm is your size.",
      "007 (round) at 155 mm covers exactly this range. Bespoke down to 150 mm if you want a tighter sit.");
    return mk(w, bridge, "off-brand", "high",
      "You're inside standard sizing.",
      "Most off-the-shelf frames will fit. Woolet is built for 150 mm+ faces — you don't need us.");
  }

  // Hat-driven estimate. Rough mapping based on head circumference → face width.
  const hat = state.hat ?? "unknown";
  const faceEstimate: Record<HatSize, number> = {
    s: 138, m: 146, l: 154, xl: 159, xxl: 164, unknown: 152,
  };
  const w = faceEstimate[hat];
  const bridge = state.nose === "wide" ? 23 : state.nose === "narrow" ? 21 : 22;
  const conf: "low" | "medium" | "high" = hat === "unknown" ? "low" : state.nose === "unknown" ? "medium" : "medium";

  if (hat === "xxl") return mk(w, bridge, "bespoke", conf,
    "Bespoke is the right path.",
    "XXL hat size suggests a face wider than 161 mm. Off-the-shelf maxes out here; bespoke goes to 172 mm.");
  if (hat === "xl") return mk(w, bridge, "009", conf,
    "Start with Woolet 009 at 158 mm.",
    "XL hat size usually maps to ~158–161 mm face. 009 fits this range; verify with a scan before ordering.");
  if (hat === "l") return mk(w, bridge, "007", conf,
    "Woolet 007 at 155 mm is likely your size.",
    "L hat size usually maps to ~152–156 mm face. 007 fits this range; 009 at 155 mm if you prefer square.");
  if (hat === "m") return mk(w, bridge, "off-brand", conf,
    "You're inside standard sizing.",
    "M hat size usually means a 145–150 mm face. Most off-the-shelf frames will fit — Woolet starts at 150 mm.");
  if (hat === "s") return mk(w, bridge, "off-brand", conf,
    "You don't need wide frames.",
    "S hat size usually means a 135–144 mm face. Standard eyewear is built for you.");

  // Unknown hat — give a safe default.
  return mk(w, bridge, "007", "low",
    "Best guess: try Woolet 007 at 155 mm.",
    "Without your hat size we can only ballpark. Run the 30-second scan for an exact result.");
}

function mk(
  faceWidthMm: number,
  bridgeMm: number,
  model: Recommendation["model"],
  confidence: Recommendation["confidence"],
  headline: string,
  body: string,
): Recommendation {
  const cta = model === "bespoke"
    ? { label: "Explore bespoke →", href: "/en/bespoke" }
    : model === "off-brand"
      ? { label: "Read why we only do wide →", href: "/en/about" }
      : { label: "Join the VIP list →", href: "/en/lp/kickstarter" };
  return { faceWidthMm, bridgeMm, model, headline, body, cta, confidence };
}

// ── UI ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

type Unit = "mm" | "cm" | "in";

const UNIT_TO_MM: Record<Unit, number> = { mm: 1, cm: 10, in: 25.4 };

function toMm(value: string, unit: Unit): number | null {
  const v = Number(value.replace(",", "."));
  if (!Number.isFinite(v)) return null;
  const mm = v * UNIT_TO_MM[unit];
  if (mm < 120 || mm > 200) return null;
  return mm;
}

export default function FitQuick() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<QuizState>({ hat: null, nose: null, currentFrameMm: null });
  const [frameInput, setFrameInput] = useState<string>("");
  const [unit, setUnit] = useState<Unit>("mm");

  const next = (patch: Partial<QuizState>) => {
    setState((s) => ({ ...s, ...patch }));
    pushEvent("fit_quick_step", { from: step, ...patch });
    setStep((s) => (s + 1) as Step);
  };

  const skip = () => {
    pushEvent("fit_quick_skip", { from: step });
    setStep((s) => (s + 1) as Step);
  };

  const finish = () => {
    const mm = toMm(frameInput, unit);
    const patch = { currentFrameMm: mm };
    setState((s) => ({ ...s, ...patch }));
    pushEvent("fit_quick_complete", { hat: state.hat, nose: state.nose, frame_mm: mm, unit });
    // Persist as prior so the AI scan can reconcile against it.
    saveQuizPrior({ hat: state.hat, nose: state.nose, currentFrameMm: mm });
    setStep(4);
  };

  const rec = useMemo(() => (step === 4 ? recommend(state) : null), [step, state]);

  return (
    <>
      <SEO
        title="Quick fit quiz — find your eyewear size in 30 seconds | Woolet"
        description="No camera, no measuring. Answer 3 quick questions about hat size and nose width to get a starting recommendation for wide-face eyewear."
        path="/fit/quick"
        noindex
      />
      <div style={{ background: INK, color: PAPER, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "32px 20px 80px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <Link
              to="/en/fit"
              style={{
                color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem",
                letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
              }}
            >
              ← Back to fit
            </Link>
            <h1 style={{
              fontFamily: "Cormorant Garamond, serif", fontWeight: 400,
              fontSize: "clamp(1.8rem, 6vw, 2.5rem)", lineHeight: 1.1, margin: "16px 0 8px",
            }}>
              Quick fit quiz <em style={{ color: GOLD }}>· 30 sec</em>
            </h1>
            <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
              No camera, no tape. Answer 2–3 questions for a rough size. Skip any you don't know.
            </p>
          </div>

          {/* Progress */}
          {step < 4 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 3,
                    background: i <= step ? GOLD : "rgba(240,236,228,0.12)",
                    transition: "background 200ms",
                  }}
                />
              ))}
            </div>
          )}

          {/* Step 1 — Hat size */}
          {step === 1 && (
            <QuestionBlock
              eyebrow="Question 1 of 3"
              title="What's your hat size?"
              hint="Best single proxy for face width. Use the closest if you're between sizes."
            >
              {HAT_OPTIONS.map((o) => (
                <ChoiceButton key={o.value} label={o.label} sub={o.sub}
                  onClick={() => next({ hat: o.value })} />
              ))}
            </QuestionBlock>
          )}

          {/* Step 2 — Nose width */}
          {step === 2 && (
            <QuestionBlock
              eyebrow="Question 2 of 3"
              title="How wide is your nose bridge?"
              hint="Drives bridge size (21 / 22 / 23 mm keyhole)."
            >
              {NOSE_OPTIONS.map((o) => (
                <ChoiceButton key={o.value} label={o.label} sub={o.sub}
                  onClick={() => next({ nose: o.value })} />
              ))}
            </QuestionBlock>
          )}

          {/* Step 3 — Optional current frame width */}
          {step === 3 && (
            <QuestionBlock
              eyebrow="Question 3 of 3 · optional"
              title="Do you know your current frame width?"
              hint="Look inside the temple of glasses that fit. Total width is usually 130–155 mm (13–15.5 cm / 5.1–6.1 in). Skip if you don't have it."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                  <label style={{
                    fontFamily: "Barlow, sans-serif", fontSize: "0.78rem",
                    color: MUTED, letterSpacing: "0.05em",
                  }}>
                    Total frame width ({unit})
                  </label>
                  <div role="tablist" aria-label="Unit" style={{ display: "flex", gap: 0, border: "1px solid rgba(240,236,228,0.18)", borderRadius: 3 }}>
                    {(["mm", "cm", "in"] as Unit[]).map((u) => {
                      const active = unit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => {
                            // Convert existing input on switch so user doesn't lose it.
                            const v = Number(frameInput.replace(",", "."));
                            if (Number.isFinite(v) && v > 0) {
                              const mm = v * UNIT_TO_MM[unit];
                              const next = mm / UNIT_TO_MM[u];
                              setFrameInput(u === "in" ? next.toFixed(2) : next.toFixed(1));
                            }
                            setUnit(u);
                            pushEvent("fit_quick_unit_change", { unit: u });
                          }}
                          style={{
                            background: active ? GOLD : "transparent",
                            color: active ? INK : PAPER,
                            border: "none",
                            fontFamily: "Barlow, sans-serif",
                            fontSize: "0.68rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={unit === "mm" ? "e.g. 152" : unit === "cm" ? "e.g. 15.2" : "e.g. 6.0"}
                  value={frameInput}
                  onChange={(e) => setFrameInput(e.target.value)}
                  step={unit === "in" ? 0.1 : unit === "cm" ? 0.1 : 1}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(240,236,228,0.18)",
                    color: PAPER,
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "1.1rem",
                    padding: "16px 18px",
                    borderRadius: 4,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={finish}
                  style={{
                    background: GOLD, color: INK, border: "none",
                    fontFamily: "Barlow, sans-serif", fontWeight: 500,
                    fontSize: "0.78rem", letterSpacing: "0.22em", textTransform: "uppercase",
                    padding: "16px 20px", cursor: "pointer", marginTop: 4,
                  }}
                >
                  Get my recommendation
                </button>
                <button
                  type="button"
                  onClick={() => { setFrameInput(""); finish(); }}
                  style={{
                    background: "transparent", color: MUTED, border: "none",
                    fontFamily: "Barlow, sans-serif", fontSize: "0.78rem",
                    padding: "8px", cursor: "pointer", textDecoration: "underline",
                  }}
                >
                  I don't know — skip
                </button>
              </div>
            </QuestionBlock>
          )}

          {/* Skip footer for steps 1-2 */}
          {(step === 1 || step === 2) && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                type="button"
                onClick={skip}
                style={{
                  background: "transparent", color: MUTED, border: "none",
                  fontFamily: "Barlow, sans-serif", fontSize: "0.78rem",
                  cursor: "pointer", textDecoration: "underline",
                }}
              >
                Skip this question
              </button>
            </div>
          )}

          {/* Step 4 — Result */}
          {step === 4 && rec && <ResultCard rec={rec} onRestart={() => { setStep(1); setState({ hat: null, nose: null, currentFrameMm: null }); setFrameInput(""); }} />}
        </main>
        <Footer />
      </div>
    </>
  );
}

function QuestionBlock({
  eyebrow, title, hint, children,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <span style={{
        color: GOLD, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem",
        letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500,
      }}>
        {eyebrow}
      </span>
      <h2 style={{
        fontFamily: "Cormorant Garamond, serif", fontWeight: 400,
        fontSize: "1.7rem", lineHeight: 1.15, margin: "10px 0 8px", color: PAPER,
      }}>
        {title}
      </h2>
      <p style={{
        color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.88rem",
        lineHeight: 1.5, margin: "0 0 20px",
      }}>
        {hint}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}

function ChoiceButton({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(240,236,228,0.14)",
        color: PAPER,
        padding: "16px 18px",
        borderRadius: 4,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "all 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = GOLD;
        e.currentTarget.style.background = "rgba(202,164,73,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(240,236,228,0.14)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      <span style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: "1rem" }}>{label}</span>
      <span style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.82rem" }}>{sub}</span>
    </button>
  );
}

function ResultCard({ rec, onRestart }: { rec: Recommendation; onRestart: () => void }) {
  const confLabel = rec.confidence === "high" ? "High confidence" : rec.confidence === "medium" ? "Rough estimate" : "Best guess";
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <span style={{
        color: GOLD, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem",
        letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500,
      }}>
        Your result · {confLabel}
      </span>
      <h2 style={{
        fontFamily: "Cormorant Garamond, serif", fontWeight: 400,
        fontSize: "clamp(1.8rem, 6vw, 2.4rem)", lineHeight: 1.1, margin: 0, color: PAPER,
      }}>
        {rec.headline}
      </h2>
      <p style={{
        color: "rgba(240,236,228,0.85)", fontFamily: "Barlow, sans-serif",
        fontSize: "1rem", lineHeight: 1.6, margin: 0, fontWeight: 300,
      }}>
        {rec.body}
      </p>

      {/* Spec card */}
      <div style={{
        border: `1px solid ${GOLD}`, background: "rgba(202,164,73,0.05)",
        padding: "20px 22px", borderRadius: 6,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
      }}>
        <div>
          <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Estimated face width
          </div>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: PAPER, marginTop: 4 }}>
            ~{rec.faceWidthMm} mm
          </div>
        </div>
        <div>
          <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Bridge
          </div>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: PAPER, marginTop: 4 }}>
            {rec.bridgeMm} mm
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={rec.cta.href}
        onClick={() => pushEvent("fit_quick_cta_click", { model: rec.model, href: rec.cta.href })}
        style={{
          background: GOLD, color: INK, padding: "18px 24px", textAlign: "center",
          fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: "0.78rem",
          letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none",
        }}
      >
        {rec.cta.label}
      </Link>

      {/* Upgrade path */}
      <div style={{
        borderTop: "1px solid rgba(240,236,228,0.1)", paddingTop: 24,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", margin: 0 }}>
          Want exact numbers? The 30-second AI scan measures face width, bridge and PD to ±1.5 mm.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/en/fit"
            onClick={() => pushEvent("fit_quick_to_scan", {})}
            style={{
              color: PAPER, border: `1px solid ${GOLD}`, padding: "12px 18px",
              fontFamily: "Barlow, sans-serif", fontSize: "0.72rem",
              letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
            }}
          >
            Run the AI scan →
          </Link>
          <button
            type="button"
            onClick={() => { pushEvent("fit_quick_restart", {}); onRestart(); }}
            style={{
              color: MUTED, background: "transparent",
              border: "1px solid rgba(240,236,228,0.18)", padding: "12px 18px",
              fontFamily: "Barlow, sans-serif", fontSize: "0.72rem",
              letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            Restart quiz
          </button>
        </div>
      </div>
    </section>
  );
}
