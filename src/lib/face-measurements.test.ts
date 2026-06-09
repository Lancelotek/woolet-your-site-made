import { describe, it, expect } from "vitest";
import {
  calculateMeasurements,
  MeasurementError,
  CARD_WIDTH_MM,
  type NormalizedLandmark,
} from "./face-measurements";

// Helpers ------------------------------------------------------------------

const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

// Build a landmarks array (length 478) with:
//  - the face oval indices spread between leftX..rightX so getFaceOvalPixelWidth
//    returns (rightX-leftX)*canvasWidth
//  - the temple + nose alar landmarks placed at the requested x positions
function buildLandmarks(opts: {
  leftX: number;
  rightX: number;
  noseLeftX: number;
  noseRightX: number;
}): NormalizedLandmark[] {
  const arr: NormalizedLandmark[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  FACE_OVAL_INDICES.forEach((idx, i) => {
    const t = i / (FACE_OVAL_INDICES.length - 1);
    arr[idx] = { x: opts.leftX + t * (opts.rightX - opts.leftX), y: 0.5, z: 0 };
  });
  arr[234] = { x: opts.leftX, y: 0.5, z: 0 };
  arr[454] = { x: opts.rightX, y: 0.5, z: 0 };
  arr[49] = { x: opts.noseLeftX, y: 0.55, z: 0 };
  arr[279] = { x: opts.noseRightX, y: 0.55, z: 0 };
  return arr;
}

// At cardPixelWidth=200 → mmPerPx ≈ 0.428 → 150mm face needs ~350px spread.
const CARD_L = { x: 400, y: 300 };
const CARD_R = { x: 600, y: 300 }; // 200px
const CANVAS = 1000;

describe("calculateMeasurements — manual face edges (landmarker failed)", () => {
  it("succeeds with only card + manual face edges when landmarks are empty", () => {
    const res = calculateMeasurements(
      [],
      CANVAS,
      CARD_L,
      CARD_R,
      { x: 325, y: 280 },
      { x: 675, y: 280 }, // 350px → ~150mm
    );
    expect(res.faceWidthMm).toBeGreaterThanOrEqual(148);
    expect(res.faceWidthMm).toBeLessThanOrEqual(152);
    // Nose approximated as 0.28 * faceWidth → ~42mm
    expect(res.noseWidthMm).toBeGreaterThanOrEqual(40);
    expect(res.noseWidthMm).toBeLessThanOrEqual(44);
    expect(["low", "medium", "high"]).toContain(res.confidence);
  });

  it("succeeds with manual edges when landmarks array is too short (<478)", () => {
    const partial: NormalizedLandmark[] = Array.from({ length: 100 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    const res = calculateMeasurements(
      partial,
      CANVAS,
      CARD_L,
      CARD_R,
      { x: 325, y: 280 },
      { x: 675, y: 280 },
    );
    expect(res.faceWidthMm).toBeGreaterThan(0);
  });

  it("throws invalid_landmarks when both landmarks AND manual edges are missing", () => {
    expect(() =>
      calculateMeasurements([], CANVAS, CARD_L, CARD_R),
    ).toThrow(MeasurementError);
  });

  it("throws face_out_of_range when manual edges are too close (<80px)", () => {
    expect(() =>
      calculateMeasurements(
        [],
        CANVAS,
        CARD_L,
        CARD_R,
        { x: 480, y: 280 },
        { x: 520, y: 280 }, // 40px
      ),
    ).toThrow(/edge points/i);
  });

  it("throws face_out_of_range when computed face width exceeds plausible range", () => {
    expect(() =>
      calculateMeasurements(
        [],
        CANVAS,
        CARD_L,
        CARD_R,
        { x: 100, y: 280 },
        { x: 900, y: 280 }, // 800px * 0.428 ≈ 342mm
      ),
    ).toThrow(/Face width/i);
  });
});

describe("calculateMeasurements — landmark-driven path still works", () => {
  it("returns measurements from landmarks alone", () => {
    const landmarks = buildLandmarks({
      leftX: 0.325,
      rightX: 0.675, // 0.35*1000 = 350px → ~150mm
      noseLeftX: 0.46,
      noseRightX: 0.55, // ~38mm
    });
    const res = calculateMeasurements(landmarks, CANVAS, CARD_L, CARD_R);
    expect(res.faceWidthMm).toBeGreaterThanOrEqual(148);
    expect(res.faceWidthMm).toBeLessThanOrEqual(152);
    expect(res.noseWidthMm).toBeGreaterThanOrEqual(36);
    expect(res.noseWidthMm).toBeLessThanOrEqual(42);
  });

  it("prefers the larger of manual vs oval face width when both provided", () => {
    const landmarks = buildLandmarks({
      leftX: 0.4,
      rightX: 0.6, // 200px → ~86mm (would be out-of-range alone)
      noseLeftX: 0.46,
      noseRightX: 0.55,
    });
    // Manual edges supply the wider, in-range value.
    const res = calculateMeasurements(
      landmarks,
      CANVAS,
      CARD_L,
      CARD_R,
      { x: 325, y: 280 },
      { x: 675, y: 280 },
    );
    expect(res.faceWidthMm).toBeGreaterThanOrEqual(148);
  });
});

describe("calculateMeasurements — guards", () => {
  it("throws invalid_canvas when canvasWidth is invalid", () => {
    expect(() => calculateMeasurements([], 0, CARD_L, CARD_R, { x: 0, y: 0 }, { x: 100, y: 0 }))
      .toThrow(/Capture frame/i);
  });

  it("throws card_too_small when card corners are nearly identical", () => {
    expect(() =>
      calculateMeasurements(
        [],
        CANVAS,
        { x: 500, y: 300 },
        { x: 510, y: 300 },
        { x: 325, y: 280 },
        { x: 675, y: 280 },
      ),
    ).toThrow(/Card corners/i);
  });

  it("uses ISO/IEC 7810 ID-1 card width as the mm scale", () => {
    expect(CARD_WIDTH_MM).toBe(85.6);
  });
});
