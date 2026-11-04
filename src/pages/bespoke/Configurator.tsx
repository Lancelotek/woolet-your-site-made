import { useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Cloud, CloudOff, Loader2, Maximize2, Ruler, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { oaiqBespokeViewed } from "@/lib/openai-pixel";
import { COLORS, FINISHES, LENS_TYPES, RETIRED_COLOR_FALLBACK_ID as DEFAULT_ACETATE_ID, formatTempleLength, resolveActiveColorId } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import { STEPS, hasEngraving, formatEur, formatAddOn, formatLensWithStrength, isStepComplete, lensTintCode, selectedLensTint, useBespokeConfig, type BespokeConfig, type StepId } from "@/lib/bespoke-state";
import { clarityEvent, claritySet } from "@/lib/clarity";
import { trackMetaEventOnce } from "@/lib/meta-capi";
import { pushGtmEvent } from "@/lib/gtm";
import { useBespokeCloudSync } from "@/lib/bespoke-cloud-sync";
import {
  StepColor,
  StepEngraving,
  StepFrame,
  StepLenses,
  StepNav,
  StepReview,
  StepTempleLength,
  buildPreviewKey,
  getLatestPreviewUrl,
  PREVIEW_UPDATED_EVENT,
  lookupCachedRender,
  rememberRender,
  renderRequestBody,
} from "./steps";
import { supabase } from "@/integrations/supabase/client";
import { getSessionRef } from "@/lib/scan-session-ref";
import { PREVIEW_FINISH_ID, PREVIEW_TEMPLE_ID, loadFrontRenders, type FrontRenderMap } from "@/lib/bespoke-front-renders";
import { loadPatternRenders, type PatternRender } from "@/lib/bespoke-pattern-renders";
import { renderAltForConfig } from "@/lib/bespoke-render-alt";
import {
  CfgInfoProvider,
  CfgInfoTrigger,
  CfgNavProvider,
  PreviewLightbox,
  pushCfg,
  trackBespokeFunnel,
  useRenderBudget,
} from "./cfg-shell";
import { useParams, useNavigate } from "react-router-dom";
import { loadNotoSansKr } from "@/lib/noto-sans-kr";
import FramedRender from "@/components/bespoke/FramedRender";


// Google Fonts: Newsreader + Archivo. Loaded once on mount — scoped to this page only.
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Archivo:wght@400;500;600;700&display=swap";

const useConfiguratorFonts = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;
    // Engraving preview offers a Malgun Gothic equivalent (Noto Sans KR).
    loadNotoSansKr();
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
  const { lang: routeLang } = useParams<{ lang?: string }>();
  const [step, setStep] = useState<StepId>(() => {
    if (typeof window === "undefined") return 1;
    const raw = new URLSearchParams(window.location.search).get("step");
    if (!raw || !/^\d+$/.test(raw)) return 1;
    const n = Number(raw);
    return (n >= 1 && n <= STEPS.length ? n : 1) as StepId;
  });
  const [saved, setSaved] = useState(false);
  const [fitOpen, setFitOpen] = useState(false);
  const [patternRenders, setPatternRenders] = useState<Record<string, PatternRender>>({});
  useEffect(() => { oaiqBespokeViewed(); }, []);
  useEffect(() => {
    let cancelled = false;
    void loadPatternRenders().then((renders) => { if (!cancelled) setPatternRenders(renders); });
    return () => { cancelled = true; };
  }, []);
  // A step only earns a tick once the buyer has actually been there — steps 4–6
  // carry defaults, so completeness alone would show false progress.
  const [visited, setVisited] = useState<number[]>([step]);
  // Selections carried in the URL (QR hand-off / deep links). Parsed once so the
  // phone keeps the build shown on the desktop even after the cloud config loads.
  const urlOverrides = useMemo<Partial<BespokeConfig>>(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const next: Partial<BespokeConfig> = {};
    const shape = params.get("shape");
    if (shape && findFrame(shape)) next.frameId = shape;
    const frontId = resolveActiveColorId(params.get("front"));
    if (frontId) next.frontColorId = frontId;
    const templeId = resolveActiveColorId(params.get("temple"));
    if (templeId) next.templeColorId = templeId;
    const finishParam = params.get("finish");
    if (finishParam && FINISHES.some((f) => f.id === finishParam)) next.finishId = finishParam;
    const tl = Number(params.get("tl"));
    if (Number.isFinite(tl) && tl > 0) next.templeLengthMm = tl;
    return next;
  }, []);
  const { status, isSignedIn, lastSavedAt } = useBespokeCloudSync({ config, setConfig: replace, overrides: urlOverrides });
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Inside the configurator the floating chat bubble (Tawk.to) covers the
  // swatch grid on phones - suppress it for the lifetime of this page.
  useEffect(() => {
    document.body.classList.add("cfg-hide-chat");
    return () => document.body.classList.remove("cfg-hide-chat");
  }, []);

  // Deep link from the collection cards: /en/bespoke/configurator?shape=aviator
  // and from the QR hand-off, which also carries the acetates, finish and
  // temple length so the phone shows the build chosen on the desktop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shape = params.get("shape");
    if (shape && findFrame(shape)) update("frameId", shape);
    const front = resolveActiveColorId(params.get("front"));
    if (front) update("frontColorId", front);
    const temple = resolveActiveColorId(params.get("temple"));
    if (temple) update("templeColorId", temple);
    const finishId = params.get("finish");
    if (finishId && FINISHES.some((f) => f.id === finishId)) update("finishId", finishId);
    const tl = Number(params.get("tl"));
    if (Number.isFinite(tl) && tl > 0) update("templeLengthMm", tl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const lens = LENS_TYPES.find((l) => l.id === config.lensTypeId);

  // One shared total for rail, mobile bar and review: always the full sum of
  // every current selection, whichever step is open.
  const stepTotal = pricing.totalEur;

  // Fit numbers — from scan if present, else brand reference defaults.
  const faceMm = config.measurements.faceWidth ?? 161;
  const bridgeMm = config.measurements.bridge ?? 22;
  const pdMm = config.measurements.pd ?? 66;
  const fitFromScan = !!config.scanCompletedAt;

  // ── Live render ──
  // The picture follows the build: a front colour shows instantly (pre-generated
  // front with Deep matte black temples, matte), and once the buyer picks a temple
  // colour or finish the full combination is looked up and, when missing, rendered
  // automatically. The same picture stays on screen through every later step.
  const [frontRenders, setFrontRenders] = useState<FrontRenderMap>({});
  useEffect(() => {
    let cancelled = false;
    void loadFrontRenders().then((m) => { if (!cancelled) setFrontRenders(m); });
    return () => { cancelled = true; };
  }, []);
  const frontOnlyUrl = config.frameId && config.frontColorId
    ? frontRenders[config.frameId]?.[config.frontColorId]?.public_url ?? null
    : null;
  const renderConfig: BespokeConfig = {
    ...config,
    templeColorId: config.templeColorId ?? PREVIEW_TEMPLE_ID,
    finishId: config.finishId ?? PREVIEW_FINISH_ID,
  };
  const baseKey = buildPreviewKey(renderConfig.frameId, renderConfig.frontColorId, renderConfig.templeColorId, renderConfig.finishId);
  const lensKey = buildPreviewKey(renderConfig.frameId, renderConfig.frontColorId, renderConfig.templeColorId, renderConfig.finishId, config.lensTypeId, lensTintCode(config));
  const previewKey = `${lensKey}::${baseKey}`;
  const resolvePreview = () => getLatestPreviewUrl(lensKey) ?? getLatestPreviewUrl(baseKey);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(resolvePreview);
  const [rendering, setRendering] = useState(false);
  const [renderNote, setRenderNote] = useState<string | null>(null);
  const sessionRef = useMemo(() => (typeof window === "undefined" ? "" : getSessionRef()), []);
  const budget = useRenderBudget(sessionRef);
  const budgetRef = useRef(budget);
  budgetRef.current = budget;
  const currentKey = useRef(previewKey);
  currentKey.current = previewKey;

  useEffect(() => {
    const refresh = () => setAiPreviewUrl(resolvePreview());
    window.addEventListener(PREVIEW_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PREVIEW_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  useEffect(() => {
    setRenderNote(null);
    setRendering(false);
    if (!config.frameId || !config.frontColorId) { setAiPreviewUrl(null); return; }
    const local = resolvePreview();
    setAiPreviewUrl(local);
    if (local) return;
    const key = previewKey;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      if (config.lensTypeId && config.lensTypeId !== "plano" && config.lensTypeId !== "none") {
        const lensHit = await lookupCachedRender(renderConfig, true);
        if (cancelled) return;
        if (lensHit) { rememberRender(lensKey, lensHit.imageUrl); setAiPreviewUrl(lensHit.imageUrl); trackBespokeFunnel("bespoke_preview_shown", { status: "cached" }); return; }
      }
      const preset = frontRenders[config.frameId!]?.[config.frontColorId!]?.public_url;
      if (preset && baseKey === buildPreviewKey(config.frameId, config.frontColorId, PREVIEW_TEMPLE_ID, PREVIEW_FINISH_ID)) {
        rememberRender(baseKey, preset);
        setAiPreviewUrl(preset);
        return;
      }
      const baseHit = await lookupCachedRender(renderConfig, false);
      if (cancelled) return;
      if (baseHit) { rememberRender(baseKey, baseHit.imageUrl); setAiPreviewUrl(baseHit.imageUrl); trackBespokeFunnel("bespoke_preview_shown", { status: "cached" }); return; }
      // Not rendered yet: generate it now - no button, no extra step.
      if (budgetRef.current.remaining <= 0) {
        setRenderNote("Render limit for this visit reached - your colours are listed below the picture.");
        return;
      }
      const body = renderRequestBody(renderConfig, false);
      if (!body) return;
      budgetRef.current.consume();
      setRendering(true);
      pushCfg("cfg_auto_render", { step });
      try {
        const { data, error } = await supabase.functions.invoke("bespoke-preview-render", { body });
        if (error) throw error;
        const url = (data as { imageUrl?: string })?.imageUrl;
        if (!url) throw new Error("No preview returned");
        if ((data as { cached?: boolean })?.cached) budgetRef.current.refund();
        rememberRender(baseKey, url);
        trackBespokeFunnel("bespoke_preview_shown", { status: (data as { cached?: boolean })?.cached ? "cached" : "generated" });
        if (currentKey.current === key) setAiPreviewUrl(url);
      } catch (e) {
        budgetRef.current.refund();
        trackBespokeFunnel("bespoke_preview_shown", { status: "failed" });
        pushCfg("cfg_render_failed", { reason: String((e as Error)?.message ?? "unknown").slice(0, 80) });
        if (currentKey.current === key) setRenderNote("The render did not load this time - your colours are listed below the picture.");
      } finally {
        if (currentKey.current === key) setRendering(false);
      }
    }, frontOnlyUrl ? 150 : 600);
    return () => { cancelled = true; window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, frontRenders]);

  const appPanelRef = useRef<HTMLElement>(null);
  // Desktop app shell fills the viewport under the site-wide Kickstarter bar.
  const scopeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector<HTMLElement>("[data-ks-live-bar]");
      scopeRef.current?.style.setProperty("--cfg-offset", `${bar?.offsetHeight ?? 0}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // A double tap during the step animation must not skip a step.
  const stepChangedAt = useRef(0);
  const goTo = (n: StepId) => {
    stepChangedAt.current = Date.now();
    setStep(n);
    setVisited((prev) => (prev.includes(n) ? prev : [...prev, n]));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    appPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (Date.now() - stepChangedAt.current < 600) return;
    pushCfg("cfg_next_click", { from_step: step });
    goTo(Math.min(STEPS.length, step + 1) as StepId);
  };

  // Step 2 never opens with a dead Next button: empty pickers get the house
  // black sheet and a matte finish (no finish carries a surcharge). Black temples
  // plus matte is exactly the pre-generated front preview, so the picture is
  // instant until the buyer chooses a temple colour. Existing
  // choices from the URL, a restored session or cloud sync are never replaced.
  const [defaulted, setDefaulted] = useState<{ front?: boolean; temple?: boolean; finish?: boolean }>({});
  useEffect(() => {
    if (step !== 2) return;
    const next: { front?: boolean; temple?: boolean; finish?: boolean } = {};
    // Selections arriving in the URL land in the same tick - never overwrite them.
    if (!config.frontColorId && !urlOverrides.frontColorId) { update("frontColorId", DEFAULT_ACETATE_ID); next.front = true; }
    if (!config.templeColorId && !urlOverrides.templeColorId) { update("templeColorId", DEFAULT_ACETATE_ID); next.temple = true; }
    if (!config.finishId && !urlOverrides.finishId) { update("finishId", PREVIEW_FINISH_ID); next.finish = true; }
    if (next.front || next.temple || next.finish) setDefaulted((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const colorUpdate: typeof update = (key, value) => {
    const flag = key === "frontColorId" ? "front" : key === "templeColorId" ? "temple" : key === "finishId" ? "finish" : null;
    if (flag) setDefaulted((prev) => ({ ...prev, [flag]: false }));
    update(key, value);
  };

  // Clarity funnel: tag every step change, and mark the session complete when
  // the buyer reaches the final review step. No personal data is ever sent.
  useEffect(() => {
    const name = STEPS[step - 1]?.shortLabel.toLowerCase() ?? "unknown";
    claritySet("bespoke_step", `${step}-${name}`);
    pushCfg("cfg_step_view", { step });
    trackBespokeFunnel("bespoke_step_view", { step, step_name: name });
    if (step === STEPS.length) clarityEvent("bespoke_configurator_complete");
  }, [step]);

  const [navHint, setNavHint] = useState(false);
  const [payPending, setPayPending] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stepComplete = isStepComplete(step, config);
  const acetateMissing = [
    !config.frontColorId && "front acetate",
    !config.templeColorId && "temple acetate",
    !config.finishId && "finish",
  ].filter(Boolean).join(", ");
  const firstMissing = !config.frontColorId ? "front" : !config.templeColorId ? "temple" : !config.finishId ? "finish" : null;
  const blockedLabel = stepComplete || step === STEPS.length
    ? null
    : step === 1
      ? "Pick a pattern first"
      : step === 2 && firstMissing
        ? `Pick ${firstMissing === "finish" ? "a finish" : `${firstMissing} acetate`} first`
        : null;
  const flash = (el: HTMLElement | null) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("cfg-choicegrid--attention");
    void el.offsetWidth;
    el.classList.add("cfg-choicegrid--attention");
    window.setTimeout(() => el.classList.remove("cfg-choicegrid--attention"), 1300);
  };
  const showPatternMissing = () => {
    setNavHint(true);
    flash(document.querySelector<HTMLElement>("main.cfg-container .cfg-choicegrid"));
  };
  const showMissing = () => {
    setNavHint(true);
    flash(firstMissing ? document.getElementById(`cfg-group-${firstMissing}`) : null);
  };

  // Meta mid funnel: the first time a pattern is actually chosen (step 1 complete),
  // not on page load. One event_id shared by the browser pixel, the Conversions
  // API and the GTM tag that serves the EU consent path.
  useEffect(() => {
    if (!isStepComplete(1, config)) return;
    const chosen = findFrame(config.frameId);
    if (!chosen) return;
    const eventId = trackMetaEventOnce("CustomizeProduct", "customizeproduct:bespoke", {
      custom: {
        content_type: "product",
        content_ids: [chosen.id],
        content_name: `Woolet Bespoke - ${chosen.name}`,
        value: pricing.totalEur,
        currency: "USD",
      },
    });
    if (eventId) {
      pushGtmEvent("bespoke_customize_started", {
        event_id: eventId,
        content_id: chosen.id,
        content_name: `Woolet Bespoke - ${chosen.name}`,
        value: pricing.totalEur,
        currency: "USD",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.frameId]);

  // The preview stage is the most-tapped element on the page. Every state it can
  // be in has to answer the tap: a picture opens larger, an empty stage sends the
  // buyer to the choice that fills it.
  const example = patternRenders[frame?.id ?? "aviator"] ?? frontRenders[frame?.id ?? "aviator"]?.[PREVIEW_TEMPLE_ID];
  const stageSrc = aiPreviewUrl ?? frontOnlyUrl ?? example?.public_url ?? frame?.url ?? null;
  const showsExample = !aiPreviewUrl && !frontOnlyUrl && Boolean(example);
  const renderAlt = renderAltForConfig(config, Boolean(getLatestPreviewUrl(lensKey)) && lensKey !== baseKey);
  const stageAlt = aiPreviewUrl
    ? renderAlt
    : frontOnlyUrl && frame && config.frontColorId
      ? frontRenders[frame.id]?.[config.frontColorId]?.alt_text ?? renderAlt
    : example ? example.alt_text : frame
      ? `Woolet Bespoke ${frame.name} — ${frame.shape} pattern for wide faces`
      : "";
  const lightboxCaption = `${frame ? frame.name : "Your pattern"} · ${front ? front.name : "acetate to choose"} · cut to your face`;

  const handleStageTap = () => {
    if (stageSrc) {
      pushCfg("cfg_preview_open", { step });
      setLightboxOpen(true);
      return;
    }
    goTo(frame ? 2 : 1);
  };

  const handleMobileNext = () => {
    if (step === STEPS.length) return;
    if (!stepComplete) {
      if (step === 1) { showPatternMissing(); return; }
      if (step === 2) { showMissing(); return; }
      const grid = document.querySelector<HTMLElement>(
        "main.cfg-container .cfg-swatchstrip, main.cfg-container .cfg-choicegrid"
      );
      grid?.scrollIntoView({ behavior: "smooth", block: "center" });
      setNavHint(true);
      window.setTimeout(() => setNavHint(false), 3000);
      return;
    }
    goNext();
  };


  const handleSave = () => setSaved(true);
  const handleReset = () => {
    if (typeof window !== "undefined" && !window.confirm("Start a new build? Your current configuration will be cleared.")) return;
    reset();
    setSaved(false);
    setStep(1);
  };

  const StepBody =
    step === 1 ? <StepFrame config={config} update={update} patternRenders={patternRenders} frontRenders={frontRenders} /> :
    step === 2 ? <StepColor config={config} update={colorUpdate} defaults={defaulted} /> :
    step === 3 ? <StepTempleLength config={config} update={update} /> :
    step === 4 ? <StepEngraving config={config} update={update} /> :
    step === 5 ? <StepLenses config={config} update={update} /> :
                 <StepReview config={config} onSave={handleSave} saved={saved} onEdit={(n) => goTo(n as StepId)} />;

  return (
    <CfgInfoProvider>
    <CfgNavProvider value={{ nextLabel: step === STEPS.length ? null : STEPS[step]?.shortLabel ?? null, onNext: goNext }}>
    {lightboxOpen && stageSrc && (
      <PreviewLightbox src={stageSrc} alt={stageAlt} caption={lightboxCaption} onClose={() => setLightboxOpen(false)} />
    )}
    <div ref={scopeRef} className="cfg-scope cfg-app min-h-screen">
      <SEO
        title="Bespoke Configurator - Woolet"
        description="Design your made-to-order bio-acetate eyewear for wide faces and wide bridges. Hand made in EU from Mazzucchelli acetate."
        path="/bespoke/configurator"
      />
      <ConfiguratorStyles />

      <div>


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
        <div className="cfg-container cfg-stepper-wrap">
          <div className="cfg-stepnow lg:hidden">
            Step {step} of {STEPS.length} · <strong>{STEPS[step - 1].label}</strong>
          </div>
          <ol className="cfg-stepper" role="list">
            {STEPS.map((s, i) => {
              const isCurrent = s.id === step;
              const isDone = isStepComplete(s.id, config) && visited.includes(s.id) && s.id !== step;
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

        {/* ── Mobile live preview — follows the build on every step but review ── */}
        {step !== STEPS.length && (
          <div className="cfg-mobilepreview lg:hidden">
             <button
               type="button"
              className="cfg-mobilepreview__stage"
              aria-label={stageSrc ? "Open larger preview" : "Choose a pattern"}
               onClick={stageSrc ? handleStageTap : showPatternMissing}
            >
              {stageSrc ? <FramedRender src={stageSrc} alt={stageAlt} aspect="fill" fill={0.84} maxFillH={0.82} /> : (
                <span className="cfg-mobilepreview__place">Select a pattern</span>
              )}
              {rendering && <span className="cfg-rendering"><Loader2 size={14} className="animate-spin" /> Adding your temples…</span>}
              <span className="cfg-stage__badge" aria-hidden>
                {stageSrc ? <Maximize2 size={13} /> : <Sparkles size={13} />}
              </span>
             </button>
            {showsExample && <p className="text-xs text-cream-dim px-5 mt-2">Example colour - tap a colour to see yours</p>}
            {renderNote && <p className="text-xs text-cream-dim px-5 mt-2" role="status">{renderNote}</p>}
            <div className="cfg-mobilepreview__meta">
              <span>{frame ? frame.name : "No pattern yet"}</span>
              {front && <span className="cfg-mobilepreview__dot" style={{ background: front.hex }} aria-hidden />}
              {temple && <span className="cfg-mobilepreview__dot" style={{ background: temple.hex }} aria-hidden />}
              {finish && <span className="cfg-mobilepreview__finish">{finish.name}</span>}
            </div>
          </div>
        )}


        {/* ── Main: phone = single column; desktop = app (live stage left, options right) ── */}
        <main className="cfg-container cfg-app-main pt-10 pb-32">
          <div className="cfg-app-grid">
            {/* Live stage — the picture travels with the build through every step */}
            <aside className="cfg-app-stage hidden lg:flex" aria-label="Your build">
              <div
                className="cfg-app-stage__img cfg-stage--tappable"
                role="button"
                tabIndex={0}
                aria-label={stageSrc ? "Open larger preview" : "Choose a pattern"}
                onClick={handleStageTap}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStageTap();
                  }
                }}
              >
                {stageSrc ? <FramedRender src={stageSrc} alt={stageAlt} aspect="fill" fill={0.8} maxFillH={0.78} imgClassName="cfg-app-stage__pic" /> : (
                  <div className="cfg-rail__placeholder">Select a pattern</div>
                )}
                {showsExample && <span className="cfg-app-stage__tag">Example colour</span>}
                {rendering && <span className="cfg-rendering"><Loader2 size={14} className="animate-spin" /> Adding your temple colour…</span>}
                <span className="cfg-stage__badge" aria-hidden>
                  {stageSrc ? <Maximize2 size={13} /> : <Sparkles size={13} />}
                </span>
              </div>
              {renderNote && <p className="text-xs text-cream-dim" role="status">{renderNote}</p>}

              <div className="cfg-app-summary">
                <div className="cfg-app-summary__title">
                  <span className="cfg-rail__eyebrow">Your build</span>
                  <span className="cfg-app-summary__name">{frame ? frame.name : "Choose a pattern"}</span>
                </div>
                <dl className="cfg-app-summary__chips">
                  <SpecChip label="Front" value={front ? <><Swatch hex={front.hex} /> {front.name}</> : "—"} onClick={() => goTo(2)} />
                  <SpecChip label="Temples" value={temple ? <><Swatch hex={temple.hex} /> {temple.name}</> : front ? "Black until you choose" : "—"} onClick={() => goTo(2)} />
                  <SpecChip label="Finish" value={finish?.name ?? "—"} onClick={() => goTo(2)} />
                  <SpecChip label="Temple length" value={formatTempleLength(config.templeLengthMm, config.templeLengthIsCustom)} onClick={() => goTo(3)} />
                  <SpecChip label="Engraving" value={hasEngraving(config) ? `“${config.engravingText.trim()}”` : "—"} onClick={() => goTo(4)} />
                  <SpecChip label="Lenses" value={lens ? formatLensWithStrength(lens.name, config) : "—"} onClick={() => goTo(5)} />
                </dl>
                <div className="cfg-app-summary__foot">
                  <CfgInfoTrigger section="fit" className="cfg-info-trigger--block">{frame ? `${frame.widthMm} mm reference · cut to your face` : "Cut to your face"}</CfgInfoTrigger>
                  <button onClick={handleReset} className="cfg-rail__reset">Start over</button>
                </div>
              </div>
            </aside>

            {/* Options panel — scrolls on its own; the action bar never moves */}
            <section className="cfg-app-panel" ref={appPanelRef}>
              <div className="cfg-app-panel__body">
                {StepBody}
              </div>
              <div className="cfg-app-nav hidden lg:block">
                <div className="cfg-app-nav__total">
                  <span className="cfg-eyebrow">Total</span>
                  <CfgInfoTrigger section="price" className="cfg-rail__price cfg-info-trigger--block">{formatEur(stepTotal)}</CfgInfoTrigger>
                  <span className="cfg-app-nav__ship">Free shipping · 2-week build</span>
                </div>
                 <StepNav
                  step={step}
                  total={STEPS.length}
                  onBack={() => goTo(Math.max(1, step - 1) as StepId)}
                   onNext={!stepComplete && step === 1 ? showPatternMissing : !stepComplete && step === 2 ? showMissing : goNext}
                  canNext={isStepComplete(step, config)}
                  isLast={step === STEPS.length}
                  blockedLabel={blockedLabel}
                />
                 {step === 1 && !stepComplete && navHint && <p className="text-sm text-gold-light mt-3" role="status">Choose a pattern to continue.</p>}
                 {step === 2 && !stepComplete && <button type="button" onClick={showMissing} className="cfg-acetate-missing block text-left text-sm text-gold-light mt-3 underline decoration-dotted underline-offset-4" role="status">Choose {acetateMissing} to continue.</button>}
              </div>
            </section>
          </div>
        </main>

        {/* ── Mobile sticky CTA ── */}
        <div className="cfg-mobilebar lg:hidden">
          <button
            onClick={() => goTo(Math.max(1, step - 1) as StepId)}
            disabled={step === 1}
            className="cfg-mobilebar__back"
            aria-label="Previous step"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="cfg-mobilebar__meta">
            <div className="cfg-mobilebar__price">
              <CfgInfoTrigger section="price">
                <span className="cfg-mobilebar__pricelabel">Total</span> {formatEur(stepTotal)}
              </CfgInfoTrigger>
            </div>
             {navHint && step === 1 && !stepComplete ? (
               <div className="cfg-mobilebar__note text-gold-light" role="status">Choose a pattern to continue.</div>
             ) : navHint && step !== 2 ? (
              <div className="cfg-mobilebar__note" style={{ color: "#C13A2E" }} role="status">
                Pick an option to continue
              </div>
            ) : step === 2 && !stepComplete ? (
              <button type="button" onClick={showMissing} className="cfg-mobilebar__note text-gold-light text-left underline decoration-dotted underline-offset-2" role="status">Choose {acetateMissing} to continue.</button>
            ) : (
              <div className="cfg-mobilebar__note">2-week build · free shipping</div>
            )}
          </div>
          <button
            onClick={() => {
              if (step === STEPS.length) {
                if (payPending) return;
                setPayPending(true);
                pushCfg("cfg_pay_click");
                trackBespokeFunnel("bespoke_pay_click", { step: STEPS.length });
                handleSave();
                navigate("/en/bespoke/checkout");
                return;
              }
              handleMobileNext();
            }}
             data-incomplete={step !== STEPS.length && !stepComplete ? "true" : undefined}
            aria-disabled={blockedLabel ? "true" : undefined}
            disabled={payPending}
            className="cfg-cta cfg-cta--mobile"
          >
            {step === STEPS.length ? (payPending ? <><Loader2 size={14} className="animate-spin" /> Opening checkout…</> : "Pay now") : blockedLabel ?? `Next · ${STEPS[step]?.shortLabel ?? ""}`}
          </button>
        </div>
      </div>
    </div>
    </CfgNavProvider>
    </CfgInfoProvider>
  );
};

/* ───── Subcomponents ───── */

const Swatch = ({ hex }: { hex: string }) => (
  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: hex, boxShadow: "inset 0 0 0 1px rgba(239,233,223,0.18)" }} />
);

const SpecChip = ({ label, value, onClick }: { label: string; value: React.ReactNode; onClick: () => void }) => (
  <button type="button" className="cfg-app-chip" onClick={onClick}>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </button>
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
            wooletBand={[155, 161]}
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
      <span className="cfg-sync cfg-sync--off">
        <CloudOff size={11} />
        <span>Saved on this device</span>
      </span>
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
    .cfg-scope h2, .cfg-scope header { cursor: default; }
    .cfg-pattern-inset, .cfg-example-colour { position: absolute; background: var(--cfg-cream); color: var(--cfg-ink); padding: 4px; font-size: 10px; text-align: center; }
    .cfg-pattern-inset { bottom: 8px; right: 8px; width: 86px; }
    .cfg-example-colour { top: 8px; left: 8px; }
    .cfg-pattern-inset img { width: 100%; height: 40px; object-fit: contain; }
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
      font-family: 'Cormorant Garamond', serif;
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
    .cfg-scope .cfg-choice--pressed { animation: cfg-choice-tap 400ms ease-out; }
    .cfg-scope .cfg-choicegrid--attention { animation: cfg-choice-tap 650ms ease-out 2; }
    @keyframes cfg-choice-tap {
      50% { box-shadow: 0 0 0 3px var(--cfg-gold); }
    }
    @media (prefers-reduced-motion: reduce) {
      .cfg-scope .cfg-choice--pressed, .cfg-scope .cfg-choicegrid--attention { animation: none; outline: 2px solid var(--cfg-gold); }
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
    .cfg-cta:hover:not(:disabled):not([aria-disabled="true"]) { background: var(--cfg-gold-bright); }
    .cfg-cta:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(1px); }
    .cfg-cta:disabled, .cfg-cta[aria-disabled="true"] {
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
    @media (min-width: 1024px) { .cfg-mobilebar { display: none; } }
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
    .cfg-mobilebar__pricelabel {
      font-family: 'Archivo', sans-serif;
      font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
      color: var(--cfg-muted); margin-right: 4px; vertical-align: 2px;
    }
    .cfg-cta--mobile { width: auto; min-height: 48px; padding: 12px 18px; white-space: nowrap; }
    .cfg-mobilebar__back {
      flex-shrink: 0;
      width: 48px; height: 48px;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid var(--cfg-border-strong);
      background: transparent;
      color: var(--cfg-text);
      border-radius: 2px;
    }
    .cfg-mobilebar__back:disabled { opacity: .3; }
    .cfg-mobilebar__note {
      font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
      color: var(--cfg-muted); margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    @media (max-width: 400px) { .cfg-mobilebar__note { font-size: 9px; letter-spacing: .06em; } }

    /* Pay → Measure notice */
    .cfg-note {
      display: flex; gap: 14px; align-items: flex-start;
      border: 1px solid rgba(194,160,90,0.35);
      background: linear-gradient(180deg, rgba(194,160,90,0.08), rgba(194,160,90,0.02));
      padding: 14px 18px;
      border-radius: 2px;
    }
    .cfg-note__tag {
      font-family: 'Archivo', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: var(--cfg-gold); white-space: nowrap; padding-top: 3px;
    }
    .cfg-note__body { color: var(--cfg-text); font-size: 14px; line-height: 1.55; }
    .cfg-note__more {
      margin-top: 6px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
      color: var(--cfg-gold); background: none; border: 0; padding: 0;
    }

    /* Stepper — honest, single scrollable row on phones */
    .cfg-stepper-wrap { padding-top: 32px; }
    .cfg-stepnow { display: none; }
    @media (max-width: 1023px) {
      .cfg-stepper-wrap { padding-top: 14px; width: 100%; min-width: 0; }
      .cfg-stepnow {
        display: block;
        font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
        color: var(--cfg-muted); margin-bottom: 10px;
      }
      .cfg-stepnow strong { color: var(--cfg-cream); font-weight: 500; }
      .cfg-stepper {
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
        margin-inline: -20px; padding-inline: 20px;
      }
      .cfg-stepper::-webkit-scrollbar { display: none; }
      .cfg-step { flex-shrink: 0; padding: 8px 11px; gap: 7px; }
      .cfg-step__label { display: none; }
      .cfg-step--current .cfg-step__label { display: inline; }
    }

    /* Mobile live preview — sticky under the top bar */
    .cfg-mobilepreview { display: none; }
    @media (max-width: 1023px) {
      .cfg-mobilepreview {
        display: block;
        position: sticky; top: 54px; z-index: 25;
        background: var(--cfg-ink);
        border-bottom: 1px solid var(--cfg-border);
        padding: 5px 20px 5px;
        margin-top: 8px;
        overflow: hidden;
      }
      .cfg-mobilepreview__stage {
        position: relative; width: 100%;
        height: clamp(140px, 42vw, 200px);
        background: var(--cfg-cream);
        border-radius: 2px;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }

      .cfg-mobilepreview__place {
        font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #8F897B;
      }
      .cfg-mobilepreview__meta {
        display: flex; align-items: center; gap: 8px;
        margin-top: 3px; line-height: 15px;
        font-family: 'Newsreader', serif; font-size: 12px; color: var(--cfg-cream);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .cfg-mobilepreview__dot {
        width: 11px; height: 11px; border-radius: 999px; flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(239,233,223,0.22);
      }
      .cfg-mobilepreview__finish {
        font-family: 'Archivo', sans-serif; font-size: 10px;
        letter-spacing: .14em; text-transform: uppercase; color: var(--cfg-muted);
      }

      /* Compact top bar: logo + sync only */
      .cfg-topbar { padding: 12px 0; }
      .cfg-topbar .cfg-divider, .cfg-topbar .cfg-back { display: none; }
      .cfg-mark { width: 28px; height: 28px; }

      /* Bottom bar clears the iPhone gesture area */
      .cfg-mobilebar { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }

      /* Tighter step intro so the first choice sits above the fold */
      .cfg-scope main.cfg-container { padding-top: 14px; }
      .cfg-scope main.cfg-container .space-y-10 > * + * { margin-top: 18px; }
      .cfg-scope main.cfg-container header .cfg-h1 { font-size: 26px; margin-top: 8px; }
      .cfg-scope main.cfg-container header .cfg-body { font-size: 13px; line-height: 1.5; margin-top: 10px; }

      /* Reassurance copy sits below the step content on phones/tablets */
      .cfg-scope > div { display: flex; flex-direction: column; }
      .cfg-scope > div > main.cfg-container { order: 4; }
      .cfg-scope > div > .cfg-notewrap {
        order: 5; margin-top: 0;
        margin-bottom: calc(104px + env(safe-area-inset-bottom));
      }
      .cfg-scope > div > .cfg-mobilebar { order: 6; }
      .cfg-scope main.cfg-container { width: 100%; min-width: 0; padding-bottom: calc(112px + env(safe-area-inset-bottom)); }
      /* Tap targets on choices stay finger-sized */
      .cfg-scope main.cfg-container button { min-height: 44px; }
    }

    /* Acetate swatch preview — larger, readable loupe above the grid */
    .cfg-swatch-preview {
      display: flex; align-items: center; gap: 16px;
      padding: 14px; margin-bottom: 14px;
      background: var(--cfg-panel);
      border: 1px solid var(--cfg-border-strong);
      border-radius: 2px;
    }
    .cfg-swatch-preview img {
      width: 112px; height: 84px; object-fit: cover; flex-shrink: 0;
      border-radius: 2px;
      box-shadow: inset 0 0 0 1px rgba(239,233,223,0.10);
    }
    .cfg-swatch-preview__text { min-width: 0; }
    .cfg-swatch-preview__name {
      font-family: 'Newsreader', serif; font-weight: 500; font-size: 18px;
      color: var(--cfg-cream); line-height: 1.2;
    }
    .cfg-swatch-preview__note {
      font-size: 12px; font-style: italic; color: var(--cfg-muted);
      margin-top: 4px;
    }
    .cfg-swatch-preview__family {
      display: inline-block; margin-top: 8px;
      font-size: 9.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--cfg-gold);
      padding: 3px 7px;
      background: rgba(194,160,90,0.10);
      border: 1px solid rgba(194,160,90,0.35);
      border-radius: 2px;
    }
    @media (max-width: 1023px) {
      .cfg-swatch-preview { display: none; }
    }

    /* Horizontal swatch strips on phones (single DOM, CSS-only switch) */
    @media (max-width: 1023px) {
      .cfg-scope .cfg-swatchstrip {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        margin-inline: -20px;
        padding: 2px 20px 6px;
      }
      .cfg-scope .cfg-swatchstrip::-webkit-scrollbar { display: none; }
      .cfg-scope .cfg-swatchstrip > * {
        flex: 0 0 42%;
        scroll-snap-align: start;
      }
    }

    /* StepNav inherits Tailwind from steps.tsx — give it breathing room */
    .cfg-scope .step-nav, .cfg-scope nav[aria-label="step navigation"] { margin-top: 36px; }

    /* ── Tappable preview stage ── */
    .cfg-mobilepreview__stage, .cfg-stage--tappable { position: relative; cursor: pointer; }
    .cfg-stage__badge {
      position: absolute; right: 6px; bottom: 6px;
      width: 24px; height: 24px; border-radius: 999px;
      display: inline-flex; align-items: center; justify-content: center;
      background: #CAA449; color: #1F1B16;
      box-shadow: 0 1px 4px rgba(8,8,7,0.30);
      pointer-events: none;
    }
    .cfg-mobilepreview--pulse {
      animation: cfg-pulse 150ms ease-out 2;
    }
    @keyframes cfg-pulse {
      from { box-shadow: inset 0 0 0 0 rgba(202,164,73,0); }
      to   { box-shadow: inset 0 0 0 2px #CAA449; }
    }
    @media (prefers-reduced-motion: reduce) { .cfg-mobilepreview--pulse { animation: none; box-shadow: inset 0 0 0 2px #CAA449; } }

    /* ── Info triggers: dotted underline, 44px hit area, no layout shift ── */
    .cfg-info-trigger {
      position: relative;
      display: inline;
      cursor: pointer;
      text-decoration: underline dotted;
      text-decoration-color: #8A6E2C;
      text-underline-offset: 3px;
      text-decoration-thickness: 1.5px;
    }
    .cfg-info-trigger::after {
      content: ""; position: absolute; inset: -6px -8px; display: block;
    }
    /* Stand-alone triggers (own line) get the full 44px target; inline ones
       stay tight so neighbouring triggers never steal each other's taps. */
    .cfg-info-trigger--block::after { inset: -15px -10px; }
    .cfg-info-trigger:hover { text-decoration-color: #CAA449; }
    .cfg-info-trigger:focus-visible { outline: 2px solid #CAA449; outline-offset: 3px; }

    /* ── Bottom sheet (mobile) / centred panel (desktop) ── */
    .cfg-sheet { position: fixed; inset: 0; z-index: 90; display: flex; align-items: flex-end; justify-content: center; }
    .cfg-sheet__scrim { position: absolute; inset: 0; background: rgba(8,8,7,0.82); }
    .cfg-sheet__panel {
      position: relative; width: 100%; max-width: 560px;
      background: #12110F; border: 1px solid rgba(239,233,223,0.12);
      border-radius: 2px 2px 0 0;
      max-height: 84vh; display: flex; flex-direction: column;
      font-family: 'Archivo', sans-serif;
    }
    .cfg-sheet__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-bottom: 1px solid rgba(239,233,223,0.10);
    }
    .cfg-sheet__eyebrow {
      font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #CAA449;
    }
    .cfg-sheet__close {
      width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
      background: none; border: 0; color: #EDE7D9; cursor: pointer; margin: -10px -12px -10px 0;
    }
    .cfg-sheet__body { overflow-y: auto; padding: 4px 18px 26px; scroll-behavior: smooth; }
    .cfg-sheet__body section { padding: 18px 0; border-bottom: 1px solid rgba(239,233,223,0.08); }
    .cfg-sheet__body section:last-child { border-bottom: 0; }
    .cfg-sheet__body h3 {
      font-family: 'Newsreader', serif; font-size: 19px; font-weight: 500; color: #EFE9DF; margin: 0 0 8px;
    }
    .cfg-sheet__body p, .cfg-sheet__body li { color: #B9B1A3; font-size: 14px; line-height: 1.6; margin: 0 0 8px; }
    .cfg-sheet__body ul { margin: 0; padding-left: 18px; }
    .cfg-sheet__body section.is-target h3 { color: #CAA449; }
    .cfg-authform { display: flex; flex-direction: column; gap: 12px; padding-top: 14px; }
    .cfg-authform input {
      background: rgba(239,233,223,0.04); border: 1px solid rgba(239,233,223,0.16);
      color: #EFE9DF; padding: 14px 16px; border-radius: 2px; font-size: 16px;
    }
    .cfg-authform__error { color: #E8A0A0; font-size: 13px; }
    @media (min-width: 768px) {
      .cfg-sheet { align-items: center; }
      .cfg-sheet__panel { border-radius: 2px; max-height: 76vh; }
    }

    /* ── Full-screen preview lightbox ── */
    .cfg-lightbox { position: fixed; inset: 0; z-index: 95; display: flex; align-items: center; justify-content: center; }
    .cfg-lightbox__scrim { position: absolute; inset: 0; background: rgba(8,8,7,0.92); }
    .cfg-lightbox__close {
      position: absolute; top: 8px; right: 8px; z-index: 2;
      width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
      background: rgba(8,8,7,0.6); border: 1px solid rgba(239,233,223,0.18); border-radius: 2px;
      color: #EDE7D9; cursor: pointer;
    }
    .cfg-lightbox__inner {
      position: relative; padding: 16px; width: 100%; max-width: 860px;
      display: flex; flex-direction: column; align-items: center; gap: 14px;
    }
    .cfg-lightbox__img {
      max-width: 100%; max-height: 66vh; object-fit: contain;
      background: #EFE9DF; border-radius: 2px;
    }
    .cfg-lightbox__caption {
      color: #EDE7D9; font-family: 'Archivo', sans-serif; font-size: 13px;
      letter-spacing: .04em; text-align: center;
    }
    .cfg-lightbox__next {
      background: #CAA449; color: #1F1B16; border: 0; border-radius: 999px;
      font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 11px;
      letter-spacing: .2em; text-transform: uppercase;
      padding: 14px 26px; min-height: 44px; cursor: pointer;
    }
    .cfg-lightbox__next:hover { background: #D8B86A; }

    /* ── Pattern cards: colour dots ── */
    .cfg-card--dots:hover { transform: none; }
    .cfg-card--dots > button:hover .cfg-card__photo img { transform: scale(1.03); }
    .cfg-carddots { display: flex; align-items: center; gap: 8px; padding: 12px 16px 16px; }
    .cfg-carddot {
      width: 22px; height: 22px; border-radius: 999px; flex: none;
      background-size: cover; background-position: center;
      box-shadow: inset 0 0 0 1px rgba(239,233,223,0.25);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .cfg-carddot:hover { transform: scale(1.12); }
    .cfg-carddot:focus-visible { outline: 2px solid var(--cfg-gold); outline-offset: 2px; }
    .cfg-carddot--on { box-shadow: 0 0 0 2px var(--cfg-ink), 0 0 0 3.5px var(--cfg-gold); }
    .cfg-carddots__more { font-size: 11px; letter-spacing: .08em; color: var(--cfg-muted); margin-left: 2px; }
    .cfg-card__photo img { transition: opacity .25s ease, transform .5s ease; }
    .cfg-card--dots .cfg-pattern-inset { width: 64px; right: 6px; bottom: 6px; padding: 3px; font-size: 9px; opacity: .92; }
    .cfg-card--dots .cfg-pattern-inset img { width: 100%; height: 26px; }

    /* ── Rendering overlay ── */
    .cfg-rendering {
      position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%);
      display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
      padding: 7px 12px; border-radius: 999px;
      background: rgba(11,10,9,0.82); color: var(--cfg-cream);
      font-size: 12px; letter-spacing: .02em;
      pointer-events: none;
    }

    /* ── Desktop: configurator as an app ── */
    @media (min-width: 1024px) {
      .cfg-scope.cfg-app { height: calc(100vh - var(--cfg-offset, 0px)); height: calc(100dvh - var(--cfg-offset, 0px)); min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
      .cfg-scope.cfg-app > div { flex: 1; min-height: 0; display: flex; flex-direction: column; }
      .cfg-app .cfg-topbar { position: relative; padding: 12px 0; flex: none; }
      .cfg-app .cfg-stepper-wrap { flex: none; padding-top: 14px; padding-bottom: 14px; max-width: none; border-bottom: 1px solid var(--cfg-border); }
      .cfg-app .cfg-topbar > .cfg-container { max-width: none; }
      .cfg-app-main.cfg-container { flex: 1; min-height: 0; max-width: none; padding: 0 !important; margin: 0; }
      .cfg-app-grid { display: grid; grid-template-columns: minmax(0, 1fr) clamp(460px, 40vw, 620px); height: 100%; }
      .cfg-app-stage { flex-direction: column; gap: 14px; min-height: 0; padding: 24px 28px 20px 32px; }
      .cfg-app-stage__img {
        position: relative; flex: 1; min-height: 0;
        display: flex; align-items: center; justify-content: center;
        background: var(--cfg-cream); border-radius: 4px; overflow: hidden;
      }
      .cfg-app-stage__pic { animation: cfg-fadein .35s ease; }
      @keyframes cfg-fadein { from { opacity: .35; } to { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { .cfg-app-stage__pic { animation: none; } }
      .cfg-app-stage__tag { position: absolute; top: 12px; left: 12px; background: var(--cfg-ink); color: var(--cfg-cream); font-size: 11px; padding: 4px 8px; }
      .cfg-app-stage .cfg-stage__badge { right: 12px; bottom: 12px; width: 30px; height: 30px; }
      .cfg-app-summary { flex: none; display: flex; flex-direction: column; gap: 10px; }
      .cfg-app-summary__title { display: flex; align-items: baseline; gap: 14px; }
      .cfg-app-summary__title .cfg-rail__eyebrow { margin: 0; }
      .cfg-app-summary__name { font-family: 'Newsreader', serif; font-size: 22px; color: var(--cfg-cream); }
      .cfg-app-summary__chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; }
      .cfg-app-chip {
        text-align: left; padding: 6px 10px; min-width: 0;
        border: 1px solid var(--cfg-border-strong); border-radius: 2px; background: var(--cfg-panel);
        transition: border-color .15s ease;
      }
      .cfg-app-chip:hover { border-color: var(--cfg-gold); }
      .cfg-app-chip dt { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--cfg-muted); }
      .cfg-app-chip dd { margin: 2px 0 0; font-size: 13px; color: var(--cfg-cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
      .cfg-app-summary__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 12px; color: var(--cfg-muted); }
      .cfg-app-summary__foot .cfg-rail__reset { margin: 0; width: auto; }
      .cfg-app-panel {
        min-height: 0; overflow-y: auto; overscroll-behavior: contain;
        display: flex; flex-direction: column;
        border-left: 1px solid var(--cfg-border); background: var(--cfg-ink);
      }
      .cfg-app-panel__body { flex: 1; padding: 28px 32px 32px; }
      .cfg-app-panel__body .cfg-h1 { font-size: clamp(30px, 2.6vw, 40px); }
      .cfg-app-nav {
        position: sticky; bottom: 0; z-index: 5;
        padding: 14px 32px 18px; background: var(--cfg-ink);
        border-top: 1px solid var(--cfg-border);
      }
      .cfg-app-nav > div:not(.cfg-app-nav__total) { margin-top: 10px !important; padding-top: 0 !important; border-top: 0 !important; }
      .cfg-app-nav__total { display: flex; align-items: baseline; gap: 12px; }
      .cfg-app-nav__total .cfg-rail__price { font-size: 22px; }
      .cfg-app-nav__ship { margin-left: auto; font-size: 11px; letter-spacing: .08em; color: var(--cfg-muted); }
    }
    @media (max-width: 1023px) {
      .cfg-app-grid { display: block; }
    }
  `}</style>
);

export default ConfiguratorPage;
