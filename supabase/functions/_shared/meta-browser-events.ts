// Browser callers (meta-capi, track-event) must not be able to report a purchase.
// Purchase is sent only by payments-webhook, with the Stripe amount.

const PURCHASE_LIKE = new Set([
  "purchase",
  "subscribe",
  "starttrial",
  "donate",
  "order",
  "completepayment",
  "purchasereturn",
  "refund",
]);

export function isBrowserPurchaseEvent(name: unknown): boolean {
  if (typeof name !== "string") return false;
  const normalized = name.trim().toLowerCase().replace(/[\s_-]/g, "");
  if (!normalized) return false;
  if (PURCHASE_LIKE.has(normalized)) return true;
  return normalized.includes("purchase");
}
