import { describe, it, expect } from "vitest";
import {
  sanitizeFitLensType,
  createFitLensDedupe,
  pickFitLensParams,
  parseFitLensMessage,
  isFitLensErrorLike,
  pickFitLensFaceWidthMm,
  bucketFaceWidth,
} from "./fitlens-events";

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

describe("parseFitLensMessage", () => {
  it("maps the legacy fitlens:event shape to name + data", () => {
    const { type, payload } = parseFitLensMessage({
      source: "fitlens",
      type: "fitlens:event",
      name: "camera_granted",
      data: { tier: "high" },
    });
    expect(type).toBe("camera_granted");
    expect(payload).toEqual({ tier: "high" });
  });

  it("legacy message with no data becomes an empty payload", () => {
    const { type, payload } = parseFitLensMessage({
      source: "fitlens",
      type: "fitlens:event",
      name: "intro_shown",
    });
    expect(type).toBe("intro_shown");
    expect(payload).toEqual({});
  });

  it("new-format message is unchanged", () => {
    const { type, payload } = parseFitLensMessage({
      source: "fitlens",
      type: "result",
      payload: { faceWidthMm: 152 },
    });
    expect(type).toBe("result");
    expect(payload).toEqual({ faceWidthMm: 152 });
  });
});

describe("isFitLensErrorLike", () => {
  it("marks error, camera_unsuitable and measure_failed", () => {
    expect(isFitLensErrorLike("error")).toBe(true);
    expect(isFitLensErrorLike("camera_unsuitable")).toBe(true);
    expect(isFitLensErrorLike("measure_failed")).toBe(true);
    expect(isFitLensErrorLike("camera_denied")).toBe(false);
    expect(isFitLensErrorLike("ready")).toBe(false);
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
  it("lets legacy camera_unsuitable and measure_failed through every time", () => {
    const d = createFitLensDedupe();
    expect(d.shouldFire("camera_unsuitable")).toBe(true);
    expect(d.shouldFire("camera_unsuitable")).toBe(true);
    expect(d.shouldFire("measure_failed")).toBe(true);
    expect(d.shouldFire("measure_failed")).toBe(true);
    expect(d.shouldFire("ready")).toBe(true);
    expect(d.shouldFire("ready")).toBe(false);
  });
});

describe("pickFitLensFaceWidthMm", () => {
  it("reads faceWidthMm at the top level", () => {
    expect(pickFitLensFaceWidthMm({ faceWidthMm: 147.6 })).toBe(147.6);
  });
  it("reads faceWidth at the top level", () => {
    expect(pickFitLensFaceWidthMm({ faceWidth: 150 })).toBe(150);
  });
  it("reads measurement.faceWidthMm and measurement.faceWidth", () => {
    expect(pickFitLensFaceWidthMm({ measurement: { faceWidthMm: 148.2 } })).toBe(148.2);
    expect(pickFitLensFaceWidthMm({ measurement: { faceWidth: 151 } })).toBe(151);
  });
  it("returns null when no width is present", () => {
    expect(pickFitLensFaceWidthMm({})).toBeNull();
    expect(pickFitLensFaceWidthMm({ measurement: "junk" })).toBeNull();
  });
});

describe("bucketFaceWidth", () => {
  it("buckets to 5 mm floors", () => {
    expect(bucketFaceWidth(147.6)).toBe("145");
    expect(bucketFaceWidth(150)).toBe("150");
    expect(bucketFaceWidth(158.9)).toBe("155");
  });
});

describe("pickFitLensParams", () => {
  it("drops everything except whitelisted keys", () => {
    const p = pickFitLensParams({ step: "x", code: "c", signedPayload: "a.b.c", image: "data:", tier: "high" }, 4);
    expect(p).toEqual({ step: "x", code: "c", tier: "high", seconds_since_open: 4 });
  });
});
