# Woolet Our story

## Page
- Build `/en/our-story` as a calm editorial long-read with the supplied copy unchanged, existing header/footer, restrained gold emphasis and Woolet brand-book typography.
- Show all five supplied wallet photos plus the existing founder portrait. Save exact JPG names and WebP versions in `public/images`; set dimensions and lazy-load all except the collection hero.
- End with the existing signup destination (`/en/lp/kickstarter`), the requested button wording, `/en/fit` text link and founder signature. No prices or payment asks on this page.
- Add “Our story” to English footers only; leave main navigation unchanged.

## Search and AI references
- Register the page in the existing sitemap/prerender metadata pipeline with exact title/description, canonical and complete crawler-visible story HTML.
- Add AboutPage schema referencing the existing Woolet Organization identity. Update that Organization’s description and founder spelling consistently, without duplicating it on the story page.
- Replace outdated brand-history paragraphs in both AI reference files with the owner-approved facts and story URL.

## Technical details
- Keep story copy and photo metadata in one shared source consumed by the page and crawler metadata, preventing copy drift.
- Use the existing Button component and signup link; do not change forms, tracking, checkout, redirect maps, Worker or DNS.
- The explicit `public/images` destination takes precedence over the usual CDN-pointer image flow.
- Reuse the site layout and semantic colour tokens; scope Newsreader/Archivo typography to this new page, without changing other pages.

## Verification
- Check exact copy, image names/ALT/dimensions, English footer link, CTA destinations, Organization identity and crawler HTML with focused tests.
- Check desktop and mobile rendering and the automatic build’s generated sitemap/prerender output.
- Report changed files and verification results. Do not publish.