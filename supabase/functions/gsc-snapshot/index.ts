// Daily GSC snapshot for CTR-recovery tracking.
// Pulls Search Analytics for the two target pages, filters to their target
// queries, computes threshold_met, and upserts into public.gsc_snapshots.
//
// Callable by:
//   - the daily cron (no auth needed; verify_jwt is off by default)
//   - manual invocation with X-Admin-Password header
//
// Uses the Lovable Google Search Console connector gateway.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GSC_API_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")!;

// GSC site URL (verified property). `sc-domain:` covers all subdomains + protocols.
const SITE_URL = Deno.env.get("GSC_SITE_URL") ?? "sc-domain:woolet.co";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

// Tracking config: which pages, which queries, and success thresholds.
interface Target {
  page_path: string; // stored as-is, matches GSC "page" dimension with site prefix
  page_url_absolute: string; // full URL for GSC filter
  queries: string[]; // queries to record (contains-match, so "wide face" catches "wide faces guide")
  threshold_ctr: number; // 0-1
}

const TARGETS: Target[] = [
  {
    page_path: "/en/blog/glasses-for-wide-faces-guide",
    page_url_absolute: "https://woolet.co/en/blog/glasses-for-wide-faces-guide",
    queries: ["glasses for wide faces", "frame width for wide faces", "wide face glasses"],
    threshold_ctr: 0.012, // 1.2%
  },
  {
    page_path: "/en/blog/best-glasses-for-big-heads-2026",
    page_url_absolute: "https://woolet.co/en/blog/best-glasses-for-big-heads-2026",
    queries: ["best glasses for big heads", "glasses for big heads", "big head glasses"],
    threshold_ctr: 0.025, // 2.5%
  },
];

interface GscRow {
  keys: string[]; // [query] since we group by query dimension
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGsc(pageUrl: string, startDate: string, endDate: string): Promise<GscRow[]> {
  const path = `/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const body = {
    startDate,
    endDate,
    dimensions: ["query"],
    dimensionFilterGroups: [
      {
        filters: [{ dimension: "page", operator: "equals", expression: pageUrl }],
      },
    ],
    rowLimit: 500,
    dataState: "final",
  };

  const res = await fetch(`${GATEWAY}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GSC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  return (json.rows ?? []) as GscRow[];
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY || !GSC_API_KEY) {
      throw new Error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY");
    }

    // GSC data has ~2-3 day lag. Snapshot the day that's 3 days behind today.
    const target = new Date();
    target.setUTCDate(target.getUTCDate() - 3);
    const day = isoDay(target);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const results: Array<Record<string, unknown>> = [];
    const flagged: Array<Record<string, unknown>> = [];

    for (const t of TARGETS) {
      let rows: GscRow[] = [];
      try {
        rows = await queryGsc(t.page_url_absolute, day, day);
      } catch (e) {
        results.push({ page: t.page_path, error: (e as Error).message });
        continue;
      }

      for (const targetQuery of t.queries) {
        const needle = targetQuery.toLowerCase();
        const match = rows.find((r) => (r.keys?.[0] ?? "").toLowerCase().includes(needle));

        const clicks = match?.clicks ?? 0;
        const impressions = match?.impressions ?? 0;
        const ctr = match?.ctr ?? 0;
        const position = match?.position ?? 0;
        // Only flag when we have enough impressions to trust the CTR (>= 50).
        const threshold_met = impressions >= 50 ? ctr >= t.threshold_ctr : null;

        const record = {
          snapshot_date: day,
          page_path: t.page_path,
          query: targetQuery,
          clicks,
          impressions,
          ctr: Number(ctr.toFixed(4)),
          position: Number(position.toFixed(2)),
          threshold_ctr: t.threshold_ctr,
          threshold_met,
        };

        const { error } = await admin
          .from("gsc_snapshots")
          .upsert(record, { onConflict: "snapshot_date,page_path,query" });

        if (error) {
          results.push({ ...record, error: error.message });
        } else {
          results.push(record);
          if (threshold_met === false) flagged.push(record);
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, day, count: results.length, flagged, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
