import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import wordmark from "@/assets/woolet-wordmark.svg";
import { supabase } from "@/integrations/supabase/client";
import { CrmTabs } from "./crm/CrmTabs";

interface LandingPageRow {
  landing_page: string;
  sessions: number;
  conversions: number;
  ltr: number;
}
interface ChannelRow {
  channel: "meta" | "google" | "other";
  spend: number;
  leads: number | null;
  cpl: number | null;
}
interface DailyRow {
  date: string;
  sessions: number;
  signups: number;
  conv_rate: number;
}
interface LpDailyRow {
  landing_page: string;
  series: Array<{ date: string; sessions: number; conversions: number }>;
}
interface Data {
  days: number;
  range?: { start: string; end: string; label: string };
  currency?: string;
  fx?: { pln_to_usd: number; source: string };
  totals: { sessions: number; leads: number; paid_spend: number; blended_cac: number | null };
  landing_pages: LandingPageRow[];
  daily: DailyRow[];
  lp_daily?: LpDailyRow[];
  channels: ChannelRow[];
  has_ga4: boolean;
  has_meta: boolean;
  has_google: boolean;
  has_mailerlite?: boolean;
}

const T = {
  bg: "#0b0a09",
  panel: "#141210",
  ink: "#efe9df",
  inkDim: "rgba(239,233,223,0.68)",
  inkMute: "rgba(239,233,223,0.42)",
  gold: "#c2a05a",
  goldInk: "#1F1B16",
  hair: "rgba(239,233,223,0.10)",
  bad: "#e07070",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const fmtInt = (n: number) => n.toLocaleString("en-US");
const fmtUsd = (n: number | null) => (n == null ? "—" : `$${n.toFixed(2)}`);
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

const CHANNEL_LABEL: Record<ChannelRow["channel"], string> = {
  meta: "Meta (FB/IG)",
  google: "Google Ads",
  other: "Other / Direct",
};

interface Ga4Status {
  ok: boolean;
  status: string;
  http_status?: number;
  property_id?: string;
  service_account_email?: string;
  message: string;
}

type RangeMode =
  | { kind: "days"; days: number }
  | { kind: "month"; year: number; month: number /* 0-based */; label: string };

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function monthRange(year: number, month: number) {
  const start = `${year}-${pad(month + 1)}-01`;
  const endDate = new Date(Date.UTC(year, month + 1, 0));
  const end = `${year}-${pad(month + 1)}-${pad(endDate.getUTCDate())}`;
  return { start, end };
}
const PL_MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
function monthLabel(year: number, month: number) { return `${PL_MONTHS[month]} ${year}`; }

const CrmAcquisition = () => {
  const [password, setPassword] = useState("");
  const [range, setRange] = useState<RangeMode>({ kind: "days", days: 30 });
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [ga4Status, setGa4Status] = useState<Ga4Status | null>(null);
  const [checkingGa4, setCheckingGa4] = useState(false);
  const [pacingPage, setPacingPage] = useState<string>("");

  const monthOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string; year: number; month: number }> = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      opts.push({ value: `${y}-${pad(m + 1)}`, label: monthLabel(y, m), year: y, month: m });
    }
    return opts;
  }, []);

  const checkGa4 = async () => {
    setCheckingGa4(true);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ga4-check", {
        body: { password },
      });
      if (fnErr) {
        setGa4Status({ ok: false, status: "invoke_error", message: fnErr.message });
      } else {
        setGa4Status(res as Ga4Status);
      }
    } catch (e) {
      setGa4Status({ ok: false, status: "exception", message: (e as Error).message });
    } finally {
      setCheckingGa4(false);
    }
  };

  const load = async (nextRange: RangeMode = range) => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { password };
      if (nextRange.kind === "days") {
        body.days = nextRange.days;
      } else {
        const { start, end } = monthRange(nextRange.year, nextRange.month);
        body.start_date = start;
        body.end_date = end;
      }
      const { data: res, error: fnErr } = await supabase.functions.invoke("acquisition-read", {
        body,
      });
      if (fnErr) throw new Error(fnErr.message);
      if (!res?.ok) throw new Error(res?.error ?? "Request failed");
      const d = res as Data;
      setData(d);
      // Default pacing selection to top page
      if (d.lp_daily && d.lp_daily.length > 0) {
        setPacingPage((prev) => (prev && d.lp_daily!.some((p) => p.landing_page === prev) ? prev : d.lp_daily![0].landing_page));
      } else {
        setPacingPage("");
      }
      checkGa4();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runSnapshot = async (fn: "ga4-snapshot" | "meta-ads-spend-snapshot" | "google-ads-spend-snapshot") => {
    setRunning(fn);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke(fn, {
        headers: { "x-admin-password": password },
        body: {},
      });
      if (fnErr) throw new Error(fnErr.message);
      if (!res?.ok && !res?.skipped) throw new Error(res?.error ?? "Snapshot failed");
      if (res?.skipped) setError(`${fn}: ${res.error}`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(null);
    }
  };


  const rangeHint = data?.range?.label ?? `Last ${data?.days ?? 0}d`;
  const kpiCards: Array<{ label: string; value: string; hint?: string }> = data
    ? [
        { label: "Total sessions", value: fmtInt(data.totals.sessions), hint: rangeHint },
        { label: "Total leads", value: fmtInt(data.totals.leads), hint: "MailerLite signups" },
        { label: "Blended CAC", value: fmtUsd(data.totals.blended_cac), hint: `Paid $${data.totals.paid_spend.toFixed(2)}` },
      ]
    : [];

  const totalsRow = data
    ? data.landing_pages.reduce(
        (a, r) => ({ sessions: a.sessions + r.sessions, conversions: a.conversions + r.conversions }),
        { sessions: 0, conversions: 0 },
      )
    : { sessions: 0, conversions: 0 };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: SANS }}>
      <Helmet>
        <title>Acquisition · Woolet CRM</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header style={{ borderBottom: `1px solid ${T.hair}`, padding: "18px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={wordmark} alt="Woolet" style={{ height: 16, width: "auto", display: "block" }} />
            <span style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: "0.02em", color: T.gold, fontStyle: "italic" }}>CRM</span>
          </div>
          <CrmTabs current="acquisition" />
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 80px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Acquisition</h1>
        <p style={{ color: T.inkDim, fontSize: 13, marginBottom: 24 }}>
          Sessions & landing-page conversion (GA4), spend per ad channel, and blended CAC.
          Snapshots run daily at ~09:15–09:25 UTC.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: T.inkMute, marginBottom: 6 }}>
              Admin password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ background: T.panel, border: `1px solid ${T.hair}`, color: T.ink, padding: "10px 12px", fontSize: 14, width: 260, borderRadius: 2 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {([
              { key: "7d", label: "7D", r: { kind: "days", days: 7 } as RangeMode },
              { key: "30d", label: "30D", r: { kind: "days", days: 30 } as RangeMode },
              { key: "tm", label: "This month", r: (() => { const n = new Date(); return { kind: "month", year: n.getUTCFullYear(), month: n.getUTCMonth(), label: monthLabel(n.getUTCFullYear(), n.getUTCMonth()) } as RangeMode; })() },
              { key: "lm", label: "Last month", r: (() => { const n = new Date(); const d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 1, 1)); return { kind: "month", year: d.getUTCFullYear(), month: d.getUTCMonth(), label: monthLabel(d.getUTCFullYear(), d.getUTCMonth()) } as RangeMode; })() },
            ]).map((p) => {
              const active =
                (p.r.kind === "days" && range.kind === "days" && range.days === p.r.days) ||
                (p.r.kind === "month" && range.kind === "month" && range.year === p.r.year && range.month === p.r.month);
              return (
                <button
                  key={p.key}
                  onClick={() => { setRange(p.r); if (password) load(p.r); }}
                  style={{
                    background: active ? T.gold : "transparent",
                    color: active ? T.goldInk : T.inkDim,
                    border: `1px solid ${active ? T.gold : T.hair}`,
                    padding: "10px 16px",
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: 2,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {p.label}
                </button>
              );
            })}
            <select
              value={range.kind === "month" ? `${range.year}-${pad(range.month + 1)}` : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const opt = monthOptions.find((o) => o.value === val);
                if (!opt) return;
                const r: RangeMode = { kind: "month", year: opt.year, month: opt.month, label: opt.label };
                setRange(r);
                if (password) load(r);
              }}
              style={{
                background: T.panel,
                color: T.ink,
                border: `1px solid ${T.hair}`,
                padding: "10px 12px",
                fontSize: 12,
                borderRadius: 2,
              }}
            >
              <option value="">Miesiąc…</option>
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => load()}
            disabled={loading || !password}
            style={{ background: T.gold, color: T.goldInk, border: "none", padding: "10px 20px", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading || !password ? "not-allowed" : "pointer", opacity: loading || !password ? 0.5 : 1, borderRadius: 2, fontWeight: 600 }}
          >
            {loading ? "Loading…" : "Load"}
          </button>
        </div>

        {data && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {(["ga4-snapshot", "meta-ads-spend-snapshot", "google-ads-spend-snapshot"] as const).map((fn) => (
              <button
                key={fn}
                onClick={() => runSnapshot(fn)}
                disabled={!!running || !password}
                style={{ background: "transparent", color: T.ink, border: `1px solid ${T.hair}`, padding: "8px 14px", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.5 : 1, borderRadius: 2 }}
              >
                {running === fn ? "Running…" : `Run ${fn.replace("-snapshot", "").replace("-spend", "")} now`}
              </button>
            ))}
            <button
              onClick={checkGa4}
              disabled={checkingGa4 || !password}
              style={{ background: "transparent", color: T.ink, border: `1px solid ${T.hair}`, padding: "8px 14px", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: checkingGa4 ? "not-allowed" : "pointer", opacity: checkingGa4 ? 0.5 : 1, borderRadius: 2 }}
            >
              {checkingGa4 ? "Checking…" : "Check GA4 access"}
            </button>
          </div>
        )}

        {ga4Status && (
          <div
            style={{
              background: ga4Status.ok ? "rgba(194,160,90,0.08)" : "rgba(224,112,112,0.10)",
              border: `1px solid ${ga4Status.ok ? T.gold : T.bad}`,
              color: ga4Status.ok ? T.ink : T.bad,
              padding: "12px 16px",
              marginBottom: 24,
              fontSize: 13,
              borderRadius: 2,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: ga4Status.ok ? T.gold : T.bad, marginBottom: 6 }}>
              GA4 · {ga4Status.status}{ga4Status.http_status ? ` (HTTP ${ga4Status.http_status})` : ""}
            </div>
            <div style={{ color: ga4Status.ok ? T.inkDim : T.bad }}>{ga4Status.message}</div>
            {ga4Status.service_account_email && (
              <div style={{ marginTop: 6, fontSize: 12, color: T.inkMute, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {ga4Status.service_account_email}
                {ga4Status.property_id ? ` · property ${ga4Status.property_id}` : ""}
              </div>
            )}
          </div>
        )}



        {error && (
          <div style={{ background: "rgba(224,112,112,0.1)", border: `1px solid ${T.bad}`, color: T.bad, padding: "12px 16px", marginBottom: 24, fontSize: 13 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            {data.range && (
              <div style={{ fontSize: 11, color: T.inkMute, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
                Range · <span style={{ color: T.gold }}>{data.range.label}</span>
                <span style={{ color: T.inkMute, textTransform: "none", letterSpacing: 0 }}> ({data.range.start} → {data.range.end})</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
              {kpiCards.map((k) => (
                <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.hair}`, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: T.inkMute, marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 26, color: T.ink }}>{k.value}</div>
                  {k.hint && <div style={{ fontSize: 11, color: T.inkMute, marginTop: 4 }}>{k.hint}</div>}
                </div>
              ))}
            </div>

            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0 }}>Sessions by landing page</h2>
                {!data.has_ga4 && <span style={{ fontSize: 12, color: T.inkMute }}>Podłącz GA4, aby zobaczyć dane.</span>}
              </div>
              <div style={{ overflowX: "auto", border: `1px solid ${T.hair}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.panel, textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Landing page</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Sesje</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Leady (GA4)</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>LTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.landing_pages.slice(0, 50).map((r) => (
                      <tr key={r.landing_page} style={{ borderTop: `1px solid ${T.hair}` }}>
                        <td style={{ padding: "8px 12px", color: T.inkDim, maxWidth: 640, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.landing_page}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.sessions)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.conversions)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.inkDim }}>{fmtPct(r.ltr)}</td>
                      </tr>
                    ))}
                    {data.landing_pages.length > 0 && (
                      <tr style={{ borderTop: `1px solid ${T.hair}`, background: T.panel }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: T.gold }}>Total</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmtInt(totalsRow.sessions)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmtInt(totalsRow.conversions)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.inkDim }}>
                          {fmtPct(totalsRow.sessions > 0 ? totalsRow.conversions / totalsRow.sessions : 0)}
                        </td>
                      </tr>
                    )}
                    {data.landing_pages.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: "16px 12px", color: T.inkMute, fontSize: 13 }}>
                          Brak danych GA4. Dodaj sekrety GA4_PROPERTY_ID i GA4_SERVICE_ACCOUNT_JSON, następnie uruchom snapshot.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0 }}>Daily conversion</h2>
                <span style={{ fontSize: 12, color: T.inkMute }}>Sessions (GA4) × MailerLite signups per UTC day</span>
              </div>
              <div style={{ overflowX: "auto", border: `1px solid ${T.hair}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.panel, textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Date</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Sesje</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Zapisy</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Konwersja %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.daily ?? []).map((r) => (
                      <tr key={r.date} style={{ borderTop: `1px solid ${T.hair}` }}>
                        <td style={{ padding: "8px 12px", color: T.inkDim, fontVariantNumeric: "tabular-nums" }}>{r.date}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.sessions)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.signups)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.sessions > 0 ? T.gold : T.inkMute }}>
                          {r.sessions > 0 ? `${(r.conv_rate * 100).toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                    {(!data.daily || data.daily.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ padding: "16px 12px", color: T.inkMute, fontSize: 13 }}>
                          Brak danych dziennych.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0 }}>Landing page pacing</h2>
                {data.lp_daily && data.lp_daily.length > 0 && (
                  <select
                    value={pacingPage}
                    onChange={(e) => setPacingPage(e.target.value)}
                    style={{ background: T.panel, color: T.ink, border: `1px solid ${T.hair}`, padding: "8px 10px", fontSize: 12, borderRadius: 2, maxWidth: 480 }}
                  >
                    {data.lp_daily.map((p) => (
                      <option key={p.landing_page} value={p.landing_page}>{p.landing_page}</option>
                    ))}
                  </select>
                )}
              </div>
              {(() => {
                const selected = data.lp_daily?.find((p) => p.landing_page === pacingPage) ?? data.lp_daily?.[0];
                if (!selected || selected.series.length === 0) {
                  return (
                    <div style={{ border: `1px solid ${T.hair}`, padding: "16px 12px", color: T.inkMute, fontSize: 13 }}>
                      Brak danych GA4 dla wybranego zakresu.
                    </div>
                  );
                }
                let cum = 0;
                return (
                  <div style={{ overflowX: "auto", border: `1px solid ${T.hair}` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: T.panel, textAlign: "left" }}>
                          <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Date</th>
                          <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Sesje</th>
                          <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Konwersje</th>
                          <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Konwersja %</th>
                          <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Skum. konwersje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.series.map((r) => {
                          cum += r.conversions;
                          const rate = r.sessions > 0 ? r.conversions / r.sessions : null;
                          return (
                            <tr key={r.date} style={{ borderTop: `1px solid ${T.hair}` }}>
                              <td style={{ padding: "8px 12px", color: T.inkDim, fontVariantNumeric: "tabular-nums" }}>{r.date}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.sessions)}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtInt(r.conversions)}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: rate != null ? T.gold : T.inkMute }}>
                                {rate != null ? `${(rate * 100).toFixed(1)}%` : "—"}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.ink }}>{fmtInt(cum)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </section>



            <section style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0 }}>Ad spend & CAC by channel</h2>
                {!data.has_meta && !data.has_google && (
                  <span style={{ fontSize: 12, color: T.inkMute }}>Podłącz Meta Ads / Google Ads.</span>
                )}
              </div>
              <div style={{ overflowX: "auto", border: `1px solid ${T.hair}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.panel, textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Channel</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Spend</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Leads</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>CPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.map((c) => (
                      <tr key={c.channel} style={{ borderTop: `1px solid ${T.hair}` }}>
                        <td style={{ padding: "8px 12px" }}>{CHANNEL_LABEL[c.channel]}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtUsd(c.spend || null)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.inkMute }}>—</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: T.inkMute }}>—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: T.inkMute }}>
                Per-channel CPL requires UTM tagging on signups — showing blended CAC only for now.
                {data.fx && <> · FX PLN→USD: {data.fx.pln_to_usd.toFixed(4)} ({data.fx.source})</>}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: T.inkDim }}>
                Blended CAC ={" "}
                <span style={{ color: T.gold, fontFamily: SERIF, fontSize: 18 }}>{fmtUsd(data.totals.blended_cac)}</span>{" "}
                <span style={{ color: T.inkMute, fontSize: 12 }}>
                  (paid spend USD / MailerLite signups · {rangeHint})
                </span>
              </div>
            </section>
          </>
        )}

        {!data && !loading && (
          <p style={{ color: T.inkMute, fontSize: 13 }}>
            Enter password and click <em>Load</em>.
          </p>
        )}
      </div>
    </div>
  );
};

export default CrmAcquisition;
