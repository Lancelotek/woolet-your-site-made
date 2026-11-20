// The workshop's upload page for one Bespoke order (/en/bespoke/workshop?t=...).
// Warren opens the link from the brief and uploads the 3D model video, CAD
// files and photos straight onto the order. No login: the token in the link is
// the key. All rules live in edge function `bespoke-workshop-upload`.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import {
  KIND_LABEL,
  WORKSHOP_BUCKET,
  WORKSHOP_TOKEN_RE,
  WORKSHOP_FORMAT_RULE,
  classifyWorkshopFile,
  containsHevcMarker,
  formatBytes,
  isAppleNativeFormat,
  type WorkshopKind,
} from "../../../supabase/functions/_shared/bespoke-workshop";

interface WorkshopFile {
  id: string;
  name: string;
  kind: WorkshopKind;
  size: number | null;
  note: string | null;
  createdAt: string;
}

interface Status {
  orderRef: string;
  frameName: string;
  frontCode: string | null;
  templeCode: string | null;
  finish: string | null;
  lens: string | null;
  engraving: string | null;
  maxBytes: number;
  accept: string;
  formatRule?: string;
  files: WorkshopFile[];
}

interface Queued {
  key: string;
  file: File;
  progress: number;
  state: "waiting" | "uploading" | "done" | "error";
  error?: string;
}

const ERRORS: Record<string, string> = {
  file_type: "This file type is not accepted. Use MP4, JPG/PNG, PDF, STEP/STL/DXF or ZIP.",
  iphone_format: "Native iPhone format (HEIC / MOV) - please export it as MP4 (video) or JPG (photo) and upload again.",
  hevc: "This MP4 is HEVC (iPhone High Efficiency) - most browsers cannot play it. Please export it as MP4 H.264 and upload again.",
  too_large: "The file is larger than the limit.",
  empty_file: "The file is empty.",
  too_many_files: "This order already has the maximum number of files. Write to support@woolet.co.",
  rate_limited: "Too many uploads in the last hour. Try again later.",
  upload_missing: "The upload did not finish. Try again.",
  invalid_link: "This link is not valid any more. Ask Woolet for a new one.",
};

const fmtDate = (v: string) => new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("bespoke-workshop-upload", { body });
  const code = (data as { error?: string } | null)?.error;
  if (code) throw new Error(code);
  if (error) {
    // supabase-js puts the JSON body of a non-2xx answer on error.context.
    const ctx = (error as { context?: Response }).context;
    const parsed = ctx && typeof ctx.json === "function" ? await ctx.json().catch(() => null) : null;
    throw new Error((parsed as { error?: string } | null)?.error ?? "server_error");
  }
  return data as Record<string, unknown>;
}

/** Looks for the HEVC sample entry in the first and last 4 MB (the "moov" box sits at either end). */
async function isHevc(file: File): Promise<boolean> {
  const span = 4 * 1024 * 1024;
  try {
    const head = new Uint8Array(await file.slice(0, span).arrayBuffer());
    if (containsHevcMarker(head)) return true;
    if (file.size <= span) return false;
    const tail = new Uint8Array(await file.slice(Math.max(span, file.size - span)).arrayBuffer());
    return containsHevcMarker(tail);
  } catch {
    return false;
  }
}

