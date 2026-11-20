// Workshop files on the Bespoke order card: the private upload link for Warren
// and everything uploaded through it (3D model videos, CAD, photos). Files
// ticked "Customer" appear on the customer's 3D model page from the next
// "Model sent". All rules: supabase/functions/_shared/bespoke-workshop.ts.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KIND_LABEL, formatBytes, type WorkshopKind } from "../../../supabase/functions/_shared/bespoke-workshop";

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

interface FileRow {
  id: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number | null;
  kind: WorkshopKind;
  note: string | null;
  uploaded_by: string;
  show_to_customer: boolean;
  created_at: string;
  view_url: string | null;
  download_url: string | null;
}

interface Brief {
  orderRef: string;
  subject: string;
  text: string;
}

interface Snapshot {
  link: string | null;
  link_created_at: string | null;
  files: FileRow[];
  brief?: Brief;
  sent_to?: string;
}

const EMAIL_KEY = "wlt_workshop_email";
const readEmail = () => {
  try {
    return window.localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
};

const BRIEF_ERRORS: Record<string, string> = {
  invalid_email: "Type the workshop's email address first.",
  recipient_suppressed: "This address is on the suppression list - nothing was sent. Use Copy text and send it from Gmail.",
};

const btn = (primary: boolean, disabled = false): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 13px",
  borderRadius: 2,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  background: primary ? T.gold : "none",
  color: primary ? "#0b0a09" : T.gold,
  border: `1px solid ${primary ? T.gold : "rgba(194,160,90,0.55)"}`,
  textDecoration: "none",
  display: "inline-block",
});

