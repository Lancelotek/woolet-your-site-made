import { useLocation, useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { isValidLang, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/i18n/routeRegistry";

/**
 * 404 view.
 *
 * SEO contract (do not weaken):
 *   • <meta name="robots" content="noindex, nofollow"> — via Helmet
 *     with prioritizeSeoTags, so it wins over any stale prerendered
 *     tag that leaked through when the shell fell back to
 *     dist/index.html.
 *   • No <link rel="canonical"> — a 404 must not claim to be a
 *     canonical page.
 *   • No <meta property="og:url"> — same rationale.
 *   • No hreflang alternates — a 404 is not part of a translation
 *     cluster.
 *   • As a defensive measure we strip any of the above that a parent
 *     component (or the prerendered head) already emitted; see
 *     `stripSeoRelatedTags` below.
 *
 * The component is also rendered INLINE from BlogPost, ComparePage,
 * Collection, Index, SizePage, BridgePage, TemplePage, XxlPage and
 * every locale landing route whenever a param doesn't resolve — so
 * the URL bar stays on the mistyped path (crucial for the Cloudflare
 * Worker's 404 decision on the next hit) instead of soft-redirecting
 * to a hub.
 */

const PAGE_TITLE = "Page not found | Woolet";

function stripSeoRelatedTags() {
  if (typeof document === "undefined") return;
  const selectors = [
    'link[rel="canonical"]',
    'link[rel="alternate"][hreflang]',
    'meta[property="og:url"]',
  ];
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => el.parentNode?.removeChild(el));
  }
}

const NotFound = () => {
  const location = useLocation();
  const { lang: rawLang } = useParams<{ lang?: string }>();

  // Preserve the current locale when possible so the recovery links
  // send the user back into their own language instead of dumping
  // them on /en. Falls back to /en for unrecognised locales.
  const lang: Lang = useMemo(
    () => (rawLang && isValidLang(rawLang) ? (rawLang as Lang) : "en"),
    [rawLang],
  );

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("404: unresolved route", location.pathname);
    document.title = PAGE_TITLE;
    stripSeoRelatedTags();
  }, [location.pathname]);

  const homeHref = hrefFor("home", lang) ?? "/en";
  const collectionHref = hrefFor("collection", lang) ?? "/en/collection";
  const blogHref = hrefFor("blog", lang);
  const fitHref = hrefFor("fit", lang) ?? "/en/fit";

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{PAGE_TITLE}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta name="twitter:title" content={PAGE_TITLE} />
        {/* Deliberately absent: canonical, og:url, hreflang alternates. */}
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-muted px-6">
        <div className="max-w-md text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
            404
          </p>
          <h1 className="mb-3 text-4xl font-bold">Page not found</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            The page you were looking for doesn&rsquo;t exist or has moved.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap">
            <a
              href={homeHref}
              className="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Return to home
            </a>
            <a
              href={collectionHref}
              className="rounded border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:border-primary"
            >
              Browse the collection
            </a>
            {blogHref ? (
              <a
                href={blogHref}
                className="rounded border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:border-primary"
              >
                Read the blog
              </a>
            ) : null}
            <a
              href={fitHref}
              className="rounded border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:border-primary"
            >
              Find your fit
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
