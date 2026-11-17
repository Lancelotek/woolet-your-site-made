import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  PREVIEW_CONSENT_TEXT,
  PREVIEW_CONSENT_VERSION,
  previewConsentPayload,
} from "@/lib/bespoke-preview-consent";
import { balanceState, balanceClock } from "../../supabase/functions/_shared/bespoke-balance";

describe("visualization consent (a condition of the order, given at checkout)", () => {
  it("sends nothing unless the customer ticked the box", () => {
    expect(previewConsentPayload(false)).toEqual({});
  });
  it("sends the exact wording shown", () => {
    expect(previewConsentPayload(true)).toEqual({
      aiPreviewConsent: { given: true, text: PREVIEW_CONSENT_TEXT, version: PREVIEW_CONSENT_VERSION },
    });
  });
  it("names the recipient, says it is a condition, and stays English", () => {
    expect(PREVIEW_CONSENT_TEXT).toContain("AI image service");
    expect(PREVIEW_CONSENT_TEXT).toContain("condition of the order");
    expect(PREVIEW_CONSENT_TEXT).not.toMatch(/[ąćęłńóśźż]/i);
    expect(PREVIEW_CONSENT_TEXT.length).toBeLessThan(480); // fits Stripe metadata
  });
  it("is asked at checkout, never pre-ticked, and blocks the payment form until given", () => {
    const src = readFileSync("src/pages/bespoke/Checkout.tsx", "utf8");
    expect(src).toContain("const [previewConsent, setPreviewConsent] = useState(false);");
    expect(src).not.toMatch(/defaultChecked/);
    expect(src).toContain('split.plan === "deposit" && !consentConfirmed');
  });
  it("is refused by the server when missing on a deposit order", () => {
    const fn = readFileSync("supabase/functions/create-bespoke-checkout/index.ts", "utf8");
    expect(fn).toContain("preview_consent_required");
    expect(fn).toContain('cleanMeta.flow_version = "2"');
  });
  it("is no longer asked on the photo upload pages", () => {
    for (const page of ["src/pages/bespoke/Measurements.tsx", "src/pages/bespoke/Photo.tsx"]) {
      expect(readFileSync(page, "utf8")).not.toContain("PREVIEW_CONSENT_TEXT");
    }
    expect(readFileSync("src/pages/bespoke/Photo.tsx", "utf8")).toContain('const locale: keyof typeof CONSENT_TEXT = "en";');
  });
});

describe("the balance clock on each flow", () => {
  const paidDeposit = { payment_plan: "deposit" };
  it("flow 2 runs from the visualization and ignores model corrections", () => {
    const o = { ...paidDeposit, flow_version: 2, preview_sent_at: "2026-11-18T10:00:00Z" };
    expect(balanceState({ ...paidDeposit, flow_version: 2 }, 0, new Date("2026-11-18T10:00:00Z"))).toBe("awaiting_model");
    expect(balanceState(o, 2, new Date("2026-11-20T10:00:00Z"))).toBe("awaiting_payment");
    expect(balanceState(o, 0, new Date("2026-11-24T10:00:01Z"))).toBe("expired");
    expect(balanceClock(o).dueAt?.toISOString()).toBe("2026-11-24T10:00:00.000Z");
    expect(balanceClock(o).reminderAt?.toISOString()).toBe("2026-11-22T10:00:00.000Z");
  });
  it("flow 2 does not open the payment just because a model date exists", () => {
    expect(balanceState({ ...paidDeposit, flow_version: 2, model_sent_at: "2026-11-18T10:00:00Z" }, 0)).toBe("awaiting_model");
  });
  it("flow 1 is unchanged: 14 days from the model, paused by an open correction", () => {
    const o = { ...paidDeposit, model_sent_at: "2026-11-12T10:00:00Z" };
    expect(balanceState(o, 0, new Date("2026-11-20T10:00:00Z"))).toBe("awaiting_payment");
    expect(balanceState(o, 1, new Date("2026-11-20T10:00:00Z"))).toBe("revision_requested");
    expect(balanceClock(o).dueAt?.toISOString()).toBe("2026-11-26T10:00:00.000Z");
    expect(balanceClock(o).reminderAt?.toISOString()).toBe("2026-11-22T10:00:00.000Z");
  });
});
