// Admin-only reservation attribution report. Same passwords as bespoke admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";
const BESPOKE_PASSWORD = Deno.env.get("BESPOKE_ADMIN_PASSWORD") ?? "";

const mask = (email: string | null) => {
  if (!email) return "";
  const [u, d] = email.split("@");
  return d ? `${u.slice(0, 2)}…@${d}` : `${email.slice(0, 2)}…`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await req.json().catch(() => ({}));
  const pw = typeof body.password === "string" ? body.password : "";
  const ok = (!!ADMIN_PASSWORD && pw === ADMIN_PASSWORD) || (!!BESPOKE_PASSWORD && pw === BESPOKE_PASSWORD);
  if (!ok) return json({ error: "Invalid password" }, 401);

  const days = Number(body.days);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let q = sb.from("reservation_attribution")
    .select("session_id,email,amount,currency,paid_at,environment,first_touch,last_touch,first_landing,heard_from,days_to_pay,touch_count")
    .not("email", "is", null)
    .order("paid_at", { ascending: false })
    .limit(5000);
  if (Number.isFinite(days) && days > 0) q = q.gte("paid_at", new Date(Date.now() - days * 86400000).toISOString());
  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json({ rows: (data ?? []).map((r) => ({ ...r, email: mask(r.email) })) });
});
