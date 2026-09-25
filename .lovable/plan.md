# Punkt 3: jedno źródło prawdy dla AI

## Zakres wdrożenia
- Ujednolicić `public/llms.txt`, `public/llms-full.txt` i `public/pricing.txt` według briefu, z potwierdzoną długością zauszników Signature **150 mm**.
- Zastąpić narrację o „niepowiązanej” marce kanoniczną historią: Woolet zaczęło w 2015 jako smart wallet, zebrało $332K na Kickstarterze, produkt zakończono w 2016, a eyewear jest drugim rozdziałem tej samej marki i tego samego założyciela, Marka Ciesli, uruchomionym w 2026.
- Ujednolicić Signature: 007 Round/Panto i 009 Soft Square, front 158 mm, mostek keyhole 21/22 mm, zauszniki 150 mm, zakres twarzy 155-161 mm, kolory Black/Havana/Silver Clear.
- Ujednolicić Bespoke: front 145-172 mm, mostek 20-24 mm, zauszniki 145-155 mm, $480 regularnie, $299 dla backerów Kickstarter, 2 tygodnie produkcji od akceptacji modelu 3D, standardowe soczewki korekcyjne i wysyłka światowa w cenie, 10-letnia gwarancja.
- Ujednolicić sprzedaż: MSRP $190; Founding Member $114, gdzie rezerwacja $1 blokuje cenę i oznacza 40% zniżki; sklep `shop.woolet.co` wyprzedany do końca kampanii, bieżące zamówienia jako rezerwacja na `woolet.co`.
- Ujednolicić materiał: Italian Mazzucchelli acetate, hand made in EU; bez twierdzenia „made in Italy”.
- Zaktualizować datę „Last updated” na 2026-09-25.
- Zaktualizować główny JSON-LD Organization: `foundingDate: 2015` i kanoniczny opis historii marki oraz produktów.
- Zaktualizować `/en/about` tą samą historią i dokładnymi parametrami obu modeli.
- Nie zmieniać Workera, tras, DNS ani konfiguracji Cloudflare.

## Weryfikacja
- Sprawdzić typy/testy dotyczące SEO oraz wynik kompilacji podglądu.
- Pokazać wyniki wyszukiwania `148`, `162` i `unrelated` w `public/llms*.txt`, rozróżniając dozwolone wzmianki o szerokościach konkurencji i stronach 162 mm od błędnych wzmianek o zausznikach lub maksymalnym zakresie Bespoke.
- Potwierdzić brak `148 mm` jako długości zauszników Signature, brak `162 mm` jako maksimum Bespoke i brak słowa `unrelated`.

## Punkt 2 - plan na późniejsze wdrożenie z przepięciem domeny

### Nowe przekierowania w `legacy-redirects.json`
- `/Home/Blog` -> `/en/blog`
- `/Home/Fit` -> `/en/fit`
- `/Home/Fit Guide` -> `/en/fit` (wariant `%20` obsłuży zdekodowanie pathname)
- `/brille-breite-160-mm` -> `/de/brille-breite-160-mm`
- `/about-us` -> `/en/about`
- `/blogs/news/*` -> `/en/about` jako reguła prefiksowa/wzorcowa, nie pojedynczy wpis exact
- `/collections/all-products` -> `/en/collection`
- `/blog/what-does-a-smart-wallet-do` -> `/en/about`

### Wspólne źródło tras
- Wyprowadzić generator kanonicznego manifestu tras do jednego modułu danych używanego podczas generowania `public/route-manifest.json` i paczki Workera.
- Worker ma konsumować wygenerowany manifest zamiast utrzymywać ręcznie drugą listę `PRERENDERED`/`EXTRA_ROUTES`/`DYNAMIC_ROUTES`.
- Prerender, sitemap i Worker mają filtrować ten sam manifest przez jawne flagi typu `prerender`, `indexable`, `dynamic` i `asset`, zachowując pliki statyczne oraz `/api/` bez zmian.
- Zachować istniejące 301 trailing-slash i prawdziwe 404 dla nieznanych ścieżek dokumentów; wdrożyć dopiero razem z aktywnym ruchem gołej domeny przez Worker po uruchomieniu O2O.
