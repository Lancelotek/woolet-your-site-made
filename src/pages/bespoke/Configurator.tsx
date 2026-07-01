import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Cloud, CloudOff, Loader2, Ruler } from "lucide-react";
import SEO from "@/components/SEO";
import BespokeWaitlistGate from "@/components/BespokeWaitlistGate";
import { COLORS, FINISHES, LENS_TYPES } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import { STEPS, formatEur, isStepComplete, useBespokeConfig, type StepId } from "@/lib/bespoke-state";
import { useBespokeCloudSync } from "@/lib/bespoke-cloud-sync";
import {
  StepColor,
  StepEngraving,
  StepFrame,
  StepLenses,
  StepNav,
  StepReview,
  buildPreviewKey,
  getLatestPreviewUrl,
  PREVIEW_UPDATED_EVENT,
} from "./steps";

const PREVIEW_TOKEN = "woolet-preview";

// Google Fonts: Newsreader + Archivo. Loaded once on mount — scoped to this page only.
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Archivo:wght@400;500;600;700&display=swap";

const useConfiguratorFonts = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector(`link[data-cfg-fonts="1"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    link.setAttribute("data-cfg-fonts", "1");
    document.head.appendChild(link);
  }, []);
};

const ConfiguratorPage = () => {
  useConfiguratorFonts();
  const { config, update, pricing, reset, replace } = useBespokeConfig();
  const [step, setStep] = useState<StepId>(1);
  const [saved, setSaved] = useState(false);
  const [fitOpen, setFitOpen] = useState(false);
  const { status, isSignedIn, lastSavedAt } = useBespokeCloudSync({ config, setConfig: replace });
  const bypassGate =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("preview") === PREVIEW_TOKEN ||
      window.localStorage.getItem("bespoke-gate-bypass") === PREVIEW_TOKEN);
  if (typeof window !== "undefined" && bypassGate) {
    window.localStorage.setItem("bespoke-gate-bypass", PREVIEW_TOKEN);
  }

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  // Step-aware total: only show add-ons once the user has reached those steps.
  const stepTotal =
    step === 1 || step === 2 ? pricing.basePriceEur :
    step === 3 ? pricing.basePriceEur + pricing.engravingEur :
    pricing.totalEur;

  // Fit numbers — from scan if present, else brand reference defaults.
  const faceMm = config.measurements.faceWidth ?? 161;
  const bridgeMm = config.measurements.bridge ?? 22;
  const pdMm = config.measurements.pd ?? 66;
  const fitFromScan = !!config.scanCompletedAt;

  // Latest AI-generated preview for the current selection (frame + acetates + finish).
  // Reads from the same localStorage store used by AiPreviewPanel and re-checks
  // whenever the panel dispatches PREVIEW_UPDATED_EVENT.
  const previewKey = buildPreviewKey(config.frameId, config.frontColorId, config.templeColorId, config.finishId);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(() => getLatestPreviewUrl(previewKey));
  useEffect(() => {
    setAiPreviewUrl(getLatestPreviewUrl(previewKey));
    const refresh = () => setAiPreviewUrl(getLatestPreviewUrl(previewKey));
    window.addEventListener(PREVIEW_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PREVIEW_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [previewKey]);

  const goTo = (n: StepId) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = () => setSaved(true);
  const handleReset = () => {
    if (typeof window !== "undefined" && !window.confirm("Start a new build? Your current configuration will be cleared.")) return;
    reset();
    setSaved(false);
    setStep(1);
  };

  const StepBody =
    step === 1 ? <StepFrame config={config} update={update} /> :
    step === 2 ? <StepColor config={config} update={update} /> :
    step === 3 ? <StepEngraving config={config} update={update} /> :
    step === 4 ? <StepLenses config={config} update={update} /> :
                 <StepReview config={config} onSave={handleSave} saved={saved} />;

  return (
    <div className="cfg-scope min-h-screen">
      <SEO
        title="Bespoke Configurator — Woolet"
        description="Design your made-to-order bio-acetate eyewear for wide faces and wide bridges. Hand-made in Italy from Mazzucchelli acetate."
        path="/bespoke/configurator"
        noindex
      />
      <ConfiguratorStyles />

      {!bypassGate && <BespokeWaitlistGate />}

      <div aria-hidden={!bypassGate} className={bypassGate ? "" : "pointer-events-none select-none"} style={bypassGate ? undefined : { filter: "blur(8px)" }}>

        {/* ── Top utility bar ── */}
        <header className="cfg-topbar">
          <div className="cfg-container flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/en/bespoke" aria-label="Woolet bespoke" className="flex items-center gap-3 group">
                <img src="/__l5e/assets-v1/45616e6b-d290-4155-ac79-604f7d642a5d/woolet-logo.png" alt="Woolet" className="cfg-mark" />
              </Link>
              <span className="cfg-divider" aria-hidden />
              <Link to="/en/bespoke" className="cfg-back">
                ← Back to bespoke
              </Link>
            </div>
            <SyncBadge status={status} isSignedIn={isSignedIn} lastSavedAt={lastSavedAt} />
          </div>
        </header>

        {/* ── Stepper ── */}
        <div className="cfg-container pt-8">
          <ol className="cfg-stepper" role="list">
            {STEPS.map((s, i) => {
              const isCurrent = s.id === step;
              const isDone = isStepComplete(s.id, config) && s.id !== step;
              return (
                <li key={s.id} className="flex items-center">
                  <button
                    onClick={() => goTo(s.id)}
                    className={`cfg-step ${isCurrent ? "cfg-step--current" : ""} ${isDone ? "cfg-step--done" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className="cfg-step__num">
                      {isDone ? <Check size={11} strokeWidth={3} /> : s.id}
                    </span>
                    <span className="cfg-step__label">{s.shortLabel}</span>
                  </button>
                  {i < STEPS.length - 1 && <span className="cfg-step__rule" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Pay-first notice ── */}
        <div className="cfg-container mt-6">
          <div
            role="note"
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              border: "1px solid rgba(194,160,90,0.35)",
              background: "linear-gradient(180deg, rgba(194,160,90,0.08), rgba(194,160,90,0.02))",
              padding: "14px 18px",
              borderRadius: 2,
            }}
          >
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C2A05A",
                whiteSpace: "nowrap",
                paddingTop: 3,
                fontWeight: 600,
              }}
            >
              Pay → Measure
            </span>
            <p style={{ margin: 0, color: "#C4BDAF", fontSize: 14, lineHeight: 1.55 }}>
              <strong style={{ color: "#EFE9DF", fontWeight: 500 }}>You pay for your chosen pattern first.</strong>{" "}
              The made-to-measure fit scan is scheduled <em style={{ color: "#D8B86A", fontStyle: "italic" }}>after</em> your payment clears —
              once your measurements are confirmed, your frame is cut in Italy to the exact millimetres of your face.{" "}
              <span style={{ color: "#D8B86A" }}>Free worldwide shipping included.</span>
            </p>
          </div>
        </div>

        {/* ── Persistent fit badge ── */}
        <div className="cfg-container mt-6">
          <FitBadge
            faceMm={faceMm}
            bridgeMm={bridgeMm}
            fromScan={fitFromScan}
            open={fitOpen}
            onToggle={() => setFitOpen((v) => !v)}
          />
        </div>

        {/* ── Main two-column layout ── */}
        <main className="cfg-container pt-10 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <section>
              {StepBody}
              <div className="hidden lg:block">
                <StepNav
                  step={step}
                  total={STEPS.length}
                  onBack={() => goTo(Math.max(1, step - 1) as StepId)}
                  onNext={() => goTo(Math.min(STEPS.length, step + 1) as StepId)}
                  canNext={isStepComplete(step, config)}
                  isLast={step === STEPS.length}
                />
              </div>
            </section>

            {/* Sticky build rail */}
            <aside className="hidden lg:block">
              <div className="cfg-rail">
                <div className="cfg-rail__eyebrow">Your build</div>

                <div className="cfg-rail__photo" style={{ background: "#EFE9DF" }}>
                  {aiPreviewUrl && step >= 2 ? (
                    <img src={aiPreviewUrl} alt={frame ? `AI visualisation of Woolet Bespoke ${frame.name} — ${frame.shape} pattern, made-to-measure for wide faces` : "AI visualisation of Woolet Bespoke eyewear configuration"} className="max-h-full max-w-full object-contain" />
                  ) : frame ? (
                    <img src={frame.url} alt={`Woolet Bespoke ${frame.name} — ${frame.shape} pattern for wide faces, made-to-measure in Italy`} className="max-h-full max-w-[82%] object-contain" />
                  ) : (
                    <div className="cfg-rail__placeholder">Select a pattern</div>
                  )}
                </div>

                <dl className="cfg-rail__specs">
                  <SpecRow label="Pattern" value={frame ? `${frame.name}` : "—"} />
                  <SpecRow label="Ref width" value={frame ? `${frame.widthMm} mm · cut to face` : "—"} />
                  <SpecRow
                    label="Front"
                    value={
                      front ? (
                        <span className="inline-flex items-center gap-2">
                          <Swatch hex={front.hex} />
                          <span className="font-mono text-[10px]">{front.code}</span>
                        </span>
                      ) : "—"
                    }
                  />
                  <SpecRow
                    label="Temple"
                    value={
                      temple ? (
                        <span className="inline-flex items-center gap-2">
                          <Swatch hex={temple.hex} />
                          <span className="font-mono text-[10px]">{temple.code}</span>
                        </span>
                      ) : "—"
                    }
                  />
                  <SpecRow label="Finish" value={finish?.name ?? "—"} />
                  <SpecRow label="Engraving" value={config.engravingEnabled ? `“${config.engravingText || "…"}”` : "—"} />
                  <SpecRow label="Lenses" value={lens?.name ?? "—"} />
                </dl>

                <div className="cfg-rail__total">
                  <div className="flex items-baseline justify-between">
                    <span className="cfg-eyebrow">Total</span>
                    <span className="cfg-rail__price">{formatEur(stepTotal)}</span>
                  </div>
                  <ul className="cfg-rail__lines">
                    <li><span>Frame</span><span>{formatEur(pricing.basePriceEur)}</span></li>
                    {step >= 3 && pricing.engravingEur > 0 && <li><span>Engraving</span><span>+ {formatEur(pricing.engravingEur)}</span></li>}
                    {step >= 4 && pricing.lensEur > 0 && <li><span>Lenses</span><span>+ {formatEur(pricing.lensEur)}</span></li>}
                    <li><span>Shipping</span><span style={{ color: "var(--cfg-gold-bright)" }}>Free · worldwide</span></li>
                  </ul>
                </div>

                <button
                  onClick={() => goTo(Math.min(STEPS.length, step + 1) as StepId)}
                  disabled={!isStepComplete(step, config) || step === STEPS.length}
                  className="cfg-cta mt-5"
                >
                  {step === STEPS.length ? "Done" : <>Continue <ChevronRight size={14} /></>}
                </button>

                <button onClick={handleReset} className="cfg-rail__reset">
                  Start over
                </button>
              </div>
            </aside>
          </div>
        </main>

        {/* ── Mobile sticky CTA ── */}
        <div className="cfg-mobilebar lg:hidden">
          <div className="cfg-mobilebar__thumb">
            {aiPreviewUrl && step >= 2 ? <img src={aiPreviewUrl} alt="" /> : frame ? <img src={frame.url} alt="" /> : <span>Frame</span>}
          </div>
          <div className="cfg-mobilebar__meta">
            <div className="cfg-mobilebar__name">{frame ? frame.name : "Pick a frame"}</div>
            <div className="cfg-mobilebar__price">{formatEur(stepTotal)}</div>
          </div>
          <button
            onClick={() => goTo(Math.min(STEPS.length, step + 1) as StepId)}
            disabled={!isStepComplete(step, config) || step === STEPS.length}
            className="cfg-cta cfg-cta--mobile"
          >
            {step === STEPS.length ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───── Subcomponents ───── */

const Swatch = ({ hex }: { hex: string }) => (
  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: hex, boxShadow: "inset 0 0 0 1px rgba(239,233,223,0.18)" }} />
);

const SpecRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="cfg-spec-row">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const FitBadge = ({
  faceMm, bridgeMm, fromScan, open, onToggle,
}: { faceMm: number; bridgeMm: number; fromScan: boolean; open: boolean; onToggle: () => void }) => {
  return (
    <div className="cfg-fit">
      <button onClick={onToggle} className="cfg-fit__pill" aria-expanded={open}>
        <Ruler size={14} className="cfg-fit__icon" />
        <span className="cfg-fit__label">Your fit</span>
        <span className="cfg-fit__sep" />
        <span className="cfg-fit__value">{faceMm} mm face · {bridgeMm} mm bridge</span>
        <span className="cfg-fit__source">{fromScan ? "measured by scan" : "default reference"}</span>
        <ChevronRight size={14} className={`cfg-fit__chev ${open ? "cfg-fit__chev--open" : ""}`} />
      </button>

      {open && (
        <div className="cfg-fit__panel">
          <FitAxis
            title="Frame width"
            unit="mm"
            min={135}
            max={175}
            wooletBand={[155, 172]}
            standardBand={[138, 148]}
            value={faceMm}
            valueLabel="your face"
          />
          <FitAxis
            title="Bridge width"
            unit="mm"
            min={16}
            max={26}
            wooletBand={[21, 24]}
            standardBand={[18, 20]}
            value={bridgeMm}
            valueLabel="your bridge"
          />
          <p className="cfg-fit__note">
            You are not too wide. The frame is too narrow.
          </p>
        </div>
      )}
    </div>
  );
};

