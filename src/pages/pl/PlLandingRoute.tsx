import { useLocation } from "react-router-dom";
import PlLandingPage from "./PlLandingPage";
import { plPages } from "@/content/pl/landingPages";
import NotFound from "@/pages/NotFound";

export default function PlLandingRoute() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/pl\//, "").replace(/\/$/, "");
  const config = plPages[slug];
  if (!config) return <NotFound />;
  return <PlLandingPage config={config} />;
}
