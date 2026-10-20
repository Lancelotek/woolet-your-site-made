# SEO + GA4 fix pack 20.10.2026

Prompt do wykonania w tym repo (Claude Code / Lovable). Źródło: audyt GSC + GA4 z 20.10.2026.

## Kontekst

Dane: GSC sc-domain:woolet.co (17.07-17.10), GA4 528040602 (20.09-19.10), `server_event_log` w Supabase.

1. **`https://woolet.co/` zwraca 200 + `<title>Page not found | Woolet</title>` + `noindex`** (sprawdzone curl z UA przeglądarki i Googlebota). Nieistniejące adresy też dają 200 (np. `/en/this-does-not-exist-xyz`). Worker `woolet-route-server` jest wdrożony (ostatni deploy 20.10 19:44 UTC) i w kodzie robi `/`→`/en` 301 oraz prawdziwe 404, ale **ruch na apex przez niego nie przechodzi**. `www` działa (301 na apex).
2. **Błędne adresy blogów (literówki, linki z AI) dostają shell 404 z kodem 200** - GSC pokazuje je na pozycji 1.
3. **22 z 69 wpłat (32 %) wysłanych przez Measurement Protocol od 20.09 nie ma `ga_client_id`** (`server_event_log`, GA4Reservation/GA4Purchase): 8 z Payment Link (`paid_source=payment_link`, brak metadata), 10 ma `ga_session_id` bez `ga_client_id`, 4 nie mają nic. W GA4 30 z 63 `purchase` ląduje w Direct / (not set).
4. W GA4 brak key events dla skanu FitLens i intencji bespoke, ruch testowy (`claude_audit`, `claude_test2`) liczy się jak realny, a 85 sesji organic ma landing page `(not set)` (engagement 12 %).

Przeczytaj `AGENTS.md` i `workers/route-server/AGENTS.md` przed zmianami. Zasady repo obowiązują: przekierowania tylko jako dane w `src/seo/legacyRedirects.ts` / `src/seo/routeRedirects.ts` (bez nowych `<Navigate>`), `GA4_API_SECRET` tylko w `payments-webhook`.

---

## Zadanie 1 - apex przez Worker (prawdziwe 301 i 404)

**Kod:**
- W `workers/route-server/src/handler.ts` dodaj nagłówek diagnostyczny `x-woolet-edge: route-server` do każdej odpowiedzi Workera (passthrough, 301, 404). Zaktualizuj test `src/test/worker-route-server.test.ts`.
- Dodaj skrypt `scripts/check-edge.mjs` (bez zależności), który dla listy URL-i drukuje status, `location` i obecność `x-woolet-edge`. Lista: `/`, `/index.html`, `/?no_redirect=true`, `/en`, `/en/this-does-not-exist-xyz`, `/en/blog/how-to-tell-if-your-face-wide-or-narrow`, `/charging-mousepad/`, `https://www.woolet.co/`.

**Ręcznie w Cloudflare (checklista dla Marka w opisie PR):**
- Workers Routes w strefie woolet.co: muszą istnieć `woolet.co/*` i `www.woolet.co/*` → `woolet-route-server`.
- Jeśli po deployu `curl -sI https://woolet.co/en` nie ma `x-woolet-edge`, apex obsługuje strefa Lovable (Cloudflare for SaaS) z pominięciem naszej strefy. Wtedy: zgłoszenie do Lovable o włączenie Orange-to-Orange dla custom hostname woolet.co, żeby nasza strefa (Worker) szła przed ich originem. Nie przepinaj DNS apex samodzielnie.

**Akceptacja:** `/` → 301 `/en` (z zachowaniem query), `/index.html` → 301 `/en`, nieznany dokument → 404 + noindex, każda odpowiedź ma `x-woolet-edge`.

## Zadanie 2 - błędne adresy z GSC → 301 na właściwe strony

Dopisz do `EXPLICIT` w `src/seo/routeRedirects.ts` (sekcja „GSC 20.10.2026 - typo / AI-hallucinated slugs”):

```
/en/blog/how-to-tell-if-your-face-wide-or-narrow      -> /en/blog/how-to-tell-if-your-face-is-wide-or-narrow
/en/blog/how-to-tell-if-your-face-or-narrow           -> /en/blog/how-to-tell-if-your-face-is-wide-or-narrow
/en/blog/how-to-tell-if-your-wide-or-narrow           -> /en/blog/how-to-tell-if-your-face-is-wide-or-narrow
/en/blog/numbers-on-eyeglass-frames-meaning           -> /en/blog/numbers-on-glasses-frames-meaning
/en/blog/numbers-on-frames-meaning                    -> /en/blog/numbers-on-glasses-frames-meaning
/en/blog/numbers-or-glasses-frames-meaning            -> /en/blog/numbers-on-glasses-frames-meaning
/en/blog/glasses-for-a-wide-nose-bridge-21-22mm-explained -> /en/blog/glasses-for-wide-nose-bridge-21-22mm-explained
/en/blog/glasses-a-wide-nose-bridge-21-22mm-explained -> /en/blog/glasses-for-wide-nose-bridge-21-22mm-explained
/en/blog/wide-bridge-nose-bridge-21-22mm-explained    -> /en/blog/glasses-for-wide-nose-bridge-21-22mm-explained
/en/blog/round-square-wide-face                       -> /en/blog/round-vs-square-glasses-wide-face
/en/blog/what-size-glasses-for-large-head             -> /en/blog/what-size-glasses-for-a-large-head
/en/blog/what-size-hat-do-i-wear-big-heads-guard      -> /en/blog/what-size-hat-do-i-wear-big-heads-guide
/en/blog/what-size-hat-do-i-wear-big-heads-guide-7-and-up -> /en/blog/what-size-hat-do-i-wear-big-heads-guide
/en/blog/what-size-sunglasses-for-a-wide-face-155mm-fit-guide -> /en/blog/what-size-sunglasses-for-wide-faces
/en/blog/are-my-glasses-too-small-for-my-face-4-signs-and-what-to-do -> /en/blog/are-my-glasses-too-small-for-my-face
/en/blog/eyewear-frame-size-chart-xs-xxl-in-mm        -> /en/blog/eyeglass-frame-size-chart
/en/blog/how-to-measure-face-width-for-phone-camera   -> /en/blog/how-to-measure-face-width-for-glasses
/en/blog/how-to-measure-face-width-with-your-phone-camera -> /en/blog/how-to-measure-face-width-for-glasses
/en/glasses-for-wide-faces-guide                      -> /en/blog/glasses-for-wide-faces-guide
/en/collections/glasses-for-large-heads               -> /en/collections/glasses-for-big-heads
/terms/return-policy                                  -> /en/return-policy
```

