import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, ImageIcon, Lock, Unlock, Upload } from "lucide-react";
import FrameGallery from "@/components/FrameGallery";

import { supabase } from "@/integrations/supabase/client";

import {
  COLORS,
  ENGRAVING_FEE_EUR,
  ENGRAVING_FONTS,
  ENGRAVING_MAX_CHARS,
  ENGRAVING_POSITIONS,
  FINISHES,
  LENS_COATINGS,
  LENS_MATERIALS,
  LENS_TYPES,
  MEASUREMENT_RANGES,
  type MeasurementKey,
} from "@/data/bespoke-options";
import { FRAMES, FRAME_SHAPES, findFrame, type Frame } from "@/data/frames";
import { type BespokeConfig, formatEur } from "@/lib/bespoke-state";
import { clampFaceMm, clampNoseMm } from "@/lib/scan-clamp";
import { loadScanResult, type StoredScanResult } from "@/lib/scan-result-store";
import { loadQuizPrior, type QuizPrior } from "@/lib/fit-quiz-prior";

interface StepProps {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
}

const sectionTitle = "font-display text-cream text-2xl sm:text-3xl font-light";
const sectionKicker = "uppercase tracking-[0.22em] text-[0.78rem] text-gold-light/80 mb-2";
const labelClass = "uppercase tracking-[0.18em] text-[0.78rem] text-cream-dim";

const cardOuter = "rounded-[14px] border border-cream/10 bg-background/40 transition-all";
const cardActive = "border-gold/60 bg-gold/[0.04] ring-1 ring-gold/30";

/* ───── Step 1 ───── */
type WidthSort = "all" | "narrow" | "fit" | "wide";

