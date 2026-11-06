import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetGa4Funnel,
  classifyBucket,
  classifyFaceWidth,
  toBucket,
  trackBespokeStage,
  trackFitScanComplete,
} from "./ga4-funnel";

type DL = Record<string, unknown>[];
const dl = () => ((window as unknown as { dataLayer: DL }).dataLayer ||= []);
const events = (name: string) => dl().filter((e) => e.event === name);

beforeEach(() => {
  (window as unknown as { dataLayer: DL }).dataLayer = [];
  __resetGa4Funnel();
});

describe("classifyFaceWidth (04.11.2026 ranges)", () => {
  it.each([
    [144.9, "under_range"],
    [145, "bespoke"],
    [154.9, "bespoke"],
    [155, "standard"],
    [161, "standard"],
    [161.1, "over_range"],
    [null, "unknown"],
    [42, "unknown"],
  ])("%s mm → %s", (mm, expected) => {
    expect(classifyFaceWidth(mm as number | null)).toBe(expected);
  });
});

describe("classifyBucket", () => {
  it.each([
    ["155-160", "standard"],
    ["150-155", "bespoke"],
    ["145-150", "bespoke"],
    ["160-165", "edge"],
    ["165-170", "over_range"],
    ["140-145", "under_range"],
    ["garbage", "unknown"],
    [null, "unknown"],
  ])("%s → %s", (b, expected) => {
    expect(classifyBucket(b as string | null)).toBe(expected);
  });
});

describe("trackFitScanComplete", () => {
  it("fires once per session and never sends exact mm", () => {
    expect(trackFitScanComplete({ method: "fitlens", faceWidthMm: 157.3, bucket: null })).toBe(true);
    expect(trackFitScanComplete({ method: "wizard", faceWidthMm: 157.3 })).toBe(false);
    const fired = events("fit_scan_complete");
    expect(fired).toHaveLength(1);
    expect(fired[0]).toMatchObject({ fit_method: "fitlens", fit_result: "standard", face_width_bucket: "155-160" });
    expect(JSON.stringify(dl())).not.toContain("157.3");
  });

  it("falls back to the FitLens bucket and keeps the latest fit class as context", () => {
    trackFitScanComplete({ method: "fitlens", bucket: "150-155" });
    trackFitScanComplete({ method: "wizard", faceWidthMm: 158 });
    expect(events("fit_scan_complete")[0]).toMatchObject({ fit_result: "bespoke", face_width_bucket: "150-155" });
    const ctx = dl().filter((e) => "wlt_fit_result" in e);
    expect(ctx.at(-1)).toEqual({ wlt_fit_result: "standard" });
  });

  it("starts with fit_ so the existing GTM ^(scan|fit)_ trigger forwards it", () => {
    trackFitScanComplete({ method: "camera_native", faceWidthMm: 150 });
    expect(String(events("fit_scan_complete")[0].event)).toMatch(/^(scan|fit)_/);
  });

  it("uses toBucket for 5 mm privacy buckets", () => {
    expect(toBucket(149.9)).toBe("145-150");
  });
});

describe("trackBespokeStage", () => {
  it("start and preview once per session, checkout every click", () => {
    trackBespokeStage("start", { bespoke_step: 1 });
    trackBespokeStage("start", { bespoke_step: 2 });
    trackBespokeStage("preview", { preview_status: "cached" });
    trackBespokeStage("preview", { preview_status: "generated" });
    trackBespokeStage("checkout", { bespoke_step: 7 });
    trackBespokeStage("checkout", { bespoke_step: 7 });
    expect(events("bespoke_start")).toHaveLength(1);
    expect(events("bespoke_preview")).toHaveLength(1);
    expect(events("bespoke_checkout")).toHaveLength(2);
  });
});
