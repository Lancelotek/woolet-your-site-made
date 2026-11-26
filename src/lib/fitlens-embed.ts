// FitLens loader (`/v1/embed.js`) with Subresource Integrity.
//
// The hash pins the loader version FitLens shipped on 2026-10-23 (sessionRef
// support). FitLens redeploys this URL without notice, so a mismatch must not
// kill the scan: on an integrity failure we report `fitlens_sri_mismatch` and
// load the file once more without the hash. Update FITLENS_EMBED_SRI when that
// event shows up (hash = sha384 of the served file, base64).
import { pushGtmEvent } from "@/lib/gtm";

/**
 * FitLens (Railway) went offline on 2026-11-26: the embed and the /w/intro
 * iframe return 404 "Application not found". While this is false no page loads
 * the embed or opens the iframe, and /fit offers the tape measure + quiz.
 * Set back to true only once a working fit app is wired in.
 */
export const FITLENS_ENABLED = false;

export const FITLENS_EMBED_SRC = "https://fitlens-web-production.up.railway.app/v1/embed.js";
export const FITLENS_EMBED_SRI = "sha384-brSBpVaQjzJtWAKkncKEYcFp1TsV5kZcseUmLZvhCv3W4o3+kzg5lU0MZRxtUnAW";

export function createFitLensScript(
  configure: (script: HTMLScriptElement) => void,
  opts: { integrity?: boolean } = {},
): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = FITLENS_EMBED_SRC;
  script.crossOrigin = "anonymous";
  if (opts.integrity !== false) script.integrity = FITLENS_EMBED_SRI;
  configure(script);
  return script;
}

/** Append the loader; on an SRI/load failure retry once without `integrity`. */
export function appendFitLensScript(
  configure: (script: HTMLScriptElement) => void,
  onReplace?: (script: HTMLScriptElement) => void,
): HTMLScriptElement {
  const script = createFitLensScript(configure);
  // Disabled: hand back a detached element so callers keep working, load nothing.
  if (!FITLENS_ENABLED) return script;
  script.addEventListener(
    "error",
    () => {
      console.warn("[fitlens] embed.js failed integrity/load check; retrying without SRI");
      try {
        pushGtmEvent("fitlens_sri_mismatch", { page: window.location.pathname });
      } catch {
        /* noop */
      }
      const retry = createFitLensScript(configure, { integrity: false });
      script.replaceWith(retry);
      onReplace?.(retry);
    },
    { once: true },
  );
  document.body.appendChild(script);
  return script;
}
