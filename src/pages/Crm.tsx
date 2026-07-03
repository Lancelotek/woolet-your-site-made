import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CrmTabs } from "./crm/CrmTabs";

type Product = "007" | "009" | "bespoke" | "all";

interface Row {
  email: string;
  phone: string | null;
  product: string;
  status: "lead" | "paid";
  amount_usd: number | null;
  environment: string | null;
  locale: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

interface Summary {
  total: number;
  paid: number;
  leads: number;
  by_product: Record<"007" | "009" | "bespoke", number>;
}

const T = {
  bg: "#0b0a09",
  panel: "#141210",
  ink: "#efe9df",
  inkDim: "rgba(239,233,223,0.68)",
  inkMute: "rgba(239,233,223,0.42)",
  gold: "#c2a05a",
  hair: "rgba(239,233,223,0.10)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const csvEscape = (v: unknown) => {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCsv = (rows: Row[], product: Product) => {
  const headers = [
    "email", "phone", "product", "status", "amount_usd", "environment",
    "locale", "utm_source", "utm_medium", "utm_campaign", "stripe_session_id", "created_at",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape((r as unknown as Record<string, unknown>)[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `woolet-crm-${product}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function Crm() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [product, setProduct] = useState<Product>("all");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDelete = async (r: Row) => {
    const label = `${r.email} (${r.status})`;
    if (!window.confirm(`Delete reservation for ${label}? This cannot be undone.`)) return;
    const key = `${r.email}-${r.status}`;
    setDeletingKey(key);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("admin-crm", {
        body: { password, action: "delete", email: r.email, status: r.status },
      });
      if (fnErr) throw fnErr;
      if (!data || data.error) throw new Error(data?.error || "Failed to delete");
      setRows((prev) => prev.filter((x) => !(x.email === r.email && x.status === r.status)));
      fetchData(password, product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingKey(null);
    }
  };

  const fetchData = async (pwd: string, prod: Product) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("admin-crm", {
        body: {
          password: pwd,
          product: prod === "all" ? undefined : prod,
        },
      });
      if (fnErr) throw fnErr;
      if (!data || data.error) throw new Error(data?.error || "Failed to load");
      setRows(data.rows as Row[]);
      setSummary(data.summary as Summary);
      setAuthed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(password, product);
  };

  const handleProductChange = (next: Product) => {
    setProduct(next);
    if (authed) fetchData(password, next);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontFamily: SANS, fontSize: 15,
    border: `1px solid ${T.hair}`, borderRadius: 4, background: T.panel,
    color: T.ink, outline: "none", boxSizing: "border-box",
  };

  return (
    <>
      <Helmet>
        <title>Woolet CRM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: SANS }}>
        <header style={{ borderBottom: `1px solid ${T.hair}`, padding: "18px 24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/src/assets/woolet-wordmark.svg" alt="Woolet" style={{ height: 16, width: "auto", display: "block" }} />
              <span style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: "0.02em", color: T.gold, fontStyle: "italic" }}>CRM</span>
            </div>
            <CrmTabs current="reservations" />
          </div>
        </header>

        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 24px 80px" }}>
          {!authed ? (
            <div style={{ maxWidth: 380, margin: "60px auto 0" }}>
              <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, marginBottom: 8 }}>Sign in</h1>
              <p style={{ color: T.inkDim, fontSize: 13, marginBottom: 22 }}>
                Enter the CRM password to view reservations.
              </p>
              <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
                {error && (
                  <div style={{ fontSize: 12, color: "#e57373" }}>{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "13px 0", background: T.gold, color: T.bg, border: "none",
                    borderRadius: 2, cursor: loading ? "wait" : "pointer",
                    fontWeight: 600, fontSize: 12, letterSpacing: "0.22em",
                    textTransform: "uppercase", opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Loading…" : "Enter CRM"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Summary */}
              {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {[
                    ["Total", summary.total],
                    ["Paid", summary.paid],
                    ["Leads (unpaid)", summary.leads],
                    ["007", summary.by_product["007"]],
                    ["009", summary.by_product["009"]],
                    ["Bespoke", summary.by_product.bespoke],
                  ].map(([label, val]) => (
                    <div key={String(label)} style={{
                      background: T.panel, border: `1px solid ${T.hair}`,
                      padding: "14px 16px", borderRadius: 4,
                    }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: T.inkMute, marginBottom: 6 }}>
                        {label}
                      </div>
                      <div style={{ fontFamily: SERIF, fontSize: 26, color: T.ink }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["all", "007", "009", "bespoke"] as Product[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleProductChange(p)}
                      style={{
                        padding: "9px 16px", cursor: "pointer",
                        background: product === p ? T.gold : "transparent",
                        color: product === p ? T.bg : T.ink,
                        border: `1px solid ${product === p ? T.gold : T.hair}`,
                        borderRadius: 2, fontSize: 11,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                        fontWeight: product === p ? 600 : 400,
                      }}
                    >
                      {p === "all" ? "All" : p === "bespoke" ? "Bespoke" : p}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => fetchData(password, product)}
                    disabled={loading}
                    style={{
                      padding: "9px 16px", cursor: "pointer",
                      background: "transparent", color: T.ink,
                      border: `1px solid ${T.hair}`, borderRadius: 2,
                      fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                    }}
                  >
                    {loading ? "…" : "Refresh"}
                  </button>
                  <button
                    onClick={() => downloadCsv(rows, product)}
                    disabled={rows.length === 0}
                    style={{
                      padding: "9px 16px", cursor: rows.length ? "pointer" : "not-allowed",
                      background: T.ink, color: T.bg, border: "none", borderRadius: 2,
                      fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                      fontWeight: 600, opacity: rows.length ? 1 : 0.4,
                    }}
                  >
                    Export CSV ({rows.length})
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 12, color: "#e57373", marginBottom: 12 }}>{error}</div>
              )}

              {/* Table */}
              <div style={{ overflowX: "auto", background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.hair}` }}>
                      {["Date", "Email", "Phone", "Product", "Status", "Amount", "UTM", "Env", ""].map((h, i) => (
                        <th key={h + i} style={{
                          textAlign: "left", padding: "12px 14px",
                          fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                          color: T.inkMute, fontWeight: 500,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && !loading && (
                      <tr>
                        <td colSpan={9} style={{ padding: "40px 14px", textAlign: "center", color: T.inkMute }}>
                          No reservations yet.
                        </td>
                      </tr>
                    )}
                    {rows.map((r, i) => (
                      <tr key={`${r.email}-${r.created_at}-${i}`} style={{ borderBottom: `1px solid ${T.hair}` }}>
                        <td style={{ padding: "11px 14px", color: T.inkDim, whiteSpace: "nowrap" }}>
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: "11px 14px", color: T.ink }}>{r.email}</td>
                        <td style={{ padding: "11px 14px", color: T.inkDim }}>{r.phone || "—"}</td>
                        <td style={{ padding: "11px 14px", color: T.ink, textTransform: "capitalize" }}>{r.product}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999, fontSize: 10,
                            letterSpacing: "0.14em", textTransform: "uppercase",
                            background: r.status === "paid" ? T.gold : "transparent",
                            color: r.status === "paid" ? T.bg : T.inkDim,
                            border: r.status === "paid" ? "none" : `1px solid ${T.hair}`,
                            fontWeight: r.status === "paid" ? 600 : 400,
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: "11px 14px", color: T.ink }}>
                          {r.amount_usd != null ? `$${r.amount_usd.toFixed(2)}` : "—"}
                        </td>
                        <td style={{ padding: "11px 14px", color: T.inkMute, fontSize: 11 }}>
                          {[r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td style={{ padding: "11px 14px", color: T.inkMute, fontSize: 11 }}>{r.environment || "—"}</td>
                        <td style={{ padding: "11px 14px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDelete(r)}
                            disabled={deletingKey === `${r.email}-${r.status}`}
                            title="Delete reservation"
                            style={{
                              padding: "6px 10px", cursor: "pointer",
                              background: "transparent", color: "#e57373",
                              border: `1px solid rgba(229,115,115,0.35)`, borderRadius: 2,
                              fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                              opacity: deletingKey === `${r.email}-${r.status}` ? 0.5 : 1,
                            }}
                          >
                            {deletingKey === `${r.email}-${r.status}` ? "…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
