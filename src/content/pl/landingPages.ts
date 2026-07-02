import manualFitImg from "@/assets/manual-fit-measure.png.asset.json";
import ogJakDobrac from "@/assets/og-jak-dobrac-okulary.jpg.asset.json";

export type PlFaq = { q: string; a: string };

export type PlPageConfig = {
  slug: string;
  eyebrow: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  problemH2: string;
  problemBody: string;
  proofH2: string;
  proofBody: string;
  proofBullets: { label: string; value: string }[];
  closingH2: string;
  closingBody: string;
  faqs: PlFaq[];
  englishEquivalent?: string;
  heroImage?: string;
  heroAlt?: string;
  heroCaption?: string;
  ogImage?: string;
  extendedContent?: PlExtendedContent;
};

export type PlExtendedContent = {
  faceShapes?: {
    h2: string;
    intro?: string;
    items: { shape: string; recommendation: string }[];
    counterpoint?: string;
  };
  sizeExplainer?: {
    h2: string;
    intro: string;
    formulaLabel?: string;
    formula?: string;
    bandsTitle?: string;
    bands: { range: string; label: string; highlight?: boolean }[];
  };
  measureSteps?: {
    h2: string;
    steps: { title: string; body: string }[];
    ctaCard: { text: string; ctaLabel: string; ctaHref: string };
  };
  fitRules?: {
    h2: string;
    rules: { title: string; body: string }[];
  };
  brandSection?: {
    h2: string;
    body: string;
    ctas: { label: string; href: string; primary?: boolean }[];
  };
};

export const plPages: Record<string, PlPageConfig> = {
  "okulary-na-zamowienie": {
    slug: "okulary-na-zamowienie",
    eyebrow: "Woolet · Okulary na zamówienie",
    h1: "Okulary na zamówienie — szyte na twoją twarz, co do milimetra",
    sub: "Szerokość frontu od 150 do 165 mm, mostek, zauszniki i wysokość soczewki dobierane indywidualnie. Włoski octan Mazzucchelli 1849, ręcznie wykończony w Unii Europejskiej.",
    metaTitle: "Okulary na zamówienie 150–165 mm | Woolet — włoski octan",
    metaDescription:
      "Okulary na zamówienie dla szerszych twarzy: front 150–165 mm, mostek 16–26 mm, zauszniki dopasowane. Włoski octan Mazzucchelli, ręcznie w UE. Pomiar FitLens w 20 s.",
    primaryKeyword: "okulary na zamówienie",
    ctaPrimaryLabel: "Zmierz twarz (20 s)",
    ctaPrimaryHref: "/pl/fit",
    ctaSecondaryLabel: "Otwórz konfigurator",
    ctaSecondaryHref: "/en/bespoke/configurator",
    problemH2: '„Personalizacja" i „na zamówienie" to nie to samo',
    problemBody:
      'Większość marek nazywających się „customizable" pozwala tylko wybrać kolor istniejącej oprawy. Bespoke Woolet działa inaczej: szerokość frontu, mostek, długość zauszników i wysokość soczewki ustalasz niezależnie, co do milimetra. Forma jest dostosowywana do twojej twarzy zanim octan zostanie wycięty.',
    proofH2: "Włoski octan, wykończony ręcznie",
    proofBody:
      "Używamy octanu Mazzucchelli 1849, produkowanego we Włoszech od ponad 70 lat. Europejskie warsztaty frezują, polerują i osadzają zawiasy w każdej oprawie osobno. Realizacja zajmuje około 4–6 tygodni od potwierdzenia zamówienia.",
    proofBullets: [
      { label: "Szerokość frontu", value: "150 – 165 mm" },
      { label: "Personalizacja", value: "front / mostek / zauszniki / wysokość" },
      { label: "Materiał", value: "Mazzucchelli 1849, włoski octan" },
      { label: "Realizacja", value: "4 – 6 tygodni, ręcznie w UE" },
    ],
    closingH2: "Przestań godzić się na rozmiary standardowe",
    closingBody:
      "Wystarczy jedno zdjęcie, żeby wyznaczyć wymiary. Kolor i kształt wybierasz potem w konfiguratorze online. Produkcja rusza po twoim ostatecznym potwierdzeniu.",
    faqs: [
      {
        q: "Jak daleko można dopasować wymiary?",
        a: "Front: 150–165 mm. Mostek: 16–26 mm. Zauszniki: 135–155 mm. Wysokość soczewki też jest konfigurowalna.",
      },
      {
        q: "Jak wygląda pomiar?",
        a: "FitLens używa aparatu w telefonie i mierzy szerokość twarzy co do milimetra. Wynik trafia bezpośrednio do konfiguratora.",
      },
      {
        q: "Jaki jest czas realizacji?",
        a: "Około 4–6 tygodni od potwierdzenia zamówienia, ręczna produkcja w naszych warsztatach w UE.",
      },
      {
        q: "Czy mogę zwrócić oprawę na zamówienie?",
        a: "Bespoke nie podlega standardowemu zwrotowi, ale w razie problemu z rozmiarem nasza gwarancja Fit pokrywa wykonanie nowej oprawy bez dopłat.",
      },
      {
        q: "Ile to kosztuje?",
        a: "Cena Founding jest zarezerwowana dla osób z listy oczekujących — około 40% poniżej publicznej ceny premierowej.",
      },
    ],
    englishEquivalent: "/en/bespoke",
  },
};

