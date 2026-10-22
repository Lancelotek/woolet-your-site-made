import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * Unlinked, noindex creative sheet for the "Too small for your face" cold ads
 * (Meta, Cold US, from 22.10.2026).
 *
 * Purpose: give the ad images a page whose markup carries their alt text.
 * The images themselves are static files under /ads/2026-10-too-small/ (see
 * public/ads/2026-10-too-small/ and its manifest.json) and are reachable at
 * stable public URLs that are used directly in Meta Ads.
 * This page is deliberately NOT linked from the navigation, the footer or any
 * other page, and it is excluded from sitemap.xml (metadata.ts sets noindex).
 */

const INK = "#080807";
const PANEL = "#16140F";
const CREAM = "#EFE9DF";
const MUTED = "#9A8E7E";
const GOLD = "#C2A05A";
const HAIR = "rgba(239,233,223,0.12)";

const DISPLAY = "'Cormorant Garamond', Georgia, serif";
const UI = "'Barlow', system-ui, sans-serif";

type Shot = {
  src: string;
  alt: string;
  label: string;
};

const SHOTS: Shot[] = [
  {
    src: "/ads/2026-10-too-small/woolet-too-small-m8-frame-edge-009-4x5.jpg",
    alt: "Close-up of a man with a wide face wearing Woolet 009 Soft Square black acetate glasses, headline: Your frame stops. Your face doesn't. Labels show where a standard frame ends and where the 158 mm Woolet front reaches the edge of the face.",
    label: "M8 · Frame edge · 009",
  },
  {
    src: "/ads/2026-10-too-small/woolet-too-small-m9-never-your-face-007-4x5.jpg",
    alt: "Man in his fifties with a wide face wearing Woolet 007 Round black acetate glasses at home, headline: It was never your face. Your glasses were too small. 158 mm front, built for wide faces.",
    label: "M9 · Never your face · 007",
  },
];

// Native pixel size of every file (1080 x 1350). Declaring it keeps the layout
// stable while the images load.
const NATURAL = { width: 1080, height: 1350 };

const TooSmallCreatives = () => (
  <div
    style={{
      background: INK,
      color: CREAM,
      minHeight: "100vh",
      fontFamily: UI,
    }}
  >
    <Helmet>
      <html lang="en" />
      <title>Woolet - too small for your face ads</title>
      <meta
        name="description"
        content="Meta ad images for Woolet: standard frames are too small for wide faces, the 158 mm front reaches the temples."
      />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://woolet.co/en/creatives/too-small" />
      <meta property="og:title" content="Woolet - too small for your face ads" />
      <meta
        property="og:description"
        content="Meta ad images for Woolet: standard frames are too small for wide faces."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://woolet.co/en/creatives/too-small" />
    </Helmet>

    <header
      style={{
        borderBottom: `1px solid ${HAIR}`,
        background: PANEL,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1080,
          padding: "18px 24px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/en"
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            letterSpacing: "0.02em",
            color: CREAM,
            textDecoration: "none",
          }}
        >
          Woolet
        </Link>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Too small ads
        </span>
      </div>
    </header>

    <main
      className="mx-auto"
      style={{ maxWidth: 1080, padding: "56px 24px 96px" }}
    >
      <h1
        style={{
          fontFamily: DISPLAY,
          fontWeight: 400,
          fontSize: "clamp(30px, 4.4vw, 46px)",
          lineHeight: 1.1,
          margin: 0,
          color: CREAM,
        }}
      >
        Too small for your face
      </h1>
      <p
        style={{
          marginTop: 16,
          maxWidth: 620,
          fontSize: 15,
          lineHeight: 1.65,
          color: MUTED,
        }}
      >
        Ad images for wide faces: standard frames end before the face does, the
        158 mm Woolet front reaches the temples.
      </p>

      <div
        className="tsGrid"
        style={{
          marginTop: 48,
        }}
      >
        {SHOTS.map((shot, i) => (
          <figure key={shot.src} style={{ margin: 0 }}>
            <img
              src={shot.src}
              alt={shot.alt}
              width={NATURAL.width}
              height={NATURAL.height}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                background: PANEL,
                border: `1px solid ${HAIR}`,
              }}
            />
            <figcaption
              style={{
                marginTop: 14,
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              {shot.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <style>{`
        .tsGrid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 40px; }
        @media (min-width: 760px) {
          .tsGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
        }
      `}</style>
    </main>
  </div>
);

export default TooSmallCreatives;
