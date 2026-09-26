/// <reference path="../types/global.d.ts" />
// Reads the bot flag set by the inline isLikelyBot() in index.html (runs
// before GTM and before this bundle). Falls back to calling it if needed.
export const isLikelyBot = (): boolean => {
  if (typeof window === "undefined") return true;
  const w = window as unknown as { __wooletBot?: boolean; isLikelyBot?: () => boolean };
  if (typeof w.__wooletBot === "boolean") return w.__wooletBot;
  const result = typeof w.isLikelyBot === "function" ? w.isLikelyBot() : navigator.webdriver === true;
  w.__wooletBot = result;
  return result;
};
