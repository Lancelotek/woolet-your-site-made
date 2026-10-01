import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const OPTIONS = [
  "Instagram", "Facebook", "TikTok", "Google search", "ChatGPT or another AI assistant", "Kickstarter", "A friend",
];

/** Post-payment, skippable "where did you first hear about Woolet?" — one tap saves. */
export default function HeardFromQuestion({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<"ask" | "other" | "done">("ask");
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const shuffled = useMemo(() => [...OPTIONS].sort(() => Math.random() - 0.5), []);

  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) return null;

  const save = async (answer: string) => {
    setBusy(true);
    setState("done");
    try {
      await supabase.functions.invoke("save-heard-from", { body: { session_id: sessionId, answer } });
    } catch { /* non-blocking */ }
    setBusy(false);
  };

  if (state === "done") {
    return <p role="status" className="mt-6 text-sm text-primary">Thanks!</p>;
  }

  return (
    <section aria-labelledby="heard-from-q" className="mt-8 border border-border rounded-sm p-5 text-left">
      <p id="heard-from-q" className="text-foreground text-base mb-4">
        Quick one - where did you first hear about Woolet?
      </p>
      <div className="flex flex-wrap gap-2">
        {shuffled.map((o) => (
          <button
            key={o}
            type="button"
            disabled={busy}
            onClick={() => save(o)}
            className="min-h-[44px] px-4 rounded-sm border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {o}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => setState("other")}
          className="min-h-[44px] px-4 rounded-sm border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          Other
        </button>
      </div>
      {state === "other" && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); void save(other.trim() ? `Other: ${other.trim()}` : "Other"); }}
        >
          <input
            autoFocus
            maxLength={80}
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Where?"
            aria-label="Where did you hear about Woolet"
            className="flex-1 min-h-[44px] px-3 rounded-sm bg-transparent border border-border text-foreground text-sm"
          />
          <button type="submit" className="min-h-[44px] px-4 rounded-sm bg-primary text-primary-foreground text-sm">
            Save
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Optional — skip it if you like.</p>
    </section>
  );
}
