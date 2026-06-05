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
import { isValidLang, type Lang } from "@/lib/i18n";
import { getImageLandmarker, hasWebGL, resetLandmarkers } from "@/lib/face-landmarker";
import { detectCardCornersInRegion } from "@/lib/card-corner-detection";
import { classifyCardSample } from "@/lib/card-detection";
import {
  calculateMeasurements,
  getRecommendation,
  MeasurementError,
  type Measurements,
  type NormalizedLandmark,
  type Point,
  type Recommendation,
} from "@/lib/face-measurements";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

type Step = "welcome" | "camera" | "annotate" | "email-gate" | "result";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

interface CapturedFrame {
  dataUrl: string;
  width: number;
  height: number;
  landmarks: NormalizedLandmark[];
  /** In-memory canvas of the captured frame; used for auto corner detection. */
  canvas?: HTMLCanvasElement;
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
        { n: "02", title: "Hold to forehead", body: "Lay it flat across your brow, long edge horizontal.", img: fitStepForehead, alt: "Person holding a credit card flat across the forehead" },
        { n: "03", title: "Hold phone at arm's length", body: "Front camera, face the lens. Tap capture when ready.", img: fitStepPhone, alt: "Hand holding a smartphone at arm's length for a selfie" },
      ]
    : [
        { n: "01", title: "Grab a card", body: "Any credit, debit or ID card. We use its 85.6 mm edge as scale.", img: fitStepCard, alt: "Credit card illustration used as scale reference" },
        { n: "02", title: "Hold to forehead", body: "Lay it flat across your brow, long edge horizontal.", img: fitStepForehead, alt: "Person holding a credit card flat across the forehead" },
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
  const capturedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lighting, setLighting] = useState<"green" | "yellow" | "red">("yellow");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  const deviceTip = isMobile
    ? "Hold the phone at arm's length, camera at eye level."
    : "Sit ~50–70 cm from the webcam, eyes level with the lens.";

  const stopAll = useCallback(() => {
    if (lumRafRef.current) cancelAnimationFrame(lumRafRef.current);
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const performCapture = useCallback(async () => {
    if (capturedRef.current || busy) return;
    const v = videoRef.current;
    if (!v || v.readyState < 2) {
      onError("Camera isn't ready yet — give it a second and tap capture again.");
      return;
    }
    setBusy(true);
    capturedRef.current = true;

    const w = v.videoWidth;
    const h = v.videoHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) {
      setBusy(false);
      capturedRef.current = false;
      return;
    }
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);

    try {
      const lm = await getImageLandmarker();
      const res = lm.detect(c);
      if (!res.faceLandmarks?.length) {
        capturedRef.current = false;
        setBusy(false);
        onError("We can't see your face in the photo. Try better lighting and face the camera directly.");
        return;
      }
      if (res.faceLandmarks.length > 1) {
        capturedRef.current = false;
        setBusy(false);
        onError("Only one face at a time, please.");
        return;
      }
      stopAll();
      pushEvent("scan_captured");
      onCaptured({
        dataUrl,
        width: w,
        height: h,
        landmarks: res.faceLandmarks[0],
        canvas: c,
      });
    } catch (err) {
      console.warn("[scan] capture detect failed", err);
      capturedRef.current = false;
      setBusy(false);
      onError("Couldn't process the captured frame. Try again.");
    }
  }, [busy, onCaptured, onError, stopAll]);

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

      // Cheap luminance loop — just to warn about low light. Throttled.
      const sample = document.createElement("canvas");
      sample.width = 24; sample.height = 24;
      const sctx = sample.getContext("2d");
      let last = 0;
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
            <span className="scan-mobile-pill scan-mobile-pill-muted">Card flat · horizontal</span>
          </div>

          {countdown !== null && (
            <div className="scan-mobile-countdown" aria-live="assertive">{countdown}</div>
          )}
        </div>

        <div className="scan-mobile-controls">
          <button
            type="button"
            className="scan-shutter"
            aria-label="Capture photo"
            onClick={performCapture}
            disabled={!ready || busy || countdown !== null}
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
        <button
          type="button"
          onClick={performCapture}
          disabled={!ready || busy || countdown !== null}
          style={{
            background: !ready || busy || countdown !== null ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            padding: "18px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: !ready || busy || countdown !== null ? "not-allowed" : "pointer",
            height: 52,
          }}
        >
          {busy ? "Analyzing…" : countdown !== null ? `Capturing in ${countdown}…` : "Capture now"}
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
}

