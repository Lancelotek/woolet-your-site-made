import { useState, type CSSProperties, type ReactNode } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { useMotionOnce } from "@/hooks/use-motion-once";
import "./HeroSymptoms.css";

/**
 * Hero "Sound familiar?" block — three fit symptoms a visitor can recognise
 * on their own head, without knowing a single millimetre. Replaces the
 * frame-width meter as the first thing under the headline; the meter is
 * still available behind "See the numbers" for people who know their size.
 */

const BARLOW = "Barlow, sans-serif";
const GOLD = "hsl(var(--gold))";
const RED = "#C8442F";

type Symptom = { title: string; note: string; icon: ReactNode };

const IconTemples = (
  <svg viewBox="0 0 88 64" fill="none" aria-hidden="true" width="88" height="64">
    <ellipse className="hs-face" cx="44" cy="32" rx="19" ry="26" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
    <ellipse className="hs-draw hs-gold" pathLength={1} cx="34" cy="32" rx="8" ry="6" stroke={GOLD} strokeWidth="3" />
    <ellipse className="hs-draw hs-gold" pathLength={1} cx="54" cy="32" rx="8" ry="6" stroke={GOLD} strokeWidth="3" />
    <path className="hs-draw hs-gold" pathLength={1} d="M42 32h4" stroke={GOLD} strokeWidth="3" />
    <path className="hs-draw hs-red" pathLength={1} d="M17 24q-6 8 0 16M11 20q-9 12 0 24" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
    <path className="hs-draw hs-red" pathLength={1} d="M71 24q6 8 0 16M77 20q9 12 0 24" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconSplayed = (
  <svg viewBox="0 0 88 64" fill="none" aria-hidden="true" width="88" height="64">
    <path className="hs-draw hs-gold" pathLength={1} d="M14 22 Q44 8 74 22" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <circle className="hs-face" cx="14" cy="22" r="3.5" fill={GOLD} />
    <circle className="hs-face" cx="74" cy="22" r="3.5" fill={GOLD} />
    <path className="hs-draw hs-gold" pathLength={1} d="M14 22 L6 58" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <path className="hs-draw hs-gold" pathLength={1} d="M74 22 L82 58" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <path className="hs-draw hs-red" pathLength={1} d="M30 42 H16 M20 37 l-5 5 5 5" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path className="hs-draw hs-red" pathLength={1} d="M58 42 H72 M68 37 l5 5 -5 5" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconNarrow = (
  <svg viewBox="0 0 88 64" fill="none" aria-hidden="true" width="88" height="64">
    <ellipse className="hs-face" cx="44" cy="32" rx="21" ry="26" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
    <ellipse className="hs-draw hs-gold" pathLength={1} cx="36" cy="32" rx="7" ry="5.5" stroke={GOLD} strokeWidth="3" />
    <ellipse className="hs-draw hs-gold" pathLength={1} cx="52" cy="32" rx="7" ry="5.5" stroke={GOLD} strokeWidth="3" />
    <path className="hs-draw hs-gold" pathLength={1} d="M43 32h2" stroke={GOLD} strokeWidth="3" />
    <path className="hs-draw hs-red" pathLength={1} d="M29 32 H12 M12 27v10" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
    <path className="hs-draw hs-red" pathLength={1} d="M59 32 H76 M76 27v10" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SYMPTOMS: Symptom[] = [
  { title: "Red marks on your temples", note: "The frame is clamping, not resting.", icon: IconTemples },
  { title: "Temples splayed outward", note: "Bent to fit — and getting looser every week.", icon: IconSplayed },
  { title: "The frame ends before your face does", note: "Lenses sit inside your eye line, not over it.", icon: IconNarrow },
];

type Props = {
  /** The existing frame-width / nose-bridge meter, rendered behind "See the numbers". */
  meter: ReactNode;
};

export default function HeroSymptoms({ meter }: Props) {
  const [open, setOpen] = useState(false);
  // Mount the meter on first open (it autoplays), then keep it for the close animation.
  const [meterMounted, setMeterMounted] = useState(false);
  const { ref: motionRef, phase } = useMotionOnce<HTMLDivElement>();

  return (
    <div ref={motionRef} data-motion={phase} className="w-full max-w-[520px] flex flex-col gap-5">
      <p
        className="font-display text-woolet-white m-0"
        style={{ fontSize: "1.35rem", fontStyle: "italic", fontWeight: 400 }}
      >
        Sound familiar?
      </p>

      <ul
        className="grid grid-cols-1 sm:grid-cols-3 m-0 p-0 list-none text-woolet-white"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.1)", borderBottom: "1px solid hsl(0 0% 100% / 0.1)" }}
      >
        {SYMPTOMS.map((s, i) => (
          <li
            key={s.title}
            className={[
              "flex flex-col items-center text-center gap-3 py-5 px-4 sm:items-start sm:text-left sm:px-0",
              i > 0 ? "sm:pl-4 sm:border-l" : "",
              i > 0 ? "border-t sm:border-t-0" : "",
            ].join(" ")}
            style={
              {
                borderColor: "hsl(0 0% 100% / 0.1)",
                "--hs-d0": `${i * 120}ms`,
                "--hs-d1": `${80 + i * 120}ms`,
                "--hs-d2": `${520 + i * 120}ms`,
                "--hs-d3": `${600 + i * 120}ms`,
              } as CSSProperties
            }
          >
            {s.icon}
            <span className="hs-copy" style={{ fontFamily: BARLOW, fontSize: "0.92rem", lineHeight: 1.3, fontWeight: 500 }}>
              {s.title}
            </span>
            <span className="hs-copy text-cream-dim" style={{ fontFamily: BARLOW, fontSize: "0.8rem", lineHeight: 1.4 }}>
              {s.note}
            </span>
          </li>
        ))}
      </ul>

      <p className="hs-verdict text-cream-dim m-0" style={{ fontFamily: BARLOW, fontSize: "0.9rem" }}>
        All three mean one thing:{" "}
        <strong className="text-gold" style={{ fontWeight: 600 }}>
          your frame is 10–15 mm too narrow.
        </strong>{" "}
        Woolet starts where they stop.
      </p>

      <div style={{ border: "1px solid hsl(0 0% 100% / 0.1)" }}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="hero-numbers-panel"
          onClick={() => {
            const next = !open;
            if (next && !meterMounted) {
              setMeterMounted(true);
              // let the collapsed panel paint once so the height can ease open
              requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
            } else {
              setOpen(next);
            }
            if (next) pushGtmEvent("hero_numbers_open", { location: "home_hero" });
          }}
          className="w-full flex items-center justify-between uppercase tracking-[0.2em] text-cream-dim bg-transparent cursor-pointer"
          style={{ fontFamily: BARLOW, fontSize: "0.75rem", padding: "12px 16px", border: 0 }}
        >
          <span>Know your measurement? See the numbers</span>
          <span className="hs-toggle-icon text-gold" aria-hidden="true">+</span>
        </button>
        <div id="hero-numbers-panel" className="hs-panel" data-open={open} aria-hidden={!open} {...(!open ? ({ inert: "" } as Record<string, string>) : {})}>
          <div>
            <div className="hs-panel-inner" style={{ padding: "4px 16px 18px" }}>
              {meterMounted && meter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
