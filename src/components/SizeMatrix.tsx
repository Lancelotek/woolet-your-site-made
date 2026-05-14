import { Link } from "react-router-dom";

/** Size matrix table — EN copy. Renders the 6 SKUs + bespoke per Brand v2. */
const ROWS: { sku: string; shape: string; width: string; bridge: string; lens: string; face: string; hero?: boolean; bespoke?: boolean }[] = [
  { sku: "007 · S", shape: "Round / Panto", width: "155 mm", bridge: "19 mm", lens: "50 × 50", face: "152–155 mm" },
  { sku: "007 · M", shape: "Round / Panto", width: "158 mm", bridge: "21 mm", lens: "52 × 52", face: "155–161 mm", hero: true },
  { sku: "007 · L", shape: "Round / Panto", width: "161 mm", bridge: "23 mm", lens: "54 × 54", face: "161–168 mm" },
  { sku: "009 · S", shape: "Soft Square", width: "155 mm", bridge: "19 mm", lens: "52 × 48", face: "152–155 mm" },
  { sku: "009 · M", shape: "Soft Square", width: "158 mm", bridge: "21 mm", lens: "54 × 50", face: "155–161 mm", hero: true },
  { sku: "009 · L", shape: "Soft Square", width: "161 mm", bridge: "23 mm", lens: "56 × 52", face: "161–168 mm" },
  { sku: "Bespoke", shape: "Either", width: "150–172 mm", bridge: "16–26 mm", lens: "Custom", face: "Any 150 mm+", bespoke: true },
];

const SizeMatrix = ({ fitHref = "/en/fit", semantic = true }: { fitHref?: string; semantic?: boolean }) => {
  const HeadingTag = semantic ? "h2" : "div";
  return (
    <section
      id={semantic ? "size-matrix" : undefined}
      className="relative z-[2] w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
      style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">THE FIT MATRIX</span>
        </div>
        <HeadingTag className="font-display text-woolet-white leading-tight mb-4" style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 300 }} aria-hidden={!semantic || undefined}>
          Two shapes. <em className="italic text-gold-light">Three sizes.</em> One bespoke.
        </HeadingTag>
        <p className="text-cream-dim leading-relaxed tracking-wider max-w-2xl mb-10" style={{ fontSize: "0.95rem" }}>
          Every frame measured against your AI scan. If you fall outside the six standard fits,
          bespoke covers <span className="text-foreground">150 to 172 mm</span> with a <span className="text-foreground">16–26 mm bridge</span> — made to your scan.
        </p>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div
            className="grid items-center px-5 py-3 uppercase tracking-[0.2em]"
            style={{
              gridTemplateColumns: "1.1fr 1.4fr 1fr 0.9fr 0.9fr 1.1fr",
              fontSize: "0.55rem",
              color: "hsl(var(--gold-dim))",
              borderBottom: "1px solid hsl(var(--gold) / 0.25)",
            }}
          >
            <span>SKU</span>
            <span>Shape</span>
            <span>Frame width</span>
            <span>Bridge</span>
            <span>Lens</span>
            <span>Target face</span>
          </div>
          {ROWS.map((r) => (
            <div
              key={r.sku}
              className="grid items-center px-5 py-4 transition-colors"
              style={{
                gridTemplateColumns: "1.1fr 1.4fr 1fr 0.9fr 0.9fr 1.1fr",
                borderBottom: "1px solid hsl(0 0% 100% / 0.055)",
                background: r.hero ? "hsl(var(--gold) / 0.05)" : r.bespoke ? "hsl(var(--gold) / 0.025)" : "transparent",
              }}
            >
              <span className="font-display flex items-center gap-2" style={{ fontSize: "1rem", color: "hsl(var(--gold))" }}>
                {r.sku}
                {r.hero && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontSize: "0.5rem",
                      background: "hsl(var(--gold))",
                      color: "hsl(var(--background))",
                      padding: "2px 6px",
                      fontFamily: "Barlow, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    HERO
                  </span>
                )}
                {r.bespoke && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontSize: "0.5rem",
                      border: "1px solid hsl(var(--gold) / 0.5)",
                      color: "hsl(var(--gold-light))",
                      padding: "2px 6px",
                      fontFamily: "Barlow, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    CUSTOM
                  </span>
                )}
              </span>
              <span className="text-cream-dim" style={{ fontSize: "0.85rem" }}>{r.shape}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.width}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.bridge}</span>
              <span className="text-cream-dim" style={{ fontSize: "0.85rem" }}>{r.lens}</span>
              <span className="text-cream-dim" style={{ fontSize: "0.8rem" }}>{r.face}</span>
            </div>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden flex flex-col gap-3">
          {ROWS.map((r) => (
            <div
              key={r.sku}
              className="p-4"
              style={{
                border: r.hero
                  ? "1px solid hsl(var(--gold) / 0.5)"
                  : "1px solid hsl(0 0% 100% / 0.08)",
                background: r.hero ? "hsl(var(--gold) / 0.05)" : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display" style={{ fontSize: "1.15rem", color: "hsl(var(--gold))" }}>{r.sku}</span>
                {r.hero && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{ fontSize: "0.5rem", background: "hsl(var(--gold))", color: "hsl(var(--background))", padding: "2px 6px", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                  >HERO</span>
                )}
                {r.bespoke && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{ fontSize: "0.5rem", border: "1px solid hsl(var(--gold) / 0.5)", color: "hsl(var(--gold-light))", padding: "2px 6px", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                  >CUSTOM</span>
                )}
              </div>
              <div className="text-cream-dim mb-3" style={{ fontSize: "0.78rem" }}>{r.shape}</div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4" style={{ fontSize: "0.75rem" }}>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>Width</span><div className="text-foreground">{r.width}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>Bridge</span><div className="text-foreground">{r.bridge}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>Lens</span><div className="text-foreground">{r.lens}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.55rem" }}>Face</span><div className="text-foreground">{r.face}</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex">
          <Link
            to={fitHref}
            className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
            style={{
              background: "hsl(var(--gold))",
              color: "hsl(var(--background))",
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.7rem",
              padding: "16px 28px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
          >
            Scan your face · Reserve for $1
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SizeMatrix;
