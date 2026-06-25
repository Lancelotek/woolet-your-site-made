import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import PageViewTracker from "@/components/PageViewTracker";
import { AuthProvider } from "@/lib/auth-context";
import WhatsAppButton from "@/components/WhatsAppButton";
import VipPopup from "@/components/VipPopup";

import Index from "./pages/Index.tsx";
const Collection = lazy(() => import("./pages/Collection.tsx"));

const SignIn = lazy(() => import("./pages/account/SignIn.tsx"));
const AuthCallback = lazy(() => import("./pages/account/Callback.tsx"));
const Account = lazy(() => import("./pages/account/Account.tsx"));

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy.tsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const NoseBridgeFitHub = lazy(() => import("./pages/blog/NoseBridgeFitHub.tsx"));
const FitWizard = lazy(() => import("./pages/FitWizard.tsx"));
const FitManual = lazy(() => import("./pages/FitManual.tsx"));
const FitQuick = lazy(() => import("./pages/FitQuick.tsx"));
const FitBespoke = lazy(() => import("./pages/FitBespoke.tsx"));
const FitScan = lazy(() => import("./pages/FitScan.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));
const Payments = lazy(() => import("./pages/Payments.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdvertorialPage = lazy(() => import("./pages/lp/AdvertorialPage.tsx"));
const WideBridgeFitGuide = lazy(() => import("./pages/lp/WideBridgeFitGuide.tsx"));
const ListiclePage = lazy(() => import("./pages/lp/ListiclePage.tsx"));
const KickstarterPrelaunch = lazy(() => import("./pages/lp/KickstarterPrelaunch.tsx"));
const KickstarterVipConfirmed = lazy(() => import("./pages/lp/KickstarterVipConfirmed.tsx"));
const ProductPage007 = lazy(() => import("./pages/products/ProductPage007.tsx"));
const ProductPage009 = lazy(() => import("./pages/products/ProductPage009.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Process = lazy(() => import("./pages/Process.tsx"));
const Bespoke = lazy(() => import("./pages/Bespoke.tsx"));
const BespokeConfigurator = lazy(() => import("./pages/bespoke/Configurator.tsx"));
const BespokeScan = lazy(() => import("./pages/bespoke/Scan.tsx"));
const VipJoin = lazy(() => import("./pages/VipJoin.tsx"));
const Gone = lazy(() => import("./pages/Gone.tsx"));
const WideFaceGlasses = lazy(() => import("./pages/collections/WideFaceGlasses.tsx"));
const ItalianAcetateSunglasses = lazy(() => import("./pages/collections/ItalianAcetateSunglasses.tsx"));
const ItalianMazzucchelliAcetate = lazy(() => import("./pages/collections/ItalianMazzucchelliAcetate.tsx"));
const OversizedSunglassesMen = lazy(() => import("./pages/collections/OversizedSunglassesMen.tsx"));
const SunglassesForBigHeads = lazy(() => import("./pages/collections/SunglassesForBigHeads.tsx"));
const GlassesForBigHeads = lazy(() => import("./pages/collections/GlassesForBigHeads.tsx"));
const ExtraWideGlasses = lazy(() => import("./pages/collections/ExtraWideGlasses.tsx"));
const WideBridgeGlasses = lazy(() => import("./pages/collections/WideBridgeGlasses.tsx"));
const KeyholeBridgeGlasses = lazy(() => import("./pages/collections/KeyholeBridgeGlasses.tsx"));
const OversizedBlueLightGlasses = lazy(() => import("./pages/collections/OversizedBlueLightGlasses.tsx"));
const BlueLightGlassesForWideFaces = lazy(() => import("./pages/collections/BlueLightGlassesForWideFaces.tsx"));
const ExtraLargeOversizedEyeglasses = lazy(() => import("./pages/collections/ExtraLargeOversizedEyeglasses.tsx"));
const BigGlassesFrames = lazy(() => import("./pages/collections/BigGlassesFrames.tsx"));
const OversizedPrescriptionGlasses = lazy(() => import("./pages/collections/OversizedPrescriptionGlasses.tsx"));
const WideFrameReadingGlasses = lazy(() => import("./pages/collections/WideFrameReadingGlasses.tsx"));
const OversizedSquareGlasses = lazy(() => import("./pages/collections/OversizedSquareGlasses.tsx"));
const OversizedRoundGlasses = lazy(() => import("./pages/collections/OversizedRoundGlasses.tsx"));
const OversizedBlackGlasses = lazy(() => import("./pages/collections/OversizedBlackGlasses.tsx"));
const ThickFrameGlasses = lazy(() => import("./pages/collections/ThickFrameGlasses.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const DeHub = lazy(() => import("./pages/de/DeHub.tsx"));
const DeLandingRoute = lazy(() => import("./pages/de/DeLandingRoute.tsx"));

const queryClient = new QueryClient();

const FitScanRedirect = () => {
  const { lang } = useParams();
  return <Navigate to={`/${lang}/fit`} replace />;
};

/** Root redirect: auto-detect German browsers and send to /de, otherwise /en. */
const RootRedirect = () => {
  const SUPPORTED = ["en", "de", "pl", "fr", "es"] as const;
  let target = "/en";
  try {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("woolet_lang") : null;
    if (stored && (SUPPORTED as readonly string[]).includes(stored)) {
      target = `/${stored}`;
    } else if (typeof navigator !== "undefined") {
      const langs = (navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "en"]
      ).map((l) => l.toLowerCase());
      if (langs.some((l) => l.startsWith("de"))) target = "/de";
      else {
        const match = langs
          .map((l) => l.slice(0, 2))
          .find((l) => (SUPPORTED as readonly string[]).includes(l));
        if (match) target = `/${match}`;
      }
    }
  } catch {
    // ignore — fall back to /en
  }
  return <Navigate to={target} replace />;
};

/** Redirect non-EN locales of EN-only pages to their /en/... equivalent. */
const RedirectToEn = ({ to }: { to: string }) => {
  const { lang } = useParams();
  if (lang === "en") return <Navigate to={`/en${to}`} replace />;
  return <Navigate to={`/en${to}`} replace />;
};

const RedirectCollectionToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/collections/${slug}`} replace />;
};
const RedirectProductToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/products/${slug}`} replace />;
};
const RedirectLpToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/lp/${slug}`} replace />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <PageViewTracker />
        <VipPopup />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          {/* Root redirects to /en */}
          <Route path="/" element={<RootRedirect />} />

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
          <Route path="/en/lp/wide-bridge-fit-guide" element={<WideBridgeFitGuide />} />
          <Route path="/en/lp/5-reasons" element={<ListiclePage />} />
          <Route path="/en/lp/kickstarter" element={<KickstarterPrelaunch />} />
          <Route path="/en/lp/kickstarter/vip-confirmed" element={<KickstarterVipConfirmed />} />
          <Route path="/en/products/007" element={<ProductPage007 />} />
          <Route path="/en/products/009" element={<ProductPage009 />} />
          <Route path="/en/about" element={<About />} />
          <Route path="/en/process" element={<Process />} />
          <Route path="/:lang/process" element={<RedirectToEn to="/process" />} />
          <Route path="/en/bespoke" element={<Bespoke />} />
          <Route path="/en/bespoke/configurator" element={<BespokeConfigurator />} />
          <Route path="/:lang/bespoke/configurator" element={<Navigate to="/en/bespoke/configurator" replace />} />
          <Route path="/en/bespoke/scan" element={<BespokeScan />} />
          <Route path="/:lang/bespoke/scan" element={<BespokeScan />} />
          <Route path="/:lang/bespoke" element={<Bespoke />} />
          {/* Legacy /:lang/pages/bespoke -> /:lang/bespoke */}
          <Route path="/en/pages/bespoke" element={<Navigate to="/en/bespoke" replace />} />
          <Route path="/:lang/pages/bespoke" element={<Navigate to="/en/bespoke" replace />} />
          <Route path="/:lang/vip-join" element={<VipJoin />} />

          {/* SEO collection pages */}
          <Route path="/en/collections/wide-face-glasses" element={<WideFaceGlasses />} />
          <Route path="/en/collections/italian-acetate-sunglasses" element={<ItalianAcetateSunglasses />} />
          <Route path="/en/collections/italian-mazzucchelli-acetate" element={<ItalianMazzucchelliAcetate />} />
          <Route path="/en/collections/oversized-sunglasses-men" element={<OversizedSunglassesMen />} />
          <Route path="/en/collections/sunglasses-for-big-heads" element={<SunglassesForBigHeads />} />
          <Route path="/en/collections/glasses-for-big-heads" element={<GlassesForBigHeads />} />
          <Route path="/en/collections/extra-wide-glasses" element={<ExtraWideGlasses />} />
          <Route path="/en/collections/wide-bridge-glasses" element={<WideBridgeGlasses />} />
          <Route path="/en/collections/keyhole-bridge-glasses" element={<KeyholeBridgeGlasses />} />
          <Route path="/en/collections/oversized-blue-light-glasses" element={<OversizedBlueLightGlasses />} />
          <Route path="/en/collections/blue-light-glasses-for-wide-faces" element={<BlueLightGlassesForWideFaces />} />
          <Route path="/en/collections/extra-large-oversized-eyeglasses" element={<ExtraLargeOversizedEyeglasses />} />
          <Route path="/en/collections/big-glasses-frames" element={<BigGlassesFrames />} />
          <Route path="/en/collections/oversized-prescription-glasses" element={<OversizedPrescriptionGlasses />} />
          <Route path="/en/collections/wide-frame-reading-glasses" element={<WideFrameReadingGlasses />} />
          <Route path="/en/collections/oversized-square-glasses" element={<OversizedSquareGlasses />} />
          <Route path="/en/collections/oversized-round-glasses" element={<OversizedRoundGlasses />} />
          <Route path="/en/collections/oversized-black-glasses" element={<OversizedBlackGlasses />} />
          <Route path="/en/collections/thick-frame-glasses" element={<ThickFrameGlasses />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/collection" element={<Collection />} />
          <Route path="/:lang/blog" element={<BlogIndex />} />
          <Route path="/en/blog/category/nose-bridge-fit" element={<NoseBridgeFitHub />} />
          <Route path="/:lang/blog/category/nose-bridge-fit" element={<Navigate to="/en/blog/category/nose-bridge-fit" replace />} />
          <Route path="/:lang/blog/:slug" element={<BlogPost />} />
          <Route path="/:lang/fit" element={<FitScan />} />
          <Route path="/:lang/fit/wizard" element={<FitWizard />} />
          <Route path="/en/fit/manual" element={<FitManual />} />
          <Route path="/en/fit/quick" element={<FitQuick />} />
          <Route path="/en/fit/bespoke" element={<FitBespoke />} />
          {/* Non-EN locales of EN-only pages → redirect to /en equivalent */}
          <Route path="/:lang/fit/manual" element={<RedirectToEn to="/fit/manual" />} />
          <Route path="/:lang/fit/quick" element={<RedirectToEn to="/fit/quick" />} />
          <Route path="/:lang/fit/bespoke" element={<RedirectToEn to="/fit/bespoke" />} />
          <Route path="/:lang/about" element={<RedirectToEn to="/about" />} />
          <Route path="/:lang/lp/:slug" element={<RedirectLpToEn />} />
          <Route path="/:lang/products/:slug" element={<RedirectProductToEn />} />
          <Route path="/:lang/collections/:slug" element={<RedirectCollectionToEn />} />

          <Route path="/:lang/fit/scan" element={<FitScanRedirect />} />
          <Route path="/:lang/thank-you" element={<ThankYou />} />
          <Route path="/:lang/payments" element={<Payments />} />

          {/* Legacy routes redirect */}
          <Route path="/privacy-policy" element={<Navigate to="/en/privacy-policy" replace />} />
          <Route path="/return-policy" element={<Navigate to="/en/return-policy" replace />} />
          <Route path="/privacy" element={<Navigate to="/en/privacy-policy" replace />} />

          {/* Legacy broken internal URLs */}
          <Route path="/en/how-to-measure-face-width" element={<Navigate to="/en/blog/how-to-measure-face-width-for-glasses" replace />} />
          <Route path="/en/blog/glasses-for-wide-faces" element={<Navigate to="/en/blog/glasses-for-wide-faces-guide" replace />} />

          {/* Policy pages with lang */}
          <Route path="/:lang/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/:lang/return-policy" element={<ReturnPolicy />} />

          {/* Account */}
          <Route path="/:lang/account/sign-in" element={<SignIn />} />
          <Route path="/:lang/account/callback" element={<AuthCallback />} />
          <Route path="/:lang/account" element={<Account />} />

         <Route path="/unsubscribe" element={<Unsubscribe />} />

         {/* DE market SEO landing pages */}
         <Route path="/de" element={<DeHub />} />
         <Route path="/de/:slug" element={<DeLandingRoute />} />

         <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <WhatsAppButton />
      <CookieBanner />
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
