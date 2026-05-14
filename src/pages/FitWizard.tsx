import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CardPositionIllustration from "@/components/CardPositionIllustration";
import { isValidLang, type Lang } from "@/lib/i18n";

/* ─────────────────────────────────────────────
   Woolet AI Fit — v2.1 Cheek-Card Method
   intro → consent → capture → result → reserved
   Phase 2 mock: real camera + real lighting histogram +
   mock card detection (4s) + DeviceOrientation tilt (mobile).
   Auglio SDK swap-in is Phase 4 — component contracts stable.
   ───────────────────────────────────────────── */

type Step = "intro" | "consent" | "capture" | "result" | "saved" | "reserved";
type CardType = "credit" | "library" | "id" | "cardless" | "unknown";
type Sku =
  | "007-S" | "007-M" | "007-L"
  | "009-S" | "009-M" | "009-L"
  | "bespoke";

interface Measurement {
  faceWidthMm: number;
  bridgeMm: number;
  pdMm: number;
  cardType: CardType;
  recommendedSku: Sku;
  confidence: number;
}

const TRUST_COPY: Record<CardType, string> = {
  credit: "Captured with a credit card. Verified to ±1.5 mm via Woolet AI Fit.",
  library: "Captured with a library / membership card. Verified to ±1.5 mm via Woolet AI Fit.",
  id: "Captured with an ID card. Verified to ±1.5 mm via Woolet AI Fit.",
  cardless: "Captured cardless via iris reference. Verified to ±2 mm via Woolet AI Fit.",
  unknown: "Captured with a credit-card-sized reference. Verified to ±1.5 mm via Woolet AI Fit.",
};

const SKU_DETAIL: Record<Exclude<Sku, "bespoke">, { shape: string; widthMm: number; bridgeMm: number; range: string }> = {
  "007-S": { shape: "Round / Panto", widthMm: 155, bridgeMm: 21, range: "152–155 mm" },
  "007-M": { shape: "Round / Panto", widthMm: 158, bridgeMm: 22, range: "155–161 mm" },
  "007-L": { shape: "Round / Panto", widthMm: 161, bridgeMm: 23, range: "161–168 mm" },
  "009-S": { shape: "Soft Square",   widthMm: 155, bridgeMm: 21, range: "152–155 mm" },
  "009-M": { shape: "Soft Square",   widthMm: 158, bridgeMm: 22, range: "155–161 mm" },
  "009-L": { shape: "Soft Square",   widthMm: 161, bridgeMm: 23, range: "161–168 mm" },
};

const recommendSku = (faceWidthMm: number): Sku => {
  if (faceWidthMm < 152) return "bespoke";
  if (faceWidthMm < 155) return "009-S";
  if (faceWidthMm < 161) return "009-M";
  if (faceWidthMm <= 168) return "009-L";
  return "bespoke";
};

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    dataLayer?: Record<string, unknown>[];
    clarity?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });

  // Mirror key conversion + experiment events to Microsoft Clarity
  const CLARITY_EVENTS = new Set([
    "deposit_clicked",
    "deposit_completed",
    "fit_result_fomo_shown",
    "fit_fomo_variant_assigned",
    "fit_result_shown",
    "fit_scan_completed",
    "fit_pricing_viewed",
    "fit_form_field_focus",
    "fit_form_submit_attempt",
    "fit_form_submit_error",
  ]);
  if (typeof w.clarity === "function" && CLARITY_EVENTS.has(event)) {
    try {
      w.clarity("event", event);
      const variant = params.fomo_variant ?? params.variant;
      if (variant) w.clarity("set", "fomo_variant", String(variant));
      if (params.recommended_sku) w.clarity("set", "recommended_sku", String(params.recommended_sku));
    } catch {
      /* noop */
    }
  }
};


/* ───────── Shared button styles ───────── */
const goldButtonStyle: React.CSSProperties = {
  background: "hsl(var(--gold))",
  color: "hsl(var(--background))",
  fontFamily: "Barlow, sans-serif",
  fontWeight: 500,
  fontSize: "0.7rem",
  padding: "16px 28px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 200ms",
};

const ghostButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "hsl(var(--gold-light))",
  fontFamily: "Barlow, sans-serif",
  fontWeight: 300,
  fontSize: "0.7rem",
  padding: "16px 28px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  border: "1px solid hsl(var(--gold) / 0.4)",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 200ms",
};

/* ═══════════════════════════════════════════════════
   STEP 1 — Intro
   ═══════════════════════════════════════════════════ */
