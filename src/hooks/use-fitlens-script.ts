import { useEffect, useRef, useState } from "react";

import { getSessionRef } from "@/lib/scan-session-ref";
import { clarityEvent, claritySet } from "@/lib/clarity";
import { pushGtmEvent } from "@/lib/gtm";
import { MEASUREMENT_RANGES } from "@/data/bespoke-options";
import {
  bucketFaceWidth,
  createFitLensDedupe,
  isFitLensErrorLike,
  parseFitLensMessage,
  pickFitLensFaceWidthMm,
  pickFitLensParams,
} from "@/lib/fitlens-events";

const SCRIPT_SRC = "https://fitlens-web-production.up.railway.app/v1/embed.js";
// No `integrity` hash on purpose: FitLens redeploys /v1/embed.js without
// warning, and a pinned hash makes the browser refuse the new file — the scan
// button then dies silently. `crossorigin="anonymous"` stays so load errors
// stay readable.
const FITLENS_KEY = "pk_live_OuBrFjXWKeNygZku6WyJHeFW_8d55SVqIrleeFfrzuQ";

/**
 * Load the external FitLens embed script once per mount.
 * Use `data-fitlens="open"` on a button to open the widget.
 */
export function useFitLensScript(options?: { sessionRef?: string | null }) {
  // Callers that own a session (e.g. a paid Bespoke order) pass their own
  // reference so the scan ties back to the order rather than to this browser.
  const externalSessionRef = options?.sessionRef ?? null;
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const openedAtRef = useRef<number | null>(null);
  const lastTypeRef = useRef<string>("opened");
  const resultSeenRef = useRef(false);
  const embedResultSeenRef = useRef(false);
  const dedupeRef = useRef(createFitLensDedupe());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    // Remove any previous instance so the widget re-attaches to the current
    // trigger element when the component remounts (e.g. SPA navigation).
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.dataset.key = FITLENS_KEY;
    script.dataset.label = "Find my fit";
    script.dataset.color = "#3B4A66";
    script.addEventListener("load", () => setIsReady(true), { once: true });
    // The widget is opened by building the iframe ourselves, so a failed embed
    // load must not block the button — log it and carry on.
    script.addEventListener(
      "error",
      () => console.warn("[fitlens] embed.js failed to load; opening the widget directly"),
      { once: true },
    );

    document.body.appendChild(script);
    scriptRef.current = script;

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
      }
      if (type !== "close") lastTypeRef.current = type;

      if (type === "camera_denied" || type === "error") {
        const code = typeof payload.code === "string" ? payload.code : "";
        const reason = typeof payload.reason === "string" ? payload.reason : "";
        claritySet("fitlens_error", (code || reason || "unknown").slice(0, 80));
      }

      if (type === "result") {
        const fw = typeof payload.faceWidthMm === "number" ? payload.faceWidthMm : payload.faceWidth;
        const { min, max } = MEASUREMENT_RANGES.faceWidth;
        if (typeof fw === "number" && Number.isFinite(fw) && fw >= min && fw <= max) {
          claritySet("fitlens_face_width", String(Math.round(fw)));
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

      if (type === "close") {
        const params: Record<string, string | number> = { last_step: lastTypeRef.current };
        if (secs != null) params.seconds_open = secs;
        clarityEvent("fitlens_closed");
        pushGtmEvent("fitlens_closed", params);
        if (!resultSeenRef.current) {
          clarityEvent("fitlens_abandoned");
          pushGtmEvent("fitlens_abandoned", params);
          claritySet("fitlens_abandon_step", lastTypeRef.current);
        }
        openedAtRef.current = null;
        frameRef.current?.remove();
        frameRef.current = null;
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
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
      "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:rgba(11,18,32,.32)";

    const debug = /[?&]debug=1\b/.test(window.location.search) ? "&debug=1" : "";
    // Pseudonymous only: a random per-attempt reference and the page language.
    // Never an email, a name or an order number — the widget is a processor and
    // must not receive anything that identifies the person being measured.
    const sessionRef = externalSessionRef || getSessionRef();
    const locale = (document.documentElement.lang || "en").slice(0, 5);
    frame.src =
      `${origin}/w/intro?k=${encodeURIComponent(FITLENS_KEY)}` +
      `&host=${encodeURIComponent(window.location.origin)}` +
      `&sessionId=${encodeURIComponent(sessionRef)}` +
      `&locale=${encodeURIComponent(locale)}${debug}`;
    document.body.appendChild(frame);
    frameRef.current = frame;
    openedAtRef.current = Date.now();
    lastTypeRef.current = "opened";
    resultSeenRef.current = false;
    embedResultSeenRef.current = false;
    dedupeRef.current.reset();
    clarityEvent("fitlens_opened");
    pushGtmEvent("fitlens_opened", { page: window.location.pathname });
  };

  return { isReady, openFitLens };
}
