import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveRedirect } from "@/config/redirects";

/**
 * Centralized client-side redirect layer. Mounted at the top of the router,
 * before any route matching. On every location change it checks the current
 * pathname against the EXACT map, then the ordered RULES, and navigates with
 * replace: true, preserving the query string and hash.
 *
 * Renders nothing. While a redirect is in flight it sets
 * <meta name="robots" content="noindex"> on the document head.
 */
const Redirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveRedirect(location.pathname);
    if (!target) return;

    // Mark the in-flight redirecting page as noindex.
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute("content");
    meta.setAttribute("content", "noindex");

    navigate(`${target}${location.search}${location.hash}`, { replace: true });

    return () => {
      // Restore whatever the head had before once the redirect resolves.
      if (previous === null) meta?.remove();
      else meta?.setAttribute("content", previous);
    };
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
};

export default Redirects;
