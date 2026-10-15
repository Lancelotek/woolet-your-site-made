import { describe, expect, it } from "vitest";

import { createFitLensResultDedupe } from "@/lib/fitlens-result-dedupe";

const baseDetail = {
  faceWidthMm: 158,
  bridge: 21,
  pd: 66,
  templeToTemple: 160,
  templeLength: 150,
  lensHeight: 44,
  timestamp: 1_760_000_000_000,
};

describe("createFitLensResultDedupe", () => {
  it("ignores a second result with the same measurementId", () => {
    const dedupe = createFitLensResultDedupe();
    const detail = { ...baseDetail, measurementId: "scan-abc" };
    expect(dedupe.isDuplicate(detail)).toBe(false);
    expect(dedupe.isDuplicate({ ...detail })).toBe(true);
    expect(dedupe.isDuplicate({ ...baseDetail, measurementId: "scan-def" })).toBe(false);
  });

  it("dedupes identical measurements within 10 s when there is no id", () => {
    const dedupe = createFitLensResultDedupe();
    expect(dedupe.isDuplicate(baseDetail)).toBe(false);
    // Same values, 400 ms later (the bridge delay) — duplicate.
    expect(dedupe.isDuplicate({ ...baseDetail, timestamp: baseDetail.timestamp + 400 })).toBe(true);
    // Same values but 30 s later — a genuine rescan, not a duplicate.
    expect(dedupe.isDuplicate({ ...baseDetail, timestamp: baseDetail.timestamp + 30_000 })).toBe(false);
  });

  it("treats different measurements without an id as a new result", () => {
    const dedupe = createFitLensResultDedupe();
    expect(dedupe.isDuplicate(baseDetail)).toBe(false);
    expect(dedupe.isDuplicate({ ...baseDetail, faceWidthMm: 150 })).toBe(false);
  });

  it("reset clears the seen state", () => {
    const dedupe = createFitLensResultDedupe();
    const detail = { ...baseDetail, measurementId: "scan-abc" };
    expect(dedupe.isDuplicate(detail)).toBe(false);
    dedupe.reset();
    expect(dedupe.isDuplicate(detail)).toBe(false);
  });
});
