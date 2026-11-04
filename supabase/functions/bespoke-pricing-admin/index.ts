// Admin-only price + coupon editor for Woolet Bespoke.
// Password-gated like bespoke-admin-orders (ADMIN_CRM_PASSWORD or BESPOKE_ADMIN_PASSWORD).
//
// POST { password, action: "get" }
// POST { password, action: "save_prices", prices: [{ key, amount_usd }] }
// POST { password, action: "save_coupon", coupon: { code, percent_off, active, note? } }
// POST { password, action: "delete_coupon", code }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { MAX_PRICE_USD } from "../_shared/bespoke-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const KEY_RE = /^(?:(?:frame|lens):[a-z0-9-]+|engraving)$/;
const CODE_RE = /^[A-Z0-9_-]{3,40}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const provided = String(body.password ?? req.headers.get("x-admin-password") ?? "");
  const ok = (!!ADMIN_PASSWORD && provided === ADMIN_PASSWORD) || (!!BESPOKE_PASSWORD && provided === BESPOKE_PASSWORD);
  if (!ok) return json({ error: "Unauthorized" }, 401);

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  const snapshot = async () => {
    const [prices, coupons] = await Promise.all([
      db.from("bespoke_pricing").select("key, label, amount_usd, sort_order, updated_at").order("sort_order"),
      db.from("bespoke_coupons").select("code, percent_off, active, note, updated_at").order("code"),
    ]);
    if (prices.error) throw new Error(prices.error.message);
    if (coupons.error) throw new Error(coupons.error.message);
    return { prices: prices.data, coupons: coupons.data };
  };

  try {
    switch (body.action) {
      case "get":
        return json(await snapshot());

      case "save_prices": {
        const rows = Array.isArray(body.prices) ? body.prices : [];
        if (rows.length === 0 || rows.length > 50) return json({ error: "No prices to save" }, 400);
        const now = new Date().toISOString();
        for (const r of rows) {
          const key = String(r?.key ?? "");
          const amount = Number(String(r?.amount_usd ?? "").replace(",", "."));
          if (!KEY_RE.test(key)) return json({ error: `Invalid key: ${key}` }, 400);
          if (!Number.isFinite(amount) || amount < 0 || amount > MAX_PRICE_USD) {
            return json({ error: `Invalid price for ${key}` }, 400);
          }
          // Frame price below $1 would make Stripe refuse the charge.
          if (key.startsWith("frame:") && amount < 1) return json({ error: "Frame price must be at least $1" }, 400);
          const { error } = await db
            .from("bespoke_pricing")
            .update({ amount_usd: Math.round(amount * 100) / 100, updated_at: now })
            .eq("key", key);
          if (error) throw new Error(error.message);
        }
        console.log("[bespoke-pricing-admin] prices saved", rows.map((r: any) => `${r.key}=${r.amount_usd}`).join(", "));
        return json(await snapshot());
      }

      case "save_coupon": {
        const c = body.coupon ?? {};
        const code = String(c.code ?? "").trim().toUpperCase();
        const pct = Number(c.percent_off);
        if (!CODE_RE.test(code)) return json({ error: "Code: 3-40 characters, A-Z 0-9 _ -" }, 400);
        if (!Number.isInteger(pct) || pct < 1 || pct > 100) return json({ error: "Percent off: 1-100" }, 400);
        const { error } = await db.from("bespoke_coupons").upsert({
          code,
          percent_off: pct,
          active: c.active !== false,
          note: c.note ? String(c.note).slice(0, 200) : null,
          updated_at: new Date().toISOString(),
        });
        if (error) throw new Error(error.message);
        return json(await snapshot());
      }

      case "delete_coupon": {
        const code = String(body.code ?? "").trim().toUpperCase();
        if (!CODE_RE.test(code)) return json({ error: "Invalid code" }, 400);
        const { error } = await db.from("bespoke_coupons").delete().eq("code", code);
        if (error) throw new Error(error.message);
        return json(await snapshot());
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[bespoke-pricing-admin]", message);
    return json({ error: message }, 500);
  }
});
