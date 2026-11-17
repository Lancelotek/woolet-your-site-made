// What a paid Bespoke order is still asked for before the workshop starts the
// 3D model, and when the customer hears about it.
//
// Decision 17.11.2026 (replaces the three-item rule of 16.11.2026): the front
// photo with a card is the only condition. A scan, the side photo and the
// numbers from the current glasses raise the confidence of the recommendation
// (see bespoke-recommendation.ts) and the customer is asked for ONE of them at
// a time - the one that helps most. Nobody sent all three.
//
// Rhythm, the same for a form that never arrived and for a form with holes:
//   ask -> 3 days -> one reminder -> 3 days -> support is alerted. No third email.
//
// Pure functions only: the cron job and the tests both import this file.

import { recommendFit } from "./bespoke-recommendation.ts";

export type FittingItem = "photo" | "scan" | "profile" | "glasses";

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

/**
 * The one thing to ask the customer for next - an empty list when the
 * recommendation already stands on two agreeing widths and a bridge.
 * A list, because the email and the alert are written for lists.
 */
export function fittingMissing(input: {
  order: Record<string, unknown>;
  photo?: Record<string, unknown> | null;
  scans?: Array<Record<string, unknown>>;
}): FittingItem[] {
  const { nextAsk } = recommendFit(input);
  return nextAsk ? [nextAsk] : [];
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
    photo: {
      title: "Front photo with the card",
      body: "Look straight at the camera and hold a bank card flat on your cheek, long edge level. Someone else takes it from about 5 feet, with 2x zoom. The card gives me a true scale.",
      linkLabel: "Upload the photo",
      linkUrl: links.photo,
    },
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
