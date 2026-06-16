// ISO/IEC 7810 ID-1: standard credit/ID card width
export const CARD_WIDTH_MM = 85.6;

export const LANDMARKS = {
  faceLeftTemple: 234,
  faceRightTemple: 454,
  noseLeftAlar: 49,
  noseRightAlar: 279,
  forehead: 10,
  chin: 152,
  // Iris centers (refined face-landmarker output, indices 468–477).
  // 468 = left iris center, 473 = right iris center. Used to compute
  // pupillary distance (PD) in mm using the same card-derived scale.
  leftIrisCenter: 468,
  rightIrisCenter: 473,
} as const;

const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
] as const;

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface Point {
  x: number;
  y: number;
}

function assertPoint(point: Point | undefined, label: string) {
  if (
    !point ||
    typeof point.x !== "number" ||
    typeof point.y !== "number" ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y)
  ) {
    throw new MeasurementError(
      "invalid_landmarks",
      `${label} is missing. Re-scan and mark the requested points again.`,
    );
  }
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

function getFaceOvalPixelWidth(landmarks: NormalizedLandmark[], canvasWidth: number) {
  const xs = FACE_OVAL_INDICES
    .map((idx) => landmarks[idx]?.x)
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x) && x >= -0.05 && x <= 1.05);

  if (xs.length < FACE_OVAL_INDICES.length * 0.8) {
    throw new MeasurementError(
      "invalid_landmarks",
      "Face outline is incomplete. Re-scan with your whole face visible and clear side contours.",
    );
  }

  return (Math.max(...xs) - Math.min(...xs)) * canvasWidth;
}

export function calculateMeasurements(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  cardCorner1: Point,
  cardCorner2: Point,
  faceEdge1?: Point,
  faceEdge2?: Point,
): Measurements {
  if (!Number.isFinite(canvasWidth) || canvasWidth < 100) {
    throw new MeasurementError("invalid_canvas", "Capture frame is invalid. Re-scan.");
  }

  // Manual-annotation mode: user placed all 4 points (card + face edges).
  // We don't need MediaPipe landmarks in that case — face width comes from
  // the annotated edges, and nose width is approximated from face width
  // using a typical anthropometric ratio (alar width ≈ 0.28 × face width,
  // Farkas norms). This unblocks scans where the still-frame landmarker
  // failed (low light, motion blur, partial occlusion by the card/hand).
  const hasManualFace = !!(faceEdge1 && faceEdge2);
  const hasLandmarks = Array.isArray(landmarks) && landmarks.length >= 478;

  if (!hasLandmarks && !hasManualFace) {
    throw new MeasurementError(
      "invalid_landmarks",
      "Face wasn't fully detected. Re-scan with steady lighting.",
    );
  }
  if (hasLandmarks) {
    assertLandmark(landmarks, LANDMARKS.faceLeftTemple);
    assertLandmark(landmarks, LANDMARKS.faceRightTemple);
    assertLandmark(landmarks, LANDMARKS.noseLeftAlar);
    assertLandmark(landmarks, LANDMARKS.noseRightAlar);
  }

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
  const faceOvalPixelWidth = hasLandmarks ? getFaceOvalPixelWidth(landmarks, canvasWidth) : 0;

  let facePixelWidth: number;
  if (hasManualFace) {
    assertPoint(faceEdge1, "Left face edge point");
    assertPoint(faceEdge2, "Right face edge point");
    const annotatedFacePixelWidth = Math.hypot(faceEdge2!.x - faceEdge1!.x, faceEdge2!.y - faceEdge1!.y);
    if (!Number.isFinite(annotatedFacePixelWidth) || annotatedFacePixelWidth < 80) {
      throw new MeasurementError(
        "face_out_of_range",
        "Face edge points are too close together. Mark the widest visible left and right outline of your face.",
        { facePixelWidth: annotatedFacePixelWidth },
      );
    }
    facePixelWidth = Math.max(annotatedFacePixelWidth, faceOvalPixelWidth);
  } else {
    facePixelWidth = faceOvalPixelWidth;
  }
  const faceWidthMmRaw = facePixelWidth * mmPerPx;

  let nosePixelWidth: number;
  let noseWidthMmRaw: number;
  if (hasLandmarks) {
    const noseLeftPx = landmarks[LANDMARKS.noseLeftAlar].x * canvasWidth;
    const noseRightPx = landmarks[LANDMARKS.noseRightAlar].x * canvasWidth;
    nosePixelWidth = Math.abs(noseRightPx - noseLeftPx);
    noseWidthMmRaw = nosePixelWidth * mmPerPx;
  } else {
    // Anthropometric approximation when landmarks are unavailable.
    noseWidthMmRaw = faceWidthMmRaw * 0.28;
    nosePixelWidth = noseWidthMmRaw / mmPerPx;
  }

  const faceWidthMm = Math.round(faceWidthMmRaw);
  const noseWidthMm = Math.round(noseWidthMmRaw);

  if (faceWidthMm < FACE_WIDTH_RANGE_MM.min || faceWidthMm > FACE_WIDTH_RANGE_MM.max) {
    throw new MeasurementError(
      "face_out_of_range",
      `Face width came out as ${faceWidthMm} mm, which is outside the plausible ${FACE_WIDTH_RANGE_MM.min}–${FACE_WIDTH_RANGE_MM.max} mm range. Re-scan and tap the exact card corners plus the outer face edges.`,
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

  const annotationAgreement = faceEdge1 && faceEdge2 ? Math.abs(facePixelWidth - faceOvalPixelWidth) / facePixelWidth : 0;

  const confidence: Measurements["confidence"] =
    cardPixelWidth > 200 && annotationAgreement <= 0.08
      ? "high"
      : cardPixelWidth > 120 && annotationAgreement <= 0.18
        ? "medium"
        : "low";

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
