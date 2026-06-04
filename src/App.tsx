import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import PageViewTracker from "@/components/PageViewTracker";

import Index from "./pages/Index.tsx";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy.tsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const FitWizard = lazy(() => import("./pages/FitWizard.tsx"));
const FitManual = lazy(() => import("./pages/FitManual.tsx"));
const FitBespoke = lazy(() => import("./pages/FitBespoke.tsx"));
const FitScan = lazy(() => import("./pages/FitScan.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdvertorialPage = lazy(() => import("./pages/lp/AdvertorialPage.tsx"));
const ListiclePage = lazy(() => import("./pages/lp/ListiclePage.tsx"));
const KickstarterPrelaunch = lazy(() => import("./pages/lp/KickstarterPrelaunch.tsx"));
const ProductPage007 = lazy(() => import("./pages/products/ProductPage007.tsx"));
const ProductPage009 = lazy(() => import("./pages/products/ProductPage009.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Bespoke = lazy(() => import("./pages/Bespoke.tsx"));
const VipJoin = lazy(() => import("./pages/VipJoin.tsx"));
const Gone = lazy(() => import("./pages/Gone.tsx"));
const WideFaceGlasses = lazy(() => import("./pages/collections/WideFaceGlasses.tsx"));
const ItalianAcetateSunglasses = lazy(() => import("./pages/collections/ItalianAcetateSunglasses.tsx"));
const OversizedSunglassesMen = lazy(() => import("./pages/collections/OversizedSunglassesMen.tsx"));
const SunglassesForBigHeads = lazy(() => import("./pages/collections/SunglassesForBigHeads.tsx"));
const GlassesForBigHeads = lazy(() => import("./pages/collections/GlassesForBigHeads.tsx"));
const ExtraWideGlasses = lazy(() => import("./pages/collections/ExtraWideGlasses.tsx"));
const WideBridgeGlasses = lazy(() => import("./pages/collections/WideBridgeGlasses.tsx"));
const OversizedBlueLightGlasses = lazy(() => import("./pages/collections/OversizedBlueLightGlasses.tsx"));
const BlueLightGlassesForWideFaces = lazy(() => import("./pages/collections/BlueLightGlassesForWideFaces.tsx"));
const ExtraLargeOversizedEyeglasses = lazy(() => import("./pages/collections/ExtraLargeOversizedEyeglasses.tsx"));
const BigGlassesFrames = lazy(() => import("./pages/collections/BigGlassesFrames.tsx"));
const OversizedPrescriptionGlasses = lazy(() => import("./pages/collections/OversizedPrescriptionGlasses.tsx"));
const WideFrameReadingGlasses = lazy(() => import("./pages/collections/WideFrameReadingGlasses.tsx"));
const OversizedSquareGlasses = lazy(() => import("./pages/collections/OversizedSquareGlasses.tsx"));
const OversizedRoundGlasses = lazy(() => import("./pages/collections/OversizedRoundGlasses.tsx"));
const OversizedBlackGlasses = lazy(() => import("./pages/collections/OversizedBlackGlasses.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageViewTracker />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          {/* Root redirects to /en */}
          <Route path="/" element={<Navigate to="/en" replace />} />

          {/* === Legacy Shopify smart-wallet 301-equivalent redirects === */}
          {/* Old product URLs that map cleanly to new eyewear models */}
          <Route path="/products/smart-and-slim-leather-wallet" element={<Navigate to="/en/products/009" replace />} />
          <Route path="/products/smart-and-slim-travel-wallet-hand-crafted-leather" element={<Navigate to="/en/products/007" replace />} />
          {/* Old product URLs with no eyewear counterpart → home */}
          <Route path="/products/smart-wallet-howl" element={<Navigate to="/en" replace />} />
          <Route path="/products/woolet-classic-charging-pad-special-offer" element={<Navigate to="/en" replace />} />
          <Route path="/products/woolet-tracker" element={<Navigate to="/en" replace />} />
          <Route path="/products/black-leather-cable-microusb-to-usb" element={<Navigate to="/en" replace />} />
          <Route path="/products/flash-sale-woolet-travel-xl-2-0-black" element={<Navigate to="/en" replace />} />
          <Route path="/products/smart-anti-theft-black-italian-leather-wallet" element={<Navigate to="/en" replace />} />
          {/* Old blog/collection URLs */}
          <Route path="/blogs/news" element={<Navigate to="/en/blog" replace />} />
          <Route path="/blogs/news/*" element={<Navigate to="/en/blog" replace />} />
          <Route path="/blog/woolet-howl-3-0-gps-manual-how-setup-gps-wallet" element={<Navigate to="/en" replace />} />
          <Route path="/collections/*" element={<Navigate to="/en" replace />} />

          {/* === 410-equivalent: any other legacy Shopify path returns noindex Gone page === */}
          <Route path="/products/*" element={<Gone />} />
          <Route path="/blogs/*" element={<Gone />} />
          <Route path="/pages/*" element={<Gone />} />

          {/* Landing pages */}
          <Route path="/en/lp/why-glasses-fail" element={<AdvertorialPage />} />
          <Route path="/en/lp/5-reasons" element={<ListiclePage />} />
          <Route path="/en/lp/kickstarter" element={<KickstarterPrelaunch />} />
          <Route path="/en/products/007" element={<ProductPage007 />} />
          <Route path="/en/products/009" element={<ProductPage009 />} />
          <Route path="/en/about" element={<About />} />
          <Route path="/en/bespoke" element={<Bespoke />} />
          <Route path="/:lang/bespoke" element={<Bespoke />} />
          <Route path="/:lang/vip-join" element={<VipJoin />} />

          {/* SEO collection pages */}
          <Route path="/en/collections/wide-face-glasses" element={<WideFaceGlasses />} />
          <Route path="/en/collections/italian-acetate-sunglasses" element={<ItalianAcetateSunglasses />} />
          <Route path="/en/collections/oversized-sunglasses-men" element={<OversizedSunglassesMen />} />
          <Route path="/en/collections/sunglasses-for-big-heads" element={<SunglassesForBigHeads />} />
          <Route path="/en/collections/glasses-for-big-heads" element={<GlassesForBigHeads />} />
          <Route path="/en/collections/extra-wide-glasses" element={<ExtraWideGlasses />} />
          <Route path="/en/collections/wide-bridge-glasses" element={<WideBridgeGlasses />} />
          <Route path="/en/collections/oversized-blue-light-glasses" element={<OversizedBlueLightGlasses />} />
          <Route path="/en/collections/blue-light-glasses-for-wide-faces" element={<BlueLightGlassesForWideFaces />} />
          <Route path="/en/collections/extra-large-oversized-eyeglasses" element={<ExtraLargeOversizedEyeglasses />} />
          <Route path="/en/collections/big-glasses-frames" element={<BigGlassesFrames />} />
          <Route path="/en/collections/oversized-prescription-glasses" element={<OversizedPrescriptionGlasses />} />
          <Route path="/en/collections/wide-frame-reading-glasses" element={<WideFrameReadingGlasses />} />
          <Route path="/en/collections/oversized-square-glasses" element={<OversizedSquareGlasses />} />
          <Route path="/en/collections/oversized-round-glasses" element={<OversizedRoundGlasses />} />
          <Route path="/en/collections/oversized-black-glasses" element={<OversizedBlackGlasses />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/blog" element={<BlogIndex />} />
          <Route path="/:lang/blog/:slug" element={<BlogPost />} />
          <Route path="/:lang/fit" element={<FitScan />} />
          <Route path="/:lang/fit/wizard" element={<FitWizard />} />
          <Route path="/en/fit/manual" element={<FitManual />} />
          <Route path="/en/fit/bespoke" element={<FitBespoke />} />
          <Route path="/:lang/fit/scan" element={<Navigate to={`/:lang/fit`} replace />} />
          <Route path="/:lang/thank-you" element={<ThankYou />} />

          {/* Legacy routes redirect */}
          <Route path="/privacy-policy" element={<Navigate to="/en/privacy-policy" replace />} />
          <Route path="/return-policy" element={<Navigate to="/en/return-policy" replace />} />
          <Route path="/privacy" element={<Navigate to="/en/privacy-policy" replace />} />

          {/* Policy pages with lang */}
          <Route path="/:lang/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/:lang/return-policy" element={<ReturnPolicy />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      <CookieBanner />
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
