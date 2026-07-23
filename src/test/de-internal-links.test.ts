/**
 * Automated check: every internal link on DE pages resolves to a real route,
 * returns a real page (no NotFound / Gone), and does not redirect in a loop.
 *
 * Static analysis — no browser needed. Parses src/App.tsx for `<Route>`
 * entries, then walks each collected DE link through the router (following
 * `<Navigate>` and known redirect components) up to 5 hops.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { matchPath } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { dePages, dePageOrder } from "@/content/de/landingPages";
import { blogPostsDE } from "@/lib/blog-data-de";

// ---------- Route table extraction ----------

type Route = {
  path: string;
  // "page" = terminal component; "redirect" = navigate to `target`;
  // "notfound" or "gone" = failure terminal.
  kind: "page" | "redirect" | "notfound" | "gone" | "de-landing" | "blog-post";
  target?: string;
  raw: string;
};

const ROOT = path.resolve(__dirname, "../..");
const appTsx = readFileSync(path.join(ROOT, "src/App.tsx"), "utf8");

/**
 * Extract every `<Route path="..." element={<X ...>} />` line.
 * All Route entries in this project are single-line, so a line-scoped regex
 * is safe.
 */
function extractRoutes(): Route[] {
  const routes: Route[] = [];
  const routeRe = /<Route\s+path="([^"]+)"\s+element=\{([^}]+)\}\s*\/>/g;

  for (const line of appTsx.split("\n")) {
    let m: RegExpExecArray | null;
    routeRe.lastIndex = 0;
    while ((m = routeRe.exec(line))) {
      const [, p, el] = m;
      routes.push({ path: p, ...classify(el), raw: line.trim() });
    }
  }
  return routes;
}

function classify(el: string): Pick<Route, "kind" | "target"> {
  // Direct Navigate: <Navigate to="/foo" replace />
  const nav = el.match(/<Navigate\s+to="([^"]+)"/);
  if (nav) return { kind: "redirect", target: nav[1] };

  // Dynamic redirect components — target is a template using ${slug} / ${lang}.
  // We resolve at match time when params are available.
  if (/<RedirectCollectionToEn/.test(el)) return { kind: "redirect", target: "/en/collections/:slug" };
  if (/<RedirectProductToEn/.test(el)) return { kind: "redirect", target: "/en/products/:slug" };
  if (/<RedirectLpToEn/.test(el)) return { kind: "redirect", target: "/en/lp/:slug" };
  if (/<RedirectSizeToEn/.test(el)) return { kind: "redirect", target: "/en/size/:slug" };
  if (/<RedirectBridgeToEn/.test(el)) return { kind: "redirect", target: "/en/bridge/:slug" };
  if (/<RedirectTempleToEn/.test(el)) return { kind: "redirect", target: "/en/temple/:slug" };
  if (/<RedirectToEn\s+to="([^"]+)"/.test(el)) {
    const t = el.match(/<RedirectToEn\s+to="([^"]+)"/)![1];
    return { kind: "redirect", target: `/en${t}` };
  }
  if (/<FitScanRedirect/.test(el)) return { kind: "redirect", target: "/:lang/fit" };
  if (/<RootRedirect/.test(el)) return { kind: "redirect", target: "/en" };

  if (/<NotFound/.test(el)) return { kind: "notfound" };
  if (/<Gone/.test(el)) return { kind: "gone" };
  if (/<DeLandingRoute/.test(el)) return { kind: "de-landing" };
  if (/<BlogPost/.test(el)) return { kind: "blog-post" };
  return { kind: "page" };
}

const ROUTES = extractRoutes();

// ---------- Resolver ----------

function fillTarget(target: string, params: Record<string, string>): string {
  return target.replace(/:([a-zA-Z_]+)/g, (_, name) => params[name] ?? `:${name}`);
}

/**
 * Follow redirects for `url` and return the final resolution status.
 */
