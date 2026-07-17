// Daily Meta Ads spend snapshot (last ~35 days, daily breakdown).
// Upserts into public.ad_spend_snapshots with platform='meta'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_ADS_ACCESS_TOKEN = Deno.env.get("META_ADS_ACCESS_TOKEN") ?? "";
const META_AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID") ?? "";

function isoDay(d: Date): string { return d.toISOString().slice(0, 10); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!META_ADS_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, error: "Missing META_ADS_ACCESS_TOKEN or META_AD_ACCOUNT_ID" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const until = new Date(); until.setUTCDate(until.getUTCDate() - 1);
    const since = new Date(); since.setUTCDate(since.getUTCDate() - 35);
    const timeRange = JSON.stringify({ since: isoDay(since), until: isoDay(until) });

    const url = new URL(`https://graph.facebook.com/v20.0/${META_AD_ACCOUNT_ID}/insights`);
    url.searchParams.set("access_token", META_ADS_ACCESS_TOKEN);
    url.searchParams.set("level", "account");
    url.searchParams.set("time_increment", "1");
    url.searchParams.set("time_range", timeRange);
    url.searchParams.set("fields", "spend,impressions,clicks,date_start");
    url.searchParams.set("limit", "500");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    let next: string | null = url.toString();
    let upserted = 0;
    while (next) {
      const res: Response = await fetch(next);
      if (!res.ok) throw new Error(`Meta ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = await res.json() as {
        data?: Array<{ spend?: string; impressions?: string; clicks?: string; date_start: string }>;
        paging?: { next?: string };
      };
      const records = (json.data ?? []).map((r) => ({
        snapshot_date: r.date_start,
        platform: "meta",
        spend: Number(r.spend ?? 0),
        impressions: Number(r.impressions ?? 0) | 0,
        clicks: Number(r.clicks ?? 0) | 0,
      }));
      if (records.length) {
        const { error } = await admin
          .from("ad_spend_snapshots")
          .upsert(records, { onConflict: "snapshot_date,platform" });
        if (error) throw error;
        upserted += records.length;
      }
      next = json.paging?.next ?? null;
    }

    return new Response(
      JSON.stringify({ ok: true, upserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
