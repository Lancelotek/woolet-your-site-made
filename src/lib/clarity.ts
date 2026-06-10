// Microsoft Clarity helpers.
// Clarity is loaded by index.html ONLY on the production host (woolet.co)
// so preview/dev domains don't pollute analytics. These helpers are safe
// to call from anywhere — they no-op when Clarity isn't loaded.

export const isProdHost = () =>
  typeof window !== "undefined" &&
  /(^|\.)woolet\.co$/.test(window.location.hostname);

type ClarityFn = (...args: unknown[]) => void;

const getClarity = (): ClarityFn | null => {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { clarity?: ClarityFn }).clarity;
  return typeof fn === "function" ? fn : null;
};

export const clarityEvent = (name: string) => {
  const c = getClarity();
  if (!c) return;
  try {
    c("event", name);
  } catch {
    /* noop */
  }
};

export const claritySet = (key: string, value: string) => {
  const c = getClarity();
  if (!c) return;
  try {
    c("set", key, value);
  } catch {
    /* noop */
  }
};
