# woolet-route-server (Cloudflare Worker)

Sits in front of the Lovable origin. Every request is passed through; the Worker
only (a) issues the www/trailing-slash/`/`→`/en`/legacy/localized-EN-only 301s and
(b) changes the status to 404 (+ noindex, no canonical/og:url/hreflang) for
document paths that are not in the known-route set.

The known-route set (`src/known-routes.ts`, generated, gitignored) is built by
`npm run build` → `build-bundle.mjs` from `src/seo/routeCatalog.ts`, the same
catalog used by prerender and audit-routes. The build fails when any App.tsx
route, prerender route, sitemap URL or legacy redirect target is not known.

Tests: `bunx vitest run src/test/worker-route-server.test.ts` (repo root).
