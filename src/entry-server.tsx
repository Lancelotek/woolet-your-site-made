/**
 * Server-side entry used by scripts/prerender.mjs.
 *
 * Renders each route through react-helmet-async to capture per-route
 * <head> tags (title, meta, link, JSON-LD). Only the helmet output is
 * used — body markup is discarded and the SPA still hydrates on the
 * client.
 *
 * IMPORTANT: routes here mirror src/App.tsx but use SYNCHRONOUS imports
 * (no React.lazy / Suspense). Lazy components suspend on the server and
 * their Helmet tags never flush, defeating the entire point of the
 * prerender. Keep this file in sync when adding new routes.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import FitWizard from "./pages/FitWizard";
import FitManual from "./pages/FitManual";
import FitBespoke from "./pages/FitBespoke";
import FitScan from "./pages/FitScan";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import AdvertorialPage from "./pages/lp/AdvertorialPage";
import ListiclePage from "./pages/lp/ListiclePage";
import ProductPage007 from "./pages/products/ProductPage007";
import ProductPage009 from "./pages/products/ProductPage009";
import About from "./pages/About";
import Gone from "./pages/Gone";
import WideFaceGlasses from "./pages/collections/WideFaceGlasses";
import ItalianAcetateSunglasses from "./pages/collections/ItalianAcetateSunglasses";
import OversizedSunglassesMen from "./pages/collections/OversizedSunglassesMen";

function SsrRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/en/lp/why-glasses-fail" element={<AdvertorialPage />} />
      <Route path="/en/lp/5-reasons" element={<ListiclePage />} />
      <Route path="/en/products/007" element={<ProductPage007 />} />
      <Route path="/en/products/009" element={<ProductPage009 />} />
      <Route path="/en/about" element={<About />} />
      <Route path="/en/collections/wide-face-glasses" element={<WideFaceGlasses />} />
      <Route path="/en/collections/italian-acetate-sunglasses" element={<ItalianAcetateSunglasses />} />
      <Route path="/en/collections/oversized-sunglasses-men" element={<OversizedSunglassesMen />} />
      <Route path="/:lang" element={<Index />} />
      <Route path="/:lang/blog" element={<BlogIndex />} />
      <Route path="/:lang/blog/:slug" element={<BlogPost />} />
      <Route path="/:lang/fit" element={<FitWizard />} />
      <Route path="/en/fit/manual" element={<FitManual />} />
      <Route path="/en/fit/bespoke" element={<FitBespoke />} />
      <Route path="/:lang/fit/scan" element={<FitScan />} />
      <Route path="/:lang/thank-you" element={<ThankYou />} />
      <Route path="/:lang/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/:lang/return-policy" element={<ReturnPolicy />} />
      <Route path="/products/*" element={<Gone />} />
      <Route path="/blogs/*" element={<Gone />} />
      <Route path="/pages/*" element={<Gone />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export interface HelmetSnapshot {
  title: string;
  meta: string;
  link: string;
  script: string;
  htmlAttributes: string;
}

export function renderHelmet(url: string): { ok: boolean; helmet: HelmetSnapshot | null; error?: string } {
  const helmetContext: { helmet?: any } = {};
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  try {
    renderToString(
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <StaticRouter location={url}>
              <SsrRoutes />
            </StaticRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>,
    );
  } catch (err) {
    return { ok: false, helmet: null, error: (err as Error).message };
  }

  const h = helmetContext.helmet;
  if (!h) return { ok: false, helmet: null, error: "no helmet context" };

  return {
    ok: true,
    helmet: {
      title: h.title?.toString?.() ?? "",
      meta: h.meta?.toString?.() ?? "",
      link: h.link?.toString?.() ?? "",
      script: h.script?.toString?.() ?? "",
      htmlAttributes: h.htmlAttributes?.toString?.() ?? "",
    },
  };
}
