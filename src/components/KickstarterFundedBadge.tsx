import { useLocation } from "react-router-dom";
import { isKickstarterLive, kickstarterLiveHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Campaign hit 100 % of the goal within 24 h of launch (29-30.10.2026).
 * "Funded in 24 hours" stays true for the rest of the campaign, so no live number here.
 */
export const KS_FUNDED = true;

export const ksFundedLabel = (lang: string): string =>
  lang === "pl"
    ? "Ufundowane w 24 godziny"
    : lang === "de"
      ? "In 24 Stunden finanziert"
      : lang === "fr"
        ? "Financé en 24 heures"
        : lang === "nl"
          ? "Gefinancierd in 24 uur"
          : "Funded in 24 hours";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Small pill badge, links to the live campaign. Renders nothing before launch. */
export default function KickstarterFundedBadge({ placement = "badge", lang: langProp }: { placement?: string; lang?: string }) {
  const { pathname } = useLocation();
  if (!KS_FUNDED || !isKickstarterLive()) return null;
  const lang = langProp || pathname.split("/")[1] || "en";

  return (
    <a
      href={kickstarterLiveHref(placement, "funded_badge")}
      onClick={() => pushGtmEvent("kickstarter_live_click", { slot: "funded_badge", placement, path: pathname })}
      className="inline-flex items-center gap-2 no-underline uppercase self-start"
      style={{
        background: "#E1FCEB",
        color: "#2E6644",
        border: "1px solid rgba(46,102,68,0.35)",
        borderRadius: 999,
        fontFamily: "Barlow, sans-serif",
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.16em",
        padding: "7px 14px",
        lineHeight: 1,
      }}
      aria-label={`${ksFundedLabel(lang)} - Kickstarter`}
    >
      <CheckIcon />
      {ksFundedLabel(lang)} · Kickstarter
    </a>
  );
}
