import { useState, useEffect, useCallback } from "react";

const TOP_BUFFER_PX = 110;
const BOTTOM_BUFFER_PX = 140;

const StickyMobileCTA = ({ count = 23 }: { count?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("waitlist-form");
    if (!form) return;

    let rafId = 0;

    const updateVisibility = () => {
      const rect = form.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

      // Hide CTA when form overlaps the active viewport area with iOS-safe buffers
      const formInActiveViewport =
        rect.top <= viewportHeight - BOTTOM_BUFFER_PX &&
        rect.bottom >= TOP_BUFFER_PX;

      setVisible(!formInActiveViewport);
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateVisibility);
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      threshold: [0, 0.01, 0.1],
      rootMargin: `${TOP_BUFFER_PX}px 0px ${BOTTOM_BUFFER_PX}px 0px`,
    });

    observer.observe(form);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleUpdate);

    // Initial state
    scheduleUpdate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
    };
  }, []);

  const scrollToForm = useCallback(() => {
    const form = document.getElementById("waitlist-form");
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 flex items-center justify-between md:hidden transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{
        background: "#CAA449",
        padding: "14px 20px",
        paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 300,
          fontSize: 11,
          color: "rgba(0,0,0,0.7)",
        }}
      >
        {count} / 100 founding spots
      </span>
      <button
        onClick={scrollToForm}
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: "#080807",
          background: "transparent",
          border: "none",
          letterSpacing: "1px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Join the waitlist · 40% off at launch
      </button>
    </div>
  );
};

export default StickyMobileCTA;
