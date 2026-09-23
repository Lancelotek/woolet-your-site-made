/**
 * Localised copy for the product detail pages (/:lang/products/007, /009, /bespoke).
 *
 * EN strings are the original page copy, kept byte-for-byte so /en renders exactly
 * as before. FR and NL are full translations so /fr and /nl product URLs are not
 * English pages behind a translated <title> (Google flagged /fr/products/007 as
 * Soft 404 / thin duplicate).
 *
 * Analytics payloads (GTM / Clarity) deliberately keep EN values.
 */
import type { Lang } from "@/lib/i18n";

export type PdpLang = "en" | "fr" | "nl";
export type PdpModel = "007" | "009";

export const pdpLang = (lang: Lang | string): PdpLang => (lang === "fr" || lang === "nl" ? lang : "en");

/** "$1" in EN/NL, "1 $" in FR. */
export const usd = (lang: PdpLang, amount: string | number): string =>
  lang === "fr" ? `${amount} $` : `$${amount}`;

type Spec = [string, string];

type ModelCopy = {
  title: string;
  metaDescription: string;
  ogDescription: string;
  jsonLdDescription: string;
  shapeEm: string;
  intro: string;
  crossLink: string;
  specs: Spec[];
  benefits: string[];
};

type PdpCopy = {
  scarcity: string;
  subline: string;
  headlinePre: string;
  headlineEm: string;
  headlinePost: string;
  today: string;
  locksPre: string;
  locksMid: string;
  locksPost: string;
  cta: string;
  trust: string;
  fitQuiz: string;
  lensReassure: string;
  coloursLabel: string;
  coloursNote: string;
  showColour: (name: string) => string;
  colourNames: Record<string, string>;
  whatYouGet: string;
  specsTitle: string;
  afterTitlePre: string;
  steps: [string, string][];
  stepLabel: string;
  crossBespoke: string;
  stickyToday: string;
  stickyLocks: string;
  stickyRefundable: string;
  stickyReserve: string;
  models: Record<PdpModel, ModelCopy>;
};

