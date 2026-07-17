// Daily GA4 snapshot: landing-page sessions + conversions for the last ~35 days.
// Upserts into public.ga4_lp_snapshots.
// Callable by the daily cron (verify_jwt=false) and by manual invocation with X-Admin-Password.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GA4_PROPERTY_ID = Deno.env.get("GA4_PROPERTY_ID") ?? "";
const GA4_SERVICE_ACCOUNT_JSON = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON") ?? "";

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getGoogleAccessToken(scope: string): Promise<string> {
  if (!GA4_SERVICE_ACCOUNT_JSON) throw new Error("Missing GA4_SERVICE_ACCOUNT_JSON");
  const sa = JSON.parse(GA4_SERVICE_ACCOUNT_JSON) as {
    client_email: string;
    private_key: string;
    token_uri?: string;
  };
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope,
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!GA4_PROPERTY_ID || !GA4_SERVICE_ACCOUNT_JSON) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, error: "Missing GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/analytics.readonly");

    const pageSize = 100000;
    let offset = 0;
    const allRows: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> = [];
    for (let page = 0; page < 20; page++) {
      const body = {
        dateRanges: [{ startDate: "95daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "date" }, { name: "landingPagePlusQueryString" }],
        metrics: [{ name: "sessions" }, { name: "keyEvents" }],
        limit: pageSize,
        offset,
      };
      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error(`GA4 ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = await res.json() as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }>; rowCount?: number };
      const rows = json.rows ?? [];
      allRows.push(...rows);
      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const records = allRows.map((r) => {
      const rawDate = r.dimensionValues[0]?.value ?? ""; // YYYYMMDD
      const snapshot_date = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;
      const landing_page = r.dimensionValues[1]?.value ?? "(unknown)";
      const sessions = Number(r.metricValues[0]?.value ?? 0) | 0;
      const conversions = Math.round(Number(r.metricValues[1]?.value ?? 0));
      return { snapshot_date, landing_page, sessions, conversions };
    }).filter((r) => r.snapshot_date && r.landing_page);

    // Upsert in chunks to avoid payload limits
    const chunk = 500;
    let upserted = 0;
    for (let i = 0; i < records.length; i += chunk) {
      const slice = records.slice(i, i + chunk);
      const { error } = await admin
        .from("ga4_lp_snapshots")
        .upsert(slice, { onConflict: "snapshot_date,landing_page" });
      if (error) throw error;
      upserted += slice.length;
    }

    // === Second report: sessions + conversions by date × sessionSourceMedium ===
    const channelRows: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> = [];
    let cOffset = 0;
    for (let page = 0; page < 20; page++) {
      const body = {
        dateRanges: [{ startDate: "95daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "date" }, { name: "sessionSourceMedium" }],
        metrics: [{ name: "sessions" }, { name: "keyEvents" }],
        limit: pageSize,
        offset: cOffset,
      };
      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error(`GA4 channels ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = await res.json() as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };
      const rows = json.rows ?? [];
      channelRows.push(...rows);
      if (rows.length < pageSize) break;
      cOffset += pageSize;
    }

    function classifyChannel(sourceMedium: string): "meta" | "google" | "other_paid" | "organic" {
      const sm = sourceMedium.toLowerCase().trim();
      const [rawSource, rawMedium] = sm.split("/").map((s) => s.trim());
      const source = rawSource ?? "";
      const medium = (rawMedium ?? "").replace(/[-\s]/g, "");
      const paidMediums = new Set(["cpc", "ppc", "paid", "paidsocial"]);
      const isMetaSource = /(facebook|fb|instagram|ig|meta)/.test(source);
      const isGoogleSource = /google/.test(source);
      if (isMetaSource && paidMediums.has(medium)) return "meta";
      if (isGoogleSource && (medium === "cpc" || medium === "ppc" || medium === "paid")) return "google";
      if (paidMediums.has(medium)) return "other_paid";
      return "organic";
    }

    // Aggregate per (date, channel)
    const channelAgg = new Map<string, { snapshot_date: string; channel: string; sessions: number; conversions: number }>();
    for (const r of channelRows) {
      const rawDate = r.dimensionValues[0]?.value ?? "";
      const snapshot_date = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;
      const sm = r.dimensionValues[1]?.value ?? "";
      const channel = classifyChannel(sm);
      const sessions = Number(r.metricValues[0]?.value ?? 0) | 0;
      const conversions = Math.round(Number(r.metricValues[1]?.value ?? 0));
      if (!snapshot_date) continue;
      const key = `${snapshot_date}|${channel}`;
      const cur = channelAgg.get(key) ?? { snapshot_date, channel, sessions: 0, conversions: 0 };
      cur.sessions += sessions;
      cur.conversions += conversions;
      channelAgg.set(key, cur);
    }
    const channelRecords = Array.from(channelAgg.values());
    let channelsUpserted = 0;
    for (let i = 0; i < channelRecords.length; i += chunk) {
      const slice = channelRecords.slice(i, i + chunk);
      const { error } = await admin
        .from("ga4_channel_snapshots")
        .upsert(slice, { onConflict: "snapshot_date,channel" });
      if (error) throw error;
      channelsUpserted += slice.length;
    }

    return new Response(
      JSON.stringify({ ok: true, upserted, channels_upserted: channelsUpserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
