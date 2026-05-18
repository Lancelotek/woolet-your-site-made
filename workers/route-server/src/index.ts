/**
 * Woolet route-server Worker.
 *
 * Sits in front of the Lovable origin (woolet.co + www.woolet.co):
 *  - Serves embedded prerendered per-route HTML (PRERENDERED map) so bots
 *    and curl see real <title>, <meta>, JSON-LD without executing JS.
 *  - 301s www -> root (Lovable origin only does 302).
 *  - Strips Lovable preview og:image / twitter:image runtime injections
 *    from any HTML still served by the origin.
 *  - Passes through everything else (assets, /api/, /llms.txt, /robots.txt,
 *    /sitemap.xml, and unknown routes that hit the SPA fallback).
 */
import { PRERENDERED } from "./prerendered";

const SECURITY_HEADERS: Record<string, string> = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. www -> root, 301 permanent.
    if (url.hostname === "www.woolet.co") {
      url.hostname = "woolet.co";
      return Response.redirect(url.toString(), 301);
    }

    // 2. Normalize trailing slash (except root).
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // 3. Match a prerendered route — only for GET / HEAD navigations.
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

    // 4. Passthrough to Lovable origin.
    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get("content-type") || "";

    // Non-HTML: pass through unchanged (assets, JSON, fonts, etc).
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

    return new HTMLRewriter()
      .on('meta[property="og:image"]', stripPreviewImage)
      .on('meta[name="twitter:image"]', stripPreviewImage)
      .transform(originResponse);
  },
} satisfies ExportedHandler;
