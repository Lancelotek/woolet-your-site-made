import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import WaitlistForm from "@/components/WaitlistForm";
import wooletLogo from "@/assets/woolet-logo.png";
import type { Lang } from "@/lib/i18n";

/* ─── types ─── */
type Look = "wider" | "proportion" | "ok-look" | "look-fine" | null;
type Nose = "sliding" | "marks" | "high" | "nose-ok" | null;

interface WizardState {
  look: Look;
  temples: boolean;
  lenses: boolean;
  nose: Nose;
  hasSize: boolean;
  frameWidth: number | null;
}

const initial: WizardState = {
  look: null,
  temples: false,
  lenses: false,
  nose: null,
  hasSize: false,
  frameWidth: null,
};

/* ─── tokens ─── */
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

/* ─── icons ─── */
const icons: Record<string, React.ReactNode> = {
  wider: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M3 9l3-3M3 9l3 3M15 9l-3-3M15 9l-3 3" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  proportion: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="6" width="10" height="6" rx="1" stroke={T.paper} strokeWidth="1.2" />
      <circle cx="9" cy="9" r="7" stroke={T.paper} strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  ),
  "ok-look": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke={T.paper} strokeWidth="1.2" />
      <path d="M6 10c0 0 1.5 2 3 2s3-2 3-2" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  "look-fine": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 13l3-3 2 2 3-4" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  temples: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 9h10M7 6v6M11 6v6" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  lenses: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6" cy="9" r="3" stroke={T.paper} strokeWidth="1.2" />
      <circle cx="12" cy="9" r="3" stroke={T.paper} strokeWidth="1.2" />
      <path d="M9 9h0" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  none: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 9l3 3 5-5" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  sliding: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 4v8M9 12l-2 2M9 12l2 2" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  marks: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="11" r="1.5" stroke={T.paper} strokeWidth="1.2" />
      <circle cx="11" cy="11" r="1.5" stroke={T.paper} strokeWidth="1.2" />
      <path d="M9 5v4" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  high: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 14V6M6 8l3-2 3 2" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  "nose-ok": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 9l3 3 5-5" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
  "yes-size": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="7" width="12" height="4" rx="1" stroke={T.paper} strokeWidth="1.2" />
      <path d="M6 11v2M12 11v2" stroke={T.paper} strokeWidth="1" />
    </svg>
  ),
  "no-size": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 5l8 8M13 5l-8 8" stroke={T.paper} strokeWidth="1.2" />
    </svg>
  ),
};

