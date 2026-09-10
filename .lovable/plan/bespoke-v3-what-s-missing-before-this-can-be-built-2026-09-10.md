# Bespoke v3 — what's missing before this can be built

## The blocker

This brief builds on work that is not in this project. I checked the whole codebase and none of these exist:

- No Measurement Report and no Production Build Sheet — no component, no page, no data.
- No `frame-mapping.ts` / "map-v2" — nothing maps a face measurement to a FRAME front width or bridge.
- No FitLens webhook and no signed-result verification. The scan today is a third-party widget in an iframe; nothing calls us back, and nothing writes a scan into an order.
- No verification form and no report purge job — so there is nothing to "extend".
- No `bespoke_report_verifications` table, no `scan_id` on orders.

About half of the brief (sections 3, 5, and parts of 1 and 4) is written as "extend the existing X". There is no existing X. So I can't do it additively — those pieces have to be built from scratch first, and that is a much bigger job than the one described.

Two possibilities: either that earlier work was done in a different Woolet project, or it was planned and never shipped here. Worth confirming before anything is written.

## What I can build now, in order

Each stage is independently useful and ends in something you can look at.

### Stage 1 — Identity out of the widget (small, do first)
- Generate a random `sessionRef` per scan attempt, keep it in the saved bespoke config, pass only `sessionRef` + language to the scan widget. No email, no name, no order number.
- Attach `sessionRef` to the payment record so the link between scan and customer only ever exists on our side.
- Add the "Fit scan and bespoke production" section to the privacy policy (English and Polish): JAY23 LLC as controller, the scan provider and the Greek workshop as processors, 90-day deletion, withdrawal by email.

Nothing here needs the missing foundations.

### Stage 2 — Photo step for the customer
Route `/:lang/bespoke/photo/:orderToken`, reached after the measurements step.
- Four illustrated instructions, dark brand styling, gold buttons.
- Separate unchecked consent box; the exact text shown is stored word for word, with version, time, language and a hashed IP. Upload stays locked until it is ticked.
- After upload: drag two handles to the edges of a bank card held at the brow, then two more at the temples. This gives millimetres-per-pixel and a face width from the photo, shown beside the scan value with the difference. More than 4 mm apart shows a warning; both numbers are kept.
- Three images are produced in the browser and stored privately: the plain photo, a version with the measuring marks drawn on, and a try-on view with the frame outline.
- Storage: two private buckets, uploads through short-lived signed links, nothing publicly readable.

The try-on outline needs a real front width per order. Without map-v2 I would use the width already chosen in the configurator instead. That is a reasonable stand-in, and swaps to map-v2 later in one place.

### Stage 3 — Workshop package
A single token link showing the order, the photos, and a form where the workshop enters its CAD numbers, uploads a CAD drawing, and signs off. Deliberately shows no email, phone or payment identifiers, and only reveals the full address once the order is in production.

This is where the two reports would be embedded. Until they exist, the page shows the order specification and the photos, and I leave the two slots ready.

### Stage 4 — Emails and retention
- Workshop notification when a photo arrives, reminders to the customer at 24h and 72h if it hasn't.
- Delivery date recorded, files erased 90 days later, numbers and the consent record kept.
- Consent withdrawal wipes the files at once and stops production.

## Technical notes

- New table for the order photo row plus the columns listed in the brief; two private buckets, service-role only, all access through backend functions returning signed links.
- New backend functions: signed upload links, workshop package fetch, token rotation, consent withdrawal, purge, reminder sender.
- The try-on outline is drawn in the browser from the existing four pattern images — light pixels dropped to transparent, the remaining ink scaled and tinted. No new image files.
- Settings needed: workshop name, a salt for hashing the consent IP, retention days.

## What I need from you

1. Was the report/map-v2 work done somewhere else? If yes, point me at it and I can follow the brief as written.
2. If not — shall I start with Stage 1 and 2, and treat the reports as a separate job?
