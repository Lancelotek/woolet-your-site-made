import { useEffect } from "react";
import { pushGtmEvent } from "@/lib/gtm";

// Tawk.to live chat (property 6ab578a42c323b344704c665, widget 1k3adugr8).
// Replaces WhatsApp site-wide. Injected once, after the page is interactive.
const TAWK_SRC = "https://embed.tawk.to/6ab578a42c323b344704c665/1k3adugr8";

// Body classes that hide the bubble: photo lightbox + Bespoke configurator.
const HIDE_CLASSES = ["wl-lightbox-open", "cfg-hide-whatsapp"];

let widgetReady = false;
let hidden = false;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const shouldHide = () => HIDE_CLASSES.some((c) => document.body.classList.contains(c));

const applyVisibility = () => {
  const api = window.Tawk_API;
  if (!api || !widgetReady) return;
  try {
    if (hidden) api.hideWidget?.();
    else api.showWidget?.();
  } catch {
    /* widget API unavailable */
  }
};

const injectTawk = () => {
  if (document.getElementById("tawk-script")) return;
  const api = (window.Tawk_API = window.Tawk_API || {});
  window.Tawk_LoadStart = new Date();

  // Mobile: lift the bubble above sticky bottom bars (LP sticky CTA, DE bar etc.).
  api.customStyle = {
    visibility: {
      desktop: { position: "br", xOffset: 20, yOffset: 20 },
      mobile: { position: "br", xOffset: 12, yOffset: 96 },
    },
  };
  api.onLoad = () => {
    widgetReady = true;
    applyVisibility();
  };
  api.onChatMaximized = () => {
    pushGtmEvent("chat_open", { channel: "tawk", location: window.location.pathname });
  };

  const s1 = document.createElement("script");
  const s0 = document.getElementsByTagName("script")[0];
  s1.id = "tawk-script";
  s1.async = true;
  s1.src = TAWK_SRC;
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  if (s0?.parentNode) s0.parentNode.insertBefore(s1, s0);
  else document.head.appendChild(s1);
};

const TawkChat = () => {
  useEffect(() => {
    const schedule = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(injectTawk, { timeout: 4000 });
      else setTimeout(injectTawk, 1500);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    hidden = shouldHide();
    const observer = new MutationObserver(() => {
      const next = shouldHide();
      if (next !== hidden) {
        hidden = next;
        applyVisibility();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("load", schedule);
      observer.disconnect();
    };
  }, []);

  return null;
};

export default TawkChat;
