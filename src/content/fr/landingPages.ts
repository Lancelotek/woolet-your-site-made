export type FrFaq = { q: string; a: string };

export type FrPageConfig = {
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
  faqs: FrFaq[];
  englishEquivalent: string;
};

export const frPages: Record<string, FrPageConfig> = {
  "lunettes-sur-mesure": {
    slug: "lunettes-sur-mesure",
    eyebrow: "Woolet · Lunettes sur mesure",
    h1: "Lunettes sur mesure — taillées pour votre visage, au millimètre",
    sub: "Largeur de face de 145 à 162 mm, pont, branches et hauteur de verre ajustés individuellement. Acétate italien Mazzucchelli 1849, façonné à la main dans l'Union européenne.",
    metaTitle: "Lunettes sur mesure 145–162 mm | Woolet — acétate italien",
    metaDescription:
      "Lunettes sur mesure pour visages larges : 145–162 mm de face, pont 20–24 mm, branches ajustées. Acétate italien Mazzucchelli, fabrication artisanale en UE. Mesure FitLens en 20 s.",
    primaryKeyword: "lunettes sur mesure",
    ctaPrimaryLabel: "Mesurer mon visage (20 s)",
    ctaPrimaryHref: "/fr/fit",
    ctaSecondaryLabel: "Ouvrir le configurateur",
    ctaSecondaryHref: "/en/bespoke/configurator",
    problemH2: "« Personnalisé » et « sur mesure » ne sont pas la même chose",
    problemBody:
      "La plupart des marques dites « customisables » se contentent de proposer un choix de couleurs sur une monture existante. Le sur mesure de Woolet est différent : la largeur de face, le pont, la longueur des branches et la hauteur de verre sont définis indépendamment, au millimètre. Le moule est ajusté à votre visage avant la coupe de l'acétate.",
    proofH2: "Acétate italien, façonné à la main",
    proofBody:
      "Nous utilisons l'acétate Mazzucchelli 1849, produit en Italie depuis plus de 70 ans. Les ateliers européens fraisent, polissent et insèrent les charnières une monture à la fois. Comptez environ 4 à 6 semaines de fabrication après confirmation de la commande.",
    proofBullets: [
      { label: "Largeur de face", value: "145 – 162 mm" },
      { label: "Personnalisation", value: "face / pont / branches / hauteur" },
      { label: "Matière", value: "Mazzucchelli 1849, acétate italien" },
      { label: "Délai", value: "4 – 6 semaines, fait main UE" },
    ],
    closingH2: "Arrêtez de composer avec les tailles standard",
    closingBody:
      "Une simple photo suffit à extraire vos cotes. Vous choisissez ensuite la couleur et la forme dans le configurateur en ligne. La fabrication démarre après votre validation finale.",
    faqs: [
      {
        q: "Jusqu'où peut-on ajuster les dimensions ?",
        a: "Face : 145 à 162 mm. Pont : 16 à 26 mm. Branches : 135 à 155 mm. La hauteur de verre est également paramétrable.",
      },
      {
        q: "Comment se fait la prise de mesure ?",
        a: "FitLens utilise la caméra de votre téléphone pour mesurer la largeur de votre visage au millimètre. Le résultat alimente directement le configurateur.",
      },
      {
        q: "Quel est le délai de fabrication ?",
        a: "Environ 4 à 6 semaines après confirmation de commande, fabrication artisanale dans nos ateliers européens.",
      },
      {
        q: "Puis-je retourner une paire sur mesure ?",
        a: "Le sur mesure n'est pas repris, mais en cas de problème de taille notre garantie Fit refait la monture sans surcoût.",
      },
      {
        q: "Quel est le prix ?",
        a: "Le tarif Founding est réservé aux inscrits sur la liste d'attente — environ 40 % en dessous du prix de lancement public.",
      },
    ],
    englishEquivalent: "/en/bespoke",
  },
};

export const frPageOrder = ["lunettes-sur-mesure"] as const;
