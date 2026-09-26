export type DeFaq = { q: string; a: string };

export type DePageConfig = {
  slug: string;
  h1: string;
  h1Pre: string;
  h1Em: string;
  h1Post: string;
  sub: string;
  heroAlt: string;
  problemTitle: string;
  problemBody: string;
  detailTitle: string;
  detailBody: string;
  related: string[];
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  faqs?: DeFaq[];
  kurzeAntwort?: string;
  widthTable?: { title: string; rows: [string, string, string][] };
  canonicalOverride?: string;
};

export const DEFAULT_FAQS: DeFaq[] = [
  {
    q: "Woher weiß ich, welche Größe ich brauche?",
    a: "Nutze FitLens: Die Kamera misst deine Gesichtsbreite in Millimetern und zeigt, ob der 158 mm Standard oder Bespoke (145-172 mm) passt. Dauert etwa 20 Sekunden, läuft komplett im Browser.",
  },
  {
    q: "Ab welcher Gesichtsbreite ist Woolet sinnvoll?",
    a: "Standardfassungen enden meist bei 135-145 mm. Ab ca. 150 mm Gesichtsbreite lohnt sich Woolet - dann sitzen normale Brillen nicht mehr.",
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
    a: "Wir starten auf Kickstarter. Trag dich auf die VIP-Liste ein und sichere dir den Founding-Preis vor allen anderen.",
  },
];

