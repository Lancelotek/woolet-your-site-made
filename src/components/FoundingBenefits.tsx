import { useEffect, useRef, useState } from "react";

/**
 * Founding-member value props — mirrors the Kickstarter LP.
 * Pure presentational; no browser APIs at module scope (SSR/prerender-safe).
 */

const BENEFITS: { title: string; sub: string }[] = [
  { title: "40% off launch price", sub: "$114 instead of $190 — locked in at checkout" },
  { title: "Free worldwide shipping", sub: "No minimum order value" },
  { title: "48h early access", sub: "First pick of colours & models before public launch" },
];

export const FoundingBenefits = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "hsl(var(--gold) / 0.06)",
        border: "1px solid hsl(var(--gold) / 0.22)",
      }}
      aria-label="Founding member benefits"
    >
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{
          borderBottom: "1px solid hsl(var(--gold) / 0.18)",
          background: "hsl(var(--gold) / 0.05)",
        }}
      >
        <span
          className="uppercase tracking-[0.28em] text-primary"
          style={{ fontSize: "10px", fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
        >
          Founding member
        </span>
      </div>
      {BENEFITS.map((b, i) => (
        <div
          key={b.title}
          className="flex items-start gap-3 px-4 py-3"
          style={{
            borderBottom:
              i < BENEFITS.length - 1 ? "1px solid hsl(0 0% 100% / 0.055)" : "none",
          }}
        >
          <span
            className="flex-shrink-0 flex items-center justify-center text-primary"
            style={{
              width: 18,
              height: 18,
              border: "1px solid hsl(var(--gold) / 0.45)",
              fontSize: "10px",
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            ✓
          </span>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-woolet-white"
              style={{
                fontSize: compact ? "12px" : "13px",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              {b.title}
            </span>
            <span
              className="text-cream-dim"
              style={{
                fontSize: compact ? "11px" : "12px",
                fontFamily: "Barlow, sans-serif",
                lineHeight: 1.45,
              }}
            >
              {b.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Urgency + social proof band. Mirrors WaitlistForm's progress pill so the
 * FitWizard email step gets the same signal without duplicating the form.
 */
export const FoundingUrgency = ({ initial = 23 }: { initial?: number }) => {
  const [count] = useState(initial);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${count}%`;
    }, 300);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{
          background: "#1a1612",
          borderRadius: "999px",
          padding: "6px 16px",
          height: "32px",
        }}
      >
        <div
          ref={fillRef}
          className="absolute left-0 top-0 h-full transition-all duration-[1.8s] ease-out"
          style={{ width: "0%", background: "#c9a84c", borderRadius: "999px" }}
        />
        <span
          className="relative z-10 font-bold tracking-wider"
          style={{ fontSize: "12px", color: "#0f0f0f", fontFamily: "Barlow, sans-serif" }}
        >
          {count} of 100 founding member spots remaining
        </span>
      </div>
      <p
        className="text-center"
        style={{
          fontFamily: "Barlow, sans-serif",
          fontWeight: 300,
          fontSize: 12,
          color: "#7A7570",
          margin: 0,
        }}
      >
        <span style={{ fontWeight: 500, color: "#CAA449" }}>4,900+</span> people on the waitlist
      </p>
    </div>
  );
};

export default FoundingBenefits;
