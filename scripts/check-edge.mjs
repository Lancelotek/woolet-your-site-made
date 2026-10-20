#!/usr/bin/env node
/**
 * Edge check (fix pack 20.10.2026): proves whether woolet.co traffic goes
 * through the woolet-route-server Worker. Every Worker response carries
 * "x-woolet-edge: route-server"; without it the request was answered by the
 * Lovable origin directly (no real 301 / 404 on the apex).
 *
 *   node scripts/check-edge.mjs            # default URL list
 *   node scripts/check-edge.mjs /en/x ...  # custom paths or full URLs
 */
const BASE = "https://woolet.co";
const DEFAULT = [
  "/",
  "/index.html",
  "/?no_redirect=true",
  "/en",
  "/en/this-does-not-exist-xyz",
  "/en/blog/how-to-tell-if-your-face-wide-or-narrow",
  "/charging-mousepad/",
  "https://www.woolet.co/",
];
const EXPECT = {
  "/": [301, "/en"],
  "/index.html": [301, "/en"],
  "/?no_redirect=true": [301, "/en?no_redirect=true"],
  "/en": [200, null],
  "/en/this-does-not-exist-xyz": [404, null],
  "/en/blog/how-to-tell-if-your-face-wide-or-narrow": [301, "/en/blog/how-to-tell-if-your-face-is-wide-or-narrow"],
  "/charging-mousepad/": [301, null],
  "https://www.woolet.co/": [301, null],
};

const targets = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
let fail = 0;
for (const t of targets) {
  const url = /^https?:/.test(t) ? t : BASE + t;
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" } });
    const loc = res.headers.get("location") || "";
    const edge = res.headers.get("x-woolet-edge") || "-";
    const exp = EXPECT[t];
    let ok = edge === "route-server";
    if (exp) {
      if (res.status !== exp[0]) ok = false;
      if (exp[1] && !loc.endsWith(exp[1])) ok = false;
    }
    if (!ok) fail += 1;
    console.log(`${ok ? "OK  " : "FAIL"} ${String(res.status).padEnd(3)} edge=${edge.padEnd(12)} ${url}${loc ? `  ->  ${loc}` : ""}`);
  } catch (e) {
    fail += 1;
    console.log(`FAIL ERR ${url}  ${e.message}`);
  }
}
console.log(fail ? `\n${fail} check(s) failed - apex is not served through the Worker (see docs/prompts/2026-10-20-seo-ga4-fixpack.md, Zadanie 1).` : "\nAll checks passed.");
process.exit(fail ? 1 : 0);
