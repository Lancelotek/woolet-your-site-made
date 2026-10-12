// Shared helpers for the bespoke render cache: canonical selection keys,
// deterministic ALT text, readable storage paths and public URLs.
// Mirrored on the client in src/lib/bespoke-render-alt.ts — keep in sync.

export const RENDER_BUCKET = "bespoke-renders";
export const PROMPT_VERSION = "2026-10-12";

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

export function buildKeyV2(i: {
  shape: string; frontCode: string; templeCode: string; finish: string;
  lensType?: string | null; lensTint?: string | null;
}): string {
  return [
    "v2",
    norm(i.shape),
    norm(i.frontCode),
    norm(i.templeCode),
    norm(i.finish),
    norm(i.lensType) || "plano",
    norm(i.lensTint) || "-",
  ].join("|");
}

/** Legacy key: the old client key (frameId|frontId|templeId|finishId) prefixed with v1. */
export const buildKeyV1 = (oldKey: string) => `v1|${norm(oldKey)}`;

const SUN_TINT_NAMES: Record<string, string> = {
  "SUN-GRY": "smoke grey",
  "SUN-BRN": "espresso brown",
  "SUN-G15": "G-15 green",
  "SUN-BGR": "brown gradient",
};
const PHOTO_TINT_NAMES: Record<string, string> = {
  "PH-BRN": "espresso brown",
  "PH-GRN": "bottle green",
  "PH-GRY": "graphite grey",
};

export function lensDescription(lensType?: string | null, lensTint?: string | null): string {
  const t = (lensTint ?? "").toUpperCase();
  switch ((lensType ?? "plano").toLowerCase()) {
    case "sun-uv400":
      return SUN_TINT_NAMES[t] ? `UV400 sun lenses in ${SUN_TINT_NAMES[t]}` : "UV400 sun lenses";
    case "photochromic":
      return PHOTO_TINT_NAMES[t] ? `photochromic lenses in ${PHOTO_TINT_NAMES[t]}` : "photochromic lenses";
    case "blue-light":
      return "clear lenses with an optional blue-light filter coating";
    case "reading":
      return "clear reading lenses";
    default:
      return "clear plano lenses";
  }
}

const FINISH_WORD: Record<string, string> = {
  "shiny hand-polished": "hand-polished",
  shiny: "hand-polished",
  matte: "matte",
  "scratched / brushed": "brushed",
  brushed: "brushed",
};
export const finishWord = (finish: string) => FINISH_WORD[norm(finish)] ?? norm(finish);

export function buildAlt(i: {
  shape: string; frontName: string; templeName: string; finish: string;
  lensType?: string | null; lensTint?: string | null;
}): string {
  return `Woolet Bespoke ${i.shape} eyeglasses, front in ${i.frontName} Mazzucchelli acetate, temples in ${i.templeName}, ${finishWord(i.finish)} finish, ${lensDescription(i.lensType, i.lensTint)} - AI preview of a made-to-measure frame`;
}

export const slugify = (s: string) =>
  norm(s).normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

async function shortHash(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function buildStoragePath(i: {
  key: string; shape: string; frontName: string; templeName: string; finish: string;
  lensType?: string | null; lensTint?: string | null;
}): Promise<string> {
  const lens = [i.lensType || "plano", i.lensTint || ""].filter(Boolean).join(" ");
  const file = [
    "woolet-bespoke", slugify(i.shape), slugify(i.frontName), "front",
    slugify(i.templeName), "temples", slugify(finishWord(i.finish)), slugify(lens),
  ].filter(Boolean).join("-");
  return `renders/${slugify(i.shape) || "frame"}/${file}-${await shortHash(i.key)}.png`;
}

/**
 * Stable public URL for a stored render. Uses the Storage public URL when the
 * bucket is public; otherwise the bespoke-render-image function streams it.
 */
export function publicUrlFor(supabaseUrl: string, path: string, bucketIsPublic: boolean): string {
  return bucketIsPublic
    ? `${supabaseUrl}/storage/v1/object/public/${RENDER_BUCKET}/${path}`
    : `${supabaseUrl}/functions/v1/bespoke-render-image/${path}`;
}

export function decodeDataUrl(dataUrl: string): Uint8Array {
  const b64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
