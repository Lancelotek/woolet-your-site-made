// The one deliberate step: exchange the invitation token for a short measuring
// session. This is the only call that consumes an invitation, and it consumes
// it atomically — a single conditional UPDATE, so two clicks cannot both win.
//
// Every refusal leaves the invitation untouched.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  hasPepper,
  hashSession,
  hashToken,
  originAllowed,
  randomToken,
  verifyCsrf,
} from "../_shared/measure-invite.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const SESSION_MINUTES = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!hasPepper()) return json({ status: "unavailable" }, 503);
  if (!originAllowed(req)) return json({ status: "unavailable" }, 403);

  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return json({ status: "unavailable" }, 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const csrf = typeof body.csrf === "string" ? body.csrf : "";
  const consent = body.consent ?? {};
  if (!/^[0-9a-f]{40,128}$/i.test(token)) return json({ status: "unavailable" }, 400);
  if (consent?.accepted !== true) return json({ status: "consent_required" }, 400);

  const tokenHash = await hashToken(token);
  if (!(await verifyCsrf(tokenHash, csrf))) return json({ status: "unavailable" }, 403);

  const sessionToken = randomToken(32);
  const now = new Date();
  const sessionExpires = new Date(now.getTime() + SESSION_MINUTES * 60_000);

  // Atomic consume: the WHERE clause is the guard. If it matches nothing, the
  // invitation was already used, revoked or expired and nothing changed.
  const { data: consumed } = await admin
    .from("bespoke_measure_invites")
    .update({
      used_at: now.toISOString(),
      session_hash: await hashSession(sessionToken),
      session_expires_at: sessionExpires.toISOString(),
      consent_at: now.toISOString(),
      consent_version: typeof consent.version === "string" ? consent.version.slice(0, 40) : "measure-v1",
      consent_locale: typeof consent.locale === "string" ? consent.locale.slice(0, 5) : "en",
    })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .is("revoked_at", null)
    .gt("expires_at", now.toISOString())
    .select("id, order_id")
    .maybeSingle();

  if (!consumed) return json({ status: "unavailable" }, 409);

  return json({
    status: "ready",
    sessionToken,
    expiresAt: sessionExpires.toISOString(),
    orderReference: `WLT-${String(consumed.order_id).slice(0, 8).toUpperCase()}`,
  });
});
