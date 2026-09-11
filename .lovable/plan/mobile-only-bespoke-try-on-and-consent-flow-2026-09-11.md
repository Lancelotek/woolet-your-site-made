# Mobile-only bespoke try-on and consent flow

## Goal
Replace the current measurement-style “On your face” experience with a mobile-only AI try-on. The result must place the exact previously generated bespoke frame on the person’s face. Only after the result is visible will the person decide whether Woolet may retain both the original photo and the AI try-on for the workshop.

## User flow
1. The buyer chooses the pattern, acetate and finish, then generates the existing AI frame preview.
2. On a phone, the Preview step offers camera/upload for a front-facing photo without glasses.
3. On desktop/tablet, the photo and try-on controls are replaced by a QR handoff. The QR keeps the pseudonymous session and selected build, and opens Preview on the phone.
4. The phone generates a photorealistic try-on using two references:
   - the person’s original photo;
   - the exact AI frame preview already generated for that build.
5. No card calibration, draggable measurement points, millimetre scale, or technical outline is shown in this try-on flow. FitLens remains the separate measurement flow and remains phone-only.
6. After the try-on appears, show a separate workshop-retention choice. Without agreement, both images remain temporary and are not uploaded to Woolet storage.
7. With agreement, upload the original photo and AI try-on to private storage and save the consent timestamp, language, version, session reference and selected-frame details. Confirm that the workshop will receive both images and retain the existing delete/withdraw option.

## Implementation
- Replace the Preview step’s `OnYourFacePanel` with the existing AI `TryOnPanel`, completed as the production flow rather than the unused duplicate.
- Pass the active AI frame preview URL from `AiPreviewPanel` to the try-on panel. Restore the latest matching account preview on the phone after QR handoff when local device history is empty.
- Add a desktop QR state to the try-on panel and enforce the camera/upload/generation controls only below the mobile breakpoint.
- Update `bespoke-tryon-render` to accept the exact generated-frame reference and use it as a second image input, instructing the model to transfer that frame without redesigning its silhouette, bridge, acetate, finish or proportions.
- Keep the two-renders-per-account limit and account sign-in return behavior.
- After generation, add explicit bilingual retention consent. Upload the upright original as `photo` and the generated result as `vto`; no measurement geometry is produced by this flow.
- Reuse the existing private `bespoke-photos` signed-upload and `bespoke-photo-submit` path, storing a new consent version whose wording covers the original photo and AI try-on for bespoke production/workshop access.
- Keep the current pseudonymous `sessionRef`, checkout attachment, private bucket, retention, purge and withdrawal behavior.
- Remove the old measurement/calibration controls from Step 3 only; do not change FitLens measurement math or the post-purchase measurement route.

## Validation
- Phone viewport: generated frame → photo capture/upload → exact-frame AI result → consent prompt → successful private save of both images.
- Desktop viewport: no camera, upload, calibration or measurement UI; QR opens the same build and session on phone.
- Declining retention: no signed upload request and no database photo record.
- Consent save: original and AI result paths, displayed language, consent version and timestamp are recorded.
- Confirm the existing two-render cap, sign-in restoration, checkout session attachment, deletion and purge paths still work.
