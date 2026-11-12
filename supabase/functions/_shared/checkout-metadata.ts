// Stripe Checkout metadata shared by every Woolet payment-mode session.
// The Stripe account is shared with another brand, so `brand` is the filter.
// Values are copied, never rewritten: utm_source stays whatever the visitor landed with.

export const WOOLET_BRAND = "woolet";
export const RESERVATION_ITEM_ID = "reservation_1usd";

export const CHECKOUT_LINES = [
  "reservation_1usd",
  "bespoke",
  "bespoke_balance",
  "007",
  "009",
  "founder_edition",
] as const;

export type CheckoutLine = (typeof CHECKOUT_LINES)[number];

const STRIPE_META_MAX_KEYS = 50;
const STRIPE_META_MAX_VALUE = 500;

// Dropped only when the 50-key Stripe cap would reject the session, and only
// when the same fact is already stored on an unprefixed key.
const DROP_IF_OVER_LIMIT = [
  "ga_cookie_shape",
  "client_amount_usd",
  "first_landing",
  "first_seen_at",
  "touch_count",
  "ai_front_preview_url",
  "lt_touch_at",
  "lt_utm_content",
  "lt_utm_term",
  "lt_utm_id",
  "openai_client_ip",
  "openai_client_ua",
  "lt_utm_source",
  "lt_utm_medium",
  "lt_utm_campaign",
  "lt_gclid",
  "lt_gbraid",
  "lt_wbraid",
  "lt_fbclid",
];

export function isDataImageValue(value: string): boolean {
  return value.trim().toLowerCase().startsWith("data:image");
}

/**
 * Measurement Protocol / Meta value for a paid session.
 * The $1 reservation is always 1 USD, even when Stripe reports another currency.
 * Every other line uses the real Stripe amount and currency.
 */
export function measuredPurchaseAmount(
  flow: "reservation" | "bespoke" | "bespoke_balance" | "founder",
  amountTotalCents: number | null | undefined,
  currency: string | null | undefined,
): { value: number; currency: string } {
  if (flow === "reservation") return { value: 1, currency: "USD" };
  return {
    value: (amountTotalCents ?? 0) / 100,
    currency: String(currency ?? "usd").toUpperCase(),
  };
}

function fillFrom(meta: Record<string, string>, key: string, ...sources: string[]) {
  if (meta[key]) return;
  for (const source of sources) {
    if (meta[source]) {
      meta[key] = meta[source];
      return;
    }
  }
}

/**
 * Normalize Checkout Session and PaymentIntent metadata.
 * Keeps existing keys, drops data:image previews (they blow the 500-char cap
 * and are not a useful order record), and stamps brand / line / sku plus the
 * click ids the ads platforms need.
 */
export function stampCheckoutMetadata(
  input: Record<string, string> | undefined,
  commerce: { line: CheckoutLine; sku: string; flow?: string },
): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (typeof value !== "string") continue;
    if (!value) continue;
    if (value.length > STRIPE_META_MAX_VALUE) continue;
    if (isDataImageValue(value)) continue;
    meta[key] = value;
  }

  meta.brand = WOOLET_BRAND;
  meta.line = commerce.line;
  meta.sku = commerce.sku.slice(0, STRIPE_META_MAX_VALUE);
  meta.flow = commerce.flow || (commerce.line === "reservation_1usd" ? "reservation" : commerce.line);

  // Copy last-touch fields onto the names the spec asks for. Never overwrite
  // a utm_source / gclid / fbclid that was already stored.
  fillFrom(meta, "utm_source", "lt_utm_source");
  fillFrom(meta, "utm_medium", "lt_utm_medium");
  fillFrom(meta, "utm_campaign", "lt_utm_campaign");
  fillFrom(meta, "gclid", "lt_gclid");
  fillFrom(meta, "fbclid", "lt_fbclid");
  if (!meta.fbclid && !meta.fbc) fillFrom(meta, "fbc", "meta_fbc");

  for (const key of DROP_IF_OVER_LIMIT) {
    if (Object.keys(meta).length <= STRIPE_META_MAX_KEYS) break;
    if (
      (key.startsWith("lt_utm_") || key === "lt_gclid" || key === "lt_fbclid") &&
      !meta[key.slice(3)]
    ) {
      continue;
    }
    if (key === "openai_client_ip" && !meta.meta_client_ip_address) continue;
    if (key === "openai_client_ua" && !meta.meta_client_user_agent) continue;
    delete meta[key];
  }

  return meta;
}
