// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { buildKnownRouteData, parseAppRoutes, type KnownRouteData } from "@/seo/routeCatalog";
import { getAllRoutes } from "@/seo/metadata";
import { getBlogPosts } from "@/lib/blog-data";
import { SIZES } from "@/data/sizes";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { createMatcher } from "../../workers/route-server/src/routes";
import { createHandler } from "../../workers/route-server/src/handler";

// Minimal HTMLRewriter stand-in: Node has none; status/headers are what we assert.
class FakeRewriter {
  on() { return this; }
  transform(r: Response) { return r; }
}
(globalThis as unknown as { HTMLRewriter: unknown }).HTMLRewriter = FakeRewriter;

const SPA = '<!doctype html><html><head><title>Woolet</title></head><body><div id="root"></div></body></html>';
const origin = (async () =>
  new Response(SPA, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } })) as unknown as typeof fetch;

let data: KnownRouteData;
let handle: (r: Request) => Promise<Response>;
const get = (p: string) => handle(new Request(`https://woolet.co${p}`, { headers: { accept: "text/html" } }));

beforeAll(() => {
  data = buildKnownRouteData();
  handle = createHandler(createMatcher(data), origin);
});

describe("route-server Worker", () => {
  const MUST_200 = [
    "/en", "/en/bespoke", "/en/bespoke/configurator", "/en/bespoke/checkout",
    "/en/bespoke/checkout?paid=1&session_id=cs_test", "/en/bespoke/scan", "/en/bespoke/measurements",
    "/en/bespoke/shipping", "/en/bespoke/photo", "/en/measure", "/en/reserve", "/en/thank-you",
    "/en/thank-you/reserved", "/thank-you", "/thank-you-fb", "/en/lp/kickstarter",
    "/en/lp/kickstarter/vip-confirmed", "/de/lp/kickstarter", "/en/fit", "/en/fit/wizard",
    "/en/products/007", "/en/products/009", "/en/products/bespoke", "/en/our-story",
    "/en/admin/bespoke", "/en/admin/attribution", "/en/account/sign-in", "/en/account/callback",
    "/unsubscribe", "/.lovable/oauth/consent", "/en/ref/009-black", "/ko", "/ja/bespoke",
  ];
  it.each(MUST_200)("200: %s", async (p) => {
    expect((await get(p)).status).toBe(200);
  });

  it("200: every blog post and every /en/size page", async () => {
    const paths = [
      ...SUPPORTED_LANGS.flatMap((l) => getBlogPosts(l as Lang).map((b) => `/${l}/blog/${b.slug}`)),
      ...SIZES.map((s) => `/en/size/${s.slug}`),
    ];
    expect(paths.length).toBeGreaterThan(20);
    for (const p of paths) expect([p, (await get(p)).status]).toEqual([p, 200]);
  });

  it.each(["/en/this-does-not-exist", "/en/blog/nonexistent-slug-xyz", "/en/bespoke/foo", "/xx/random"])(
    "404: %s",
    async (p) => {
      const res = await get(p);
      expect(res.status).toBe(404);
      expect(res.headers.get("cache-control")).toBe("no-store");
    },
  );

  it("never 404s any route of the catalog (App.tsx + prerender catalog)", async () => {
    const bad: string[] = [];
    const paths = new Set(data.exact);
    for (const p of getAllRoutes()) paths.add(p);
    for (const { path, element } of parseAppRoutes()) {
      if (/^<NotFound\b/.test(element) || path.includes("*") || path === "/") continue;
      const rest = path.replace(/^\/:lang(?=\/|$)/, "");
      if (rest.includes(":")) continue;
      for (const c of path.startsWith("/:lang") ? data.locales.map((l) => `/${l}${rest}`) : [path]) paths.add(c);
    }
    // Every slug of every parameterised family.
    for (const f of data.families) {
      if ("prefix" in f) { paths.add(`${f.prefix}anything`); continue; }
      const langs = f.pattern.startsWith("/:lang") ? data.locales : [""];
      for (const l of langs) {
        const slugs = Array.isArray(f.slugs) ? f.slugs : f.slugs[l] ?? [];
        for (const s of slugs) paths.add(f.pattern.replace(":lang", l).replace(/:[a-z]+$/, s));
      }
    }
    paths.delete("/");
    for (const p of paths) {
      const res = await get(p);
      if (res.status === 404) bad.push(p);
    }
    expect(bad).toEqual([]);
    expect(paths.size).toBeGreaterThan(400);
  });

  it("passes through non-GET, assets and service paths untouched", async () => {
    for (const p of ["/en/nope-x", "/assets/x.js", "/api/x", "/~flock.js", "/.well-known/x", "/cdn-cgi/x", "/favicon.png"]) {
      const res = await handle(new Request(`https://woolet.co${p}`, { method: p === "/en/nope-x" ? "POST" : "GET", headers: { accept: "text/html" } }));
      expect([p, res.status]).toEqual([p, 200]);
    }
  });

  it("keeps the redirects: / -> /en, trailing slash, legacy, localized EN-only", async () => {
    const loc = async (p: string) => { const r = await get(p); return [r.status, r.headers.get("location")]; };
    expect(await loc("/")).toEqual([301, "https://woolet.co/en"]);
    expect(await loc("/en/about/")).toEqual([301, "https://woolet.co/en/about"]);
    expect(await loc("/en/compare/warby-parker")).toEqual([301, "https://woolet.co/en/compare/warby-parker-alternative"]);
    expect(await loc("/pl/compare/zenni-alternative")).toEqual([301, "https://woolet.co/en/compare/zenni-alternative"]);
  });
});
