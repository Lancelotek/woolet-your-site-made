import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  session_id: string;
  email: string;
  paid_at: string;
  environment: string | null;
  first_touch: string | null;
  last_touch: string | null;
  heard_from: string | null;
  days_to_pay: number | null;
  touch_count: number | null;
};

const PW_KEY = "wlt_bespoke_admin_pw";
const srcOf = (t: string | null) => (t ? t.split("/").slice(0, 2).join("/") : "(unknown)");

function countBy(rows: Row[], f: (r: Row) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(f(r), (m.get(f(r)) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Summary({ title, data }: { title: string; data: [string, number][] }) {
  return (
    <div className="border border-border rounded-sm p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary mb-3">{title}</p>
      {data.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
      <ul className="space-y-1">
        {data.slice(0, 10).map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 text-sm">
            <span className="text-foreground truncate">{k}</span>
            <span className="text-muted-foreground tabular-nums">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AttributionAdmin() {
  const [password, setPassword] = useState(() => { try { return localStorage.getItem(PW_KEY) ?? ""; } catch { return ""; } });
  const [rows, setRows] = useState<Row[] | null>(null);
  const [days, setDays] = useState(30);
  const [liveOnly, setLiveOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (d = days) => {
    setError(null);
    const { data, error: e } = await supabase.functions.invoke("attribution-admin", { body: { password, days: d } });
    if (e || !data?.rows) { setError("Invalid password or load failed"); setRows(null); return; }
    try { localStorage.setItem(PW_KEY, password); } catch { /* ignore */ }
    setRows(data.rows);
  };

  useEffect(() => { if (password) void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [days]);

  const shown = useMemo(() => (rows ?? []).filter((r) => !liveOnly || r.environment === "live"), [rows, liveOnly]);
  const googleOrganic = shown.filter((r) => srcOf(r.last_touch) === "google/organic");

  const exportCsv = () => {
    const head = ["paid_at", "email", "first_touch", "last_touch", "heard_from", "days_to_pay", "touch_count"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [head.join(","), ...shown.map((r) => head.map((h) => esc(r[h as keyof Row])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `reservation-attribution-${days || "all"}d.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10">
      <Helmet><title>Attribution - Woolet admin</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl mb-6">Reservation attribution</h1>
        {!rows ? (
          <form className="flex gap-2 max-w-sm" onSubmit={(e) => { e.preventDefault(); void load(); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password"
              className="flex-1 min-h-[44px] px-3 rounded-sm bg-transparent border border-border" />
            <button className="min-h-[44px] px-4 rounded-sm bg-primary text-primary-foreground text-sm">Open</button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[7, 30, 0].map((d) => (
                <button key={d} onClick={() => setDays(d)}
                  className={`min-h-[36px] px-3 rounded-sm border text-sm ${days === d ? "border-primary text-primary" : "border-border"}`}>
                  {d ? `${d} days` : "All"}
                </button>
              ))}
              <label className="ml-4 text-sm flex items-center gap-2">
                <input type="checkbox" checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} /> Live payments only
              </label>
              <span className="text-sm text-muted-foreground ml-auto">{shown.length} reservations</span>
              <button onClick={exportCsv} className="min-h-[36px] px-3 rounded-sm border border-border text-sm">Export CSV</button>
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Summary title="By first touch" data={countBy(shown, (r) => srcOf(r.first_touch))} />
              <Summary title="By last touch" data={countBy(shown, (r) => srcOf(r.last_touch))} />
              <Summary title="By heard from" data={countBy(shown, (r) => r.heard_from || "(no answer)")} />
              <Summary title="Google organic → heard from" data={countBy(googleOrganic, (r) => r.heard_from || "(no answer)")} />
            </div>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>{["Paid", "Email", "First touch", "Last touch", "Heard from", "Days to pay", "Touches"].map((h) => <th key={h} className="py-2 pr-4 font-normal">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.session_id} className="border-t border-border">
                      <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.paid_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{r.email}</td>
                      <td className="py-2 pr-4">{r.first_touch ?? "—"}</td>
                      <td className="py-2 pr-4">{r.last_touch ?? "—"}</td>
                      <td className="py-2 pr-4">{r.heard_from ?? "—"}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.days_to_pay ?? "—"}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.touch_count ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
