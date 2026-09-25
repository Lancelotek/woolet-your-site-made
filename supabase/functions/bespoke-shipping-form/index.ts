// Customer-facing Bespoke shipping form. Opens only when the case number (ref)
// AND the per-order shipping_token (t) match the same order. Returns just the
// fields the form needs; saves the address + consent and logs a CRM event.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

export const CONSENT_VERSION = "shipping-v1-2026-09";
export const CONSENT_TEXT =
  "I agree that Woolet (JAY23 LLC) uses this address and phone number to ship my order, and shares them with the courier and our workshop in Greece for the shipping label and customs documents.";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REF_RE = /^WLT-BSP-\d{4}-\d{4,6}$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const MAX_SAVES_PER_HOUR = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const clean = (v: unknown, max: number) => {
  if (v == null) return "";
  return String(v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
};

const PUBLIC_COLS =
  "case_no, frame_name, front_code, customer_name, shipping_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_submitted_at";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const ref = clean(body.ref, 40).toUpperCase();
    const token = clean(body.t, 40);
    if (!REF_RE.test(ref) || !UUID_RE.test(token)) return json({ error: "invalid_link" }, 404);

    const { data: order, error } = await admin
      .from("bespoke_orders")
      .select(`id, shipping_form_attempts, ${PUBLIC_COLS}`)
      .eq("case_no", ref)
      .eq("shipping_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: "invalid_link" }, 404);

    const { id, shipping_form_attempts, ...pub } = order as Record<string, any>;

    if (body.action !== "save") {
      return json({ order: pub, consent_text: CONSENT_TEXT, consent_version: CONSENT_VERSION });
    }

    // Rate limit per token: at most N saves in the last hour.
    const now = Date.now();
    const recent = (Array.isArray(shipping_form_attempts) ? shipping_form_attempts : [])
      .map((t: unknown) => Date.parse(String(t)))
      .filter((t: number) => Number.isFinite(t) && now - t < 3600_000);
    if (recent.length >= MAX_SAVES_PER_HOUR) return json({ error: "rate_limited" }, 429);

    const f = (body.fields ?? {}) as Record<string, unknown>;
    const v = {
      shipping_name: clean(f.name, 120),
      shipping_phone: clean(f.phone, 40),
      shipping_line1: clean(f.line1, 200),
      shipping_line2: clean(f.line2, 200),
      shipping_city: clean(f.city, 120),
      shipping_state: clean(f.state, 120),
      shipping_postal_code: clean(f.postal_code, 20),
      shipping_country: clean(f.country, 2).toUpperCase(),
    };
    const errors: string[] = [];
    if (v.shipping_name.length < 2) errors.push("name");
    if (!/^\+[\d\s().-]{6,30}$/.test(v.shipping_phone) || v.shipping_phone.replace(/\D/g, "").length < 7) errors.push("phone");
    if (v.shipping_line1.length < 3) errors.push("line1");
    if (v.shipping_city.length < 2) errors.push("city");
    if (v.shipping_postal_code.length < 2) errors.push("postal_code");
    if (!COUNTRY_RE.test(v.shipping_country)) errors.push("country");
    if (body.consent !== true) errors.push("consent");
    if (errors.length) return json({ error: "validation", fields: errors }, 400);

    const nowIso = new Date(now).toISOString();
    const saved = {
      ...v,
      shipping_line2: v.shipping_line2 || null,
      shipping_state: v.shipping_state || null,
      shipping_submitted_at: nowIso,
      shipping_consent_at: nowIso,
      shipping_consent_version: CONSENT_VERSION,
      shipping_consent_text: CONSENT_TEXT,
      shipping_form_attempts: [...recent.map((t: number) => new Date(t).toISOString()), nowIso],
    };
    const { error: updErr } = await admin.from("bespoke_orders").update(saved).eq("id", id);
    if (updErr) throw updErr;

    await admin.from("bespoke_crm_events").insert({
      order_id: id,
      from_stage: null,
      to_stage: null,
      note: `Shipping address confirmed by customer via form (ref ${ref})`,
      created_by: "customer",
    });

    const { shipping_form_attempts: _a, shipping_consent_text: _t, ...echo } = saved;
    return json({ ok: true, order: { ...pub, ...echo } });
  } catch (err) {
    console.error("[bespoke-shipping-form]", err);
    return json({ error: "server_error" }, 500);
  }
});
