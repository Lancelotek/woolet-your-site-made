// Issue a one-time measurement invitation for one bespoke order and email it.
//
// Admin-only (the bespoke console password). The plain token leaves this
// function exactly twice: in the email link and in the response shown to the
// operator. The database keeps only its hash.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as baseCors } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { hasPepper, hashToken, randomToken } from "../_shared/measure-invite.ts";

const corsHeaders = { ...baseCors, "Access-Control-Allow-Headers": `${baseCors["Access-Control-Allow-Headers"] ?? "authorization, x-client-info, apikey, content-type"}, x-admin-password` };

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVITE_TTL_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!hasPepper()) return json({ error: "missing_pepper" }, 501);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const accepted = [Deno.env.get("ADMIN_CRM_PASSWORD"), Deno.env.get("BESPOKE_ADMIN_PASSWORD")].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const supplied =
    (typeof body.password === "string" ? body.password : "") || (req.headers.get("x-admin-password") ?? "");
  if (accepted.length === 0 || !accepted.includes(supplied)) return json({ error: "unauthorized" }, 401);

  const action = body.action === "revoke" ? "revoke" : body.action === "list" ? "list" : "create";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!UUID_RE.test(orderId)) return json({ error: "invalid_order" }, 400);

  const { data: order } = await admin
    .from("bespoke_orders")
    .select("id, customer_email, customer_name")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return json({ error: "not_found" }, 404);

  if (action === "revoke") {
    await admin
      .from("bespoke_measure_invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("revoked_at", null)
      .is("used_at", null);
  }

  if (action === "create") {
    // Re-issuing invalidates every earlier live invitation for this order.
    await admin
      .from("bespoke_measure_invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .is("revoked_at", null)
      .is("used_at", null);

    const token = randomToken(32);
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400_000);
    const { error } = await admin.from("bespoke_measure_invites").insert({
      order_id: orderId,
      token_hash: await hashToken(token),
      expires_at: expiresAt.toISOString(),
      sent_to: order.customer_email,
    });
    if (error) {
      console.error("[measure-invite-create] insert failed", error);
      return json({ error: "create_failed" }, 500);
    }

    const siteOrigin = (Deno.env.get("WOOLET_APP_ORIGIN") ?? "https://woolet.co").split(",")[0].trim();
    const url = `${siteOrigin}/en/measure?invite=${token}`;
    const orderReference = `WLT-${String(order.id).slice(0, 8).toUpperCase()}`;

    if (body.sendEmail !== false && order.customer_email) {
      try {
        await sendTemplateEmailAndLog("bespoke-measure-invite", order.customer_email, {
          templateData: {
            customerName: order.customer_name ?? null,
            orderReference,
            invitationUrl: url,
            expiresAt: expiresAt.toISOString().slice(0, 10),
          },
          idempotencyKey: `measure-invite-${orderId}-${expiresAt.getTime()}`,
        });
      } catch (e) {
        console.error("[measure-invite-create] email failed", e);
      }
    }

    return json({ ok: true, url, expiresAt: expiresAt.toISOString(), orderReference });
  }

  const { data: invites } = await admin
    .from("bespoke_measure_invites")
    .select("id, created_at, expires_at, used_at, revoked_at, measurement_scan_id, sent_to")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(10);

  return json({ ok: true, invites: invites ?? [] });
});
