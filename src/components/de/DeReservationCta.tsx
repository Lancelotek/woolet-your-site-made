import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DE_PRICING, formatDePrice, isDeReserved } from "@/content/de/pricing";
import { pushGtmEvent } from "@/lib/gtm";
import { isKickstarterLive, isReservationOpen, kickstarterLiveHref } from "@/config/kickstarter";

type Props = {
  source: string;
  className?: string;
  variant?: "button" | "link" | "compact";
};

/** German signup LP: email first, then the embedded 1 € checkout (DeFounderSteps). */
const DE_LP_PATH = "/de/lp/kickstarter";
const DE_LP_EMAIL_INPUT_ID = "de-founder-email-kickstarter_hero";

/**
 * Every German "Für 1 € reservieren" button (header, landing pages, product,
 * collection, fit results). Since 21.11.2026 it no longer opens the Stripe
 * Payment Link directly: it sends the visitor to the German LP so the email is
 * collected before the payment, like FOUNDER_SIGNUP_PATH on the English site.
 */
export default function DeReservationCta({ source, className, variant = "button" }: Props) {
  const { pathname } = useLocation();
  // After a paid reservation (/de/danke sets the flag) we stop offering the 1 € step.
  const [reserved, setReserved] = useState(false);
  useEffect(() => setReserved(isDeReserved()), []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    pushGtmEvent("founder_cta_click", { slot: source, market: "de", path: pathname });
    // Already on the LP: go to the email field instead of a dead self-link.
    if (pathname.replace(/\/$/, "") === DE_LP_PATH) {
      const input = document.getElementById(DE_LP_EMAIL_INPUT_ID);
      if (input) {
        e.preventDefault();
        input.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => input.focus({ preventScroll: true }), 350);
      }
    }
  };

  // 20.11.2026: the 1 € reservation is open again on German pages, like the $1 one
  // on the English site (reopened 05.11). The Kickstarter link only replaces it
  // once the reservation itself has closed.
  if (isKickstarterLive() && !isReservationOpen()) {
    const ksHref = kickstarterLiveHref("site_de", source);
    const track = () => pushGtmEvent("kickstarter_live_click", { slot: source, market: "de" });
    if (variant === "link") {
      return (
        <a href={ksHref} onClick={track} className={className ?? "font-body text-sm text-primary underline underline-offset-4"}>
          Jetzt auf Kickstarter unterstützen
        </a>
      );
    }
    return (
      <Button asChild className={variant === "compact" ? className ?? "h-10 shrink-0 rounded-sm px-4 font-body text-[10px] font-semibold uppercase tracking-[0.16em]" : `h-auto rounded-sm px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] ${className ?? ""}`}>
        <a href={ksHref} onClick={track}>{variant === "compact" ? "Zu Kickstarter" : "Jetzt auf Kickstarter unterstützen"}</a>
      </Button>
    );
  }

  if (reserved && variant === "compact") {
    return <span className="shrink-0 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">✓ Reserviert</span>;
  }

  if (reserved) {
    return (
      <p className={`font-body text-sm text-primary ${variant === "button" ? className ?? "" : ""}`}>
        ✓ Du hast reserviert - Founder-Preis {formatDePrice(DE_PRICING.founderPriceEur)} gesichert
      </p>
    );
  }

  if (variant === "link") {
    return (
      <Link to={DE_LP_PATH} onClick={onClick} className={className ?? "font-body text-sm text-primary underline underline-offset-4"}>
        Founder-Preis für {formatDePrice(DE_PRICING.reservationEur)} reservieren
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Button asChild className={className ?? "h-10 shrink-0 rounded-sm px-4 font-body text-[10px] font-semibold uppercase tracking-[0.16em]"}>
        <Link to={DE_LP_PATH} onClick={onClick}>Für {formatDePrice(DE_PRICING.reservationEur)} reservieren</Link>
      </Button>
    );
  }

  return (
    <div className={className}>
      <Button asChild className="h-auto rounded-sm px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em]">
        <Link to={DE_LP_PATH} onClick={onClick}>
          Für {formatDePrice(DE_PRICING.reservationEur)} reservieren
        </Link>
      </Button>
      <div className="mt-3 flex flex-col gap-1 font-body text-[13px] leading-5 text-cream-dim">
        <span>Erst E-Mail, dann 1 € - voll anrechenbar, jederzeit erstattbar</span>
        <span>Kostenloser Versand aus Polen (EU) nach Deutschland - kein Zoll</span>
      </div>
    </div>
  );
}