// Verifies the `signedPayload` JWT that FitLens puts inside the browser
// `fitlens:result` event.
//
// The event itself proves nothing — anyone can dispatch it from a console. The
// JWT is signed by FitLens and checked here against their published JWKS, so a
// verified row can be trusted. A webhook row always wins over a signed one.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { qualityVerdict } from "../_shared/fitlens-quality.ts";

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
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Cached across invocations of a warm isolate: keys are rotated rarely, and
// jose refetches by itself when it meets an unknown `kid`.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const getJwks = () => {
  if (!jwks) {
    const url = Deno.env.get("FITLENS_JWKS_URL") ?? "https://app.fitlens.online/v1/keys";
    jwks = createRemoteJWKSet(new URL(url), {
      cacheMaxAge: 60 * 60 * 1000,
      cooldownDuration: 30 * 1000,
    });
  }
  return jwks;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { signedPayload?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const token = typeof body.signedPayload === "string" ? body.signedPayload : "";
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return json({ error: "invalid_token" }, 401);

  let claims: Record<string, any>;
  try {
    // jwtVerify enforces `exp` for us and refetches the key set once when the
    // token carries a `kid` the cache has not seen.
    const result = await jwtVerify(token, getJwks());
    claims = result.payload as Record<string, any>;
  } catch (e) {
    console.warn("[fitlens-verify-result] verification failed", (e as Error).message);
    return json({ error: "verification_failed" }, 401);
  }

  const scanId =
    typeof claims.scanId === "string"
      ? claims.scanId
      : typeof claims.measurementId === "string"
        ? claims.measurementId
        : "";
  if (!scanId) return json({ error: "missing_scan_id" }, 422);

  const m = (claims.measurementsMm ?? claims.measurements ?? {}) as Record<string, unknown>;
  const templeToTemple = num(m.templeToTemple);
  const faceWidth = num(m.faceWidth);
  const fitMm = templeToTemple ?? faceWidth;

  const confidence = (claims.confidence ?? {}) as Record<string, unknown>;
  const tier = typeof confidence.tier === "string" ? confidence.tier.toLowerCase() : null;
  const spreadMm = num(confidence.spreadMm);
  const createdAt = typeof claims.createdAt === "string" ? Date.parse(claims.createdAt) : NaN;
  const cutover = Date.parse(Deno.env.get("FITLENS_SEMANTICS_CUTOVER") ?? "2026-09-08T00:00:00Z");
  const semanticsVersion =
    Number.isFinite(createdAt) && Number.isFinite(cutover) && createdAt < cutover ? "legacy" : "current";

  // The webhook is the stronger source: never downgrade a row it wrote.
  const { data: existing } = await supabase
    .from("bespoke_scan_profiles")
    .select("id, source")
    .eq("scan_id", scanId)
    .maybeSingle();

  if (existing?.source === "fitlens_webhook") {
    return json({ ok: true, scanId, source: "fitlens_webhook", claims });
  }

  const sessionRef = typeof claims.sessionId === "string" ? claims.sessionId : null;
  const { error } = await supabase.from("bespoke_scan_profiles").upsert(
    {
      scan_id: scanId,
      source: "fitlens_signed",
      session_ref: sessionRef,
      temple_to_temple_mm: templeToTemple,
      face_width_mm: faceWidth ?? templeToTemple,
      pd_mm: num(m.pd),
      pd_left_mm: num(m.pdLeft),
      pd_right_mm: num(m.pdRight),
      nose_bridge_width_mm: num(m.noseBridge),
      payload_version: typeof claims.payloadVersion === "string" ? claims.payloadVersion : null,
      semantics_version: semanticsVersion,
      confidence_tier: tier,
      spread_mm: spreadMm,
      confidence: confidence as Record<string, unknown>,
      raw_payload: claims,
      raw_frames: {},
      capture_method: "fitlens",
      status: qualityVerdict({
        tier,
        spreadMm,
        templeToTempleMm: fitMm,
        yawDeg: num((claims.raw as any)?.headPoseDeg?.yaw),
        semanticsVersion,
      }),
    },
    { onConflict: "scan_id" },
  );
  if (error) {
    console.error("[fitlens-verify-result] persist failed", error);
    return json({ error: "persist_failed" }, 500);
  }

  if (sessionRef) {
    try {
      const { data: order } = await supabase
        .from("bespoke_orders")
        .select("id")
        .eq("session_ref", sessionRef)
        .maybeSingle();
      if (order) {
        await supabase.from("bespoke_scan_profiles").update({ order_id: order.id }).eq("scan_id", scanId);
        await supabase.from("bespoke_orders").update({ scan_id: scanId }).eq("id", order.id);
      }
    } catch (e) {
      console.error("[fitlens-verify-result] order attach failed", e);
    }
  }

  return json({ ok: true, scanId, source: "fitlens_signed", claims });
});
