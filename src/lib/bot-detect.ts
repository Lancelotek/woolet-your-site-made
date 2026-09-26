/**
 * Reads the bot verdict computed in index.html (window.__wooletBot) before GTM.
 * Used to skip browser-side Meta Pixel / CAPI calls for headless & automated traffic.
 */
declare global {
  interface Window {
    __wooletBot?: boolean;
    isLikelyBot?: () => boolean;
  }
}

export const isLikelyBot = (): boolean => {
  if (typeof window === "undefined") return false;
  if (typeof window.__wooletBot === "boolean") return window.__wooletBot;
  return typeof navigator !== "undefined" && navigator.webdriver === true;
};
