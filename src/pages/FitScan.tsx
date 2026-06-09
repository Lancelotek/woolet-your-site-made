import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import DesktopScanGate from "@/components/DesktopScanGate";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import fitScanTip from "@/assets/fit-scan-tip.png";
import fitStepCard from "@/assets/fit-step-card.jpg";
import fitStepForehead from "@/assets/fit-step-forehead.jpg";
import fitStepPhone from "@/assets/fit-step-phone.jpg";
import fitScanReference from "@/assets/fit-scan-reference.jpg.asset.json";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getImageLandmarker, getVideoLandmarker, hasWebGL, resetLandmarkers } from "@/lib/face-landmarker";
import { detectCardCornersInRegion } from "@/lib/card-corner-detection";
import { classifyCardSample } from "@/lib/card-detection";
import {
  calculateMeasurements,
  getRecommendation,
  LANDMARKS,
  MeasurementError,
  type Measurements,
  type NormalizedLandmark,
  type Point,
  type Recommendation,
} from "@/lib/face-measurements";
import { detectFaceShape, type FaceShapeResult } from "@/lib/face-shape";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

type Step = "welcome" | "camera" | "analyzing" | "annotate" | "email-gate" | "result" | "result-sent";

/* ─────────────── Analyzing (progress) ─────────────── */

function AnalyzingStep({ previewUrl }: { previewUrl?: string }) {
  // Estimated duration ~12s for Gemini round-trip. We animate towards 92% and
  // hold there until the parent transitions to the next step.
  const ESTIMATE_MS = 12000;
  const [progress, setProgress] = useState(4);
  const [stageIdx, setStageIdx] = useState(0);

  const stages = [
    "Uploading your photo securely…",
    "Detecting the credit card on your forehead…",
    "Locating face landmarks (478 points)…",
    "Calculating face width and bridge size…",
    "Almost done — preparing your recommendation…",
  ];

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(92, Math.round((elapsed / ESTIMATE_MS) * 92));
      setProgress(pct);
      const s = Math.min(stages.length - 1, Math.floor(pct / 20));
      setStageIdx(s);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "32px 20px",
        textAlign: "center",
        color: "#f0ece4",
      }}
    >
      {previewUrl && (
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${GOLD}`,
            boxShadow: `0 0 0 6px rgba(202,164,73,0.12)`,
            position: "relative",
          }}
        >
          <img
            src={previewUrl}
            alt="Captured frame"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(202,164,73,0.55) 90deg, transparent 180deg)",
              animation: "fitscan-spin 1.4s linear infinite",
            }}
          />
        </div>
      )}

      <style>{`@keyframes fitscan-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 26, lineHeight: 1.2 }}>
        Analyzing your measurements
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          height: 6,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${GOLD}, #e6c779)`,
            transition: "width 200ms linear",
          }}
        />
      </div>

      <div style={{ fontSize: 13, color: MUTED, minHeight: 18 }}>
        {stages[stageIdx]} <span style={{ color: GOLD, marginLeft: 6 }}>{progress}%</span>
      </div>

      <div style={{ fontSize: 11, color: MUTED, maxWidth: 320 }}>
        This usually takes 8–15 seconds. Please keep this page open.
      </div>
    </div>
  );
}

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

interface CapturedFrame {
  dataUrl: string;
  width: number;
  height: number;
  landmarks: NormalizedLandmark[];
  /** In-memory canvas of the captured frame; used for auto corner detection. */
  canvas?: HTMLCanvasElement;
  /**
   * When set, the capture was produced by the multi-frame stabilizer:
   * 3 s of MediaPipe video frames, pose- and card-gated, with median
   * face-width-mm chosen as the canonical sample. Callers can skip the
   * server-side detection roundtrip and use these coordinates directly.
   */
  stabilized?: {
    cardCorners: [Point, Point];
    faceEdges: [Point, Point];
    medianFaceWidthMm: number;
    frameCount: number;
  };
}

/* ─────────────── Welcome ─────────────── */

