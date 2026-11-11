import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

/**
 * /en/admin/founders - Founder Edition orders paid on woolet.co, ready to ship.
 * Data comes from Stripe through the founder-orders-admin edge function;
 * dispatch fields are saved on the PaymentIntent. Same password as /en/admin/bespoke.
 */

type Order = {
  payment_intent: string;
  session_id: string | null;
  order_ref: string | null;
  paid_at: string;
  amount: number;
  currency: string;
  refunded: number;
  email: string | null;
  name: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  paid_source: string | null;
  courier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  dispatch_note: string | null;
  stripe_url: string;
};

type Filter = "to_ship" | "shipped" | "all";

const PW_KEY = "wlt_bespoke_admin_pw";

const T = {
  bg: "#0b0a09",
  panel: "#141210",
  ink: "#efe9df",
  dim: "rgba(239,233,223,0.68)",
  mute: "rgba(239,233,223,0.42)",
  gold: "#c2a05a",
  hair: "rgba(239,233,223,0.10)",
  green: "#36C46A",
  red: "#E5684F",
};

const addressBlock = (o: Order) =>
  [o.name, o.line1, o.line2, [o.postal_code, o.city].filter(Boolean).join(" "), o.state, o.country]
    .filter((v) => v && String(v).trim())
    .join("\n");

