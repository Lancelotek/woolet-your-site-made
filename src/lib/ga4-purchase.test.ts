import { beforeEach, describe, expect, it } from "vitest";
import { trackBespokePurchase, trackReservationPurchase } from "./ga4-purchase";

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
      flow: "reservation",
      line: "reservation_1usd",
      ecommerce: {
        transaction_id: "cs_live_a1B2c3D4e5F6g7H8",
        value: 1,
        currency: "USD",
        items: [{ item_id: "reservation_1usd", price: 1, quantity: 1 }],
      },
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

describe("trackBespokePurchase", () => {
  beforeEach(() => {
    localStorage.clear();
    (window as unknown as { dataLayer: DL }).dataLayer = [];
  });

  it("pushes one purchase with the real amount and a bespoke line", () => {
    expect(trackBespokePurchase({
      sessionId: "cs_test_a1B2c3D4e5F6g7H8",
      value: 240,
      currency: "usd",
      itemId: "aviator",
      itemName: "Woolet Bespoke - Aviator",
    })).toBe(true);
    expect(purchases()).toHaveLength(1);
    expect(purchases()[0]).toMatchObject({
      flow: "bespoke",
      line: "bespoke",
      ecommerce: {
        transaction_id: "cs_test_a1B2c3D4e5F6g7H8",
        value: 240,
        currency: "USD",
        items: [{ item_id: "aviator", item_name: "Woolet Bespoke - Aviator", price: 240 }],
      },
    });
  });

  it("does not fire twice for the same session and ignores a $0 amount", () => {
    trackBespokePurchase({ sessionId: "cs_live_a1B2c3D4e5F6g7H8", value: 480, itemId: "bespoke", itemName: "Woolet Bespoke" });
    expect(trackBespokePurchase({ sessionId: "cs_live_a1B2c3D4e5F6g7H8", value: 480, itemId: "bespoke", itemName: "Woolet Bespoke" })).toBe(false);
    expect(trackBespokePurchase({ sessionId: "cs_live_b1B2c3D4e5F6g7H8", value: 0, itemId: "bespoke", itemName: "Woolet Bespoke" })).toBe(false);
    expect(purchases()).toHaveLength(1);
  });
});
