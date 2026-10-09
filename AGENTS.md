- Multi-touch journey (first/last/10 touches) lives in src/lib/journey.ts (localStorage wlt_attr, memory-only for EU until analytics consent); flows into Stripe metadata via getGaCheckoutMetadata and into signups via getAttribution — one place feeds every checkout and form.
- GA4_API_SECRET is server-side only: use it exclusively in supabase/functions/payments-webhook, never in client code, .env files, or committed files, and never print secret values in chat.
- Kickstarter signup's paid decision view renders in a body portal so it can occupy the screen independently of any of the three signup locations; the existing checkout button owns the session and tracking to avoid duplicate events.
- Redirects live only as data in src/seo/legacyRedirects.ts + src/seo/routeRedirects.ts (no new <Navigate> routes); router and prerender stubs both consume them, and scripts/audit-routes.mjs fails the build when an App.tsx path would serve the noindex fallback — Google never sees client-side redirects.
- hreflang comes only from src/i18n/routeRegistry.ts (prerender head, Helmet via seo/hreflangLinks, sitemap); the registry drops non-reciprocal clusters and generate-sitemap fails the build on any one-way pair — Google ignores non-reciprocal annotations.
- Blog posts may opt into exactContent to suppress automatic waitlist insertions, and an author override feeds static Article schema; this preserves approved editorial copy and bylines across rendering paths.
- Prerendered blog month placeholders resolve from the rendered route's slug and are validated before route writes; unresolved blogModifiedMonthLabel values must exit non-zero to prevent incomplete crawler bylines.
- Prerendered head tags are removed only after Helmet writes equivalents (src/lib/strip-prerender-seo.ts MutationObserver) — avoids an empty head on lazy routes.

- Image derivatives are indexed in src/data/optimized-images.json and selected through src/lib/optimized-image.ts; CDN pointers preserve originals for zoom while thumbnails and responsive galleries use smaller WebP files.
- Stripe.js is dynamically imported by getStripe; reservation buttons mount only in the payment step and create sessions only on a visitor tap, preserving checkout attribution.
- Route image preloads are emitted by scripts/prerender.mjs and matching Helmet tags; the shared SPA shell never preloads a route-specific hero.
- Self-hosted fonts used by the app live in src/assets/fonts and are referenced relatively from CSS and index.html so Vite fingerprints them without host-header dependencies; legacy public copies remain compatible.

- FitScan initializes its mobile breakpoint before first paint and reserves panel height; other consumers of useIsMobile retain the existing initialization behavior.
- A new page is registered in src/seo/metadata.ts (STATIC_ROUTES + a getMetadata case) so scripts/prerender.mjs, the sitemap generator and the route manifest all see it; a case that sets meta.robots to a noindex value is dropped from sitemap.xml automatically and its noscriptHtml carries the content crawlers should read.
