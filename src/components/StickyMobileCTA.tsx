import { useState, useEffect, useCallback } from "react";

const StickyMobileCTA = ({ count = 23 }: { count?: number }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const form = document.getElementById("waitlist-form");
    if (!form) return;

    // rootMargin adds 80px buffer so CTA hides before form is fully visible
    // — prevents flickering on iOS Safari
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "80px 0px 80px 0px" }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = useCallback(() => {
    const form = document.getElementById("waitlist-form");
    if (!form) return;
    // block: "center" works more reliably on iOS Safari
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:hidden transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
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
