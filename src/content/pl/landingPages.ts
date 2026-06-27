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
    problemH2: "„Personalizacja" i „na zamówienie" to nie to samo",
    problemBody:
      "Większość marek nazywających się „customizable" pozwala tylko wybrać kolor istniejącej oprawy. Bespoke Woolet działa inaczej: szerokość frontu, mostek, długość zauszników i wysokość soczewki ustalasz niezależnie, co do milimetra. Forma jest dostosowywana do twojej twarzy zanim octan zostanie wycięty.",
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

export const plPageOrder = ["okulary-na-zamowienie"] as const;
