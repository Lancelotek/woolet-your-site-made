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
  englishEquivalent: string;
  heroImage?: string;
  heroAlt?: string;
  heroCaption?: string;
  ogImage?: string;
};

export const plPages: Record<string, PlPageConfig> = {
  "okulary-na-zamowienie": {
    slug: "okulary-na-zamowienie",
    eyebrow: "Woolet · Okulary na zamówienie",
    h1: "Okulary na zamówienie — szyte na twoją twarz, co do milimetra",
    sub: "Szerokość frontu od 150 do 172 mm, mostek, zauszniki i wysokość soczewki dobierane indywidualnie. Włoski octan Mazzucchelli 1849, ręcznie wykończony w Unii Europejskiej.",
    metaTitle: "Okulary na zamówienie 150–172 mm | Woolet — włoski octan",
    metaDescription:
      "Okulary na zamówienie dla szerszych twarzy: front 150–172 mm, mostek 16–26 mm, zauszniki dopasowane. Włoski octan Mazzucchelli, ręcznie w UE. Pomiar FitLens w 20 s.",
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
      { label: "Szerokość frontu", value: "150 – 172 mm" },
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
        a: "Front: 150–172 mm. Mostek: 16–26 mm. Zauszniki: 135–155 mm. Wysokość soczewki też jest konfigurowalna.",
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
  h1: "Jak dobrać okulary do twarzy — przewodnik po szerokości i kształcie",
  sub: "Zmierz szerokość twarzy w 20 sekund telefonem albo miarką krawiecką i sprawdź, która oprawa (155, 158 czy 161 mm) będzie leżeć bez zsuwania i uciskania skroni.",
  metaTitle: "Jak dobrać okulary do twarzy — rozmiar oprawek 155–172 mm | Woolet",
  metaDescription:
    "Jak dobrać okulary do twarzy: zmierz szerokość między skrońmi i dopasuj oprawę 155, 158 lub 161 mm. Poradnik + darmowy pomiar FitLens w 20 sekund. Włoski octan Mazzucchelli.",
  primaryKeyword: "jak dobrać okulary do twarzy",
  ctaPrimaryLabel: "Zmierz twarz (20 s)",
  ctaPrimaryHref: "/pl/fit",
  ctaSecondaryLabel: "Zobacz oprawy 155–161 mm",
  ctaSecondaryHref: "/en/collection",
  problemH2: "Dlaczego okulary zsuwają się z nosa albo uciskają skronie",
  problemBody:
    "90% oprawek dostępnych w salonach ma szerokość frontu 135–148 mm — projektowaną pod przeciętną szerokość twarzy. Jeśli twoja twarz między skrońmi ma powyżej 150 mm, standardowa oprawa dosłownie „siedzi na skroniach”, zostawia ślady i po godzinie boli. Za wąska oprawa spycha też nos do przodu, przez co okulary zsuwają się, choć zauszniki są dokręcone.",
  proofH2: "Wystarczy jeden pomiar — szerokość między skrońmi",
  proofBody:
    "Nie musisz znać kształtu twarzy (owalny, kwadratowy, serce). Do doboru rozmiaru oprawy liczy się jeden wymiar: szerokość między skrońmi w milimetrach. Zmierz miarką krawiecką od jednej skroni do drugiej — na wysokości brwi, tuż przed uszami. Ten wynik mapujemy na konkretną oprawę.",
  proofBullets: [
    { label: "Poniżej 145 mm", value: "Bespoke wąski (150 mm)" },
    { label: "145 – 155 mm", value: "Oprawa 155 mm" },
    { label: "155 – 160 mm", value: "Oprawa 158 mm" },
    { label: "Powyżej 160 mm", value: "Oprawa 161 mm lub bespoke (do 172)" },
  ],
  closingH2: "Zmierz raz, zamawiaj bez ryzyka",
  closingBody:
    "FitLens używa aparatu w telefonie i wyznacza szerokość twarzy z dokładnością do milimetra w 20 sekund — bez instalacji, bez wysyłania zdjęć. Wynik od razu mówi, która oprawa Woolet będzie leżeć.",
  faqs: [
    {
      q: "Jak dobrać rozmiar okularów do twarzy bez wizyty w salonie?",
      a: "Zmierz szerokość twarzy między skrońmi miarką krawiecką (na wysokości brwi, tuż przed uszami). Wynik w milimetrach odpowiada szerokości frontu oprawy: 145–155 mm → oprawa 155 mm, 155–160 mm → 158 mm, powyżej 160 mm → 161 mm lub bespoke.",
    },
    {
      q: "Co jest ważniejsze — kształt twarzy czy szerokość?",
      a: "Szerokość. Kształt (owalny, okrągły, kwadratowy) wpływa na estetykę, ale to szerokość między skrońmi decyduje, czy oprawa fizycznie leży, czy uciska. Najpierw dobierz rozmiar, potem kształt.",
    },
    {
      q: "Jak zmierzyć szerokość twarzy telefonem?",
      a: "Nasze narzędzie FitLens używa aparatu w telefonie i wyznacza szerokość twarzy z dokładnością do milimetra w około 20 sekund. Nie zapisujemy zdjęć — pomiar odbywa się lokalnie w przeglądarce.",
    },
    {
      q: "Czy oprawki 155 mm i wyżej pasują tylko do mężczyzn?",
      a: "Nie. Około 1 na 4 kobiety ma szerokość twarzy powyżej 148 mm i standardowe damskie oprawki (130–142 mm) są dla nich za wąskie. Rozmiar oprawki nie ma płci — liczy się liczba w milimetrach.",
    },
    {
      q: "Co jeśli mam szerokość poniżej 145 mm?",
      a: "Standardowa kolekcja Woolet startuje od 155 mm i jest zaprojektowana dla szerszych twarzy. Poniżej 145 mm warto rozważyć zwykłe oprawki dostępne w salonach albo naszą opcję bespoke (od 150 mm).",
    },
  ],
  englishEquivalent: "/en/fit/manual",
  heroImage: manualFitImg.url,
  heroAlt:
    "Jak dobrać okulary do twarzy — diagram pomiaru szerokości twarzy w milimetrach od skroni do skroni z kartą płatniczą jako miarką odniesienia.",
  heroCaption:
    "Pomiar skroń–skroń kartą płatniczą (85,6 mm) — tak wyznaczasz szerokość oprawek okularów w milimetrach.",
  ogImage: ogJakDobrac.url,
};

export const plPageOrder = ["okulary-na-zamowienie", "jak-dobrac-okulary-do-twarzy"] as const;