/* ─── option card ─── */
function OptionCard({
  selected, onClick, icon, title, subtitle,
}: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className="wiz-option-card"
      data-selected={selected || undefined}
      style={{
        border: selected ? `1.5px solid ${T.paper}` : `0.5px solid rgba(245,241,235,0.15)`,
        borderRadius: 12,
        padding: "14px 16px",
        background: selected ? "rgba(245,241,235,0.06)" : "transparent",
        cursor: "pointer",
        transition: "border-color 150ms, background 150ms",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        width: "100%",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "rgba(245,241,235,0.3)";
          e.currentTarget.style.background = "rgba(245,241,235,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "rgba(245,241,235,0.15)";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(245,241,235,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 400, color: T.paper, fontFamily: "'DM Sans', sans-serif" }}>
          {title}
        </div>
        <div style={{ fontSize: 13, fontWeight: 300, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </button>
  );
}

/* ─── grid overlay ─── */
const gridOverlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
  backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
  `,
  backgroundSize: "80px 80px",
};

/* ─── progress dots ─── */
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "32px 0 40px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 24 : 12, height: 3, borderRadius: 2,
            background: i === step ? T.paper : i < step ? T.muted : "rgba(245,241,235,0.1)",
            transition: "all 300ms ease",
          }}
        />
      ))}
    </div>
  );
}

/* ─── face comparison SVG ─── */
function FaceComparison() {
  return (
    <div
      style={{
        background: "rgba(245,241,235,0.04)",
        border: `0.5px solid ${T.bd2}`,
        borderRadius: 12,
        padding: 16,
        marginTop: 14,
        overflow: "hidden",
        animation: "wizFadeIn 300ms ease both",
      }}
    >
      <div
        style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em",
          color: T.muted, marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
        }}
      >
        WHY THIS AFFECTS HOW YOU LOOK
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }} className="wiz-comparison-flex">
        {/* narrow frames */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <svg width="80" height="90" viewBox="0 0 80 90" fill="none" style={{ margin: "0 auto", display: "block" }}>
            <ellipse cx="40" cy="52" rx="28" ry="34" stroke="currentColor" opacity="0.2" fill="none" strokeWidth="1" />
            <rect x="14" y="30" width="22" height="14" rx="3" fill="none" stroke="#E24B4A" strokeWidth="1.5" />
            <rect x="44" y="30" width="22" height="14" rx="3" fill="none" stroke="#E24B4A" strokeWidth="1.5" />
            <line x1="36" y1="37" x2="44" y2="37" stroke="#E24B4A" strokeWidth="1.5" />
            <line x1="8" y1="37" x2="14" y2="37" stroke="#E24B4A" strokeWidth="1.5" />
            <line x1="66" y1="37" x2="72" y2="37" stroke="#E24B4A" strokeWidth="1.5" />
            <text x="40" y="78" textAnchor="middle" fontSize="9" fill="#E24B4A" opacity="0.8">face looks wider</text>
          </svg>
          <div style={{ fontSize: 12, fontWeight: 400, color: T.paper, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            Too-narrow frames
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
            face 'spills' beyond the lens edge → visual widening effect
          </div>
        </div>
        {/* divider */}
        <div style={{ width: 1, background: T.bd, alignSelf: "stretch", margin: "4px 0" }} />
        {/* correct width */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <svg width="80" height="90" viewBox="0 0 80 90" fill="none" style={{ margin: "0 auto", display: "block" }}>
            <ellipse cx="40" cy="52" rx="28" ry="34" stroke="currentColor" opacity="0.2" fill="none" strokeWidth="1" />
            <rect x="8" y="30" width="26" height="14" rx="3" fill="none" stroke="#1D9E75" strokeWidth="1.5" />
            <rect x="46" y="30" width="26" height="14" rx="3" fill="none" stroke="#1D9E75" strokeWidth="1.5" />
            <line x1="34" y1="37" x2="46" y2="37" stroke="#1D9E75" strokeWidth="1.5" />
            <line x1="3" y1="37" x2="8" y2="37" stroke="#1D9E75" strokeWidth="1.5" />
            <line x1="72" y1="37" x2="77" y2="37" stroke="#1D9E75" strokeWidth="1.5" />
            <text x="40" y="78" textAnchor="middle" fontSize="9" fill="#1D9E75" opacity="0.8">face looks balanced</text>
          </svg>
          <div style={{ fontSize: 12, fontWeight: 400, color: T.paper, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            Correct width
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
            frame reaches the temples → natural, proportional look
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── result data ─── */
interface ResultData {
  badge: { text: string; bg: string; color: string };
  title: string;
  description: string;
  insightLabel: string;
  insightBody: string;
  specs: { label: string; value: string }[];
}

function getResult(s: WizardState): ResultData {
  const looksWider = s.look === "wider" || s.look === "proportion";
  const needsWide = s.temples || s.lenses || (s.frameWidth !== null && s.frameWidth < 148) || looksWider;
  const needsNose = s.nose !== null && s.nose !== "nose-ok";

  if (needsWide && needsNose) {
    return {
      badge: { text: "Two fit issues identified", bg: "#FAEEDA", color: "#633806" },
      title: "You need wider frames and a better bridge",
      description: "Your glasses are squeezing your temples and sitting poorly on your nose. Woolet 007/009 (158mm+) with a 21mm keyhole bridge solves both at once — and improves how your face looks in the process.",
      insightLabel: "WHY THIS CHANGES HOW YOU LOOK",
      insightBody: "Narrow frames end before your temples — your face spills beyond the lens edge, which makes it look wider than it is. Woolet 158mm+ aligns the frame with your actual face width. That single change balances proportions and slims your features. It's not style preference — it's geometry.",
      specs: [{ label: "Frame width", value: "158mm+" }, { label: "Bridge", value: "Keyhole 21mm" }],
    };
  }
  if (needsWide) {
    return {
      badge: { text: "Wide face — wrong frames", bg: "#EEEDFE", color: "#3C3489" },
      title: "Your glasses are making your face look wider",
      description: "This is the most common — and least obvious — problem for wide-face wearers. It's not just discomfort. It's how you look every single day.",
      insightLabel: "THE VISUAL WIDENING EFFECT — EXPLAINED",
      insightBody: "When frames end 1–2cm before your temple, your face is visibly wider than the lenses. The brain reads this as a disproportion and perceives a wider face. Frames at 158mm+ align the lens edge with your face edge. The result: your face looks narrower without changing anything about your features. Pure optical geometry.",
      specs: [{ label: "Frame width", value: "158mm+" }, { label: "Woolet models", value: "007 / 009" }],
    };
  }
  if (needsNose) {
    return {
      badge: { text: "Bridge fit issue", bg: "#E1F5EE", color: "#085041" },
      title: "The problem is the bridge, not the width",
      description: "Your face may not be wider than standard, but your nose needs a different fit. A wrong bridge means daily micro-irritations: sliding, marks, pressure.",
      insightLabel: "QUALITY VS. DAILY DISCOMFORT",
      insightBody: "Most cheap frames use a narrow bridge designed for a \"statistical nose\". Woolet's keyhole bridge (21mm) is wider and accommodates a broader range of nose shapes — no pressure, no sliding. You wear glasses 12 hours a day. That adds up.",
      specs: [{ label: "Bridge", value: "Keyhole 21mm" }, { label: "Material", value: "Italian acetate" }],
    };
  }
  return {
    badge: { text: "Good fit", bg: "#EAF3DE", color: "#27500A" },
    title: "Your size might be fine — but quality doesn't have to be",
    description: "You're not reporting classic wide-face or bridge fit issues. But if you want premium Italian acetate and frames that truly stand out — Woolet has you covered for other reasons.",
    insightLabel: "THE EMOTIONAL JOB",
    insightBody: "We often buy glasses because they \"fit\" — but we wear them for years, so they should represent us. Italian acetate is a different category from high-street plastic. You feel it on your nose. You hear it when someone asks \"where did you get those?\"",
    specs: [{ label: "Width starts at", value: "158mm" }, { label: "Material", value: "Italian acetate" }],
  };
}

/* ─── main component ─── */
export default function FitWizard() {
  const navigate = useNavigate();
  const { lang = "en" } = useParams();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initial);
  const [showResult, setShowResult] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [noneSelected, setNoneSelected] = useState(false);

  const canNext = useMemo(() => {
    if (step === 0) return state.look !== null;
    if (step === 1) return state.temples || state.lenses || noneSelected;
    if (step === 2) return state.nose !== null;
    if (step === 3) return true;
    return false;
  }, [step, state, noneSelected]);

  const next = useCallback(() => {
    if (step < 3) setStep((s) => s + 1);
    else setShowResult(true);
  }, [step]);

  const back = useCallback(() => {
    if (showResult) { setShowResult(false); setShowForm(false); }
    else if (step > 0) setStep((s) => s - 1);
  }, [step, showResult]);

  const reset = useCallback(() => {
    setState(initial);
    setStep(0);
    setShowResult(false);
    setShowForm(false);
    setNoneSelected(false);
  }, []);

  const result = useMemo(() => getResult(state), [state]);

  // Scroll to form when revealed
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  // Determine pre-fill value for WaitlistForm
  const getPrefilledWidth = () => {
    const looksWider = state.look === "wider" || state.look === "proportion";
    const needsWide = state.temples || state.lenses || (state.frameWidth !== null && state.frameWidth < 148) || looksWider;
    if (state.frameWidth) {
      if (state.frameWidth >= 162) return "162";
      if (state.frameWidth >= 155) return "155";
      if (state.frameWidth >= 145) return "145";
      if (state.frameWidth >= 138) return "138";
      return "unknown";
    }
    if (needsWide) return "155";
    return "";
  };

  return (
    <div style={{ minHeight: "100vh", background: T.ink, color: T.paper, position: "relative" }}>
      <style>{`
        @keyframes wizFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wiz-step-enter { animation: wizFadeIn 250ms ease both; }
        @media (max-width: 767px) {
          .wiz-option-card { padding: 12px 14px !important; }
          .wiz-option-card div:first-child + div > div:first-child { font-size: 13px !important; }
          .wiz-option-card div:first-child + div > div:last-child { font-size: 11px !important; }
          .wiz-right-label { display: none !important; }
          .wiz-content-area { padding: 0 16px !important; }
        }
      `}</style>
      <div style={gridOverlayStyle} />

      {/* top bar */}
      <div
        style={{
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", borderBottom: `0.5px solid ${T.bd}`, position: "relative", zIndex: 1,
        }}
        className="wiz-topbar"
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
          className="wiz-right-label"
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.muted,
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}
        >
          Italian Acetate · Wide Frames
        </span>
      </div>

      {/* content */}
      <div
        className="wiz-content-area"
        style={{
          maxWidth: 560, margin: "0 auto", padding: "0 24px",
          position: "relative", zIndex: 1, paddingBottom: 80,
        }}
      >
        {!showResult ? (
          <>
            <ProgressDots step={step} total={4} />
            <div key={step} className="wiz-step-enter">
              {/* step label */}
              <div
                style={{
                  fontSize: 11, color: T.muted, textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Step {step + 1} of 4
              </div>

              {/* STEP 0 — Visual fit */}
              {step === 0 && (
                <>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, lineHeight: 1.2, marginBottom: 6 }}>
                    How does your face look in your current glasses?
                  </h2>
                  <p style={{ fontSize: 14, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
                    Visual fit matters as much as physical comfort
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      { value: "wider" as const, title: "My face looks wider than it actually is", subtitle: "The frames end too early — my face spills beyond the lenses" },
                      { value: "proportion" as const, title: "The frames look too small on my face", subtitle: "Something is off with proportions — narrow lenses on broader features" },
                      { value: "ok-look" as const, title: "I look ok, but something feels off", subtitle: "Hard to pinpoint — the fit just isn't quite right" },
                      { value: "look-fine" as const, title: "I look fine — I just want something better", subtitle: "Aesthetically ok, but looking for premium quality or a sharper fit" },
                    ]).map((o) => (
                      <OptionCard key={o.value} selected={state.look === o.value} onClick={() => setState((s) => ({ ...s, look: o.value }))} icon={icons[o.value]} title={o.title} subtitle={o.subtitle} />
                    ))}
                  </div>
                </>
              )}

              {/* STEP 1 — Physical fit */}
              {step === 1 && (
                <>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, lineHeight: 1.2, marginBottom: 6 }}>
                    How do your glasses sit on your head?
                  </h2>
                  <p style={{ fontSize: 14, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    Physical sensations while wearing them
                  </p>
                  <p style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
                    Select all that apply
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <OptionCard
                      selected={state.temples && !noneSelected}
                      onClick={() => { setNoneSelected(false); setState((s) => ({ ...s, temples: !s.temples })); }}
                      icon={icons.temples} title="They squeeze my temples or head" subtitle="Arms press on the sides, leave marks or indentations"
                    />
                    <OptionCard
                      selected={state.lenses && !noneSelected}
                      onClick={() => { setNoneSelected(false); setState((s) => ({ ...s, lenses: !s.lenses })); }}
                      icon={icons.lenses} title="The lenses don't sit centered in front of my eyes" subtitle="Frame too narrow — I see through the edge of the lens"
                    />
                    <OptionCard
                      selected={noneSelected}
                      onClick={() => { setNoneSelected(true); setState((s) => ({ ...s, temples: false, lenses: false })); }}
                      icon={icons.none} title="They sit comfortably on my head" subtitle="No pressure or squeezing on either side"
                    />
                  </div>
                  {(state.temples || state.lenses) && <FaceComparison />}
                </>
              )}

              {/* STEP 2 — Nose */}
              {step === 2 && (
                <>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, lineHeight: 1.2, marginBottom: 6 }}>
                    How do your glasses sit on your nose?
                  </h2>
                  <p style={{ fontSize: 14, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
                    Bridge fit is often mistaken for a frame width problem
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      { value: "sliding" as const, title: "They slide down my nose", subtitle: "Constantly readjusting — bridge too wide or nose pads too smooth" },
                      { value: "marks" as const, title: "Red marks or pressure on my nose", subtitle: "Nose pads too narrow or frame material too rigid" },
                      { value: "high" as const, title: "They sit too high or float above my nose", subtitle: "Bridge too narrow — my nose doesn't reach the pads" },
                      { value: "nose-ok" as const, title: "They sit fine on my nose", subtitle: "No issues with the bridge or nose pads" },
                    ]).map((o) => (
                      <OptionCard key={o.value} selected={state.nose === o.value} onClick={() => setState((s) => ({ ...s, nose: o.value }))} icon={icons[o.value]} title={o.title} subtitle={o.subtitle} />
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3 — Size check */}
              {step === 3 && (
                <>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, lineHeight: 1.2, marginBottom: 6 }}>
                    Do you have your current glasses nearby?
                  </h2>
                  <p style={{ fontSize: 14, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
                    Optional — helps us refine your result
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <OptionCard
                      selected={state.hasSize === true}
                      onClick={() => setState((s) => ({ ...s, hasSize: true }))}
                      icon={icons["yes-size"]} title="Yes — I'll check the size on the temple arm" subtitle="Numbers like 54□18-145 — left is lens width, middle is bridge"
                    />
                    <OptionCard
                      selected={state.hasSize === false && state.frameWidth === null}
                      onClick={() => setState((s) => ({ ...s, hasSize: false, frameWidth: null }))}
                      icon={icons["no-size"]} title="No — skip this step" subtitle="I'll get my result based on symptoms alone"
                    />
                  </div>
                  {state.hasSize && (
                    <div style={{ marginTop: 16, animation: "wizFadeIn 300ms ease both" }}>
                      <p style={{ fontSize: 13, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
                        Add up: lens width × 2 + bridge = total frame width. E.g. 54+54+18 = 126mm
                      </p>
                      <input
                        type="number" min={40} max={250}
                        placeholder="Enter total frame width (mm)"
                        value={state.frameWidth ?? ""}
                        onChange={(e) => {
                          const v = e.target.value ? Number(e.target.value) : null;
                          setState((s) => ({ ...s, frameWidth: v }));
                        }}
                        style={{
                          width: "100%", padding: "10px 12px",
                          background: "rgba(245,241,235,0.05)", border: `0.5px solid ${T.bd2}`,
                          borderRadius: 8, color: T.paper, fontSize: 14,
                          fontFamily: "'DM Sans', sans-serif", outline: "none",
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, alignItems: "center" }}>
              {step > 0 ? (
                <button onClick={back} style={{ background: "none", border: "none", color: T.muted, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "8px 0" }}>
                  ← Back
                </button>
              ) : <div />}
              <button
                onClick={next} disabled={!canNext}
                style={{
                  background: step === 3 ? T.gold : "transparent",
                  color: step === 3 ? T.ink : T.paper,
                  border: step === 3 ? "none" : `0.5px solid ${T.bd2}`,
                  padding: "10px 24px", borderRadius: 6, fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif", cursor: canNext ? "pointer" : "default",
                  opacity: canNext ? 1 : 0.3, fontWeight: 500, transition: "opacity 150ms",
                }}
              >
                {step === 3 ? "See my result" : "Next"}
              </button>
            </div>
          </>
        ) : (
          /* ─── RESULT ─── */
          <div className="wiz-step-enter" style={{ paddingTop: 40 }}>
            {/* badge */}
            <span
              style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                background: result.badge.bg, color: result.badge.color, marginBottom: 16,
              }}
            >
              {result.badge.text}
            </span>

            {/* title */}
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, color: T.paper }}>
              {result.title}
            </h2>

            {/* description */}
            <p style={{ fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: T.dim, lineHeight: 1.7, marginBottom: "1.25rem" }}>
              {result.description}
            </p>

            {/* insight block */}
            <div style={{ borderLeft: "2px solid rgba(245,241,235,0.2)", background: "rgba(245,241,235,0.04)", borderRadius: "0 8px 8px 0", padding: "14px 18px", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                {result.insightLabel}
              </div>
              <p style={{ fontSize: 14, color: T.paper, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                {result.insightBody}
              </p>
            </div>

            {/* spec cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
              {result.specs.map((s) => (
                <div key={s.label} style={{ background: "rgba(245,241,235,0.05)", border: `0.5px solid ${T.bd2}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: T.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 400, color: T.paper, fontFamily: "'DM Sans', sans-serif" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: "100%", padding: 14, background: T.gold, color: T.ink,
                  border: "none", borderRadius: 8, fontSize: 13, letterSpacing: "0.08em",
                  textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, cursor: "pointer",
                }}
              >
                Reserve your spot →
              </button>
            )}

            {/* Inline waitlist form */}
            <div
              ref={formRef}
              style={{
                maxHeight: showForm ? 1000 : 0,
                overflow: "hidden",
                transition: "max-height 400ms ease",
              }}
            >
              <div style={{ paddingTop: 24 }}>
                <p style={{ fontSize: 14, color: T.dim, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                  One last step — reserve your founding member spot
                </p>
                <WaitlistForm lang={lang as Lang} prefilledWidth={getPrefilledWidth()} />
              </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: T.bd, margin: "24px 0" }} />

            {/* start over */}
            <button
              onClick={reset}
              style={{ background: "none", border: "none", color: T.muted, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0 }}
            >
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
