import { useEffect, useState } from "react";
import SEO from "@/components/SEO";

/**
 * Woolet Shop — hidden long-form landing page.
 * Route: /en/shop
 * Not linked from nav, not in sitemap, noindex,nofollow.
 * Design mirrors woolet.co (Cormorant Garamond + Barlow, gold on ink black,
 * sharp-cornered buttons, hairline dividers).
 */

const GOLD = "#CAA449";
const GOLD_DEEP = "#8A6E2E";
const BG = "#080807";
const SURFACE = "#16140F";
const HAIR = "rgba(255,255,255,0.08)";
const HAIR_STRONG = "rgba(255,255,255,0.18)";
const CREAM = "#EDE9DE";
const HEADING = "#F8F8F6";
const MUTED = "#BAAFA1";

const serif = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 } as const;
const sans = { fontFamily: "'Barlow', sans-serif" } as const;

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      ...sans,
      color: GOLD,
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      fontSize: 11,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const PrimaryBtn = ({
  children,
  onClick,
  as = "button",
  href,
  className = "",
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  className?: string;
  fullWidth?: boolean;
}) => {
  const style: React.CSSProperties = {
    ...sans,
    background: GOLD,
    color: BG,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    fontWeight: 600,
    padding: "18px 28px",
    border: "none",
    borderRadius: 0,
    cursor: "pointer",
    display: "inline-block",
    textDecoration: "none",
    width: fullWidth ? "100%" : undefined,
    textAlign: "center",
    transition: "background 200ms ease",
  };
  const onOver = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget.style.background = GOLD_DEEP));
  const onOut = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget.style.background = GOLD));
  if (as === "a") {
    return (
      <a href={href} style={style} onMouseOver={onOver} onMouseOut={onOut} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style} onMouseOver={onOver} onMouseOut={onOut} className={className}>
      {children}
    </button>
  );
};

const GhostBtn = ({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) => {
  const style: React.CSSProperties = {
    ...sans,
    background: "transparent",
    color: CREAM,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    fontWeight: 500,
    padding: "17px 27px",
    border: `1px solid ${HAIR_STRONG}`,
    borderRadius: 0,
    cursor: "pointer",
    display: "inline-block",
    textDecoration: "none",
    transition: "background 200ms ease",
  };
  const onOver = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget.style.background = "rgba(255,255,255,0.06)"));
  const onOut = (e: React.MouseEvent<HTMLElement>) =>
    ((e.currentTarget.style.background = "transparent"));
  if (href) {
    return (
      <a href={href} style={style} onMouseOver={onOver} onMouseOut={onOut}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style} onMouseOver={onOver} onMouseOut={onOut}>
      {children}
    </button>
  );
};

const Placeholder = ({
  label,
  ratio = "4 / 5",
  minH = 260,
}: {
  label: string;
  ratio?: string;
  minH?: number;
}) => (
  <div
    style={{
      background: "linear-gradient(180deg, #0f0e0c 0%, #1a1712 100%)",
      border: `1px solid ${HAIR}`,
      aspectRatio: ratio,
      minHeight: minH,
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-start",
      padding: 16,
    }}
    aria-hidden
  >
    <span
      style={{
        ...sans,
        color: GOLD,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontSize: 10,
      }}
    >
      {label}
    </span>
  </div>
);

const SectionDivider = () => (
  <div style={{ height: 1, background: HAIR, width: "100%" }} />
);

/* ------------------------------ FAQ Accordion ------------------------------ */

const faqs = [
  {
    q: "How do I know my face is wide enough for Woolet?",
    a: "If frames from Ray-Ban, Persol, Warby Parker or Tom Ford pinch your temples or leave marks, you are likely 155 mm+. Our AI Fit Wizard measures your face width from one photo in 30 seconds.",
  },
  {
    q: "What's the difference between standard and bespoke?",
    a: "Standard 007 and 009 are built in one precise size — 158 mm front with a 21 mm keyhole bridge — which fits faces 155–161 mm. Bespoke is cut to your exact measurements and covers 150–172 mm.",
  },
  {
    q: "Can I get prescription lenses?",
    a: "Yes. Every frame accepts single-vision, progressive and blue-light lenses. You can add your prescription at checkout or send it later.",
  },
  {
    q: "Where are Woolet frames made?",
    a: "The acetate is Mazzucchelli 1849 from Castiglione Olona, Italy. Cutting, bevelling, hand-polishing and inspection are done in Italy.",
  },
  {
    q: "What if they don't fit?",
    a: "You have 30 days from delivery to return them for a full refund, no questions asked. Standard frames only — bespoke are cut to your measurements.",
  },
  {
    q: "How long is shipping?",
    a: "Standard frames ship worldwide within 3–5 business days from our EU warehouse. Bespoke takes 4–6 weeks because each front is cut and finished to order.",
  },
];

