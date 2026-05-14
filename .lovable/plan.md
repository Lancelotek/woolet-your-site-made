## The honest situation

Woolet is a **Vite + React Router SPA**. There is no SSR runtime in Lovable's hosting layer — every URL serves the same `index.html` with `<div id="root"></div>` and lets the browser hydrate. That's exactly why crawlers see 5 KB of empty shell.

There is no zero-cost fix. SSG/prerender requires either restructuring the routing layer or adding a headless build step. Below are three viable paths, ordered by **time-to-ship vs. coverage**.

---

## Option A — Hand-rolled prerender at build time (recommended)

Add a Node script that runs after `vite build`:
1. Spins up `vite preview` on a local port.
2. For each target route (`/en`, `/en/about`, `/en/products/007`, `/en/products/009`, all `/en/blog/*`), launches headless Chromium via Playwright, waits for hydration + Helmet to flush, snapshots `document.documentElement.outerHTML`.
3. Writes the snapshot to `dist/<route>/index.html`.

Lovable's static hosting then serves `dist/en/about/index.html` directly when a crawler requests `/en/about`. The SPA fallback still kicks in for any unknown route, and the React app re-hydrates on top of the snapshot for real users — no behaviour change.

**Pros**
- Zero refactor of `App.tsx`, route components, or `main.tsx`. All client code (MediaPipe, GTM, Supabase, sessionStorage) keeps working unchanged.
- Helmet's per-route `<title>`, meta description, canonical, and JSON-LD all land in the static HTML — automatically fixes S3, S6, S7, S8 (per-route titles + Product/Article schema) at the same time.
- Easy to extend (add a route to a list).

**Cons**
- Build time grows by ~30–60 s for ~12 routes.
- Requires Playwright + chromium in the build environment. Playwright is already a dependency in `package.json`; the chromium binary needs `npx playwright install chromium` before build, which may or may not be cached in Lovable's hosting CI. If it isn't, builds fail and we'd need to fall back to Option B.
- Hydration mismatches: any component that reads `Date.now()`, `Math.random()`, or `navigator` at render (not in `useEffect`) will warn. We'd suppress with `suppressHydrationWarning` where needed.

---

## Option B — Migrate to `vite-react-ssg`

Replace `vite build` with `vite-react-ssg build`. This is the "proper" SSG path.

Required changes:
1. Convert routes in `App.tsx` to a data-router array exported from a routes module.
2. Add `src/entry-client.tsx` and `src/entry-server.tsx`.
3. Add `<!--app-html-->` and `<!--app-head-->` markers to `index.html`.
4. Audit every page + component for SSR-unsafe code at module/render level: `navigator`, `window`, `sessionStorage`, `document`, the `componentTagger` Vite plugin, the dev `gtm.ts` script tag injector, MediaPipe import side effects in `FitWizard.tsx`, etc. Wrap each in `typeof window !== "undefined"` guards or move to `useEffect`.
5. Update `main.tsx` to call `ViteReactSSG`'s hydrate helper instead of `createRoot`.
6. Update `package.json` build script.

**Pros**
- Real SSG with no headless browser. Builds are fast and deterministic.
- Better long-term maintenance.

**Cons**
- 1–2 days of refactor + bug-hunting. Risk of regressions in client-only flows (Fit Wizard camera, modals, GTM events, sticky CTA, popup timing) until every SSR-unsafe path is fixed.
- Lazy-loaded routes (`React.lazy`) need to be replaced with `vite-react-ssg`'s lazy variants.

---

## Option C — Hand-author static stubs in `public/`

Write `public/en/about/index.html`, `public/en/products/007/index.html`, etc. by hand, each with the full SEO content, JSON-LD, OG tags, and the standard `<div id="root">` + script tags. Vite's static handler serves these before falling back to SPA.

**Pros**
- Zero build pipeline changes.
- Ship in one turn.

**Cons**
- Content lives in two places (HTML stub + React component) and will drift.
- Brittle for blog posts (7 EN + 7 PL = 14 hand-maintained HTML files).
- Loses the per-component SEO logic in `SEO.tsx`.

I do not recommend this for blog posts; only acceptable as a stopgap for the 4 fixed routes.

---

## My recommendation

**Option A.** It's the only path where:
- Crawlers see the exact rendered HTML real users see (including all the per-page Helmet tags, Product/Article JSON-LD, and OG metadata you've already authored in `SEO.tsx`).
- Nothing in the React app needs to be rewritten.
- The fix scales to future blog posts by adding a slug to a list.

The Playwright-in-CI question is the one real risk. If Lovable's hosting build can't install chromium, we fall back to a `puppeteer-core` + `@sparticuz/chromium` flow (smaller binary, designed for serverless), or to Option C for the 4 static routes only.

---

## Plan if you approve Option A

1. Add `scripts/prerender.mjs`:
   - Reads the route list (4 fixed routes + dynamic blog slugs from `src/lib/blog-data.ts`).
   - Starts `vite preview` on a free port.
   - Launches Playwright chromium, visits each route with `waitUntil: "networkidle"`, waits for `document.title` to differ from the SPA shell, snapshots `outerHTML`.
   - Writes `dist/<route>/index.html` and a sibling `dist/<route>/` directory if needed.
   - Tears down preview server.
2. Add `postbuild` script in `package.json`: `"postbuild": "node scripts/prerender.mjs"`.
3. Add `npx playwright install chromium --with-deps` to a `prebuild` step (or skip and rely on the existing playwright dev dependency if chromium is already cached).
4. Add a tiny `useIsomorphicLayoutEffect` guard pattern to any component that reads `navigator`/`window` synchronously during render (`Index.tsx` currently does on lines 51–54 — this is the one place I already see).
5. Verify locally: `npm run build && curl http://localhost:4173/en/about | grep "<title>"` should show the page-specific title, not the homepage one.
6. Republish, rescan SEO findings.

If you want Option B (full migration) or Option C (stopgap stubs) instead, say which and I'll implement that path.
