
# Bespoke Scan Flow — projekt

Cel: zebrać dane wystarczające do dopasowania modelu **bespoke** do indywidualnej geometrii twarzy — nie tylko szerokość twarzy (jak w kolekcji 007/009), ale pełny zestaw pomiarów potrzebnych do custom rozmiarówki.

## Co mierzymy (bespoke vs kolekcja)

| Pomiar | Kolekcja | Bespoke | Po co |
|---|---|---|---|
| Face width (temple-to-temple) | ✅ | ✅ | dobór bazowej szerokości frontu |
| Nose bridge width | ✅ | ✅ | szerokość mostka |
| **Nose bridge height** | — | ✅ | gdzie mostek siada (wysoki/niski nos) |
| **Temple length (eye→ear)** | — | ✅ | długość zauszników |
| **Pantoscopic angle** | — | ✅ | kąt nachylenia frontu |
| **Face asymmetry (L/R offset)** | — | ✅ | korekta krzywizny / wysokości uszu |
| **Eye height from bridge** | — | ✅ | pozycja środka soczewki |
| **PD (pupillary distance)** | opcjonalnie | ✅ | jeśli prescription lenses |

## Architektura: dwa tory, jedno UI

```text
                  /en/bespoke/scan
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       iOS 12+ Safari        Wszystko inne
       (TrueDepth dostępne)  (Android, desktop, starszy iOS)
              │                     │
              ▼                     ▼
       TrueDepth 3D scan     Multi-frame card scan
       (ARKit Face Mesh      (3 zdjęcia: front + L¾ + R¾
        via WebXR fallback   z kartą referencyjną
        lub natywny app      na czole)
        bridge)              + AI landmark detection
              │                     │
              └──────────┬──────────┘
                         ▼
              Normalized BespokeProfile
              (12 wartości w mm/stopniach
               + confidence per pomiar)
                         ▼
              zapis do bespoke_configs
              + prefil w Configurator
```

## Tor A — TrueDepth (iOS, "Premium scan")

WebXR Face Tracking nie jest dostępne w Safari publicznie, więc realistyczne opcje:

1. **Capacitor + ARKit plugin** — jeśli wejdziemy w aplikację mobilną (jest knowledge o Capacitor w projekcie). Daje pełny Face Mesh 1220 punktów, ~0.5 mm precyzja.
2. **Web fallback dla iOS bez aplikacji**: użyć MediaPipe Face Mesh w przeglądarce (468 landmarków 3D, brak prawdziwego depth, ale z kartą referencyjną daje przyzwoity wynik) + dodatkowe ujęcie z profilu do pomiaru pantoscopic angle i wysokości mostka.

Na start (MVP, bez app store): **tor A = MediaPipe Face Mesh + 3-klatkowy capture** (front, lewy profil, prawy profil), kalibracja kartą na froncie.

## Tor B — Multi-frame card-reference (Android / desktop / fallback)

Rozszerzenie obecnego `FitScan` o:

- **3 ujęcia zamiast 1**: front (jak teraz), lewy ¾, prawy ¾.
- Każda klatka → `fit-scan-detect` edge function z nowym promptem dla Gemini 2.5 Pro który dla profili zwraca dodatkowe landmarki: tip ucha (do temple length), szczyt mostka, dolny brzeg mostka, kącik oka.
- Klient łączy 3 wyniki w `BespokeProfile`:
  - face width ← front (już mamy)
  - nose bridge width ← front (już mamy)
  - nose bridge height ← profile (szczyt − dół mostka, kalibracja przez kartę widoczną na froncie + projekcja głębi z kąta)
  - temple length ← profile (kącik oka → tragus ucha)
  - pantoscopic angle ← profile (kąt linii brwi vs linia kącik oka–tragus)
  - asymmetry ← porównanie L¾ vs R¾

Karta referencyjna pojawia się tylko na ujęciu frontalnym. Na profilach używamy znanej już szerokości twarzy z frontu jako wewnętrznej skali (twarz tej samej osoby między klatkami → ta sama wartość mm na pixel po normalizacji odległości od kamery).

## UX flow (4 ekrany)

```text
1. INTRO           2. CAPTURE 1/3 FRONT     3. CAPTURE 2/3 LEFT      4. RESULT
┌─────────────┐    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ Bespoke fit │    │ ◉ live view │          │ ◉ live view │          │ Your face   │
│ scan        │    │             │          │             │          │ ────────────│
│             │    │ card aligned│          │ turn head   │          │ Width 158mm │
│ • 3 photos  │    │ on forehead │          │ to your L   │          │ Bridge 19mm │
│ • 60 sec    │    │             │          │             │          │ Temple 142  │
│ • What you  │    │ [Capture]   │          │ [Capture]   │          │ Pant. 8°    │
│   need:     │    │             │          │             │          │             │
│   card      │    │ tip overlay │          │ profile     │          │ Confidence  │
│             │    │ shows good  │          │ silhouette  │          │ ▓▓▓▓▓░ 85%  │
│ [Start]     │    │ position    │          │ overlay     │          │             │
│             │    │             │          │             │          │ [Use this   │
│ [Skip→Quick │    │             │          │             │          │  in config] │
│  scan]      │    │             │          │             │          │             │
└─────────────┘    └─────────────┘          └─────────────┘          └─────────────┘
```

