// Hourly job (pg_cron). A paid Bespoke order that still has no complete,
// valid shipping address or phone 48 h after payment gets ONE reminder to the
// customer (link to the private shipping form) and ONE alert to support@woolet.co.
//
// Idempotent: a sent reminder is logged in bespoke_crm_events and the email
// sends carry a per-order idempotency key, so a replayed run sends nothing.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";
import { validateShipping, type ShippingField } from "../_shared/shipping-validate.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const SITE_ORIGIN = "https://woolet.co";
const WAIT_HOURS = 48;
// Older orders were handled by hand before this job existed - leave them alone.
const LOOKBACK_DAYS = 14;
const REMINDER_NOTE = "Shipping reminder sent";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Order = Record<string, any>;

/** What is still missing, in customer words. Empty = nothing to chase. */
export function missingShippingParts(o: Order): string[] {
  const checked = validateShipping({
    name: o.shipping_name,
    phone: o.shipping_phone,
    line1: o.shipping_line1,
    line2: o.shipping_line2,
    city: o.shipping_city,
    state: o.shipping_state,
    postal_code: o.shipping_postal_code,
    country: o.shipping_country,
  });
  const bad = new Set<ShippingField>(checked.errors);
  const parts: string[] = [];
  if (bad.has("phone")) parts.push("a phone number");
  if ([...bad].some((f) => f !== "phone")) parts.push("a full shipping address");
  if (!parts.length && !o.shipping_submitted_at) parts.push("a confirmed shipping address");
  return parts;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const now = Date.now();
    const olderThan = new Date(now - WAIT_HOURS * 3600_000).toISOString();
    const newerThan = new Date(now - LOOKBACK_DAYS * 86_400_000).toISOString();

    const { data: orders, error } = await db
      .from("bespoke_orders")
      .select(
        "id, case_no, shipping_token, stripe_session_id, customer_email, customer_name, stage, environment, created_at, shipped_at, shipping_submitted_at, shipping_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country",
      )
      .lt("created_at", olderThan)
      .gt("created_at", newerThan)
      .is("shipped_at", null)
      .or("environment.is.null,environment.neq.sandbox");
    if (error) throw error;

    const due = ((orders ?? []) as Order[])
      .filter((o) => o.stage !== "cancelled" && o.customer_email)
      .map((o) => ({ o, missing: missingShippingParts(o) }))
      .filter((x) => x.missing.length > 0);
    if (!due.length) return json({ ok: true, checked: orders?.length ?? 0, reminded: 0 });

    const { data: logged } = await db
      .from("bespoke_crm_events")
      .select("order_id")
      .in("order_id", due.map((x) => x.o.id))
      .like("note", `${REMINDER_NOTE}%`);
    const already = new Set(((logged ?? []) as { order_id: string }[]).map((r) => r.order_id));

    let reminded = 0;
    for (const { o, missing } of due) {
      if (already.has(o.id)) continue;
      const ref = o.case_no ?? `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
      const shippingUrl = o.case_no && o.shipping_token
        ? `${SITE_ORIGIN}/en/bespoke/shipping?ref=${encodeURIComponent(o.case_no)}&t=${o.shipping_token}`
        : `${SITE_ORIGIN}/en/bespoke/measurements?sid=${encodeURIComponent(o.stripe_session_id ?? "")}`;

      try {
        await sendTemplateEmailAndLog("bespoke-shipping-reminder", o.customer_email, {
          idempotencyKey: `bespoke-shipping-reminder-${o.id}`,
          templateData: {
            customerName: (o.customer_name ?? "").split(" ")[0] || null,
            orderReference: ref,
            missing,
            shippingUrl,
          },
        });
        await sendTemplateEmailAndLog("bespoke-support-alert", undefined, {
          idempotencyKey: `bespoke-shipping-alert-${o.id}`,
          templateData: {
            heading: `${ref}: shipping details missing after ${WAIT_HOURS} h`,
            lines: [
              `Customer: ${o.customer_name ?? "-"} <${o.customer_email}>`,
              `Missing: ${missing.join(", ")}`,
              "The customer has been sent one reminder with the shipping form link.",
              `${SITE_ORIGIN}/en/admin/bespoke`,
            ],
          },
        });
        await db.from("bespoke_crm_events").insert({
          order_id: o.id,
          from_stage: null,
          to_stage: null,
          note: `${REMINDER_NOTE} (missing: ${missing.join(", ")})`,
          created_by: "system",
        });
        reminded++;
      } catch (e) {
        console.error("[bespoke-shipping-reminder] send failed", o.id, e);
      }
    }

    return json({ ok: true, checked: orders?.length ?? 0, due: due.length, reminded });
  } catch (err) {
    console.error("[bespoke-shipping-reminder]", err);
    return json({ error: "server_error" }, 500);
  }
});
