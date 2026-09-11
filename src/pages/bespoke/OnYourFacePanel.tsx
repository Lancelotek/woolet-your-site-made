// Step 3, Panel B — "On your face".
//
// Everything here happens in the browser. The photograph only reaches Woolet's
// private storage if the person ticks the consent box and presses "Save for the
// workshop". Data controller: JAY23 LLC (Wyoming, USA).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Camera, Check, ChevronDown, Download, ShieldCheck, Smartphone, Upload } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { findFrame } from "@/data/frames";
import { COLORS } from "@/data/bespoke-options";
import type { BespokeConfig } from "@/lib/bespoke-state";
import { adoptSessionRef, getSessionRef } from "@/lib/scan-session-ref";
import {
  CARD_WIDTH_MM,
  MIN_CARD_PX,
  buildExportCanvases,
  canvasToBlob,
  distance,
  drawGuides,
  drawOutline,
  frameFrontWidthMm,
  mmPerPxFromCard,
  outlineAnchor,
  type Point,
} from "@/lib/bespoke-photo-geometry";

const CONSENT_VERSION = "bespoke-photo-v2";

export const CONSENT_TEXT_V2: Record<"en" | "pl", string> = {
  en: "I agree that JAY23 LLC (Woolet) stores this photograph and my face measurements and shares them with its manufacturing partner in Greece for the sole purpose of producing and verifying my bespoke frame. The photograph and the virtual try-on render are deleted 90 days after delivery, or 30 days after upload when no order is placed. I can withdraw this consent at any time at support@woolet.co; withdrawal stops production of the frame.",
  pl: "Wyrażam zgodę na przechowywanie przez JAY23 LLC (Woolet) tego zdjęcia oraz moich wymiarów twarzy i przekazanie ich partnerowi produkcyjnemu w Grecji wyłącznie w celu wykonania i weryfikacji mojej oprawki bespoke. Zdjęcie i wizualizacja przymiarki są usuwane 90 dni po dostawie albo 30 dni po przesłaniu, gdy nie dojdzie do zamówienia. Zgodę mogę wycofać w każdej chwili pod adresem support@woolet.co; wycofanie zatrzymuje produkcję oprawki.",
};

const PHOTO_KEY = "woolet:bespoke:facephoto:v1";
const MAX_EDGE = 1600;
const DEFAULT_TEMPLE_TO_TEMPLE_MM = 158;

const mono = "font-mono text-[12px] text-cream";
const round1 = (n: number) => Math.round(n * 10) / 10;

const PROTOCOL = [
  "Glasses off, hair tucked behind both ears.",
  "Hold any bank card flat against your brow, long edge horizontal.",
  "Arm's length, camera at eye height, chin level.",
  "Even light — face a window, no hard shadow on one cheek.",
];

const isCoarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

const readStoredPhoto = (): string | null => {
  try {
    return window.localStorage.getItem(PHOTO_KEY);
  } catch {
    return null;
  }
};

/** Keeps the stored copy small enough for localStorage without losing scale. */
async function downscaleToDataUrl(img: HTMLImageElement): Promise<string> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.86);
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = src;
  });

interface Props {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
  locale?: "en" | "pl";
}

