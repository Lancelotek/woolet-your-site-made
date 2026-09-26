export type DeFaq = { q: string; a: string };

export type DeTable = { caption: string; headers: string[]; rows: string[][] };

export type DeContextLink = { before: string; anchor: string; href: string; after: string };

export type DePageConfig = {
  slug: string;
  h1: string;
  h1Pre: string;
  h1Em: string;
  h1Post: string;
  sub: string;
  heroAlt: string;
  /** "Kurze Antwort" block rendered directly under the H1 (40-60 words). */
  quickAnswer?: string;
  problemTitle: string;
  problemBody: string;
  detailTitle: string;
  detailBody: string;
  /** Contextual in-body link (rendered as a paragraph in the problem section). */
  contextLink?: DeContextLink;
  table?: DeTable;
  extraSection?: { title: string; body: string };
  related: string[];
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  /** English page used for hreflang en + x-default. */
  englishEquivalent?: string;
  faqs?: DeFaq[];
};

export const DEFAULT_FAQS: DeFaq[] = [
  {
    q: "Woher weiß ich, welche Größe ich brauche?",
    a: "Nutze FitLens: Die Kamera misst deine Gesichtsbreite in Millimetern und zeigt, ob die 158 mm Standardfront passt oder Bespoke (145-172 mm) sinnvoller ist. Dauert etwa 20 Sekunden, läuft komplett im Browser.",
  },
  {
    q: "Ab welcher Gesichtsbreite ist Woolet sinnvoll?",
    a: "Standardfassungen enden meist bei 135-145 mm. Die Woolet-Standardfront mit 158 mm passt bei 155-161 mm Gesichtsbreite. Außerhalb davon fertigt Woolet Bespoke von 145 bis 172 mm.",
  },
  {
    q: "Aus welchem Material sind die Fassungen?",
    a: "Italienisches Mazzucchelli-1849-Acetat, in der EU handgefertigt, mit Keyhole-Steg für breitere Nasen.",
  },
  {
    q: "Kann ich Sehstärke einsetzen lassen?",
    a: "Ja. Alle Fassungen sind verglasungsfertig (Einstärken- und Gleitsichtgläser möglich).",
  },
  {
    q: "Wann ist Woolet erhältlich?",
    a: "Der Shop ist bis zum Ende der Kickstarter-Kampagne ausverkauft. Bestellen heißt aktuell: Mit einer Reservierung für 1 € sicherst du dir den Founding-Member-Preis.",
  },
];

const FACE_SCALE_TABLE: DeTable = {
  caption: "Skala der Gesichtsbreite für Brillen",
  headers: ["Gesichtsbreite (mm)", "Einordnung", "Passende Option"],
  rows: [
    ["unter 130 mm", "Schmal", "Standardgrößen im Handel"],
    ["130-137 mm", "Standard", "Standardgrößen im Handel"],
    ["138-144 mm", "Breit", "Breite Größen im Handel"],
    ["145-154 mm", "Extra breit", "Woolet Bespoke (145-172 mm Front)"],
    ["155 mm und mehr", "XL / Spezialbreite", "Woolet 007 oder 009 mit 158 mm Front (155-161 mm); darüber Bespoke"],
  ],
};

const FACE_TO_FRONT_TABLE: DeTable = {
  caption: "Gesichtsbreite und empfohlene Frontbreite",
  headers: ["Gesichtsbreite (mm)", "Empfohlene Frontbreite (mm)", "Woolet-Option"],
  rows: [
    ["unter 145 mm", "unter 145 mm", "Standardgrößen im Handel"],
    ["145-154 mm", "145-157 mm", "Bespoke"],
    ["155-161 mm", "158 mm", "Standard: 007 oder 009"],
    ["über 161 mm", "bis 172 mm", "Bespoke"],
  ],
};

