import { Link } from "react-router-dom";
import { t, type Lang } from "@/lib/i18n";

/** Size matrix — three stock widths (155 / 158 / 161 mm) with a 21–22 mm keyhole bridge for both shapes + bespoke (145–162 mm). */
type Row = {
  sku: string;
  shapeKey: string;
  width: string;
  bridge: string;
  lens: string;
  face: string;
  bespoke?: boolean;
};

const SizeMatrix = ({
  fitHref = "/en/fit",
  bespokeHref = "/en/bespoke",
  semantic = true,
  sectionId,
  lang = "en",
  showCta = true,
}: {
  fitHref?: string;
  bespokeHref?: string;
  semantic?: boolean;
  sectionId?: string;
  lang?: Lang;
  showCta?: boolean;
}) => {
  const HeadingTag = semantic ? "h2" : "div";

  const rows: Row[] = [
    { sku: "Woolet 007", shapeKey: "matrix.shape_round", width: "155 / 158 / 161 mm", bridge: "21 mm", lens: "52 x 52", face: "~155–161 mm" },
    { sku: "Woolet 009", shapeKey: "matrix.shape_square", width: "155 / 158 / 161 mm", bridge: "22 mm", lens: "54 x 50", face: "~155–161 mm" },
    { sku: t(lang, "matrix.sku_bespoke"), shapeKey: "matrix.shape_either", width: "145–162 mm", bridge: "16–24 mm", lens: t(lang, "matrix.lens_custom"), face: "<155 or >161 mm", bespoke: true },
  ];

  return (
    <section
      id={sectionId ?? "size-matrix"}
      className="relative z-[2] w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
      style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">{t(lang, "matrix.eyebrow")}</span>
        </div>
        <HeadingTag className="font-display text-woolet-white leading-tight mb-4" style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 300 }} aria-hidden={!semantic || undefined}>
          {t(lang, "matrix.h2_pre")}<em className="italic text-gold-light">{t(lang, "matrix.h2_em")}</em>{t(lang, "matrix.h2_post")}
        </HeadingTag>
        <p className="text-cream-dim leading-relaxed tracking-wider max-w-2xl mb-10" style={{ fontSize: "0.95rem" }}>
          {t(lang, "matrix.intro_1")}<span className="text-foreground">{t(lang, "matrix.intro_b1")}</span>{t(lang, "matrix.intro_2")}<span className="text-foreground">{t(lang, "matrix.intro_b2")}</span>{t(lang, "matrix.intro_3")}<span className="text-foreground">{t(lang, "matrix.intro_b3")}</span>{t(lang, "matrix.intro_4")}
        </p>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div
            className="grid items-center px-5 py-3 uppercase tracking-[0.2em]"
            style={{
              gridTemplateColumns: "1.3fr 1.4fr 1fr 0.9fr 0.9fr 1.1fr",
              fontSize: "0.72rem",
              color: "hsl(var(--gold-dim))",
              borderBottom: "1px solid hsl(var(--gold) / 0.25)",
            }}
          >
            <span>{t(lang, "matrix.col_model")}</span>
            <span>{t(lang, "matrix.col_shape")}</span>
            <span>{t(lang, "matrix.col_width")}</span>
            <span>{t(lang, "matrix.col_bridge")}</span>
            <span>{t(lang, "matrix.col_lens")}</span>
            <span>{t(lang, "matrix.col_face")}</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.sku}
              className="grid items-center px-5 py-4 transition-colors"
              style={{
                gridTemplateColumns: "1.3fr 1.4fr 1fr 0.9fr 0.9fr 1.1fr",
                borderBottom: "1px solid hsl(0 0% 100% / 0.055)",
                background: r.bespoke ? "hsl(var(--gold) / 0.025)" : "transparent",
              }}
            >
              <span className="font-display flex items-center gap-2" style={{ fontSize: "1rem", color: "hsl(var(--gold))" }}>
                {r.bespoke ? <Link to={bespokeHref} className="hover:underline">{r.sku}</Link> : r.sku}
                {r.bespoke && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontSize: "0.65rem",
                      border: "1px solid hsl(var(--gold) / 0.5)",
                      color: "hsl(var(--gold-light))",
                      padding: "2px 6px",
                      fontFamily: "Barlow, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {t(lang, "matrix.custom_badge")}
                  </span>
                )}
              </span>
              <span className="text-cream-dim" style={{ fontSize: "0.85rem" }}>{t(lang, r.shapeKey)}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.width}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.bridge}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.lens}</span>
              <span className="text-foreground" style={{ fontSize: "0.85rem" }}>{r.face}</span>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid gap-3">
          {rows.map((r) => (
            <div
              key={r.sku}
              className="p-4"
              style={{
                border: "1px solid hsl(0 0% 100% / 0.08)",
                background: r.bespoke ? "hsl(var(--gold) / 0.03)" : "transparent",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display" style={{ fontSize: "1.15rem", color: "hsl(var(--gold))" }}>{r.bespoke ? <Link to={bespokeHref} className="hover:underline">{r.sku}</Link> : r.sku}</span>
                {r.bespoke && (
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{ fontSize: "0.65rem", border: "1px solid hsl(var(--gold) / 0.5)", color: "hsl(var(--gold-light))", padding: "2px 6px", fontFamily: "Barlow, sans-serif", fontWeight: 500 }}
                  >{t(lang, "matrix.custom_badge")}</span>
                )}
              </div>
              <div className="text-cream-dim mb-3" style={{ fontSize: "0.85rem" }}>{t(lang, r.shapeKey)}</div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4" style={{ fontSize: "0.82rem" }}>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>{t(lang, "matrix.m_width")}</span><div className="text-foreground">{r.width}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>{t(lang, "matrix.m_bridge")}</span><div className="text-foreground">{r.bridge}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>{t(lang, "matrix.m_lens")}</span><div className="text-foreground">{r.lens}</div></div>
                <div><span className="text-cream-dim uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>{t(lang, "matrix.m_face")}</span><div className="text-foreground">{r.face}</div></div>
              </div>
            </div>
          ))}
        </div>

        {showCta && (
          <div className="mt-12 flex flex-col gap-2">
            <Link
              to={`/${lang}/lp/kickstarter`}
              className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all self-start"
              style={{
                background: "hsl(var(--gold))",
                color: "hsl(var(--background))",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                fontSize: "0.82rem",
                padding: "18px 32px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--gold-light))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--gold))")}
            >
              Join the waitlist — save 40%
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default SizeMatrix;
