import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SocialProofToast
 * ------------------------------------------------------------------
 * Subtle, dismissible bottom-left toast surfacing recent founding
 * member reservations. Premium tone, no urgency theatrics.
 *
 * Mount only on the post-email-capture "fit locked in" view.
 *
 * Backend contract (future):
 *   GET /api/recent-founders?limit=20
 *   → { reservations: [{ firstName, city, region, model, createdAt }] }
 *
 * Until that endpoint exists, we use a curated static fallback.
 */

type Reservation = {
  firstName: string;
  city: string;
  region: string; // US state code or EU country code
  model: string; // e.g. "009-L"
  createdAt: string; // ISO; for static data we synthesize at runtime
};

const STATIC_FOUNDERS: Omit<Reservation, "createdAt">[] = [
  // US
  { firstName: "Sarah", city: "Austin", region: "TX", model: "007-M" },
  { firstName: "Michael", city: "San Francisco", region: "CA", model: "009-L" },
  { firstName: "James", city: "Brooklyn", region: "NY", model: "009-M" },
  { firstName: "Tyler", city: "Seattle", region: "WA", model: "007-L" },
  { firstName: "David", city: "Boulder", region: "CO", model: "009-L" },
  { firstName: "Carlos", city: "Miami", region: "FL", model: "007-M" },
  { firstName: "Andrew", city: "Chicago", region: "IL", model: "009-L" },
  { firstName: "Brian", city: "Portland", region: "OR", model: "007-M" },
  { firstName: "Daniel", city: "Boston", region: "MA", model: "009-M" },
  { firstName: "Anthony", city: "Philadelphia", region: "PA", model: "007-L" },
  { firstName: "Emily", city: "Denver", region: "CO", model: "009-S" },
  { firstName: "Jake", city: "San Diego", region: "CA", model: "007-M" },
  { firstName: "Patrick", city: "Minneapolis", region: "MN", model: "009-L" },
  { firstName: "Ryan", city: "Atlanta", region: "GA", model: "007-L" },
  { firstName: "Steven", city: "Dallas", region: "TX", model: "009-L" },
  // EU
  { firstName: "Tomasz", city: "Warsaw", region: "PL", model: "009-L" },
  { firstName: "Marek", city: "Kraków", region: "PL", model: "007-L" },
  { firstName: "Lukas", city: "Munich", region: "DE", model: "009-L" },
  { firstName: "Felix", city: "Berlin", region: "DE", model: "007-M" },
  { firstName: "Sebastian", city: "Hamburg", region: "DE", model: "009-M" },
  { firstName: "Antoine", city: "Paris", region: "FR", model: "007-L" },
  { firstName: "Julien", city: "Lyon", region: "FR", model: "009-L" },
  { firstName: "Oliver", city: "London", region: "UK", model: "007-M" },
  { firstName: "Harry", city: "Manchester", region: "UK", model: "009-L" },
  { firstName: "Diego", city: "Barcelona", region: "ES", model: "007-L" },
  { firstName: "Marco", city: "Milan", region: "IT", model: "009-L" },
  { firstName: "Lorenzo", city: "Rome", region: "IT", model: "007-M" },
  { firstName: "Bas", city: "Amsterdam", region: "NL", model: "009-M" },
  { firstName: "Erik", city: "Stockholm", region: "SE", model: "007-L" },
  { firstName: "Andreas", city: "Zurich", region: "CH", model: "009-L" },
  { firstName: "Kasia", city: "Warsaw", region: "PL", model: "007-S" },
  { firstName: "Sophie", city: "Paris", region: "FR", model: "009-S" },
  { firstName: "Anna", city: "Berlin", region: "DE", model: "007-M" },
];

// Synthesized minute offsets so each popup feels increasingly recent in reverse:
// first popup looks "older" (e.g., 12 min), latest looks "just now".
const POPUP_MINUTE_OFFSETS = [23, 12, 7, 3, 1, 0];

const DISMISS_KEY = "social_proof_dismissed";
const DISMISS_TS_KEY = "social_proof_dismissed_at";
const VARIANT_KEY = "social_proof_enabled";
const MAX_POPUPS = 4;
const FIRST_DELAY_MS = 20_000;
const VISIBLE_MS = 7_000;
const MIN_GAP_MS = 50_000;
const MAX_GAP_MS = 90_000;

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const formatTimeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  return "1 day ago";
};

const pushGa = (event: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event, ...params });
  }
};

const getOrAssignVariant = (): "on" | "off" => {
  if (typeof window === "undefined") return "off";
  try {
    const existing = window.localStorage.getItem(VARIANT_KEY);
    if (existing === "on" || existing === "off") return existing;
    const assigned: "on" | "off" = Math.random() < 0.5 ? "on" : "off";
    window.localStorage.setItem(VARIANT_KEY, assigned);
    return assigned;
  } catch {
    return "on";
  }
};

