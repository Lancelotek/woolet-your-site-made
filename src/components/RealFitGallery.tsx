import { useEffect, useState } from "react";
import { onFaceFor, type OnFaceModel } from "@/data/on-face-photos";

const T = {
  ink: "#1F1B16",
  inkMute: "#8a8275",
  gold: "#CAA449",
  surface: "#F8F6F1",
  hair: "rgba(31,27,22,0.10)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

type Props = {
  model: OnFaceModel;
  colourId: string;
  colourName: string;
};

/** "Real fit" block - on-face photos of the currently selected acetate colour. */
const RealFitGallery = ({ model, colourId, colourName }: Props) => {
  const photos = onFaceFor(model, colourId);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [colourId]);

  if (photos.length === 0) return null;
  const active = photos[Math.min(idx, photos.length - 1)];

  return (
    <section
      style={{
        marginTop: 48,
        background: T.surface,
        border: `1px solid ${T.hair}`,
        borderRadius: 4,
        padding: 24,
      }}
    >
      <style>{`
        .wl-rf-thumb { position:relative; aspect-ratio:1/1; overflow:hidden; border-radius:3px; background:#efe9df;
          border:1px solid ${T.hair}; padding:0; cursor:pointer; transition:border-color 120ms ease; }
        .wl-rf-thumb:hover { border-color:rgba(31,27,22,0.35); }
        .wl-rf-thumb:focus-visible { outline:2px solid ${T.gold}; outline-offset:2px; }
        .wl-rf-thumb[aria-current="true"] { border-color:${T.gold}; box-shadow:0 0 0 1px ${T.gold}; }
      `}</style>

      <div
        style={{
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: T.gold,
          marginBottom: 14,
        }}
      >
        Real fit - worn at 158 mm
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1fr)" }}>
        <img
          key={active.portrait}
          src={active.portrait}
          alt={active.alt}
          width={1500}
          height={2000}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            maxWidth: 420,
            height: "auto",
            display: "block",
            borderRadius: 3,
            border: `1px solid ${T.hair}`,
          }}
        />

        {photos.length > 1 && (
          <div
            role="group"
            aria-label={`Woolet ${model} ${colourName} on-face photos`}
            style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(photos.length, 6)}, minmax(0,1fr))`, gap: 8, maxWidth: 420 }}
          >
            {photos.map((p, i) => (
              <button
                key={p.name}
                type="button"
                className="wl-rf-thumb"
                aria-current={i === idx}
                aria-label={`Show ${p.view}`}
                onClick={() => setIdx(i)}
              >
                <img
                  src={p.square}
                  alt=""
                  width={1200}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 13, color: T.ink, lineHeight: 1.55 }}>
        Founder, 158 mm face. No retouching, no model.
      </div>
      <div style={{ marginTop: 4, fontFamily: SANS, fontSize: 12, color: T.inkMute }}>
        {colourName} - {active.view}
      </div>
    </section>
  );
};

export default RealFitGallery;
