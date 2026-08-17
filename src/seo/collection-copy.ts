/**
 * Single source of truth for /{lang}/collection title + description.
 *
 * Imported by BOTH the prerender layer (src/seo/metadata.ts) and the
 * client page (src/pages/Collection.tsx) so the two can never drift.
 */

import type { Lang } from "@/lib/i18n";

export const collectionSeo: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Collection — Woolet 007 & 009 for Wide Faces | 155–161 mm",
    description:
      "Two shapes — round 007 and soft-square 009 — in 158 mm widths, plus bespoke up to 162 mm. Italian Mazzucchelli acetate, handmade in the EU.",
  },
  pl: { title: "Kolekcja Woolet — 007 & 009 dla szerokich twarzy", description: "Dwa kształty, szerokości 155–161 mm. Włoski octan Mazzucchelli, ręcznie w UE." },
  fr: { title: "Collection Woolet — 007 & 009 pour visages larges", description: "Deux formes, largeurs 155–161 mm. Acétate italien Mazzucchelli, fait main en UE." },
  es: { title: "Colección Woolet — 007 & 009 para caras anchas", description: "Dos formas, anchos 155–161 mm. Acetato italiano Mazzucchelli, hecho a mano en la UE." },
  de: { title: "Woolet Kollektion — 007 & 009 für breite Gesichter", description: "Zwei Formen, Breiten 155–161 mm. Italienisches Mazzucchelli-Acetat, handgefertigt in der EU." },
  ar: { title: "مجموعة Woolet — 007 و 009 للوجوه العريضة", description: "شكلان، عرض 155–161 ملم. أسيتات Mazzucchelli الإيطالي، صناعة يدوية في الاتحاد الأوروبي." },
  ja: { title: "Wooletコレクション — 幅広い顔のための007 & 009", description: "2つのシェイプ、幅155–161mm。イタリア製Mazzucchelliアセテート、EUで手作り。" },
  nl: { title: "Woolet Collectie — 007 & 009 voor brede gezichten", description: "Twee vormen, breedtes 155–161 mm. Italiaans Mazzucchelli-acetaat, handgemaakt in de EU." },
};

/** Items listed in the collection ItemList JSON-LD (shared with prerender). */
export const COLLECTION_ITEMS = [
  { id: "007", name: "Woolet 007 — Round Panto" },
  { id: "009", name: "Woolet 009 — Soft Square" },
  { id: "bespoke", name: "Woolet Bespoke — Custom" },
];
