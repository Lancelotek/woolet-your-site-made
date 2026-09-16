# Update "After payment" steps on the Bespoke checkout page

## Goal
Replace the four "After payment" lines in `src/pages/bespoke/Checkout.tsx` (lines ~611–616) so the customer sees the real journey: WhatsApp access, the measurement interview link, 3D model approval, then two weeks of production.

## Change
Only the ordered list inside the gold-bordered "After payment" panel. New copy (English, matching the page):

1. `01 · Order confirmed and paid. WhatsApp access and your measurement interview link are on the way.` — keep line 01 short: "Order confirmed and paid." then a new line 02 combining WhatsApp + interview link.
2. `02 · You get WhatsApp access and a private link to your measurement interview.`
3. `03 · After you confirm your measurements and the product, we send your 3D model design for approval.`
4. `04 · Once you approve the 3D design, production takes two weeks — then it ships free worldwide.`

Final list:

```text
01 · Order confirmed and paid.
02 · You get WhatsApp access and a private link to your measurement interview.
03 · After you confirm your measurements and product, we send the 3D model design for your approval.
04 · Once approved, production takes two weeks — then it ships, free worldwide.
```

## Constraints
- Nothing else on the checkout page changes: price, trust strip, form, Stripe flow, case-number logic stay untouched.
- Keep the existing styling (numbered list, same text sizes and colors).

## Verification
- Typecheck passes (`npx tsgo --noEmit -p tsconfig.app.json`).
- Visual check of the checkout page at mobile width to confirm the panel reads correctly and doesn't overflow.
