import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * Unlinked, noindex creative sheet for the Woolet Aviator 161 mm stretch goals.
 *
 * Purpose: give the three renders a page whose markup carries their alt text.
 * The images themselves are static files under /creatives/stretch-goals/ (see
 * public/creatives/stretch-goals/) and are reachable at stable public URLs.
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
    src: "/creatives/stretch-goals/woolet-aviator-161-wood-oak.jpg",
    alt: "Woolet Aviator 161 mm in light oak wood finish - wider aviator eyeglass frame for wide faces, Kickstarter stretch goal",
    label: "Light oak",
  },
  {
    src: "/creatives/stretch-goals/woolet-aviator-161-wood-grey.jpg",
    alt: "Woolet Aviator 161 mm in grey wood finish - wider aviator eyeglass frame for wide faces, Kickstarter stretch goal",
    label: "Grey wood",
  },
  {
    src: "/creatives/stretch-goals/woolet-aviator-161-metal.jpg",
    alt: "Woolet Aviator 161 mm in brushed silver metal with adjustable nose pads - wider aviator eyeglass frame for wide faces, Kickstarter stretch goal",
    label: "Brushed silver metal",
  },
];

// Native pixel size of every file (1122 x 1402). Declaring it keeps the layout
// stable while the images load.
const NATURAL = { width: 1122, height: 1402 };

const StretchGoals = () => (
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
      <title>Woolet Aviator 161 mm - stretch goal renders</title>
      <meta
        name="description"
        content="Three renders of the Woolet Aviator 161 mm stretch goal: light oak, grey wood and brushed silver metal with adjustable nose pads."
      />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://woolet.co/en/creatives/stretch-goals" />
      <meta property="og:title" content="Woolet Aviator 161 mm - stretch goal renders" />
      <meta
        property="og:description"
        content="Three renders of the Woolet Aviator 161 mm stretch goal: light oak, grey wood and brushed silver metal."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://woolet.co/en/creatives/stretch-goals" />
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
          Stretch goal renders
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
        Woolet Aviator 161 mm
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
        Three finishes rendered for the Kickstarter stretch goals: light oak,
        grey wood, and brushed silver metal with adjustable nose pads.
      </p>

      <div
        className="sgGrid"
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
        .sgGrid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 40px; }
        @media (min-width: 760px) {
          .sgGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
        }
      `}</style>
    </main>
  </div>
);

export default StretchGoals;
