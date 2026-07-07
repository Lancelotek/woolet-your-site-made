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
  /**
   * Pupillary distance (mm) between iris centers (landmarks 468/473).
   * Optional: only set when iris landmarks are available AND the value
   * is within a plausible adult range. PD is supplementary — never throws.
   */
  pdMm?: number;
  confidence: "high" | "medium" | "low";
  debug: {
    cardPixelWidth: number;
    mmPerPx: number;
    facePixelWidth: number;
    nosePixelWidth: number;
    pdPixelWidth?: number;
  };
}

// Plausible human ranges (anthropometric). Outside these, the result is
// almost certainly a bad card placement or a misdetected landmark.
export const FACE_WIDTH_RANGE_MM = { min: 125, max: 175 } as const;
export const NOSE_WIDTH_RANGE_MM = { min: 25, max: 50 } as const;
// Adult PD typically 54–74 mm (Dodgson 2004); allow a slightly wider window
// to avoid silently dropping edge cases (children/large male skulls).
export const PD_RANGE_MM = { min: 50, max: 80 } as const;

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

  // Pupillary distance — supplementary, only when iris landmarks are present.
  // We deliberately do NOT throw on out-of-range values: PD is a bonus
  // metric, not a fitting gate. If iris detection is unreliable for this
  // frame, we simply omit pdMm from the result.
  let pdMm: number | undefined;
  let pdPixelWidth: number | undefined;
  if (hasLandmarks) {
    const leftIris = landmarks[LANDMARKS.leftIrisCenter];
    const rightIris = landmarks[LANDMARKS.rightIrisCenter];
    const irisOk = (p?: NormalizedLandmark) =>
      !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= -0.05 && p.x <= 1.05;
    if (irisOk(leftIris) && irisOk(rightIris)) {
      const dxPx = Math.abs(rightIris.x - leftIris.x) * canvasWidth;
      const candidate = Math.round(dxPx * mmPerPx);
      if (candidate >= PD_RANGE_MM.min && candidate <= PD_RANGE_MM.max) {
        pdMm = candidate;
        pdPixelWidth = dxPx;
      }
    }
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
    pdMm,
    confidence,
    debug: { cardPixelWidth, mmPerPx, facePixelWidth, nosePixelWidth, pdPixelWidth },
  };
}

export type RecommendationType =
  | "wide_face_wide_bridge"       // 009 — wider keyhole
  | "wide_face_standard_bridge"   // 007 — standard keyhole
  | "standard_face_wide_bridge"   // 009 fallback
  | "standard_fit"                // 007 fallback
  | "bespoke_small_face"          // face narrower than 158mm stock
  | "bespoke_extra_wide";         // face beyond 172mm

export interface Recommendation {
  type: RecommendationType;
  badgeLabel: string;
  badgeColor: string;
  title: string;
  body: string;
  primaryCta: string;
  primaryHref: string;
}

/**
 * Low-bridge fit quiz — three plain-language symptoms the user recognises
 * from real-world eyewear. Any positive answer flips the recommendation
 * toward the wider-bridge model (009) or bespoke, because standard bridges
 * won't sit correctly on their nose.
 */
export interface BridgeQuizAnswers {
  /** "Do your glasses slide down your nose?" */
  slipping: "yes" | "sometimes" | "no" | null;
  /** "Do frames leave marks / pinch the sides of your nose?" */
  marks: "yes" | "a_bit" | "no" | null;
  /** "Do your lashes touch the lenses?" */
  lashes: "yes" | "no" | null;
}

export const EMPTY_BRIDGE_ANSWERS: BridgeQuizAnswers = {
  slipping: null,
  marks: null,
  lashes: null,
};

/** True when at least one clear low-bridge symptom is reported. */
export function hasLowBridgeSymptoms(a: BridgeQuizAnswers | null | undefined): boolean {
  if (!a) return false;
  return a.slipping === "yes" || a.marks === "yes" || a.lashes === "yes";
}

