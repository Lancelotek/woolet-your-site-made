// Admin-only dispatch fields for a bespoke order. Writes exactly five columns
// (courier, tracking number, parcel weight, shipped_at, dispatch note) and
// never touches measurements, the shipping address or consent records.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const text = (v: unknown) => {
  if (v == null) return null;
  const t = String(v).trim().slice(0, 500);
  return t === "" ? null : t;
};

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

    const id = String(body.id ?? "");
    if (!UUID_RE.test(id)) return json({ error: "invalid_id" }, 400);

    const weightRaw = body.parcel_weight_kg;
    let weight: number | null = null;
    if (weightRaw != null && String(weightRaw).trim() !== "") {
      const n = Number(weightRaw);
      if (!Number.isFinite(n) || n < 0 || n > 100) return json({ error: "invalid_weight" }, 400);
      weight = n;
    }

    const shippedRaw = text(body.shipped_at);
    let shippedAt: string | null = null;
    if (shippedRaw) {
      const d = new Date(shippedRaw);
      if (Number.isNaN(d.getTime())) return json({ error: "invalid_ship_date" }, 400);
      shippedAt = d.toISOString();
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { error } = await admin
      .from("bespoke_orders")
      .update({
        courier: text(body.courier),
        tracking_number: text(body.tracking_number),
        parcel_weight_kg: weight,
        shipped_at: shippedAt,
        dispatch_note: text(body.dispatch_note),
      })
      .eq("id", id);
    if (error) throw error;

    return json({ ok: true, saved_at: new Date().toISOString() });
  } catch (err) {
    console.error("[bespoke-dispatch-update]", err);
    return json({ error: "server_error" }, 500);
  }
});