const SPEC_TABLE: DeTable = {
  caption: "Woolet Standardmaße (158 mm Front)",
  headers: ["Modell", "Form", "Front (mm)", "Steg (mm)", "Bügel (mm)"],
  rows: [
    ["Woolet 007", "Rund / Panto", "158", "21 (Keyhole)", "150"],
    ["Woolet 009", "Soft Square", "158", "22 (Keyhole)", "150"],
  ],
};

const BIG_HEADS_LINK_HREF = "/de/brillen-fuer-grosse-koepfe";

export const dePages: Record<string, DePageConfig> = {
  "brille-fuer-breites-gesicht": {
    slug: "brille-fuer-breites-gesicht",
    h1: "Brillen für breite Gesichter - endlich eine Passform, die sitzt",
    h1Pre: "Brillen für ",
    h1Em: "breite Gesichter",
    h1Post: " - endlich eine Passform, die sitzt.",
    sub: "Italienisches Acetat, entwickelt für breitere Gesichter: 158 mm Standardfront für 155-161 mm Gesichtsbreite, Bespoke von 145-172 mm. Schluss mit Brillen, die nach einer Stunde an den Schläfen drücken.",
    heroAlt: "Greg trägt die 158 mm breite Woolet 009 Brille für ein breites Gesicht",
    problemTitle: "Warum normale Brillen auf breiten Gesichtern drücken",
    problemBody: "Viele Standardfassungen enden bei 135-145 mm. Auf einem breiteren Gesicht klemmen sie an den Schläfen, die Bügel stehen nach außen oder die Gläser enden vor der Gesichtskante. Woolet wurde von Grund auf für breite Gesichter konstruiert.",
    detailTitle: "Welche Brillenbreite passt zu einem breiten Gesicht?",
    detailBody: "Der Woolet-Standard ist eine 158 mm breite Front für 155-161 mm Gesichtsbreite. Der 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel sind auf dieselbe breite Passform abgestimmt. Außerhalb dieses Bereichs deckt Woolet Bespoke 145-172 mm ab.",
    related: ["breite-brille", "brille-grosse-koepfe"],
    metaTitle: "Brille für breites Gesicht | Woolet - 158 mm aus italienischem Acetat",
    metaDescription:
      "Drückt jede Brille an den Schläfen? Woolet: 158 mm Front für 155-161 mm Gesichtsbreite, Bespoke 145-172 mm, in der EU handgefertigt aus Mazzucchelli-Acetat.",
    primaryKeyword: "brille für breites gesicht",
    faqs: [
      { q: "Welche Brille passt zu einem breiten Gesicht?", a: "Entscheidend ist die gesamte Frontbreite. Der Woolet-Standard hat 158 mm Front für 155-161 mm Gesichtsbreite, dazu 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel. Bespoke deckt 145-172 mm ab." },
      { q: "Wie messe ich die Breite meines Gesichts?", a: "FitLens misst deine Gesichtsbreite mit der Handykamera im Browser. Alternativ kannst du eine gut sitzende Brille von außen nach außen messen." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "breite-brille": {
    slug: "breite-brille",
    h1: "Breite Brille: 158 mm Standard und Bespoke 145-172 mm",
    h1Pre: "Breite Brille mit ",
    h1Em: "158 mm Front",
    h1Post: " - nicht nur large im Namen.",
    sub: "Fassungen, die wirklich breit sind - nicht „large“ im Namen, sondern in Millimetern: 158 mm Standardfront, Bespoke von 145-172 mm.",
    heroAlt: "Greg trägt eine breite Woolet 009 Acetatbrille mit 158 mm Frontbreite",
    problemTitle: "Was eine breite Brille wirklich breit macht",
    problemBody: "Nicht die Bezeichnung XL entscheidet, sondern die gesamte Frontbreite. Dazu kommen ein passender Nasensteg und lange Bügel. Woolet kombiniert 158 mm Frontbreite mit 21 oder 22 mm Keyhole-Steg und 150 mm Bügellänge.",
    detailTitle: "Frontbreite, Steg und Bügel müssen zusammenpassen",
    detailBody: "Eine breite Front allein reicht nicht. Modell 007 misst 52□21-150, Modell 009 misst 54□22-150. So bleiben Proportionen, Auflage und Bügelverlauf auf eine breite Passform abgestimmt.",
    contextLink: {
      before: "Wenn nicht nur das Gesicht, sondern der ganze Kopf breit ist, erklärt unser Ratgeber zu ",
      anchor: "Brillen für große Köpfe",
      href: BIG_HEADS_LINK_HREF,
      after: " die Skala der Gesichtsbreite in Millimetern.",
    },
    related: ["brille-breite-160-mm", "brille-fuer-breites-gesicht"],
    metaTitle: "Breite Brille (158 mm) | Woolet - Fassungen für breite Gesichter",
    metaDescription:
      "Breite Brillen mit 158 mm Front für 155-161 mm Gesichtsbreite, Bespoke 145-172 mm. In der EU handgefertigt aus italienischem Acetat. FitLens in 20 Sekunden.",
    primaryKeyword: "breite brille",
    faqs: [
      { q: "Was bedeutet breite Brille in Millimetern?", a: "Gemeint ist die gesamte Breite der Fassungsfront. Der Woolet-Standard hat 158 mm und passt bei 155-161 mm Gesichtsbreite; Bespoke deckt 145-172 mm ab." },
      { q: "Warum sind Nasensteg und Bügellänge wichtig?", a: "Eine breite Front passt nur als Gesamtsystem. Woolet kombiniert sie mit 21 oder 22 mm Keyhole-Steg und 150 mm langen Bügeln." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brille-grosse-koepfe": {
    slug: "brille-grosse-koepfe",
    h1: "Brillen für große Köpfe - ohne Druck an den Schläfen",
    h1Pre: "Brillen für ",
    h1Em: "große Köpfe",
    h1Post: " - ohne Druck an den Schläfen.",
    sub: "Wenn dir jede Fassung zu eng ist: Woolet ist von Grund auf für größere Köpfe gebaut. 158 mm Standardfront, Bespoke bis 172 mm.",
    heroAlt: "Greg trägt eine Woolet 009 Brille für einen großen Kopf und ein breites Gesicht",
    problemTitle: "Welche Brillengröße eignet sich für einen großen Kopf?",
    problemBody: "Bei einem großen Kopf ist die Frontbreite aussagekräftiger als ein unklarer XL-Aufdruck. Bei 155-161 mm Gesichtsbreite (etwa 58-62 cm Kopfumfang) ist die 158 mm Front der passende Standard. FitLens misst direkt am Gesicht.",
    detailTitle: "Großer Kopf ist nicht dasselbe wie Oversized-Look",
    detailBody: "Eine passende Brille folgt der tatsächlichen Kopf- und Gesichtsbreite. Sie muss nicht überzeichnet wirken. Woolet 007 und 009 verbinden eine breite Konstruktion mit klaren, ausgewogenen Proportionen und 150 mm langen Bügeln.",
    related: ["xxl-brille-herren", "brille-fuer-breites-gesicht"],
    metaTitle: "Brille für große Köpfe | Woolet - 158 mm, italienisches Acetat",
    metaDescription:
      "Brillen für große Köpfe, die nicht drücken. 158 mm Front aus italienischem Mazzucchelli-Acetat, in der EU handgefertigt; Bespoke 145-172 mm. FitLens in 20 s.",
    primaryKeyword: "brille für große köpfe",
    faqs: [
      { q: "Welche Brillengröße passt bei einem großen Kopf?", a: "Bei 155-161 mm Gesichtsbreite (etwa 58-62 cm Kopfumfang) passt die 158 mm Front. Außerhalb davon fertigt Bespoke 145-172 mm. FitLens misst direkt am Gesicht." },
      { q: "Ist eine Brille für große Köpfe automatisch oversized?", a: "Nein. Eine breite Fassung kann ausgewogene Proportionen haben. Woolet 007 und 009 sind breit konstruiert, ohne nur die Gläser optisch zu vergrößern." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "xxl-brille-herren": {
    slug: "xxl-brille-herren",
    h1: "XXL Brille für Herren - 158 mm breite Fassungen",
    h1Pre: "XXL Brille für Herren - ",
    h1Em: "158 mm",
    h1Post: " echte Frontbreite.",
    sub: "Männliche Gesichter, echte Breite: Woolet-Fassungen mit 158 mm Front, Bespoke von 145-172 mm. Italienisches Acetat, klare Formen.",
    heroAlt: "Greg trägt die XXL Herrenbrille Woolet 009 aus Havanna-Acetat",
    problemTitle: "XXL-Herrenbrillen brauchen mehr als große Gläser",
    problemBody: "Bei vielen Oversized-Fassungen wachsen nur die Gläser, während Steg und Bügel für Standardköpfe bleiben. Woolet stimmt Frontbreite, Keyhole-Steg und 150 mm lange Bügel als ein System auf größere Köpfe ab.",
    detailTitle: "007 rund oder 009 eckig?",
    detailBody: "Woolet 007 ist eine runde Panto-Form mit 52□21-150. Woolet 009 ist eine weiche eckige Form mit 54□22-150. Beide sind als Korrektionsbrille oder mit UV400-Sonnengläsern erhältlich.",
    contextLink: {
      before: "Welche Breite bei einem breiten Männerkopf passt, zeigt unsere Übersicht ",
      anchor: "Brillen für große und breite Köpfe",
      href: BIG_HEADS_LINK_HREF,
      after: " mit Maßtabelle von unter 130 bis über 155 mm.",
    },
    related: ["brille-grosse-koepfe", "breite-brille"],
    metaTitle: "XXL Brille Herren | Woolet - breite Herrenfassungen, 158 mm",
    metaDescription:
      "XXL Brillen für Herren mit breitem Gesicht oder großem Kopf. 158 mm Front, Bespoke 145-172 mm, italienisches Acetat, in der EU handgefertigt. FitLens-Scan.",
    primaryKeyword: "xxl brille herren",
    faqs: [
      { q: "Welche Form gibt es bei der XXL Brille für Herren?", a: "Woolet 007 ist eine runde Panto-Form. Woolet 009 ist weich-eckig. Beide Modelle sind für breite Gesichter konstruiert." },
      { q: "Gibt es die XXL Herrenbrille auch als Sonnenbrille?", a: "Ja. Beide Fassungen können mit UV400-Sonnengläsern oder mit Korrektionsgläsern ausgestattet werden." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brille-breite-160-mm": {
    slug: "brille-breite-160-mm",
    h1: "Brille mit ~160 mm Breite - die Größe, die der Markt ignoriert",
    h1Pre: "Brille mit ",
    h1Em: "rund 160 mm Breite",
    h1Post: " - präzise statt ungefähr.",
    sub: "Du suchst nach einer Brille mit rund 160 mm Frontbreite? Der Woolet-Standard hat 158 mm, Bespoke fertigt jede Breite von 145-172 mm.",
    heroAlt: "Greg trägt eine 158 mm breite Woolet 009 als Alternative zur 160 mm Brille",
    problemTitle: "Gibt es eine Brille mit genau 160 mm Breite?",
    problemBody: "Woolet bietet keine Standardfassung mit exakt 160 mm. Der Standard ist eine 158 mm breite Front für 155-161 mm Gesichtsbreite. Für ein exaktes Maß wie 160 mm gibt es Woolet Bespoke von 145-172 mm.",
    detailTitle: "158 mm Standard oder 160 mm Bespoke?",
    detailBody: "Liegt deine Gesichtsbreite zwischen 155 und 161 mm, ist 158 mm der passende Standard. Brauchst du exakt 160 mm, fertigt Bespoke deine Front auf den Millimeter - 480 USD inklusive Standardgläsern. FitLens misst deine Gesichtsbreite im Browser.",
    contextLink: {
      before: "Mehr zur Passform bei breiten Köpfen, inklusive Sonnenbrillen, findest du im Ratgeber ",
      anchor: "Brillen für große Köpfe",
      href: BIG_HEADS_LINK_HREF,
      after: ".",
    },
    related: ["breite-brille", "brille-fuer-breites-gesicht"],
    metaTitle: "Brille 160 mm Breite (Herren) | Woolet 158 mm & Bespoke",
    metaDescription:
      "Brille mit ca. 160 mm Breite: Woolet-Standard 158 mm für 155-161 mm Gesichtsbreite, Bespoke 145-172 mm. Mit FitLens die Breite in 20 Sekunden messen.",
    primaryKeyword: "brille breite 160 mm",
    englishEquivalent: "/en/collection",
    faqs: [
      { q: "Gibt es bei Woolet eine Brille mit genau 160 mm Breite?", a: "Nicht als Standard. Der Standard hat 158 mm Front. Für ein exaktes Maß zwischen 145 und 172 mm, also auch 160 mm, gibt es Woolet Bespoke." },
      { q: "Reichen 158 mm, wenn ich 160 mm gesucht habe?", a: "Die 158 mm Front passt bei 155-161 mm Gesichtsbreite. FitLens misst deine Gesichtsbreite und zeigt, ob der Standard oder Bespoke sinnvoller ist." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brillen-fuer-grosse-koepfe": {
    slug: "brillen-fuer-grosse-koepfe",
    h1: "Brillen für große Köpfe - für Männer mit breitem Kopf",
    h1Pre: "Brillen für ",
    h1Em: "große Köpfe",
    h1Post: " - für Männer mit breitem Kopf.",
    sub: "Brillen und Sonnenbrillen für große und breite Köpfe: 158 mm Front für 155-161 mm Gesichtsbreite, Bespoke von 145-172 mm.",
    heroAlt: "Greg trägt die Woolet 009 als Brille für einen großen, breiten Kopf",
    quickAnswer:
      "Für einen großen Kopf zählt die Gesichtsbreite von Schläfe zu Schläfe: Ab 155 mm brauchst du eine Front von rund 158 mm, Standardfassungen enden meist bei 135-145 mm. Woolet 007 und 009 haben 158 mm Front für 155-161 mm Gesichtsbreite; außerhalb davon fertigt Woolet Bespoke von 145 bis 172 mm.",
    problemTitle: "Welche Brille passt zu einem großen oder breiten Kopf?",
    problemBody: "Bei breiten Köpfen, vor allem bei Männern, ist nicht das Glas das Problem, sondern die Frontbreite. Ist die Front schmaler als das Gesicht, drücken die Bügel an den Schläfen. Miss deine Gesichtsbreite und ordne sie in die Tabelle unten ein.",
    detailTitle: "Brille für großen Kopf: 158 mm Standard, Bespoke für alles dazwischen",
    detailBody: "Woolet 007 (52□21-150) und 009 (54□22-150) haben eine 158 mm Front, einen Keyhole-Steg und 150 mm lange Bügel. Liegt deine Gesichtsbreite außerhalb von 155-161 mm, fertigt Bespoke deine Front zwischen 145 und 172 mm - 480 USD inklusive Standardgläsern.",
    table: FACE_SCALE_TABLE,
    extraSection: {
      title: "Sonnenbrille für große Köpfe und breite Köpfe",
      body: "Eine Sonnenbrille für einen großen Kopf braucht dieselbe Frontbreite wie eine Korrektionsbrille - größere Gläser allein lösen den Druck an den Schläfen nicht. Woolet 007 und 009 gibt es mit UV400-Sonnengläsern auf derselben 158 mm Front, mit 21 bzw. 22 mm Keyhole-Steg und 150 mm Bügeln.",
    },
    related: ["xxl-brille-herren", "brille-breite-158-mm"],
    metaTitle: "Brillen für große Köpfe (Herren) | 158 mm Front | Woolet",
    metaDescription:
      "Brillen für große und breite Köpfe: 158 mm Front für 155-161 mm Gesichtsbreite, Bespoke 145-172 mm. Auch als Sonnenbrille. Mit Maßtabelle und FitLens.",
    primaryKeyword: "brillen für große köpfe",
    englishEquivalent: "/en/collections/glasses-for-big-heads",
    faqs: [
      { q: "Welche Brillengröße brauche ich bei einem großen Kopf?", a: "Ab 155 mm Gesichtsbreite ist eine 158 mm breite Front der passende Standard. Woolet 007 und 009 passen bei 155-161 mm; außerhalb davon fertigt Bespoke 145-172 mm." },
      { q: "Gibt es Brillen für breite Köpfe speziell für Männer?", a: "Ja. Woolet 007 (Rund / Panto) und 009 (Soft Square) sind für breite Männerköpfe konstruiert, mit 158 mm Front, Keyhole-Steg und 150 mm Bügeln." },
      { q: "Gibt es eine Sonnenbrille für einen großen Kopf?", a: "Ja. Beide Modelle gibt es mit UV400-Sonnengläsern auf derselben 158 mm Front." },
      { q: "Wie kann ich jetzt bestellen?", a: "Der Shop ist bis zum Ende der Kickstarter-Kampagne ausverkauft. Mit einer Reservierung für 1 € sicherst du dir den Founding-Member-Preis." },
    ],
  },
  "brille-breite-150-mm": {
    slug: "brille-breite-150-mm",
    h1: "Brille mit 150 mm Breite - ehrlich: nur als Bespoke",
    h1Pre: "Brille mit ",
    h1Em: "150 mm Breite",
    h1Post: " - ehrlich: nur als Bespoke.",
    sub: "150 mm Frontbreite fertigen wir auf Maß (Bespoke, 145-172 mm). Unser Standard ist 158 mm für 155-161 mm Gesichtsbreite.",
    heroAlt: "Greg trägt eine Woolet 009 Acetatbrille mit breiter Front",
    quickAnswer:
      "Eine Brille mit 150 mm Frontbreite gehört zur Kategorie für Gesichter mit 145-154 mm Breite (Extra breit). Woolet bietet 150 mm nur als Bespoke an: 145-172 mm Front, 480 USD inklusive Standardgläsern. Die Standardmodelle 007 und 009 haben 158 mm Front und passen bei 155-161 mm Gesichtsbreite.",
    problemTitle: "Gibt es bei Woolet eine Brille mit 150 mm Breite?",
    problemBody: "Nicht als Standardmodell. Unsere Standardfront misst 158 mm. Eine 150 mm breite Front bauen wir als Bespoke nach deinen Maßen - aus demselben italienischen Mazzucchelli-Acetat, in der EU handgefertigt.",
    detailTitle: "Wann ist 150 mm die richtige Breite?",
    detailBody: "Liegt deine Gesichtsbreite bei 145-154 mm, ist eine Front zwischen 145 und 157 mm sinnvoll - das deckt Bespoke ab. Ab 155 mm Gesichtsbreite passt der 158 mm Standard. FitLens misst deine Gesichtsbreite im Browser.",
    table: FACE_TO_FRONT_TABLE,
    related: ["brillen-fuer-grosse-koepfe", "breite-brille"],
    metaTitle: "Brille 150 mm breit (Herren) | Bespoke 145-172 mm | Woolet",
    metaDescription:
      "Brille mit 150 mm Breite? Bei Woolet nur als Bespoke (145-172 mm, 480 USD). Standard ist 158 mm für 155-161 mm Gesichtsbreite. Tabelle Gesicht zu Front.",
    primaryKeyword: "brille breite 150 mm",
    englishEquivalent: "/en/size/150mm",
    faqs: [
      { q: "Gibt es eine Woolet-Brille mit 150 mm Breite?", a: "Nur als Bespoke. Bespoke fertigt Fronten von 145 bis 172 mm für 480 USD inklusive Standardgläsern. Der Standard hat 158 mm." },
      { q: "Für welche Gesichtsbreite passt eine 150 mm breite Brille?", a: "Für Gesichter mit etwa 145-154 mm Breite ist eine Front zwischen 145 und 157 mm sinnvoll. Ab 155 mm Gesichtsbreite passt der 158 mm Standard." },
      { q: "Wie lange dauert Bespoke?", a: "Die Fertigung dauert 2 Wochen nach Freigabe des 3D-Modells, danach folgt der Versand. Handgefertigt in der EU." },
    ],
  },
  "brille-breite-155-mm": {
    slug: "brille-breite-155-mm",
    h1: "Brille für 155 mm Gesichtsbreite - der Anfang unseres Bereichs",
    h1Pre: "Brille für ",
    h1Em: "155 mm",
    h1Post: " - der Anfang unseres Bereichs.",
    sub: "155 mm ist die Untergrenze unseres Passbereichs: Die 158 mm Front von Woolet 007 und 009 passt bei 155-161 mm Gesichtsbreite.",
    heroAlt: "Greg trägt die Woolet 009 mit 158 mm Front",
    quickAnswer:
      "Bei 155 mm Gesichtsbreite ist eine 158 mm breite Front der passende Standard. 155 mm ist die Untergrenze des Passbereichs von Woolet 007 und 009, die bei 155-161 mm Gesichtsbreite passen. Wer eine Front von exakt 155 mm möchte, bekommt sie als Bespoke (145-172 mm, 480 USD).",
    problemTitle: "Passt eine Woolet-Brille bei 155 mm?",
    problemBody: "Ja. 155 mm Gesichtsbreite ist der Anfang des Bereichs, für den die 158 mm Standardfront gebaut ist. Liegt deine Messung knapp darunter, ist Bespoke die sicherere Wahl.",
    detailTitle: "155 mm Gesicht oder 155 mm Front?",
    detailBody: "Achte darauf, was gemessen wurde: Gesichtsbreite von Schläfe zu Schläfe oder Frontbreite der Brille. Für 155 mm Gesichtsbreite ist 158 mm Front der Standard. Eine 155 mm breite Front fertigt Bespoke.",
    table: FACE_TO_FRONT_TABLE,
    related: ["brillen-fuer-grosse-koepfe", "brille-breite-158-mm"],
    metaTitle: "Brille 155 mm breit (Herren) | Woolet 158 mm Front",
    metaDescription:
      "155 mm ist die Untergrenze unseres Passbereichs: Woolet 007 und 009 haben 158 mm Front und passen bei 155-161 mm Gesichtsbreite. Bespoke 145-172 mm.",
    primaryKeyword: "brille 155 mm breit",
    englishEquivalent: "/en/size/155mm",
    faqs: [
      { q: "Passt Woolet bei 155 mm Gesichtsbreite?", a: "Ja. Die 158 mm Front von Woolet 007 und 009 passt bei 155-161 mm Gesichtsbreite; 155 mm ist die Untergrenze." },
      { q: "Gibt es eine Front mit genau 155 mm?", a: "Als Bespoke. Bespoke fertigt Fronten von 145 bis 172 mm für 480 USD inklusive Standardgläsern." },
      { q: "Wie messe ich meine Gesichtsbreite?", a: "Von Schläfe zu Schläfe an der breitesten Stelle, oder mit FitLens über die Handykamera im Browser in etwa 20 Sekunden." },
    ],
  },
  "brille-breite-158-mm": {
    slug: "brille-breite-158-mm",
    h1: "Brille mit 158 mm Breite - unsere Standardbreite",
    h1Pre: "Brille mit ",
    h1Em: "158 mm Breite",
    h1Post: " - unsere Standardbreite.",
    sub: "Woolet 007 Round und 009 Soft Square: 158 mm Front, 21/22 mm Keyhole-Steg, 150 mm Bügel. Mazzucchelli-Acetat, in der EU handgefertigt.",
    heroAlt: "Greg trägt die Woolet 009 mit 158 mm Frontbreite",
    quickAnswer:
      "Eine 158 mm breite Brille passt zu Gesichtern mit 155-161 mm Breite von Schläfe zu Schläfe. Woolet 007 (Rund / Panto, 52□21-150) und 009 (Soft Square, 54□22-150) teilen diese Front, mit Keyhole-Steg, 150 mm Bügeln und italienischem Mazzucchelli-Acetat, in der EU handgefertigt.",
    problemTitle: "Warum 158 mm?",
    problemBody: "158 mm ist die eine Breite, auf die beide Standardmodelle gebaut sind. Sie deckt Gesichter von 155 bis 161 mm ab - den Bereich, in dem Standardfassungen längst aufgehört haben.",
    detailTitle: "Steg und Bügel gehören dazu",
    detailBody: "Woolet 007 hat einen 21 mm Keyhole-Steg, Woolet 009 einen 22 mm Keyhole-Steg; beide haben 150 mm lange Bügel. Gefertigt aus italienischem Mazzucchelli-Acetat, in der EU handgefertigt, mit 10 Jahren Garantie.",
    table: SPEC_TABLE,
    related: ["brillen-fuer-grosse-koepfe", "xxl-brille-herren"],
    metaTitle: "Brille 158 mm breit (Herren) | 007 & 009 | Woolet",
    metaDescription:
      "Unsere Standardbreite: 158 mm Front, 21/22 mm Keyhole-Steg, 150 mm Bügel, Mazzucchelli-Acetat, in der EU handgefertigt. Für 155-161 mm Gesichtsbreite.",
    primaryKeyword: "brille 158 mm breit",
    englishEquivalent: "/en/size/158mm",
    faqs: [
      { q: "Für welche Gesichtsbreite ist eine 158 mm Brille?", a: "Für 155-161 mm Gesichtsbreite, gemessen von Schläfe zu Schläfe." },
      { q: "Welche Modelle gibt es in 158 mm?", a: "Woolet 007 (Rund / Panto, 21 mm Keyhole-Steg) und Woolet 009 (Soft Square, 22 mm Keyhole-Steg), beide mit 150 mm Bügeln." },
      { q: "Was kostet die 158 mm Brille?", a: "Der Shop ist bis zum Ende der Kickstarter-Kampagne ausverkauft. Mit einer Reservierung für 1 € sicherst du dir den Founding-Member-Preis." },
    ],
  },
};

/** Width pages that cross-link under "Andere Breiten". */
export const deWidthSlugs = [
  "brille-breite-150-mm",
  "brille-breite-155-mm",
  "brille-breite-158-mm",
  "brille-breite-160-mm",
] as const;

export const dePageOrder = [
  "brille-fuer-breites-gesicht",
  "breite-brille",
  "brille-grosse-koepfe",
  "brillen-fuer-grosse-koepfe",
  "xxl-brille-herren",
  "brille-breite-150-mm",
  "brille-breite-155-mm",
  "brille-breite-158-mm",
  "brille-breite-160-mm",
] as const;

export const dePageTitles: Record<string, string> = {
  "brille-fuer-breites-gesicht": "Brille für breites Gesicht",
  "breite-brille": "Breite Brille (158 mm)",
  "brille-grosse-koepfe": "Brille für große Köpfe",
  "brillen-fuer-grosse-koepfe": "Brillen für große Köpfe (Herren)",
  "xxl-brille-herren": "XXL Brille Herren",
  "brille-breite-150-mm": "Brille Breite 150 mm",
  "brille-breite-155-mm": "Brille Breite 155 mm",
  "brille-breite-158-mm": "Brille Breite 158 mm",
  "brille-breite-160-mm": "Brille Breite 160 mm",
};
