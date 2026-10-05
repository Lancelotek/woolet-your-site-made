# SEO leftovers: structured data, fit timing, and legacy redirect files

## Changes
- Correct the sitewide Organization description from the obsolete 145–172 mm range to 145–160 mm, and check the static/prerender sources for duplicates.
- Replace the remaining FitLens “20 seconds” claim on `/en/fit` and any localized fit-page metadata or fallback content with the correct 60-second wording.
- Extend prerender output for legacy paths containing spaces so both encoded and literal directory variants are generated, and create a redirecting `/index.html` without `noindex`.

## Verification
- Regenerate the sitemap and run the project build.
- Inspect built redirect files for canonical, refresh, JavaScript replacement, destination, and absence of `noindex`.
- Grep built `dist/` for `172 mm`, `145 to 172`, `145–172`, `20 Seconds`, `20 seconds`, and `Greece`; report any legitimate remaining matches.

## Technical details
- Keep `src/seo/legacyRedirects.ts` as the only redirect map.
- Change only SEO metadata and generated redirect behavior; no visible design, routing-worker, payment, or tracking changes.
