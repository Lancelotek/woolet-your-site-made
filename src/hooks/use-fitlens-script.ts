import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tFit } from "@/lib/i18n-fitscan";
import type { Lang } from "@/lib/i18n";

import { getSessionRef } from "@/lib/scan-session-ref";
import { clarityEvent, claritySet } from "@/lib/clarity";
import { pushGtmEvent } from "@/lib/gtm";
import { MEASUREMENT_RANGES } from "@/data/bespoke-options";
import {
  bucketFaceWidth,
  createFitLensDedupe,
  createFitLensFailureCounter,
  fitLensErrorTag,
  isFitLensErrorLike,
  parseFitLensMessage,
  pickFitLensBucket,
  pickFitLensCloseParams,
  pickFitLensFaceWidthMm,
  pickFitLensParams,
} from "@/lib/fitlens-events";

import { FITLENS_EMBED_SRC, appendFitLensScript } from "@/lib/fitlens-embed";

// SRI-pinned loader; a mismatch falls back to an unpinned load (see fitlens-embed.ts).
const SCRIPT_SRC = FITLENS_EMBED_SRC;
const FITLENS_KEY = "pk_live_OuBrFjXWKeNygZku6WyJHeFW_8d55SVqIrleeFfrzuQ";

/**
 * Load the external FitLens embed script once per mount.
 * Use `data-fitlens="open"` on a button to open the widget.
 */
const FIT_LANGS: Lang[] = ["en", "pl", "fr", "es", "de", "ar", "ja", "nl", "ko"];
const PILL_ID = "__fitlens-manual-fallback";

function pageLang(): Lang {
  const l = (document.documentElement.lang || "en").slice(0, 2) as Lang;
  return FIT_LANGS.includes(l) ? l : "en";
}

/** Generic tape-measure route; only en and de have their own manual page. */
export function defaultManualHref(lang: string): string {
  return lang === "de" ? "/de/fit/manual" : "/en/fit/manual";
}

/** FitLens accepts 8-64 chars of A-Z a-z 0-9 _ - as `sessionRef`; anything else is dropped. */
export function toFitLensSessionRef(value: string | null | undefined): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(value) ? value : null;
}

function removeManualPill() {
  document.getElementById(PILL_ID)?.remove();
}

