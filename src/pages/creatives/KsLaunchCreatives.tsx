import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * Unlinked, noindex creative sheet for the Kickstarter launch countdown ads
 * (Meta remarketing, 22-31.10.2026).
 *
 * Purpose: give the six ad images a page whose markup carries their alt text.
 * The images themselves are static files under /ads/2026-10-ks-launch/ (see
 * public/ads/2026-10-ks-launch/ and its manifest.json) and are reachable at
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
  width?: number;
  height?: number;
};

const SHOTS: Shot[] = [
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-01-launching-oct29-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, headline: Glasses that finally fit. Live October 29 on Kickstarter. 158 mm front for 153-163 mm faces.",
    label: "Coming Oct 29",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-02-3-days-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, countdown: 3 days to go until the Woolet Kickstarter launch on Thursday, October 29.",
    label: "3 days to go",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-03-2-days-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, countdown: 2 days to go until the Woolet Kickstarter launch on Thursday, October 29.",
    label: "2 days to go",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-04-tomorrow-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, countdown: Woolet launches on Kickstarter tomorrow, early-bird 30 frames at $114, then $190.",
    label: "Tomorrow",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-05-live-now-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, headline: Glasses built for wide faces, now live on Kickstarter. 158 mm front, Mazzucchelli acetate.",
    label: "Live now",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-06-founder-48h-4x5.jpg",
    alt: "Man with a wide face wearing Woolet 007 Round black acetate glasses, headline: Your $114 founder price is waiting, open for 48 hours after the Kickstarter launch.",
    label: "Founder 48 h",
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-oct29-4x5.jpg",
    alt: "Woolet Kickstarter launch date: giant black OCT 29 on yellow, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 OCT 29 (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-oct29-9x16.jpg",
    alt: "Woolet Kickstarter launch date: giant black OCT 29 on yellow, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 OCT 29 (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-7-days-4x5.jpg",
    alt: "Giant black number 7 on yellow: 7 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 7 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-7-days-9x16.jpg",
    alt: "Giant black number 7 on yellow: 7 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 7 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-6-days-4x5.jpg",
    alt: "Giant black number 6 on yellow: 6 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 6 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-6-days-9x16.jpg",
    alt: "Giant black number 6 on yellow: 6 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 6 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-5-days-4x5.jpg",
    alt: "Giant black number 5 on yellow: 5 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 5 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-5-days-9x16.jpg",
    alt: "Giant black number 5 on yellow: 5 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 5 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-4-days-4x5.jpg",
    alt: "Giant black number 4 on yellow: 4 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 4 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-4-days-9x16.jpg",
    alt: "Giant black number 4 on yellow: 4 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 4 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-3-days-4x5.jpg",
    alt: "Giant black number 3 on yellow: 3 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 3 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-3-days-9x16.jpg",
    alt: "Giant black number 3 on yellow: 3 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 3 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-2-days-4x5.jpg",
    alt: "Giant black number 2 on yellow: 2 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 2 days (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-2-days-9x16.jpg",
    alt: "Giant black number 2 on yellow: 2 days to the Woolet Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 2 days (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-1-day-4x5.jpg",
    alt: "Giant black number 1 on yellow: Woolet goes live on Kickstarter tomorrow, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 1 day (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-1-day-9x16.jpg",
    alt: "Giant black number 1 on yellow: Woolet goes live on Kickstarter tomorrow, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 1 day (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-live-now-4x5.jpg",
    alt: "Giant black LIVE NOW on yellow: Woolet is now live on Kickstarter, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 Live now (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-live-now-9x16.jpg",
    alt: "Giant black LIVE NOW on yellow: Woolet is now live on Kickstarter, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 Live now (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-founder-48h-4x5.jpg",
    alt: "Giant black number 48 on yellow: 48 hours of the Woolet founder price after the Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 Founder 48 h (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    src: "/ads/2026-10-ks-launch/woolet-ks-countdown-v2-founder-48h-9x16.jpg",
    alt: "Giant black number 48 on yellow: 48 hours of the Woolet founder price after the Kickstarter launch, above a close-up of a man with a wide face in Woolet 007 Round black acetate glasses - glasses built for wide faces, 158 mm front.",
    label: "v2 Founder 48 h (9:16)",
    width: 1080,
    height: 1920,
  },
];

// Native pixel size of every file (1080 x 1350). Declaring it keeps the layout
// stable while the images load.
const NATURAL = { width: 1080, height: 1350 };

const KsLaunchCreatives = () => (
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
      <title>Woolet Kickstarter launch - countdown ads</title>
      <meta
        name="description"
        content="Six Meta ad images for the Woolet Kickstarter launch on October 29: countdown, live now and founder access."
      />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://woolet.co/en/creatives/ks-launch" />
      <meta property="og:title" content="Woolet Kickstarter launch - countdown ads" />
      <meta
        property="og:description"
        content="Six Meta ad images for the Woolet Kickstarter launch on October 29."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://woolet.co/en/creatives/ks-launch" />
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
          Kickstarter launch ads
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
        Kickstarter launch countdown
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
        Ad images for the Woolet Kickstarter launch on October 29: the first
        dark set, then v2 with giant countdown numbers on yellow (4:5 and 9:16).
      </p>

      <div
        className="ksGrid"
        style={{
          marginTop: 48,
        }}
      >
        {SHOTS.map((shot, i) => (
          <figure key={shot.src} style={{ margin: 0 }}>
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width ?? NATURAL.width}
              height={shot.height ?? NATURAL.height}
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
        .ksGrid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 40px; }
        @media (min-width: 760px) {
          .ksGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
        }
      `}</style>
    </main>
  </div>
);

export default KsLaunchCreatives;
