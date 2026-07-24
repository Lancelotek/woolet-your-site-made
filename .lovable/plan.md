## Cel

Zbudować holenderską warstwę SEO na parytecie z DE, żeby ~60% ruchu z NL do `/en` konwertowało lepiej na natywnym `/nl`.

## Zakres tej tury (potwierdzony)

1. **Hub `/nl`** — dedykowana strona listująca istniejące NL landing pages, wzorowana na `DeHub`.
2. **2 blogi NL** (tłumaczenia z DE dla spójności — te same posty, które już się dobrze indeksują):
   - `beste-brillen-voor-brede-hoofden-2026` (odpowiednik `best-glasses-for-big-heads-2026`)
   - `welke-maat-zonnebril-voor-breed-gezicht` (odpowiednik `what-size-sunglasses-for-wide-faces`)
3. **`/nl/products/007`, `/nl/products/009`, `/nl/products/bespoke`** — routing, żeby przestały robić 301 do `/en`. Strony renderują istniejące komponenty (`ProductPage007/009/Bespoke`) z `lang="nl"` z URL. Tylko meta/H1/CTA copy zostaje przetłumaczone; reszta UI już jest sterowana przez `t(lang, …)` w `i18n.ts` (NL translations są kompletne).
4. **`/nl/collection`** — audyt: strona już istnieje przez `/:lang/collection`. Uzupełnić brakujące klucze NL w `i18n.ts` jeśli jakieś wyjdą (spot check).
5. **SEO wiring**: hreflang (`nl`, `nl-NL`, `nl-BE`), sitemap, redirect z EN slugów blogów na non-NL, meta title/description w `blog-meta.ts`, JSON-LD Article/FAQ/Breadcrumb (już obsługiwane w `BlogPost.tsx`).

## Poza zakresem (świadomie)

- Tłumaczenie *treści* stron produktowych (`ProductPage007/009`) — copy jest w większości hardkodowane po angielsku. Pełna i18n wymaga osobnej tury (kilkaset stringów). W tej turze produkty NL dostają natywny URL, poprawny `<html lang="nl">`, hreflang i lokalne meta, ale body pozostaje po angielsku (lepsze niż redirect, ale nie idealnie).
- Tłumaczenie kolekcji collection.tsx — bazuje na `i18n.ts` i NL translations już są.
- Pozostałe 2 blogi z EN katalogu (poza parytetem z DE).

## Techniczna realizacja

**Nowe pliki:**
- `src/lib/blog-data-nl.ts` — 2 posty NL (tłumaczone przez `lovable_ai.py` skrypt Gemini z DE, ręczna redakcja tytułów/H1).
- `src/pages/nl/NlHub.tsx` — mirror `DeHub.tsx` z holenderskim copy.

**Edytowane:**
- `src/lib/blog-data.ts` — dodać `nl: blogPostsNL` do mapy.
- `src/lib/blog-slug-map.ts` — dodać `nl` do dwóch grup slugów.
- `src/lib/blog-meta.ts` — dodać `metaTitle`/`metaDescription` dla 2 slugów NL.
- `src/App.tsx`:
  - Nowa trasa `/nl` → `NlHub` (przed `/:lang` catch-all — jak DE).
  - Legacy EN slug redirects: `/nl/blog/best-glasses-for-big-heads-2026` → NL slug (i drugi).
  - Wykluczyć `nl` z `RedirectProductToEn`: dodać jawne `/nl/products/007|009|bespoke` przed generic `/:lang/products/:slug`.
- `public/sitemap.xml` — dodać hreflang `nl` do klastrów, wpis dla `/nl` huba, 2 blogów NL, 3 produktów NL.
- `public/robots.txt` — bez zmian (już zezwala).

**Struktura routes w App.tsx (kolejność):**
```
/nl                          → NlHub                 (nowe, przed /:lang)
/nl/products/007|009|bespoke → ProductPageXxx        (nowe, przed /:lang/products)
/nl/blog/<legacy>            → Navigate do NL slugu  (nowe)
… reszta istniejących route bez zmian …
```

## Weryfikacja

- `bunx tsgo` — czysto.
- Ręcznie: `/nl`, `/nl/blog/beste-brillen-voor-brede-hoofden-2026`, `/nl/products/007`, `/nl/collection` renderują się z `<html lang="nl">` i poprawnymi meta.
- Test `src/test/de-internal-links.test.ts` — zaadaptować szybko dla NL (opcjonalnie w kolejnej turze).

## Ryzyko

- Tłumaczenia LLM (~2000 słów × 2) mogą wymagać ręcznej korekty tytułów CTA/H1 — zrobię pass po generacji.
- Strony produktowe NL renderują angielski body — akceptowalne w tej turze, oznaczyć jako TODO na następną iterację.
