import { useEffect, useState } from "react";
import { KICKSTARTER_LIVE_AT_MS, isKickstarterLive } from "@/config/kickstarter";

const GOLD = "#CAA449";
const CREAM = "#EDE9DE";
const TAUPE = "#B8B3A8";
const HAIRLINE = "rgba(255,255,255,0.12)";

const pad = (n: number) => String(n).padStart(2, "0");

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

const FMT: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

/** "Thu, Oct 29, 3:00 PM your time · 10:00 AM ET" (US East visitors see only the ET line). */
const launchLabel = () => {
  try {
    const local = new Intl.DateTimeFormat("en-US", FMT).format(new Date(KICKSTARTER_LIVE_AT_MS));
    const et = new Intl.DateTimeFormat("en-US", { ...FMT, timeZone: "America/New_York" }).format(new Date(KICKSTARTER_LIVE_AT_MS));
    return local === et ? `${et} ET` : `${local} your time · 10:00 AM ET`;
  } catch {
    return "Thu, Oct 29, 10:00 AM ET";
  }
};

/**
 * Countdown to the public Kickstarter launch (29.10.2026 10:00 ET).
 * Client-only (renders a fixed-height placeholder first, so prerender and
 * hydration match and the layout does not shift). Disappears at launch.
 */
export default function KickstarterCountdown({ note }: { note?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (now === null) return <div aria-hidden="true" style={{ minHeight: 86 }} />;
  if (isKickstarterLive(now)) return null;

  const { d, h, m, s } = parts(KICKSTARTER_LIVE_AT_MS - now);
  const units: [string, string][] = [
    ...(d > 0 ? ([[String(d), d === 1 ? "day" : "days"]] as [string, string][]) : []),
    [pad(h), "hrs"],
    [pad(m), "min"],
    [pad(s), "sec"],
  ];

  return (
    <div
      role="timer"
      aria-label={`Kickstarter launches in ${d} days ${h} hours ${m} minutes`}
      style={{
        border: `1px solid ${HAIRLINE}`,
        borderLeft: `2px solid ${GOLD}`,
        padding: "12px 16px",
        minHeight: 86,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px 16px",
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD }}>
          Kickstarter launch in
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: TAUPE }}>
          {launchLabel()}
        </p>
        {note && <p style={{ margin: "4px 0 0", fontSize: 12, color: CREAM }}>{note}</p>}
      </div>
      <div style={{ display: "flex", gap: 12 }} aria-hidden="true">
        {units.map(([v, l]) => (
          <div key={l} style={{ textAlign: "center", minWidth: 34 }}>
            <div style={{ fontSize: 24, lineHeight: 1, color: CREAM, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: TAUPE, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
