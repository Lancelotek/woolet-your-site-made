import { useEffect, useRef, useState } from "react";

/**
 * Plays a one-shot entrance animation the first time an element scrolls into view.
 *
 * Returns a ref and a phase:
 *  - "rest": final state. This is what prerender/SSR and reduced-motion users get,
 *    so content is never hidden waiting for JS.
 *  - "pre":  start state, applied on mount only when motion is allowed.
 *  - "play": transitions run to the final state.
 *
 * Pair with CSS that only hides things under [data-motion="pre"].
 */
export type MotionPhase = "rest" | "pre" | "play";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function useMotionOnce<T extends Element>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [phase, setPhase] = useState<MotionPhase>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    setPhase("pre");
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // two frames so the "pre" styles are committed before transitions start
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => setPhase("play"));
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return { ref, phase };
}
