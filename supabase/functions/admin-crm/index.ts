// Admin-only CRM listing. Password-gated (ADMIN_CRM_PASSWORD).
// Returns reservation leads merged with paid founding members, filterable by product.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";

interface Row {
  email: string;
  phone: string | null;
  product: string;
  status: "lead" | "paid";
  amount_usd: number | null;
  environment: string | null;
  locale: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

function detectProduct(row: { recommended_sku?: string | null; metadata?: Record<string, unknown> | null }): string {
  const meta = row.metadata || {};
  const raw = String(
    meta.product ?? meta.item_id ?? meta.product_id ?? meta.sku ?? row.recommended_sku ?? "",
  ).toLowerCase();
  if (raw.includes("bespoke")) return "bespoke";
  if (raw.includes("009")) return "009";
  if (raw.includes("007")) return "007";
  return "unknown";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      password?: string;
      product?: string;
      action?: string;
      email?: string;
      status?: "lead" | "paid";
    };
    const provided = body.password ?? req.headers.get("x-admin-password") ?? "";

    if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Delete action: remove reservation by email from the matching table(s).
    if (body.action === "delete") {
      const email = (body.email ?? "").trim().toLowerCase();
      if (!email) {
        return new Response(JSON.stringify({ error: "Missing email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const target = body.status;
      const deleted: Record<string, number> = { leads: 0, paid: 0 };
      if (!target || target === "lead") {
        const { error, count } = await admin
          .from("reservation_leads")
          .delete({ count: "exact" })
          .ilike("email", email);
        if (error) throw error;
        deleted.leads = count ?? 0;
      }
      if (!target || target === "paid") {
        const { error, count } = await admin
          .from("founding_members")
          .delete({ count: "exact" })
          .ilike("email", email);
        if (error) throw error;
        deleted.paid = count ?? 0;
      }
      return new Response(JSON.stringify({ ok: true, deleted }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productFilter = body.product && ["007", "009", "bespoke"].includes(body.product)
      ? body.product
      : null;

    const admin2 = admin;
    void admin2;


    const leadsQuery = admin
      .from("reservation_leads")
      .select("email, phone, product, locale, utm_source, utm_medium, utm_campaign, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (productFilter) leadsQuery.eq("product", productFilter);

    const paidQuery = admin
      .from("founding_members")
      .select("email, recommended_sku, amount_cents, currency, environment, stripe_session_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    const [leadsRes, paidRes] = await Promise.all([leadsQuery, paidQuery]);
    if (leadsRes.error) throw leadsRes.error;
    if (paidRes.error) throw paidRes.error;

    // Build fast lookup of paid records by lowercased email.
    const paidByEmail = new Map<string, {
      amount_cents: number;
      environment: string;
      stripe_session_id: string;
      product: string;
      created_at: string;
    }>();
    for (const p of paidRes.data ?? []) {
      const product = detectProduct(p);
      if (productFilter && product !== productFilter) continue;
      const key = String(p.email).toLowerCase();
      // keep most recent (list ordered desc)
      if (!paidByEmail.has(key)) {
        paidByEmail.set(key, {
          amount_cents: p.amount_cents ?? 0,
          environment: p.environment ?? "sandbox",
          stripe_session_id: p.stripe_session_id ?? "",
          product,
          created_at: p.created_at,
        });
      }
    }

    const rows: Row[] = [];
    const seen = new Set<string>();

    // Leads first (they have phone info)
    for (const l of leadsRes.data ?? []) {
      const key = String(l.email).toLowerCase();
      seen.add(key);
      const paid = paidByEmail.get(key);
      rows.push({
        email: l.email,
        phone: l.phone,
        product: l.product,
        status: paid ? "paid" : "lead",
        amount_usd: paid ? paid.amount_cents / 100 : null,
        environment: paid?.environment ?? null,
        locale: l.locale,
        utm_source: l.utm_source,
        utm_medium: l.utm_medium,
        utm_campaign: l.utm_campaign,
        stripe_session_id: paid?.stripe_session_id ?? null,
        created_at: l.created_at,
      });
    }

    // Paid records not present in leads (Stripe-only signups)
    for (const [key, paid] of paidByEmail.entries()) {
      if (seen.has(key)) continue;
      rows.push({
        email: key,
        phone: null,
        product: paid.product,
        status: "paid",
        amount_usd: paid.amount_cents / 100,
        environment: paid.environment,
        locale: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        stripe_session_id: paid.stripe_session_id,
        created_at: paid.created_at,
      });
    }

    // Sort merged newest first
    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    const summary = {
      total: rows.length,
      paid: rows.filter((r) => r.status === "paid").length,
      leads: rows.filter((r) => r.status === "lead").length,
      by_product: {
        "007": rows.filter((r) => r.product === "007").length,
        "009": rows.filter((r) => r.product === "009").length,
        bespoke: rows.filter((r) => r.product === "bespoke").length,
      },
    };

    return new Response(JSON.stringify({ rows, summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin-crm]", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