const FitAxis = ({
  title, unit, min, max, wooletBand, standardBand, value, valueLabel,
}: {
  title: string; unit: string; min: number; max: number;
  wooletBand: [number, number]; standardBand: [number, number];
  value: number; valueLabel: string;
}) => {
  const range = max - min;
  const pct = (n: number) => ((n - min) / range) * 100;
  return (
    <div className="cfg-axis">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="cfg-axis__title">{title}</h4>
        <span className="cfg-axis__legend">
          <span className="cfg-axis__legend-dot cfg-axis__legend-dot--gold" /> Woolet {wooletBand[0]}–{wooletBand[1]} {unit}
          <span className="cfg-axis__legend-dot cfg-axis__legend-dot--brick ml-3" /> Standard {standardBand[0]}–{standardBand[1]} {unit}
        </span>
      </div>
      <div className="cfg-axis__track">
        {/* standard hatched band */}
        <div
          className="cfg-axis__band cfg-axis__band--standard"
          style={{ left: `${pct(standardBand[0])}%`, width: `${pct(standardBand[1]) - pct(standardBand[0])}%` }}
        />
        {/* woolet gold band */}
        <div
          className="cfg-axis__band cfg-axis__band--woolet"
          style={{ left: `${pct(wooletBand[0])}%`, width: `${pct(wooletBand[1]) - pct(wooletBand[0])}%` }}
        />
        {/* value marker */}
        <div className="cfg-axis__marker" style={{ left: `${pct(value)}%` }}>
          <span className="cfg-axis__marker-line" />
          <span className="cfg-axis__marker-label">{value} {unit} · {valueLabel}</span>
        </div>
      </div>
      <div className="cfg-axis__scale">
        <span>{min}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

const SyncBadge = ({
  status, isSignedIn, lastSavedAt,
}: {
  status: ReturnType<typeof useBespokeCloudSync>["status"];
  isSignedIn: boolean;
  lastSavedAt: string | null;
}) => {
  if (!isSignedIn) {
    return (
      <Link to="/en/account/signin?next=/en/bespoke/configurator" className="cfg-sync cfg-sync--off">
        <CloudOff size={11} />
        <span>Sign in to save</span>
      </Link>
    );
  }
  const label =
    status === "loading" ? "Loading…" :
    status === "saving"  ? "Saving…" :
    status === "error"   ? "Sync error" :
    lastSavedAt          ? `Saved · ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` :
                           "Synced";
  const Icon = status === "loading" || status === "saving" ? Loader2 : Cloud;
  return (
    <span className="cfg-sync">
      <Icon size={11} className={status === "loading" || status === "saving" ? "animate-spin" : ""} />
      <span>{label}</span>
    </span>
  );
};

/* ───── Scoped CSS (design tokens isolated under .cfg-scope) ───── */

const ConfiguratorStyles = () => (
  <style>{`
    .cfg-scope {
      /* Brand tokens */
      --cfg-ink: #0B0A09;
      --cfg-panel: #16140F;
      --cfg-panel-2: #1C1A14;
      --cfg-gold: #C2A05A;
      --cfg-gold-bright: #D8B86A;
      --cfg-cream: #EFE9DF;
      --cfg-brick: #A05A3F;
      --cfg-text: #C4BDAF;
      --cfg-muted: #8F897B;
      --cfg-border: #211E18;
      --cfg-border-strong: #2D2922;

      background: var(--cfg-ink);
      color: var(--cfg-text);
      font-family: 'Archivo', system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .cfg-container { max-width: 1320px; margin: 0 auto; padding-inline: 32px; }
    @media (max-width: 768px) { .cfg-container { padding-inline: 20px; } }

    /* Typography */
    .cfg-h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-weight: 400;
      font-size: clamp(34px, 4.4vw, 56px);
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--cfg-cream);
    }
    .cfg-em {
      font-style: italic;
      font-weight: 400;
      color: var(--cfg-gold);
    }
    .cfg-body { color: var(--cfg-text); font-size: 17px; line-height: 1.65; }
    .cfg-eyebrow {
      font-family: 'Archivo', sans-serif;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--cfg-muted);
    }

    /* Top bar */
    .cfg-topbar {
      border-bottom: 1px solid var(--cfg-border);
      background: var(--cfg-ink);
      padding: 18px 0;
      position: sticky; top: 0; z-index: 30;
      backdrop-filter: saturate(120%) blur(8px);
    }
    .cfg-mark {
      width: 36px; height: 36px;
      object-fit: contain;
      display: block;
    }
    .cfg-wordmark {
      font-family: 'Newsreader', serif;
      font-weight: 500;
      font-size: 26px;
      color: var(--cfg-cream);
      letter-spacing: 0.01em;
      line-height: 1;
    }
    .cfg-divider { width: 1px; height: 18px; background: var(--cfg-border-strong); }
    .cfg-back {
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cfg-muted);
      transition: color .2s;
    }
    .cfg-back:hover { color: var(--cfg-cream); }

    /* Sync pill */
    .cfg-sync {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 12px;
      border: 1px solid var(--cfg-border-strong);
      background: var(--cfg-panel);
      color: var(--cfg-muted);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      border-radius: 2px;
    }
    .cfg-sync--off:hover { color: var(--cfg-cream); border-color: var(--cfg-gold); }

    /* Stepper */
    .cfg-stepper { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
    .cfg-step {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 9px 14px;
      border: 1px solid var(--cfg-border-strong);
      background: var(--cfg-panel);
      color: var(--cfg-muted);
      border-radius: 2px;
      transition: border-color .2s, color .2s, background .2s;
    }
    .cfg-step:hover { color: var(--cfg-text); border-color: var(--cfg-border-strong); }
    .cfg-step__num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px;
      border-radius: 999px;
      background: rgba(239,233,223,0.06);
      color: var(--cfg-text);
      font-size: 12px;
      font-weight: 600;
      font-family: 'Archivo', sans-serif;
    }
    .cfg-step__label {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 500;
    }
    .cfg-step--current {
      color: var(--cfg-cream);
      border-color: var(--cfg-gold);
    }
    .cfg-step--current .cfg-step__num {
      background: var(--cfg-ink);
      color: var(--cfg-gold);
      box-shadow: 0 0 0 2px var(--cfg-gold);
    }
    .cfg-step--done { color: var(--cfg-text); }
    .cfg-step--done .cfg-step__num {
      background: var(--cfg-gold);
      color: var(--cfg-ink);
    }
    .cfg-step__rule {
      width: 14px; height: 1px;
      background: var(--cfg-border-strong);
      margin: 0 4px;
    }
    @media (max-width: 640px) {
      .cfg-step__label { display: none; }
    }

    /* Fit badge */
    .cfg-fit { width: 100%; }
    .cfg-fit__pill {
      width: 100%;
      display: inline-flex; align-items: center; gap: 14px;
      padding: 14px 18px;
      background: var(--cfg-panel);
      border: 1px solid var(--cfg-border-strong);
      border-left: 2px solid var(--cfg-gold);
      border-radius: 2px;
      text-align: left;
      transition: border-color .2s, background .2s;
    }
    .cfg-fit__pill:hover { background: var(--cfg-panel-2); }
    .cfg-fit__icon { color: var(--cfg-gold); flex-shrink: 0; }
    .cfg-fit__label {
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--cfg-muted);
      font-weight: 600;
    }
    .cfg-fit__sep { width: 1px; height: 16px; background: var(--cfg-border-strong); }
    .cfg-fit__value {
      font-family: 'Newsreader', serif;
      font-size: 18px;
      color: var(--cfg-cream);
      font-weight: 500;
    }
    .cfg-fit__source {
      font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--cfg-muted);
      margin-left: auto;
    }
    .cfg-fit__chev { color: var(--cfg-muted); transition: transform .25s; }
    .cfg-fit__chev--open { transform: rotate(90deg); color: var(--cfg-gold); }
    @media (max-width: 700px) {
      .cfg-fit__source { display: none; }
      .cfg-fit__value { font-size: 15px; }
    }

    .cfg-fit__panel {
      margin-top: 12px;
      padding: 28px;
      background: var(--cfg-panel);
      border: 1px solid var(--cfg-border-strong);
      border-radius: 2px;
      display: grid;
      gap: 32px;
    }

    /* Fit axes */
    .cfg-axis__title {
      font-family: 'Newsreader', serif;
      font-weight: 500;
      font-size: 18px;
      color: var(--cfg-cream);
    }
    .cfg-axis__legend {
      display: inline-flex; align-items: center;
      font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--cfg-muted);
    }
    .cfg-axis__legend-dot {
      display: inline-block; width: 8px; height: 8px; margin-right: 8px;
      border-radius: 2px;
    }
    .cfg-axis__legend-dot--gold { background: var(--cfg-gold); }
    .cfg-axis__legend-dot--brick {
      background:
        repeating-linear-gradient(45deg, var(--cfg-brick) 0 2px, transparent 2px 4px),
        rgba(160,90,63,0.25);
    }

    .cfg-axis__track {
      position: relative;
      height: 38px;
      background: var(--cfg-ink);
      border: 1px solid var(--cfg-border);
      border-radius: 2px;
    }
    .cfg-axis__band {
      position: absolute; top: 0; bottom: 0;
    }
    .cfg-axis__band--standard {
      background:
        repeating-linear-gradient(45deg, rgba(160,90,63,0.55) 0 2px, transparent 2px 6px),
        rgba(160,90,63,0.10);
      border-left: 1px solid rgba(160,90,63,0.4);
      border-right: 1px solid rgba(160,90,63,0.4);
    }
    .cfg-axis__band--woolet {
      background: linear-gradient(180deg, rgba(194,160,90,0.35), rgba(194,160,90,0.18));
      border-left: 1px solid var(--cfg-gold);
      border-right: 1px solid var(--cfg-gold);
    }
    .cfg-axis__marker {
      position: absolute; top: -8px; bottom: -8px;
      transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center;
    }
    .cfg-axis__marker-line {
      width: 2px; flex: 1; background: var(--cfg-cream);
    }
    .cfg-axis__marker-label {
      position: absolute; top: 100%; margin-top: 8px;
      white-space: nowrap;
      font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--cfg-cream);
      background: var(--cfg-ink);
      padding: 4px 8px;
      border: 1px solid var(--cfg-border-strong);
      border-radius: 2px;
    }
    .cfg-axis__scale {
      display: flex; justify-content: space-between;
      margin-top: 28px;
      font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--cfg-muted);
    }
    .cfg-fit__note {
      font-family: 'Newsreader', serif;
      font-style: italic;
      color: var(--cfg-muted);
      font-size: 15px;
      margin: 0;
      border-top: 1px solid var(--cfg-border);
      padding-top: 18px;
    }

    /* Chips */
    .cfg-chip {
      padding: 7px 14px;
      border: 1px solid var(--cfg-border-strong);
      background: transparent;
      color: var(--cfg-muted);
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-weight: 500;
      border-radius: 2px;
      transition: border-color .2s, color .2s, background .2s;
    }
    .cfg-chip:hover { color: var(--cfg-text); border-color: var(--cfg-border-strong); }
    .cfg-chip--active {
      color: var(--cfg-ink);
      background: var(--cfg-cream);
      border-color: var(--cfg-cream);
    }
    .cfg-chip--compact { padding: 5px 10px; font-size: 10px; }

    /* Frame cards */
    .cfg-card {
      background: var(--cfg-panel);
      border: 1px solid var(--cfg-border-strong);
      border-radius: 2px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform .25s ease, border-color .2s, box-shadow .25s;
    }
    .cfg-card:hover {
      transform: translateY(-2px);
      border-color: var(--cfg-gold);
    }
    .cfg-card--active {
      border-color: var(--cfg-gold);
      box-shadow: 0 0 0 1px var(--cfg-gold);
    }
    .cfg-card--dim { opacity: 0.62; }
    .cfg-card--dim:hover { opacity: 1; }

    .cfg-card__photo {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--cfg-cream);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .cfg-card__name {
      font-family: 'Newsreader', serif;
      font-weight: 500;
      font-size: 17px;
      color: var(--cfg-cream);
      line-height: 1.2;
    }
    .cfg-card__code {
      font-family: 'Archivo', sans-serif;
      font-weight: 600;
      font-size: 10px;
      letter-spacing: 0.22em;
      color: var(--cfg-muted);
    }

    .cfg-spec { display: flex; flex-direction: column; line-height: 1.15; }
    .cfg-spec__value {
      font-family: 'Newsreader', serif;
      font-size: 16px;
      font-weight: 500;
      color: var(--cfg-cream);
    }
    .cfg-spec__sub {
      font-family: 'Archivo', sans-serif;
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cfg-muted);
      margin-top: 2px;
    }

    .cfg-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-radius: 2px;
      white-space: nowrap;
    }
    .cfg-tag--fit {
      color: var(--cfg-gold);
      background: rgba(194,160,90,0.10);
      border: 1px solid rgba(194,160,90,0.4);
    }
    .cfg-tag--off {
      color: var(--cfg-brick);
      background: rgba(160,90,63,0.08);
      border: 1px solid rgba(160,90,63,0.35);
    }

    /* Right rail */
    .cfg-rail {
      position: sticky; top: 96px;
      background: var(--cfg-panel);
      border: 1px solid var(--cfg-border-strong);
      border-radius: 2px;
      padding: 24px;
    }
    .cfg-rail__eyebrow {
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--cfg-muted);
      font-weight: 600;
      margin-bottom: 16px;
    }
    .cfg-rail__photo {
      aspect-ratio: 4 / 3;
      background: var(--cfg-cream);
      border-radius: 2px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .cfg-rail__placeholder {
      color: rgba(11,10,9,0.5);
      font-family: 'Newsreader', serif;
      font-style: italic;
      font-size: 14px;
    }
    .cfg-rail__specs { display: flex; flex-direction: column; gap: 10px; }
    .cfg-spec-row {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: 12px;
      padding-bottom: 9px;
      border-bottom: 1px dashed var(--cfg-border);
    }
    .cfg-spec-row:last-child { border-bottom: none; padding-bottom: 0; }
    .cfg-spec-row dt {
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--cfg-muted);
      font-weight: 600;
    }
    .cfg-spec-row dd {
      font-size: 13px;
      color: var(--cfg-cream);
      text-align: right;
      font-weight: 400;
    }

    .cfg-rail__total {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--cfg-border-strong);
    }
    .cfg-rail__price {
      font-family: 'Newsreader', serif;
      font-weight: 400;
      font-size: 32px;
      color: var(--cfg-cream);
      line-height: 1;
    }
    .cfg-rail__lines {
      list-style: none; padding: 0; margin: 12px 0 0;
      display: flex; flex-direction: column; gap: 4px;
    }
    .cfg-rail__lines li {
      display: flex; justify-content: space-between;
      font-size: 12px;
      color: var(--cfg-muted);
    }
    .cfg-rail__reset {
      margin-top: 16px;
      width: 100%;
      background: transparent; border: none;
      color: var(--cfg-muted);
      font-size: 10.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 8px 0;
      transition: color .2s;
    }
    .cfg-rail__reset:hover { color: var(--cfg-text); }

    /* Primary CTA — small, 2px radius, never full-bleed gold banner */
    .cfg-cta {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--cfg-gold);
      color: var(--cfg-ink);
      font-family: 'Archivo', sans-serif;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      padding: 14px 22px;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      width: 100%;
      transition: background .2s, transform .15s;
    }
    .cfg-cta:hover:not(:disabled) { background: var(--cfg-gold-bright); }
    .cfg-cta:active:not(:disabled) { transform: translateY(1px); }
    .cfg-cta:disabled {
      background: var(--cfg-panel-2);
      color: var(--cfg-muted);
      cursor: not-allowed;
    }

    /* Mobile bottom bar */
    .cfg-mobilebar {
      position: fixed; bottom: 0; inset-inline: 0;
      z-index: 40;
      background: var(--cfg-panel);
      border-top: 1px solid var(--cfg-border-strong);
      padding: 12px 16px;
      display: flex; align-items: center; gap: 12px;
    }
    .cfg-mobilebar__thumb {
      width: 44px; height: 44px;
      background: var(--cfg-cream);
      border-radius: 2px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .cfg-mobilebar__thumb img { max-width: 90%; max-height: 90%; object-fit: contain; }
    .cfg-mobilebar__thumb span {
      font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--cfg-muted);
    }
    .cfg-mobilebar__meta { flex: 1; min-width: 0; }
    .cfg-mobilebar__name {
      font-family: 'Newsreader', serif;
      font-size: 14px;
      color: var(--cfg-cream);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .cfg-mobilebar__price {
      font-family: 'Newsreader', serif;
      font-size: 18px;
      color: var(--cfg-cream);
      line-height: 1.1;
    }
    .cfg-cta--mobile { width: auto; padding: 11px 16px; }

    /* StepNav inherits Tailwind from steps.tsx — give it breathing room */
    .cfg-scope .step-nav, .cfg-scope nav[aria-label="step navigation"] { margin-top: 36px; }
  `}</style>
);

export default ConfiguratorPage;
