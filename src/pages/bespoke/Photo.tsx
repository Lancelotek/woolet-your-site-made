// Post-purchase photo step — "Photo for the workshop".
//
// Principle: FitLens measures, Woolet identifies. This page runs entirely on
// Woolet's own infrastructure — the photo is captured here, scaled against a
// bank card the buyer holds up, used to render a try-on preview, and uploaded
// straight into Woolet's private storage. The scan provider never sees it.
//
// Data controller: JAY23 LLC (Wyoming, USA).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, Check, CreditCard, ScanFace, ShieldCheck, Sun, Upload } from "lucide-react";

import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { findFrame } from "@/data/frames";
import { useBespokeConfig } from "@/lib/bespoke-state";
import {
  CARD_WIDTH_MM,
  MIN_CARD_PX,
  distance,
  frameFrontWidthMm,
  keyOutOutline,
  mmPerPxFromCard,
  type Point,
} from "@/lib/bespoke-photo-geometry";

const CONSENT_VERSION = "bespoke-photo-v1";

// v1 consent wording. Shown verbatim, stored byte for byte with the record.
const CONSENT_TEXT =
  "I agree that JAY23 LLC may store the photograph I upload and use it only to " +
  "check the fit of my made-to-measure frames, to generate a try-on preview, and " +
  "to share it with the workshop building my frames. I understand the photograph " +
  "is not used for marketing, is never made public, and that I can withdraw this " +
  "consent at any time, after which the photograph is deleted.";

/** Anything beyond this gap between photo and scan pauses production. */
const DELTA_WARN_MM = 4;

type Stage = "consent" | "capture" | "card" | "temples" | "review" | "done";

const round1 = (n: number) => Math.round(n * 10) / 10;

const INSTRUCTIONS = [
  { icon: Sun, title: "Even light, face on", body: "Stand facing a window. No hard shadow across one cheek." },
  { icon: CreditCard, title: "Bank card on your cheek", body: "Hold it flat against your cheek, long edge horizontal, numbers facing out." },
  { icon: ScanFace, title: "Both ears in frame", body: "Chin level, glasses off, hair tucked behind the ears." },
  { icon: Camera, title: "One straight-on shot", body: "Arm's length, camera at eye height. Do not crop it afterwards." },
];

