// Browser-side GA4 purchase for the $1 Kickstarter reservation.
//
// Why: the server-side Measurement Protocol purchase (payments-webhook) has no
// page context, so GA4 reports most paid reservations under the "Unassigned"
// channel with a "(not set)" landing page. Embedded Stripe Checkout keeps the
// buyer on woolet.co, so firing the purchase from the return page lands it in
// the visitor's live session, with its real source and landing page.
//
// Dedup: transaction_id is the Stripe Checkout Session id, the same id the
// webhook sends, so GA4 collapses the two purchase events into one. A
// localStorage key stops refreshes/re-renders from pushing it twice.

const DEDUP_PREFIX = "wlt_ga4_purchase:";

type DataLayerWindow = Window & { dataLayer?: unknown[] };

/** Stripe Checkout Session ids look like cs_live_… / cs_test_…; never trust the raw query string. */
const isStripeSessionId = (ref: string) => /^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(ref);

export const trackReservationPurchase = (
  paymentRef: string | undefined,
  source: string,
): boolean => {
  if (typeof window === "undefined" || !paymentRef) return false;
  const ref = paymentRef.trim();
  if (!isStripeSessionId(ref)) return false;

  const key = `${DEDUP_PREFIX}${ref}`;
  try {
    if (localStorage.getItem(key) === "1") return false;
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: GA4's own transaction_id dedup still applies.
  }

  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  // Clear the previous ecommerce object first (GA4/GTM best practice).
  w.dataLayer.push({ ecommerce: null });
  w.dataLayer.push({
    event: "purchase",
    purchase_source: source,
    ecommerce: {
      transaction_id: ref,
      value: 1,
      currency: "USD",
      // Mirrors the item sent by payments-webhook so both hits describe the same order.
      items: [
        {
          item_id: "reservation_1usd",
          item_name: "Founder reservation $1",
          price: 1,
          quantity: 1,
        },
      ],
    },
  });
  return true;
};
