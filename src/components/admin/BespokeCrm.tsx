// CRM pipeline pieces for the Bespoke production console: the compact stage
// cell in the table, the filter bar above it and the pipeline panel inside the
// order detail. Manual tracking only — nothing here sends a message.

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CRM_STAGES,
  CRM_STAGE_COUNT,
  SHIPPED_STAGE,
  crmStageLabel,
  crmStageOf,
  crmStageReachedAt,
  crmStageSummary,
} from "@/lib/bespoke-crm";

const T = {
  bg: "#0b0a09",
  panel: "#141210",
  ink: "#efe9df",
  dim: "rgba(239,233,223,0.66)",
  mute: "rgba(239,233,223,0.40)",
  gold: "#c2a05a",
  hair: "rgba(239,233,223,0.10)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

export interface CrmEvent {
  id: string;
  from_stage: number | null;
  to_stage: number | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

const chip = (active: boolean): React.CSSProperties => ({
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "6px 10px",
  borderRadius: 2,
  background: "none",
  cursor: "pointer",
  fontFamily: SANS,
  border: `1px solid ${active ? "rgba(194,160,90,0.55)" : T.hair}`,
  color: active ? T.gold : T.mute,
});

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

export function StageBar({ stage }: { stage: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }} aria-hidden="true">
      {CRM_STAGES.map((s) => (
        <span
          key={s.id}
          style={{
            width: 14,
            height: 4,
            borderRadius: 1,
            background: s.id <= stage ? T.gold : "rgba(239,233,223,0.14)",
          }}
        />
      ))}
    </div>
  );
}

export function StageCell({
  order,
  onNext,
  busy,
}: {
  order: Record<string, unknown>;
  onNext: () => void;
  busy: boolean;
}) {
  const stage = crmStageOf(order);
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 150 }}>
      <StageBar stage={stage} />
      <div style={{ fontSize: 11, color: T.dim, letterSpacing: "0.04em" }}>
        {crmStageSummary(stage)}
      </div>
      {stage < SHIPPED_STAGE && (
        <button
          type="button"
          disabled={busy}
          onClick={onNext}
          style={{
            justifySelf: "start",
            background: "none",
            border: `1px solid ${T.hair}`,
            color: T.gold,
            padding: "5px 10px",
            borderRadius: 2,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: busy ? "wait" : "pointer",
            fontFamily: SANS,
          }}
        >
          Next step →
        </button>
      )}
    </div>
  );
}

