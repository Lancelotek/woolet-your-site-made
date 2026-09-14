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

// Marks the session as a high-priority one Clarity should keep instead of
// sampling away. Used for paid Bespoke customers — there are only a handful
// of those sessions, and each one matters.
export const clarityUpgrade = (reason: string) => {
  const c = getClarity();
  if (!c) return;
  try {
    c("upgrade", reason);
  } catch {
    /* noop */
  }
};

// Admin routes render customer names, addresses and phone numbers on screen.
// Clarity is a third party outside our processor list and the panel has a
// single user, so recordings there carry privacy risk with zero value.
export const clarityStop = () => {
  const c = getClarity();
  if (!c) return;
  try {
    c("stop");
  } catch {
    /* noop */
  }
};
