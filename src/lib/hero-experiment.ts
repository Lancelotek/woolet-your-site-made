/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HERO HEADLINE A/B TEST — single self-contained file.
 *
 * To DISABLE the whole test in one edit: set EXPERIMENT_ENABLED = false below.
 * (The hero then always renders variant "a" = the control copy, and no
 * experiment analytics fire.)
 *
 * To enable variant c or d: just uncomment it in HERO_VARIANTS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const EXPERIMENT_ENABLED = true;

export const HERO_EXPERIMENT_ID = "hero_headline_v1";

const STORAGE_KEY = "woolet_hl_variant";

export type HeroVariant = {
  id: string;
  eyebrow: string;
  /** accent = gold serif italic, same style as today */
  headlineParts: { text: string; accent?: boolean }[];
  sub: string;
};

/** ── EDIT COPY HERE — no logic below depends on the wording. ───────────── */
export const HERO_VARIANTS: HeroVariant[] = [
  // Variant A — control (current page)
  {
    id: "a",
    eyebrow: "Eyewear built for wide faces",
    headlineParts: [
      { text: "Too wide for " },
      { text: "Ray-Ban, Persol", accent: true },
      { text: " or Warby Parker?" },
    ],
    sub: "Woolet designs glasses that finally fit. Mazzucchelli acetate, hand made in the EU — one honest width range (155–161 mm) built for faces the big brands ignore.",
  },
  // Variant B — ad message match
  {
    id: "b",
    eyebrow: "155–161 mm · Handmade in the EU",
    headlineParts: [
      { text: "Mazzucchelli acetate eyewear, " },
      { text: "engineered", accent: true },
      { text: " for wide faces." },
    ],
    sub: "Too wide for Ray-Ban, Persol or Warby Parker? Woolet's range starts at 155 mm — where most brands stop.",
  },
  // Variant C — number-first (INACTIVE — uncomment to enable)
  // {
  //   id: "c",
  //   eyebrow: "Italian acetate eyewear, engineered for wide faces",
  //   headlineParts: [
  //     { text: "Most frames stop at 148 mm. " },
  //     { text: "Ours start at 155.", accent: true },
  //   ],
  //   sub: "Mazzucchelli acetate from Milan, hand made in the EU. One honest width range, built for faces the big brands ignore.",
  // },
  // Variant D — identity / relief (INACTIVE — uncomment to enable)
  // {
  //   id: "d",
  //   eyebrow: "Eyewear engineered for wide faces",
  //   headlineParts: [
  //     { text: "Finally, glasses that " },
  //     { text: "don't pinch.", accent: true },
  //   ],
  //   sub: "Italian Mazzucchelli acetate, hand made in the EU, 155–161 mm — the range Ray-Ban, Persol and Warby Parker skip.",
  // },
];

const CONTROL = HERO_VARIANTS[0];

export type HeroAssignment = {
  variant: HeroVariant;
  /** true when forced via ?hl= — never persisted, never tracked */
  forced: boolean;
};

function readForced(): HeroVariant | null {
  if (typeof window === "undefined") return null;
  try {
    const id = new URLSearchParams(window.location.search).get("hl");
    if (!id) return null;
    return HERO_VARIANTS.find((v) => v.id === id.trim().toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

/**
 * Synchronous assignment — call from a lazy useState initializer so there is
 * zero flash of the wrong headline. Sticky per visitor via localStorage.
 */
export function assignHeroVariant(): HeroAssignment {
  if (!EXPERIMENT_ENABLED || typeof window === "undefined") {
    return { variant: CONTROL, forced: true };
  }

  const forced = readForced();
  if (forced) return { variant: forced, forced: true };

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  const existing = stored ? HERO_VARIANTS.find((v) => v.id === stored) : undefined;
  if (existing) return { variant: existing, forced: false };

  const picked = HERO_VARIANTS[Math.floor(Math.random() * HERO_VARIANTS.length)];
  try {
    window.localStorage.setItem(STORAGE_KEY, picked.id);
  } catch {
    /* private mode — still show the variant, just not sticky */
  }
  return { variant: picked, forced: false };
}

/** Variant id for analytics fired outside the hero (e.g. waitlist form). */
export function getTrackedVariantId(): string | null {
  if (!EXPERIMENT_ENABLED || typeof window === "undefined") return null;
  if (readForced()) return null; // QA preview — never pollute the data
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && HERO_VARIANTS.some((v) => v.id === stored) ? stored : null;
  } catch {
    return null;
  }
}

type Gtag = (...args: unknown[]) => void;

function gtagSafe(): Gtag | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof fn === "function" ? fn : null;
}

export function setHeroVariantUserProperty(variantId: string) {
  const gtag = gtagSafe();
  if (!gtag) return;
  gtag("set", "user_properties", { headline_variant: variantId });
}

export function trackHeroExposure(variantId: string) {
  const gtag = gtagSafe();
  if (!gtag) return;
  gtag("event", "experiment_view", {
    experiment_id: HERO_EXPERIMENT_ID,
    variant_id: variantId,
  });
}

export function trackHeroCtaClick(variantId: string, cta: "join_list" | "view_collection") {
  const gtag = gtagSafe();
  if (!gtag) return;
  gtag("event", "cta_click", {
    experiment_id: HERO_EXPERIMENT_ID,
    variant_id: variantId,
    cta,
  });
}

/** Fire on SUCCESSFUL waitlist submit only. */
export function trackWaitlistSignupExperiment() {
  const variantId = getTrackedVariantId();
  if (!variantId) return;
  const gtag = gtagSafe();
  if (!gtag) return;
  gtag("event", "waitlist_signup", {
    experiment_id: HERO_EXPERIMENT_ID,
    variant_id: variantId,
  });
}
