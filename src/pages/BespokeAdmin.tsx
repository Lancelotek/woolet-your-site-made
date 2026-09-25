import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STAGE_LABELS, type BespokeStage } from "@/lib/bespoke-case";
import { bespokeOrderGaps, lensWithStrength, needsReadingStrength } from "@/lib/bespoke-gaps";
import { exportShippingCsv, exportShippingXlsx } from "@/lib/bespoke-shipping-export";
import { crmErrorMessage, crmStageLabel, crmStageOf, SHIPPED_STAGE } from "@/lib/bespoke-crm";
import {
  PipelinePanel,
  StageCell,
  StageFilterBar,
  UndoBar,
  type CrmEvent,
} from "@/components/admin/BespokeCrm";

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

interface Row {
  id: string;
  created_at: string;
  case_no: string | null;
  case_seq: number | null;
  stage: string | null;
  customer_email: string;
  customer_name: string | null;
  source: string | null;
  frame_name: string | null;
  front_code: string | null;
  temple_code: string | null;
  finish_id: string | null;
  lens_type: string | null;
  lens_tint_code: string | null;
  reading_strength_mode: string | null;
  reading_strength: string | null;
  reading_strength_left: string | null;
  reading_strength_right: string | null;
  engraving_text: string | null;
  amount_cents: number | null;
  currency: string | null;
  environment: string | null;
  measurements_submitted_at: string | null;
  session_ref: string | null;
  production_blocked: boolean;
  stripe_session_id: string;
  has_photo: boolean;
  has_tryon: boolean;
  consent_at: string | null;
  consent_withdrawn_at: string | null;
  shipping_submitted_at: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  [key: string]: unknown;
}

import { compareRepeatability, sortScans, type ScanRow } from "@/lib/scan-repeatability";
import { SCAN_SOURCE_LABEL } from "@/lib/fitlens-verify";

type OrderRecord = Record<string, unknown>;

interface Detail {
  order: OrderRecord;
  photo: OrderRecord | null;
  scan: OrderRecord | null;
  /** Every scan for this order, newest first. */
  scans?: OrderRecord[];
  /** Pipeline history, newest first. */
  crm_events?: CrmEvent[];
  files: {
    photo_url: string | null;
    vto_url: string | null;
    geometry_url: string | null;
    preview_url?: string | null;
  };
}

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

const fmtAmount = (cents?: number | null, currency?: string | null) =>
  cents == null ? "—" : `${(cents / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}`;

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const fmtCountry = (country?: string | null) => {
  if (!country) return "Not provided";
  const code = country.trim().toUpperCase();
  if (code.length !== 2) return country;
  return `${countryNames.of(code) ?? code} · ${code}`;
};

const mm = (v: unknown) => (v == null || v === "" ? "" : `${v} mm`);
const s = (v: unknown) => (v == null ? null : String(v));

const PW_KEY = "wlt_bespoke_admin_pw";
const STAGE_FILTER_KEY = "wlt_bespoke_stage_filter";