function WelcomeStep({
  lang,
  onStart,
  disabled = false,
  isMobile,
}: {
  lang: Lang;
  onStart: () => void;
  disabled?: boolean;
  isMobile: boolean;
}) {
  const steps = isMobile
    ? [
        { n: "01", title: "Grab a card", body: "Any credit, debit or ID card. We use its 85.6 mm edge as scale.", img: fitStepCard, alt: "Credit card illustration used as scale reference" },
        { n: "02", title: "Hold to forehead", body: "Lay it flat across your brow, long edge horizontal. Push your hair back and hold the card by its top edge so your fingers don't cover the corners.", img: fitStepForehead, alt: "Person holding a credit card flat across the forehead" },
        { n: "03", title: "Hold phone at arm's length", body: "Front camera, face the lens. Tap capture when ready.", img: fitStepPhone, alt: "Hand holding a smartphone at arm's length for a selfie" },
      ]
    : [
        { n: "01", title: "Grab a card", body: "Any credit, debit or ID card. We use its 85.6 mm edge as scale.", img: fitStepCard, alt: "Credit card illustration used as scale reference" },
        { n: "02", title: "Hold to forehead", body: "Lay it flat across your brow, long edge horizontal. Push your hair back and hold the card by its top edge so your fingers don't cover the corners.", img: fitStepForehead, alt: "Person holding a credit card flat across the forehead" },
        { n: "03", title: "Sit 50–70 cm back", body: "Eyes level with the webcam, then tap capture or use the 3-second timer.", img: fitStepPhone, alt: "Person facing a camera at eye level" },
      ];

  return (
    <div className="flex flex-col gap-8">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">30-SECOND FIT SCAN</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(2.5rem, 5.5vw, 3.75rem)", fontWeight: 300, lineHeight: 1 }}
      >
        Measure your face in <em className="italic" style={{ color: GOLD }}>30 seconds</em>
      </h1>
      <p className="text-cream-dim" style={{ fontSize: "1.1rem", fontWeight: 300, lineHeight: 1.5 }}>
        Three steps. Photo never leaves your device until you capture.
      </p>

      <div
        style={{
          borderRadius: 12,
          border: `1.5px solid ${GOLD}`,
          background: "rgba(202,164,73,0.08)",
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke={GOLD} strokeWidth="1.5" />
            <line x1="2" y1="10" x2="22" y2="10" stroke={GOLD} strokeWidth="1" />
          </svg>
          <span
            style={{
              color: GOLD,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.02em",
            }}
          >
            You need a card for this scan
          </span>
        </div>
        <p
          style={{
            color: "rgba(240,236,228,0.85)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 300,
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Grab any credit card, debit card, or ID card. The long edge must measure <strong style={{ color: "#fff", fontWeight: 500 }}>85.60 mm</strong> and the short edge <strong style={{ color: "#fff", fontWeight: 500 }}>53.98 mm</strong> — this is the ISO/IEC 7810 ID-1 standard used by most payment and ID cards worldwide.
        </p>
      </div>

      <figure
        style={{
          margin: 0,
          borderRadius: 12,
          overflow: "hidden",
          background: "#0f0f0e",
          border: "1px solid rgba(202,164,73,0.25)",
        }}
      >
        <img
          src={fitScanReference.url}
          alt="Reference photo: person holding a credit card flat across the forehead with the long edge horizontal, both edges touching the skin, facing the camera."
          width={896}
          height={1152}
          loading="lazy"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        <figcaption
          style={{
            color: GOLD,
            fontFamily: "Cormorant Garamond, serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            textAlign: "center",
            padding: "10px 14px 12px",
            background: "#0f0f0e",
          }}
        >
          Hold the card flat on your forehead — long edge horizontal, both edges touching the skin.
        </figcaption>
      </figure>

      <ol
        className="flex flex-col gap-6 pt-2 m-0 p-0"
        style={{ listStyle: "none", fontFamily: "Barlow, sans-serif" }}
      >
        {steps.map((s) => (
          <li key={s.n} className="flex items-start gap-4">
            <span
              aria-hidden
              style={{
                color: GOLD,
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.5rem",
                fontWeight: 300,
                fontStyle: "italic",
                minWidth: 36,
                lineHeight: 1,
                paddingTop: 2,
              }}
            >
              {s.n}
            </span>
            <div
              aria-hidden
              style={{
                flexShrink: 0,
                width: 72,
                height: 72,
                borderRadius: 8,
                overflow: "hidden",
                background: "#0f0f0e",
                border: "1px solid rgba(202,164,73,0.18)",
              }}
            >
              <img
                src={s.img}
                alt={s.alt}
                width={144}
                height={144}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                {s.title}
              </span>
              <span style={{ color: MUTED, fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.5 }}>
                {s.body}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onStart}
          disabled={disabled}
          style={{
            background: disabled ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            padding: "18px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            height: 52,
          }}
        >
          {disabled ? "Scan unavailable" : "Start scan"}
        </button>
        <p
          style={{
            color: MUTED,
            fontSize: "0.72rem",
            fontFamily: "Barlow, sans-serif",
            fontWeight: 300,
            textAlign: "center",
            margin: 0,
          }}
        >
          Take off your glasses first. Detection runs after you tap capture.
        </p>
        <Link
          to={`/${lang}/fit`}
          style={{
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 300,
            fontSize: "0.75rem",
            textAlign: "center",
            textDecoration: "none",
            paddingTop: 4,
          }}
        >
          Prefer manual measurement? Use the wizard →
        </Link>
      </div>
    </div>
  );
}

/* ─────────────── Camera ─────────────── */

interface CameraStepProps {
  lang: Lang;
  onCaptured: (frame: CapturedFrame) => void;
  onError: (msg: string) => void;
  isMobile: boolean;
}

function CameraStep({ lang, onCaptured, onError, isMobile }: CameraStepProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lumRafRef = useRef<number>(0);
  const stabilizeRafRef = useRef<number>(0);
  const capturedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stabilizing, setStabilizing] = useState(false);
  const [stabilizeProgress, setStabilizeProgress] = useState(0);
  const [stabilizeValid, setStabilizeValid] = useState(0);
  const [lighting, setLighting] = useState<"green" | "yellow" | "red">("yellow");
  const [cardState, setCardState] = useState<"none" | "ok" | "misaligned">("none");
  const [cardOverride, setCardOverride] = useState(false);
  const [showCardOverride, setShowCardOverride] = useState(false);
  const cardMissingSinceRef = useRef<number | null>(null);
  const [distanceState, setDistanceState] = useState<"unknown" | "ok" | "too_close" | "too_far">("unknown");
  const [poseState, setPoseState] = useState<"unknown" | "ok" | "off">("unknown");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  // Device-orientation level (mobile only). roll = side-to-side tilt in degrees.
  // levelState: "unknown" before first reading or unsupported, "ok" when within
  // tolerance, "off" when phone is tilted. "needs-permission" on iOS 13+ until
  // the user taps the enable button (gesture-required by Safari).
  const [levelRoll, setLevelRoll] = useState<number | null>(null);
  const [levelState, setLevelState] = useState<"unknown" | "ok" | "off" | "needs-permission" | "unsupported">("unknown");
  const orientationHandlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const attachOrientation = useCallback(() => {
    if (orientationHandlerRef.current) return;
    const handler = (e: DeviceOrientationEvent) => {
      const gamma = typeof e.gamma === "number" ? e.gamma : null;
      const beta = typeof e.beta === "number" ? e.beta : null;
      if (gamma === null || beta === null) return;
      // Roll = side-to-side tilt (gamma). Phone held upright in portrait selfie
      // posture has beta ≈ 60–100° and gamma ≈ 0°. Level when |gamma| < 4°.
      setLevelRoll(gamma);
      const usable = beta > 40 && beta < 120;
      setLevelState(usable && Math.abs(gamma) < 4 ? "ok" : "off");
    };
    orientationHandlerRef.current = handler;
    window.addEventListener("deviceorientation", handler, true);
  }, []);

  const requestLevelPermission = useCallback(async () => {
    type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
    const Ctor = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : null) as IOSOrientation | null;
    if (Ctor?.requestPermission) {
      try {
        const res = await Ctor.requestPermission();
        if (res === "granted") {
          attachOrientation();
        } else {
          setLevelState("unsupported");
        }
      } catch {
        setLevelState("unsupported");
      }
    } else {
      attachOrientation();
    }
  }, [attachOrientation]);

  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setLevelState("unsupported");
      return;
    }
    type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
    const Ctor = DeviceOrientationEvent as IOSOrientation;
    if (typeof Ctor.requestPermission === "function") {
      setLevelState("needs-permission");
    } else {
      attachOrientation();
    }
    return () => {
      if (orientationHandlerRef.current) {
        window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
        orientationHandlerRef.current = null;
      }
    };
  }, [isMobile, attachOrientation]);

  const deviceTip = isMobile
    ? "Hold the phone at arm's length, camera at eye level."
    : "Sit ~50–70 cm from the webcam, eyes level with the lens.";

  const stopAll = useCallback(() => {
    if (lumRafRef.current) cancelAnimationFrame(lumRafRef.current);
    if (stabilizeRafRef.current) cancelAnimationFrame(stabilizeRafRef.current);
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const performCapture = useCallback(async () => {
    if (capturedRef.current || busy || stabilizing) return;
    const v = videoRef.current;
    if (!v || v.readyState < 2) {
      onError("Camera isn't ready yet — give it a second and tap capture again.");
      return;
    }
    if (cardState !== "ok" && !cardOverride) {
      onError(
        cardState === "misaligned"
          ? "Hold the card flat against your forehead with the long edge horizontal."
          : "Place a credit card flat on your forehead so we can measure — we can't see it yet.",
      );
      return;
    }
    if (poseState === "off") {
      onError("Face the camera straight on — keep your head level and look directly at the lens.");
      return;
    }
    if (isMobile && levelState === "off") {
      onError("Hold the phone level — match the bubble to the centre line so the measurement isn't skewed.");
      return;
    }

    setBusy(true);
    setStabilizing(true);
    setStabilizeProgress(0);
    setStabilizeValid(0);

    const w = v.videoWidth;
    const h = v.videoHeight;

    let videoLm: Awaited<ReturnType<typeof getVideoLandmarker>>;
    try {
      videoLm = await getVideoLandmarker();
    } catch (err) {
      console.warn("[scan] landmarker init failed", err);
      setBusy(false);
      setStabilizing(false);
      onError("Couldn't initialise the face tracker. Try again.");
      return;
    }

    interface ValidSample {
      landmarks: NormalizedLandmark[];
      corners: [Point, Point];
      faceEdges: [Point, Point];
      faceWidthMm: number;
    }
    const samples: ValidSample[] = [];
    let totalTicks = 0;
    const TARGET_MS = 3000;
    const MIN_VALID = 30;
    const startTs = performance.now();

    const finalize = () => {
      setStabilizing(false);
      if (samples.length < MIN_VALID) {
        setBusy(false);
        pushEvent("scan_stabilize_failed", { valid_frames: samples.length, min_required: MIN_VALID });
        onError(
          `Nie udało się zebrać wystarczającej liczby stabilnych klatek (${samples.length}/${MIN_VALID}). ` +
          "Trzymaj głowę i kartę nieruchomo, patrz prosto w obiektyw i spróbuj ponownie.",
        );
        return;
      }

      const sorted = [...samples].sort((a, b) => a.faceWidthMm - b.faceWidthMm);
      const median = sorted[Math.floor(sorted.length / 2)];

      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d");
      if (!ctx) {
        setBusy(false);
        onError("Capture failed — please try again.");
        return;
      }
      ctx.drawImage(v, 0, 0, w, h);
      const dataUrl = cv.toDataURL("image/jpeg", 0.92);

      capturedRef.current = true;
      stopAll();
      const rejectedPct = totalTicks > 0 ? Math.round(((totalTicks - samples.length) / totalTicks) * 100) : 0;
      pushEvent("scan_captured", {
        stabilized: true,
        valid_frames: samples.length,
        total_frames_attempted: totalTicks,
        median_face_width_mm: median.faceWidthMm,
        rejected_pct: rejectedPct,
      });
      onCaptured({
        dataUrl,
        width: w,
        height: h,
        landmarks: median.landmarks,
        canvas: cv,
        stabilized: {
          cardCorners: median.corners,
          faceEdges: median.faceEdges,
          medianFaceWidthMm: median.faceWidthMm,
          frameCount: samples.length,
        },
      });
    };

    const tick = () => {
      totalTicks++;
      const now = performance.now();
      const elapsed = now - startTs;
      setStabilizeProgress(Math.min(100, (elapsed / TARGET_MS) * 100));

      try {
        const res = videoLm.detectForVideo(v, now);
        const lms = res.faceLandmarks?.[0];
        if (lms && lms.length >= 478) {
          const lEye = lms[33], rEye = lms[263], nose = lms[1];
          const fHead = lms[LANDMARKS.forehead], chin = lms[LANDMARKS.chin];
          const faceLeft = lms[LANDMARKS.faceLeftTemple];
          const faceRight = lms[LANDMARKS.faceRightTemple];
          if (lEye && rEye && nose && fHead && chin && faceLeft && faceRight) {
            const dx = rEye.x - lEye.x;
            const dy = rEye.y - lEye.y;
            const rollDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
            const midX = (lEye.x + rEye.x) / 2;
            const eyeW = Math.max(1e-4, Math.abs(rEye.x - lEye.x));
            const yawRatio = Math.abs((nose.x - midX) / eyeW);
            const faceH = Math.max(1e-4, chin.y - fHead.y);
            const pitchRatio = Math.abs(((nose.y - fHead.y) / faceH) - 0.55);
            // Strict ~5° pose gate (sin 5° ≈ 0.087).
            const faceFrontal = rollDeg < 5 && yawRatio < 0.09 && pitchRatio < 0.09;

            if (faceFrontal) {
              const cx = ((faceLeft.x + faceRight.x) / 2) * w;
              const faceWpx = Math.abs((faceRight.x - faceLeft.x) * w);
              const bandW = Math.min(w, faceWpx * 1.5);
              const bandH = Math.max(40, faceWpx * 0.45);
              const bandX = Math.max(0, cx - bandW / 2);
              const bandY = Math.max(0, fHead.y * h - bandH);
              const corner = detectCardCornersInRegion(
                v,
                { x: bandX, y: bandY, w: bandW, h: bandH },
                w,
                h,
              );
              if (corner && corner.confidence >= 0.55) {
                const halfW = faceWpx / 2;
                const expanded = halfW * 1.12;
                const yMid = ((faceLeft.y + faceRight.y) / 2) * h;
                const faceEdges: [Point, Point] = [
                  { x: Math.max(0, cx - expanded), y: yMid },
                  { x: Math.min(w, cx + expanded), y: yMid },
                ];
                try {
                  const m = calculateMeasurements(
                    lms,
                    w,
                    corner.corners[0],
                    corner.corners[1],
                    faceEdges[0],
                    faceEdges[1],
                  );
                  samples.push({
                    landmarks: lms,
                    corners: corner.corners,
                    faceEdges,
                    faceWidthMm: m.faceWidthMm,
                  });
                  setStabilizeValid(samples.length);
                } catch {
                  // out-of-range / measurement error — discard this frame
                }
              }
            }
          }
        }
      } catch {
        // landmarker hiccup — keep collecting
      }

      if (elapsed < TARGET_MS) {
        stabilizeRafRef.current = requestAnimationFrame(tick);
      } else {
        finalize();
      }
    };

    stabilizeRafRef.current = requestAnimationFrame(tick);
  }, [busy, stabilizing, cardState, cardOverride, poseState, levelState, isMobile, onCaptured, onError, stopAll]);

  const startTimer = useCallback(() => {
    if (busy || countdown !== null) return;
    setCountdown(3);
    timerRef.current = window.setInterval(() => {
      setCountdown((n) => {
        if (n === null) return null;
        if (n <= 1) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          performCapture();
          return null;
        }
        return n - 1;
      });
    }, 1000);
  }, [busy, countdown, performCapture]);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    setCountdown(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
        setReady(true);
        pushEvent("scan_camera_active");
      } catch (err) {
        const reason = err instanceof Error && err.name === "NotAllowedError" ? "permission_denied" : "camera_error";
        pushEvent("scan_error", { error_type: reason });
        onError(
          reason === "permission_denied"
            ? "We need camera access to scan. Allow it in your browser, or use the manual wizard."
            : "Couldn't start the camera. Try a different browser or device.",
        );
        return;
      }

      // Cheap luminance loop — warn about low light + live-detect the card on forehead.
      const sample = document.createElement("canvas");
      sample.width = 24; sample.height = 24;
      const sctx = sample.getContext("2d");
      // Forehead band sampler for card-on-forehead detection.
      const CARD_W = 80;
      const CARD_H = 32;
      const cardCv = document.createElement("canvas");
      cardCv.width = CARD_W; cardCv.height = CARD_H;
      const cctx = cardCv.getContext("2d", { willReadFrequently: true });
      let last = 0;
      let lastCard = 0;
      let lastFace = 0;
      let faceBusy = false;
      let videoLm: Awaited<ReturnType<typeof getVideoLandmarker>> | null = null;
      getVideoLandmarker().then((lm) => { if (!cancelled) videoLm = lm; }).catch(() => { /* noop */ });
      const tick = (ts: number) => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          lumRafRef.current = requestAnimationFrame(tick);
          return;
        }
        if (ts - last > 400 && sctx) {
          last = ts;
          try {
            sctx.drawImage(v, 0, 0, 24, 24);
            const d = sctx.getImageData(0, 0, 24, 24).data;
            let sum = 0;
            for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const lum = sum / (d.length / 4);
            setLighting(lum > 100 ? "green" : lum > 70 ? "yellow" : "red");
          } catch { /* CORS */ }
        }
        // Card-on-forehead detection ~3x/sec: sample the upper-forehead band
        // inside the oval guide and compute mean vertical vs horizontal gradients.
        if (ts - lastCard > 300 && cctx) {
          lastCard = ts;
          try {
            const vw = v.videoWidth;
            const vh = v.videoHeight;
            if (vw > 0 && vh > 0) {
              // Forehead band: widened to y 12%–45% to tolerate variable
              // head position and card placement (users often hold the card
              // lower on the forehead than the reference photo suggests).
              const sxF = vw * 0.2;
              const syF = vh * 0.12;
              const swF = vw * 0.6;
              const shF = vh * 0.33;
              cctx.drawImage(v, sxF, syF, swF, shF, 0, 0, CARD_W, CARD_H);
              const img = cctx.getImageData(0, 0, CARD_W, CARD_H).data;
              const lumBuf = new Float32Array(CARD_W * CARD_H);
              for (let i = 0; i < CARD_W * CARD_H; i++) {
                const o = i * 4;
                lumBuf[i] = 0.299 * img[o] + 0.587 * img[o + 1] + 0.114 * img[o + 2];
              }
              let vSum = 0, hSum = 0, n = 0;
              const rowV = new Float32Array(CARD_H);
              for (let y = 1; y < CARD_H - 1; y++) {
                let rowVSum = 0;
                for (let x = 1; x < CARD_W - 1; x++) {
                  const i = y * CARD_W + x;
                  const dv = Math.abs(lumBuf[i + CARD_W] - lumBuf[i - CARD_W]);
                  const dh = Math.abs(lumBuf[i + 1] - lumBuf[i - 1]);
                  vSum += dv;
                  hSum += dh;
                  rowVSum += dv;
                  n++;
                }
                rowV[y] = rowVSum / Math.max(1, CARD_W - 2);
              }
              const vGrad = n > 0 ? vSum / n : 0;
              const hGrad = n > 0 ? hSum / n : 0;
              // Peak + median row-vertical-gradient → structural check that
              // rejects noisy backgrounds without a single dominant edge.
              const rowVals = Array.from(rowV.subarray(1, CARD_H - 1)).sort((a, b) => a - b);
              const peakRowV = rowVals.length ? rowVals[rowVals.length - 1] : 0;
              const medianRowV = rowVals.length ? rowVals[Math.floor(rowVals.length / 2)] : 0;
              const cls = classifyCardSample(vGrad, hGrad, { peakRowV, medianRowV });
              // Second-stage validation: when the gradient classifier says
              // "ok", confirm with the stricter corner detector that requires
              // a long contiguous straight horizontal edge spanning >=40% of
              // the ROI. This rejects hairlines, eyebrows, shirt collars,
              // and other near-horizontal but jagged/curved edges that fool
              // the row-gradient heuristic.
              let next = cls.nextState;
              if (next === "ok") {
                const corner = detectCardCornersInRegion(
                  v,
                  { x: sxF, y: syF, w: swF, h: shF },
                  vw,
                  vh,
                );
                if (!corner || corner.confidence < 0.55) {
                  // Edge looks card-ish in gradient stats but no straight
                  // continuous line found → likely hair/skin contour. Keep
                  // the user in "place card" rather than green-light.
                  next = "none";
                }
              }
              setCardState((prev) => {
                if (prev === next) return prev;
                return next;
              });
              // Track how long the card has been missing → after 5s offer a
              // manual override (some cards/skin tones fail local detection
              // even when the card is correctly placed — Gemini will still
              // validate post-capture).
              if (next === "none") {
                if (cardMissingSinceRef.current === null) cardMissingSinceRef.current = ts;
                else if (ts - cardMissingSinceRef.current > 5000) setShowCardOverride(true);
              } else {
                cardMissingSinceRef.current = null;
                setShowCardOverride(false);
                setCardOverride(false);
              }
            }
          } catch { /* CORS */ }
        }
        // Face distance + pose: run video landmarker ~1.4x/sec.
        if (ts - lastFace > 700 && videoLm && !faceBusy) {
          lastFace = ts;
          faceBusy = true;
          try {
            const vw = v.videoWidth;
            const vh = v.videoHeight;
            if (vw > 0 && vh > 0) {
              const res = videoLm.detectForVideo(v, ts);
              const lms = res.faceLandmarks?.[0];
              if (lms && lms.length >= 478) {
                let minX = 1, maxX = 0;
                for (let i = 0; i < lms.length; i++) {
                  const x = lms[i].x;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                }
                const facePctW = Math.max(0, Math.min(1, maxX - minX));
                // Mobile camera frame is portrait — relative width ~0.50–0.65 is ideal.
                // Above ~0.72 the face crowds the oval and the card edge gets clipped.
                const nextDist: typeof distanceState =
                  facePctW > 0.72 ? "too_close" : facePctW < 0.32 ? "too_far" : "ok";
                setDistanceState((prev) => (prev === nextDist ? prev : nextDist));

                // Pose lock: compute proxies for roll / yaw / pitch from
                // MediaPipe canonical landmarks. Capture is gated until the
                // user is facing the camera dead-on.
                //   33   = left eye outer corner
                //   263  = right eye outer corner
                //   1    = nose tip
                //   10   = forehead top center
                //   152  = chin tip
                const lEye = lms[33], rEye = lms[263], nose = lms[1];
                const fHead = lms[10], chin = lms[152];
                if (lEye && rEye && nose && fHead && chin) {
                  const dx = (rEye.x - lEye.x);
                  const dy = (rEye.y - lEye.y);
                  // Roll: tilt of the eye line vs horizontal (deg).
                  const rollDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
                  // Yaw proxy: nose tip x position relative to the midpoint
                  // between the eye outers, normalized by eye width. 0 = dead
                  // on; |0.18| ≈ ~15° head turn.
                  const midX = (lEye.x + rEye.x) / 2;
                  const eyeW = Math.max(1e-4, Math.abs(rEye.x - lEye.x));
                  const yawRatio = Math.abs((nose.x - midX) / eyeW);
                  // Pitch proxy: nose y between forehead and chin. 0.5 = level.
                  const faceH = Math.max(1e-4, chin.y - fHead.y);
                  const pitchRatio = Math.abs(((nose.y - fHead.y) / faceH) - 0.55);
                  const facing = rollDeg < 6 && yawRatio < 0.12 && pitchRatio < 0.10;
                  const nextPose: typeof poseState = facing ? "ok" : "off";
                  setPoseState((prev) => (prev === nextPose ? prev : nextPose));
                }
              } else {
                setDistanceState((prev) => (prev === "unknown" ? prev : "unknown"));
                setPoseState((prev) => (prev === "unknown" ? prev : "unknown"));
              }
            }
          } catch { /* noop */ }
          faceBusy = false;
        }
        lumRafRef.current = requestAnimationFrame(tick);
      };
      lumRafRef.current = requestAnimationFrame(tick);
    };

    start();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, [onError, stopAll]);

  const lightingColor = lighting === "green" ? "#4ade80" : lighting === "yellow" ? "#facc15" : "#ef4444";
  const lightingLabel = lighting === "green" ? "Good light" : lighting === "yellow" ? "OK light" : "Too dark";
  const cardColor =
    cardState === "ok" || cardOverride
      ? "#4ade80"
      : cardState === "misaligned"
        ? "#facc15"
        : "#ef4444";
  const cardLabel =
    cardOverride
      ? "Card confirmed (manual)"
      : cardState === "ok"
        ? "Card detected"
        : cardState === "misaligned"
          ? "Rotate card flat & horizontal"
          : "Place card on forehead";
  const distanceColor =
    distanceState === "ok" ? "#4ade80" : distanceState === "unknown" ? "#facc15" : "#ef4444";
  const distanceLabel =
    distanceState === "too_close"
      ? "Move farther from the camera"
      : distanceState === "too_far"
        ? "Move closer to the camera"
        : distanceState === "ok"
          ? "Good distance"
          : "Center your face in the oval";
  const showDistanceHint = distanceState === "too_close" || distanceState === "too_far";
  const poseColor = poseState === "ok" ? "#4ade80" : poseState === "off" ? "#ef4444" : "#facc15";
  const poseLabel = poseState === "ok" ? "Facing camera" : poseState === "off" ? "Look straight ahead" : "Center your face";
  const showPoseHint = poseState === "off";
  const captureBlocked =
    !ready || busy || countdown !== null ||
    (cardState !== "ok" && !cardOverride) ||
    poseState === "off" ||
    (isMobile && levelState === "off");

  const levelColor =
    levelState === "ok"
      ? "#4ade80"
      : levelState === "off"
        ? "#ef4444"
        : "#facc15";
  const levelLabel =
    levelState === "ok"
      ? "Phone level"
      : levelState === "off"
        ? "Hold phone level"
        : levelState === "needs-permission"
          ? "Tap to enable level"
          : "Level unavailable";

  // ─── MOBILE: full-bleed camera with floating controls ───
  if (isMobile) {
    return (
      <div className="scan-mobile-shell">
        <div className="scan-mobile-camera">
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              background: "#000",
            }}
          />
          {/* Face oval guide */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            <defs>
              <mask id="ovalMask">
                <rect width="100" height="100" fill="white" />
                <ellipse cx="50" cy="48" rx="28" ry="38" fill="black" />
              </mask>
            </defs>
            <rect width="100" height="100" fill="rgba(0,0,0,0.35)" mask="url(#ovalMask)" />
            <ellipse cx="50" cy="48" rx="28" ry="38" fill="none" stroke={GOLD} strokeWidth="0.4" strokeDasharray="1.5 1.5" opacity="0.9" />
          </svg>

          {/* Lighting + tip pill */}
          <div className="scan-mobile-topbar">
            <span className="scan-mobile-pill">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: lightingColor, boxShadow: `0 0 6px ${lightingColor}` }} />
              {lightingLabel}
            </span>
            <span className="scan-mobile-pill" style={{ borderColor: cardColor }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: cardColor, boxShadow: `0 0 6px ${cardColor}` }} />
              {cardLabel}
            </span>
            {showDistanceHint && (
              <span className="scan-mobile-pill" style={{ borderColor: distanceColor }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: distanceColor, boxShadow: `0 0 6px ${distanceColor}` }} />
                {distanceLabel}
              </span>
            )}
            {showPoseHint && (
              <span className="scan-mobile-pill" style={{ borderColor: poseColor }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: poseColor, boxShadow: `0 0 6px ${poseColor}` }} />
                {poseLabel}
              </span>
            )}
            {levelState !== "unsupported" && (
              <button
                type="button"
                onClick={levelState === "needs-permission" ? requestLevelPermission : undefined}
                className="scan-mobile-pill"
                style={{
                  borderColor: levelColor,
                  background: "rgba(0,0,0,0.55)",
                  cursor: levelState === "needs-permission" ? "pointer" : "default",
                }}
                aria-live="polite"
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: levelColor, boxShadow: `0 0 6px ${levelColor}` }} />
                {levelLabel}
              </button>
            )}
          </div>

          {/* Bubble level: horizontal line with a dot that slides as the phone rolls.
              Only render when we have a live reading. */}
          {levelState !== "unsupported" && levelState !== "needs-permission" && levelRoll !== null && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "55%",
                maxWidth: 260,
                pointerEvents: "none",
                zIndex: 4,
              }}
            >
              <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.35)", borderRadius: 2 }}>
                {/* centre tick */}
                <span style={{ position: "absolute", left: "50%", top: -6, width: 2, height: 14, background: "rgba(255,255,255,0.55)", transform: "translateX(-50%)" }} />
                {/* bubble — clamp to ±25° for display */}
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${50 + Math.max(-25, Math.min(25, levelRoll)) * 2}%`,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: levelColor,
                    border: "2px solid rgba(0,0,0,0.55)",
                    boxShadow: `0 0 8px ${levelColor}`,
                    transform: "translate(-50%, -50%)",
                    transition: "left 80ms linear, background 200ms ease",
                  }}
                />
              </div>
            </div>
          )}

          {showCardOverride && !cardOverride && (
            <button
              type="button"
              onClick={() => { setCardOverride(true); setShowCardOverride(false); }}
              style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "10px 16px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.78)",
                color: "#fff",
                border: `1px solid ${GOLD}`,
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                zIndex: 5,
              }}
            >
              Card is on my forehead — press to confirm
            </button>
          )}

          {countdown !== null && (
            <div className="scan-mobile-countdown" aria-live="assertive">{countdown}</div>
          )}

          {stabilizing && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(8,8,7,0.78)",
                border: `1px solid ${GOLD}`,
                color: "#fff",
                fontFamily: "Barlow, sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                zIndex: 5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span>Pomiar… trzymaj nieruchomo</span>
                <span style={{ color: GOLD, fontVariantNumeric: "tabular-nums" }}>{stabilizeValid}/30</span>
              </div>
              <div style={{ width: "100%", height: 5, borderRadius: 999, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: `${Math.round(stabilizeProgress)}%`, height: "100%", background: GOLD, transition: "width 120ms linear" }} />
              </div>
            </div>
          )}
        </div>

        <div className="scan-mobile-controls">
          <button
            type="button"
            className="scan-shutter"
            aria-label="Capture photo"
            onClick={performCapture}
            disabled={captureBlocked}
          >
            <span className="scan-shutter-inner" />
          </button>
          <div className="scan-mobile-secondary">
            <button type="button" onClick={countdown !== null ? cancelTimer : startTimer} disabled={!ready || busy}>
              {countdown !== null ? "Cancel timer" : "3-second timer"}
            </button>
            <Link to={`/${lang}/fit`}>Manual wizard →</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── DESKTOP: contained 4/3 viewport ───
  return (
    <div className="flex flex-col gap-5">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: n <= 2 ? GOLD : "rgba(255,255,255,0.18)",
              display: "inline-block",
            }}
          />
        ))}
        <span style={{ marginLeft: 10, color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Step 2 of 4 — Capture photo
        </span>
      </div>

      <div
        className="scan-camera"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
        />
        {/* Oval guide */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <defs>
            <mask id="ovalMaskDesk">
              <rect width="100" height="100" fill="white" />
              <ellipse cx="50" cy="50" rx="26" ry="40" fill="black" />
            </mask>
          </defs>
          <rect width="100" height="100" fill="rgba(0,0,0,0.35)" mask="url(#ovalMaskDesk)" />
          <ellipse cx="50" cy="50" rx="26" ry="40" fill="none" stroke={GOLD} strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.85" />
        </svg>

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: lightingColor, boxShadow: `0 0 6px ${lightingColor}` }} />
          {lightingLabel}
        </div>

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: `1px solid ${cardColor}`,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: cardColor, boxShadow: `0 0 6px ${cardColor}` }} />
          {cardLabel}
        </div>

        {showDistanceHint && (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${distanceColor}`,
              color: "rgba(255,255,255,0.95)",
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              zIndex: 4,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: distanceColor, boxShadow: `0 0 6px ${distanceColor}` }} />
            {distanceLabel}
          </div>
        )}

        {showPoseHint && (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              bottom: showDistanceHint ? 48 : 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${poseColor}`,
              color: "rgba(255,255,255,0.95)",
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              zIndex: 4,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: poseColor, boxShadow: `0 0 6px ${poseColor}` }} />
            {poseLabel}
          </div>
        )}

        {showCardOverride && !cardOverride && (
          <button
            type="button"
            onClick={() => { setCardOverride(true); setShowCardOverride(false); }}
            style={{
              position: "absolute",
              top: 50,
              left: 12,
              padding: "8px 12px",
              borderRadius: 6,
              background: "rgba(0,0,0,0.78)",
              color: "#fff",
              border: `1px solid ${GOLD}`,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              zIndex: 5,
            }}
          >
            Card is on my forehead
          </button>
        )}


        {countdown !== null && (
          <div
            aria-live="assertive"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "8rem",
              fontWeight: 300,
              color: GOLD,
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
          >
            {countdown}
          </div>
        )}
      </div>

      <figure
        className="scan-like-this"
        style={{
          display: "flex",
          gap: 14,
          alignItems: "stretch",
          margin: 0,
          padding: 12,
          border: `1px solid rgba(202,164,73,0.35)`,
          background: "rgba(201,168,76,0.06)",
          borderRadius: 6,
        }}
      >
        <img
          src={fitScanTip}
          alt="Example: credit card laid flat and horizontal on the forehead"
          loading="lazy"
          style={{ width: 96, height: 144, objectFit: "cover", borderRadius: 4, flexShrink: 0, background: "#000" }}
        />
        <figcaption style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.82rem", lineHeight: 1.5, color: "rgba(255,255,255,0.78)" }}>
          <strong style={{ display: "block", color: GOLD, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.7rem", marginBottom: 4 }}>
            Like this
          </strong>
          Card flat against the forehead, long edge horizontal across the brow. Hold by the top edge so your fingers don't cover the bottom corners.
        </figcaption>
      </figure>

      <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", textAlign: "center", margin: 0 }}>
        {deviceTip}
      </p>

      <div className="flex flex-col gap-3">
        {stabilizing && (
          <div
            role="status"
            aria-live="polite"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "12px 14px",
              border: `1px solid ${GOLD}`,
              borderRadius: 8,
              background: "rgba(202,164,73,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.78rem",
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              <span>Pomiar… trzymaj nieruchomo</span>
              <span style={{ color: GOLD, fontVariantNumeric: "tabular-nums" }}>
                {stabilizeValid}/30
              </span>
            </div>
            <div
              aria-hidden
              style={{
                width: "100%",
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.round(stabilizeProgress)}%`,
                  height: "100%",
                  background: GOLD,
                  transition: "width 120ms linear",
                }}
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={performCapture}
          disabled={captureBlocked}
          style={{
            background: captureBlocked ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            padding: "18px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: captureBlocked ? "not-allowed" : "pointer",
            height: 52,
          }}
        >
          {stabilizing
            ? `Measuring… ${Math.round(stabilizeProgress)}%`
            : busy
              ? "Analyzing…"
              : countdown !== null
                ? `Capturing in ${countdown}…`
                : poseState === "off"
                  ? "Look straight at the camera"
                  : cardState !== "ok" && !cardOverride
                    ? cardLabel
                    : "Capture now"}
        </button>
        <button
          type="button"
          onClick={countdown !== null ? cancelTimer : startTimer}
          disabled={!ready || busy}
          style={{
            background: "transparent",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--cream-dim))",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            padding: "12px 0",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: !ready || busy ? "not-allowed" : "pointer",
          }}
        >
          {countdown !== null ? "Cancel timer" : "Use 3-second timer"}
        </button>
      </div>

      <details
        className="scan-tips-accordion"
        open={tipsOpen}
        onToggle={(e) => setTipsOpen((e.target as HTMLDetailsElement).open)}
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: 6,
          padding: "12px 14px",
          color: "hsl(var(--cream-dim))",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.85rem",
        }}
      >
        <summary style={{ cursor: "pointer", color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.72rem" }}>
          Tips for accuracy
        </summary>
        <ul style={{ marginTop: 10, lineHeight: 1.6, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Push your hair back off your forehead before scanning.",
            "Take off your glasses before scanning.",
            "Lay the card flat on your forehead, long edge horizontal.",
            "Hold the card by its top edge — keep fingers off the bottom corners.",
            "Don't tilt the card or camera; even a small tilt = 3–6 mm error.",
            "Look straight at the lens.",
          ].map((t) => (
            <li key={t} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </details>

      <Link
        to={`/${lang}/fit`}
        style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.75rem", textAlign: "center", textDecoration: "none" }}
      >
        Use the manual wizard →
      </Link>
    </div>
  );
}

/* ─────────────── Annotate ─────────────── */

interface AnnotateStepProps {
  frame: CapturedFrame;
  onCalculate: (cardCorners: [Point, Point], faceEdges: [Point, Point]) => void;
  onRetake: () => void;
  fallbackReason?: "no_edge" | "validation" | null;
  initialCard?: [Point, Point] | null;
  initialFace?: [Point, Point] | null;
}

function AnnotateStep({ frame, onCalculate, onRetake, fallbackReason = null, initialCard = null, initialFace = null }: AnnotateStepProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [cardCorners, setCardCorners] = useState<Point[]>(initialCard ? [initialCard[0], initialCard[1]] : []);
  const [faceEdges, setFaceEdges] = useState<Point[]>(initialFace ? [initialFace[0], initialFace[1]] : []);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const draggingRef = useRef<number | null>(null);
  const HINT_KEY = "woolet_scan_drag_hint_seen";
  const [showDragHint, setShowDragHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  // Zoom & pan for precise dot adjustment after capture.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const ZOOM_STEPS = [1, 1.5, 2, 3, 4] as const;

  const clampPan = useCallback((p: { x: number; y: number }, z: number) => {
    const vp = viewportRef.current;
    const wrap = wrapperRef.current;
    if (!vp || !wrap) return p;
    const vRect = vp.getBoundingClientRect();
    // Wrapper's untransformed size matches its layout (object-fit: cover fills it)
    const w = wrap.clientWidth * z;
    const h = wrap.clientHeight * z;
    // Allowed pan range so the scaled wrapper still covers the viewport (no empty space)
    const baseLeft = (vRect.width - wrap.clientWidth) / 2;
    const baseTop = (vRect.height - wrap.clientHeight) / 2;
    // With transformOrigin 0 0 and translate-then-scale, painted left = baseLeft + pan.x
    // and painted right = baseLeft + pan.x + w. We want painted left <= 0 and painted right >= vRect.width
    // when z>1; when z===1, lock pan to 0.
    if (z <= 1) return { x: 0, y: 0 };
    const minX = vRect.width - baseLeft - w;
    const maxX = -baseLeft;
    const minY = vRect.height - baseTop - h;
    const maxY = -baseTop;
    return {
      x: Math.min(maxX, Math.max(minX, p.x)),
      y: Math.min(maxY, Math.max(minY, p.y)),
    };
  }, []);

  const changeZoom = useCallback((next: number) => {
    setZoom((cur) => {
      const z = Math.max(1, Math.min(4, next));
      if (z === cur) return cur;
      // Re-center around the bounding box of placed points so user immediately
      // sees what they're adjusting.
      setPan((p) => clampPan(p, z));
      return z;
    });
  }, [clampPan]);

  const dismissHint = useCallback(() => {
    setShowDragHint(false);
    setHintDismissed(true);
    try { localStorage.setItem(HINT_KEY, "1"); } catch { /* noop */ }
  }, []);

  // Show one-time hint the moment both corners are placed
  useEffect(() => {
    if (cardCorners.length !== 2 || hintDismissed) return;
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === "1"; } catch { /* noop */ }
    if (seen) return;
    setShowDragHint(true);
    const t = window.setTimeout(() => setShowDragHint(false), 4500);
    return () => window.clearTimeout(t);
  }, [cardCorners.length, hintDismissed]);

  // Auto-dismiss as soon as the user actually drags
  useEffect(() => {
    if (!showDragHint) return;
    if (draggingRef.current !== null) dismissHint();
  }, [showDragHint, dismissHint, cardCorners]);

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;
      setDisplaySize({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Lock page scroll while annotating so dragging dots on mobile does not move the page.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const eventToNative = (clientX: number, clientY: number) => {
    const el = wrapperRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const xDisplay = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const yDisplay = Math.max(0, Math.min(rect.height, clientY - rect.top));
    // Image is mirrored (scaleX(-1)) so flip X back to native frame coords
    const xNativeMirrored = (xDisplay / rect.width) * frame.width;
    const xNative = frame.width - xNativeMirrored;
    const yNative = (yDisplay / rect.height) * frame.height;
    return { x: xNative, y: yNative };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current !== null) return;
    // When zoomed in, dragging the background pans the image instead of
    // placing a new point. Lets the user fine-tune dots that are already placed.
    if (zoom > 1) {
      panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      return;
    }
    const p = eventToNative(e.clientX, e.clientY);
    if (!p) return;
    if (cardCorners.length < 2) {
      setCardCorners((c) => [...c, p]);
      return;
    }
    if (faceEdges.length < 2) {
      setFaceEdges((c) => [...c, p]);
    }
  };

  const startDrag = (idx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    draggingRef.current = idx;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handleDotMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Panning takes priority over dot dragging
    if (panStartRef.current) {
      const ps = panStartRef.current;
      const next = clampPan({ x: ps.px + (e.clientX - ps.x), y: ps.py + (e.clientY - ps.y) }, zoom);
      setPan(next);
      return;
    }
    const idx = draggingRef.current;
    if (idx === null) return;
    e.stopPropagation();
    const p = eventToNative(e.clientX, e.clientY);
    if (!p) return;
    if (idx < 2) {
      setCardCorners((cs) => cs.map((c, i) => (i === idx ? p : c)));
      return;
    }
    setFaceEdges((cs) => cs.map((c, i) => (i === idx - 2 ? p : c)));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panStartRef.current) {
      panStartRef.current = null;
      try { (e.currentTarget as Element).releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
      return;
    }
    if (draggingRef.current === null) return;
    e.stopPropagation();
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
    draggingRef.current = null;
  };

  const reset = () => {
    setCardCorners([]);
    setFaceEdges([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const cardPxNative =
    cardCorners.length === 2 ? Math.hypot(cardCorners[1].x - cardCorners[0].x, cardCorners[1].y - cardCorners[0].y) : 0;


  const scaleX = displaySize.w ? displaySize.w / frame.width : 1;
  const scaleY = displaySize.h ? displaySize.h / frame.height : 1;
  const totalPoints = cardCorners.length + faceEdges.length;
  const allPoints = [...cardCorners, ...faceEdges];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: BG,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overscrollBehavior: "none",
      }}
    >
      {/* Minimal top bar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px",
          background: "rgba(8,8,7,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={onRetake}
          style={{
            background: "transparent",
            border: "none",
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "6px 8px",
          }}
        >
          ← Retake
        </button>
        <span
          style={{
            color: "#f0ece4",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {cardCorners.length < 2
            ? `Tap card corners (${cardCorners.length}/2)`
            : faceEdges.length < 2
              ? `Tap face edges (${faceEdges.length}/2)`
              : "All 4 points placed ✓"}
        </span>
        {totalPoints > 0 ? (
          <button
            onClick={reset}
            style={{
              background: "transparent",
              border: "none",
              color: GOLD,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "6px 8px",
            }}
          >
            Reset
          </button>
        ) : (
          <span style={{ width: 56 }} />
        )}
      </div>

      {fallbackReason && totalPoints === 0 && (
        <div
          role="status"
          style={{
            flexShrink: 0,
            padding: "10px 14px",
            background: "rgba(56, 38, 0, 0.55)",
            borderBottom: "1px solid rgba(250,204,21,0.45)",
            color: "rgba(255,255,255,0.86)",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.82rem",
            lineHeight: 1.4,
          }}
        >
          Tap the two bottom corners of the card, then the widest left & right outline of your face. Drag any dot to fine-tune.
        </div>
      )}

      {/* Frozen image area */}
      <div
        ref={viewportRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          ref={wrapperRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handleDotMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: "relative",
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: `${frame.width} / ${frame.height}`,
            width: displaySize.h
              ? `min(100%, ${(frame.width / frame.height) * 100}vh)`
              : "100%",
            height: "auto",
            cursor: zoom > 1 ? "grab" : totalPoints < 4 ? "crosshair" : "default",
            background: "#000",
            touchAction: "none",
            overflow: "hidden",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <img
            src={frame.dataUrl}
            alt="Captured frame for measurement"
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block", pointerEvents: "none" }}
          />
          {cardCorners.length === 2 && (
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <line
                x1={(frame.width - cardCorners[0].x) * scaleX}
                y1={cardCorners[0].y * scaleY}
                x2={(frame.width - cardCorners[1].x) * scaleX}
                y2={cardCorners[1].y * scaleY}
                stroke={GOLD}
                strokeWidth={2}
              />
              {faceEdges.length === 2 && (
                <line
                  x1={(frame.width - faceEdges[0].x) * scaleX}
                  y1={faceEdges[0].y * scaleY}
                  x2={(frame.width - faceEdges[1].x) * scaleX}
                  y2={faceEdges[1].y * scaleY}
                  stroke="rgba(240,236,228,0.85)"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              )}
            </svg>
          )}
          {allPoints.map((c, i) => {
            const isCardPoint = i < 2;
            const label = isCardPoint ? `Card corner ${i + 1}` : `Face edge ${i - 1}`;
            return (
              <div
                key={i}
                onPointerDown={startDrag(i)}
                onPointerMove={handleDotMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                role="slider"
                aria-label={`${label} — drag to adjust`}
                style={{
                  position: "absolute",
                  left: (frame.width - c.x) * scaleX - 14,
                  top: c.y * scaleY - 14,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  touchAction: "none",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: isCardPoint ? GOLD : "#f0ece4",
                    boxShadow: isCardPoint
                      ? `0 0 0 5px rgba(202,164,73,0.22), 0 0 0 1px rgba(0,0,0,0.4)`
                      : `0 0 0 5px rgba(240,236,228,0.18), 0 0 0 1px rgba(0,0,0,0.4)`,
                    display: "block",
                  }}
                />
              </div>
            );
          })}
          {showDragHint && (
            <div
              onPointerDown={(e) => { e.stopPropagation(); dismissHint(); }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",
                background: "rgba(8,8,7,0.92)",
                color: "#f0ece4",
                border: `1px solid ${GOLD}`,
                padding: "10px 14px",
                borderRadius: 999,
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.78rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                maxWidth: "90%",
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              <span>Drag a point to fine-tune</span>
            </div>
          )}
        </div>
        {/* Zoom controls (screen-space; outside transformed wrapper) */}
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 6,
          }}
        >
          <button
            type="button"
            aria-label="Zoom in"
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => {
              e.stopPropagation();
              const i = ZOOM_STEPS.findIndex((z) => z >= zoom);
              const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, (i < 0 ? 0 : i) + 1)];
              changeZoom(next);
            }}
            disabled={zoom >= 4}
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: "rgba(8,8,7,0.85)",
              color: "#f0ece4",
              border: `1px solid ${GOLD}`,
              fontSize: 22, fontFamily: "Barlow, sans-serif",
              cursor: zoom >= 4 ? "not-allowed" : "pointer",
              opacity: zoom >= 4 ? 0.5 : 1,
              lineHeight: 1,
            }}
          >+</button>
          <div
            style={{
              minWidth: 44, height: 26, borderRadius: 13,
              background: "rgba(8,8,7,0.85)",
              color: "#f0ece4",
              border: "1px solid rgba(255,255,255,0.15)",
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.06em",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 6px",
            }}
            aria-live="polite"
          >{Math.round(zoom * 100)}%</div>
          <button
            type="button"
            aria-label="Zoom out"
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => {
              e.stopPropagation();
              const i = ZOOM_STEPS.findIndex((z) => z >= zoom);
              const idx = Math.max(0, (i < 0 ? ZOOM_STEPS.length - 1 : i) - 1);
              changeZoom(ZOOM_STEPS[idx]);
            }}
            disabled={zoom <= 1}
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: "rgba(8,8,7,0.85)",
              color: "#f0ece4",
              border: `1px solid ${GOLD}`,
              fontSize: 22, fontFamily: "Barlow, sans-serif",
              cursor: zoom <= 1 ? "not-allowed" : "pointer",
              opacity: zoom <= 1 ? 0.5 : 1,
              lineHeight: 1,
            }}
          >−</button>
        </div>
      </div>

      {/* Sticky action bar */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 14px calc(env(safe-area-inset-bottom, 0px) + 12px)",
          background: "rgba(8,8,7,0.96)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          disabled={cardCorners.length < 2 || faceEdges.length < 2}
          onClick={() => onCalculate([cardCorners[0], cardCorners[1]], [faceEdges[0], faceEdges[1]])}
          style={{
            background: cardCorners.length < 2 || faceEdges.length < 2 ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            padding: "16px 24px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: cardCorners.length < 2 || faceEdges.length < 2 ? "not-allowed" : "pointer",
            height: 52,
            width: "100%",
          }}
        >
          {cardCorners.length < 2 || faceEdges.length < 2
            ? `Tap ${4 - totalPoints} more point${4 - totalPoints === 1 ? "" : "s"}`
            : "Calculate my measurements"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Result ─────────────── */

interface ResultStepProps {
  measurements: Measurements;
  recommendation: Recommendation;
  faceShape: FaceShapeResult | null;
  onRetake: () => void;
  lang: Lang;
}

function ResultStep({ measurements, recommendation: baseRecommendation, faceShape, onRetake, lang }: ResultStepProps) {
  const { user: authedUser } = useAuth();
  // Depth correction: if the card was held in front of the face (not flush to skin),
  // it appears larger in pixels → face width is underestimated. Assuming a typical
  // capture distance of ~60 cm, a gap g (cm) scales the result by 60 / (60 - g).
  const [cardOffset, setCardOffset] = useState(false);
  const [gapCm, setGapCm] = useState(2);
  const CAPTURE_DIST_CM = 60;
  const correctionFactor = cardOffset
    ? CAPTURE_DIST_CM / Math.max(1, CAPTURE_DIST_CM - gapCm)
    : 1;
  const adjustedFace = Math.round(measurements.faceWidthMm * correctionFactor);
  const adjustedNose = Math.round(measurements.noseWidthMm * correctionFactor);
  const recommendation = cardOffset
    ? getRecommendation(adjustedFace, adjustedNose)
    : baseRecommendation;

  // Confidence rating: combines scanner confidence with depth-correction state.
  const confidenceRating: "high" | "medium" | "low" =
    cardOffset && gapCm >= 2
      ? "low"
      : adjustedFace < 140 || adjustedFace > 170
        ? "medium"
        : measurements.confidence === "high"
          ? "high"
          : "medium";
  const confidenceCopy = {
    high: { label: "High confidence", color: "hsl(var(--cream))", body: "Landmarks and card edges aligned cleanly." },
    medium: { label: "Medium confidence", color: GOLD, body: "Usable result — verify against a known-fitting frame if possible." },
    low: { label: "Low confidence", color: "#c47a4a", body: "Depth correction applied. For best accuracy, re-scan with the card flush to your skin." },
  }[confidenceRating];

  const handleCta = () => {
    pushEvent("scan_cta_clicked", {
      cta_label: recommendation.primaryCta.toLowerCase().replace(/[^a-z]+/g, "_"),
      recommendation_type: recommendation.type,
      card_offset: cardOffset,
      gap_cm: cardOffset ? gapCm : 0,
      adjusted_face_width_mm: adjustedFace,
    });
  };

  const downloadCard = () => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 500;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = GOLD;
    ctx.font = "300 36px 'Cormorant Garamond', serif";
    ctx.fillText("Woolet AI Fit", 60, 80);
    ctx.fillStyle = "#888";
    ctx.font = "300 14px Barlow, sans-serif";
    ctx.fillText("FACE WIDTH", 60, 160);
    ctx.fillText("NOSE WIDTH", 420, 160);
    ctx.fillStyle = GOLD;
    ctx.font = "300 96px 'Cormorant Garamond', serif";
    ctx.fillText(`${adjustedFace} mm`, 60, 250);
    ctx.fillText(`${adjustedNose} mm`, 420, 250);
    ctx.fillStyle = "#888";
    ctx.font = "300 14px Barlow, sans-serif";
    ctx.fillText(`Confidence: ${measurements.confidence}`, 60, 300);
    ctx.fillText("woolet.co/en/fit", 60, 460);

    const link = document.createElement("a");
    link.download = "woolet-fit.png";
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col gap-7">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, display: "inline-block" }} />
        ))}
        <span style={{ marginLeft: 10, color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Step 4 of 4 — Your measurements
        </span>
      </div>

      {/* Headline metric: face width */}
      <div
        style={{
          border: `1px solid ${GOLD}`,
          borderRadius: 10,
          padding: "32px 26px 28px",
          background: "rgba(201,168,76,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
        }}
      >
        <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          Head width (frame size)
        </div>
        <div
          className="scan-result-number font-display"
          style={{ color: GOLD, fontWeight: 300, fontSize: "clamp(3.75rem, 13vw, 6rem)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center" }}
        >
          <span>{adjustedFace}</span>
          <span style={{ fontSize: "0.32em", color: MUTED, letterSpacing: "0.05em" }}>mm</span>
        </div>
        {cardOffset && (
          <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.08em" }}>
            (raw {measurements.faceWidthMm} mm)
          </div>
        )}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: `${confidenceCopy.color}22`,
            border: `1px solid ${confidenceCopy.color}55`,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: confidenceCopy.color, display: "inline-block" }} />
          <span style={{ color: confidenceCopy.color, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
            ~ {confidenceCopy.label}
          </span>
        </div>
      </div>

      {/* Where you fall — gradient scale */}
      {(() => {
        const SCALE_MIN = 120;
        const SCALE_MAX = 180;
        const clamp = (n: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, n));
        const pct = (n: number) => ((clamp(n) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
        const userPct = pct(adjustedFace);
        const thresholdPct = pct(155);
        return (
          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              padding: "22px 22px 26px",
              background: "hsl(var(--card))",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ color: "hsl(var(--cream))", fontFamily: "Barlow, sans-serif", fontSize: "0.95rem", fontWeight: 500 }}>
              Where you fall
            </div>
            <div style={{ position: "relative", height: 10, marginTop: 18 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #3ec79a 0%, #4aa6d6 45%, #7a6cf0 75%, #2a2638 100%)",
                  opacity: 0.85,
                }}
              />
              {/* Threshold marker at 155mm */}
              <div style={{ position: "absolute", left: `${thresholdPct}%`, top: -10, bottom: -10, width: 2, background: GOLD, transform: "translateX(-1px)" }} />
              <div style={{ position: "absolute", left: `${thresholdPct}%`, top: 14, transform: "translateX(-50%)", color: GOLD, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                155 mm
              </div>
              {/* User marker */}
              <div
                style={{
                  position: "absolute",
                  left: `${userPct}%`,
                  top: "50%",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "hsl(var(--cream))",
                  border: `2px solid ${GOLD}`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${userPct}%`,
                  top: 14,
                  transform: `translateX(${userPct > 85 ? "-100%" : userPct < 15 ? "0%" : "-50%"})`,
                  color: "hsl(var(--cream))",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {adjustedFace} mm
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", marginTop: 18 }}>
              <span>Narrow (120)</span>
              <span>Wide (180+)</span>
            </div>
          </div>
        );
      })()}

      {/* Nose width — secondary */}
      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: 10,
          padding: "20px 22px",
          background: "hsl(var(--card))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Nose width
        </div>
        <div className="font-display" style={{ color: GOLD, fontWeight: 300, fontSize: "clamp(1.6rem, 4vw, 2.1rem)", lineHeight: 1 }}>
          {adjustedNose} <span style={{ fontSize: "0.55em", color: MUTED }}>mm</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", lineHeight: 1.5, margin: 0 }}>
          {confidenceCopy.body}
        </p>
      </div>

      {/* Card-offset correction */}
      <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={cardOffset}
            onChange={(e) => {
              setCardOffset(e.target.checked);
              pushEvent("scan_card_offset_toggled", { enabled: e.target.checked });
            }}
            style={{ marginTop: 3, accentColor: GOLD, width: 16, height: 16 }}
          />
          <span style={{ color: "hsl(var(--cream))", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", lineHeight: 1.45 }}>
            The card was a bit in front of my face (not flush to my skin)
          </span>
        </label>
        {cardOffset && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Approx. gap
              </span>
              <span style={{ color: GOLD, fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", fontWeight: 500 }}>
                {gapCm.toFixed(1)} cm
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={gapCm}
              onChange={(e) => setGapCm(parseFloat(e.target.value))}
              style={{ accentColor: GOLD, width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Touching</span>
              <span>Held out</span>
            </div>
            <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.74rem", lineHeight: 1.5, margin: "4px 0 0" }}>
              Correction +{Math.round((correctionFactor - 1) * 1000) / 10}% — face width adjusted from {measurements.faceWidthMm} mm to {adjustedFace} mm.
            </p>
          </div>
        )}
      </div>


      {adjustedFace < 145 && (
        <div
          role="alert"
          style={{
            border: `1px solid ${GOLD}`,
            background: "rgba(201,168,76,0.10)",
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              color: GOLD,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            This result looks low — likely a scan issue
          </div>
          <p style={{ color: "hsl(var(--cream-dim))", fontFamily: "Barlow, sans-serif", fontSize: "0.88rem", lineHeight: 1.55, margin: 0 }}>
            {adjustedFace} mm is below the typical adult range. The most common cause is the card not being pressed flat against the forehead — even a 2 cm gap underestimates face width by 5–10 mm. Re-scan with the card flush to your skin for an accurate result.
          </p>
          <button
            type="button"
            onClick={() => {
              pushEvent("scan_sanity_check_rescan", { face_width_mm: measurements.faceWidthMm });
              onRetake();
            }}
            style={{
              alignSelf: "flex-start",
              background: GOLD,
              color: BG,
              border: "none",
              borderRadius: 4,
              padding: "10px 18px",
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Re-scan with card flat →
          </button>
        </div>
      )}

      {faceShape && (
        <div
          style={{
            border: `1px solid ${GOLD}`,
            borderRadius: 8,
            padding: "22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "rgba(202,164,73,0.06)",
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              color: GOLD,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Face shape · {faceShape.label}
          </span>
          <h3 className="font-display text-woolet-white" style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.55rem)", fontWeight: 300, lineHeight: 1.25, margin: 0 }}>
            Best frame for your face: <em style={{ fontStyle: "italic", color: GOLD }}>{faceShape.modelName}</em>
          </h3>
          <p className="text-cream-dim" style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.55, margin: 0 }}>
            {faceShape.reason}
          </p>
          {adjustedFace >= 160 && (
            <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", lineHeight: 1.5, margin: 0 }}>
              Your face width is {adjustedFace} mm — you almost certainly need a wide frame (160 mm+). Both Woolet 007 and 009 are built at 158 mm+.
            </p>
          )}
          <Link
            to={`/${lang}${faceShape.modelHref.replace(/^\/en/, "")}`}
            style={{
              alignSelf: "flex-start",
              marginTop: 4,
              background: GOLD,
              color: BG,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.7rem",
              padding: "12px 22px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            See Woolet {faceShape.recommendedModel} →
          </Link>
        </div>
      )}



      <div
        style={{
          border: `1px solid ${recommendation.badgeColor}`,
          borderRadius: 8,
          padding: "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <span
          style={{
            alignSelf: "flex-start",
            background: recommendation.badgeColor,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.65rem",
            padding: "5px 10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {recommendation.badgeLabel}
        </span>
        <h3 className="font-display text-woolet-white" style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)", fontWeight: 300, lineHeight: 1.2 }}>
          {recommendation.title}
        </h3>
        <p className="text-cream-dim" style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.6 }}>
          {recommendation.body}
        </p>
      </div>

      <div className="scan-cta-primary flex flex-col gap-2">
        <Link
          to={
            authedUser
              ? `/${lang}/account`
              : `/${lang}/fit?face_width=${adjustedFace}&nose_width=${adjustedNose}&source=scan${cardOffset ? `&gap_cm=${gapCm}` : ""}`
          }
          onClick={handleCta}
          style={{
            background: GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "16px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textDecoration: "none",
            textAlign: "center",
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {authedUser ? "Go to my account →" : "See my prefilled fit →"}
        </Link>
        <Link
          to={recommendation.primaryHref}
          onClick={handleCta}
          style={{
            background: "transparent",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--cream-dim))",
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            padding: "12px 0",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          {recommendation.primaryCta}
        </Link>
        <button
          onClick={downloadCard}
          style={{ background: "transparent", border: "none", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", padding: "8px 0", cursor: "pointer", textDecoration: "underline" }}
        >
          Save my measurements
        </button>
        <button
          onClick={onRetake}
          style={{ background: "transparent", border: "none", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", padding: "4px 0", cursor: "pointer", textDecoration: "underline" }}
        >
          Re-scan
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Email gate (mobile) ─────────────── */

function EmailGateStep({
  faceWidthMm,
  noseWidthMm,
  confidence,
  recommendation,
  device,
  lang,
  onSubmitted,
}: {
  faceWidthMm: number;
  noseWidthMm: number;
  confidence?: string | null;
  recommendation: Recommendation;
  device: "mobile" | "desktop";
  lang: Lang;
  onSubmitted: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    if (!agree) {
      setError("Please accept to receive your measurements by email.");
      return;
    }
    setSubmitting(true);
    try {
      // Persist the scan to scan_sessions with the captured email so it can be
      // linked to the user's account on sign-in (via link_user_data_by_email).
      supabase
        .from("scan_sessions")
        .insert({
          email: parsed.data,
          status: "completed",
          face_width_mm: faceWidthMm,
          nose_width_mm: noseWidthMm,
          recommendation_type: recommendation.type,
          confidence: confidence ?? null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 255) : null,
        })
        .then(({ error: insErr }) => {
          if (insErr) console.warn("[scan email gate] scan_sessions insert failed", insErr);
        });

      const { error: mlErr } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email: parsed.data,
          face_width: String(Math.round(faceWidthMm)),
          source: "scan",
          device,
        },
      });
      if (mlErr) console.warn("[scan email gate] mailerlite failed", mlErr);

      // Fire-and-forget: send measurements + fit recommendation by email.
      // Use primaryHref so the CTA points to the actually recommended model (007 or 009).
      const primaryHref = recommendation.primaryHref || `/${lang}/products/007`;
      const modelUrl = primaryHref.startsWith("http")
        ? primaryHref
        : `https://woolet.co${primaryHref}`;
      const recommendedModel = primaryHref.includes("009") ? "Woolet 009" : "Woolet 007";
      // Include a per-session nonce so re-scans for the same email still send.
      const scanNonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "fit-scan-result",
            recipientEmail: parsed.data,
            idempotencyKey: `fit-scan-${parsed.data}-${Math.round(faceWidthMm)}-${Math.round(noseWidthMm)}-${scanNonce}`,
            templateData: {
              faceWidthMm: Math.round(faceWidthMm),
              noseWidthMm: Math.round(noseWidthMm),
              recommendationTitle: recommendation.title,
              recommendationBody: recommendation.body,
              recommendedModel,
              modelUrl,
              badgeLabel: recommendation.badgeLabel,
            },
          },
        })
        .then(({ error: emailErr }) => {
          if (emailErr) console.warn("[scan email gate] send-transactional-email failed", emailErr);
        });

      // Create a Woolet account (passwordless) so we can remember the measurements
      // for next time. User receives a magic link to log in. Respect locale prefix.
      supabase.auth
        .signInWithOtp({
          email: parsed.data,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/${lang}/account`,
            data: {
              face_width_mm: Math.round(faceWidthMm),
              nose_width_mm: Math.round(noseWidthMm),
              source: "fit-scan",
              locale: lang,
            },
          },
        })
        .then(({ error: otpErr }) => {
          if (otpErr) console.warn("[scan email gate] account signup failed", otpErr);
        });

      pushEvent("fit_email_captured", { device, face_width: Math.round(faceWidthMm) });
      onSubmitted(parsed.data);
    } catch (err) {
      console.error("[scan email gate] submit failed", err);
      toast.error("Couldn't save your email. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(8,8,7,0.97)",
        border: `1px solid ${GOLD}`,
        borderRadius: 8,
        padding: "28px 24px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
      }}
      className="flex flex-col gap-5"
    >
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">LAST STEP · UNLOCK YOUR RESULTS</span>
      </div>
      <h2
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 300, lineHeight: 1.1, margin: 0 }}
      >
        Where should we send your <em className="italic" style={{ color: GOLD }}>measurements?</em>
      </h2>
      <p className="text-cream-dim" style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
        We'll reveal your face width, recommended size and best‑fit models — and email you a copy plus a magic‑link to save them to a Woolet account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <label
          htmlFor="scan-result-email"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Your email address
        </label>
        <input
          id="scan-result-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="Your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            padding: "14px 16px",
            fontFamily: "Barlow, sans-serif",
            fontSize: "1rem",
            borderRadius: 4,
          }}
        />

        <label
          htmlFor="scan-result-agree"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            cursor: "pointer",
            margin: "4px 0 0",
          }}
        >
          <input
            id="scan-result-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            style={{
              marginTop: 3,
              accentColor: GOLD,
              width: 14,
              height: 14,
              flexShrink: 0,
            }}
          />
          <span>
            Email me my measurements and create a Woolet account so I can find them later. I can unsubscribe anytime.
          </span>
        </label>

        {error && (
          <span style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem" }}>
            {error}
          </span>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 4,
            background: submitting ? "rgba(202,164,73,0.4)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            padding: "18px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: submitting ? "wait" : "pointer",
            height: 52,
          }}
        >
          {submitting ? "Sending…" : "Reveal my results →"}
        </button>
        <p
          style={{
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            margin: "2px 0 0",
            textAlign: "center",
          }}
        >
          No spam · We never share your email.
        </p>
      </form>
    </div>
  );
}

/* ─────────────── Thank you (after email captured) ─────────────── */

function ResultSentStep({
  email,
  lang,
  faceWidthMm,
  noseWidthMm,
  recommendation,
}: {
  email: string;
  lang: Lang;
  faceWidthMm: number;
  noseWidthMm: number;
  recommendation: Recommendation;
}) {
  const primaryHref = recommendation.primaryHref?.startsWith("/")
    ? recommendation.primaryHref
    : `/${lang}/products/007`;
  return (
    <div className="flex flex-col gap-6" style={{ paddingTop: "1rem" }}>
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">YOUR MEASUREMENTS</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)", fontWeight: 300, lineHeight: 1.05, margin: 0 }}
      >
        You're a <em className="italic" style={{ color: GOLD }}>{Math.round(faceWidthMm)} mm</em> face
      </h1>

      <div
        style={{
          background: "rgba(202,164,73,0.06)",
          border: `1px solid ${GOLD}`,
          borderRadius: 6,
          padding: "20px 22px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "2rem",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            {Math.round(faceWidthMm)} <span style={{ fontSize: "0.85rem", color: MUTED }}>mm</span>
          </div>
          <div
            style={{
              color: MUTED,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Face width
          </div>
        </div>
        <div>
          <div
            style={{
              color: "white",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "2rem",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            {Math.round(noseWidthMm)} <span style={{ fontSize: "0.85rem", color: MUTED }}>mm</span>
          </div>
          <div
            style={{
              color: MUTED,
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Bridge width
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            color: GOLD,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {recommendation.badgeLabel}
        </div>
        <div
          className="font-display text-woolet-white"
          style={{ fontSize: "1.4rem", fontWeight: 300, lineHeight: 1.2 }}
        >
          {recommendation.title}
        </div>
        {recommendation.body && (
          <p
            className="text-cream-dim"
            style={{
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.55,
              margin: "8px 0 0",
            }}
          >
            {recommendation.body}
          </p>
        )}
      </div>

      <p
        className="text-cream-dim"
        style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.55, margin: 0 }}
      >
        A full copy was sent to <strong style={{ color: "white" }}>{email}</strong> with a magic
        sign‑in link to save it to your Woolet account. Check spam if it doesn't arrive in a minute.
      </p>

      <Link
        to={primaryHref}
        style={{
          display: "inline-block",
          textAlign: "center",
          background: GOLD,
          color: BG,
          fontFamily: "Barlow, sans-serif",
          fontWeight: 500,
          fontSize: "0.78rem",
          padding: "18px 28px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: 4,
        }}
      >
        See your recommended frame →
      </Link>
    </div>
  );
}

/* ─────────────── Page shell ─────────────── */


export default function FitScan() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  // `sid` = new "lead already captured on the other device" flag (random UUID).
  // `s`   = legacy supabase scan-session id (kept for back-compat).
  const sidParam = searchParams.get("sid");
  const sessionId = searchParams.get("s");
  // If the visitor arrived via the desktop→QR handoff OR is already logged in,
  // skip the email gate — we already have a verified address for them.
  const emailAlreadyCaptured = !!sidParam || !!sessionId || !!user;

  const [step, setStep] = useState<Step>("welcome");
  const [frame, setFrame] = useState<CapturedFrame | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [faceShape, setFaceShape] = useState<FaceShapeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKind, setErrorKind] = useState<"recoverable" | "unsupported" | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [secureCtx, setSecureCtx] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState(0);
  const [autoFallback, setAutoFallback] = useState<"no_edge" | "validation" | null>(null);
  const [prefillPoints, setPrefillPoints] = useState<{ card: [Point, Point]; face: [Point, Point] } | null>(null);
  const [emailCaptured, setEmailCaptured] = useState<boolean>(emailAlreadyCaptured);
  const [capturedEmail, setCapturedEmail] = useState<string>(user?.email ?? "");

  // Desktop/tablet visitors must always hand off to a phone via QR — the scan
  // requires holding the device against the forehead. Only mobile runs the
  // camera flow directly. `sid`/`s` mean the visitor already arrived from a
  // phone handoff, so we let them through.
  const requiresHandoff = !isMobile && !sidParam && !sessionId;


  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSecure = window.isSecureContext || window.location.hostname === "localhost";
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
    const webgl = hasWebGL();
    setSecureCtx(isSecure);
    // CPU fallback exists, so WebGL is not strictly required — but we still need camera + secure context.
    setSupported(isSecure && hasGetUserMedia);
    if (!webgl) {
      // We'll still try (CPU delegate). Surface as info, not blocker.
      console.info("[scan] WebGL unavailable — will try CPU inference");
    }
  }, []);

  // Handoff: when the phone opens a scan via QR (s=sessionId), mark it connected
  // so the originating desktop sees the "Phone connected" status immediately.
  useEffect(() => {
    if (!sessionId) return;
    supabase
      .from("scan_sessions")
      .update({ status: "connected" })
      .eq("id", sessionId)
      .then(({ error }) => {
        if (error) console.warn("[scan] connect status update failed", error);
      });
  }, [sessionId]);

  const goWelcome = () => {
    setFrame(null);
    setMeasurements(null);
    setRecommendation(null);
    setFaceShape(null);
    setErrorMsg("");
    setErrorKind(null);
    setStep("welcome");
  };

  const startScan = () => {
    pushEvent("scan_started");
    setErrorMsg("");
    setErrorKind(null);
    setStep("camera");
  };

  const retryScan = () => {
    resetLandmarkers();
    setRetryCount((n) => n + 1);
    startScan();
  };

  const runCalculate = (
    f: CapturedFrame,
    c1: Point,
    c2: Point,
    f1?: Point,
    f2?: Point,
  ): boolean => {
    try {
      const m = calculateMeasurements(f.landmarks, f.width, c1, c2, f1, f2);
      const r = getRecommendation(m.faceWidthMm, m.noseWidthMm);
      const shape = detectFaceShape(f.landmarks, f.width, f.height);
      setMeasurements(m);
      setRecommendation(r);
      setFaceShape(shape);
      pushEvent("scan_completed", {
        face_width_mm: m.faceWidthMm,
        nose_width_mm: m.noseWidthMm,
        recommendation_type: r.type,
        confidence: m.confidence,
        auto_corners: !f1 && !f2,
        has_session: !!sessionId,
      });
      // If this scan was opened via QR handoff, sync the result so the
      // originating desktop session can render it in real time.
      if (sessionId) {
        supabase
          .from("scan_sessions")
          .update({
            status: "completed",
            face_width_mm: m.faceWidthMm,
            nose_width_mm: m.noseWidthMm,
            recommendation_type: r.type,
            confidence: m.confidence,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 255) : null,
          })
          .eq("id", sessionId)
          .then(({ error: updErr }) => {
            if (updErr) console.warn("[scan] session sync failed", updErr);
          });
      } else if (user?.email) {
        // Logged-in user without an existing session row: persist the scan
        // directly to their account so it shows up in /account immediately.
        supabase
          .from("scan_sessions")
          .insert({
            email: user.email,
            user_id: user.id,
            status: "completed",
            face_width_mm: m.faceWidthMm,
            nose_width_mm: m.noseWidthMm,
            recommendation_type: r.type,
            confidence: m.confidence,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 255) : null,
          })
          .then(({ error: insErr }) => {
            if (insErr) console.warn("[scan] account scan save failed", insErr);
          });
      }
      setStep(user ? "result-sent" : "result");
      return true;
    } catch (err) {
      const isMeasurement = err instanceof MeasurementError;
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      const kind = isMeasurement ? err.kind : "unknown";
      setMeasurements(null);
      setRecommendation(null);
      setFaceShape(null);
      setErrorMsg(msg);
      setErrorKind("recoverable");
      pushEvent("scan_error", { error_type: "calculation", reason: kind });
      return false;
    }
  };

  const handleCaptured = async (f: CapturedFrame) => {
    setFrame(f);
    setAutoFallback(null);
    setPrefillPoints(null);
    setStep("analyzing");

    // Stabilized capture path: the camera step already collected 30+ pose-
    // and card-gated frames over 3 s and selected the median sample. Skip
    // the server roundtrip and the manual annotate step entirely.
    if (f.stabilized) {
      const { cardCorners, faceEdges, frameCount } = f.stabilized;
      pushEvent("scan_stabilized_used", { frame_count: frameCount });
      if (runCalculate(f, cardCorners[0], cardCorners[1], faceEdges[0], faceEdges[1])) {
        return;
      }
      // Fall through to server detection if median sample failed validation.
    }



    // Primary path: server-side detection via Gemini 2.5 Pro Vision.
    // We send the captured JPEG + native dims; server returns pixel coords
    // for card corners and face edges. We pre-fill the annotate step so the
    // user can verify/fine-tune the dots before we compute the measurement.
    try {
      const { data, error } = await supabase.functions.invoke("fit-scan-detect", {
        body: { image: f.dataUrl, width: f.width, height: f.height },
      });
      if (error) throw error;
      if (data?.glassesDetected === true) {
        pushEvent("scan_error", { error_type: "glasses_detected" });
        setErrorMsg("Please remove your eyeglasses — they cover the temple landmarks we need to measure. Then retake the photo.");
        setErrorKind("recoverable");
        setStep("welcome");
        return;
      }
      if (data?.card?.left && data?.card?.right && data?.face?.left && data?.face?.right) {
        const conf = typeof data.confidence === "number" ? data.confidence : 0.5;
        pushEvent("scan_server_detected", { confidence: conf, model: data.model });
        const c1: Point = { x: data.card.left.x, y: data.card.left.y };
        const c2: Point = { x: data.card.right.x, y: data.card.right.y };
        const f1: Point = { x: data.face.left.x, y: data.face.left.y };
        const f2: Point = { x: data.face.right.x, y: data.face.right.y };
        // When the model is highly confident in the temple/ear landmarks,
        // skip the manual annotate step and compute the measurement directly.
        // The user can still retake the scan if the result looks wrong.
        if (conf >= 0.85 && runCalculate(f, c1, c2, f1, f2)) {
          pushEvent("scan_auto_skipped_annotate", { confidence: conf });
          return;
        }
        setPrefillPoints({ card: [c1, c2], face: [f1, f2] });
        setStep("annotate");
        return;
      }
      pushEvent("scan_server_fallback", { reason: "empty_response" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("fit-scan-detect failed, falling back to client", msg);
      pushEvent("scan_server_fallback", { reason: "network_or_error" });
    }

    // Server detection failed — fall back to client-side prefill so the user
    // still sees suggested dot positions on face edges (and, when possible,
    // card corners) and only needs to fine-tune.
    try {
      const faceLeft = f.landmarks?.[LANDMARKS.faceLeftTemple];
      const faceRight = f.landmarks?.[LANDMARKS.faceRightTemple];
      const forehead = f.landmarks?.[LANDMARKS.forehead];
      let faceEdges: [Point, Point] | null = null;
      if (faceLeft && faceRight) {
        // MediaPipe temple landmarks sit on the visible face contour, which is
        // ~10–12% narrower than the actual head/skull silhouette where eyewear
        // temple tips rest. Expand outward so the prefill matches the widest
        // point at temple height (what the user expects for frame width).
        const cx = ((faceLeft.x + faceRight.x) / 2) * f.width;
        const halfW = Math.abs((faceRight.x - faceLeft.x) * f.width) / 2;
        const expanded = halfW * 1.12;
        const yMid = ((faceLeft.y + faceRight.y) / 2) * f.height;
        faceEdges = [
          { x: Math.max(0, cx - expanded), y: yMid },
          { x: Math.min(f.width, cx + expanded), y: yMid },
        ];
      }

      let cardCorners: [Point, Point] | null = null;
      if (f.canvas && forehead && faceLeft && faceRight) {
        // Forehead band ROI: a horizontal strip above the brow, wider than the face.
        const faceWpx = Math.abs((faceRight.x - faceLeft.x) * f.width);
        const cx = ((faceLeft.x + faceRight.x) / 2) * f.width;
        const roiW = Math.min(f.width, faceWpx * 1.6);
        const roiH = Math.max(60, faceWpx * 0.45);
        const foreheadY = forehead.y * f.height;
        const roi = {
          x: Math.max(0, cx - roiW / 2),
          y: Math.max(0, foreheadY - roiH * 1.1),
          w: roiW,
          h: roiH,
        };
        const det = detectCardCornersInRegion(f.canvas, roi, f.width, f.height);
        if (det && det.confidence >= 0.3) {
          cardCorners = det.corners;
        }
      }

      if (faceEdges) {
        // If card not auto-detected, seed corners near the top of the forehead band
        // so user only needs to drag them onto the actual card edges.
        if (!cardCorners && forehead) {
          const faceWpx = Math.abs((faceRight!.x - faceLeft!.x) * f.width);
          const cx = ((faceLeft!.x + faceRight!.x) / 2) * f.width;
          const yGuess = Math.max(0, forehead.y * f.height - faceWpx * 0.35);
          cardCorners = [
            { x: cx - faceWpx * 0.45, y: yGuess },
            { x: cx + faceWpx * 0.45, y: yGuess },
          ];
        }
        if (cardCorners) {
          pushEvent("scan_client_prefilled", { auto_card: cardCorners ? 1 : 0 });
          setPrefillPoints({ card: cardCorners, face: faceEdges });
          setAutoFallback("no_edge");
          setStep("annotate");
          return;
        }
      }
    } catch (err) {
      console.warn("[scan] client prefill failed", err);
    }

    setAutoFallback("no_edge");
    setStep("annotate");
  };

  const handleCalculate = ([c1, c2]: [Point, Point], [f1, f2]: [Point, Point]) => {
    if (!frame) return;
    if (!runCalculate(frame, c1, c2, f1, f2)) {
      toast.error("Measurement rejected", { description: errorMsg || "Calculation failed." });
    }
  };

  const handleError = (msg: string, kind: "recoverable" | "unsupported" = "recoverable") => {
    setErrorMsg(msg);
    setErrorKind(kind);
    setStep("welcome");
  };

  const blockingMessage = !secureCtx
    ? "Face scan needs a secure (HTTPS) connection. Open this page on the live site, or use the manual wizard."
    : !supported
      ? "Your browser doesn't expose camera access. Try Chrome, Safari, or Firefox — or use the manual wizard."
      : null;

  return (
    <>
      <SEO
        title="Face Scan — Woolet AI Fit"
        description="Measure your face width and nose width with your camera and a credit card. Local, private, and accurate to about 2mm. Find out if Woolet's wide-face frames fit you."
        lang={lang}
        path="/fit"
        noindex
      />

      <Navbar />

      <main className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
        <style>{`
          @media (max-width: 767px) {
            .scan-camera { aspect-ratio: 3/4; max-height: calc(100svh - 220px); }
            .scan-result-number { font-size: 48px; }
            .scan-cta-primary > a:first-child { position: sticky; bottom: 16px; z-index: 10; }
            .scan-tips-accordion { font-size: 13px; }
            .scan-fallback-banner { padding: 16px 18px !important; }
            .scan-fallback-banner span:last-child { font-size: 1rem !important; }
            .scan-like-this { display: none !important; }
          }
          /* Mobile full-bleed camera shell */
          .scan-mobile-shell {
            position: fixed;
            inset: 0;
            background: #000;
            z-index: 80;
            display: flex;
            flex-direction: column;
          }
          .scan-mobile-camera {
            position: relative;
            flex: 1 1 auto;
            overflow: hidden;
          }
          .scan-mobile-topbar {
            position: absolute;
            top: calc(12px + env(safe-area-inset-top, 0px));
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            gap: 8px;
            pointer-events: none;
            z-index: 2;
          }
          .scan-mobile-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px;
            border-radius: 999px;
            background: rgba(0,0,0,0.55);
            border: 1px solid rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.9);
            font-family: 'Barlow', sans-serif;
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            backdrop-filter: blur(8px);
          }
          .scan-mobile-pill-muted { color: ${MUTED}; }
          .scan-mobile-countdown {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cormorant Garamond', serif;
            font-size: 9rem;
            font-weight: 300;
            color: ${GOLD};
            text-shadow: 0 4px 32px rgba(0,0,0,0.7);
            pointer-events: none;
            z-index: 3;
          }
          .scan-mobile-controls {
            flex: 0 0 auto;
            padding: 18px 20px calc(18px + env(safe-area-inset-bottom, 0px));
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 30%, #000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
          }
          .scan-shutter {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: transparent;
            border: 3px solid ${GOLD};
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 120ms ease;
          }
          .scan-shutter:active { transform: scale(0.94); }
          .scan-shutter:disabled { opacity: 0.45; cursor: not-allowed; }
          .scan-shutter-inner {
            display: block;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: ${GOLD};
          }
          .scan-mobile-secondary {
            display: flex;
            align-items: center;
            gap: 18px;
            font-family: 'Barlow', sans-serif;
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          .scan-mobile-secondary button,
          .scan-mobile-secondary a {
            background: transparent;
            border: none;
            color: ${MUTED};
            text-decoration: none;
            cursor: pointer;
            padding: 6px 4px;
          }
          .scan-mobile-secondary button:disabled { opacity: 0.4; cursor: not-allowed; }
        `}</style>
        <div className="px-5 sm:px-8 lg:px-16 py-12 sm:py-20">
          <div className="max-w-xl mx-auto">
            {requiresHandoff ? (
              <DesktopScanGate lang={lang} />
            ) : (
              <>
                {step === "welcome" && (blockingMessage || errorMsg) && (
                  <div
                    role="alert"
                    style={{
                      marginBottom: 28,
                      padding: "20px 22px",
                      border: `1px solid ${blockingMessage ? "rgba(255,255,255,0.14)" : "rgba(239,68,68,0.45)"}`,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.02)",
                      fontFamily: "Barlow, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        color: blockingMessage ? GOLD : "#fca5a5",
                        fontSize: "0.7rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {blockingMessage ? "Scan unavailable" : "Scan didn't complete"}
                    </div>
                    <p style={{ color: "hsl(var(--cream-dim))", fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.55, margin: 0 }}>
                      {blockingMessage || errorMsg}
                    </p>
                    {!blockingMessage && errorMsg && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: "12px 16px",
                          borderRadius: 6,
                          background: "rgba(202,164,73,0.06)",
                          border: `1px solid rgba(202,164,73,0.25)`,
                        }}
                      >
                        <div
                          style={{
                            color: GOLD,
                            fontSize: "0.7rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          Before you retry
                        </div>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: 16,
                            color: "hsl(var(--cream-dim))",
                            fontSize: "0.85rem",
                            lineHeight: 1.6,
                          }}
                        >
                          <li>Push your hair back off your forehead</li>
                          <li>Hold the card by its top edge — don't cover the corners</li>
                          <li>Lay the card flat, long edge horizontal</li>
                        </ul>
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                      {!blockingMessage && errorKind === "recoverable" && (
                        <button
                          onClick={retryScan}
                          style={{
                            background: GOLD,
                            color: BG,
                            fontFamily: "Barlow, sans-serif",
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            padding: "12px 20px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Try again
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/${lang}/fit`)}
                        style={{
                          background: "transparent",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--cream-dim))",
                          fontFamily: "Barlow, sans-serif",
                          fontSize: "0.7rem",
                          padding: "12px 20px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        Use manual scan
                      </button>
                    </div>
                  </div>
                )}

                {step === "welcome" && (
                  <WelcomeStep
                    lang={lang}
                    onStart={startScan}
                    disabled={!!blockingMessage}
                    isMobile={isMobile}
                  />
                )}
                {step === "camera" && (
                  <CameraStep
                    key={retryCount}
                    lang={lang}
                    onCaptured={handleCaptured}
                    onError={handleError}
                    isMobile={isMobile}
                  />
                )}
                {step === "analyzing" && (
                  <AnalyzingStep previewUrl={frame?.dataUrl} />
                )}
                {step === "annotate" && frame && (
                  <AnnotateStep frame={frame} onCalculate={handleCalculate} onRetake={() => setStep("camera")} fallbackReason={autoFallback} initialCard={prefillPoints?.card ?? null} initialFace={prefillPoints?.face ?? null} />
                )}
                {(step === "result" || step === "result-sent") && measurements && recommendation && (
                  <>
                    {step === "result-sent" ? (
                      <ResultSentStep
                        email={capturedEmail}
                        lang={lang}
                        faceWidthMm={measurements.faceWidthMm}
                        noseWidthMm={measurements.noseWidthMm}
                        recommendation={recommendation}
                      />
                    ) : (
                      <div style={{ position: "relative", overflow: "hidden" }}>
                        <div
                          aria-hidden={!emailCaptured}
                          style={{
                            filter: emailCaptured ? "none" : "blur(28px) saturate(0.6)",
                            pointerEvents: emailCaptured ? "auto" : "none",
                            userSelect: emailCaptured ? "auto" : "none",
                            transition: "filter 250ms ease",
                            transform: emailCaptured ? "none" : "scale(1.04)",
                          }}
                        >
                          <ResultStep measurements={measurements} recommendation={recommendation} faceShape={faceShape} onRetake={goWelcome} lang={lang} />
                        </div>
                        {!emailCaptured && (
                          <>
                            {/* Opaque scrim so the rendered numbers cannot be read even on high-DPR screens. */}
                            <div
                              aria-hidden
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, rgba(8,8,7,0.85) 0%, rgba(8,8,7,0.95) 40%, rgba(8,8,7,0.98) 100%)",
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                padding: "2.5rem 0.25rem 1rem",
                                pointerEvents: "none",
                              }}
                            >
                              <div style={{ width: "100%", maxWidth: 460, pointerEvents: "auto" }}>
                                <EmailGateStep
                                  faceWidthMm={measurements.faceWidthMm}
                                  noseWidthMm={measurements.noseWidthMm}
                                  confidence={measurements.confidence}
                                  recommendation={recommendation}
                                  device={isMobile ? "mobile" : "desktop"}
                                  lang={lang}
                                  onSubmitted={(submittedEmail) => {
                                    setCapturedEmail(submittedEmail);
                                    setEmailCaptured(true);
                                    setStep("result-sent");
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

