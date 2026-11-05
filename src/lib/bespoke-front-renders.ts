import { supabase } from "@/integrations/supabase/client";
import { ACTIVE_COLORS, COLORS } from "@/data/bespoke-options";
import { FRAMES } from "@/data/frames";
import type { PatternRender } from "@/lib/bespoke-pattern-renders";

/**
 * Front-only previews: every pattern in every active front acetate, shown with
 * Deep matte black temples and a matte finish. They are pre-generated, so the
 * live preview changes the moment a buyer taps a front colour. The temple colour
 * only enters the picture once the buyer picks it (full render, see Configurator).
 */
export const PREVIEW_TEMPLE_ID = "a305-2826";
export const PREVIEW_FINISH_ID = "matte";

/** Colour dots shown on each pattern card in step 1. */
export const CARD_DOT_COLOR_IDS = ["a305-2826", "p632-0006", "a332-1203", "a078-5208", "3102-7110"] as const;

const norm = (v: string) => v.trim().toLowerCase();

/** Same canonical key the render edge function writes (buildKeyV2, plano lenses). */
export const frontRenderKey = (shape: string, frontCode: string) => {
  const temple = COLORS.find((c) => c.id === PREVIEW_TEMPLE_ID)!;
  return ["v2", norm(shape), norm(frontCode), norm(temple.code), PREVIEW_FINISH_ID, "plano", "-"].join("|");
};

/** frameId → colourId → render. */
export type FrontRenderMap = Record<string, Record<string, PatternRender>>;

let cache: Promise<FrontRenderMap> | null = null;

export function loadFrontRenders(): Promise<FrontRenderMap> {
  if (cache) return cache;
  cache = (async () => {
    const lookup = new Map<string, { frameId: string; colorId: string }>();
    for (const f of FRAMES) {
      for (const c of ACTIVE_COLORS) lookup.set(frontRenderKey(f.shape, c.code), { frameId: f.id, colorId: c.id });
    }
    try {
      const { data, error } = await supabase
        .from("bespoke_render_cache")
        .select("selection_key,shape,public_url,alt_text")
        .in("selection_key", [...lookup.keys()]);
      if (error) return {};
      const map: FrontRenderMap = {};
      for (const row of data ?? []) {
        const hit = lookup.get(row.selection_key);
        if (!hit) continue;
        (map[hit.frameId] ??= {})[hit.colorId] = { shape: row.shape, public_url: row.public_url, alt_text: row.alt_text };
      }
      return map;
    } catch {
      return {};
    }
  })();
  // A failed load must not stick for the whole visit.
  cache.then((m) => { if (!Object.keys(m).length) cache = null; });
  return cache;
}

/** True when the selection is exactly a pre-generated front-only preview. */
export const isFrontOnlySelection = (templeId: string | null | undefined, finishId: string | null | undefined) =>
  (!templeId || templeId === PREVIEW_TEMPLE_ID) && (!finishId || finishId === PREVIEW_FINISH_ID);

/**
 * Full front × temple previews for one pattern (matte, plano), pre-generated for
 * every active acetate pair. Picking any front and temple colour then swaps the
 * picture from memory - no lookup call, no render. Other finishes still go
 * through the normal lookup/render path.
 */
export type ComboRenderMap = Record<string, Record<string, PatternRender>>; // frontColorId → templeColorId → render

const comboCache = new Map<string, Promise<ComboRenderMap>>();

export function loadComboRenders(frameId: string): Promise<ComboRenderMap> {
  const hit = comboCache.get(frameId);
  if (hit) return hit;
  const frame = FRAMES.find((f) => f.id === frameId);
  if (!frame) return Promise.resolve({});
  const byCode = new Map(ACTIVE_COLORS.map((c) => [norm(c.code), c.id]));
  const p = (async () => {
    try {
      const { data, error } = await supabase
        .from("bespoke_render_cache")
        .select("selection_key,shape,public_url,alt_text")
        .like("selection_key", `v2|${norm(frame.shape)}|%|${PREVIEW_FINISH_ID}|plano|-`);
      if (error) return {};
      const map: ComboRenderMap = {};
      for (const row of data ?? []) {
        const [, , front, temple] = row.selection_key.split("|");
        const f = byCode.get(front);
        const t = byCode.get(temple);
        if (!f || !t) continue;
        (map[f] ??= {})[t] = { shape: row.shape, public_url: row.public_url, alt_text: row.alt_text };
      }
      return map;
    } catch {
      return {};
    }
  })();
  comboCache.set(frameId, p);
  // A failed load must not stick for the whole visit.
  p.then((m) => { if (!Object.keys(m).length) comboCache.delete(frameId); });
  return p;
}

/** Warm the browser cache so a temple tap swaps the picture without a download wait. */
export function preloadRenders(urls: (string | undefined)[]) {
  if (typeof window === "undefined") return;
  for (const u of urls) {
    if (!u) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = u;
  }
}
