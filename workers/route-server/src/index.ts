/**
 * Woolet route-server Worker.
 *
 * Sits in front of the Lovable origin (woolet.co + www.woolet.co):
 *  - Serves embedded prerendered per-route HTML (PRERENDERED map) so bots
 *    and curl see real <title>, <meta>, JSON-LD without executing JS.
 *  - 301s www -> root (Lovable origin only does 302).
 *  - 301s trailing slash -> canonical path (previously normalized in memory
 *    only, so /en/about and /en/about/ both returned 200 with identical HTML).
 *  - 301s / -> /en.
 *  - Returns a real HTTP 404 for unknown document routes. The Lovable origin
 *    is an SPA and answers 200 to every URL, which made every mistyped or
 *    stale URL an indexable soft 404.
 *  - Strips Lovable preview og:image / twitter:image runtime injections
 *    from any HTML still served by the origin.
 *  - Passes through everything else (assets, /api/, /llms.txt, /robots.txt,
 *    /sitemap.xml).
 */
import { PRERENDERED } from "./prerendered";
import { ROUTE_MANIFEST } from "./route-manifest";
import LEGACY_REDIRECTS from "./legacy-redirects.json";

/**
 * Blog URLs that render 200 today. Built from the shared route manifest so
 * the Worker's known-blog set can never drift from the sitemap / prerender.
 * Any blog slug not in this set now returns a real HTTP 404 at the edge —
 * an omission in route-manifest.json takes a live article offline.
 */
const BLOG_ROUTES: ReadonlySet<string> = new Set(
  Object.entries(ROUTE_MANIFEST.blogSlugs).flatMap(([locale, slugs]) =>
    (slugs as readonly string[]).map((s) => `/${locale}/blog/${s}`),
  ),
);

const SECURITY_HEADERS: Record<string, string> = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/**
 * Routes that exist in the SPA but are NOT in the PRERENDERED map.
 * They must be listed here or the Worker would 404 a live page.
 * As scripts/prerender.mjs grows to cover them, entries can be removed.
 */
const EXTRA_ROUTES: ReadonlySet<string> = new Set([
  // localized homepages without prerender
  "/ar",
  "/fr",
  "/nl",
  // collections / tools
  "/en/collection",
  "/fr/collection",
  "/nl/collection",
  "/en/hat-size-calculator",
  "/en/collections/extra-large-oversized-eyeglasses",
  "/en/collections/oversized-black-glasses",
  // localized product pages
  "/fr/products/007",
  "/fr/products/009",
  "/fr/products/bespoke",
  "/nl/products/007",
  "/nl/products/009",
  "/nl/products/bespoke",
  // localized blogs
  "/de/blog",
  "/de/blog/beste-brillen-fuer-grosse-koepfe-2026",
  "/de/blog/welche-groesse-sonnenbrille-breites-gesicht",
  "/fr/blog/meilleures-lunettes-pour-grosses-tetes-2026",
  "/fr/blog/quelle-taille-de-lunettes-de-soleil-visage-large",
  "/nl/blog/beste-brillen-voor-brede-hoofden-2026",
  "/nl/blog/welke-maat-zonnebril-voor-breed-gezicht",
  "/en/blog/category/nose-bridge-fit",
  // landers + localized SEO pages
  "/en/lp/kickstarter",
  "/en/lp/wide-bridge-fit-guide",
  "/nl/acetaat-bril-op-maat",
  "/nl/grote-brillen-heren",
  "/pl/jak-dobrac-okulary-do-twarzy",
  // private / utility routes — noindex, but they MUST resolve
  "/en/bespoke/configurator",
  "/en/fit",
  "/en/fit/manual",
  "/en/fit/bespoke",
  "/en/thank-you",
  "/en/upvote",
  "/en/crm",
]);

