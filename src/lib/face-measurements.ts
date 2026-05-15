// ISO/IEC 7810 ID-1: standard credit/ID card width
export const CARD_WIDTH_MM = 85.6;

export const LANDMARKS = {
  faceLeftTemple: 234,
  faceRightTemple: 454,
  noseLeftAlar: 49,
  noseRightAlar: 279,
  forehead: 10,
  chin: 152,
} as const;

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Measurements {
  faceWidthMm: number;
  noseWidthMm: number;
  confidence: "high" | "medium" | "low";
  debug: {
    cardPixelWidth: number;
    mmPerPx: number;
    facePixelWidth: number;
    nosePixelWidth: number;
  };
}

export function calculateMeasurements(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  cardCorner1: Point,
  cardCorner2: Point,
): Measurements {
  const cardPixelWidth = Math.hypot(
    cardCorner2.x - cardCorner1.x,
    cardCorner2.y - cardCorner1.y,
  );
  if (cardPixelWidth < 50) {
    throw new Error("Card corners too close. Re-tap more precisely.");
  }
  const mmPerPx = CARD_WIDTH_MM / cardPixelWidth;

  const faceLeftPx = landmarks[LANDMARKS.faceLeftTemple].x * canvasWidth;
  const faceRightPx = landmarks[LANDMARKS.faceRightTemple].x * canvasWidth;
  const facePixelWidth = Math.abs(faceRightPx - faceLeftPx);
  const faceWidthMm = facePixelWidth * mmPerPx;

  const noseLeftPx = landmarks[LANDMARKS.noseLeftAlar].x * canvasWidth;
  const noseRightPx = landmarks[LANDMARKS.noseRightAlar].x * canvasWidth;
  const nosePixelWidth = Math.abs(noseRightPx - noseLeftPx);
  const noseWidthMm = nosePixelWidth * mmPerPx;

  const confidence: Measurements["confidence"] =
    cardPixelWidth > 200 ? "high" : cardPixelWidth > 100 ? "medium" : "low";

  return {
    faceWidthMm: Math.round(faceWidthMm),
    noseWidthMm: Math.round(noseWidthMm),
    confidence,
    debug: { cardPixelWidth, mmPerPx, facePixelWidth, nosePixelWidth },
  };
}

export type RecommendationType =
  | "wide_face_wide_bridge"
  | "wide_face_standard_bridge"
  | "standard_face_wide_bridge"
  | "standard_fit";

export interface Recommendation {
  type: RecommendationType;
  badgeLabel: string;
  badgeColor: string;
  title: string;
  body: string;
  primaryCta: string;
  primaryHref: string;
}

export function getRecommendation(faceWidthMm: number, noseWidthMm: number): Recommendation {
  const isWideFace = faceWidthMm >= 155;
  const needsWideBridge = noseWidthMm >= 40;

  if (isWideFace && needsWideBridge) {
    return {
      type: "wide_face_wide_bridge",
      badgeLabel: "PERFECT WOOLET CANDIDATE",
      badgeColor: "#CAA449",
      title: "You need wider frames AND a wider bridge",
      body: `At ${faceWidthMm}mm face width and ${noseWidthMm}mm nose width, you're exactly who we built Woolet for. Our 158mm+ frames with a 21mm keyhole bridge are engineered for your face geometry.`,
      primaryCta: "Claim my spot — Founding Member",
      primaryHref: "/en",
    };
  }
  if (isWideFace) {
    return {
      type: "wide_face_standard_bridge",
      badgeLabel: "WIDE FACE — STANDARD BRIDGE",
      badgeColor: "#CAA449",
      title: "Your face needs wider frames",
      body: `At ${faceWidthMm}mm, mainstream frames (max about 148mm) compress your temples. Woolet 158mm+ aligns the frame with your actual face width. Your nose width (${noseWidthMm}mm) is standard — our keyhole bridge fits comfortably.`,
      primaryCta: "Claim my spot",
      primaryHref: "/en",
    };
  }
  if (needsWideBridge) {
    return {
      type: "standard_face_wide_bridge",
      badgeLabel: "STANDARD WIDTH — WIDER BRIDGE",
      badgeColor: "#888888",
      title: "Your face fits standard frames, but your bridge needs space",
      body: `At ${faceWidthMm}mm, you could wear mainstream frames — but with a ${noseWidthMm}mm nose width, narrow bridges will leave pressure marks. Woolet's 21mm keyhole bridge sits comfortably without pinching.`,
      primaryCta: "See if Woolet fits you",
      primaryHref: "/en/products/007",
    };
  }
  return {
    type: "standard_fit",
    badgeLabel: "STANDARD FIT",
    badgeColor: "#888888",
    title: "Mainstream frames should work for you",
    body: `At ${faceWidthMm}mm face width and ${noseWidthMm}mm nose width, you're within the range that most standard brands serve well. Woolet is built for 155mm+ — but if you want premium Italian acetate, we'd still love to have you.`,
    primaryCta: "Browse Woolet anyway",
    primaryHref: "/en/products/007",
  };
}
