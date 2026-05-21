import { describe, it, expect } from "vitest";
import { detectCardCornersInRegion } from "./card-corner-detection";

// jsdom does not implement HTMLCanvasElement 2D rendering, so we only assert
// the synchronous rejection paths here. Real edge detection is verified
// manually in the browser preview against live camera frames.

describe("detectCardCornersInRegion", () => {
  it("returns null when ROI is too small to contain a card edge", () => {
    const fake = document.createElement("canvas");
    fake.width = 640;
    fake.height = 480;
    const out = detectCardCornersInRegion(
      fake,
      { x: 0, y: 0, w: 10, h: 10 },
      640,
      480,
    );
    expect(out).toBeNull();
  });

  it("returns null when ROI dimensions are not finite", () => {
    const fake = document.createElement("canvas");
    fake.width = 640;
    fake.height = 480;
    const out = detectCardCornersInRegion(
      fake,
      { x: 0, y: 0, w: Number.NaN, h: 100 },
      640,
      480,
    );
    expect(out).toBeNull();
  });
});
