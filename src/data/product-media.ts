// Single source of truth for PDP gallery media (A8).
// Packshots are per-colour; on-face / detail / scale shots are shared per model.

import ovHavana from "@/assets/frames-2026/oval-havana.asset.json";
import ovBlack from "@/assets/frames-2026/oval-black.asset.json";
import ovCrystal from "@/assets/frames-2026/oval-crystal.asset.json";
import sqHavana from "@/assets/frames-2026/square-havana.asset.json";
import sqBlack from "@/assets/frames-2026/square-black.asset.json";
import sqCrystal from "@/assets/frames-2026/square-crystal.asset.json";
import dims007 from "@/assets/woolet-007-dimensions.png.asset.json";
import dims009 from "@/assets/woolet-009-dimensions.png.asset.json";
import greg009 from "@/assets/greg-woolet-009.webp.asset.json";
import onFace007 from "@/assets/woolet-007-on-face-havana.jpg.asset.json";
import detail007 from "@/assets/woolet-007-detail-hinge.jpg";
import gregTester from "@/assets/testimonials/greg-woolet-tester.webp";

export type MediaKind = "packshot" | "on-face" | "detail" | "scale";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  src: string;
  alt: string;
  /** Short line shown under the main image */
  caption: string;
  /** Light canvas suits packshots; darker canvas suits lifestyle shots */
  cover?: boolean;
};

export type ProductId = "007" | "009";

const packshots: Record<ProductId, Record<string, string>> = {
  "007": { havana: ovHavana.url, black: ovBlack.url, crystal: ovCrystal.url },
  "009": { havana: sqHavana.url, black: sqBlack.url, crystal: sqCrystal.url },
};

const shapeLabel: Record<ProductId, string> = {
  "007": "round panto",
  "009": "soft-square",
};

const bridge: Record<ProductId, string> = { "007": "20 mm keyhole bridge", "009": "21 mm bridge" };

const shared: Record<ProductId, MediaItem[]> = {
  "007": [
    {
      id: "on-face",
      kind: "on-face",
      src: onFace007,
      alt: "Man with a wide face wearing Woolet 007 round panto acetate glasses, front view showing the 158 mm frame sitting flush at the temples",
      caption: "On a 156 mm face — temples flush, no pinch",
      cover: true,
    },
    {
      id: "detail",
      kind: "detail",
      src: detail007,
      alt: "Close-up of the Woolet 007 hinge, rivets and hand-polished acetate edge",
      caption: "5-barrel PVD hinge, double rivets, hand-polished edge",
      cover: true,
    },
    {
      id: "scale",
      kind: "scale",
      src: dims009.url,
      alt: "Measurement diagram of Woolet 007 round panto: 158 mm total front width, 51 mm lens width, 45 mm lens height, 20 mm bridge, 103 mm temple length",
      caption: "158 mm front · 51 × 45 mm lens · 20 mm bridge · 103 mm temples",
    },
  ],
  "009": [
    {
      id: "on-face",
      kind: "on-face",
      src: greg009.url,
      alt: "Greg, a tester with a 158 mm face, wearing Woolet 009 soft-square acetate glasses",
      caption: "Greg — 158 mm face, wearing the 009",
      cover: true,
    },
    {
      id: "on-face-2",
      kind: "on-face",
      src: gregTester,
      alt: "Side-angle portrait of a wide-face tester wearing Woolet 009 soft-square glasses, showing straight temple run",
      caption: "Side profile — temples run straight, no bow-out",
      cover: true,
    },
    {
      id: "scale",
      kind: "scale",
      src: dims007.url,
      alt: "Measurement diagram of Woolet 009 soft-square: 158 mm total front width, 54 mm lens width, 42 mm lens height, 21 mm bridge, 103 mm temple length",
      caption: "158 mm front · 54 × 42 mm lens · 21 mm bridge · 103 mm temples",
    },
  ],
};

export function mediaFor(model: ProductId, colourId: string, colourName: string): MediaItem[] {
  const packshot = packshots[model][colourId];
  const head: MediaItem[] = packshot
    ? [
        {
          id: `packshot-${colourId}`,
          kind: "packshot",
          src: packshot,
          alt: `Woolet ${model} — ${shapeLabel[model]} Mazzucchelli acetate glasses in ${colourName.toLowerCase()}, 158 mm front · ${bridge[model]}`,
          caption: `${colourName} — 158 mm front, ${bridge[model]}`,
        },
      ]
    : [];
  return [...head, ...shared[model]];
}