export function StageFilterBar({
  orders,
  value,
  onChange,
}: {
  orders: Record<string, unknown>[];
  value: number | "all";
  onChange: (v: number | "all") => void;
}) {
  const count = (id: number) => orders.filter((o) => crmStageOf(o) === id).length;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 14px" }}>
      <button type="button" onClick={() => onChange("all")} style={chip(value === "all")}>
        All ({orders.length})
      </button>
      {CRM_STAGES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          style={chip(value === s.id)}
        >
          {s.id} {s.short} ({count(s.id)})
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail panel                                                               */
/* -------------------------------------------------------------------------- */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy tracking number"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked — the value is visible next to the button */
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: `1px solid ${T.hair}`,
        color: T.ink,
        padding: "6px 10px",
        borderRadius: 2,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: SANS,
      }}
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function PipelinePanel({
  order,
  password,
  initialEvents,
  onOrderChange,
}: {
  order: Record<string, any>;
  password: string;
  initialEvents: CrmEvent[];
  onOrderChange: (patch: Record<string, unknown>) => void;
}) {
  const [events, setEvents] = useState<CrmEvent[]>(initialEvents);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(order.crm_notes ?? "");
  const [shipOpen, setShipOpen] = useState(false);
  const [carrier, setCarrier] = useState<string>(order.courier ?? "");
  const [tracking, setTracking] = useState<string>(order.tracking_number ?? "");

  useEffect(() => {
    setEvents(initialEvents);
    setNotes(order.crm_notes ?? "");
  }, [initialEvents, order.crm_notes]);

  const stage = crmStageOf(order);

  const call = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("bespoke-crm-update", {
        body: { password, id: order.id, ...body },
      });
      if (error) throw error;
      const payload = (data ?? {}) as Record<string, any>;
      if (payload.error) throw new Error(payload.error);
      return payload;
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const moveTo = async (to: number, extra: Record<string, unknown> = {}) => {
    if (to === SHIPPED_STAGE && !String(extra.tracking_number ?? "").trim()) {
      setShipOpen(true);
      return;
    }
    const payload = await call({ action: "stage", stage: to, ...extra });
    if (!payload) return;
    setEvents((payload.events as CrmEvent[]) ?? []);
    onOrderChange({ ...(payload.patch as Record<string, unknown>), crm_stage: to });
    setShipOpen(false);
    setMsg(`Moved to ${to}/${CRM_STAGE_COUNT} · ${crmStageLabel(to)}.`);
  };

  const saveNotes = async () => {
    const payload = await call({ action: "notes", crm_notes: notes });
    if (payload) {
      onOrderChange({ crm_notes: payload.crm_notes ?? null });
      setMsg("Notes saved.");
    }
  };

  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Pipeline</h3>
        <span style={{ fontSize: 11, color: T.mute }}>{crmStageSummary(stage)}</span>
      </div>

      <ol style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
        {CRM_STAGES.map((s) => {
          const done = s.id < stage;
          const current = s.id === stage;
          const reached = crmStageReachedAt(order, s.id);
          return (
            <li
              key={s.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
                borderTop: `1px solid ${T.hair}`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  flex: "0 0 20px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  fontSize: 10,
                  fontWeight: 700,
                  background: done ? T.gold : "none",
                  color: done ? "#1f1b16" : current ? T.gold : T.mute,
                  border: `1px solid ${done || current ? "rgba(194,160,90,0.65)" : T.hair}`,
                }}
              >
                {done ? "✓" : s.id}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: done ? T.gold : current ? T.ink : T.mute,
                    fontWeight: current ? 600 : 400,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: T.mute }}>
                  {reached ? fmtDate(reached) : current ? "Current step" : "Not reached"}
                </div>
              </div>
              {current && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.id > 1 && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void moveTo(s.id - 1)}
                      style={{ ...chip(false), color: T.dim }}
                    >
                      ← Back
                    </button>
                  )}
                  {s.id < SHIPPED_STAGE && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void moveTo(s.id + 1)}
                      style={{
                        background: T.gold,
                        border: "none",
                        color: "#1f1b16",
                        padding: "6px 12px",
                        borderRadius: 2,
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        cursor: busy ? "wait" : "pointer",
                        fontFamily: SANS,
                      }}
                    >
                      Mark done
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {stage === SHIPPED_STAGE && order.tracking_number && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            border: `1px solid ${T.hair}`,
            borderRadius: 2,
            padding: "10px 12px",
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute }}>
            Tracking
          </span>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: T.ink, fontSize: 13 }}>
            {order.courier ? `${order.courier} · ` : ""}
            {order.tracking_number}
          </span>
          <CopyButton value={String(order.tracking_number)} />
        </div>
      )}

      <label style={{ display: "block", marginTop: 16 }}>
        <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute, marginBottom: 5 }}>
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the next person needs to know."
          style={{
            width: "100%",
            padding: "10px 12px",
            background: T.bg,
            border: `1px solid ${T.hair}`,
            color: T.ink,
            borderRadius: 2,
            fontFamily: SANS,
            fontSize: 13,
            resize: "vertical",
          }}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void saveNotes()}
        style={{
          marginTop: 8,
          background: T.gold,
          border: "none",
          color: "#1f1b16",
          padding: "9px 16px",
          borderRadius: 2,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
          cursor: busy ? "wait" : "pointer",
          fontFamily: SANS,
        }}
      >
        Save notes
      </button>
      {msg && <p style={{ color: T.dim, fontSize: 12, marginTop: 10 }}>{msg}</p>}

      <h4 style={{ fontFamily: SERIF, fontSize: 17, margin: "20px 0 4px" }}>Activity</h4>
      {events.length === 0 ? (
        <p style={{ color: T.mute, fontSize: 12, margin: 0 }}>No stage changes recorded yet.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
          {events.map((e) => (
            <li key={e.id} style={{ borderTop: `1px solid ${T.hair}`, padding: "7px 0" }}>
              {fmtDate(e.created_at)} · {e.from_stage ?? "—"} → {e.to_stage ?? "—"}{" "}
              {crmStageLabel(Number(e.to_stage ?? 1))}
              {e.note ? ` · ${e.note}` : ""}
            </li>
          ))}
        </ul>
      )}

      {shipOpen && (
        <div
          onClick={() => setShipOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(5,4,3,0.8)", display: "grid", placeItems: "center", padding: 16, zIndex: 80 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 3, padding: 20, width: "100%", maxWidth: 380 }}
          >
            <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Mark as shipped</h3>
            <p style={{ color: T.dim, fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>
              A tracking number is required before an order reaches Shipped.
            </p>
            {[
              { label: "Carrier", value: carrier, set: setCarrier, placeholder: "DHL Express" },
              { label: "Tracking number", value: tracking, set: setTracking, placeholder: "1234567890" },
            ].map((f) => (
              <label key={f.label} style={{ display: "block", marginBottom: 10 }}>
                <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute, marginBottom: 5 }}>
                  {f.label}
                </span>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: "100%", minHeight: 44, padding: "10px 12px", background: T.bg, border: `1px solid ${T.hair}`, color: T.ink, borderRadius: 2, fontFamily: SANS, fontSize: 13 }}
                />
              </label>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                type="button"
                disabled={busy || tracking.trim() === ""}
                onClick={() =>
                  void moveTo(SHIPPED_STAGE, {
                    carrier: carrier.trim(),
                    tracking_number: tracking.trim(),
                  })
                }
                style={{
                  background: T.gold,
                  border: "none",
                  color: "#1f1b16",
                  padding: "10px 16px",
                  borderRadius: 2,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  cursor: tracking.trim() ? "pointer" : "not-allowed",
                  opacity: tracking.trim() ? 1 : 0.5,
                  fontFamily: SANS,
                }}
              >
                {busy ? "Saving…" : "Save & mark shipped"}
              </button>
              <button type="button" onClick={() => setShipOpen(false)} style={chip(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