const csvEscape = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function downloadCsv(rows: Order[]) {
  const cols: (keyof Order)[] = [
    "order_ref", "paid_at", "name", "email", "phone", "line1", "line2", "postal_code", "city", "state",
    "country", "amount", "currency", "refunded", "courier", "tracking_number", "shipped_at", "dispatch_note",
    "payment_intent",
  ];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvEscape(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `woolet-founder-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const input: CSSProperties = {
  background: "#0b0a09",
  border: `1px solid ${T.hair}`,
  color: T.ink,
  padding: "8px 10px",
  fontSize: 13,
  borderRadius: 2,
  width: "100%",
  boxSizing: "border-box",
};

const btn: CSSProperties = {
  background: T.gold,
  color: "#0b0a09",
  border: "none",
  padding: "9px 16px",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
  borderRadius: 2,
};

function DispatchForm({ order, password, onSaved }: { order: Order; password: string; onSaved: () => void }) {
  const [courier, setCourier] = useState(order.courier ?? "");
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [shipped, setShipped] = useState(order.shipped_at ?? "");
  const [note, setNote] = useState(order.dispatch_note ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async (markShippedToday = false) => {
    setState("saving");
    const shippedAt = markShippedToday && !shipped ? new Date().toISOString().slice(0, 10) : shipped;
    const { data, error } = await supabase.functions.invoke("founder-orders-admin", {
      body: {
        password,
        action: "dispatch",
        payment_intent: order.payment_intent,
        email: order.email,
        courier,
        tracking_number: tracking,
        shipped_at: shippedAt,
        dispatch_note: note,
      },
    });
    if (error || !data?.ok) {
      setState("error");
      return;
    }
    if (shippedAt !== shipped) setShipped(shippedAt);
    setState("saved");
    onSaved();
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input style={input} placeholder="Courier (DHL, InPost…)" value={courier} onChange={(e) => setCourier(e.target.value)} />
        <input style={input} placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
        <input style={input} type="date" value={shipped} onChange={(e) => setShipped(e.target.value)} />
        <input style={input} placeholder="Note (e.g. address confirmed by email)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" style={btn} onClick={() => save(false)} disabled={state === "saving"}>Save</button>
        {!shipped && (
          <button type="button" style={{ ...btn, background: "transparent", color: T.gold, border: `1px solid ${T.gold}` }} onClick={() => save(true)} disabled={state === "saving"}>
            Mark shipped today
          </button>
        )}
        <span style={{ fontSize: 12, color: state === "error" ? T.red : T.mute }}>
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Save failed" : ""}
        </span>
      </div>
    </div>
  );
}

export default function FoundersAdmin() {
  const [password, setPassword] = useState(() => {
    try {
      return localStorage.getItem(PW_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("to_ship");
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnErr } = await supabase.functions.invoke("founder-orders-admin", {
      body: { password, action: "list" },
    });
    setLoading(false);
    if (fnErr || !Array.isArray(data?.orders)) {
      setAuthed(false);
      setError("Wrong password or the orders could not load.");
      return;
    }
    try {
      localStorage.setItem(PW_KEY, password);
    } catch {
      /* storage blocked */
    }
    setAuthed(true);
    setOrders(data.orders as Order[]);
  }, [password]);

  useEffect(() => {
    if (password && !authed) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(
    () =>
      orders.filter((o) =>
        filter === "all" ? true : filter === "shipped" ? !!o.shipped_at : !o.shipped_at && o.refunded < o.amount,
      ),
    [orders, filter],
  );
  const toShip = orders.filter((o) => !o.shipped_at && o.refunded < o.amount).length;

  const copy = async (o: Order) => {
    const text = [addressBlock(o), o.phone ? `Tel. ${o.phone}` : "", o.email ?? ""].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(o.payment_intent);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: "'Barlow', 'Inter', sans-serif" }}>
      <Helmet>
        <title>Founder orders - Woolet admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: T.gold, margin: 0 }}>Woolet admin</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: 40, margin: "6px 0 20px" }}>
          Founder Edition orders
        </h1>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load();
            }}
            style={{ display: "flex", gap: 8, maxWidth: 420 }}
          >
            <input style={input} type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" style={btn} disabled={loading}>{loading ? "…" : "Open"}</button>
          </form>
        ) : (
          <>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", margin: "0 0 18px" }}>
              <span style={{ fontSize: 15 }}>
                <strong style={{ color: T.gold }}>{toShip}</strong> to ship · {orders.length} paid
              </span>
              {(["to_ship", "shipped", "all"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    background: "transparent",
                    color: filter === f ? T.gold : T.mute,
                    border: "none",
                    borderBottom: `1px solid ${filter === f ? T.gold : "transparent"}`,
                    padding: "6px 4px",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {f === "to_ship" ? "To ship" : f === "shipped" ? "Shipped" : "All"}
                </button>
              ))}
              <span style={{ flex: 1 }} />
              <button type="button" style={{ ...btn, background: "transparent", color: T.gold, border: `1px solid ${T.gold}` }} onClick={() => void load()}>
                {loading ? "Loading…" : "Refresh"}
              </button>
              <button type="button" style={btn} onClick={() => downloadCsv(shown)} disabled={!shown.length}>
                Export CSV
              </button>
            </div>

            {error && <p style={{ color: T.red }}>{error}</p>}
            {!shown.length && <p style={{ color: T.mute }}>No orders here yet.</p>}

            <div style={{ display: "grid", gap: 12 }}>
              {shown.map((o) => (
                <section
                  key={o.payment_intent}
                  style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 2, padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 8 }}>
                      <strong style={{ fontSize: 15 }}>{o.order_ref ?? o.payment_intent}</strong>
                      <span style={{ fontSize: 12, color: T.mute }}>{new Date(o.paid_at).toLocaleString("pl-PL")}</span>
                      <span style={{ fontSize: 12, color: o.shipped_at ? T.green : T.gold }}>
                        {o.shipped_at ? `Shipped ${o.shipped_at}` : "To ship"}
                      </span>
                      {o.refunded > 0 && <span style={{ fontSize: 12, color: T.red }}>Refunded ${o.refunded}</span>}
                    </div>
                    <pre style={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1.5, margin: "0 0 8px", whiteSpace: "pre-wrap", color: T.ink }}>
                      {addressBlock(o) || "No address - check Stripe"}
                    </pre>
                    <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.6 }}>
                      {o.phone && <div>Tel. {o.phone}</div>}
                      {o.email && <div>{o.email}</div>}
                      <div>
                        009 Black · 24 mm bridge · Founder Box · ${o.amount} {o.currency}
                      </div>
                      {o.paid_source && <div style={{ color: T.mute }}>Source: {o.paid_source}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12 }}>
                      <button type="button" onClick={() => void copy(o)} style={{ background: "none", border: "none", color: T.gold, padding: 0, cursor: "pointer", fontSize: 12 }}>
                        {copied === o.payment_intent ? "Copied" : "Copy address"}
                      </button>
                      <a href={o.stripe_url} target="_blank" rel="noreferrer" style={{ color: T.mute }}>Stripe</a>
                    </div>
                  </div>
                  <DispatchForm order={o} password={password} onSaved={() => void load()} />
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
