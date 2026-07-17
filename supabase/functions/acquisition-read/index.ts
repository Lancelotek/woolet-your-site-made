// Password-gated aggregated read for the Acquisition CRM tab.
// Returns period totals: GA4 sessions, MailerLite leads, USD-converted ad spend,
// blended CAC (USD/lead), per-channel spend, per-landing-page sessions.

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
const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY") ?? "";
const PLN_USD_RATE_ENV = Number(Deno.env.get("PLN_USD_RATE") ?? "");
const FX_FALLBACK = 0.25; // USD per 1 PLN

const MAILERLITE_GROUPS = [
  { id: "192429285503403097", label: "Kickstarter VIP" },
  { id: "181841182994728358", label: "Waitlist ENG" },
  { id: "189356132351870087", label: "AI Scan" },
  { id: "189449279680546761", label: "Bespoke" },
];

async function fetchPlnUsdRate(): Promise<{ rate: number; source: string }> {
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=PLN&to=USD");
    if (r.ok) {
      const j = await r.json();
      const rate = Number(j?.rates?.USD);
      if (rate > 0) return { rate, source: "frankfurter" };
    }
  } catch (_) { /* ignore */ }
  if (PLN_USD_RATE_ENV > 0) return { rate: PLN_USD_RATE_ENV, source: "env" };
  console.warn("[acquisition-read] FX fetch failed, using fallback", FX_FALLBACK);
  return { rate: FX_FALLBACK, source: "fallback" };
}

async function fetchMailerliteSignups(cutoffMs: number): Promise<{ total: number; byDay: Map<string, number> }> {
  const byDay = new Map<string, number>();
  if (!MAILERLITE_API_KEY) return { total: 0, byDay };
  let total = 0;
  for (const g of MAILERLITE_GROUPS) {
    let cursor = "";
    outer: for (let page = 0; page < 30; page++) {
      const path =
        `/subscribers?filter[group]=${g.id}&limit=100&sort=-subscribed_at${cursor ? `&cursor=${cursor}` : ""}`;
      const r = await fetch(`https://connect.mailerlite.com/api${path}`, {
        headers: { Authorization: `Bearer ${MAILERLITE_API_KEY}`, "Content-Type": "application/json" },
      });
      if (r.status >= 400) break;
      const data = await r.json();
      const items: Array<{ subscribed_at?: string }> = data?.data || [];
      if (items.length === 0) break;
      for (const s of items) {
        if (!s.subscribed_at) continue;
        const iso = s.subscribed_at.replace(" ", "T") + "Z";
        const t = Date.parse(iso);
        if (isNaN(t)) continue;
        if (t < cutoffMs) break outer;
        total++;
        const day = new Date(t).toISOString().slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
      }
      cursor = data?.meta?.next_cursor || "";
      if (!cursor) break;
    }
  }
  return { total, byDay };
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
    const cutoffMs = since.getTime();

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Kick off external fetches in parallel
    const [fx, ml] = await Promise.all([
      fetchPlnUsdRate(),
      fetchMailerliteSignups(cutoffMs),
    ]);
    const mlLeads = ml.total;

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

    // Ad spend (stored in account native currency, assumed PLN)
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

    // Convert to USD
    const toUsd = (pln: number) => pln * fx.rate;

    const channels = (["meta", "google", "other"] as const).map((ch) => {
      const spendUsd = toUsd(spendByPlatform[ch]?.spend ?? 0);
      return {
        channel: ch,
        spend: Number(spendUsd.toFixed(2)),
        leads: null as number | null, // no per-channel attribution
        cpl: null as number | null,
      };
    });

    const paidSpendUsd = toUsd(
      (spendByPlatform.meta?.spend ?? 0) + (spendByPlatform.google?.spend ?? 0),
    );
    const blendedCac = mlLeads > 0 && paidSpendUsd > 0
      ? Number((paidSpendUsd / mlLeads).toFixed(2))
      : null;

    return new Response(
      JSON.stringify({
        ok: true,
        days,
        currency: "USD",
        fx: { pln_to_usd: Number(fx.rate.toFixed(4)), source: fx.source },
        totals: {
          sessions: totalSessions,
          leads: mlLeads,
          paid_spend: Number(paidSpendUsd.toFixed(2)),
          blended_cac: blendedCac,
        },
        landing_pages: landingPages,
        channels,
        has_ga4: (ga4?.length ?? 0) > 0,
        has_meta: (spendByPlatform.meta?.spend ?? 0) > 0 || (spendRows ?? []).some((r) => r.platform === "meta"),
        has_google: (spendByPlatform.google?.spend ?? 0) > 0 || (spendRows ?? []).some((r) => r.platform === "google"),
        has_mailerlite: !!MAILERLITE_API_KEY,
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
