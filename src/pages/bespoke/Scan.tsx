// Bespoke face scan — 3 captures (front + L 90° + R 90°) fused into a
// BespokeProfile and persisted to bespoke_scan_profiles.
//
// - Front: card on forehead, horizontal long edge (same as FitScan).
// - Profile L/R: strict ~90° head turn, card on the visible cheek
//   (horizontal long edge). Yaw detected live via MediaPipe to gate capture.
//
// This is a compact, single-file flow — the existing FitScan camera page is
// 4.8k lines of specialized 007/009 logic and not worth forking. We reuse
// the MediaPipe loader, card detection thresholds, and DesktopScanGate.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import DesktopScanGate from "@/components/DesktopScanGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { getVideoLandmarker } from "@/lib/face-landmarker";
import {
  fuseBespokeProfile,
  type FrontFrame,
  type ProfileFrame,
  type BespokeProfile,
} from "@/lib/bespoke-profile";
import { isLang, type Lang } from "@/lib/i18n";

const GOLD = "#CAA449";
const INK = "#0f0f0f";
const PAPER = "#f0ece4";
const MUTED = "rgba(240,236,228,0.6)";

type Pose = "front" | "left" | "right";
type Step = "intro" | "capture" | "result";

interface CaptureData {
  front?: FrontFrame;
  left?: ProfileFrame;
  right?: ProfileFrame;
}

const POSE_ORDER: Pose[] = ["front", "left", "right"];

const POSE_COPY: Record<Pose, { title: string; body: string }> = {
  front: {
    title: "Face the camera",
    body: "Hold a credit/ID card FLAT on your forehead, long edge horizontal. Eyes level with the lens, ~1–1.5 m away. Use your phone's 2× or 3× zoom lens.",
  },
  left: {
    title: "Turn 90° to your LEFT",
    body: "Strict side profile — your right cheek faces the camera. Hold the card flat against the right cheek, long edge horizontal. Both ear and nose bridge must be visible.",
  },
  right: {
    title: "Turn 90° to your RIGHT",
    body: "Strict side profile — your left cheek faces the camera. Hold the card flat against the left cheek, long edge horizontal.",
  },
};

