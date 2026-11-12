/**
 * Append the current query string and hash to an internal redirect target.
 * The query is copied as-is: utm_source, gclid and fbclid are never rewritten.
 */
export function preserveSearch(to: string, search = "", hash = ""): string {
  if (!to || to.includes("?") || to.includes("#")) return to;
  return `${to}${search}${hash}`;
}
