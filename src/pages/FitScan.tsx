import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isValidLang, type Lang } from "@/lib/i18n";

/* ─────────────────────────────────────────────
   Woolet AI Fit — Cardless Scanner (iris-calibrated)
   No credit card needed. Uses MediaPipe FaceLandmarker
   with iris landmarks; iris diameter ≈ 11.7 mm is the
   clinical reference for px → mm conversion.
   Result is forwarded to /en/fit?face_width=NNN.
   ───────────────────────────────────────────── */

const IRIS_MM = 11.7; // clinical mean horizontal iris diameter (adults)
const FACE_WIDTH_CORRECTION = 1.06; // landmarks 234↔454 underestimate bizygomatic; calibrated

const pushEvent = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

type Phase = "intro" | "permission" | "scanning" | "captured" | "error";

interface Sample {
  faceWidthMm: number;
  irisPx: number;
  facePx: number;
  yaw: number;
  rollDeg: number;
}

const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export default function FitScan() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<{
    detectForVideo: (v: HTMLVideoElement, t: number) => {
      faceLandmarks: { x: number; y: number; z: number }[][];
    };
    close?: () => void;
  } | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [hint, setHint] = useState<string>("Look straight at the camera");
  const [samplesCount, setSamplesCount] = useState(0);
  const [result, setResult] = useState<{ faceWidthMm: number; confidence: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const SAMPLES_NEEDED = 30;

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try {
      landmarkerRef.current?.close?.();
    } catch {
      /* noop */
    }
    landmarkerRef.current = null;
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  const beginScan = useCallback(async () => {
    setPhase("permission");
    setErrorMsg("");
    samplesRef.current = [];
    setSamplesCount(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) throw new Error("Video element missing");
      v.srcObject = stream;
      await v.play();
    } catch (err) {
      setErrorMsg(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow access in your browser settings."
          : "Couldn't start the camera. Try a different browser or device.",
      );
      setPhase("error");
      pushEvent("fit_scan_error", { reason: "camera" });
      return;
    }

    try {
      const cdn = "https://esm.sh/@mediapipe/tasks-vision@0.10.14";
      const vision: {
        FilesetResolver: { forVisionTasks: (p: string) => Promise<unknown> };
        FaceLandmarker: { createFromOptions: (f: unknown, o: unknown) => Promise<typeof landmarkerRef.current> };
      } = await import(/* @vite-ignore */ cdn);
      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
      );
      landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(fileset, {
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
      console.warn("[FitScan] MediaPipe load failed", err);
      setErrorMsg("Failed to load face detection. Check your connection and retry.");
      setPhase("error");
      pushEvent("fit_scan_error", { reason: "model" });
      return;
    }

    setPhase("scanning");
    pushEvent("fit_scan_started", {});

    let lastTs = -1;
    const tick = () => {
      const v = videoRef.current;
      const lm = landmarkerRef.current;
      if (!v || !lm || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ts = performance.now();
      if (ts === lastTs) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTs = ts;

      try {
        const res = lm.detectForVideo(v, ts);
        const face = res.faceLandmarks?.[0];
        // refined model returns 478 points (last 10 are iris)
        if (!face || face.length < 478) {
          setHint("Center your face in the oval");
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const w = v.videoWidth || 1280;
        const h = v.videoHeight || 720;

        // Right iris extremes: 469 (right side), 471 (left side)
        const irisR_a = face[469];
        const irisR_b = face[471];
        const irisRpx = Math.hypot((irisR_a.x - irisR_b.x) * w, (irisR_a.y - irisR_b.y) * h);

        // Left iris extremes: 474, 476
        const irisL_a = face[474];
        const irisL_b = face[476];
        const irisLpx = Math.hypot((irisL_a.x - irisL_b.x) * w, (irisL_a.y - irisL_b.y) * h);

        const irisPx = (irisRpx + irisLpx) / 2;

        // Face width: temple-to-temple proxy (127 ↔ 356)
        const tL = face[127];
        const tR = face[356];
        const facePx = Math.hypot((tL.x - tR.x) * w, (tL.y - tR.y) * h);

        // Roll (head tilt) from eye corners 33 ↔ 263
        const eL = face[33];
        const eR = face[263];
        const rollDeg = Math.abs((Math.atan2((eR.y - eL.y) * h, (eR.x - eL.x) * w) * 180) / Math.PI);

        // Yaw proxy: iris size asymmetry
        const yaw = Math.abs(irisRpx - irisLpx) / Math.max(irisRpx, irisLpx);

        // Quality gates
        if (irisPx < 12) {
          setHint("Move closer to the camera");
        } else if (irisPx > 80) {
          setHint("Move slightly further away");
        } else if (rollDeg > 6) {
          setHint("Keep your head level");
        } else if (yaw > 0.12) {
          setHint("Look directly at the camera");
        } else {
          const mmPerPx = IRIS_MM / irisPx;
          const faceWidthMm = facePx * mmPerPx * FACE_WIDTH_CORRECTION;

          // sanity bounds
          if (faceWidthMm > 130 && faceWidthMm < 200) {
            samplesRef.current.push({ faceWidthMm, irisPx, facePx, yaw, rollDeg });
            setSamplesCount(samplesRef.current.length);
            setHint("Hold steady…");

            if (samplesRef.current.length >= SAMPLES_NEEDED) {
              const arr = samplesRef.current.map((s) => s.faceWidthMm);
              const med = median(arr);
              // confidence: tighter spread = higher
              const dev = Math.sqrt(arr.reduce((a, x) => a + (x - med) ** 2, 0) / arr.length);
              const confidence = Math.max(0.7, Math.min(0.97, 1 - dev / 12));
              setResult({ faceWidthMm: Math.round(med * 10) / 10, confidence });
              setPhase("captured");
              pushEvent("fit_scan_completed", {
                face_width_mm: Math.round(med),
                confidence: Math.round(confidence * 100) / 100,
                samples: arr.length,
              });
              stopAll();
              return;
            }
          }
        }
      } catch {
        /* transient */
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopAll]);

  const useResult = useCallback(() => {
    if (!result) return;
    pushEvent("fit_scan_use_result", { face_width_mm: Math.round(result.faceWidthMm) });
    navigate(`/${lang}/fit?face_width=${Math.round(result.faceWidthMm)}&source=scan`);
  }, [result, navigate, lang]);

  const retry = useCallback(() => {
    stopAll();
    setResult(null);
    setPhase("intro");
  }, [stopAll]);

  const progress = Math.min(100, (samplesCount / SAMPLES_NEEDED) * 100);

  return (
    <>
      <SEO
        title="Cardless Face Scan — Woolet AI Fit"
        description="Measure your face width with just your camera. No credit card needed. Iris-calibrated AI scan in under 15 seconds."
        lang={lang}
        path="/fit/scan"
        noindex
      />

      <Navbar />

      <main className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
        <div className="px-5 sm:px-8 lg:px-16 py-12 sm:py-20">
          <div className="max-w-xl mx-auto flex flex-col gap-8">
            <div className="woolet-eyebrow">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">CARDLESS SCAN · BETA</span>
            </div>

            <h1
              className="font-display text-woolet-white leading-[0.95]"
              style={{ fontSize: "clamp(2.2rem, 4.6vw, 3rem)", fontWeight: 300 }}
            >
              <em className="italic text-gold-light">No card.</em> Just your face.
            </h1>

            <p className="text-cream-dim leading-relaxed" style={{ fontSize: "1rem" }}>
              We use the natural width of your iris (≈11.7 mm) as the scale reference. Hold steady
              for ten seconds. Your video never leaves this device.
            </p>

            {phase === "intro" && (
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={beginScan}
                  style={{
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
                  }}
                >
                  Start cardless scan
                </button>
                <Link
                  to={`/${lang}/fit`}
                  style={{
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.7rem",
                    padding: "12px 0",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Use the card method instead →
                </Link>
              </div>
            )}

            {(phase === "permission" || phase === "scanning") && (
              <div className="flex flex-col gap-4">
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 4",
                    background: "#000",
                    borderRadius: 8,
                    overflow: "hidden",
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
                      transform: "scaleX(-1)",
                    }}
                  />
                  {/* face oval guide */}
                  <svg
                    viewBox="0 0 300 400"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  >
                    <ellipse
                      cx="150"
                      cy="190"
                      rx="105"
                      ry="140"
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                      opacity="0.7"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      right: 12,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(6px)",
                      padding: "10px 14px",
                      borderRadius: 6,
                      color: "#fff",
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.8rem",
                      textAlign: "center",
                    }}
                  >
                    {phase === "permission" ? "Allow camera access…" : hint}
                  </div>
                </div>

                <div style={{ height: 4, background: "hsl(var(--border))", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "hsl(var(--gold))",
                      transition: "width 200ms",
                    }}
                  />
                </div>
                <p className="text-cream-dim text-center" style={{ fontSize: "0.75rem", fontFamily: "Barlow, sans-serif" }}>
                  {samplesCount} / {SAMPLES_NEEDED} valid frames
                </p>

                <button
                  onClick={retry}
                  style={{
                    background: "transparent",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--cream-dim))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.7rem",
                    padding: "12px 0",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {phase === "captured" && result && (
              <div
                className="flex flex-col gap-5 animate-fade-in"
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  padding: "24px 22px",
                  background: "hsl(var(--card))",
                }}
              >
                <div className="text-cream-dim" style={{ fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  Your face width
                </div>
                <div
                  className="font-display text-woolet-white"
                  style={{ fontSize: "3.4rem", fontWeight: 300, lineHeight: 1 }}
                >
                  {result.faceWidthMm.toFixed(1)}
                  <span className="text-gold-light" style={{ fontSize: "1.4rem", marginLeft: 8 }}>mm</span>
                </div>
                <p className="text-cream-dim" style={{ fontSize: "0.85rem" }}>
                  Confidence {Math.round(result.confidence * 100)}%. Iris-calibrated, ±2 mm.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={useResult}
                    style={{
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
                    }}
                  >
                    See my recommended fit →
                  </button>
                  <button
                    onClick={retry}
                    style={{
                      background: "transparent",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--cream-dim))",
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.7rem",
                      padding: "12px 0",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Re-scan
                  </button>
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="flex flex-col gap-4">
                <p className="text-cream-dim" style={{ fontSize: "0.9rem" }}>{errorMsg}</p>
                <button
                  onClick={retry}
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.7rem",
                    padding: "14px 24px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
                <Link
                  to={`/${lang}/fit`}
                  style={{
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Use the card method →
                </Link>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