export default function BespokePhoto() {
  const [params] = useSearchParams();
  const sid = params.get("sid") ?? "";
  const { config } = useBespokeConfig();
  const frame = findFrame(config.frameId) ?? findFrame("round")!;
  const scanTempleToTempleMm = config.measurements?.templeToTemple ?? null;

  const front = useMemo(
    () => frameFrontWidthMm({ scanTempleToTempleMm, configuratorWidthMm: frame.widthMm }),
    [scanTempleToTempleMm, frame.widthMm],
  );

  const [stage, setStage] = useState<Stage>("consent");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ deltaMm: number | null; needsReview: boolean } | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [cardPoints, setCardPoints] = useState<Point[]>([]);
  const [templePoints, setTemplePoints] = useState<Point[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);

  // Preload the configurator pattern used for the try-on outline.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = frame.url;
    img.onload = () => {
      frameImgRef.current = img;
      draw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.url]);

  const cardPx = useMemo(
    () => (cardPoints.length < 2 ? null : distance(cardPoints[0], cardPoints[1])),
    [cardPoints],
  );
  const mmPerPx = useMemo(() => (cardPx ? mmPerPxFromCard(cardPx) : null), [cardPx]);
  const cardTooShort = cardPx != null && cardPx < MIN_CARD_PX;

  const templeToTempleMm = useMemo(() => {
    if (!mmPerPx || templePoints.length < 2) return null;
    return round1(distance(templePoints[0], templePoints[1]) * mmPerPx);
  }, [mmPerPx, templePoints]);

  const deltaMm = useMemo(() => {
    if (templeToTempleMm == null || scanTempleToTempleMm == null) return null;
    return round1(Math.abs(templeToTempleMm - scanTempleToTempleMm));
  }, [templeToTempleMm, scanTempleToTempleMm]);

  // ---- canvas -------------------------------------------------------------
  /** Draws the measurement handles onto any context, at photo resolution. */
  const drawGuides = useCallback(
    (ctx: CanvasRenderingContext2D, width: number) => {
      const dot = (p: Point, color: string) => {
        const r = Math.max(6, width / 120);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = Math.max(2, r / 4);
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.stroke();
      };
      const line = (a: Point, b: Point, color: string) => {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, width / 350);
        ctx.stroke();
      };
      if (cardPoints.length === 2) line(cardPoints[0], cardPoints[1], "#CAA449");
      cardPoints.forEach((p) => dot(p, "#CAA449"));
      if (templePoints.length === 2) line(templePoints[0], templePoints[1], "#36C46A");
      templePoints.forEach((p) => dot(p, "#36C46A"));
    },
    [cardPoints, templePoints],
  );

  /** Draws the keyed-out frame outline at its real width on the face. */
  const drawOutline = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const overlay = frameImgRef.current;
      if (!overlay || !mmPerPx || templePoints.length !== 2) return;
      const widthPx = front.mm / mmPerPx;
      const outline = keyOutOutline(overlay, widthPx, "#0B0A09");
      const cx = (templePoints[0].x + templePoints[1].x) / 2;
      const cy = (templePoints[0].y + templePoints[1].y) / 2;
      const angle = Math.atan2(
        templePoints[1].y - templePoints[0].y,
        templePoints[1].x - templePoints[0].x,
      );
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.95;
      ctx.drawImage(outline, -outline.width / 2, -outline.height / 2);
      ctx.restore();
    },
    [mmPerPx, templePoints, front.mm],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = imageEl.naturalWidth;
    canvas.height = imageEl.naturalHeight;
    ctx.drawImage(imageEl, 0, 0);
    drawGuides(ctx, canvas.width);
    drawOutline(ctx);
  }, [imageEl, drawGuides, drawOutline]);

  useEffect(() => {
    draw();
  }, [draw]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const p = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    if (stage === "card") {
      setCardPoints((prev) => (prev.length >= 2 ? [p] : [...prev, p]));
    } else if (stage === "temples") {
      setTemplePoints((prev) => (prev.length >= 2 ? [p] : [...prev, p]));
    }
  };

  const onFile = (file: File) => {
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setImageUrl(url);
      setCardPoints([]);
      setTemplePoints([]);
      setStage("card");
    };
    img.onerror = () => setError("That file could not be opened as a photo.");
    img.src = url;
  };

  // ---- submit -------------------------------------------------------------
  const submit = async () => {
    if (!sid) return setError("This link is missing its order reference.");
    if (!canvasRef.current || !imageEl || !mmPerPx || !templeToTempleMm || !cardPx) return;
    setBusy(true);
    setError(null);
    try {
      const { data: signed, error: signErr } = await supabase.functions.invoke(
        "bespoke-photo-upload-url",
        { body: { sid } },
      );
      if (signErr || !signed?.uploads) throw new Error("We could not prepare the upload.");

      const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
        new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode_failed"))), type, quality),
        );

      const w = imageEl.naturalWidth;
      const h = imageEl.naturalHeight;

      // 1. photo.jpg — the original frame, no guides drawn on it.
      const plain = document.createElement("canvas");
      plain.width = w;
      plain.height = h;
      plain.getContext("2d")!.drawImage(imageEl, 0, 0);

      // 2. geometry.png — handles only, transparent, at original resolution.
      const geometry = document.createElement("canvas");
      geometry.width = w;
      geometry.height = h;
      drawGuides(geometry.getContext("2d")!, w);

      // 3. vto.png — photo + outline + handles, at original resolution.
      const vto = document.createElement("canvas");
      vto.width = w;
      vto.height = h;
      const vctx = vto.getContext("2d")!;
      vctx.drawImage(imageEl, 0, 0);
      drawGuides(vctx, w);
      drawOutline(vctx);

      const uploads: Array<[string, Blob, string]> = [
        ["photo", await toBlob(plain, "image/jpeg", 0.92), "image/jpeg"],
        ["geometry", await toBlob(geometry, "image/png"), "image/png"],
        ["vto", await toBlob(vto, "image/png"), "image/png"],
      ];

      for (const [kind, blob, contentType] of uploads) {
        const target = signed.uploads[kind];
        const { error: upErr } = await supabase.storage
          .from("bespoke-photos")
          .uploadToSignedUrl(target.path, target.token, blob, { contentType });
        if (upErr) throw upErr;
      }

      const { data, error: subErr } = await supabase.functions.invoke("bespoke-photo-submit", {
        body: {
          sid,
          consentGiven: true,
          consentText: CONSENT_TEXT,
          consentVersion: CONSENT_VERSION,
          locale: document.documentElement.lang || "en",
          photoPath: signed.uploads.photo.path,
          geometryPath: signed.uploads.geometry.path,
          vtoPath: signed.uploads.vto.path,
          photoWidthPx: w,
          photoHeightPx: h,
          cardPx,
          cardWidthMm: CARD_WIDTH_MM,
          mmPerPx,
          templeLeftPx: templePoints[0].x,
          templeRightPx: templePoints[1].x,
          photoTempleToTempleMm: templeToTempleMm,
          frameFrontWidthMm: front.mm,
          frameBridgeMm: frame.bridgeMm,
          shapeId: frame.id,
          mappingVersion: front.mappingVersion,
        },
      });
      if (subErr) throw subErr;
      setResult({ deltaMm: data?.deltaMm ?? deltaMm, needsReview: Boolean(data?.needsReview) });
      setStage("done");
    } catch (err) {
      console.error("[bespoke-photo]", err);
      setError("We could not save your photo. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    try {
      await supabase.functions.invoke("bespoke-consent-withdraw", { body: { sid } });
      setResult(null);
      setStage("consent");
      setConsent(false);
      setImageEl(null);
      setImageUrl(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const eyebrow = "text-[11px] uppercase tracking-[0.18em] text-gold";
  const card = "border border-cream/10 bg-[#16140F] p-6 sm:p-8";
  const primaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 bg-gold px-6 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] transition-colors hover:bg-gold-light disabled:opacity-40";
  const secondaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 border border-gold/60 px-6 text-[12px] uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold";

  return (
    <>
      <SEO title="Fit photo — Woolet Bespoke" description="Confirm the fit of your made-to-measure frames." noindex />
      <main className="min-h-screen bg-[#080807] px-5 py-12 text-cream sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Photo for the workshop · optional</p>
          <h1 className="mt-3 font-display text-3xl font-light text-[#F8F8F6] sm:text-4xl">
            One photo, and we cut to your face
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-dim">
            Hold any bank card flat against your cheek and take a straight-on photo. The card
            gives us a true scale, so we can check your measurements and show you the frames on
            your own face before we cut them.
          </p>

          {error && (
            <p role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          {stage === "consent" && (
            <section className={`mt-8 ${card}`}>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">Your photo, your call</h2>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">{CONSENT_TEXT}</p>
                </div>
              </div>
              <label className="mt-6 flex min-h-[48px] cursor-pointer items-start gap-3 text-sm text-cream">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[#CAA449]"
                />
                <span>I agree to the above.</span>
              </label>
              <button
                type="button"
                className={`mt-6 ${primaryBtn}`}
                disabled={!consent}
                onClick={() => setStage("capture")}
              >
                Continue
              </button>
              <p className="mt-4 text-xs text-cream-dim/70">
                Prefer not to? Your frames are still built from the measurements you already sent.{" "}
                <Link to="/en/bespoke/measurements" className="underline">Back to my measurements</Link>
              </p>
            </section>
          )}

          {stage === "capture" && (
            <section className={`mt-8 ${card}`}>
              <h2 className="font-display text-xl font-light text-[#F8F8F6]">Take the photo</h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                {INSTRUCTIONS.map(({ icon: Icon, title, body }, i) => (
                  <li key={title} className="border border-cream/10 bg-[#080807] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold/50 text-gold">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gold">Step {i + 1}</span>
                    </div>
                    <p className="mt-3 text-sm text-cream">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-cream-dim">{body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className={primaryBtn} onClick={() => fileRef.current?.click()}>
                  <Camera className="h-4 w-4" aria-hidden /> Take a photo
                </button>
                <button type="button" className={secondaryBtn} onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" aria-hidden /> Upload a photo
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="user"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                  e.target.value = "";
                }}
              />
            </section>
          )}

          {(stage === "card" || stage === "temples" || stage === "review") && (
            <section className={`mt-8 ${card}`}>
              <h2 className="font-display text-xl font-light text-[#F8F8F6]">
                {stage === "card"
                  ? "Tap the two short edges of the card"
                  : stage === "temples"
                    ? "Tap the outer edge of each temple"
                    : "Your try-on preview"}
              </h2>
              <p className="mt-2 text-sm text-cream-dim">
                {stage === "card"
                  ? "Left edge, then right edge. This sets the scale in millimetres."
                  : stage === "temples"
                    ? "The widest point on each side of your head, level with your eyes."
                    : "This is the frame at its real width on your face."}
              </p>

              <canvas
                ref={canvasRef}
                onClick={onCanvasClick}
                className="mt-5 w-full cursor-crosshair border border-cream/10"
              />

              {cardTooShort && (
                <p role="alert" className="mt-4 border border-gold/40 bg-gold/10 p-3 text-sm text-cream">
                  The card reads only {Math.round(cardPx!)} px wide. We need at least {MIN_CARD_PX} px
                  to scale accurately — move closer, or take the photo again at full resolution.
                </p>
              )}

              {stage === "review" && deltaMm != null && deltaMm > DELTA_WARN_MM && (
                <p role="alert" className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                  This photo reads {templeToTempleMm} mm across, {deltaMm} mm away from the{" "}
                  {scanTempleToTempleMm} mm on file. We will check it by hand before anything is cut.
                </p>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Scale</dt>
                  <dd className="text-cream">{mmPerPx ? `${round1(1 / mmPerPx)} px per mm` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Temple to temple</dt>
                  <dd className="text-cream">{templeToTempleMm ? `${templeToTempleMm} mm` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">Front width</dt>
                  <dd className="text-cream">{front.mm} mm · bridge {frame.bridgeMm} mm</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                {stage === "card" && (
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={!mmPerPx}
                    onClick={() => setStage("temples")}
                  >
                    Next
                  </button>
                )}
                {stage === "temples" && (
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={!templeToTempleMm}
                    onClick={() => setStage("review")}
                  >
                    See the preview
                  </button>
                )}
                {stage === "review" && (
                  <button type="button" className={primaryBtn} disabled={busy} onClick={submit}>
                    {busy ? "Sending…" : "Send to the workshop"}
                  </button>
                )}
                <button type="button" className={secondaryBtn} onClick={() => setStage("capture")}>
                  Retake
                </button>
              </div>
            </section>
          )}

          {stage === "done" && (
            <section className={`mt-8 ${card}`}>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#36C46A]" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">Photo received</h2>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                    {result?.needsReview
                      ? "Your photo reads a little differently from your scan, so we will check it by hand before cutting. We will email you if anything needs confirming."
                      : "Your photo matches your measurements. Your frames go into production as planned — two weeks from here."}
                  </p>
                  {result?.deltaMm != null && (
                    <p className="mt-2 text-xs text-cream-dim/70">
                      Difference against your scan: {result.deltaMm} mm.
                    </p>
                  )}
                </div>
              </div>
              <button type="button" className={`mt-6 ${secondaryBtn}`} disabled={busy} onClick={withdraw}>
                Delete my photo
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
