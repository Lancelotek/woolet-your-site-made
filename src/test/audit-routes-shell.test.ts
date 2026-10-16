import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync("scripts/audit-routes.mjs", "utf8");
const loop = source.match(/for \(const p of \[\.\.\.concrete\]\.sort\(\)\) \{[\s\S]*?\n\}/)?.[0];
if (!loop) throw new Error("Route coverage loop not found");

function audit(pages: Record<string, string>) {
  const state = {
    concrete: new Set(Object.keys(pages)),
    ALLOW: [/^\/$/, /^\/[a-z]{2}\/crm(?:\/|$)/],
    has: () => true,
    isStub: () => false,
    resolve: (_dist: string, path: string) => path.slice(1),
    existsSync: () => true,
    readFileSync: (path: string) => pages[path],
    DIST: "dist",
  };
  return runInNewContext(`const errors = []; let pre=0, stub=0, allowed=0; ${loop}; ({errors, pre, allowed})`, state);
}

describe("production route coverage guard", () => {
  it("permits only the intentional root shell while checking real pages", () => {
    const result = audit({
      "/": '<title data-seo="prerender">Page not found | Woolet</title>',
      "/en/bespoke/checkout": '<title>Secure checkout · Woolet Bespoke</title><meta name="description" content="Complete your order">',
    });
    expect([...result.errors]).toEqual([]);
    expect(result.allowed).toBe(1);
    expect(result.pre).toBe(1);
  });
  it("still rejects a real conversion page served with the 404 shell", () => {
    const result = audit({ "/en/bespoke/configurator": '<title>Page not found | Woolet</title>' });
    expect([...result.errors]).toEqual(["/en/bespoke/configurator: missing real page title/description"]);
  });
});