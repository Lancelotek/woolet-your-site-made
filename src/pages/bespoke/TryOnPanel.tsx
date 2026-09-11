import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShieldCheck, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { COLORS, FINISHES } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import type { BespokeConfig } from "@/lib/bespoke-state";
import { adoptSessionRef, getSessionRef } from "@/lib/scan-session-ref";
import { frameFrontWidthMm } from "@/lib/bespoke-photo-geometry";

const MAX_RENDERS = 2;
const MAX_BYTES = 6 * 1024 * 1024;
const CONSENT_VERSION = "bespoke-tryon-workshop-v1";
const CONSENT_TEXT: Record<"en" | "pl", string> = {
  en: "I agree that JAY23 LLC (Woolet) stores my original photograph and this AI try-on visualisation, and shares both with its manufacturing partner in Greece solely to produce and verify my bespoke frame. Both images are deleted 90 days after delivery, or 30 days after upload if no order is placed. I can withdraw this consent at any time at support@woolet.co; withdrawal stops production of the frame.",
  pl: "Wyrażam zgodę na przechowywanie przez JAY23 LLC (Woolet) mojego oryginalnego zdjęcia i tej wizualizacji przymiarki AI oraz przekazanie obu partnerowi produkcyjnemu w Grecji wyłącznie w celu wykonania i weryfikacji mojej oprawki bespoke. Oba obrazy są usuwane 90 dni po dostawie albo 30 dni po przesłaniu, jeśli nie dojdzie do zamówienia. Zgodę mogę wycofać w każdej chwili pod adresem support@woolet.co; wycofanie zatrzymuje produkcję oprawki.",
};

const signInHref = () =>
  "/en/account/sign-in?next=" +
  encodeURIComponent(typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/en/bespoke/configurator?step=3");

const readAsUprightDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight) throw new Error("Could not read that file");
        const scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not prepare that photo");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that file"));
    };
    image.src = objectUrl;
  });

const dataUrlToBlob = async (value: string) => {
  const response = await fetch(value);
  if (!response.ok) throw new Error("image_download_failed");
  return response.blob();
};

interface Props {
  config: BespokeConfig;
  framePreviewUrl: string | null;
  locale?: "en" | "pl";
  onSaved?: (at: string | null) => void;
}

