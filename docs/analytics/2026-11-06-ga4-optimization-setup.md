# GA4 pod optymalizację kampanii - wdrożenie (06.11.2026)

Cel: z GA4 wyciągać koszt każdego etapu lejka blisko pieniędzy (skan → zapis → klik w Kickstartera → Bespoke → wpłata), z podziałem na kampanię, kreację, rynek i to, czy oprawka pasuje odwiedzającemu.

Kolejność: **1. merge PR + Publish w Lovable → 2. GTM → 3. GA4 Admin → 4. UTM w Meta → 5. eksploracje.** GTM bez kodu nic nie wyśle, a wymiary w GA4 rejestruje się dopiero na parametrach, które GTM przekazuje.

## Stan wyjściowy (sprawdzony 06.11.2026)

- GTM-WTJLN2KX: tag „GA4 - scan/fit events” łapie zdarzenia `^(scan|fit)_.*` i przekazuje tylko `error_type` i `source`. Wszystkie inne parametry (szerokość, wynik, krok bespoke) giną.
- Zdarzenia `bespoke_*`, `generate_lead`, `experiment_view` nie dochodzą do GA4 (brak tagu), a `scan_completed` nie było wysłane od 28 dni (skan robi FitLens → `fit_fitlens_result`).
- Zdarzenia kluczowe: `waitlist_signup`, `ks_click`, `purchase` żywe; `close_convert_lead`, `qualify_lead`, `reservation_paid` bez danych.
- Import kosztów Meta: źródło `meta_ads_cost_woolet` (Campaign data), wgrane 06.11.2026.

## 1. Kod (ten PR)

| Zdarzenie | Kiedy | Parametry |
|---|---|---|
| `fit_scan_complete` | pierwszy wynik pomiaru w sesji (FitLens, natywny skan, wizard) | `fit_method`, `fit_result`, `face_width_bucket` |
| `bespoke_start` | pierwszy krok konfiguratora w sesji | `bespoke_step` |
| `bespoke_preview` | pierwszy udany podgląd AI w sesji | `preview_status` |
| `bespoke_checkout` | każdy klik „zapłać” | `bespoke_step` |
| `purchase` | bez zmian + `item_category` = `reservation` / `bespoke` | |

Klucze kontekstowe w dataLayer (bez `event`, GTM trzyma je dla kolejnych tagów): `wlt_fit_result`, `wlt_hero_variant`.

`fit_result`: `standard` (155-161 mm), `bespoke` (145-154), `over_range` (>161), `under_range` (<145), `edge` (przedział 5 mm na granicy, np. 160-165), `unknown`. Dokładne mm nie opuszczają strony.

## 2. GTM (workspace → Preview → Publish)

**Zmienne** (Data Layer Variable, wersja 2):

| Nazwa | Klucz |
|---|---|
| DLV - fit_method | `fit_method` |
| DLV - fit_result | `fit_result` |
| DLV - face_width_bucket | `face_width_bucket` |
| DLV - bespoke_step | `bespoke_step` |
| DLV - preview_status | `preview_status` |
| DLV - wlt_fit_result | `wlt_fit_result` |
| DLV - wlt_hero_variant | `wlt_hero_variant` |

**Zmienna Google tag: Event Settings** „ES - wlt user properties”, sekcja User Properties:
- `fit_class` = `{{DLV - wlt_fit_result}}`
- `headline_variant` = `{{DLV - wlt_hero_variant}}`

**Trigger** „Custom Event - scan_fit (regex)”: nazwa zdarzenia `^(scan|fit|bespoke)_.*` (regex). Do GA4 zaczną trafiać też istniejące `bespoke_step_view`, `bespoke_preview_shown`, `bespoke_pay_click` - dają pełny lejek kroków konfiguratora.

**Tag** „GA4 - scan/fit events”: obok `error_type` i `source` dodaj parametry `fit_method`, `fit_result`, `face_width_bucket`, `bespoke_step`, `preview_status`, `step`, `status` (każdy = odpowiednia zmienna DLV; `step`/`status` wymagają DLV o tych kluczach). Event Settings Variable = „ES - wlt user properties”.

**Tagi** „GA4 - waitlist_signup”, „GA4 - Purchase”, „GA4 - ks_click (link do Kickstartera)”: Event Settings Variable = „ES - wlt user properties”. Dzięki temu każda konwersja niesie klasę dopasowania i wariant hero.

Sprawdzenie w Preview: zrób skan na /en/fit → `fit_scan_complete` z trzema parametrami; wejdź w /en/bespoke → `bespoke_start`. W GA4 DebugView te same zdarzenia z user properties `fit_class`.

## 3. GA4 Admin (property 528040602)

