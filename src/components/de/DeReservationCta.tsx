import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DE_PRICING, deReservationUrl, formatDePrice } from "@/content/de/pricing";
import { pushGtmEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta-capi";

type Props = {
  source: string;
  className?: string;
  variant?: "button" | "link";
};

export default function DeReservationCta({ source, className, variant = "button" }: Props) {
  const clickedRef = useRef(false);
  const href = deReservationUrl(source);

  const onClick = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    const custom = {
      content_name: "reservation_de",
      currency: "EUR",
      value: DE_PRICING.reservationEur,
    };
    void trackMetaEvent("Lead", { custom });
    pushGtmEvent("reservation_de", { ...custom, source });
  };

  if (variant === "link") {
    return (
      <a href={href} onClick={onClick} className={className ?? "font-body text-sm text-primary underline underline-offset-4"}>
        Oder direkt für {formatDePrice(DE_PRICING.reservationEur)} reservieren →
      </a>
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
        <span>Sichere Zahlung über Stripe · {formatDePrice(DE_PRICING.reservationEur)} inkl. MwSt.</span>
        <span>Kostenloser Versand nach Deutschland</span>
      </div>
    </div>
  );
}