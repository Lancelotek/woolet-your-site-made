import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

/**
 * Unlinked, noindex creative sheet for the Woolet Bespoke social carousel
 * (Instagram / Facebook / LinkedIn, from 05.11.2026).
 *
 * Purpose: give the ad images a page whose markup carries their alt text.
 * The images themselves are static files under /ads/2026-11-bespoke-social/ (see
 * public/ads/2026-11-bespoke-social/ and its manifest.json) and are reachable at
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
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-01-design-them-4x5.jpg",
    alt: "Woolet Bespoke custom glasses: round frame with a British racing green acetate front and amber tortoise temples, headline: Don't pick glasses. Design them. Shape, acetate and finish chosen separately.",
    label: "01 \u00b7 Design them",
  },
  {
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-02-four-shapes-4x5.jpg",
    alt: "Woolet Bespoke frame shapes in amber tortoise acetate: Round, Crown Panto, Rectangle and Aviator glasses, headline: Four shapes. Same acetate.",
    label: "02 \u00b7 Four shapes",
  },
  {
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-03-acetates-4x5.jpg",
    alt: "Woolet Bespoke rectangle glasses in six Mazzucchelli acetates: amber tortoise, racing green, deep matte black, ice translucent, rouge and sunflower, headline: 15 Mazzucchelli acetates, hand finished in the EU.",
    label: "03 \u00b7 Acetates",
  },
  {
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-04-two-colours-4x5.jpg",
    alt: "Woolet Bespoke two-colour glasses with a different acetate on the front and the temples: navy with sunflower, amber tortoise with racing green, rouge aviator with deep matte black, slate grain with amber tortoise, headline: Two colours. One frame.",
    label: "04 \u00b7 Two colours",
  },
  {
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-05-finishes-4x5.jpg",
    alt: "Woolet Bespoke Crown Panto glasses in tortoise acetate shown in three finishes: matte, brushed and hand polished.",
    label: "05 \u00b7 Finishes",
  },
  {
    src: "/ads/2026-11-bespoke-social/woolet-bespoke-carousel-06-nobody-else-4x5.jpg",
    alt: "Woolet Bespoke custom eyeglasses, headline: Nobody else wears yours. 4 shapes, 15 front acetates, 15 temple acetates and 3 finishes make 2,700 builds. Design yours at woolet.co/en/bespoke.",
    label: "06 \u00b7 Design yours",
  },
];

// Native pixel size of every file (1080 x 1350). Declaring it keeps the layout
// stable while the images load.
const NATURAL = { width: 1080, height: 1350 };

const BespokeSocialCreatives = () => (
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
      <title>Woolet Bespoke - design your own glasses</title>
      <meta
        name="description"
        content="Woolet Bespoke social images: four shapes, 15 Mazzucchelli acetates, two-colour fronts and temples, three finishes."
      />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://woolet.co/en/creatives/bespoke" />
      <meta property="og:title" content="Woolet Bespoke - design your own glasses" />
      <meta
        property="og:description"
        content="Woolet Bespoke social images: design your own acetate glasses."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://woolet.co/en/creatives/bespoke" />
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
          Bespoke social
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
        Woolet Bespoke: design your own glasses
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
        Carousel images for Woolet Bespoke: pick the shape, the Mazzucchelli acetate
        for the front and the temples, and the finish.
      </p>

      <div
        className="bsGrid"
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
        .bsGrid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 40px; }
        @media (min-width: 760px) {
          .bsGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
        }
      `}</style>
    </main>
  </div>
);

export default BespokeSocialCreatives;
