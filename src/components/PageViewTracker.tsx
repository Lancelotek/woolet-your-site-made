import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const isProdHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "woolet.co" || host === "www.woolet.co";
};

/** SPA page_view tracker — pushes to dataLayer on every route change */
const PageViewTracker = () => {
  const loc = useLocation();
  useEffect(() => {
    if (!isProdHost()) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: loc.pathname + loc.search,
      page_title: typeof document !== "undefined" ? document.title : "",
      page_location:
        typeof window !== "undefined" ? window.location.href : "",
    });
  }, [loc.pathname, loc.search]);
  return null;
};

export default PageViewTracker;
