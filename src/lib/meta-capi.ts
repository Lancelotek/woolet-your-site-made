// Meta Conversions API — server-side event mirror.
// Generates an event_id, reads _fbp/_fbc cookies, then sends the same event_id
// to BOTH (a) the browser Pixel via GTM dataLayer (for native deduplication on
// Meta's side) and (b) our Supabase Edge Function which forwards to the
// Conversions API with IP + User-Agent attached server-side.
//
// Meta deduplicates by (event_name, event_id) when both client and server
// events arrive within ~48h. The Pixel side must read `event_id` in GTM and
// pass it as `eventID` to fbq().

import { supabase } from "@/integrations/supabase/client";

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Lead"
  | "CompleteRegistration"
  | "Purchase";

export interface MetaUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  external_id?: string;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  order_id?: string;
  predicted_ltv?: number;
  search_string?: string;
  status?: string;
  [k: string]: Json | undefined;
}

const COOKIE_KEYS = {
  fbp: "_fbp",
  fbc: "_fbc",
} as const;

const readCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.split("=")[1];
};

/**
 * Build a synthetic _fbc value from a ?fbclid= URL parameter on first landing,
 * matching Meta's format: fb.{subdomainIndex}.{timestamp}.{fbclid}.
 * If no fbclid in URL, returns undefined.
 */
const synthesizeFbcFromFbclid = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
};

const uuid = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isProdHost = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "woolet.co" || host === "www.woolet.co";
};

export interface TrackOptions {
  user?: MetaUserData;
  custom?: MetaCustomData;
  /** Override the auto-generated event_id (used when Stripe webhook should match). */
  eventId?: string;
  /** Skip GTM dataLayer push (e.g. for events that should be server-only). */
  serverOnly?: boolean;
}

/**
 * Fire a Meta event to both the browser Pixel (via GTM) and the Conversions
 * API (via our edge function). Safe to call from any environment — no-ops
 * outside production hosts.
 */
export const trackMetaEvent = async (
  eventName: MetaEventName,
  opts: TrackOptions = {},
): Promise<void> => {
  if (!isProdHost()) return;

  const eventId = opts.eventId ?? uuid();
  const fbp = readCookie(COOKIE_KEYS.fbp);
  const fbc = readCookie(COOKIE_KEYS.fbc) ?? synthesizeFbcFromFbclid();
  const eventSourceUrl =
    typeof window !== "undefined" ? window.location.href : undefined;

  // 1) Browser Pixel via GTM dataLayer. The GTM Meta Pixel tag must read
  //    `event_id` and pass it to fbq() as the eventID for deduplication.
  if (!opts.serverOnly && typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: `meta_${eventName.toLowerCase()}`,
      meta_event_name: eventName,
      event_id: eventId,
      ...(opts.custom ?? {}),
    });
  }

  // 2) Server-side via Conversions API. Fire-and-forget — never block UX.
  try {
    void supabase.functions.invoke("meta-capi", {
      body: {
        event_name: eventName,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        user_data: {
          ...(opts.user ?? {}),
          fbp,
          fbc,
        },
        custom_data: opts.custom,
      },
    });
  } catch (err) {
    // Pixel still fired client-side; swallow.
    console.warn("[meta-capi] dispatch failed", err);
  }
};

/**
 * Reads the current visitor's fbp/fbc + a fresh event_id, returns them as a
 * flat string-only object suitable for Stripe Checkout `metadata`. Use this
 * when creating a Checkout Session so the Purchase webhook can fire CAPI
 * with the original visitor signals attached.
 */
export const buildPurchaseAttribution = (): Record<string, string> => {
  const eventId = uuid();
  const fbp = readCookie(COOKIE_KEYS.fbp);
  const fbc = readCookie(COOKIE_KEYS.fbc) ?? synthesizeFbcFromFbclid();
  const ua =
    typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : "";
  const url =
    typeof window !== "undefined" ? window.location.href.slice(0, 500) : "";

  const out: Record<string, string> = {
    meta_event_id: eventId,
    meta_client_user_agent: ua,
    meta_event_source_url: url,
  };
  if (fbp) out.meta_fbp = fbp;
  if (fbc) out.meta_fbc = fbc;
  return out;
};
