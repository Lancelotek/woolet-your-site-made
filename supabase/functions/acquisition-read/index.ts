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

async function fetchMailerliteSignups(startMs: number, endMs: number): Promise<{ total: number; byDay: Map<string, number> }> {
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
        if (t < startMs) break outer;
        if (t > endMs) continue;
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
    const body = (await req.json().catch(() => ({}))) as { password?: string; days?: number; start_date?: string; end_date?: string };
    const provided = body.password ?? req.headers.get("x-admin-password") ?? "";
    if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isoDay = /^\d{4}-\d{2}-\d{2}$/;
    let startIso: string;
    let endIso: string;
    let days: number;
    let rangeLabel: string;

    if (body.start_date && body.end_date && isoDay.test(body.start_date) && isoDay.test(body.end_date)) {
      startIso = body.start_date;
      endIso = body.end_date;
      const s = Date.parse(startIso + "T00:00:00Z");
      const e = Date.parse(endIso + "T00:00:00Z");
      days = Math.max(1, Math.round((e - s) / 86400000) + 1);
      rangeLabel = `${startIso} → ${endIso}`;
    } else {
      days = Math.min(Math.max(body.days ?? 30, 1), 120);
      const end = new Date();
      const start = new Date();
      start.setUTCDate(start.getUTCDate() - (days - 1));
      startIso = start.toISOString().slice(0, 10);
      endIso = end.toISOString().slice(0, 10);
      rangeLabel = `Last ${days}d`;
    }

    const startMs = Date.parse(startIso + "T00:00:00Z");
    const endMs = Date.parse(endIso + "T23:59:59Z");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Kick off external fetches in parallel
    const [fx, ml] = await Promise.all([
      fetchPlnUsdRate(),
      fetchMailerliteSignups(startMs, endMs),
    ]);
    const mlLeads = ml.total;

    // GA4 landing pages
    const { data: ga4 } = await admin
      .from("ga4_lp_snapshots")
      .select("landing_page, sessions, conversions, snapshot_date")
      .gte("snapshot_date", startIso)
      .lte("snapshot_date", endIso);

    const pageMap = new Map<string, { sessions: number; conversions: number }>();
    const sessionsByDay = new Map<string, number>();
    // per-page per-day map for lp_daily
    const pageDayMap = new Map<string, Map<string, { sessions: number; conversions: number }>>();
    let totalSessions = 0;
    for (const r of ga4 ?? []) {
      const cur = pageMap.get(r.landing_page) ?? { sessions: 0, conversions: 0 };
      const s = Number(r.sessions ?? 0);
      const c = Number(r.conversions ?? 0);
      cur.sessions += s;
      cur.conversions += c;
      pageMap.set(r.landing_page, cur);
      totalSessions += s;
      const d = String(r.snapshot_date).slice(0, 10);
      sessionsByDay.set(d, (sessionsByDay.get(d) ?? 0) + s);
      let inner = pageDayMap.get(r.landing_page);
      if (!inner) { inner = new Map(); pageDayMap.set(r.landing_page, inner); }
      const dayCur = inner.get(d) ?? { sessions: 0, conversions: 0 };
      dayCur.sessions += s;
      dayCur.conversions += c;
      inner.set(d, dayCur);
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
      .gte("snapshot_date", startIso)
      .lte("snapshot_date", endIso);

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

    const toUsd = (pln: number) => pln * fx.rate;

    // GA4 channel conversions
    const { data: chRows } = await admin
      .from("ga4_channel_snapshots")
      .select("channel, sessions, conversions")
      .gte("snapshot_date", startIso)
      .lte("snapshot_date", endIso);

    const convByChannel: Record<string, number> = { meta: 0, google: 0, other_paid: 0, organic: 0 };
    const sessByChannel: Record<string, number> = { meta: 0, google: 0, other_paid: 0, organic: 0 };
    for (const r of chRows ?? []) {
      const ch = String(r.channel);
      convByChannel[ch] = (convByChannel[ch] ?? 0) + Number(r.conversions ?? 0);
      sessByChannel[ch] = (sessByChannel[ch] ?? 0) + Number(r.sessions ?? 0);
    }

    const metaSpendUsd = toUsd(spendByPlatform.meta?.spend ?? 0);
    const googleSpendUsd = toUsd(spendByPlatform.google?.spend ?? 0);
    const totalPaidConversions = convByChannel.meta + convByChannel.google + convByChannel.other_paid;

    const safeDiv = (num: number, den: number): number | null =>
      den > 0 && num > 0 ? Number((num / den).toFixed(2)) : null;

    const meta_cac = safeDiv(metaSpendUsd, convByChannel.meta);
    const google_cac = safeDiv(googleSpendUsd, convByChannel.google);
    const paid_spend_usd_total = metaSpendUsd + googleSpendUsd;
    const paid_cac = safeDiv(paid_spend_usd_total, totalPaidConversions);

    const channels = (["meta", "google", "other"] as const).map((ch) => {
      const spendKey = ch === "other" ? null : ch;
      const spendUsd = spendKey ? toUsd(spendByPlatform[spendKey]?.spend ?? 0) : 0;
      const convKey = ch === "other" ? "other_paid" : ch;
      const conv = convByChannel[convKey] ?? 0;
      return {
        channel: ch,
        spend: Number(spendUsd.toFixed(2)),
        leads: conv,
        cpl: safeDiv(spendUsd, conv),
        cac: safeDiv(spendUsd, conv),
      };
    });

    const paidSpendUsd = paid_spend_usd_total;
    const blendedCac = mlLeads > 0 && paidSpendUsd > 0
      ? Number((paidSpendUsd / mlLeads).toFixed(2))
      : null;


    // Build ascending day list for range
    const dayList: string[] = [];
    for (let t = startMs; t <= endMs; t += 86400000) {
      dayList.push(new Date(t).toISOString().slice(0, 10));
    }

    // Daily conversion (newest-first, matching existing UI)
    const daily: Array<{ date: string; sessions: number; signups: number; conv_rate: number }> = [];
    for (let i = dayList.length - 1; i >= 0; i--) {
      const key = dayList[i];
      const sessions = sessionsByDay.get(key) ?? 0;
      const signups = ml.byDay.get(key) ?? 0;
      daily.push({ date: key, sessions, signups, conv_rate: sessions > 0 ? signups / sessions : 0 });
    }

    // lp_daily: top 8 pages by sessions, per-day series ascending, zero-filled
    const lp_daily = landingPages.slice(0, 8).map((lp) => {
      const inner = pageDayMap.get(lp.landing_page) ?? new Map();
      const series = dayList.map((d) => {
        const v = inner.get(d) ?? { sessions: 0, conversions: 0 };
        return { date: d, sessions: v.sessions, conversions: v.conversions };
      });
      return { landing_page: lp.landing_page, series };
    });

    return new Response(
      JSON.stringify({
        ok: true,
        days,
        range: { start: startIso, end: endIso, label: rangeLabel },
        currency: "USD",
        fx: { pln_to_usd: Number(fx.rate.toFixed(4)), source: fx.source },
        totals: {
          sessions: totalSessions,
          leads: mlLeads,
          paid_spend: Number(paidSpendUsd.toFixed(2)),
          blended_cac: blendedCac,
          paid_cac,
          meta_cac,
          google_cac,
          paid_conversions: totalPaidConversions,
          meta_conversions: convByChannel.meta,
          google_conversions: convByChannel.google,
          other_paid_conversions: convByChannel.other_paid,
        },
        landing_pages: landingPages,
        daily,
        lp_daily,
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
