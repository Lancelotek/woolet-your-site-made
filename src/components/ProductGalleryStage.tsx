import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaFor, type ProductId } from "@/data/product-media";
import { clarityEvent } from "@/lib/clarity";
import { pushGtmEvent } from "@/lib/gtm";

const T = {
  ink: "#16140f",
  inkMute: "#8a8275",
  gold: "#CAA449",
  hair: "rgba(22,20,15,0.10)",
};
const SANS = "'Barlow', 'Inter', -apple-system, sans-serif";

type Props = {
  model: ProductId;
  colourId: string;
  colourName: string;
};

/** PDP gallery: packshot of the active colour + on-face, detail and scale shots. */
const ProductGalleryStage = ({ model, colourId, colourName }: Props) => {
  const items = useMemo(() => mediaFor(model, colourId, colourName), [model, colourId, colourName]);
  const [idx, setIdx] = useState(0);
  const prevColour = useRef(colourId);

  // switching colour always returns to that colour's packshot
  useEffect(() => {
    if (prevColour.current !== colourId) {
      prevColour.current = colourId;
      setIdx(0);
    }
  }, [colourId]);

  // preload the rest of the set once the page has settled
  useEffect(() => {
    const preload = () => {
      items.forEach((m, i) => {
        if (i === 0) return;
        const img = new Image();
        img.decoding = "async";
        img.src = m.src;
      });
    };
    const t = window.setTimeout(preload, 200);
    return () => window.clearTimeout(t);
  }, [items]);

  const go = (next: number, source: "arrow" | "thumb") => {
    const n = (next + items.length) % items.length;
    if (n === idx) return;
    setIdx(n);
    clarityEvent("pdp_gallery_view");
    pushGtmEvent("pdp_gallery_view", {
      product_id: model,
      media_kind: items[n].kind,
      media_id: items[n].id,
      source,
    });
  };

  const active = items[idx];

  return (
    <div>
      <style>{`
        .wl-gal-arrow { position:absolute; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50%;
          background:rgba(255,255,255,0.86); border:1px solid ${T.hair}; color:${T.ink}; display:flex; align-items:center;
          justify-content:center; cursor:pointer; transition:background 120ms ease, transform 120ms ease; }
        .wl-gal-arrow:hover { background:#fff; }
        .wl-gal-arrow:focus-visible { outline:2px solid ${T.gold}; outline-offset:2px; }
        .wl-gal-thumb { position:relative; aspect-ratio:1/1; overflow:hidden; border-radius:3px; background:#f3ece0;
          border:1px solid ${T.hair}; padding:0; cursor:pointer; transition:border-color 120ms ease; }
        .wl-gal-thumb:hover { border-color:rgba(22,20,15,0.35); }
        .wl-gal-thumb:focus-visible { outline:2px solid ${T.gold}; outline-offset:2px; }
        .wl-gal-thumb[aria-current="true"] { border-color:${T.gold}; box-shadow:0 0 0 1px ${T.gold}; }
      `}</style>

      <div
        className="pdp-hero-wrap"
        style={{
          position: "relative",
          background: "#f3ece0",
          border: `1px solid ${T.hair}`,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          padding: active.cover ? 0 : "48px 40px",
        }}
      >
        <img
          className="pdp-hero-img"
          key={active.src}
          src={active.src}
          alt={active.alt}
          width={800}
          height={600}
          loading={idx === 0 ? "eager" : "lazy"}
          fetchPriority={idx === 0 ? "high" : "auto"}
          decoding="async"
          style={{
            width: "100%",
            height: active.cover ? "100%" : "auto",
            maxWidth: active.cover ? "none" : 560,
            objectFit: active.cover ? "cover" : "contain",
            display: "block",
          }}
        />

        {items.length > 1 && (
          <>
            <button
              type="button"
              className="wl-gal-arrow"
              style={{ left: 12 }}
              aria-label="Previous photo"
              onClick={() => go(idx - 1, "arrow")}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="wl-gal-arrow"
              style={{ right: 12 }}
              aria-label="Next photo"
              onClick={() => go(idx + 1, "arrow")}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <div
        aria-live="polite"
        style={{ marginTop: 12, fontFamily: SANS, fontSize: 13.5, color: T.ink, letterSpacing: "0.02em" }}
      >
        {active.caption}
      </div>

      {items.length > 1 && (
        <div
          role="group"
          aria-label={`Woolet ${model} photos`}
          style={{ marginTop: 12, display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0,1fr))`, gap: 8 }}
        >
          {items.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className="wl-gal-thumb"
              aria-current={i === idx}
              aria-label={`Show photo ${i + 1} of ${items.length} — ${m.caption}`}
              onClick={() => go(i, "thumb")}
            >
              <img
                src={m.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: m.kind === "scale" ? "contain" : "cover" }}
              />
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 11.5, color: T.inkMute }}>
        {idx + 1} / {items.length} · {colourName}
      </div>
    </div>
  );
};

export default ProductGalleryStage;