const FaqAccordion = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ borderTop: `1px solid ${HAIR}` }}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${HAIR}` }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                ...sans,
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "22px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
                cursor: "pointer",
                color: HEADING,
                textAlign: "left",
                fontSize: 16,
              }}
            >
              <span style={{ ...serif, fontSize: 22 }}>{f.q}</span>
              <span style={{ color: GOLD, fontSize: 20, lineHeight: 1 }}>
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && (
              <div
                style={{
                  ...sans,
                  color: MUTED,
                  fontSize: 15,
                  lineHeight: 1.7,
                  paddingBottom: 24,
                  maxWidth: 720,
                }}
              >
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------------- Buy Box --------------------------------- */

const BuyBox = () => {
  const [model, setModel] = useState<"007" | "009">("007");
  const modelName = model === "007" ? "Woolet 007 Round" : "Woolet 009 Soft-Square";
  return (
    <section
      id="buy"
      style={{
        background: "linear-gradient(180deg, rgba(202,164,73,0.05) 0%, rgba(202,164,73,0.02) 100%)",
        border: `1px solid ${HAIR}`,
        padding: "clamp(28px, 5vw, 64px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 48,
          alignItems: "center",
        }}
        className="buy-grid"
      >
        <Placeholder label={`Product photo — ${modelName}, front on cream`} ratio="1 / 1" minH={340} />
        <div>
          <div
            style={{
              ...sans,
              display: "inline-block",
              padding: "6px 12px",
              background: "rgba(202,164,73,0.18)",
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 10,
              marginBottom: 20,
            }}
          >
            Limited launch pricing
          </div>
          <h3 style={{ ...serif, fontSize: "clamp(30px, 4vw, 44px)", color: HEADING, margin: 0 }}>
            {modelName}
          </h3>
          <p style={{ ...sans, color: MUTED, fontSize: 15, lineHeight: 1.7, marginTop: 12 }}>
            158 mm front · 21 mm keyhole bridge · Italian Mazzucchelli acetate, hand-finished.
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 24 }}>
            <span style={{ ...serif, fontSize: 36, color: GOLD }}>€[price]</span>
            <span style={{ ...sans, color: MUTED, textDecoration: "line-through", fontSize: 16 }}>
              €[was]
            </span>
            <span
              style={{
                ...sans,
                color: GOLD,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: 11,
              }}
            >
              −40%
            </span>
          </div>

          {/* Model toggle */}
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                ...sans,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 10,
                marginBottom: 10,
              }}
            >
              Shape
            </div>
            <div style={{ display: "flex", gap: 0, border: `1px solid ${HAIR_STRONG}` }}>
              {(["007", "009"] as const).map((m) => {
                const active = model === m;
                return (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    style={{
                      ...sans,
                      flex: 1,
                      padding: "14px 16px",
                      background: active ? GOLD : "transparent",
                      color: active ? BG : CREAM,
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      fontSize: 11,
                    }}
                  >
                    {m === "007" ? "007 Round" : "009 Soft-square"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trust icons row */}
          <ul
            style={{
              ...sans,
              listStyle: "none",
              padding: 0,
              margin: "28px 0 0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              color: MUTED,
              fontSize: 13,
            }}
          >
            {[
              "30-day fit guarantee",
              "Free worldwide shipping",
              "Handmade in Italy",
              "Free AI Fit Wizard",
            ].map((t) => (
              <li key={t} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: GOLD }}>✓</span>
                {t}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 28 }}>
            <PrimaryBtn fullWidth>Add to cart</PrimaryBtn>
          </div>
          <div
            style={{
              ...sans,
              marginTop: 14,
              fontSize: 12,
              color: MUTED,
              letterSpacing: "0.04em",
            }}
          >
            Visa · Mastercard · Amex · Apple Pay · Google Pay ·{" "}
            <a href="#fit-wizard" style={{ color: GOLD, textDecoration: "underline" }}>
              Run the Fit Wizard first
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------ Tabs ---------------------------------------- */

const ProductTabs = () => {
  const [tab, setTab] = useState<"specs" | "materials" | "fit">("specs");
  const tabs: { id: typeof tab; label: string }[] = [
    { id: "specs", label: "Specs" },
    { id: "materials", label: "Materials & Craft" },
    { id: "fit", label: "Fit Guide" },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${HAIR}` }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...sans,
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? GOLD : "transparent"}`,
                color: active ? HEADING : MUTED,
                padding: "16px 22px",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ ...sans, color: CREAM, fontSize: 15, lineHeight: 1.8, padding: "28px 0", maxWidth: 780 }}>
        {tab === "specs" && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            <li><span style={{ color: GOLD }}>—</span> Front width: 158 mm</li>
            <li><span style={{ color: GOLD }}>—</span> Bridge: 21 mm keyhole</li>
            <li><span style={{ color: GOLD }}>—</span> Temple length: 148 mm</li>
            <li><span style={{ color: GOLD }}>—</span> Lens height: 45 mm (007) / 42 mm (009)</li>
            <li><span style={{ color: GOLD }}>—</span> Weight: ~28 g</li>
            <li><span style={{ color: GOLD }}>—</span> Recommended face width: 155–161 mm (standard); 150–172 mm (bespoke)</li>
          </ul>
        )}
        {tab === "materials" && (
          <p>
            Cut from a single sheet of Mazzucchelli 1849 Italian cellulose acetate — batch-cured for several
            weeks in Castiglione Olona, then milled, hand-bevelled and hand-polished in Italy. Stainless-steel
            hinges. The material is denser and more dimensionally stable than injection-moulded plastic, which is
            why a 158 mm front holds its geometry season after season.
          </p>
        )}
        {tab === "fit" && (
          <p>
            Woolet is built for faces measuring 155 mm or more temple-to-temple. If your face is between 155 and
            161 mm, the standard 007 or 009 will fit. If you're outside that range, bespoke covers 150–172 mm.
            Run the AI Fit Wizard from a single front-on photo to know for sure.
          </p>
        )}
      </div>
    </div>
  );
};

/* --------------------------------- Page ----------------------------------- */

const Shop = () => {
  useEffect(() => {
    // Google Fonts (Cormorant + Barlow) — load only on this page
    const id = "shop-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Barlow:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: BG, color: CREAM, minHeight: "100vh", ...sans }}>
      <SEO
        title="Woolet Shop — Wide-Face Eyewear"
        description="Italian Mazzucchelli acetate eyewear engineered for wide faces. 158 mm front, 21 mm keyhole bridge, hand-finished in Italy."
        path="/shop"
        noindex
        robots="noindex, nofollow"
      />

      {/* Scoped styles for responsive */}
      <style>{`
        @media (max-width: 860px) {
          .buy-grid { grid-template-columns: 1fr !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .feature-row { grid-template-columns: 1fr !important; }
          .feature-row.reverse .feature-img { order: -1; }
          .spec-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .subbar-links { display: none !important; }
          .cmp-table { font-size: 12px !important; }
        }
        .shop-anchor { scroll-margin-top: 140px; }
      `}</style>

      {/* Announcement bar */}
      <div
        style={{
          background: "#0b0a09",
          borderBottom: `1px solid ${HAIR}`,
          padding: "10px 20px",
          textAlign: "center",
          fontSize: 12,
          color: MUTED,
          letterSpacing: "0.08em",
        }}
      >
        Handmade in Italy · Free worldwide shipping · 30-day fit guarantee ·{" "}
        <span style={{ color: GOLD }}>40% off — join the list</span>
      </div>

      {/* Sticky header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(8,8,7,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${HAIR}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <a href="/en/shop" style={{ ...serif, color: HEADING, fontSize: 26, letterSpacing: "0.04em", textDecoration: "none" }}>
            Woolet
          </a>
          <nav
            className="subbar-links"
            style={{
              display: "flex",
              gap: 28,
              ...sans,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: MUTED,
            }}
          >
            <a href="#buy" style={{ color: MUTED, textDecoration: "none" }}>Shop</a>
            <a href="#fit" style={{ color: MUTED, textDecoration: "none" }}>The Fit</a>
            <a href="#craft" style={{ color: MUTED, textDecoration: "none" }}>Craftsmanship</a>
            <a href="#compare" style={{ color: MUTED, textDecoration: "none" }}>Compare</a>
            <a href="#reviews" style={{ color: MUTED, textDecoration: "none" }}>Reviews</a>
          </nav>
          <div style={{ display: "flex", gap: 12 }}>
            <GhostBtn href="#fit-wizard">Fit Wizard</GhostBtn>
            <PrimaryBtn as="a" href="#buy">Shop Now</PrimaryBtn>
          </div>
        </div>

        {/* Sticky sub-bar */}
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 12,
            }}
          >
            <div style={{ color: MUTED, letterSpacing: "0.08em" }}>
              <span style={{ color: GOLD, letterSpacing: 0 }}>★★★★★</span>&nbsp;&nbsp;5.0 · 1,400+ wide-face fittings
            </div>
            <nav
              className="subbar-links"
              style={{
                display: "flex",
                gap: 24,
                ...sans,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: MUTED,
              }}
            >
              <a href="#fit" style={{ color: MUTED, textDecoration: "none" }}>The Fit</a>
              <a href="#specs" style={{ color: MUTED, textDecoration: "none" }}>Specs</a>
              <a href="#compare" style={{ color: MUTED, textDecoration: "none" }}>Compare</a>
              <a href="#reviews" style={{ color: MUTED, textDecoration: "none" }}>Reviews</a>
              <a href="#guarantee" style={{ color: MUTED, textDecoration: "none" }}>Guarantee</a>
              <a href="#faq" style={{ color: MUTED, textDecoration: "none" }}>FAQ</a>
            </nav>
            <PrimaryBtn as="a" href="#buy">Shop Now</PrimaryBtn>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* HERO */}
        <section
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 64,
            alignItems: "center",
            padding: "80px 0 96px",
          }}
        >
          <div>
            <Eyebrow>★★★★★ &nbsp; 5.0 · 1,400+ fittings</Eyebrow>
            <h1
              style={{
                ...serif,
                color: HEADING,
                fontSize: "clamp(44px, 6vw, 78px)",
                lineHeight: 1.05,
                margin: "18px 0 24px",
                letterSpacing: "-0.01em",
              }}
            >
              Eyewear that finally fits a wide face.
            </h1>
            <p
              style={{
                ...sans,
                color: MUTED,
                fontSize: 18,
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 36,
              }}
            >
              158 mm Italian acetate, measured for faces 155 mm and above.
              Hand-finished in Italy. No more pinched temples, no more marks.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PrimaryBtn as="a" href="#buy">Shop the frames</PrimaryBtn>
              <GhostBtn href="#fit-wizard">Find my fit</GhostBtn>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
              {["Handmade in Italy", "Mazzucchelli acetate", "30-day fit guarantee"].map((b) => (
                <span
                  key={b}
                  style={{
                    ...sans,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: MUTED,
                    border: `1px solid ${HAIR_STRONG}`,
                    padding: "8px 14px",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
          <Placeholder label="Hero — 007 on model, wide-face crop, dark backdrop" ratio="4 / 5" minH={480} />
        </section>

        {/* PRESS BAR */}
        <section style={{ border: `1px solid ${HAIR}`, padding: "20px 28px", margin: "0 0 96px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                ...sans,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: MUTED,
              }}
            >
              As covered by <span style={{ opacity: 0.6 }}>(illustrative)</span>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap", ...serif, fontSize: 22, color: CREAM, opacity: 0.75 }}>
              <span>GQ</span>
              <span>Esquire</span>
              <span>Monocle</span>
              <span>Robb Report</span>
              <span>Highsnobiety</span>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section id="fit" className="shop-anchor" style={{ padding: "0 0 96px" }}>
          <div style={{ maxWidth: 780, marginBottom: 56 }}>
            <Eyebrow>Engineered for wide faces</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(34px, 4.5vw, 56px)", lineHeight: 1.1, margin: "16px 0 20px" }}>
              Big-brand frames stop at 150 mm. Your face doesn't.
            </h2>
            <p style={{ ...sans, color: MUTED, fontSize: 17, lineHeight: 1.75 }}>
              Persol, Tom Ford, Warby Parker and Ray-Ban Wayfarer Large all top out around 142–150 mm.
              If you've spent years buying frames that pinch, mark or slide, the problem was never your face.
              It was the fit.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 24,
            }}
            className="feature-row"
          >
            {[
              { eb: "The Fit", h: "158 mm front + 21 mm keyhole bridge", p: "One precise size, built for 155–161 mm faces. Bespoke covers 150–172 mm." },
              { eb: "The Material", h: "Mazzucchelli 1849 acetate", p: "Italian cellulose acetate, batch-cured for weeks. Denser and more stable than moulded plastic." },
              { eb: "The Craft", h: "Hand-finished in Italy", p: "Milled, bevelled and polished by hand. Every front inspected before it leaves the workshop." },
            ].map((c) => (
              <div key={c.eb} style={{ background: SURFACE, border: `1px solid ${HAIR}`, padding: 32 }}>
                <Eyebrow>{c.eb}</Eyebrow>
                <h3 style={{ ...serif, color: HEADING, fontSize: 26, margin: "14px 0 12px", lineHeight: 1.2 }}>
                  {c.h}
                </h3>
                <p style={{ ...sans, color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{c.p}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <PrimaryBtn as="a" href="#buy">Shop the frames</PrimaryBtn>
          </div>
        </section>

        <SectionDivider />

        {/* FEATURE STACK */}
        <section id="craft" className="shop-anchor" style={{ padding: "96px 0" }}>
          {[
            {
              eb: "Front width",
              h: "158 mm, so the temples sit past your face.",
              p: "Standard eyewear stops around 142–150 mm. On a wide face the temples land on your cheekbone and dig in. Woolet's 158 mm front pushes them past the widest point, so the hinge sits ahead of your temple, not against it.",
              bullets: ["Front width: 158 mm", "Fits 155–161 mm faces", "One precise size, no guesswork"],
              img: "Feature — 158 mm dimensioned front, technical detail",
              reverse: false,
            },
            {
              eb: "The bridge",
              h: "A 21 mm keyhole bridge that stops the slide.",
              p: "Standard 18–20 mm saddle bridges concentrate pressure on the top of the nose, then slide. The 21 mm keyhole distributes weight across the side walls, so the frame stays put — even on a wider nasal base.",
              bullets: ["21 mm keyhole geometry", "Reduces slide on wide bridges", "Matched to your nose by AI Fit"],
              img: "Feature — 21 mm keyhole bridge macro on 009",
              reverse: true,
            },
            {
              eb: "AI Fit Wizard",
              h: "One photo. 30 seconds. Standard or bespoke, decided.",
              p: "Upload a front-on photo. The Fit Wizard measures your face width against a reference, then tells you whether 007/009 fits or whether you need bespoke. No calipers, no guesswork.",
              bullets: ["30-second photo check", "Standard vs bespoke recommendation", "Free, no account needed"],
              img: "Feature — Fit Wizard UI mockup with measurement overlay",
              reverse: false,
              cta: true,
            },
            {
              eb: "Bespoke tier",
              h: "150–172 mm. Cut to your face.",
              p: "If you're outside the 155–161 mm standard range, we cut a bespoke front from the same Mazzucchelli sheet. Same craft, same 4–6 weeks. Yours only.",
              bullets: ["Range: 150–172 mm", "Cut from Mazzucchelli 1849 sheet", "4–6 weeks, made to order"],
              img: "Feature — bespoke acetate block being milled",
              reverse: true,
            },
          ].map((row, i) => (
            <div key={i}>
              <div
                className={`feature-row ${row.reverse ? "reverse" : ""}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: row.reverse ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)",
                  gap: 64,
                  alignItems: "center",
                  padding: "72px 0",
                }}
              >
                {!row.reverse && (
                  <div className="feature-img">
                    <Placeholder label={row.img} ratio="4 / 5" minH={420} />
                  </div>
                )}
                <div>
                  <Eyebrow>{row.eb}</Eyebrow>
                  <h3 style={{ ...serif, color: HEADING, fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.15, margin: "16px 0 20px" }}>
                    {row.h}
                  </h3>
                  <p style={{ ...sans, color: MUTED, fontSize: 16, lineHeight: 1.75, maxWidth: 520 }}>{row.p}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "grid", gap: 10 }}>
                    {row.bullets.map((b) => (
                      <li key={b} style={{ ...sans, color: CREAM, fontSize: 14, display: "flex", gap: 12 }}>
                        <span style={{ color: GOLD }}>—</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {row.cta && (
                    <div style={{ marginTop: 28 }}>
                      <PrimaryBtn as="a" href="#fit-wizard">Try the Fit Wizard</PrimaryBtn>
                    </div>
                  )}
                </div>
                {row.reverse && (
                  <div className="feature-img">
                    <Placeholder label={row.img} ratio="4 / 5" minH={420} />
                  </div>
                )}
              </div>
              {i < 3 && <SectionDivider />}
            </div>
          ))}
        </section>

        {/* SPEC GRID */}
        <section id="specs" className="shop-anchor" style={{ padding: "96px 0" }}>
          <div style={{ maxWidth: 720, marginBottom: 56 }}>
            <Eyebrow>The numbers</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(32px, 4vw, 48px)", margin: "16px 0 0" }}>
              Everything you'd measure, in one page.
            </h2>
          </div>
          <div
            className="spec-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0,1fr))",
              gap: 1,
              background: HAIR,
              border: `1px solid ${HAIR}`,
            }}
          >
            {[
              { n: "158", u: "mm", l: "Front width" },
              { n: "21", u: "mm", l: "Keyhole bridge" },
              { n: "150–172", u: "mm", l: "Bespoke range" },
              { n: "100%", u: "", l: "Mazzucchelli acetate" },
              { n: "2", u: "", l: "Shapes: 007 & 009" },
              { n: "IT", u: "", l: "Handmade in Italy" },
              { n: "30", u: "days", l: "Fit guarantee" },
              { n: "0", u: "€", l: "Worldwide shipping" },
            ].map((s) => (
              <div key={s.l} style={{ background: SURFACE, padding: "32px 24px" }}>
                <div style={{ ...serif, color: GOLD, fontSize: 44, lineHeight: 1, fontWeight: 400 }}>
                  {s.n}
                  {s.u && <span style={{ fontSize: 20, color: MUTED, marginLeft: 6 }}>{s.u}</span>}
                </div>
                <div style={{ ...sans, marginTop: 14, color: MUTED, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STAT + TESTIMONIAL */}
        <section style={{ padding: "0 0 96px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 24,
            }}
            className="feature-row"
          >
            {[
              { n: "94%", l: "of buyers say they finally fit *", q: "First frames in ten years that didn't leave a mark by 3pm.", a: "— M.R., 158 mm" },
              { n: "1,400+", l: "wide-face fittings shipped *", q: "The keyhole bridge is the detail nobody else gets right.", a: "— D.L., 162 mm" },
              { n: "4.9 / 5", l: "average across 300+ reviews *", q: "I stopped shopping the second I put on the 009.", a: "— A.K., 160 mm" },
            ].map((c) => (
              <div key={c.n} style={{ background: SURFACE, border: `1px solid ${HAIR}`, padding: 32 }}>
                <div style={{ ...serif, color: GOLD, fontSize: 44, lineHeight: 1 }}>{c.n}</div>
                <div style={{ ...sans, color: MUTED, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", marginTop: 8 }}>{c.l}</div>
                <p style={{ ...serif, fontSize: 20, color: CREAM, fontStyle: "italic", lineHeight: 1.5, marginTop: 24 }}>
                  "{c.q}"
                </p>
                <div style={{ ...sans, color: MUTED, fontSize: 12, marginTop: 8 }}>{c.a}</div>
              </div>
            ))}
          </div>
          <div style={{ ...sans, color: MUTED, fontSize: 11, marginTop: 16, opacity: 0.7 }}>
            * Placeholder data — replace with real Woolet numbers before publishing.
          </div>
        </section>

        <SectionDivider />

        {/* MODELS */}
        <section style={{ padding: "96px 0" }}>
          <div style={{ maxWidth: 780, marginBottom: 56 }}>
            <Eyebrow>The collection</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(32px, 4vw, 48px)", margin: "16px 0 16px" }}>
              Meet the 007 Round and the 009 Soft-square.
            </h2>
            <p style={{ ...sans, color: MUTED, fontSize: 16, lineHeight: 1.7 }}>
              Two shapes, one wide-face architecture. Both sized at 158 mm with a 21 mm keyhole.
            </p>
          </div>
          <div className="feature-row" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 32 }}>
            {[
              { name: "Woolet 007", sub: "Round", desc: "The considered round. Softened brow, keyhole bridge, 158 mm front." },
              { name: "Woolet 009", sub: "Soft-square", desc: "A relaxed square with a modern angle. Same 158 mm architecture." },
            ].map((m) => (
              <div key={m.name} style={{ background: SURFACE, border: `1px solid ${HAIR}` }}>
                <Placeholder label={`${m.name} — front on cream backdrop`} ratio="4 / 3" minH={320} />
                <div style={{ padding: 28 }}>
                  <Eyebrow>{m.sub}</Eyebrow>
                  <h3 style={{ ...serif, color: HEADING, fontSize: 30, margin: "10px 0 12px" }}>{m.name}</h3>
                  <p style={{ ...sans, color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{m.desc}</p>
                  <PrimaryBtn as="a" href="#buy">Shop {m.name.split(" ")[1]}</PrimaryBtn>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* COMPARE */}
        <section id="compare" className="shop-anchor" style={{ padding: "96px 0" }}>
          <div style={{ maxWidth: 780, marginBottom: 40 }}>
            <Eyebrow>Compare</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(32px, 4vw, 48px)", margin: "16px 0 0" }}>
              Woolet vs. the usual suspects.
            </h2>
          </div>
          <div style={{ overflowX: "auto", border: `1px solid ${HAIR}` }}>
            <table className="cmp-table" style={{ width: "100%", borderCollapse: "collapse", ...sans, fontSize: 14, color: CREAM, minWidth: 720 }}>
              <thead>
                <tr style={{ background: SURFACE }}>
                  <th style={{ padding: 16, textAlign: "left", ...sans, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, color: MUTED, fontWeight: 500 }}></th>
                  <th style={{ padding: 16, textAlign: "center", color: GOLD, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, borderLeft: `1px solid ${HAIR}` }}>Woolet</th>
                  <th style={{ padding: 16, textAlign: "center", color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, borderLeft: `1px solid ${HAIR}` }}>Persol / Tom Ford</th>
                  <th style={{ padding: 16, textAlign: "center", color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, borderLeft: `1px solid ${HAIR}` }}>Warby Parker</th>
                  <th style={{ padding: 16, textAlign: "center", color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, borderLeft: `1px solid ${HAIR}` }}>Ray-Ban Large</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Designed for 155 mm+ faces", "yes", "no", "no", "no"],
                  ["Front width", "158 mm", "~142 mm", "~144 mm", "~150 mm"],
                  ["Bespoke tier (150–172 mm)", "yes", "no", "no", "no"],
                  ["Italian Mazzucchelli acetate", "yes", "yes", "no", "sometimes"],
                  ["Hand-finished in Italy", "yes", "yes", "no", "no"],
                  ["AI at-home fit check", "yes", "no", "yes", "no"],
                  ["Fit guarantee (30 days)", "yes", "varies", "yes", "no"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${HAIR}` }}>
                    <td style={{ padding: 16, color: CREAM }}>{row[0]}</td>
                    {row.slice(1).map((v, j) => {
                      const mark = v === "yes" ? <span style={{ color: GOLD }}>✓</span> : v === "no" ? <span style={{ color: MUTED }}>✕</span> : <span style={{ color: CREAM }}>{v}</span>;
                      return (
                        <td key={j} style={{ padding: 16, textAlign: "center", borderLeft: `1px solid ${HAIR}`, background: j === 0 ? "rgba(202,164,73,0.04)" : "transparent" }}>
                          {mark}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...sans, color: MUTED, fontSize: 11, marginTop: 12, opacity: 0.7 }}>
            Competitor figures are approximate and illustrative, based on publicly listed collection specs.
          </div>
        </section>

        <SectionDivider />

        {/* REVIEWS */}
        <section id="reviews" className="shop-anchor" style={{ padding: "96px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 40 }}>
            <span style={{ color: GOLD, fontSize: 20, letterSpacing: 2 }}>★★★★★</span>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(28px, 3.4vw, 40px)", margin: 0 }}>
              Excellent · 5.0
            </h2>
          </div>
          <div className="feature-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 24 }}>
            {[
              { name: "Marco R.", w: "158 mm", q: "I stopped trying frames on in shops years ago. These are the first that don't pinch." },
              { name: "David L.", w: "162 mm", q: "Bought bespoke. Fit is perfect, and the acetate feels like something my grandfather would have owned." },
              { name: "Adam K.", w: "160 mm", q: "The 009 looks sharp and finally sits level. The keyhole bridge is a revelation." },
            ].map((r) => (
              <div key={r.name} style={{ background: SURFACE, border: `1px solid ${HAIR}`, padding: 28 }}>
                <div style={{ color: GOLD, fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ ...serif, fontSize: 20, color: CREAM, lineHeight: 1.55, marginTop: 16, fontStyle: "italic" }}>
                  "{r.q}"
                </p>
                <div style={{ ...sans, color: MUTED, fontSize: 12, marginTop: 20, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                  {r.name} · Verified buyer · {r.w}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BUY BOX */}
        <section style={{ padding: "0 0 96px" }}>
          <BuyBox />
        </section>

        {/* PRODUCT TABS */}
        <section style={{ padding: "0 0 96px" }}>
          <div style={{ maxWidth: 780, marginBottom: 32 }}>
            <Eyebrow>Details</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(28px, 3.4vw, 40px)", margin: "16px 0 0" }}>
              Specs, materials and fit — laid out plainly.
            </h2>
          </div>
          <ProductTabs />
        </section>

        {/* GUARANTEE BAND */}
        <section
          id="guarantee"
          className="shop-anchor"
          style={{
            background: "#0f0e0c",
            border: `1px solid ${HAIR}`,
            padding: "clamp(48px, 7vw, 96px)",
            textAlign: "center",
            margin: "0 0 96px",
          }}
        >
          <Eyebrow>The 30-day promise</Eyebrow>
          <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(32px, 4vw, 52px)", margin: "16px auto 20px", maxWidth: 820, lineHeight: 1.15 }}>
            Wear them for 30 days. If they don't fit, send them back.
          </h2>
          <p style={{ ...sans, color: MUTED, fontSize: 16, lineHeight: 1.75, maxWidth: 620, margin: "0 auto 36px" }}>
            Full refund, no re-stocking fee, no questions. We only make one thing — frames that fit
            wide faces — and we'd rather have your trust than a sale.
          </p>
          <PrimaryBtn as="a" href="#buy">Shop with confidence</PrimaryBtn>
        </section>

        {/* FAQ */}
        <section id="faq" className="shop-anchor" style={{ padding: "0 0 96px" }}>
          <div style={{ maxWidth: 780, marginBottom: 40 }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(32px, 4vw, 48px)", margin: "16px 0 0" }}>
              Questions we get before people buy.
            </h2>
          </div>
          <FaqAccordion />
        </section>

        {/* CLOSING CTA / FIT WIZARD */}
        <section
          id="fit-wizard"
          className="shop-anchor"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 64,
            alignItems: "center",
            padding: "96px 0 128px",
          }}
        >
          <div>
            <Eyebrow>Fit Wizard</Eyebrow>
            <h2 style={{ ...serif, color: HEADING, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, margin: "16px 0 20px" }}>
              Find out your size in 30 seconds.
            </h2>
            <p style={{ ...sans, color: MUTED, fontSize: 17, lineHeight: 1.75, maxWidth: 480, marginBottom: 32 }}>
              One front-on photo. We measure your face width and tell you whether the standard 007/009
              fits — or whether you need bespoke.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PrimaryBtn as="a" href="/en/fit">Launch Fit Wizard</PrimaryBtn>
              <GhostBtn href="#buy">Skip — shop frames</GhostBtn>
            </div>
          </div>
          <Placeholder label="Fit Wizard — face photo → standard vs bespoke result" ratio="4 / 5" minH={440} />
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${HAIR}`, padding: "64px 24px 32px", marginTop: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
            className="feature-row"
          >
            <div>
              <div style={{ ...serif, color: HEADING, fontSize: 30 }}>Woolet</div>
              <p style={{ ...sans, color: MUTED, fontSize: 13, lineHeight: 1.7, marginTop: 12, maxWidth: 320 }}>
                Italian Mazzucchelli acetate eyewear for wide faces. 155–172 mm. Handmade in the EU.
              </p>
            </div>
            {[
              { h: "Shop", links: ["007 Round", "009 Soft-square", "Bespoke", "Fit Wizard"] },
              { h: "Learn", links: ["The Fit", "Craftsmanship", "Compare", "Reviews"] },
              { h: "Support", links: ["30-day guarantee", "Shipping", "Contact", "FAQ"] },
            ].map((col) => (
              <div key={col.h}>
                <div style={{ ...sans, color: GOLD, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, marginBottom: 16 }}>
                  {col.h}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" style={{ ...sans, color: CREAM, fontSize: 13, textDecoration: "none", opacity: 0.85 }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: `1px solid ${HAIR}`,
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              ...sans,
              fontSize: 11,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            <span>© 2026 Woolet by JAY23 LLC</span>
            <span>Buffalo, Wyoming · Handmade in Italy</span>
          </div>
        </div>
      </footer>

      {/* Mobile sticky buy bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(8,8,7,0.96)",
          borderTop: `1px solid ${HAIR_STRONG}`,
          padding: "12px 16px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
        className="mobile-buybar"
      >
        <div style={{ ...serif, color: HEADING, fontSize: 18 }}>Woolet 007 / 009</div>
        <PrimaryBtn as="a" href="#buy">Shop Now</PrimaryBtn>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .mobile-buybar { display: flex !important; }
          main { padding-bottom: 80px !important; }
        }
      `}</style>
    </div>
  );
};

export default Shop;
