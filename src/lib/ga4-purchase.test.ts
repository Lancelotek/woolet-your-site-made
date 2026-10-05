import { beforeEach, describe, expect, it } from "vitest";
import { trackReservationPurchase } from "./ga4-purchase";

type DL = Array<Record<string, unknown>>;
const dl = () => (window as unknown as { dataLayer: DL }).dataLayer;
const purchases = () => dl().filter((e) => e.event === "purchase");

describe("trackReservationPurchase", () => {
  beforeEach(() => {
    localStorage.clear();
    (window as unknown as { dataLayer: DL }).dataLayer = [];
  });

  it("pushes one GA4 purchase keyed by the Stripe session id", () => {
    expect(trackReservationPurchase("cs_live_a1B2c3D4e5F6g7H8", "kickstarter_vip_confirmed")).toBe(true);
    expect(dl()[0]).toEqual({ ecommerce: null });
    expect(purchases()).toHaveLength(1);
    expect(purchases()[0]).toMatchObject({
      purchase_source: "kickstarter_vip_confirmed",
      ecommerce: { transaction_id: "cs_live_a1B2c3D4e5F6g7H8", value: 1, currency: "USD" },
    });
  });

  it("does not fire twice for the same payment (refresh / re-render)", () => {
    trackReservationPurchase("cs_live_a1B2c3D4e5F6g7H8", "x");
    expect(trackReservationPurchase("cs_live_a1B2c3D4e5F6g7H8", "x")).toBe(false);
    expect(purchases()).toHaveLength(1);
  });

  it("ignores a missing or non-Stripe reference", () => {
    expect(trackReservationPurchase(undefined, "x")).toBe(false);
    expect(trackReservationPurchase("{CHECKOUT_SESSION_ID}", "x")).toBe(false);
    expect(trackReservationPurchase("<script>", "x")).toBe(false);
    expect(purchases()).toHaveLength(0);
  });
});
