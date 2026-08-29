export type NlFaq = { q: string; a: string };

export type NlPageConfig = {
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
  faqs: NlFaq[];
  englishEquivalent: string;
};

export const nlPages: Record<string, NlPageConfig> = {
  "acetaat-bril-op-maat": {
    slug: "acetaat-bril-op-maat",
    eyebrow: "Woolet · Acetaat bril op maat",
    h1: "Acetaat bril op maat — gesneden op jouw gezicht, tot op de millimeter",
    sub: "Frontbreedte van 150 tot 165 mm, brug, veren en glashoogte individueel afgesteld. Italiaans Mazzucchelli 1849 acetaat, met de hand afgewerkt in de EU.",
    metaTitle: "Acetaat bril op maat 145–172 mm | Woolet — Italiaans acetaat",
    metaDescription:
      "Acetaat bril op maat voor bredere gezichten: front 145–172 mm, brug 20–24 mm, veren op maat. Italiaans Mazzucchelli-acetaat, handgemaakt in de EU. FitLens-meting in 20 s.",
    primaryKeyword: "acetaat bril op maat",
    ctaPrimaryLabel: "Meet je gezicht (20 s)",
    ctaPrimaryHref: "/nl/fit",
    ctaSecondaryLabel: "Open configurator",
    ctaSecondaryHref: "/en/bespoke/configurator",
    problemH2: '„Personaliseerbaar" en „op maat" zijn niet hetzelfde',
    problemBody:
      'De meeste zogenaamd „customizable" merken laten je alleen een kleur kiezen op een bestaand montuur. Woolet Bespoke werkt anders: frontbreedte, brug, veerlengte en glashoogte stel je onafhankelijk in, tot op de millimeter. De mal wordt aangepast aan jouw gezicht vóór het acetaat wordt gesneden.',
    proofH2: "Italiaans acetaat, met de hand afgewerkt",
    proofBody:
      "We werken met Mazzucchelli 1849 acetaat, al ruim 70 jaar geproduceerd in Italië. Europese ateliers frezen, polijsten en zetten scharnieren per montuur afzonderlijk. Reken op circa 4–6 weken productie na bevestiging van de bestelling.",
    proofBullets: [
      { label: "Frontbreedte", value: "145 – 162 mm" },
      { label: "Op maat", value: "front / brug / veren / hoogte" },
      { label: "Materiaal", value: "Mazzucchelli 1849, Italiaans acetaat" },
      { label: "Doorlooptijd", value: "4 – 6 weken, handmatig in EU" },
    ],
    closingH2: "Stop met genoegen nemen met standaardmaten",
    closingBody:
      "Eén foto is genoeg om je maten uit te lezen. Kleur en vorm kies je daarna in de online configurator. Productie start pas na jouw definitieve bevestiging.",
    faqs: [
      {
        q: "Hoe ver kunnen de afmetingen worden aangepast?",
        a: "Front: 145–172 mm. Brug: 20–24 mm. Veren: 135–155 mm. Ook de glashoogte is instelbaar.",
      },
      {
        q: "Hoe verloopt de meting?",
        a: "FitLens gebruikt de camera van je telefoon om je gezichtsbreedte tot op de millimeter te meten. Het resultaat gaat direct naar de configurator.",
      },
      {
        q: "Wat is de doorlooptijd?",
        a: "Ongeveer 4–6 weken na bevestiging van de bestelling, met de hand geproduceerd in onze Europese ateliers.",
      },
      {
        q: "Kan ik een montuur op maat retourneren?",
        a: "Bespoke valt buiten standaardretour, maar bij een pasprobleem dekt onze Fit-garantie een nieuw montuur zonder meerprijs.",
      },
      {
        q: "Wat kost het?",
        a: "De Founding-prijs is voorbehouden aan mensen op de wachtlijst — circa 40% onder de publieke lanceringsprijs.",
      },
    ],
    englishEquivalent: "/en/bespoke",
  },
  "grote-brillen-heren": {
    slug: "grote-brillen-heren",
    eyebrow: "Woolet · Grote brillen heren",
    h1: "Grote brillen voor heren — ontworpen voor brede gezichten (155 mm+)",
    sub: "Frontbreedtes 155, 158 en 161 mm. Keyhole-brug van 21–22 mm voor bredere neusruggen. Italiaans Mazzucchelli-acetaat, handgemaakt in de EU. Twee vormen: rond (007) en zacht vierkant (009).",
    metaTitle: "Grote brillen heren 155–161 mm | Woolet — Italiaans acetaat",
    metaDescription:
      "Grote brillen voor heren met een breed gezicht: frontbreedte 155/158/161 mm, plus bespoke tot 165 mm. 21 mm keyhole-brug, Italiaans acetaat, handgemaakt in de EU.",
    primaryKeyword: "grote brillen heren",
    ctaPrimaryLabel: "Meet je gezicht (20 s)",
    ctaPrimaryHref: "/nl/fit",
    ctaSecondaryLabel: "Bekijk de collectie",
    ctaSecondaryHref: "/nl/collection",
    problemH2: '„XL" betekent bij de meeste merken helemaal geen XL',
    problemBody:
      "Grote maten in de reguliere optiek stoppen meestal rond 148–150 mm. Voor gezichten van 155 mm en breder blijft er dan weinig over: monturen die knellen op de slapen, veren die te kort zijn en een brug die op je neus drukt. Woolet begint daar juist: alle standaardmaten zijn 155 mm of breder.",
    proofH2: "Twee vormen. Één eerlijk breedtebereik.",
    proofBody:
      "De 007 (rond) en 009 (zacht vierkant) worden geleverd in drie precieze maten — 155, 158 en 161 mm — met een 21–22 mm keyhole-brug en veren van 148 mm. Wie erboven of eronder valt, gaat naar Bespoke: 145–172 mm, in stappen van 1 mm. Alles gesneden uit Italiaans Mazzucchelli 1849 acetaat.",
    proofBullets: [
      { label: "Standaardbreedte", value: "158 mm" },
      { label: "Bespoke bereik", value: "145 – 162 mm" },
      { label: "Brug", value: "21 – 22 mm keyhole" },
      { label: "Veren", value: "148 mm, hoek 11°" },
    ],
    closingH2: "Eindelijk een bril die past — zonder compromis op stijl",
    closingBody:
      "Meet je gezicht in 20 seconden met FitLens en zie meteen welke maat past. Founding-leden krijgen circa 40% korting op de publieke lanceringsprijs.",
    faqs: [
      {
        q: "Vanaf welke gezichtsbreedte past een Woolet?",
        a: "Woolet is ontworpen voor gezichten van 155 mm en breder, tot 165 mm via Bespoke.",
      },
      {
        q: "Wat is een keyhole-brug en waarom 21 mm?",
        a: "Een keyhole-brug rust op de zijkanten van de neusrug in plaats van erboven, waardoor de druk beter wordt verdeeld. 21–22 mm past de meeste bredere neusruggen zonder drukpunten.",
      },
      {
        q: "Kan ik sterkte laten inzetten?",
        a: "Ja, we leveren met plano-, blauwlicht- of sterkteglazen. Sterkteglazen worden bij je bestelling gemaakt door onze Europese optiekpartner.",
      },
      {
        q: "Hoe zit het met verzending naar Nederland?",
        a: "Verzending vanuit de EU naar Nederland is gratis boven de EUR 50. Levertijd 2–4 werkdagen na verzending; Bespoke 4–6 weken productie.",
      },
      {
        q: "Wat als de maat niet past?",
        a: "Onze Fit-garantie: past hij niet, dan ruilen we hem om of maken we een nieuwe zonder bijbetaling.",
      },
    ],
    englishEquivalent: "/en/collection",
  },
};

export const nlPageOrder = ["acetaat-bril-op-maat", "grote-brillen-heren"] as const;
