import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
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

interface StepProps {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
}

const sectionTitle = "font-display text-cream text-2xl sm:text-3xl font-light";
const sectionKicker = "uppercase tracking-[0.22em] text-[0.62rem] text-gold-light/80 mb-2";
const labelClass = "uppercase tracking-[0.18em] text-[0.62rem] text-cream-dim";

const cardOuter = "rounded-[14px] border border-cream/10 bg-background/40 transition-all";
const cardActive = "border-gold/60 bg-gold/[0.04] ring-1 ring-gold/30";

/* ───── Step 1 ───── */
export function StepFrame({ config, update }: StepProps) {
  const [shapeFilter, setShapeFilter] = useState<string>("all");
  const visible: Frame[] = shapeFilter === "all" ? FRAMES : FRAMES.filter((f) => f.shape === shapeFilter);
  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 1</div>
        <h2 className={sectionTitle}>Choose your frame silhouette</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          25 hand-made bio-acetate shapes. Each pair is cut from a single block — your chosen frame will be unique.
        </p>
      </header>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShapeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-wide border transition ${
            shapeFilter === "all"
              ? "border-gold text-gold-light bg-gold/10"
              : "border-cream/15 text-cream-dim hover:border-cream/30"
          }`}
        >
          All shapes
        </button>
        {FRAME_SHAPES.map((s) => (
          <button
            key={s}
            onClick={() => setShapeFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-wide border transition ${
              shapeFilter === s
                ? "border-gold text-gold-light bg-gold/10"
                : "border-cream/15 text-cream-dim hover:border-cream/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((f) => {
          const active = config.frameId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => update("frameId", f.id)}
              className={`${cardOuter} ${active ? cardActive : "hover:border-cream/25"} text-left overflow-hidden group`}
            >
              <div className="aspect-[4/3] bg-cream/[0.03] flex items-center justify-center overflow-hidden">
                <img
                  src={f.url}
                  alt={f.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-cream text-base leading-tight truncate">{f.name}</div>
                  <div className="text-[0.62rem] uppercase tracking-[0.18em] text-cream-dim mt-0.5">
                    {f.id} · {f.shape}
                  </div>
                </div>
                {active && <Check className="text-gold-light shrink-0" size={16} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
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
function ConsentModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-[14px] border border-gold/30 bg-background p-6 sm:p-8">
        <div className={sectionKicker}>Biometric data consent</div>
        <h3 className="font-display text-cream text-2xl font-light mb-4">Before we open your camera</h3>
        <ul className="text-cream-dim text-sm leading-relaxed space-y-2 mb-6 list-disc list-inside">
          <li>We capture facial landmarks (pupillary distance, bridge, temple width).</li>
          <li>Used <em>only</em> to manufacture your bespoke frame.</li>
          <li>Stored encrypted in the EU. Raw scans auto-deleted after measurements are confirmed (max 30 days).</li>
          <li>You can delete scan data at any time from your account.</li>
        </ul>
        <p className="text-cream-dim text-xs mb-6">By proceeding you consent to processing of biometric data under GDPR Art. 9(2)(a). You may decline and use the tape measure path instead.</p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <button onClick={onAccept} className="flex-1 px-6 py-3 rounded-full bg-gold text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition">
            I consent — start scan
          </button>
          <button onClick={onDecline} className="flex-1 px-6 py-3 rounded-full border border-cream/20 text-cream-dim text-xs uppercase tracking-[0.18em] hover:border-cream/40 transition">
            Decline — use tape
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepMeasure({ config, update }: StepProps) {
  const [showConsent, setShowConsent] = useState(false);

  const handleTapeChange = (key: MeasurementKey, raw: string) => {
    const num = raw === "" ? undefined : Number(raw);
    update("measurements", { ...config.measurements, [key]: num });
  };

  const outOfRange = (key: MeasurementKey): boolean => {
    const v = config.measurements[key];
    if (v === undefined || Number.isNaN(v)) return false;
    const r = MEASUREMENT_RANGES[key];
    return v < r.min || v > r.max;
  };

  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 3</div>
        <h2 className={sectionTitle}>Measure your fit</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Bespoke depends on accuracy. Pick either method — measurements are reviewed by a human before production starts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`${cardOuter} ${config.measurementMethod === "scan" ? cardActive : ""} p-5`}
        >
          <div className={labelClass}>Method A</div>
          <h3 className="font-display text-cream text-xl font-light mt-1">AI face scan</h3>
          <p className="text-cream-dim text-sm leading-relaxed mt-2 mb-4">
            Uses your phone camera + our existing fit scan. Captures PD automatically. ~90 seconds.
          </p>
          <button
            onClick={() => setShowConsent(true)}
            className="px-5 py-2.5 rounded-full bg-gold text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-gold-light transition"
          >
            {config.measurementMethod === "scan" ? "Re-scan" : "Start AI scan"}
          </button>
        </div>

        <div
          className={`${cardOuter} ${config.measurementMethod === "tape" ? cardActive : ""} p-5`}
        >
          <div className={labelClass}>Method B</div>
          <h3 className="font-display text-cream text-xl font-light mt-1">Tape measure</h3>
          <p className="text-cream-dim text-sm leading-relaxed mt-2 mb-4">
            Manual entry from our mailed measuring kit or your own ruler. All values in millimetres.
          </p>
          <button
            onClick={() => update("measurementMethod", "tape")}
            className="px-5 py-2.5 rounded-full border border-cream/25 text-cream text-xs uppercase tracking-[0.18em] hover:border-cream/50 transition"
          >
            {config.measurementMethod === "tape" ? "Editing tape values" : "Use tape measure"}
          </button>
        </div>
      </div>

      {(config.measurementMethod === "tape" || config.measurementMethod === "scan") && (
        <div className="rounded-[14px] border border-cream/10 bg-background/40 p-5">
          <div className={labelClass}>Measurements (mm)</div>
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
                    <span className="text-[hsl(0_60%_60%)] text-[0.7rem] mt-1 block">
                      Outside plausible range ({range.min}–{range.max} mm). Please re-measure.
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="text-cream-dim text-[0.7rem] mt-4">
            All values stored as <code className="text-cream">needs_verification</code> until reviewed by our optician.
          </p>
        </div>
      )}

      {showConsent && (
        <ConsentModal
          onAccept={() => {
            update("measurementMethod", "scan");
            update("consentTimestamp", new Date().toISOString());
            setShowConsent(false);
            // Hand off to existing fit scan; results flow back via a future integration.
            window.open("/en/fit", "_blank", "noopener,noreferrer");
          }}
          onDecline={() => {
            update("measurementMethod", "tape");
            setShowConsent(false);
          }}
        />
      )}
    </div>
  );
}

/* ───── Step 4 ───── */
function EngravingPreview({ text, fontId, position }: { text: string; fontId: string | null; position?: string }) {
  const display = (text || "Your text").slice(0, ENGRAVING_MAX_CHARS);
  const fontFamily =
    fontId === "serif"  ? "'Cormorant Garamond', serif" :
    fontId === "script" ? "'Cormorant Garamond', cursive" :
    fontId === "mono"   ? "ui-monospace, SFMono-Regular, monospace" :
                          "Barlow, sans-serif";
  const fontStyle = fontId === "script" ? "italic" : "normal";
  const empty = !text;
  return (
    <div className="rounded-[14px] border border-cream/10 bg-background/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className={labelClass}>Live preview</div>
        {position && <div className="text-cream-dim text-[0.62rem] uppercase tracking-[0.16em]">{position}</div>}
      </div>
      <div className="rounded-[10px] bg-gradient-to-br from-[#1a1814] to-[#0e0d0a] p-4 sm:p-6 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 400 90" className="w-full max-w-md h-auto" aria-label={`Engraving preview: ${display}`}>
          {/* Temple shape */}
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
          </defs>
          <rect x="10" y="25" width="380" height="40" rx="20" fill="url(#acetate)" stroke="#3a342c" strokeWidth="0.5" />
          {/* Highlight */}
          <rect x="14" y="29" width="372" height="6" rx="3" fill="#ffffff" opacity="0.04" />
          <text
            x="200"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={empty ? "#6b6258" : "url(#engrave)"}
            style={{ fontFamily, fontStyle, fontSize: 18, letterSpacing: "0.06em" }}
            opacity={empty ? 0.5 : 1}
          >
            {display}
          </text>
        </svg>
      </div>
      <p className="text-cream-dim/70 text-[0.66rem] mt-2 text-center">Indicative · final depth and kerning set by the laser operator.</p>
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
            <div className="text-cream-dim text-[0.7rem] mt-1.5">{remaining} characters left</div>
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
              <p className="text-cream-dim/70 text-[0.68rem] mt-2">Pick a material to unlock coatings.</p>
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
            <p className="text-[0.7rem] text-gold-light/90 mt-3">
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
      <div className="text-cream-dim text-[0.68rem] uppercase tracking-[0.2em]">
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
