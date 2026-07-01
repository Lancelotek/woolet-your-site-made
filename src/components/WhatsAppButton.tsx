import { useState, useEffect, useCallback } from "react";
import { pushGtmEvent } from "@/lib/gtm";

// WhatsApp number in international format (no "+", spaces or dashes)
const PHONE = "48501390551";
// Pre-filled message that opens in the user's WhatsApp
const PREFILL = "Hi! I have a question about Big-Head Eyewear 👓";

const WHATSAPP_HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(PREFILL)}`;

const WhatsAppButton = () => {
  const [mounted, setMounted] = useState(false);
  const [shiftRight, setShiftRight] = useState(false);

  // Fade/scale in shortly after load so it doesn't compete with above-the-fold content
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Move left on mobile when a fixed bottom bar is present so it doesn't overlap
  // the bar's CTA button (e.g. bespoke configurator mobile Next button).
  useEffect(() => {
    const selector = ".cfg-mobilebar, .sticky-mobile-cta";
    const update = () => setShiftRight(Boolean(document.querySelector(selector)));
    update();
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  // Fire analytics on click — GTM dataLayer event (pick up in GTM as a GA4 conversion)
  const handleClick = useCallback(() => {
    pushGtmEvent("whatsapp_click", {
      channel: "whatsapp",
      location: typeof window !== "undefined" ? window.location.pathname : "",
    });
  }, []);

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className={[
        "fixed right-4 z-50",
        // Sit above the sticky mobile CTA bar on small screens, normal on desktop
        "bottom-24 md:bottom-6",
        "flex items-center justify-center",
        "h-14 w-14 rounded-full",
        "bg-[#25D366] text-white shadow-lg",
        "transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40",
        mounted ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.003 3.2C9.06 3.2 3.41 8.85 3.41 15.79c0 2.5.73 4.83 1.99 6.79L3.2 28.8l6.4-2.16a12.5 12.5 0 0 0 6.4 1.75h.01c6.94 0 12.59-5.65 12.59-12.59 0-3.36-1.31-6.52-3.69-8.9a12.5 12.5 0 0 0-8.9-3.7zm0 22.95h-.01a10.4 10.4 0 0 1-5.3-1.45l-.38-.23-3.8 1.28 1.3-3.7-.25-.39a10.36 10.36 0 0 1-1.59-5.53c0-5.76 4.69-10.45 10.46-10.45 2.79 0 5.42 1.09 7.39 3.06a10.39 10.39 0 0 1 3.06 7.4c0 5.76-4.69 10.45-10.45 10.45zm5.74-7.82c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.24-.68.08-.31-.16-1.33-.49-2.53-1.56-.94-.83-1.57-1.86-1.75-2.17-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.02-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.86-.76 2.13-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
