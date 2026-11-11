import { useEffect, useState } from "react";

/**
 * Shown the moment a bespoke order is paid: the case number. The one action
 * that moves the order forward - the fitting form - is the button next to it
 * on the paid screen. The number is read from the order itself, never minted
 * in the browser - the webhook owns the counter.
 */
export default function BespokeCaseHero({ sessionId }: { sessionId: string }) {
  const [caseNo, setCaseNo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    // The webhook may land a second after the redirect, so retry briefly
    // rather than telling the customer the number does not exist.
    const attempt = async (left: number) => {
      let d: { case_no?: string | null } | null = null;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bespoke-order-get?sid=${encodeURIComponent(sessionId)}`,
        );
        if (res.ok) d = await res.json();
      } catch {
        /* the retry below covers a flaky first second after redirect */
      }
      if (cancelled) return;
      if (d?.case_no) {
        setCaseNo(d.case_no);
        return;
      }
      if (left > 0) setTimeout(() => void attempt(left - 1), 2500);
    };
    void attempt(4);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!caseNo) return null;

  return (
    <section
      className="mb-10 px-6 py-8 sm:px-10 sm:py-10"
      style={{ background: "#080807", border: "1px solid rgba(239,233,223,0.10)", borderRadius: 3 }}
    >
      <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "#C2A05A" }}>
        Your case number
      </div>
      <div
        className="mt-3 text-2xl sm:text-4xl"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          letterSpacing: "0.08em",
          color: "#EFE9DF",
        }}
      >
        {caseNo}
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(caseNo).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
        className="mt-3 px-3 py-2 text-[11px] uppercase tracking-[0.18em]"
        style={{ border: "1px solid rgba(194,160,90,0.45)", color: "#C2A05A", borderRadius: 2 }}
      >
        {copied ? "Copied" : "Copy number"}
      </button>
      <p className="mt-3 text-cream-dim text-[13px] leading-relaxed">
        This number stays on every document from here to delivery. Quote it whenever you write to
        us at support@woolet.co.
      </p>
    </section>
  );
}