export default function OnYourFacePanel({ config, update, locale = "en" }: Props) {
  const frame = findFrame(config.frameId) ?? findFrame("round")!;
  const frontColor = COLORS.find((c) => c.id === config.frontColorId);
  const ink = frontColor?.hex ?? "#0B0A09";
  const scanTempleToTempleMm = config.measurements?.templeToTemple ?? null;
  const front = useMemo(
    () => frameFrontWidthMm({ scanTempleToTempleMm, configuratorWidthMm: frame.widthMm }),
    [scanTempleToTempleMm, frame.widthMm],
  );

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [cardPoints, setCardPoints] = useState<Point[]>(config.facePhotoCardPoints ?? []);
  const [templePoints, setTemplePoints] = useState<Point[]>(config.facePhotoTemplePoints ?? []);
  const [picking, setPicking] = useState<"card" | "temples">("card");
  const [howOpen, setHowOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saved">("idle");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraFileRef = useRef<HTMLInputElement | null>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const [overlayReady, setOverlayReady] = useState(0);

  const mobile = isCoarsePointer();

  // Restore any photo saved on this device.
  useEffect(() => {
    const stored = readStoredPhoto();
    if (!stored) return;
    loadImage(stored).then(setImageEl).catch(() => undefined);
  }, []);

  // Pattern artwork used for the outline.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = frame.url;
    img.onload = () => {
      overlayImgRef.current = img;
      setOverlayReady((n) => n + 1);
    };
  }, [frame.url]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const cardPx = cardPoints.length === 2 ? distance(cardPoints[0], cardPoints[1]) : null;
  const mmPerPx = cardPx ? mmPerPxFromCard(cardPx) : null;
  const cardTooShort = cardPx != null && cardPx < MIN_CARD_PX;
  const templeToTempleMm =
    mmPerPx && templePoints.length === 2
      ? round1(distance(templePoints[0], templePoints[1]) * mmPerPx)
      : null;
  const calibrated = Boolean(mmPerPx && templePoints.length === 2);

  // Persist calibration with the build (the photo itself stays in its own key).
  useEffect(() => {
    update("facePhotoCardPoints", cardPoints.length ? cardPoints : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(cardPoints)]);
  useEffect(() => {
    update("facePhotoTemplePoints", templePoints.length ? templePoints : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(templePoints)]);

  /** Suggested temple handles: the scan's width, else 158 mm, else a guess. */
  const seedTemples = useCallback(
    (img: HTMLImageElement, perPx: number | null) => {
      const targetMm = scanTempleToTempleMm ?? DEFAULT_TEMPLE_TO_TEMPLE_MM;
      const widthPx = perPx ? targetMm / perPx : img.naturalWidth * 0.55;
      const cx = img.naturalWidth / 2;
      const cy = img.naturalHeight * 0.42;
      setTemplePoints([
        { x: cx - widthPx / 2, y: cy },
        { x: cx + widthPx / 2, y: cy },
      ]);
    },
    [scanTempleToTempleMm],
  );

  /**
   * Where the frame actually belongs: the face's own temples at eye height.
   * MediaPipe landmarks 234 / 454 are the left and right temple points; 33 / 263
   * are the outer eye corners, which give the vertical line to sit on.
   */
  const seedTemplesFromFace = useCallback(
    async (img: HTMLImageElement, perPx: number | null): Promise<boolean> => {
      try {
        const { getImageLandmarker } = await import("@/lib/face-landmarker");
        const landmarker = await getImageLandmarker();
        const res = landmarker.detect(img);
        const lm = res?.faceLandmarks?.[0];
        if (!lm) return false;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const left = { x: lm[234].x * w, y: lm[234].y * h };
        const right = { x: lm[454].x * w, y: lm[454].y * h };
        const eyeY = ((lm[33].y + lm[263].y) / 2) * h;
        const cx = (left.x + right.x) / 2;
        const angle = Math.atan2(right.y - left.y, right.x - left.x);
        // Keep the measured face width unless a calibrated scale says otherwise.
        const widthPx = perPx
          ? (scanTempleToTempleMm ?? DEFAULT_TEMPLE_TO_TEMPLE_MM) / perPx
          : Math.hypot(right.x - left.x, right.y - left.y);
        const dx = (Math.cos(angle) * widthPx) / 2;
        const dy = (Math.sin(angle) * widthPx) / 2;
        setTemplePoints([
          { x: cx - dx, y: eyeY - dy },
          { x: cx + dx, y: eyeY + dy },
        ]);
        return true;
      } catch {
        return false;
      }
    },
    [scanTempleToTempleMm],
  );

  useEffect(() => {
    if (!imageEl || templePoints.length === 2) return;
    let live = true;
    void seedTemplesFromFace(imageEl, mmPerPx).then((ok) => {
      if (live && !ok) seedTemples(imageEl, mmPerPx);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageEl, mmPerPx]);


  // ---- drawing ------------------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = imageEl.naturalWidth;
    canvas.height = imageEl.naturalHeight;
    ctx.drawImage(imageEl, 0, 0);
    drawGuides(ctx, canvas.width, cardPoints, templePoints);
    const anchor = outlineAnchor(templePoints);
    const overlay = overlayImgRef.current;
    if (overlay && anchor) {
      const widthPx = mmPerPx ? front.mm / mmPerPx : canvas.width * 0.55;
      drawOutline(ctx, overlay, widthPx, anchor, ink);
    }
  }, [imageEl, cardPoints, templePoints, mmPerPx, front.mm, ink]);

  useEffect(() => {
    draw();
  }, [draw, overlayReady]);

  // ---- photo sources ------------------------------------------------------
  const acceptImage = async (src: string) => {
    try {
      const raw = await loadImage(src);
      const dataUrl = await downscaleToDataUrl(raw);
      const img = await loadImage(dataUrl);
      try {
        window.localStorage.setItem(PHOTO_KEY, dataUrl);
      } catch {
        /* quota — the photo simply will not survive a reload */
      }
      setImageEl(img);
      setCardPoints([]);
      setTemplePoints([]);
      setPicking("card");
      setSavedState("idle");
      setError(null);
    } catch {
      setError("That file could not be opened as a photo.");
    }
  };

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraFileRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      // iOS/Chrome can refuse the inline stream; the native camera always works.
      cameraFileRef.current?.click();
    }
  };

  // Attach the stream once the <video> element is actually in the DOM.
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOn || !video || !stream) return;
    video.srcObject = stream;
    const play = () => void video.play().catch(() => undefined);
    video.onloadedmetadata = play;
    play();
    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOn]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) {
      setError("The camera is still warming up — try again in a second.");
      return;
    }
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext("2d")!.drawImage(video, 0, 0);
    stopCamera();
    await acceptImage(c.toDataURL("image/jpeg", 0.92));
  };

  // ---- interaction --------------------------------------------------------
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const p = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    if (picking === "card") setCardPoints((prev) => (prev.length >= 2 ? [p] : [...prev, p]));
    else setTemplePoints((prev) => (prev.length >= 2 ? [p] : [...prev, p]));
  };

  // ---- download -----------------------------------------------------------
  const download = async () => {
    if (!imageEl) return;
    const { vto } = buildExportCanvases({
      image: imageEl,
      cardPoints,
      templePoints,
      overlay: overlayImgRef.current,
      frameWidthPx: mmPerPx ? front.mm / mmPerPx : imageEl.naturalWidth * 0.55,
      ink,
    });
    const blob = await canvasToBlob(vto, "image/png");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `woolet-bespoke-${frame.id}-preview.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- save for the workshop ---------------------------------------------
  const save = async () => {
    if (!imageEl || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const sessionRef = getSessionRef();
      const { data: signed, error: signErr } = await supabase.functions.invoke(
        "bespoke-photo-upload-url",
        { body: { sessionRef } },
      );
      if (signErr || !signed?.uploads) throw new Error("upload_url_failed");

      const exports = buildExportCanvases({
        image: imageEl,
        cardPoints,
        templePoints,
        overlay: overlayImgRef.current,
        frameWidthPx: mmPerPx ? front.mm / mmPerPx : imageEl.naturalWidth * 0.55,
        ink,
      });

      const files: Array<[string, Blob, string]> = [
        ["photo", await canvasToBlob(exports.photo, "image/jpeg", 0.92), "image/jpeg"],
        ["geometry", await canvasToBlob(exports.geometry, "image/png"), "image/png"],
        ["vto", await canvasToBlob(exports.vto, "image/png"), "image/png"],
      ];
      for (const [kind, blob, contentType] of files) {
        const target = signed.uploads[kind];
        const { error: upErr } = await supabase.storage
          .from("bespoke-photos")
          .uploadToSignedUrl(target.path, target.token, blob, { contentType });
        if (upErr) throw upErr;
      }

      const { error: subErr } = await supabase.functions.invoke("bespoke-photo-submit", {
        body: {
          sessionRef,
          consentGiven: true,
          consentText: CONSENT_TEXT_V2[locale],
          consentVersion: CONSENT_VERSION,
          locale,
          photoPath: signed.uploads.photo.path,
          geometryPath: signed.uploads.geometry.path,
          vtoPath: signed.uploads.vto.path,
          photoWidthPx: imageEl.naturalWidth,
          photoHeightPx: imageEl.naturalHeight,
          cardPx,
          cardWidthMm: CARD_WIDTH_MM,
          mmPerPx,
          templeLeftPx: templePoints[0]?.x ?? null,
          templeRightPx: templePoints[1]?.x ?? null,
          photoTempleToTempleMm: templeToTempleMm,
          frameFrontWidthMm: front.mm,
          frameBridgeMm: frame.bridgeMm,
          shapeId: frame.id,
          mappingVersion: front.mappingVersion,
        },
      });
      if (subErr) throw subErr;
      update("facePhotoSavedAt", new Date().toISOString());
      setSavedState("saved");
    } catch (err) {
      console.error("[on-your-face]", err);
      setError("We could not save your photo. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await supabase.functions.invoke("bespoke-photo-delete", {
        body: { sessionRef: getSessionRef() },
      });
      update("facePhotoSavedAt", null);
      setSavedState("idle");
      setConsent(false);
    } finally {
      setBusy(false);
    }
  };

  // ---- markup -------------------------------------------------------------
  const primaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-[12px] uppercase tracking-[0.18em] transition-colors disabled:opacity-40";
  const gold = `${primaryBtn} bg-[#CAA449] text-[#1F1B16] hover:brightness-110`;
  const ghost = `${primaryBtn} border border-[#CAA449]/60 text-[#CAA449] hover:border-[#CAA449]`;

  // Arriving from the QR hand-off: continue the session the desktop started.
  useEffect(() => {
    const sref = new URLSearchParams(window.location.search).get("sref");
    if (sref) adoptSessionRef(sref);
  }, []);

  // The phone must land on the same build and the same pseudonymous session,
  // so a photo taken there attaches to this configuration.
  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?step=3&sref=${encodeURIComponent(getSessionRef())}`
      : "";

  return (
    <section
      className="mt-10 border border-cream/10 p-6 sm:p-8"
      style={{ background: "#080807", color: "#EDE7D9" }}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#CAA449]">On your face</div>
      <h3 className="mt-3 font-display text-2xl font-light">See it at your own scale</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-dim">
        One straight-on photo with a bank card held at your brow gives us a true millimetre scale,
        so the outline you see is the width we would actually cut.
      </p>

      <button
        type="button"
        onClick={() => setHowOpen((v) => !v)}
        aria-expanded={howOpen}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[#CAA449]"
      >
        How to take it <ChevronDown size={14} className={howOpen ? "rotate-180 transition" : "transition"} />
      </button>
      {howOpen && (
        <ul className="mt-3 space-y-2 border border-cream/10 p-4 text-sm text-cream-dim">
          {PROTOCOL.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-5 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Source of the photo */}
      {!imageEl && !cameraOn && (
        <div className="mt-6">
          {mobile ? (
            <div className="flex flex-col items-start gap-3">
              <button type="button" className={gold} onClick={startCamera}>
                <Camera size={16} /> Take a photo
              </button>
              <button
                type="button"
                className="min-h-[44px] text-[12px] underline text-cream-dim"
                onClick={() => fileRef.current?.click()}
              >
                Upload a file instead
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) acceptImage(URL.createObjectURL(f));
                }}
                className="flex flex-col items-start gap-3 border border-dashed border-cream/20 p-6"
              >
                <button type="button" className={gold} onClick={() => fileRef.current?.click()}>
                  <Upload size={16} /> Upload a photo
                </button>
                <p className="text-xs text-cream-dim">or drop the file here</p>
              </div>
              <div className="flex flex-col items-center gap-2 border border-cream/10 p-4">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#CAA449]">
                  <Smartphone size={13} className="mr-1 inline" /> Use your phone
                </span>
                {qrUrl && (
                  <span style={{ background: "#EDE7D9", padding: 8 }}>
                    <QRCodeSVG value={qrUrl} size={112} bgColor="#EDE7D9" fgColor="#1F1B16" />
                  </span>
                )}
                <p className="max-w-[150px] text-center text-[11px] leading-relaxed text-cream-dim">
                  Opens this build on your phone, camera ready.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) acceptImage(URL.createObjectURL(f));
          e.target.value = "";
        }}
      />

      {/* Native camera — the reliable path when the inline stream is refused. */}
      <input
        ref={cameraFileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) acceptImage(URL.createObjectURL(f));
          e.target.value = "";
        }}
      />

      {cameraOn && (
        <div className="mt-6">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full border border-cream/10"
            style={{ transform: "scaleX(-1)", minHeight: 220, background: "#000" }}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={gold} onClick={capture}>
              Capture
            </button>
            <button type="button" className={ghost} onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {imageEl && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPicking("card")}
              aria-pressed={picking === "card"}
              className={`min-h-[44px] border px-4 text-[11px] uppercase tracking-[0.18em] ${
                picking === "card" ? "border-[#CAA449] text-[#CAA449]" : "border-cream/15 text-cream-dim"
              }`}
            >
              Card edges
            </button>
            <button
              type="button"
              onClick={() => setPicking("temples")}
              aria-pressed={picking === "temples"}
              className={`min-h-[44px] border px-4 text-[11px] uppercase tracking-[0.18em] ${
                picking === "temples" ? "border-[#CAA449] text-[#CAA449]" : "border-cream/15 text-cream-dim"
              }`}
            >
              Temples
            </button>
          </div>

          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            className="mt-4 w-full cursor-crosshair border border-cream/10"
          />

          {!calibrated && (
            <p className="mt-3 text-xs text-cream-dim">
              approximate — calibrate with a card for true scale
            </p>
          )}
          {cardTooShort && (
            <p role="alert" className="mt-3 border border-[#CAA449]/40 bg-[#CAA449]/10 p-3 text-sm">
              The card reads {Math.round(cardPx!)} px wide; we need {MIN_CARD_PX} px for a true scale.
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Scale</dt>
              <dd className={mono}>{mmPerPx ? `${round1(1 / mmPerPx)} px/mm` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Temple to temple</dt>
              <dd className={mono}>{templeToTempleMm ? `${templeToTempleMm.toFixed(1)} mm` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Front width</dt>
              <dd className={mono}>{front.mm.toFixed(1)} mm</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={gold} onClick={download}>
              <Download size={16} /> Download preview
            </button>
            <button
              type="button"
              className={ghost}
              onClick={() => (mobile ? startCamera() : fileRef.current?.click())}
            >
              Retake
            </button>
          </div>

          {/* Consent + save */}
          <div className="mt-8 border border-cream/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#CAA449]" aria-hidden />
              <p className="text-sm leading-relaxed text-cream-dim">{CONSENT_TEXT_V2[locale]}</p>
            </div>
            <label className="mt-5 flex min-h-[48px] cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#CAA449]"
              />
              <span>{locale === "pl" ? "Wyrażam zgodę na powyższe." : "I agree to the above."}</span>
            </label>
            <p className="mt-3 text-xs leading-relaxed text-cream-dim">
              Without this, the preview stays on your device only and the workshop cuts your frame from
              the scan numbers alone.{" "}
              <a href="/en/privacy-policy#fit-scan" className="underline">
                How we handle it
              </a>
            </p>

            {savedState === "saved" ? (
              <div className="mt-5">
                <p className="flex items-center gap-2 text-sm text-[#36C46A]">
                  <Check size={16} /> Saved — the workshop will see this with your order.
                </p>
                <button type="button" className={`mt-4 ${ghost}`} disabled={busy} onClick={remove}>
                  Delete my photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`mt-5 ${gold}`}
                disabled={!consent || busy}
                onClick={save}
              >
                {busy ? "Saving…" : "Save for the workshop"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
