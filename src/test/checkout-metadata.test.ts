import { describe, expect, it } from "vitest";
import {
  measuredPurchaseAmount,
  stampCheckoutMetadata,
} from "../../supabase/functions/_shared/checkout-metadata";
import { isBrowserPurchaseEvent } from "../../supabase/functions/_shared/meta-browser-events";

describe("measuredPurchaseAmount", () => {
  it("forces the reservation to 1 USD", () => {
    expect(measuredPurchaseAmount("reservation", 100, "eur")).toEqual({ value: 1, currency: "USD" });
    expect(measuredPurchaseAmount("reservation", 392, "pln")).toEqual({ value: 1, currency: "USD" });
  });

  it("keeps the real Stripe amount for bespoke and founder", () => {
    expect(measuredPurchaseAmount("bespoke", 24000, "usd")).toEqual({ value: 240, currency: "USD" });
    expect(measuredPurchaseAmount("founder", 11400, "usd")).toEqual({ value: 114, currency: "USD" });
  });
});

describe("stampCheckoutMetadata", () => {
  it("stamps brand, line and sku and copies click ids without rewriting utm_source", () => {
    const meta = stampCheckoutMetadata(
      {
        utm_source: "facebook",
        lt_utm_medium: "paid",
        lt_utm_campaign: "spring",
        lt_gclid: "g1",
        meta_fbc: "fb.1.1.fbclidvalue",
        recommended_sku: "007",
        ai_preview_url: "data:image/png;base64,AAAA",
        note: "keep me",
      },
      { line: "reservation_1usd", sku: "reservation_1usd", flow: "reservation" },
    );
    expect(meta.brand).toBe("woolet");
    expect(meta.line).toBe("reservation_1usd");
    expect(meta.sku).toBe("reservation_1usd");
    expect(meta.flow).toBe("reservation");
    expect(meta.utm_source).toBe("facebook");
    expect(meta.utm_medium).toBe("paid");
    expect(meta.utm_campaign).toBe("spring");
    expect(meta.gclid).toBe("g1");
    expect(meta.fbc).toBe("fb.1.1.fbclidvalue");
    expect(meta.fbclid).toBeUndefined();
    expect(meta.recommended_sku).toBe("007");
    expect(meta.note).toBe("keep me");
    expect(meta.ai_preview_url).toBeUndefined();
  });

  it("prefers an existing fbclid over fbc and drops data:image previews only", () => {
    const meta = stampCheckoutMetadata(
      {
        fbclid: "rawclick",
        meta_fbc: "fb.1.1.other",
        ai_preview_url: "https://woolet.co/preview.png",
      },
      { line: "bespoke", sku: "aviator", flow: "bespoke" },
    );
    expect(meta.fbclid).toBe("rawclick");
    expect(meta.fbc).toBeUndefined();
    expect(meta.ai_preview_url).toBe("https://woolet.co/preview.png");
    expect(meta.line).toBe("bespoke");
    expect(Object.keys(meta).length).toBeLessThanOrEqual(50);
  });
});

describe("isBrowserPurchaseEvent", () => {
  it("rejects purchase-like names and allows funnel events", () => {
    expect(isBrowserPurchaseEvent("Purchase")).toBe(true);
    expect(isBrowserPurchaseEvent("purchase")).toBe(true);
    expect(isBrowserPurchaseEvent("StartTrial")).toBe(true);
    expect(isBrowserPurchaseEvent("Subscribe")).toBe(true);
    expect(isBrowserPurchaseEvent("Donate")).toBe(true);
    expect(isBrowserPurchaseEvent("offline_purchase")).toBe(true);
    expect(isBrowserPurchaseEvent("AddToCart")).toBe(false);
    expect(isBrowserPurchaseEvent("InitiateCheckout")).toBe(false);
    expect(isBrowserPurchaseEvent("Lead")).toBe(false);
  });
});
