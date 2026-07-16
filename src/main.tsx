import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initRedditPixel } from "./lib/reddit-pixel";
import { captureAttribution } from "./lib/attribution";

initRedditPixel();
captureAttribution();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
