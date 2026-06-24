import { useParams } from "react-router-dom";
import DeLandingPage from "@/components/de/DeLandingPage";
import { dePages } from "@/content/de/landingPages";
import NotFound from "@/pages/NotFound";

export default function DeLandingRoute() {
  const { slug } = useParams();
  const config = slug ? dePages[slug] : undefined;
  if (!config) return <NotFound />;
  return <DeLandingPage config={config} />;
}
