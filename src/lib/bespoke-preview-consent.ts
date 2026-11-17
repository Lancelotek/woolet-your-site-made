// Optional, separate consent for an on-face preview (decision 17.11.2026).
//
// The photo consent (bespoke-photo-v2/v3) covers storing the photograph and
// sharing it with the workshop, for measuring and producing the frame only.
// Sending the face to an AI image service is a new recipient and a new
// purpose, so it gets its own consent: a box the customer ticks themselves,
// never pre-ticked, and the order goes ahead unchanged without it.
//
// The wording is shown verbatim and stored byte for byte with the record.
// Changing a word means a new version.

export const PREVIEW_CONSENT_VERSION = "bespoke-preview-v1";

export const PREVIEW_CONSENT_TEXT: Record<"en" | "pl", string> = {
  en: "Optional: I also agree that Woolet sends my front photo to an AI image service to create a preview of my frame on my face. The preview is deleted with my photos. Saying no changes nothing about my order.",
  pl: "Opcjonalnie: zgadzam się też, żeby Woolet przesłał moje zdjęcie z przodu do usługi AI generującej obrazy, w celu przygotowania podglądu oprawki na mojej twarzy. Podgląd jest usuwany razem z moimi zdjęciami. Brak zgody niczego nie zmienia w moim zamówieniu.",
};

/** The fields bespoke-photo-submit reads. Empty when the box is not ticked. */
export function previewConsentPayload(
  given: boolean,
  locale: "en" | "pl" = "en",
): { previewConsentGiven?: true; previewConsentText?: string; previewConsentVersion?: string } {
  if (!given) return {};
  return {
    previewConsentGiven: true,
    previewConsentText: PREVIEW_CONSENT_TEXT[locale],
    previewConsentVersion: PREVIEW_CONSENT_VERSION,
  };
}
