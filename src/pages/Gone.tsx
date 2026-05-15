import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * 410-equivalent page for legacy Shopify URLs (smart wallet era) that no
 * longer have a counterpart in the eyewear catalog. Lovable static hosting
 * cannot return a real HTTP 410, so we serve a noindex page instead — this
 * tells Googlebot to deindex the URL on next crawl.
 */
const Gone = () => (
  <>
    <Helmet prioritizeSeoTags>
      <title>Page no longer exists — Woolet</title>
      <meta name="robots" content="noindex, follow" />
      <meta name="googlebot" content="noindex, follow" />
    </Helmet>
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
          410 · Gone
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-light mb-4 text-foreground">
          This page is no longer available
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The product or article you're looking for was part of our previous
          catalog and has been permanently retired. Woolet now makes Italian
          acetate eyewear for wide faces.
        </p>
        <Link
          to="/en"
          className="inline-block px-6 py-3 bg-foreground text-background text-sm tracking-wide hover:opacity-90 transition-opacity"
        >
          Visit Woolet Eyewear
        </Link>
      </div>
    </main>
  </>
);

export default Gone;
