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

/** Live campaign link with a Kickstarter referral tag (see woolet-ks-referral-tags-2026-10-10.csv). */
export const kickstarterLiveHref = (ref: string, slot = ref) =>
  `${KICKSTARTER_URL}?ref=${encodeURIComponent(ref)}&utm_source=woolet_site&utm_medium=site&utm_campaign=ks_live&utm_content=${encodeURIComponent(slot)}`;
