import { useState } from "react";
import { Link } from "react-router-dom";
import { pushGtmEvent } from "@/lib/gtm";

type Band = "narrow" | "average" | "wide" | "extra-wide";

interface Step {
  key: string;
  question: string;
  help?: string;
  options: { label: string; hint?: string; value: Band | Partial<Record<Band, number>> }[];
}

const STEPS: Step[] = [
  {
    key: "card-test",
    question: "Hold a credit card horizontally under your eyes. How does it compare to your face width?",
    help: "A standard card is exactly 85.6 mm wide.",
    options: [
      { label: "Wider than my face", hint: "Card sticks out past both cheekbones", value: { narrow: 3 } },
      { label: "About the same width", hint: "Card edges roughly meet my cheekbones", value: { narrow: 2, average: 2 } },
      { label: "Noticeably narrower", hint: "Face extends past both card edges", value: { average: 2, wide: 2 } },
      { label: "Much narrower — almost half my face", hint: "I could fit ~1.9× the card across", value: { wide: 2, "extra-wide": 3 } },
    ],
  },
  {
    key: "current-glasses",
    question: "How do your current (or most recent) glasses fit?",
    options: [
      { label: "They slide down constantly", value: { narrow: 2 } },
      { label: "They fit fine", value: { average: 3 } },
      { label: "They pinch my temples after an hour", value: { wide: 3 } },
      { label: "I can't find any that don't bow at the sides", value: { "extra-wide": 3 } },
    ],
  },
  {
    key: "hat-shopping",
    question: "When you buy a hat, what usually happens?",
    options: [
      { label: "S/M fits well", value: { narrow: 2, average: 1 } },
      { label: "L is my size", value: { average: 2, wide: 1 } },
      { label: "XL — anything smaller sits on top", value: { wide: 2, "extra-wide": 2 } },
      { label: "I usually can't find one that fits", value: { "extra-wide": 3 } },
    ],
  },
  {
    key: "frame-shopping",
    question: "When trying frames in a shop, which sounds most familiar?",
    options: [
      { label: "Most frames feel too big on me", value: { narrow: 3 } },
      { label: "Standard sizes work — I have plenty of options", value: { average: 3 } },
      { label: "I only find one or two that don't pinch", value: { wide: 3 } },
      { label: "Nothing on the wall actually fits — I've given up", value: { "extra-wide": 3 } },
    ],
  },
];

const RESULTS: Record<Band, {
  title: string;
  range: string;
  honest: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  tone: "muted" | "match" | "bespoke";
}> = {
  narrow: {
    title: "Narrow face — Woolet won't fit you",
    range: "Under ~138 mm temple-to-temple",
    honest:
      "Honest answer: our smallest frame is 158 mm. It would slide down your nose and sit past your temples. Try Warby Parker Narrow, Zenni Petite, Eyebobs Small, or Moscot's smaller sizes — you'll be much happier.",
    cta: { label: "Read the narrow-face guide", href: "/en/blog/how-to-tell-if-your-face-is-wide-or-narrow" },
    tone: "muted",
  },
  average: {
    title: "Average width — you have plenty of options",
    range: "138–154 mm temple-to-temple",
    honest:
      "Every mainstream brand builds for you. Woolet's 158 mm will feel one size too big on most of this range. If you're at the top end (150–154 mm) and standard frames still pinch, look at Ray-Ban Large, Persol's wider models, or Moscot Lemtosh XL first.",
    cta: { label: "Measure precisely with AI Fit Wizard", href: "/en/fit" },
    tone: "muted",
  },
  wide: {
    title: "Wide face — this is the Woolet range",
    range: "155–161 mm temple-to-temple",
    honest:
      "This is exactly what Woolet 007 and 009 are engineered for: 158 mm front, 21–22 mm keyhole bridge, Italian Mazzucchelli acetate. Mainstream brands stop right before your face begins.",
    cta: { label: "See Woolet 007 & 009", href: "/en/collection" },
    secondary: { label: "Confirm with AI Fit Wizard", href: "/en/fit" },
    tone: "match",
  },
  "extra-wide": {
    title: "Extra-wide face — bespoke territory",
    range: "162 mm and above",
    honest:
      "Even our stock 158 mm will bow at the temples. Woolet Bespoke is cut to your exact face width (up to 162 mm) and bridge (20–24 mm), same Italian acetate, hand made in EU. It's the only path that actually fits above 162 mm.",
    cta: { label: "Explore Woolet Bespoke", href: "/en/bespoke" },
    secondary: { label: "Measure first with AI Fit Wizard", href: "/en/fit" },
    tone: "bespoke",
  },
};

