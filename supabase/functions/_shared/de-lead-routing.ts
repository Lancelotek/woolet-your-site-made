// German-page lead routing for mailerlite-subscribe.
//
// Until 23.11.2026 only forms that sent source "DE" reached the "Woolet VIP DE"
// group. Shared forms (fit scan, bespoke waitlist, scan handoff) send their own
// source, so a German visitor signing up on /de/fit or /de/bespoke landed in an
// English group and got the English sequence. The page URL decides instead.

/** True when the signup happened on a /de page of woolet.co. */
export function isDePage(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const path = new URL(url, "https://woolet.co").pathname.toLowerCase();
    return path === "/de" || path.startsWith("/de/");
  } catch {
    return false;
  }
}

/** Sources that keep their own group even on a German page. */
const KEEP_OWN_GROUP = new Set(["bespoke_save", "kickstarter"]);

/** Whether this signup belongs in the German group. */
export function routesToDeGroup(source: unknown, eventSourceUrl: unknown): boolean {
  const s = typeof source === "string" ? source : "";
  if (s === "DE" || s === "de") return true;
  if (KEEP_OWN_GROUP.has(s)) return false;
  return isDePage(eventSourceUrl);
}
