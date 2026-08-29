import { useLocation } from "react-router-dom";
import KoLandingPage from "./KoLandingPage";
import { koPages } from "@/content/ko/landingPages";
import NotFound from "@/pages/NotFound";

export default function KoLandingRoute() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, "") || "/ko";
  const config = koPages[path];
  // No English fallback for /ko — an unregistered Korean path is a 404,
  // never the English shell.
  if (!config) return <NotFound />;
  return <KoLandingPage config={config} />;
}
