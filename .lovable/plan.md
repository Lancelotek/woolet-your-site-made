# Poprawa CTR organicznego bez zmian URL-i

## Zakres
- Zaktualizować tytuły i opisy pięciu wskazanych artykułów w obu źródłach metadanych: widoku strony i generatorze prerenderowanego HTML. Zachować synchronizację Open Graph i Twitter.
- Zweryfikować średnią szerokość twarzy oraz każdą obietnicę z opisu względem widocznej treści. Jeśli wskazane zdanie nie ma potwierdzenia, użyć najbliższej prawdziwej wersji i ująć rozbieżność w raporcie.
- Zmienić H1 poradnika o szerokich twarzach na dokładnie: `Glasses That Fit a 155 mm+ Face: Complete Buying Guide`.
- Usunąć znaki `—` i `–` ze wszystkich tytułów, opisów, H1 oraz pól Open Graph dla `/en`, `/de`, `/fr`, `/pl`, `/ko` i `/ja`, bez zmian adresów, slugów, canonicali i linkowania. Zakresy liczb zapisać z krótkim łącznikiem, np. `145-172 mm`.

## FitLens i treść artykułów
- Dodać jeden współdzielony, kompaktowy blok FitLens do sześciu wskazanych artykułów, bezpośrednio po wstępie i przed pierwszym H2.
- Blok otrzyma dokładnie podany nagłówek, tekst i jeden przycisk prowadzący do `/en/fit`; zachowa obecny styl Woolet i nie doda drugiego CTA.
- Zapewnić, że cztery wskazane artykuły rozmiarowe mają główną tabelę jako semantyczne `<table><thead>...` w pierwszej jednej trzeciej tekstu, z przewijaniem poziomym na telefonie.

## Dane uporządkowane
- Dla sześciu artykułów porównać widoczne FAQ z `FAQPage`; dodać schemat tylko tam, gdzie istnieją widoczne, identyczne pytania i odpowiedzi.
- Sprawdzić prerenderowany `Product` dla 007 i 009 pod kątem `name`, `image`, `brand`, `description` i kompletnego `offers`; nie dodawać ocen ani opinii.
- Nie rozstrzygać konfliktu `$114` / `$119`: pozostawić ceny bez zmian i wypisać oba miejsca w raporcie.

## Ochrona zakresu
- Nie zmieniać rankingów, treści poza elementami potrzebnymi do potwierdzenia snippetów, układu stron, adresów, slugów, canonicali, hreflangów ani linkowania wewnętrznego.
- Nie zmieniać strony porównawczej Persol ani dwóch artykułów o rozmiarach kapeluszy.
- Nie publikować ani nie wdrażać zmian.

## Weryfikacja
- Dodać lub rozszerzyć testy źródeł metadanych, FAQ, tabel i schematów produktów.
- Uruchomić sprawdzenie typów, testy związane z SEO oraz pełny build z prerenderowaniem.
- Odczytać surowy HTML każdego celu z `dist` w sposób odpowiadający botowi i potwierdzić title, description, OG, H1/noscript oraz JSON-LD.
- Parsować każdy blok JSON-LD jako JSON i sprawdzić wymagane pola schema.org.
- Przeszukać wygenerowany HTML dla sześciu języków; w title, description, H1 i OG wynik dla `—` oraz `–` ma wynosić zero.
- Wydrukować tabelę długości: URL, liczba znaków tytułu, liczba znaków opisu.
- Raport końcowy: każdy zmieniony plik w osobnym wierszu, tabela długości i wszystkie rozbieżności/elementy pominięte.
