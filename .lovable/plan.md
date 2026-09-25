# Punkty 6–7 i poprawka stron porównawczych

## Zakres

### 1. Poprawka ceny na stronach porównawczych
- Na obu stronach Persol i Zenni zastąpić krótką linię przy „From $190” pełnym zdaniem: sklep jest wyprzedany do końca kampanii Kickstarter, a rezerwacja $1 blokuje cenę founding member $114.
- Nie zmieniać tytułów, opisów ani pozostałej treści tych stron.

### 2. Dziesięć bloków odpowiedzi dla AI Overviews
Dla wskazanych 10 angielskich wpisów:
- dodać bezpośrednio pod H1 blok oznaczony „Quick answer”, przed byline i wstępem;
- napisać 40–60 słów, zaczynając od bezpośredniej odpowiedzi z istniejącą liczbą w mm, bez nazwy Woolet w pierwszym zdaniu;
- zapewnić każdemu wpisowi co najmniej jedną prawdziwą tabelę HTML z jednostkami w nagłówkach; zachować istniejące dobre tabele, a dodać tabelę tylko tam, gdzie jej brakuje;
- przeformułować wybrane nagłówki H2 na naturalne pytania i rozpocząć odpowiedź pod każdym zmienionym H2 od zdania odpowiadającego wprost;
- dodać jeden kontekstowy link do `/en/collections/extra-wide-glasses`, z 10 zróżnicowanymi anchorami, z których żaden nie wystąpi więcej niż trzy razy;
- ustawić `dateModified` na `2026-09-25` tylko dla tych 10 zmienionych wpisów, bez zmiany `datePublished`, title, meta description ani URL.

### 3. Jedna główna strona „extra wide”
- Rozbudować `/en/collections/extra-wide-glasses` o unikalną treść i FAQ przejęte tematycznie ze starej strony, bez duplikowania akapitów.
- Dodać pod H1 krótki blok „What counts as extra wide glasses?” z wartościami 150 mm, 155 mm i 158 mm.
- Dodać semantyczną tabelę HTML szerokości z jednostkami w nagłówkach.
- Zachować `/en/collections/big-glasses-frames` i jej frazę bez zmian.

### 4. Konsolidacja starej strony kolekcji
- Ustawić canonical prerenderu `/en/collections/extra-large-oversized-eyeglasses` na `https://woolet.co/en/collections/extra-wide-glasses`.
- Usunąć tę starą stronę z generowanej sitemap.xml.
- Usunąć linki do niej z treści, wspólnej listy kolekcji, stopki i źródeł publicznych; nie usuwać samej trasy.
- Dopisać parę `/en/collections/extra-large-oversized-eyeglasses` → `/en/collections/extra-wide-glasses` wyłącznie do istniejącego planu punktu 2, bez wdrażania przekierowania.

## Pliki przewidziane do zmiany
- `src/pages/ComparePage.tsx`
- `src/pages/BlogPost.tsx`
- `src/lib/blog-data.ts`
- `src/lib/blog-data-en-fit.ts`
- `src/pages/collections/ExtraWideGlasses.tsx`
- `src/pages/collections/ExtraLargeOversizedEyeglasses.tsx`
- `src/components/CollectionPage.tsx`
- `src/pages/collections/BigGlassesFrames.tsx`
- `src/components/Footer.tsx` — tylko jeśli potwierdzi się bezpośredni link do starej strony
- `src/seo/metadata.ts`
- `scripts/generate-sitemap.mjs`
- `public/llms.txt` — tylko usunięcie linku do starej strony
- `.lovable/plan/legacy-redirects-and-shared-route-source-o2o-2026-09-25.md`
- `roadmap.md`

## Weryfikacja
- Zbudować prerender i odczytać gotowy HTML bez JavaScriptu dla 10 wpisów, obu stron compare i obu kolekcji.
- Potwierdzić w prerenderze położenie „Quick answer”, obecność tabel, 10 linków kontekstowych oraz `dateModified: 2026-09-25` przy niezmienionym `datePublished`.
- Pokazać pierwsze zdanie każdego bloku, mapę wpis → anchor, canonical starej kolekcji, pusty grep starego sluga w sitemapie i zdanie rezerwacyjne z obu stron compare.
- Uruchomić testy powiązane z SEO/prerenderem i sprawdzić końcowy wynik kompilacji.

## Granice
- Bez zmian w Workerze, konfiguracji tras aplikacji, `wrangler.toml` i DNS.
- Bez zmian URL-i, title i meta description 10 wpisów.
- Bez zmian strony `/en/collections/big-glasses-frames` poza usunięciem pojedynczego linku prowadzącego do konsolidowanej strony, jeśli taki link istnieje.
