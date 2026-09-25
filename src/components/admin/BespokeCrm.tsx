// CRM pipeline pieces for the Bespoke production console: the compact stage
// cell in the table, the filter bar above it and the pipeline panel inside the
// order detail. Manual tracking only — nothing here sends a message.

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CRM_STAGES,
  CRM_STAGE_COUNT,
  SHIPPED_STAGE,
  crmErrorMessage,
  crmStageLabel,
  crmStageOf,
  crmStageReachedAt,
  crmStageShort,
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
          // The label names the destination, so nobody has to remember what
          // step four was before they click.
          title={
            stage + 1 === SHIPPED_STAGE
              ? "Opens the order — shipping needs a tracking number"
              : `Move to ${crmStageLabel(stage + 1)}`
          }
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
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy
            ? "Saving…"
            : stage + 1 === SHIPPED_STAGE
              ? "Ship…"
              : `Next: ${crmStageShort(stage + 1)} →`}
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
  const shown = value === "all" ? orders.length : count(value);
  return (
    <div style={{ margin: "0 0 14px" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
      {/* A filtered table looks identical to an empty one, so say what is hidden. */}
      {value !== "all" && (
        <p
          role="status"
          style={{ fontSize: 11, color: T.mute, margin: "9px 0 0", fontFamily: SANS }}
        >
          Showing {shown} of {orders.length} orders · {crmStageLabel(value)}{" "}
          <button
            type="button"
            onClick={() => onChange("all")}
            style={{
              background: "none",
              border: "none",
              color: T.gold,
              cursor: "pointer",
              fontSize: 11,
              textDecoration: "underline",
              padding: 0,
              fontFamily: SANS,
            }}
          >
            Clear filter
          </button>
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Undo bar                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A stage moves on a single click, so the click has to be reversible. The bar
 * sits above everything for a few seconds and then leaves quietly.
 */
export function UndoBar({
  label,
  onUndo,
  onDismiss,
  busy,
}: {
  label: string;
  onUndo: () => void;
  onDismiss: () => void;
  busy: boolean;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 9000);
    return () => window.clearTimeout(t);
  }, [label, onDismiss]);

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 22,
        transform: "translateX(-50%)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: T.panel,
        border: `1px solid rgba(194,160,90,0.4)`,
        borderRadius: 3,
        padding: "11px 14px",
        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.9)",
        fontFamily: SANS,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ fontSize: 12, color: T.ink }}>{label}</span>
      <button
        type="button"
        disabled={busy}
        onClick={onUndo}
        style={{ ...chip(true), padding: "6px 12px", cursor: busy ? "wait" : "pointer" }}
      >
        {busy ? "Undoing…" : "Undo"}
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: T.mute,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>
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
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const [savedNotes, setSavedNotes] = useState<string>(order.crm_notes ?? "");
  const [notes, setNotes] = useState<string>(order.crm_notes ?? "");
  const [shipOpen, setShipOpen] = useState(false);
  const [carrier, setCarrier] = useState<string>(order.courier ?? "");
  const [tracking, setTracking] = useState<string>(order.tracking_number ?? "");
  const carrierRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEvents(initialEvents);
    setSavedNotes(order.crm_notes ?? "");
    setNotes(order.crm_notes ?? "");
  }, [initialEvents, order.crm_notes]);

  // A confirmation that never leaves starts to read like part of the layout.
  useEffect(() => {
    if (!msg || msg.tone !== "ok") return;
    const t = window.setTimeout(() => setMsg(null), 4000);
    return () => window.clearTimeout(t);
  }, [msg]);

  // Escape closes the shipping dialog, and the cursor starts in the first field.
  useEffect(() => {
    if (!shipOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShipOpen(false);
    };
    window.addEventListener("keydown", onKey);
    carrierRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [shipOpen]);

  const notesDirty = notes !== savedNotes;

  // Leaving with unsaved notes loses them, so the browser asks first.
  useEffect(() => {
    if (!notesDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [notesDirty]);

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
      setMsg({ text: crmErrorMessage(err), tone: "bad" });
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
    // Stepping back wipes the dates of every step above it — that cannot be
    // recovered, so it is the one move that asks first.
    if (to < stage) {
      const losing = CRM_STAGES.filter((s) => s.id > to && crmStageReachedAt(order, s.id));
      const list = losing.map((s) => s.label).join(", ");
      const ok = window.confirm(
        `Move back to ${crmStageLabel(to)}?` +
          (list ? `\n\nThis clears the date recorded for: ${list}. That cannot be undone.` : ""),
      );
      if (!ok) return;
    }
    const payload = await call({ action: "stage", stage: to, ...extra });
    if (!payload) return;
    setEvents((payload.events as CrmEvent[]) ?? []);
    onOrderChange({ ...(payload.patch as Record<string, unknown>), crm_stage: to });
    setShipOpen(false);
    setMsg({ text: `Moved to ${to}/${CRM_STAGE_COUNT} · ${crmStageLabel(to)}.`, tone: "ok" });
  };

  const saveNotes = async () => {
    const payload = await call({ action: "notes", crm_notes: notes });
    if (payload) {
      const saved = (payload.crm_notes as string | null) ?? "";
      setSavedNotes(saved);
      onOrderChange({ crm_notes: payload.crm_notes ?? null });
      setMsg({ text: "Notes saved.", tone: "ok" });
    }
  };

  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Pipeline</h3>
        <span style={{ fontSize: 11, color: T.mute }}>
          {crmStageSummary(stage)}
          {stage > 1 ? " · click a done step to move back" : ""}
        </span>
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
                {/* Done steps are clickable: a click jumps straight back to that
                    stage, with the wipe-of-later-dates confirmation in moveTo. */}
                {done ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void moveTo(s.id)}
                    title={`Move back to ${s.label}`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: 13,
                      color: T.gold,
                      fontWeight: 400,
                      cursor: busy ? "wait" : "pointer",
                      fontFamily: SANS,
                      textAlign: "left",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: 3,
                      textDecorationColor: "rgba(194,160,90,0.45)",
                    }}
                  >
                    {s.label}
                  </button>
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      color: current ? T.ink : T.mute,
                      fontWeight: current ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </div>
                )}
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={busy || !notesDirty}
          onClick={() => void saveNotes()}
          style={{
            background: notesDirty ? T.gold : "none",
            border: notesDirty ? "none" : `1px solid ${T.hair}`,
            color: notesDirty ? "#1f1b16" : T.mute,
            padding: "9px 16px",
            borderRadius: 2,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: busy ? "wait" : notesDirty ? "pointer" : "default",
            fontFamily: SANS,
          }}
        >
          {busy ? "Saving…" : notesDirty ? "Save notes" : "Saved"}
        </button>
        {notesDirty && (
          <span style={{ fontSize: 11, color: T.gold, fontFamily: SANS }}>Unsaved changes</span>
        )}
      </div>
      {msg && (
        <p
          role="status"
          style={{ color: msg.tone === "bad" ? "#e2725b" : T.dim, fontSize: 12, marginTop: 10 }}
        >
          {msg.text}
        </p>
      )}

      <h4 style={{ fontFamily: SERIF, fontSize: 17, margin: "20px 0 4px" }}>Activity</h4>
      {events.length === 0 ? (
        <p style={{ color: T.mute, fontSize: 12, margin: 0 }}>No stage changes recorded yet.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
          {events.map((e) => (
            <li key={e.id} style={{ borderTop: `1px solid ${T.hair}`, padding: "7px 0" }}>
              {fmtDate(e.created_at)} ·{" "}
              {e.to_stage == null ? null : (
                <>
                  {e.from_stage ? `${crmStageShort(e.from_stage)} → ` : "Started at "}
                  <span style={{ color: T.ink }}>{crmStageLabel(Number(e.to_stage))}</span>
                </>
              )}
              {e.created_by ? ` · ${e.created_by}` : ""}
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-ship-title"
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 3, padding: 20, width: "100%", maxWidth: 380 }}
          >
            <h3 id="crm-ship-title" style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>
              Mark as shipped
            </h3>
            <p style={{ color: T.dim, fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>
              A tracking number is required before an order reaches Shipped. Press Esc to close.
            </p>
            {[
              { label: "Carrier", value: carrier, set: setCarrier, placeholder: "DHL Express", ref: carrierRef },
              { label: "Tracking number", value: tracking, set: setTracking, placeholder: "1234567890", ref: undefined },
            ].map((f) => (
              <label key={f.label} style={{ display: "block", marginBottom: 10 }}>
                <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute, marginBottom: 5 }}>
                  {f.label}
                </span>
                <input
                  ref={f.ref}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tracking.trim() && !busy) {
                      void moveTo(SHIPPED_STAGE, {
                        carrier: carrier.trim(),
                        tracking_number: tracking.trim(),
                      });
                    }
                  }}
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