/** Dynamic route families. Deliberately narrow — no catch-all. */
const DYNAMIC_ROUTES: readonly RegExp[] = [
  /^\/en\/(size|bridge|temple)\/\d{2,3}mm$/,
  /^\/en\/xxl(\/[a-z0-9-]+)?$/,
  /^\/en\/compare(\/[a-z0-9-]+-alternative)?$/,
  /^\/en\/collections\/[a-z0-9-]+$/,
  /^\/(en|pl|de|fr|nl|ja|es|ar)\/blog\/[a-z0-9-]+$/,
  /^\/en\/account(\/.*)?$/,
];

/** Prefixes that are never treated as app routes. */
const PASSTHROUGH_PREFIXES: readonly string[] = [
  "/assets/",
  "/fonts/",
  "/images/",
  "/~",
  "/api/",
  "/cdn-cgi/",
  "/.well-known/",
];

/** True when this request is a page navigation rather than an asset fetch. */
function isDocumentRequest(request: Request, pathname: string): boolean {
  // Any file: a dot in the last segment (.js, .png, .xml, .webmanifest…).
  // App routes never contain a dot, so this is safer than an extension regex.
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (lastSegment.includes(".")) return false;
  if (PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  const accept = request.headers.get("accept") || "";
  // AI crawlers frequently omit Accept — treat a missing header as a document
  return accept === "" || accept.includes("text/html") || accept.includes("*/*");
}

function isKnownRoute(pathname: string): boolean {
  if (Object.prototype.hasOwnProperty.call(PRERENDERED, pathname)) return true;
  if (EXTRA_ROUTES.has(pathname)) return true;
  return DYNAMIC_ROUTES.some((re) => re.test(pathname));
}

/** Injects noindex into the SPA shell when it is served as a 404. */
const injectNoindex = {
  element(el: Element) {
    el.append('<meta name="robots" content="noindex, nofollow">', {
      html: true,
    });
  },
};

const dropTag = {
  element(el: Element) {
    el.remove();
  },
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. www -> root, 301 permanent.
    if (url.hostname === "www.woolet.co") {
      url.hostname = "woolet.co";
      return Response.redirect(url.toString(), 301);
    }

    // 2. Trailing slash -> 301 to the canonical path (except root).
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
      return Response.redirect(url.toString(), 301);
    }

    const pathname = url.pathname;

    // 3. Root -> default locale.
    if (pathname === "/" || pathname === "") {
      return Response.redirect("https://woolet.co/en", 301);
    }

    // 4. Match a prerendered route — only for GET / HEAD navigations.
    const method = request.method.toUpperCase();
    if (method === "GET" || method === "HEAD") {
      const html = PRERENDERED[pathname];
      if (html) {
        return new Response(method === "HEAD" ? null : html, {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=300",
            "x-route-source": "prerendered",
            ...SECURITY_HEADERS,
          },
        });
      }
    }

    // 5. Passthrough to Lovable origin.
    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get("content-type") || "";

    // Non-HTML: pass through unchanged (assets, JSON, fonts, sitemap, llms.txt).
    if (!contentType.includes("text/html")) {
      return originResponse;
    }

    // HTML from SPA fallback: strip Lovable preview og:image injections.
    const stripPreviewImage = {
      element(el: Element) {
        const content = el.getAttribute("content") || "";
        if (content.includes("lovable.app") || content.includes("id-preview-")) {
          el.remove();
        }
      },
    };

    let rewriter = new HTMLRewriter()
      .on('meta[property="og:image"]', stripPreviewImage)
      .on('meta[name="twitter:image"]', stripPreviewImage);

    // 6. Unknown document route -> real 404 instead of the SPA's soft 200.
    const isUnknown =
      isDocumentRequest(request, pathname) && !isKnownRoute(pathname);

    if (isUnknown) {
      rewriter = rewriter
        .on("head", injectNoindex)
        .on('link[rel="canonical"]', dropTag)
        .on('meta[property="og:url"]', dropTag)
        .on('link[rel="alternate"][hreflang]', dropTag);

      const transformed = rewriter.transform(originResponse);
      return new Response(transformed.body, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-route-source": "not-found",
          ...SECURITY_HEADERS,
        },
      });
    }

    return rewriter.transform(originResponse);
  },
} satisfies ExportedHandler;