plPages["jak-dobrac-okulary-do-twarzy"] = {
  slug: "jak-dobrac-okulary-do-twarzy",
  eyebrow: "Woolet · Poradnik doboru",
  h1: "Jak dobrać okulary do twarzy — kształt, rozmiar i dopasowanie",
  sub: "Dobór okularów to dwie rzeczy: kształt (estetyka) i rozmiar w milimetrach (komfort). Ten poradnik prowadzi przez obie — plus skan FitLens telefonem w około 20 sekund.",
  metaTitle: "Jak dobrać okulary do twarzy: kształt, rozmiar w mm, dopasowanie (2026) | Woolet",
  metaDescription:
    "Jak dobrać okulary do twarzy krok po kroku: kształt twarzy, rozmiar okularów w milimetrach, szerokość mostka i skan FitLens w 20 sekund. Poradnik 2026.",
  primaryKeyword: "jak dobrać okulary do twarzy",
  ctaPrimaryLabel: "Zmierz twarz (20 s)",
  ctaPrimaryHref: "/en/fit",
  ctaSecondaryLabel: "Zobacz oprawy Woolet",
  ctaSecondaryHref: "/en/collection",
  problemH2: "Dlaczego okulary zsuwają się z nosa albo uciskają skronie",
  problemBody:
    'Większość osób dobiera okulary „na oko" — i dlatego oprawki uciskają skronie, zsuwają się z nosa albo wyglądają na za małe. 90% opraw w salonach ma szerokość frontu 135–148 mm, projektowaną pod przeciętną twarz. Jeśli twoja szerokość między skrońmi przekracza 150 mm, standardowa oprawa dosłownie „siedzi na skroniach" — zostawia ślady, spycha nos i po godzinie boli.',
  proofH2: "Rozmiar w milimetrach jest ważniejszy niż kształt twarzy",
  proofBody:
    "Kształt (owalny, kwadratowy, okrągły) wpływa na estetykę. Ale to szerokość między skrońmi decyduje, czy oprawka fizycznie leży, czy uciska. Woolet projektuje oprawki od zera dla twarzy 155 mm+ — jeden rozmiar stockowy 158 mm, plus bespoke od 150 do 165 mm co 1 mm.",
  proofBullets: [
    { label: "Poniżej 145 mm", value: "Standardowe oprawki z salonów" },
    { label: "145 – 154 mm", value: "Bespoke Woolet (150–154 mm)" },
    { label: "155 mm i więcej", value: "Woolet 007 / 009 — 158 mm" },
    { label: "Powyżej 165 mm", value: "Bespoke Woolet (do 165 mm)" },
  ],
  closingH2: "Zmierz raz, zamawiaj bez ryzyka",
  closingBody:
    "FitLens używa aparatu w telefonie i wyznacza szerokość twarzy, mostka i rozstaw źrenic z jednego zdjęcia — w około 20 sekund. Bez instalacji, bez wysyłania zdjęć. Zdjęcie zostaje w twojej przeglądarce.",
  faqs: [
    {
      q: "Jak dobrać rozmiar okularów?",
      a: "Zmierz szerokość twarzy między skrońmi — na wysokości brwi, tuż przed uszami. Wynik w milimetrach porównaj z całkowitą szerokością oprawki: (szerokość soczewki × 2) + mostek + ok. 10 mm na zawiasy. Woolet 007 i 009 mają szerokość frontu 158 mm — dla twarzy 155 mm i więcej.",
    },
    {
      q: "Jak zmierzyć okulary, które już mam?",
      a: "Trzy liczby wygrawerowane na wewnętrznej stronie zausznika: np. 54 □ 21 – 148. Pierwsza to szerokość soczewki (mm), druga to szerokość mostka, trzecia to długość zausznika. Woolet 007: 52 □ 21 – 148. Woolet 009: 54 □ 22 – 148.",
    },
    {
      q: "Jakie okulary do okrągłej twarzy?",
      a: "Kwadratowe lub prostokątne — dodają kontrastu i optycznie wydłużają twarz. Unikaj okrągłych i owalnych oprawek, które powielają kształt twarzy. Ale najpierw upewnij się, że rozmiar jest odpowiedni — źle dopasowany kształt w dobrym rozmiarze wygląda lepiej niż dobrze dobrany kształt w za wąskiej oprawce.",
    },
    {
      q: "Czy okulary mogą być szersze niż twarz?",
      a: "Tak — do około 5 mm. Za szerokie oprawki wyglądają współcześnie i nie powodują dyskomfortu. Prawdziwym problemem są oprawki za wąskie — uciskają skronie, zsuwają się z nosa i po kilku godzinach powodują ból głowy.",
    },
    {
      q: "Skąd mam wiedzieć, że okulary są za małe?",
      a: 'Trzy sygnały: (1) czerwone ślady po zausznikach za uszami po zdjęciu okularów, (2) ból lub pulsowanie w skroniach po 4–8 godzinach noszenia, (3) źrenice wypadają bliżej wewnętrznej krawędzi soczewek zamiast na środku. Każdy z tych objawów oznacza, że front oprawki jest za wąski — nie da się tego „dotrzeć".',
    },
  ],
  // Intencjonalnie brak englishEquivalent — brak bezpośredniego 1:1 EN.
  // PL blog /pl/blog/jak-zmierzyc-szerokosc-twarzy-do-okularow jest już sparowany z /en/blog/how-to-measure-face-width-for-glasses;
  // dodanie drugiego PL → tego samego EN tworzyłoby konflikt hreflang (dwa PL do jednego EN).
  heroImage: manualFitImg.url,
  heroAlt:
    "Jak dobrać okulary do twarzy — diagram pomiaru szerokości twarzy w milimetrach od skroni do skroni z kartą płatniczą jako miarką odniesienia.",
  heroCaption:
    "Pomiar skroń–skroń kartą płatniczą (85,6 mm) — tak wyznaczasz szerokość oprawek okularów w milimetrach.",
  ogImage: ogJakDobrac.url,
  extendedContent: {
    faceShapes: {
      h2: "Jakie okulary do jakiej twarzy — kształt",
      intro:
        "Pięć podstawowych kształtów twarzy i oprawki, które je najlepiej równoważą. To zasady stylizacji, nie fizyki dopasowania.",
      items: [
        { shape: "Twarz okrągła", recommendation: "Oprawki kwadratowe lub prostokątne — dodają kontrastu i optycznie wydłużają rysy." },
        { shape: "Twarz kwadratowa", recommendation: "Oprawki okrągłe, owalne lub aviator — łagodzą mocną linię szczęki." },
        { shape: "Twarz owalna", recommendation: "Uniwersalna — pasują niemal wszystkie kształty. Trzymaj się szerokości zbliżonej do skroni." },
        { shape: "Twarz w kształcie serca (trójkątna)", recommendation: "Oprawki cięższe u dołu (aviator, bottom-heavy) — balansują szeroką linię czoła." },
        { shape: "Twarz podłużna", recommendation: "Oprawki szerokie i głębokie (large frames) — optycznie skracają twarz." },
      ],
      counterpoint:
        "Kształt to jednak dopiero połowa. Najczęstszy błąd to nie zły kształt — to za wąskie oprawki. Idealny kształt w rozmiarze 140 mm na twarzy 158 mm nadal będzie uciskać skronie.",
    },
    sizeExplainer: {
      h2: "Rozmiar okularów — co znaczą trzy liczby na zauszniku",
      intro:
        "Na wewnętrznej stronie zausznika znajdziesz zapis w stylu 54 □ 21 – 148. To trzy kluczowe wymiary: szerokość soczewki (54 mm), szerokość mostka (21 mm), długość zausznika (148 mm). Całkowita szerokość frontu oprawki to (soczewka × 2) + mostek + ok. 10 mm na zawiasy. Dla 54 □ 21 to 129 mm front — czyli oprawka pod twarz około 125–132 mm.",
      formulaLabel: "Wzór na szerokość frontu",
      formula: "(szerokość soczewki × 2) + mostek + ~10 mm zawiasy",
      bandsTitle: "Bandy szerokości twarzy",
      bands: [
        { range: "poniżej 130 mm", label: "wąska twarz — większość opraw damskich" },
        { range: "130 – 137 mm", label: "standardowa — bestselling range w salonach" },
        { range: "138 – 144 mm", label: "szeroka — jeszcze dostępna w salonach" },
        { range: "145 – 154 mm", label: "bardzo szeroka — trudno znaleźć, głównie bespoke" },
        { range: "155 mm i więcej", label: "poza standardowym rynkiem — Woolet 158 mm", highlight: true },
      ],
    },
    measureSteps: {
      h2: "Jak zmierzyć twarz do okularów w domu",
      steps: [
        {
          title: "Szerokość twarzy",
          body: "Przyłóż linijkę poziomo na wysokości skroni, tuż nad uszami. Zmierz odległość między skrajnymi punktami skroni w milimetrach. To twój master number.",
        },
        {
          title: "Szerokość mostka",
          body: "Zmierz szerokość nosa około 12 mm poniżej linii brwi — w miejscu, w którym siada mostek okularów. Ta wartość to twoja minimalna szerokość mostka.",
        },
        {
          title: "Rozstaw źrenic (PD)",
          body: "Stań przed lustrem, patrz prosto. Zmierz odległość między środkami źrenic. U szerszych twarzy PD często wynosi 65–70 mm — standardowe oprawki mają rozstaw optyczny 60–64 mm.",
        },
      ],
      ctaCard: {
        text: "Nie chcesz mierzyć linijką? FitLens mierzy szerokość twarzy, mostek i rozstaw źrenic z jednego zdjęcia telefonem — w około 20 sekund. Zdjęcie zostaje w twojej przeglądarce.",
        ctaLabel: "Zmierz twarz w 20 sekund",
        ctaHref: "/en/fit",
      },
    },
    fitRules: {
      h2: "Dopasowanie okularów do twarzy — 3 zasady, których używają optycy",
      rules: [
        {
          title: "Zasada źrenic",
          body: "Źrenice powinny wypadać dokładnie na środku soczewek — zarówno w poziomie, jak i w pionie. Jeśli źrenice są bliżej wewnętrznej krawędzi soczewki, oprawka jest za wąska.",
        },
        {
          title: "Zasada kości policzkowych",
          body: "Zewnętrzna krawędź oprawki powinna sięgać krawędzi kości policzkowych — nie wchodzić na nie, nie kończyć się przed nimi. To najprostszy test szerokości frontu.",
        },
        {
          title: "Zasada zero nacisku",
          body: 'Dobrze dobrane okulary trzymają się geometrią — nos plus uszy — a nie ściskaniem głowy. Jeśli po 8 godzinach noszenia bolą cię skronie, oprawki są za wąskie. Tego się nie „dotrze".',
        },
      ],
    },
    brandSection: {
      h2: "A jeśli masz szeroką twarz?",
      body:
        "Standardowe marki kończą się na około 145–148 mm. Woolet projektuje oprawki od zera pod twarze 155 mm+ — jeden rozmiar stockowy 158 mm (front), mostek keyhole 21–22 mm, zauszniki 148 mm. Materiał: włoski acetat Mazzucchelli 1849, ręczne wykończenie we Włoszech. Modele 007 (okrągły) i 009 (kwadratowy). Bespoke: front 150–165 mm co 1 mm.",
      ctas: [
        { label: "Zobacz modele 007 i 009", href: "/en/collection", primary: true },
        { label: "Dołącz do listy VIP", href: "/en/vip-join" },
      ],
    },
  },
};

export const plPageOrder = ["okulary-na-zamowienie", "jak-dobrac-okulary-do-twarzy"] as const;
