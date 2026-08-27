import { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BoxStage = lazy(() => import("@/components/box/BoxStage"));

const INK = "#080807";
const CREAM = "#EDE7D9";
const MUTED = "#9A8E7E";
const GOLD = "#CAA449";
const DIM_GOLD = "#8A6E2C";
const LIGHT = "#F8F6F1";
const DARK_ON_LIGHT = "#1F1B16";

const eyebrow: React.CSSProperties = {
  fontFamily: "'Archivo', system-ui, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 11,
  fontWeight: 600,
};

const TheBox = () => {
  return (
    <div style={{ background: INK, color: CREAM, minHeight: "100vh" }}>
      <Helmet>
        <title>The Box — Woolet</title>
        <meta
          name="description"
          content="The Woolet case: a rigid magnetic box, 180 × 80 × 55 mm, hand made in EU. Gold-foil mark, cream lining, and one number on the spine — 158 mm."
        />
        <link rel="canonical" href="https://woolet.co/en/the-box" />
        <meta property="og:title" content="The Box — Woolet" />
        <meta
          property="og:description"
          content="A rigid magnetic case, hand made in EU. 158 mm on the spine — the only number that matters."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://woolet.co/en/the-box" />
        <meta property="og:image" content="/box/woolet-box-3D-closed.png" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6vw",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 880 }}>
          <div style={{ ...eyebrow, color: GOLD, marginBottom: 28 }}>THE BOX</div>
          <h1
            style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(38px, 6vw, 76px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: 0,
              color: CREAM,
            }}
          >
            Everything before the first look.
          </h1>
          <p
            style={{
              marginTop: 28,
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: MUTED,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            A rigid magnetic case, 180 × 80 × 55 mm. Hand made in EU.
          </p>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            ...eyebrow,
            color: DIM_GOLD,
            fontSize: 10,
          }}
        >
          SCROLL
        </div>
      </section>

      {/* 3D stage */}
      <Suspense fallback={<div style={{ height: "100vh" }} />}>
        <BoxStage />
      </Suspense>

      {/* Spec strip */}
      <section
        style={{
          background: LIGHT,
          color: DARK_ON_LIGHT,
          padding: "88px 6vw",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 48,
          }}
        >
          {[
            { label: "DIMENSIONS", value: "180 × 80 × 55 mm" },
            { label: "SHELL", value: "Rigid board, soft-touch black" },
            { label: "MARK", value: "Gold foil, hot-stamped" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ ...eyebrow, color: DIM_GOLD, marginBottom: 14 }}>{s.label}</div>
              <div
                style={{
                  fontFamily: "'Archivo', system-ui, sans-serif",
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: DARK_ON_LIGHT,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detail trio */}
      <section style={{ padding: "120px 6vw" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 96 }}>
          {[
            {
              eyebrowText: "01 — THE MARK",
              title: "A single gold ‘w’.",
              body: "Gold-foil, hot-stamped on the lid. Nothing else.",
              tone: "front",
            },
            {
              eyebrowText: "02 — THE SPINE",
              title: <><span className="font-wordmark">WOOLET</span> · 158 MM.</>,
              body:
                "The only number on the outside — because it’s the only one that matters. Standard frames stop around 148 mm. This is not standard.",
              tone: "spine",
            },
            {
              eyebrowText: "03 — THE INSIDE",
              title: "MADE FOR WIDE FACES.",
              body:
                "Cream lining, printed inside the lid. You read it before you see the frames.",
              tone: "inner",
            },
          ].map((row, i) => (
            <div
              key={row.eyebrowText}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
                gap: 64,
                alignItems: "center",
              }}
              className="box-detail-row"
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ ...eyebrow, color: GOLD, marginBottom: 20 }}>
                  {row.eyebrowText}
                </div>
                <h2
                  style={{
                    fontFamily: "'Archivo', system-ui, sans-serif",
                    fontWeight: 300,
                    fontSize: "clamp(28px, 3.6vw, 44px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: CREAM,
                  }}
                >
                  {row.title}
                </h2>
                <p
                  style={{
                    marginTop: 20,
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: MUTED,
                    maxWidth: 460,
                  }}
                >
                  {row.body}
                </p>
              </div>
              <DetailStill tone={row.tone as "front" | "spine" | "inner"} />
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability */}
      <section style={{ padding: "80px 6vw 120px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ ...eyebrow, color: DIM_GOLD, marginBottom: 20 }}>
            KEPT, NOT DISCARDED
          </div>
          <p
            style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontSize: 20,
              lineHeight: 1.65,
              color: CREAM,
              fontWeight: 300,
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            FSC-certified board. No plastic laminate. Soy inks. The box is designed to be
            kept — a place to leave your frames at the end of the day, not something to
            throw away on the first.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "0 6vw 160px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            borderTop: `1px solid ${DIM_GOLD}33`,
            paddingTop: 80,
          }}
        >
          <h2
            style={{
              fontFamily: "'Archivo', system-ui, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: CREAM,
              margin: 0,
            }}
          >
            The box comes with the pair.
          </h2>
          <p
            style={{
              marginTop: 20,
              color: MUTED,
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Start with a two-minute fit, so the frames inside actually match your face.
          </p>
          <div
            style={{
              marginTop: 40,
              display: "inline-flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              to="/en/fit"
              style={{
                background: GOLD,
                color: DARK_ON_LIGHT,
                padding: "16px 28px",
                borderRadius: 2,
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Reserve your pair →
            </Link>
            <Link
              to="/en/products/007"
              style={{
                color: CREAM,
                fontFamily: "'Archivo', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderBottom: `1px solid ${DIM_GOLD}`,
                paddingBottom: 4,
              }}
            >
              See the frames
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .box-detail-row { grid-template-columns: 1fr !important; gap: 32px !important; }
          .box-detail-row > div { order: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const DetailStill = ({ tone }: { tone: "front" | "spine" | "inner" }) => {
  const src =
    tone === "front"
      ? "/box/panel-front.png"
      : tone === "spine"
      ? "/box/panel-spine.png"
      : "/box/panel-inner-lid.png";
  const bg = tone === "inner" ? LIGHT : "#0f0e0c";
  const border = `1px solid ${DIM_GOLD}22`;
  return (
    <div
      style={{
        aspectRatio: "4 / 3",
        background: bg,
        border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
        style={{
          maxWidth: "82%",
          maxHeight: "82%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default TheBox;