1. **Data retention** → Event data retention: 14 months.
2. **Custom definitions → Custom dimensions**:
   - Event: `fit_method`, `fit_result`, `face_width_bucket`, `bespoke_step`, `preview_status`, `item_category` (już standardowy - pomiń, gdy GA4 go pokazuje)
   - User: `fit_class` (Fit class), `headline_variant` (Hero headline variant)
3. **Events → Key events** (New key event, nazwy przed pierwszymi danymi):
   `fit_scan_complete`, `bespoke_start`, `bespoke_preview`, `bespoke_checkout`; zostają `waitlist_signup`, `ks_click`, `purchase`.
   Odznacz: `close_convert_lead`, `qualify_lead`, `reservation_paid`.
4. **Domyślne wartości zdarzeń kluczowych** (PLN, robocze - kalibracja po 30 dniach na podstawie konwersji etapu na wpłatę):

   | Zdarzenie | Wartość |
   |---|---|
   | `fit_scan_complete` | 5 |
   | `waitlist_signup` | 10 |
   | `bespoke_start` | 15 |
   | `ks_click` | 20 |
   | `bespoke_preview` | 30 |
   | `bespoke_checkout` | 60 |
   | `purchase` | realna kwota |

5. **Data display → Channel groups → Create** „Woolet channels” (reguły w tej kolejności):

   | Kanał | Warunek |
   |---|---|
   | Paid Meta | source regex `^(fb|facebook|ig|instagram|an|l\.facebook\.com|m\.facebook\.com)$` AND medium regex `^(paid|paid_social|cpc)$` |
   | Paid Google | source = `google` AND medium regex `^(cpc|paid)$` |
   | Paid X | source regex `^(x|twitter)$` AND medium = `paid` |
   | Paid ChatGPT | source = `chatgpt` AND medium = `paid` |
   | Email | medium = `email` OR source regex `^(ml-|mailerlite)` |
   | AI referral | source regex `chatgpt\.com|chat\.openai\.com|perplexity|gemini\.google|copilot|claude\.ai` |
   | Organic Search / Organic Social / Referral / Direct | jak w grupie domyślnej |

   Grupa łączy dzisiejszy bałagan UTM (`fb`, `facebook`, `ig`, `an`, `paid_social`) bez przepisywania historii.
6. **Data filters → Internal Traffic → Active** (kod już ustawia `traffic_type=internal` dla `?wlt_internal=1` i `utm_source=claude_*`).
7. **Attribution settings**: model data-driven, okno dla zdarzeń pozyskania 30 dni, dla pozostałych 90 dni.
8. **Product links → BigQuery**: eksport dzienny (darmowy w sandboxie do 10 GB) - surowe ścieżki first vs last touch.
9. **Data import**: co tydzień nowy CSV kosztów Meta (te same dni nadpisują wartości). Docelowo dorzucić X i ChatGPT Ads tym samym schematem.

## 4. UTM w Meta (poziom reklamy → URL parameters)

```
utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_id={{campaign.id}}
```

Warunek: nazwy kampanii w Meta jako slug (`cold_us_lp_kickstarter`, `rmkt_site_lp_kickstarter`), bo `{{campaign.name}}` trafia 1:1 do GA4 i musi zgadzać się z `utm_campaign` w CSV kosztów. Nazwy reklam = kod kreacji (M2, M4b, R4), wtedy `utm_content` w GA4 (wymiar „Session manual ad content”) daje koszt wpłaty per kreacja bez dodatkowej konfiguracji.

Kickstarter: linki do kampanii z `?ref=<utm_campaign>`. Pledge'y per ref z panelu twórcy łączysz z kosztami w arkuszu - GA4 nie widzi backerów.

## 5. Eksploracje i reguły decyzyjne

1. **Koszt wpłaty per kampania i kreacja** (Free form): wiersze Session campaign → Session manual ad content; wartości Advertiser cost, Key events (purchase), Cost per key event. Reguła: kreacja powyżej 1,5× średniego kosztu wpłaty przez 5 dni → pauza; poniżej 0,7× → budżet +8-12 %.
2. **Lejek per kampania** (Funnel exploration, otwarty): `session_start` → `fit_scan_complete` → `waitlist_signup` → `ks_click` → `purchase`, rozbicie Session campaign. Wskazuje, czy problem leży w reklamie, stronie czy mailach.
3. **Jakość ruchu** (Free form): wiersze Country × `fit_class`, kolumny `headline_variant`; metryki Users, Key events. Kampania z tanim leadem i wysokim udziałem `over_range` / `under_range` przepala budżet.
4. **Bespoke** (Funnel): `bespoke_start` → `bespoke_preview` → `bespoke_checkout` → `purchase` z `item_category = bespoke`, rozbicie Session source/medium (AI referral osobno).

Alerty (Insights → Create): `purchase` −50 % dzień do dnia; Advertiser cost > 0 przy 0 sesjach z Paid Meta (zepsuty UTM lub landing).
