import { supabase } from "@/integrations/supabase/client";
import { FEATURED_RENDER_KEYS } from "@/data/bespoke-featured-renders";

export interface PatternRender {
  shape: string | null;
  public_url: string;
  alt_text: string;
}

/** One explicitly pinned combination per shape. */
export function selectPatternRenders(rows: PatternRender[]): Record<string, PatternRender> {
  const result: Record<string, PatternRender> = {};
  for (const row of rows) {
    const shape = row.shape?.trim().toLowerCase().replace(/\s+/g, "-");
    if (shape && !result[shape]) result[shape] = row;
  }
  return result;
}

export async function loadPatternRenders(): Promise<Record<string, PatternRender>> {
  try {
    const { data, error } = await supabase.from("bespoke_render_cache")
      .select("shape,public_url,alt_text")
      .in("selection_key", FEATURED_RENDER_KEYS);
    return error ? {} : selectPatternRenders(data ?? []);
  } catch {
    return {};
  }
}