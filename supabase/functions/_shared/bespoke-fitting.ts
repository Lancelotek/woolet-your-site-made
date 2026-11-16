// What a paid Bespoke order still owes us before the workshop can start the
// 3D model, and when the customer hears about it (decision 16.11.2026).
//
// Required on top of the front photo with a card:
//   scan     - a FitLens scan (face width, PD)
//   profile  - the side photo with a card (nose bridge height)
//   glasses  - the three numbers inside the temple of the current glasses
//
// Rhythm, the same for a form that never arrived and for a form with holes:
//   ask -> 3 days -> one reminder -> 3 days -> support is alerted. No third email.
//
// Pure functions only: the cron job and the tests both import this file.

export type FittingItem = "scan" | "profile" | "glasses";

export const FITTING_STEP_DAYS = 3;
/** A form just sent is left alone this long: the photo page comes right after it. */
export const FITTING_GRACE_HOURS = 1;
/** Orders older than this are left to a personal note, never to the robot. */
export const FITTING_MAX_AGE_DAYS = 30;

export const FITTING_NOTES = {
  request: "Fitting items request emailed to the customer",
  reminder: "Fitting items reminder emailed to the customer",
  alert: "Fitting items still missing - support alerted",
  formReminder: "Fitting reminder 1 emailed to the customer",
  formAlert: "Fitting form still missing - support alerted",
} as const;

const DAY_MS = 86400000;
const HOUR_MS = 3600000;

const has = (v: unknown): boolean => v !== null && v !== undefined && String(v).trim() !== "";

/** "Current glasses: lens 60 · bridge 18 · temple 145 mm" is the form's own first note line. */
const lensInNotes = (notes: unknown): boolean =>
  typeof notes === "string" && /^Current glasses: lens \d/m.test(notes);

export function fittingMissing(input: {
  order: Record<string, unknown>;
  photo?: Record<string, unknown> | null;
  scanCount?: number;
}): FittingItem[] {
  const { order: o, photo, scanCount = 0 } = input;
  const missing: FittingItem[] = [];

  const scanned = scanCount > 0 || o.scan_source === "fitlens" || has(o.scan_received_at) || has(o.ai_face_width_mm);
  if (!scanned) missing.push("scan");

  const profile = Boolean(photo) && has(photo!.profile_path) && !has(photo!.consent_withdrawn_at);
  if (!profile) missing.push("profile");

  const glasses =
    has(o.reference_glasses_raw) ||
    (lensInNotes(o.manual_notes) && has(o.manual_bridge_width_mm) && has(o.manual_temple_length_mm));
  if (!glasses) missing.push("glasses");

  return missing;
}

export type FittingAction = "request" | "reminder" | "alert" | null;

/** Next step for a submitted form that still has holes. Dates are ISO strings from bespoke_crm_events. */
export function nextFittingAction(input: {
  now: Date;
  submittedAt: string | null;
  requestAt: string | null;
  reminderAt: string | null;
  alertAt: string | null;
}): FittingAction {
  const { now, submittedAt, requestAt, reminderAt, alertAt } = input;
  if (!submittedAt || alertAt) return null;
  const since = (iso: string) => now.getTime() - new Date(iso).getTime();
  if (reminderAt) return since(reminderAt) >= FITTING_STEP_DAYS * DAY_MS ? "alert" : null;
  if (requestAt) return since(requestAt) >= FITTING_STEP_DAYS * DAY_MS ? "reminder" : null;
  return since(submittedAt) >= FITTING_GRACE_HOURS * HOUR_MS ? "request" : null;
}

/** Next step for an order whose fitting form never arrived. Counted from payment. */
export function nextFormAction(input: {
  now: Date;
  paidAt: string;
  reminderAt: string | null;
  alertAt: string | null;
}): "reminder" | "alert" | null {
  const { now, paidAt, reminderAt, alertAt } = input;
  if (alertAt) return null;
  const age = now.getTime() - new Date(paidAt).getTime();
  if (reminderAt) return age >= 2 * FITTING_STEP_DAYS * DAY_MS ? "alert" : null;
  return age >= FITTING_STEP_DAYS * DAY_MS ? "reminder" : null;
}

export const fittingLinks = (origin: string, o: { stripe_session_id: string; case_no?: string | null; scan_token?: string | null }) => {
  const sid = encodeURIComponent(o.stripe_session_id);
  return {
    form: `${origin}/en/bespoke/measurements?sid=${sid}`,
    photo: `${origin}/en/bespoke/photo?sid=${sid}`,
    // With the case number and token the scan lands on the order by itself.
    scan: o.case_no && o.scan_token
      ? `${origin}/en/fit?bsp=${encodeURIComponent(o.case_no)}&t=${encodeURIComponent(o.scan_token)}`
      : `${origin}/en/fit`,
  };
};

export interface FittingAsk {
  title: string;
  body: string;
  linkLabel?: string;
  linkUrl?: string;
}

/** The asks, in the order the customer should do them. Only what is missing. */
export function fittingAsks(missing: FittingItem[], links: ReturnType<typeof fittingLinks>): FittingAsk[] {
  const asks: Record<FittingItem, FittingAsk> = {
    scan: {
      title: "Face scan",
      body: "60 seconds with your phone camera. Glasses off, a bank card flat on your forehead. The result lands on your order by itself.",
      linkLabel: "Start the scan",
      linkUrl: links.scan,
    },
    profile: {
      title: "Side photo with the card",
      body: "Turn 90 degrees to the camera and hold the card flat on your cheek. Your ear and the top of your nose stay visible. Someone else takes it from about 5 feet, with 2x zoom. It shows me how high your nose bridge sits.",
      linkLabel: "Upload the side photo",
      linkUrl: links.photo,
    },
    glasses: {
      title: "The numbers inside your current glasses",
      body: "Three numbers printed inside the temple. They look like 54-18 145. Add the brand and model. No glasses at hand? Reply and tell me.",
      linkLabel: "Open my fitting form",
      linkUrl: links.form,
    },
  };
  return missing.map((m) => asks[m]);
}
