import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CardPositionIllustration from "@/components/CardPositionIllustration";
import { isValidLang, type Lang } from "@/lib/i18n";
import { getImageLandmarker, getVideoLandmarker, hasWebGL, resetLandmarkers } from "@/lib/face-landmarker";
import {
  calculateMeasurements,
  getRecommendation,
  MeasurementError,
  type Measurements,
  type NormalizedLandmark,
  type Point,
  type Recommendation,
} from "@/lib/face-measurements";
import { toast } from "sonner";

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
        Lay any credit card <strong>flat on your forehead, long edge horizontal</strong> — its
        85.6 mm long edge is our scale reference. We won't capture until the card is detected
        flat and horizontal on your forehead.
      </p>

      <ul className="flex flex-col gap-3 pt-1" style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300 }}>
        {[
          "Works on phone (front camera) or laptop (webcam)",
          "Requires a credit/debit/ID card as physical scale reference",
          "Take off your glasses — frames hide your temples and skew the measurement",
          "Lay the card horizontally on your forehead — both long edges touching skin, no tilt",
          "Hold the card by its top edge so your fingers don't cover the bottom corners",
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
  const [cardInZone, setCardInZone] = useState(false);
  const [cardHorizontal, setCardHorizontal] = useState(false);
  const [cardState, setCardState] = useState<"none" | "ok" | "misaligned">("none");
  const [cardConfidence, setCardConfidence] = useState(0);
  const [okFlash, setOkFlash] = useState(0);
  const [guideRect, setGuideRect] = useState<{ left: number; bottom: number; width: number } | null>(null);
  
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
          setGuideRect(null);
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

          // ─── Card guide region ───
          // Single supported placement: card laid FLAT on the forehead, long
          // edge horizontal. This is the only orientation we measure from —
          // it keeps the card in the same focal plane as the face and avoids
          // the systematic under-measurement that the side/cheek placement
          // caused (card depth ≠ face depth).
          const cardLongMm = 85.6;
          const cardShortMm = 54;

          // Top region — horizontal card on forehead
          const topW = bw * 0.6;
          const topH = topW * (cardShortMm / cardLongMm);
          const topX = bx + (bw - topW) / 2;
          const topY = Math.max(0, by - topH * 0.2);

          const region = { x: topX, y: topY, w: topW, h: topH };

          const sampleRegion = (r: { x: number; y: number; w: number; h: number }) => {
            let vGrad = 0, hGrad = 0;
            if (
              r.y + r.h > vh || r.x + r.w > vw || r.x < 0 || r.y < 0 ||
              r.w < 20 || r.h < 20
            ) {
              return { vGrad, hGrad };
            }
            const SW = 32, SH = 32;
            const cv = document.createElement("canvas");
            cv.width = SW; cv.height = SH;
            const cctx = cv.getContext("2d");
            if (!cctx) return { vGrad, hGrad };
            try {
              cctx.drawImage(v, r.x, r.y, r.w, r.h, 0, 0, SW, SH);
              const data = cctx.getImageData(0, 0, SW, SH).data;
              const lum = new Float32Array(SW * SH);
              for (let i = 0; i < SW * SH; i++) {
                const o = i * 4;
                lum[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
              }
              let vSum = 0;
              for (let y = 0; y < SH - 1; y++)
                for (let x = 0; x < SW; x++)
                  vSum += Math.abs(lum[(y + 1) * SW + x] - lum[y * SW + x]);
              vGrad = vSum / ((SH - 1) * SW);
              let hSum = 0;
              for (let y = 0; y < SH; y++)
                for (let x = 0; x < SW - 1; x++)
                  hSum += Math.abs(lum[y * SW + x + 1] - lum[y * SW + x]);
              hGrad = hSum / (SH * (SW - 1));
            } catch { /* CORS */ }
            return { vGrad, hGrad };
          };

          const { vGrad, hGrad } = sampleRegion(region);
          const maxGrad = Math.max(vGrad, hGrad);
          const cardPresent = maxGrad > 7;
          // Card laid flat with long edge horizontal → strong vertical gradient
          // (top/bottom edges of the card) dominating over horizontal.
          const cardAligned = cardPresent && vGrad > hGrad * 1.35 && vGrad > 7;

          // Publish guide rect to React state (mirrored X for display).
          setGuideRect({
            left: ((vw - (region.x + region.w)) / vw) * 100,
            bottom: ((vh - (region.y + region.h)) / vh) * 100,
            width: (region.w / vw) * 100,
          });

          const nextState: "none" | "ok" | "misaligned" = !cardPresent
            ? "none"
            : cardAligned ? "ok" : "misaligned";

          const strength = Math.max(0, Math.min(1, (maxGrad - 2) / 12));
          const dom = vGrad + hGrad > 0
            ? Math.max(0, (maxGrad / (vGrad + hGrad) - 0.5) * 2)
            : 0;
          const confidence = Math.round(strength * (0.45 + 0.55 * dom) * 100);
          setCardConfidence(confidence);

          setCardInZone(cardPresent);
          setCardHorizontal(cardPresent && vGrad > hGrad * 1.35 && vGrad > 7);
          setCardOk(cardAligned);
          setCardState(nextState);

          if (cardAligned && !wasOkRef.current) setOkFlash((n) => n + 1);
          wasOkRef.current = cardAligned;

          // Draw the single guide rectangle.
          const fill = nextState === "ok"
            ? "rgba(74, 222, 128, 0.22)"
            : nextState === "misaligned"
              ? "rgba(250, 204, 21, 0.20)"
              : "rgba(202, 164, 73, 0.10)";
          const stroke = nextState === "ok"
            ? "rgba(74, 222, 128, 0.85)"
            : nextState === "misaligned"
              ? "rgba(250, 204, 21, 0.85)"
              : "rgba(202, 164, 73, 0.55)";
          ctx.fillStyle = fill;
          ctx.fillRect(region.x, region.y, region.w, region.h);
          ctx.strokeStyle = stroke;
          ctx.lineWidth = nextState === "ok" ? 2 : 1.5;
          ctx.setLineDash(nextState === "ok" ? [] : [6, 6]);
          ctx.strokeRect(region.x, region.y, region.w, region.h);
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
            nextHint = "Lay a card flat on your forehead — long edge horizontal";
          else if (nextState === "misaligned")
            nextHint = "Lay card horizontally — long edge across forehead";
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
        role="note"
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          border: `1px solid ${GOLD}`,
          background: "rgba(201,168,76,0.08)",
          borderRadius: 6,
          padding: "10px 12px",
        }}
      >
        <div style={{ flexShrink: 0, width: 84, height: 84, marginTop: 2 }} aria-hidden="true">
          <CardPositionIllustration />
        </div>
        <div style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.82rem", lineHeight: 1.5, color: "hsl(var(--cream-dim))" }}>
          <strong style={{ color: GOLD, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.72rem", display: "block", marginBottom: 2 }}>
            Press the card flat to your forehead
          </strong>
          Both long edges must touch your skin, fingers on the top edge only. If the card sticks out even 2 cm in front of your face, the result comes out 5–10 mm too narrow.
        </div>
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
        {guideRect && cardState === "misaligned" && (
          <div
            role="status"
            className="scan-rotate-hint"
            style={{
              position: "absolute",
              left: `${guideRect.left}%`,
              bottom: `calc(${guideRect.bottom}% - 10px)`,
              width: `${guideRect.width}%`,
              transform: "translateY(100%)",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            <span
              style={{
                background: "rgba(250, 204, 21, 0.95)",
                color: BG,
                fontFamily: "Barlow, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 10px",
                borderRadius: 4,
                boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 12a9 9 0 0 1 15.5-6.2M21 4v5h-5M21 12a9 9 0 0 1-15.5 6.2M3 20v-5h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Rotate card — lay it horizontally on your forehead
            </span>
          </div>
        )}
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
            const label = isOk ? "Card ✓ horizontal" : isMis ? "Lay card flat & horizontal" : "No card on forehead";
            const barColor = isOk ? "#4ade80" : isMis ? "#facc15" : GOLD;
            return (
              <span
                key={`flash-${okFlash}`}
                className={isOk ? "scan-card-badge scan-card-badge-flash" : "scan-card-badge"}
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition:
                    "background 220ms ease, border-color 220ms ease, color 220ms ease",
                }}
              >
                <span>{label}</span>
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.12)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${cardConfidence}%`,
                      background: barColor,
                      transition: "width 240ms ease, background 220ms ease",
                    }}
                  />
                </span>
                <span
                  aria-label={`Detection confidence ${cardConfidence}%`}
                  style={{ minWidth: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                >
                  {cardConfidence}%
                </span>
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

      <div
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "10px 12px",
          border: `1px solid ${cardOk ? "rgba(74,222,128,0.5)" : "rgba(202,164,73,0.25)"}`,
          background: cardOk ? "rgba(74,222,128,0.08)" : "rgba(0,0,0,0.25)",
          borderRadius: 6,
          fontFamily: "Barlow, sans-serif",
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          Pre-measurement checks
        </div>
        {[
          { ok: cardInZone, label: "Card detected on forehead area" },
          { ok: cardHorizontal, label: "Card laid horizontally (long edge across)" },
        ].map((check) => (
          <div key={check.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              aria-hidden
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: check.ok ? "rgba(74,222,128,0.9)" : "rgba(255,255,255,0.12)",
                color: check.ok ? "#0f0f0f" : "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {check.ok ? "✓" : "•"}
            </span>
            <span style={{ opacity: check.ok ? 1 : 0.7 }}>{check.label}</span>
          </div>
        ))}
        {!cardOk && (
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            Capture stays locked until both checks pass.
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (!cardOk) return;
          captureFrame();
        }}
        disabled={!cardOk}
        title={cardOk ? "Capture now" : "Lay the card flat on your forehead, long edge horizontal"}
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
        {cardOk ? "Capture now" : "Capture locked — lay card horizontally on forehead"}
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
        <ul style={{ marginTop: 10, lineHeight: 1.6, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Take off your glasses before scanning.",
            "Lay the card flat on your forehead, long edge horizontal — both long edges must touch skin.",
            "Hold the card by its top edge — keep fingers off the bottom corners.",
            "Don't tilt the card or camera; even a small tilt = 3–6 mm error.",
            "Stand 50–70 cm away and look straight at the lens.",
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
      {countdown == null ? null : <span style={{ display: "none" }}>{countdown}</span>}
    </div>
  );
}

/* ─────────────── Annotate ─────────────── */

interface AnnotateStepProps {
  frame: CapturedFrame;
  onCalculate: (cardCorners: [Point, Point], faceEdges: [Point, Point]) => void;
  onRetake: () => void;
}

function AnnotateStep({ frame, onCalculate, onRetake }: AnnotateStepProps) {
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

  const handleCalculate = ([c1, c2]: [Point, Point], [f1, f2]: [Point, Point]) => {
    if (!frame) return;
    try {
      const m = calculateMeasurements(frame.landmarks, frame.width, c1, c2, f1, f2);
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
      const isMeasurement = err instanceof MeasurementError;
      const msg = err instanceof Error ? err.message : "Calculation failed.";
      const kind = isMeasurement ? err.kind : "unknown";
      // Block URL save: do NOT setMeasurements / setRecommendation / setStep("result").
      setMeasurements(null);
      setRecommendation(null);
      setErrorMsg(msg);
      setErrorKind("recoverable");
      toast.error("Measurement rejected", {
        description: msg,
      });
      pushEvent("scan_error", { error_type: "calculation", reason: kind });
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
          @keyframes scanCardBadgeFlash {
            0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(74,222,128,0.55); }
            40%  { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(74,222,128,0); }
            100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(74,222,128,0); }
          }
          .scan-card-badge-flash { animation: scanCardBadgeFlash 520ms ease-out; }
          @keyframes scanRotateHintIn {
            from { opacity: 0; transform: translateY(calc(100% - 6px)); }
            to   { opacity: 1; transform: translateY(100%); }
          }
          .scan-rotate-hint { animation: scanRotateHintIn 220ms ease-out; }
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

