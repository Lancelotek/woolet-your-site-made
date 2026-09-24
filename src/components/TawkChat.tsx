import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pushGtmEvent } from "@/lib/gtm";

// Tawk.to live chat — replaces the floating WhatsApp bubble.
// The script is injected once; the widget provides its own bubble.
const TAWK_SRC = "https://embed.tawk.to/6ab578a42c323b344704c665/1k3adugr8";

// Routes where the chat bubble must not appear (same rule the WhatsApp
// bubble used - it competed with the LP's own CTAs). The configurator
// additionally toggles the body class "cfg-hide-whatsapp" while mounted.
const HIDE_PATH_PREFIXES = ["/en/lp/kickstarter"];

// Visibility is applied as soon as the widget finishes loading, or
// immediately on route change if it is already loaded.
let pendingHidden = false;
let widgetReady = false;

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown> & {
      onLoad?: () => void;
      onChatWindowMaximized?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      isChatHidden?: () => boolean;
    };
  }
}

const applyVisibility = () => {
  const api = window.Tawk_API;
  if (!api || !widgetReady) return;
  try {
    if (pendingHidden) api.hideWidget?.();
    else api.showWidget?.();
  } catch {
    // widget API unavailable — ignore
  }
};

const shouldHide = (pathname: string): boolean =>
  HIDE_PATH_PREFIXES.some((p) => pathname.startsWith(p)) ||
  document.body.classList.contains("cfg-hide-whatsapp");

const TawkChat = () => {
  const location = useLocation();

  // Load the Tawk.to script exactly once.
  useEffect(() => {
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = () => {
      widgetReady = true;
      applyVisibility();
    };
    // Analytics parity with the old whatsapp_click GTM event.
    window.Tawk_API.onChatWindowMaximized = () => {
      pushGtmEvent("chat_open", {
        channel: "tawk",
        location: typeof window !== "undefined" ? window.location.pathname : "",
      });
    };

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
  }, []);

  // Hide the bubble on routes that opt out, and react to the configurator's
  // body class being added/removed while this component stays mounted.
  useEffect(() => {
    pendingHidden = shouldHide(location.pathname);
    applyVisibility();
    const observer = new MutationObserver(() => {
      const next = shouldHide(location.pathname);
      if (next !== pendingHidden) {
        pendingHidden = next;
        applyVisibility();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
};

export default TawkChat;
