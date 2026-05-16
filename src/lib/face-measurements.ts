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

// Plausible human ranges (anthropometric). Outside these, the result is
// almost certainly a bad card placement or a misdetected landmark.
export const FACE_WIDTH_RANGE_MM = { min: 125, max: 175 } as const;
export const NOSE_WIDTH_RANGE_MM = { min: 25, max: 50 } as const;

export type MeasurementErrorKind =
  | "card_too_small"
  | "invalid_landmarks"
  | "invalid_canvas"
  | "face_out_of_range"
  | "nose_out_of_range";

export class MeasurementError extends Error {
  kind: MeasurementErrorKind;
  details?: Record<string, number>;
  constructor(kind: MeasurementErrorKind, message: string, details?: Record<string, number>) {
    super(message);
    this.name = "MeasurementError";
    this.kind = kind;
    this.details = details;
  }
}

function assertLandmark(landmarks: NormalizedLandmark[], idx: number) {
  const lm = landmarks?.[idx];
  if (
    !lm ||
    typeof lm.x !== "number" ||
    !Number.isFinite(lm.x) ||
    lm.x < -0.05 ||
    lm.x > 1.05
  ) {
    throw new MeasurementError(
      "invalid_landmarks",
      "Face landmarks are incomplete or off-frame. Re-scan with your whole face visible.",
      { index: idx },
    );
  }
}

export function calculateMeasurements(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  cardCorner1: Point,
  cardCorner2: Point,
): Measurements {
  if (!Number.isFinite(canvasWidth) || canvasWidth < 100) {
    throw new MeasurementError("invalid_canvas", "Capture frame is invalid. Re-scan.");
  }
  if (!Array.isArray(landmarks) || landmarks.length < 478) {
    throw new MeasurementError(
      "invalid_landmarks",
      "Face wasn't fully detected. Re-scan with steady lighting.",
    );
  }
  assertLandmark(landmarks, LANDMARKS.faceLeftTemple);
  assertLandmark(landmarks, LANDMARKS.faceRightTemple);
  assertLandmark(landmarks, LANDMARKS.noseLeftAlar);
  assertLandmark(landmarks, LANDMARKS.noseRightAlar);

  const cardPixelWidth = Math.hypot(
    cardCorner2.x - cardCorner1.x,
    cardCorner2.y - cardCorner1.y,
  );
  if (!Number.isFinite(cardPixelWidth) || cardPixelWidth < 50) {
    throw new MeasurementError(
      "card_too_small",
      "Card corners too close. Re-tap more precisely on the card edges.",
      { cardPixelWidth },
    );
  }
  const mmPerPx = CARD_WIDTH_MM / cardPixelWidth;

  const faceLeftPx = landmarks[LANDMARKS.faceLeftTemple].x * canvasWidth;
  const faceRightPx = landmarks[LANDMARKS.faceRightTemple].x * canvasWidth;
  const facePixelWidth = Math.abs(faceRightPx - faceLeftPx);
  const faceWidthMmRaw = facePixelWidth * mmPerPx;

  const noseLeftPx = landmarks[LANDMARKS.noseLeftAlar].x * canvasWidth;
  const noseRightPx = landmarks[LANDMARKS.noseRightAlar].x * canvasWidth;
  const nosePixelWidth = Math.abs(noseRightPx - noseLeftPx);
  const noseWidthMmRaw = nosePixelWidth * mmPerPx;

  const faceWidthMm = Math.round(faceWidthMmRaw);
  const noseWidthMm = Math.round(noseWidthMmRaw);

  if (faceWidthMm < FACE_WIDTH_RANGE_MM.min || faceWidthMm > FACE_WIDTH_RANGE_MM.max) {
    throw new MeasurementError(
      "face_out_of_range",
      `Face width came out as ${faceWidthMm} mm, which is outside the plausible ${FACE_WIDTH_RANGE_MM.min}–${FACE_WIDTH_RANGE_MM.max} mm range. Re-scan and tap the exact card corners.`,
      { faceWidthMm },
    );
  }
  if (noseWidthMm < NOSE_WIDTH_RANGE_MM.min || noseWidthMm > NOSE_WIDTH_RANGE_MM.max) {
    throw new MeasurementError(
      "nose_out_of_range",
      `Nose width came out as ${noseWidthMm} mm, which is outside the plausible ${NOSE_WIDTH_RANGE_MM.min}–${NOSE_WIDTH_RANGE_MM.max} mm range. Re-scan and tap the exact card corners.`,
      { noseWidthMm },
    );
  }

  const confidence: Measurements["confidence"] =
    cardPixelWidth > 200 ? "high" : cardPixelWidth > 100 ? "medium" : "low";

  return {
    faceWidthMm,
    noseWidthMm,
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
