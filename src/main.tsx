import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import { initRedditPixel } from "./lib/reddit-pixel";
import { captureAttribution } from "./lib/attribution";
import { stripPrerenderedSeoHead } from "./lib/strip-prerender-seo";

// Remove prerender-owned <head> tags before React (and Helmet) mount, so
// Helmet becomes the sole owner of title / description / canonical /
// hreflang / og:* / twitter:* / JSON-LD after hydration. Crawlers still
// see the prerendered tags in the initial HTML because they don't run JS.
stripPrerenderedSeoHead();

initRedditPixel();
captureAttribution();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
