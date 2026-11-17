import { describe, expect, it } from "vitest";
import {
  parseGlasses,
  recommendFit,
  recommendationRows,
} from "../../supabase/functions/_shared/bespoke-recommendation";

describe("parseGlasses", () => {
  it("reads the form's own note line, even when it holds only a lens", () => {
    expect(parseGlasses({ manual_notes: "Current glasses: lens 60 mm" })).toEqual({ lens: 60, bridge: null, temple: null });
    expect(parseGlasses({ manual_notes: "Current glasses: lens 54 · bridge 18 · temple 145 mm" })).toEqual({ lens: 54, bridge: 18, temple: 145 });
  });
  it("reads temple text with a model number in front", () => {
    expect(parseGlasses({ reference_glasses_raw: "cgop 1386 01 52 21-145" })).toEqual({ lens: 52, bridge: 21, temple: 145 });
    expect(parseGlasses({ reference_glasses_raw: "52-18 145" })).toEqual({ lens: 52, bridge: 18, temple: 145 });
  });
  it("drops numbers no pair of glasses carries (the 34/34 test order)", () => {
    expect(parseGlasses({ manual_notes: "Current glasses: lens 34 · bridge 34 · temple 145 mm" })).toEqual({ lens: null, bridge: null, temple: 145 });
  });
});

describe("recommendFit", () => {
  it("WLT-BSP-2026-0010: unmeasured photo and a lens width give a provisional C with no invented width", () => {
    const rec = recommendFit({
      order: { scan_source: "manual", manual_notes: "Current glasses: lens 60 mm", metadata: { temple_length: "155 mm" } },
      photo: { photo_path: "orders/a1a2/photo.jpg", photo_temple_to_temple_mm: null, profile_path: null },
    });
    expect(rec.tier).toBe("C");
    expect(rec.frontWidth).toBeNull();
    expect(rec.bridge).toBeNull();
    expect(rec.templeLength).toEqual({ mm: 155, basis: "chosen in the configurator" });
    expect(rec.nextAsk).toBe("glasses");
    expect(rec.warnings.join(" ")).toContain("60 mm lens");
    expect(rec.warnings.join(" ")).toContain("has not been measured");
  });
  it("has nothing to recommend from an empty order and asks for the photo", () => {
    const rec = recommendFit({ order: {}, photo: null });
    expect(rec.tier).toBe("none");
    expect(rec.nextAsk).toBe("photo");
  });
  it("adds 2 mm of clearance to a measured width and holds it inside the range", () => {
    const rec = recommendFit({ order: {}, photo: { photo_path: "p.jpg", photo_temple_to_temple_mm: 150 } });
    expect(rec.frontWidth).toEqual({ mm: 152, basis: "card photo temple-to-temple 150 mm + 2 mm" });
    expect(rec.tier).toBe("C");
    const wide = recommendFit({ order: { ai_temple_to_temple_mm: 163 } });
    expect(wide.frontWidth?.mm).toBe(160);
    expect(wide.frontWidth?.clampedFrom).toBe(165);
    expect(wide.warnings[0]).toContain("outside the 145-160 mm range");
  });
  it("reaches B with one width and the bridge of glasses that fit", () => {
    const rec = recommendFit({
      order: { reference_glasses_raw: "52-21 145" },
      photo: { photo_path: "p.jpg", photo_temple_to_temple_mm: 150 },
    });
    expect(rec.tier).toBe("B");
    expect(rec.bridge?.mm).toBe(21);
    expect(rec.templeLength?.mm).toBe(145);
  });
  it("reaches A when a scan confirms the photo and the bridge is known", () => {
    const rec = recommendFit({
      order: { reference_glasses_raw: "52-21 145" },
      photo: { photo_path: "p.jpg", photo_temple_to_temple_mm: 150, profile_path: "s.jpg" },
      scans: [{ created_at: "2026-11-14T10:00:00Z", temple_to_temple_mm: 152 }],
    });
    expect(rec.tier).toBe("A");
    expect(rec.frontWidth?.basis).toContain("scan");
    expect(rec.nextAsk).toBeNull();
  });
  it("drops to C and says so when two widths disagree", () => {
    const rec = recommendFit({
      order: { reference_glasses_raw: "52-21 145", ai_temple_to_temple_mm: 158 },
      photo: { photo_path: "p.jpg", photo_temple_to_temple_mm: 150 },
    });
    expect(rec.tier).toBe("C");
    expect(rec.widthSpreadMm).toBe(8);
    expect(rec.warnings[0]).toContain("disagree by 8 mm");
  });
  it("never turns the inner-canthal distance into a bridge", () => {
    const rec = recommendFit({ order: { ai_inner_canthal_mm: 34, ai_temple_to_temple_mm: 150 } });
    expect(rec.bridge).toBeNull();
    expect(rec.warnings.join(" ")).toContain("face measurement");
  });
  it("holds an out-of-range glasses bridge at the nearest cuttable value", () => {
    const rec = recommendFit({ order: { reference_glasses_raw: "60-16 145", ai_temple_to_temple_mm: 150 } });
    expect(rec.bridge).toEqual({ mm: 20, basis: "bridge of the current glasses (16 mm)", clampedFrom: 16 });
  });
  it("renders rows that say what is missing instead of leaving blanks", () => {
    const rows = recommendationRows(recommendFit({ order: {}, photo: null }));
    expect(rows.map((r) => r.value)).toEqual([
      "not known - no measured width on file",
      "not known - needs glasses numbers or a side photo",
      "not known",
    ]);
  });
});
