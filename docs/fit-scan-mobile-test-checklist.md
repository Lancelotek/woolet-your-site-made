# FitScan — Mobile Device Test Checklist

Realne urządzenia. Headless Chromium tego nie pokryje (kamera, GPU, uprawnienia iOS).

## Devices (minimum)

- [ ] iPhone — iOS 17 Safari
- [ ] iPhone — iOS 18 Safari
- [ ] iPhone — Chrome iOS (używa WebKit, ale inny UI/permissions)
- [ ] Android — Chrome (Pixel / Samsung, Android 13+)
- [ ] Android — Samsung Internet (opcjonalnie)

## Per-device matrix

Dla każdego urządzenia przejdź wszystkie scenariusze. Oczekiwany wynik: **zawsze trafia na ekran wyników** (`/fit/result`) — nigdy nie blokuje się na "Face wasn't fully detected".

| # | Scenariusz | Oczekiwane |
|---|---|---|
| 1 | Dobre światło, twarz na wprost, karta poziomo na czole | ✅ Wynik, confidence `high` |
| 2 | Słabe światło (wieczór, jedna lampa) | ✅ Wynik (przez manual fallback), confidence `low`/`medium` |
| 3 | Mocne tylne podświetlenie (okno za plecami) | ✅ Wynik lub jasny komunikat "za jasne tło" |
| 4 | Karta lekko krzywo (~10°) | ✅ Wskaźnik "misaligned" → po wyrównaniu wynik |
| 5 | Karta pionowo / na policzku | ⛔ Blok z komunikatem "horizontal on forehead" |
| 6 | W okularach | ⛔ Komunikat o zdjęciu okularów (glassesDetected) |
| 7 | Twarz za blisko (czoło przycięte) | 🔴 czerwony pasek odległości, brak haptika |
| 8 | Twarz za daleko | 🔵 niebieski pasek odległości |
| 9 | Idealna odległość | 🟢 zielony + wibracja (Android; iOS bez wibracji — to OK) |
| 10 | Tryb portretowy → obrót w trakcie | ✅ Layout nie pęka, scan można dokończyć |

## Co logować jeśli się wywali

1. Zrzut z konsoli Safari (Mac → Develop → iPhone → Console) lub `chrome://inspect` (Android).
2. Network: payload do `fit-scan-detect` i response (status + body).
3. Czy `glassesDetected: true` w response gdy nie ma okularów (false positive Gemini).
4. Wartość `confidence` z `calculateMeasurements` w logach.

## Regresje, na które patrzeć po ostatniej zmianie

- `face-measurements.ts` — gałąź `hasManualFace && !hasLandmarks` (powinna **zawsze**
  pchać do wyniku gdy edge function zwraca prawidłowe `face.left/right`).
- Brak `MeasurementError: invalid_landmarks` w produkcyjnym Sentry po deployu.
- Haptik (`navigator.vibrate`) tylko na Androidzie — iOS nie wspiera, brak wibracji to OK.

## Automatyka która JUŻ pokrywa

- `src/lib/face-measurements.test.ts` — wszystkie gałęzie math + walidacje.
- `src/lib/card-detection.test.ts` — klasyfikator karty.
- `e2e/fit-scan-mobile.spec.ts` — welcome step na 4 mobilnych viewportach.
