import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DE_PRICING, deReservationUrl, formatDePrice, isDeReserved } from "@/content/de/pricing";
import { pushGtmEvent } from "@/lib/gtm";
import { trackInitiateCheckoutOnce, uuid } from "@/lib/meta-capi";
import { withGaPaymentLink } from "@/lib/ga-ids";

type Props = {
  source: string;
  className?: string;
  variant?: "button" | "link" | "compact";
};

export default function DeReservationCta({ source, className, variant = "button" }: Props) {
  const clickedRef = useRef(false);
  const href = deReservationUrl(source);
  // After a paid reservation (/de/danke sets the flag) we stop offering the
  // 1 € link: 21.10.2026 a buyer came back from Stripe and paid a second time.
  const [reserved, setReserved] = useState(false);
  useEffect(() => setReserved(isDeReserved()), []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // GA ids go into client_reference_id at tap time so payments-webhook can
    // attribute the Payment Link purchase to the visitor's GA4 session.
    e.currentTarget.href = withGaPaymentLink(href);
    if (clickedRef.current) return;
    clickedRef.current = true;
    const custom = {
      content_name: "reservation_de",
      currency: "EUR",
      value: DE_PRICING.reservationEur,
    };
    const eventId = uuid();
    // A click on the 1 EUR link starts a checkout - it is not a Lead (the
    // signup already sent one). Counting it as Lead inflated Meta Leads.
    trackInitiateCheckoutOnce(`de-reservation:${source}`, { custom, eventId });
    pushGtmEvent("generate_lead", { ...custom, source, event_id: eventId });
  };

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
      <a href={href} onClick={onClick} className={className ?? "font-body text-sm text-primary underline underline-offset-4"}>
        Oder direkt für {formatDePrice(DE_PRICING.reservationEur)} reservieren
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <Button asChild className={className ?? "h-10 shrink-0 rounded-sm px-4 font-body text-[10px] font-semibold uppercase tracking-[0.16em]"}>
        <a href={href} onClick={onClick}>Für {formatDePrice(DE_PRICING.reservationEur)} reservieren</a>
      </Button>
    );
  }

  return (
    <div className={className}>
      <Button asChild className="h-auto rounded-sm px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em]">
        <a href={href} onClick={onClick}>
          Für {formatDePrice(DE_PRICING.reservationEur)} reservieren
        </a>
      </Button>
      <div className="mt-3 flex flex-col gap-1 font-body text-[13px] leading-5 text-cream-dim">
        <span>Karte, Apple Pay oder Google Pay - voll anrechenbar, jederzeit erstattbar</span>
        <span>Kostenloser Versand nach Deutschland</span>
      </div>
    </div>
  );
}