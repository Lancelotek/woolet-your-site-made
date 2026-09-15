// Calendly webhook: binds a fitting-interview booking to a bespoke case and
// sends the scan link exactly once.
//
// The case number does the binding. Calendly prefills it into question 1 and
// carries it in utm_content, so the order is resolved from the booking itself
// rather than guessed from an email address.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { recordStage } from "../_shared/bespoke-stage.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SUPPORT_EMAIL = "support@woolet.co";
const CASE_RE = /WLT-BSP-\d{4}-\d{4}/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function signBody(secret: string, timestamp: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  return toHex(mac);
}

// The environment variable is the preferred home for the signing secret; the
// integration_secrets table is the fallback on plans where secrets cannot be
// added (RLS on, no policies — only this service-role client reads it).
let cachedSecret: string | null = null;
async function resolveSecret(): Promise<string | null> {
  if (cachedSecret) return cachedSecret;
  const fromEnv = Deno.env.get("CALENDLY_WEBHOOK_SECRET");
  if (fromEnv) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }
  const { data } = await supabase
    .from("integration_secrets")
    .select("value")
    .eq("name", "calendly_webhook_secret")
    .maybeSingle();
  const value = typeof data?.value === "string" && data.value ? data.value : null;
  if (value) cachedSecret = value;
  return value;
}

type OrderRow = {
  id: string;
  case_no: string | null;
  case_seq: number | null;
  stage: string | null;
  scan_token: string | null;
  customer_email: string | null;
  customer_name: string | null;
  scan_email_sent_at: string | null;
  calendly_invitee_uri: string | null;
};

const ORDER_COLUMNS =
  "id, case_no, case_seq, stage, scan_token, customer_email, customer_name, scan_email_sent_at, calendly_invitee_uri";

async function byCaseNo(caseNo: string): Promise<OrderRow | null> {
  const { data } = await supabase
    .from("bespoke_orders")
    .select(ORDER_COLUMNS)
    .eq("case_no", caseNo.toUpperCase())
    .maybeSingle();
  return (data as OrderRow) ?? null;
}

/** First hit wins; no match leaves the booking unattached rather than guessed. */
async function resolveOrder(payload: Record<string, any>): Promise<OrderRow | null> {
  // 1. The link we sent carries the case number in utm_content.
  const utm = payload?.tracking?.utm_content;
  if (typeof utm === "string" && CASE_RE.test(utm)) {
    const hit = await byCaseNo(utm.match(CASE_RE)![0]);
    if (hit) return hit;
  }

  // 2. Question 1 of the Calendly event is the order number, typed or prefilled.
  const answers = Array.isArray(payload?.questions_and_answers)
    ? payload.questions_and_answers
    : [];
  for (const qa of answers) {
    const raw = typeof qa?.answer === "string" ? qa.answer.trim().toUpperCase() : "";
    const m = raw.match(CASE_RE);
    if (m) {
      const hit = await byCaseNo(m[0]);
      if (hit) return hit;
    }
  }

  // 3. Email, and only when it leaves no room for doubt: exactly one bespoke
  //    order for that address with no booking on it yet.
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  if (email) {
    const { data } = await supabase
      .from("bespoke_orders")
      .select(ORDER_COLUMNS)
      .ilike("customer_email", email)
      .is("calendly_invitee_uri", null);
    const rows = (data as OrderRow[]) ?? [];
    if (rows.length === 1) return rows[0];
  }
  return null;
}

async function alertSupport(heading: string, lines: string[], idempotencyKey?: string) {
  try {
    await sendTemplateEmailAndLog("bespoke-support-alert", SUPPORT_EMAIL, {
      templateData: { heading, lines },
      idempotencyKey:
        idempotencyKey ?? `calendly-alert-${heading}-${lines[0] ?? ""}`.slice(0, 120),
    });
  } catch (e) {
    console.error("[calendly-webhook] support alert failed", e);
  }
}

const fmt = (iso: string, tz: string) => {
  const d = new Date(iso);
  const zone = tz || "UTC";
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: zone,
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  }).format(d);
  return { date, time, tz: zone };
};

