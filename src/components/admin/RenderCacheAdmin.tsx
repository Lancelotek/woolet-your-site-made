import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ANGLE_PROMPT_VERSION, COMPOSITION_REFERENCE_ROW_ID } from "@/data/bespoke-featured-renders";

interface CacheRow { id: string; shape: string | null; public_url: string; alt_text: string; prompt_version: string | null; }

export function RenderCacheAdmin({ password }: { password: string }) {
  const [rows, setRows] = useState<CacheRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const load = async () => {
    const { data, error } = await supabase.from("bespoke_render_cache").select("id,shape,public_url,alt_text,prompt_version").order("created_at", { ascending: false });
    if (error) setStatus(error.message); else setRows(data ?? []);
  };
  useEffect(() => { void load(); }, []);
  const old = rows.filter((r) => r.prompt_version !== ANGLE_PROMPT_VERSION && r.id !== COMPOSITION_REFERENCE_ROW_ID);
  const regenerate = async (targets: CacheRow[]) => {
    if (!window.confirm(`Regenerate ${targets.length} image(s) in the new angle? This spends AI credits. Existing images stay available until each replacement succeeds.`)) return;
    setBusy(true);
    let completed = 0;
    try {
      // Sequential, user-initiated only. Stop on any failure: no automatic retries or background credit spend.
      for (const row of targets) {
        setStatus(`Generating ${completed + 1}/${targets.length}: ${row.shape}`);
        const { data, error } = await supabase.functions.invoke("bespoke-preview-render", { body: { mode: "regenerate", rowId: row.id, password } });
        if (error) {
          const context = error.context;
          const detail = context instanceof Response ? await context.clone().json().catch(() => null) : null;
          throw new Error(detail?.error ?? error.message);
        }
        if (data?.error) throw new Error(data.error);
        completed++;
      }
      setStatus(`Completed ${completed}/${targets.length}.`);
    } catch (error) { setStatus(`Stopped after ${completed}/${targets.length}: ${error instanceof Error ? error.message : "Request failed"}`); }
    finally { setBusy(false); await load(); }
  };
  return (
    <details className="my-6 border-y border-border py-4 text-foreground">
      <summary className="cursor-pointer text-sm">AI render cache · {old.length} old-angle images · composition reference preserved</summary>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button variant="outline" disabled={busy || !old.length} onClick={() => void regenerate(old)}><RefreshCw />Regenerate all old prompt_version</Button>
        <span role="status" className="text-sm text-muted-foreground">{status}</span>
      </div>
      <div className="mt-4 max-h-96 overflow-auto">
        {rows.map((row) => <div key={row.id} className="flex items-center gap-4 border-b border-border py-3">
          <a href={row.public_url} target="_blank" rel="noopener noreferrer" className="shrink-0"><img src={row.public_url} alt={row.alt_text} loading="lazy" className="h-16 w-24 object-contain" /></a>
          <span className="min-w-0 flex-1 text-sm">{row.shape} · {row.prompt_version ?? "legacy"}</span>
          <Button variant="ghost" size="sm" disabled={busy || row.prompt_version === ANGLE_PROMPT_VERSION || row.id === COMPOSITION_REFERENCE_ROW_ID} onClick={() => void regenerate([row])}><RefreshCw />Regenerate in new angle</Button>
        </div>)}
      </div>
    </details>
  );
}