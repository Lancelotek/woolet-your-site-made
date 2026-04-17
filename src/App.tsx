import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index.tsx";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy.tsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const FitWizard = lazy(() => import("./pages/FitWizard.tsx"));
const ThankYou = lazy(() => import("./pages/ThankYou.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdvertorialPage = lazy(() => import("./pages/lp/AdvertorialPage.tsx"));
const ListiclePage = lazy(() => import("./pages/lp/ListiclePage.tsx"));
const ProductPage007 = lazy(() => import("./pages/products/ProductPage007.tsx"));
const ProductPage009 = lazy(() => import("./pages/products/ProductPage009.tsx"));
const About = lazy(() => import("./pages/About.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
      <Toaster />
      <Sonner />
      <CookieConsent />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          {/* Root redirects to /en */}
          <Route path="/" element={<Navigate to="/en" replace />} />

          {/* Landing pages */}
          <Route path="/en/lp/why-glasses-fail" element={<AdvertorialPage />} />
          <Route path="/en/lp/5-reasons" element={<ListiclePage />} />
          <Route path="/en/products/007" element={<ProductPage007 />} />
          <Route path="/en/products/009" element={<ProductPage009 />} />
          <Route path="/en/about" element={<About />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/blog" element={<BlogIndex />} />
          <Route path="/:lang/blog/:slug" element={<BlogPost />} />
          <Route path="/:lang/fit" element={<FitWizard />} />
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
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
