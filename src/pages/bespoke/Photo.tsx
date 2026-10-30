// Post-purchase photo step — "Photo for the workshop".
//
// Principle: FitLens measures, Woolet identifies. This page runs entirely on
// Woolet's own infrastructure — the photo is captured here, scaled against a
// bank card the buyer holds up, used to render a try-on preview, and uploaded
// straight into Woolet's private storage. The scan provider never sees it.
//
// Data controller: JAY23 LLC (Wyoming, USA).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Camera, Check, CreditCard, Ruler, ScanFace, ShieldCheck, Smartphone, Sun, Upload, UserRound } from "lucide-react";

import SEO from "@/components/SEO";
import ProfilePhotoIllustration from "@/components/ProfilePhotoIllustration";
import type { Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { findFrame } from "@/data/frames";
import { useBespokeConfig } from "@/lib/bespoke-state";
import { clarityEvent, clarityUpgrade } from "@/lib/clarity";
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

// v2 (30.10.2026): consent covers two photos - front and side profile.
const CONSENT_VERSION = "bespoke-photo-v2";

// v1 consent wording. Shown verbatim, stored byte for byte with the record.
// Polish version is shown on the PL route; English is the default.
const CONSENT_TEXT: Record<string, string> = {
  en: "I agree that JAY23 LLC (Woolet) stores these photographs (front and side) and my face measurements and shares them with its manufacturing partner in the EU for the sole purpose of producing and verifying my bespoke frame. The photographs and the virtual try-on render are deleted 90 days after delivery. I can withdraw this consent at any time at support@woolet.co; withdrawal stops production of the frame.",
  pl: "Wyrażam zgodę na przechowywanie przez JAY23 LLC (Woolet) tych zdjęć (z przodu i z profilu) oraz moich wymiarów twarzy i przekazanie ich partnerowi produkcyjnemu w UE wyłącznie w celu wykonania i weryfikacji mojej oprawki bespoke. Zdjęcia i wizualizacja przymiarki są usuwane 90 dni po dostawie. Zgodę mogę wycofać w każdej chwili pod adresem support@woolet.co; wycofanie zatrzymuje produkcję oprawki.",
};

const AGREE_LABEL: Record<string, string> = {
  en: "I agree to the above.",
  pl: "Wyrażam zgodę na powyższe.",
};

/** Anything beyond this gap between photo and scan pauses production. */
const DELTA_WARN_MM = 4;

type Stage = "consent" | "capture" | "card" | "temples" | "review" | "profile" | "done";

/** Longest edge of the side photo we store. Plenty for reading the bridge. */
const PROFILE_MAX_PX = 2400;

const round1 = (n: number) => Math.round(n * 10) / 10;

const INSTRUCTIONS = [
  { icon: Sun, title: "Even light, face on", body: "Stand facing a window. No hard shadow across one cheek." },
  { icon: CreditCard, title: "Bank card on your cheek", body: "Any card the size of a bank card works - loyalty, gift or ID-size. Hold it flat against your cheek, long edge horizontal, card numbers turned away or covered." },
  { icon: ScanFace, title: "Both ears in frame", body: "Chin level, glasses off, hair tucked behind the ears." },
  { icon: Camera, title: "One straight-on shot", body: "Arm's length, camera at eye height. Do not crop it afterwards." },
];

// Side photo: shows where the nose bridge starts against the eye line, which
// the front photo cannot. That decides how low the bridge of the frame sits.
const PROFILE_INSTRUCTIONS = [
  { icon: UserRound, title: "Exactly side-on", body: "Turn your head 90°. Ear, eye and the whole nose bridge visible, nothing in front of the nose." },
  { icon: CreditCard, title: "Card on the same cheek", body: "Flat against the cheek facing the camera, long edge level, card numbers turned away." },
  { icon: Smartphone, title: "Camera at eye height", body: "50 cm or more away. Ask someone to take it, or prop the phone up - no selfie at arm's length." },
  { icon: Ruler, title: "Look straight ahead", body: "Chin level, glasses off, hair tucked behind the ear. Do not crop the photo." },
];

/** Re-encode the side photo as a JPEG no larger than PROFILE_MAX_PX. */
async function profileToJpeg(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode_failed"));
      el.src = url;
    });
    const scale = Math.min(1, PROFILE_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, "image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function BespokePhoto() {
  const { lang = "en" } = useParams<{ lang?: string }>();
  const [params] = useSearchParams();
  const sid = params.get("sid") ?? "";
  const { config } = useBespokeConfig();
  const frame = findFrame(config.frameId) ?? findFrame("round")!;
  const scanTempleToTempleMm = config.measurements?.templeToTemple ?? null;
  const locale = (lang === "pl" ? "pl" : "en") as keyof typeof CONSENT_TEXT;
  const consentText = CONSENT_TEXT[locale];

  const front = useMemo(
    () => frameFrontWidthMm({ scanTempleToTempleMm, configuratorWidthMm: frame.widthMm }),
    [scanTempleToTempleMm, frame.widthMm],
  );

  const [stage, setStage] = useState<Stage>("consent");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ deltaMm: number | null; needsReview: boolean; profileOnly?: boolean } | null>(null);
  // Side photo. `profileOnly` = the front photo is already on file and the
  // buyer only adds the side photo.
  const [profileOnly, setProfileOnly] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  // A photo may already exist — taken in the configurator before paying, and
  // attached to this order by the payment webhook.
  const [photoOnFile, setPhotoOnFile] = useState<{ status: string; uploaded_at: string | null; has_profile?: boolean } | null>(null);

  // Paid customers only — keep the session (upgrade) and mark the page view.
  useEffect(() => {
    clarityEvent("bespoke_photo_view");
    clarityUpgrade("bespoke_paid");
  }, []);

  useEffect(() => {
    if (!sid) return;
    let live = true;
    supabase.functions
      .invoke("bespoke-photo-upload-url", { body: { sid, probe: true } })
      .then(({ data }) => {
        if (live && data?.existing) setPhotoOnFile(data.existing);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [sid]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [cardPoints, setCardPoints] = useState<Point[]>([]);
  const [templePoints, setTemplePoints] = useState<Point[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const profileRef = useRef<HTMLInputElement | null>(null);

  const onProfileFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("That file could not be opened as a photo.");
    setProfileFile(file);
    setProfilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };
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
  // Drawing lives in bespoke-photo-geometry so the configurator's "On your
  // face" panel and this page can never disagree about the geometry.
  const guides = useCallback(
    (ctx: CanvasRenderingContext2D, width: number) => drawGuides(ctx, width, cardPoints, templePoints),
    [cardPoints, templePoints],
  );

  const overlay = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const img = frameImgRef.current;
      const anchor = outlineAnchor(templePoints);
      if (!img || !mmPerPx || !anchor) return;
      drawOutline(ctx, img, front.mm / mmPerPx, anchor, "#0B0A09");
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
    guides(ctx, canvas.width);
    overlay(ctx);
  }, [imageEl, guides, overlay]);

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
    if (!profileFile) return setError("Add the side photo first.");
    setBusy(true);
    setError(null);
    try {
      const { data: signed, error: signErr } = await supabase.functions.invoke(
        "bespoke-photo-upload-url",
        { body: { sid } },
      );
      if (signErr || !signed?.uploads) throw new Error("We could not prepare the upload.");

      const w = imageEl.naturalWidth;
      const h = imageEl.naturalHeight;

      const exports = buildExportCanvases({
        image: imageEl,
        cardPoints,
        templePoints,
        overlay: frameImgRef.current,
        frameWidthPx: mmPerPx ? front.mm / mmPerPx : null,
      });

      const uploads: Array<[string, Blob, string]> = [
        ["photo", await canvasToBlob(exports.photo, "image/jpeg", 0.92), "image/jpeg"],
        ["geometry", await canvasToBlob(exports.geometry, "image/png"), "image/png"],
        ["vto", await canvasToBlob(exports.vto, "image/png"), "image/png"],
        ["profile", await profileToJpeg(profileFile), "image/jpeg"],
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
          consentText,
          consentVersion: CONSENT_VERSION,
          locale,
          photoPath: signed.uploads.photo.path,
          geometryPath: signed.uploads.geometry.path,
          vtoPath: signed.uploads.vto.path,
          profilePath: signed.uploads.profile?.path ?? null,
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
      clarityEvent("bespoke_photo_uploaded");
      setStage("done");
    } catch (err) {
      console.error("[bespoke-photo]", err);
      setError("We could not save your photo. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const submitProfileOnly = async () => {
    if (!sid) return setError("This link is missing its order reference.");
    if (!profileFile) return setError("Add the side photo first.");
    setBusy(true);
    setError(null);
    try {
      const { data: signed, error: signErr } = await supabase.functions.invoke(
        "bespoke-photo-upload-url",
        { body: { sid } },
      );
      const target = signed?.uploads?.profile;
      if (signErr || !target) throw new Error("We could not prepare the upload.");
      const { error: upErr } = await supabase.storage
        .from("bespoke-photos")
        .uploadToSignedUrl(target.path, target.token, await profileToJpeg(profileFile), {
          contentType: "image/jpeg",
        });
      if (upErr) throw upErr;
      const { error: subErr } = await supabase.functions.invoke("bespoke-photo-submit", {
        body: {
          sid,
          profileOnly: true,
          profilePath: target.path,
          consentGiven: true,
          consentText,
          consentVersion: CONSENT_VERSION,
          locale,
        },
      });
      if (subErr) throw subErr;
      setResult({ deltaMm: null, needsReview: false, profileOnly: true });
      clarityEvent("bespoke_profile_uploaded");
      setStage("done");
    } catch (err) {
      console.error("[bespoke-photo:profile]", err);
      setError("We could not save your side photo. Please try again in a moment.");
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
      setProfileFile(null);
      setProfilePreview(null);
      setProfileOnly(false);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  useEffect(() => () => { if (profilePreview) URL.revokeObjectURL(profilePreview); }, [profilePreview]);

  const eyebrow = "text-[11px] uppercase tracking-[0.18em] text-gold";
  const card = "border border-cream/10 bg-[#16140F] p-6 sm:p-8";
  const primaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 bg-gold px-6 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] transition-colors hover:bg-gold-light disabled:opacity-40";
  const secondaryBtn =
    "inline-flex min-h-[48px] items-center justify-center gap-2 border border-gold/60 px-6 text-[12px] uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold";

  return (
    <>
      <SEO title="Fit photo — Woolet Bespoke" description="Confirm the fit of your made-to-measure frames." lang={locale as Lang} noindex />
      <main className="min-h-screen bg-[#080807] px-5 py-12 text-cream sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Photo for the workshop · required</p>
          <h1 className="mt-3 font-display text-3xl font-light text-[#F8F8F6] sm:text-4xl">
            Two photos, and we cut to your face
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-dim">
            Hold any bank card flat against your cheek and take one photo straight on and one from
            the side. The card gives us a true scale. The front photo checks your width, the side
            photo shows how high your nose bridge sits - so the frame rests on your nose, not on
            your cheeks.
          </p>

          {error && (
            <p role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          {stage === "consent" && photoOnFile && photoOnFile.status !== "purged" && (
            <section className={`mt-8 ${card}`}>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#36C46A]" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">
                    {photoOnFile.has_profile ? "Photos already on file — retake?" : "Front photo already on file"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                    You saved a fit photo while designing your frame, and it is attached to this order.
                    You only need a new one if something has changed.
                  </p>
                </div>
              </div>
              {!photoOnFile.has_profile && (
                <p className="mt-4 text-sm leading-relaxed text-cream-dim">
                  One more is needed: a photo from the side, so we can see how high your nose bridge sits.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={photoOnFile.has_profile ? secondaryBtn : primaryBtn}
                  onClick={() => {
                    setProfileOnly(true);
                    setPhotoOnFile(null);
                  }}
                >
                  <UserRound className="h-4 w-4" aria-hidden /> {photoOnFile.has_profile ? "Retake the side photo" : "Add the side photo"}
                </button>
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={() => {
                    setProfileOnly(false);
                    setPhotoOnFile(null);
                  }}
                >
                  Retake both photos
                </button>
              </div>
            </section>
          )}

          {stage === "consent" && !photoOnFile && (
            <section className={`mt-8 ${card}`}>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">Your photo, your call</h2>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">{consentText}</p>
                </div>
              </div>
              <label className="mt-6 flex min-h-[48px] cursor-pointer items-start gap-3 text-sm text-cream">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) clarityEvent("bespoke_photo_consent_given");
                  }}
                  className="mt-1 h-5 w-5 accent-[#CAA449]"
                />
                <span>{AGREE_LABEL[locale]}</span>
              </label>
              <button
                type="button"
                className={`mt-6 ${primaryBtn}`}
                disabled={!consent}
                onClick={() => setStage(profileOnly ? "profile" : "capture")}
              >
                Continue
              </button>
              <p className="mt-4 text-xs text-cream-dim/70">
                Both photos are required for every Bespoke order - we start cutting only after they
                arrive. Questions? <a href="mailto:support@woolet.co" className="underline">support@woolet.co</a>
                {" · "}
                <Link to="/en/bespoke/measurements" className="underline">Back to my measurements</Link>
              </p>
            </section>
          )}

          {stage === "capture" && (
            <section className={`mt-8 ${card}`}>
              <p className={eyebrow}>Photo 1 of 2 · front</p>
              <h2 className="mt-2 font-display text-xl font-light text-[#F8F8F6]">Take the front photo</h2>
              <figure className="mt-5 flex flex-col gap-4 border border-cream/10 bg-[#080807] p-4 sm:flex-row sm:items-center">
                <img
                  src="/images/bespoke/fit-photo-example.webp"
                  width={720}
                  height={894}
                  loading="lazy"
                  alt="Example fit photo: a man looks straight at the camera and holds a plain bank card flat against his cheek, long edge horizontal, fingers only along the bottom edge."
                  className="w-full max-w-[220px] self-center"
                />
                <figcaption className="text-xs leading-relaxed text-cream-dim">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-gold">Like this</span>
                  Card flat on the cheek, long edge horizontal, the whole card visible. Fingers only
                  along the bottom edge. Both eyes open and looking at the lens.
                </figcaption>
              </figure>
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
                  <button type="button" className={primaryBtn} onClick={() => setStage("profile")}>
                    Next: side photo
                  </button>
                )}
                <button type="button" className={secondaryBtn} onClick={() => setStage("capture")}>
                  Retake
                </button>
              </div>
            </section>
          )}

          {stage === "profile" && (
            <section className={`mt-8 ${card}`}>
              <p className={eyebrow}>{profileOnly ? "Side photo" : "Photo 2 of 2 · side"}</p>
              <h2 className="mt-2 font-display text-xl font-light text-[#F8F8F6]">Take the side photo</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-dim">
                From the front we see how wide your nose bridge is. From the side we see how high it
                starts. A low bridge needs a frame that sits lower and deeper, or it slides down
                onto your cheeks.
              </p>
              <figure className="mt-5 border border-cream/10 bg-[#080807] px-2 py-4 sm:p-6">
                <div className="mx-auto max-w-[460px]">
                  <ProfilePhotoIllustration />
                </div>
                <figcaption className="mt-3 text-center text-xs text-cream-dim">
                  Side photo, like this - the numbers match the steps below.
                </figcaption>
              </figure>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                {PROFILE_INSTRUCTIONS.map(({ icon: Icon, title, body }, i) => (
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

              {profilePreview && (
                <figure className="mt-5">
                  <img
                    src={profilePreview}
                    alt="Your side photo"
                    className="mx-auto max-h-[420px] w-auto border border-cream/10"
                  />
                  <figcaption className="mt-2 text-center text-xs text-cream-dim">
                    Ear, eye, nose bridge and the whole card visible? Then send it.
                  </figcaption>
                </figure>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {profilePreview ? (
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={busy}
                    onClick={profileOnly ? submitProfileOnly : submit}
                  >
                    {busy ? "Sending…" : "Send to the workshop"}
                  </button>
                ) : (
                  <button type="button" className={primaryBtn} onClick={() => profileRef.current?.click()}>
                    <Camera className="h-4 w-4" aria-hidden /> Take the side photo
                  </button>
                )}
                <button type="button" className={secondaryBtn} onClick={() => profileRef.current?.click()}>
                  <Upload className="h-4 w-4" aria-hidden /> {profilePreview ? "Retake" : "Upload a photo"}
                </button>
                {!profileOnly && (
                  <button type="button" className={secondaryBtn} onClick={() => setStage("review")}>
                    Back
                  </button>
                )}
              </div>
              <input
                ref={profileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onProfileFile(f);
                  e.target.value = "";
                }}
              />
            </section>
          )}

          {stage === "done" && (
            <section className={`mt-8 ${card}`}>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#36C46A]" aria-hidden />
                <div>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">
                    {result?.profileOnly ? "Side photo received" : "Photos received"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                    {result?.profileOnly
                      ? "Side photo received. We check your nose bridge against the frame before we cut."
                      : result?.needsReview
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
                Delete my photos
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
