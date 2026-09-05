import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { clarityEvent, claritySet } from "@/lib/clarity";
import { pushGtmEvent } from "@/lib/gtm";

export type FrameColour = {
  /** URL slug, e.g. "havana" */
  id: string;
  /** Canonical display name, e.g. "Honey tortoise" */
  name: string;
  /** Swatch dot colour */
  dot: string;
  /** Image URL — null when the shot doesn't exist yet */
  img: string | null;
};

const T = {
  ink: "#16140f",
  inkDim: "#5b554a",
  inkMute: "#8a8275",
  gold: "#CAA449",
  hair: "rgba(22,20,15,0.10)",
  hairStrong: "rgba(22,20,15,0.18)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

export function useColourGallery(model: string, colours: FrameColour[]) {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get("colour");
  const initial = colours.findIndex((c) => c.id === fromUrl);
  const [index, setIndex] = useState(initial >= 0 ? initial : 0);
  const first = useRef(true);

  // keep state in sync when the URL changes (back/forward, shared link)
  useEffect(() => {
    const i = colours.findIndex((c) => c.id === fromUrl);
    if (i >= 0) setIndex(i);
  }, [fromUrl, colours]);

  // preload the remaining shots after load so switching is instant
  useEffect(() => {
    const preload = () => {
      colours.forEach((c, i) => {
        if (!c.img || i === index) return;
        const img = new Image();
        img.decoding = "async";
        img.src = c.img;
      });
    };
    if (document.readyState === "complete") {
      const t = window.setTimeout(preload, 120);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", preload, { once: true });
    return () => window.removeEventListener("load", preload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colours]);

  const select = useCallback(
    (i: number) => {
      if (i === index) return;
      setIndex(i);
      const c = colours[i];
      const next = new URLSearchParams(params);
      next.set("colour", c.id);
      setParams(next, { replace: true });
      claritySet("pdp_colour", `${model}:${c.name}`);
      clarityEvent("pdp_swatch_click");
      pushGtmEvent("pdp_swatch_click", { product_id: model, colour: c.name, colour_id: c.id });
    },
    [index, colours, params, setParams, model],
  );

  useEffect(() => {
    first.current = false;
  }, []);

  return { colours, index, active: colours[index], select };
}

export function ColourHero({
  colour,
  alt,
  eager = true,
}: {
  colour: FrameColour;
  alt: string;
  eager?: boolean;
}) {
  return (
    <div>
      <div
        className="pdp-hero-wrap"
        style={{
          background: "#f3ece0",
          border: `1px solid ${T.hair}`,
          borderRadius: 4,
          padding: "48px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "4 / 3",
        }}
      >
        {colour.img ? (
          <img
            className="pdp-hero-img"
            key={colour.id}
            src={colour.img}
            alt={alt}
            width={800}
            height={600}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            decoding="async"
            style={{ width: "100%", maxWidth: 560, height: "auto", objectFit: "contain", display: "block" }}
          />
        ) : (
          <div
            role="img"
            aria-label={`${colour.name} — photo coming soon`}
            style={{
              width: "100%",
              maxWidth: 560,
              aspectRatio: "4 / 3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px dashed ${T.hairStrong}`,
              borderRadius: 3,
              fontFamily: SANS,
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: T.inkMute,
              textAlign: "center",
              padding: 16,
            }}
          >
            Photo coming soon
          </div>
        )}
      </div>
      <div
        aria-live="polite"
        style={{ marginTop: 12, fontFamily: SANS, fontSize: 13.5, color: T.ink, letterSpacing: "0.02em" }}
      >
        <span style={{ color: T.inkMute }}>Colour: </span>
        <strong style={{ fontWeight: 600 }}>{colour.name}</strong>
      </div>
    </div>
  );
}

export function ColourSwatches({
  colours,
  index,
  onSelect,
  label = "Launch colours",
  note = "Pick yours after the campaign",
  previews,
  previewAlt,
}: {
  colours: FrameColour[];
  index: number;
  onSelect: (i: number) => void;
  label?: string;
  note?: string;
  /** Optional square on-face preview per colour id */
  previews?: Record<string, string>;
  previewAlt?: (colour: FrameColour) => string;
}) {
  const ids = useMemo(() => colours.map((c) => c.id).join("|"), [colours]);
  return (
    <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.hair}` }}>
      <style>{`
        .wl-swatch { background:none; border:none; padding:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .wl-swatch:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 4px; border-radius: 6px; }
        .wl-swatch .wl-dot { transition: transform 120ms ease, box-shadow 120ms ease; }
        .wl-swatch:hover .wl-dot { transform: translateY(-2px); }
      `}</style>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: T.inkMute,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <div role="group" aria-label={label} data-colours={ids} style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        {colours.map((c, i) => {
          const activeState = i === index;
          return (
            <button
              key={c.id}
              type="button"
              className="wl-swatch"
              aria-pressed={activeState}
              aria-label={`Show ${c.name}`}
              onClick={() => onSelect(i)}
            >
              {previews?.[c.id] ? (
                <img
                  className="wl-dot"
                  src={previews[c.id]}
                  alt={previewAlt ? previewAlt(c) : `${c.name} worn on a 158 mm wide face`}
                  width={1200}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: "cover",
                    borderRadius: 3,
                    boxShadow: activeState
                      ? `0 0 0 1px #f3ece0, 0 0 0 2px ${T.gold}`
                      : `0 0 0 1px ${T.hairStrong}`,
                  }}
                />
              ) : (
                <span
                  aria-hidden
                  className="wl-dot"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: c.dot,
                    boxShadow: activeState
                      ? `0 0 0 1px #f3ece0, 0 0 0 3px ${T.gold}`
                      : `0 0 0 1px ${T.hairStrong}`,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: activeState ? T.ink : T.inkDim,
                  fontWeight: activeState ? 600 : 400,
                }}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 12, color: T.inkMute, lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}