export function StepFrame({ config, update }: StepProps) {
  const [shapeFilter, setShapeFilter] = useState<string>("all");
  const [widthSort, setWidthSort] = useState<WidthSort>("all");

  // User's fit window — from scan if present, else default to 161 mm (brand reference).
  const userFace = config.measurements.faceWidth ?? 161;
  const FIT_TOLERANCE = 5; // ±5 mm comfortable window
  const fitMin = userFace - FIT_TOLERANCE;
  const fitMax = userFace + FIT_TOLERANCE;

  const widthBucket = (w: number): "narrow" | "fit" | "wide" =>
    w < fitMin ? "narrow" : w > fitMax ? "wide" : "fit";

  let visible: Frame[] = shapeFilter === "all" ? FRAMES : FRAMES.filter((f) => f.shape === shapeFilter);
  if (widthSort !== "all") {
    visible = [...visible].sort((a, b) => {
      const pa = widthBucket(a.widthMm) === widthSort ? 0 : 1;
      const pb = widthBucket(b.widthMm) === widthSort ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return a.widthMm - b.widthMm;
    });
  }

  return (
    <div className="space-y-10">
      <header>
        <div className="cfg-eyebrow">Step 1 — Frame</div>
        <h2 className="cfg-h1 mt-3">
          Choose your frame <em className="cfg-em">silhouette</em>
        </h2>
        <p className="cfg-body mt-4 max-w-xl">
          25 hand-made bio-acetate shapes, cut from a single block of Italian Mazzucchelli acetate.
          Each pair is unique — your chosen frame will never be made twice in the same grain.
        </p>
      </header>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-1.5">
          <ChipFilter active={shapeFilter === "all"} onClick={() => setShapeFilter("all")}>All shapes</ChipFilter>
          {FRAME_SHAPES.map((s) => (
            <ChipFilter key={s} active={shapeFilter === s} onClick={() => setShapeFilter(s)}>
              {s}
            </ChipFilter>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="cfg-eyebrow mr-1" style={{ fontSize: 10 }}>Width</span>
          <ChipFilter active={widthSort === "all"} onClick={() => setWidthSort("all")} compact>All</ChipFilter>
          <ChipFilter active={widthSort === "fit"} onClick={() => setWidthSort("fit")} compact>Fits you</ChipFilter>
          <ChipFilter active={widthSort === "narrow"} onClick={() => setWidthSort("narrow")} compact>Narrow</ChipFilter>
          <ChipFilter active={widthSort === "wide"} onClick={() => setWidthSort("wide")} compact>Wide</ChipFilter>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((f) => {
          const active = config.frameId === f.id;
          const bucket = widthBucket(f.widthMm);
          const fits = bucket === "fit";
          const tag =
            bucket === "narrow" ? "runs narrow" :
            bucket === "wide"   ? "runs wide" : null;

          return (
            <button
              key={f.id}
              onClick={() => update("frameId", f.id)}
              className={`cfg-card group text-left ${active ? "cfg-card--active" : ""} ${!fits && !active ? "cfg-card--dim" : ""}`}
            >
              <div className="cfg-card__photo">
                <img
                  src={f.url}
                  alt={f.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {active && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center justify-center w-6 h-6 bg-[color:var(--cfg-gold)]" style={{ borderRadius: 2 }}>
                    <Check size={14} className="text-[color:var(--cfg-ink)]" strokeWidth={2.5} />
                  </span>
                )}
              </div>

              <div className="px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="cfg-card__name">{f.name}</div>
                </div>
                <div className="cfg-card__code mt-1">{f.id.toUpperCase()} · {f.shape.toUpperCase()}</div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="cfg-spec">
                    <span className="cfg-spec__value">{f.widthMm} mm</span>
                    <span className="cfg-spec__sub">{f.bridgeMm} mm bridge</span>
                  </div>
                  {fits ? (
                    <span className="cfg-tag cfg-tag--fit">
                      <Check size={10} strokeWidth={3} /> Fits you
                    </span>
                  ) : tag ? (
                    <span className="cfg-tag cfg-tag--off">{tag}</span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipFilter({
  active, onClick, children, compact,
}: { active: boolean; onClick: () => void; children: React.ReactNode; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`cfg-chip ${active ? "cfg-chip--active" : ""} ${compact ? "cfg-chip--compact" : ""}`}
    >
      {children}
    </button>
  );
}



/* ───── Step 2 ───── */
function ColorSwatchGrid({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {COLORS.map((c) => {
        const active = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            title={c.name}
            className={`group relative aspect-square rounded-full border transition ${
              active ? "border-gold ring-2 ring-gold/40" : "border-cream/15 hover:border-cream/40"
            }`}
            style={{ background: c.hex }}
          >
            {active && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check size={14} className="text-cream drop-shadow" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StepColor({ config, update }: StepProps) {
  return (
    <div className="space-y-10">
      <header>
        <div className={sectionKicker}>Step 2</div>
        <h2 className={sectionTitle}>Compose your acetate</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Each sheet of Italian bio-acetate carries a unique grain. After production we keep the off-cut as your keepsake.
        </p>
      </header>

      <div>
        <div className={labelClass}>Front colour</div>
        <div className="mt-3"><ColorSwatchGrid selected={config.frontColorId} onSelect={(id) => update("frontColorId", id)} /></div>
        {config.frontColorId && (
          <div className="text-cream text-xs mt-2">{COLORS.find((c) => c.id === config.frontColorId)?.name}</div>
        )}
      </div>

      <div>
        <div className={labelClass}>Temple colour</div>
        <div className="mt-3"><ColorSwatchGrid selected={config.templeColorId} onSelect={(id) => update("templeColorId", id)} /></div>
        {config.templeColorId && (
          <div className="text-cream text-xs mt-2">{COLORS.find((c) => c.id === config.templeColorId)?.name}</div>
        )}
      </div>

      <div>
        <div className={labelClass}>Finish</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FINISHES.map((f) => {
            const active = config.finishId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => update("finishId", f.id)}
                className={`px-4 py-2 rounded-full text-xs tracking-wide border transition ${
                  active
                    ? "border-gold text-gold-light bg-gold/10"
                    : "border-cream/15 text-cream-dim hover:border-cream/30"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───── Step 3 ───── */
function ScanContactModal({
  initialEmail,
  initialPhone,
  submitting = false,
  error = null,
  onCancel,
  onConfirm,
}: {
  initialEmail: string;
  initialPhone: string;
  submitting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (email: string, phone: string) => void;
}) {

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [touched, setTouched] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-[14px] border border-gold/30 bg-background p-6 sm:p-8">
        <div className={sectionKicker}>Before we open your camera</div>
        <h3 className="font-display text-cream text-2xl font-light mb-3">Where should we send your scan results?</h3>
        <p className="text-cream-dim text-sm leading-relaxed mb-5">
          The AI scan happens on your phone. We'll email you the moment your measurements are verified by our optician and your frame goes into production.
        </p>
        <div className="space-y-4 mb-6">
          <label className="block">
            <span className="text-cream text-xs">Email <span className="text-gold-light">*</span></span>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="you@domain.com"
              className="mt-1.5 w-full px-4 py-2.5 rounded-[10px] bg-background border border-cream/15 text-cream text-sm focus:outline-none focus:ring-1 focus:border-gold focus:ring-gold/40"
            />
            {touched && !emailValid && (
              <span className="text-[hsl(0_60%_60%)] text-[0.78rem] mt-1 block">Enter a valid email address.</span>
            )}
          </label>
          <label className="block">
            <span className="text-cream text-xs">Phone <span className="text-cream-dim">(optional)</span></span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+48 600 000 000"
              className="mt-1.5 w-full px-4 py-2.5 rounded-[10px] bg-background border border-cream/15 text-cream text-sm focus:outline-none focus:ring-1 focus:border-gold focus:ring-gold/40"
            />
            <span className="text-cream-dim text-[0.78rem] mt-1 block">For production updates and delivery coordination only.</span>
          </label>
        </div>
        <p className="text-cream-dim text-[0.78rem] mb-5 leading-relaxed">
          By proceeding you consent to processing of biometric data under GDPR Art. 9(2)(a). Facial landmarks are stored encrypted in the EU and auto-deleted within 30 days. You can withdraw consent at any time.
        </p>
        {error && (
          <p className="text-[hsl(0_60%_65%)] text-xs mb-4">{error}</p>
        )}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={() => emailValid && !submitting && onConfirm(email.trim(), phone.trim())}
            disabled={!emailValid || submitting}
            className="flex-1 px-6 py-3 rounded-full bg-gold text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Opening scan…" : "Save & start scan"}
          </button>
          <button onClick={onCancel} disabled={submitting} className="flex-1 px-6 py-3 rounded-full border border-cream/20 text-cream-dim text-xs uppercase tracking-[0.18em] hover:border-cream/40 transition disabled:opacity-40">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export function StepMeasure({ config, update }: StepProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [storedScan, setStoredScan] = useState<StoredScanResult | null>(null);
  const [quizPrior, setQuizPrior] = useState<QuizPrior | null>(null);
  const [importedFrom, setImportedFrom] = useState<"scan" | "quiz" | null>(null);

  useEffect(() => {
    setStoredScan(loadScanResult());
    setQuizPrior(loadQuizPrior());
  }, []);

  const importFromScan = () => {
    if (!storedScan) return;
    const next = { ...config.measurements };
    const face = clampFaceMm(storedScan.faceWidthMm);
    const nose = clampNoseMm(storedScan.noseWidthMm);
    if (face != null) next.faceWidth = face;
    // Map nose width → bridge field (matches existing scan-poll behaviour).
    if (nose != null) next.bridge = nose;
    update("measurements", next);
    setImportedFrom("scan");
  };

  const importFromQuiz = () => {
    if (!quizPrior) return;
    const next = { ...config.measurements };
    const face = quizPrior.currentFrameMm ?? quizPrior.faceEstimateMm;
    if (face != null) next.faceWidth = Math.round(face);
    update("measurements", next);
    setImportedFrom("quiz");
  };


  const scanLocked =
    config.measurementMethod === "scan" &&
    !!config.scanCompletedAt &&
    !config.scanMeasurementsUnlocked;

  const handleTapeChange = (key: MeasurementKey, raw: string) => {
    if (scanLocked) return;
    const num = raw === "" ? undefined : Number(raw);
    update("measurements", { ...config.measurements, [key]: num });
  };

  const outOfRange = (key: MeasurementKey): boolean => {
    const v = config.measurements[key];
    if (v === undefined || Number.isNaN(v)) return false;
    const r = MEASUREMENT_RANGES[key];
    return v < r.min || v > r.max;
  };

  const launchScan = (id?: string | null, token?: string | null) => {
    const sid = id ?? config.scanSessionId;
    const tok = token ?? config.scanSessionToken;
    const qs = sid && tok ? `?s=${encodeURIComponent(sid)}&t=${encodeURIComponent(tok)}` : "";
    window.open(`/en/fit${qs}`, "_blank", "noopener,noreferrer");
  };

  // Poll scan-session-get until completed → autofill measurements + lock
  useEffect(() => {
    if (config.measurementMethod !== "scan") return;
    if (!config.scanSessionId || !config.scanSessionToken) return;
    if (config.scanCompletedAt) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-session-get?id=${encodeURIComponent(
          config.scanSessionId!,
        )}&token=${encodeURIComponent(config.scanSessionToken!)}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" },
        });
        if (!res.ok) return;
        const json = await res.json();
        const s = json?.session;
        if (cancelled || !s) return;
        if (s.status === "completed" && (s.face_width_mm || s.nose_width_mm)) {
          const next: typeof config.measurements = { ...config.measurements };
          const face = clampFaceMm(s.face_width_mm);
          const nose = clampNoseMm(s.nose_width_mm);
          if (face != null) next.faceWidth = face;
          if (nose != null) next.bridge = nose;
          update("measurements", next);
          update("scanCompletedAt", new Date(s.updated_at ?? Date.now()).toISOString());
          update("scanMeasurementsUnlocked", false);
        }
      } catch {
        /* silent — keep polling */
      }
    };
    poll();
    const iv = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.measurementMethod, config.scanSessionId, config.scanSessionToken, config.scanCompletedAt]);

  const startScanSession = async (email: string, phone: string) => {
    setCreatingSession(true);
    setScanError(null);
    try {
      const { data, error } = await supabase.functions.invoke("scan-session-create", {
        body: { email },
      });
      if (error || !data?.id || !data?.token) {
        throw new Error(error?.message ?? "session_failed");
      }
      // Fire-and-forget: ensure the email also lands in MailerLite
      supabase.functions
        .invoke("mailerlite-subscribe", {
          body: { email, source: "bespoke_scan_handoff", models: "Bespoke" },
        })
        .catch((err) => console.warn("[mailerlite] bespoke handoff failed", err));
      update("measurementMethod", "scan");
      update("scanContactEmail", email);
      update("scanContactPhone", phone || null);
      update("consentTimestamp", new Date().toISOString());
      update("scanRequestedAt", new Date().toISOString());
      update("scanSessionId", data.id);
      update("scanSessionToken", data.token);
      update("scanCompletedAt", null);
      update("scanMeasurementsUnlocked", false);
      setShowScanModal(false);
      launchScan(data.id, data.token);
    } catch (e) {
      setScanError("Couldn't start a secure scan session. Please try again.");
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 5</div>
        <h2 className={sectionTitle}>Measure your fit</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Bespoke depends on accuracy. Pick one method — every measurement is reviewed by our optician before production starts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${cardOuter} ${config.measurementMethod === "scan" ? cardActive : ""} p-5`}>
          <div className={labelClass}>Method A · recommended</div>
          <h3 className="font-display text-cream text-xl font-light mt-1">AI face scan</h3>
          <p className="text-cream-dim text-sm leading-relaxed mt-2 mb-4">
            Your phone camera captures face and bridge width automatically. Results stream back into this configurator the moment the scan completes — no typing required. ~90 seconds.
          </p>
          <button
            onClick={() => setShowScanModal(true)}
            className="px-5 py-2.5 rounded-full bg-gold text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition"
          >
            {config.measurementMethod === "scan" ? "Update contact / re-scan" : "Start AI scan"}
          </button>
        </div>

        <div className={`${cardOuter} ${config.measurementMethod === "tape" ? cardActive : ""} p-5`}>
          <div className={labelClass}>Method B</div>
          <h3 className="font-display text-cream text-xl font-light mt-1">Tape measure</h3>
          <p className="text-cream-dim text-sm leading-relaxed mt-2 mb-4">
            Enter values yourself using our mailed measuring kit or any millimetre ruler. Best if you already know your PD.
          </p>
          <button
            onClick={() => update("measurementMethod", "tape")}
            className="px-5 py-2.5 rounded-full border border-cream/25 text-cream text-xs uppercase tracking-[0.18em] hover:border-cream/50 transition"
          >
            {config.measurementMethod === "tape" ? "Entering values below" : "Enter manually"}
          </button>
        </div>
      </div>

      {/* Scan: waiting state */}
      {config.measurementMethod === "scan" && !config.scanCompletedAt && (
        <div className="rounded-[14px] border border-gold/25 bg-gold/[0.04] p-5 space-y-3">
          <div className={labelClass}>
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
              </span>
              Waiting for scan…
            </span>
          </div>
          <p className="text-cream text-sm">
            Results will be sent to <span className="text-gold-light">{config.scanContactEmail}</span>
            {config.scanContactPhone && <> · {config.scanContactPhone}</>}.
          </p>
          <p className="text-cream-dim text-xs leading-relaxed">
            Open the scan on your phone. The moment it completes, your millimetre measurements appear here automatically and lock to prevent accidental edits.
          </p>
          <div className="flex gap-3 flex-wrap pt-1">
            <button
              onClick={() => launchScan()}
              className="px-4 py-2 rounded-full border border-gold/50 text-gold-light text-[0.78rem] uppercase tracking-[0.18em] hover:bg-gold/10 transition"
            >
              Re-open scan on this device
            </button>
            <button
              onClick={() => update("measurementMethod", "tape")}
              className="px-4 py-2 rounded-full border border-cream/15 text-cream-dim text-[0.78rem] uppercase tracking-[0.18em] hover:border-cream/30 transition"
            >
              Switch to tape measure
            </button>
          </div>
        </div>
      )}

      {/* Scan: completed state — locked autofilled values */}
      {config.measurementMethod === "scan" && config.scanCompletedAt && (
        <div className="rounded-[14px] border border-gold/40 bg-gold/[0.05] p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className={labelClass}>
                <span className="inline-flex items-center gap-1.5 text-gold-light">
                  <Check size={12} /> Scan received
                </span>
              </div>
              <p className="text-cream text-sm mt-1">
                Auto-filled from your face scan. Values are locked until you confirm or unlock to edit.
              </p>
            </div>
            <button
              onClick={() => update("scanMeasurementsUnlocked", !config.scanMeasurementsUnlocked)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream/20 text-cream-dim text-[0.78rem] uppercase tracking-[0.16em] hover:text-cream hover:border-cream/40 transition"
            >
              {config.scanMeasurementsUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
              {config.scanMeasurementsUnlocked ? "Lock values" : "Unlock to edit"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(MEASUREMENT_RANGES) as MeasurementKey[]).map((k) => {
              const range = MEASUREMENT_RANGES[k];
              const bad = outOfRange(k);
              const fromScan = (k === "faceWidth" || k === "bridge") && config.measurements[k] !== undefined;
              return (
                <label key={k} className="block">
                  <span className="text-cream text-xs flex items-center gap-1.5">
                    {range.label}
                    {fromScan && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/15 text-gold-light text-[0.78rem] uppercase tracking-[0.14em]">
                        <Check size={9} /> scan
                      </span>
                    )}
                  </span>
                  <div className="mt-1.5 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      disabled={scanLocked}
                      value={config.measurements[k] ?? ""}
                      onChange={(e) => handleTapeChange(k, e.target.value)}
                      placeholder={`${range.min}–${range.max}`}
                      className={`w-full px-4 py-2.5 rounded-[10px] border text-sm focus:outline-none focus:ring-1 transition pr-12 ${
                        scanLocked
                          ? "bg-cream/[0.03] border-cream/10 text-cream-dim cursor-not-allowed"
                          : bad
                          ? "bg-background border-[hsl(0_60%_55%)] text-cream focus:ring-[hsl(0_60%_55%)]"
                          : "bg-background border-cream/15 text-cream focus:border-gold focus:ring-gold/40"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-dim text-xs flex items-center gap-1">
                      mm {scanLocked && <Lock size={10} />}
                    </span>
                  </div>
                  {bad && !scanLocked && (
                    <span className="text-[hsl(0_60%_60%)] text-[0.78rem] mt-1 block">
                      Outside plausible range ({range.min}–{range.max} mm). Please re-measure.
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-cream/10">
            <button
              onClick={() => {
                update("scanCompletedAt", null);
                update("scanMeasurementsUnlocked", false);
                launchScan();
              }}
              className="px-4 py-2 rounded-full border border-cream/20 text-cream-dim text-[0.78rem] uppercase tracking-[0.18em] hover:border-cream/40 hover:text-cream transition"
            >
              Re-scan
            </button>
            <p className="text-cream-dim text-[0.78rem] self-center">
              Our optician verifies every value before production begins.
            </p>
          </div>
        </div>
      )}

      {config.measurementMethod === "tape" && (
        <div className="rounded-[14px] border border-cream/10 bg-background/40 p-5">
          <div className={labelClass}>Measurements (mm)</div>

          {(storedScan || quizPrior) && (
            <div className="mt-4 rounded-[10px] border border-gold/30 bg-gold/[0.04] p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-cream text-xs font-medium flex items-center gap-1.5">
                  <Check size={12} className="text-gold-light shrink-0" />
                  {storedScan ? "We found your last AI fit scan" : "We found your fit quiz answers"}
                </div>
                <div className="text-cream-dim text-[0.72rem] leading-relaxed mt-1">
                  {storedScan ? (
                    <>
                      Face <span className="text-cream">{storedScan.faceWidthMm} mm</span>
                      {" · "}Nose <span className="text-cream">{storedScan.noseWidthMm} mm</span>
                      {" · "}Confidence <span className="text-cream">{storedScan.confidence}</span>. Values stay editable after import.
                    </>
                  ) : (
                    <>
                      Estimated face width{" "}
                      <span className="text-cream">
                        {quizPrior?.currentFrameMm ?? quizPrior?.faceEstimateMm} mm
                      </span>
                      . Less accurate than a scan — adjust after import.
                    </>
                  )}
                </div>
                {importedFrom && (
                  <div className="text-gold-light text-[0.78rem] mt-1.5 inline-flex items-center gap-1">
                    <Check size={10} /> Imported from your {importedFrom === "scan" ? "scan" : "quiz"} — edit any value below.
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {storedScan && (
                  <button
                    type="button"
                    onClick={importFromScan}
                    className="px-3.5 py-2 rounded-full bg-gold text-background text-[0.78rem] uppercase tracking-[0.16em] font-medium hover:bg-gold-light transition"
                  >
                    Use scan values
                  </button>
                )}
                {!storedScan && quizPrior && (
                  <button
                    type="button"
                    onClick={importFromQuiz}
                    className="px-3.5 py-2 rounded-full border border-gold/50 text-gold-light text-[0.78rem] uppercase tracking-[0.16em] hover:bg-gold/10 transition"
                  >
                    Use quiz estimate
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {(Object.keys(MEASUREMENT_RANGES) as MeasurementKey[]).map((k) => {
              const range = MEASUREMENT_RANGES[k];
              const bad = outOfRange(k);
              return (

                <label key={k} className="block">
                  <span className="text-cream text-xs">{range.label}{k === "pd" && <span className="text-gold-light"> *</span>}</span>
                  <div className="mt-1.5 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={config.measurements[k] ?? ""}
                      onChange={(e) => handleTapeChange(k, e.target.value)}
                      placeholder={`${range.min}–${range.max}`}
                      className={`w-full px-4 py-2.5 rounded-[10px] bg-background border text-cream text-sm focus:outline-none focus:ring-1 transition pr-12 ${
                        bad ? "border-[hsl(0_60%_55%)] focus:ring-[hsl(0_60%_55%)]" : "border-cream/15 focus:border-gold focus:ring-gold/40"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-dim text-xs">mm</span>
                  </div>
                  {bad && (
                    <span className="text-[hsl(0_60%_60%)] text-[0.78rem] mt-1 block">
                      Outside plausible range ({range.min}–{range.max} mm). Please re-measure.
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="text-cream-dim text-[0.78rem] mt-4">
            All values stored as <code className="text-cream">needs_verification</code> until reviewed by our optician.
          </p>
        </div>
      )}

      {showScanModal && (
        <ScanContactModal
          initialEmail={config.scanContactEmail ?? ""}
          initialPhone={config.scanContactPhone ?? ""}
          submitting={creatingSession}
          error={scanError}
          onCancel={() => { setShowScanModal(false); setScanError(null); }}
          onConfirm={(email, phone) => startScanSession(email, phone)}
        />
      )}
    </div>
  );

}


/* ───── Step 4 ───── */
const SVG_W = 400;
const SVG_H = 90;
const TEMPLE = { x: 10, y: 25, w: 380, h: 40 };

function EngravingPreview({
  text,
  fontId,
  position,
  offset,
  onOffsetChange,
}: {
  text: string;
  fontId: string | null;
  position?: string;
  offset: { x: number; y: number };
  onOffsetChange: (next: { x: number; y: number }) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const display = (text || "Your text").slice(0, ENGRAVING_MAX_CHARS);
  const empty = !text;
  const fontFamily =
    fontId === "serif"  ? "'Cormorant Garamond', serif" :
    fontId === "script" ? "'Cormorant Garamond', cursive" :
    fontId === "mono"   ? "ui-monospace, SFMono-Regular, monospace" :
                          "Barlow, sans-serif";
  const fontStyle = fontId === "script" ? "italic" : "normal";

  // Convert client px delta to SVG units (viewBox-aware)
  const pxToSvg = (dxClient: number, dyClient: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { dx: 0, dy: 0 };
    return { dx: (dxClient / rect.width) * SVG_W, dy: (dyClient / rect.height) * SVG_H };
  };

  const clamp = (x: number, y: number) => {
    const padX = 30;
    const padY = 8;
    const maxX = TEMPLE.w / 2 - padX;
    const maxY = TEMPLE.h / 2 - padY;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const onPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const { dx, dy } = pxToSvg(e.clientX - d.startX, e.clientY - d.startY);
    onOffsetChange(clamp(d.baseX + dx, d.baseY + dy));
  };
  const onPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const cx = 200 + offset.x;
  const cy = 45 + offset.y;

  return (
    <div className="rounded-[14px] border border-cream/10 bg-background/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <div className={labelClass}>Live preview · drag to position</div>
        <div className="flex items-center gap-2">
          {position && <div className="text-cream-dim text-[0.78rem] uppercase tracking-[0.16em]">{position}</div>}
          {(offset.x !== 0 || offset.y !== 0) && (
            <button
              type="button"
              onClick={() => onOffsetChange({ x: 0, y: 0 })}
              className="text-gold-light/90 hover:text-gold-light text-[0.78rem] uppercase tracking-[0.16em] underline-offset-4 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="rounded-[10px] bg-gradient-to-br from-[#1a1814] to-[#0e0d0a] p-4 sm:p-6 flex items-center justify-center overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full max-w-md h-auto touch-none"
          aria-label={`Engraving preview: ${display}. Drag to reposition.`}
        >
          <defs>
            <linearGradient id="acetate" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2a2520" />
              <stop offset="50%" stopColor="#16130f" />
              <stop offset="100%" stopColor="#0a0907" />
            </linearGradient>
            <linearGradient id="engrave" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8c6f28" stopOpacity="0.85" />
            </linearGradient>
            <clipPath id="templeClip">
              <rect x={TEMPLE.x} y={TEMPLE.y} width={TEMPLE.w} height={TEMPLE.h} rx="20" />
            </clipPath>
          </defs>
          <rect x={TEMPLE.x} y={TEMPLE.y} width={TEMPLE.w} height={TEMPLE.h} rx="20" fill="url(#acetate)" stroke="#3a342c" strokeWidth="0.5" />
          <rect x="14" y="29" width="372" height="6" rx="3" fill="#ffffff" opacity="0.04" />
          <g
            clipPath="url(#templeClip)"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
          >
            {/* Larger transparent hit area for easy touch dragging */}
            <rect x={TEMPLE.x} y={TEMPLE.y} width={TEMPLE.w} height={TEMPLE.h} fill="transparent" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={empty ? "#6b6258" : "url(#engrave)"}
              style={{ fontFamily, fontStyle, fontSize: 18, letterSpacing: "0.06em", pointerEvents: "none" }}
              opacity={empty ? 0.5 : 1}
            >
              {display}
            </text>
            {dragging && (
              <>
                <line x1={cx} y1={TEMPLE.y + 2} x2={cx} y2={TEMPLE.y + TEMPLE.h - 2} stroke="#c9a84c" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
                <line x1={TEMPLE.x + 2} y1={cy} x2={TEMPLE.x + TEMPLE.w - 2} y2={cy} stroke="#c9a84c" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
              </>
            )}
          </g>
        </svg>
      </div>
      <p className="text-cream-dim/70 text-[0.78rem] mt-2 text-center">
        Indicative · final depth and kerning set by the laser operator.
      </p>
    </div>
  );
}




export function StepEngraving({ config, update }: StepProps) {
  const remaining = ENGRAVING_MAX_CHARS - config.engravingText.length;
  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 4</div>
        <h2 className={sectionTitle}>Laser engraving <span className="text-cream-dim text-base ml-2">+ {formatEur(ENGRAVING_FEE_EUR)} · optional</span></h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Permanent and non-returnable. Adds 2–3 days to production.
        </p>
      </header>

      <div className="flex gap-3">
        <button
          onClick={() => update("engravingEnabled", false)}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
            !config.engravingEnabled
              ? "border-gold text-gold-light bg-gold/10"
              : "border-cream/15 text-cream-dim hover:border-cream/30"
          }`}
        >
          No engraving
        </button>
        <button
          onClick={() => update("engravingEnabled", true)}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
            config.engravingEnabled
              ? "border-gold text-gold-light bg-gold/10"
              : "border-cream/15 text-cream-dim hover:border-cream/30"
          }`}
        >
          Add engraving
        </button>
      </div>

      {config.engravingEnabled && (
        <div className="space-y-6">
          {/* Live SVG preview on temple */}
          <EngravingPreview
            text={config.engravingText}
            fontId={config.engravingFontId}
            position={ENGRAVING_POSITIONS.find((p) => p.id === config.engravingPositionId)?.name}
            offset={config.engravingOffset}
            onOffsetChange={(next) => update("engravingOffset", next)}
          />

          <div>
            <div className={labelClass}>Text · max {ENGRAVING_MAX_CHARS} characters</div>
            <input
              type="text"
              value={config.engravingText}
              onChange={(e) => update("engravingText", e.target.value.slice(0, ENGRAVING_MAX_CHARS))}
              maxLength={ENGRAVING_MAX_CHARS}
              placeholder="Your initials, a date, a word…"
              className="mt-2 w-full px-4 py-3 rounded-[10px] bg-background border border-cream/15 text-cream text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
            />
            <div className="text-cream-dim text-[0.78rem] mt-1.5">{remaining} characters left</div>
          </div>

          <div>
            <div className={labelClass}>Position</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ENGRAVING_POSITIONS.map((p) => {
                const active = config.engravingPositionId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => update("engravingPositionId", p.id)}
                    className={`px-3 py-2.5 rounded-[10px] text-xs border transition ${
                      active
                        ? "border-gold text-gold-light bg-gold/10"
                        : "border-cream/15 text-cream-dim hover:border-cream/30"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className={labelClass}>Font</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ENGRAVING_FONTS.map((f) => {
                const active = config.engravingFontId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => update("engravingFontId", f.id)}
                    className={`px-3 py-3 rounded-[10px] text-base border transition ${
                      active
                        ? "border-gold text-gold-light bg-gold/10"
                        : "border-cream/15 text-cream-dim hover:border-cream/30"
                    }`}
                    style={{
                      fontFamily:
                        f.id === "serif" ? "'Cormorant Garamond', serif" :
                        f.id === "script" ? "'Cormorant Garamond', cursive" :
                        f.id === "mono" ? "ui-monospace, monospace" : "Barlow, sans-serif",
                      fontStyle: f.id === "script" ? "italic" : "normal",
                    }}
                  >
                    {config.engravingText || "Aa"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Step 5 ───── */
export function StepLenses({ config, update }: StepProps) {
  const needsRx = ["single-vision", "progressive"].includes(config.lensTypeId ?? "");
  return (
    <div className="space-y-10">
      <header>
        <div className={sectionKicker}>Step 5</div>
        <h2 className={sectionTitle}>Lenses & prescription</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Choose plano if you already have lenses cut at your optician.
        </p>
      </header>

      <div>
        <div className={labelClass}>Lens type</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LENS_TYPES.map((l) => {
            const active = config.lensTypeId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => update("lensTypeId", l.id)}
                className={`${cardOuter} ${active ? cardActive : "hover:border-cream/25"} text-left p-4`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-cream text-sm">{l.name}</span>
                  <span className="text-gold-light text-xs">
                    {l.priceEur === 0 ? "Included" : `+ ${formatEur(l.priceEur)}`}
                  </span>
                </div>
                <div className="text-cream-dim text-[0.72rem] mt-1">{l.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {config.lensTypeId !== "plano" && (
        <>
          <div>
            <div className={labelClass}>Material</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LENS_MATERIALS.map((m) => {
                const active = config.lensMaterialId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => update("lensMaterialId", m.id)}
                    className={`px-3 py-2.5 rounded-[10px] text-xs border transition ${
                      active
                        ? "border-gold text-gold-light bg-gold/10"
                        : "border-cream/15 text-cream-dim hover:border-cream/30"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            {!config.lensMaterialId && (
              <p className="text-cream-dim/70 text-[0.78rem] mt-2">Pick a material to unlock coatings.</p>
            )}
          </div>

          {config.lensMaterialId && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className={labelClass}>Coating</div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LENS_COATINGS.map((c) => {
                  const active = config.lensCoatingId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => update("lensCoatingId", c.id)}
                      className={`px-3 py-2.5 rounded-[10px] text-xs border transition ${
                        active
                          ? "border-gold text-gold-light bg-gold/10"
                          : "border-cream/15 text-cream-dim hover:border-cream/30"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {needsRx && (
        <div className="rounded-[14px] border border-cream/10 bg-background/40 p-5">
          <div className={labelClass}>Prescription</div>
          <label className="mt-3 flex items-center gap-3 px-4 py-3 rounded-[10px] border border-dashed border-cream/20 text-cream-dim text-sm hover:border-cream/40 transition cursor-pointer">
            <Upload size={16} />
            <span>{config.prescriptionFileName ?? "Upload PDF or photo of your Rx"}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) update("prescriptionFileName", f.name);
              }}
            />
          </label>
          {config.lensTypeId === "progressive" && (
            <p className="text-[0.78rem] text-gold-light/90 mt-3">
              Progressive lenses are flagged for an additional optician review before production.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ───── Step 6 ───── */
export function StepReview({
  config,
  onSave,
  saved,
}: {
  config: BespokeConfig;
  onSave: () => void;
  saved: boolean;
}) {
  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-cream/10">
      <div className="text-cream-dim text-xs uppercase tracking-[0.16em]">{label}</div>
      <div className="text-cream text-sm text-right">{value || <span className="text-cream-dim/60">—</span>}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 6</div>
        <h2 className={sectionTitle}>Review your build</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Once saved, our atelier verifies your measurements before production. Lead time: 3–4 weeks, hand-made in Greece.
        </p>
      </header>

      {frame && (
        <div className="rounded-[14px] border border-cream/10 overflow-hidden bg-background/40">
          <div className="aspect-[16/9] bg-cream/[0.03] flex items-center justify-center">
            <img src={frame.url} alt={frame.name} className="max-h-full max-w-[60%] object-contain" />
          </div>
          <div className="p-5">
            <div className="font-display text-cream text-2xl font-light">{frame.name}</div>
            <div className="text-cream-dim text-xs uppercase tracking-[0.16em] mt-1">{frame.id} · {frame.shape}</div>
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-cream/10 bg-background/40 px-5">
        <Row label="Frame" value={frame ? `${frame.name} (${frame.id})` : null} />
        <Row label="Front colour" value={front ? <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: front.hex }} /> {front.name}</span> : null} />
        <Row label="Temple colour" value={temple ? <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: temple.hex }} /> {temple.name}</span> : null} />
        <Row label="Finish" value={finish?.name} />
        <Row label="Measurement method" value={config.measurementMethod === "scan" ? "AI face scan" : config.measurementMethod === "tape" ? "Tape measure" : null} />
        <Row label="PD" value={config.measurements.pd ? `${config.measurements.pd} mm` : null} />
        <Row label="Engraving" value={config.engravingEnabled ? `"${config.engravingText}" · ${ENGRAVING_POSITIONS.find((p) => p.id === config.engravingPositionId)?.name ?? ""}` : "None"} />
        <Row label="Lenses" value={lens?.name} />
        {config.lensTypeId !== "plano" && (
          <>
            <Row label="Material" value={LENS_MATERIALS.find((m) => m.id === config.lensMaterialId)?.name} />
            <Row label="Coating" value={LENS_COATINGS.find((c) => c.id === config.lensCoatingId)?.name} />
          </>
        )}
        {config.prescriptionFileName && <Row label="Prescription" value={config.prescriptionFileName} />}
      </div>

      <button
        onClick={onSave}
        disabled={saved}
        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold text-background text-xs uppercase tracking-[0.22em] font-medium hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {saved ? "Build saved ✓" : "Save my build"}
      </button>
      {saved && (
        <p className="text-cream-dim text-xs">
          Saved to this device. <Link to="/en/account/sign-in" className="text-gold-light underline">Sign in</Link> to sync across devices and book a measurement review with the atelier.
        </p>
      )}
    </div>
  );
}

/* ───── Shared nav ───── */
export function StepNav({
  step,
  total,
  onBack,
  onNext,
  canNext,
  isLast,
}: {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mt-12 pt-6 border-t border-cream/10">
      <button
        onClick={onBack}
        disabled={step === 1}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cream/20 text-cream-dim text-xs uppercase tracking-[0.18em] hover:border-cream/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={14} /> Back
      </button>
      <div className="text-cream-dim text-[0.78rem] uppercase tracking-[0.2em]">
        {step} / {total}
      </div>
      {!isLast && (
        <button
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
