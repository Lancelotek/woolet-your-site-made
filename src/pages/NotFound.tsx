import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const PAGE_TITLE = "Page not found | Woolet";

/**
 * 404 view. On this component ONLY we render `noindex, nofollow` at runtime
 * so Google (which executes JS during indexing) drops mistyped or stale URLs.
 * Do NOT put this tag into index.html — non-prerendered routes fall back to
 * dist/index.html, and a static noindex there would deindex live pages.
 *
 * We intentionally emit no <link rel="canonical">, no hreflang alternates,
 * and no og:url — a 404 must not claim to be a canonical page or part of a
 * language cluster.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = PAGE_TITLE;
  }, [location.pathname]);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{PAGE_TITLE}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta name="twitter:title" content={PAGE_TITLE} />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-4xl font-bold">Page not found</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            The page you were looking for doesn&rsquo;t exist or has moved.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/en"
              className="rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Return to Home
            </a>
            <a
              href="/en/collection"
              className="rounded border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:border-primary"
            >
              Browse the collection
            </a>
            <a
              href="/en/fit"
              className="rounded border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:border-primary"
            >
              Find your fit
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
