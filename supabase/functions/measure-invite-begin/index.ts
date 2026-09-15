// Scanner-safe first step: tell the page whether an invitation can still be
// used and hand out a CSRF value bound to it. Nothing here consumes anything —
// mail scanners open links, and an opened link must stay usable.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { hasPepper, hashToken, issueCsrf, originAllowed } from "../_shared/measure-invite.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!hasPepper()) return json({ status: "unavailable" });
  if (!originAllowed(req)) return json({ status: "unavailable" });

  let token = "";
  try {
    const body = await req.json();
    token = typeof body?.token === "string" ? body.token.trim() : "";
  } catch {
    return json({ status: "unavailable" });
  }
  if (!/^[0-9a-f]{40,128}$/i.test(token)) return json({ status: "unavailable" });

  const tokenHash = await hashToken(token);
  const { data: invite } = await admin
    .from("bespoke_measure_invites")
    .select("id, order_id, expires_at, used_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  // Invalid, revoked, expired and already-used all answer identically: the page
  // must not reveal which of them is true.
  const usable =
    invite && !invite.used_at && !invite.revoked_at && Date.parse(invite.expires_at) > Date.now();
  if (!usable) return json({ status: "unavailable" });

  const { data: order } = await admin
    .from("bespoke_orders")
    .select("id, customer_name")
    .eq("id", invite.order_id)
    .maybeSingle();

  return json({
    status: "ready",
    csrf: await issueCsrf(tokenHash),
    // Nothing identifying beyond a first name and our own order reference.
    firstName: (order?.customer_name ?? "").split(" ")[0] || null,
    orderReference: `WLT-${String(invite.order_id).slice(0, 8).toUpperCase()}`,
  });
});
