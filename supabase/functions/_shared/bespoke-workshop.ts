// Workshop uploads for a Bespoke order - the rules in one place.
//
// The workshop (Warren, Thessaloniki) gets one private link per order:
// /en/bespoke/workshop?t=<token>. On that page they upload the 3D model video,
// the CAD files and photos straight onto the order. Nobody logs in: the token
// is the key, the admin can replace it (which kills the old link) at any time.
//
// What the customer sees: files marked "show to customer" that were uploaded
// before the last "Model sent". So the workshop can upload a draft without the
// customer seeing it; pressing "Model sent" publishes it.
//
// Pure functions only - shared by bespoke-workshop-upload, bespoke-admin-orders,
// bespoke-balance, bespoke-crm-update and the browser.

export const WORKSHOP_BUCKET = "bespoke-workshop";

/** One file, any type. Matches the bucket's file_size_limit (migration 20261120160000). */
export const WORKSHOP_MAX_BYTES = 500 * 1024 * 1024;
/** Files on one order, all time. */
export const WORKSHOP_MAX_FILES = 100;
/** Uploads on one order in a rolling hour - stops a leaked link from filling the bucket. */
export const WORKSHOP_MAX_PER_HOUR = 40;

export type WorkshopKind = "video" | "image" | "cad" | "document" | "archive";

const EXTENSIONS: Record<WorkshopKind, string[]> = {
  video: ["mp4", "mov", "m4v", "webm"],
  image: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
  cad: ["step", "stp", "stl", "dxf", "dwg", "iges", "igs", "3dm", "obj", "f3d", "sldprt", "3mf"],
  document: ["pdf"],
  archive: ["zip"],
};

export const WORKSHOP_ACCEPT = Object.values(EXTENSIONS)
  .flat()
  .map((e) => `.${e}`)
  .join(",");

export const KIND_LABEL: Record<WorkshopKind, string> = {
  video: "Video",
  image: "Image",
  cad: "CAD",
  document: "Drawing (PDF)",
  archive: "ZIP",
};

/** null = file type not accepted. */
export function classifyWorkshopFile(fileName: string): WorkshopKind | null {
  const ext = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (!ext) return null;
  for (const [kind, list] of Object.entries(EXTENSIONS) as Array<[WorkshopKind, string[]]>) {
    if (list.includes(ext)) return kind;
  }
  return null;
}

/** Videos, images and PDF drawings go to the customer by default; CAD and ZIP files stay internal. */
export function defaultShowToCustomer(kind: WorkshopKind): boolean {
  return kind === "video" || kind === "image" || kind === "document";
}

/** Storage-safe file name, keeps the extension. "Brian West v2 (final).MP4" -> "Brian West v2 _final_.MP4" */
export function safeWorkshopFileName(raw: string): string {
  const name = String(raw ?? "").split(/[\\/]/).pop() ?? "";
  const cleaned = name.replace(/[^A-Za-z0-9._ -]/g, "_").replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^(.*?)(\.[A-Za-z0-9]+)?$/);
  const base = (m?.[1] ?? "").slice(0, 100).replace(/^[. ]+/, "") || "file";
  return `${base}${m?.[2] ?? ""}`;
}

/** 256-bit random token, URL-safe (43 chars). */
export function newWorkshopToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const WORKSHOP_TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/;

export function workshopUploadUrl(origin: string, token: string): string {
  return `${origin}/en/bespoke/workshop?t=${encodeURIComponent(token)}`;
}

export interface WorkshopFileRow {
  id: string;
  kind: WorkshopKind | string;
  show_to_customer: boolean;
  created_at: string;
  removed_at?: string | null;
}

/**
 * Files the customer sees on their model page: marked for the customer, not
 * removed, and uploaded before the last "Model sent". Nothing before the
 * first "Model sent".
 */
export function customerVisibleFiles<T extends WorkshopFileRow>(files: T[], modelSentAt: string | null | undefined): T[] {
  if (!modelSentAt) return [];
  const cutoff = new Date(modelSentAt).getTime();
  return files.filter((f) => f.show_to_customer && !f.removed_at && new Date(f.created_at).getTime() <= cutoff);
}

/** "2 videos, 1 drawing" - for the customer email and the admin note. */
export function describeFiles(files: Array<{ kind: string }>): string {
  const count = (k: string) => files.filter((f) => f.kind === k).length;
  const part = (n: number, one: string, many: string) => (n ? `${n} ${n === 1 ? one : many}` : null);
  return [
    part(count("video"), "video", "videos"),
    part(count("document"), "drawing", "drawings"),
    part(count("image"), "image", "images"),
    part(count("cad"), "CAD file", "CAD files"),
    part(count("archive"), "ZIP file", "ZIP files"),
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatBytes(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  if (v >= 1024 * 1024 * 1024) return `${(v / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (v >= 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`;
  if (v >= 1024) return `${Math.round(v / 1024)} KB`;
  return `${v} B`;
}
