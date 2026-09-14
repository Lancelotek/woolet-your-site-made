import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { bespokeOrderGaps } from "@/lib/bespoke-gaps";
import { exportShippingCsv, exportShippingXlsx } from "@/lib/bespoke-shipping-export";

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
  customer_email: string;
  customer_name: string | null;
  frame_name: string | null;
  front_code: string | null;
  temple_code: string | null;
  finish_id: string | null;
  lens_type: string | null;
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

type OrderRecord = Record<string, unknown>;

interface Detail {
  order: OrderRecord;
  photo: OrderRecord | null;
  scan: OrderRecord | null;
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

const mm = (v: unknown) => (v == null || v === "" ? "" : `${v} mm`);
const s = (v: unknown) => (v == null ? null : String(v));

const PW_KEY = "wlt_bespoke_admin_pw";

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
      lensType: s(o.lens_type),
      engravingText: s(o.engraving_text),
      amountLabel: fmtAmount(o.amount_cents as number | null, o.currency as string | null),
      customerRef: s(o.customer_email),
      requestedTempleLength: s((o.metadata as Record<string, unknown> | null)?.temple_length),
      aiPreviewUrl: d.files.preview_url ?? s(o.ai_preview_url),
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

        <div style={{ border: `1px solid ${T.hair}`, borderRadius: 3, overflowX: "auto", background: T.panel }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: T.mute, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {["Date", "Customer", "Frame", "Paid", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${T.hair}`, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.hair}` }}>
                  <td style={{ padding: "12px 14px", color: T.dim, whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div>{r.customer_name || "—"}</div>
                    <div style={{ color: T.mute, fontSize: 12 }}>{r.customer_email}</div>
                  </td>
                  <td style={{ padding: "12px 14px", color: T.dim }}>{r.frame_name || "—"}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{fmtAmount(r.amount_cents, r.currency)}</td>
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
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <button onClick={() => openDetail(r.id)} style={{ background: "none", border: `1px solid rgba(194,160,90,0.45)`, color: T.gold, padding: "7px 12px", borderRadius: 2, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 28, color: T.mute, textAlign: "center" }}>No bespoke orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                busy={busy}
              />
            )}
          </div>
        </div>
      )}
    </div>
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

function DetailView({
  detail, password, onClose, onPdf, onZip, onRender, busy,
}: {
  detail: Detail;
  password: string;
  onClose: () => void;
  onPdf: () => void;
  onZip: () => void;
  onRender: () => void;
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

      <Group title="Customer">
        <Field label="Name" value={o.customer_name} />
        <Field label="Email" value={o.customer_email} />
        <Field label="Paid" value={fmtAmount(o.amount_cents, o.currency)} />
        <Field label="Stripe session" value={o.stripe_session_id} />
      </Group>

      <Group title="Specification">
        <Field label="Pattern" value={o.frame_name} />
        <Field label="Front acetate" value={o.front_code} />
        <Field label="Temple acetate" value={o.temple_code} />
        <Field label="Finish" value={o.finish_id} />
        <Field label="Lenses" value={o.lens_type} />
        <Field label="Engraving" value={o.engraving_text} />
        <Field label="Temple length" value={(o.metadata as any)?.temple_length} />
      </Group>

      <Group title="Measurements from the form">
        <Field label="Face width" value={mm(o.ai_face_width_mm)} />
        <Field label="Temple-to-temple" value={mm(o.ai_temple_to_temple_mm)} />
        <Field label="Bridge width" value={mm(o.ai_bridge_width_mm)} />
        <Field label="Pupillary distance" value={mm(o.ai_pd_mm)} />
        <Field label="Notes" value={o.ai_notes} />
      </Group>

      <Group title="Measured by hand">
        <Field label="Face width" value={mm(o.manual_face_width_mm)} />
        <Field label="Temple-to-temple" value={mm(o.manual_temple_to_temple_mm)} />
        <Field label="Bridge width" value={mm(o.manual_bridge_width_mm)} />
        <Field label="Pupillary distance" value={mm(o.manual_pd_mm)} />
        <Field label="Temple length" value={mm(o.manual_temple_length_mm)} />
        <Field label="Head circumference" value={mm(o.manual_head_circumference_mm)} />
        <Field label="Ear-to-ear over crown" value={mm(o.manual_ear_to_ear_mm)} />
        <Field label="Notes" value={o.manual_notes} />
        <Field label="Submitted" value={o.measurements_submitted_at ? fmtDate(o.measurements_submitted_at) : "Not submitted yet"} />
      </Group>

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