export const dePages: Record<string, DePageConfig> = {
  "brille-fuer-breites-gesicht": {
    slug: "brille-fuer-breites-gesicht",
    h1: "Brillen für breite Gesichter - endlich eine Passform, die sitzt",
    h1Pre: "Brillen für ",
    h1Em: "breite Gesichter",
    h1Post: " - endlich eine Passform, die sitzt.",
    sub: "Italienisches Acetat, entwickelt für breitere Gesichter: 158 mm Standard, Bespoke 145-172 mm. Schluss mit Brillen, die nach einer Stunde an den Schläfen drücken.",
    heroAlt: "Greg trägt die 158 mm breite Woolet 009 Brille für ein breites Gesicht",
    problemTitle: "Warum normale Brillen auf breiten Gesichtern drücken",
    problemBody: "Viele Standardfassungen enden bei 135-145 mm. Auf einem breiteren Gesicht klemmen sie an den Schläfen, die Bügel stehen nach außen oder die Gläser enden vor der Gesichtskante. Woolet beginnt bei 155 mm und wurde von Grund auf für breite Gesichter konstruiert.",
    detailTitle: "Welche Brillenbreite passt zu einem breiten Gesicht?",
    detailBody: "Woolet fertigt 158 mm Frontbreite als Standard für 155-161 mm Gesichtsbreite. Der 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel sind auf dieselbe breite Passform abgestimmt. Außerhalb dieses Bereichs deckt Woolet Bespoke 145-172 mm ab.",
    related: ["breite-brille", "brillen-fuer-grosse-koepfe"],
    metaTitle: "Brille für breites Gesicht | Woolet - 155/158/161 mm aus italienischem Acetat",
    metaDescription:
      "Drückt jede Brille an den Schläfen? Woolet fertigt Brillen für breite Gesichter und große Köpfe - 155, 158, 161 mm, in der EU handgefertigt aus italienischem Mazzucchelli-Acetat. Miss dein Gesicht in 20 Sekunden.",
    primaryKeyword: "brille für breites gesicht",
    faqs: [
      { q: "Welche Brille passt zu einem breiten Gesicht?", a: "Entscheidend ist die gesamte Frontbreite. Woolet hat 158 mm Front als Standard, Bespoke 145-172 mm, dazu 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel." },
      { q: "Wie messe ich die Breite meines Gesichts?", a: "FitLens misst deine Gesichtsbreite mit der Handykamera im Browser und zeigt, ob 158 mm Standard oder Bespoke passt. Alternativ kannst du eine gut sitzende Brille von außen nach außen messen." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "breite-brille": {
    slug: "breite-brille",
    h1: "Breite Brille: 158 mm Front für größere Köpfe",
    h1Pre: "Breite Brille mit ",
    h1Em: "158 mm Front",
    h1Post: " - nicht nur large im Namen.",
    sub: "Fassungen, die wirklich breit sind - nicht „large“ im Namen, sondern in Millimetern. Gemessen, nicht geraten.",
    heroAlt: "Greg trägt eine breite Woolet 009 Acetatbrille mit 158 mm Frontbreite",
    problemTitle: "Was eine breite Brille wirklich breit macht",
    problemBody: "Nicht die Bezeichnung XL entscheidet, sondern die gesamte Frontbreite. Dazu kommen ein passender Nasensteg und lange Bügel. Woolet kombiniert 155-161 mm Frontbreite mit 21 oder 22 mm Keyhole-Steg und 150 mm Bügellänge.",
    detailTitle: "Frontbreite, Steg und Bügel müssen zusammenpassen",
    detailBody: "Eine breite Front allein reicht nicht. Modell 007 misst 52□21-150, Modell 009 misst 54□22-150. So bleiben Proportionen, Auflage und Bügelverlauf auf eine breite Passform abgestimmt.",
    related: ["brille-breite-160-mm", "brille-fuer-breites-gesicht"],
    metaTitle: "Breite Brille (155-161 mm) | Woolet - Fassungen für breite Gesichter",
    metaDescription:
      "Breite Brillen von 155 bis 161 mm, in der EU handgefertigt aus italienischem Acetat. Für breite Gesichter und große Köpfe. Finde deine Größe mit FitLens in 20 Sekunden.",
    primaryKeyword: "breite brille",
    faqs: [
      { q: "Was bedeutet breite Brille in Millimetern?", a: "Gemeint ist die gesamte Breite der Fassungsfront. Woolet beginnt bei 155 mm und reicht bei den Standardmodellen bis 161 mm." },
      { q: "Warum sind Nasensteg und Bügellänge wichtig?", a: "Eine breite Front passt nur als Gesamtsystem. Woolet kombiniert sie mit 21 oder 22 mm Keyhole-Steg und 150 mm langen Bügeln." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brille-grosse-koepfe": {
    slug: "brille-grosse-koepfe",
    canonicalOverride: "https://woolet.co/de/brillen-fuer-grosse-koepfe",
    h1: "Brillen für große Köpfe - ohne Druck an den Schläfen",
    h1Pre: "Brillen für ",
    h1Em: "große Köpfe",
    h1Post: " - ohne Druck an den Schläfen.",
    sub: "Wenn dir jede Fassung zu eng ist: Woolet ist von Grund auf für größere Köpfe gebaut. Bis 161 mm Frontbreite.",
    heroAlt: "Greg trägt eine Woolet 009 Brille für einen großen Kopf und ein breites Gesicht",
    problemTitle: "Welche Brillengröße eignet sich für einen großen Kopf?",
    problemBody: "Bei einem großen Kopf ist die Frontbreite aussagekräftiger als ein unklarer XL-Aufdruck. Als Orientierung passen 155-158 mm häufig zu etwa 58-60 cm Kopfumfang. Bei etwa 60-62 cm sind 158-161 mm ein sinnvoller Startpunkt. FitLens misst direkt am Gesicht.",
    detailTitle: "Großer Kopf ist nicht dasselbe wie Oversized-Look",
    detailBody: "Eine passende Brille folgt der tatsächlichen Kopf- und Gesichtsbreite. Sie muss nicht überzeichnet wirken. Woolet 007 und 009 verbinden eine breite Konstruktion mit klaren, ausgewogenen Proportionen und 150 mm langen Bügeln.",
    related: ["xxl-brille-herren", "brille-fuer-breites-gesicht"],
    metaTitle: "Brille für große Köpfe | Woolet - bis 161 mm, italienisches Acetat",
    metaDescription:
      "Brillen für große Köpfe, die nicht drücken. 155/158/161 mm aus italienischem Mazzucchelli-Acetat, in der EU handgefertigt. Miss deinen Kopf mit FitLens in 20 Sekunden.",
    primaryKeyword: "brille für große köpfe",
    faqs: [
      { q: "Welche Brillengröße passt bei einem großen Kopf?", a: "Als Orientierung sind 155-158 mm häufig bei etwa 58-60 cm Kopfumfang sinnvoll. Bei etwa 60-62 cm kommen 158-161 mm infrage. FitLens misst direkt am Gesicht." },
      { q: "Ist eine Brille für große Köpfe automatisch oversized?", a: "Nein. Eine breite Fassung kann ausgewogene Proportionen haben. Woolet 007 und 009 sind breit konstruiert, ohne nur die Gläser optisch zu vergrößern." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brillen-fuer-grosse-koepfe": {
    slug: "brillen-fuer-grosse-koepfe",
    h1: "Brillen für große Köpfe - ohne Druck an den Schläfen",
    h1Pre: "Brillen für ",
    h1Em: "große Köpfe",
    h1Post: " - ohne Druck an den Schläfen.",
    sub: "Wenn dir jede Fassung zu eng ist: Woolet ist von Grund auf für größere Köpfe gebaut. 158 mm Frontbreite, Bespoke bis 172 mm.",
    heroAlt: "Greg trägt eine Woolet 009 Brille für einen großen Kopf und ein breites Gesicht",
    kurzeAntwort: "Für einen großen Kopf zählt die Gesichtsbreite von Schläfe zu Schläfe: Ab 155 mm brauchst du eine Front von rund 158 mm - große Marken wie Persol, Ray-Ban und Warby Parker enden bei etwa 148-150 mm Frontbreite. Woolet fertigt 158 mm als Standard und 145-172 mm als Bespoke-Maßanfertigung.",
    problemTitle: "Welche Brillengröße eignet sich für einen großen Kopf?",
    problemBody: "Bei einem großen Kopf ist die Frontbreite aussagekräftiger als ein unklarer XL-Aufdruck. Als Orientierung passen 155-158 mm häufig zu etwa 58-60 cm Kopfumfang. Bei etwa 60-62 cm sind 158-161 mm ein sinnvoller Startpunkt. FitLens misst direkt am Gesicht.",
    detailTitle: "Großer Kopf ist nicht dasselbe wie Oversized-Look",
    detailBody: "Eine passende Brille folgt der tatsächlichen Kopf- und Gesichtsbreite. Sie muss nicht überzeichnet wirken. Woolet 007 und 009 verbinden eine breite Konstruktion mit klaren, ausgewogenen Proportionen und 150 mm langen Bügeln.",
    related: ["xxl-brille-herren", "brille-fuer-breites-gesicht"],
    metaTitle: "Brillen für große Köpfe (Herren) | 158 mm Front | Woolet",
    metaDescription:
      "Brillen für große und breite Köpfe: 158 mm Front für 155-161 mm Gesichtsbreite, Bespoke 145-172 mm. Auch als Sonnenbrille. Mit Maßtabelle und FitLens.",
    primaryKeyword: "brillen für große köpfe",
    faqs: [
      { q: "Welche Brillengröße passt bei einem großen Kopf?", a: "Als Orientierung sind 155-158 mm häufig bei etwa 58-60 cm Kopfumfang sinnvoll. Bei etwa 60-62 cm kommen 158-161 mm infrage. FitLens misst direkt am Gesicht." },
      { q: "Ist eine Brille für große Köpfe automatisch oversized?", a: "Nein. Eine breite Fassung kann ausgewogene Proportionen haben. Woolet 007 und 009 sind breit konstruiert, ohne nur die Gläser optisch zu vergrößern." },
      { q: "Gibt es die Brille für große Köpfe auch als Sonnenbrille?", a: "Ja. Beide Fassungen können mit UV400-Sonnengläsern oder mit Korrektionsgläsern ausgestattet werden." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "xxl-brille-herren": {
    slug: "xxl-brille-herren",
    h1: "XXL Brille für Herren - breite Fassungen bis 161 mm",
    h1Pre: "XXL Brille für Herren - ",
    h1Em: "bis 161 mm",
    h1Post: " echte Frontbreite.",
    sub: "Männliche Gesichter, echte Breite: Woolet-Fassungen mit 158 mm Front, Bespoke 145-172 mm. Italienisches Acetat, klare Formen.",
    heroAlt: "Greg trägt die XXL Herrenbrille Woolet 009 aus Havanna-Acetat",
    problemTitle: "XXL-Herrenbrillen brauchen mehr als große Gläser",
    problemBody: "Bei vielen Oversized-Fassungen wachsen nur die Gläser, während Steg und Bügel für Standardköpfe bleiben. Woolet stimmt Frontbreite, Keyhole-Steg und 150 mm lange Bügel als ein System auf größere Köpfe ab.",
    detailTitle: "007 rund oder 009 eckig?",
    detailBody: "Woolet 007 ist eine runde Panto-Form mit 52□21-150. Woolet 009 ist eine weiche eckige Form mit 54□22-150. Beide sind als Korrektionsbrille oder mit UV400-Sonnengläsern erhältlich.",
    related: ["brillen-fuer-grosse-koepfe", "breite-brille"],
    metaTitle: "XXL Brille Herren | Woolet - breite Herrenfassungen bis 161 mm",
    metaDescription:
      "XXL Brillen für Herren mit breitem Gesicht oder großem Kopf. 155-161 mm, italienisches Acetat, in der EU handgefertigt. Größe per FitLens-Scan in 20 Sekunden bestimmen.",
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
    sub: "Du suchst nach einer Brille mit 150-160 mm Frontbreite? Woolet hat 158 mm als Standard und Bespoke von 145-172 mm.",
    heroAlt: "Greg trägt eine 158 mm breite Woolet 009 als Alternative zur 160 mm Brille",
    problemTitle: "Gibt es eine Brille mit genau 160 mm Breite?",
    problemBody: "Woolet bietet keine Standardfassung mit exakt 160 mm. Der Standard hat 158 mm Front und passt bei 155-161 mm Gesichtsbreite. Für exakt 160 mm oder jedes andere Maß gibt es Bespoke von 145-172 mm.",
    detailTitle: "158 mm Standard oder Bespoke?",
    detailBody: "158 mm Front deckt 155-161 mm Gesichtsbreite ab. Wer darüber liegt oder exakt 160 mm will, wählt Bespoke (145-172 mm). FitLens misst deine Gesichtsbreite im Browser und empfiehlt den sinnvolleren Ausgangspunkt.",
    related: ["brille-breite-150-mm", "brille-breite-155-mm", "brille-breite-158-mm", "breite-brille"],
    metaTitle: "Brille 160 mm Breite (Herren) | Woolet 158 mm & Bespoke",
    metaDescription:
      "Brille mit ca. 160 mm Breite für breite Gesichter. Woolet: 158 mm Standard, Bespoke 145-172 mm, italienisches Acetat. Mit FitLens die exakte Breite messen - in 20 Sekunden.",
    primaryKeyword: "brille breite 160 mm",
    faqs: [
      { q: "Gibt es bei Woolet eine Brille mit genau 160 mm Breite?", a: "Der Standard hat 158 mm Front. Für ein exaktes Sondermaß zwischen 145 und 172 mm gibt es Woolet Bespoke." },
      { q: "Reicht 158 mm für mich?", a: "158 mm Front passt bei 155-161 mm Gesichtsbreite. Darüber empfiehlt sich Bespoke bis 172 mm. FitLens misst deine Gesichtsbreite." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "brille-breite-150-mm": {
    slug: "brille-breite-150-mm",
    h1: "Brille mit 150 mm Breite - bei Woolet als Bespoke",
    h1Pre: "Brille mit ",
    h1Em: "150 mm Breite",
    h1Post: " - bei Woolet als Bespoke.",
    sub: "150 mm fertigen wir nicht als Standard, sondern als Bespoke-Maßanfertigung von 145 bis 172 mm. Der Standard hat 158 mm Front.",
    heroAlt: "Greg trägt eine Woolet 009 Brille, Frontbreite als Maßanfertigung wählbar",
    kurzeAntwort: "Eine Brille mit 150 mm Frontbreite gibt es bei Woolet nur als Bespoke-Maßanfertigung im Bereich 145-172 mm für 480 USD. Unser Standardmodell hat 158 mm Front und passt bei 155-161 mm Gesichtsbreite.",
    problemTitle: "Für wen ist eine 150 mm breite Brille?",
    problemBody: "150 mm liegt im Bereich Extra-wide (145-154 mm Gesichtsbreite). Große Marken wie Persol, Ray-Ban und Warby Parker enden bei etwa 148-150 mm Frontbreite. Wenn das bei dir knapp sitzt, fertigen wir die Front als Bespoke auf dein Maß.",
    detailTitle: "Bespoke 145-172 mm oder Standard 158 mm?",
    detailBody: "Liegt deine Gesichtsbreite bei 155-161 mm, passt der Standard mit 158 mm Front. Darunter oder darüber fertigen wir Bespoke von 145 bis 172 mm für 480 USD. Mit einer Reservierung für 1 € sicherst du dir den Founding-Member-Preis.",
    widthTable: {
      title: "Gesichtsbreite und empfohlene Frontbreite",
      rows: [
        ["unter 130 mm", "Narrow", "Standardfassungen aus dem Handel"],
        ["130-137 mm", "Standard", "Standardfassungen aus dem Handel"],
        ["138-144 mm", "Wide", "breite Standardfassungen"],
        ["145-154 mm", "Extra-wide", "Woolet Bespoke 145-172 mm"],
        ["155-161 mm", "XL / specialty wide", "Woolet Standard 158 mm"],
        ["über 161 mm", "XL / specialty wide", "Woolet Bespoke bis 172 mm"],
      ],
    },
    related: ["brille-breite-155-mm", "brille-breite-158-mm", "brille-breite-160-mm", "brille-fuer-breites-gesicht"],
    metaTitle: "Brille 150 mm breit (Herren) | Bespoke 145-172 mm | Woolet",
    metaDescription:
      "Brille mit 150 mm Breite? Bei Woolet nur als Bespoke (145-172 mm, 480 USD). Standard ist 158 mm für 155-161 mm Gesichtsbreite. Tabelle Gesicht zu Front.",
    primaryKeyword: "brille 150 mm breit",
    faqs: [
      { q: "Gibt es bei Woolet eine Brille mit 150 mm Breite?", a: "Ja, als Bespoke-Maßanfertigung. Bespoke deckt 145-172 mm Frontbreite ab und kostet 480 USD." },
      { q: "Welche Frontbreite hat das Woolet-Standardmodell?", a: "158 mm. Es passt bei einer Gesichtsbreite von 155-161 mm." },
      { q: "Welche Gesichtsbreite passt zu 150 mm Front?", a: "150 mm liegt im Bereich Extra-wide, also etwa 145-154 mm Gesichtsbreite. FitLens misst deine Gesichtsbreite im Browser." },
    ],
  },
  "brille-breite-155-mm": {
    slug: "brille-breite-155-mm",
    h1: "Brille mit 155 mm Breite - die Untergrenze unseres Passbereichs",
    h1Pre: "Brille mit ",
    h1Em: "155 mm Breite",
    h1Post: " - Untergrenze unseres Passbereichs.",
    sub: "Woolet 007 und 009 haben 158 mm Front und passen bei 155-161 mm Gesichtsbreite. 155 mm ist der Anfang dieses Bereichs.",
    heroAlt: "Greg trägt die Woolet 009 mit 158 mm Front für 155 mm Gesichtsbreite",
    kurzeAntwort: "155 mm Gesichtsbreite ist die Untergrenze unseres Passbereichs: Woolet 007 und 009 haben eine 158 mm breite Front und passen bei 155-161 mm Gesichtsbreite. Für schmalere oder breitere Maße gibt es Bespoke von 145-172 mm.",
    problemTitle: "Passt eine 158 mm Front bei 155 mm Gesichtsbreite?",
    problemBody: "Ja. Ab 155 mm Gesichtsbreite beginnt der Bereich XL / specialty wide. Die 158 mm Front von Woolet ist für 155-161 mm ausgelegt, dazu kommen Keyhole-Steg und 150 mm lange Bügel.",
    detailTitle: "Unter 155 mm? Dann Bespoke",
    detailBody: "Liegt deine Gesichtsbreite unter 155 mm, fertigen wir die Front als Bespoke im Bereich 145-172 mm für 480 USD. FitLens misst dein Maß in etwa 20 Sekunden im Browser.",
    related: ["brille-breite-150-mm", "brille-breite-158-mm", "brille-breite-160-mm", "breite-brille"],
    metaTitle: "Brille 155 mm breit (Herren) | Woolet 158 mm Front",
    metaDescription:
      "155 mm ist die Untergrenze unseres Passbereichs: Woolet 007 und 009 haben 158 mm Front und passen bei 155-161 mm Gesichtsbreite. Bespoke 145-172 mm.",
    primaryKeyword: "brille 155 mm breit",
    faqs: [
      { q: "Passt Woolet bei 155 mm Gesichtsbreite?", a: "Ja. 155 mm ist die Untergrenze des Passbereichs der 158 mm Front (155-161 mm)." },
      { q: "Was, wenn mein Gesicht schmaler als 155 mm ist?", a: "Dann ist Bespoke die richtige Wahl: 145-172 mm Frontbreite, 480 USD." },
      { q: "Wie messe ich meine Gesichtsbreite?", a: "FitLens misst die Breite von Schläfe zu Schläfe mit der Handykamera im Browser, in etwa 20 Sekunden." },
    ],
  },
  "brille-breite-158-mm": {
    slug: "brille-breite-158-mm",
    h1: "Brille mit 158 mm Breite - unser Standard",
    h1Pre: "Brille mit ",
    h1Em: "158 mm Breite",
    h1Post: " - unser Standard.",
    sub: "Woolet 007 Round und 009 Soft Square: 158 mm Front, 21/22 mm Keyhole-Steg, 150 mm Bügel.",
    heroAlt: "Greg trägt die Woolet 009 Soft Square mit 158 mm Frontbreite",
    kurzeAntwort: "158 mm ist die Standardbreite von Woolet: Beide Modelle, 007 Round und 009 Soft Square, haben eine 158 mm breite Front, einen Keyhole-Steg mit 21 bzw. 22 mm und 150 mm lange Bügel. Sie passen bei 155-161 mm Gesichtsbreite.",
    problemTitle: "Was steckt in der 158 mm Front?",
    problemBody: "Woolet 007 Round misst 52□21-150, Woolet 009 Soft Square 54□22-150. Beide haben 158 mm Frontbreite, einen Keyhole-Steg und 150 mm lange Bügel, gefertigt aus Mazzucchelli-Acetat und in der EU handgefertigt.",
    detailTitle: "Für wen ist 158 mm die richtige Breite?",
    detailBody: "Für Gesichtsbreiten von 155-161 mm. Außerhalb dieses Bereichs fertigen wir Bespoke von 145-172 mm für 480 USD.",
    related: ["brille-breite-150-mm", "brille-breite-155-mm", "brille-breite-160-mm", "xxl-brille-herren"],
    metaTitle: "Brille 158 mm breit (Herren) | 007 & 009 | Woolet",
    metaDescription:
      "Unsere Standardbreite: 158 mm Front, 21/22 mm Keyhole-Steg, 150 mm Bügel, Mazzucchelli-Acetat, in der EU handgefertigt. Für 155-161 mm Gesichtsbreite.",
    primaryKeyword: "brille 158 mm breit",
    faqs: [
      { q: "Welche Woolet-Modelle haben 158 mm Front?", a: "Beide: Woolet 007 Round (52□21-150) und Woolet 009 Soft Square (54□22-150)." },
      { q: "Für welche Gesichtsbreite ist 158 mm gedacht?", a: "Für 155-161 mm Gesichtsbreite. Außerhalb davon gibt es Bespoke von 145-172 mm." },
      { q: "Aus welchem Material ist die Fassung?", a: "Aus italienischem Mazzucchelli-Acetat, in der EU handgefertigt." },
    ],
  },
};

export const WIDTH_SLUGS = ["brille-breite-150-mm", "brille-breite-155-mm", "brille-breite-158-mm", "brille-breite-160-mm"] as const;

export const dePageOrder = [
  "brille-fuer-breites-gesicht",
  "breite-brille",
  "brille-grosse-koepfe",
  "brillen-fuer-grosse-koepfe",
  "xxl-brille-herren",
  "brille-breite-160-mm",
  "brille-breite-150-mm",
  "brille-breite-155-mm",
  "brille-breite-158-mm",
] as const;

export const dePageTitles: Record<string, string> = {
  "brille-fuer-breites-gesicht": "Brille für breites Gesicht",
  "breite-brille": "Breite Brille (155-161 mm)",
  "brille-grosse-koepfe": "Brille für große Köpfe",
  "brillen-fuer-grosse-koepfe": "Brillen für große Köpfe",
  "xxl-brille-herren": "XXL Brille Herren",
  "brille-breite-160-mm": "Brille Breite 160 mm",
  "brille-breite-150-mm": "Brille Breite 150 mm",
  "brille-breite-155-mm": "Brille Breite 155 mm",
  "brille-breite-158-mm": "Brille Breite 158 mm",
};
