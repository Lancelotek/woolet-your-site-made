// Fallback store for a scan result that arrived without a `signedPayload`.
//
// These numbers come straight from a browser event, so they are recorded as
// `fitlens_client` / `unverified` and must never overwrite a webhook or signed
// row. They exist so the customer sees their own measurement and so the
// workshop knows the scan was reported but not verified.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { assignMeasurementRef, normalizeMeasurementRef } from "../_shared/measurement-ref.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown, min: number, max: number): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 10) / 10;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const scanId = typeof body.scanId === "string" ? body.scanId.slice(0, 200) : "";
  const sessionRef = typeof body.sessionRef === "string" ? body.sessionRef.slice(0, 100) : null;
  if (!scanId && !sessionRef) return json({ error: "missing_reference" }, 400);

  const m = (body.measurements ?? {}) as Record<string, unknown>;
  const templeToTemple = num(m.templeToTemple, 100, 200);
  const faceWidth = num(m.faceWidth, 100, 200);
  if (templeToTemple === null && faceWidth === null) return json({ error: "no_measurements" }, 422);

  if (scanId) {
    const { data: existing } = await supabase
      .from("bespoke_scan_profiles")
      .select("id, source")
      .eq("scan_id", scanId)
      .maybeSingle();
    if (existing && existing.source !== "fitlens_client") {
      return json({ ok: true, scanId, source: existing.source });
    }
  }

  const row = {
    scan_id: scanId || `client-${crypto.randomUUID()}`,
    source: "fitlens_client",
    session_ref: sessionRef,
    temple_to_temple_mm: templeToTemple,
    face_width_mm: faceWidth ?? templeToTemple,
    pd_mm: num(m.pd, 40, 90),
    nose_bridge_width_mm: num(m.bridge ?? m.noseBridge, 5, 60),
    semantics_version: typeof body.semanticsVersion === "string" ? body.semanticsVersion : "current",
    confidence_tier: typeof body.tier === "string" ? body.tier.toLowerCase() : null,
    spread_mm: num(body.spreadMm, 0, 100),
    confidence: {},
    raw_payload: body,
    raw_frames: {},
    capture_method: "fitlens",
    status: "unverified",
  };

  const { error } = await supabase
    .from("bespoke_scan_profiles")
    .upsert(row, { onConflict: "scan_id" });
  if (error) {
    console.error("[fitlens-scan-client] persist failed", error);
    return json({ error: "persist_failed" }, 500);
  }

  const measurementRef = await assignMeasurementRef(supabase, row.scan_id);

  // Production rule: an unsigned number never becomes a production number.
  // The row is kept so the customer sees what the widget reported and so we can
  // tell a failed scan from no scan at all, but it is deliberately NOT attached
  // to a bespoke order and never moves `bespoke_orders.scan_id`. Only
  // `measure-attach` (signature verified against FitLens's JWKS) does that.
  const clientRef = normalizeMeasurementRef(body.reference);
  if (clientRef) {
    const { data: prior } = await supabase
      .from("bespoke_scan_profiles")
      .select("id")
      .eq("measurement_ref", clientRef)
      .maybeSingle();
    if (!prior) return json({ error: "unknown_reference", scanId: row.scan_id, measurementRef }, 404);
  }

  return json({
    ok: true,
    scanId: row.scan_id,
    measurementRef,
    source: "fitlens_client",
    status: "unverified",
    accepted_for_production: false,
  });
});
