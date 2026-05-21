import { describe, it, expect } from "vitest";
import { detectCardCornersInRegion } from "./card-corner-detection";

// Minimal canvas-shape stub: we feed a real HTMLCanvasElement via jsdom +
// happy path is exercised in browser. Here we test the early-rejection paths
// that don't require pixel data so the helper stays safe under SSR/jsdom.

describe("detectCardCornersInRegion", () => {
  it("returns null when ROI is too small", () => {
    const fake = document.createElement("canvas");
    fake.width = 640; fake.height = 480;
    const out = detectCardCornersInRegion(
      fake,
      { x: 0, y: 0, w: 10, h: 10 },
      640,
      480,
    );
    expect(out).toBeNull();
  });

  it("returns null on a uniformly-coloured ROI (no edge)", () => {
    const fake = document.createElement("canvas");
    fake.width = 640; fake.height = 480;
    const ctx = fake.getContext("2d")!;
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 0, 640, 480);
    const out = detectCardCornersInRegion(
      fake,
      { x: 100, y: 100, w: 300, h: 80 },
      640,
      480,
    );
    expect(out).toBeNull();
  });

  it("detects a synthetic horizontal card edge", () => {
    const fake = document.createElement("canvas");
    fake.width = 640; fake.height = 480;
    const ctx = fake.getContext("2d")!;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, 640, 480);
    // Bright "card" rectangle inside the ROI.
    ctx.fillStyle = "#eee";
    ctx.fillRect(160, 180, 320, 70);

    const out = detectCardCornersInRegion(
      fake,
      { x: 140, y: 170, w: 360, h: 100 },
      640,
      480,
    );
    expect(out).not.toBeNull();
    if (!out) return;
    expect(out.widthPx).toBeGreaterThan(200);
    expect(out.confidence).toBeGreaterThan(0.4);
    expect(out.corners[0].y).toBeCloseTo(out.corners[1].y, 0);
  });
});
