// Step 3, panel B — "See them on you". Unlocks once the AI frame render exists.
// Signed-in only, two renders per account (enforced server-side).

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { COLORS, FINISHES } from "@/data/bespoke-options";
import { findFrame } from "@/data/frames";
import type { BespokeConfig } from "@/lib/bespoke-state";

const MAX_RENDERS = 2;
const MAX_BYTES = 6 * 1024 * 1024;

const signInHref = () =>
  "/en/account/sign-in?next=" +
  encodeURIComponent(
    typeof window !== "undefined" ? `${window.location.pathname}?step=3` : "/en/bespoke/configurator?step=3",
  );

/**
 * Flattens the browser-corrected EXIF orientation into the actual pixels.
 * iPhone photographs often keep portrait orientation only in EXIF metadata;
 * the browser displays that correctly, while an image model may read the raw,
 * sideways pixels. Drawing through canvas gives both the preview and model the
 * same upright image.
 */
const readAsUprightDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        if (!naturalWidth || !naturalHeight) throw new Error("Could not read that file");

        const maxEdge = 2400;
        const scale = Math.min(1, maxEdge / Math.max(naturalWidth, naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(naturalHeight * scale));
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

export default function TryOnPanel({ config, unlocked }: { config: BespokeConfig; unlocked: boolean }) {
  const { session, loading: authLoading } = useAuth();
  const isSignedIn = Boolean(session);

  const frame = findFrame(config.frameId);
  const front = COLORS.find((c) => c.id === config.frontColorId);
  const temple = COLORS.find((c) => c.id === config.templeColorId);
  const finish = FINISHES.find((f) => f.id === config.finishId);
  const selectionKey = [frame?.id, front?.id, temple?.id, finish?.id].join("|");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"camera" | "upload" | null>(null);

  // How many renders this account has left.
  useEffect(() => {
    if (!isSignedIn) return;
    let live = true;
    supabase.functions
      .invoke("bespoke-tryon-render", { body: { probe: true } })
      .then(({ data }) => {
        if (live && typeof data?.remaining === "number") setRemaining(data.remaining);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [isSignedIn]);

  const pick = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!/^image\//.test(file.type)) return setError("Please choose a photo.");
    if (file.size > MAX_BYTES) return setError("That photo is larger than 6 MB — try a smaller one.");
    try {
      setPhoto(await readAsUprightDataUrl(file));
      setResult(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const generate = async () => {
    if (!photo || !frame || !front || !temple || !finish) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("bespoke-tryon-render", {
        body: {
          photo,
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
      if (typeof (data as { remaining?: number }).remaining === "number") {
        setRemaining((data as { remaining: number }).remaining);
      }
    } catch (e) {
      const msg = (e as Error).message || "";
      setError(
        /limit_reached|429/.test(msg)
          ? "You have used both of your try-on renders."
          : "That render didn't come through. Please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="border border-cream/10 p-5 text-cream-dim text-xs leading-relaxed" style={{ borderRadius: 2 }}>
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light mb-2">See them on you</div>
        Generate the AI render of your frame first. Once it is on screen you can add a photo of yourself and
        we will show you wearing that exact pair.
      </div>
    );
  }

  return (
    <div className="border border-gold/25 bg-[#0c0c0c]/40 p-5 sm:p-6" style={{ borderRadius: 2 }}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light">See them on you</div>
      <div className="font-display text-cream text-lg leading-tight mt-1">
        Your photo, your <em className="italic text-gold-light">bespoke</em> pair
      </div>
      <p className="text-cream-dim text-xs leading-relaxed mt-2">
        Take a photo or upload one — front-facing, good light, no glasses on. We add the frame you just
        visualised. The photo is used for this render only and is never stored by us.
      </p>

      {!isSignedIn ? (
        <div className="mt-4 border border-gold/25 p-4" style={{ borderRadius: 2, background: "rgba(194,160,90,0.05)" }}>
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light">Free with an account</div>
          <p className="text-cream-dim text-[12px] leading-relaxed mt-2">
            Create your Woolet account — we email you an 8-digit code, no password. You come straight back to
            this step with your pattern, acetate and finish exactly as you left them, and you get two try-on
            renders saved to your account.
          </p>
          <Link
            to={signInHref()}
            className="mt-3 w-full inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors"
            style={{
              background: "hsl(var(--gold))",
              color: "hsl(var(--background))",
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.72rem",
              padding: "16px 24px",
              borderRadius: 2,
            }}
          >
            {authLoading ? "Checking…" : "Create account / sign in"}
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPendingAction("camera");
                setNoticeOpen(true);
              }}
              className="border border-cream/20 text-cream text-[11px] uppercase tracking-[0.18em] py-3 hover:border-gold/60 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Take a photo
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingAction("upload");
                setNoticeOpen(true);
              }}
              className="border border-cream/20 text-cream text-[11px] uppercase tracking-[0.18em] py-3 hover:border-gold/60 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Upload a photo
            </button>
          </div>

          {noticeOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(11,10,9,0.85)" }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setNoticeOpen(false);
              }}
            >
              <div
                className="w-full max-w-sm border border-gold/30 bg-[#0c0c0c] p-6"
                style={{ borderRadius: 2 }}
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold-light mb-3">
                  Before the photo
                </div>
                <p className="text-cream text-sm leading-relaxed">
                  For the most accurate try-on, please take your photo{" "}
                  <strong className="text-gold-light">without glasses on</strong>. Keep your face
                  well-lit and looking straight at the camera.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeOpen(false);
                      if (pendingAction === "camera") cameraRef.current?.click();
                      else if (pendingAction === "upload") fileRef.current?.click();
                      setPendingAction(null);
                    }}
                    className="w-full inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors"
                    style={{
                      background: "hsl(var(--gold))",
                      color: "hsl(var(--background))",
                      fontFamily: "Barlow, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.72rem",
                      padding: "14px 24px",
                      borderRadius: 2,
                    }}
                  >
                    Got it — continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeOpen(false);
                      setPendingAction(null);
                    }}
                    className="w-full inline-flex items-center justify-center text-[11px] uppercase tracking-[0.18em] text-cream-dim py-3 hover:text-cream transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {(photo || result) && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <figure>
                <div
                  className="w-full overflow-hidden bg-[#EFE9DF]"
                  style={{ aspectRatio: "3 / 4", borderRadius: 2 }}
                >
                  {photo && <img src={photo} alt="Your photo" className="w-full h-full object-cover" />}
                </div>
                <figcaption className="text-[10px] uppercase tracking-[0.2em] text-cream-dim mt-2">Your photo</figcaption>
              </figure>
              <figure>
                <div
                  className="w-full overflow-hidden bg-[#EFE9DF] flex items-center justify-center"
                  style={{ aspectRatio: "3 / 4", borderRadius: 2 }}
                >
                  {result ? (
                    <img
                      src={result}
                      alt={`AI visualisation of you wearing the ${frame?.shape} bespoke frame`}
                      className="w-full h-full object-cover"
                    />
                  ) : loading ? (
                    <div className="h-8 w-8 border-2 border-[color:var(--cfg-ink)]/30 border-t-[color:var(--cfg-ink)] rounded-full animate-spin" />
                  ) : (
                    <div className="text-[color:var(--cfg-ink)]/50 text-[10px] uppercase tracking-[0.2em] px-3 text-center">
                      Render appears here
                    </div>
                  )}
                </div>
                <figcaption className="text-[10px] uppercase tracking-[0.2em] text-cream-dim mt-2">With your frame</figcaption>
              </figure>
            </div>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!photo || loading || remaining === 0}
            className="mt-4 w-full inline-flex items-center justify-center uppercase tracking-[0.22em] transition-colors disabled:opacity-50"
            style={{
              background: "hsl(var(--gold))",
              color: "hsl(var(--background))",
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.72rem",
              padding: "16px 24px",
              borderRadius: 2,
            }}
          >
            {remaining === 0 ? "No renders left" : loading ? "Rendering…" : result ? "Render again" : "Show me wearing them"}
          </button>

          <p className="mt-2 text-[11px] text-cream-dim/80">
            {remaining === null
              ? `Two try-on renders per account.`
              : `${remaining} of ${MAX_RENDERS} try-on renders left on your account.`}
          </p>
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] text-red-400/90">
          {error}
        </p>
      )}

      <p className="mt-3 text-[10px] text-cream-dim/70 leading-relaxed">
        Illustrative render only — proportions are approximate and do not replace your fit measurements.
      </p>
    </div>
  );
}
