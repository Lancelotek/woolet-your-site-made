# SEO Landing Cluster Build

Duży build (~25+ nowych stron). Proponuję realizację w fazach z checkpointem po Fazie 1, żebyś potwierdził jakość/ton przed skalowaniem.

## Zakres i decyzje wstępne

**Audyt kanibalizacji (przed budową):**
- `/en/collections/keyhole-bridge-glasses` — istnieje → NIE tworzę `/en/bridge/keyhole`. Upgraduję istniejącą kolekcję strukturą z briefu, dodaję redirect w App.tsx.
- `/en/collections/extra-wide-glasses` — istnieje → NIE tworzę `/en/extra-wide-glasses`. Upgrade.
- `/en/collections/big-glasses-frames`, `glasses-for-big-heads` — istnieją → nowy `/en/xxl-glasses` tylko jeśli intencja XXL jest odrębna; inaczej upgrade najbliższej.
- `/en/collections/italian-mazzucchelli-acetate` — istnieje → NIE tworzę `/en/italian-acetate-frames`. Upgrade + alias redirect.
- Hub `/en/guide/glasses-for-wide-faces` vs istniejący blog `glasses-for-wide-faces-guide` — użyję istniejącego blog slug jako canonical, dodam redirect z `/en/guide/...`.

**Ton/design:** reuse `CollectionPage`, `SEO`, tokeny brand book (Ink/Panel/Gold/Cream, Newsreader+Archivo). Zero nowych komponentów kolorystycznych.

**Prerender:** `scripts/prerender.mjs` — dodam wszystkie nowe ścieżki do listy prerenderowanej, żeby `curl` zwracał H1.

## Faza 1 (checkpoint — pokażę Ci przed dalszą pracą)

1. `src/data/sizes.ts` — pełne dane dla 145/150/152/155/158/160/162/165 mm (h1, intro, verdict wg reguł z briefu, faq 3–5 unikalnych, bespokeNote).
2. `src/components/SizePage.tsx` — reusable template (hero, verdict block, spec table 007 vs 009, how-to-measure, product cards, related sizes strip, FAQ accordion, JSON-LD FAQPage + 2×Product).
3. Route `/en/size/:slug` w `App.tsx` + 8 statycznych ścieżek do prerender listy.
4. Sitemap.xml + llms.txt („Fit & sizing" sekcja).
5. Renderuję Ci na żywo `/en/size/158mm` (canonical) i `/en/size/160mm` do walidacji tonu/układu.

**Stop. Czekam na akceptację.**

## Faza 2 — Bridge (najwyższy volume: 2 900+ msv)

- Upgrade `/en/collections/keyhole-bridge-glasses` do pełnej struktury z briefu (definicja w pierwszych 40 słowach, anatomy placeholder, who-it-suits, tabela porównawcza, Woolet's take 21/20 mm, FAQ + JSON-LD, cross-linki do size).
- Nowe: `/en/bridge/saddle`, `/en/bridge/double`.
- Nowy komponent `BridgePage.tsx` (shared).
- Hub `/en/guide/bridge-types` + comparison `/en/guide/keyhole-vs-saddle-bridge`.
- Redirect `/en/bridge/keyhole` → istniejąca kolekcja.

## Faza 3 — Temple length

- `/en/temple-length/150mm|155mm|160mm` (template `TempleLengthPage.tsx`, spec-focus na 103 mm temple + 52 mm drop, wyraźne rozróżnienie temple ≠ front width).
- Hub `/en/guide/temple-length`.
- Comparison `/en/guide/140-vs-145-temple-length` (informacyjne, soft CTA do FitLens).

## Faza 4 — XXL / Long temple / Material / Hub

- `/en/xxl-glasses` (nowy — angle „real mm above the fold"; upewnię się intencja różna od big-heads).
- `/en/long-temple-glasses` (nowy).
- `/en/guide/widest-glasses-frame-size` (informacyjne).
- `/en/italian-acetate-frames` → redirect do istniejącej `italian-mazzucchelli-acetate` (jedna intencja) LUB upgrade i alias — zdecyduję po audycie treści.
- Hub `/en/guide/glasses-for-wide-faces` → redirect do istniejącego bloga + upgrade tego bloga o exact-match anchors do wszystkich `/en/size/*` i bridge hub.

## Global

- Nav: pozycja „Size Guide" → hub.
- Footer: kolumny „By size" (150/155/158/160/162) i „By bridge" (keyhole/saddle/double).
- Wszystkie route'y w `sitemap.xml` + `llms.txt`.
- Per-route: unikalne title/meta/canonical/OG/Twitter (przez `SEO.tsx` z `ogDescription`).
- Guardrails: „Hand made in EU" + „Mazzucchelli acetate from Milan, Italy", nigdy „Made in Italy". Nigdy nie obiecuję 165 mm produktu.
- Gold buttons: `#CAA449` bg + `#1F1B16` text (już w tokens).

## Sekcja techniczna (dla dev-reference)

- Route params: preferuję statyczne komponenty per-slug wrapujące shared template (lepszy tree-shaking + explicit prerender) zamiast dynamicznego `:slug`.
- JSON-LD wstrzykiwany przez `SEO` prop `jsonLd`.
- Related-sizes strip: mapa sąsiedztwa w `sizes.ts` (prev/next w tablicy widths).
- Prerender: dopisuję ścieżki do `scripts/prerender.mjs` + workers/route-server bundle build.
- Weryfikacja: po Fazie 1 uruchomię `curl` na zbudowany prerender, żeby potwierdzić `<h1>` w HTML.

## Nie robię (zgodnie z briefem)

- Bez safety glasses.
- Bez odniesień do wallet Woolet 2014–2016.
- Bez duplikatów dla istniejących kolekcji — redirect + upgrade.
