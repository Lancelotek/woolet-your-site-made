# Komplet danych produkcyjnych dla pierwszego zamówienia Bespoke

## Co realnie zebraliśmy przy tej płatności

Zamówienie z 13 września, klient Hoai Thanh Vu (khoitien1811@icloud.com), 560 USD, płatność live — zapisane poprawnie.

Mamy:
- model i kolory: Rectangle, front i zauszniki "Deep matte black (A305 2826)", wykończenie matowe
- soczewki: fotochromowe
- grawer: "Mr Thanh. Vu Hoai"
- długość zausznika: 155 mm
- wymiary z formularza: szerokość twarzy 155 mm, mostek 33 mm, PD 65 mm
- podgląd okularów (obrazek wygenerowany) zapisany razem z zamówieniem

Czego brakuje, a producent tego potrzebuje:
- **nie ma zdjęcia klienta** — klient nie przeszedł kroku ze zdjęciem, więc nie ma też zgody na jego użycie
- **brak ręcznych pomiarów** (odległość skroń–skroń, obwód głowy, ucho–ucho) — pola są puste
- **nie ma jednego miejsca**, w którym widzisz wszystkie zamówienia; dziś raport PDF da się pobrać tylko z linku klienta
- podgląd okularów zapisany jest jako bardzo duży ciąg tekstowy w bazie zamiast pliku — spowalnia to raporty

## Co zbuduję

### 1. Panel zamówień Bespoke (tylko dla Ciebie)
Nowa strona pod istniejącym logowaniem hasłem administratora: lista wszystkich zamówień Bespoke z datą, klientem, modelem, statusem pomiarów, statusem zdjęcia i zgody. Kliknięcie otwiera pełną kartę zamówienia.

### 2. Karta zamówienia = komplet dla producenta
Na jednej stronie: dane zamówienia, pełna specyfikacja oprawek, wszystkie pomiary (z formularza i ręczne), grawer, podgląd okularów, zdjęcie twarzy i wizualizacja na twarzy (jeśli klient wyraził zgodę), znaczniki zgody z datą, oraz ostrzeżenie, gdy pomiary ze zdjęcia rozjeżdżają się ze skanem.

### 3. Raport PDF dla zakładu produkcyjnego
Ten sam raport co dziś, ale generowany z panelu, zawsze z pełnym kompletem: dane i data zamówienia, specyfikacja, pomiary, tolerancje, zdjęcia, status zgody i data. Dodatkowo przycisk „Pobierz paczkę" — PDF plus pliki zdjęć w jednym ZIP-ie do wysłania producentowi.

### 4. Domknięcie braków w procesie
- po płatności klient dostaje wyraźny krok „dokończ pomiary i zdjęcie", a w panelu widzisz, kto tego nie zrobił
- zdjęcie zrobione przed zakupem w tej samej sesji zostaje automatycznie podpięte do zamówienia
- podgląd okularów zapisywany jako plik, nie jako tekst w bazie

## Szczegóły techniczne

- Nowa strona `/en/admin/bespoke` + widok szczegółów, chroniona przez istniejącą funkcję `admin-crm` (hasło `ADMIN_CRM_PASSWORD`).
- Nowa funkcja brzegowa `bespoke-admin-orders`: lista i szczegóły zamówień z `bespoke_orders`, dołączone `bespoke_order_photos` oraz `bespoke_scan_profiles` po `session_ref`; podpisane linki 15-minutowe do prywatnych plików w `bespoke-photos`.
- Ponowne użycie `src/lib/bespoke-workshop-pdf.ts`; ZIP budowany po stronie przeglądarki.
- Podpięcie zdjęć przedzakupowych: dopasowanie `bespoke_order_photos.session_ref` do `bespoke_orders.session_ref` przy braku `order_id` (jednorazowe uzupełnienie + w webhooku).
- Przeniesienie `ai_preview_url` z base64 do pliku w `bespoke-cad`; kolumna zachowuje URL.
- Bez zmian w checkoucie, matematyce pomiarów i krokach konfiguratora.