Ujęcie #4 (R¾) analogiczne do #3, pominięte w diagramie dla zwięzłości.

Każdy capture ma:
- live face mesh overlay (MediaPipe) z kolorowymi punktami w realnym czasie
- auto-trigger gdy pose match > 90% (nie wymagamy ręcznego clicka, redukuje błędy użytkownika)
- 3-sek countdown + sound cue
- możliwość retake pojedynczej klatki

## Wynik: BespokeProfile

Nowy typ + tabela `bespoke_scan_profiles` (osobno od `scan_sessions`, bo struktura inna):

```ts
type BespokeProfile = {
  faceWidthMm: number;
  noseBridgeWidthMm: number;
  noseBridgeHeightMm: number;
  templeLengthLeftMm: number;
  templeLengthRightMm: number;
  pantoscopicAngleDeg: number;
  asymmetryMm: number;
  pdMm: number | null;       // opcjonalne, dla prescription
  confidence: {              // per pomiar 0..1
    faceWidth: number;
    noseBridge: number;
    temple: number;
    angle: number;
  };
  rawFrames: { front: string; left: string; right: string }; // signed URLs
  capturedAt: string;
};
```

Profile zapisywany do nowej tabeli z RLS (user widzi tylko swoje) + automatyczne mapowanie w `Configurator.tsx` na presety bespoke (front size, bridge style, temple length wybierane automatycznie, użytkownik tylko potwierdza / fine-tunuje suwakami).

## Integracja z istniejącym kodem

- Reuse: `src/lib/face-landmarker.ts` (MediaPipe), `src/lib/card-detection.ts`, `src/lib/face-measurements.ts`, `supabase/functions/fit-scan-detect` (rozszerzony o profile poses).
- Nowe pliki:
  - `src/pages/bespoke/Scan.tsx` (kontener flow)
  - `src/components/bespoke-scan/IntroStep.tsx`
  - `src/components/bespoke-scan/CaptureFront.tsx`
  - `src/components/bespoke-scan/CaptureProfile.tsx` (parametryzowana L/R)
  - `src/components/bespoke-scan/ResultStep.tsx`
  - `src/lib/bespoke-profile.ts` (fuzja 3 klatek → `BespokeProfile`)
  - `supabase/functions/bespoke-scan-detect/index.ts` (nowy prompt dla profili)
  - migracja: tabela `bespoke_scan_profiles` + GRANT + RLS
- Routing: `/en/bespoke/scan` (+ PL/FR/ES), CTA z `BespokeWaitlistGate` po zostawieniu emaila → przekierowanie na scan (waitlist gate zostaje, scan jest następnym krokiem).
- Desktop: nie pokazuje aparatu, tylko QR jak w `DesktopScanGate` (telefon ma kamerę + sensory).

## Kolejność implementacji

1. Migracja `bespoke_scan_profiles` + RLS + GRANT
2. Edge function `bespoke-scan-detect` (3-pose prompt + JSON schema)
3. `bespoke-profile.ts` (fusion logic + testy z fixturami)
4. UI: Intro → Capture Front (działa solo, MVP smoke test)
5. UI: Capture Profile L + R + Result
6. Prefil w `Configurator.tsx`
7. (Opcjonalnie później) tor TrueDepth via Capacitor, gdy zdecydujemy się na aplikację natywną

## Otwarte decyzje

- **Karta referencyjna na profilu?** Domyślnie nie — używamy face width z frontu jako skali. Jeśli precyzja okaże się słaba, dodamy wymóg karty na profilu.
- **Storage zdjęć?** Klatki zapisywać do Supabase Storage (bucket `bespoke-scans`, prywatny, retencja 30 dni, signed URLs) czy tylko liczyć i wyrzucać? Rekomendacja: zapisywać, bo daje to ground truth do retrenowania promptu i debugowania spornych przypadków.
- **TrueDepth native app**: zostawiamy poza MVP, ale architektura `BespokeProfile` jest gotowa na podmianę toru A.
- **PD measurement**: pomijamy w MVP, dodamy gdy ruszą prescription lenses.

Czy zatwierdzasz? Mogę zacząć od kroków 1–3 (migracja + edge function + fusion logic) jako pierwsza iteracja, zanim wejdziemy w UI.
