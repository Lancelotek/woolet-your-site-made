import { describe, expect, it } from "vitest";
import {
  FLOW_PREVIEW_FIRST,
  MAX_MODEL_CORRECTIONS,
  PREVIEW_WINDOW_DAYS,
  correctionLabel,
  isPreviewFirst,
  modelStatus,
  previewDueAt,
  previewFlowSteps,
  previewReminderDueAt,
  previewState,
  previewTerms,
} from "@/lib/bespoke-flow";
import { buildTimeline } from "@/lib/bespoke-timeline";

const at = (iso: string) => new Date(iso);
const rev = (created: string, resolved: string | null) => ({ note: "narrower bridge", created_at: created, resolved_at: resolved });
const byKey = (steps: ReturnType<typeof buildTimeline>) => Object.fromEntries(steps.map((s) => [s.key, s]));

describe("which flow an order is on", () => {
  it("keeps every existing order on the model-first flow", () => {
    expect(isPreviewFirst({})).toBe(false);
    expect(isPreviewFirst({ flow_version: 1 })).toBe(false);
    expect(isPreviewFirst(null)).toBe(false);
  });
  it("uses the visualization-first flow only when the order says so", () => {
    expect(isPreviewFirst({ flow_version: FLOW_PREVIEW_FIRST })).toBe(true);
  });
});

describe("accepting the visualization", () => {
  const sent = "2026-11-18T10:00:00Z";
  it("gives 3 days and reminds on day 2", () => {
    expect(PREVIEW_WINDOW_DAYS).toBe(3);
    expect(previewDueAt(at(sent)).toISOString()).toBe("2026-11-21T10:00:00.000Z");
    expect(previewReminderDueAt(at(sent)).toISOString()).toBe("2026-11-20T10:00:00.000Z");
  });
  it("walks awaiting_preview -> awaiting_payment -> paid", () => {
    expect(previewState({}, at(sent))).toBe("awaiting_preview");
    expect(previewState({ preview_sent_at: sent }, at("2026-11-20T10:00:00Z"))).toBe("awaiting_payment");
    expect(previewState({ preview_sent_at: sent, balance_paid_at: "2026-11-19T08:00:00Z" }, at("2026-11-30T00:00:00Z"))).toBe("paid");
  });
  it("expires after the window, and stays expired once stamped", () => {
    expect(previewState({ preview_sent_at: sent }, at("2026-11-21T10:00:01Z"))).toBe("expired");
    expect(previewState({ preview_sent_at: sent, balance_expired_at: "2026-11-21T10:05:00Z" }, at("2026-11-21T09:00:00Z"))).toBe("expired");
  });
});

describe("the 3D model after the balance", () => {
  const paid = { balance_paid_at: "2026-11-19T08:00:00Z" };
  const modelOut = { ...paid, model_sent_at: "2026-11-24T12:00:00Z" };
  it("keeps the workshop locked until the balance is paid", () => {
    const s = modelStatus({ model_sent_at: "2026-11-24T12:00:00Z" });
    expect(s.state).toBe("locked");
    expect(s.productionUnlocked).toBe(false);
  });
  it("waits for the model, then for the customer", () => {
    expect(modelStatus(paid).state).toBe("awaiting_model");
    const s = modelStatus(modelOut);
    expect(s.state).toBe("awaiting_approval");
    expect(s.correctionsLeft).toBe(3);
    expect(s.canRequestCorrection).toBe(true);
  });
  it("counts corrections and pauses on an open one", () => {
    const s = modelStatus(modelOut, [rev("2026-11-25T09:00:00Z", null)]);
    expect(s.state).toBe("correction_requested");
    expect(s.correctionsUsed).toBe(1);
    expect(s.correctionsLeft).toBe(2);
    expect(s.canRequestCorrection).toBe(false);
  });
  it("still asks for approval after the first and second answered correction", () => {
    const two = [rev("2026-11-27T09:00:00Z", "2026-11-28T09:00:00Z"), rev("2026-11-25T09:00:00Z", "2026-11-26T09:00:00Z")];
    const s = modelStatus(modelOut, two);
    expect(s.state).toBe("awaiting_approval");
    expect(s.correctionsLeft).toBe(1);
    expect(s.canRequestCorrection).toBe(true);
  });
  it("builds to the last version once the third correction is answered", () => {
    const three = [
      rev("2026-11-29T09:00:00Z", "2026-11-30T09:00:00Z"),
      rev("2026-11-27T09:00:00Z", "2026-11-28T09:00:00Z"),
      rev("2026-11-25T09:00:00Z", "2026-11-26T09:00:00Z"),
    ];
    const s = modelStatus(modelOut, three);
    expect(s.state).toBe("final_by_limit");
    expect(s.canRequestCorrection).toBe(false);
    expect(s.productionUnlocked).toBe(true);
  });
  it("does not go final while the third correction is still open", () => {
    const three = [rev("2026-11-29T09:00:00Z", null), rev("2026-11-27T09:00:00Z", "x"), rev("2026-11-25T09:00:00Z", "x")];
    expect(modelStatus(modelOut, three).state).toBe("correction_requested");
  });
  it("is approved the moment the customer says so, whatever was asked before", () => {
    const s = modelStatus({ ...modelOut, model_approved_at: "2026-11-26T10:00:00Z" }, [rev("2026-11-25T09:00:00Z", "2026-11-26T09:00:00Z")]);
    expect(s.state).toBe("approved");
    expect(s.productionUnlocked).toBe(true);
  });
  it("labels corrections for people", () => {
    expect(MAX_MODEL_CORRECTIONS).toBe(3);
    expect(correctionLabel(2)).toBe("Correction 2 of 3");
  });
});

