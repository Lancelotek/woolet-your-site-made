import { useState } from "react";
import { Link } from "react-router-dom";
import {
  lensOptions,
  defaultLensOptionId,
  formatPriceDelta,
  blueLightArticleLink,
  type LensOption,
} from "@/data/lensOptions";

const T = {
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  gold: "#CAA449",
  goldDim: "#8A6E2C",
  hair: "rgba(22,20,15,0.10)",
  surface: "#F8F6F1",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";

type Props = {
  /** "007" | "009" — used only for tracking / copy accents. */
  productId: string;
  /** The product's spec tuples, so widths are never hardcoded here. */
  specs: [string, string][];
  /** Frame price actually charged, e.g. "114". */
  framePrice: string;
};

/** Pull the first millimetre figure out of a spec value like "52 × 52 mm". */
function mm(specs: [string, string][], key: string): string | null {
  const row = specs.find(([k]) => k.toLowerCase() === key.toLowerCase());
  const match = row?.[1].match(/(\d+)/);
  return match ? match[1] : null;
}

const LensOptions = ({ productId, specs, framePrice }: Props) => {
  const [selected, setSelected] = useState<LensOption["id"]>(defaultLensOptionId);
  const active = lensOptions.find((o) => o.id === selected) ?? lensOptions[0];

  const frontWidth = mm(specs, "Frame Width");
  const lensWidth = mm(specs, "Lens");

  return (
    <section
      aria-labelledby="lens-options-heading"
      style={{ marginTop: 40, background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "26px 24px" }}
    >
      <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: T.goldDim, marginBottom: 10 }}>
        Lenses
      </div>
      <h3 id="lens-options-heading" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: "#1F1B16", margin: "0 0 18px", lineHeight: 1.15 }}>
        Lens options
      </h3>

      {/* Segmented selector */}
      <div role="radiogroup" aria-label="Lens options" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {lensOptions.map((o) => {
          const isActive = o.id === selected && !o.disabled;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-disabled={o.disabled || undefined}
              disabled={o.disabled}
              onClick={() => !o.disabled && setSelected(o.id)}
              style={{
                flex: "1 1 180px",
                textAlign: "left",
                cursor: o.disabled ? "not-allowed" : "pointer",
                background: isActive ? "rgba(202,164,73,0.12)" : "transparent",
                border: `1px solid ${isActive ? T.gold : T.hair}`,
                borderRadius: 2,
                padding: "12px 14px",
                opacity: o.disabled ? 0.55 : 1,
                fontFamily: SANS,
              }}
            >
              <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{o.label}</span>
              <span style={{ display: "block", marginTop: 4, fontSize: 12.5, color: o.disabled ? T.inkMute : T.goldDim, letterSpacing: "0.04em" }}>
                {o.disabled ? "Not yet available" : formatPriceDelta(o.priceDelta)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected option description + inline price */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: SANS, fontSize: 14, color: T.ink, fontWeight: 600 }}>
          ${framePrice}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: T.inkDim }}>
          frame · {formatPriceDelta(active.priceDelta).toLowerCase()} for {active.label.toLowerCase()}
        </span>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.inkDim, lineHeight: 1.6, margin: "8px 0 0" }}>
        {active.description}
        {active.href && (
          <>
            {" "}
            <Link to={active.href} style={{ color: T.goldDim, textUnderlineOffset: 3 }}>
              Start with your fit →
            </Link>
          </>
        )}
      </p>

      {/* Always-visible fit line, numbers pulled from product specs */}
      {frontWidth && lensWidth && (
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: T.ink, lineHeight: 1.6, margin: "16px 0 0" }}>
          Every Woolet lens is cut to a {frontWidth} mm front — Lens Width {lensWidth} mm ({productId}).
        </p>
      )}

      {/* Honest note */}
      <p style={{ fontFamily: SANS, fontSize: 13, color: T.goldDim, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 620 }}>
        A blue-light filter is a lens option, not a health claim. The research on eye strain and sleep is inconclusive. What we can guarantee is the fit.
      </p>

      {blueLightArticleLink.enabled && (
        <p style={{ margin: "14px 0 0" }}>
          <Link to={blueLightArticleLink.href} style={{ fontFamily: SANS, fontSize: 13.5, color: T.goldDim, textUnderlineOffset: 3 }}>
            {blueLightArticleLink.label} →
          </Link>
        </p>
      )}
    </section>
  );
};

export default LensOptions;
