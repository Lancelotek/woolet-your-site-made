// Heuristic face-shape classifier from MediaPipe face-mesh landmarks.
// Returns a shape category plus a recommended Woolet model based on the
// classic "contrast" styling rule:
//   - angular features  → rounder frame (007 Panto/Round)
//   - soft/round features → squarer frame (009 Square)

import type { NormalizedLandmark } from "./face-measurements";

export type FaceShape =
  | "round"
  | "square"
  | "rectangle"
  | "oblong"
  | "oval"
  | "heart"
  | "diamond";

export type RecommendedModel = "007" | "009";

export interface FaceShapeResult {
  shape: FaceShape;
  label: string;
  recommendedModel: RecommendedModel;
  modelName: string;
  modelHref: string;
  reason: string;
  metrics: {
    heightToWidth: number;
    jawToCheek: number;
    foreheadToCheek: number;
  };
}

// MediaPipe indices
const IDX = {
  foreheadTop: 10,
  chin: 152,
  cheekLeft: 234,
  cheekRight: 454,
  jawLeft: 172,
  jawRight: 397,
  foreheadLeft: 54,
  foreheadRight: 284,
} as const;

function dist(
  a: NormalizedLandmark | undefined,
  b: NormalizedLandmark | undefined,
  w: number,
  h: number,
) {
  if (!a || !b) return 0;
  const dx = (a.x - b.x) * w;
  const dy = (a.y - b.y) * h;
  return Math.hypot(dx, dy);
}

export function detectFaceShape(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  canvasHeight: number,
): FaceShapeResult | null {
  if (!Array.isArray(landmarks) || landmarks.length < 478) return null;

  const cheekW = dist(landmarks[IDX.cheekLeft], landmarks[IDX.cheekRight], canvasWidth, canvasHeight);
  const jawW = dist(landmarks[IDX.jawLeft], landmarks[IDX.jawRight], canvasWidth, canvasHeight);
  const foreheadW = dist(landmarks[IDX.foreheadLeft], landmarks[IDX.foreheadRight], canvasWidth, canvasHeight);
  const heightPx = dist(landmarks[IDX.foreheadTop], landmarks[IDX.chin], canvasWidth, canvasHeight);

  if (cheekW < 20 || heightPx < 20) return null;

  const heightToWidth = heightPx / cheekW;
  const jawToCheek = jawW / cheekW;
  const foreheadToCheek = foreheadW / cheekW;

  let shape: FaceShape = "oval";

  if (heightToWidth >= 1.5) {
    shape = jawToCheek >= 0.85 ? "rectangle" : "oblong";
  } else if (foreheadToCheek >= 0.9 && jawToCheek <= 0.78) {
    shape = "heart";
  } else if (foreheadToCheek <= 0.8 && jawToCheek <= 0.8) {
    shape = "diamond";
  } else if (heightToWidth <= 1.2 && jawToCheek >= 0.88) {
    shape = "round";
  } else if (jawToCheek >= 0.9 && heightToWidth <= 1.4) {
    shape = "square";
  } else {
    shape = "oval";
  }

  // Frame recommendation by contrast rule
  const map: Record<FaceShape, { model: RecommendedModel; reason: string; label: string }> = {
    round: {
      model: "009",
      label: "Round",
      reason: "Square frames add definition and visually lengthen a round face. Avoid small round frames.",
    },
    square: {
      model: "007",
      label: "Square",
      reason: "Round/panto frames soften strong jaw and angular features, bringing optical harmony.",
    },
    rectangle: {
      model: "007",
      label: "Rectangular",
      reason: "Curved panto frames balance a long, angular face and add softness across the cheekbones.",
    },
    oblong: {
      model: "007",
      label: "Oblong (long)",
      reason: "Round/panto frames break up the vertical line of a long face and add width.",
    },
    oval: {
      model: "009",
      label: "Oval",
      reason: "The most versatile shape. Square frames add character; round frames keep things classic. We default to 009 for a stronger statement.",
    },
    heart: {
      model: "007",
      label: "Heart / triangle",
      reason: "Soft round/oval frames balance a wider forehead and draw attention away from a narrow chin.",
    },
    diamond: {
      model: "007",
      label: "Diamond",
      reason: "Oval/panto frames soften prominent cheekbones and balance a narrower forehead and jaw.",
    },
  };

  const rec = map[shape];
  return {
    shape,
    label: rec.label,
    recommendedModel: rec.model,
    modelName: rec.model === "007" ? "Woolet 007 — Panto / Round" : "Woolet 009 — Square",
    modelHref: `/en/products/${rec.model}`,
    reason: rec.reason,
    metrics: { heightToWidth, jawToCheek, foreheadToCheek },
  };
}
