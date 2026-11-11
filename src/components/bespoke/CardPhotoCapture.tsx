// Takes (or reviews) the fit photo with a card, then checks on the device
// that a face and a bank-size card are visible before the photo is attached.
// The check never blocks: "Use this photo anyway" is always offered, because
// a wrong "no card" must not stop a paying customer.

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, RotateCcw, TriangleAlert, Upload, X } from "lucide-react";
import { checkCardPhoto, type CardCheck } from "@/lib/card-photo-check";
import { clarityEvent } from "@/lib/clarity";

/** Longest edge of the photo handed back. */
const PHOTO_MAX_PX = 2400;
const COUNTDOWN_S = 3;

type Props = {
  /** `camera` opens the live camera; a File goes straight to the check. */
  source: "camera" | File;
  onClose: () => void;
  onAccept: (photo: File, check: CardCheck) => void;
  /** Camera blocked or missing - the caller opens its file picker. */
  onUploadInstead: () => void;
};

type Stage = "starting" | "live" | "checking" | "review" | "camera_error";

const VERDICT: Record<CardCheck["status"], { title: string; body: string }> = {
  card: {
    title: "Card detected",
    body: "We can see your face and the card. Make sure no card numbers are visible.",
  },
  no_card: {
    title: "We cannot see the card",
    body: "Hold it flat against your cheek, long edge level, the whole card in the picture, and try again.",
  },
  no_face: {
    title: "We cannot see your face",
    body: "Face the camera straight on, in even light, with your whole face in the picture.",
  },
  unavailable: {
    title: "We could not check this photo automatically",
    body: "Check it yourself: face straight on, the whole card flat against your cheek, no card numbers visible.",
  },
};

