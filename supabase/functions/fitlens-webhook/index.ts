// FitLens server-to-server webhook.
//
// This is the trustworthy path: FitLens POSTs the measurement here and signs
// the body with a shared secret, so nothing a browser can forge reaches the
// workshop. The browser `fitlens:result` event remains a convenience for the
// UI only.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { qualityVerdict } from "../_shared/fitlens-quality.ts";
import { assignMeasurementRef, normalizeMeasurementRef } from "../_shared/measurement-ref.ts";
import { formatMrNo } from "../_shared/bespoke-case.ts";
import { recordStage } from "../_shared/bespoke-stage.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown): number | null => {
  // null means "not measured" and must survive as null — never coerce to 0.
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

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
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  return toHex(mac);
}

// Where the shared signing secret lives. The environment variable is the
// preferred home; the `integration_secrets` table is a fallback for plans where
// secrets cannot be added. Public-key verification against FitLens's JWKS would
// remove the shared secret entirely and is the better long-term answer.
let cachedSecret: string | null = null;

async function resolveWebhookSecret(): Promise<string | null> {
  if (cachedSecret) return cachedSecret;
  const fromEnv = Deno.env.get("FITLENS_WEBHOOK_SECRET");
  if (fromEnv) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }
  // RLS is on with no policies, so only this service-role client can read it.
  const { data } = await supabase
    .from("integration_secrets")
    .select("value")
    .eq("name", "fitlens_webhook_secret")
    .maybeSingle();
  const value = typeof data?.value === "string" && data.value ? data.value : null;
  if (value) cachedSecret = value;
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = await resolveWebhookSecret();
  if (!secret) {
    return json(
      {
        error: "not_configured",
        message:
          "No FitLens signing secret. Set FITLENS_WEBHOOK_SECRET in Project Settings → Secrets, or save the row 'fitlens_webhook_secret' in the integration_secrets table from the Bespoke admin panel.",
      },
      501,
    );
  }


  const rawBody = await req.text();

  // Signature: X-FitLens-Signature: t=<unix>,v1=<hex>
  const header = req.headers.get("X-FitLens-Signature") ?? "";
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
  if (!Number.isFinite(skew) || skew > 300) return json({ error: "stale_signature" }, 401);

  const expected = await signBody(secret, t, rawBody);
  if (!constantTimeEqual(expected, v1.toLowerCase())) return json({ error: "bad_signature" }, 401);

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const scanId = typeof payload.scanId === "string" ? payload.scanId.slice(0, 200) : "";
  if (!scanId) return json({ error: "missing_scan_id" }, 422);

  const m = (payload.measurementsMm ?? {}) as Record<string, unknown>;
  const templeToTemple = num(m.templeToTemple);
  const faceWidth = num(m.faceWidth);
  if (templeToTemple === null && faceWidth === null) {
    return json({ error: "missing_fit_measurement", scanId }, 422);
  }

  // faceWidth is an alias of templeToTemple since the 2026-09-08 cutover; if
  // the two disagree we keep both and flag the row rather than pick a winner.
  const inconsistent =
    templeToTemple !== null && faceWidth !== null && Math.abs(templeToTemple - faceWidth) > 1;
  const fitMm = templeToTemple ?? faceWidth;

  const createdAt = typeof payload.createdAt === "string" ? Date.parse(payload.createdAt) : NaN;
  const cutover = Date.parse(Deno.env.get("FITLENS_SEMANTICS_CUTOVER") ?? "2026-09-08T00:00:00Z");
  const semanticsVersion =
    Number.isFinite(createdAt) && Number.isFinite(cutover) && createdAt < cutover ? "legacy" : "current";

  const confidence = (payload.confidence ?? {}) as Record<string, unknown>;
  const tier = typeof confidence.tier === "string" ? confidence.tier.toLowerCase() : null;
  const spreadMm = num(confidence.spreadMm);
  const raw = (payload.raw ?? {}) as Record<string, any>;
  const yaw = num(raw?.headPoseDeg?.yaw);

  const status = inconsistent
    ? "inconsistent"
    : qualityVerdict({ tier, spreadMm, templeToTempleMm: fitMm, yawDeg: yaw, semanticsVersion });

  const client = (payload.client ?? {}) as Record<string, unknown>;
  const sessionId = typeof client.sessionId === "string" ? client.sessionId : null;
  // Fallback for a customer who scanned outside our link and quoted their
  // measurement reference instead. FitLens has not shipped the field that would
  // carry this yet — the path below is ready and waiting on the partner.
  const clientRef = normalizeMeasurementRef(client.reference);

  // "Producer code" — the case number the customer types into FitLens when the
  // scan was taken outside our link. FitLens has not settled on one field name,
  // so every plausible spelling is read; only a well-formed case number counts.
  const caseNoFromPayload = (() => {
    const candidates = [
      client.producerCode,
      client.producer_code,
      client.code,
      client.caseNo,
      client.reference,
      payload.producerCode,
      payload.producer_code,
      payload.code,
      payload.reference,
    ];
    for (const raw of candidates) {
      if (typeof raw !== "string") continue;
      const value = raw.trim().toUpperCase().replace(/\s+/g, "");
      if (/^WLT-BSP-\d{4}-\d{4}$/.test(value)) return value;
    }
    return null;
  })();

  // Idempotent on scan_id — the partner retries, and a retry must not create a
  // second row or a second downstream notification.
  const { data: existing } = await supabase
    .from("bespoke_scan_profiles")
    .select("id, source")
    .eq("scan_id", scanId)
    .maybeSingle();

  if (existing) return json({ ok: true, scanId });

  const { error } = await supabase.from("bespoke_scan_profiles").upsert(
    {
      scan_id: scanId,
      source: "fitlens_webhook",
      session_ref: sessionId,
      email: typeof client.email === "string" ? client.email : null,
      temple_to_temple_mm: templeToTemple,
      face_width_mm: faceWidth ?? templeToTemple,
      pd_mm: num(m.pd),
      pd_left_mm: num(m.pdLeft),
      pd_right_mm: num(m.pdRight),
      nose_bridge_width_mm: num(m.noseBridge),
      payload_version: typeof payload.payloadVersion === "string" ? payload.payloadVersion : null,
      semantics_version: semanticsVersion,
      confidence_tier: tier,
      spread_mm: spreadMm,
      confidence: confidence as Record<string, unknown>,
      raw_payload: payload,
      raw_frames: {},
      capture_method: "fitlens",
      status,
    },
    { onConflict: "scan_id" },
  );
  if (error) {
    console.error("[fitlens-webhook] persist failed", error);
    return json({ error: "persist_failed" }, 500);
  }

  const measurementRef = await assignMeasurementRef(supabase, scanId);

  // Answer as soon as the row is safe; attaching it to an order is follow-up
  // work the partner should not have to wait for.
  const response = json({ ok: true, scanId, measurementRef });
  const attach = async () => {
    try {
      let orderId: string | null = null;
      // A scan started from the emailed link carries the case number as its
      // session id — that is the strongest binding we have.
      if (sessionId && /^WLT-BSP-\d{4}-\d{4}$/i.test(sessionId.trim())) {
        const { data: caseOrder } = await supabase
          .from("bespoke_orders")
          .select("id")
          .eq("case_no", sessionId.trim().toUpperCase())
          .maybeSingle();
        orderId = caseOrder?.id ?? null;
      }
      if (!orderId && sessionId) {
        const { data: order } = await supabase
          .from("bespoke_orders")
          .select("id")
          .eq("session_ref", sessionId)
          .maybeSingle();
        orderId = order?.id ?? null;
      }
      if (!orderId && sessionId) {
        // Fallback: the scan-context row written when the customer opened the
        // link, for a widget that rewrote the session id.
        const { data: ctx } = await supabase
          .from("bespoke_scan_contexts")
          .select("order_id")
          .eq("session_ref", sessionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        orderId = ctx?.order_id ?? null;
      }
      if (!orderId && clientRef) {
        // A known reference, or nothing — never a guess.
        const { data: prior } = await supabase
          .from("bespoke_scan_profiles")
          .select("order_id, session_ref")
          .eq("measurement_ref", clientRef)
          .maybeSingle();
        if (prior?.order_id) orderId = prior.order_id;
        if (prior?.session_ref) {
          await supabase
            .from("bespoke_scan_profiles")
            .update({ session_ref: prior.session_ref })
            .eq("scan_id", scanId);
        }
      }
      if (!orderId) return;
      await supabase.from("bespoke_scan_profiles").update({ order_id: orderId }).eq("scan_id", scanId);
      // The order points at the most recent scan; older ones stay reachable
      // through order_id / session_ref.
      const { data: orderRow } = await supabase
        .from("bespoke_orders")
        .select("id, case_seq, mr_no")
        .eq("id", orderId)
        .maybeSingle();
      // The Measurement Report shares the case's suffix — one counter per case,
      // never a second sequence.
      const mrNo = orderRow?.mr_no ??
        (orderRow?.case_seq ? formatMrNo(new Date().getUTCFullYear(), orderRow.case_seq) : null);
      await supabase
        .from("bespoke_orders")
        .update({ scan_id: scanId, ...(mrNo ? { mr_no: mrNo } : {}) })
        .eq("id", orderId);
      await recordStage(supabase as any, orderId, "scan_received", "customer", {
        scan_id: scanId,
        source: "fitlens_webhook",
      });
    } catch (e) {
      console.error("[fitlens-webhook] order attach failed", e);
    }
  };
  if (sessionId || clientRef) {
    // deno-lint-ignore no-explicit-any
    const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
    if (typeof waitUntil === "function") waitUntil(attach());
    else await attach();
  }
  return response;
});
