import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureLastTouch, getLastTouchCheckoutMetadata, __resetLastTouchMemory } from "./attribution";

describe("reservation last-touch attribution", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetLastTouchMemory();
    document.cookie = "wlt_lt=; max-age=0; path=/";
    window.history.replaceState({}, "", "/en");
    vi.useRealTimers();
  });

  it("overwrites the whole prior campaign and sends only checkout-safe metadata", () => {
    window.history.replaceState({}, "", "/en?utm_source=facebook&utm_campaign=old&fbclid=fb123");
    captureLastTouch();
    window.history.replaceState({}, "", "/en/reserve?utm_source=google&utm_medium=demandgen&utm_campaign=launch&gbraid=gb123");
    captureLastTouch();
    const meta = getLastTouchCheckoutMetadata();
    expect(meta).toMatchObject({ lt_utm_source: "google", lt_utm_medium: "demandgen", lt_utm_campaign: "launch", lt_gbraid: "gb123" });
    expect(meta).not.toHaveProperty("lt_fbclid");
    expect(meta).not.toHaveProperty("lt_utm_content");
    expect(JSON.parse(localStorage.getItem("wlt_last_touch") ?? "{}").fbclid).toBeUndefined();
  });

  it("expires after 30 days and ignores malformed data", () => {
    localStorage.setItem("wlt_last_touch", JSON.stringify({ utm_source: "old", touch_at: new Date(Date.now() - 31 * 86400000).toISOString() }));
    expect(getLastTouchCheckoutMetadata()).toEqual({});
    localStorage.setItem("wlt_last_touch", "not-json");
    expect(getLastTouchCheckoutMetadata()).toEqual({});
  });

  it("caps campaign metadata values at 500 characters", () => {
    window.history.replaceState({}, "", `/en?utm_campaign=${"x".repeat(530)}`);
    expect(getLastTouchCheckoutMetadata().lt_utm_campaign).toHaveLength(500);
  });
});
describe("last touch without storage", () => {
  it("keeps UTMs in memory when localStorage throws", async () => {
    const mod = await import("./attribution");
    mod.__resetLastTouchMemory();
    localStorage.clear();
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    window.history.replaceState({}, "", "/thank-you-fb?utm_source=fb&utm_medium=paid&utm_campaign=120254116607430039&utm_term=120254116607440039&utm_id=x");
    mod.captureLastTouch();
    window.history.replaceState({}, "", "/en/lp/kickstarter/vip-confirmed");
    const meta = mod.getLastTouchCheckoutMetadata();
    expect(meta).toMatchObject({ lt_utm_campaign: "120254116607430039", lt_utm_term: "120254116607440039", lt_utm_id: "x" });
    expect(mod.getAttribution()).toMatchObject({ utm_campaign: "120254116607430039" });
    spy.mockRestore();
  });
});
