// German copy for /de/bespoke (23.11.2026). Until now the DE route rendered the
// English page. Numbers come from the same sources as the English copy
// (BESPOKE_FACTS, BESPOKE_COPY). Prices stay in USD on purpose: the configurator
// and the Stripe checkout charge Bespoke in USD, so a euro figure here would not
// match what the buyer pays.
import { BESPOKE_COPY } from "@/content/bespokePrices";
import { BESPOKE_FACTS } from "@/content/bespokeFacts";

const F = BESPOKE_FACTS;
const usd = (label: string) => `${label.replace(/^\+?\$/, "")} USD`;
const FRAME = usd(BESPOKE_COPY.frame);
const BLUE = `+${usd(BESPOKE_COPY.blueLight)}`;
const KS = usd(BESPOKE_COPY.kickstarter);

export const DE_BESPOKE = {
  h1: "Woolet Bespoke: Brillen nach Maß für dein Gesicht",
  heroLead: `Woolet Bespoke ist eine Maßbrille mit jeder Frontbreite von ${F.frontWidth}, einem Steg von ${F.bridge} und Bügeln von ${F.temples}. Gefertigt aus italienischem Mazzucchelli-1849-Acetat, handgemacht in der EU, für ${FRAME} inklusive kostenlosem weltweitem Versand. Klare Plano-Gläser sind dabei, Blaulichtfilter ${BLUE}.`,
  priceNote: "Bespoke wird in US-Dollar abgerechnet. Deine Bank rechnet den Betrag in Euro um.",
  photochromicLead: "Du willst selbsttönende Gläser? Dein Optiker tauscht die mitgelieferten Plano-Gläser dagegen aus - mehr dazu im Ratgeber",
  photochromicLink: "Brillen, die zur Sonnenbrille werden",
  ctaBuild: "Fassung gestalten →",
  ctaFit: "Breite unklar? Mach den Fit-Scan",
  ctaFitHref: "/de/fit",
  deposit: (amount: number) => `Du startest mit einer Anzahlung von ${amount} USD. Den Rest zahlst du, wenn du deine Visualisierung annimmst: dein Foto mit der Fassung und den vorgeschlagenen Maßen.`,
  videoLink: "So entsteht Bespoke (Video, 28 s, Englisch) →",
  specsHeading: "Die Daten im Überblick",
  specsIntro: "Woolet Bespoke wird für jede Person einzeln vermessen und nicht aus einem festen Größenlager gewählt. Im Konfigurator gibt es vier Formen: Aviator, Rectangle, Crown Panto und Round. Die Standardmodelle Woolet 007 und 009 sind eigene Designs mit fester Front von 158 mm.",
  specsHead: ["Merkmal", "Woolet Bespoke"] as const,
  specs: [
    ["Frontbreite", F.frontWidth],
    ["Steg", F.bridge],
    ["Bügel", F.temples],
    ["Formen", F.shapes.join(", ")],
    ["Regulärer Preis", FRAME],
    ["Gläser", `Klare Plano-Gläser inklusive, Blaulichtfilter ${BLUE}`],
    ["Versand", "Kostenloser weltweiter Versand"],
    ["Material", "Italienisches Mazzucchelli-1849-Celluloseacetat"],
    ["Herkunft", "Handgefertigt in der EU"],
    ["Fertigung", "2 Wochen nach Freigabe des 3D-Modells, danach Versand"],
    ["Garantie", "5 Jahre"],
  ] as const,
  guide: [
    {
      heading: "Eine Fassung nach deinen Maßen",
      text: `Maßanfertigung heißt: Frontbreite, Steg und Bügel werden für eine Person festgelegt und nicht aus einer vorhandenen Regalgröße gewählt. Woolet Bespoke deckt Frontbreiten von ${F.frontWidth}, Stege von ${F.bridge} und Bügellängen von ${F.temples} ab. Diese Zahlen beschreiben die Fassung, nicht das Versprechen, dass jedes gleich breite Gesicht dieselbe Brille braucht. Die Maße deiner Fassung entstehen in der Vermessung und der Prüfung des Modells. Wenn du zwischen Standardfassung und Maßanfertigung schwankst, miss zuerst deine Gesichtsbreite, statt von Hutgröße oder alter Brille zu raten.`,
    },
    {
      heading: "Wann eine Standardfassung reicht",
      text: "Die Standardmodelle Woolet 007 Round/Panto und 009 Soft Square haben beide eine Front von 158 mm und passen meist bei Gesichtsbreiten um 155-161 mm. Ihre Stege messen 25 mm, die Bügel 150 mm. Wenn diese festen Maße zu dir passen, ist eine Standardfassung oft die einfachere Wahl. Bespoke ist keine größere Version dieser Modelle: Die vier Formen Aviator, Rectangle, Crown Panto und Round sind eigene Konfigurator-Designs. Mit dem Fit-Scan vergleichst du deine Maße mit den Standardmaßen, bevor du dich für eine Maßanfertigung entscheidest.",
    },
    {
      heading: "Auch schmale Gesichter brauchen manchmal Maß",
      text: "Bespoke ist nicht nur für Menschen, denen normale Brillen zu klein sind. Eine Front von 145 mm passt zu schmaleren Gesichtern, 160 mm deckt das obere Ende ab. Dazwischen zählen auch Steg und Bügel: Eine Fassung kann vorne breit genug sein und trotzdem schlecht sitzen, wenn Steg oder Bügel nicht passen. Umgekehrt kann jemand im typischen Standardbereich eine eigene Form oder einen anderen Steg wollen. Der richtige Weg ergibt sich aus allen Maßen zusammen, nicht aus einer einzelnen Zahl.",
    },
    {
      heading: "So funktioniert die Vermessung aus der Ferne",
      text: "Nach der Bestellung beginnt die Anpassung mit einem Foto: Du schaust gerade in die Kamera und hältst eine Bankkarte flach an die Wange. Jede solche Karte ist 85,6 mm breit, daraus liest die Werkstatt deine echte Gesichtsbreite ab. Dazu gibst du die drei Zahlen ein, die innen in deiner aktuellen Brille stehen. Diese Maße sind der Ausgangspunkt für die Geometrie der Fassung: Das 3D-Modell nach Maß bekommst du vor der Fertigung zur Freigabe. Ist ein Maß unklar, wird es in dieser Prüfung geklärt. Die Fertigungszeit beginnt erst mit deiner Freigabe des 3D-Modells.",
    },
    {
      heading: "Welche der vier Formen?",
      text: "Aviator, Rectangle, Crown Panto und Round sind die vier Formen im Woolet-Bespoke-Konfigurator. Die Form wählst du nach Geschmack, wenn die Passform geklärt ist. Ein Aviator hat eine andere Kontur als ein Round, und Rectangle ist nicht dasselbe Design wie das Standardmodell 009 Soft Square. Ebenso ist Crown Panto nicht das Standardmodell 007 Round/Panto. Im Konfigurator siehst du die verfügbaren Acetatfarben, Oberflächen und Gläser zur gewählten Form. Egal welche Form: Frontbreite, Steg und Bügel richten sich nach den Maßen, die für deine Fassung vereinbart wurden.",
    },
    {
      heading: "Was im Preis enthalten ist",
      text: `Der reguläre Preis für Woolet Bespoke beträgt ${FRAME} für die Maßfassung inklusive kostenlosem weltweitem Versand. Klare Plano-Gläser ohne Korrektur sind dabei, Blaulichtfilter-Gläser kosten ${BLUE.slice(1)}, und dein Optiker kann die Plano-Gläser gegen deine Korrekturgläser tauschen. Korrekturgläser gibt es im Konfigurator nicht. ${KS} war ein Preis nur für Kickstarter-Unterstützer während der Kampagne, kein reguläres Angebot auf woolet.co. Die Bestellübersicht zeigt die Gläser und ihren Preis getrennt, damit der Gesamtbetrag deiner Auswahl entspricht.`,
    },
    {
      heading: "Material und Herstellungsort",
      text: "Woolet Bespoke ist aus italienischem Mazzucchelli-1849-Celluloseacetat. Italienisch beschreibt die Herkunft des Materials, nicht den Ort der Fertigung: Die Fassung wird in der EU von Hand gefertigt und vor dem Versand mit dem freigegebenen Modell abgeglichen. Auf die fertige Fassung gibt es 5 Jahre Garantie. Wenn du Marken vergleichst, trenne die Herkunft des Materials von der Herkunft der Fertigung und schau auf die echten Maße, auf das, was der Preis enthält, und auf den Ablauf der Herstellung.",
    },
    {
      heading: "Freigabe, Fertigung und Lieferung",
      text: `Die sechs Schritte: Konfiguration mit Vorschau, Bestellung, ein Foto mit Bankkarte als Maßstab, aus dem eine Visualisierung von dir mit der Fassung entsteht, Annahme dieser Visualisierung und Freigabe des 3D-Modells, Fertigung von Hand und weltweiter Versand. Die Fertigung dauert 2 Wochen ab Freigabe des Modells, danach wird versendet. Das heißt nicht, dass eine heute aufgegebene Bestellung in zwei Wochen ankommt: Prüfung der Maße und Versand sind eigene Phasen. Der kostenlose weltweite Versand ist im regulären Preis von ${FRAME} enthalten. Die ersten Bespoke-Paare wurden bereits ins Ausland verschickt, unter anderem nach Vietnam.`,
    },
  ],
  whatIs: {
    eyebrow: "WAS IST EINE MASSBRILLE",
    lead: "Maßbrille,",
    italic: "richtig erklärt.",
    p1: `Woolet Bespoke ist eine Fassung nach Maß, keine Standardgröße mit anderer Farbe. Frontbreiten von ${F.frontWidth}, Stege von ${F.bridge} und Bügel von ${F.temples}. Die fertige Fassung wird für eine Person gemacht.`,
    p2a: `Der reguläre Preis beträgt ${FRAME} inklusive kostenlosem weltweitem Versand. Klare Plano-Gläser sind dabei, Blaulichtfilter ${BLUE}. ${KS} war ein`,
    p2link: "Preis nur für Kickstarter-Unterstützer",
    p2b: ", kein Shop-Angebot. Dein Foto mit dem Handy startet die Vermessung aus der Ferne; vor der Fertigung gibst du das 3D-Modell frei.",
    kickstarterPath: "/de/lp/kickstarter",
  },
  wide: {
    eyebrow: "MASSBRILLEN FÜR BREITE GESICHTER",
    lead: "Maßbrillen,",
    italic: "gebaut für breite Gesichter.",
    p: `Die Standardmodelle 007 und 009 haben beide eine Front von 158 mm für Gesichter um 155-161 mm. Bespoke deckt dagegen jede Frontbreite von ${F.frontWidth} ab, schmaler, breiter oder innerhalb des Standardbereichs.`,
    colWoolet: "Woolet Bespoke",
    colStock: "Standard Woolet 007 und 009",
    rows: [
      { label: "Frontbreite", woolet: F.frontWidth, stock: "158 mm (007 und 009)" },
      { label: "Stegbreite", woolet: F.bridge, stock: "25 mm (007 und 009)" },
      { label: "Bügellänge", woolet: F.temples, stock: "150 mm (007 und 009)" },
      { label: "Vermessung", woolet: "Foto mit Karte als Maßstab und Freigabe des Modells", stock: "Feste Maße" },
      { label: "Regulärer Preis", woolet: `${FRAME} inkl. kostenlosem weltweitem Versand; klare Plano-Gläser inklusive (Blaulichtfilter ${BLUE})`, stock: "Siehe Produktseiten" },
      { label: "Hergestellt in", woolet: "EU, italienisches Acetat", stock: "EU" },
    ],
    ctaBuild: `Jetzt gestalten · ${F.frontWidth} →`,
  },
  ai: {
    eyebrow: "VERMESSUNG PER FOTO",
    lead: "Maßanfertigung",
    italic: "ohne Termin im Atelier.",
    p: "Ein Foto mit einer Bankkarte an der Wange startet die Vermessung aus der Ferne. Wir prüfen die Maße mit dir, bevor die Fassung geschnitten wird, und du gibst das 3D-Modell vor der Fertigung frei.",
    stats: [
      { n: "145-160 mm", t: "Frontbreite", d: "Ein durchgehender Bereich nach Maß." },
      { n: "4", t: "Formen", d: "Aviator, Rectangle, Crown Panto und Round." },
      { n: "0 €", t: "Beratung", d: "Kein Atelierbesuch, keine Anreise, keine Messgebühr." },
    ],
  },
  who: {
    lead: "Für wen Bespoke",
    italic: "wirklich gedacht ist",
    p: `Woolet 007 und 009 haben eine feste Frontbreite von 158 mm für Gesichter um 155-161 mm. Bespoke deckt ${F.frontWidth} ab, auch schmalere Gesichter und alle, die ein Einzelstück wollen.`,
    items: [
      `Frontbreite ${F.frontWidth} (abweichend von der Standardfront mit 158 mm)`,
      "Unterschiedlich hohe Ohren oder besondere Anforderungen an die Fassungsneigung",
      `Stegbreite ${F.bridge}, vermessen für deine Nase`,
      "Alle, die einfach ein Einzelstück wollen, geschnitten für ihr Gesicht",
    ],
  },
  process: {
    eyebrow: "SECHS SCHRITTE",
    heading: "Sechs Schritte von deinem Entwurf zur fertigen Fassung.",
    steps: [
      "Form, Acetatfarbe, Oberfläche und Gläser wählen, mit Vorschau deiner Fassung",
      "Online über den sicheren Checkout bestellen",
      "Vermessung aus der Ferne: ein Foto mit Bankkarte als Maßstab und die Zahlen aus deiner aktuellen Brille. Zurück kommt eine Visualisierung von dir mit der Fassung und den vorgeschlagenen Maßen",
      "Visualisierung annehmen, dann das 3D-Modell nach Maß prüfen und freigeben",
      "Fertigung von Hand in der EU",
      "Kostenloser weltweiter Versand",
    ],
    deposit: (amount: number) => `Du zahlst eine Anzahlung von ${amount} USD. Damit bezahlst du deine Visualisierung; die Anzahlung wird nicht erstattet.`,
    accept: (days: number, corrections: number) => `Du nimmst die Visualisierung an, indem du den Restbetrag zahlst - dafür hast du ${days} Tage. Danach zeichnet die Werkstatt dein 3D-Modell, und du kannst bis zu ${corrections} Korrekturen verlangen. Bespoke ist eine Sonderanfertigung, daher werden Zahlungen nicht erstattet.`,
    production: "Die Fertigung dauert 2 Wochen nach Freigabe des 3D-Modells, danach beginnt der Versand.",
  },
  materials: {
    italic: "Mazzucchelli 1849",
    rest: "Acetat. Handgefertigt in der EU.",
    p: `Die Fassung wird in der EU von Hand aus italienischem Mazzucchelli-1849-Celluloseacetat gefertigt. Der reguläre Preis von ${FRAME} enthält kostenlosen weltweiten Versand; klare Plano-Gläser sind dabei (Blaulichtfilter ${BLUE}), Korrekturgläser setzt dein eigener Optiker ein. Die ersten Bespoke-Paare wurden bereits ins Ausland verschickt, unter anderem nach Vietnam. Auf jede Fassung gibt es 5 Jahre Garantie.`,
  },
  faqHeading: "Maßbrillen: häufige Fragen",
  faqs: [
    { q: "Kann ich eine Maßbrille online bestellen, ohne in ein Geschäft zu gehen?", a: "Ja. Nach der Bestellung schickst du ein Foto mit einer Bankkarte an der Wange und die Zahlen, die innen in deiner aktuellen Brille stehen. Das dauert etwa zwei Minuten. Aus den Maßen entsteht ein 3D-Modell nach Maß, das du freigibst. Ein Besuch im Geschäft oder Atelier ist nicht nötig." },
    { q: "Was kostet eine Brille nach Maß?", a: `Woolet Bespoke kostet ${FRAME} für die Maßfassung inklusive kostenlosem weltweitem Versand. Klare Plano-Gläser sind dabei, Blaulichtfilter ${BLUE}. Während der Kickstarter-Kampagne bekamen Unterstützer Bespoke für ${KS}. Dieser Preis galt nur in der Kampagne und wird auf woolet.co nicht angeboten. Bespoke wird in US-Dollar abgerechnet.` },
    { q: "Lohnt sich eine Maßbrille?", a: "Eine Maßbrille lohnt sich, wenn Standardfassungen drücken, rutschen, schief sitzen oder nie richtig zum Gesicht passen. Sie passt auch, wenn du ein Einzelstück willst. Der Wert liegt in der individuell festgelegten Breite, dem Steg und der Bügellänge, nicht in einem Logo oder einer Standardgröße." },
    { q: "Könnt ihr Brillen für ein asymmetrisches Gesicht machen?", a: "Ja. Foto und Prüfung können Unterschiede zwischen den beiden Gesichtshälften berücksichtigen, etwa die Höhe der Ohren oder den Sitz der Fassung. Die endgültige Geometrie wird geprüft, bevor du das 3D-Modell freigibst und die Fertigung beginnt." },
    { q: "Gibt es Maßbrillen auch für schmale Gesichter?", a: `Ja. Woolet Bespoke ist nicht nur für breite Gesichter. Es deckt jede Frontbreite von ${F.frontWidth} ab, auch schmalere Maße unterhalb des Standardbereichs von Woolet.` },
    { q: "Wie messt ihr mein Gesicht aus der Ferne?", a: "Du machst ein Foto, gerade von vorn, mit einer Bankkarte flach an der Wange. Die Karte ist 85,6 mm breit und gibt der Werkstatt einen echten Maßstab. Dazu gibst du die Zahlen aus deiner aktuellen Brille ein, und du gibst ein 3D-Modell frei, bevor die Werkstatt die Fassung schneidet." },
    { q: "Kann ich meine Sehstärke nutzen?", a: `Ja, über deinen eigenen Optiker. Korrekturgläser sind bei Bespoke nicht enthalten: Jede Fassung kommt mit klaren Plano-Gläsern, und dein Optiker tauscht sie gegen deine Korrekturgläser. Im Konfigurator kannst du klare Plano-Gläser (inklusive) oder Blaulichtfilter-Gläser (${BLUE}) wählen.` },
    { q: "Was ist, wenn meine Maßbrille nicht passt?", a: "Woolet prüft dein Foto, deine Maße und das freigegebene 3D-Modell, bevor geschnitten wird. Für die Fassung gelten das Woolet Fit Promise und 5 Jahre Garantie. Melde dich beim Support, wenn die gelieferte Passform nicht der freigegebenen Spezifikation entspricht." },
    { q: "Liefert ihr Maßbrillen nach Deutschland?", a: "Ja. Woolet Bespoke enthält kostenlosen weltweiten Versand, auch nach Deutschland. Die ersten Bespoke-Paare wurden bereits ins Ausland verschickt, unter anderem nach Vietnam." },
    { q: "Wie lange dauert Woolet Bespoke?", a: "Die Fertigung dauert 2 Wochen ab deiner Freigabe des 3D-Modells. Danach wird versendet; die Lieferzeit hängt vom Zielland ab." },
  ],
  sticky: "Fassung gestalten →",
} as const;
