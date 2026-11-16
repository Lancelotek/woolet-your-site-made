import { describe, expect, it } from "vitest";
import {
  FITTING_NOTES,
  fittingAsks,
  fittingLinks,
  fittingMissing,
  nextFittingAction,
  nextFormAction,
} from "../../supabase/functions/_shared/bespoke-fitting";

const at = (iso: string) => new Date(iso);

describe("fittingMissing", () => {
  it("flags all three on a form with only a lens width (WLT-BSP-2026-0010)", () => {
    const order = { scan_source: "manual", ai_face_width_mm: null, manual_notes: "Current glasses: lens 60 mm", reference_glasses_raw: null };
    expect(fittingMissing({ order, photo: { profile_path: null }, scanCount: 0 })).toEqual(["scan", "profile", "glasses"]);
  });
  it("is empty for a complete fitting", () => {
    const order = {
      scan_source: "fitlens", manual_notes: "Current glasses: lens 54 · bridge 18 · temple 145 mm",
      manual_bridge_width_mm: 18, manual_temple_length_mm: 145,
    };
    expect(fittingMissing({ order, photo: { profile_path: "orders/x/profile.jpg" } })).toEqual([]);
  });
  it("counts a scan that landed through the scan link and glasses given on the call", () => {
    const order = { scan_source: "manual", reference_glasses_raw: "cgop 1386 01 52 21-145" };
    expect(fittingMissing({ order, photo: { profile_path: "p.jpg" }, scanCount: 1 })).toEqual([]);
  });
  it("ignores a side photo whose consent was withdrawn", () => {
    const order = { scan_source: "fitlens", reference_glasses_raw: "52-18 145" };
    expect(fittingMissing({ order, photo: { profile_path: "p.jpg", consent_withdrawn_at: "2026-11-01T00:00:00Z" } })).toEqual(["profile"]);
  });
});

describe("nextFittingAction", () => {
  const base = { submittedAt: "2026-11-13T14:34:39Z", requestAt: null, reminderAt: null, alertAt: null };
  it("waits an hour after the form, then asks", () => {
    expect(nextFittingAction({ ...base, now: at("2026-11-13T15:10:00Z") })).toBeNull();
    expect(nextFittingAction({ ...base, now: at("2026-11-13T16:10:00Z") })).toBe("request");
  });
  it("reminds 3 days after the ask, once", () => {
    const asked = { ...base, requestAt: "2026-11-16T10:45:00Z" };
    expect(nextFittingAction({ ...asked, now: at("2026-11-19T10:10:00Z") })).toBeNull();
    expect(nextFittingAction({ ...asked, now: at("2026-11-19T11:10:00Z") })).toBe("reminder");
  });
  it("alerts support 3 days after the reminder and then stops", () => {
    const reminded = { ...base, requestAt: "2026-11-16T10:45:00Z", reminderAt: "2026-11-19T11:10:00Z" };
    expect(nextFittingAction({ ...reminded, now: at("2026-11-21T11:10:00Z") })).toBeNull();
    expect(nextFittingAction({ ...reminded, now: at("2026-11-22T11:10:00Z") })).toBe("alert");
    expect(nextFittingAction({ ...reminded, alertAt: "2026-11-22T11:10:00Z", now: at("2026-11-30T00:00:00Z") })).toBeNull();
  });
});

describe("nextFormAction", () => {
  const paidAt = "2026-11-13T14:26:04Z";
  it("reminds on day 3 and alerts on day 6", () => {
    expect(nextFormAction({ now: at("2026-11-15T14:00:00Z"), paidAt, reminderAt: null, alertAt: null })).toBeNull();
    expect(nextFormAction({ now: at("2026-11-16T15:00:00Z"), paidAt, reminderAt: null, alertAt: null })).toBe("reminder");
    expect(nextFormAction({ now: at("2026-11-18T15:00:00Z"), paidAt, reminderAt: "2026-11-16T15:00:00Z", alertAt: null })).toBeNull();
    expect(nextFormAction({ now: at("2026-11-19T15:00:00Z"), paidAt, reminderAt: "2026-11-16T15:00:00Z", alertAt: null })).toBe("alert");
    expect(nextFormAction({ now: at("2026-11-25T15:00:00Z"), paidAt, reminderAt: "x", alertAt: "2026-11-19T15:00:00Z" })).toBeNull();
  });
});

describe("fittingAsks", () => {
  const links = fittingLinks("https://woolet.co", { stripe_session_id: "cs_live_abc", case_no: "WLT-BSP-2026-0010", scan_token: "tok" });
  it("lists only what is missing, each with its own link", () => {
    const asks = fittingAsks(["profile", "glasses"], links);
    expect(asks.map((a) => a.linkUrl)).toEqual([
      "https://woolet.co/en/bespoke/photo?sid=cs_live_abc",
      "https://woolet.co/en/bespoke/measurements?sid=cs_live_abc",
    ]);
  });
  it("binds the scan link to the order", () => {
    expect(links.scan).toBe("https://woolet.co/en/fit?bsp=WLT-BSP-2026-0010&t=tok");
  });
  it("keeps the note the old reminder used, so nobody is reminded twice", () => {
    expect(FITTING_NOTES.formReminder).toBe("Fitting reminder 1 emailed to the customer");
  });
});
