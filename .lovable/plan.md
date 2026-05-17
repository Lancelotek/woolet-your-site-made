## Cel

Dostarczyć priorytetowe strony SEO z planu (wide face glasses, italian acetate sunglasses, oversized sunglasses men + blog post + wzmocnienie 009/007) w obecnym Vite SPA, korzystając z istniejącego `scripts/prerender.mjs` jako "SSR-equivalent" dla crawlerów.

## Zakres

### 1. Nowe strony kolekcji (SEO landing/category)

Każda jako osobna trasa w `/en/`, z `<SEO>` (Helmet), unikalnym H1, 600–900 słów treści, FAQ (FAQPage JSON-LD), BreadcrumbList JSON-LD, CTA do 007/009/fit-scan, wewnętrzne linki.

- `/en/collections/wide-face-glasses` — primary target: "wide face glasses" / "glasses for wide faces / big heads"
- `/en/collections/italian-acetate-sunglasses` — target: "italian acetate sunglasses", podkreślenie Mazzucchelli
- `/en/collections/oversized-sunglasses-men` — target: "oversized sunglasses men", 155/158/161 mm + bespoke

### 2. Wzmocnienie istniejących product pages

`ProductPage007.tsx` i `ProductPage009.tsx`: dopisać Product JSON-LD per-page (offers, brand, material, size variants 155/158/161), FAQ JSON-LD, breadcrumbs. Upewnić się, że H1 zawiera wide-face keyword.

### 3. Nowy blog post

`src/lib/blog-data.ts` — dodać EN post: "How to Find Glasses That Fit a Wide Face (155 mm+ Guide)" z pełną treścią ~1200 słów, Article JSON-LD już obsługiwane przez `SEO.tsx`.

### 4. Routing + prerender

- Dodać 3 trasy kolekcji do `src/App.tsx`.
- Rozszerzyć `scripts/prerender.mjs` `BASE_ROUTES` o nowe kolekcje (product pages i blog są już objęte).

### 5. Sitemap

`public/sitemap.xml` — dopisać nowe URL z odpowiednim `lastmod` i `priority`. Sprawdzić czy nie ma generatora (jeśli plik statyczny — edycja ręczna).

### 6. llms.txt

`public/llms.txt` i `public/llms-full.txt` — dodać sekcje dla nowych kolekcji (krótki opis + URL), żeby AI crawlery miały streszczenie.

### 7. Wspólny komponent

`src/components/CollectionPage.tsx` — jeden szablon dla 3 kolekcji (hero, intro, sizes block, product cards 007/009, FAQ accordion, CTA, trust strip), żeby nie duplikować JSX.

## Z czego rezygnujemy vs oryginalny prompt

- **Brak migracji do Next.js / App Router** — prerender daje ten sam efekt dla crawlerów; user to zaakceptował.
- **Brak SSR-only features** (np. server actions, dynamic OG images per route) — używamy istniejącego `og-image.png`.
- **Brak nowego layoutu nawigacji** — kolekcje wpinamy w istniejący `Navbar`/`Footer`.

## Co NIE zmieniamy

- `fit-scan` flow, branding, i18n, integracje Shopify/analytics/MailerLite, Cookie banner, redirects, istniejące blog posts.
- `src/integrations/supabase/*`, `scripts/prerender.mjs` (tylko dopisanie tras do `BASE_ROUTES`).

## Techniczne szczegóły

- JSON-LD per route: rozszerzyć `SEO.tsx` o opcjonalne `jsonLd?: object | object[]` prop (Collection, FAQPage, BreadcrumbList) zamiast hardcodować w komponentach stron.
- Wszystkie trasy tylko EN (zgodnie z prompt: target jest US/EN).
- Tonacja: premium-restraint, zgodnie z brand voice; copy będzie draftem do późniejszego review.
- Compliance: zero fake reviews/star ratings/„Made in Italy" — tylko „Italian Mazzucchelli acetate" (ok).

## Kolejność wykonania

1. Rozszerzyć `SEO.tsx` o `jsonLd` prop.
2. Stworzyć `CollectionPage.tsx` (template).
3. Stworzyć 3 pliki stron w `src/pages/collections/`.
4. Wpiąć do `App.tsx`.
5. Dodać blog post do `blog-data.ts`.
6. Wzmocnić Product JSON-LD w 007/009.
7. Zaktualizować `prerender.mjs`, `sitemap.xml`, `llms.txt`, `llms-full.txt`.
8. Build + sprawdzić, że prerender wypluwa HTML dla nowych tras.