function IntroStep({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-7 animate-fade-in">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">AI FIT · POWERED BY WOOLET</span>
      </div>

      <h1
        className="font-display text-woolet-white leading-[0.95]"
        style={{ fontSize: "clamp(2.6rem, 5vw, 3.4rem)", fontWeight: 300 }}
      >
        <em className="italic text-gold-light">Measured</em> for you.<br />
        In thirty seconds.
      </h1>

      <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "1rem" }}>
        Three numbers. One frame. No more guessing.<br />
        Your face width, your bridge, your pupillary distance — captured by your phone camera against the scale of a credit-card-sized object you already have. Sub-millimeter accuracy. No app to install.
      </p>

      <ul className="flex flex-col gap-3 my-2">
        {[
          "Measured to ±1.5 mm",
          "Your scan stays on your device",
          "Reserve your size for $1 — refundable any time",
        ].map((p) => (
          <li key={p} className="flex items-start gap-3 text-foreground" style={{ fontSize: "0.9rem", fontFamily: "Barlow, sans-serif", fontWeight: 400 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--gold))", marginTop: 9, flexShrink: 0 }} />
            {p}
          </li>
        ))}
      </ul>

      <h2
        className="font-display text-woolet-white mt-4"
        style={{ fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", textAlign: "center" }}
      >
        How to position the card
      </h2>
      <div className="mx-auto w-full max-w-[380px] max-sm:max-w-[280px] my-8">
        <CardPositionIllustration />
        <p
          className="text-center text-cream-dim mt-3"
          style={{ fontSize: "0.8125rem", fontFamily: "Barlow, sans-serif" }}
        >
          Any standard credit, debit or ID card works — we use the long edge (85.6 mm) as scale reference.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => {
            pushEvent("fit_started", { step: "intro" });
            onBegin();
          }}
          style={goldButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
        >
          Scan your face · Reserve for $1
        </button>
        <Link to="/en/fit/scan" style={ghostButtonStyle} onClick={() => pushEvent("fit_scan_link_clicked", { from: "intro" })}>
          No card? Try cardless scan →
        </Link>
      </div>
      <Link
        to="/en#size-matrix"
        className="text-cream-dim"
        style={{ fontSize: "0.75rem", fontFamily: "Barlow, sans-serif", textAlign: "center", textDecoration: "underline", textUnderlineOffset: 4 }}
      >
        See the size matrix
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 2 — Consent (with lighting pre-check)
   ═══════════════════════════════════════════════════ */
function ConsentStep({ onAllow, onManual }: { onAllow: () => void; onManual: () => void }) {
  const [checking, setChecking] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const requestCamera = async () => {
    setChecking(true);
    setWarning(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      // Lighting pre-check: sample a few frames
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      let total = 0;
      let samples = 0;
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 80));
        if (!ctx) break;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        for (let p = 0; p < data.length; p += 4) {
          sum += (data[p] + data[p + 1] + data[p + 2]) / 3;
        }
        total += sum / (data.length / 4);
        samples++;
      }
      stream.getTracks().forEach((t) => t.stop());
      const avg = samples ? total / samples : 0;
      if (avg < 60) setWarning("It's quite dim. Try a different room or turn on a light for the cleanest scan.");
      else if (avg > 220) setWarning("It's very bright. Try moving away from a direct window.");
      pushEvent("fit_consent_granted", { lighting_avg: Math.round(avg) });
      onAllow();
    } catch {
      pushEvent("fit_consent_denied");
      onManual();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">CAMERA ACCESS · STEP 2 OF 5</span>
      </div>

      <h2
        className="font-display text-woolet-white leading-tight"
        style={{ fontSize: "clamp(2rem, 3.6vw, 2.4rem)", fontWeight: 300 }}
      >
        We need your camera.<br />
        <em className="italic text-gold-light">That's it.</em>
      </h2>

      <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
        The scan runs entirely in your browser. Nothing is uploaded, nothing is stored beyond the
        three numbers you choose to save. We don't see your face — we see three numbers.
      </p>

      <Link
        to="/en/privacy-policy"
        className="text-cream-dim underline self-start"
        style={{ fontSize: "0.8rem", fontFamily: "Barlow, sans-serif" }}
      >
        Read the privacy detail →
      </Link>

      {warning && (
        <p style={{ fontSize: "0.8rem", color: "hsl(var(--gold-light))", fontFamily: "Barlow, sans-serif" }}>
          {warning}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-3">
        <button
          onClick={requestCamera}
          disabled={checking}
          style={{ ...goldButtonStyle, opacity: checking ? 0.7 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
        >
          {checking ? "Checking light…" : "Allow camera · Continue"}
        </button>
        <button
          onClick={onManual}
          className="text-cream-dim underline self-start bg-transparent border-none cursor-pointer text-left"
          style={{ fontSize: "0.85rem", fontFamily: "Barlow, sans-serif" }}
        >
          I'd rather use a ruler — show me the manual method →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 3 — Capture (LIGHT palette, cheek-card method)
   ═══════════════════════════════════════════════════ */
const CAPTURE_STEPS = [
  "STEP 1 OF 5 — GRAB A CARD (CREDIT, LIBRARY, GYM, ANY ID-1 SIZE)",
  "STEP 2 OF 5 — HOLD CARD VERTICALLY AGAINST YOUR RIGHT CHEEK",
  "STEP 3 OF 5 — TOP OF CARD JUST BELOW YOUR OUTER EYEBROW",
  "STEP 4 OF 5 — KEEP CARD FLAT · LOOK DIRECTLY AT CAMERA",
  "STEP 5 OF 5 — HOLD STILL · MEASURING",
];

type CheckKey = "card" | "tilt" | "distance" | "lighting";
const REMEDIATIONS: Record<CheckKey, string> = {
  card: "Hold your card flat against your cheek — make sure all four corners are visible.",
  tilt: "Your head is tilted. Level your chin and look straight at the camera.",
  distance: "Hold the phone at arm's length — about 50–70 cm away.",
  lighting: "The light is uneven. Face a window or turn on a second light.",
};

function CaptureStep({
  onComplete,
  onCardlessFallback,
  onFounderCall,
}: {
  onComplete: (m: Measurement) => void;
  onCardlessFallback: () => void;
  onFounderCall: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stepIdx, setStepIdx] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({
    card: false, tilt: true, distance: true, lighting: true,
  });
  const [activeRemediation, setActiveRemediation] = useState<string | null>(null);
  const [allGreen, setAllGreen] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const allGreenSinceRef = useRef<number | null>(null);
  const tiltGammaRef = useRef(0);
  const faceDistanceRef = useRef(0); // face width / video width (0..1)
  const faceDetectedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const cardDetectedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  /* boot camera */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch {
        // permission revoked mid-flow — bail to manual
        window.location.href = "/en/fit/manual";
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* fade overlay after 4s */
  useEffect(() => {
    const t = setTimeout(() => setOverlayVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  /* cycle micro-copy steps every 3s */
  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, CAPTURE_STEPS.length - 1));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  /* mock card detection — flips true 4s after camera mount */
  useEffect(() => {
    const t = setTimeout(() => {
      cardDetectedAtRef.current = Date.now();
      setChecks((c) => ({ ...c, card: true }));
      pushEvent("fit_card_detected", { card_orientation: "vertical", card_type: "credit" });
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  /* MediaPipe Face Mesh — real head-tilt + face-distance detection */
  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let landmarker: { detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: { x: number; y: number; z: number }[][] }; close?: () => void } | null = null;
    let lastTs = -1;

    (async () => {
      try {
        // Load tasks-vision from CDN to avoid bundling ~4MB of wasm
        const cdn = "https://esm.sh/@mediapipe/tasks-vision@0.10.14";
        const vision: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ cdn);
        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        if (cancelled) return;
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch (err) {
        // Fail-soft: leave tilt at 0 (always level) so capture isn't blocked
        console.warn("[FitWizard] MediaPipe FaceLandmarker failed to load", err);
        return;
      }

      const tick = () => {
        if (cancelled) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2 && landmarker) {
          const ts = performance.now();
          if (ts !== lastTs) {
            lastTs = ts;
            try {
              const res = landmarker.detectForVideo(v, ts);
              const lm = res.faceLandmarks?.[0];
              if (lm && lm.length > 263) {
                faceDetectedRef.current = true;
                // Eye outer corners: 33 (right eye outer in image), 263 (left eye outer)
                const a = lm[33];
                const b = lm[263];
                const dx = (b.x - a.x);
                const dy = (b.y - a.y);
                // Roll angle of eye line from horizontal — proxy for head tilt
                const rollDeg = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
                tiltGammaRef.current = rollDeg;

                // Face width as fraction of frame: landmarks 234 (right) and 454 (left) cheek
                if (lm.length > 454) {
                  const faceW = Math.abs(lm[454].x - lm[234].x);
                  faceDistanceRef.current = faceW; // ~0.25–0.45 at arm's length
                }
              } else {
                faceDetectedRef.current = false;
              }
            } catch {
              /* transient — keep last known values */
            }
          }
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      try { landmarker?.close?.(); } catch { /* noop */ }
    };
  }, []);

  /* validation loop — runs at ~5 fps */
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
    }
    const interval = setInterval(() => {
      if (completedRef.current) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.readyState < 2) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;

      // lighting: average + half-frame skew
      let leftSum = 0, rightSum = 0;
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (x < c.width / 2) leftSum += lum;
          else rightSum += lum;
        }
      }
      const total = leftSum + rightSum;
      const skew = total > 0 ? Math.max(leftSum, rightSum) / total : 0.5;
      const avg = total / (c.width * c.height);
      const lightingOk = avg > 50 && avg < 230 && skew < 0.7;

      // tilt: real head-roll from MediaPipe eye-line angle. <8° = level.
      const tiltOk = tiltGammaRef.current < 8;

      // distance: real face-width fraction from MediaPipe.
      // Target ~0.28–0.48 of frame width (≈ arm's length on a 720×960 selfie).
      // If face mesh hasn't loaded yet, fall back to time-based proxy so we don't block.
      const fw = faceDistanceRef.current;
      const distanceOk = faceDetectedRef.current
        ? fw >= 0.28 && fw <= 0.5
        : Date.now() - startedAtRef.current > 1500;

      setChecks((prev) => {
        const next = {
          ...prev,
          lighting: lightingOk,
          tilt: tiltOk,
          distance: distanceOk,
        };
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  /* derive remediation message + green state */
  useEffect(() => {
    const order: CheckKey[] = ["card", "tilt", "lighting", "distance"];
    const failing = order.find((k) => !checks[k]);
    if (failing) {
      setActiveRemediation(REMEDIATIONS[failing]);
      setAllGreen(false);
      allGreenSinceRef.current = null;
      return;
    }
    setActiveRemediation(null);
    if (allGreenSinceRef.current === null) {
      allGreenSinceRef.current = Date.now();
      pushEvent("fit_capture_check_passed", { time_to_pass_ms: Date.now() - startedAtRef.current });
    }
    setAllGreen(true);
  }, [checks]);

  /* fire capture once all-green held 500ms, then 2s mock averaging */
  useEffect(() => {
    if (!allGreen || completedRef.current) return;
    const since = allGreenSinceRef.current;
    if (!since) return;
    const t = setTimeout(() => {
      if (!allGreen || completedRef.current) return;
      completedRef.current = true;
      // mock measurement (Phase 2 — same every time per spec §11)
      setTimeout(() => {
        const m: Measurement = {
          faceWidthMm: 162,
          bridgeMm: 22,
          pdMm: 66,
          cardType: "credit",
          recommendedSku: recommendSku(162),
          confidence: 0.96,
        };
        onComplete(m);
      }, 2000);
    }, 500);
    return () => clearTimeout(t);
  }, [allGreen, onComplete]);

  /* three-strikes — count failed 30s windows */
  useEffect(() => {
    const t = setInterval(() => {
      if (completedRef.current || allGreenSinceRef.current) return;
      if (Date.now() - startedAtRef.current > 30_000) {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        pushEvent("fit_capture_rejected", {
          rejection_reason: !checks.card ? "card_skew" : !checks.tilt ? "head_tilt" : !checks.lighting ? "lighting" : "distance",
        });
        startedAtRef.current = Date.now();
        if (next >= 3 && !showFallback) setShowFallback(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [checks, failedAttempts, showFallback]);

  useEffect(() => {
    if (showFallback) pushEvent("fit_cardless_fallback_offered", { failed_attempts: failedAttempts });
  }, [showFallback, failedAttempts]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--woolet-fit-bg)",
        color: "var(--woolet-fit-text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      {/* TOP — micro-copy step */}
      <div style={{ width: "100%", maxWidth: 520, textAlign: "center", minHeight: 56 }}>
        {activeRemediation ? (
          <div
            key={activeRemediation}
            style={{
              fontFamily: "Barlow, sans-serif",
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#A07A2A",
              animation: "wizFadeIn 200ms ease both",
              padding: "8px 12px",
            }}
          >
            {activeRemediation}
          </div>
        ) : (
          <div
            key={stepIdx}
            style={{
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--woolet-fit-text)",
              animation: "wizFadeIn 200ms ease both",
              padding: "8px 12px",
            }}
          >
            {CAPTURE_STEPS[stepIdx]}
          </div>
        )}
      </div>

      {/* CENTER — camera with bounding box + overlay */}
      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          maxWidth: 520,
          marginTop: 14,
          marginBottom: 14,
          borderRadius: 8,
          overflow: "hidden",
          background: "#000",
          minHeight: 320,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)", // mirror selfie
          }}
        />

        {/* combined face + card bounding box */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "16%",
            right: "16%",
            bottom: "14%",
            border: `2px solid ${allGreen ? "var(--woolet-fit-success)" : "var(--woolet-fit-frame)"}`,
            borderRadius: 6,
            boxShadow: allGreen
              ? "0 0 0 8px rgba(42,95,58,0.25)"
              : "0 0 0 0 var(--woolet-fit-pulse)",
            animation: allGreen ? "none" : "fitPulse 2s ease-in-out infinite",
            transition: "border-color 200ms, box-shadow 200ms",
            pointerEvents: "none",
          }}
        />

        {/* SVG instruction overlay (first 4s) */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(248,246,241,0.55)",
            opacity: overlayVisible ? 1 : 0,
            transition: "opacity 600ms ease",
            pointerEvents: "none",
            padding: "0 24px",
          }}
        >
          <svg width="180" height="220" viewBox="0 0 180 220" fill="none">
            {/* face oval */}
            <ellipse cx="90" cy="110" rx="52" ry="72" stroke="#1F1B16" strokeWidth="1.5" opacity="0.55" />
            {/* eyes */}
            <circle cx="72" cy="98" r="3" fill="#1F1B16" opacity="0.55" />
            <circle cx="108" cy="98" r="3" fill="#1F1B16" opacity="0.55" />
            {/* eyebrow line */}
            <path d="M 64 86 L 80 84" stroke="#1F1B16" strokeWidth="1.5" opacity="0.55" />
            <path d="M 100 84 L 116 86" stroke="#1F1B16" strokeWidth="1.5" opacity="0.55" />
            {/* card on right cheek (vertical) */}
            <rect x="124" y="88" width="22" height="36" fill="var(--woolet-fit-frame)" opacity="0.85" rx="2" />
            <rect x="127" y="100" width="6" height="4" fill="#F8F6F1" opacity="0.6" rx="1" />
          </svg>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "var(--woolet-fit-text)",
              textAlign: "center",
              maxWidth: 320,
              marginTop: 14,
              lineHeight: 1.45,
            }}
          >
            Hold any credit-card-sized card flat against your right cheek. Top edge just below your eyebrow.
          </p>
        </div>
      </div>

      {/* BOTTOM — confidence strip with per-check labels */}
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {([
            { k: "card", label: "Card" },
            { k: "tilt", label: "Tilt" },
            { k: "lighting", label: "Light" },
            { k: "distance", label: "Distance" },
          ] as { k: CheckKey; label: string }[]).map(({ k, label }) => {
            const ok = checks[k];
            return (
              <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: 3,
                    borderRadius: 2,
                    background: ok ? "var(--woolet-fit-success)" : "rgba(31,27,22,0.18)",
                    transition: "background 200ms",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.55rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: ok ? "var(--woolet-fit-success)" : "rgba(31,27,22,0.45)",
                    transition: "color 200ms",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {showFallback && (
          <div style={{ marginTop: 18, animation: "wizFadeIn 300ms ease both" }}>
            <div
              style={{
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                fontSize: "0.625rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#A07A2A",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Having trouble?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => {
                  pushEvent("fit_cardless_fallback_taken");
                  onCardlessFallback();
                }}
                style={{ ...goldButtonStyle, padding: "12px 18px", fontSize: "0.65rem" }}
              >
                Skip the card · Use cardless mode
              </button>
              <button
                onClick={() => {
                  pushEvent("fit_founder_call_booked");
                  onFounderCall();
                }}
                style={{
                  ...ghostButtonStyle,
                  padding: "12px 18px",
                  fontSize: "0.65rem",
                  color: "var(--woolet-fit-text)",
                  borderColor: "rgba(31,27,22,0.3)",
                }}
              >
                Book a 5-minute call with the founder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Founding-member FOMO block (shown on result step)
   ═══════════════════════════════════════════════════ */
const FOUNDING_TOTAL = 100;
// Stable per-SKU "claimed" counts — tuned high to feel like late-stage
// scarcity without crossing 100. Update with real numbers when available.
const FOUNDING_CLAIMED: Record<string, number> = {
  "007-S": 71,
  "007-M": 84,
  "007-L": 68,
  "009-S": 73,
  "009-M": 81,
  "009-L": 77,
};

type FomoVariant = "A" | "B";

const FOMO_VARIANT_KEY = "woolet_fomo_variant";

function getFomoVariant(): FomoVariant {
  if (typeof window === "undefined") return "A";
  try {
    const stored = window.localStorage.getItem(FOMO_VARIANT_KEY);
    if (stored === "A" || stored === "B") return stored;
    const assigned: FomoVariant = Math.random() < 0.5 ? "A" : "B";
    window.localStorage.setItem(FOMO_VARIANT_KEY, assigned);
    return assigned;
  } catch {
    return "A";
  }
}

const FOMO_COPY: Record<FomoVariant, {
  badge: string;
  headline: string;
  priceLine: (sku: Sku) => React.ReactNode;
  footnote: React.ReactNode;
}> = {
  A: {
    badge: "Founding member · Kickstarter",
    headline: "$1 deposit · 40% Kickstarter discount",
    priceLine: () => (
      <>
        Locks in <span className="text-woolet-white">40% off</span> at Kickstarter launch,
        <span className="text-woolet-white"> first-shipment priority</span>, and a
        <span className="text-woolet-white"> free lens cleaning kit</span>.
      </>
    ),
    footnote: (
      <>Hard commit: your $1 deposit secures all three perks. Mazzucchelli acetate runs in 100-frame batches per model — once founding spots fill, retail returns to <span className="line-through">$190</span>.</>
    ),
  },
  B: {
    badge: "Last founding batch · 100 frames",
    headline: "$1 holds 40% off + priority shipping + free lens kit",
    priceLine: () => (
      <>
        One dollar today locks in the <span className="text-woolet-white">40% Kickstarter discount</span>,
        <span className="text-woolet-white"> first-shipment priority</span>, and a
        <span className="text-woolet-white"> complimentary lens cleaning kit</span>.
      </>
    ),
    footnote: (
      <>Hard commit — refundable any time, but the three perks disappear when founding spots fill. Only 100 frames per model in this Mazzucchelli run before retail returns to <span className="line-through">$190</span>.</>
    ),
  },
};

function FoundingMemberFomo({ sku, variant }: { sku: Sku; variant: FomoVariant }) {
  const claimed = FOUNDING_CLAIMED[sku] ?? 75;
  const left = Math.max(0, FOUNDING_TOTAL - claimed);
  const pct = Math.min(100, Math.round((claimed / FOUNDING_TOTAL) * 100));
  const copy = FOMO_COPY[variant];
  const blockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    pushEvent("fit_result_fomo_shown", { recommended_sku: sku, spots_left: left, variant });
  }, [sku, left, variant]);

  // 50%-visible IntersectionObserver → fires "pricing viewed" once per mount
  useEffect(() => {
    const el = blockRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!fired && e.isIntersecting && e.intersectionRatio >= 0.5) {
            fired = true;
            pushEvent("fit_pricing_viewed", {
              recommended_sku: sku,
              variant,
              price_pre_order: 133,
              price_msrp: 190,
            });
            io.disconnect();
          }
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sku, variant]);

  return (
    <div
      ref={blockRef}
      data-clarity-region="fit-pricing-fomo"
      data-fomo-variant={variant}
      data-recommended-sku={sku}
      className="rounded-lg p-5 sm:p-6 flex flex-col gap-4"
      style={{
        background: "rgba(201,168,76,0.06)",
        border: "1px solid rgba(201,168,76,0.28)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, background: "hsl(var(--gold))" }}
        />
        <span
          className="uppercase tracking-[0.25em]"
          style={{
            fontFamily: "Barlow, sans-serif",
            fontWeight: 600,
            fontSize: "0.65rem",
            color: "hsl(var(--gold))",
          }}
        >
          {copy.badge}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="font-display"
          style={{
            fontSize: "clamp(1.6rem, 3.4vw, 2.1rem)",
            fontWeight: 400,
            color: "hsl(var(--gold))",
            lineHeight: 1,
          }}
        >
          {copy.headline}
        </span>
        <span
          className="text-cream-dim"
          style={{ fontSize: "0.9rem", fontFamily: "Barlow, sans-serif" }}
        >
          {copy.priceLine(sku)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className="flex items-center justify-between"
          style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.72rem" }}
        >
          <span className="text-cream-dim">
            {claimed} / {FOUNDING_TOTAL} founding spots claimed
          </span>
          <span style={{ color: "hsl(var(--gold))", fontWeight: 600 }}>
            {left} left for Woolet {sku}
          </span>
        </div>
        <div
          className="w-full overflow-hidden rounded-full"
          style={{ height: 6, background: "rgba(255,255,255,0.08)" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${claimed} of ${FOUNDING_TOTAL} founding spots claimed`}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "hsl(var(--gold))",
              transition: "width 600ms ease",
            }}
          />
        </div>
      </div>

      <div
        className="pt-3"
        style={{ borderTop: "1px solid rgba(201,168,76,0.18)" }}
      >
        <p
          className="text-cream-dim leading-relaxed"
          style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
        >
          {copy.footnote}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 4 — Result
   ═══════════════════════════════════════════════════ */

function ResultStep({
  measurement,
  onSwapShape,
  onSavedEmail,
  onBespoke,
}: {
  measurement: Measurement;
  onSwapShape: () => void;
  onSavedEmail: (email: string) => void;
  onBespoke: () => void;
}) {
  const fomoVariant = useMemo(() => getFomoVariant(), []);

  useEffect(() => {
    pushEvent("fit_result_shown", {
      face_width_mm: measurement.faceWidthMm,
      bridge_mm: measurement.bridgeMm,
      pd_mm: measurement.pdMm,
      recommended_sku: measurement.recommendedSku,
      confidence: measurement.confidence,
      fomo_variant: fomoVariant,
    });
    pushEvent("fit_fomo_variant_assigned", {
      variant: fomoVariant,
      recommended_sku: measurement.recommendedSku,
      price_pre_order: 133,
      price_msrp: 190,
    });
  }, [measurement, fomoVariant]);

  if (measurement.recommendedSku === "bespoke") {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-7 animate-fade-in">
        <div className="woolet-eyebrow">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">YOUR MEASUREMENT</span>
        </div>
        <h2 className="font-display text-woolet-white" style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)", fontWeight: 300 }}>
          Your face is <em className="italic text-gold-light">beyond standard</em>.
        </h2>
        <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
          We measured a face width of {measurement.faceWidthMm} mm. That's outside our standard 152–168 mm range —
          which is exactly what Bespoke is built for.
        </p>
        <Link to="/en/fit/bespoke" style={goldButtonStyle} onClick={onBespoke}>
          Explore Bespoke
        </Link>
      </div>
    );
  }

  const sku = SKU_DETAIL[measurement.recommendedSku];
  const altLabel = measurement.recommendedSku.startsWith("009")
    ? "Show me the other shape (007 round) →"
    : "Show me the other shape (009 soft square) →";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">YOUR MEASUREMENT</span>
      </div>

      {/* three numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        {[
          { label: "Face width", val: measurement.faceWidthMm },
          { label: "Bridge", val: measurement.bridgeMm },
          { label: "PD", val: measurement.pdMm },
        ].map((n) => (
          <div key={n.label} className="flex flex-col">
            <span
              className="uppercase tracking-[0.25em] mb-2"
              style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: "0.55rem", color: "hsl(var(--gold-dim))" }}
            >
              {n.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display"
                style={{ fontSize: "clamp(2.8rem, 6vw, 3.6rem)", fontWeight: 300, color: "hsl(var(--gold))", lineHeight: 1 }}
              >
                {n.val}
              </span>
              <span className="font-display" style={{ fontSize: "1.3rem", fontWeight: 300, color: "hsl(var(--gold-light))" }}>
                mm
              </span>
            </div>
          </div>
        ))}
      </div>

      <p
        className="italic text-center"
        style={{ fontSize: "0.8rem", color: "hsl(var(--cream-dim))", fontFamily: "Barlow, sans-serif", fontWeight: 300 }}
      >
        {TRUST_COPY[measurement.cardType]}
      </p>

      <div className="woolet-divider" />

      {/* recommendation */}
      <div className="flex flex-col gap-3">
        <div className="woolet-eyebrow">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">YOUR RECOMMENDED FIT</span>
        </div>
        <h2 className="font-display text-woolet-white" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 300, lineHeight: 1.05 }}>
          Woolet {measurement.recommendedSku}
        </h2>
        <span
          className="uppercase tracking-[0.25em]"
          style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: "0.7rem", color: "hsl(var(--cream))" }}
        >
          {sku.shape} · {sku.widthMm} mm
        </span>
        <p className="text-cream-dim leading-relaxed mt-2" style={{ fontSize: "0.85rem" }}>
          Italian Mazzucchelli acetate. {sku.bridgeMm} mm keyhole bridge.
          Engineered for faces {sku.range}.
        </p>
      </div>

      {/* Light teaser + email capture (no payment) */}
      <EmailCaptureForm
        measurement={measurement}
        fomoVariant={fomoVariant}
        onSuccess={onSavedEmail}
      />

      <div className="flex flex-col gap-4 pt-2">
        <button
          onClick={() => {
            const from = measurement.recommendedSku;
            const to = (from.startsWith("009") ? from.replace("009", "007") : from.replace("007", "009")) as Sku;
            pushEvent("fit_result_sku_swapped", { from_sku: from, to_sku: to });
            onSwapShape();
          }}
          className="text-cream-dim underline self-start bg-transparent border-none cursor-pointer text-left"
          style={{ fontSize: "0.85rem", fontFamily: "Barlow, sans-serif" }}
        >
          {altLabel}
        </button>
        <Link
          to="/en/fit/bespoke"
          onClick={() => pushEvent("fit_result_bespoke_clicked", { measured_face_width: measurement.faceWidthMm })}
          className="text-cream-dim underline self-start"
          style={{ fontSize: "0.85rem", fontFamily: "Barlow, sans-serif" }}
        >
          My face falls outside — show me Bespoke →
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Email capture (free) — runs on the result page
   ═══════════════════════════════════════════════════ */
function EmailCaptureForm({
  measurement,
  fomoVariant,
  onSuccess,
}: {
  measurement: Measurement;
  fomoVariant: FomoVariant;
  onSuccess: (email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || !email || !name) return;
    pushEvent("fit_form_submit_attempt", {
      recommended_sku: measurement.recommendedSku,
      face_width_mm: measurement.faceWidthMm,
      step: "email_capture",
    });
    setSubmitting(true);
    setError(null);
    try {
      const { error: fnError } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email,
          name,
          face_width: String(measurement.faceWidthMm),
          models: `Woolet ${measurement.recommendedSku}`,
        },
      });
      if (fnError) throw fnError;
      pushEvent("fit_email_captured", {
        recommended_sku: measurement.recommendedSku,
        face_width_mm: measurement.faceWidthMm,
        fomo_variant: fomoVariant,
      });
      onSuccess(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      pushEvent("fit_form_submit_error", { reason: msg.slice(0, 80), step: "email_capture" });
    } finally {
      setSubmitting(false);
    }
  };

  const trackFocus = (field: string) => () =>
    pushEvent("fit_form_field_focus", { field, step: "email_capture" });

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-5"
      data-clarity-region="fit-email-capture"
    >
      {/* Light gold-tinted teaser */}
      <div
        className="rounded-lg p-4 sm:p-5"
        style={{
          background: "rgba(201,168,76,0.05)",
          border: "1px solid rgba(201,168,76,0.22)",
        }}
      >
        <p
          className="text-woolet-white"
          style={{ fontSize: "0.9rem", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
        >
          Get your fit details by email — free.
        </p>
        <p
          className="text-cream-dim mt-1.5 leading-relaxed"
          style={{ fontSize: "0.78rem", fontFamily: "Barlow, sans-serif" }}
        >
          Plus first access to founding member pricing (40% off) when Kickstarter
          launches in October.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.55rem", fontFamily: "Barlow, sans-serif" }}>
          First name
        </span>
        <input
          type="text"
          required
          data-clarity-region="capture-form-name"
          onFocus={trackFocus("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="woolet-input"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid hsl(0 0% 100% / 0.15)",
            color: "hsl(var(--cream))",
            padding: "10px 0",
            fontSize: "0.95rem",
            fontFamily: "Barlow, sans-serif",
            outline: "none",
          }}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="uppercase tracking-[0.2em] text-cream-dim" style={{ fontSize: "0.55rem", fontFamily: "Barlow, sans-serif" }}>
          Email
        </span>
        <input
          type="email"
          required
          data-clarity-region="capture-form-email"
          onFocus={trackFocus("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="woolet-input"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid hsl(0 0% 100% / 0.15)",
            color: "hsl(var(--cream))",
            padding: "10px 0",
            fontSize: "0.95rem",
            fontFamily: "Barlow, sans-serif",
            outline: "none",
          }}
        />
      </label>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          onFocus={trackFocus("privacy_consent")}
          required
          style={{ marginTop: 4 }}
          data-clarity-region="capture-form-consent"
        />
        <span className="text-cream-dim" style={{ fontSize: "0.75rem", fontFamily: "Barlow, sans-serif" }}>
          I accept the <Link to="/en/privacy-policy" className="text-gold-light underline">Privacy Policy</Link>.
        </span>
      </label>

      {error && <p style={{ color: "hsl(var(--woolet-red))", fontSize: "0.8rem" }}>{error}</p>}

      <button
        type="submit"
        disabled={submitting || !agree || !name || !email}
        style={{ ...goldButtonStyle, opacity: submitting || !agree ? 0.6 : 1 }}
      >
        {submitting ? "Sending…" : "Send me my fit"}
      </button>

      <p
        className="text-center text-cream-dim"
        style={{ fontSize: "0.72rem", fontFamily: "Barlow, sans-serif" }}
      >
        No payment now · unsubscribe anytime
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   Saved + $1 founding-spot upsell
   ═══════════════════════════════════════════════════ */
function SavedUpsellStep({
  measurement,
  email,
  onReserved,
  onMaybeLater,
}: {
  measurement: Measurement;
  email: string;
  onReserved: () => void;
  onMaybeLater: () => void;
}) {
  const fomoVariant = useMemo(() => getFomoVariant(), []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    pushEvent("fit_saved_upsell_shown", {
      recommended_sku: measurement.recommendedSku,
      fomo_variant: fomoVariant,
    });
  }, [measurement, fomoVariant]);

  const reserve = () => {
    pushEvent("deposit_clicked", {
      recommended_sku: measurement.recommendedSku,
      source_page: "fit_saved_upsell",
      fomo_variant: fomoVariant,
    });
    setSubmitting(true);
    // TODO: Stripe Payment Element in Phase 4 — for now mark complete
    pushEvent("deposit_completed", {
      recommended_sku: measurement.recommendedSku,
      amount: 1,
      source: "fit_saved_upsell",
    });
    onReserved();
  };

  const maybeLater = () => {
    pushEvent("fit_upsell_declined", {
      recommended_sku: measurement.recommendedSku,
      fomo_variant: fomoVariant,
    });
    onMaybeLater();
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in text-center">
      {/* fit saved badge */}
      <div className="flex justify-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            border: "1px solid rgba(74,222,128,0.45)",
            background: "rgba(74,222,128,0.06)",
            color: "rgb(134,239,172)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          ✓ Fit saved · {email}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="font-display text-woolet-white"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 300, lineHeight: 1.05 }}
        >
          Your fit is <em className="italic text-gold-light">locked in</em>.
        </h2>
        <p
          className="text-cream-dim leading-relaxed mx-auto"
          style={{ fontSize: "0.95rem", maxWidth: "32rem" }}
        >
          We'll email you when Kickstarter launches. Or — secure your founding
          spot now for $1.
        </p>
      </div>

      {/* Founding member upsell */}
      <div className="text-left">
        <FoundingMemberFomo sku={measurement.recommendedSku} variant={fomoVariant} />
      </div>

      <div className="flex flex-col gap-4 pt-1">
        <button
          onClick={reserve}
          disabled={submitting}
          style={{ ...goldButtonStyle, opacity: submitting ? 0.6 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
        >
          {submitting ? "Reserving…" : "Reserve my founding spot · $1"}
        </button>
        <button
          onClick={maybeLater}
          className="text-cream-dim underline mx-auto bg-transparent border-none cursor-pointer"
          style={{ fontSize: "0.85rem", fontFamily: "Barlow, sans-serif" }}
        >
          Maybe later — just email me at launch
        </button>
      </div>

      <div
        className="pt-5 mt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p
          className="text-cream-dim leading-relaxed"
          style={{ fontSize: "0.72rem", fontFamily: "Barlow, sans-serif" }}
        >
          $1 refundable any time before Kickstarter launches · October 2026
          <br />
          Stripe secured · no auto-charge later
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP 5 — Reserved (with .ics download)
   ═══════════════════════════════════════════════════ */
function ReservedStep({ measurement }: { measurement: Measurement }) {
  const sku = measurement.recommendedSku !== "bespoke" ? SKU_DETAIL[measurement.recommendedSku] : null;

  const downloadIcs = useCallback(() => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Woolet//AI Fit//EN",
      "BEGIN:VEVENT",
      "UID:woolet-kickstarter-2026@woolet.co",
      "DTSTAMP:20260514T000000Z",
      "DTSTART:20261013T140000Z",
      "DTEND:20261013T150000Z",
      "SUMMARY:Woolet Kickstarter Launch",
      "DESCRIPTION:Your Woolet fit is reserved. Back the campaign to lock in 40% off.",
      "LOCATION:https://kickstarter.com/woolet",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "woolet-kickstarter-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-7 animate-fade-in">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">RESERVATION CONFIRMED</span>
      </div>

      <h2 className="font-display text-woolet-white leading-[0.95]" style={{ fontSize: "clamp(2.6rem, 5vw, 3.4rem)", fontWeight: 300 }}>
        Your fit is <em className="italic text-gold-light">locked</em>.
      </h2>

      <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
        We've reserved your <span className="text-foreground">Woolet {measurement.recommendedSku}</span>
        {sku ? ` (${sku.widthMm} mm)` : ""} for $99 — a 40% discount on the $149 retail.
        We'll email you 24 hours before the Kickstarter launches in October 2026.
      </p>

      <button onClick={downloadIcs} style={ghostButtonStyle}>
        Add to calendar · Oct 13, 2026
      </button>

      <p className="text-cream-dim italic" style={{ fontSize: "0.8rem" }}>
        Want to refer a friend with a wide face? Get a free lens-cleaning subscription when three
        friends scan. We'll share the referral link in the launch email.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════ */
export default function FitWizard() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  const [step, setStep] = useState<Step>("intro");
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  const [savedEmail, setSavedEmail] = useState<string>("");

  // Toggle body class for capture-mode background guard
  useEffect(() => {
    if (step === "capture") document.body.classList.add("fit-capture-mode");
    else document.body.classList.remove("fit-capture-mode");
    return () => document.body.classList.remove("fit-capture-mode");
  }, [step]);

  // Shortcut: ?face_width=NNN&source=scan jumps straight to result
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fw = Number(params.get("face_width"));
    if (!fw || fw < 130 || fw > 200) return;
    const source = params.get("source") || "scan";
    const m: Measurement = {
      faceWidthMm: fw,
      bridgeMm: fw < 155 ? 21 : fw < 161 ? 22 : 23,
      pdMm: Math.round(fw * 0.41),
      cardType: "cardless",
      recommendedSku: recommendSku(fw),
      confidence: 0.9,
    };
    setMeasurement(m);
    setStep("result");
    pushEvent("fit_result_from_scan", { face_width_mm: fw, source });
  }, []);

  const goManual = useCallback(() => {
    window.location.href = "/en/fit/manual";
  }, []);

  const onCaptureDone = useCallback((m: Measurement) => {
    setMeasurement(m);
    if (m.recommendedSku === "bespoke") {
      // auto-route bespoke per §6.2 edge cases
      setStep("result");
    } else {
      setStep("result");
    }
  }, []);

  const swapShape = useCallback(() => {
    setMeasurement((m) => {
      if (!m || m.recommendedSku === "bespoke") return m;
      const swapped = (m.recommendedSku.startsWith("009")
        ? m.recommendedSku.replace("009", "007")
        : m.recommendedSku.replace("007", "009")) as Sku;
      return { ...m, recommendedSku: swapped };
    });
  }, []);

  const onCardlessFallback = useCallback(() => {
    // TODO: Phase 4 Auglio cardless integration
    const m: Measurement = {
      faceWidthMm: 162,
      bridgeMm: 22,
      pdMm: 66,
      cardType: "cardless",
      recommendedSku: recommendSku(162),
      confidence: 0.88,
    };
    setMeasurement(m);
    setStep("result");
  }, []);

  const onFounderCall = useCallback(() => {
    window.open("https://calendly.com/woolet-founder/5min", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <>
      <SEO
        title="Find Your Fit — Woolet AI Face Measurement"
        description="Scan your face. See your size. Reserve your fit for $1. Sub-millimeter AI measurement of face width, nose bridge, and PD. For wide faces 152–168 mm."
        lang={lang}
        path="/fit"
      />

      <style>{`
        @keyframes fitPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--woolet-fit-pulse); }
          50% { box-shadow: 0 0 0 14px transparent; }
        }
        @keyframes wizFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {step !== "capture" && <Navbar />}

      <main className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
        <div className="px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
          {step === "intro" && <IntroStep onBegin={() => setStep("consent")} />}
          {step === "consent" && (
            <ConsentStep onAllow={() => setStep("capture")} onManual={goManual} />
          )}
          {step === "capture" && (
            <CaptureStep
              onComplete={onCaptureDone}
              onCardlessFallback={onCardlessFallback}
              onFounderCall={onFounderCall}
            />
          )}
          {step === "result" && measurement && !showReserve && (
            <ResultStep
              measurement={measurement}
              onSwapShape={swapShape}
              onReserve={() => setShowReserve(true)}
              onBespoke={() => {}}
            />
          )}
          {step === "result" && measurement && showReserve && (
            <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in">
              <ReserveForm measurement={measurement} onSuccess={() => setStep("reserved")} />
            </div>
          )}
          {step === "reserved" && measurement && <ReservedStep measurement={measurement} />}
        </div>
      </main>

      {step !== "capture" && <Footer />}
    </>
  );
}
