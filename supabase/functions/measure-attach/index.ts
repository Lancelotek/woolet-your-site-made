// Attach a FitLens result to the order behind an active measuring session.
//
// The browser never says which order this is: the order comes from the session
// token, which came from a consumed invitation. A result is written only when
// FitLens actually signed it — a missing, null or unverifiable signature is
// refused and nothing is stored. That is the production rule for Woolet and it
// fails closed.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { qualityVerdict } from "../_shared/fitlens-quality.ts";
import { assignMeasurementRef } from "../_shared/measurement-ref.ts";
import { hasPepper, hashSession, originAllowed } from "../_shared/measure-invite.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const getJwks = () => {
  if (!jwks) {
    const url = Deno.env.get("FITLENS_JWKS_URL") ?? "https://app.fitlens.online/v1/keys";
    jwks = createRemoteJWKSet(new URL(url), { cacheMaxAge: 60 * 60 * 1000, cooldownDuration: 30 * 1000 });
  }
  return jwks;
};

const FRESHNESS_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!hasPepper()) return json({ error: "unavailable" }, 503);
  if (!originAllowed(req)) return json({ error: "forbidden" }, 403);

  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken.trim() : "";
  if (!/^[0-9a-f]{40,128}$/i.test(sessionToken)) return json({ error: "session_invalid" }, 401);

  const { data: invite } = await admin
    .from("bespoke_measure_invites")
    .select("id, order_id, session_expires_at, measurement_scan_id")
    .eq("session_hash", await hashSession(sessionToken))
    .maybeSingle();
  if (!invite || !invite.session_expires_at || Date.parse(invite.session_expires_at) < Date.now()) {
    return json({ error: "session_expired" }, 401);
  }

  const result = body.result ?? {};
  const token =
    typeof result.signedPayload === "string"
      ? result.signedPayload
      : typeof body.signedPayload === "string"
        ? body.signedPayload
        : "";
  if (!token) return json({ error: "signature_missing" }, 422);
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return json({ error: "signature_invalid" }, 422);

  let claims: Record<string, any>;
  try {
    const verified = await jwtVerify(token, getJwks(), { issuer: "fitlens" });
    claims = verified.payload as Record<string, any>;
  } catch (e) {
    console.warn("[measure-attach] signature refused", (e as Error).message);
    return json({ error: "signature_invalid" }, 422);
  }

  const expectedOrg = Deno.env.get("FITLENS_ORG_ID");
  if (expectedOrg && claims.orgId && String(claims.orgId) !== expectedOrg) {
    return json({ error: "signature_invalid" }, 422);
  }

  const scanId = typeof claims.sub === "string" ? claims.sub : typeof claims.scanId === "string" ? claims.scanId : "";
  if (!scanId) return json({ error: "signature_invalid" }, 422);

  // Freshness by our own policy: a signed result older than fifteen minutes did
  // not come from the measurement the customer just took.
  const recorded = Date.parse(claims.recordedAt ?? claims.createdAt ?? "");
  const issued = typeof claims.iat === "number" ? claims.iat * 1000 : NaN;
  const stamp = Number.isFinite(recorded) ? recorded : issued;
  if (Number.isFinite(stamp) && Math.abs(Date.now() - stamp) > FRESHNESS_MS) {
    return json({ error: "signature_stale" }, 422);
  }

  // Idempotent: the same measurementId retried after a timeout returns the
  // earlier success and writes nothing twice.
  const { data: existing } = await admin
    .from("bespoke_scan_profiles")
    .select("id, order_id, measurement_ref")
    .eq("scan_id", scanId)
    .maybeSingle();
  if (existing && existing.order_id && existing.order_id !== invite.order_id) {
    return json({ error: "forbidden" }, 403);
  }
  if (existing) {
    return json({ ok: true, scanId, measurementRef: existing.measurement_ref, source: "fitlens_signed" });
  }

  const m = (claims.measurementsMm ?? claims.measurements ?? {}) as Record<string, unknown>;
  const templeToTemple = num(m.templeToTemple);
  const faceWidth = num(m.faceWidth);
  if (templeToTemple === null && faceWidth === null) return json({ error: "no_measurements" }, 422);

  const confidence = (claims.confidence ?? {}) as Record<string, unknown>;
  const tier = typeof confidence.tier === "string" ? confidence.tier.toLowerCase() : null;
  const spreadMm = num(confidence.spreadMm);
  const cutover = Date.parse(Deno.env.get("FITLENS_SEMANTICS_CUTOVER") ?? "2026-09-08T00:00:00Z");
  const semanticsVersion =
    Number.isFinite(stamp) && Number.isFinite(cutover) && stamp < cutover ? "legacy" : "current";

  const { error } = await admin.from("bespoke_scan_profiles").upsert(
    {
      scan_id: scanId,
      source: "fitlens_signed",
      order_id: invite.order_id,
      temple_to_temple_mm: templeToTemple,
      face_width_mm: faceWidth ?? templeToTemple,
      pd_mm: num(m.pd),
      pd_left_mm: num(m.pdLeft),
      pd_right_mm: num(m.pdRight),
      // Eye corner to eye corner — a face measurement, never a frame bridge.
      nose_bridge_width_mm: num(m.noseBridge),
      payload_version: typeof claims.algorithmVersion === "string" ? claims.algorithmVersion : null,
      semantics_version: semanticsVersion,
      confidence_tier: tier,
      spread_mm: spreadMm,
      confidence: confidence as Record<string, unknown>,
      raw_payload: claims,
      raw_frames: {},
      capture_method: "fitlens",
      status: qualityVerdict({ tier, spreadMm, templeToTempleMm: templeToTemple ?? faceWidth, semanticsVersion }),
    },
    { onConflict: "scan_id" },
  );
  if (error) {
    console.error("[measure-attach] persist failed", error);
    return json({ error: "persist_failed" }, 500);
  }

  const measurementRef = await assignMeasurementRef(admin, scanId);
  await admin.from("bespoke_orders").update({ scan_id: scanId }).eq("id", invite.order_id);
  await admin.from("bespoke_measure_invites").update({ measurement_scan_id: scanId }).eq("id", invite.id);

  return json({ ok: true, scanId, measurementRef, source: "fitlens_signed" });
});
