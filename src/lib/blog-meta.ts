/**
 * CTR-optimized meta title + description per blog post.
 * Kept separate from blog-data.ts so on-page H1/excerpt copy stays untouched.
 *
 * Rules of thumb:
 *  - metaTitle ≤ 60 chars (Google truncates ~580px). Front-load the keyword,
 *    add a benefit or number, brand suffix is added by <SEO/> automatically.
 *  - metaDescription 140–158 chars. Lead with the promise, include the
 *    primary keyword, end with an action or specificity hook.
 */
export interface PostMetaOverride {
  metaTitle: string;
  metaDescription: string;
  /** Optional social preview image override (absolute URL or /path). */
  ogImage?: string;
}

export const blogMetaBySlug: Record<string, PostMetaOverride> = {
  // ── EN: wide-face core ───────────────────────────────────────────────
  "glasses-for-wide-faces-guide": {
    metaTitle: "Glasses for Wide Faces: 2026 Fit Guide (155 mm+)",
    metaDescription:
      "The honest 2026 guide to glasses for wide faces. Measure in 30 seconds, learn why 155 mm+ frames actually fit, and see which shapes work — without guessing.",
  },
  "glasses-for-wide-nose-bridge-21-22mm-explained": {
    metaTitle: "Glasses for a Wide Nose Bridge (21–22 mm Explained)",
    metaDescription:
      "Most frames cap at 18 mm. See what a 21–22 mm bridge changes for a wide nose, why keyhole beats saddle, and which brands actually stock it.",
  },
  "how-to-measure-face-width-for-glasses": {
    metaTitle: "How to Measure Your Face Width for Glasses (30 sec)",
    metaDescription:
      "Measure your face width at home in 30 seconds and pick the right frame size — no optician needed. Includes a size bracket chart for 140–172 mm.",
  },
  "what-is-italian-acetate-premium-eyewear": {
    metaTitle: "What Is Italian Acetate? Mazzucchelli, Explained",
    metaDescription:
      "Italian acetate is the gold standard of premium eyewear. See how Mazzucchelli makes it, why it holds its shape at 155 mm+, and how to spot the real thing.",
  },
  "why-glasses-dont-fit-155mm-problem": {
    metaTitle: "Why Your Glasses Don't Fit: The 155 mm Problem",
    metaDescription:
      "Glasses pinch your temples? It isn't your head — it's the industry. Here's why most frames stop at 148 mm and how the 155 mm problem gets fixed.",
  },
  "round-vs-square-glasses-wide-face": {
    metaTitle: "Round vs Square Glasses for a Wide Face — Which Wins?",
    metaDescription:
      "Round or square for a wide face? See the visual logic, who each shape suits, and how the Woolet 007 and 009 were designed at 158 mm for 155 mm+ faces.",
  },
  "wide-frame-glasses-professionals": {
    metaTitle: "Wide Frame Glasses for Professionals (155 mm+)",
    metaDescription:
      "Office-ready eyewear for 155 mm+ faces. What to look for in wide frames that fit AND command respect — materials, silhouettes, and picks that survive Zoom.",
  },
  "best-glasses-for-big-heads-2026": {
    metaTitle: "Glasses for Big Heads 2026 — Every 150 mm+ Brand",
    metaDescription:
      "Big head glasses frames compared: every brand selling a 150 mm+ front width, by measurement, material and price — plus the 158 mm option built for the size.",
  },
  "best-glasses-for-oval-face": {
    metaTitle: "Best Glasses for an Oval (and Wide) Face — 2026",
    metaDescription:
      "Oval-face advice usually assumes a 140 mm frame. Here's how to pick shapes when your face is oval AND 155 mm+ wide — what works, what doesn't, and why.",
  },
  "do-blue-light-glasses-work-wide-face": {
    metaTitle: "Do Blue Light Glasses Actually Work? Honest 2026 Take",
    metaDescription:
      "What independent studies say about blue-light lenses, when they help, when they don't, and why frame width matters more than the coating on a 155 mm+ face.",
  },
  "best-oversized-sunglasses-big-heads-2026": {
    metaTitle: "Sunglasses for Big Heads — 2026 Guide (155 mm+)",
    metaDescription:
      "Big head sunglasses that fit: 155 mm+ fronts ranked by fit and material, XXL aviator-style options, polarized Cat 3 UV400, and which brands widen the front.",
  },
  "what-size-sunglasses-for-wide-faces": {
    metaTitle: "What Size Sunglasses for a Wide Face? Quick Guide",
    metaDescription:
      "How to pick sunglass size for a wide face: front width, bridge and temple numbers explained — plus a 10-second test using your current glasses.",
  },
  "how-to-tell-if-your-face-is-wide-or-narrow": {
    metaTitle: "How to Tell If Your Face Is Wide or Narrow (Test)",
    metaDescription:
      "A 30-second credit-card test to classify your face width in mm — narrow, average, wide, or extra-wide — and exactly which brands (or bespoke) actually fit each band.",
    ogImage: "/og-how-to-tell-if-your-face-is-wide-or-narrow.jpg",
  },
  "acetate-vs-tr90-glasses": {
    metaTitle: "Acetate vs TR90 vs Plastic Glasses: What Fits a Wide Face",
    metaDescription:
      "Acetate glasses vs plastic and TR90, compared on weight, adjustability, colour and repair — and why a 155 mm+ face needs a frame an optician can reshape.",
  },



  // ── EN: bespoke / process ────────────────────────────────────────────
  "bespoke-eyewear-size-range-150-172mm-guide": {
    metaTitle: "Bespoke Eyewear 150–172 mm — Complete Size Guide",
    metaDescription:
      "Why bespoke eyewear lives between 150 and 172 mm, how sizing really works, and how to know if stock 155–161 mm or a made-to-measure frame is right for you.",
  },
  "made-to-measure-glasses-explained": {
    metaTitle: "Made-to-Measure Glasses: How They Work & Who Needs Them",
    metaDescription:
      "Made-to-measure glasses are built to your face — not the average face. Here's the full process, real costs, timelines, and when stock simply won't fit.",
  },
  "custom-prescription-glasses-for-wide-faces": {
    metaTitle: "Custom Prescription Glasses for Wide Faces (Guide)",
    metaDescription:
      "Custom prescription glasses for 155 mm+ faces — how to pair a wide-fit frame with progressive, single-vision or blue-light lenses without overpaying.",
  },
  "how-much-do-bespoke-glasses-cost": {
    metaTitle: "How Much Do Bespoke Glasses Cost? Real 2026 Prices",
    metaDescription:
      "Bespoke eyewear prices in 2026 — Tom Davies, Cartier, European ateliers and Woolet compared. Why the same handmade frame can cost $300 or $3,000.",
  },
  "handmade-italian-acetate-eyewear-process": {
    metaTitle: "How Handmade Acetate Eyewear Is Really Made",
    metaDescription:
      "From a Mazzucchelli acetate block in Milan to a finished frame, hand made in EU — the steps, the tools, and what 'handmade' should mean in 2026.",
  },
  "handcrafted-vs-machine-made-glasses": {
    metaTitle: "Handcrafted vs Machine-Made Glasses: What Differs",
    metaDescription:
      "What 'handcrafted' really means in eyewear today, where hand meets machine on the bench, and when the premium for handcrafted is actually worth paying.",
  },

  // ── EN: sizing & discovery ───────────────────────────────────────────
  "are-my-glasses-too-small-for-my-face": {
    metaTitle: "Are My Glasses Too Small? 4 Signs & What To Do",
    metaDescription:
      "Four objective signs your glasses are too small — temple pinch, sliding, off-centre lenses, ear indents — and how to size up to a frame that actually fits.",
  },
  "what-size-glasses-for-a-large-head": {
    metaTitle: "What Size Glasses for a Large Head? Bracket Guide",
    metaDescription:
      "Turn 'large head' into a real frame size — bracket by bracket, with the front-width, bridge and temple numbers to look for from 140 mm up to 172 mm.",
  },
  "how-wide-should-glasses-be": {
    metaTitle: "How Wide Should Glasses Be on Your Face? (Rule)",
    metaDescription:
      "Frames pinching or sitting too narrow? Here's the exact width a wide face needs — 155 mm and up — and how to measure yours in 30 seconds.",
  },
  "best-sunglasses-for-wide-faces": {
    metaTitle: "Best Sunglasses for Wide Faces in 2026 (155 mm+)",
    metaDescription:
      "Sunglasses that don't pinch a wider face. The best wide-fit picks of 2026 — 158 mm fronts, keyhole bridges, polarized options, and how to find your size.",
  },
  "wide-face-glasses-for-women": {
    metaTitle: "Wide-Face Glasses for Women — Honest 2026 Fit Guide",
    metaDescription:
      "Most 'women's frames' cap at 138 mm. If your face is 150 mm+, here's what to look for, what to skip, and why width — not shape — is the deciding number.",
  },
  "extra-wide-glasses-158mm": {
    metaTitle: "Extra Wide Glasses for Big Heads & Men (158 mm)",
    metaDescription:
      "Extra wide glasses for big heads and for men, measured. Which frames are genuinely built at a 158 mm front width, which only look large, and how to size up.",
  },

  // ── EN: hats (face-measurement crossover) ────────────────────────────
  "how-to-measure-your-head-for-a-hat": {
    metaTitle: "How to Measure Your Head for a Hat (60 sec, No Tape)",
    metaDescription:
      "Measure your head circumference in 60 seconds and find your true hat size — with or without a tape. Full cm ↔ inches chart, built for 7¾+ heads.",
  },
  "hat-size-chart-guide-cm-inches-us-uk-eu": {
    metaTitle: "Hat Size Chart: US, UK, EU, cm & inches (Full Guide)",
    metaDescription:
      "The one hat sizing chart that reconciles US, UK, EU, cm and inches — plus how to read 7 5/8, what a fitted cap number means, and what to do between sizes.",
  },
  "what-size-hat-do-i-wear-big-heads-guide": {
    metaTitle: "What Size Hat Do I Wear? Big Heads Guide (7¾ and Up)",
    metaDescription:
      "A no-guessing hat size guide for bigger heads. What 7¾, 7⅞ and 8 really mean in cm and inches, how head size tracks height, and where to buy XL fits.",
  },

  // ── PL ───────────────────────────────────────────────────────────────
  "okulary-na-szeroka-twarz-przewodnik": {
    metaTitle: "Okulary na szeroką twarz — przewodnik 2026",
    metaDescription:
      "Uczciwy przewodnik po okularach na szeroką twarz. Zmierz twarz w 30 sekund, sprawdź dlaczego liczy się 155 mm+ i które kształty naprawdę działają.",
  },
  "jak-zmierzyc-szerokosc-twarzy-do-okularow": {
    metaTitle: "Jak zmierzyć szerokość twarzy do okularów (30 sek)",
    metaDescription:
      "Zmierz szerokość twarzy w domu w 30 sekund i dobierz właściwy rozmiar oprawek — bez wizyty u optyka. Prosta metoda i tabela od 140 do 172 mm.",
  },
  "czym-jest-wloski-octan-premium-oprawki": {
    metaTitle: "Włoski octan — czym jest i dlaczego to premium",
    metaDescription:
      "Włoski octan Mazzucchelli to standard premium w oprawach. Jak powstaje, dlaczego trzyma kształt przy 155 mm+ i jak rozpoznać oryginał w sklepie.",
  },
  "dlaczego-okulary-nie-pasuja-problem-155mm": {
    metaTitle: "Dlaczego okulary nie pasują — problem 155 mm",
    metaDescription:
      "Oprawki ściskają skronie? To nie twoja głowa — to branża. Wyjaśniamy problem 155 mm i pokazujemy, gdzie zaczyna się realny szeroki fit.",
  },
  "okragle-czy-kwadratowe-okulary-szeroka-twarz": {
    metaTitle: "Okrągłe czy kwadratowe okulary na szeroką twarz?",
    metaDescription:
      "Który kształt pasuje do szerokiej twarzy? Wizualna logika okrągłych i kwadratowych opraw oraz jak modele Woolet 007 i 009 zostały zaprojektowane na 158 mm.",
  },
  "okulary-na-szeroka-twarz-dla-profesjonalistow": {
    metaTitle: "Okulary dla profesjonalistów z szeroką twarzą (155 mm+)",
    metaDescription:
      "Biurowe oprawy dla twarzy 155 mm+. Na co zwrócić uwagę: materiały, sylwetki i propozycje, które wyglądają dobrze zarówno w gabinecie, jak i na Zoomie.",
  },
  "najlepsze-okulary-na-duza-glowe-2026": {
    metaTitle: "Najlepsze okulary na dużą głowę w 2026 (155 mm+)",
    metaDescription:
      "Porównanie najszerszych opraw dostępnych w 2026: szerokość frontu, mostek keyhole, materiał. Z realną opcją 158 mm dla naprawdę dużych głów.",
  },

  // ── DE ───────────────────────────────────────────────────────────────
  "beste-brillen-fuer-grosse-koepfe-2026": {
    metaTitle: "Beste Brillen für große Köpfe 2026 — echte Breiten",
    metaDescription:
      "Die breitesten Brillen, die du 2026 wirklich kaufen kannst. Verglichen nach Frontbreite, Keyhole-Steg und Material — mit einer 158-mm-Option, die auf große Köpfe passt.",
    ogImage: "/og-best-glasses-for-big-heads-2026.png",
  },
  "welche-groesse-sonnenbrille-breites-gesicht": {
    metaTitle: "Welche Sonnenbrille bei breitem Gesicht? Kurzguide",
    metaDescription:
      "So findest du die richtige Sonnenbrillengröße für ein breites Gesicht: Frontbreite, Steg und Bügel erklärt — plus 10-Sekunden-Test mit deiner aktuellen Brille.",
  },

  // ── NL ───────────────────────────────────────────────────────────────
  "beste-brillen-voor-brede-hoofden-2026": {
    metaTitle: "Beste brillen voor grote hoofden 2026 — echte breedtes",
    metaDescription:
      "De breedste brillen die je in 2026 echt kunt kopen. Vergeleken op frontbreedte, sleutelgatbrug en materiaal — met een 158 mm-optie die op grote hoofden past.",
    ogImage: "/og-best-glasses-for-big-heads-2026.png",
  },
  "welke-maat-zonnebril-voor-breed-gezicht": {
    metaTitle: "Welke zonnebril bij een breed gezicht? Snelle gids",
    metaDescription:
      "Zo vind je de juiste zonnebrilmaat voor een breed gezicht: frontbreedte, brug en veren uitgelegd — plus een 10-secondentest met je huidige bril.",
  },

  // ── FR ───────────────────────────────────────────────────────────────
  "meilleures-lunettes-pour-grosses-tetes-2026": {
    metaTitle: "Meilleures lunettes pour grosses têtes 2026 — vraies largeurs",
    metaDescription:
      "Les montures les plus larges vraiment disponibles en 2026. Comparées par largeur de face, pont keyhole et matière — avec une option 158 mm qui va aux grosses têtes.",
    ogImage: "/og-best-glasses-for-big-heads-2026.png",
  },
  "quelle-taille-de-lunettes-de-soleil-visage-large": {
    metaTitle: "Quelle taille de solaires pour un visage large ? Guide rapide",
    metaDescription:
      "Comment choisir la taille de solaires pour un visage large : largeur de face, pont et branches expliqués — plus un test 10 s avec vos lunettes actuelles.",
  },
};
