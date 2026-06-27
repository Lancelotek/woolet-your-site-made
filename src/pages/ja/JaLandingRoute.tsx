import { useParams } from "react-router-dom";
import JaLandingPage from "./JaLandingPage";
import { jaPages } from "@/content/ja/landingPages";
import NotFound from "@/pages/NotFound";

export default function JaLandingRoute() {
  const { slug } = useParams();
  const config = slug ? jaPages[slug] : undefined;
  if (!config) return <NotFound />;
  return <JaLandingPage config={config} />;
}
