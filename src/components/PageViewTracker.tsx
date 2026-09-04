import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { rdtPageVisit, rdtCustom } from "@/lib/reddit-pixel";
import { trackMetaEvent } from "@/lib/meta-capi";
import { initMetaPixelDirect, trackMetaPixelPageView } from "@/lib/meta-pixel";

const isProdHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "woolet.co" || host === "www.woolet.co";
};

/** SPA page_view tracker — pushes to dataLayer on every route change */
const PageViewTracker = () => {
  const loc = useLocation();
  const firstRender = useRef(true);
  const lastPath = useRef<string | null>(null);

  // Direct Meta Pixel (non-EU visitors, prod hosts only). Fires its own first
  // PageView on init, so the route effect below skips the initial pathname.
  useEffect(() => {
    initMetaPixelDirect();
  }, []);
  useEffect(() => {
    if (isProdHost()) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: loc.pathname + loc.search,
        page_title: typeof document !== "undefined" ? document.title : "",
        page_location:
          typeof window !== "undefined" ? window.location.href : "",
      });
    }

    // Reddit Pixel — no-ops until marketing consent + initialization.
    // Skip the very first render: the loader already fires PageVisit on init.
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      rdtPageVisit();
    }

    if (/\/fit\/?$/.test(loc.pathname)) {
      rdtCustom({ customEventName: "FitWizardStart" });
    }

    // Meta PageView — exactly once per pathname change, never on re-render.
    const path = loc.pathname;
    if (lastPath.current !== path) {
      const isFirstPath = lastPath.current === null;
      lastPath.current = path;
      if (window.__wooletMetaDirect) {
        // Direct pixel already fired PageView (browser + CAPI) on init.
        if (!isFirstPath) trackMetaPixelPageView();
      } else {
        void trackMetaEvent("PageView");
      }
    }
  }, [loc.pathname, loc.search]);
  return null;
};

export default PageViewTracker;