export default function TryOnPanel({ config, framePreviewUrl, locale = "en", onSaved }: Props) {
  const { session, loading: authLoading } = useAuth();
  const isSignedIn = Boolean(session);
  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const selectionKey = [frame?.id, front?.id, temple?.id, finish?.id].join("|");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const [exactPreview, setExactPreview] = useState<string | null>(framePreviewUrl);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"camera" | "upload" | null>(null);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sref = new URLSearchParams(window.location.search).get("sref");
    if (sref) adoptSessionRef(sref);
  }, []);

  useEffect(() => {
    setExactPreview(framePreviewUrl);
  }, [framePreviewUrl]);

  useEffect(() => {
    if (!isSignedIn || exactPreview) return;
    let live = true;
    supabase
      .from("bespoke_ai_previews")
      .select("image_url")
      .eq("user_id", session?.user.id ?? "")
      .eq("selection_key", selectionKey)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (live && data?.image_url) setExactPreview(data.image_url);
      });
    return () => { live = false; };
  }, [exactPreview, isSignedIn, selectionKey, session?.user.id]);

  useEffect(() => {
    if (!isSignedIn) return;
    let live = true;
    supabase.functions.invoke("bespoke-tryon-render", { body: { probe: true } }).then(({ data }) => {
      if (live && typeof data?.remaining === "number") setRemaining(data.remaining);
    }).catch(() => undefined);
    return () => { live = false; };
  }, [isSignedIn]);

  const qrUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({ step: "3", sref: getSessionRef() });
    if (config.frameId) params.set("shape", config.frameId);
    if (config.frontColorId) params.set("front", config.frontColorId);
    if (config.templeColorId) params.set("temple", config.templeColorId);
    if (config.finishId) params.set("finish", config.finishId);
    if (config.templeLengthMm) params.set("tl", String(config.templeLengthMm));
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [config.finishId, config.frameId, config.frontColorId, config.templeColorId, config.templeLengthMm]);

  const pick = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!/^image\//.test(file.type)) return setError(locale === "pl" ? "Wybierz zdjęcie." : "Please choose a photo.");
    if (file.size > MAX_BYTES) return setError(locale === "pl" ? "Zdjęcie jest większe niż 6 MB." : "That photo is larger than 6 MB.");
    try {
      setPhoto(await readAsUprightDataUrl(file));
      setResult(null);
      setSaved(false);
      setConsent(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const generate = async () => {
    if (!photo || !exactPreview || !frame || !front || !temple || !finish) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-tryon-render", {
        body: {
          photo,
          framePreviewUrl: exactPreview,
          selectionKey,
          shape: frame.shape,
          frontColor: `${front.name} (${front.code})`,
          templeColor: `${temple.name} (${temple.code})`,
          finish: finish.name,
        },
      });
      if (fnErr) throw fnErr;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const url = (data as { imageUrl?: string })?.imageUrl;
      if (!url) throw new Error("No render returned");
      setResult(url);
      setSaved(false);
      setConsent(false);
      if (typeof (data as { remaining?: number }).remaining === "number") setRemaining((data as { remaining: number }).remaining);
    } catch (e) {
      const message = (e as Error).message || "";
      setError(/limit_reached|429/.test(message) ? "You have used both of your try-on renders." : "That render didn't come through. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const saveForWorkshop = async () => {
    if (!photo || !result || !consent || !frame) return;
    setSaving(true);
    setError(null);
    try {
      const sessionRef = getSessionRef();
      const { data: signed, error: signError } = await supabase.functions.invoke("bespoke-photo-upload-url", { body: { sessionRef } });
      if (signError || !signed?.uploads?.photo || !signed?.uploads?.vto) throw new Error("upload_url_failed");
      const [photoBlob, resultBlob] = await Promise.all([dataUrlToBlob(photo), dataUrlToBlob(result)]);
      const uploads = [
        [signed.uploads.photo, photoBlob, "image/jpeg"],
        [signed.uploads.vto, resultBlob, resultBlob.type || "image/png"],
      ] as const;
      for (const [target, blob, contentType] of uploads) {
        const { error: uploadError } = await supabase.storage.from("bespoke-photos").uploadToSignedUrl(target.path, target.token, blob, { contentType });
        if (uploadError) throw uploadError;
      }
      const { error: submitError } = await supabase.functions.invoke("bespoke-photo-submit", {
        body: {
          sessionRef,
          consentGiven: true,
          consentText: CONSENT_TEXT[locale],
          consentVersion: CONSENT_VERSION,
          locale,
          photoPath: signed.uploads.photo.path,
          vtoPath: signed.uploads.vto.path,
          frameFrontWidthMm: frameFrontWidthMm({ scanTempleToTempleMm: config.measurements.templeToTemple, configuratorWidthMm: frame.widthMm }).mm,
          frameBridgeMm: frame.bridgeMm,
          shapeId: frame.id,
          mappingVersion: "ai-preview-v1",
        },
      });
      if (submitError) throw submitError;
      const savedAt = new Date().toISOString();
      setSaved(true);
      onSaved?.(savedAt);
    } catch (e) {
      console.error("[bespoke-tryon-save]", e);
      setError(locale === "pl" ? "Nie udało się zapisać zdjęć. Spróbuj ponownie." : "We couldn't save the images. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeSaved = async () => {
    setSaving(true);
    try {
      await supabase.functions.invoke("bespoke-photo-delete", { body: { sessionRef: getSessionRef() } });
      setSaved(false);
      setConsent(false);
      onSaved?.(null);
    } finally {
      setSaving(false);
    }
  };

  if (!exactPreview) {
    return <div className="border border-cream/10 p-5 text-cream-dim text-xs leading-relaxed">Generate the AI render of your frame first. Then you can see that exact pair on your face.</div>;
  }

  return (
    <section className="border border-gold/25 bg-panel/40 p-5 sm:p-6">
      <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light">See them on you</div>
      <h3 className="font-display text-cream text-xl leading-tight mt-1">Your frame, on your <em className="italic text-gold-light">face</em></h3>
      <p className="text-cream-dim text-xs leading-relaxed mt-2">Use a phone for a straight-on photo without glasses. We place the exact frame visualised above on your face.</p>

      <div className="hidden lg:block mt-6 border border-cream/10 p-6 text-center">
        <Smartphone className="mx-auto text-gold-light" aria-hidden />
        <h4 className="mt-3 font-display text-lg text-cream">Continue on your phone</h4>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-cream-dim">Scan this code with your phone. Your selected pattern, acetate, finish and private session continue there.</p>
        <div className="mx-auto mt-5 w-fit bg-cream p-3"><QRCodeSVG value={qrUrl} size={156} bgColor="#EFE9DF" fgColor="#1F1B16" /></div>
        {!isSignedIn && <Link to={signInHref()} className="mt-5 inline-flex min-h-[44px] items-center border border-gold/60 px-5 text-[11px] uppercase tracking-[0.18em] text-gold-light">Sign in first to carry the exact AI frame to your phone</Link>}
      </div>

      <div className="lg:hidden">
        {!isSignedIn ? (
          <div className="mt-4 border border-gold/25 p-4 bg-gold/5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light">Free with an account</div>
            <p className="text-cream-dim text-xs leading-relaxed mt-2">Sign in by email code to restore your saved build and use up to two try-on renders.</p>
            <Link to={signInHref()} className="mt-3 w-full inline-flex min-h-[48px] items-center justify-center bg-gold text-background text-xs uppercase tracking-[0.18em]">{authLoading ? "Checking…" : "Create account / sign in"}</Link>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setPendingAction("camera"); setNoticeOpen(true); }} className="min-h-[48px] border border-cream/20 text-cream text-[11px] uppercase tracking-[0.18em]">Take a photo</button>
              <button type="button" onClick={() => { setPendingAction("upload"); setNoticeOpen(true); }} className="min-h-[48px] border border-cream/20 text-cream text-[11px] uppercase tracking-[0.18em]">Upload a photo</button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />

            {noticeOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4" role="dialog" aria-modal="true" aria-labelledby="photo-notice-title">
              <div className="w-full max-w-sm border border-gold/30 bg-panel p-6">
                <div id="photo-notice-title" className="text-[10px] uppercase tracking-[0.22em] text-gold-light">Before the photo</div>
                <p className="mt-3 text-sm leading-relaxed text-cream">Take the photo <strong className="text-gold-light">without glasses</strong>, in good light, looking straight at the camera.</p>
                <button type="button" onClick={() => { setNoticeOpen(false); pendingAction === "camera" ? cameraRef.current?.click() : fileRef.current?.click(); setPendingAction(null); }} className="mt-6 min-h-[48px] w-full bg-gold text-background text-xs uppercase tracking-[0.18em]">Got it — continue</button>
                <button type="button" onClick={() => { setNoticeOpen(false); setPendingAction(null); }} className="min-h-[44px] w-full text-xs uppercase tracking-[0.18em] text-cream-dim">Go back</button>
              </div>
            </div>}

            {(photo || result) && <div className="mt-4 grid grid-cols-2 gap-3">
              <figure><div className="aspect-[3/4] overflow-hidden bg-cream">{photo && <img src={photo} alt="Your original portrait without glasses" className="h-full w-full object-cover" />}</div><figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cream-dim">Your photo</figcaption></figure>
              <figure><div className="aspect-[3/4] overflow-hidden bg-cream flex items-center justify-center">{result ? <img src={result} alt={`AI visualisation of you wearing the ${frame?.shape} bespoke frame`} className="h-full w-full object-cover" /> : loading ? <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" /> : <span className="px-3 text-center text-[10px] uppercase tracking-[0.18em] text-background/50">Render appears here</span>}</div><figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cream-dim">With your exact frame</figcaption></figure>
            </div>}

            <button type="button" onClick={generate} disabled={!photo || loading || remaining === 0} className="mt-4 min-h-[48px] w-full bg-gold text-background text-xs uppercase tracking-[0.18em] disabled:opacity-40">{remaining === 0 ? "No renders left" : loading ? "Rendering…" : result ? "Render again" : "Show me wearing them"}</button>
            <p className="mt-2 text-[11px] text-cream-dim/80">{remaining === null ? "Two try-on renders per account." : `${remaining} of ${MAX_RENDERS} try-on renders left on your account.`}</p>

            {result && <div className="mt-6 border border-cream/10 p-5">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" aria-hidden /><div><h4 className="text-sm text-cream">Save both images for the workshop?</h4><p className="mt-2 text-xs leading-relaxed text-cream-dim">{CONSENT_TEXT[locale]}</p></div></div>
              {!saved ? <>
                <label className="mt-4 flex min-h-[48px] cursor-pointer items-start gap-3 text-sm text-cream"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-gold" /><span>{locale === "pl" ? "Wyrażam zgodę na zapis obu obrazów." : "I agree to save both images."}</span></label>
                <button type="button" onClick={saveForWorkshop} disabled={!consent || saving} className="mt-3 min-h-[48px] w-full bg-gold text-background text-xs uppercase tracking-[0.18em] disabled:opacity-40">{saving ? "Saving…" : "Save original + visualisation"}</button>
                <p className="mt-3 text-[11px] leading-relaxed text-cream-dim">Without consent, neither image is uploaded to Woolet storage. <Link to={`/${locale}/privacy-policy#fit-scan`} className="underline">How we handle it</Link></p>
              </> : <div className="mt-4"><p className="flex items-center gap-2 text-sm text-success"><Check size={16} /> Saved — the workshop will receive both images with your order.</p><button type="button" onClick={removeSaved} disabled={saving} className="mt-3 min-h-[44px] text-xs uppercase tracking-[0.18em] text-cream-dim underline">Withdraw consent and delete images</button></div>}
            </div>}
          </>
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
      <p className="mt-3 text-[10px] leading-relaxed text-cream-dim/70">Illustrative render only — proportions are approximate and do not replace your phone fit measurement after purchase.</p>
    </section>
  );
}
