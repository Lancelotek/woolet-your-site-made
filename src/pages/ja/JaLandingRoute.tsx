import { useLocation } from "react-router-dom";
import JaLandingPage from "./JaLandingPage";
import { jaPages } from "@/content/ja/landingPages";
import NotFound from "@/pages/NotFound";

export default function JaLandingRoute() {
  const { pathname } = useLocation();
  // pathname like "/ja/big-face-glasses" -> "big-face-glasses"
  const slug = pathname.replace(/^\/ja\//, "").replace(/\/$/, "");
  const config = jaPages[slug];
  if (!config) return <NotFound />;
  return <JaLandingPage config={config} />;
}
