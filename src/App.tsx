import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import PageViewTracker from "@/components/PageViewTracker";
import { AuthProvider } from "@/lib/auth-context";
import WhatsAppButton from "@/components/WhatsAppButton";
import VipPopup from "@/components/VipPopup";
import { resolveCompetitorSlug } from "@/data/competitors";

import Index from "./pages/Index.tsx";
const Collection = lazy(() => import("./pages/Collection.tsx"));

const SignIn = lazy(() => import("./pages/account/SignIn.tsx"));
const AuthCallback = lazy(() => import("./pages/account/Callback.tsx"));
const Account = lazy(() => import("./pages/account/Account.tsx"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent.tsx"));

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy.tsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const HatSizeCalculator = lazy(() => import("./pages/tools/HatSizeCalculator.tsx"));
const NoseBridgeFitHub = lazy(() => import("./pages/blog/NoseBridgeFitHub.tsx"));
const FitWizard = lazy(() => import("./pages/FitWizard.tsx"));
const FitManual = lazy(() => import("./pages/FitManual.tsx"));
const FitQuick = lazy(() => import("./pages/FitQuick.tsx"));
const FitBespoke = lazy(() => import("./pages/FitBespoke.tsx"));
const FitScan = lazy(() => import("./pages/FitScan.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));
const ThankYouFb = lazy(() => import("./pages/ThankYouFb.tsx"));
const Payments = lazy(() => import("./pages/Payments.tsx"));
const Crm = lazy(() => import("./pages/Crm.tsx"));
const CrmGsc = lazy(() => import("./pages/CrmGsc.tsx"));
const CrmAcquisition = lazy(() => import("./pages/CrmAcquisition.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdvertorialPage = lazy(() => import("./pages/lp/AdvertorialPage.tsx"));
const WideBridgeFitGuide = lazy(() => import("./pages/lp/WideBridgeFitGuide.tsx"));
const ListiclePage = lazy(() => import("./pages/lp/ListiclePage.tsx"));
const KickstarterPrelaunch = lazy(() => import("./pages/lp/KickstarterPrelaunch.tsx"));
const KickstarterVipConfirmed = lazy(() => import("./pages/lp/KickstarterVipConfirmed.tsx"));
const ProductPage007 = lazy(() => import("./pages/products/ProductPage007.tsx"));
const ProductPage009 = lazy(() => import("./pages/products/ProductPage009.tsx"));
const ProductPageBespoke = lazy(() => import("./pages/products/ProductPageBespoke.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Process = lazy(() => import("./pages/Process.tsx"));
const TheBox = lazy(() => import("./pages/TheBox.tsx"));
const Bespoke = lazy(() => import("./pages/Bespoke.tsx"));
const BespokeConfigurator = lazy(() => import("./pages/bespoke/Configurator.tsx"));
const BespokeScan = lazy(() => import("./pages/bespoke/Scan.tsx"));
const BespokeCheckout = lazy(() => import("./pages/bespoke/Checkout.tsx"));
const BespokeMeasurements = lazy(() => import("./pages/bespoke/Measurements.tsx"));
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
const BlaulichtfilterBrilleHerren = lazy(() => import("./pages/de/BlaulichtfilterBrilleHerren.tsx"));
const JaLandingRoute = lazy(() => import("./pages/ja/JaLandingRoute.tsx"));
const KoLandingRoute = lazy(() => import("./pages/ko/KoLandingRoute.tsx"));
const FrLandingRoute = lazy(() => import("./pages/fr/FrLandingRoute.tsx"));
const PlLandingRoute = lazy(() => import("./pages/pl/PlLandingRoute.tsx"));
const NlLandingRoute = lazy(() => import("./pages/nl/NlLandingRoute.tsx"));
const NlHub = lazy(() => import("./pages/nl/NlHub.tsx"));
const FrHub = lazy(() => import("./pages/fr/FrHub.tsx"));
const CompareIndex = lazy(() => import("./pages/CompareIndex.tsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.tsx"));
const Upvote = lazy(() => import("./pages/Upvote.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const SizePage = lazy(() => import("./components/SizePage.tsx"));
const BridgePage = lazy(() => import("./components/BridgePage.tsx"));
const TemplePage = lazy(() => import("./components/TemplePage.tsx"));
const XxlPage = lazy(() => import("./components/XxlPage.tsx"));
const XxlHubPage = lazy(() => import("./components/XxlPage.tsx").then((m) => ({ default: m.XxlHubPage })));

const queryClient = new QueryClient();

const FitScanRedirect = () => {
  const { lang } = useParams();
  return <Navigate to={`/${lang}/fit`} replace />;
};

/**
 * Root redirect. "/" is not a real page — it is a placeholder that ships the
 * SPA shell without per-route metadata. Send everyone to /en (the English
 * homepage), which is x-default for hreflang and the canonical entry point.
 * A companion prerendered dist/index.html emits canonical=/en, noindex,follow
 * and a <noscript> meta refresh so crawlers without JS also land on /en.
 */
const RootRedirect = () => <Navigate to="/en" replace />;

/** Redirect non-EN locales of EN-only pages to their /en/... equivalent. */
const RedirectToEn = ({ to }: { to: string }) => {
  const { lang } = useParams();
  if (lang === "en") return <Navigate to={`/en${to}`} replace />;
  return <Navigate to={`/en${to}`} replace />;
};

const RedirectCollectionToEn = () => {
  const { lang, slug } = useParams();
  if (lang === "en") return <NotFound />;
  return <Navigate to={`/en/collections/${slug}`} replace />;
};
const RedirectProductToEn = () => {
  const { lang, slug } = useParams();
  if (lang === "en") return <NotFound />;
  return <Navigate to={`/en/products/${slug}`} replace />;
};
const RedirectLpToEn = () => {
  const { lang, slug } = useParams();
  if (lang === "en") return <NotFound />;
  return <Navigate to={`/en/lp/${slug}`} replace />;
};
const RedirectSizeToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/size/${slug}`} replace />;
};

/** /:lang/compare/:slug — send real competitor slugs to the English page. */
const LocalizedCompareRedirect = () => {
  const { slug } = useParams();
  const canonical = resolveCompetitorSlug(slug);
  if (!canonical) return <NotFound />;
  return <Navigate to={`/en/compare/${canonical}`} replace />;
};


const RedirectBridgeToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/bridge/${slug}`} replace />;
};

const RedirectTempleToEn = () => {
  const { slug } = useParams();
  return <Navigate to={`/en/temple/${slug}`} replace />;
};

const WhatsAppButtonWrapper = () => {
  const location = useLocation();
  const hideOnPaths = ["/en/lp/kickstarter"];
  if (hideOnPaths.some((path) => location.pathname.startsWith(path))) return null;
  return <WhatsAppButton />;
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

          {/* Hidden shop landing (noindex, not linked from nav) */}
          <Route path="/en/shop" element={<Shop />} />

          {/* Hidden badge host page for third-party directories (noindex) */}
          <Route path="/upvote" element={<Upvote />} />
          <Route path="/en/upvote" element={<Upvote />} />

          {/* Landing pages */}
          <Route path="/en/lp/why-glasses-fail" element={<AdvertorialPage />} />
          <Route path="/en/lp/wide-bridge-fit-guide" element={<WideBridgeFitGuide />} />
          <Route path="/en/lp/5-reasons" element={<ListiclePage />} />
          <Route path="/en/lp/kickstarter" element={<KickstarterPrelaunch />} />
          <Route path="/en/lp/kickstarter/vip-confirmed" element={<KickstarterVipConfirmed />} />
          <Route path="/en/products/007" element={<ProductPage007 />} />
          <Route path="/en/products/009" element={<ProductPage009 />} />
          <Route path="/en/products/bespoke" element={<ProductPageBespoke />} />
          {/* NL: native product URLs (avoid 301 to /en to preserve NL SEO signals) */}
          <Route path="/nl/products/007" element={<ProductPage007 />} />
          <Route path="/nl/products/009" element={<ProductPage009 />} />
          <Route path="/nl/products/bespoke" element={<ProductPageBespoke />} />
          {/* FR: native product URLs (avoid 301 to /en to preserve FR SEO signals) */}
          <Route path="/fr/products/007" element={<ProductPage007 />} />
          <Route path="/fr/products/009" element={<ProductPage009 />} />
          <Route path="/fr/products/bespoke" element={<ProductPageBespoke />} />
          <Route path="/en/about" element={<About />} />
          <Route path="/en/process" element={<Process />} />
          <Route path="/en/the-box" element={<TheBox />} />
          <Route path="/:lang/the-box" element={<Navigate to="/en/the-box" replace />} />
          <Route path="/:lang/process" element={<RedirectToEn to="/process" />} />
          <Route path="/en/bespoke" element={<Bespoke />} />
          <Route path="/en/bespoke/configurator" element={<BespokeConfigurator />} />
          <Route path="/:lang/bespoke/configurator" element={<Navigate to="/en/bespoke/configurator" replace />} />
          <Route path="/en/bespoke/scan" element={<BespokeScan />} />
          <Route path="/:lang/bespoke/scan" element={<BespokeScan />} />
          <Route path="/en/bespoke/checkout" element={<BespokeCheckout />} />
          <Route path="/:lang/bespoke/checkout" element={<Navigate to="/en/bespoke/checkout" replace />} />
          <Route path="/en/bespoke/measurements" element={<BespokeMeasurements />} />
          <Route path="/:lang/bespoke/measurements" element={<BespokeMeasurements />} />
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
          {/* One page per intent: the standalone blue-light URL folds into the collection route. */}
          <Route path="/en/blue-light-glasses-wide-faces" element={<Navigate to="/en/collections/blue-light-glasses-for-wide-faces" replace />} />
          <Route path="/blue-light-glasses-wide-faces" element={<Navigate to="/en/collections/blue-light-glasses-for-wide-faces" replace />} />
          <Route path="/en/collections/extra-large-oversized-eyeglasses" element={<ExtraLargeOversizedEyeglasses />} />
          <Route path="/en/collections/big-glasses-frames" element={<BigGlassesFrames />} />
          <Route path="/en/collections/oversized-prescription-glasses" element={<OversizedPrescriptionGlasses />} />
          <Route path="/en/collections/wide-frame-reading-glasses" element={<WideFrameReadingGlasses />} />
          <Route path="/en/collections/oversized-square-glasses" element={<OversizedSquareGlasses />} />
          <Route path="/en/collections/oversized-round-glasses" element={<OversizedRoundGlasses />} />
          <Route path="/en/collections/oversized-black-glasses" element={<OversizedBlackGlasses />} />
          <Route path="/en/collections/thick-frame-glasses" element={<ThickFrameGlasses />} />

          {/* Numeric size landing cluster (Part 1) */}
          <Route path="/en/size/:slug" element={<SizePage />} />
          <Route path="/:lang/size/:slug" element={<RedirectSizeToEn />} />

          {/* Numeric bridge landing cluster (Part 2) */}
          <Route path="/en/bridge/:slug" element={<BridgePage />} />
          <Route path="/:lang/bridge/:slug" element={<RedirectBridgeToEn />} />

          {/* Numeric temple-length landing cluster (Part 3) */}
          <Route path="/en/temple/:slug" element={<TemplePage />} />
          <Route path="/:lang/temple/:slug" element={<RedirectTempleToEn />} />

          {/* XXL / Wide-Face hub cluster (Part 4) */}
          <Route path="/en/xxl" element={<XxlHubPage />} />
          <Route path="/en/xxl/:slug" element={<XxlPage />} />
          <Route path="/:lang/xxl" element={<Navigate to="/en/xxl" replace />} />
          {/* Unknown /:lang/xxl/:slug: render NotFound rather than
              bouncing to the /en/xxl hub. Redirect-to-parent was a
              soft-404 for any invalid or non-EN slug. */}
          <Route path="/:lang/xxl/:slug" element={<NotFound />} />




          {/* Competitor comparison pages */}
          <Route path="/en/compare" element={<CompareIndex />} />
          <Route path="/en/compare/:slug" element={<ComparePage />} />
          <Route path="/:lang/compare" element={<Navigate to="/en/compare" replace />} />
          {/* A localized comparison URL that maps to a real competitor
              redirects to the English page (the cluster is English-only);
              anything else is a genuine 404. */}
          <Route path="/:lang/compare/:slug" element={<LocalizedCompareRedirect />} />


          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/collection" element={<Collection />} />
          <Route path="/:lang/blog" element={<BlogIndex />} />
          <Route path="/en/blog/category/nose-bridge-fit" element={<NoseBridgeFitHub />} />
          <Route path="/:lang/blog/category/nose-bridge-fit" element={<Navigate to="/en/blog/category/nose-bridge-fit" replace />} />
          {/* Non-EN blog posts: redirect legacy EN slugs to their translated slug */}
          <Route path="/de/blog/best-glasses-for-big-heads-2026" element={<Navigate to="/de/blog/beste-brillen-fuer-grosse-koepfe-2026" replace />} />
          <Route path="/de/blog/what-size-sunglasses-for-wide-faces" element={<Navigate to="/de/blog/welche-groesse-sonnenbrille-breites-gesicht" replace />} />
          <Route path="/nl/blog/best-glasses-for-big-heads-2026" element={<Navigate to="/nl/blog/beste-brillen-voor-brede-hoofden-2026" replace />} />
          <Route path="/nl/blog/what-size-sunglasses-for-wide-faces" element={<Navigate to="/nl/blog/welke-maat-zonnebril-voor-breed-gezicht" replace />} />
          <Route path="/fr/blog/best-glasses-for-big-heads-2026" element={<Navigate to="/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026" replace />} />
          <Route path="/fr/blog/what-size-sunglasses-for-wide-faces" element={<Navigate to="/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large" replace />} />
          <Route path="/fr/blog/beste-brillen-fuer-grosse-koepfe-2026" element={<Navigate to="/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026" replace />} />
          <Route path="/fr/blog/welche-groesse-sonnenbrille-breites-gesicht" element={<Navigate to="/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large" replace />} />
          <Route path="/fr/blog/beste-brillen-voor-brede-hoofden-2026" element={<Navigate to="/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026" replace />} />
          <Route path="/fr/blog/welke-maat-zonnebril-voor-breed-gezicht" element={<Navigate to="/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large" replace />} />
          <Route path="/:lang/blog/:slug" element={<BlogPost />} />
          <Route path="/en/hat-size-calculator" element={<HatSizeCalculator />} />
          <Route path="/:lang/hat-size-calculator" element={<HatSizeCalculator />} />
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
          <Route path="/thank-you" element={<ThankYouFb />} />
          <Route path="/thank-you-fb" element={<ThankYouFb />} />
          <Route path="/:lang/thank-you-fb" element={<ThankYouFb />} />
          <Route path="/:lang/payments" element={<Payments />} />
          <Route path="/:lang/crm" element={<NotFound />} />
          <Route path="/:lang/crm/acquisition" element={<NotFound />} />
          <Route path="/:lang/crm/gsc" element={<NotFound />} />

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
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

         <Route path="/unsubscribe" element={<Unsubscribe />} />

         {/* DE market SEO landing pages */}
         <Route path="/de" element={<DeHub />} />
         <Route path="/de/blaulichtfilter-brille-herren" element={<BlaulichtfilterBrilleHerren />} />
         <Route path="/de/:slug" element={<DeLandingRoute />} />

         {/* JA market SEO landing pages */}
         <Route path="/ja/big-face-glasses" element={<JaLandingRoute />} />
         <Route path="/ja/bespoke" element={<JaLandingRoute />} />

         {/* KO market pages — every /ko route is served from src/content/ko.
             Unregistered /ko paths 404; they never render the English shell. */}
         <Route path="/ko" element={<KoLandingRoute />} />
         <Route path="/ko/size/:width" element={<KoLandingRoute />} />
         <Route path="/ko/sunglasses" element={<KoLandingRoute />} />
         <Route path="/ko/guide/frame-size" element={<KoLandingRoute />} />
         <Route path="/ko/brands" element={<KoLandingRoute />} />
         <Route path="/ko/shipping" element={<KoLandingRoute />} />

         {/* FR market SEO landing pages */}
         <Route path="/fr" element={<FrHub />} />
         <Route path="/fr/lunettes-sur-mesure" element={<FrLandingRoute />} />

         {/* PL market SEO landing pages */}
         <Route path="/pl/okulary-na-zamowienie" element={<PlLandingRoute />} />
         <Route path="/pl/jak-dobrac-okulary-do-twarzy" element={<PlLandingRoute />} />

         {/* NL market SEO hub + landing pages */}
         <Route path="/nl" element={<NlHub />} />
         <Route path="/nl/acetaat-bril-op-maat" element={<NlLandingRoute />} />
         <Route path="/nl/grote-brillen-heren" element={<NlLandingRoute />} />



         <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
        <WhatsAppButtonWrapper />
      </BrowserRouter>
      <CookieBanner />
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
