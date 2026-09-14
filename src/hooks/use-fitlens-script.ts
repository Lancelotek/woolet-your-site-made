import { useEffect, useRef, useState } from "react";

import { getSessionRef } from "@/lib/scan-session-ref";

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

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.data?.source !== "fitlens") return;

      if (event.data.type === "close") {
        frameRef.current?.remove();
        frameRef.current = null;
      }

    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
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
  };

  return { isReady, openFitLens };
}