/** Softer, "some indication" signal used to nudge toward wider bridge. */
export function hasBridgeHint(a: BridgeQuizAnswers | null | undefined): boolean {
  if (!a) return false;
  return a.slipping === "sometimes" || a.marks === "a_bit";
}

// Stock frame envelope. Both 007 and 009 are 158mm wide; if the face sits
// meaningfully below that (or well above), a bespoke cut is the honest answer.
const STOCK_WIDTH_MM = 158;
const BESPOKE_SMALL_THRESHOLD_MM = 152; // face narrower than this → stock 158 will overhang
const BESPOKE_WIDE_THRESHOLD_MM = 172;  // beyond top of stock range → bespoke

export function getRecommendation(
  faceWidthMm: number,
  noseWidthMm: number,
  bridge?: BridgeQuizAnswers | null,
): Recommendation {
  // 1) Face outside stock envelope → recommend bespoke, regardless of bridge.
  if (faceWidthMm < BESPOKE_SMALL_THRESHOLD_MM) {
    return {
      type: "bespoke_small_face",
      badgeLabel: "BESPOKE FIT",
      badgeColor: "#CAA449",
      title: "Your face is narrower than our stock frames",
      body: `At ${faceWidthMm}mm your face sits below our ${STOCK_WIDTH_MM}mm stock width — a stock 007 or 009 would overhang your temples. Bespoke is cut to your exact face and bridge (${noseWidthMm}mm nose), so it sits flush without slipping.`,
      primaryCta: "Explore bespoke",
      primaryHref: "/en/bespoke",
    };
  }
  if (faceWidthMm > BESPOKE_WIDE_THRESHOLD_MM) {
    return {
      type: "bespoke_extra_wide",
      badgeLabel: "BESPOKE FIT",
      badgeColor: "#CAA449",
      title: "Your face is wider than our stock frames",
      body: `At ${faceWidthMm}mm you're beyond the top of the 007/009 range (max ${BESPOKE_WIDE_THRESHOLD_MM}mm). Bespoke is cut to your exact measurements so temple pressure and compression disappear.`,
      primaryCta: "Explore bespoke",
      primaryHref: "/en/bespoke",
    };
  }

  // 2) Face inside stock envelope — pick between 007 (standard keyhole) and
  // 009 (wider keyhole) based on nose width + low-bridge symptoms.
  const wideNose = noseWidthMm >= 40;
  const lowBridge = hasLowBridgeSymptoms(bridge);
  const bridgeHint = hasBridgeHint(bridge);
  const needsWiderBridge = wideNose || lowBridge || bridgeHint;

  if (needsWiderBridge) {
    // Route to 009 (22mm keyhole, soft-square, low-bridge-friendly).
    const reason = lowBridge
      ? "Your quiz answers point to a low-bridge fit — standard bridges slip, leave marks or push lashes into the lens."
      : wideNose
        ? `Your ${noseWidthMm}mm nose width needs a wider bridge than most brands offer.`
        : `Your quiz answers hint at a low-bridge fit — a wider keyhole prevents the usual slipping and pressure marks.`;
    return {
      type: "wide_face_wide_bridge",
      badgeLabel: "WOOLET 009 — WIDER KEYHOLE",
      badgeColor: "#CAA449",
      title: "Woolet 009 is your fit",
      body: `At ${faceWidthMm}mm you're inside our stock range. ${reason} 009's 158mm front with a 22mm keyhole bridge is engineered for exactly this.`,
      primaryCta: "See Woolet 009",
      primaryHref: "/en/products/009",
    };
  }

  // Comfortable on standard bridges → 007.
  return {
    type: "wide_face_standard_bridge",
    badgeLabel: "WOOLET 007 — STANDARD KEYHOLE",
    badgeColor: "#CAA449",
    title: "Woolet 007 is your fit",
    body: `At ${faceWidthMm}mm face width and ${noseWidthMm}mm nose width, 007's 158mm round-panto front with a 21mm keyhole bridge lines up with your geometry — no slipping, no lash contact.`,
    primaryCta: "See Woolet 007",
    primaryHref: "/en/products/007",
  };
}
