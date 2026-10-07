import imageData from "@/data/optimized-images.json";

type OptimizedImage = { width: number; height: number; variants: Record<string, string> };
const images: Record<string, OptimizedImage> = imageData;

/** CDN derivatives preserve the original framing; originals remain available for zoom. */
export function optimizedImage(src: string): OptimizedImage | undefined {
  if (images[src]) return images[src];
  const filename = src.split("/").pop()?.split("?")[0];
  if (!filename) return undefined;
  return Object.entries(images).find(([key]) => {
    const original = key.split("/").pop();
    if (original === filename) return true;
    // Vite fingerprints imported local photography in production.
    const stem = original?.replace(/\.[^.]+$/, "");
    return stem ? filename.startsWith(`${stem}-`) : false;
  })?.[1];
}

export function imageVariant(src: string, width = 800): string {
  return optimizedImage(src)?.variants[String(width)] ?? src;
}

export function imageSrcSet(src: string, widths = [480, 800, 1200]): string | undefined {
  const image = optimizedImage(src);
  if (!image) return undefined;
  return widths.filter((width) => image.variants[String(width)])
    .map((width) => `${image.variants[String(width)]} ${width}w`).join(", ");
}