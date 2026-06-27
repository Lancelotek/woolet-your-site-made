import { useLocation } from "react-router-dom";
import FrLandingPage from "./FrLandingPage";
import { frPages } from "@/content/fr/landingPages";
import NotFound from "@/pages/NotFound";

export default function FrLandingRoute() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/fr\//, "").replace(/\/$/, "");
  const config = frPages[slug];
  if (!config) return <NotFound />;
  return <FrLandingPage config={config} />;
}
