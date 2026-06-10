---
name: Pricing
description: Real on-page pricing model — $1 deposit locks $114 founding-member pre-order, $190 MSRP, 40% off
type: feature
---

# Pricing (USD, on-page truth as of 2026-06)

## Model

Kickstarter-style prelaunch: **$1 deposit today locks the $114 founding-member price** (40% off $190 MSRP). NOT a $133 / 30%-off model.

| Tier                          | Price | Notes                                   |
|-------------------------------|-------|-----------------------------------------|
| Deposit                       | $1    | Locks the founding price; refundable    |
| Pre-order (founding member)   | $114  | 40% off MSRP, save $76                  |
| Regular MSRP                  | $190  | Same for Woolet 007 and Woolet 009      |

CTA copy on product pages: `RESERVE FOR $1 — LOCK $114 (−40%) →`

## Where the numbers must stay consistent

- `src/pages/products/ProductPage007.tsx` (UI labels, meta description)
- `src/pages/products/ProductPage009.tsx` (UI labels, meta description)
- `src/seo/metadata.ts` — `productJsonLd()` `offers.price`, `priceSpecification.price`, and the `/products/007` and `/products/009` `noscriptHtml` blocks
- `public/llms.txt` — Pricing section
- `public/llms-full.txt` — §4 Pricing, §10 Compliance, FAQ

## JSON-LD constraints

- Single `Offer` (not `AggregateOffer`) — there is only one SKU per shape.
- `priceCurrency: USD`, `availability: PreOrder`, `priceValidUntil: 2026-12-31`.
- Include `hasMerchantReturnPolicy` (30 days, FreeReturn, ReturnByMail) — required for Google rich results in 2026.
- Update `priceValidUntil` annually.

## Bespoke

Quoted per build — never publish a fixed bespoke price.
