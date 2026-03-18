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
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:hidden transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{
        background: "hsl(0 0% 10%)",
        borderTop: "1px solid hsl(var(--gold))",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span className="text-cream-dim tracking-wider" style={{ fontSize: "0.72rem" }}>
        🔥 {count} / 100 spots left
      </span>
      <button
        onClick={scrollToForm}
        className="bg-primary text-primary-foreground font-semibold uppercase tracking-[0.2em] px-4 py-2 border-none cursor-pointer hover:bg-gold-light transition-colors"
        style={{ fontSize: "0.62rem" }}
      >
        Join Waitlist →
      </button>
    </div>
  );
};

export default StickyMobileCTA;
