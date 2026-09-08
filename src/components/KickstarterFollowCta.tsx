import { pushGtmEvent } from "@/lib/gtm";
import kickstarterWordmark from "@/assets/kickstarter-wordmark-white.png";

// Official prelaunch page. Do not alter the Kickstarter wordmark asset (brand policy).
const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces";

const HAIRLINE = "rgba(255,255,255,0.10)";
const HAIRLINE_STRONG = "rgba(255,255,255,0.18)";
const CREAM = "#EDE9DE";

export const kickstarterFollowHref = (slot: string) =>
  `${KICKSTARTER_URL}?utm_source=woolet_site&utm_medium=lp&utm_campaign=ks_prelaunch&utm_content=${slot}`;

/** The white Kickstarter wordmark CTA. Keep styling identical across both LP and confirmed page. */
export const KickstarterFollowCta = ({
  slot,
  variant = "outline",
  label = "Follow us on",
}: {
  slot: string;
  variant?: "outline" | "quiet";
  label?: string;
}) => {
  const quiet = variant === "quiet";
  return (
    <a
      href={kickstarterFollowHref(slot)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushGtmEvent("kickstarter_follow_click", { slot, source: "ks_lp" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        minHeight: 44,
        padding: quiet ? "8px 12px" : "12px 18px",
        border: `1px solid ${quiet ? HAIRLINE : HAIRLINE_STRONG}`,
        background: "transparent",
        color: CREAM,
        textDecoration: "none",
        fontFamily: "Barlow, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ opacity: 0.75 }}>{label}</span>
      {/* Official white Kickstarter wordmark — never recolour, crop or restyle. */}
      <img
        src={kickstarterWordmark}
        alt="Kickstarter"
        width={960}
        height={102}
        loading="lazy"
        decoding="async"
        style={{ height: 12, width: "auto", display: "block" }}
      />
    </a>
  );
};