function resolve(url: string, hops: string[] = []): {
  ok: boolean;
  reason?: string;
  chain: string[];
} {
  const chain = [...hops, url];

  if (hops.includes(url)) {
    return { ok: false, reason: "redirect loop", chain };
  }
  if (chain.length > 6) {
    return { ok: false, reason: "too many redirects", chain };
  }

  for (const route of ROUTES) {
    const match = matchPath({ path: route.path, end: true }, url);
    if (!match) continue;

    const params = (match.params ?? {}) as Record<string, string>;

    switch (route.kind) {
      case "page":
        return { ok: true, chain };

      case "notfound":
        return { ok: false, reason: `route "${route.path}" renders NotFound`, chain };

      case "gone":
        return { ok: false, reason: `route "${route.path}" renders Gone (410)`, chain };

      case "redirect": {
        const next = fillTarget(route.target!, params);
        return resolve(next, chain);
      }

      case "de-landing": {
        const slug = params.slug;
        if (slug && dePages[slug]) return { ok: true, chain };
        return { ok: false, reason: `DE landing slug "${slug}" not in dePages`, chain };
      }

      case "blog-post": {
        // BlogPost renders NotFound if the slug does not exist in the locale.
        // For DE we validate against blogPostsDE; for EN we defer (any /en/blog/*
        // slug we generate here is out of scope).
        const slug = params.slug;
        const lang = params.lang;
        if (lang === "de") {
          const known = blogPostsDE.some((p) => p.slug === slug);
          if (known) return { ok: true, chain };
          return { ok: false, reason: `DE blog slug "${slug}" not in blogPostsDE`, chain };
        }
        return { ok: true, chain };
      }
    }
  }

  return { ok: false, reason: "no matching route (would render NotFound)", chain };
}

// ---------- Link collection ----------

/**
 * Every internal link exposed from DE pages. Grouped by source so a failure
 * points straight at the file to fix.
 */
function collectDeLinks(): { source: string; url: string }[] {
  const links: { source: string; url: string }[] = [];
  const push = (source: string, url: string) => links.push({ source, url });

  // DeHub — logo + CTA + one card per dePageOrder slug.
  push("DeHub logo", "/de");
  push("DeHub CTA", "/de/fit");
  for (const slug of dePageOrder) push(`DeHub card [${slug}]`, `/de/${slug}`);

  // DeLandingPage — hard-coded links.
  push("DeLandingPage header logo", "/de");
  push("DeLandingPage footer home", "/de");
  push("DeLandingPage privacy", "/de/privacy-policy");
  push("DeLandingPage scan CTA", "/de/fit");

  // Footer rendered with lang="de" (used on DeHub / DE landings).
  const footerDe: string[] = [
    "/de/collection",
    "/de/fit",
    "/de/bespoke",
    "/en/lp/kickstarter",
    "/de/process",
    "/de/the-box",
    "/de/lp/why-glasses-fail",
    "/de/lp/5-reasons",
    "/de/lp/wide-bridge-fit-guide",
    "/en/blog/glasses-for-wide-faces-guide",
    "/en/blog/how-to-measure-face-width-for-glasses",
    "/en/blog/best-sunglasses-for-wide-faces",
    "/en/collections/wide-face-glasses",
    "/en/collections/glasses-for-big-heads",
    "/de/compare",
    "/de/compare/fatheadz-alternative",
    "/de/compare/eyeshells-alternative",
    "/de/compare/zenni-alternative",
    "/de/compare/warby-parker-alternative",
    "/de/compare/ray-ban-alternative",
    "/de/compare/persol-alternative",
    "/de/blog",
    "/de/privacy-policy",
    "/de/return-policy",
  ];
  for (const url of footerDe) push(`Footer(lang=de) ${url}`, url);

  // Embedded <a href="/..."> inside DE blog posts.
  const hrefRe = /href="(\/[^"#?]+)(?:[#?][^"]*)?"/g;
  for (const post of blogPostsDE) {
    let m: RegExpExecArray | null;
    hrefRe.lastIndex = 0;
    while ((m = hrefRe.exec(post.content))) {
      const url = m[1];
      // Skip asset paths (images, files).
      if (/\.(png|jpe?g|webp|svg|gif|pdf|zip|xml|txt)$/i.test(url)) continue;
      if (url.startsWith("/images/") || url.startsWith("/brand/") || url.startsWith("/ads/")) continue;
      push(`blog[${post.slug}]`, url);
    }
  }

  return links;
}

// ---------- Tests ----------

describe("DE internal links", () => {
  const links = collectDeLinks();

  it("route table parsed successfully", () => {
    expect(ROUTES.length).toBeGreaterThan(50);
  });

  it.each(links)("$source → $url resolves", ({ url }) => {
    const result = resolve(url);
    if (!result.ok) {
      throw new Error(`Broken link ${url}: ${result.reason}\n  chain: ${result.chain.join(" → ")}`);
    }
    // Guard against silent >2-hop redirect chains that hurt SEO.
    expect(result.chain.length).toBeLessThanOrEqual(3);
  });
});
