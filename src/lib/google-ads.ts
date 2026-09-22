import { isEuLikeVisitor } from "@/lib/meta-pixel";
import { isProdHost } from "@/lib/meta-capi";

const GOOGLE_ADS_ID = "AW-18213714775";
const CONVERSION_DESTINATION = `${GOOGLE_ADS_ID}/A5U-CPWdvoEdENf2_OxD`;
const SCRIPT_ID = "woolet-google-ads-tag";
const DEDUP_PREFIX = "wlt_google_ads_usd1:";

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __wooletGoogleAdsInitialized?: boolean;
};

const getGtagWindow = (): GtagWindow | null =>
  typeof window === "undefined" ? null : (window as GtagWindow);

/** Mirrors the direct Meta Pixel rule: production hosts and non-EU-like visitors only. */
export const initGoogleAds = (): boolean => {
  const w = getGtagWindow();
  if (!w || !isProdHost() || isEuLikeVisitor()) return false;

  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== "function") {
    w.gtag = (...args: unknown[]) => {
      w.dataLayer?.push(args);
    };
  }

  if (!document.getElementById(SCRIPT_ID) && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"]`)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);
  }

  if (!w.__wooletGoogleAdsInitialized) {
    w.__wooletGoogleAdsInitialized = true;
    w.gtag("js", new Date());
    w.gtag("config", GOOGLE_ADS_ID);
  }
  return true;
};

/** Fire one paid $1 reservation conversion per stable Stripe/order reference. */
export const trackGoogleAdsConversion = (orderRef?: string): boolean => {
  const w = getGtagWindow();
  if (!w || !initGoogleAds() || typeof w.gtag !== "function") return false;

  const stableRef = orderRef?.trim() || "usd1-reservation-confirmed";
  const storageKey = `${DEDUP_PREFIX}${stableRef}`;
  try {
    if (localStorage.getItem(storageKey) === "1") return false;
    // Reserve before sending so React re-renders cannot enqueue duplicates.
    localStorage.setItem(storageKey, "1");
  } catch {
    // Storage may be blocked; the caller's effect guard still prevents duplicate renders.
  }

  w.gtag("event", "conversion", {
    send_to: CONVERSION_DESTINATION,
    transaction_id: stableRef,
  });
  return true;
};