export default function BespokeAdmin() {
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
  const [rows, setRows] = useState<Row[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [tintFilter, setTintFilter] = useState("all");
  // The filter survives a reload: the console is usually reopened to carry on
  // with the same batch of orders.
  const [stageFilter, setStageFilter] = useState<number | "all">(() => {
    try {
      const raw = localStorage.getItem(STAGE_FILTER_KEY);
      if (!raw || raw === "all") return "all";
      const n = Number(raw);
      return n >= 1 && n <= SHIPPED_STAGE ? n : "all";
    } catch {
      return "all";
    }
  });
  const [undoState, setUndoState] = useState<
    { id: string; from: number; to: number; label: string } | null
  >(null);
  const [undoBusy, setUndoBusy] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STAGE_FILTER_KEY, String(stageFilter));
    } catch {
      /* ignore */
    }
  }, [stageFilter]);

  const stageRows =
    stageFilter === "all"
      ? rows
      : rows.filter((r) => crmStageOf(r as unknown as Record<string, unknown>) === stageFilter);
  const visibleRows = tintFilter === "all" ? stageRows : stageRows.filter((r) => r.lens_tint_code === tintFilter);

  // Keeps the row, the open detail view and the exports on the same numbers
  // after a stage moves — no reload needed.
  const applyOrderPatch = (id: string, patch: Record<string, unknown>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? ({ ...r, ...patch } as Row) : r)));
    setDetail((d) =>
      d && String(d.order.id) === id ? { ...d, order: { ...d.order, ...patch } } : d,
    );
  };

  const setStage = async (id: string, to: number) => {
    const { data, error: fnErr } = await supabase.functions.invoke("bespoke-crm-update", {
      body: { password, id, action: "stage", stage: to },
    });
    if (fnErr) throw fnErr;
    const payload = (data ?? {}) as Record<string, any>;
    if (payload.error) throw new Error(payload.error);
    applyOrderPatch(id, { ...(payload.patch ?? {}), crm_stage: to });
  };

  // Row shortcut. One click moves the order and offers a few seconds to take
  // it back. The last step needs a tracking number, so it opens the order.
  const quickNext = async (r: Row) => {
    const from = crmStageOf(r as Record<string, unknown>);
    const next = from + 1;
    if (next > SHIPPED_STAGE) return;
    if (next === SHIPPED_STAGE) {
      await openDetail(r.id);
      return;
    }
    setBusy(`stage:${r.id}`);
    setError(null);
    try {
      await setStage(r.id, next);
      setUndoState({
        id: r.id,
        from,
        to: next,
        label: `${r.customer_name || r.customer_email || "Order"} → ${crmStageLabel(next)}`,
      });
    } catch (err) {
      setError(crmErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const undoStage = async () => {
    if (!undoState) return;
    setUndoBusy(true);
    setError(null);
    try {
      await setStage(undoState.id, undoState.from);
      setUndoState(null);
    } catch (err) {
      setError(crmErrorMessage(err));
    } finally {
      setUndoBusy(false);
    }
  };

  const call = async (body: Record<string, unknown>) => {
    const { data, error: fnErr } = await supabase.functions.invoke("bespoke-admin-orders", {
      body: { password, ...body },
    });
    if (fnErr) throw fnErr;
    if (!data || (data as { error?: string }).error) {
      throw new Error((data as { error?: string })?.error || "Request failed");
    }
    return data as Record<string, unknown>;
  };

  const load = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await call({ action: "list" });
      setRows((data.rows as Row[]) ?? []);
      setAuthed(true);
      try {
        localStorage.setItem(PW_KEY, password);
      } catch {
        /* ignore */
      }
    } catch (err) {
      try {
        localStorage.removeItem(PW_KEY);
      } catch {
        /* ignore */
      }
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password && !authed) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exports exactly the rows currently loaded in the panel.
  const exportShipping = async (format: "xlsx" | "csv") => {
    setBusy(format);
    setError(null);
    try {
      if (format === "csv") exportShippingCsv(rows);
      else await exportShippingXlsx(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const openDetail = async (id: string) => {
    setDetailBusy(true);
    setError(null);
    try {
      const data = await call({ action: "detail", id });
      setDetail(data as unknown as Detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setDetailBusy(false);
    }
  };

  const reportData = (d: Detail) => {
    const o = d.order;
    const photo = d.photo;
    return {
      sessionId: String(o.stripe_session_id ?? ""),
      orderCreatedAt: s(o.created_at),
      frameName: s(o.frame_name),
      frontCode: s(o.front_code),
      templeCode: s(o.temple_code),
      finishId: s(o.finish_id),
      lensType: lensWithStrength(o as Record<string, any>),
      lensTint: s(o.lens_tint_code) ? (s(o.lens_type)?.match(/([^()]+ \((?:SUN|PH)-[A-Z0-9]+\))$/)?.[1]?.trim() ?? s(o.lens_tint_code)) : null,
      engravingText: s(o.engraving_text),
      amountLabel: fmtAmount(o.amount_cents as number | null, o.currency as string | null),
      customerRef: s(o.customer_email),
      requestedTempleLength: s((o.metadata as Record<string, unknown> | null)?.temple_length),
      aiPreviewUrl: d.files.preview_url ?? s(o.ai_preview_url),
      measurementRef: s((d.scans?.[0] ?? d.scan)?.measurement_ref),
      tryOnUrl: d.files.vto_url,
      shipping: {
        name: s(o.shipping_name),
        line1: s(o.shipping_line1),
        line2: s(o.shipping_line2),
        city: s(o.shipping_city),
        state: s(o.shipping_state),
        postalCode: s(o.shipping_postal_code),
        country: s(o.shipping_country),
        submittedAt: s(o.shipping_submitted_at),
      },
      consent: photo
        ? {
            grantedAt: s(photo.consent_at),
            withdrawnAt: s(photo.consent_withdrawn_at),

            version: s(photo.consent_version),
            locale: s(photo.consent_locale),
          }
        : null,
      measurements: {
        ai: {
          "Face width": mm(o.ai_face_width_mm),
          "Temple-to-temple": mm(o.ai_temple_to_temple_mm),
          "Frame bridge": mm(o.ai_bridge_width_mm),
          "Inner-canthal distance (face)": mm(o.ai_inner_canthal_mm),
          "Pupillary distance": mm(o.ai_pd_mm),

        },
        manual: {
          "Face width": mm(o.manual_face_width_mm),
          "Temple-to-temple": mm(o.manual_temple_to_temple_mm),
          "Bridge width": mm(o.manual_bridge_width_mm),
          "Pupillary distance": mm(o.manual_pd_mm),
          "Temple length": mm(o.manual_temple_length_mm),
          "Head circumference": mm(o.manual_head_circumference_mm),
          "Ear-to-ear over crown": mm(o.manual_ear_to_ear_mm),
        },
        aiNotes: s(o.ai_notes),
        manualNotes: s(o.manual_notes),
      },
    };
  };

  const downloadPdf = async (d: Detail) => {
    setBusy("pdf");
    try {
      const { downloadWorkshopReport } = await import("@/lib/bespoke-workshop-pdf");
      await downloadWorkshopReport(reportData(d));
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF failed");
    } finally {
      setBusy(null);
    }
  };

  // Re-renders the frame visualisation from the order's own specification and
  // refreshes the detail view so the new image reaches the workshop PDF.
  const renderPreview = async (d: Detail) => {
    setBusy("render");
    setError(null);
    try {
      await call({ action: "render_preview", id: String(d.order.id ?? "") });
      await openDetail(String(d.order.id ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setBusy(null);
    }
  };



  const downloadBundle = async (d: Detail) => {
    setBusy("zip");
    try {
      const [{ default: JSZip }, { buildWorkshopReportBlob }] = await Promise.all([
        import("jszip"),
        import("@/lib/bespoke-workshop-pdf"),
      ]);
      const zip = new JSZip();
      const ref = String(d.order.stripe_session_id ?? "order").slice(-12);
      zip.file(`workshop-report-${ref}.pdf`, await buildWorkshopReportBlob(reportData(d)));
      const add = async (url: string | null, name: string) => {
        if (!url) return;
        const res = await fetch(url);
        if (res.ok) zip.file(name, await res.blob());
      };
      await add(d.files.photo_url, `customer-photo-${ref}.jpg`);
      await add(d.files.vto_url, `on-face-${ref}.png`);
      await add(d.files.geometry_url, `geometry-${ref}.png`);
      zip.file(
        `order-data-${ref}.json`,
        JSON.stringify({ order: d.order, photo: d.photo, scan: d.scan }, null, 2),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `woolet-bespoke-${ref}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bundle failed");
    } finally {
      setBusy(null);
    }
  };

  const pill = (label: string, ok: boolean) => (
    <span
      style={{
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 2,
        border: `1px solid ${ok ? "rgba(194,160,90,0.5)" : T.hair}`,
        color: ok ? T.gold : T.mute,
      }}
    >
      {label}
    </span>
  );

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: SANS, display: "grid", placeItems: "center", padding: 24 }}>
        <Helmet>
          <title>Bespoke production — Woolet</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <form onSubmit={load} style={{ width: "100%", maxWidth: 360, display: "grid", gap: 14 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 30, margin: 0 }}>Bespoke production</h1>
          <p style={{ color: T.dim, fontSize: 13, margin: 0 }}>Internal console — admin password required.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            style={{ padding: "12px 14px", background: T.panel, border: `1px solid ${T.hair}`, color: T.ink, borderRadius: 2, fontFamily: SANS }}
          />
          {error && <div style={{ color: "#e2725b", fontSize: 12 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 0", background: T.gold, color: "#1f1b16", border: "none", borderRadius: 2, fontWeight: 600, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: SANS }}>
      <Helmet>
        <title>Bespoke production — Woolet</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 80px" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, margin: 0 }}>Bespoke production</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => void exportShipping("xlsx")}
              disabled={busy === "xlsx" || rows.length === 0}
              style={{ background: T.gold, border: "none", color: "#1f1b16", padding: "8px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
            >
              {busy === "xlsx" ? "Building…" : "Export shipping (XLSX)"}
            </button>
            <button
              onClick={() => void exportShipping("csv")}
              disabled={busy === "csv" || rows.length === 0}
              style={{ background: "none", border: `1px solid ${T.hair}`, color: T.dim, padding: "8px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Export shipping (CSV)
            </button>
            <button onClick={() => load()} style={{ background: "none", border: `1px solid ${T.hair}`, color: T.dim, padding: "8px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
              Refresh
            </button>
          </div>
        </header>

        {error && <div style={{ color: "#e2725b", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <StageFilterBar
          orders={rows as unknown as Record<string, unknown>[]}
          value={stageFilter}
          onChange={setStageFilter}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "12px 0 18px", color: T.dim, fontSize: 12 }}>
          Lens colour
          <select aria-label="Filter by lens colour" value={tintFilter} onChange={(e) => setTintFilter(e.target.value)} style={{ background: T.panel, color: T.ink, border: `1px solid ${T.hair}`, padding: "8px 10px", borderRadius: 2 }}>
            <option value="all">All colours</option>
            {Array.from(new Set(rows.map((r) => r.lens_tint_code).filter((code): code is string => Boolean(code)))).sort().map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <div style={{ border: `1px solid ${T.hair}`, borderRadius: 3, overflowX: "auto", background: T.panel }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: T.mute, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {["Date", "Customer", "Country", "Discovery source", "Frame", "Lenses", "Paid", "Stage", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${T.hair}`, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.hair}` }}>
                  <td style={{ padding: "12px 14px", color: T.dim, whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div>{r.customer_name || "—"}</div>
                    {r.case_no && (
                      <div style={{ color: T.gold, fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.06em" }}>
                        {r.case_no}
                      </div>
                    )}
                    <div style={{ color: T.mute, fontSize: 12 }}>{r.customer_email}</div>
                  </td>
                  <td style={{ padding: "12px 14px", color: r.shipping_country ? T.dim : T.mute, whiteSpace: "nowrap" }}>
                    {fmtCountry(r.shipping_country)}
                  </td>
                  <td style={{ padding: "12px 14px", color: r.source ? T.dim : T.mute }}>{r.source || "Not provided"}</td>
                  <td style={{ padding: "12px 14px", color: T.dim }}>{r.frame_name || "—"}</td>
                  <td style={{ padding: "12px 14px", color: T.dim, minWidth: 180 }}>{lensWithStrength(r as Record<string, any>) || "—"}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{fmtAmount(r.amount_cents, r.currency)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <StageCell
                      order={r as unknown as Record<string, unknown>}
                      busy={busy === `stage:${r.id}`}
                      onNext={() => void quickNext(r)}
                    />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(() => {
                        const gaps = bespokeOrderGaps(r as Record<string, unknown>);
                        return gaps.length > 0 ? (
                          <span
                            title={gaps.join(" | ")}
                            style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, border: "1px solid rgba(193,58,46,0.55)", color: "#e2725b" }}
                          >
                            On hold · {gaps.length}
                          </span>
                        ) : null;
                      })()}
                      {pill("Measurements", Boolean(r.measurements_submitted_at))}
                      {pill("Photo", r.has_photo)}
                      {pill("On-face", r.has_tryon)}
                      {r.production_blocked && pill("Check fit", true)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {(r as any).brief_path ? (
                      <button
                        onClick={() => downloadBrief(password, r.id).catch((err) => setError(err instanceof Error ? err.message : "Download failed"))}
                        title={(r as any).brief_filename ?? "Production brief"}
                        style={{ background: "none", border: `1px solid rgba(194,160,90,0.45)`, color: T.gold, padding: "7px 10px", borderRadius: 2, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", marginRight: 8 }}
                      >
                        Brief PDF ↓
                      </button>
                    ) : null}
                    <button onClick={() => openDetail(r.id)} style={{ background: "none", border: `1px solid rgba(194,160,90,0.45)`, color: T.gold, padding: "7px 12px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 28, color: T.mute, textAlign: "center" }}>
                  {rows.length === 0 ? "No bespoke orders yet." : "No orders at this stage."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <IntegrationSecretBlock password={password} />
      </div>

      {undoState && (
        <UndoBar
          label={undoState.label}
          busy={undoBusy}
          onUndo={() => void undoStage()}
          onDismiss={() => setUndoState(null)}
        />
      )}



      {(detail || detailBusy) && (
        <div
          onClick={() => !detailBusy && setDetail(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(5,4,3,0.78)", display: "grid", placeItems: "center", padding: 16, zIndex: 60 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 3, maxWidth: 860, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}
          >
            {detailBusy || !detail ? (
              <div style={{ color: T.dim }}>Loading…</div>
            ) : (
              <DetailView
                detail={detail}
                password={password}
                onClose={() => setDetail(null)}
                onPdf={() => downloadPdf(detail)}
                onZip={() => downloadBundle(detail)}
                onRender={() => renderPreview(detail)}
                onOrderChange={(patch) => applyOrderPatch(String(detail.order.id), patch)}
                busy={busy}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FitLens webhook signing secret. The environment variable is the preferred
 * home; this writes the database fallback row. The value is never read back —
 * only whether one is set and when it last changed.
 */
function IntegrationSecretBlock({ password }: { password: string }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ is_set: boolean; source: string; updated_at: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const call = async (action: "status" | "save", secret?: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("bespoke-integration-secret", {
        body: { password, action, name: "fitlens_webhook_secret", value: secret },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStatus(data as any);
      if (action === "save") {
        setMsg("Saved. Copy this value to FitLens before leaving this page.");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void call("status");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyValue = async (secret = value) => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setMsg("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg("Copy was blocked by the browser. Select the value and copy it manually.");
    }
  };

  const generate = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const secret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    setValue(secret);
    setCopied(false);
    setMsg("Generated. Copy this exact value to FitLens, then save it here.");
  };

  return (
    <section style={{ marginTop: 40, border: `1px solid ${T.hair}`, borderRadius: 3, background: T.panel, padding: 20, maxWidth: 620 }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 22, margin: "0 0 6px" }}>FitLens signing secret</h2>
      <p style={{ color: T.dim, fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
        {status
          ? status.is_set
            ? `Set (${status.source}${status.updated_at ? `, last changed ${fmtDate(status.updated_at)}` : ""}). The value is never shown again.`
            : "Not set — FitLens cannot post measurements yet."
          : "Checking…"}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          placeholder="New secret"
          aria-label="FitLens signing secret"
          style={{ flex: "1 1 260px", padding: "10px 12px", background: T.bg, border: `1px solid ${T.hair}`, color: T.ink, borderRadius: 2, fontFamily: SANS }}
        />
        <button
          type="button"
          onClick={generate}
          style={{ background: "none", border: `1px solid ${T.hair}`, color: T.dim, padding: "10px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Generate
        </button>
        <button
          type="button"
          disabled={!value}
          onClick={() => void copyValue()}
          aria-label="Copy FitLens signing secret"
          title="Copy secret"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "none", border: `1px solid ${T.hair}`, color: T.ink, padding: "10px 14px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: value ? "pointer" : "not-allowed", opacity: value ? 1 : 0.45 }}
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          disabled={busy || value.trim().length < 16}
          onClick={() => void call("save", value.trim())}
          style={{ background: T.gold, border: "none", color: "#1f1b16", padding: "10px 16px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {msg && <p style={{ color: T.dim, fontSize: 12, marginTop: 10 }}>{msg}</p>}
    </section>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {

  return (
    <div style={{ borderTop: `1px solid ${T.hair}`, padding: "8px 0" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute }}>{label}</div>
      <div style={{ fontSize: 14, color: T.ink, wordBreak: "break-word" }}>
        {value == null || value === "" ? "—" : String(value)}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 22 }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 20px" }}>{children}</div>
    </section>
  );
}

function ScansBlock({ scans }: { scans: ScanRow[] }) {
  if (!scans.length) return null;
  const ordered = sortScans(scans);
  const rep = compareRepeatability(ordered);
  const verdict = rep.kind === "compared" ? rep.verdict : null;
  return (
    <section style={{ marginTop: 22 }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 8px" }}>
        Measurements · {ordered.length}
      </h3>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 13,
          lineHeight: 1.7,
          color: verdict === "disagree" ? "#e2725b" : T.dim,
          fontWeight: verdict === "disagree" ? 600 : 400,
        }}
      >
        {rep.line}
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {ordered.map((sc, i) => (
          <li
            key={(sc.measurement_ref ?? sc.scan_id ?? String(i)) as string}
            style={{
              borderTop: `1px solid ${T.hair}`,
              padding: "10px 0",
              fontSize: 13,
              color: T.dim,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: T.ink, letterSpacing: "0.06em" }}>
              {sc.measurement_ref ?? "—"}
            </strong>
            {" · "}
            {sc.created_at ? fmtDate(sc.created_at) : "—"}
            {" · "}
            {SCAN_SOURCE_LABEL[(sc.source ?? "") as keyof typeof SCAN_SOURCE_LABEL] ?? sc.source ?? "—"}
            {" · "}
            {sc.status ?? "—"}
            {" · "}
            {sc.temple_to_temple_mm != null ? `temple-to-temple ${sc.temple_to_temple_mm} mm` : "no fit measurement"}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailView({
  detail, password, onClose, onPdf, onZip, onRender, onOrderChange, busy,
}: {
  detail: Detail;
  password: string;
  onClose: () => void;
  onPdf: () => void;
  onZip: () => void;
  onRender: () => void;
  onOrderChange: (patch: Record<string, unknown>) => void;
  busy: string | null;
}) {
  const o = detail.order as Record<string, any>;
  const p = detail.photo as Record<string, any> | null;
  const consentState = !p ? "Not recorded" : p.consent_withdrawn_at ? "Withdrawn" : "Granted";
  const gaps = bespokeOrderGaps(o);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, margin: 0 }}>{o.frame_name || "Bespoke order"}</h2>
          <div style={{ color: T.mute, fontSize: 12, marginTop: 4 }}>{fmtDate(o.created_at)} · {o.environment}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.hair}`, color: T.dim, padding: "6px 12px", borderRadius: 2, cursor: "pointer" }}>Close</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button onClick={onRender} disabled={busy !== null} style={{ background: "none", color: T.dim, border: `1px solid ${T.hair}`, padding: "11px 18px", borderRadius: 2, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
          {busy === "render" ? "Rendering…" : detail.files.preview_url ? "Re-render frame image" : "Generate frame image"}
        </button>

        <button onClick={onPdf} disabled={busy !== null} style={{ background: T.gold, color: "#1f1b16", border: "none", padding: "11px 18px", borderRadius: 2, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
          {busy === "pdf" ? "Building…" : "Workshop PDF"}
        </button>
        <button onClick={onZip} disabled={busy !== null} style={{ background: "none", color: T.gold, border: `1px solid rgba(194,160,90,0.45)`, padding: "11px 18px", borderRadius: 2, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
          {busy === "zip" ? "Packing…" : "Download bundle (ZIP)"}
        </button>
      </div>

      <Group title="Case">
        <Field
          label="Case number / FitLens producer code"
          value={
            o.case_no ? (
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: T.gold, letterSpacing: "0.06em" }}>
                {o.case_no}
              </span>
            ) : (
              "Not assigned"
            )
          }
        />
        <Field label="Stage" value={STAGE_LABELS[(o.stage as BespokeStage) ?? "paid"] ?? o.stage} />
        {/* Legacy alias — kept visible here only, so older paperwork and
            MailerLite records still match. */}
        <Field label="Legacy reference" value={`WLT-${String(o.id).slice(0, 8).toUpperCase()}`} />
      </Group>

      <BriefBlock order={o} password={password} onOrderChange={onOrderChange} />

      <Group title="Customer">
        <Field label="Name" value={o.customer_name} />
        <Field label="Discovery source" value={o.source || "Not provided"} />
        <Field label="Email" value={o.customer_email} />
        <Field label="Paid" value={fmtAmount(o.amount_cents, o.currency)} />
        <Field label="Stripe session" value={o.stripe_session_id} />
      </Group>

      <Group title="Specification">
        <Field label="Pattern" value={o.frame_name} />
        <Field label="Front acetate" value={o.front_code} />
        <Field label="Temple acetate" value={o.temple_code} />
        <Field label="Finish" value={o.finish_id} />
        <Field label="Lenses" value={lensWithStrength(o as Record<string, any>)} />
        <Field label="Lens colour code" value={o.lens_tint_code} />
        {needsReadingStrength(o as Record<string, any>) && (
          <div
            className="inline-flex items-center px-2 py-1 text-[11px] uppercase tracking-[0.14em]"
            style={{ background: "rgba(217,145,32,0.14)", color: "#D99120", border: "1px solid rgba(217,145,32,0.4)" }}
          >
            Reading strength to confirm
          </div>
        )}
        <Field label="Engraving" value={o.engraving_text} />
        <Field label="Temple length" value={(o.metadata as any)?.temple_length} />
      </Group>

      <Group title="Measurements from the form">
        <Field label="Face width" value={mm(o.ai_face_width_mm)} />
        <Field label="Temple-to-temple" value={mm(o.ai_temple_to_temple_mm)} />
        <Field label="Frame bridge" value={mm(o.ai_bridge_width_mm)} />
        <Field label="Inner-canthal distance (face)" value={mm(o.ai_inner_canthal_mm)} />
        <Field label="Pupillary distance" value={mm(o.ai_pd_mm)} />
        <Field label="Notes" value={o.ai_notes} />
        <p className="col-span-full text-[11px] leading-relaxed text-cream-dim/60">
          Inner-canthal distance is eye corner to eye corner — not nose width at the pads,
          not the frame bridge (DBL), and not an approved production dimension.
        </p>
      </Group>

      {/* Typed before the inner-canthal split existed — nobody knows which
          measurement the customer took, so flag it instead of moving it. */}
      {o.ai_bridge_width_mm != null && new Date(o.created_at as string) < new Date("2026-09-20") && (
        <p
          style={{
            marginTop: 10,
            padding: "10px 12px",
            border: "1px solid rgba(226,114,91,0.45)",
            background: "rgba(226,114,91,0.08)",
            color: "#e2725b",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Bridge value predates the inner-canthal split - confirm with the customer before cutting.
        </p>
      )}

      <Group title="Measured by hand">
        <Field label="Face width" value={mm(o.manual_face_width_mm)} />
        <Field label="Temple-to-temple" value={mm(o.manual_temple_to_temple_mm)} />
        <Field label="Bridge of best-fitting glasses" value={mm(o.manual_bridge_width_mm)} />
        <Field label="Pupillary distance" value={mm(o.manual_pd_mm)} />
        <Field label="Temple length" value={mm(o.manual_temple_length_mm)} />
        <Field label="Head circumference" value={mm(o.manual_head_circumference_mm)} />
        <Field label="Ear-to-ear over crown" value={mm(o.manual_ear_to_ear_mm)} />
        <Field label="Notes" value={o.manual_notes} />
        <Field label="Submitted" value={o.measurements_submitted_at ? fmtDate(o.measurements_submitted_at) : "Not submitted yet"} />
      </Group>


      <ScansBlock scans={(detail.scans ?? (detail.scan ? [detail.scan] : [])) as ScanRow[]} />

      <Group title="Shipping address">
        <Field label="Recipient" value={o.shipping_name} />
        <Field label="Phone" value={o.shipping_phone} />
        <Field label="Street" value={o.shipping_line1} />
        <Field label="Apartment / floor" value={o.shipping_line2} />
        <Field label="City" value={o.shipping_city} />
        <Field label="State / province" value={o.shipping_state} />
        <Field label="Postal code" value={o.shipping_postal_code} />
        <Field label="Country" value={o.shipping_country} />
        <Field
          label="Confirmed by customer"
          value={o.shipping_submitted_at ? fmtDate(o.shipping_submitted_at as string) : "No address"}
        />
      </Group>

      {gaps.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px", color: "#e2725b" }}>
            On hold · {gaps.length}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.dim, fontSize: 13, lineHeight: 1.7 }}>
            {gaps.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </section>
      )}

      <PipelinePanel
        order={o}
        password={password}
        initialEvents={detail.crm_events ?? []}
        onOrderChange={onOrderChange}
      />

      <MeasureInviteBlock order={o} password={password} />

      <DispatchBlock order={o} password={password} />

      <Group title="Photo & consent">

        <Field label="Consent" value={consentState} />
        <Field label="Consent given" value={p?.consent_at ? fmtDate(p.consent_at) : "—"} />
        <Field label="Consent withdrawn" value={p?.consent_withdrawn_at ? fmtDate(p.consent_withdrawn_at) : "—"} />
        <Field label="Consent version" value={p?.consent_version} />
        <Field label="Language shown" value={p?.consent_locale} />
        <Field label="Photo vs scan difference" value={p?.delta_mm != null ? `${p.delta_mm} mm` : "—"} />
        <Field label="Production" value={o.production_blocked ? "Paused — fit needs review" : "Clear"} />
      </Group>

      {(detail.files.photo_url || detail.files.vto_url || detail.files.preview_url || o.ai_preview_url) && (
        <section style={{ marginTop: 22 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 10px" }}>Images</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { url: (detail.files.preview_url ?? o.ai_preview_url) as string | null, label: "Frame preview" },
              { url: detail.files.photo_url, label: "Customer photo" },
              { url: detail.files.vto_url, label: "On the face" },
              { url: detail.files.geometry_url, label: "Geometry" },
            ]
              .filter((i) => i.url)
              .map((i) => (
                <figure key={i.label} style={{ margin: 0, width: 190 }}>
                  <img src={i.url as string} alt={i.label} style={{ width: "100%", borderRadius: 3, border: `1px solid ${T.hair}`, background: "#efe9df" }} />
                  <figcaption style={{ fontSize: 11, color: T.mute, marginTop: 6 }}>{i.label}</figcaption>
                </figure>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

// One-time measurement invitations. The link is shown once, here, for the
// operator to copy; the database only ever holds its hash.
const BRIEF_MAX = 15 * 1024 * 1024;

const BRIEF_ERRORS: Record<string, string> = {
  pdf_only: "Only PDF files can be uploaded.",
  too_large: "The PDF is larger than 15 MB.",
  no_brief: "No production brief uploaded yet.",
  upload_missing: "The upload did not finish. Try again.",
};

async function briefCall(password: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("bespoke-admin-orders", { body: { password, ...body } });
  const code = (data as { error?: string } | null)?.error;
  if (code) throw new Error(BRIEF_ERRORS[code] ?? code);
  if (error) throw error;
  return data as Record<string, any>;
}

async function downloadBrief(password: string, id: string) {
  const data = await briefCall(password, { action: "brief_download", id });
  if (!data.url) throw new Error("Could not create a download link.");
  const a = document.createElement("a");
  a.href = data.url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function BriefBlock({
  order, password, onOrderChange,
}: {
  order: Record<string, any>;
  password: string;
  onOrderChange: (patch: Record<string, unknown>) => void;
}) {
  const [busy, setBusy] = useState<"upload" | "download" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setMsg({ ok: false, text: BRIEF_ERRORS.pdf_only });
      return;
    }
    if (file.size > BRIEF_MAX) {
      setMsg({ ok: false, text: BRIEF_ERRORS.too_large });
      return;
    }
    setBusy("upload");
    try {
      const up = await briefCall(password, { action: "brief_upload_url", id: order.id, filename: file.name, size: file.size });
      const { error } = await supabase.storage
        .from("bespoke-cad")
        .uploadToSignedUrl(up.path, up.token, file, { contentType: "application/pdf", upsert: true });
      if (error) throw error;
      const done = await briefCall(password, { action: "brief_confirm", id: order.id, filename: file.name });
      onOrderChange({
        brief_path: done.brief_path,
        brief_filename: done.brief_filename,
        brief_uploaded_at: done.brief_uploaded_at,
      });
      setMsg({ ok: true, text: "Production brief saved." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  };

  const onDownload = async () => {
    setBusy("download");
    setMsg(null);
    try {
      await downloadBrief(password, order.id);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Download failed." });
    } finally {
      setBusy(null);
    }
  };

  const btn: React.CSSProperties = {
    background: "none", color: T.gold, border: `1px solid rgba(194,160,90,0.45)`, padding: "9px 14px",
    borderRadius: 2, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
  };

  return (
    <Group title="Production brief">
      <Field label="File" value={order.brief_filename || "No brief uploaded"} />
      <Field label="Uploaded" value={order.brief_uploaded_at ? fmtDate(order.brief_uploaded_at) : "—"} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8, gridColumn: "1 / -1" }}>
        {order.brief_path ? (
          <button type="button" onClick={onDownload} disabled={busy !== null} style={btn}>
            {busy === "download" ? "Preparing…" : "Download"}
          </button>
        ) : null}
        <label style={{ ...btn, opacity: busy ? 0.6 : 1, position: "relative", overflow: "hidden" }}>
          {busy === "upload" ? "Uploading…" : order.brief_path ? "Replace PDF" : "Upload PDF"}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            aria-label={order.brief_path ? "Replace production brief PDF" : "Upload production brief PDF"}
            onChange={onFile}
            disabled={busy !== null}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
          />
        </label>
        {msg && <span style={{ fontSize: 12, color: msg.ok ? T.gold : "#e2725b" }}>{msg.text}</span>}
      </div>
    </Group>
  );
}

function MeasureInviteBlock({ order, password }: { order: Record<string, any>; password: string }) {
  const [invites, setInvites] = useState<Array<Record<string, any>>>([]);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const call = useCallback(
    async (action: "list" | "create" | "revoke", sendEmail = true) => {
      setBusy(true);
      setMsg(null);
      try {
        const { data, error } = await supabase.functions.invoke("measure-invite-create", {
          body: { password, orderId: order.id, action, sendEmail },
        });
        if (error) throw error;
        const payload = (data ?? {}) as Record<string, any>;
        if (payload.error) throw new Error(payload.error);
        if (payload.url) {
          setLink(payload.url);
          setMsg(sendEmail ? "Invitation sent to the customer." : "Link created.");
        }
        if (action !== "list") await refresh();
        else setInvites(payload.invites ?? []);
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Failed");
      } finally {
        setBusy(false);
      }
    },
    [order.id, password],
  );

  const refresh = useCallback(async () => {
    const { data } = await supabase.functions.invoke("measure-invite-create", {
      body: { password, orderId: order.id, action: "list" },
    });
    setInvites(((data ?? {}) as Record<string, any>).invites ?? []);
  }, [order.id, password]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const state = (i: Record<string, any>) =>
    i.measurement_scan_id ? "Measured" : i.used_at ? "Opened" : i.revoked_at ? "Cancelled" : Date.parse(i.expires_at) < Date.now() ? "Expired" : "Live";

  return (
    <section style={{ marginTop: 22 }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Measurement invitation</h3>
      <p style={{ color: T.dim, fontSize: 12, margin: "0 0 10px", lineHeight: 1.6 }}>
        A personal link, good for one measurement and seven days. Sending a new one cancels the old.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={busy}
          onClick={() => void call("create", true)}
          style={{ minHeight: 40, padding: "0 16px", background: "#C2A05A", color: "#0B0A09", border: 0, borderRadius: 2, fontFamily: SANS, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Send invitation
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void call("create", false)}
          style={{ minHeight: 40, padding: "0 16px", background: "transparent", color: T.ink, border: `1px solid ${T.hair}`, borderRadius: 2, fontFamily: SANS, fontSize: 13, cursor: "pointer" }}
        >
          Create link only
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void call("revoke")}
          style={{ minHeight: 40, padding: "0 16px", background: "transparent", color: T.dim, border: `1px solid ${T.hair}`, borderRadius: 2, fontFamily: SANS, fontSize: 13, cursor: "pointer" }}
        >
          Cancel open links
        </button>
      </div>
      {msg && <p style={{ color: T.dim, fontSize: 12, marginTop: 10 }}>{msg}</p>}
      {link && (
        <p style={{ marginTop: 8, fontSize: 12, wordBreak: "break-all", color: T.ink }}>
          {link}
          <br />
          <span style={{ color: T.mute }}>Shown once — copy it now if you want to send it yourself.</span>
        </p>
      )}
      {invites.length > 0 && (
        <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", color: T.dim, fontSize: 12, lineHeight: 1.8 }}>
          {invites.map((i) => (
            <li key={i.id}>
              {state(i)} · created {fmtDate(i.created_at)} · expires {fmtDate(i.expires_at)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const DISPATCH_FIELDS = [
  { key: "courier", label: "Courier", placeholder: "DHL Express" },
  { key: "tracking_number", label: "Tracking number", placeholder: "1234567890" },
  { key: "parcel_weight_kg", label: "Weight (kg)", placeholder: "0.6" },
  { key: "shipped_at", label: "Ship date", placeholder: "2026-09-16", type: "date" },
  { key: "dispatch_note", label: "Note", placeholder: "Left with reception" },
] as const;

// Writes only the five dispatch columns, debounced, through the admin-guarded
// edge function. Measurements, address and consent are never touched here.
function DispatchBlock({ order, password }: { order: Record<string, any>; password: string }) {
  const [form, setForm] = useState(() => ({
    courier: order.courier ?? "",
    tracking_number: order.tracking_number ?? "",
    parcel_weight_kg: order.parcel_weight_kg == null ? "" : String(order.parcel_weight_kg),
    shipped_at: order.shipped_at ? String(order.shipped_at).slice(0, 10) : "",
    dispatch_note: order.dispatch_note ?? "",
  }));
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setSaveError(null);
      try {
        const { data, error } = await supabase.functions.invoke("bespoke-dispatch-update", {
          body: { password, id: order.id, ...form },
        });
        if (error) throw error;
        if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);
        setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [form, order.id, password]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Dispatch</h3>
        <span style={{ fontSize: 11, color: saveError ? "#e2725b" : T.mute }}>
          {saveError ? saveError : saving ? "Saving…" : savedAt ? `Saved ${savedAt}` : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {DISPATCH_FIELDS.map((f) => (
          <label key={f.key} style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute, marginBottom: 5 }}>
              {f.label}
            </span>
            <input
              type={"type" in f ? f.type : "text"}
              value={(form as Record<string, string>)[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              style={{ width: "100%", minHeight: 44, padding: "10px 12px", background: T.bg, border: `1px solid ${T.hair}`, color: T.ink, borderRadius: 2, fontFamily: SANS, fontSize: 13 }}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