export default function CardPhotoCapture({ source, onClose, onAccept, onUploadInstead }: Props) {
  const fromCamera = source === "camera";
  const [stage, setStage] = useState<Stage>(fromCamera ? "starting" : "checking");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [check, setCheck] = useState<CardCheck | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stillRef = useRef<HTMLCanvasElement | null>(null);
  const shownRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStage("starting");
    setCameraError(null);
    setCheck(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return stream.getTracks().forEach((t) => t.stop());
      video.srcObject = stream;
      await video.play();
      setStage("live");
      clarityEvent("bespoke_photo_camera_open");
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "Camera access is blocked. Allow the camera for this page in your browser, or upload a photo instead."
          : name === "NotFoundError" || (err instanceof Error && err.message === "unsupported")
            ? "We could not find a camera on this device. Upload a photo instead."
            : "We could not start the camera. Close other apps that use it, or upload a photo instead.",
      );
      setStage("camera_error");
      clarityEvent("bespoke_photo_camera_error");
    }
  }, []);

  /** Draw the still (with the card outline, when found) into the visible canvas. */
  const paint = useCallback((result: CardCheck | null) => {
    const still = stillRef.current;
    const shown = shownRef.current;
    if (!still || !shown) return;
    shown.width = still.width;
    shown.height = still.height;
    const ctx = shown.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(still, 0, 0);
    if (result?.status === "card") {
      const { x, y, width, height } = result.box;
      ctx.lineWidth = Math.max(3, still.width / 250);
      ctx.strokeStyle = "#36C46A";
      ctx.strokeRect(x, y, width, height);
    }
  }, []);

  const runCheck = useCallback(
    async (still: HTMLCanvasElement) => {
      stillRef.current = still;
      setStage("checking");
      paint(null);
      const result = await checkCardPhoto(still);
      setCheck(result);
      setStage("review");
      paint(result);
      clarityEvent(`bespoke_photo_check_${result.status}`);
    },
    [paint],
  );

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Stored as the camera saw it (the preview is mirrored, the photo is not).
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    stopCamera();
    void runCheck(canvas);
  }, [runCheck, stopCamera]);

  const startCountdown = () => {
    if (countdown !== null) return;
    let n = COUNTDOWN_S;
    setCountdown(n);
    timerRef.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(null);
        capture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  // Open: start the camera, or decode the chosen file and check it.
  useEffect(() => {
    let cancelled = false;
    if (source === "camera") {
      void startCamera();
    } else {
      const url = URL.createObjectURL(source);
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        const scale = Math.min(1, PHOTO_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        void runCheck(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        if (cancelled) return;
        setCameraError("We could not open that file as a photo. Choose a JPG or PNG, or take the photo here.");
        setStage("camera_error");
      };
      img.src = url;
    }
    return () => {
      cancelled = true;
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog manners: Escape closes, focus moves in, the page behind does not scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const accept = () => {
    const still = stillRef.current;
    if (!still || !check) return;
    still.toBlob(
      (blob) => {
        if (!blob) return;
        onAccept(new File([blob], "fit-photo.jpg", { type: "image/jpeg" }), check);
      },
      "image/jpeg",
      0.92,
    );
  };

  const retake = () => {
    if (fromCamera) void startCamera();
    else onUploadInstead();
  };

  const primary =
    "inline-flex min-h-[48px] items-center justify-center gap-2 bg-gold px-6 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] transition-colors hover:bg-gold-light disabled:opacity-50";
  const secondary =
    "inline-flex min-h-[48px] items-center justify-center gap-2 border border-cream/30 px-6 text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-gold hover:text-gold";
  const verdict = check ? VERDICT[check.status] : null;
  const good = check?.status === "card";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#080807]/95 px-4 py-6 sm:py-10">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Photo with a card"
        tabIndex={-1}
        className="mx-auto max-w-xl border border-cream/15 bg-[#16140F] p-5 text-cream outline-none sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Photo with a card</p>
            <h2 className="mt-1 font-display text-xl font-light text-[#F8F8F6]">
              {stage === "review" || stage === "checking" ? "Check your photo" : "Card flat on your cheek"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-cream/20 text-cream hover:border-gold hover:text-gold"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {(stage === "starting" || stage === "live") && (
          <>
            <div className="relative mt-5 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                data-clarity-mask="true"
                className="block max-h-[60vh] w-full -scale-x-100 object-contain"
              />
              {stage === "starting" && (
                <p className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-cream-dim">
                  <Loader2 size={16} className="animate-spin" aria-hidden /> Starting the camera…
                </p>
              )}
              {countdown !== null && (
                <p
                  aria-live="assertive"
                  className="absolute inset-0 flex items-center justify-center font-display text-7xl text-[#F8F8F6] [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]"
                >
                  {countdown}
                </p>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream-dim">
              Glasses off, face straight on, both ears visible. Hold the whole card flat against
              your cheek, long edge level, numbers turned away. The timer gives you {COUNTDOWN_S}{" "}
              seconds to get into position.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={primary} onClick={startCountdown} disabled={stage !== "live" || countdown !== null}>
                <Camera size={15} aria-hidden /> {countdown !== null ? "Hold still…" : "Take the photo"}
              </button>
              <button type="button" className={secondary} onClick={onUploadInstead}>
                <Upload size={15} aria-hidden /> Upload a photo instead
              </button>
            </div>
          </>
        )}

        {stage === "camera_error" && (
          <>
            <p role="alert" className="mt-5 border border-red-500/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
              {cameraError}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={primary} onClick={onUploadInstead}>
                <Upload size={15} aria-hidden /> Upload a photo
              </button>
              {fromCamera && (
                <button type="button" className={secondary} onClick={() => void startCamera()}>
                  <RotateCcw size={15} aria-hidden /> Try the camera again
                </button>
              )}
            </div>
          </>
        )}

        {(stage === "checking" || stage === "review") && (
          <>
            <div className="relative mt-5 bg-black">
              <canvas
                ref={shownRef}
                data-clarity-mask="true"
                aria-label="Your photo"
                className="mx-auto block max-h-[55vh] max-w-full"
              />
              {stage === "checking" && (
                <p className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/70 py-3 text-sm text-cream">
                  <Loader2 size={16} className="animate-spin" aria-hidden /> Looking for your face and the card…
                </p>
              )}
            </div>
            <div aria-live="polite">
              {stage === "review" && verdict && (
                <div className={`mt-4 flex items-start gap-3 border p-4 ${good ? "border-[#36C46A]/50 bg-[#36C46A]/10" : "border-gold/50 bg-gold/10"}`}>
                  {good ? (
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#36C46A]" aria-hidden />
                  ) : (
                    <TriangleAlert size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  )}
                  <div>
                    <p className="text-sm text-cream">{verdict.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-cream-dim">{verdict.body}</p>
                  </div>
                </div>
              )}
            </div>
            {stage === "review" && (
              <>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {good || check?.status === "unavailable" ? (
                    <>
                      <button type="button" className={primary} onClick={accept}>
                        Use this photo
                      </button>
                      <button type="button" className={secondary} onClick={retake}>
                        <RotateCcw size={15} aria-hidden /> {fromCamera ? "Retake" : "Choose another"}
                      </button>
                    </>
                  ) : (
                    <button type="button" className={primary} onClick={retake}>
                      <RotateCcw size={15} aria-hidden /> {fromCamera ? "Retake the photo" : "Choose another photo"}
                    </button>
                  )}
                </div>
                {!good && check?.status !== "unavailable" && (
                  <button
                    type="button"
                    onClick={accept}
                    className="mt-4 text-xs text-cream-dim underline underline-offset-4 hover:text-gold"
                  >
                    The card is in the picture - use this photo anyway
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
