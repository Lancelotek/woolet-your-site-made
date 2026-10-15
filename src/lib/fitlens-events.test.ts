import { describe, it, expect } from "vitest";
import { sanitizeFitLensType, createFitLensDedupe, pickFitLensParams } from "./fitlens-events";

describe("sanitizeFitLensType", () => {
  it("keeps valid types", () => {
    expect(sanitizeFitLensType("scan_started")).toBe("scan_started");
    expect(sanitizeFitLensType("camera_denied")).toBe("camera_denied");
  });
  it("rejects invalid input", () => {
    for (const v of ["Scan", "a-b", "x y", "", "a".repeat(41), 5, null, undefined, "<img>"]) {
      expect(sanitizeFitLensType(v)).toBe("unknown");
    }
    expect(sanitizeFitLensType("a".repeat(40))).toBe("a".repeat(40));
  });
});

describe("dedupe", () => {
  it("fires each type once per open, error always, resets on open", () => {
    const d = createFitLensDedupe();
    expect(d.shouldFire("ready")).toBe(true);
    expect(d.shouldFire("ready")).toBe(false);
    expect(d.shouldFire("error")).toBe(true);
    expect(d.shouldFire("error")).toBe(true);
    d.reset();
    expect(d.shouldFire("ready")).toBe(true);
  });
});

describe("pickFitLensParams", () => {
  it("drops everything except whitelisted keys", () => {
    const p = pickFitLensParams({ step: "x", code: "c", signedPayload: "a.b.c", image: "data:", tier: "high" }, 4);
    expect(p).toEqual({ step: "x", code: "c", tier: "high", seconds_since_open: 4 });
  });
});
