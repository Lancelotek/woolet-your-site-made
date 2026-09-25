# Attribution fix for /thank-you-fb

## What I found in the code
- The whole site already runs the shared first-touch + last-touch capture on every page load, including /thank-you-fb. /thank-you-fb also keeps its own copy of the UTMs, but only for the current tab.
- The "Lock $114 - pay $1 now" button on /thank-you-fb already sends plain `utm_*` plus `lt_utm_*` to create-checkout, and the webhook builds paid_source from those values. So the current preview code should already give "fb/paid/120254116607430039". The "direct" payments most likely came from one of these:
  1. The published site running older code.
  2. The Instagram/Facebook in-app browser blocking storage, so the last-touch data was lost.
  3. /vip-confirmed or a later visit starting checkout after the UTMs were gone.
- /thank-you-fb and /vip-confirmed have no email form. Leads there come from the Meta instant form, which feeds MailerLite outside this site. So `utm_*` in MailerLite stays empty for them, and after payment the webhook fills in only paid_source and paid_utm_content.
- I haven't confirmed the cause yet. The server logs have no events for this campaign ID, so step 1 is to check this against real data.

## Plan
1. **Check first:** Look at the Stripe metadata on 2-3 recent $1 payments that reported "direct" and came from this campaign. That tells us whether the utm/lt fields were missing, or whether the webhook ignored them.
2. **Stronger capture (src/lib/attribution.ts):**
   - Add `utm_id` to the last-touch keys.
   - Keep an in-memory copy of the last touch, so checkout still gets the UTMs when in-app browsers block storage.
   - Also save a short-lived first-party cookie as a backup for the next page.
3. **/thank-you-fb (src/pages/ThankYouFb.tsx):**
   - Save its UTMs to localStorage and to the backup, so they survive the move to /vip-confirmed.
   - Pass `utm_id` and fbc through to checkout.
   - No changes to copy, layout or events.
4. **payments-webhook:** After a $1 payment, when MailerLite `utm_source`, `utm_campaign`, `utm_content` or `utm_term` is empty, fill it from the session's last-touch values. This only fills empty fields, never overwrites, and adds no new groups.
   - Result: leads from the instant form stop showing as organic once they pay.
   - paid_source rules stay the same: `ig/paid/<campaign>` or `fb/paid/<campaign>`.
5. **Email capture pass-through:** Any email form reached after /thank-you-fb already sends `getAttribution()` to mailerlite-subscribe. I'll make that include the last-touch UTMs, filling only fields that are empty.

## Not touched
Prices, copy, layout, CAPI/Meta events, the user_initiated checkout logic, MailerLite groups, Stripe products.

## Test
- Open `/thank-you-fb?utm_source=fb&utm_medium=paid&utm_campaign=120254116607430039&utm_content=AD&utm_term=120254116607440039&utm_id=X` in preview.
- Tap the $1 button and capture the create-checkout request. It must contain `utm_campaign`/`lt_utm_campaign` = 120254116607430039 and `lt_utm_term` = 120254116607440039.
- Go to /en/lp/kickstarter/vip-confirmed, then to a page with an email form, and confirm the mailerlite-subscribe payload carries the same values.
- Add unit tests for the capture when storage is blocked and for the webhook fill-if-empty.

## Files
- src/lib/attribution.ts (+ src/lib/attribution-last-touch.test.ts)
- src/pages/ThankYouFb.tsx
- supabase/functions/payments-webhook/index.ts (redeploy)
- mailerlite-subscribe: payload check only, no change expected
