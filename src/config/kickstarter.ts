// Single source for the live Kickstarter prelaunch page. Never use a placeholder.
export const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces";

/**
 * Public launch: Thu 29.10.2026 15:00 Warsaw (CET) = 10:00 ET = 14:00 UTC.
 * From this moment the $1 reservation is closed everywhere (client + create-checkout)
 * and signups go straight to the thank-you page with the campaign link.
 * Keep in sync with supabase/functions/create-checkout/index.ts.
 */
export const KICKSTARTER_LIVE_AT_MS = Date.UTC(2026, 9, 29, 14, 0, 0);

const PREVIEW_KEY = "wlt_ks_live_preview";

/**
 * True once the public campaign is live. QA before launch: open any page with
 * ?ks_live=1 (sticks for the tab session), ?ks_live=0 clears it.
 */
export const isKickstarterLive = (now: number = Date.now()): boolean => {
  if (typeof window !== "undefined") {
    try {
      const flag = new URLSearchParams(window.location.search).get("ks_live");
      if (flag === "1") sessionStorage.setItem(PREVIEW_KEY, "1");
      if (flag === "0") sessionStorage.removeItem(PREVIEW_KEY);
      if (sessionStorage.getItem(PREVIEW_KEY) === "1") return true;
    } catch {
      /* storage blocked - fall back to the clock */
    }
  }
  return now >= KICKSTARTER_LIVE_AT_MS;
};

/**
 * Kickstarter custom referral tag "Woolet" (dashboard -> Custom Referral Tags).
 * Only tags generated in the dashboard count under "Pledged via custom referrers";
 * any other ?ref value lands in "external referrers" with no breakdown.
 * The site placement goes to utm_term / utm_content instead.
 */
export const KICKSTARTER_SITE_REF = "4rxoly";

/** Live campaign link: the "Woolet" custom referral tag + placement in UTMs. */
export const kickstarterLiveHref = (placement: string, slot = placement) =>
  `${KICKSTARTER_URL}?ref=${KICKSTARTER_SITE_REF}&utm_source=woolet_site&utm_medium=site&utm_campaign=ks_live&utm_term=${encodeURIComponent(placement)}&utm_content=${encodeURIComponent(slot)}`;

/**
 * $1 founder reservation, reopened 05.11.2026 for the rest of the campaign.
 * $1 -> secret Kickstarter reward "VIP Founder Edition - 009 Black" ($114, SRP $190, + $45 box).
 * Closes at the campaign deadline (Fri 04.12.2026); keep in sync with
 * supabase/functions/create-checkout/index.ts (RESERVATION_CLOSE_AT_MS).
 * QA: ?reserve_closed=1 previews the closed state for the tab session, ?reserve_closed=0 clears it.
 */
export const RESERVATION_CLOSE_AT_MS = Date.UTC(2026, 11, 4, 14, 0, 0);
const RESERVE_CLOSED_PREVIEW_KEY = "wlt_reserve_closed_preview";

export const isReservationOpen = (now: number = Date.now()): boolean => {
  if (typeof window !== "undefined") {
    try {
      const flag = new URLSearchParams(window.location.search).get("reserve_closed");
      if (flag === "1") sessionStorage.setItem(RESERVE_CLOSED_PREVIEW_KEY, "1");
      if (flag === "0") sessionStorage.removeItem(RESERVE_CLOSED_PREVIEW_KEY);
      if (sessionStorage.getItem(RESERVE_CLOSED_PREVIEW_KEY) === "1") return false;
    } catch {
      /* storage blocked - fall back to the clock */
    }
  }
  return now < RESERVATION_CLOSE_AT_MS;
};

/** Founder Edition facts used in $1 copy. Update FOUNDER_LEFT when pledges come in. */
export const FOUNDER_EDITION = {
  model: "009 Black",
  bridgeMm: 24,
  price: 114,
  srp: 190,
  boxValue: 45,
  total: 30,
  left: 19,
} as const;

/**
 * Secret Kickstarter reward (Founder Edition), only for $1 reservations.
 * ref=5fn1u9 = Kickstarter custom tag "ML Founders 114" (dashboard-generated, so it counts).
 */
export const KICKSTARTER_FOUNDER_REF = "5fn1u9";
export const KICKSTARTER_FOUNDER_TOKEN = "6d3cff02";
export const kickstarterFounderHref = (placement: string) =>
  `${KICKSTARTER_URL}?secret_reward_token=${KICKSTARTER_FOUNDER_TOKEN}&ref=${KICKSTARTER_FOUNDER_REF}&utm_source=woolet_site&utm_medium=site&utm_campaign=ks_founder&utm_term=${encodeURIComponent(placement)}`;

/**
 * Site CTAs while the $1 reservation is open (decision 05.11.2026): every main CTA
 * sends visitors to the signup LP (email -> $1 -> Founder Edition), not straight
 * to Kickstarter - pledges come from email + $1, not from direct traffic.
 * No UTMs on this internal link, so ad attribution (first/last touch) stays intact.
 */
export const FOUNDER_SIGNUP_PATH = "/en/lp/kickstarter";

export const founderCtaActive = (): boolean => isKickstarterLive() && isReservationOpen();

/** Short button label (fits one line on a phone). */
export const founderCtaShort = (_lang: string): string => `Founder Edition - $${FOUNDER_EDITION.price}`;

/** Long label for the hero button. */
export const founderCtaLong = (lang: string): string =>
  lang === "pl" ? "Odblokuj Founder Edition" : lang === "de" ? "Founder Edition freischalten" : "Unlock the Founder Edition";

/** Site-wide top bar text. */
export const founderBarLabel = (lang: string): string => {
  const F = FOUNDER_EDITION;
  if (lang === "pl") return `Founder Edition $${F.price} zamiast $${F.srp} - zostało ${F.left} z ${F.total}`;
  if (lang === "de") return `Founder Edition $${F.price} statt $${F.srp} - noch ${F.left} von ${F.total}`;
  return `Founder Edition: $${F.price} instead of $${F.srp} - ${F.left} of ${F.total} left`;
};
