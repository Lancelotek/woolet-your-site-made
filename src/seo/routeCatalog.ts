/**
 * Known-route catalog for the edge Worker (workers/route-server).
 *
 * Single source of truth: every <Route path> in src/App.tsx, expanded with
 * the same data the prerender / sitemap / app-page metadata use
 * (getAllRoutes, blog posts per locale, redirect maps, slug data files).
 * The Worker answers a real 404 only for document paths this catalog does
 * not know, so an omission here would take a live page offline — the build
 * throws on any App.tsx route without a resolver.
 */
import appSource from "../App.tsx?raw";
import { getAllRoutes } from "./metadata";
import { ALL_REDIRECTS } from "./legacyRedirects";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/blog-data";
import { BLOG_SLUG_GROUPS } from "@/lib/blog-slug-map";
import { competitors } from "@/data/competitors";
import { SIZES } from "@/data/sizes";
import { BRIDGES } from "@/data/bridges";
import { TEMPLES } from "@/data/temples";
import { XXL_PAGES } from "@/data/xxl";
import { REF_PRODUCTS } from "@/data/reference-products";
import { dePages } from "@/content/de/landingPages";
import { koPages } from "@/content/ko/landingPages";

export type RouteFamily =
  /** Segment pattern, e.g. "/:lang/blog/:slug". `slugs` keyed by lang when per-locale. */
  | { pattern: string; slugs: string[] | Record<string, string[]> }
  /** App.tsx wildcard route ("/blogs/*"): the origin owns everything under the prefix. */
  | { prefix: string };

export interface KnownRouteData {
  locales: string[];
  exact: string[];
  families: RouteFamily[];
}

export interface AppRoute { path: string; element: string }

/** Every <Route path element> from App.tsx source. */
export function parseAppRoutes(src: string = appSource): AppRoute[] {
  return [...src.matchAll(/<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g)].map((m) => ({
    path: m[1],
    element: m[2].trim(),
  }));
}

const isNotFound = (r: AppRoute) => /^<NotFound\b/.test(r.element);
const uniq = (a: string[]) => [...new Set(a)].sort();
const tail = (prefix: string, routes: Iterable<string>) =>
  [...routes].filter((r) => r.startsWith(prefix) && !r.slice(prefix.length).includes("/") && r.length > prefix.length)
    .map((r) => r.slice(prefix.length));

export function buildKnownRouteData(src: string = appSource): KnownRouteData {
  const locales = [...SUPPORTED_LANGS] as string[];
  const routes = parseAppRoutes(src);
  const catalog = new Set<string>([...getAllRoutes(), ...Object.keys(ALL_REDIRECTS)]);

  // Concrete App.tsx paths (incl. Navigate/redirect-only ones: the origin handles them).
  for (const r of routes) {
    if (isNotFound(r) || r.path === "*" || r.path.includes("*")) continue;
    const rest = r.path.replace(/^\/:lang(?=\/|$)/, "");
    if (rest.includes(":")) continue;
    if (r.path.startsWith("/:lang")) for (const l of locales) catalog.add(`/${l}${rest}`);
    else catalog.add(r.path);
  }
  // Root "/" is redirected by the Worker itself, never served.
  catalog.delete("/");

  // Real slug lists for parameterised families.
  const blog: Record<string, string[]> = {};
  for (const l of locales) {
    const fromPosts = getBlogPosts(l as Lang).map((p) => p.slug);
    const fromCatalog = tail(`/${l}/blog/`, catalog).filter((s) => s !== "category");
    // BlogPost redirects legacy EN slugs on a translated locale to the local slug.
    const legacyEn = BLOG_SLUG_GROUPS.filter((g) => g[l as Lang] && g.en && l !== "en").map((g) => g.en!);
    blog[l] = uniq([...fromPosts, ...fromCatalog, ...legacyEn]);
  }
  const en = (seg: string, data: string[] = []) => uniq([...tail(`/en/${seg}/`, catalog), ...data]);
  const size = en("size", SIZES.map((s) => s.slug));
  const bridge = en("bridge", BRIDGES.map((b) => b.slug));
  const temple = en("temple", TEMPLES.map((t) => t.slug));
  const xxl = en("xxl", XXL_PAGES.map((x) => x.slug).filter(Boolean));
  const compare = en("compare", competitors.flatMap((c) => [c.slug, ...(c.aliases ?? [])]));
  const ref = en("ref", REF_PRODUCTS.map((p) => p.slug));
  const lp = en("lp");
  const products = en("products");
  const collections = en("collections");

  const RESOLVERS: Record<string, string[] | Record<string, string[]>> = {
    "/:lang/blog/:slug": blog,
    "/en/size/:slug": size, "/:lang/size/:slug": size,
    "/en/bridge/:slug": bridge, "/:lang/bridge/:slug": bridge,
    "/en/temple/:slug": temple, "/:lang/temple/:slug": temple,
    "/en/xxl/:slug": xxl,
    "/en/compare/:slug": compare, "/:lang/compare/:slug": compare,
    "/en/ref/:slug": ref, "/:lang/ref/:slug": ref,
    "/:lang/lp/:slug": lp,
    "/:lang/products/:slug": products,
    "/:lang/collections/:slug": collections,
    "/de/:slug": uniq(Object.keys(dePages)),
    "/ko/size/:width": uniq(tail("/ko/size/", Object.keys(koPages))),
  };

  const families: RouteFamily[] = [];
  const missing: string[] = [];
  for (const r of routes) {
    if (isNotFound(r) || r.path === "*") continue;
    if (r.path.includes("*")) { families.push({ prefix: r.path.replace(/\*$/, "") }); continue; }
    if (!r.path.replace(/^\/:lang(?=\/|$)/, "").includes(":")) continue;
    const slugs = RESOLVERS[r.path];
    if (!slugs) { missing.push(r.path); continue; }
    families.push({ pattern: r.path, slugs });
  }
  if (missing.length) {
    throw new Error(`[route-catalog] App.tsx routes without a known-slug resolver (Worker would 404 them): ${missing.join(", ")}`);
  }
  return { locales, exact: uniq([...catalog]), families };
}
