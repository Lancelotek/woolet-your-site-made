# Punkt 2 - przekierowania legacy i wspólne źródło tras

Plan do wdrożenia dopiero po uruchomieniu O2O. Do tego czasu nie zmieniać Workera, tras, `wrangler.toml` ani DNS.

## Przekierowania
- `/Home/Blog` -> `/en/blog`
- `/Home/Fit` -> `/en/fit`
- `/Home/Fit Guide` -> `/en/fit`
- `/Home/Fit%20Guide` -> `/en/fit`; Worker powinien dopasować zarówno surowy, jak i bezpiecznie zdekodowany pathname.
- `/brille-breite-160-mm` -> `/de/brille-breite-160-mm`
- `/about-us` -> `/en/about`
- `/collections/all-products` -> `/en/collection`
- `/blog/what-does-a-smart-wallet-do` -> `/en/about`
- `/blogs/news/*` -> `/en/about`; dodać regułę prefiksową przed kontrolą znanej trasy, obejmującą `/blogs/news` i każdy segment podrzędny, bez przechwytywania podobnych ścieżek.

## Walidacja celów
Wszystkie cele są obecnie znane walidatorowi `build-bundle.mjs`: znajdują się w prerenderze lub `route-manifest.json`. Po dodaniu wpisów uruchomić budowę paczki Workera; istniejący test `isKnownAtBuild()` ma odrzucić każdy cel, który nie zwraca strony 200. Regułę prefiksową należy objąć tym samym sprawdzeniem celu `/en/about`, mimo że nie mieści się w pliku exact JSON.

## Jedno źródło listy tras
1. Utworzyć jeden deklaratywny katalog tras z polami `path`, `prerender`, `indexable`, `dynamic` i `asset` oraz opcjonalnym wzorcem parametrów.
2. Z tego katalogu generować `public/route-manifest.json`, listę prerendera i dane pakowane do Workera.
3. Usunąć ręczne odpowiedniki `EXTRA_ROUTES` i `DYNAMIC_ROUTES`; `PRERENDERED` pozostawić wyłącznie jako wygenerowaną mapę HTML, nie jako niezależny rejestr adresów.
4. Dodać kontrolę budowy: każda trasa aplikacji musi istnieć w katalogu, każdy prerender musi mieć wpis, a każdy cel 301 musi rozwiązywać się do znanej strony 200.
5. Zachować osobne zasady dla plików statycznych i `/api/`, obecne 301 dla końcowego ukośnika oraz prawdziwe 404 dla nieznanych dokumentów.