/** Same URL supabase-js uploadToSignedUrl() uses, built from the site's own Supabase URL. */
function signedUploadUrl(path: string, uploadToken: string): string {
  const base = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = `${WORKSHOP_BUCKET}/${path}`.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/upload/sign/${encoded}?token=${encodeURIComponent(uploadToken)}`;
}

/** PUT to the signed upload URL with progress (supabase-js has no progress callback). */
function putFile(signedUrl: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.status === 413 ? "too_large" : "upload_failed")));
    xhr.onerror = () => reject(new Error("upload_failed"));
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    xhr.send(form);
  });
}

export default function BespokeWorkshop() {
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!WORKSHOP_TOKEN_RE.test(token)) {
      setInvalid(true);
      setLoading(false);
      return;
    }
    try {
      setStatus((await call({ t: token, action: "status" })) as unknown as Status);
    } catch {
      setInvalid(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addFiles = async (list: FileList | null) => {
    if (!list || !status) return;
    setFinished(null);
    const next: Queued[] = await Promise.all(
      Array.from(list).map(async (file, i) => {
        const kind = classifyWorkshopFile(file.name);
        let error = isAppleNativeFormat(file.name)
          ? ERRORS.iphone_format
          : !kind
            ? ERRORS.file_type
            : file.size > status.maxBytes
              ? `${ERRORS.too_large} (${formatBytes(status.maxBytes)})`
              : undefined;
        if (!error && kind === "video" && (await isHevc(file))) error = ERRORS.hevc;
        return { key: `${Date.now()}-${i}-${file.name}`, file, progress: 0, state: error ? "error" : "waiting", error } as Queued;
      }),
    );
    setQueue((q) => [...q.filter((x) => x.state !== "done"), ...next]);
  };

  const patch = (key: string, p: Partial<Queued>) => setQueue((q) => q.map((x) => (x.key === key ? { ...x, ...p } : x)));

  const upload = async () => {
    setBusy(true);
    let done = 0;
    for (const item of queue.filter((x) => x.state === "waiting")) {
      patch(item.key, { state: "uploading", progress: 0 });
      try {
        const signed = (await call({ t: token, action: "sign", fileName: item.file.name, size: item.file.size })) as {
          path: string;
          token: string;
        };
        await putFile(signedUploadUrl(signed.path, signed.token), item.file, (p) => patch(item.key, { progress: p }));
        const res = (await call({ t: token, action: "complete", path: signed.path, note })) as { files: WorkshopFile[] };
        setStatus((s) => (s ? { ...s, files: res.files } : s));
        patch(item.key, { state: "done", progress: 1 });
        done += 1;
      } catch (err) {
        const code = err instanceof Error ? err.message : "server_error";
        patch(item.key, { state: "error", error: ERRORS[code] ?? "Upload failed. Check the connection and try again." });
      }
    }
    if (done > 0) {
      await call({ t: token, action: "notify" }).catch(() => undefined);
      setNote("");
    }
    setFinished(done);
    setBusy(false);
  };

  const waiting = queue.filter((x) => x.state === "waiting").length;
  const s = status;

  return (
    <>
      <SEO title="Workshop upload · Woolet Bespoke" description="Upload the 3D model, CAD files and photos for a Woolet Bespoke order." noindex />
      <div className="min-h-screen bg-background text-cream">
        <header className="border-b border-cream/10">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
            <span className="text-cream text-[13px] tracking-[0.32em] uppercase font-medium">Woolet</span>
            <span className="text-cream-dim text-[11px] uppercase tracking-[0.2em]">Bespoke · Workshop upload</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {loading ? (
            <div className="flex items-center gap-3 text-cream-dim">
              <Loader2 className="animate-spin" size={16} /> Loading the order…
            </div>
          ) : invalid || !s ? (
            <div className="rounded-sm border border-cream/15 bg-cream/[0.03] p-6 text-cream-dim">{ERRORS.invalid_link}</div>
          ) : (
            <>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold-light mb-3">Order {s.orderRef}</div>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream">Upload the 3D model and files</h1>
              <p className="mt-4 text-cream-dim leading-relaxed">
                Videos of the 3D model, the drawing (PDF), CAD files and photos go straight onto this order at Woolet.
                Up to {formatBytes(s.maxBytes)} per file. We are notified when the upload finishes.
              </p>

              <div role="note" className="mt-6 border border-gold/40 bg-gold/[0.06] p-4 text-sm leading-relaxed text-cream" style={{ borderRadius: 4 }}>
                <strong className="font-medium text-gold-light">File formats.</strong> {s.formatRule ?? WORKSHOP_FORMAT_RULE}
              </div>

              <p className="mt-4 text-sm text-cream-dim">
                Every file is saved with the order number <span className="text-cream">{s.orderRef}</span> at the start of its name.
              </p>

              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm border border-cream/10 bg-cream/[0.03] p-5" style={{ borderRadius: 4 }}>
                {(
                  [
                    ["Frame", s.frameName],
                    ["Front acetate", s.frontCode],
                    ["Temple acetate", s.templeCode],
                    ["Finish", s.finish],
                    ["Lenses", s.lens],
                    ["Engraving", s.engraving ? `"${s.engraving}"` : null],
                  ] as Array<[string, string | null]>
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4">
                      <dt className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">{k}</dt>
                      <dd className="text-cream text-right">{v}</dd>
                    </div>
                  ))}
              </dl>

              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void addFiles(e.dataTransfer.files);
                }}
                className={`mt-8 flex flex-col items-center justify-center gap-3 border border-dashed p-10 text-center cursor-pointer transition ${
                  dragOver ? "border-gold bg-gold/5" : "border-cream/25 hover:border-gold/60"
                }`}
                style={{ borderRadius: 4 }}
              >
                <UploadCloud className="text-gold" size={28} />
                <span className="text-cream">Drop files here or click to choose</span>
                <span className="text-cream-dim text-xs">MP4 (H.264) · JPG / PNG · PDF · STEP / STL / DXF / DWG · ZIP</span>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={s.accept}
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    void addFiles(files).then(() => {
                      e.target.value = "";
                    });
                  }}
                />
              </div>

              {queue.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {queue.map((q) => (
                    <li key={q.key} className="border border-cream/10 p-3 text-sm" style={{ borderRadius: 4 }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-cream break-all">{q.file.name}</span>
                        <span className="text-cream-dim text-xs shrink-0">
                          {formatBytes(q.file.size)}
                          {q.state === "uploading" && ` · ${Math.round(q.progress * 100)}%`}
                          {q.state === "done" && " · uploaded"}
                        </span>
                      </div>
                      {q.state === "uploading" && (
                        <div className="mt-2 h-1 bg-cream/10">
                          <div className="h-1 bg-gold transition-all" style={{ width: `${Math.round(q.progress * 100)}%` }} />
                        </div>
                      )}
                      {q.error && <p className="mt-1 text-xs text-red-300">{q.error}</p>}
                    </li>
                  ))}
                </ul>
              )}

              <label className="block mt-6">
                <span className="text-cream-dim text-[11px] uppercase tracking-[0.16em]">Note for Woolet (optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="e.g. Version 2 - lens 50.22 x 42.45, bridge 22 at the contact point"
                  className="mt-2 w-full bg-cream/[0.04] border border-cream/15 rounded-sm px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60"
                />
              </label>

              <button
                type="button"
                disabled={busy || waiting === 0}
                onClick={() => void upload()}
                className="mt-4 inline-flex items-center justify-center gap-2 min-h-[52px] px-7 text-xs uppercase tracking-[0.2em] font-medium bg-gold text-[#0b0a09] transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="animate-spin" size={14} /> : null}
                {busy ? "Uploading…" : waiting > 0 ? `Upload ${waiting} file${waiting === 1 ? "" : "s"}` : "Upload"}
              </button>
              {busy && <p className="mt-2 text-xs text-cream-dim">Keep this page open until every file shows "uploaded".</p>}
              {finished !== null && finished > 0 && !busy && (
                <p role="status" className="mt-3 flex items-center gap-2 text-sm text-gold-light">
                  <CheckCircle2 size={16} /> {finished} file{finished === 1 ? "" : "s"} uploaded. Thank you - Woolet has been notified.
                </p>
              )}

              <section className="mt-12">
                <h2 className="font-display text-2xl text-cream">On this order</h2>
                {s.files.length === 0 ? (
                  <p className="mt-3 text-sm text-cream-dim">No files yet.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-cream/10 border-y border-cream/10 text-sm">
                    {s.files.map((f) => (
                      <li key={f.id} className="py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-cream break-all">{f.name}</span>
                        <span className="text-cream-dim text-xs">
                          {KIND_LABEL[f.kind] ?? f.kind} · {formatBytes(f.size)} · {fmtDate(f.createdAt)}
                        </span>
                        {f.note && <span className="basis-full text-cream-dim text-xs">{f.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}
