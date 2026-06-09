## Cel

Przetłumaczyć wszystkie widoczne dla użytkownika teksty na stronie `/:lang/fit` (skan twarzy) na polski, francuski i hiszpański. Obecnie cała strona — 3974 linii, ~200+ stringów UI — jest twardo zakodowana po angielsku, mimo że route `/:lang/fit` istnieje dla wszystkich języków.

## Zakres

**W zakresie (UI strony FitScan):**
- `WelcomeStep` — eyebrow, H1, opis, 3 kroki z ikonami, "card requirement" box, CTA "Start scan", link do wizard, disclaimers
- `DesktopScanGate` (QR dla desktopu) — H1, opis, 4 punkty instrukcji, fallback "Can't scan the QR code?"
- `CameraStep` — overlay z instrukcjami, status oświetlenia, status karty (none/ok/misaligned), countdown, "tilt your phone", przycisk capture, przycisk timer, przycisk override karty
- `AnalyzingStep` — 5 etapów progress, "Analyzing your measurements", "This usually takes 8–15 seconds…"
- `AnnotateStep` — instrukcje ręcznego zaznaczania kart/krawędzi twarzy
- `EmailGateStep` — H1, opis, pola formularza, privacy checkbox, CTA, disclaimer
- `ResultStep` / `ResultSentStep` — rekomendacja modelu (007/009), pomiary mm, kształt twarzy, CTA do produktu, link "Send again"
- Wszystkie toasty błędów (camera permission denied, no face detected, card not found, network error, invalid email, etc.)
- SEO `<title>` i `<meta description>` per język

**Poza zakresem:**
- Logika scanu, MediaPipe, detekcja karty, edge functions — żadnych zmian
- Pliki obrazów (alt text zostaje w EN, bo te same assets)
- Strony `/fit/wizard`, `/fit/manual`, `/fit/bespoke` — osobne pliki, nie są częścią tego zadania (mogą zostać zgłoszone osobno)

## Podejście techniczne

1. **Audyt stringów** — przeczytać cały `FitScan.tsx` i wypisać każdy widoczny tekst → zebrać ~120–180 kluczy w jednym pliku roboczym.
2. **Nowy plik `src/lib/i18n-fitscan.ts`** — osobny obiekt translacji tylko dla FitScan (żeby nie rozdmuchać głównego `i18n.ts` o setki kluczy). Eksportuje funkcję `tFit(lang, key)`.
   - Klucze grupowane prefiksami: `welcome.*`, `desktop.*`, `camera.*`, `analyzing.*`, `annotate.*`, `email.*`, `result.*`, `error.*`, `seo.*`.
3. **Refactor `FitScan.tsx`** — zamienić każdy widoczny string na `tFit(lang, "...")`. `lang` jest już w komponencie z `useParams`. Sub-komponenty (WelcomeStep, CameraStep itd.) dostaną `lang` jako prop (większość już dostaje).
4. **Tłumaczenia PL / FR / ES** — pełne, profesjonalne tłumaczenia. Brand voice spójny z istniejącym `i18n.ts` (krótkie, eleganckie, "wide faces only").
5. **Polskie znaki, francuskie akcenty, hiszpańska ñ** — UTF-8, zgodnie z resztą projektu.
6. **Smoke test** — po refactorze: `tsc --noEmit`, sprawdzić render `/pl/fit`, `/fr/fit`, `/es/fit` w przeglądarce (welcome step).

## Ryzyka

- **Rozmiar zmiany** — ~3974 linii pliku, kilkaset edycji. Wykonane przez wiele równoległych `line_replace` w jednym pliku zwiększa ryzyko konfliktów. Zrobię to sekwencyjnie sekcjami (jedna sekcja = jeden komponent).
- **Regresja logiki scanu** — niedawno (3 wiadomości temu) naprawialiśmy `face-measurements.ts`. Ten refactor dotyka **tylko prezentacji** (stringi), nie logiki, ale każde dotknięcie 4000-liniowego pliku to ryzyko literówki w JSX. Po każdej sekcji weryfikuję build.
- **Długość tłumaczeń** — niektóre layouty (np. przycisk capture) mają sztywne `height/padding`. Francuskie i hiszpańskie tłumaczenia bywają 20–30% dłuższe — może wymagać drobnych korekt CSS (font-size, white-space).
- **Czas** — to nie jest "szybka zmiana". Realnie ~4–6 dużych tour edytów. Jeśli wolisz, mogę zacząć od **fazy 1** (Welcome + Desktop + Email + Result — najbardziej widoczne ekrany) i fazę 2 (Camera + Annotate + błędy) zrobić w kolejnej iteracji.

## Plan wykonania (proponowana kolejność)

1. Stworzyć `src/lib/i18n-fitscan.ts` z kompletem kluczy PL/FR/ES/EN.
2. Refactor `WelcomeStep` (pierwszy widok użytkownika).
3. Refactor `DesktopScanGate` (desktop QR).
4. Refactor `EmailGateStep` + `ResultStep` + `ResultSentStep`.
5. Refactor `AnalyzingStep` + `AnnotateStep`.
6. Refactor `CameraStep` + wszystkie toasty błędów.
7. Refactor SEO meta tags per język.
8. `tsc --noEmit` + ręczny smoke test PL/FR/ES.

## Pytanie do potwierdzenia

Czy mam zrobić **wszystko w jednej dużej iteracji** (długa odpowiedź, ale skończone), czy podzielić na **fazę 1 (najważniejsze ekrany — Welcome/Email/Result)** teraz, a Camera/Annotate/błędy w kolejnej turze (szybciej dostarczone, łatwiejsze do zweryfikowania)?
