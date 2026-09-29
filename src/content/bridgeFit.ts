import gapOriginal from "@/assets/bridge/woolet-bridge-gap-annotated-1600.jpg.asset.json";
import gapWebp from "@/assets/bridge/woolet-bridge-gap-annotated-1600.webp.asset.json";
import narrowOriginal from "@/assets/bridge/woolet-bridge-19mm-too-narrow-980.png.asset.json";
import narrowWebp from "@/assets/bridge/woolet-bridge-19mm-too-narrow-980.webp.asset.json";
import keyholeOriginal from "@/assets/bridge/woolet-bridge-keyhole-fit-980.png.asset.json";
import keyholeWebp from "@/assets/bridge/woolet-bridge-keyhole-fit-980.webp.asset.json";

export const bridgeFitImages = {
  gap: { original: gapOriginal.url, webp: gapWebp.url, width: 1600, height: 687, alt: "Close-up of wide-face glasses with a 19 mm bridge: a visible gap between the bridge and the nose, and the top rim sitting on the eyebrow line" },
  narrow: { original: narrowOriginal.url, webp: narrowWebp.url, width: 980, height: 540, alt: "Diagram: a 19 mm bridge touches a wider nose at two points, leaves a gap and lifts the frame into the eyebrows" },
  keyhole: { original: keyholeOriginal.url, webp: keyholeWebp.url, width: 980, height: 540, alt: "Diagram: the Woolet keyhole bridge rests along the sides of a wide nose bridge, keeping the eyes centred in the lenses and the eyebrows clear" },
};

export const BRIDGE_FIT_FAQ = [
  { q: "Should glasses cover your eyebrows?", a: "No. The top rim should sit at or just below your brow line. When your glasses cover your eyebrows, the bridge is usually too narrow for your nose: the frame rests on two points high on the nose, so the whole front lifts. A bridge that matches your nose, like Woolet's 21-22 mm keyhole bridge, lets the frame sit lower with your eyes centred in the lenses." },
  { q: "Why do my glasses sit high on my nose?", a: "The bridge is narrower than your nose. Instead of resting along the sides of the nose, the frame touches at two pinch points and leaves a gap above them. Measure your bridge width (FitLens does it in 20 seconds) and pick a frame with a matching bridge." },
  { q: "What bridge width do I need for a wide nose?", a: "Most standard frames use a 16-19 mm bridge. A wide nose usually needs 21 mm or more. Woolet frames use a 21-22 mm keyhole bridge, and Bespoke frames are cut to your measured bridge." },
];

export const BRIDGE_FIT_INTRO = "Face width is only half the fit. When the bridge is narrower than your nose, the frame can't sit down. It rests on two pinch points, leaves a gap above them and lifts the top rim into your eyebrows.";
export const BRIDGE_FIT_LEGEND = [
  { number: "1", title: "Gap under the bridge", text: "The bridge arches over the nose, not onto it." },
  { number: "2", title: "Frame rides up", text: "The top rim lands on the brow line." },
];
export const BRIDGE_FIT_CARDS = [
  { image: bridgeFitImages.narrow, title: "19 mm bridge", subtitle: "too narrow for a wider nose", bullets: ["Touches at two pinch points", "Gap above them", "Frame lifts into the brows"] },
  { image: bridgeFitImages.keyhole, title: "Woolet keyhole bridge", subtitle: "21-22 mm, built for wider noses", bullets: ["Rests along the whole flank", "No gap, no pressure points", "Eyes centred, brows clear"] },
];

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const picture = (image: typeof bridgeFitImages.gap) => `<picture><source srcset="${image.webp}" type="image/webp"><img src="${image.original}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy"></picture>`;

/** Same copy and image sources as the React component; supplied to the static no-JS prerender. */
export function bridgeFitPrerenderHtml(variant: "full" | "compact" = "full", hideButton = false): string {
  return `<section aria-label="The nose bridge">${variant === "full" ? `<p>THE NOSE BRIDGE</p>` : ""}<h2>Wide enough frame. Wrong bridge.</h2>${variant === "full" ? `<p>${escape(BRIDGE_FIT_INTRO)}</p>` : ""}
<figure>${picture(bridgeFitImages.gap)}<figcaption><ol>${BRIDGE_FIT_LEGEND.map((item) => `<li><strong>${item.number} · ${escape(item.title)}</strong> - ${escape(item.text)}</li>`).join("")}</ol></figcaption></figure>
<div>${BRIDGE_FIT_CARDS.map((card) => `<section>${picture(card.image)}<h3>${escape(card.title)}</h3><p>${escape(card.subtitle)}</p><ul>${card.bullets.map((bullet) => `<li>${escape(bullet)}</li>`).join("")}</ul></section>`).join("")}</div>
${variant === "full" ? `<p>Width is not only temple to temple. FitLens measures your bridge too.</p>${hideButton ? "" : `<a href="/en/fit">Scan your fit</a>`}` : ""}</section>`;
}

export const BRIDGE_BLOG_INTRO_START = "<p>If you're looking for glasses for wide nose bridge fit";
export function insertBridgeAfterBlogIntro(html: string): string {
  const start = html.indexOf(BRIDGE_BLOG_INTRO_START);
  if (start < 0) return html;
  const end = html.indexOf("</p>", start);
  return end < 0 ? html : `${html.slice(0, end + 4)}${bridgeFitPrerenderHtml()}${html.slice(end + 4)}`;
}