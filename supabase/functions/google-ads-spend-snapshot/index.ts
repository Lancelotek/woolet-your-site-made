// Daily Google Ads spend snapshot via GAQL (last ~35 days, daily).
// Upserts into public.ad_spend_snapshots with platform='google'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DEV_TOKEN = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") ?? "";
const CLIENT_ID = Deno.env.get("GOOGLE_ADS_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET") ?? "";
const REFRESH_TOKEN = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN") ?? "";
const CUSTOMER_ID = (Deno.env.get("GOOGLE_ADS_CUSTOMER_ID") ?? "").replace(/-/g, "");
const LOGIN_CUSTOMER_ID = (Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID") ?? "").replace(/-/g, "");

async function refreshAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!DEV_TOKEN || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !CUSTOMER_ID) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, error: "Missing Google Ads credentials" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = await refreshAccessToken();

    const query = `
      SELECT segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks
      FROM customer
      WHERE segments.date DURING LAST_30_DAYS
    `;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": DEV_TOKEN,
      "Content-Type": "application/json",
    };
    if (LOGIN_CUSTOMER_ID) headers["login-customer-id"] = LOGIN_CUSTOMER_ID;

    const res = await fetch(
      `https://googleads.googleapis.com/v17/customers/${CUSTOMER_ID}/googleAds:searchStream`,
      { method: "POST", headers, body: JSON.stringify({ query }) },
    );
    if (!res.ok) throw new Error(`Google Ads ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const chunks = await res.json() as Array<{ results?: Array<{ segments: { date: string }; metrics: { costMicros?: string; impressions?: string; clicks?: string } }> }>;

    // Aggregate per date
    const map = new Map<string, { spend: number; impressions: number; clicks: number }>();
    for (const chunk of Array.isArray(chunks) ? chunks : [chunks]) {
      for (const r of chunk.results ?? []) {
        const d = r.segments.date;
        const cur = map.get(d) ?? { spend: 0, impressions: 0, clicks: 0 };
        cur.spend += Number(r.metrics.costMicros ?? 0) / 1e6;
        cur.impressions += Number(r.metrics.impressions ?? 0);
        cur.clicks += Number(r.metrics.clicks ?? 0);
        map.set(d, cur);
      }
    }

    const records = Array.from(map.entries()).map(([d, v]) => ({
      snapshot_date: d,
      platform: "google",
      spend: Number(v.spend.toFixed(2)),
      impressions: v.impressions | 0,
      clicks: v.clicks | 0,
    }));

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    if (records.length) {
      const { error } = await admin
        .from("ad_spend_snapshots")
        .upsert(records, { onConflict: "snapshot_date,platform" });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, upserted: records.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