export default function BespokeScan() {
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const lang: Lang = isLang(params.lang) ? params.lang : "en";

  const [step, setStep] = useState<Step>("intro");
  const [poseIdx, setPoseIdx] = useState(0);
  const [captures, setCaptures] = useState<CaptureData>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BespokeProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const pose = POSE_ORDER[poseIdx];

  const onCaptureDone = useCallback((frame: FrontFrame | ProfileFrame) => {
    setCaptures((prev) => ({ ...prev, [frame.pose]: frame } as CaptureData));
    setError(null);
    if (poseIdx < POSE_ORDER.length - 1) {
      setPoseIdx((i) => i + 1);
    } else {
      // All 3 captured — fuse + persist
      const all = { ...captures, [frame.pose]: frame } as CaptureData;
      if (!all.front) {
        setError("Front capture missing — please restart.");
        return;
      }
      try {
        const fused = fuseBespokeProfile(all.front, all.left, all.right);
        setProfile(fused);
        setStep("result");
        void persist(fused);
      } catch (e) {
        setError(e instanceof Error ? e.message : "fusion_failed");
      }
    }
  }, [captures, poseIdx]);

  const persist = async (fused: BespokeProfile) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insErr } = await supabase.from("bespoke_scan_profiles").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        face_width_mm: fused.faceWidthMm,
        nose_bridge_width_mm: fused.noseBridgeWidthMm,
        nose_bridge_height_mm: fused.noseBridgeHeightMm,
        temple_length_left_mm: fused.templeLengthLeftMm,
        temple_length_right_mm: fused.templeLengthRightMm,
        pantoscopic_angle_deg: fused.pantoscopicAngleDeg,
        asymmetry_mm: fused.asymmetryMm,
        pd_mm: fused.pdMm,
        confidence: fused.confidence,
        raw_frames: {}, // PR 3 will upload to Storage
        capture_method: "web_card_3pose",
        status: "completed",
      });
      if (insErr) console.warn("[bespoke-scan] persist failed", insErr);
    } catch (e) {
      console.warn("[bespoke-scan] persist threw", e);
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setStep("intro");
    setPoseIdx(0);
    setCaptures({});
    setProfile(null);
    setError(null);
  };

  if (!isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: INK, color: PAPER, padding: "40px 20px" }}>
        <SEO title="Bespoke Scan — Woolet" description="Custom bespoke fit scan." noindex />
        <DesktopScanGate lang={lang} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: INK, color: PAPER, fontFamily: "Barlow, sans-serif" }}>
      <SEO title="Bespoke Scan — Woolet" description="Custom bespoke fit scan." noindex />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 40px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => navigate(`/${lang}/bespoke`)}
            style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", padding: 4 }}
          >
            ← Back
          </button>
          <span style={{ color: GOLD, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Bespoke fit scan
          </span>
          <span style={{ width: 60 }} />
        </header>

        {step === "intro" && (
          <IntroStep
            onStart={() => setStep("capture")}
          />
        )}

        {step === "capture" && (
          <CaptureStep
            key={pose}
            pose={pose}
            stepIndex={poseIdx}
            total={POSE_ORDER.length}
            busy={busy}
            setBusy={setBusy}
            error={error}
            setError={setError}
            onDone={onCaptureDone}
          />
        )}

        {step === "result" && profile && (
          <ResultStep
            profile={profile}
            saving={saving}
            onRestart={restart}
            onContinue={() => navigate(`/${lang}/bespoke/configurator`)}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────── Intro ──────────────── */

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
        A custom scan in three photos
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: 0 }}>
        We measure 7 dimensions of your face — face width, nose bridge, temple length, pantoscopic angle, and asymmetry — so your bespoke frame fits exactly.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { n: "1", t: "Face the camera", b: "Card on forehead, ~1–1.5 m away" },
          { n: "2", t: "Turn 90° left", b: "Card flat on your right cheek" },
          { n: "3", t: "Turn 90° right", b: "Card flat on your left cheek" },
        ].map((s) => (
          <div key={s.n} style={{ display: "flex", gap: 14, padding: "14px 16px", border: `1px solid rgba(202,164,73,0.25)`, borderRadius: 6, background: "rgba(202,164,73,0.04)" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: GOLD, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{s.n}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ fontSize: 14, color: PAPER, fontWeight: 500 }}>{s.t}</strong>
              <span style={{ fontSize: 12.5, color: MUTED }}>{s.b}</span>
            </div>
          </div>
        ))}
      </div>
      <aside style={{ padding: "12px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
        <strong style={{ display: "block", fontSize: 12, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          You'll need
        </strong>
        <span style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(240,236,228,0.8)" }}>
          A standard credit or ID card (85.6 mm long edge), a phone with a 2× or 3× zoom camera, and a well-lit space without harsh shadows.
        </span>
      </aside>
      <Button
        onClick={onStart}
        style={{ background: GOLD, color: INK, height: 52, fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}
      >
        Start scan
      </Button>
    </div>
  );
}

/* ──────────────── Capture ──────────────── */

interface CaptureStepProps {
  pose: Pose;
  stepIndex: number;
  total: number;
  busy: boolean;
  setBusy: (b: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  onDone: (frame: FrontFrame | ProfileFrame) => void;
}

function CaptureStep({ pose, stepIndex, total, busy, setBusy, error, setError, onDone }: CaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [yawDeg, setYawDeg] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const copy = POSE_COPY[pose];

  // For profile: target yaw is ±90° (left = face turned to user's left → camera
  // sees their right cheek → MediaPipe yaw negative; right = positive).
  // We compute yaw proxy from nose tip offset between eye outers.
  const targetYawSign = pose === "left" ? -1 : pose === "right" ? 1 : 0;
  const yawOk = pose === "front"
    ? yawDeg !== null && Math.abs(yawDeg) < 8
    : yawDeg !== null && Math.sign(yawDeg) === targetYawSign && Math.abs(yawDeg) >= 70 && Math.abs(yawDeg) <= 100;

  // Start camera
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: pose === "front" ? "user" : "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
      } catch (err) {
        setError(err instanceof Error && err.name === "NotAllowedError"
          ? "Camera permission denied. Allow it and reload."
          : "Couldn't start the camera. Try another browser.");
      }
    };
    void start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [pose, setError]);

  // Yaw detection loop via MediaPipe
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let lm: Awaited<ReturnType<typeof getVideoLandmarker>> | null = null;
    let last = 0;
    getVideoLandmarker().then((l) => { if (!cancelled) lm = l; }).catch(() => { /* noop */ });
    const tick = (ts: number) => {
      const v = videoRef.current;
      if (!v || v.readyState < 2 || !lm) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (ts - last > 400) {
        last = ts;
        try {
          const res = lm.detectForVideo(v, ts);
          const lms = res.faceLandmarks?.[0];
          if (lms && lms.length >= 478) {
            const lEye = lms[33];
            const rEye = lms[263];
            const nose = lms[1];
            if (lEye && rEye && nose) {
              // Yaw proxy in degrees: nose offset from eye midpoint, normalized
              // by eye separation. ±0.5 ≈ ~45°; for strict 90° one eye is
              // largely occluded so eye separation collapses — we use a
              // saturated mapping that returns up to ~100°.
              const midX = (lEye.x + rEye.x) / 2;
              const eyeW = Math.max(1e-4, Math.abs(rEye.x - lEye.x));
              const raw = (nose.x - midX) / eyeW;
              const deg = Math.max(-100, Math.min(100, raw * 180));
              setYawDeg(deg);
            }
          } else {
            setYawDeg(null);
          }
        } catch { /* noop */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  const capture = useCallback(async () => {
    if (busy) return;
    const v = videoRef.current;
    if (!v) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas_ctx_failed");
      ctx.drawImage(v, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-scan-detect", {
        body: { image: dataUrl, width: canvas.width, height: canvas.height, pose },
      });
      if (fnErr) throw fnErr;
      if (!data || data.error) throw new Error(data?.error ?? "unknown_error");

      if (data.glassesDetected) {
        setError("Please remove glasses and try again.");
        setBusy(false);
        return;
      }
      onDone(data as FrontFrame | ProfileFrame);
    } catch (e) {
      console.warn("[bespoke-scan] capture failed", e);
      setError(e instanceof Error ? e.message : "Capture failed — try again.");
    } finally {
      setBusy(false);
    }
  }, [busy, onDone, pose, setBusy, setError]);

  const startTimer = useCallback(() => {
    if (busy || countdown !== null) return;
    setCountdown(3);
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        setCountdown(null);
        void capture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [busy, capture, countdown]);

  const yawColor = yawOk ? "#4ade80" : yawDeg === null ? "#facc15" : "#ef4444";
  const yawLabel = pose === "front"
    ? (yawOk ? "Facing camera" : "Face the camera")
    : (yawOk
        ? `Side profile ${Math.round(Math.abs(yawDeg ?? 0))}°`
        : `Turn to ${pose === "left" ? "your LEFT" : "your RIGHT"} (${yawDeg === null ? "—" : `${Math.round(yawDeg)}°`})`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Step {stepIndex + 1} of {total}
        </span>
        <span style={{ display: "inline-flex", gap: 4 }}>
          {POSE_ORDER.map((_, i) => (
            <span key={i} style={{ width: 24, height: 3, background: i <= stepIndex ? GOLD : "rgba(255,255,255,0.15)", borderRadius: 2 }} />
          ))}
        </span>
      </div>

      <div>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
          {copy.title}
        </h2>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: MUTED, margin: "8px 0 0" }}>
          {copy.body}
        </p>
      </div>

      <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 8, overflow: "hidden", background: "#000", border: "1px solid rgba(202,164,73,0.3)" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
        />
        {/* Pose guide overlay */}
        <svg
          viewBox="0 0 300 400"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {pose === "front" ? (
            <ellipse cx="150" cy="200" rx="105" ry="150" fill="none" stroke={yawColor} strokeWidth="2" strokeDasharray="6 6" opacity="0.7" />
          ) : (
            <path
              d={pose === "left"
                ? "M 200 60 Q 240 200 200 340 Q 170 360 140 340 L 110 290 Q 100 260 120 220 L 115 180 Q 125 130 150 100 Q 175 70 200 60 Z"
                : "M 100 60 Q 60 200 100 340 Q 130 360 160 340 L 190 290 Q 200 260 180 220 L 185 180 Q 175 130 150 100 Q 125 70 100 60 Z"}
              fill="none"
              stroke={yawColor}
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.7"
            />
          )}
        </svg>

        {/* Yaw indicator chip */}
        <div style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.65)",
          border: `1px solid ${yawColor}`,
          color: PAPER,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: yawColor, boxShadow: `0 0 6px ${yawColor}` }} />
          {yawLabel}
        </div>

        {countdown !== null && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 120,
            color: GOLD,
            textShadow: "0 4px 24px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}>
            {countdown}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" style={{ padding: "10px 12px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.08)", borderRadius: 6, fontSize: 13, color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <Button
        onClick={startTimer}
        disabled={!ready || busy || countdown !== null || !yawOk}
        style={{
          background: yawOk ? GOLD : "rgba(202,164,73,0.3)",
          color: INK,
          height: 52,
          fontSize: 14,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {busy ? "Analyzing…" : countdown !== null ? `Capturing in ${countdown}…` : yawOk ? "Capture (3s timer)" : "Hold the right pose"}
      </Button>
    </div>
  );
}

