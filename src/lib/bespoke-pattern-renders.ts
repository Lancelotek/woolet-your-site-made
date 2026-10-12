import { supabase } from "@/integrations/supabase/client";

export interface PatternRender {
  shape: string | null;
  public_url: string;
  alt_text: string;
}

/** Rows arrive most-served first, with newest breaking ties. */
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
      .order("hits", { ascending: false })
      .order("created_at", { ascending: false });
    return error ? {} : selectPatternRenders(data ?? []);
  } catch {
    return {};
  }
}