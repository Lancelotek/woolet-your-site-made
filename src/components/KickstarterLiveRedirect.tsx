import { useEffect } from "react";
import { kickstarterLiveHref } from "@/config/kickstarter";
import { pushGtmEvent } from "@/lib/gtm";

/**
 * Replaces a closed $1 reservation surface after launch: sends the visitor
 * straight to the live campaign, with a visible link if the redirect is blocked.
 */
export default function KickstarterLiveRedirect({ refTag, slot }: { refTag: string; slot: string }) {
  const href = kickstarterLiveHref(refTag, slot);
  useEffect(() => {
    pushGtmEvent("kickstarter_live_redirect", { slot });
    window.location.replace(href);
  }, [href, slot]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
        background: "#0f0f0f",
        color: "#EDE9DE",
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <p style={{ margin: 0, fontSize: 18 }}>Woolet is live on Kickstarter.</p>
      <a href={href} style={{ color: "#CAA449", textDecoration: "underline", textUnderlineOffset: 4 }}>
        Go to the campaign
      </a>
    </main>
  );
}