export function useFitLensScript(options?: {
  sessionRef?: string | null;
  /** Where the "measure with a tape" fallback goes; defaults to /{lang}/fit/manual. */
  manualHref?: string;
  /** Replaces navigation, e.g. to open an in-page manual step. */
  onManualFallback?: () => void;
}) {
  const navigate = useNavigate();
  const manualOptsRef = useRef(options);
  manualOptsRef.current = options;
  const failureRef = useRef(createFitLensFailureCounter());
  const closeRef = useRef<(extra?: Record<string, string>) => void>(() => {});
  // Callers that own a session (e.g. a paid Bespoke order) pass their own
  // reference so the scan ties back to the order rather than to this browser.
  const externalSessionRef = options?.sessionRef ?? null;
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const openedAtRef = useRef<number | null>(null);
  const lastTypeRef = useRef<string>("opened");
  const resultSeenRef = useRef(false);
  const embedResultSeenRef = useRef(false);
  const fitLensBucketSentRef = useRef(false);
  const dedupeRef = useRef(createFitLensDedupe());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    // Remove any previous instance so the widget re-attaches to the current
    // trigger element when the component remounts (e.g. SPA navigation).
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) existing.remove();

    const configure = (script: HTMLScriptElement) => {
      script.async = true;
      script.defer = true;
      script.dataset.key = FITLENS_KEY;
      script.dataset.label = "Find my fit";
      script.dataset.color = "#3B4A66";
      // FitLens returns this as payload.sessionRef / measurement.sessionRef /
      // fitlens:result detail.sessionRef. Set before any open (loader re-reads it).
      const loaderRef = toFitLensSessionRef(externalSessionRef);
      if (loaderRef) script.dataset.sessionRef = loaderRef;
      script.addEventListener("load", () => setIsReady(true), { once: true });
    };
    // The widget is opened by building the iframe ourselves, so even a failed
    // embed load never blocks the button.
    scriptRef.current = appendFitLensScript(configure, (retry) => {
      scriptRef.current = retry;
    });

    return () => {
      frameRef.current?.remove();
      frameRef.current = null;
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const origin = new URL(SCRIPT_SRC).origin;
    const debugOn = /[?&]debug=1\b/.test(window.location.search);

    // Track whether the embed itself dispatched `fitlens:result` so we never
    // dispatch a second copy.
    const onDocResult = (e: Event) => {
      if ((e as CustomEvent & { __wooletBridge?: boolean }).__wooletBridge) return;
      embedResultSeenRef.current = true;
    };
    document.addEventListener("fitlens:result", onDocResult, true);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.data?.source !== "fitlens") return;
      const data = event.data as Record<string, unknown>;
      // Accepts both the legacy `{ type: "fitlens:event", name, data }` shape
      // and the current `{ type, payload }` shape.
      const { type, payload } = parseFitLensMessage(data);

      if (debugOn) console.info("[fitlens] message", type, Object.keys(payload || {}));

      const secs = openedAtRef.current
        ? Math.round((Date.now() - openedAtRef.current) / 1000)
        : null;

      claritySet("fitlens_step", type);
      // "close" never fires as fitlens_close — the funnel has one close event,
      // fitlens_closed (below), which carries last_step and seconds_open.
      if (type !== "close" && dedupeRef.current.shouldFire(type)) {
        clarityEvent("fitlens_" + type);
        pushGtmEvent("fitlens_" + type, pickFitLensParams(payload, secs));
        if (type === "camera_granted") {
          // Keep recording priority for sessions that reach the camera.
          const c = (window as unknown as { clarity?: unknown }).clarity;
          if (typeof c === "function") {
            try { (c as (...a: unknown[]) => void)("upgrade", "fitlens_scan"); } catch { /* noop */ }
          }
        }
      }
      if (type !== "close") lastTypeRef.current = type;

      if (type === "error" || type === "camera_denied") {
        claritySet("fitlens_error", fitLensErrorTag(type, payload).slice(0, 80));
      } else if (isFitLensErrorLike(type)) {
        // Legacy camera_unsuitable / measure_failed: tag value is the step name.
        claritySet("fitlens_error", type);
      }

      if (type === "result_shown") {
        const b = pickFitLensBucket(payload);
        if (b) {
          fitLensBucketSentRef.current = true;
          claritySet("fitlens_face_width_bucket", b);
        }
      }

      if (type === "result") {
        const fitLensBucket = pickFitLensBucket(payload);
        const fw = pickFitLensFaceWidthMm(payload);
        const { min, max } = MEASUREMENT_RANGES.faceWidth;
        // Privacy: only a 5 mm bucket leaves the page — never the exact mm.
        if (fitLensBucket) {
          claritySet("fitlens_face_width_bucket", fitLensBucket);
        } else if (!fitLensBucketSentRef.current && fw != null && fw >= min && fw <= max) {
          claritySet("fitlens_face_width_bucket", bucketFaceWidth(fw));
        }
        if (!resultSeenRef.current) {
          resultSeenRef.current = true;
          // Give the embed a window to dispatch its own event first. Page-side
          // fitlens:result handlers dedupe by measurementId, so a late
          // duplicate from this bridge is harmless.
          window.setTimeout(() => {
            if (embedResultSeenRef.current) return;
            embedResultSeenRef.current = true;
            const ev = new CustomEvent("fitlens:result", { detail: payload, bubbles: true });
            (ev as CustomEvent & { __wooletBridge?: boolean }).__wooletBridge = true;
            document.dispatchEvent(ev);
          }, 400);
        }
      }

      const shownFailures = failureRef.current.onMessage(type);
      if (shownFailures != null) showManualPill(shownFailures);
      if (type === "result" || type === "result_shown") removeManualPill();

      if (type === "close") closeWidget(payload);
    };

    function closeWidget(payload: Record<string, unknown>, extra?: Record<string, string>) {
      const secs = openedAtRef.current
        ? Math.round((Date.now() - openedAtRef.current) / 1000)
        : null;
      const closeParams = { ...pickFitLensCloseParams(payload), ...extra };
      const params: Record<string, string | number> = {
        last_step: lastTypeRef.current,
        ...closeParams,
      };
      if (secs != null) params.seconds_open = secs;
      clarityEvent("fitlens_closed");
      pushGtmEvent("fitlens_closed", params);
      if (!resultSeenRef.current) {
        clarityEvent("fitlens_abandoned");
        pushGtmEvent("fitlens_abandoned", params);
        claritySet("fitlens_abandon_step", lastTypeRef.current);
        if (closeParams.last_state) claritySet("fitlens_abandon_state", closeParams.last_state);
      }
      openedAtRef.current = null;
      removeManualPill();
      frameRef.current?.remove();
      frameRef.current = null;
    }
    closeRef.current = (extra) => {
      if (frameRef.current) closeWidget({}, extra);
      else removeManualPill();
    };

    function showManualPill(failures: number) {
      if (!frameRef.current || document.getElementById(PILL_ID)) return;
      const lang = pageLang();
      const opts = manualOptsRef.current;
      const href = opts?.manualHref || defaultManualHref(lang);
      const pill = document.createElement("div");
      pill.id = PILL_ID;
      pill.className = "fitlens-fallback-pill";
      const link = document.createElement("a");
      link.href = href;
      link.textContent = tFit(lang, "fallback.tape");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        clarityEvent("fitlens_manual_fallback_clicked");
        pushGtmEvent("fitlens_manual_fallback_clicked", { failures: failureRef.current.failures });
        closeRef.current({ reason: "manual_fallback" });
        const o = manualOptsRef.current;
        if (o?.onManualFallback) o.onManualFallback();
        else navigate(href);
      });
      const close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", tFit(lang, "fallback.close"));
      close.textContent = "×";
      close.addEventListener("click", () => removeManualPill());
      pill.append(link, close);
      document.body.appendChild(pill);
      clarityEvent("fitlens_manual_fallback_shown");
      pushGtmEvent("fitlens_manual_fallback_shown", { failures });
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      removeManualPill();
      document.removeEventListener("fitlens:result", onDocResult, true);
    };
  }, []);

  const openFitLens = () => {
    if (frameRef.current) return;

    const origin = new URL(SCRIPT_SRC).origin;
    const frame = document.createElement("iframe");
    frame.title = "FitLens - measure your fit";
    frame.setAttribute("allow", `camera ${origin}; microphone ${origin}; fullscreen`);
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("aria-modal", "true");
    frame.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483646;background:rgba(11,18,32,.32)";

    const debug = /[?&]debug=1\b/.test(window.location.search) ? "&debug=1" : "";
    // Pseudonymous only: a random per-attempt reference and the page language.
    // Never an email, a name or an order number — the widget is a processor and
    // must not receive anything that identifies the person being measured.
    const sessionRef = externalSessionRef || getSessionRef();
    // The widget reads `sessionRef` (2026-10-23 FitLens fix) and echoes it back
    // in the result; `sessionId` stays for older widget builds.
    const fitLensRef = toFitLensSessionRef(sessionRef);
    if (scriptRef.current) {
      if (fitLensRef) scriptRef.current.dataset.sessionRef = fitLensRef;
      else delete scriptRef.current.dataset.sessionRef;
    }
    const locale = (document.documentElement.lang || "en").slice(0, 5);
    frame.src =
      `${origin}/w/intro?k=${encodeURIComponent(FITLENS_KEY)}` +
      `&host=${encodeURIComponent(window.location.origin)}` +
      `&sessionId=${encodeURIComponent(sessionRef)}` +
      (fitLensRef ? `&sessionRef=${encodeURIComponent(fitLensRef)}` : "") +
      `&locale=${encodeURIComponent(locale)}${debug}`;
    document.body.appendChild(frame);
    frameRef.current = frame;
    openedAtRef.current = Date.now();
    lastTypeRef.current = "opened";
    resultSeenRef.current = false;
    embedResultSeenRef.current = false;
    dedupeRef.current.reset();
    failureRef.current.reset();
    removeManualPill();
    clarityEvent("fitlens_opened");
    pushGtmEvent("fitlens_opened", { page: window.location.pathname });
  };

  return { isReady, openFitLens };
}