async function sendScanInvite(order: OrderRow, startIso: string, timezone: string) {
  if (!order.case_no || !order.customer_email) return;
  // One email per booking: the guard is a conditional update, so two Calendly
  // deliveries racing each other still produce a single send.
  const { data: claimed } = await supabase
    .from("bespoke_orders")
    .update({ scan_email_sent_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("scan_email_sent_at", null)
    .select("id");
  if (!claimed || claimed.length === 0) return;

  const when = fmt(startIso, timezone);
  const scanUrl =
    `https://woolet.co/en/fit?bsp=${encodeURIComponent(order.case_no)}` +
    `&t=${encodeURIComponent(order.scan_token ?? "")}`;
  try {
    await sendTemplateEmailAndLog("bespoke-scan-invite", order.customer_email, {
      templateData: { caseNo: order.case_no, scanUrl, ...when },
      idempotencyKey: `bespoke-scan-invite-${order.id}`,
    });
  } catch (e) {
    console.error("[calendly-webhook] scan invite failed", e);
    // Leave the guard set: a failed send is investigated, never auto-repeated
    // into the customer's inbox by the next Calendly retry.
    // But it must not stay silent either — support gets the link so a human
    // can send it by hand.
    await alertSupport(
      "Scan invite failed to send",
      [
        order.case_no ?? order.id,
        order.customer_email ?? "—",
        `Interview: ${when.date} at ${when.time} ${when.tz}`,
        `Error: ${e instanceof Error ? e.message : String(e)}`,
        `Scan link: ${scanUrl}`,
        "The send guard is set, so no retry will fire. Send the scan link by hand.",
      ],
      `calendly-alert-scan-invite-failed-${order.id}`,
    );
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = await resolveSecret();
  if (!secret) {
    return json(
      {
        error: "not_configured",
        message:
          "No Calendly signing secret. Set CALENDLY_WEBHOOK_SECRET in Project Settings → Secrets, or save the row 'calendly_webhook_secret' in the integration_secrets table.",
      },
      501,
    );
  }

  const rawBody = await req.text();
  const header = req.headers.get("Calendly-Webhook-Signature") ?? "";
  const parts = Object.fromEntries(
    header
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((p) => p.length === 2) as Array<[string, string]>,
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return json({ error: "missing_signature" }, 401);
  const skew = Math.abs(Date.now() / 1000 - Number(t));
  // Calendly's own recommendation: three-minute replay tolerance.
  if (!Number.isFinite(skew) || skew > 180) return json({ error: "stale_signature" }, 401);
  const expected = await signBody(secret, t, rawBody);
  if (!constantTimeEqual(expected, v1.toLowerCase())) return json({ error: "bad_signature" }, 401);

  let body: Record<string, any>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const event = typeof body.event === "string" ? body.event : "";
  if (event !== "invitee.created" && event !== "invitee.canceled") {
    return json({ ok: true, ignored: event });
  }

  const payload = (body.payload ?? {}) as Record<string, any>;
  const inviteeUri = typeof payload.uri === "string" ? payload.uri : null;
  const eventUri =
    typeof payload.event === "string"
      ? payload.event
      : typeof payload.scheduled_event?.uri === "string"
      ? payload.scheduled_event.uri
      : null;

  const order = await resolveOrder(payload);
  if (!order) {
    await supabase.from("calendly_unmatched").insert({
      event_type: event,
      invitee_uri: inviteeUri,
      event_uri: eventUri,
      email: typeof payload.email === "string" ? payload.email : null,
      reason: "no_case_match",
      payload: body,
    });
    const response = json({ ok: true, matched: false });
    void alertSupport("Calendly booking without a case number", [
      inviteeUri ?? "unknown invitee",
      `Event: ${event}`,
      `Email: ${payload.email ?? "—"}`,
      "Stored in calendly_unmatched. Attach it by hand — never guess the order.",
    ]);
    return response;
  }

  if (event === "invitee.canceled") {
    await supabase
      .from("bespoke_orders")
      .update({
        calendly_event_uri: null,
        calendly_invitee_uri: null,
        interview_at: null,
        interview_timezone: null,
      })
      .eq("id", order.id);
    await recordStage(supabase as any, order.id, "paid", "customer", {
      reason: "calendly_cancelled",
      invitee_uri: inviteeUri,
    });
    const response = json({ ok: true, matched: true, stage: "paid" });
    void alertSupport("Fitting interview cancelled", [
      order.case_no ?? order.id,
      `Invitee: ${payload.email ?? "—"}`,
      "The order is back at 'paid'. The scan link email is not re-sent.",
    ]);
    return response;
  }

  // invitee.created — idempotent on the invitee URI: the same booking delivered
  // twice writes once and emails once.
  if (inviteeUri && order.calendly_invitee_uri === inviteeUri) {
    return json({ ok: true, matched: true, duplicate: true });
  }

  const startIso: string =
    payload?.scheduled_event?.start_time ?? payload?.event?.start_time ?? new Date().toISOString();
  const timezone: string = payload?.timezone || payload?.scheduled_event?.timezone || "UTC";

  const { error: upErr } = await supabase
    .from("bespoke_orders")
    .update({
      calendly_event_uri: eventUri,
      calendly_invitee_uri: inviteeUri,
      interview_at: startIso,
      interview_timezone: timezone,
    })
    .eq("id", order.id);
  if (upErr) {
    console.error("[calendly-webhook] order update failed", upErr);
    return json({ error: "persist_failed" }, 500);
  }
  await recordStage(supabase as any, order.id, "interview_booked", "customer", {
    invitee_uri: inviteeUri,
    interview_at: startIso,
  });

  // The row is safe; the email goes out after the response so Calendly is not
  // kept waiting on our mail provider.
  const response = json({ ok: true, matched: true, stage: "interview_booked" });
  const after = sendScanInvite(order, startIso, timezone);
  // deno-lint-ignore no-explicit-any
  const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
  if (typeof waitUntil === "function") waitUntil(after);
  else await after;
  return response;
});
