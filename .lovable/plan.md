# Fix false "$1 abandoned checkout" flags + hero_variant mapping

## Cause (confirmed in code)
- `ReserveCheckoutButton` (used on /en/lp/kickstarter step 2, /thank-you-fb) calls `warm()` in a mount effect, which creates a Stripe Checkout Session with the lead's email as soon as the button renders.
- `/en/reserve` creates the session as soon as `EmbeddedCheckoutProvider` mounts (on page load).
- `handleCheckoutExpired` in payments-webhook marks every expired non-bespoke session with an email + recovery URL as abandoned (`started_1usd_checkout`, `usd1_recovery_url`).

## 1. Create the session only on click
**src/components/ReserveCheckoutButton.tsx**
- Keep preloading Stripe.js and the modal code on mount (speed stays), but remove the session creation from the mount effect. The session is created inside `handleClick` only.
- Add `user_initiated: "1"` to the session metadata.
- Same loading state, 8 s timeout and retry text as now. No copy/layout change.

**src/components/StripeCheckoutModal.tsx**
- Its own fallback `create-checkout` call also gets `user_initiated: "1"` (it only runs after a click, including FitWizard).

**src/pages/Reserve.tsx**
- Do not mount the embedded checkout on page load. Show the existing gold pay button ("Lock $114 - pay $1 now") in the checkout area; on click, mount the embedded checkout and create the session with `user_initiated: "1"`.
- Assumption: /en/reserve currently has no pay button (checkout loads inline), so this adds one button in the place of the checkout block, styled like the LP button. Everything else on the page stays unchanged.

## 2. Ignore non-engaged expired sessions
**supabase/functions/payments-webhook/index.ts -> handleCheckoutExpired**
- Keep bespoke early return.
- Proceed only if `metadata.user_initiated === "1"` AND `customer_details` has email, name, phone or address.
- Otherwise insert `server_event_log` row: event_name `CheckoutExpiredIgnored`, status `skipped`, request_summary `{ stripe_session_id, reason: "not_user_initiated" | "no_engagement" }`, then return.
- `markMailerLiteAbandonedCheckout` unchanged. Deploy payments-webhook.

## 3. hero_variant from utm_content
**New shared rule** (same logic on client and server): normalise lower-case, then
- `m2*`, contains `too-small` / `too_small` -> too-small
- `m4*`, `r2*`, contains `not-the-style` -> not-the-style
- `m3*`, `r4*`, contains `temples` -> temples-bent
- `m5*`, contains `digging` -> digging-in
- else default

**src/content/ksHeroVariants.ts** - `resolveHeroVariant` uses this rule (existing prefix/suffix logic kept as first pass, rule as fallback), so `m2d-too-small-bearded` shows the too-small hero. Existing tests keep passing (`p4-video-reframe` -> default).

**supabase/functions/mailerlite-subscribe/index.ts** - when `hero_variant` is empty or "default", derive it from `utm_content` with the same rule. Deploy mailerlite-subscribe.

**Tests** - extend `src/test/ks-hero-variants.test.ts`: m2d-too-small-bearded, m2_too_small_009, m2-too-small-story -> too-small; m4-not-the-style-man -> not-the-style; r4-temples-bent-man -> temples-bent; cloudwise, r5-ugc-video, empty -> default. Add the same cases to `supabase/functions/mailerlite-subscribe/index.test.ts`.

## Not touched
Prices, Stripe products, completed-payment path, paid_source, CAPI, MailerLite groups, copy, frontend publish.

## Files
- src/components/ReserveCheckoutButton.tsx
- src/components/StripeCheckoutModal.tsx
- src/pages/Reserve.tsx
- src/content/ksHeroVariants.ts
- src/test/ks-hero-variants.test.ts
- supabase/functions/payments-webhook/index.ts
- supabase/functions/mailerlite-subscribe/index.ts
- supabase/functions/mailerlite-subscribe/index.test.ts

## Verification
Typecheck, hero-variant tests, Playwright: LP step 2 and /en/reserve make no `create-checkout` request until the button is clicked. Existing false flags in MailerLite are not cleared (say if you want a cleanup of the 87 leads).