describe("what the buyer is told", () => {
  const split = { dueNowCents: 4900, balanceCents: 43100 };
  it("says what the deposit buys and that nothing is refundable", () => {
    const t = previewTerms(split);
    expect(t).toContain("$49 today buys your visualization");
    expect(t).toContain("$431 when you accept it");
    expect(t).toContain("no payment is refundable");
  });
  it("lists the steps in the new order", () => {
    const steps = previewFlowSteps(split);
    expect(steps).toHaveLength(6);
    expect(steps[3]).toContain("you have 3 days");
    expect(steps[4]).toContain("up to 3 times");
    expect(steps.findIndex((s) => s.includes("balance"))).toBeLessThan(steps.findIndex((s) => s.includes("3D model")));
  });
});

describe("panel timeline on the visualization-first flow", () => {
  const base = { flow_version: 2, created_at: "2026-11-18T09:00:00Z", payment_plan: "deposit", crm_stage: 2, crm_stage_2_at: "2026-11-18T09:30:00Z", measurements_submitted_at: "2026-11-18T09:30:00Z" };
  const photo = { status: "submitted", uploaded_at: "2026-11-18T09:20:00Z" };
  it("locks the workshop rows until the balance is paid", () => {
    const t = byKey(buildTimeline({ order: { ...base, preview_sent_at: "2026-11-18T10:00:00Z" }, photo, events: [], revisions: [] }));
    expect(t.preview_sent.done).toBe(true);
    expect(t.preview_paid.done).toBe(false);
    expect(t.brief.locked).toBe(true);
    expect(t.brief.action).toBeUndefined();
    expect(t.production.locked).toBe(true);
  });
  it("opens the brief once the visualization is paid for", () => {
    const t = byKey(buildTimeline({ order: { ...base, preview_sent_at: "2026-11-18T10:00:00Z", balance_paid_at: "2026-11-19T08:00:00Z" }, photo, events: [], revisions: [] }));
    expect(t.preview_paid.done).toBe(true);
    expect(t.brief.action).toEqual({ type: "stage", to: 3, back: 2 });
    expect(t.production.locked).toBe(true);
  });
  it("unlocks production on approval", () => {
    const order = { ...base, crm_stage: 4, preview_sent_at: "x", balance_paid_at: "2026-11-19T08:00:00Z", model_sent_at: "2026-11-24T12:00:00Z", model_approved_at: "2026-11-25T12:00:00Z" };
    const t = byKey(buildTimeline({ order, photo, events: [], revisions: [] }));
    expect(t.approved.done).toBe(true);
    expect(t.production.action).toEqual({ type: "stage", to: 5, back: 4 });
  });
  it("unlocks production after the third answered correction and says why", () => {
    const order = { ...base, crm_stage: 4, preview_sent_at: "x", balance_paid_at: "2026-11-19T08:00:00Z", model_sent_at: "2026-11-30T12:00:00Z" };
    const revisions = [rev("2026-11-29T09:00:00Z", "y"), rev("2026-11-27T09:00:00Z", "y"), rev("2026-11-25T09:00:00Z", "y")];
    const t = byKey(buildTimeline({ order, photo, events: [], revisions }));
    expect(t.approved.label).toContain("built to the last version");
    expect(t.production.locked).toBe(false);
  });
  it("leaves model-first orders exactly as they were", () => {
    const t = byKey(buildTimeline({ order: { created_at: "2026-11-11T13:30:00Z", payment_plan: "deposit", crm_stage: 1 }, photo: null, events: [], revisions: [] }));
    expect(t.preview_sent).toBeUndefined();
    expect(t.model_sent.action).toEqual({ type: "model_sent" });
  });
});
