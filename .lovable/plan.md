# Niemiecki lejek rezerwacji 1 EUR

## Cel
Umożliwić klientowi z Niemiec rezerwację Founders Edition za 1 EUR bez przechodzenia na angielską wersję, zachowując istniejący wygląd Woolet i nie zmieniając pozostałych rynków.

## Zakres zmian

1. **Jedno źródło cen dla Niemiec**
   - Dodać `DE_PRICING` z opłatą rezerwacyjną 1 EUR, ceną founding 109 EUR, ceną regularną 179 EUR, limitem 100 i podanym adresem Stripe.
   - Wszystkie nowe niemieckie ceny i schema pobierać z tego pliku oraz formatować jako `1 €`, `109 €`, `179 €` z `inkl. MwSt.`.

2. **Pięć niemieckich stron docelowych**
   - Zmienić główny przycisk w pierwszym ekranie na `Für 1 € reservieren`; pomiar twarzy pozostawić jako przycisk drugorzędny.
   - Budować link Stripe z `client_reference_id=de_{slug}` oraz `market=de`, bez opuszczania bieżącej karty.
   - Dodać mikrocopy i dwuwierszowe sygnały zaufania pod każdym przyciskiem rezerwacji.
   - Przebudować środkowe wezwanie do działania na rezerwację + opcjonalny wcześniejszy pomiar.
   - Dodać przed FAQ blok ceny: przekreślone 179 EUR, 109 EUR brutto, parametry produktu i rezerwacja 1 EUR.
   - Nie wyświetlać licznika miejsc, ponieważ nie ma potwierdzonego źródła rzeczywistego stanu.
   - Zachować formularz VIP jako alternatywę, zmienić nagłówek i dodać link do bezpośredniej rezerwacji.

3. **Śledzenie rezerwacji**
   - Przy każdym kliknięciu rezerwacji wygenerować jeden wspólny identyfikator zdarzenia.
   - Wysłać `Lead` do istniejącego toru Meta/GTM z `content_name: reservation_de`, `currency: EUR`, `value: 1` oraz odpowiadające zdarzenie GA4.
   - Zabezpieczyć pojedyncze kliknięcie przed podwójnym naliczeniem, bez zmiany samego przekierowania Stripe.

4. **Niemieckie treści i schema**
   - Zaktualizować dwie korzyści listy VIP na 109/179 EUR i darmową wysyłkę do Niemiec oraz UE.
   - Usunąć znaki półpauzy i pauzy z edytowanego niemieckiego bloku, zastępując je zwykłym `-`.
   - Ustawić niemiecką ofertę schema na 109.00 EUR, `PreOrder` i obowiązującą datę ważności ceny.
   - Ze względu na potwierdzone zasady pochodzenia zmienić wymagane zdanie na prawdziwe: `Mazzucchelli-Acetat, handgefertigt in der EU`, a nie `handgefertigt in Italien`.

5. **Impressum i Widerruf**
   - Dodać niemieckie strony `/de/impressum` i `/de/widerruf` w tym samym wizualnym stylu.
   - Impressum otrzyma podane dane JAY23 LLC, reprezentanta, e-mail i zapis zgodny z § 18 Abs. 2 MStV.
   - Widerruf otrzyma standardową 14-dniową informację dla rezerwacji i zamówienia oraz zapis o pełnym zaliczeniu i zwrocie 1 EUR.
   - Stopki niemieckich stron będą prowadzić do `Impressum · Datenschutz · Widerruf`, zawsze z prefiksem `/de/`.

6. **Niemiecka strona Kickstarter**
   - Dodać jawną trasę `/de/lp/kickstarter` przed ogólnym przekierowaniem językowym.
   - Zbudować niemiecką wersję na bazie istniejących elementów wizualnych strony Kickstarter, z jedynym głównym działaniem `Für 1 € reservieren` i cenami z `DE_PRICING`.
   - Pozostałe niemieckie adresy `/de/lp/*` nadal będą przekierowywane do angielskich odpowiedników.
   - Uzupełnić rejestr tras i metadane, aby stopka nie kierowała niemieckiego użytkownika na wersję EN.

7. **Indeksowanie i weryfikacja**
   - Dodać trzy nowe adresy DE do źródła tras, wygenerować sitemapę i manifest tras.
   - Dodać lub zaktualizować testy tras, linków wewnętrznych, cen i znaków interpunkcyjnych.
   - Sprawdzić typy i testy oraz widoki 375 px i desktop: główny przycisk nad linią zgięcia, poprawne zawijanie sygnałów zaufania, brak poziomego przewijania.
   - Zweryfikować kliknięcia rezerwacji i parametry Stripe bez wykonywania płatności.

## Pliki i odpowiedzialności techniczne
- Nowe: niemieckie ceny, dwie strony prawne, niemiecka strona Kickstarter.
- Aktualizowane: niemiecki landing, niemieckie tłumaczenia, routing, rejestr tras, metadane SEO, sitemap/manifest generowane, testy.
- Bez zmian: strony EN/PL/FR/JA, amerykańskie ceny, formularz i logika płatności angielskiego Kickstartera.
