import { Helmet } from "react-helmet-async";
import { useEffect, useRef } from "react";

/**
 * Hidden page for third-party directory badges (e.g. Launchpadly) and
 * embedded forms (e.g. Klaviyo). Not linked from nav, noindex.
 */
const Upvote = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = `
      <!-- Launchpadly — Woolet (listed-on) -->
      <a href="https://launchpadly.co/startup/woolet?ref=badge" target="_blank" rel="noopener noreferrer" data-launchpadly-badge="woolet" data-launchpadly-badge-variant="listed-on">
        <img src="https://launchpadly.co/embed/badges/startup/woolet.svg?variant=listed-on" alt="Launchpadly Startup Directory" width="260" height="48" style="display:block;border:0;" />
      </a>
    `;
  }, []);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>Woolet — Listed On</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          background: "hsl(var(--background))",
          padding: "2rem",
        }}
      >
        <div ref={hostRef} />
        <div className="klaviyo-form-XhdvN5" />
      </main>
    </>
  );
};

export default Upvote;
