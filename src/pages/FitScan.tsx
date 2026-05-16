import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getImageLandmarker, getVideoLandmarker, hasWebGL, resetLandmarkers } from "@/lib/face-landmarker";
import {
  calculateMeasurements,
  getRecommendation,
  type Measurements,
  type NormalizedLandmark,
  type Point,
  type Recommendation,
} from "@/lib/face-measurements";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

type Step = "welcome" | "camera" | "annotate" | "result";

interface CapturedFrame {
  dataUrl: string;
  width: number;
  height: number;
  landmarks: NormalizedLandmark[];
}

/* ─────────────── Welcome ─────────────── */

function WelcomeStep({ lang, onStart, disabled = false }: { lang: Lang; onStart: () => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">CARD-SCALED · 30 SECONDS</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 300, lineHeight: 1 }}
      >
        Measure your face in <em className="italic" style={{ color: GOLD }}>30 seconds</em>
      </h1>
      <p className="text-cream-dim leading-relaxed" style={{ fontSize: "1.05rem", fontWeight: 300 }}>
        Hold any credit card flat against your forehead — its 85.6 mm long edge is our scale
        reference. We won't capture until both your face <em>and</em> the card are clearly visible.
      </p>

      <ul className="flex flex-col gap-3 pt-1" style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300 }}>
        {[
          "Works on phone (front camera) or laptop (webcam)",
          "Requires a credit/debit/ID card as physical scale reference",
          "Accurate to about 2 mm — photo never leaves your device",
        ].map((b) => (
          <li key={b} className="flex items-start gap-3 text-cream-dim" style={{ fontSize: "0.95rem" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginTop: 2, flexShrink: 0 }}>
              <path d="M3 9l4 4 8-8" fill="none" stroke={GOLD} strokeWidth="1.5" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      <p style={{ color: MUTED, fontSize: "0.8rem", fontFamily: "Barlow, sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
        Your photo never leaves this device. We use Google's MediaPipe Face Mesh running locally in
        your browser — no upload, no storage, no third-party servers.
      </p>

      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onStart}
          disabled={disabled}
          style={{
            background: disabled ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "16px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            height: 48,
          }}
        >
          {disabled ? "Scan unavailable" : "Start scan"}
        </button>
        <Link
          to={`/${lang}/fit`}
          style={{
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 300,
            fontSize: "0.78rem",
            textAlign: "center",
            textDecoration: "none",
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
}

function CameraStep({ lang, onCaptured, onError }: CameraStepProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(-1);
  const allGreenSinceRef = useRef<number | null>(null);
  const capturedRef = useRef(false);
  const wasOkRef = useRef(false);

  const [hint, setHint] = useState("Allow camera access");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lighting, setLighting] = useState<"green" | "yellow" | "red">("yellow");
  const [cardOk, setCardOk] = useState(false);
  const [cardState, setCardState] = useState<"none" | "ok" | "misaligned">("none");
  const [cardConfidence, setCardConfidence] = useState(0);
  const [okFlash, setOkFlash] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(false);

  const isCoarsePointer =
    typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const deviceTip = isCoarsePointer
    ? "Hold the phone at arm's length, camera at eye level."
    : "Sit ~50–70 cm from the webcam, eyes level with the camera.";

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const captureFrame = useCallback(async () => {
    if (capturedRef.current) return;
    const v = videoRef.current;
    if (!v) return;
    capturedRef.current = true;

    const w = v.videoWidth;
    const h = v.videoHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);

    try {
      const lm = await getImageLandmarker();
      const res = lm.detect(c);
      if (!res.faceLandmarks?.length) {
        onError("We can't see your face. Try better lighting or face the camera directly.");
        capturedRef.current = false;
        return;
      }
      if (res.faceLandmarks.length > 1) {
        onError("Only one face at a time, please.");
        capturedRef.current = false;
        return;
      }
      stopAll();
      pushEvent("scan_captured");
      onCaptured({ dataUrl, width: w, height: h, landmarks: res.faceLandmarks[0] });
    } catch (err) {
      console.warn("[scan] capture detect failed", err);
      onError("Couldn't process the captured frame. Try again.");
      capturedRef.current = false;
    }
  }, [onCaptured, onError, stopAll]);

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

      let lm;
      try {
        lm = await getVideoLandmarker();
      } catch (err) {
        console.warn("[scan] model load", err);
        pushEvent("scan_error", { error_type: "model_load" });
        onError("Couldn't load face detection. Check your connection and try again.");
        return;
      }
      if (cancelled) return;

      const tick = () => {
        const v = videoRef.current;
        const overlay = overlayRef.current;
        if (!v || !overlay || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        const ts = performance.now();
        if (ts === lastTsRef.current) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        lastTsRef.current = ts;

        const vw = v.videoWidth;
        const vh = v.videoHeight;
        if (overlay.width !== vw || overlay.height !== vh) {
          overlay.width = vw;
          overlay.height = vh;
        }
        const ctx = overlay.getContext("2d");
        if (!ctx) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        ctx.clearRect(0, 0, vw, vh);

        // Luminance sample
        const sample = document.createElement("canvas");
        sample.width = 32;
        sample.height = 32;
        const sctx = sample.getContext("2d");
        let lum = 128;
        if (sctx) {
          sctx.drawImage(v, 0, 0, 32, 32);
          const d = sctx.getImageData(0, 0, 32, 32).data;
          let sum = 0;
          for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          lum = sum / (d.length / 4);
        }
        const lumState: "green" | "yellow" | "red" = lum > 100 ? "green" : lum > 70 ? "yellow" : "red";
        setLighting(lumState);

        let res;
        try {
          res = lm.detectForVideo(v, ts);
        } catch {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const face = res.faceLandmarks?.[0];
        let nextHint = "Position your face in the frame";
        let allGreen = false;

        if (!face) {
          allGreenSinceRef.current = null;
          setCardOk(false);
          setCardState("none");
          setCardConfidence(0);
          wasOkRef.current = false;
        } else {
          let minX = 1, minY = 1, maxX = 0, maxY = 0;
          for (const p of face) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
          const boxH = maxY - minY;
          const bx = minX * vw;
          const by = minY * vh;
          const bw = (maxX - minX) * vw;
          const bh = (maxY - minY) * vh;
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Card guide rectangle (above eyebrows)
          const guideW = bw * 0.6;
          const guideH = guideW * (54 / 85.6);
          const guideX = bx + (bw - guideW) / 2;
          const guideY = by - guideH * 0.2;
          const safeGY = Math.max(0, guideY);

          // ─── Card presence detection ───
          // Sample the guide region and look for strong horizontal edges
          // (a card has hard top/bottom edges; bare skin does not).
          let cardPresent = false;
          let cardAligned = false;
          let vGrad = 0;
          let hGrad = 0;
          if (safeGY + guideH <= vh && guideX + guideW <= vw && guideW > 30 && guideH > 12) {
            const SW = 48;
            const SH = 32;
            const cardCanvas = document.createElement("canvas");
            cardCanvas.width = SW;
            cardCanvas.height = SH;
            const cctx = cardCanvas.getContext("2d");
            if (cctx) {
              try {
                cctx.drawImage(v, guideX, safeGY, guideW, guideH, 0, 0, SW, SH);
                const data = cctx.getImageData(0, 0, SW, SH).data;
                const lumArr = new Float32Array(SW * SH);
                for (let i = 0; i < SW * SH; i++) {
                  const o = i * 4;
                  lumArr[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
                }
                // Vertical gradient → sensitive to HORIZONTAL edges (card lying flat)
                let vSum = 0;
                for (let y = 0; y < SH - 1; y++) {
                  for (let x = 0; x < SW; x++) {
                    vSum += Math.abs(lumArr[(y + 1) * SW + x] - lumArr[y * SW + x]);
                  }
                }
                vGrad = vSum / ((SH - 1) * SW);
                // Horizontal gradient → sensitive to VERTICAL edges (card rotated)
                let hSum = 0;
                for (let y = 0; y < SH; y++) {
                  for (let x = 0; x < SW - 1; x++) {
                    hSum += Math.abs(lumArr[y * SW + x + 1] - lumArr[y * SW + x]);
                  }
                }
                hGrad = hSum / (SH * (SW - 1));
                const maxGrad = Math.max(vGrad, hGrad);
                cardPresent = maxGrad > 7;
                // Aligned = horizontal edges clearly dominate vertical ones
                cardAligned = cardPresent && vGrad > hGrad * 1.35 && vGrad > 7;
              } catch {
                /* CORS or paint error — skip */
              }
            }
          }
          const nextState: "none" | "ok" | "misaligned" = !cardPresent
            ? "none"
            : cardAligned
              ? "ok"
              : "misaligned";

          // Confidence 0–100: combines edge strength + how much horizontal edges dominate.
          // vGrad ≥ 14 → strength saturates at 100. Orientation ratio (vGrad / (vGrad+hGrad))
          // penalises rotated cards.
          const strength = Math.max(0, Math.min(1, (Math.max(vGrad, hGrad) - 2) / 12));
          const orientation =
            vGrad + hGrad > 0 ? Math.max(0, (vGrad / (vGrad + hGrad) - 0.5) * 2) : 0;
          const confidence = Math.round(strength * (0.45 + 0.55 * orientation) * 100);
          setCardConfidence(confidence);

          setCardOk(cardAligned);
          setCardState(nextState);

          // Trigger one-shot flash animation when crossing into "ok"
          if (cardAligned && !wasOkRef.current) {
            setOkFlash((n) => n + 1);
          }
          wasOkRef.current = cardAligned;

          // Draw guide — green when aligned, amber when misaligned, gold dashed when absent
          const guideFill =
            nextState === "ok"
              ? "rgba(74, 222, 128, 0.22)"
              : nextState === "misaligned"
                ? "rgba(250, 204, 21, 0.20)"
                : "rgba(202, 164, 73, 0.18)";
          const guideStroke =
            nextState === "ok"
              ? "rgba(74, 222, 128, 0.85)"
              : nextState === "misaligned"
                ? "rgba(250, 204, 21, 0.85)"
                : "rgba(202, 164, 73, 0.6)";
          ctx.fillStyle = guideFill;
          ctx.fillRect(guideX, safeGY, guideW, guideH);
          ctx.strokeStyle = guideStroke;
          ctx.lineWidth = nextState === "ok" ? 2 : 1.5;
          ctx.setLineDash(nextState === "ok" ? [] : [6, 6]);
          ctx.strokeRect(guideX, safeGY, guideW, guideH);
          ctx.setLineDash([]);

          // Tilt
          const f = face[10];
          const c = face[152];
          const tilt = Math.abs((Math.atan2((c.x - f.x) * vw, (c.y - f.y) * vh) * 180) / Math.PI);

          if (boxH < 0.3) nextHint = "Move closer";
          else if (boxH > 0.7) nextHint = "Move further back";
          else if (lumState === "red") nextHint = "Improve lighting";
          else if (tilt > 5) nextHint = "Keep your head straight";
          else if (nextState === "none")
            nextHint = "Hold a card flat against your forehead — long edge horizontal";
          else if (nextState === "misaligned")
            nextHint = "Rotate the card — long edge across forehead, not vertical";
          else {
            nextHint = "Card aligned — hold still";
            allGreen = true;
          }
        }

        if (allGreen) {
          if (allGreenSinceRef.current == null) allGreenSinceRef.current = ts;
          const elapsed = (ts - allGreenSinceRef.current) / 1000;
          const remaining = Math.max(0, 3 - elapsed);
          const cd = Math.ceil(remaining);
          setCountdown(cd);
          nextHint = `Hold still — capturing in ${cd}…`;
          if (elapsed >= 3) {
            captureFrame();
            return;
          }
        } else {
          allGreenSinceRef.current = null;
          setCountdown(null);
        }

        setHint(nextHint);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    start();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, [captureFrame, onError, stopAll]);

  const lightingColor = lighting === "green" ? "#4ade80" : lighting === "yellow" ? "#facc15" : "#ef4444";

  return (
    <div className="flex flex-col gap-4">
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
        <span
          style={{
            marginLeft: 10,
            color: MUTED,
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Step 2 of 4 — Position yourself
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
        <canvas
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transform: "scaleX(-1)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {(() => {
            const isOk = cardState === "ok";
            const isMis = cardState === "misaligned";
            const bg = isOk
              ? "rgba(74,222,128,0.18)"
              : isMis
                ? "rgba(250,204,21,0.20)"
                : "rgba(0,0,0,0.55)";
            const border = isOk
              ? "rgba(74,222,128,0.6)"
              : isMis
                ? "rgba(250,204,21,0.7)"
                : "rgba(255,255,255,0.15)";
            const fg = isOk ? "#86efac" : isMis ? "#fde68a" : MUTED;
            const label = isOk ? "Card ✓" : isMis ? "Card rotated" : "No card";
            return (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: bg,
                  border: `1px solid ${border}`,
                  color: fg,
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            );
          })()}
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: lightingColor,
              boxShadow: `0 0 8px ${lightingColor}`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            padding: "12px 16px",
            borderRadius: 6,
            color: GOLD,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 300,
            fontSize: "1.4rem",
            textAlign: "center",
          }}
        >
          {hint}
        </div>
      </div>

      <p
        style={{
          color: MUTED,
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.78rem",
          textAlign: "center",
          margin: 0,
        }}
      >
        {deviceTip}
      </p>

      <button
        onClick={() => {
          if (!cardOk) return;
          captureFrame();
        }}
        disabled={!cardOk}
        title={cardOk ? "Capture now" : "Hold the card to your forehead first"}
        style={{
          background: "transparent",
          border: "none",
          color: cardOk ? GOLD : "rgba(255,255,255,0.25)",
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.78rem",
          padding: "8px 0",
          cursor: cardOk ? "pointer" : "not-allowed",
          textDecoration: "underline",
        }}
      >
        {cardOk ? "Capture now" : "Capture locked — card not detected"}
      </button>

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
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          Don't tilt the card or angle the camera. Even a small tilt creates 3–6mm of measurement
          error. Hold the card flat against your skin, look straight at the camera, and stand about
          50–70cm away.
        </p>
      </details>

      <Link
        to={`/${lang}/fit`}
        style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.75rem", textAlign: "center", textDecoration: "none" }}
      >
        Use the manual wizard →
      </Link>
      {countdown == null ? null : <span style={{ display: "none" }}>{countdown}</span>}
    </div>
  );
}

/* ─────────────── Annotate ─────────────── */

interface AnnotateStepProps {
  frame: CapturedFrame;
  onCalculate: (corners: [Point, Point]) => void;
  onRetake: () => void;
}

function AnnotateStep({ frame, onCalculate, onRetake }: AnnotateStepProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [corners, setCorners] = useState<Point[]>([]);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (corners.length >= 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xDisplay = e.clientX - rect.left;
    const yDisplay = e.clientY - rect.top;
    // Convert to native frame coords
    const xNative = (xDisplay / rect.width) * frame.width;
    const yNative = (yDisplay / rect.height) * frame.height;
    setCorners((c) => [...c, { x: xNative, y: yNative }]);
  };

  const reset = () => setCorners([]);

  const cardPxNative =
    corners.length === 2 ? Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y) : 0;

  const scaleX = displaySize.w ? displaySize.w / frame.width : 1;
  const scaleY = displaySize.h ? displaySize.h / frame.height : 1;

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
          Step 3 of 4 — Mark the card
        </span>
      </div>

      <h2 className="font-display text-woolet-white" style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 300 }}>
        Tap the two bottom corners of your card
      </h2>
      <p className="text-cream-dim" style={{ fontSize: "0.95rem", fontWeight: 300 }}>
        We need to know exactly where the card edges are. Tap the bottom-left corner, then the bottom-right corner.
      </p>

      <div
        ref={wrapperRef}
        onClick={handleClick}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${frame.width} / ${frame.height}`,
          borderRadius: 8,
          overflow: "hidden",
          cursor: corners.length < 2 ? "crosshair" : "default",
          background: "#000",
        }}
      >
        <img
          src={frame.dataUrl}
          alt="Captured frame for measurement"
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }}
        />
        {corners.length === 2 && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line
              x1={(frame.width - corners[0].x) * scaleX}
              y1={corners[0].y * scaleY}
              x2={(frame.width - corners[1].x) * scaleX}
              y2={corners[1].y * scaleY}
              stroke={GOLD}
              strokeWidth={2}
            />
          </svg>
        )}
        {corners.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (frame.width - c.x) * scaleX - 6,
              top: c.y * scaleY - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: GOLD,
              boxShadow: `0 0 0 4px rgba(202,164,73,0.25)`,
              animation: "pulse 1.4s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.25); } }`}</style>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem" }}>
        <span>{corners.length} of 2 ✓</span>
        {corners.length === 2 && <span>Card detected: {Math.round(cardPxNative)}px wide</span>}
        {corners.length > 0 && (
          <button onClick={reset} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", textDecoration: "underline", fontSize: "0.78rem" }}>
            Reset corners
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          disabled={corners.length < 2}
          onClick={() => onCalculate([corners[0], corners[1]])}
          style={{
            background: corners.length < 2 ? "rgba(202,164,73,0.3)" : GOLD,
            color: BG,
            fontFamily: "Barlow, sans-serif",
            fontWeight: 500,
            fontSize: "0.72rem",
            padding: "16px 28px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: corners.length < 2 ? "not-allowed" : "pointer",
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

function ResultStep({ measurements, recommendation, onRetake, lang }: ResultStepProps) {
  const handleCta = () => {
    pushEvent("scan_cta_clicked", {
      cta_label: recommendation.primaryCta.toLowerCase().replace(/[^a-z]+/g, "_"),
      recommendation_type: recommendation.type,
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
    ctx.fillText(`${measurements.faceWidthMm} mm`, 60, 250);
    ctx.fillText(`${measurements.noseWidthMm} mm`, 420, 250);
    ctx.fillStyle = "#888";
    ctx.font = "300 14px Barlow, sans-serif";
    ctx.fillText(`Confidence: ${measurements.confidence}`, 60, 300);
    ctx.fillText("woolet.co/en/fit/scan", 60, 460);

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
            {measurements.faceWidthMm} mm
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
            {measurements.noseWidthMm} mm
          </div>
        </div>
        <div style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: "0.78rem" }}>
          Confidence: {measurements.confidence}
        </div>
      </div>

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
          to={`/${lang}/fit?face_width=${measurements.faceWidthMm}&nose_width=${measurements.noseWidthMm}&source=scan`}
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

/* ─────────────── Page shell ─────────────── */

export default function FitScan() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("welcome");
  const [frame, setFrame] = useState<CapturedFrame | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKind, setErrorKind] = useState<"recoverable" | "unsupported" | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [secureCtx, setSecureCtx] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState(0);

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

  const handleCaptured = (f: CapturedFrame) => {
    setFrame(f);
    setStep("annotate");
  };

  const handleCalculate = ([c1, c2]: [Point, Point]) => {
    if (!frame) return;
    try {
      const m = calculateMeasurements(frame.landmarks, frame.width, c1, c2);
      const r = getRecommendation(m.faceWidthMm, m.noseWidthMm);
      setMeasurements(m);
      setRecommendation(r);
      pushEvent("scan_completed", {
        face_width_mm: m.faceWidthMm,
        nose_width_mm: m.noseWidthMm,
        recommendation_type: r.type,
        confidence: m.confidence,
      });
      setStep("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      setErrorMsg(msg);
      setErrorKind("recoverable");
      pushEvent("scan_error", { error_type: "calculation" });
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
        path="/fit/scan"
        noindex
      />

      <Navbar />

      <main className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
        <style>{`
          @media (max-width: 767px) {
            .scan-camera { aspect-ratio: 3/4; }
            .scan-result-number { font-size: 48px; }
            .scan-cta-primary > a:first-child { position: sticky; bottom: 16px; z-index: 10; }
            .scan-tips-accordion { font-size: 13px; }
          }
        `}</style>
        <div className="px-5 sm:px-8 lg:px-16 py-12 sm:py-20">
          <div className="max-w-xl mx-auto">
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
              />
            )}
            {step === "camera" && (
              <CameraStep
                key={retryCount}
                lang={lang}
                onCaptured={handleCaptured}
                onError={handleError}
              />
            )}
            {step === "annotate" && frame && (
              <AnnotateStep frame={frame} onCalculate={handleCalculate} onRetake={() => setStep("camera")} />
            )}
            {step === "result" && measurements && recommendation && (
              <ResultStep measurements={measurements} recommendation={recommendation} onRetake={goWelcome} lang={lang} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

