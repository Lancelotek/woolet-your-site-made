import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildInterviewBookingUrl } from "@/lib/bespoke-case";

/**
 * Shown the moment a bespoke order is paid: the case number, and the one
 * action that moves the order forward. The number is read from the order
 * itself, never minted in the browser — the webhook owns the counter.
 */
export default function BespokeCaseHero({ sessionId }: { sessionId: string }) {
  const [caseNo, setCaseNo] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    // The webhook may land a second after the redirect, so retry briefly
    // rather than telling the customer the number does not exist.
    const attempt = async (left: number) => {
      const { data } = await supabase.functions.invoke("bespoke-order-get", {
        method: "GET",
        // @ts-expect-error query params are supported by the functions client
        query: { sid: sessionId },
      });
      const d = data as { case_no?: string | null; booking_url?: string | null } | null;
      if (cancelled) return;
      if (d?.case_no) {
        setCaseNo(d.case_no);
        setBookingUrl(d.booking_url ?? buildInterviewBookingUrl({ caseNo: d.case_no }));
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
      <p className="mt-3 text-cream-dim text-[13px] leading-relaxed">
        This number stays on every document from here to delivery.
      </p>

      <a
        href={bookingUrl ?? buildInterviewBookingUrl({ caseNo })}
        target="_blank"
        rel="noopener"
        className="mt-6 inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] font-medium"
        style={{ background: "#CAA449", color: "#1F1B16", borderRadius: 2 }}
      >
        Book your fitting interview
      </a>
      <p className="mt-3 text-[12px]" style={{ color: "rgba(239,233,223,0.45)" }}>
        You will also get this link by email.
      </p>
    </section>
  );
}