export const PDP_COPY: Record<PdpLang, PdpCopy> = {
  en: {
    scarcity: "4,900+ on the waitlist · Founding run limited to 300 pairs",
    subline: "158 mm · Hand made in EU · Mazzucchelli acetate from Milan",
    headlinePre: "Finally, glasses that don't ",
    headlineEm: "pinch",
    headlinePost: ".",
    today: "today",
    locksPre: "locks your founding price of ",
    locksMid: " — SRP ",
    locksPost: " at launch",
    cta: "Reserve your pair — $1",
    trust: "Fully refundable, anytime · No further charge today · Founding price locked for good",
    fitQuiz: "Not sure about your size? Check your fit in 30 seconds →",
    lensReassure: "Prescription, blue-light and polarized options are chosen later — after your frame ships. Nothing extra is charged today.",
    coloursLabel: "Launch colours",
    coloursNote: "Pick yours after the campaign",
    showColour: (name) => `Show ${name}`,
    colourNames: { havana: "Honey tortoise", black: "Piano black", crystal: "Crystal" },
    whatYouGet: "What you get",
    specsTitle: "Full specifications & dimensions",
    afterTitlePre: "What happens after your ",
    steps: [
      ["Today", "You pay $1. Fully refundable. Your founding price is locked."],
      ["At launch", "We email you. You choose colour, lens type and prescription."],
      ["Q3 2026", "Your frame ships. The $1 is deducted from the final price."],
    ],
    stepLabel: "Step",
    crossBespoke: "Need a different width? Explore Bespoke →",
    stickyToday: "$1 today",
    stickyLocks: " · locks $114",
    stickyRefundable: "Fully refundable",
    stickyReserve: "Reserve",
    models: {
      "007": {
        title: "Woolet 007 — Round Panto Acetate Glasses, 158 mm",
        metaDescription: "Round panto acetate frame, 158 mm wide with 21 mm keyhole bridge. Engineered for 155 mm+ faces. Reserve for $1, locks $114 founding price.",
        ogDescription: "Reserve for $1, refundable. Locks $114 founding price (SRP $190). 158 mm front, 21 mm keyhole bridge.",
        jsonLdDescription: "Round panto acetate frame, 158 mm wide with a 21 mm keyhole bridge. Mazzucchelli acetate from Milan, hand made in EU. Engineered for faces 155 mm and wider.",
        shapeEm: "Panto",
        intro: "Engineered for faces 155 mm and wider. 158 mm front, 21 mm keyhole bridge.",
        crossLink: "Prefer a soft-square shape? See the Woolet 009 →",
        specs: [
          ["Material", "Mazzucchelli acetate from Milan"],
          ["Frame Width", "158 mm (hinge to hinge)"],
          ["Lens", "52 × 52 mm (round panto)"],
          ["Bridge", "Keyhole 21 mm"],
          ["Temples", "148 mm, 11° angle"],
          ["Hinges", "5-barrel PVD Gunmetal"],
          ["Rivets", "Double, PVD Gunmetal"],
        ],
        benefits: [
          "Mazzucchelli acetate from Milan — hand made in EU",
          "158 mm — engineered for 155 mm+ faces",
          "5-barrel PVD Gunmetal hinges — built for years of daily wear",
          "Keyhole bridge 21 mm — zero slipping",
          "Hand polish + bevel cut — not machine polish",
        ],
      },
      "009": {
        title: "Woolet 009 — Soft-Square Acetate Glasses, 158 mm",
        metaDescription: "Soft-square acetate frame, 158 mm wide with 20 mm bridge. Engineered for 155 mm+ faces. Reserve for $1, locks $114 founding price.",
        ogDescription: "Reserve for $1, refundable. Locks $114 founding price (SRP $190). 158 mm front, 20 mm bridge.",
        jsonLdDescription: "Soft-square acetate frame, 158 mm wide with a 22 mm bridge. Mazzucchelli acetate from Milan, hand made in EU. Engineered for faces 155 mm and wider.",
        shapeEm: "Soft-Square",
        intro: "Engineered for faces 155 mm and wider. 158 mm front, 20 mm bridge.",
        crossLink: "Prefer a round panto? See the Woolet 007 →",
        specs: [
          ["Material", "Mazzucchelli acetate from Milan"],
          ["Frame Width", "158 mm (hinge to hinge)"],
          ["Lens", "54 × 50 mm (soft-square)"],
          ["Bridge", "Keyhole 20 mm"],
          ["Temples", "148 mm, 11° angle"],
          ["Hinges", "5-barrel PVD Gunmetal"],
          ["Rivets", "Double, PVD Gunmetal"],
        ],
        benefits: [
          "Mazzucchelli acetate from Milan — hand made in EU",
          "158 mm — engineered for 155 mm+ faces",
          "5-barrel PVD Gunmetal hinges — built for years of daily wear",
          "Keyhole bridge 20 mm — zero slipping",
          "Hand polish + bevel cut — not machine polish",
        ],
      },
    },
  },

  fr: {
    scarcity: "4 900+ inscrits sur la liste d'attente · Première série limitée à 300 paires",
    subline: "158 mm · Fait main dans l'UE · Acétate Mazzucchelli de Milan",
    headlinePre: "Enfin des lunettes qui ne ",
    headlineEm: "serrent",
    headlinePost: " pas.",
    today: "aujourd'hui",
    locksPre: "bloque votre prix fondateur de ",
    locksMid: " - prix public ",
    locksPost: " au lancement",
    cta: "Réservez votre paire - 1 $",
    trust: "Entièrement remboursable, à tout moment · Aucun autre débit aujourd'hui · Prix fondateur garanti pour de bon",
    fitQuiz: "Vous hésitez sur la taille ? Vérifiez votre ajustement en 30 secondes →",
    lensReassure: "Les options de verres correcteurs, anti-lumière bleue et polarisés se choisissent plus tard, après l'expédition de votre monture. Rien de plus n'est facturé aujourd'hui.",
    coloursLabel: "Coloris de lancement",
    coloursNote: "Choisissez le vôtre après la campagne",
    showColour: (name) => `Afficher ${name}`,
    colourNames: { havana: "Écaille miel", black: "Noir piano", crystal: "Cristal" },
    whatYouGet: "Ce que vous obtenez",
    specsTitle: "Caractéristiques et dimensions complètes",
    afterTitlePre: "Ce qui se passe après votre ",
    steps: [
      ["Aujourd'hui", "Vous payez 1 $. Entièrement remboursable. Votre prix fondateur est bloqué."],
      ["Au lancement", "Nous vous écrivons. Vous choisissez le coloris, le type de verres et votre correction."],
      ["T3 2026", "Votre monture est expédiée. Le 1 $ est déduit du prix final."],
    ],
    stepLabel: "Étape",
    crossBespoke: "Besoin d'une autre largeur ? Découvrez le sur-mesure →",
    stickyToday: "1 $ aujourd'hui",
    stickyLocks: " · bloque 114 $",
    stickyRefundable: "Entièrement remboursable",
    stickyReserve: "Réserver",
    models: {
      "007": {
        title: "Woolet 007 — lunettes rondes panto en acétate, 158 mm",
        metaDescription: "Monture ronde panto en acétate, 158 mm de large avec pont keyhole 21 mm. Conçue pour les visages de 155 mm+. Réservez pour 1 $ et bloquez le prix fondateur de 114 $.",
        ogDescription: "Réservez pour 1 $, remboursable. Bloque le prix fondateur de 114 $ (prix public 190 $). Face de 158 mm, pont keyhole de 21 mm.",
        jsonLdDescription: "Monture ronde panto en acétate, 158 mm de large avec un pont keyhole de 21 mm. Acétate Mazzucchelli de Milan, fait main dans l'UE. Conçue pour les visages de 155 mm et plus.",
        shapeEm: "Panto",
        intro: "Conçue pour les visages de 155 mm et plus. Face de 158 mm, pont keyhole de 21 mm.",
        crossLink: "Vous préférez une forme carrée douce ? Découvrez la Woolet 009 →",
        specs: [
          ["Matière", "Acétate Mazzucchelli de Milan"],
          ["Largeur de monture", "158 mm (de charnière à charnière)"],
          ["Verres", "52 × 52 mm (panto ronde)"],
          ["Pont", "Keyhole 21 mm"],
          ["Branches", "148 mm, angle de 11°"],
          ["Charnières", "5 barils, PVD Gunmetal"],
          ["Rivets", "Doubles, PVD Gunmetal"],
        ],
        benefits: [
          "Acétate Mazzucchelli de Milan - fait main dans l'UE",
          "158 mm - conçue pour les visages de 155 mm+",
          "Charnières 5 barils PVD Gunmetal - faites pour des années de port quotidien",
          "Pont keyhole 21 mm - zéro glissement",
          "Polie à la main, bords biseautés - pas de polissage machine",
        ],
      },
      "009": {
        title: "Woolet 009 — lunettes carrées en acétate, 158 mm",
        metaDescription: "Monture carrée douce en acétate, 158 mm de large avec pont 20 mm. Conçue pour les visages de 155 mm+. Réservez pour 1 $ et bloquez le prix fondateur de 114 $.",
        ogDescription: "Réservez pour 1 $, remboursable. Bloque le prix fondateur de 114 $ (prix public 190 $). Face de 158 mm, pont de 20 mm.",
        jsonLdDescription: "Monture carrée douce en acétate, 158 mm de large avec un pont de 22 mm. Acétate Mazzucchelli de Milan, fait main dans l'UE. Conçue pour les visages de 155 mm et plus.",
        shapeEm: "Carrée douce",
        intro: "Conçue pour les visages de 155 mm et plus. Face de 158 mm, pont de 20 mm.",
        crossLink: "Vous préférez une panto ronde ? Découvrez la Woolet 007 →",
        specs: [
          ["Matière", "Acétate Mazzucchelli de Milan"],
          ["Largeur de monture", "158 mm (de charnière à charnière)"],
          ["Verres", "54 × 50 mm (carrée douce)"],
          ["Pont", "Keyhole 20 mm"],
          ["Branches", "148 mm, angle de 11°"],
          ["Charnières", "5 barils, PVD Gunmetal"],
          ["Rivets", "Doubles, PVD Gunmetal"],
        ],
        benefits: [
          "Acétate Mazzucchelli de Milan - fait main dans l'UE",
          "158 mm - conçue pour les visages de 155 mm+",
          "Charnières 5 barils PVD Gunmetal - faites pour des années de port quotidien",
          "Pont keyhole 20 mm - zéro glissement",
          "Polie à la main, bords biseautés - pas de polissage machine",
        ],
      },
    },
  },

  nl: {
    scarcity: "4.900+ op de wachtlijst · Eerste serie beperkt tot 300 stuks",
    subline: "158 mm · Handgemaakt in de EU · Mazzucchelli-acetaat uit Milaan",
    headlinePre: "Eindelijk een bril die niet ",
    headlineEm: "knelt",
    headlinePost: ".",
    today: "vandaag",
    locksPre: "zet je founding-prijs van ",
    locksMid: " vast - adviesprijs ",
    locksPost: " bij de lancering",
    cta: "Reserveer je bril - $1",
    trust: "Altijd volledig terugbetaalbaar · Vandaag geen verdere kosten · Founding-prijs blijvend vastgezet",
    fitQuiz: "Twijfel je over je maat? Check je pasvorm in 30 seconden →",
    lensReassure: "Glazen op sterkte, blauwlichtfilter en gepolariseerde glazen kies je later, nadat je montuur is verzonden. Vandaag betaal je niets extra.",
    coloursLabel: "Lanceerkleuren",
    coloursNote: "Kies je kleur na de campagne",
    showColour: (name) => `Toon ${name}`,
    colourNames: { havana: "Honingschildpad", black: "Pianozwart", crystal: "Kristal" },
    whatYouGet: "Wat je krijgt",
    specsTitle: "Volledige specificaties en afmetingen",
    afterTitlePre: "Wat er gebeurt na je ",
    steps: [
      ["Vandaag", "Je betaalt $1. Volledig terugbetaalbaar. Je founding-prijs staat vast."],
      ["Bij de lancering", "We mailen je. Je kiest kleur, type glas en sterkte."],
      ["Q3 2026", "Je montuur wordt verzonden. De $1 gaat van de eindprijs af."],
    ],
    stepLabel: "Stap",
    crossBespoke: "Andere breedte nodig? Ontdek Bespoke →",
    stickyToday: "$1 vandaag",
    stickyLocks: " · zet $114 vast",
    stickyRefundable: "Volledig terugbetaalbaar",
    stickyReserve: "Reserveer",
    models: {
      "007": {
        title: "Woolet 007 — ronde panto acetaatbril, 158 mm",
        metaDescription: "Ronde panto in acetaat, 158 mm breed met 21 mm brug. Ontworpen voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast.",
        ogDescription: "Reserveer voor $1, terugbetaalbaar. Zet de founding-prijs van $114 vast (adviesprijs $190). Front van 158 mm, keyhole-brug van 21 mm.",
        jsonLdDescription: "Ronde panto in acetaat, 158 mm breed met een keyhole-brug van 21 mm. Mazzucchelli-acetaat uit Milaan, handgemaakt in de EU. Ontworpen voor gezichten van 155 mm en breder.",
        shapeEm: "Panto",
        intro: "Ontworpen voor gezichten van 155 mm en breder. Front van 158 mm, keyhole-brug van 21 mm.",
        crossLink: "Liever een zacht vierkante vorm? Bekijk de Woolet 009 →",
        specs: [
          ["Materiaal", "Mazzucchelli-acetaat uit Milaan"],
          ["Montuurbreedte", "158 mm (van scharnier tot scharnier)"],
          ["Glazen", "52 × 52 mm (ronde panto)"],
          ["Brug", "Keyhole 21 mm"],
          ["Veren", "148 mm, hoek van 11°"],
          ["Scharnieren", "5-barrel, PVD Gunmetal"],
          ["Klinknagels", "Dubbel, PVD Gunmetal"],
        ],
        benefits: [
          "Mazzucchelli-acetaat uit Milaan - handgemaakt in de EU",
          "158 mm - ontworpen voor gezichten van 155 mm+",
          "5-barrel PVD Gunmetal-scharnieren - gemaakt voor jaren dagelijks gebruik",
          "Keyhole-brug 21 mm - glijdt niet af",
          "Met de hand gepolijst, schuin afgewerkte randen - geen machinepolijsting",
        ],
      },
      "009": {
        title: "Woolet 009 — vierkante acetaatbril, 158 mm",
        metaDescription: "Zachte vierkante acetaatbril, 158 mm breed met 20 mm brug. Voor gezichten van 155 mm+. Reserveer voor $1 en zet de $114 founding-prijs vast.",
        ogDescription: "Reserveer voor $1, terugbetaalbaar. Zet de founding-prijs van $114 vast (adviesprijs $190). Front van 158 mm, brug van 20 mm.",
        jsonLdDescription: "Zacht vierkant acetaatmontuur, 158 mm breed met een brug van 22 mm. Mazzucchelli-acetaat uit Milaan, handgemaakt in de EU. Ontworpen voor gezichten van 155 mm en breder.",
        shapeEm: "Zacht vierkant",
        intro: "Ontworpen voor gezichten van 155 mm en breder. Front van 158 mm, brug van 20 mm.",
        crossLink: "Liever een ronde panto? Bekijk de Woolet 007 →",
        specs: [
          ["Materiaal", "Mazzucchelli-acetaat uit Milaan"],
          ["Montuurbreedte", "158 mm (van scharnier tot scharnier)"],
          ["Glazen", "54 × 50 mm (zacht vierkant)"],
          ["Brug", "Keyhole 20 mm"],
          ["Veren", "148 mm, hoek van 11°"],
          ["Scharnieren", "5-barrel, PVD Gunmetal"],
          ["Klinknagels", "Dubbel, PVD Gunmetal"],
        ],
        benefits: [
          "Mazzucchelli-acetaat uit Milaan - handgemaakt in de EU",
          "158 mm - ontworpen voor gezichten van 155 mm+",
          "5-barrel PVD Gunmetal-scharnieren - gemaakt voor jaren dagelijks gebruik",
          "Keyhole-brug 20 mm - glijdt niet af",
          "Met de hand gepolijst, schuin afgewerkte randen - geen machinepolijsting",
        ],
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Bespoke PDP                                                                */
/* -------------------------------------------------------------------------- */

type BespokeCopy = {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  heroAlt: string;
  viewShape: (shape: string) => string;
  thumbAlt: (shape: string) => string;
  tags: [string, string, string];
  cutToFace: string;
  eyebrow: string;
  subline: string;
  h2: string;
  foundingPrice: string;
  reservePre: string;
  reservePost: string;
  modelLabel: string;
  model009: string;
  cta: string;
  fitCta: string;
  benefits: string[];
  specsTitle: string;
  specs: Spec[];
  guaranteeTitle: string;
  guarantees: Spec[];
  backToCollection: string;
  stickyReserve: string;
};

export const BESPOKE_COPY: Record<PdpLang, BespokeCopy> = {
  en: {
    title: "Woolet Bespoke — Custom Acetate Glasses Cut to Your Face",
    metaDescription: "Woolet Bespoke: 145-172 mm custom frames, hand made in Greece from Italian acetate. $480 with standard prescription lenses and free worldwide shipping.",
    ogTitle: "Woolet Bespoke — Custom Acetate Glasses",
    ogDescription: "Woolet Bespoke: 145-172 mm custom frames, $480 with standard prescription lenses and free worldwide shipping. Specialty upgrades cost extra.",
    heroAlt: "Woolet Bespoke — custom acetate frame silhouette",
    viewShape: (s) => `View ${s}`,
    thumbAlt: (s) => `Woolet Bespoke ${s} silhouette`,
    tags: ["Rx / Progressive", "Blue Light", "Polarized Sun"],
    cutToFace: "· Cut to your face",
    eyebrow: "Made to measure - hand made in Greece (EU)",
    subline: "Custom · 145–172 mm · Italian acetate",
    h2: "Bespoke Italian Mazzucchelli acetate glasses cut to your exact face — four silhouettes, front width 145–172 mm, bridge and temples cut to your measurements.",
    foundingPrice: "Founding Price",
    reservePre: "Reserve today for ",
    reservePost: " — fully refundable deposit. Locks in the founding price; SRP $480 at launch.",
    modelLabel: "Model",
    model009: "009 Square",
    cta: "Reserve for $1 — Lock $299",
    fitCta: "Check your fit — Free quiz",
    benefits: [
      "Cut to your exact face — no fit compromises",
      "Choose one of four silhouettes: Aviator, Rectangle, Crown Panto, Round",
      "Italian Mazzucchelli acetate — cotton, not plastic",
      "5-barrel PVD Gunmetal hinges — built for years of daily wear",
      "Optional laser engraving on the temple",
    ],
    specsTitle: "Specifications",
    specs: [
      ["Material", "Italian Mazzucchelli Acetate"],
      ["Frame Width", "Cut to your face (145–172 mm)"],
      ["Shapes", "Aviator · Rectangle · Crown Panto · Round"],
      ["Bridge", "Cut to your nose"],
      ["Temples", "Cut to your temple length"],
      ["Hinges", "5-barrel PVD Gunmetal"],
      ["Rivets", "Double, PVD Gunmetal"],
    ],
    guaranteeTitle: "Woolet Guarantee",
    guarantees: [
      ["30-Day Returns", "No questions asked. Full refund if the frames don't meet expectations."],
      ["Fit Guarantee", "Cut to your measurements — if the frame doesn't fit, free re-cut."],
      ["Mazzucchelli Since 1849", "Italian acetate used by Tom Ford and Oliver Peoples."],
      ["Free Shipping + Insurance", "Insured courier delivery with real-time tracking."],
    ],
    backToCollection: "← Back to collection",
    stickyReserve: "Reserve for $1",
  },
  fr: {
    title: "Woolet Bespoke — lunettes en acétate sur mesure, taillées pour votre visage",
    metaDescription: "Lunettes sur mesure Woolet Bespoke, largeur 145-172 mm. Fabriquées en Grèce en acétate italien. 480 $ avec verres correcteurs standard et livraison offerte.",
    ogTitle: "Woolet Bespoke — lunettes en acétate sur mesure",
    ogDescription: "Woolet Bespoke - 145-172 mm, 480 $ avec verres correcteurs standard et livraison mondiale gratuite. Verres spéciaux en supplément.",
    heroAlt: "Woolet Bespoke - silhouette de monture en acétate sur mesure",
    viewShape: (s) => `Voir ${s}`,
    thumbAlt: (s) => `Silhouette ${s} Woolet Bespoke`,
    tags: ["Rx / Progressifs", "Lumière bleue", "Solaire polarisé"],
    cutToFace: "· Taillée pour votre visage",
    eyebrow: "Sur mesure - fabriqué à la main en Grèce (UE)",
    subline: "Sur mesure · 145-172 mm · Acétate italien",
    h2: "Lunettes bespoke en acétate italien Mazzucchelli, taillées précisément pour votre visage : quatre silhouettes, largeur de face 145-172 mm, pont et branches taillés selon vos mesures.",
    foundingPrice: "Prix fondateur",
    reservePre: "Réservez aujourd'hui pour ",
    reservePost: " - acompte entièrement remboursable. Il bloque le prix fondateur ; prix public 480 $ au lancement.",
    modelLabel: "Modèle",
    model009: "009 Carrée",
    cta: "Réserver pour 1 $ - bloquer 299 $",
    fitCta: "Vérifiez votre ajustement - quiz gratuit",
    benefits: [
      "Taillée précisément pour votre visage - aucun compromis sur l'ajustement",
      "Choisissez parmi quatre silhouettes : Aviator, Rectangle, Crown Panto, Round",
      "Acétate italien Mazzucchelli - à base de coton, pas de plastique",
      "Charnières 5 barils PVD Gunmetal - faites pour des années de port quotidien",
      "Gravure laser en option sur la branche",
    ],
    specsTitle: "Caractéristiques",
    specs: [
      ["Matière", "Acétate italien Mazzucchelli"],
      ["Largeur de monture", "Taillée pour votre visage (145-172 mm)"],
      ["Formes", "Aviator · Rectangle · Crown Panto · Round"],
      ["Pont", "Taillé pour votre nez"],
      ["Branches", "Taillées à votre longueur de branche"],
      ["Charnières", "5 barils, PVD Gunmetal"],
      ["Rivets", "Doubles, PVD Gunmetal"],
    ],
    guaranteeTitle: "Garantie Woolet",
    guarantees: [
      ["Retours sous 30 jours", "Sans justification. Remboursement intégral si la monture ne répond pas à vos attentes."],
      ["Garantie d'ajustement", "Taillée selon vos mesures - si la monture ne vous va pas, nous la retaillons gratuitement."],
      ["Mazzucchelli depuis 1849", "L'acétate italien utilisé par Tom Ford et Oliver Peoples."],
      ["Livraison offerte + assurance", "Livraison assurée par transporteur avec suivi en temps réel."],
    ],
    backToCollection: "← Retour à la collection",
    stickyReserve: "Réserver pour 1 $",
  },
  nl: {
    title: "Woolet Bespoke — acetaatbril op maat van je gezicht",
    metaDescription: "Woolet Bespoke op maat, 145-172 mm. Handgemaakt in Griekenland van Italiaans acetaat. $480 inclusief standaard glazen op sterkte en wereldwijde verzending.",
    ogTitle: "Woolet Bespoke — acetaatbril op maat",
    ogDescription: "Woolet Bespoke - 145-172 mm, $480 inclusief standaard glazen op sterkte en gratis wereldwijde verzending. Speciale glazen kosten extra.",
    heroAlt: "Woolet Bespoke - silhouet van een acetaatmontuur op maat",
    viewShape: (s) => `Bekijk ${s}`,
    thumbAlt: (s) => `Woolet Bespoke ${s}-silhouet`,
    tags: ["Rx / Multifocaal", "Blauw licht", "Gepolariseerd zonneglas"],
    cutToFace: "· Op maat van je gezicht",
    eyebrow: "Op maat - handgemaakt in Griekenland (EU)",
    subline: "Op maat · 145-172 mm · Italiaans acetaat",
    h2: "Bespoke bril van Italiaans Mazzucchelli-acetaat, precies op jouw gezicht gesneden: vier silhouetten, frontbreedte 145-172 mm, brug en veren op jouw maten.",
    foundingPrice: "Founding-prijs",
    reservePre: "Reserveer vandaag voor ",
    reservePost: " - volledig terugbetaalbare aanbetaling. Zet de founding-prijs vast; adviesprijs $480 bij de lancering.",
    modelLabel: "Model",
    model009: "009 Vierkant",
    cta: "Reserveer voor $1 - zet $299 vast",
    fitCta: "Check je pasvorm - gratis quiz",
    benefits: [
      "Precies op jouw gezicht gesneden - geen compromissen in pasvorm",
      "Kies uit vier silhouetten: Aviator, Rectangle, Crown Panto, Round",
      "Italiaans Mazzucchelli-acetaat - gemaakt van katoen, geen plastic",
      "5-barrel PVD Gunmetal-scharnieren - gemaakt voor jaren dagelijks gebruik",
      "Optionele lasergravure op de veer",
    ],
    specsTitle: "Specificaties",
    specs: [
      ["Materiaal", "Italiaans Mazzucchelli-acetaat"],
      ["Montuurbreedte", "Op maat van je gezicht (145-172 mm)"],
      ["Vormen", "Aviator · Rectangle · Crown Panto · Round"],
      ["Brug", "Op maat van je neus"],
      ["Veren", "Op maat van je veerlengte"],
      ["Scharnieren", "5-barrel, PVD Gunmetal"],
      ["Klinknagels", "Dubbel, PVD Gunmetal"],
    ],
    guaranteeTitle: "Woolet-garantie",
    guarantees: [
      ["30 dagen retour", "Zonder opgaaf van reden. Volledige terugbetaling als het montuur niet aan je verwachtingen voldoet."],
      ["Pasvormgarantie", "Op jouw maten gesneden - past het montuur niet, dan snijden we het gratis opnieuw."],
      ["Mazzucchelli sinds 1849", "Italiaans acetaat dat ook Tom Ford en Oliver Peoples gebruiken."],
      ["Gratis verzending + verzekering", "Verzekerde levering per koerier met realtime track & trace."],
    ],
    backToCollection: "← Terug naar de collectie",
    stickyReserve: "Reserveer voor $1",
  },
};

/* -------------------------------------------------------------------------- */
/* Shared PDP components: FAQ, lens options, gallery                          */
/* -------------------------------------------------------------------------- */

export type FaqItem = { q: string; a: string };

/** FR/NL versions of PRODUCT_FAQ (src/seo/faq-data.ts). Same order and facts. */
export const PRODUCT_FAQ_I18N: Record<Exclude<PdpLang, "en">, FaqItem[]> = {
  fr: [
    {
      q: "Comment savoir si la monture ira à mon visage ?",
      a: "Mesurez la largeur de votre visage d'une tempe à l'autre. Si le résultat atteint 155 mm ou plus, Woolet est conçue précisément pour vous. Notre quiz d'ajustement sur /en/fit vous aide à confirmer votre taille en 60 secondes. Si la monture ne vous va toujours pas, nous l'échangeons gratuitement grâce à notre Garantie d'ajustement.",
    },
    {
      q: "Puis-je retourner les lunettes si elles ne me conviennent pas ?",
      a: "Oui. Vous disposez de 30 jours pour les retourner, sans justification. Nous remboursons l'intégralité du montant sur votre moyen de paiement d'origine. Renvoyez simplement la monture dans son emballage d'origine.",
    },
    {
      q: "En quoi Woolet diffère-t-elle des lunettes pour visage large moins chères ?",
      a: "La plupart des marques de montures larges (Fatheadz, BXL, Zenni) utilisent du plastique TR90 ou un acétate bon marché. Woolet utilise l'acétate italien Mazzucchelli, le même matériau que les montures à plus de 500 $. Nous y ajoutons des charnières 5 barils PVD Gunmetal, un pont keyhole de 21 mm et un polissage à la main. Une qualité premium au prix Membre fondateur de 114 $ (prix normal 190 $, soit 40 % d'économie).",
    },
    {
      q: "Quand vais-je recevoir ma commande ?",
      a: "En tant que Membre fondateur, vous recevez votre monture dès la première série de production. Expédition par transporteur, avec assurance complète et suivi. Délai de livraison estimé : 5 à 7 jours ouvrés (UE), 7 à 12 jours (reste du monde).",
    },
    {
      q: "Woolet propose-t-elle des verres correcteurs (Rx) ?",
      a: "Oui, les montures Woolet sont compatibles avec des verres correcteurs. Vous pouvez les faire monter chez n'importe quel opticien. La base 4 convient à la plupart des corrections. Nous prévoyons aussi un service Rx intégré à l'avenir.",
    },
  ],
  nl: [
    {
      q: "Hoe weet ik of het montuur bij mijn gezicht past?",
      a: "Meet de breedte van je gezicht van slaap tot slaap. Kom je uit op 155 mm of meer, dan is Woolet speciaal voor jou ontworpen. Met onze pasvormquiz op /en/fit bevestig je je maat in 60 seconden. Past het montuur toch niet, dan ruilen we het gratis om onder onze pasvormgarantie.",
    },
    {
      q: "Kan ik de bril retourneren als hij me niet bevalt?",
      a: "Ja. Je hebt 30 dagen om hem zonder opgaaf van reden terug te sturen. We betalen het volledige bedrag terug via je oorspronkelijke betaalmethode. Stuur het montuur gewoon terug in de originele verpakking.",
    },
    {
      q: "Waarin verschilt Woolet van goedkopere brillen voor brede gezichten?",
      a: "De meeste merken met brede monturen (Fatheadz, BXL, Zenni) gebruiken TR90-kunststof of goedkoop acetaat. Woolet gebruikt Italiaans Mazzucchelli-acetaat, hetzelfde materiaal als in monturen van $500+. Daar komen 5-barrel PVD Gunmetal-scharnieren, een keyhole-brug van 21 mm en handmatig polijsten bij. Premium kwaliteit voor de Founding Member-prijs van $114 (normaal $190, 40% korting).",
    },
    {
      q: "Wanneer ontvang ik mijn bestelling?",
      a: "Als Founding Member ontvang je je montuur uit de eerste productieserie. Verzonden per koerier, volledig verzekerd en met track & trace. Geschatte levertijd: 5-7 werkdagen (EU), 7-12 dagen (rest van de wereld).",
    },
    {
      q: "Biedt Woolet glazen op sterkte (Rx) aan?",
      a: "Ja, Woolet-monturen zijn geschikt voor glazen op sterkte. Je kunt de glazen bij elke opticien laten plaatsen. De basiscurve 4 is geschikt voor de meeste sterktes. We plannen in de toekomst ook een eigen Rx-service.",
    },
  ],
};

type LensUiCopy = {
  eyebrow: string;
  heading: string;
  notYetAvailable: string;
  quotedSeparately: string;
  included: string;
  frame: string;
  forWord: string;
  startWithFit: string;
  fitLine: (front: string, lens: string, id: string) => string;
  honestNote: string;
  blueLightLinkLabel: string;
  labels: Record<"clear" | "blue-light" | "blue-light-soon" | "prescription", string>;
  descriptions: Record<"clear" | "blue-light-soon" | "prescription", string>;
  blueLightReadyDescription: (spec: string) => string;
};

export const LENS_UI_COPY: Record<Exclude<PdpLang, "en">, LensUiCopy> = {
  fr: {
    eyebrow: "Verres",
    heading: "Options de verres",
    notYetAvailable: "Pas encore disponible",
    quotedSeparately: "Sur devis",
    included: "Inclus",
    frame: "monture",
    forWord: "pour",
    startWithFit: "Commencez par votre ajustement →",
    fitLine: (front, lens, id) => `Chaque verre Woolet est taillé pour une face de ${front} mm - largeur de verre ${lens} mm (${id}).`,
    honestNote: "Un filtre anti-lumière bleue est une option de verre, pas une promesse de santé. Les études sur la fatigue visuelle et le sommeil ne sont pas concluantes. Ce que nous pouvons garantir, c'est l'ajustement.",
    blueLightLinkLabel: "Des lunettes anti-lumière bleue qui vont vraiment à un visage large",
    labels: {
      clear: "Verres transparents",
      "blue-light": "Filtre anti-lumière bleue",
      "blue-light-soon": "Filtre anti-lumière bleue - bientôt disponible",
      prescription: "Verres correcteurs (Rx)",
    },
    descriptions: {
      clear: "Verres transparents standard. UV400.",
      "blue-light-soon": "Traitement en option, UV400. Un traitement de verre optionnel, pas un dispositif médical. La plage de filtration et le prix seront confirmés avant l'expédition de la première série.",
      prescription: "Votre propre correction, montée sur une face de 158 mm. Sur devis.",
    },
    blueLightReadyDescription: (spec) => `Traitement en option qui filtre la lumière bleue dans la plage ${spec}. UV400. Un traitement de verre optionnel, pas un dispositif médical.`,
  },
  nl: {
    eyebrow: "Glazen",
    heading: "Glasopties",
    notYetAvailable: "Nog niet beschikbaar",
    quotedSeparately: "Prijs op aanvraag",
    included: "Inbegrepen",
    frame: "montuur",
    forWord: "voor",
    startWithFit: "Begin met je pasvorm →",
    fitLine: (front, lens, id) => `Elk Woolet-glas wordt geslepen voor een front van ${front} mm - glasbreedte ${lens} mm (${id}).`,
    honestNote: "Een blauwlichtfilter is een glasoptie, geen gezondheidsclaim. Het onderzoek naar vermoeide ogen en slaap is niet eenduidig. Wat we wel kunnen garanderen, is de pasvorm.",
    blueLightLinkLabel: "Blauwlichtbrillen die echt passen bij een breed gezicht",
    labels: {
      clear: "Heldere glazen",
      "blue-light": "Blauwlichtfilter",
      "blue-light-soon": "Blauwlichtfilter - binnenkort",
      prescription: "Glazen op sterkte (Rx)",
    },
    descriptions: {
      clear: "Standaard heldere glazen. UV400.",
      "blue-light-soon": "Optionele coating, UV400. Een optionele glascoating, geen medisch hulpmiddel. Filterbereik en prijs worden bevestigd voordat de eerste serie wordt verzonden.",
      prescription: "Je eigen sterkte, passend gemaakt voor een front van 158 mm. Prijs op aanvraag.",
    },
    blueLightReadyDescription: (spec) => `Optionele coating die blauw licht filtert in het bereik ${spec}. UV400. Een optionele glascoating, geen medisch hulpmiddel.`,
  },
};

type GalleryCopy = {
  prev: string;
  next: string;
  showPhoto: (i: number, n: number, caption: string) => string;
  photosGroup: (model: string) => string;
  packshotAlt: (model: PdpModel, colour: string) => string;
  packshotCaption: (model: PdpModel, colour: string) => string;
  founderAlt: (model: PdpModel, colour: string) => string;
  founderCaption: string;
  shared: Record<string, { alt: string; caption: string }>;
};

const GALLERY_SHAPE_FR: Record<PdpModel, string> = { "007": "panto rondes", "009": "carrées douces" };
const GALLERY_BRIDGE_FR: Record<PdpModel, string> = { "007": "pont keyhole de 21 mm", "009": "pont de 22 mm" };
const GALLERY_SHAPE_NL: Record<PdpModel, string> = { "007": "ronde panto", "009": "zacht vierkante" };
const GALLERY_BRIDGE_NL: Record<PdpModel, string> = { "007": "keyhole-brug van 21 mm", "009": "brug van 22 mm" };

/** Keys of `shared` are `${model}:${mediaId}` from src/data/product-media.ts. */
export const GALLERY_COPY: Record<Exclude<PdpLang, "en">, GalleryCopy> = {
  fr: {
    prev: "Photo précédente",
    next: "Photo suivante",
    showPhoto: (i, n, c) => `Afficher la photo ${i} sur ${n} - ${c}`,
    photosGroup: (m) => `Photos Woolet ${m}`,
    packshotAlt: (m, c) => `Woolet ${m} - lunettes ${GALLERY_SHAPE_FR[m]} en acétate Mazzucchelli, coloris ${c.toLowerCase()}, face de 158 mm · ${GALLERY_BRIDGE_FR[m]}`,
    packshotCaption: (m, c) => `${c} - face de 158 mm, ${GALLERY_BRIDGE_FR[m]}`,
    founderAlt: (m, c) => `Woolet ${m} coloris ${c.toLowerCase()} portée sur un visage de 158 mm - ajustement réel, vue de face`,
    founderCaption: "Portée sur un visage de 158 mm - le fondateur, sans retouche",
    shared: {
      "007:detail": {
        alt: "Gros plan sur la charnière, les rivets et le bord en acétate poli à la main de la Woolet 007",
        caption: "Charnière PVD 5 barils, rivets doubles, bord poli à la main",
      },
      "007:scale": {
        alt: "Schéma des dimensions de la Woolet 007 panto ronde : largeur de face 158 mm, largeur de verre 52 mm, hauteur de verre 52 mm, pont 21 mm, branches 150 mm",
        caption: "Face 158 mm · verres 52 × 52 mm · pont 21 mm · branches 150 mm",
      },
      "009:on-face": {
        alt: "Greg, testeur au visage de 158 mm, portant les lunettes Woolet 009 carrées douces en acétate",
        caption: "Greg - visage de 158 mm, porte la 009",
      },
      "009:on-face-2": {
        alt: "Portrait de trois quarts d'un testeur au visage large portant la Woolet 009 carrée douce, branches bien droites",
        caption: "De profil - les branches restent droites, sans s'écarter",
      },
      "009:scale": {
        alt: "Schéma des dimensions de la Woolet 009 carrée douce : largeur de face 158 mm, largeur de verre 54 mm, hauteur de verre 50 mm, pont 22 mm, branches 150 mm",
        caption: "Face 158 mm · verres 54 × 50 mm · pont 22 mm · branches 150 mm",
      },
    },
  },
  nl: {
    prev: "Vorige foto",
    next: "Volgende foto",
    showPhoto: (i, n, c) => `Toon foto ${i} van ${n} - ${c}`,
    photosGroup: (m) => `Foto's Woolet ${m}`,
    packshotAlt: (m, c) => `Woolet ${m} - ${GALLERY_SHAPE_NL[m]} Mazzucchelli-acetaatbril in ${c.toLowerCase()}, front van 158 mm · ${GALLERY_BRIDGE_NL[m]}`,
    packshotCaption: (m, c) => `${c} - front van 158 mm, ${GALLERY_BRIDGE_NL[m]}`,
    founderAlt: (m, c) => `Woolet ${m} in ${c.toLowerCase()} gedragen op een gezicht van 158 mm breed - echte pasvorm, vooraanzicht`,
    founderCaption: "Gedragen op 158 mm - de oprichter, zonder retouche",
    shared: {
      "007:detail": {
        alt: "Close-up van het scharnier, de klinknagels en de handgepolijste acetaatrand van de Woolet 007",
        caption: "5-barrel PVD-scharnier, dubbele klinknagels, handgepolijste rand",
      },
      "007:scale": {
        alt: "Maattekening van de Woolet 007 ronde panto: frontbreedte 158 mm, glasbreedte 52 mm, glashoogte 52 mm, brug 21 mm, veerlengte 150 mm",
        caption: "Front 158 mm · glazen 52 × 52 mm · brug 21 mm · veren 150 mm",
      },
      "009:on-face": {
        alt: "Greg, tester met een gezicht van 158 mm, draagt de Woolet 009 zacht vierkante acetaatbril",
        caption: "Greg - gezicht van 158 mm, draagt de 009",
      },
      "009:on-face-2": {
        alt: "Portret schuin van opzij van een tester met een breed gezicht in de Woolet 009 zacht vierkant, met recht lopende veren",
        caption: "Zijaanzicht - de veren lopen recht, buigen niet uit",
      },
      "009:scale": {
        alt: "Maattekening van de Woolet 009 zacht vierkant: frontbreedte 158 mm, glasbreedte 54 mm, glashoogte 50 mm, brug 22 mm, veerlengte 150 mm",
        caption: "Front 158 mm · glazen 54 × 50 mm · brug 22 mm · veren 150 mm",
      },
    },
  },
};

