/**
 * One case number per bespoke order, from payment to delivery.
 *
 * The case owns a single counter (`case_seq`). Every downstream document —
 * measurement report, production brief, 3D model — reuses that same suffix
 * with its own prefix, so a folder of paperwork sorts and matches by eye.
 * Never mint a second counter for a document.
 */

const pad = (seq: number) => String(Math.max(0, Math.trunc(seq))).padStart(4, "0");

/** WLT-BSP-2026-0001 — the case itself. */
export function formatCaseNo(year: number, seq: number) {
  return `WLT-BSP-${year}-${pad(seq)}`;
}

/** WLT-MR-2026-0001 — measurement report. */
export function formatMrNo(year: number, seq: number) {
  return `WLT-MR-${year}-${pad(seq)}`;
}

/** WLT-PB-2026-0001 — production brief. */
export function formatPbNo(year: number, seq: number) {
  return `WLT-PB-${year}-${pad(seq)}`;
}

/** WLT-3D-2026-0001 — 3D model. */
export function format3dNo(year: number, seq: number) {
  return `WLT-3D-${year}-${pad(seq)}`;
}

/* -------------------------------------------------------------------------- */
/* Stage machine                                                              */
/* -------------------------------------------------------------------------- */

export const BESPOKE_STAGES = [
  "paid",
  "interview_booked",
  "scan_received",
  "interview_done",
  "report_ready",
  "report_sent",
  "model_sent",
  "model_approved",
  "in_production",
  "shipped",
  "delivered",
] as const;

export type BespokeStage = (typeof BESPOKE_STAGES)[number] | "cancelled";

export const STAGE_LABELS: Record<BespokeStage, string> = {
  paid: "Paid",
  interview_booked: "Interview booked",
  scan_received: "Scan received",
  interview_done: "Interview done",
  report_ready: "Report ready",
  report_sent: "Report sent",
  model_sent: "Model sent",
  model_approved: "Model approved",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function stageIndex(stage: string): number {
  return (BESPOKE_STAGES as readonly string[]).indexOf(stage);
}

export function isBespokeStage(stage: string): stage is BespokeStage {
  return stage === "cancelled" || stageIndex(stage) >= 0;
}

/**
 * The ladder runs one direction only. `scan_received` and `interview_done` may
 * arrive in either order, so neither blocks the other — but `report_ready`
 * waits until both flags are set.
 */
export function canAdvance(
  from: string,
  to: string,
  flags: { scanReceived?: boolean; interviewDone?: boolean } = {},
): { ok: true } | { ok: false; reason: string } {
  if (!isBespokeStage(to)) return { ok: false, reason: `unknown_stage:${to}` };
  if (from === "cancelled") return { ok: false, reason: "order_cancelled" };
  if (to === "cancelled") return { ok: true };
  if (from === to) return { ok: false, reason: "same_stage" };

  const a = stageIndex(from);
  const b = stageIndex(to);
  if (a < 0) return { ok: false, reason: `unknown_stage:${from}` };

  // The two mid-flow steps are a pair, not a queue.
  const PAIR = ["scan_received", "interview_done"];
  if (PAIR.includes(to) && PAIR.includes(from)) return { ok: true };
  if (PAIR.includes(to) && a <= stageIndex("interview_done")) return { ok: true };

  if (b <= a) return { ok: false, reason: "backwards" };

  if (to === "report_ready" && !(flags.scanReceived && flags.interviewDone)) {
    return { ok: false, reason: "needs_scan_and_interview" };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Fitting interview booking link                                             */
/* -------------------------------------------------------------------------- */

export const CALENDLY_INTERVIEW_URL =
  "https://calendly.com/marekciesla/woolet-bespoke-fitting-interview";

/**
 * The Calendly event is already live: question 1 is the required field
 * "Bespoke order number (WLT-BSP-...)", so `a1` prefills it. Keep the shape.
 */
export function buildInterviewBookingUrl(input: {
  caseNo: string;
  name?: string | null;
  email?: string | null;
}) {
  const q = new URLSearchParams();
  if (input.name) q.set("name", input.name);
  if (input.email) q.set("email", input.email);
  q.set("a1", input.caseNo);
  q.set("utm_content", input.caseNo);
  q.set("utm_source", "woolet");
  q.set("utm_medium", "email");
  q.set("utm_campaign", "bespoke_interview");
  return `${CALENDLY_INTERVIEW_URL}?${q.toString()}`;
}
