import { useState, type ReactNode } from "react";
import { pushGtmEvent } from "@/lib/gtm";

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
    <ellipse cx="44" cy="32" rx="19" ry="26" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
    <ellipse cx="34" cy="32" rx="8" ry="6" stroke={GOLD} strokeWidth="3" />
    <ellipse cx="54" cy="32" rx="8" ry="6" stroke={GOLD} strokeWidth="3" />
    <path d="M42 32h4" stroke={GOLD} strokeWidth="3" />
    <path d="M17 24q-6 8 0 16M11 20q-9 12 0 24" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M71 24q6 8 0 16M77 20q9 12 0 24" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconSplayed = (
  <svg viewBox="0 0 88 64" fill="none" aria-hidden="true" width="88" height="64">
    <path d="M14 22 Q44 8 74 22" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <circle cx="14" cy="22" r="3.5" fill={GOLD} />
    <circle cx="74" cy="22" r="3.5" fill={GOLD} />
    <path d="M14 22 L6 58" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <path d="M74 22 L82 58" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    <path d="M30 42 H16 M20 37 l-5 5 5 5" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M58 42 H72 M68 37 l5 5 -5 5" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconNarrow = (
  <svg viewBox="0 0 88 64" fill="none" aria-hidden="true" width="88" height="64">
    <ellipse cx="44" cy="32" rx="21" ry="26" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
    <ellipse cx="36" cy="32" rx="7" ry="5.5" stroke={GOLD} strokeWidth="3" />
    <ellipse cx="52" cy="32" rx="7" ry="5.5" stroke={GOLD} strokeWidth="3" />
    <path d="M43 32h2" stroke={GOLD} strokeWidth="3" />
    <path d="M29 32 H12 M12 27v10" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M59 32 H76 M76 27v10" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
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

  return (
    <div className="w-full max-w-[520px] flex flex-col gap-5">
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
              "flex flex-col gap-3 py-5",
              i > 0 ? "sm:pl-4 sm:border-l" : "",
              i > 0 ? "border-t sm:border-t-0" : "",
              "pr-3",
            ].join(" ")}
            style={{ borderColor: "hsl(0 0% 100% / 0.1)" }}
          >
            {s.icon}
            <span style={{ fontFamily: BARLOW, fontSize: "0.92rem", lineHeight: 1.3, fontWeight: 500 }}>
              {s.title}
            </span>
            <span className="text-cream-dim" style={{ fontFamily: BARLOW, fontSize: "0.8rem", lineHeight: 1.4 }}>
              {s.note}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-cream-dim m-0" style={{ fontFamily: BARLOW, fontSize: "0.9rem" }}>
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
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) pushGtmEvent("hero_numbers_open", { location: "home_hero" });
          }}
          className="w-full flex items-center justify-between uppercase tracking-[0.2em] text-cream-dim bg-transparent cursor-pointer"
          style={{ fontFamily: BARLOW, fontSize: "0.66rem", padding: "12px 16px", border: 0 }}
        >
          <span>Know your measurement? See the numbers</span>
          <span className="text-gold" aria-hidden="true">{open ? "–" : "+"}</span>
        </button>
        {open && <div style={{ padding: "4px 16px 18px" }}>{meter}</div>}
      </div>
    </div>
  );
}
