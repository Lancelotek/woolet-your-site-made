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
  it("buckets to 5 mm ranges", () => {
    expect(bucketFaceWidth(147.6)).toBe("145-150");
    expect(bucketFaceWidth(150)).toBe("150-155");
    expect(bucketFaceWidth(158.9)).toBe("155-160");
  });
});

describe("pickFitLensBucket", () => {
  it("prefers the FitLens-provided bucket when well formed", () => {
    expect(pickFitLensBucket({ face_width_bucket: "145-150", faceWidthMm: 152 })).toBe("145-150");
  });
  it("rejects malformed buckets", () => {
    expect(pickFitLensBucket({ face_width_bucket: "147.6" })).toBeNull();
    expect(pickFitLensBucket({})).toBeNull();
  });
});

describe("fitLensErrorTag", () => {
  it("joins code and reason", () => {
    expect(fitLensErrorTag("error", { code: "camera_unsuitable", reason: "virtual-camera" }))
      .toBe("camera_unsuitable:virtual-camera");
  });
  it("uses code alone when no reason", () => {
    expect(fitLensErrorTag("error", { code: "unsteady_reading" })).toBe("unsteady_reading");
    expect(fitLensErrorTag("camera_denied", { code: "denied" })).toBe("denied");
  });
  it("falls back to the type", () => {
    expect(fitLensErrorTag("error", { code: "Bad Code!" })).toBe("error");
  });
});

describe("pickFitLensCloseParams", () => {
  it("keeps sanitized reason and last_state", () => {
    expect(pickFitLensCloseParams({ reason: "user", last_state: "poor_light" }))
      .toEqual({ reason: "user", last_state: "poor_light" });
    expect(pickFitLensCloseParams({ reason: "after_result", last_state: "pose_off" }))
      .toEqual({ reason: "after_result", last_state: "pose_off" });
  });
  it("drops invalid values", () => {
    expect(pickFitLensCloseParams({ reason: "<x>", last_state: "a".repeat(41) })).toEqual({});
  });
});

describe("pickFitLensParams", () => {
  it("drops everything except whitelisted keys", () => {
    const p = pickFitLensParams({ step: "x", code: "c", signedPayload: "a.b.c", image: "data:", tier: "high" }, 4);
    expect(p).toEqual({ step: "x", code: "c", tier: "high", seconds_since_open: 4 });
  });
  it("includes last_state", () => {
    expect(pickFitLensParams({ last_state: "framing" }, null)).toEqual({ last_state: "framing" });
  });
  it("passes manual_capture_offered through as a type", () => {
    expect(parseFitLensMessage({ source: "fitlens", version: 1, type: "manual_capture_offered", payload: {} }).type)
      .toBe("manual_capture_offered");
  });
});
