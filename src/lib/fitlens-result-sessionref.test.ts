import { describe, expect, it } from "vitest";
import { parseFitLensEvent } from "@/lib/fitlens-result";
import { toFitLensSessionRef } from "@/hooks/use-fitlens-script";

// Shape FitLens sent on 2026-10-23 (synthetic fixture from Marcin).
const payload = {
  measurementId: "synthetic_live_measurement",
  pdMm: 62.2,
  faceWidthMm: 140,
  noseBridgeEstimateMm: 18.2,
  noseBridgeMm: 32.1,
  intercanthalDistanceMm: 32.1,
  measurementSemantics: {
    version: "4",
    noseBridgeEstimateMm: "intermediate_nasal_sidewall_estimate_134_363",
    noseBridgeMm: "deprecated_intercanthal_alias_133_362",
  },
  signedPayload: "synthetic_unsigned_fixture",
  confidence: "high",
  recommendedFrameWidthMm: [135, 145],
  frames: [],
  sessionRef: "synthetic_live_20261023",
};

describe("FitLens result v4", () => {
  it("reads sessionRef, nose estimate and intercanthal from the detail", () => {
    const e = parseFitLensEvent(payload);
    expect(e.sessionRef).toBe("synthetic_live_20261023");
    expect(e.noseBridgeEstimateMm).toBe(18.2);
    expect(e.intercanthalMm).toBe(32.1);
    expect(e.confidence.tier).toBe("high");
    expect(e.signedPayload).toBeNull();
    expect(e.measurements.faceWidth).toBe(140);
    expect(e.measurements.pd).toBe(62.2);
    // The deprecated noseBridgeMm alias must never become a bridge value.
    expect(e.measurements.bridge).toBeUndefined();
  });

  it("reads the same fields from the raw message shape", () => {
    const e = parseFitLensEvent({ source: "fitlens", type: "result", payload, measurement: payload });
    expect(e.sessionRef).toBe("synthetic_live_20261023");
    expect(e.noseBridgeEstimateMm).toBe(18.2);
  });

  it("validates sessionRef like the FitLens loader", () => {
    expect(toFitLensSessionRef("test-order-123")).toBe("test-order-123");
    expect(toFitLensSessionRef("WLT-BSP-2026-0001")).toBe("WLT-BSP-2026-0001");
    expect(toFitLensSessionRef("short")).toBeNull();
    expect(toFitLensSessionRef("a@b.com-order")).toBeNull();
    expect(toFitLensSessionRef(null)).toBeNull();
  });
});
