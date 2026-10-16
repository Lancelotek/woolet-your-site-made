/**
 * Woolet route-server Worker.
 *
 * Its only job: turn the Lovable origin's soft-404 (HTTP 200 for every URL)
 * into a real HTTP 404 for unknown document paths. Every request is passed
 * through to the origin — the origin prerenders every route itself, so the
 * Worker never serves embedded HTML (asset hashes could differ).
 *
 *  - 301 www -> apex, trailing slash -> canonical, / -> /en,
 *    legacy renamed URLs, localized URLs of English-only families.
 *  - Non-GET/HEAD methods, assets, files, /api/, /~, /.well-known/,
 *    /cdn-cgi/, /functions/, /auth/ are passed through untouched.
 *  - Unknown document path: origin body with status 404, noindex added,
 *    canonical / og:url / hreflang dropped.
 *
 * Known routes are generated at build time (build-bundle.mjs) from
 * src/seo/routeCatalog.ts — the same catalog as prerender and audit-routes.
 */
import LEGACY_REDIRECTS from "./legacy-redirects.json";

// Minimal Cloudflare HTMLRewriter types: the app tsconfig typechecks this file
// with DOM libs, not @cloudflare/workers-types.
interface RewriterElement {
  append(content: string, options?: { html?: boolean }): RewriterElement;
  remove(): RewriterElement;
  getAttribute(name: string): string | null;
}
interface RewriterHandler { element(el: RewriterElement): void }
interface HTMLRewriterLike {
  on(selector: string, handler: RewriterHandler): HTMLRewriterLike;
  transform(response: Response): Response;
}
declare const HTMLRewriter: { new (): HTMLRewriterLike };
type Element = RewriterElement;


const SECURITY_HEADERS: Record<string, string> = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/** Prefixes that are never treated as app routes. */
const PASSTHROUGH_PREFIXES: readonly string[] = [
  "/assets/",
  "/fonts/",
  "/images/",
  "/~",
  "/api/",
  "/cdn-cgi/",
  "/.well-known/",
  "/functions/",
  "/auth/",
  "/rest/",
  "/storage/",
  "/stripe",
  "/webhook",
];

/** True when this request is a page navigation rather than an asset fetch. */
export function isDocumentRequest(request: Request, pathname: string): boolean {
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (lastSegment.includes(".")) return false;
  if (PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  const accept = request.headers.get("accept") || "";
  // AI crawlers frequently omit Accept — treat a missing header as a document
  return accept === "" || accept.includes("text/html") || accept.includes("*/*");
}

const injectNoindex = {
  element(el: Element) {
    el.append('<meta name="robots" content="noindex, nofollow">', { html: true });
  },
};
const dropTag = { element(el: Element) { el.remove(); } };
const stripPreviewImage = {
  element(el: Element) {
    const content = el.getAttribute("content") || "";
    if (content.includes("lovable.app") || content.includes("id-preview-")) el.remove();
  },
};

export function createHandler(isKnownRoute: (pathname: string) => boolean, originFetch: typeof fetch = (r) => fetch(r)) {
  return async function handle(request: Request): Promise<Response> {
    const method = request.method.toUpperCase();
    // Never touch non-GET/HEAD (form posts, webhooks, callbacks).
    if (method !== "GET" && method !== "HEAD") return originFetch(request);

    const url = new URL(request.url);
    const pathname = url.pathname;
    if (PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))) return originFetch(request);

    if (url.hostname === "www.woolet.co") {
      url.hostname = "woolet.co";
      return Response.redirect(url.toString(), 301);
    }
    if (pathname.length > 1 && pathname.endsWith("/")) {
      url.pathname = pathname.replace(/\/+$/, "") || "/";
      return Response.redirect(url.toString(), 301);
    }
    const legacy = (LEGACY_REDIRECTS as Record<string, string>)[pathname];
    if (legacy) return Response.redirect(`https://${url.host}${legacy}${url.search}`, 301);

    const localizedEnOnly = pathname.match(
      /^\/(?:pl|de|fr|nl|ja|es|ar)(\/(?:compare|lp|xxl|collections)(?:\/[a-z0-9-]+)*|\/(?:size|bridge|temple)\/\d{2,3}mm)$/,
    );
    // /de/lp/kickstarter is a real German page, not a localized EN-only copy.
    if (localizedEnOnly && !isKnownExactLocalized(pathname, isKnownRoute)) {
      return Response.redirect(`https://${url.host}/en${localizedEnOnly[1]}${url.search}`, 301);
    }
    if (pathname === "/" || pathname === "") {
      return Response.redirect(`https://${url.host}/en${url.search}`, 301);
    }

    const originResponse = await originFetch(request);
    const contentType = originResponse.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return originResponse;

    let rewriter = new HTMLRewriter()
      .on('meta[property="og:image"]', stripPreviewImage)
      .on('meta[name="twitter:image"]', stripPreviewImage);

    const isUnknown = isDocumentRequest(request, pathname) && !isKnownRoute(pathname);
    // Only rewrite a successful SPA answer; origin errors/redirects pass through.
    if (isUnknown && originResponse.status === 200) {
      rewriter = rewriter
        .on("head", injectNoindex)
        .on('link[rel="canonical"]', dropTag)
        .on('meta[property="og:url"]', dropTag)
        .on('link[rel="alternate"][hreflang]', dropTag);
      const transformed = rewriter.transform(originResponse);
      return new Response(method === "HEAD" ? null : transformed.body, {
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
  };
}

/** Localized paths that App.tsx serves as real pages (e.g. /de/lp/kickstarter). */
function isKnownExactLocalized(pathname: string, isKnownRoute: (p: string) => boolean): boolean {
  return /^\/de\/lp\/kickstarter$/.test(pathname) && isKnownRoute(pathname);
}
