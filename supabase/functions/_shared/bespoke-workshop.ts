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

// Standard formats only: the customer watches these in any browser. Native
// iPhone formats (HEIC photos, HEVC .MOV videos) are refused - see
// APPLE_NATIVE_EXTENSIONS and the HEVC check on the upload page.
const EXTENSIONS: Record<WorkshopKind, string[]> = {
  video: ["mp4", "webm"],
  image: ["jpg", "jpeg", "png", "webp"],
  cad: ["step", "stp", "stl", "dxf", "dwg", "iges", "igs", "3dm", "obj", "f3d", "sldprt", "3mf"],
  document: ["pdf"],
  archive: ["zip"],
};

/** Native iPhone formats: not played/shown by most browsers outside Safari. */
export const APPLE_NATIVE_EXTENSIONS = ["heic", "heif", "mov", "m4v", "hevc"];

/** The rule printed in the brief email and on the upload page. */
export const WORKSHOP_FORMAT_RULE =
  "Please send every file in a standard format: videos as MP4 (H.264), photos as JPG or PNG, drawings as PDF, CAD as STEP, STL or DXF. " +
  "No native iPhone formats - no HEIC photos and no .MOV / HEVC videos. On an iPhone: Settings > Camera > Formats > Most Compatible, or export the video as MP4.";

export function isAppleNativeFormat(fileName: string): boolean {
  const ext = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return Boolean(ext && APPLE_NATIVE_EXTENSIONS.includes(ext));
}

/**
 * True when the bytes contain an HEVC sample entry ("hvc1" / "hev1"), i.e. an
 * MP4 that is really an iPhone HEVC video. Call with the first and last few MB
 * of the file (the "moov" box can sit at either end).
 */
export function containsHevcMarker(bytes: Uint8Array): boolean {
  for (let i = 0; i + 3 < bytes.length; i++) {
    if (bytes[i] === 0x68 && (bytes[i + 1] === 0x76 || bytes[i + 1] === 0x65) && bytes[i + 3] === 0x31) {
      // "hvc1" or "hev1"
      if ((bytes[i + 1] === 0x76 && bytes[i + 2] === 0x63) || (bytes[i + 1] === 0x65 && bytes[i + 2] === 0x76)) return true;
    }
  }
  return false;
}

/**
 * File name as stored: always starts with the order number, so a downloaded
 * file can be matched to its order. "render v2.mp4" -> "WLT-BSP-2026-0010_render v2.mp4"
 */
export function workshopStoredName(orderRef: string, safeName: string): string {
  const ref = orderRef.replace(/[^A-Za-z0-9-]/g, "");
  if (!ref || safeName.toUpperCase().includes(ref.toUpperCase())) return safeName;
  return `${ref}_${safeName}`;
}

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
export function describeFiles(files: Array<{ kind?: string | null }>): string {
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

export interface WorkshopBriefOrder {
  case_no?: string | null;
  id: string;
  frame_name?: string | null;
  front_code?: string | null;
  temple_code?: string | null;
  finish_id?: string | null;
  lens_type?: string | null;
  lens_tint_code?: string | null;
  engraving_text?: string | null;
  reading_strength_mode?: string | null;
  reading_strength?: number | string | null;
  reading_strength_left?: number | string | null;
  reading_strength_right?: number | string | null;
}

export interface WorkshopBrief {
  orderRef: string;
  subject: string;
  preview: string;
  heading: string;
  paragraphs: string[];
  rows: Array<{ label: string; value: string }>;
  formatRule: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Same content as plain text - for copying into Gmail. */
  text: string;
}

export function orderRefOf(order: { case_no?: string | null; id: string }): string {
  return order.case_no || `WLT-${String(order.id).slice(0, 8).toUpperCase()}`;
}

/**
 * The email to the workshop for one order: specification, the brief PDF link
 * and the upload link. The order number is in the subject, the heading, the
 * first row and the upload page, and on every stored file name.
 */
export function workshopBrief(
  order: WorkshopBriefOrder,
  uploadUrl: string,
  opts: { briefUrl?: string | null; message?: string | null } = {},
): WorkshopBrief {
  const ref = orderRefOf(order);
  // Same labels as readingStrengthLabel() in src/lib/bespoke-gaps.ts.
  const reading =
    order.reading_strength_mode === "confirm_later"
      ? "to be confirmed - do not cut lenses yet"
      : order.reading_strength_mode === "different"
        ? order.reading_strength_left && order.reading_strength_right
          ? `L ${order.reading_strength_left} / R ${order.reading_strength_right}`
          : null
        : order.reading_strength != null && order.reading_strength !== ""
          ? `${order.reading_strength}`
          : null;
  const rows = (
    [
      ["Order", ref],
      ["Frame", order.frame_name ?? null],
      ["Front acetate (6 mm)", order.front_code ?? null],
      ["Temple acetate (4 mm)", order.temple_code ?? null],
      ["Finish", order.finish_id ?? null],
      ["Lenses", order.lens_type ?? null],
      ["Lens tint", order.lens_tint_code ?? null],
      ["Reading strength", reading],
      ["Engraving", order.engraving_text ? `"${order.engraving_text}"` : null],
      ["Production brief (PDF)", opts.briefUrl ? "Link below - valid for 7 days" : null],
    ] as Array<[string, string | null]>
  )
    .filter(([, v]) => v)
    .map(([label, value]) => ({ label, value: value as string }));

  const message = (opts.message ?? "").trim();
  const paragraphs = [
    "Dear Konstantina,",
    ...(message ? message.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : []),
    `Below is the specification for order ${ref}. Please upload the 3D model video, the drawing, the CAD files and any photos for this order through the link at the bottom - they go straight onto the order at Woolet, no login needed. Please keep the order number ${ref} in the file names.`,
    ...(opts.briefUrl ? [`Production brief (PDF): ${opts.briefUrl}`] : []),
  ];

  const subject = `${ref} - Woolet Bespoke specification and upload link`;
  const text = [
    ...paragraphs,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    "",
    `File formats: ${WORKSHOP_FORMAT_RULE}`,
    "",
    `Upload link for ${ref}: ${uploadUrl}`,
    "",
    "Thank you,",
    "Marek",
  ].join("\n");

  return {
    orderRef: ref,
    subject,
    preview: `Specification and upload link for ${ref}`,
    heading: `Order ${ref}`,
    paragraphs,
    rows,
    formatRule: WORKSHOP_FORMAT_RULE,
    ctaLabel: `Upload files for ${ref}`,
    ctaUrl: uploadUrl,
    text,
  };
}
