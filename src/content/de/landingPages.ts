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
};

export const DEFAULT_FAQS: DeFaq[] = [
  {
    q: "Woher weiß ich, welche Größe ich brauche?",
    a: "Nutze FitLens: Die Kamera misst deine Gesichtsbreite in Millimetern und empfiehlt 155, 158 oder 161 mm. Dauert etwa 20 Sekunden, läuft komplett im Browser.",
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
    sub: "Italienisches Acetat, entwickelt für breitere Gesichter: 155, 158 und 161 mm. Schluss mit Brillen, die nach einer Stunde an den Schläfen drücken.",
    heroAlt: "Greg trägt die 158 mm breite Woolet 009 Brille für ein breites Gesicht",
    problemTitle: "Warum normale Brillen auf breiten Gesichtern drücken",
    problemBody: "Viele Standardfassungen enden bei 135-145 mm. Auf einem breiteren Gesicht klemmen sie an den Schläfen, die Bügel stehen nach außen oder die Gläser enden vor der Gesichtskante. Woolet beginnt bei 155 mm und wurde von Grund auf für breite Gesichter konstruiert.",
    detailTitle: "Welche Brillenbreite passt zu einem breiten Gesicht?",
    detailBody: "Woolet bietet 155, 158 und 161 mm Frontbreite. Der 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel sind auf dieselbe breite Passform abgestimmt. Außerhalb dieses Bereichs deckt Woolet Bespoke 145-172 mm ab.",
    related: ["breite-brille", "brille-grosse-koepfe"],
    metaTitle: "Brille für breites Gesicht | Woolet - 155/158/161 mm aus italienischem Acetat",
    metaDescription:
      "Drückt jede Brille an den Schläfen? Woolet fertigt Brillen für breite Gesichter und große Köpfe - 155, 158, 161 mm, in der EU handgefertigt aus italienischem Mazzucchelli-Acetat. Miss dein Gesicht in 20 Sekunden.",
    primaryKeyword: "brille für breites gesicht",
    faqs: [
      { q: "Welche Brille passt zu einem breiten Gesicht?", a: "Entscheidend ist die gesamte Frontbreite. Woolet bietet 155, 158 und 161 mm, dazu 21 oder 22 mm Keyhole-Steg und 150 mm lange Bügel." },
      { q: "Wie messe ich die Breite meines Gesichts?", a: "FitLens misst deine Gesichtsbreite mit der Handykamera im Browser und empfiehlt 155, 158 oder 161 mm. Alternativ kannst du eine gut sitzende Brille von außen nach außen messen." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
  "breite-brille": {
    slug: "breite-brille",
    h1: "Breite Brille: 155, 158 und 161 mm für größere Köpfe",
    h1Pre: "Breite Brille in ",
    h1Em: "155, 158 und 161 mm",
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
  "xxl-brille-herren": {
    slug: "xxl-brille-herren",
    h1: "XXL Brille für Herren - breite Fassungen bis 161 mm",
    h1Pre: "XXL Brille für Herren - ",
    h1Em: "bis 161 mm",
    h1Post: " echte Frontbreite.",
    sub: "Männliche Gesichter, echte Breite: Woolet-Fassungen in 155, 158 und 161 mm. Italienisches Acetat, klare Formen.",
    heroAlt: "Greg trägt die XXL Herrenbrille Woolet 009 aus Havanna-Acetat",
    problemTitle: "XXL-Herrenbrillen brauchen mehr als große Gläser",
    problemBody: "Bei vielen Oversized-Fassungen wachsen nur die Gläser, während Steg und Bügel für Standardköpfe bleiben. Woolet stimmt Frontbreite, Keyhole-Steg und 150 mm lange Bügel als ein System auf größere Köpfe ab.",
    detailTitle: "007 rund oder 009 eckig?",
    detailBody: "Woolet 007 ist eine runde Panto-Form mit 52□21-150. Woolet 009 ist eine weiche eckige Form mit 54□22-150. Beide sind als Korrektionsbrille oder mit UV400-Sonnengläsern erhältlich.",
    related: ["brille-grosse-koepfe", "breite-brille"],
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
    sub: "Du suchst nach einer Brille mit 150-160 mm Frontbreite? Genau dafür gibt es Woolet: 155, 158 und 161 mm.",
    heroAlt: "Greg trägt eine 158 mm breite Woolet 009 als Alternative zur 160 mm Brille",
    problemTitle: "Gibt es eine Brille mit genau 160 mm Breite?",
    problemBody: "Woolet bietet keine Standardfassung mit exakt 160 mm, sondern die nahen Größen 158 und 161 mm. Damit kannst du die passendere Seite wählen, statt dich auf eine ungenaue XL-Bezeichnung zu verlassen. Für exakte Sondermaße gibt es Bespoke von 145-172 mm.",
    detailTitle: "158 oder 161 mm - welche Größe liegt näher?",
    detailBody: "158 mm eignet sich als mittlere Woolet-Breite. 161 mm gibt zusätzlich 3 mm Raum an der Front. FitLens misst deine Gesichtsbreite im Browser und empfiehlt den sinnvolleren Ausgangspunkt.",
    related: ["breite-brille", "brille-fuer-breites-gesicht"],
    metaTitle: "Brille 160 mm Breite (Herren) | Woolet - 155/158/161 mm Fassungen",
    metaDescription:
      "Brille mit ca. 160 mm Breite für breite Gesichter. Woolet bietet 155, 158 und 161 mm aus italienischem Acetat. Mit FitLens die exakte Breite messen - in 20 Sekunden.",
    primaryKeyword: "brille breite 160 mm",
    faqs: [
      { q: "Gibt es bei Woolet eine Brille mit genau 160 mm Breite?", a: "Die nächsten Standardgrößen sind 158 und 161 mm. Für ein exaktes Sondermaß zwischen 145 und 172 mm gibt es Woolet Bespoke." },
      { q: "Soll ich 158 oder 161 mm wählen?", a: "161 mm bietet 3 mm mehr Raum an der Front. FitLens misst deine Gesichtsbreite und empfiehlt den passenderen Ausgangspunkt." },
      ...DEFAULT_FAQS.slice(2),
    ],
  },
};

export const dePageOrder = [
  "brille-fuer-breites-gesicht",
  "breite-brille",
  "brille-grosse-koepfe",
  "xxl-brille-herren",
  "brille-breite-160-mm",
] as const;

export const dePageTitles: Record<string, string> = {
  "brille-fuer-breites-gesicht": "Brille für breites Gesicht",
  "breite-brille": "Breite Brille (155-161 mm)",
  "brille-grosse-koepfe": "Brille für große Köpfe",
  "xxl-brille-herren": "XXL Brille Herren",
  "brille-breite-160-mm": "Brille Breite 160 mm",
};
