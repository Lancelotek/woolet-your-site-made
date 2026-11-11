// Deposit plan block on the Bespoke order detail: what was paid, what is due,
// where the 14-day window stands, and the two things Marek does by hand -
// "Model sent" (starts the window and emails the buyer their link) and
// "Balance paid by hand" (a transfer outside the site).

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { crmErrorMessage } from "@/lib/bespoke-crm";
import { BALANCE_REMINDER_DAY, BALANCE_WINDOW_DAYS, daysLeft, formatUsdCents, type BalanceState } from "@/lib/bespoke-balance";

const T = {
  panel: "#141210",
  ink: "#efe9df",
  dim: "rgba(239,233,223,0.66)",
  mute: "rgba(239,233,223,0.40)",
  gold: "#c2a05a",
  hair: "rgba(239,233,223,0.10)",
  bad: "#e8a39a",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

const STATE_LABEL: Record<BalanceState, string> = {
  not_applicable: "Paid in full at checkout",
  awaiting_model: "Deposit paid · model not sent yet",
  awaiting_payment: "Model sent · waiting for approval",
  revision_requested: "Correction requested · clock paused",
  paid: "Balance paid · ready for production",
  expired: "Closed · balance not paid in time",
};

interface Revision {
  id: string;
  note: string;
  created_at: string;
  resolved_at: string | null;
}

interface Payment {
  payment_plan: string | null;
  amount_cents: number | null;
  total_cents: number | null;
  deposit_cents: number | null;
  balance_cents: number | null;
  model_sent_at: string | null;
  balance_due_at: string | null;
  balance_reminder_sent_at: string | null;
  balance_expired_at: string | null;
  balance_paid_at: string | null;
  balance_paid_cents: number | null;
  balance_paid_manually: boolean | null;
}

interface Snapshot {
  payment: Payment | null;
  revisions: Revision[];
  state: BalanceState;
  modelUrl: string | null;
}

const button = (primary: boolean, disabled: boolean): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "10px 14px",
  borderRadius: 2,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  background: primary ? T.gold : "none",
  color: primary ? "#0b0a09" : T.gold,
  border: `1px solid ${primary ? T.gold : "rgba(194,160,90,0.55)"}`,
});

