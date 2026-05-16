import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** SPA page_view tracker — pushes to dataLayer on every route change */
const PageViewTracker = () => {
  const loc = useLocation();
  useEffect(() => {
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
