import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  StepMeasure,
  StepNav,
  StepReview,
} from "./steps";

const ConfiguratorPage = () => {
  const { config, update, pricing, reset, replace } = useBespokeConfig();
  const [step, setStep] = useState<StepId>(1);
  const [saved, setSaved] = useState(false);
  const { status, isSignedIn, lastSavedAt } = useBespokeCloudSync({ config, setConfig: replace });

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  const goTo = (n: StepId) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = () => {
    setSaved(true);
    // localStorage save is automatic via useBespokeConfig hook.
  };

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
    step === 5 ? <StepMeasure config={config} update={update} /> :
                 <StepReview config={config} onSave={handleSave} saved={saved} />;

  return (
    <div className="min-h-screen bg-background text-cream">
      <SEO
        title="Bespoke Configurator — Woolet"
        description="Design your made-to-order bio-acetate eyewear: choose silhouette, compose colour, measure your fit, engrave, pick lenses. Hand-made in Italy from Mazzucchelli acetate."
        path="/bespoke/configurator"
        noindex
      />
      <Navbar />
      <BespokeWaitlistGate />

      <div aria-hidden className="pointer-events-none select-none" style={{ filter: "blur(8px)" }}>


      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stepper */}
          <div className="mb-10">
            <Link to="/en/bespoke" className="text-cream-dim text-[0.7rem] uppercase tracking-[0.22em] hover:text-cream transition">
              ← Back to Bespoke
            </Link>
            <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
              <h1 className="font-display text-cream text-3xl sm:text-4xl font-light">
                Bespoke configurator
              </h1>
              <SyncBadge status={status} isSignedIn={isSignedIn} lastSavedAt={lastSavedAt} />
            </div>
            <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {STEPS.map((s, i) => {
                const isCurrent = s.id === step;
                const isDone = isStepComplete(s.id, config) && s.id < step;
                return (
                  <li key={s.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={() => goTo(s.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-[0.68rem] uppercase tracking-[0.16em] transition ${
                        isCurrent
                          ? "border-gold bg-gold/10 text-gold-light"
                          : isDone
                          ? "border-cream/25 text-cream hover:border-cream/50"
                          : "border-cream/10 text-cream-dim hover:border-cream/30"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[0.6rem] ${
                          isCurrent
                            ? "bg-gold text-background"
                            : isDone
                            ? "bg-cream/15 text-cream"
                            : "bg-cream/[0.04] text-cream-dim"
                        }`}
                      >
                        {isDone ? <Check size={11} /> : s.id}
                      </span>
                      <span className="hidden sm:inline">{s.shortLabel}</span>
                    </button>
                    {i < STEPS.length - 1 && <span className="w-3 h-px bg-cream/15" />}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Layout: main + summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
            <section>
              {StepBody}
              <StepNav
                step={step}
                total={STEPS.length}
                onBack={() => goTo(Math.max(1, step - 1) as StepId)}
                onNext={() => goTo(Math.min(STEPS.length, step + 1) as StepId)}
                canNext={isStepComplete(step, config)}
                isLast={step === STEPS.length}
              />
            </section>

            {/* Desktop summary sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-[14px] border border-cream/10 bg-background/40 p-5">
                <div className="uppercase tracking-[0.2em] text-[0.62rem] text-gold-light/80 mb-3">Your build</div>

                {frame ? (
                  <div className="aspect-[4/3] bg-cream/[0.03] rounded-[10px] overflow-hidden flex items-center justify-center mb-4">
                    <img src={frame.url} alt={frame.name} className="max-h-full max-w-[80%] object-contain p-2" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-cream/[0.03] rounded-[10px] flex items-center justify-center text-cream-dim text-xs mb-4">
                    Select a frame
                  </div>
                )}

                <dl className="text-xs space-y-2.5">
                  <SummaryRow label="Frame" value={frame ? `${frame.name}` : "—"} />
                  <SummaryRow
                    label="Front"
                    value={
                      front ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/20" style={{ background: front.hex }} />
                          {front.name}
                        </span>
                      ) : "—"
                    }
                  />
                  <SummaryRow
                    label="Temple"
                    value={
                      temple ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/20" style={{ background: temple.hex }} />
                          {temple.name}
                        </span>
                      ) : "—"
                    }
                  />
                  <SummaryRow label="Finish" value={finish?.name ?? "—"} />
                  <SummaryRow label="PD" value={config.measurements.pd ? `${config.measurements.pd} mm` : "—"} />
                  <SummaryRow label="Engraving" value={config.engravingEnabled ? `"${config.engravingText || "…"}"` : "—"} />
                  <SummaryRow label="Lenses" value={lens?.name ?? "—"} />
                </dl>

                <div className="border-t border-cream/10 mt-5 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="uppercase tracking-[0.18em] text-[0.62rem] text-cream-dim">Total</span>
                    <span className="font-display text-cream text-3xl font-light">{formatEur(pricing.totalEur)}</span>
                  </div>
                  <ul className="mt-2 text-[0.68rem] text-cream-dim space-y-0.5">
                    <li className="flex justify-between"><span>Frame</span><span>{formatEur(pricing.basePriceEur)}</span></li>
                    {pricing.engravingEur > 0 && <li className="flex justify-between"><span>Engraving</span><span>+ {formatEur(pricing.engravingEur)}</span></li>}
                    {pricing.lensEur > 0 && <li className="flex justify-between"><span>Lenses</span><span>+ {formatEur(pricing.lensEur)}</span></li>}
                  </ul>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-5 w-full text-[0.68rem] text-cream-dim hover:text-cream uppercase tracking-[0.2em] transition"
                >
                  Start over
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky summary */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-cream/15 px-4 py-3 flex items-center gap-3">
        {/* Frame thumb */}
        <div className="w-12 h-12 rounded-[8px] bg-cream/[0.04] border border-cream/10 shrink-0 flex items-center justify-center overflow-hidden">
          {frame ? (
            <img src={frame.url} alt="" className="max-h-full max-w-full object-contain p-1" />
          ) : (
            <span className="text-cream-dim text-[0.55rem] uppercase tracking-[0.16em]">Frame</span>
          )}
        </div>
        {/* Meta + swatches */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-cream text-[0.72rem] truncate">{frame ? frame.name : "Pick a frame"}</span>
            {(front || temple) && (
              <span className="flex items-center gap-0.5 shrink-0">
                {front && <span className="w-2.5 h-2.5 rounded-full border border-cream/25" style={{ background: front.hex }} />}
                {temple && <span className="w-2.5 h-2.5 rounded-full border border-cream/25" style={{ background: temple.hex }} />}
              </span>
            )}
          </div>
          <div className="font-display text-cream text-lg font-light leading-none mt-1">{formatEur(pricing.totalEur)}</div>
        </div>
        <button
          onClick={() => goTo(Math.min(STEPS.length, step + 1) as StepId)}
          disabled={!isStepComplete(step, config) || step === STEPS.length}
          className="px-4 py-2.5 rounded-full bg-gold text-background text-[0.66rem] uppercase tracking-[0.2em] font-medium disabled:opacity-40 transition shrink-0"
        >
          {step === STEPS.length ? "Done" : "Next"}
        </button>
      </div>

      <Footer />
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="text-cream-dim uppercase tracking-[0.14em] text-[0.6rem]">{label}</dt>
    <dd className="text-cream text-xs text-right">{value}</dd>
  </div>
);

const SyncBadge = ({
  status,
  isSignedIn,
  lastSavedAt,
}: {
  status: ReturnType<typeof useBespokeCloudSync>["status"];
  isSignedIn: boolean;
  lastSavedAt: string | null;
}) => {
  if (!isSignedIn) {
    return (
      <Link
        to="/en/account/signin?next=/en/bespoke/configurator"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cream/15 text-cream-dim hover:text-cream hover:border-cream/30 text-[0.62rem] uppercase tracking-[0.18em] transition"
      >
        <CloudOff size={12} />
        Sign in to save across devices
      </Link>
    );
  }
  const label =
    status === "loading" ? "Loading your build…" :
    status === "saving"  ? "Saving…" :
    status === "error"   ? "Sync error — retrying" :
    lastSavedAt          ? `Saved · ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` :
                           "Synced to your account";
  const Icon = status === "loading" || status === "saving" ? Loader2 : Cloud;
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cream/10 bg-cream/[0.03] text-cream-dim text-[0.62rem] uppercase tracking-[0.18em]">
      <Icon size={12} className={status === "loading" || status === "saving" ? "animate-spin" : ""} />
      {label}
    </span>
  );
};

export default ConfiguratorPage;
