import { useEffect, useState } from "react";
import DeReservationCta from "@/components/de/DeReservationCta";
import { DE_PRICING, formatDePrice } from "@/content/de/pricing";

export default function DeMobileReservationBar() {
  const [pastHero, setPastHero] = useState(false);
  const [reservationVisible, setReservationVisible] = useState(true);
  const [cookieOpen, setCookieOpen] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector<HTMLElement>("[data-de-hero-reservation]");
    if (!heroCta) return;

    const update = () => {
      const rect = heroCta.getBoundingClientRect();
      setPastHero(rect.bottom < 0);
      setReservationVisible(rect.top < window.innerHeight && rect.bottom > 0);
      setCookieOpen(Boolean(document.querySelector("[data-woolet-cookie-banner]")));
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const visible = pastHero && !reservationVisible && !cookieOpen;

  return (
    <aside
      aria-hidden={!visible}
      className={`sticky-mobile-cta fixed inset-x-0 bottom-0 z-[90] flex min-h-[72px] items-center justify-between gap-3 border-t border-primary/30 bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] transition-transform duration-300 md:hidden ${visible ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
    >
      <span className="max-w-[55%] font-body text-[11px] leading-4 text-cream-dim">
        {formatDePrice(DE_PRICING.founderPriceEur)} statt {formatDePrice(DE_PRICING.regularPriceEur)} - {formatDePrice(DE_PRICING.reservationEur)} reserviert deinen Platz
      </span>
      <DeReservationCta source="sticky" variant="compact" />
    </aside>
  );
}