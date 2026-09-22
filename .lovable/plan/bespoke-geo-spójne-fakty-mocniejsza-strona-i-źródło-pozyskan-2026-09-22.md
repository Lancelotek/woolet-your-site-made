# Bespoke GEO - spójne fakty, mocniejsza strona i źródło pozyskania

## Cel
Ustawić `/en/bespoke` jako główne, cytowalne źródło prawdy o Woolet Bespoke, usunąć sprzeczne dane z powiązanych stron i dodać obowiązkową informację o tym, skąd klient poznał Woolet.

## Założenia
- Cztery aktywne kształty konfiguratora zostaną opisane jako: Aviator, Rectangle / 009 Soft Square, Crown Panto / 007 Round-Panto i Round.
- Cena regularna w treści i schema.org to `$480 USD`, obejmująca szkła korekcyjne i darmową wysyłkę. Istniejące dopłaty za specjalne warianty szkieł w konfiguratorze pozostają bez zmian.
- Cena `$299` wystąpi wyłącznie jako `Kickstarter backer price: $299 (campaign only)` z linkiem do `/en/lp/kickstarter`; nie będzie ofertą na woolet.co ani ceną w Product JSON-LD.
- Produkcja trwa 2 tygodnie od zatwierdzenia modelu 3D, a transport następuje później.
- Zmiany nie publikują strony. Zmiany bazy i funkcji zostaną wdrożone, aby zapis źródła działał po późniejszej publikacji frontendu.

## Zakres wdrożenia

### 1. Jedno źródło faktów
- Dodać wspólny, typowany zestaw danych Bespoke z nazwą, wymiarami, cenami, materiałem, miejscem wykonania, czasem produkcji, gwarancją, kształtami, procesem, wysyłką i adresem Kickstartera.
- Oprzeć na nim `/en/bespoke`, `/en/products/bespoke`, `/en/ref/bespoke`, `/en/fit/bespoke`, FAQ, Product JSON-LD, meta dane i prerender.
- Generować blok Bespoke w `public/llms.txt` i `public/llms-full.txt` z tego samego źródła podczas budowania, zamiast utrzymywać niezależne liczby.

### 2. Główna strona `/en/bespoke`
- Zachować obecny kierunek wizualny i galerię pracowni, ale przebudować kolejność treści na answer-first.
- Ustawić H1: `Woolet Bespoke - glasses made to your exact face`.
- Dodać pierwszy akapit z kompletnym faktem w jednym zdaniu.
- Dodać widoczne, semantyczne sekcje: dla kogo jest Bespoke, tabela specyfikacji, sześć kroków procesu, tabela porównawcza, dowód wysyłki do klientów zagranicznych oraz 8-10 pytań FAQ.
- Zakończyć jedynym głównym CTA do skanu dopasowania Bespoke; usunąć konkurujące wezwania w nowej treści.
- Użyć wyłącznie zwykłych myślników w nowej treści.

### 3. Dane strukturalne i crawlability
- Dodać na `/en/bespoke` Product JSON-LD z ceną 480 USD, marką, materiałem, obrazem, dostępnością, bezpłatną wysyłką światową, czasem realizacji, polityką zwrotów i 10-letnią gwarancją.
- Utrzymać FAQPage identyczne z widocznym FAQ oraz BreadcrumbList.
- Rozszerzyć prerenderowany blok `/en/bespoke` do 1,200-1,800 słów z H1, tabelami, FAQ i tym samym Product JSON-LD.
- Ujednolicić `sameAs` Organization/Brand do sześciu podanych profili i zamienić zakresy z długimi kreskami na zwykłe myślniki.

### 4. Powiązane strony i blog
- `/en/products/bespoke`: canonical na `/en/bespoke`, cena regularna jako pierwsza, poprawione meta/FAQ/treść.
- `/en/ref/bespoke`: `noindex, follow`, pozostaje dostępna, znika z sitemap; dane pobiera ze wspólnego źródła.
- `/en/fit/bespoke`: zachować jako narzędzie, poprawić fakty i dodać wyraźny link do `/en/bespoke`.
- Zmienić slug artykułu na `/en/blog/bespoke-eyewear-size-range-145-172mm-guide`, dodać trwałe przekierowanie ze starego URL, zaktualizować linki, sitemapę i manifest.
- Poprawić oba wskazane artykuły oraz wszystkie pozostałe Bespoke-context wystąpienia `$299`, `6 weeks`, `13 stages`, `3 weeks` i `150-172`, bez ingerencji w niezwiązane dane rynkowe lub produktowe.

### 5. Źródło pozyskania w zamówieniu i CRM
- Dodać do `bespoke_orders` kolumnę `source` z kontrolowaną listą wartości i bezpieczną migracją istniejących rekordów.
- Dodać wymagany pojedynczy wybór przed uruchomieniem płatności: ChatGPT, Other AI assistant, Google, Instagram, TikTok, Facebook, Friend, Other.
- Zapisać wybór w lokalnym stanie konfiguracji, metadanych płatności i rekordzie zamówienia; dla istniejących opłaconych zamówień bez źródła wymagać go przy wysyłaniu pomiarów.
- Walidować dozwolone wartości po stronie funkcji, pokazać źródło w tabeli oraz szczegółach `/en/admin/bespoke`.
- Nie zmieniać obliczeń pomiarowych ani pozostałych funkcji CRM.

## Weryfikacja
- Uruchomić migrację i wdrożyć zmienione funkcje zamówień.
- Uruchomić kontrolę typów, testy Bespoke/SEO, pełny build, generator sitemap/manifest i audyty head/sitemap.
- Sprawdzić surowy `dist/en/bespoke/index.html`: nowy H1, tabela specyfikacji, widoczne FAQ, BreadcrumbList i Product JSON-LD z `price: 480` oraz bez oferty 299.
- Sprawdzić przekierowanie starego slugu, brak `/en/ref/bespoke` w sitemapie, canonical produktu i `noindex` strony referencyjnej.
- Przeszukać kod i pliki publiczne pod kątem starych faktów Bespoke oraz długich kresek w nowej treści.
- Sprawdzić mobilnie i desktopowo `/en/bespoke`, wymagany wybór źródła przed płatnością oraz widoczność źródła w CRM.
