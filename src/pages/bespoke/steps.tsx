import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Lock, Unlock, Upload } from "lucide-react";

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
import { FRAMES, findFrame } from "@/data/frames";
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

/* ───── Step 1 · Pattern ───── */

export function StepFrame({ config, update }: StepProps) {
  return (
    <div className="space-y-10">
      <header>
        <div className="cfg-eyebrow">Step 1 — Pattern</div>
        <h2 className="cfg-h1 mt-3">
          Choose your frame <em className="cfg-em">silhouette</em>
        </h2>
        <p className="cfg-body mt-4 max-w-xl">
          Four canonical shapes, drawn as line templates because the finished frame is cut to <em className="cfg-em">your</em> measurements —
          not to a stock photo. We scan your face after payment, then hand-cut the pattern in Italy from a single block of Mazzucchelli acetate.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {FRAMES.map((f) => {
          const active = config.frameId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => update("frameId", f.id)}
              className={`cfg-card group text-left ${active ? "cfg-card--active" : ""}`}
            >
              <div
                className="cfg-card__photo relative"
                style={{ background: "#EFE9DF", aspectRatio: "16 / 9" }}
              >
                <img
                  src={f.url}
                  alt={`Woolet Bespoke ${f.name} pattern — ${f.shape} silhouette for wide faces (${f.widthMm} mm reference)`}
                  loading="lazy"
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {active && (
                  <span
                    className="absolute top-2.5 right-2.5 inline-flex items-center justify-center w-6 h-6 bg-[color:var(--cfg-gold)]"
                    style={{ borderRadius: 2 }}
                  >
                    <Check size={14} className="text-[color:var(--cfg-ink)]" strokeWidth={2.5} />
                  </span>
                )}
              </div>

              <div className="px-4 py-4">
                <div className="cfg-card__name" style={{ fontSize: 17 }}>{f.name}</div>
                <div className="cfg-card__code mt-1">Cut to your face · reference {f.widthMm} mm</div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-cream-dim text-xs leading-relaxed max-w-xl" style={{ fontStyle: "italic" }}>
        These outlines represent the shape only. Final dimensions — front width, bridge, temple length, lens height — are all cut to your scan after payment.
      </p>
    </div>
  );
}




/* ───── Step 2 · Acetate ───── */
function ColorSwatchGrid({
  selected,
  onSelect,
  thicknessMm,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  /** When set, only swatches with matching `thicknessMm` are shown. Falls back to full list if none are marked. */
  thicknessMm?: 4 | 6;
}) {
  const filtered = thicknessMm ? COLORS.filter((c) => c.thicknessMm === thicknessMm) : COLORS;
  const list = filtered.length > 0 ? filtered : COLORS;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {list.map((c) => {
        const active = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            title={c.name}
            className={`group relative overflow-hidden border text-left transition ${
              active
                ? "border-gold ring-2 ring-gold/40"
                : "border-cream/10 hover:border-cream/30"
            }`}
            style={{ borderRadius: 2 }}
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
              <img
                src={c.image}
                alt={`Italian acetate — ${c.name}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {active && (
                <span
                  className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 bg-[color:var(--cfg-gold)]"
                  style={{ borderRadius: 2 }}
                >
                  <Check size={11} className="text-[color:var(--cfg-ink)]" strokeWidth={2.5} />
                </span>
              )}
            </div>
            <div className="px-3 py-2.5 bg-[#0c0c0c]/60">
              <div className="text-cream text-[12px] truncate">{c.name}</div>
              {c.note && (
                <div className="text-cream-dim text-[10px] italic truncate">{c.note}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Persist the last few AI renders per selection so the user can revisit
// previous variations without re-spending AI credits. Keyed by configuration
// hash → array of { url, ts }. Kept small (max 4 per key, 12 keys total).
export const PREVIEW_HISTORY_KEY = "woolet:bespoke:aiPreviews:v1";
export const PREVIEW_UPDATED_EVENT = "woolet:bespoke:aiPreviewUpdated";
const MAX_PER_KEY = 4;
const MAX_KEYS = 12;

export type PreviewEntry = { url: string; ts: number };
export type PreviewHistory = Record<string, PreviewEntry[]>;

export const buildPreviewKey = (
  frameId: string | null | undefined,
  frontId: string | null | undefined,
  templeId: string | null | undefined,
  finishId: string | null | undefined,
) => [frameId, frontId, templeId, finishId].join("|");

export const loadPreviewHistory = (): PreviewHistory => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREVIEW_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PreviewHistory) : {};
  } catch {
    return {};
  }
};

export const getLatestPreviewUrl = (key: string): string | null => {
  const list = loadPreviewHistory()[key];
  return list?.[0]?.url ?? null;
};

type SaveResult =
  | { ok: true; evictedKeys: string[] }
  | { ok: false; error: string; reason: "quota" | "blocked" };

export const savePreviewHistory = (history: PreviewHistory): SaveResult => {
  const evictedKeys: string[] = [];
  try {
    // Trim keys if we exceed the cap (evict oldest configurations first,
    // scored by their newest-entry timestamp so recently-used configs stay).
    const entries = Object.entries(history);
    if (entries.length > MAX_KEYS) {
      entries.sort((a, b) => (b[1][0]?.ts ?? 0) - (a[1][0]?.ts ?? 0));
      const kept = entries.slice(0, MAX_KEYS);
      const dropped = entries.slice(MAX_KEYS);
      evictedKeys.push(...dropped.map(([k]) => k));
      history = Object.fromEntries(kept);
    }
    localStorage.setItem(PREVIEW_HISTORY_KEY, JSON.stringify(history));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PREVIEW_UPDATED_EVENT));
    }
    return { ok: true, evictedKeys };
  } catch (e) {
    const isQuota = (e as Error)?.name === "QuotaExceededError";
    return {
      ok: false,
      reason: isQuota ? "quota" : "blocked",
      error: isQuota
        ? `Device storage is full — this preview couldn't be saved locally. To make room we drop the oldest configuration first (cap: ${MAX_KEYS}), then the oldest of its ${MAX_PER_KEY} renders. Sign in to keep an unlimited history in your account.`
        : `Local storage is disabled on this device (private browsing?). Nothing is remembered here — sign in to save previews to your account.`,
    };
  }
};

function AiPreviewPanel({ config }: { config: BespokeConfig }) {
  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);

  // Recompute a stable key so a new selection invalidates the previous render.
  const selectionKey = [frame?.id, front?.id, temple?.id, finish?.id].join("|");
  const [history, setHistory] = useState<PreviewHistory>(() => loadPreviewHistory());
  const currentList = history[selectionKey] ?? [];
  const [activeUrl, setActiveUrl] = useState<string | null>(currentList[0]?.url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [cloudSaveState, setCloudSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const ready = Boolean(frame && front && temple && finish);

  // When selection changes, jump to the newest stored preview for that config
  // (or clear the canvas if we have never rendered this exact combo).
  useEffect(() => {
    const list = history[selectionKey] ?? [];
    setActiveUrl(list[0]?.url ?? null);
    setError(null);
    setCloudSaveState("idle");
  }, [selectionKey, history]);

  if (!ready || !frame || !front || !temple || !finish) {
    return (
      <div className="border border-cream/10 p-6 text-cream-dim text-xs leading-relaxed" style={{ borderRadius: 2 }}>
        Pick a shape, front acetate, temple acetate and finish — we&rsquo;ll then generate an
        AI visualisation of how your pair will look before you commit.
      </div>
    );
  }

  const persist = (next: PreviewHistory, opts?: { droppedOldRenderTs?: number | null }) => {
    setHistory(next);
    const res = savePreviewHistory(next);
    if (res.ok === false) {
      setStorageWarning(res.error);
      return;
    }
    const notes: string[] = [];
    if (opts?.droppedOldRenderTs) {
      const d = new Date(opts.droppedOldRenderTs);
      notes.push(
        `Kept the latest ${MAX_PER_KEY} renders for this configuration — the oldest one (from ${d.toLocaleString()}) was removed to make room.`,
      );
    }
    if (res.evictedKeys.length) {
      notes.push(
        `Reached the ${MAX_KEYS}-configuration limit — the ${res.evictedKeys.length} least-recently used configuration${res.evictedKeys.length > 1 ? "s were" : " was"} removed from this device.`,
      );
    }
    setStorageWarning(notes.length ? notes.join(" ") : null);
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setCloudSaveState("idle");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-preview-render", {
        body: {
          shape: frame.shape,
          frontColor: `${front.name} (${front.code})`,
          templeColor: `${temple.name} (${temple.code})`,
          finish: finish.name,
        },
      });
      if (fnErr) throw fnErr;
      const url = (data as { imageUrl?: string })?.imageUrl;
      if (!url) throw new Error("No preview returned");

      const prev = history[selectionKey] ?? [];
      const combined = [{ url, ts: Date.now() }, ...prev.filter((e) => e.url !== url)];
      const nextList = combined.slice(0, MAX_PER_KEY);
      const droppedOldRenderTs = combined.length > MAX_PER_KEY ? combined[combined.length - 1].ts : null;
      persist({ ...history, [selectionKey]: nextList }, { droppedOldRenderTs });
      setActiveUrl(url);

      // If the buyer is signed in, mirror the render to their account so it
      // shows up on the /account panel later. Non-blocking — surface the
      // outcome as a small hint but never break the on-page preview.
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData?.user?.id;
        if (uid) {
          setCloudSaveState("saving");
          const description = `${frame.shape} · Front: ${front.name} (${front.code}) · Temples: ${temple.name} (${temple.code}) · ${finish.name}`;
          const { error: insertErr } = await supabase.from("bespoke_ai_previews").insert({
            user_id: uid,
            selection_key: selectionKey,
            image_url: url,
            shape: frame.shape,
            front_color: `${front.name} (${front.code})`,
            temple_color: `${temple.name} (${temple.code})`,
            finish: finish.name,
            description,
          });
          if (insertErr) throw insertErr;
          setCloudSaveState("saved");
        }
      } catch (saveErr) {
        console.warn("[bespoke] preview account save failed", saveErr);
        setCloudSaveState("error");
      }
    } catch (e) {
      setError((e as Error).message || "Preview failed. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const removeEntry = (url: string) => {
    setDeletingUrl(url);
    try {
      const prev = history[selectionKey] ?? [];
      const nextList = prev.filter((e) => e.url !== url);
      const nextHistory = { ...history };
      if (nextList.length) nextHistory[selectionKey] = nextList;
      else delete nextHistory[selectionKey];
      persist(nextHistory);
      if (activeUrl === url) setActiveUrl(nextList[0]?.url ?? null);
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="border border-gold/25 bg-[#0c0c0c]/40 p-5 sm:p-6" style={{ borderRadius: 2 }}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <div className={sectionKicker}>AI preview</div>
          <div className="font-display text-cream text-lg leading-tight mt-1">
            See your <em className="italic text-gold-light">{frame.shape}</em> before you build
          </div>
        </div>
        {activeUrl && !loading && (
          <button
            onClick={generate}
            className="text-[11px] uppercase tracking-[0.18em] text-gold-light hover:text-gold underline underline-offset-4"
          >
            Regenerate
          </button>
        )}
      </div>

      <p className="text-cream-dim text-xs leading-relaxed mb-4">
        Front: <span className="text-cream">{front.name}</span> · Temples:{" "}
        <span className="text-cream">{temple.name}</span> · Finish:{" "}
        <span className="text-cream">{finish.name}</span>
      </p>

      <div
        className="relative w-full overflow-hidden bg-[#EFE9DF] flex items-center justify-center"
        style={{ aspectRatio: "4 / 3", borderRadius: 2 }}
      >
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={`AI preview of ${frame.shape} in ${front.name} / ${temple.name}, ${finish.name}`}
            className="w-full h-full object-cover"
          />
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 text-[color:var(--cfg-ink)]/70">
            <div className="h-8 w-8 border-2 border-[color:var(--cfg-ink)]/30 border-t-[color:var(--cfg-ink)] rounded-full animate-spin" />
            <div className="text-[11px] uppercase tracking-[0.2em]">Rendering your pair…</div>
          </div>
        ) : (
          <div className="text-[color:var(--cfg-ink)]/50 text-xs uppercase tracking-[0.2em]">
            Preview will appear here
          </div>
        )}
      </div>

      {currentList.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cream-dim">
              Saved renders · {currentList.length}/{MAX_PER_KEY}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {currentList.map((entry) => {
              const isActive = entry.url === activeUrl;
              return (
                <div key={entry.url} className="relative group">
                  <button
                    onClick={() => setActiveUrl(entry.url)}
                    className={`block w-full aspect-[4/3] overflow-hidden border transition ${
                      isActive
                        ? "border-gold ring-2 ring-gold/40"
                        : "border-cream/10 hover:border-cream/40"
                    }`}
                    style={{ borderRadius: 2 }}
                    title={new Date(entry.ts).toLocaleString()}
                  >
                    <img
                      src={entry.url}
                      alt={`Saved AI render of ${frame.name} bespoke eyewear in ${front.name} acetate with ${temple.name} temples — Woolet made-to-measure`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <button
                    onClick={() => removeEntry(entry.url)}
                    disabled={deletingUrl === entry.url}
                    aria-label="Delete render"
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[color:var(--cfg-ink)]/70 text-cream text-[11px] leading-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition disabled:opacity-100 disabled:cursor-wait"
                    style={{ borderRadius: 2 }}
                  >
                    {deletingUrl === entry.url ? "…" : "×"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!activeUrl && (
        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 w-full inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors disabled:opacity-50"
          style={{
            background: "hsl(var(--gold))",
            color: "hsl(var(--background))",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "16px 24px",
            borderRadius: 2,
          }}
        >
          {loading ? "Generating…" : "Generate AI preview"}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] text-red-400/90">
          {error}{" "}
          <button
            type="button"
            onClick={generate}
            className="underline underline-offset-2 hover:text-red-300"
          >
            Try again
          </button>
        </p>
      )}

      {storageWarning && (
        <p className="mt-2 text-[11px] text-amber-300/80">{storageWarning}</p>
      )}

      {cloudSaveState === "saving" && (
        <p className="mt-2 text-[11px] text-cream-dim/80">Saving to your account…</p>
      )}
      {cloudSaveState === "saved" && (
        <p className="mt-2 text-[11px] text-cream-dim/80">Saved to your account.</p>
      )}
      {cloudSaveState === "error" && (
        <p className="mt-2 text-[11px] text-amber-300/80">
          Preview is ready, but we couldn&rsquo;t save it to your account. It stays on this device — regenerate to retry the sync.
        </p>
      )}

      <p className="mt-3 text-[10px] text-cream-dim/70 leading-relaxed">
        Illustrative render only — the final hand-crafted pair may vary in acetate grain and highlights.
        This device keeps up to {MAX_PER_KEY} renders per configuration across a maximum of {MAX_KEYS} configurations.
        When the limit is reached the oldest render in the current configuration is removed first, then the least-recently used configuration.
        Sign in to keep an unlimited history in your account.
      </p>
    </div>
  );
}

export function StepColor({ config, update }: StepProps) {
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  return (
    <div className="space-y-10">
      <header>
        <div className={sectionKicker}>Step 2 — Acetate</div>
        <h2 className={sectionTitle}>Compose your <em className="italic text-gold-light">Italian</em> acetate</h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          Each swatch is a live macro photograph of the actual sheet we hold in stock — cut and finished by our European atelier.
        </p>
      </header>

      <div>
        <div className={labelClass}>Front acetate</div>
        <div className="mt-3"><ColorSwatchGrid selected={config.frontColorId} onSelect={(id) => update("frontColorId", id)} /></div>
        {front && (
          <div className="text-cream text-xs mt-2">{front.name}</div>
        )}
      </div>

      <div>
        <div className={labelClass}>Temple acetate <span className="text-cream-dim/70 font-normal normal-case tracking-normal">— 4 mm sheets only</span></div>
        <div className="mt-3"><ColorSwatchGrid selected={config.templeColorId} onSelect={(id) => update("templeColorId", id)} thicknessMm={4} /></div>
        {temple && (
          <div className="text-cream text-xs mt-2">{temple.name}</div>
        )}
      </div>

      <div>
        <div className={labelClass}>Finish</div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {FINISHES.map((f) => {
            const active = config.finishId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => update("finishId", f.id)}
                className={`group relative overflow-hidden border text-left transition ${
                  active
                    ? "border-gold ring-2 ring-gold/40"
                    : "border-cream/10 hover:border-cream/30"
                }`}
                style={{ borderRadius: 2 }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={f.image}
                    alt={`${f.name} acetate finish sample for Woolet Bespoke made-to-measure eyewear`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-3 py-2.5 bg-[#0c0c0c]/40">
                  <div className={`text-[11px] uppercase tracking-[0.16em] ${active ? "text-gold-light" : "text-cream"}`}>
                    {f.name}
                  </div>
                </div>
                {active && (
                  <span
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 bg-[color:var(--cfg-gold)]"
                    style={{ borderRadius: 2 }}
                  >
                    <Check size={11} className="text-[color:var(--cfg-ink)]" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AiPreviewPanel config={config} />
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
        Indicative · CNC-engraved by our European atelier. Left temple only — right temple carries the Woolet logo.
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
        <h2 className={sectionTitle}>Write your name on the frame <span className="text-cream-dim text-base ml-2">+ {formatEur(ENGRAVING_FEE_EUR)} · optional</span></h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          CNC-engraved on the inner left temple by our European atelier. Permanent and non-returnable. Adds 2–3 days to production. The right temple always carries the Woolet logo.
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
          onClick={() => {
            update("engravingEnabled", true);
            if (!config.engravingPositionId) update("engravingPositionId", "inner-left");
          }}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
            config.engravingEnabled
              ? "border-gold text-gold-light bg-gold/10"
              : "border-cream/15 text-cream-dim hover:border-cream/30"
          }`}
        >
          Write my name
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
            <div className={labelClass}>Your name · max {ENGRAVING_MAX_CHARS} characters</div>
            <input
              type="text"
              value={config.engravingText}
              onChange={(e) => update("engravingText", e.target.value.slice(0, ENGRAVING_MAX_CHARS))}
              maxLength={ENGRAVING_MAX_CHARS}
              placeholder="Your name, initials or a date…"
              className="mt-2 w-full px-4 py-3 rounded-[10px] bg-background border border-cream/15 text-cream text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
            />
            <div className="text-cream-dim text-[0.78rem] mt-1.5">{remaining} characters left</div>
          </div>

          <div className="rounded-[10px] border border-cream/10 bg-cream/[0.02] px-4 py-3 text-[0.78rem] text-cream-dim">
            Position: inner left temple (fixed). The right temple always carries the Woolet logo.
          </div>

          <div>
            <div className={labelClass}>Font</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
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
                    style={{ fontFamily: f.cssFamily }}
                  >
                    <div className="text-[0.7rem] uppercase tracking-[0.18em] text-cream-dim mb-1">{f.name}</div>
                    <div className="text-lg text-cream">{config.engravingText || "Your name"}</div>
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
          Every frame ships with lenses cut and fitted — plano (no correction) starts at €20, same as sun lenses. Choose plano if you plan to send the frame to your own optician for prescription lenses.
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
                className={`${cardOuter} ${active ? cardActive : "hover:border-cream/25"} text-left p-3 flex gap-3 items-center`}
              >
                <div
                  className="relative w-16 h-16 shrink-0 overflow-hidden bg-cream/[0.03] border border-cream/10"
                  style={{ borderRadius: 2 }}
                >
                  <img
                    src={l.image}
                    alt={`${l.name} lens option for Woolet Bespoke wide-face eyewear — ${l.description}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-cream text-sm truncate">{l.name}</span>
                    <span className="text-gold-light text-xs shrink-0">
                      {l.priceEur === 0 ? "Included" : `+ ${formatEur(l.priceEur)}`}
                    </span>
                  </div>
                  <div className="text-cream-dim text-[0.72rem] mt-1">{l.description}</div>
                </div>
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

  const engravingEur = config.engravingEnabled ? ENGRAVING_FEE_EUR : 0;
  const lensEur = lens?.priceEur ?? 0;
  const total = (frame?.basePriceEur ?? 0) + engravingEur + lensEur;

  const navigate = useNavigate();

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-cream/10">
      <div className="text-cream-dim text-xs uppercase tracking-[0.16em]">{label}</div>
      <div className="text-cream text-sm text-right">{value || <span className="text-cream-dim/60">—</span>}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <div className={sectionKicker}>Step 5 — Review &amp; pay</div>
        <h2 className={sectionTitle}>Confirm your <em className="italic text-gold-light">pattern</em></h2>
        <p className="text-cream-dim mt-2 max-w-xl text-sm leading-relaxed">
          You are paying for the pattern, acetate and lens configuration you selected. The made-to-measure fit scan is booked <em className="italic text-gold-light">after</em> payment — no measurements are taken until we have your order confirmed.
        </p>
      </header>

      {frame && (
        <div className="rounded-[14px] border border-cream/10 overflow-hidden bg-background/40">
          <div className="aspect-[16/9] flex items-center justify-center" style={{ background: "#EFE9DF" }}>
            <img src={frame.url} alt={`Woolet Bespoke ${frame.name} — ${frame.shape} pattern for wide faces, made-to-measure in Italy`} className="max-h-full max-w-[60%] object-contain" />
          </div>
          <div className="p-5">
            <div className="font-display text-cream text-2xl font-light">{frame.name}</div>
            <div className="text-cream-dim text-xs uppercase tracking-[0.16em] mt-1">Pattern · {frame.shape}</div>
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-cream/10 bg-background/40 px-5">
        <Row label="Pattern" value={frame ? `${frame.name}` : null} />
        <Row label="Front acetate" value={front ? <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: front.hex }} /> {front.name}</span> : null} />
        <Row label="Temple acetate" value={temple ? <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-cream/20" style={{ background: temple.hex }} /> {temple.name}</span> : null} />
        <Row label="Finish" value={finish?.name} />
        <Row label="Engraving" value={config.engravingEnabled ? `"${config.engravingText}" · ${ENGRAVING_POSITIONS.find((p) => p.id === config.engravingPositionId)?.name ?? ""}` : "None"} />
        <Row label="Lenses" value={lens?.name} />
        {config.lensTypeId !== "plano" && (
          <>
            <Row label="Material" value={LENS_MATERIALS.find((m) => m.id === config.lensMaterialId)?.name} />
            <Row label="Coating" value={LENS_COATINGS.find((c) => c.id === config.lensCoatingId)?.name} />
          </>
        )}
        <Row label="Shipping" value={<span className="text-gold-light">Free · worldwide</span>} />
        <div className="flex items-baseline justify-between gap-4 py-4">
          <div className="text-cream text-xs uppercase tracking-[0.2em]">Total due today</div>
          <div className="text-cream text-lg font-display">{formatEur(total)}</div>
        </div>
      </div>

      {/* What happens after payment */}
      <div
        style={{
          border: "1px solid rgba(194,160,90,0.35)",
          background: "linear-gradient(180deg, rgba(194,160,90,0.06), rgba(194,160,90,0.01))",
          padding: "20px 22px",
          borderRadius: 2,
        }}
      >
        <div className="cfg-eyebrow" style={{ color: "#C2A05A" }}>What happens after payment</div>
        <ol className="mt-4 space-y-3 text-cream text-sm">
          <li><span className="font-mono text-gold-light text-[11px] mr-3">01</span> Your order is confirmed and paid.</li>
          <li><span className="font-mono text-gold-light text-[11px] mr-3">02</span> We email you a private link to the AI fit scan (or book a studio appointment).</li>
          <li><span className="font-mono text-gold-light text-[11px] mr-3">03</span> Our optician verifies your measurements within 24&nbsp;h.</li>
          <li><span className="font-mono text-gold-light text-[11px] mr-3">04</span> The pattern is cut in Italy to your exact millimetres — 3–4 weeks to ship, <em className="italic text-gold-light not-italic">free worldwide</em>.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => {
            onSave();
            navigate("/en/bespoke/checkout");
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold text-background text-xs uppercase tracking-[0.22em] font-medium hover:bg-gold-light transition"
        >
          Pay {formatEur(total)} — secure your pattern
        </button>
        <span className="text-cream-dim text-[0.78rem] uppercase tracking-[0.18em]">
          Free worldwide shipping · Stripe secure checkout
        </span>
      </div>
      {saved && (
        <p className="text-cream-dim text-xs">
          Saved to this device — your build travels with you into the checkout page.
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
