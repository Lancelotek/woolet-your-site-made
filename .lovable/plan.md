## Cel

Dodać dwie krótkie, jasne wskazówki do flow skanu twarzy w `/en/fit/scan`:
1. „Zdejmij okulary" — żeby oprawki nie zasłaniały skroni i nie psuły pomiaru szerokości twarzy.
2. „Trzymaj kartę od góry" — czyli chwytaj za górną krawędź, żeby palce nie zasłaniały dolnych rogów karty (te właśnie się stuka/przeciąga w kroku 3).

## Gdzie dodać

Wszystko w `src/pages/FitScan.tsx`. Trzy punkty styku, spójna treść:

### 1) Welcome (krok 1) — checklist `WelcomeStep` (linie ~59–72)
Dodać dwa punkty do istniejącej listy z ✓:
- „Take off your glasses — frames hide your temples and skew the measurement."
- „Hold the card by its top edge so your fingers don't cover the bottom corners."

### 2) Camera (krok 2) — sekcja „Tips for accuracy" (linie ~754–775)
Rozszerzyć treść `<details>` o te same dwa punkty w formie krótkiej, listy bullet (zamiast jednego akapitu) — żeby były widoczne tuż przed capture'em, ale nie zaśmiecały viewportu domyślnie zwiniętym akordeonem.

Format:
```
• Take off your glasses before scanning.
• Hold the card by its top edge — keep fingers off the bottom corners.
• Don't tilt the card or camera; even a small tilt = 3–6 mm error.
• Stand 50–70 cm away, look straight at the lens.
```

### 3) Annotate (krok 3) — podtytuł nad zdjęciem (linia ~895)
Pod istniejącym zdaniem („Tap the bottom-left… You can drag…") dopisać małą, stonowaną notkę w `MUTED`:
„Tip: trzymając kartę za górną krawędź zostawiasz dolne rogi widoczne — łatwiej je trafić."
(po angielsku, zgodnie z resztą strony: „Tip: holding the card by its top edge keeps the bottom corners visible — easier to tap precisely.")

## Czego nie ruszam

- Logiki capture, landmarków, drag-and-drop kropek.
- Layoutu, fontów, kolorów — używam istniejących tokenów (`GOLD`, `MUTED`, klasy `text-cream-dim`, Barlow).
- Tłumaczeń i innych języków (cała strona jest po angielsku — zachowuję spójność).

## Walidacja

- Po edycie odpalić preview na `/en/fit/scan`, sprawdzić wzrokowo welcome → camera (rozwinąć Tips) → annotate, czy teksty są czytelne na 390 px szerokości i nie psują rytmu spacingu.
