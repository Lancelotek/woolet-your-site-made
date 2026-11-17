// Consent for the on-face visualization (decision 17.11.2026).
//
// The photo consent (bespoke-photo-v2/v3) covers storing the photograph and
// sharing it with the workshop, for measuring and producing the frame only.
// Sending the face to an AI image service is a new recipient and a new
// purpose, so it gets its own consent: a box the customer ticks themselves,
// never pre-ticked.
//
// The wording is shown verbatim and stored byte for byte with the record.
// Changing a word means a new version.

export const PREVIEW_CONSENT_VERSION = "bespoke-preview-v2";

/**
 * v2 (17.11.2026): the deposit buys the visualization, so the consent is a
 * condition of the order and is given at checkout, before paying.
 * English only: no customer may be shown another language here.
 */
export const PREVIEW_CONSENT_TEXT =
  "I agree that Woolet sends my photo to an AI image service to create my visualization: my photo wearing the frame I chose. Woolet cannot make the visualization without it, so this consent is a condition of the order.";

/** What create-bespoke-checkout reads. Empty when the box is not ticked. */
export function previewConsentPayload(
  given: boolean,
): { aiPreviewConsent?: { given: true; text: string; version: string } } {
  if (!given) return {};
  return { aiPreviewConsent: { given: true, text: PREVIEW_CONSENT_TEXT, version: PREVIEW_CONSENT_VERSION } };
}
