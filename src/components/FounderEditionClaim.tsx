import { FOUNDER_EDITION as F, kickstarterFounderHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Shown after a paid $1 reservation: the secret Kickstarter reward link (Founder Edition).
 * The link carries the dashboard-generated Kickstarter tag, so pledges show up under custom referrers.
 */
export default function FounderEditionClaim({ placement }: { placement: string }) {
  const href = kickstarterFounderHref(placement);
  const track = () => pushGtmEvent("founder_claim_click", { placement });

  return (
    <div
      style={{
        border: "1px solid rgba(202,164,73,0.45)",
        padding: "28px 24px",
        margin: "28px auto 0",
        maxWidth: 520,
        textAlign: "left",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <p
        style={{
          fontFamily: "Barlow, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 11,
          color: "#CAA449",
          margin: 0,
        }}
      >
        Founder Edition unlocked
      </p>
      <h2
        style={{
          fontFamily: '"Cormorant Garamond", Cormorant, serif',
          fontWeight: 300,
          fontSize: 30,
          lineHeight: 1.15,
          color: "#F8F8F6",
          margin: "12px 0 0",
        }}
      >
        Your Founder frame is already made.
      </h2>
      <p style={{ color: "#D8D4CC", fontSize: 15, lineHeight: 1.65, margin: "14px 0 0" }}>
        This reward is hidden on Kickstarter - it isn't on the campaign page. It opens only from your private link below.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 10 }}>
        {[
          `${F.model}, ${F.bridgeMm} mm bridge: $${F.price} instead of $${F.srp} in the shop.`,
          `The Founder Box ($${F.boxValue} value): magnetic box, special case and the Clip-On Cloth.`,
          `Already made - ships right after the campaign ends on ${F.campaignEndLabel}.`,
        ].map((line) => (
          <li key={line} style={{ display: "flex", gap: 10, color: "#D8D4CC", fontSize: 14, lineHeight: 1.55 }}>
            <span aria-hidden="true" style={{ color: "#CAA449" }}>✓</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p style={{ color: "#9A8E7E", fontSize: 13, lineHeight: 1.6, margin: "16px 0 20px" }}>
        {F.left} of {F.total} left. We also emailed you this link.
      </p>
      <a
        href={href}
        onClick={track}
        onAuxClick={track}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 56,
          background: "#CAA449",
          color: "#0B0A09",
          fontFamily: "Barlow, sans-serif",
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: 2,
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        Claim my Founder frame - ${F.price}
      </a>
    </div>
  );
}
