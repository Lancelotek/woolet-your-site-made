import { describe, expect, it } from "vitest";
import { MODEL_RECEIVED_NOTE, buildTimeline, checkedAt, timelineProgress } from "@/lib/bespoke-timeline";

const base = { created_at: "2026-11-11T13:30:00Z", payment_plan: "deposit", crm_stage: 1 };
const byKey = (steps: ReturnType<typeof buildTimeline>) => Object.fromEntries(steps.map((s) => [s.key, s]));

describe("buildTimeline", () => {
  it("a fresh deposit order has only the payment ticked and production locked", () => {
    const t = byKey(buildTimeline({ order: base, photo: null, events: [], revisions: [] }));
    expect(t.paid.done).toBe(true);
    expect(t.numbers.done).toBe(false);
    expect(t.production.locked).toBe(true);
    expect(t.production.action).toBeUndefined();
    expect(t.shipped.action).toBeUndefined();
    expect(t.model_sent.action).toEqual({ type: "model_sent" });
  });

  it("ticks the fitting rows from the form and the photo", () => {
    const t = byKey(buildTimeline({
      order: { ...base, crm_stage: 2, crm_stage_2_at: "2026-11-11T20:23:34Z", measurements_submitted_at: "2026-11-11T20:23:34Z", shipping_submitted_at: "2026-11-11T20:23:30Z" },
      photo: { status: "submitted", consent_at: "2026-11-11T20:23:31Z" },
      events: [], revisions: [],
    }));
    expect(t.address.at).toBe("2026-11-11T20:23:30Z");
    expect(t.photo.done).toBe(true);
    expect(t.brief.action).toEqual({ type: "stage", to: 3, back: 2 });
  });

  it("does not count a photo that never finished uploading", () => {
    const t = byKey(buildTimeline({ order: base, photo: { status: "pending", consent_at: "2026-11-11T20:00:00Z" }, events: [], revisions: [] }));
    expect(t.photo.done).toBe(false);
  });

  it("shows an open correction and unlocks production once the balance is paid", () => {
    const waiting = byKey(buildTimeline({
      order: { ...base, crm_stage: 4, model_sent_at: "2026-11-12T10:00:00Z" },
      photo: null, events: [],
      revisions: [{ note: "bridge 1 mm wider", created_at: "2026-11-13T09:00:00Z", resolved_at: null }],
    }));
    expect(waiting.correction.done).toBe(false);
    expect(waiting.correction.label).toContain("waiting for you");
    expect(waiting.production.locked).toBe(true);

    const paid = byKey(buildTimeline({
      order: { ...base, crm_stage: 4, model_sent_at: "2026-11-12T10:00:00Z", balance_paid_at: "2026-11-14T08:00:00Z" },
      photo: null, events: [], revisions: [],
    }));
    expect(paid.approved.done).toBe(true);
    expect(paid.production.action).toEqual({ type: "stage", to: 5, back: 4 });
    expect(paid.shipped.action).toEqual({ type: "ship" });
  });

  it("a paid-in-full order has no balance rows and can go to production", () => {
    const steps = buildTimeline({ order: { ...base, payment_plan: "full", crm_stage: 3, crm_stage_3_at: "2026-09-19T10:00:00Z" }, photo: null, events: [], revisions: [] });
    const t = byKey(steps);
    expect(t.approved).toBeUndefined();
    expect(t.correction).toBeUndefined();
    expect(t.paid.label).toBe("Paid in full");
    expect(t.production.locked).toBe(false);
    expect(timelineProgress(steps)).toEqual({ done: 2, total: 10 });
  });

  it("reads the workshop tick from the activity log, latest entry first", () => {
    const on = [{ note: MODEL_RECEIVED_NOTE, created_at: "2026-11-12T09:00:00Z" }];
    const off = [{ note: `${MODEL_RECEIVED_NOTE} - unticked`, created_at: "2026-11-12T09:05:00Z" }, ...on];
    expect(checkedAt(on, MODEL_RECEIVED_NOTE)).toBe("2026-11-12T09:00:00Z");
    expect(checkedAt(off, MODEL_RECEIVED_NOTE)).toBeNull();
  });
});
