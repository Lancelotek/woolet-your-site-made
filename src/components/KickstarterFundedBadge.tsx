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

/** Official Kickstarter "Just funded" badge (Kickstarter badge kit), links to the live campaign. Renders nothing before launch. */
export default function KickstarterFundedBadge({ placement = "badge", lang: langProp }: { placement?: string; lang?: string }) {
  const { pathname } = useLocation();
  if (!KS_FUNDED || !isKickstarterLive()) return null;
  const lang = langProp || pathname.split("/")[1] || "en";

  return (
    <a
      href={kickstarterLiveHref(placement, "funded_badge")}
      onClick={() => pushGtmEvent("kickstarter_live_click", { slot: "funded_badge", placement, path: pathname })}
      className="inline-block self-start transition-transform hover:-translate-y-0.5"
      aria-label={`${ksFundedLabel(lang)} - Kickstarter`}
    >
      <img
        src="/brand/kickstarter-just-funded.png"
        alt="Just funded on Kickstarter"
        width={108}
        height={75}
        loading="eager"
        decoding="async"
        style={{ display: "block", width: 108, height: "auto" }}
      />
    </a>
  );
}
