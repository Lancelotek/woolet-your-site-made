import { useLocation } from "react-router-dom";
import { isKickstarterLive, kickstarterLiveHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/** Live-campaign label per language; anything not listed falls back to English. */
export const ksLiveLabel = (lang: string): string =>
  lang === "pl" ? "Jesteśmy na Kickstarterze - wesprzyj teraz" : "We're live on Kickstarter - back it now";

/** Short button label (fits one line on a phone). */
export const ksLiveCta = (lang: string): string =>
  lang === "pl" ? "Wesprzyj na Kickstarterze" : "Back us on Kickstarter";

/**
 * Site-wide bar shown once the campaign is live: one click sends the visitor
 * straight to the Kickstarter page (custom referral tag + placement in UTMs).
 */
export default function KickstarterLiveBar() {
  const { pathname } = useLocation();
  if (!isKickstarterLive() || pathname.includes("/admin")) return null;
  const lang = pathname.split("/")[1] || "en";
  const href = kickstarterLiveHref("topbar", "live_bar");

  return (
    <a
      href={href}
      onClick={() => pushGtmEvent("kickstarter_live_click", { slot: "live_bar", path: pathname })}
      className="block w-full text-center no-underline uppercase"
      style={{
        background: "#CAA449",
        color: "#080807",
        fontFamily: "Barlow, sans-serif",
        fontWeight: 600,
        fontSize: "0.74rem",
        letterSpacing: "0.18em",
        padding: "11px 16px",
        position: "relative",
        zIndex: 60,
      }}
    >
      {ksLiveLabel(lang)} →
    </a>
  );
}
