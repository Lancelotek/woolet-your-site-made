import { FOUNDER_EDITION as F, kickstarterFounderHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Shown after a paid $1 reservation: one big button to the secret Kickstarter reward (Founder Edition).
 * Kept minimal on purpose (decision 06.11.2026): the thank-you page only hands over the link.
 * The link carries the dashboard-generated Kickstarter tag, so pledges show up under custom referrers.
 */
export default function FounderEditionClaim({ placement }: { placement: string }) {
  const href = kickstarterFounderHref(placement);
  const track = () => pushGtmEvent("founder_claim_click", { placement });

  return (
    <div style={{ margin: "8px auto 0", maxWidth: 520, width: "100%", textAlign: "center" }}>
      <p style={{ color: "#D8D4CC", fontSize: 16, lineHeight: 1.6, margin: "0 0 22px" }}>
        Your hidden Founder reward is open - it isn't on the Kickstarter page. {F.model}, ${F.price} instead of ${F.srp}, with
        the ${F.boxValue} Founder Box.
      </p>
      <a
        href={href}
        onClick={track}
        onAuxClick={track}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 64,
          background: "#CAA449",
          color: "#0B0A09",
          fontFamily: "Barlow, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: 2,
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        Open my Founder reward on Kickstarter
      </a>
      <p style={{ color: "#9A8E7E", fontSize: 13, lineHeight: 1.6, margin: "14px 0 0" }}>
        Already made - ships right after the campaign ends on {F.campaignEndLabel}. We also emailed you this link.
      </p>
    </div>
  );
}
