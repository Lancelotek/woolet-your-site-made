import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import wordmark from "@/assets/woolet-wordmark.svg";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { CrmTabs } from "./crm/CrmTabs";

interface Row {
  id: string;
  snapshot_date: string;
  page_path: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  threshold_ctr: number | null;
  threshold_met: boolean | null;
}

const T = {
  bg: "#0b0a09",
  panel: "#141210",
  ink: "#efe9df",
  inkDim: "rgba(239,233,223,0.68)",
  inkMute: "rgba(239,233,223,0.42)",
  gold: "#c2a05a",
  bad: "#e07070",
  good: "#7fc48c",
  hair: "rgba(239,233,223,0.10)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmtPos = (n: number) => n.toFixed(1);

const CrmGsc = () => {
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(14);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("gsc-tracking-read", {
        body: { password, days },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (!data?.ok) throw new Error(data?.error ?? "Request failed");
      setRows(data.rows as Row[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runSnapshot = async () => {
    setRunning(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("gsc-snapshot", {
        headers: { "x-admin-password": password },
        body: {},
      });
      if (fnErr) throw new Error(fnErr.message);
      if (!data?.ok) throw new Error(data?.error ?? "Snapshot failed");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  // Group rows by page for compact rendering
  const byPage = rows.reduce<Record<string, Row[]>>((acc, r) => {
    (acc[r.page_path] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: SANS }}>
      <Helmet>
        <title>GSC CTR Tracking · Woolet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header style={{ borderBottom: `1px solid ${T.hair}`, padding: "18px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={wordmark} alt="Woolet" style={{ height: 16, width: "auto", display: "block" }} />
            <span style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: "0.02em", color: T.gold, fontStyle: "italic" }}>CRM</span>
          </div>
          <CrmTabs current="gsc" />
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 80px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, marginBottom: 8 }}>
          GSC CTR Tracking
        </h1>
        <p style={{ color: T.inkDim, fontSize: 13, marginBottom: 24 }}>
          Daily snapshot of Search Console CTR + position for the two rewritten blog pages.
          Snapshot runs automatically at 09:15 UTC (data lag ~3 days).
        </p>


        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap" }}>
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
          <div>
            <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: T.inkMute, marginBottom: 6 }}>
              Days
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 14)}
              style={{ background: T.panel, border: `1px solid ${T.hair}`, color: T.ink, padding: "10px 12px", fontSize: 14, width: 80, borderRadius: 2 }}
            />
          </div>
          <button
            onClick={load}
            disabled={loading || !password}
            style={{ background: T.gold, color: "#0b0a09", border: "none", padding: "10px 20px", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading || !password ? "not-allowed" : "pointer", opacity: loading || !password ? 0.5 : 1, borderRadius: 2 }}
          >
            {loading ? "Loading…" : "Load"}
          </button>
          <button
            onClick={runSnapshot}
            disabled={running || !password}
            style={{ background: "transparent", color: T.ink, border: `1px solid ${T.hair}`, padding: "10px 20px", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: running || !password ? "not-allowed" : "pointer", opacity: running || !password ? 0.5 : 1, borderRadius: 2 }}
          >
            {running ? "Running…" : "Run snapshot now"}
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(224,112,112,0.1)", border: `1px solid ${T.bad}`, color: T.bad, padding: "12px 16px", marginBottom: 24, fontSize: 13 }}>
            {error}
          </div>
        )}

        {Object.entries(byPage).map(([page, prows]) => {
          const flagCount = prows.filter((r) => r.threshold_met === false).length;
          const thresholdCtr = prows.find((r) => r.threshold_ctr != null)?.threshold_ctr ?? null;

          // Build chart data: one row per date, one field per query with CTR%
          const queries = Array.from(new Set(prows.map((r) => r.query)));
          const dateMap = new Map<string, Record<string, number | string>>();
          for (const r of prows) {
            const key = r.snapshot_date;
            if (!dateMap.has(key)) dateMap.set(key, { date: key });
            const row = dateMap.get(key)!;
            if (r.impressions >= 10) row[r.query] = Number((r.ctr * 100).toFixed(2));
          }
          const chartData = Array.from(dateMap.values()).sort((a, b) =>
            String(a.date).localeCompare(String(b.date)),
          );
          const lineColors = [T.gold, "#7fc48c", "#7fb4e0", "#e0a87f"];

          return (
            <section key={page} style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0 }}>{page}</h2>
                <span style={{ fontSize: 12, color: flagCount > 0 ? T.bad : T.good }}>
                  {flagCount > 0 ? `⚠ ${flagCount} day(s) below threshold` : "✓ meeting threshold"}
                </span>
              </div>

              {chartData.length > 0 && (
                <div style={{ background: T.panel, border: `1px solid ${T.hair}`, padding: "16px 12px 8px", marginBottom: 12, height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke={T.hair} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: T.inkMute, fontSize: 11 }}
                        tickFormatter={(v: string) => v.slice(5)}
                        stroke={T.hair}
                      />
                      <YAxis
                        tick={{ fill: T.inkMute, fontSize: 11 }}
                        tickFormatter={(v: number) => `${v}%`}
                        stroke={T.hair}
                        width={44}
                      />
                      <Tooltip
                        contentStyle={{ background: T.bg, border: `1px solid ${T.hair}`, fontSize: 12, color: T.ink }}
                        labelStyle={{ color: T.inkDim }}
                        formatter={(v: number) => `${v.toFixed(2)}%`}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: T.inkDim, paddingTop: 4 }} />
                      {thresholdCtr != null && (
                        <ReferenceLine
                          y={thresholdCtr * 100}
                          stroke={T.bad}
                          strokeDasharray="4 4"
                          label={{ value: `target ${(thresholdCtr * 100).toFixed(1)}%`, fill: T.bad, fontSize: 10, position: "insideTopRight" }}
                        />
                      )}
                      {queries.map((q, i) => (
                        <Line
                          key={q}
                          type="monotone"
                          dataKey={q}
                          stroke={lineColors[i % lineColors.length]}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{ overflowX: "auto", border: `1px solid ${T.hair}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.panel, textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Date</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Query</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Impr</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Clicks</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>CTR</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Pos</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute, textAlign: "right" }}>Target</th>
                      <th style={{ padding: "10px 12px", fontWeight: 500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.inkMute }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prows.map((r) => {
                      const status =
                        r.threshold_met === null ? { label: "low impr", color: T.inkMute }
                        : r.threshold_met ? { label: "✓ pass", color: T.good }
                        : { label: "✗ miss", color: T.bad };
                      return (
                        <tr key={r.id} style={{ borderTop: `1px solid ${T.hair}` }}>
                          <td style={{ padding: "8px 12px", color: T.inkDim, fontVariantNumeric: "tabular-nums" }}>{r.snapshot_date}</td>
                          <td style={{ padding: "8px 12px" }}>{r.query}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.impressions}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.clicks}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtPct(r.ctr)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtPos(r.position)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: T.inkMute, fontVariantNumeric: "tabular-nums" }}>
                            {r.threshold_ctr != null ? fmtPct(r.threshold_ctr) : "—"}
                          </td>
                          <td style={{ padding: "8px 12px", color: status.color, fontSize: 12 }}>{status.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {rows.length === 0 && !loading && (
          <p style={{ color: T.inkMute, fontSize: 13 }}>
            No snapshots yet. Enter password and click <em>Run snapshot now</em> to record today's data (or wait for the 09:15 UTC cron).
          </p>
        )}
      </div>
    </div>
  );
};

export default CrmGsc;
