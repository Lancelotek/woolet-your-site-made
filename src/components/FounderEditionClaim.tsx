import { FOUNDER_EDITION as F, founderOrderPath, isKickstarterEnded, kickstarterFounderHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Shown after a paid $1 reservation: one big button to the secret Kickstarter reward (Founder Edition).
 * After the Kickstarter deadline (decision 21.11.2026) the same button opens the order page on
 * woolet.co instead: Stripe, no account, ships right after the order.
 * Kept minimal on purpose (decision 06.11.2026): the thank-you page only hands over the link.
 * The link carries the dashboard-generated Kickstarter tag, so pledges show up under custom referrers.
 */
export default function FounderEditionClaim({ placement }: { placement: string }) {
  const ended = isKickstarterEnded();
  const href = ended
    ? `${founderOrderPath("en")}?utm_source=woolet_site&utm_medium=site&utm_campaign=founder_claim&utm_term=${encodeURIComponent(placement)}`
    : kickstarterFounderHref(placement);
  const track = () => pushGtmEvent("founder_claim_click", { placement, destination: ended ? "site" : "kickstarter" });

  return (
    <div style={{ margin: "8px auto 0", maxWidth: 520, width: "100%", textAlign: "center" }}>
      <p style={{ color: "#D8D4CC", fontSize: 16, lineHeight: 1.6, margin: "0 0 22px" }}>
        {ended
          ? "Your Founder price is locked."
          : "Your hidden Founder reward is open - it isn't on the Kickstarter page."}{" "}
        {F.model}, ${F.price} instead of ${F.srp}, with the ${F.boxValue} Founder Box.
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
        {ended ? `Order my Founder Edition - $${F.price}` : "Open my Founder reward on Kickstarter"}
      </a>
      <p style={{ color: "#9A8E7E", fontSize: 13, lineHeight: 1.6, margin: "14px 0 0" }}>
        {ended
          ? "Order on woolet.co - no account needed. Ships from the EU right after your order. We also emailed you this link."
          : `Already made - ships right after the campaign ends on ${F.campaignEndLabel}. We also emailed you this link.`}
      </p>
    </div>
  );
}