const isDismissedRecently = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(DISMISS_KEY) !== "true") return false;
    const ts = Number(window.localStorage.getItem(DISMISS_TS_KEY) || 0);
    if (!ts) return true;
    const ageMs = Date.now() - ts;
    if (ageMs > 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(DISMISS_KEY);
      window.localStorage.removeItem(DISMISS_TS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export default function SocialProofToast() {
  const [current, setCurrent] = useState<Reservation | null>(null);
  const [visible, setVisible] = useState(false);

  const shownCount = useRef(0);
  const queue = useRef<Reservation[]>([]);
  const dismissed = useRef(false);
  const scrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variantRef = useRef<"on" | "off">("off");

  // Build the queue once per mount
  useEffect(() => {
    variantRef.current = getOrAssignVariant();
    if (variantRef.current === "off") return;
    if (isDismissedRecently()) {
      dismissed.current = true;
      return;
    }
    if (typeof window !== "undefined" && window.localStorage.getItem("reservation_completed") === "true") {
      return;
    }

    const shuffled = shuffle(STATIC_FOUNDERS).slice(0, MAX_POPUPS);
    queue.current = shuffled.map((entry, i) => {
      const minutesAgo = POPUP_MINUTE_OFFSETS[i] ?? 0;
      const createdAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
      return { ...entry, createdAt };
    });

    scheduleTimeout.current = setTimeout(showNext, FIRST_DELAY_MS);

    return () => {
      if (scheduleTimeout.current) clearTimeout(scheduleTimeout.current);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (exitTimeout.current) clearTimeout(exitTimeout.current);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause on scroll (debounced 2s after last scroll)
  useEffect(() => {
    const onScroll = () => {
      scrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        scrolling.current = false;
      }, 2000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scheduleNext = useCallback(() => {
    if (dismissed.current) return;
    if (shownCount.current >= MAX_POPUPS) return;
    const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
    scheduleTimeout.current = setTimeout(showNext, gap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    exitTimeout.current = setTimeout(() => {
      setCurrent(null);
      scheduleNext();
    }, 320);
  }, [scheduleNext]);

  function showNext() {
    if (dismissed.current) return;
    if (shownCount.current >= MAX_POPUPS) return;

    // Pause conditions: tab hidden, mid-scroll, or another modal-like dialog open
    const tabHidden = typeof document !== "undefined" && document.visibilityState === "hidden";
    const modalOpen = typeof document !== "undefined" && !!document.querySelector('[role="dialog"][data-state="open"]');
    if (tabHidden || scrolling.current || modalOpen) {
      // retry shortly
      scheduleTimeout.current = setTimeout(showNext, 4000);
      return;
    }

    const next = queue.current[shownCount.current];
    if (!next) return;
    shownCount.current += 1;
    setCurrent(next);
    // next frame → trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    pushGa("social_proof_shown", { model: next.model, region: next.region });
    try {
      window.sessionStorage.setItem("social_proof_seen_in_session", "true");
    } catch {
      /* noop */
    }

    hideTimeout.current = setTimeout(() => {
      hide();
    }, VISIBLE_MS);
  }

  const onDismiss = () => {
    dismissed.current = true;
    pushGa("social_proof_dismissed");
    try {
      window.localStorage.setItem(DISMISS_KEY, "true");
      window.localStorage.setItem(DISMISS_TS_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (scheduleTimeout.current) clearTimeout(scheduleTimeout.current);
    hide();
  };

  if (variantRef.current === "off" || !current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        zIndex: 60,
        left: "var(--sp-left, 24px)",
        bottom: "var(--sp-bottom, 24px)",
        width: "var(--sp-width, 300px)",
        maxWidth: "calc(100vw - 32px)",
        background: "#1a1a1a",
        border: "1px solid rgba(212, 166, 90, 0.25)",
        borderRadius: 6,
        padding: "12px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transform: visible ? "translateY(0)" : "translateY(100px)",
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 400ms ease-out, opacity 400ms ease-out"
          : "transform 300ms ease-in, opacity 300ms ease-in",
        willChange: "transform, opacity",
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 639px) {
          [data-social-proof-toast] {
            --sp-left: 16px !important;
            --sp-bottom: 16px !important;
            --sp-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>
      <span data-social-proof-toast style={{ display: "none" }} />

      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "50%",
          background: "rgba(212, 166, 90, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4A65A",
          fontSize: 13,
          lineHeight: 1,
        }}
      >
        ✓
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#E8DCC4", lineHeight: 1.35 }}>
          <span style={{ color: "#D4A65A", fontWeight: 600 }}>{current.firstName}</span>{" "}
          from {current.city}, {current.region} just reserved a founding spot
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#6a6a6a",
            letterSpacing: "0.3px",
            marginTop: 3,
            textTransform: "uppercase",
          }}
        >
          {formatTimeAgo(current.createdAt)} · Woolet {current.model}
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          color: "#6a6a6a",
          fontSize: 14,
          lineHeight: 1,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
