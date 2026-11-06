import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * Unlinked, noindex creative sheet for the Woolet Bespoke video ad
 * "Don't pick glasses. Design them." (Meta, from 06.11.2026).
 *
 * Purpose: give the ad videos a page whose markup carries their description
 * (aria-label on <video>, visible caption, poster alt in manifest.json).
 * The files are static under /ads/2026-11-bespoke-video/ (see public/ads/2026-11-bespoke-video/ and its
 * manifest.json) and are reachable at stable public URLs used in Meta Ads.
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

type Clip = {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
  description: string;
};

const CLIPS: Clip[] = [
  {
    src: "/ads/2026-11-bespoke-video/woolet-bespoke-design-them-9x16.mp4",
    poster: "/ads/2026-11-bespoke-video/woolet-bespoke-design-them-9x16-poster.jpg",
    width: 1080,
    height: 1920,
    label: "Vertical 9:16 · Reels and Stories",
    description: "Woolet Bespoke video ad (vertical 9:16, 18 seconds): design your own custom acetate glasses. Four frame shapes - Round, Crown Panto, Rectangle and Aviator. 15 Mazzucchelli acetates, shown in dark tortoise, British racing green, ice translucent, slate grain and amber tortoise. Two-colour builds with a different acetate on the front and the temples: racing green with amber tortoise, deep matte black with slate grain, racing green with ice translucent. Frame width built to your face scan, 145 to 160 mm, hand made in the EU in a 2-week build. Headlines: Don't pick glasses. Design them. Nobody else wears yours. 2,700 possible builds. Design yours at woolet.co/en/bespoke.",
  },
  {
    src: "/ads/2026-11-bespoke-video/woolet-bespoke-design-them-4x5.mp4",
    poster: "/ads/2026-11-bespoke-video/woolet-bespoke-design-them-4x5-poster.jpg",
    width: 1080,
    height: 1350,
    label: "Portrait 4:5 · Feed",
    description: "Woolet Bespoke video ad (portrait 4:5, 18 seconds): design your own custom acetate glasses. Four frame shapes - Round, Crown Panto, Rectangle and Aviator. 15 Mazzucchelli acetates, shown in dark tortoise, British racing green, ice translucent, slate grain and amber tortoise. Two-colour builds with a different acetate on the front and the temples: racing green with amber tortoise, deep matte black with slate grain, racing green with ice translucent. Frame width built to your face scan, 145 to 160 mm, hand made in the EU in a 2-week build. Headlines: Don't pick glasses. Design them. Nobody else wears yours. 2,700 possible builds. Design yours at woolet.co/en/bespoke.",
  },
];

const BespokeVideoCreatives = () => (
  <div style={{ background: INK, color: CREAM, minHeight: "100vh", fontFamily: UI }}>
    <Helmet>
      <html lang="en" />
      <title>Woolet Bespoke video - design your own glasses</title>
      <meta
        name="description"
        content="Woolet Bespoke video ad: four shapes, 15 Mazzucchelli acetates, two-colour fronts and temples, frame width built to your face scan."
      />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://woolet.co/en/creatives/bespoke-video" />
      <meta property="og:title" content="Woolet Bespoke video - design your own glasses" />
      <meta property="og:description" content="Woolet Bespoke video ad: design your own acetate glasses." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://woolet.co/en/creatives/bespoke-video" />
      <meta property="og:image" content="https://woolet.co/ads/2026-11-bespoke-video/woolet-bespoke-design-them-4x5-poster.jpg" />
    </Helmet>

    <header style={{ borderBottom: `1px solid ${HAIR}`, background: PANEL }}>
      <div
        className="mx-auto"
        style={{ maxWidth: 1080, padding: "18px 24px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
      >
        <Link to="/en" style={{ fontFamily: DISPLAY, fontSize: 22, letterSpacing: "0.02em", color: CREAM, textDecoration: "none" }}>
          Woolet
        </Link>
        <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD }}>Bespoke video</span>
      </div>
    </header>

    <main className="mx-auto" style={{ maxWidth: 1080, padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(30px, 4.4vw, 46px)", lineHeight: 1.1, margin: 0, color: CREAM }}>
        Woolet Bespoke: don't pick glasses, design them
      </h1>
      <p style={{ marginTop: 16, maxWidth: 620, fontSize: 15, lineHeight: 1.65, color: MUTED }}>
        Video ads for Woolet Bespoke custom glasses: pick the shape, the Mazzucchelli acetate
        for the front and the temples, and get a frame width built to your face scan.
      </p>

      <div className="bvGrid" style={{ marginTop: 48 }}>
        {CLIPS.map((clip) => (
          <figure key={clip.src} style={{ margin: 0 }}>
            <video
              src={clip.src}
              poster={clip.poster}
              width={clip.width}
              height={clip.height}
              aria-label={clip.description}
              title={clip.description}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              style={{ display: "block", width: "100%", height: "auto", background: PANEL, border: `1px solid ${HAIR}` }}
            />
            <figcaption style={{ marginTop: 14 }}>
              <span style={{ display: "block", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD }}>
                {clip.label}
              </span>
              <span style={{ display: "block", marginTop: 8, fontSize: 13, lineHeight: 1.6, color: MUTED }}>
                {clip.description}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <style>{`
        .bvGrid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 40px; align-items: start; }
        @media (min-width: 760px) {
          .bvGrid { grid-template-columns: 9fr 12fr; gap: 28px; }
        }
      `}</style>
    </main>
  </div>
);

export default BespokeVideoCreatives;