export function WorkshopFilesPanel({ orderId, password, modelSentAt }: { orderId: string; password: string; modelSentAt?: string | null }) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "bad" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [to, setTo] = useState(readEmail);
  const [message, setMessage] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [textCopied, setTextCopied] = useState(false);

  const call = useCallback(
    async (body: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke("bespoke-admin-orders", {
        body: { password, id: orderId, ...body },
      });
      const code = (data as { error?: string } | null)?.error;
      if (code) throw new Error(code);
      if (error) throw error;
      return data as Snapshot;
    },
    [password, orderId],
  );

  const refresh = useCallback(async () => {
    try {
      setSnap(await call({ action: "workshop_files" }));
    } catch (e) {
      setMsg({ text: `Could not load workshop files (${e instanceof Error ? e.message : "error"}).`, tone: "bad" });
    }
  }, [call]);

  useEffect(() => {
    setSnap(null);
    void refresh();
  }, [refresh]);

  const run = async (body: Record<string, unknown>, ok?: string) => {
    setBusy(true);
    setMsg(null);
    try {
      setSnap(await call(body));
      if (ok) setMsg({ text: ok, tone: "ok" });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Something went wrong.", tone: "bad" });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy the workshop upload link", url);
    }
  };

  const previewBrief = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const next = await call({ action: "workshop_brief", message });
      setSnap(next);
      setBrief(next.brief ?? null);
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Could not build the email.", tone: "bad" });
    } finally {
      setBusy(false);
    }
  };

  const sendBrief = async () => {
    const addr = to.trim();
    if (!window.confirm(`Send the specification and upload link for this order to ${addr}?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const next = await call({ action: "workshop_brief", message, to: addr, send: true });
      setSnap(next);
      setBrief(next.brief ?? null);
      try {
        window.localStorage.setItem(EMAIL_KEY, addr);
      } catch {
        /* remembered for convenience only */
      }
      setMsg({ text: `Sent to ${next.sent_to ?? addr}, from marek@woolet.co. Logged in Activity.`, tone: "ok" });
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setMsg({ text: BRIEF_ERRORS[code] ?? (code || "The email did not go out."), tone: "bad" });
    } finally {
      setBusy(false);
    }
  };

  const files = snap?.files ?? [];
  const sentAt = modelSentAt ? new Date(modelSentAt).getTime() : null;
  const onCustomerPage = (f: FileRow) => f.show_to_customer && sentAt !== null && new Date(f.created_at).getTime() <= sentAt;

  return (
    <section id="bespoke-workshop-files" style={{ marginTop: 22, fontFamily: SANS, scrollMarginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "0 0 6px" }}>Workshop files</h3>
        <span style={{ fontSize: 11, color: T.gold }}>
          {files.length === 0 ? "Nothing uploaded yet" : `${files.length} file${files.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "10px 14px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute }}>Upload link for Warren</div>
        {snap?.link ? (
          <>
            <code style={{ display: "block", marginTop: 6, fontSize: 12, color: T.ink, wordBreak: "break-all" }}>{snap.link}</code>
            <div style={{ fontSize: 11, color: T.mute, marginTop: 4 }}>Created {fmtDate(snap.link_created_at)} · no login needed</div>
          </>
        ) : (
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.dim }}>
            No link yet. Create one and paste it into the brief or the email to Konstantina.
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {snap?.link ? (
            <>
              <button type="button" style={btn(true)} onClick={() => void copy(snap.link ?? "")}>
                {copied ? "Link copied" : "Copy link"}
              </button>
              <a href={snap.link} target="_blank" rel="noreferrer" style={btn(false)}>
                Open upload page
              </a>
              <button
                type="button"
                disabled={busy}
                style={btn(false, busy)}
                onClick={() => {
                  if (!window.confirm("Make a new link? The current link stops working at once - send the new one to the workshop.")) return;
                  void run({ action: "workshop_link", rotate: true }, "New link created. The old one no longer works.");
                }}
              >
                New link (revoke old)
              </button>
            </>
          ) : (
            <button type="button" disabled={busy || !snap} style={btn(true, busy || !snap)} onClick={() => void run({ action: "workshop_link" }, "Link created.")}>
              Create upload link
            </button>
          )}
          <button type="button" disabled={busy} style={btn(false, busy)} onClick={() => void refresh()}>
            Refresh
          </button>
        </div>
      </div>

      <details style={{ marginTop: 10, background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "10px 14px" }}>
        <summary style={{ cursor: "pointer", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold }}>
          Email Warren: specification + upload link
        </summary>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: T.dim, lineHeight: 1.5 }}>
          Order number in the subject, the heading and every file name; the production brief PDF is linked if uploaded;
          the file-format rule (MP4 / JPG / PDF, no iPhone HEIC or MOV) is in a box above the upload button. Creates the
          upload link if there is none yet. Dimensions go in the message - check the frame math first.
        </p>
        <label style={{ display: "block", marginTop: 10, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute }}>
          To
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="workshop email"
            style={{ display: "block", width: "100%", marginTop: 4, background: "rgba(239,233,223,0.04)", border: `1px solid ${T.hair}`, color: T.ink, padding: "8px 10px", fontSize: 13, borderRadius: 2, textTransform: "none", letterSpacing: 0 }}
          />
        </label>
        <label style={{ display: "block", marginTop: 10, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.mute }}>
          Message (optional, goes above the specification)
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={3000}
            style={{ display: "block", width: "100%", marginTop: 4, background: "rgba(239,233,223,0.04)", border: `1px solid ${T.hair}`, color: T.ink, padding: "8px 10px", fontSize: 13, borderRadius: 2, textTransform: "none", letterSpacing: 0, fontFamily: SANS }}
          />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          <button type="button" disabled={busy} style={btn(false, busy)} onClick={() => void previewBrief()}>
            Preview
          </button>
          <button type="button" disabled={busy || !brief || !to.trim()} style={btn(true, busy || !brief || !to.trim())} onClick={() => void sendBrief()}>
            Send to workshop
          </button>
          {brief && (
            <>
              <button
                type="button"
                style={btn(false)}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`${brief.subject}\n\n${brief.text}`);
                    setTextCopied(true);
                    window.setTimeout(() => setTextCopied(false), 2500);
                  } catch {
                    window.prompt("Copy the email", brief.text);
                  }
                }}
              >
                {textCopied ? "Copied" : "Copy text"}
              </button>
              <a
                href={`mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.text)}`}
                style={btn(false)}
              >
                Open in mail app
              </a>
            </>
          )}
        </div>
        {brief && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${T.hair}`, paddingTop: 10 }}>
            <div style={{ fontSize: 13, color: T.ink }}>{brief.subject}</div>
            <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: SANS, fontSize: 12, color: T.dim, lineHeight: 1.5 }}>{brief.text}</pre>
          </div>
        )}
      </details>

      {files.length > 0 && (
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 8 }}>
          {files.map((f) => {
            const viewable = f.kind !== "cad" && f.kind !== "archive";
            return (
              <li key={f.id} style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {f.kind === "video" && f.view_url && (
                  <video src={f.view_url} controls preload="metadata" playsInline style={{ width: 220, maxWidth: "100%", borderRadius: 3, background: "#000" }} />
                )}
                {f.kind === "image" && f.view_url && (
                  <a href={f.view_url} target="_blank" rel="noreferrer">
                    <img src={f.view_url} alt={f.file_name} style={{ width: 160, borderRadius: 3, border: `1px solid ${T.hair}` }} />
                  </a>
                )}
                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.ink, wordBreak: "break-all" }}>{f.file_name}</div>
                  <div style={{ fontSize: 11, color: T.mute, marginTop: 3 }}>
                    {KIND_LABEL[f.kind] ?? f.kind} · {formatBytes(f.size_bytes)} · {fmtDate(f.created_at)} · {f.uploaded_by}
                  </div>
                  {f.note && <p style={{ margin: "6px 0 0", fontSize: 12, color: T.dim, lineHeight: 1.5 }}>{f.note}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 8 }}>
                    {f.download_url && (
                      <a href={f.download_url} style={{ fontSize: 11, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Download
                      </a>
                    )}
                    {viewable && (
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: T.dim, cursor: busy ? "wait" : "pointer" }}>
                        <input
                          type="checkbox"
                          checked={f.show_to_customer}
                          disabled={busy}
                          onChange={(e) => void run({ action: "workshop_file_update", file_id: f.id, show_to_customer: e.target.checked })}
                        />
                        Customer
                        <span style={{ color: onCustomerPage(f) ? T.gold : T.mute }}>
                          {onCustomerPage(f) ? "· on their page" : f.show_to_customer ? "· after next \"Model sent\"" : ""}
                        </span>
                      </label>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm(`Remove ${f.file_name}? It is deleted from storage and from the customer's page.`)) return;
                        void run({ action: "workshop_file_update", file_id: f.id, remove: true }, "File removed.");
                      }}
                      style={{ background: "none", border: "none", padding: 0, fontSize: 11, color: T.bad, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ margin: "10px 0 0", fontSize: 11, color: T.mute, lineHeight: 1.5 }}>
        Videos, images and PDF drawings are ticked for the customer by default; CAD and ZIP files stay internal. Ticked
        files go on the customer's 3D model page when you press "Model sent" (or "Corrected model sent"), and the email
        tells them the model is there.
      </p>
      {msg && (
        <p role="status" style={{ margin: "8px 0 0", fontSize: 12, color: msg.tone === "ok" ? T.gold : T.bad }}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
