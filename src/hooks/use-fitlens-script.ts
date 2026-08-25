import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://fitlens-web-production.up.railway.app/v1/embed.js";
const SCRIPT_INTEGRITY =
  "sha384-4j5GyGmarK1WprpkbZh9RoLLdLREC+zSeF0TDyBSyrf3+3WD5kbDRQAqFuPYqHzu";
const FITLENS_KEY = "pk_live_OuBrFjXWKeNygZku6WyJHeFW_8d55SVqIrleeFfrzuQ";

/**
 * Load the external FitLens embed script once per mount.
 * Use `data-fitlens="open"` on a button to open the widget.
 */
export function useFitLensScript() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Remove any previous instance so the widget re-attaches to the current
    // trigger element when the component remounts (e.g. SPA navigation).
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.integrity = SCRIPT_INTEGRITY;
    script.dataset.key = FITLENS_KEY;
    script.dataset.label = "Find my fit";
    script.dataset.color = "#3B4A66";

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);
}