const INITIAL_SCORES: Record<Band, number> = { narrow: 0, average: 0, wide: 0, "extra-wide": 0 };

const FaceWidthQuiz = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Band, number>>(INITIAL_SCORES);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<Band | null>(null);

  const handlePick = (opt: Step["options"][number]) => {
    const next = { ...scores };
    if (typeof opt.value === "string") {
      next[opt.value] += 3;
    } else {
      for (const [band, pts] of Object.entries(opt.value) as [Band, number][]) {
        next[band] += pts;
      }
    }
    setScores(next);
    pushGtmEvent("quiz_step", {
      quiz: "face_width",
      step: step + 1,
      answer: opt.label,
    });

    if (step + 1 >= STEPS.length) {
      const winner = (Object.entries(next) as [Band, number][]).sort((a, b) => b[1] - a[1])[0][0];
      setResult(winner);
      setDone(true);
      pushGtmEvent("quiz_complete", { quiz: "face_width", band: winner });
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setScores(INITIAL_SCORES);
    setDone(false);
    setResult(null);
  };

  const current = STEPS[step];
  const progress = done ? 100 : Math.round((step / STEPS.length) * 100);

  const shellStyle: React.CSSProperties = {
    background: "#F8F6F1",
    border: "1px solid #E4DFD4",
    borderRadius: 6,
    padding: "28px 26px",
    margin: "32px 0",
    fontFamily: "'Barlow', sans-serif",
  };

  if (done && result) {
    const r = RESULTS[result];
    const accent = r.tone === "match" ? "#C2A05A" : r.tone === "bespoke" ? "#0B0A09" : "#8A8578";
    const bg = r.tone === "match" ? "#FAF3E1" : r.tone === "bespoke" ? "#0B0A09" : "#F8F6F1";
    const fg = r.tone === "bespoke" ? "#EFE9DF" : "#111111";
    return (
      <div style={{ ...shellStyle, background: bg, borderColor: accent, color: fg }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, fontWeight: 600 }}>
          Your result
        </div>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 24, lineHeight: 1.25, margin: "0 0 6px", fontWeight: 500, color: fg }}>
          {r.title}
        </h3>
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7, marginBottom: 16, color: fg }}>
          {r.range}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 22px", color: fg, opacity: r.tone === "bespoke" ? 0.9 : 1 }}>
          {r.honest}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <Link
            to={r.cta.href}
            onClick={() => pushGtmEvent("quiz_cta_click", { quiz: "face_width", band: result, cta: "primary", href: r.cta.href })}
            style={{
              display: "inline-block",
              background: accent,
              color: r.tone === "bespoke" ? "#EFE9DF" : "#0B0A09",
              padding: "12px 22px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              borderRadius: 2,
            }}
          >
            {r.cta.label} →
          </Link>
          {r.secondary && (
            <Link
              to={r.secondary.href}
              onClick={() => pushGtmEvent("quiz_cta_click", { quiz: "face_width", band: result, cta: "secondary", href: r.secondary!.href })}
              style={{
                display: "inline-block",
                padding: "12px 18px",
                textDecoration: "underline",
                fontSize: 12,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: fg,
                opacity: 0.75,
              }}
            >
              {r.secondary.label}
            </Link>
          )}
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: fg,
              opacity: 0.5,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              cursor: "pointer",
              marginLeft: "auto",
              padding: "12px 4px",
              fontFamily: "inherit",
            }}
          >
            ↺ Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#8A8578", fontWeight: 600 }}>
          Face-width quiz · Step {step + 1} of {STEPS.length}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: "#8A8578" }}>{progress}%</div>
      </div>
      <div style={{ height: 3, background: "#E4DFD4", borderRadius: 2, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#C2A05A", transition: "width 0.3s ease" }} />
      </div>
      <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, lineHeight: 1.3, margin: "0 0 6px", fontWeight: 500, color: "#111" }}>
        {current.question}
      </h3>
      {current.help && (
        <p style={{ fontSize: 13, color: "#6B6659", margin: "0 0 18px", lineHeight: 1.5 }}>{current.help}</p>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {current.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handlePick(opt)}
            style={{
              textAlign: "left",
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid #E4DFD4",
              borderRadius: 3,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C2A05A";
              e.currentTarget.style.background = "#FDFBF6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E4DFD4";
              e.currentTarget.style.background = "#FFFFFF";
            }}
          >
            <div style={{ fontSize: 14, color: "#111", fontWeight: 500 }}>{opt.label}</div>
            {opt.hint && <div style={{ fontSize: 12, color: "#8A8578", marginTop: 3 }}>{opt.hint}</div>}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            color: "#8A8578",
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default FaceWidthQuiz;
