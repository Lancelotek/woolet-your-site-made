export type DeFaq = { q: string; a: string };

export type DePageConfig = {
  slug: string;
  h1: string;
  sub: string;
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
    a: "Standardfassungen enden meist bei 135–145 mm. Ab ca. 150 mm Gesichtsbreite lohnt sich Woolet — dann sitzen normale Brillen nicht mehr.",
  },
  {
    q: "Aus welchem Material sind die Fassungen?",
    a: "Italienisches Mazzucchelli-1849-Acetat, in Italien handgefertigt, mit Keyhole-Steg für breitere Nasen.",
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
    h1: "Brillen für breite Gesichter – endlich eine Passform, die sitzt",
    sub: "Italienisches Acetat, entwickelt für breitere Gesichter: 155, 158 und 161 mm. Schluss mit Brillen, die nach einer Stunde an den Schläfen drücken.",
    metaTitle: "Brille für breites Gesicht | Woolet – 155/158/161 mm aus italienischem Acetat",
    metaDescription:
      "Drückt jede Brille an den Schläfen? Woolet fertigt Brillen für breite Gesichter und große Köpfe – 155, 158, 161 mm, handgefertigt aus italienischem Mazzucchelli-Acetat. Miss dein Gesicht in 20 Sekunden.",
    primaryKeyword: "brille für breites gesicht",
  },
  "breite-brille": {
    slug: "breite-brille",
    h1: "Breite Brille: 155, 158 und 161 mm für größere Köpfe",
    sub: "Fassungen, die wirklich breit sind – nicht „large“ im Namen, sondern in Millimetern. Gemessen, nicht geraten.",
    metaTitle: "Breite Brille (155–161 mm) | Woolet – Fassungen für breite Gesichter",
    metaDescription:
      "Breite Brillen von 155 bis 161 mm, handgefertigt aus italienischem Acetat. Für breite Gesichter und große Köpfe. Finde deine Größe mit FitLens in 20 Sekunden.",
    primaryKeyword: "breite brille",
  },
  "brille-grosse-koepfe": {
    slug: "brille-grosse-koepfe",
    h1: "Brillen für große Köpfe – ohne Druck an den Schläfen",
    sub: "Wenn dir jede Fassung zu eng ist: Woolet ist von Grund auf für größere Köpfe gebaut. Bis 161 mm Frontbreite.",
    metaTitle: "Brille für große Köpfe | Woolet – bis 161 mm, italienisches Acetat",
    metaDescription:
      "Brillen für große Köpfe, die nicht drücken. 155/158/161 mm aus italienischem Mazzucchelli-Acetat, in Italien handgefertigt. Miss deinen Kopf mit FitLens in 20 Sekunden.",
    primaryKeyword: "brille für große köpfe",
  },
  "xxl-brille-herren": {
    slug: "xxl-brille-herren",
    h1: "XXL Brille für Herren – breite Fassungen bis 161 mm",
    sub: "Männliche Gesichter, echte Breite: Woolet-Fassungen in 155, 158 und 161 mm. Italienisches Acetat, klare Formen.",
    metaTitle: "XXL Brille Herren | Woolet – breite Herrenfassungen bis 161 mm",
    metaDescription:
      "XXL Brillen für Herren mit breitem Gesicht oder großem Kopf. 155–161 mm, italienisches Acetat, handgefertigt. Größe per FitLens-Scan in 20 Sekunden bestimmen.",
    primaryKeyword: "xxl brille herren",
  },
  "brille-breite-160-mm": {
    slug: "brille-breite-160-mm",
    h1: "Brille mit ~160 mm Breite – die Größe, die der Markt ignoriert",
    sub: "Du suchst nach einer Brille mit 150–160 mm Frontbreite? Genau dafür gibt es Woolet: 155, 158 und 161 mm.",
    metaTitle: "Brille 160 mm Breite (Herren) | Woolet – 155/158/161 mm Fassungen",
    metaDescription:
      "Brille mit ca. 160 mm Breite für breite Gesichter. Woolet bietet 155, 158 und 161 mm aus italienischem Acetat. Mit FitLens die exakte Breite messen – in 20 Sekunden.",
    primaryKeyword: "brille breite 160 mm",
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
  "breite-brille": "Breite Brille (155–161 mm)",
  "brille-grosse-koepfe": "Brille für große Köpfe",
  "xxl-brille-herren": "XXL Brille Herren",
  "brille-breite-160-mm": "Brille Breite 160 mm",
};