/* ──────────────── Result ──────────────── */

function ResultStep({
  profile,
  saving,
  onRestart,
  onContinue,
}: {
  profile: BespokeProfile;
  saving: boolean;
  onRestart: () => void;
  onContinue: () => void;
}) {
  const rows: Array<{ label: string; value: string }> = useMemo(() => [
    { label: "Face width", value: `${profile.faceWidthMm.toFixed(1)} mm` },
    { label: "Nose bridge width", value: `${profile.noseBridgeWidthMm.toFixed(1)} mm` },
    { label: "Nose bridge height", value: `${profile.noseBridgeHeightMm.toFixed(1)} mm` },
    { label: "Temple length (L)", value: `${profile.templeLengthLeftMm.toFixed(1)} mm` },
    { label: "Temple length (R)", value: `${profile.templeLengthRightMm.toFixed(1)} mm` },
    { label: "Pantoscopic angle", value: `${profile.pantoscopicAngleDeg.toFixed(1)}°` },
    { label: "Asymmetry (L vs R)", value: `${profile.asymmetryMm.toFixed(1)} mm` },
  ], [profile]);

  const conf = Math.round(profile.confidence.overall * 100);
  const confColor = conf >= 75 ? "#4ade80" : conf >= 55 ? "#facc15" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 30, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
          Your bespoke measurements
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: MUTED, margin: "8px 0 0" }}>
          {saving ? "Saving to your profile…" : "Saved. We'll pre-fill these in the configurator."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(202,164,73,0.25)", borderRadius: 6, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
            background: i % 2 === 0 ? "rgba(202,164,73,0.03)" : "transparent",
          }}>
            <span style={{ fontSize: 13, color: MUTED }}>{r.label}</span>
            <span style={{ fontSize: 14, color: PAPER, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        border: `1px solid ${confColor}`,
        borderRadius: 6,
        background: "rgba(0,0,0,0.2)",
      }}>
        <span style={{ fontSize: 12, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Overall confidence
        </span>
        <span style={{ fontSize: 16, color: confColor, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{conf}%</span>
      </div>

      {profile.warnings.length > 0 && (
        <ul style={{ margin: 0, padding: "10px 14px 10px 28px", border: "1px solid rgba(250,204,21,0.4)", background: "rgba(250,204,21,0.06)", borderRadius: 6, fontSize: 12.5, color: "#fcd34d", lineHeight: 1.6 }}>
          {profile.warnings.map((w) => (<li key={w}>{w.replace(/_/g, " ")}</li>))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <Button
          onClick={onRestart}
          variant="outline"
          style={{ flex: 1, height: 48, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", borderColor: "rgba(202,164,73,0.4)", background: "transparent", color: PAPER }}
        >
          Re-scan
        </Button>
        <Button
          onClick={onContinue}
          style={{ flex: 2, height: 48, background: GOLD, color: INK, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Configure bespoke →
        </Button>
      </div>
    </div>
  );
}
