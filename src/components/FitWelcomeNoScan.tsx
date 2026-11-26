import { Link } from "react-router-dom";
import { localePath } from "@/i18n/routeRegistry";
import { FitBreadcrumbs } from "@/components/FitToolContent";
import type { Lang } from "@/lib/i18n";
import { pushGtmEvent } from "@/lib/gtm";

const GOLD = "#CAA449";
const BG = "#080807";
const MUTED = "#888888";

/**
 * /fit welcome while the camera fit app is offline (FITLENS_ENABLED = false).
 * Two working paths only - tape measure and the quick quiz - so no tap on this
 * page opens something that does not load.
 */
export default function FitWelcomeNoScan({ lang, isMobile }: { lang: Lang; isMobile: boolean }) {
  const de = lang === "de";
  const manualHref = de ? "/de/fit/manual" : localePath(lang, "/fit/manual");
  const quickHref = de ? "/de/fit/quick" : localePath(lang, "/fit/quick");
  const bespokeHref = de ? "/de/bespoke" : "/en/bespoke";

  const bullets = de
    ? [
        "Von Schläfe zu Schläfe messen, direkt vor den Ohren",
        "Wert in cm oder Zoll eingeben",
        "Wir sagen dir, ob 158 mm passt oder welche Maßanfertigung du brauchst",
      ]
    : [
        "Measure temple to temple, just in front of the ears",
        "Enter the number in cm or inches",
        "We tell you if 158 mm fits or which Bespoke width you need",
      ];

  return (
    <div className="flex flex-col gap-8">
      {lang === "en" && <FitBreadcrumbs current="scan" />}
      <div className="woolet-eyebrow">
        <div className="woolet-eyebrow-line" />
        <span className="woolet-eyebrow-text">{de ? "BRILLENFINDER · ETWA 2 MINUTEN" : "FRAME FINDER · ABOUT 2 MINUTES"}</span>
      </div>
      <h1
        className="font-display text-woolet-white"
        style={{ fontSize: isMobile ? "2.25rem" : "clamp(2.5rem, 5.5vw, 3.75rem)", fontWeight: 300, lineHeight: 1.05 }}
      >
        {de ? "Brillenfinder für breite Gesichter - deine Größe in" : "Frame Finder for Wide Faces - find your size in"}{" "}
        <em className="italic" style={{ color: GOLD }}>{de ? "2 Minuten" : "2 minutes"}</em>
      </h1>
      <p className="text-cream-dim" style={{ fontSize: isMobile ? "1.05rem" : "1.1rem", fontWeight: 300, lineHeight: 1.55 }}>
        {de
          ? "Miss deine Gesichtsbreite mit einem Maßband oder beantworte drei kurze Fragen. Wir empfehlen 007, 009 oder Maßanfertigung."
          : "Measure your face width with a tape, or answer three quick questions. We match you to 007, 009 or Bespoke."}
      </p>

      <section aria-label={de ? "Größe finden" : "Find your size"} className="flex flex-col gap-4 mt-1">
        {/* Primary path: the whole card is one link */}
        <Link
          to={manualHref}
          onClick={() => pushGtmEvent("fit_manual_alt_click", { source: "welcome_noscan_card" })}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 14 : 12,
            border: `1.5px solid ${GOLD}`,
            background: "rgba(202,164,73,0.06)",
            borderRadius: 12,
            padding: isMobile ? "24px 18px 20px" : "28px 26px 24px",
            textDecoration: "none",
            color: "#f0ece4",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -10,
              left: 16,
              background: GOLD,
              color: BG,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? "0.65rem" : "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 2,
            }}
          >
            {de ? "Empfohlen" : "Recommended"}
          </span>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 400,
              fontSize: isMobile ? "1.7rem" : "1.6rem",
              color: "#f0ece4",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {de ? "Maßband" : "Tape measure"} <em style={{ color: GOLD }}>· ~2 {de ? "Minuten" : "minutes"}</em>
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: isMobile ? 10 : 8, fontFamily: "Barlow, sans-serif" }}>
            {bullets.map((b) => (
              <li
                key={b}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: isMobile ? "0.95rem" : "0.85rem", color: "rgba(240,236,228,0.85)", fontWeight: 300, lineHeight: 1.5 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, marginTop: isMobile ? 7 : 8, flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: GOLD,
              color: BG,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: isMobile ? "0.85rem" : "0.78rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              borderRadius: 2,
              height: isMobile ? 56 : 52,
              width: "100%",
              marginTop: 4,
            }}
          >
            {de ? "Gesicht messen" : "Measure my face"}
          </span>
        </Link>

        {/* Second path: quiz */}
        <Link
          to={quickHref}
          onClick={() => pushGtmEvent("fit_quick_open", { source: "welcome_noscan" })}
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 12 : 16,
            padding: isMobile ? "18px" : "14px 18px",
            border: "1px dashed rgba(240,236,228,0.18)",
            background: "rgba(255,255,255,0.015)",
            borderRadius: 8,
            textDecoration: "none",
            color: "#f0ece4",
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 2, minWidth: 0 }}>
            <span style={{ fontFamily: "Barlow, sans-serif", fontSize: isMobile ? "1rem" : "0.95rem", fontWeight: 500 }}>
              {de ? "Kein Maßband zur Hand?" : "No tape at hand?"}
            </span>
            <span style={{ color: MUTED, fontFamily: "Barlow, sans-serif", fontSize: isMobile ? "0.9rem" : "0.82rem", fontWeight: 300, lineHeight: 1.45 }}>
              {de
                ? "Beantworte 2-3 kurze Fragen für eine ungefähre Größe in 30 Sekunden."
                : "Answer 2-3 quick questions (hat size, nose width) for a rough size in 30 sec."}
            </span>
          </span>
          <span style={{ color: GOLD, fontFamily: "Barlow, sans-serif", fontSize: isMobile ? "0.78rem" : "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
            {de ? "Quiz starten →" : "Take quiz →"}
          </span>
        </Link>

        <p style={{ margin: 0, textAlign: "center", fontFamily: "Barlow, sans-serif", fontSize: isMobile ? "0.88rem" : "0.82rem", color: MUTED, fontWeight: 300, lineHeight: 1.6 }}>
          {de ? "Zwischen zwei Größen oder über 161 mm? " : "Between sizes or above 161 mm? "}
          <Link to={bespokeHref} style={{ color: GOLD, textDecoration: "underline", textUnderlineOffset: 3 }}>
            {de ? "Maßanfertigung von 145 bis 160 mm" : "Bespoke from 145 to 160 mm"}
          </Link>
        </p>
      </section>
    </div>
  );
}