function AnnotateStep({ frame, onCalculate, onRetake, fallbackReason = null }: AnnotateStepProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [cardCorners, setCardCorners] = useState<Point[]>([]);
  const [faceEdges, setFaceEdges] = useState<Point[]>([]);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const draggingRef = useRef<number | null>(null);
  const HINT_KEY = "woolet_scan_drag_hint_seen";
  const [showDragHint, setShowDragHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

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
    if (draggingRef.current === null) return;
    e.stopPropagation();
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
    draggingRef.current = null;
  };

  const reset = () => {
    setCardCorners([]);
    setFaceEdges([]);
  };

  const cardPxNative =
    cardCorners.length === 2 ? Math.hypot(cardCorners[1].x - cardCorners[0].x, cardCorners[1].y - cardCorners[0].y) : 0;

  const scaleX = displaySize.w ? displaySize.w / frame.width : 1;
  const scaleY = displaySize.h ? displaySize.h / frame.height : 1;
  const totalPoints = cardCorners.length + faceEdges.length;
  const allPoints = [...cardCorners, ...faceEdges];

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
              background: n <= 3 ? GOLD : "rgba(255,255,255,0.18)",
              display: "inline-block",
            }}
          />
        ))}
        <span
          style={{ marginLeft: 10, color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          Step 3 of 4 — Mark card and face
        </span>
      </div>

      {fallbackReason && (
        <div
          role="status"
          className="scan-fallback-banner"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            padding: "14px 16px",
            border: "1px solid rgba(250,204,21,0.45)",
            background: "rgba(56, 38, 0, 0.35)",
            borderRadius: 8,
            fontFamily: "Barlow, sans-serif",
          }}
        >
          <span aria-hidden style={{ fontSize: "1.1rem", lineHeight: 1, paddingTop: 2 }}>👆</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong style={{ color: "#ffe9b8", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
              {fallbackReason === "validation" ? "Almost — needs a small tweak" : "Card not detected — adjust & retake"}
            </strong>
            <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.92rem", lineHeight: 1.5 }}>
              {fallbackReason === "validation"
                ? "Tap the two top corners of your card, then the outer edges of your face. Drag any dot to fine-tune."
                : "Move the card closer to the camera, hold it flat against your forehead, and make sure the scene is well-lit. Tap Retake above for another try, or mark the points manually."}
            </span>
          </div>
        </div>
      )}

      <h2 className="font-display text-woolet-white" style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 300 }}>
        Mark 4 points: card first, then face edges
      </h2>
      <p className="text-cream-dim" style={{ fontSize: "0.95rem", fontWeight: 300 }}>
        First tap the bottom-left and bottom-right corners of the card. Then tap the widest visible left and right outline of your face — not necessarily at temple level. If your face is widest a bit lower, place the dots there. You can drag any dot to fine-tune before calculating.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: -8 }}>
        <svg viewBox="0 0 48 32" width="40" height="27" fill="none" aria-hidden="true">
          <rect x="6" y="6" width="36" height="22" rx="2.5" stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.6" />
          <line x1="16" y1="6" x2="16" y2="2" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          <line x1="32" y1="6" x2="32" y2="2" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          <circle cx="9.5" cy="27" r="1.8" fill={GOLD} opacity="0.85" />
          <circle cx="38.5" cy="27" r="1.8" fill={GOLD} opacity="0.85" />
        </svg>
        <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.8rem", fontWeight: 300, margin: 0 }}>
          Tip: holding the card by its top edge keeps the bottom corners visible — easier to tap precisely.
        </p>
      </div>

      <div
        ref={wrapperRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handleDotMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${frame.width} / ${frame.height}`,
          borderRadius: 8,
          overflow: "hidden",
          cursor: totalPoints < 4 ? "crosshair" : "default",
          background: "#000",
          touchAction: "none",
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
              animation: "wooletHintIn 220ms ease-out",
              maxWidth: "90%",
              cursor: "pointer",
              zIndex: 5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 11V6a2 2 0 1 1 4 0v5M13 11V4.5a2 2 0 1 1 4 0V11M17 11V7.5a2 2 0 1 1 4 0V14a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-5.2-3l-3.1-5.4a2 2 0 0 1 3.4-2L9 13V6a2 2 0 1 1 4 0v5" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Drag a point to fine-tune its position</span>
          </div>
        )}
        <style>{`@keyframes wooletHintIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem" }}>
        <span>{totalPoints} of 4 ✓</span>
        {cardCorners.length === 2 && <span>Card detected: {Math.round(cardPxNative)}px wide</span>}
        {totalPoints > 0 && (
          <button onClick={reset} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", textDecoration: "underline", fontSize: "0.78rem" }}>
            Reset points
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: -4, color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem" }}>
        <span style={{ color: cardCorners.length < 2 ? "hsl(var(--cream-dim))" : MUTED }}>
          1. Card: bottom-left + bottom-right corners
        </span>
        <span style={{ color: cardCorners.length === 2 && faceEdges.length < 2 ? "hsl(var(--cream-dim))" : MUTED }}>
          2. Face: widest left + right contour of the visible face
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          disabled={cardCorners.length < 2 || faceEdges.length < 2}
          onClick={() => onCalculate([cardCorners[0], cardCorners[1]], [faceEdges[0], faceEdges[1]])}
          style={{
            background: cardCorners.length < 2 || faceEdges.length < 2 ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "16px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: cardCorners.length < 2 || faceEdges.length < 2 ? "not-allowed" : "pointer",
            height: 48,
          }}
        >
          Calculate my measurements
        </button>
        <button
          onClick={onRetake}
          style={{ background: "transparent", border: "none", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", padding: "8px 0", cursor: "pointer", textDecoration: "underline" }}
        >
          Retake photo
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Result ─────────────── */

interface ResultStepProps {
  measurements: Measurements;
  recommendation: Recommendation;
  onRetake: () => void;
  lang: Lang;
}

function ResultStep({ measurements, recommendation: baseRecommendation, onRetake, lang }: ResultStepProps) {
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

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: 8,
          padding: "28px 26px",
          background: "hsl(var(--card))",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Your face width
          </div>
          <div
            className="scan-result-number font-display"
            style={{ color: GOLD, fontWeight: 300, fontSize: "clamp(3rem, 8vw, 4.5rem)", lineHeight: 1 }}
          >
            {adjustedFace} mm
            {cardOffset && (
              <span style={{ marginLeft: 10, fontSize: "0.9rem", color: MUTED, fontFamily: "Barlow, sans-serif", letterSpacing: "0.08em" }}>
                (raw {measurements.faceWidthMm} mm)
              </span>
            )}
          </div>
        </div>
        <div>
          <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Your nose width
          </div>
          <div
            className="scan-result-number font-display"
            style={{ color: GOLD, fontWeight: 300, fontSize: "clamp(3rem, 8vw, 4.5rem)", lineHeight: 1 }}
          >
            {adjustedNose} mm
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: confidenceCopy.color, display: "inline-block" }} />
            <span style={{ color: confidenceCopy.color, fontFamily: "Barlow, sans-serif", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
              {confidenceCopy.label}
            </span>
          </div>
          <p style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", lineHeight: 1.5, margin: 0 }}>
            {confidenceCopy.body}
          </p>
        </div>

        <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
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
          to={`/${lang}/fit?face_width=${adjustedFace}&nose_width=${adjustedNose}&source=scan${cardOffset ? `&gap_cm=${gapCm}` : ""}`}
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
          See my prefilled fit →
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
  device,
  onSubmitted,
}: {
  faceWidthMm: number;
  device: "mobile" | "desktop";
  onSubmitted: () => void;
}) {
  const [email, setEmail] = useState("");
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
    setSubmitting(true);
    try {
      const { error: mlErr } = await supabase.functions.invoke("mailerlite-subscribe", {
        body: {
          email: parsed.data,
          face_width: String(Math.round(faceWidthMm)),
          source: "scan",
          device,
        },
      });
      if (mlErr) console.warn("[scan email gate] mailerlite failed", mlErr);
      pushEvent("scan_lead", { device, face_width: Math.round(faceWidthMm) });
      pushEvent("fit_email_captured", { device, face_width: Math.round(faceWidthMm) });
      onSubmitted();
    } catch (err) {
      console.error("[scan email gate] submit failed", err);
      toast.error("Couldn't save your email. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">ONE MORE STEP</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 300, lineHeight: 1.05 }}
      >
        Unlock your <em className="italic" style={{ color: GOLD }}>exact frame size</em>
      </h1>
      <p className="text-cream-dim" style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.55 }}>
        Enter your email to see your size + lock your $1 founding reserve.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <label
          htmlFor="scan-result-email"
          style={{
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Your email
        </label>
        <input
          id="scan-result-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "white",
            padding: "14px 16px",
            fontFamily: "Barlow, sans-serif",
            fontSize: "1rem",
            borderRadius: 4,
          }}
        />
        {error && (
          <span style={{ color: "#fca5a5", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem" }}>
            {error}
          </span>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
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
          {submitting ? "Unlocking…" : "Show my size →"}
        </button>
        <p
          style={{
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.72rem",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          No spam. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}

/* ─────────────── Page shell ─────────────── */


export default function FitScan() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  // `sid` = new "lead already captured on the other device" flag (random UUID).
  // `s`   = legacy supabase scan-session id (kept for back-compat).
  const sidParam = searchParams.get("sid");
  const sessionId = searchParams.get("s");
  // If the visitor arrived via the desktop→phone QR, skip the email gate.
  const emailAlreadyCaptured = !!sidParam || !!sessionId;

  const [step, setStep] = useState<Step>("welcome");
  const [frame, setFrame] = useState<CapturedFrame | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKind, setErrorKind] = useState<"recoverable" | "unsupported" | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [secureCtx, setSecureCtx] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState(0);
  const [autoFallback, setAutoFallback] = useState<"no_edge" | "validation" | null>(null);
  const [emailCaptured, setEmailCaptured] = useState<boolean>(emailAlreadyCaptured);

  // Desktop visitors without a session id must hand off to a phone via QR.
  // Mobile visitors, or anyone who already has ?sid= / ?s=, run the scan inline.
  const requiresHandoff = !isMobile && !emailAlreadyCaptured;


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

  const goWelcome = () => {
    setFrame(null);
    setMeasurements(null);
    setRecommendation(null);
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
      setMeasurements(m);
      setRecommendation(r);
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
      }
      setStep(emailCaptured ? "result" : "email-gate");
      return true;
    } catch (err) {
      const isMeasurement = err instanceof MeasurementError;
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      const kind = isMeasurement ? err.kind : "unknown";
      setMeasurements(null);
      setRecommendation(null);
      setErrorMsg(msg);
      setErrorKind("recoverable");
      pushEvent("scan_error", { error_type: "calculation", reason: kind });
      return false;
    }
  };

  const handleCaptured = async (f: CapturedFrame) => {
    setFrame(f);
    setAutoFallback(null);

    // Primary path: server-side detection via Gemini 2.5 Pro Vision.
    // We send the captured JPEG + native dims; server returns pixel coords
    // for card corners and face edges, which we feed into calculateMeasurements.
    try {
      const { data, error } = await supabase.functions.invoke("fit-scan-detect", {
        body: { image: f.dataUrl, width: f.width, height: f.height },
      });
      if (error) throw error;
      if (data?.card?.left && data?.card?.right && data?.face?.left && data?.face?.right) {
        const conf = typeof data.confidence === "number" ? data.confidence : 0.5;
        pushEvent("scan_server_detected", { confidence: conf, model: data.model });
        const c1: Point = { x: data.card.left.x, y: data.card.left.y };
        const c2: Point = { x: data.card.right.x, y: data.card.right.y };
        const f1: Point = { x: data.face.left.x, y: data.face.left.y };
        const f2: Point = { x: data.face.right.x, y: data.face.right.y };
        if (runCalculate(f, c1, c2, f1, f2)) return;
        // Server points failed plausibility check — go to manual annotate.
        pushEvent("scan_server_fallback", { reason: "validation" });
        setAutoFallback("validation");
        setStep("annotate");
        return;
      }
      pushEvent("scan_server_fallback", { reason: "empty_response" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("fit-scan-detect failed, falling back to client", msg);
      pushEvent("scan_server_fallback", { reason: "network_or_error" });
    }

    // Server detection failed — fall through to manual annotate.
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
                {step === "annotate" && frame && (
                  <AnnotateStep frame={frame} onCalculate={handleCalculate} onRetake={() => setStep("camera")} fallbackReason={autoFallback} />
                )}
                {step === "email-gate" && measurements && (
                  <EmailGateStep
                    faceWidthMm={measurements.faceWidthMm}
                    device={isMobile ? "mobile" : "desktop"}
                    onSubmitted={() => {
                      setEmailCaptured(true);
                      setStep("result");
                    }}
                  />
                )}
                {step === "result" && measurements && recommendation && (
                  <ResultStep measurements={measurements} recommendation={recommendation} onRetake={goWelcome} lang={lang} />
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

