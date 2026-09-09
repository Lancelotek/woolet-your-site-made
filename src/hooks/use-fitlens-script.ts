import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://fitlens-web-production.up.railway.app/v1/embed.js";
const SCRIPT_INTEGRITY =
  "sha384-/oLuzB2402AcbPCZLgkjIH28E3YXlys9k+0FuYU08cwj0cjk7cRtG5ErHW376fSv";
const FITLENS_KEY = "pk_live_OuBrFjXWKeNygZku6WyJHeFW_8d55SVqIrleeFfrzuQ";

/**
 * Load the external FitLens embed script once per mount.
 * Use `data-fitlens="open"` on a button to open the widget.
 */
export function useFitLensScript() {
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
    // Keep this explicit attribute assignment in the emitted FitScan chunk so
    // production deployments can be verified against the FitLens install hash.
    script.setAttribute("integrity", SCRIPT_INTEGRITY);
    script.dataset.key = FITLENS_KEY;
    script.dataset.label = "Find my fit";
    script.dataset.color = "#3B4A66";
    script.addEventListener("load", () => setIsReady(true), { once: true });

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

      if (event.data.type === "result") {
        document.dispatchEvent(
          new CustomEvent("fitlens:result", {
            detail: event.data.measurement,
            bubbles: true,
          }),
        );
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
    frame.src =
      `${origin}/w/intro?k=${encodeURIComponent(FITLENS_KEY)}` +
      `&host=${encodeURIComponent(window.location.origin)}${debug}`;
    document.body.appendChild(frame);
    frameRef.current = frame;
  };

  return { isReady, openFitLens };
}
