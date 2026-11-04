import { useEffect, useRef, useState } from "react";

/**
 * Shows an AI render so the glasses always fill the frame at the same scale.
 *
 * The image model returns landscape, square or portrait files with the pair
 * anywhere from small to large. On load we find the pair's bounding box on a
 * small canvas (renders are served with CORS *), then position the full image
 * so that box fills `fill` of the frame width, centred. If the canvas is not
 * readable the image falls back to plain object-contain.
 */
type Box = { x: number; y: number; w: number; h: number; bg: string };

const boxCache = new Map<string, Box | null>();

function measure(img: HTMLImageElement): Box | null {
  const W = 240;
  const scale = W / img.naturalWidth;
  const H = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, W, H);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, W, H).data;
  } catch {
    return null; // tainted canvas
  }
  // Background = average of the four corner patches.
  let r = 0, g = 0, b = 0, n = 0;
  for (const [cx, cy] of [[0, 0], [W - 6, 0], [0, H - 6], [W - 6, H - 6]]) {
    for (let y = cy; y < cy + 6; y++) for (let x = cx; x < cx + 6; x++) {
      const i = (y * W + x) * 4;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  r /= n; g /= n; b /= n;
  // Pixels clearly different from the backdrop belong to the frame; soft
  // shadows and paper gradients stay under the threshold.
  const T = 70;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const d = Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b);
      if (d > T) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0 || x1 - x0 < W * 0.15) return null;
  return {
    x: x0 / W, y: y0 / H, w: (x1 - x0 + 1) / W, h: (y1 - y0 + 1) / H,
    bg: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
  };
}

export default function FramedRender({
  src,
  alt,
  aspect = 16 / 10,
  fill = 0.86,
  maxFillH = 0.84,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  /** Frame width / height, or "fill" to take the parent's size and shape. */
  aspect?: number | "fill";
  /** Share of the frame width the pair occupies. */
  fill?: number;
  /** Cap on the share of the frame height the pair occupies. */
  maxFillH?: number;
  className?: string;
  imgClassName?: string;
}) {
  const [box, setBox] = useState<Box | null | undefined>(() => boxCache.get(src));
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(16 / 10);
  useEffect(() => {
    if (aspect !== "fill" || !wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth && el.clientHeight) setMeasured(el.clientWidth / el.clientHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);
  const ratio = aspect === "fill" ? measured : aspect;

  useEffect(() => {
    setBox(boxCache.get(src));
  }, [src]);

  const onLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    if (boxCache.has(src)) { setBox(boxCache.get(src)); return; }
    const b = measure(img);
    boxCache.set(src, b);
    setBox(b);
  };

  // Image size in frame units (frame width = 1, frame height = 1 / aspect).
  let style: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" };
  if (box && natural) {
    const imgAspect = natural.w / natural.h;
    const boxW = box.w;                 // in image-width units
    const boxH = box.h / imgAspect;     // in image-width units
    // Scale so the pair fills `fill` of the width, unless that breaks the height cap.
    let s = fill / boxW;
    const frameH = 1 / ratio;
    if (boxH * s > maxFillH * frameH) s = (maxFillH * frameH) / boxH;
    const imgW = s;                     // frame widths
    const imgH = s / imgAspect;         // frame widths
    const left = 0.5 - (box.x + box.w / 2) * imgW;
    const top = frameH / 2 - (box.y + box.h / 2) * imgH;
    style = {
      position: "absolute",
      width: `${imgW * 100}%`,
      height: "auto",
      left: `${left * 100}%`,
      top: `${(top / frameH) * 100}%`,
      maxWidth: "none",
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={aspect === "fill"
        ? { position: "absolute", inset: 0, background: box?.bg ?? "#EFE9DF" }
        : { aspectRatio: String(aspect), background: box?.bg ?? "#EFE9DF" }}
    >
      <img
        key={src}
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        decoding="async"
        onLoad={onLoad}
        className={imgClassName}
        style={{ ...style, opacity: box === undefined && !natural ? 0 : 1, transition: "opacity .25s ease" }}
      />
    </div>
  );
}
