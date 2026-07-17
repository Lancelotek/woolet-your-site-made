// Password-gated aggregated read for the Acquisition CRM tab.
// Returns period totals: sessions, leads, blended CAC, per-channel spend & CPL,
// per-landing-page sessions/conversions, per-channel leads.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_CRM_PASSWORD") ?? "";

type Channel = "meta" | "google" | "other";

function normalizeChannel(src: string | null): Channel {
  const s = (src ?? "").toLowerCase();
  if (["facebook", "instagram", "ig", "fb", "meta"].some((k) => s.includes(k))) return "meta";
  if (["google", "adwords", "gads"].some((k) => s.includes(k))) return "google";
  return "other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { password?: string; days?: number };
    const provided = body.password ?? req.headers.get("x-admin-password") ?? "";
    if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const days = Math.min(Math.max(body.days ?? 30, 1), 90);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    const sinceIso = since.toISOString().slice(0, 10);
    const sinceTs = since.toISOString();

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // GA4 landing pages
    const { data: ga4 } = await admin
      .from("ga4_lp_snapshots")
      .select("landing_page, sessions, conversions")
      .gte("snapshot_date", sinceIso);

    const pageMap = new Map<string, { sessions: number; conversions: number }>();
    let totalSessions = 0;
    for (const r of ga4 ?? []) {
      const cur = pageMap.get(r.landing_page) ?? { sessions: 0, conversions: 0 };
      cur.sessions += Number(r.sessions ?? 0);
      cur.conversions += Number(r.conversions ?? 0);
      pageMap.set(r.landing_page, cur);
      totalSessions += Number(r.sessions ?? 0);
    }
    const landingPages = Array.from(pageMap.entries())
      .map(([landing_page, v]) => ({
        landing_page,
        sessions: v.sessions,
        conversions: v.conversions,
        ltr: v.sessions > 0 ? v.conversions / v.sessions : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Ad spend
    const { data: spendRows } = await admin
      .from("ad_spend_snapshots")
      .select("platform, spend, impressions, clicks")
      .gte("snapshot_date", sinceIso);

    const spendByPlatform: Record<string, { spend: number; impressions: number; clicks: number }> = {
      meta: { spend: 0, impressions: 0, clicks: 0 },
      google: { spend: 0, impressions: 0, clicks: 0 },
    };
    for (const r of spendRows ?? []) {
      const p = r.platform as string;
      if (!spendByPlatform[p]) spendByPlatform[p] = { spend: 0, impressions: 0, clicks: 0 };
      spendByPlatform[p].spend += Number(r.spend ?? 0);
      spendByPlatform[p].impressions += Number(r.impressions ?? 0);
      spendByPlatform[p].clicks += Number(r.clicks ?? 0);
    }

    // Leads by channel from reservation_leads
    const { data: leadRows } = await admin
      .from("reservation_leads")
      .select("utm_source, created_at")
      .gte("created_at", sinceTs);

    const leadsByChannel: Record<Channel, number> = { meta: 0, google: 0, other: 0 };
    for (const r of leadRows ?? []) {
      leadsByChannel[normalizeChannel(r.utm_source)]++;
    }
    const totalLeads = (leadRows ?? []).length;

    const channels = (["meta", "google", "other"] as Channel[]).map((ch) => {
      const spend = spendByPlatform[ch]?.spend ?? 0;
      const leads = leadsByChannel[ch];
      return {
        channel: ch,
        spend: Number(spend.toFixed(2)),
        leads,
        cpl: leads > 0 && spend > 0 ? Number((spend / leads).toFixed(2)) : null,
      };
    });

    const paidSpend = (spendByPlatform.meta?.spend ?? 0) + (spendByPlatform.google?.spend ?? 0);
    const blendedCac = totalLeads > 0 && paidSpend > 0
      ? Number((paidSpend / totalLeads).toFixed(2))
      : null;

    return new Response(
      JSON.stringify({
        ok: true,
        days,
        totals: {
          sessions: totalSessions,
          leads: totalLeads,
          paid_spend: Number(paidSpend.toFixed(2)),
          blended_cac: blendedCac,
        },
        landing_pages: landingPages,
        channels,
        has_ga4: (ga4?.length ?? 0) > 0,
        has_meta: (spendByPlatform.meta?.spend ?? 0) > 0 || (spendRows ?? []).some((r) => r.platform === "meta"),
        has_google: (spendByPlatform.google?.spend ?? 0) > 0 || (spendRows ?? []).some((r) => r.platform === "google"),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
