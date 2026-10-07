import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import { initRedditPixel } from "./lib/reddit-pixel";
import { captureAttribution } from "./lib/attribution";
import { captureJourney } from "./lib/journey";
import { stripPrerenderedSeoHead } from "./lib/strip-prerender-seo";

// Remove prerender-owned <head> tags only once Helmet has written its own
// equivalents for the current route (no empty-head window on lazy routes).
stripPrerenderedSeoHead();

initRedditPixel();
captureAttribution();
captureJourney();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