export function BalancePanel({
  order,
  password,
  onOrderChange,
}: {
  order: { id: string };
  password: string;
  onOrderChange: (patch: Record<string, unknown>) => void;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const [copied, setCopied] = useState(false);

  const call = useCallback(
    async (body: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke("bespoke-crm-update", {
        body: { password, id: order.id, ...body },
      });
      if (error) throw error;
      const payload = (data ?? {}) as Record<string, unknown>;
      if (payload.error) throw new Error(String(payload.error));
      return payload;
    },
    [password, order.id],
  );

  useEffect(() => {
    let alive = true;
    setSnap(null);
    call({ action: "payment" })
      .then((p) => alive && setSnap(p as unknown as Snapshot))
      .catch(() => alive && setSnap({ payment: null, revisions: [], state: "not_applicable", modelUrl: null }));
    return () => {
      alive = false;
    };
  }, [call]);

  const run = async (body: Record<string, unknown>, okText: (p: Record<string, unknown>) => string) => {
    setBusy(true);
    setMsg(null);
    try {
      const p = await call(body);
      const next = p as unknown as Snapshot;
      setSnap(next);
      if (next.payment) onOrderChange({ ...next.payment });
      setMsg({ text: okText(p), tone: "ok" });
    } catch (err) {
      setMsg({ text: crmErrorMessage(err), tone: "bad" });
    } finally {
      setBusy(false);
    }
  };

  const p = snap?.payment;
  // Orders paid in full before the deposit plan have nothing to show here.
  if (!snap || !p || p.payment_plan !== "deposit") return null;

  const state = snap.state;
  const openRevisions = snap.revisions.filter((r) => !r.resolved_at);
  const sent = Boolean(p.model_sent_at);
  const canSendModel = state !== "paid";
  const left = daysLeft(p.balance_due_at);

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", borderTop: `1px solid ${T.hair}` }}>
      <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mute }}>{label}</span>
      <span style={{ fontSize: 13, color: T.ink, textAlign: "right" }}>{value}</span>
    </div>
  );

  return (
    <section id="bespoke-balance" style={{ marginTop: 22, fontFamily: SANS, scrollMarginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Deposit & balance</h3>
        <span style={{ fontSize: 11, color: state === "expired" ? T.bad : T.gold }}>{STATE_LABEL[state]}</span>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "6px 14px 10px" }}>
        {row("Order total", formatUsdCents(p.total_cents))}
        {row("Deposit paid", formatUsdCents(p.deposit_cents ?? p.amount_cents))}
        {row(
          "Balance",
          p.balance_paid_at
            ? `${formatUsdCents(p.balance_paid_cents ?? p.balance_cents)} paid ${fmtDate(p.balance_paid_at)}${p.balance_paid_manually ? " (by hand)" : ""}`
            : `${formatUsdCents(p.balance_cents)} due`,
        )}
        {row("Model sent", sent ? fmtDate(p.model_sent_at) : "Not yet")}
        {sent && !p.balance_paid_at &&
          row(
            `Open until (day ${BALANCE_WINDOW_DAYS})`,
            `${fmtDate(p.balance_due_at)}${state === "awaiting_payment" ? ` · ${left} day${left === 1 ? "" : "s"} left` : ""}`,
          )}
        {sent && !p.balance_paid_at &&
          row(`Reminder (day ${BALANCE_REMINDER_DAY})`, p.balance_reminder_sent_at ? `Sent ${fmtDate(p.balance_reminder_sent_at)}` : "Not sent yet")}
        {p.balance_expired_at && row("Closed", fmtDate(p.balance_expired_at))}
      </div>

      {openRevisions.length > 0 && (
        <div role="status" style={{ marginTop: 10, border: "1px solid rgba(194,160,90,0.55)", borderRadius: 4, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold }}>
            Correction requested - send a corrected model, then press "Corrected model sent"
          </div>
          {openRevisions.map((r) => (
            <p key={r.id} style={{ margin: "8px 0 0", fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
              <span style={{ color: T.mute }}>{fmtDate(r.created_at)} · </span>
              {r.note}
            </p>
          ))}
        </div>
      )}

      {snap.revisions.some((r) => r.resolved_at) && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 11, color: T.mute, cursor: "pointer" }}>
            Earlier corrections ({snap.revisions.filter((r) => r.resolved_at).length})
          </summary>
          {snap.revisions
            .filter((r) => r.resolved_at)
            .map((r) => (
              <p key={r.id} style={{ margin: "6px 0 0", fontSize: 12, color: T.dim, lineHeight: 1.5 }}>
                {fmtDate(r.created_at)} · {r.note}
              </p>
            ))}
        </details>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {canSendModel && (
          <button
            type="button"
            disabled={busy}
            style={button(true, busy)}
            onClick={() => {
              const label = sent ? "Send the corrected-model email and restart the 14 days?" : "Email the customer their approval link and start the 14 days?";
              if (!window.confirm(label)) return;
              void run({ action: "model_sent" }, (r) =>
                r.emailed
                  ? `Customer emailed. The ${BALANCE_WINDOW_DAYS}-day window started.`
                  : `The ${BALANCE_WINDOW_DAYS}-day window started, but the email did not go out - send the link below by hand.`,
              );
            }}
          >
            {sent ? "Corrected model sent" : "Model sent - start 14 days"}
          </button>
        )}
        {snap.modelUrl && (
          <button
            type="button"
            style={button(false, false)}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(snap.modelUrl ?? "");
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2500);
              } catch {
                window.prompt("Copy the customer's link", snap.modelUrl ?? "");
              }
            }}
          >
            {copied ? "Link copied" : "Copy customer link"}
          </button>
        )}
        {!p.balance_paid_at && (
          <button
            type="button"
            disabled={busy}
            style={button(false, busy)}
            onClick={() => {
              if (!window.confirm(`Mark the ${formatUsdCents(p.balance_cents)} balance as paid outside the site? This unlocks production.`)) return;
              void run({ action: "mark_balance_paid" }, () => "Balance marked as paid.");
            }}
          >
            Balance paid by hand
          </button>
        )}
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 11, color: T.mute, lineHeight: 1.5 }}>
        Send the model video and drawing from support@woolet.co first, then press the button: the customer gets an email
        with their approval link. "In production" stays locked until the balance is paid.
      </p>

      {msg && (
        <p role="status" style={{ margin: "8px 0 0", fontSize: 12, color: msg.tone === "ok" ? T.gold : T.bad }}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
