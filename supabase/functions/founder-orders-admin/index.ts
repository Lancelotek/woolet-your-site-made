// Founder Edition orders paid on woolet.co (/en/founders) - admin list + dispatch.
// Orders live in Stripe: the paid PaymentIntent (metadata.flow = founder_edition)
// and its Checkout Session (shipping address, phone). Dispatch fields are kept in
// the PaymentIntent metadata, so no database table is needed. Same admin
// passwords as the Bespoke console.

import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

type Addr = Record<string, string | null | undefined>;

async function listOrders(stripe: any) {
  const out: Record<string, unknown>[] = [];
  let page: string | undefined;
  do {
    const res: any = await stripe.paymentIntents.search({
      query: "metadata['flow']:'founder_edition' AND status:'succeeded'",
      limit: 100,
      expand: ["data.latest_charge"],
      ...(page ? { page } : {}),
    });
    for (const pi of res.data) {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
      const s = sessions.data[0] ?? {};
      const cd = s.customer_details ?? {};
      const ship = s.collected_information?.shipping_details ?? s.shipping_details ?? pi.shipping ?? {};
      const a: Addr = ship.address ?? cd.address ?? {};
      const m = pi.metadata ?? {};
      const charge = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
      out.push({
        payment_intent: pi.id,
        session_id: s.id ?? null,
        order_ref: s.id ? `WLT-FE-${String(s.id).slice(-8).toUpperCase()}` : null,
        paid_at: new Date(pi.created * 1000).toISOString(),
        amount: pi.amount_received / 100,
        currency: String(pi.currency).toUpperCase(),
        refunded: (charge?.amount_refunded ?? 0) / 100,
        email: cd.email ?? null,
        name: ship.name ?? cd.name ?? null,
        phone: ship.phone ?? cd.phone ?? null,
        line1: a.line1 ?? null,
        line2: a.line2 ?? null,
        postal_code: a.postal_code ?? null,
        city: a.city ?? null,
        state: a.state ?? null,
        country: a.country ?? null,
        paid_source: m.paid_source ?? m.touch_source ?? null,
        courier: m.dispatch_courier ?? null,
        tracking_number: m.dispatch_tracking ?? null,
        shipped_at: m.dispatch_shipped_at ?? null,
        dispatch_note: m.dispatch_note ?? null,
        stripe_url: `https://dashboard.stripe.com/payments/${pi.id}`,
      });
    }
    page = res.has_more ? res.next_page : undefined;
  } while (page);
  out.sort((x, y) => String(y.paid_at).localeCompare(String(x.paid_at)));
  return out;
}

/** Shipping fields in MailerLite, for a "your frame is on its way" email. Never throws. */
async function syncMailerLite(email: string, fields: Record<string, string>) {
  const apiKey = Deno.env.get("MAILERLITE_API_KEY");
  if (!apiKey || !email) return;
  try {
    for (const name of Object.keys(fields)) {
      const f = await fetch("https://connect.mailerlite.com/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ name, type: "text" }),
      });
      await f.text();
    }
    const r = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ email, fields }),
    });
    await r.text();
  } catch (e) {
    console.error("[founder-orders-admin] mailerlite", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const provided = (body.password as string) ?? req.headers.get("x-admin-password") ?? "";
    const ok =
      (!!ADMIN_PASSWORD && provided === ADMIN_PASSWORD) ||
      (!!BESPOKE_PASSWORD && provided === BESPOKE_PASSWORD);
    if (!ok) return json({ error: "Invalid password" }, 401);

    const stripe = createStripeClient("live");

    if (body.action === "list") {
      return json({ orders: await listOrders(stripe) });
    }

    if (body.action === "dispatch") {
      const pi = clean(body.payment_intent, 80);
      if (!/^pi_[A-Za-z0-9]+$/.test(pi)) return json({ error: "invalid_id" }, 400);
      const current = await stripe.paymentIntents.retrieve(pi);
      if (current?.metadata?.flow !== "founder_edition") return json({ error: "not_founder_order" }, 400);
      let shippedAt = clean(body.shipped_at, 40);
      if (shippedAt) {
        const d = new Date(shippedAt);
        if (Number.isNaN(d.getTime())) return json({ error: "invalid_ship_date" }, 400);
        shippedAt = d.toISOString().slice(0, 10);
      }
      const meta = {
        dispatch_courier: clean(body.courier, 80),
        dispatch_tracking: clean(body.tracking_number, 120),
        dispatch_shipped_at: shippedAt,
        dispatch_note: clean(body.dispatch_note, 400),
      };
      await stripe.paymentIntents.update(pi, { metadata: meta });
      const email = clean(body.email, 200).toLowerCase();
      if (email && meta.dispatch_shipped_at) {
        await syncMailerLite(email, {
          founder_shipped_at: meta.dispatch_shipped_at,
          founder_courier: meta.dispatch_courier,
          founder_tracking: meta.dispatch_tracking,
        });
      }
      return json({ ok: true, saved_at: new Date().toISOString() });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    console.error("[founder-orders-admin]", err);
    return json({ error: "server_error" }, 500);
  }
});