- Upewnij się, że `build-bundle.mjs` przenosi je do `legacy-redirects.json` Workera (301 na edge) i że prerender tworzy stuby (fallback, gdy Worker nie działa).
- `npm run build` musi przejść (`audit-routes`, `audit-sitemap`).

**Akceptacja:** każdy adres z listy → 301 na cel (przez Worker) albo stub z `meta refresh` + canonical na cel (bez Workera).

## Zadanie 3 - atrybucja wpłat w GA4 (Measurement Protocol)

**3a. Payment Links bez GA ids (8 przypadków).** Wszędzie, gdzie strona linkuje do `buy.stripe.com` (`src/content/de/pricing.ts` → `stripeReservationUrl`, `src/pages/Payments.tsx` → `STRIPE_FALLBACK_URL`, inne miejsca z grep), dopisz w chwili kliknięcia `client_reference_id=ga-<cid z kropką zamienioną na ->-s<sid>` (Stripe dopuszcza tylko `[A-Za-z0-9_-]`, max 200 znaków). W `payments-webhook` dla `session.payment_link` parsuj `client_reference_id` z tym prefiksem i uzupełnij `ga_client_id` / `ga_session_id` przed `fireGa4Conversion`. Linki z maili MailerLite zostają bez zmian (brak cookie), atrybucja dalej przez `paid_source`.

**3b. `ga_session_id` bez `ga_client_id` (10 przypadków).** W `src/lib/ga-ids.ts` dodaj asynchroniczny fallback: gdy cookie `_ga` nie da się odczytać, pobierz `client_id` przez `gtag('get', 'G-SYJZL72DWB', 'client_id', cb)` z timeoutem 400 ms. Użyj go w `getGaCheckoutMetadata` (wersja async; zaktualizuj wywołania w `ReserveCheckoutButton`, `StripeCheckoutModal`, `BespokeCheckoutModal`, `Reserve.tsx`, `bespoke/Checkout.tsx`) - sesja Stripe nadal powstaje dopiero po tapnięciu. Do metadanych dodaj `ga_cid_src` = `cookie` | `gtag` | `none` i zapisz to w `server_event_log.request_summary`, żeby za 2 tygodnie sprawdzić skuteczność.

**3c. Raportowanie bez client_id.** Event `purchase` z MP już ma `paid_source` - logika bez zmian. W PR opisz ręczny krok: GA4 Admin → Custom definitions → wymiar event-scope `paid_source`.

**Akceptacja:** zapytanie z PR (`server_event_log`, ostatnie 14 dni) pokazuje udział `has_ga_client_id=false` dla wpłat ze strony (bez `ml-*`) poniżej 10 %.

## Zadanie 4 - key events, ruch wewnętrzny, landing page (not set)

- **Ruch wewnętrzny:** gdy `utm_source` zaczyna się od `claude_` albo w localStorage jest `wlt_internal=1` (ustawiane przez `?wlt_internal=1`), wysyłaj do GA4 parametr `traffic_type: 'internal'` (przez dataLayer / konfigurację GTM używaną w `src/lib/gtm.ts`). Ręcznie w PR: GA4 Admin → Data filters → Internal traffic → Active.
- **Key events (ręcznie, checklista w PR):** oznaczyć jako key event `scan_completed` (FitScan, `src/pages/FitScan.tsx` → `pushEvent`) i `bespoke_pay_click` (`trackBespokeFunnel`). Najpierw potwierdź w GA4 DebugView, że oba eventy dochodzą do GA4 (GTM musi mieć tag GA4 Event dla tych nazw - jeśli nie, opisz, jaki tag dodać). Usunąć nieużywane key events `close_convert_lead` i `qualify_lead`.
- **Landing page (not set):** zdiagnozuj, czy pierwszy `page_view` po wejściu na prerenderowaną stronę wysyła się przed innymi eventami tej samej sesji (consent, lazy init GTM, SPA route change). Opisz przyczynę w PR i napraw, jeśli leży w kodzie.

---

## Wymagania do PR
- Jeden PR do `main`, gałąź `claude/seo-ga4-fixpack-2026-10-20`.
- `npm run build` i `bunx vitest run` zielone.
- W opisie PR: checklista kroków ręcznych (Cloudflare, GA4 Admin, GTM) i wynik `node scripts/check-edge.mjs` po deployu.
- Po merge: Publish w Lovable, potem w GSC walidacja poprawek („Strona z przekierowaniem”, „Soft 404”) i Inspect URL dla `https://woolet.co/`.
