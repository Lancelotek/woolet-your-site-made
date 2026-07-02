import { useLocation } from "react-router-dom";
import NlLandingPage from "./NlLandingPage";
import { nlPages } from "@/content/nl/landingPages";
import NotFound from "@/pages/NotFound";

export default function NlLandingRoute() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/nl\//, "").replace(/\/$/, "");
  const config = nlPages[slug];
  if (!config) return <NotFound />;
  return <NlLandingPage config={config} />;
}
