# Ujednolicenie zakresu Bespoke do 145-172 mm

## Cel
Usunąć ze wszystkich widocznych treści, tłumaczeń i danych dla wyszukiwarek błędne informacje, że Woolet Bespoke zaczyna się od 150 mm. Jedynym zakresem frontu Bespoke będzie 145-172 mm.

## Zakres zmian

1. **Wspólne treści i tłumaczenia**
   - Poprawić wszystkie warianty zapisu starego zakresu i progu Bespoke w tekstach angielskich, niemieckich, polskich, francuskich, japońskich, hiszpańskich, włoskich i arabskich.
   - Objąć słowniki, strony Bespoke i FitLens, tabelę rozmiarów, kolekcje, landing pages, treści blogowe oraz stronę rezerwacji.
   - Zachować istniejący styl separatora i jednostek w każdym tekście.

2. **Logika opisowa i poradnik Bespoke**
   - Przepisać zdania, w których 150 mm jest przedstawione jako dolny próg Woolet Bespoke.
   - Jasno rozdzielić zakres seryjny 007/009: front 158 mm, twarze 155-161 mm, od zakresu Bespoke 145-172 mm.
   - Uzupełnić tabelę poradnika tak, aby zaczynała się od 145 mm.

3. **SEO i pliki dla wyszukiwarek**
   - Poprawić tytuły, opisy, FAQ, JSON-LD, dodatkowe właściwości rozmiaru oraz `llms.txt`, `llms-full.txt`, `pricing.txt` i właściwe metadane w `index.html`.
   - Zachować obecny docelowy adres poradnika zawierający `145-172mm`, zgodnie z wybraną opcją.
   - Pozostawić dawny adres z `150-172mm` wyłącznie jako przekierowanie; nie zmieniać innych tras ani adresów w sitemapie.

4. **Pochodzenie produkcji**
   - Usunąć każde twierdzenie, że oprawki lub Bespoke są wykonane we Włoszech.
   - Stosować zgodny fakt: włoski acetat Mazzucchelli, oprawki wykonywane ręcznie w Grecji (UE).
   - Nie zmieniać poprawnych opisów pochodzenia samego acetatu z Mediolanu.

5. **Kontrola zakresu**
   - Nie zmieniać rynkowych i konkurencyjnych użyć 150 mm.
   - Nie zmieniać wymiarów modeli 007/009, mostków, zauszników, cen, układu ani stylów.
   - Zachować test regresyjny, który celowo zawiera stare warianty jako zakazane wzorce.

## Weryfikacja

- Uruchomić pełne wyszukiwanie wariantów starego zakresu i ręcznie sklasyfikować każdy pozostały wynik.
- Sprawdzić strony `/en/bespoke`, `/en/fit/bespoke`, macierz rozmiarów, poradnik Bespoke, `/pl/okulary-na-zamowienie`, `/fr/lunettes-sur-mesure` i `/ja/bespoke`.
- Potwierdzić, że poradnik pod obecnym adresem `145-172mm` otwiera się i ma nagłówek 145-172 mm, a stary adres przekierowuje.
- Uruchomić test typu, test zakresu Bespoke oraz właściwe testy SEO/tras.
