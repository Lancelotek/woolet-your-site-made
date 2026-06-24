// Bespoke scan profile — fuses 3 captured frames (front + L 90° + R 90°)
// into a single normalized measurement set used by the bespoke configurator.
//
// Calibration scheme:
//  - FRONT frame is calibrated by a credit card on the forehead (known
//    85.6 mm long edge). This gives mm/pixel for the front frame and lets
//    us measure face width + nose bridge width.
//  - PROFILE frames each carry their OWN card on the cheek, so each profile
//    is independently calibrated. Real temple length and bridge depth are
//    measured directly in mm — no anatomical ratio fallback when card is
//    detected on the profile.
//
// All anatomical caps mirror scan-clamp.ts so the configurator never sees
// implausible numbers.

import { MAX_FACE_WIDTH_MM, MAX_NOSE_WIDTH_MM } from "./scan-clamp";

const CARD_LONG_EDGE_MM = 85.6; // ISO/IEC 7810 ID-1

/** Fallback empirical ratios derived from CAESAR head-and-face anthropometric
 *  averages — used only when profile frames are missing entirely. */
const TEMPLE_LENGTH_RATIO = 0.95; // (eye→tragus) ≈ 0.95 × face width
const BRIDGE_HEIGHT_RATIO = 0.13; // bridge height ≈ 0.13 × face width

export interface Point { x: number; y: number }

export interface FrontFrame {
  pose: "front";
  card: { left: Point; right: Point };
  face: { left: Point; right: Point };
  noseBridge: { left: Point; right: Point };
  confidence: number;
  glassesDetected?: boolean;
}

export interface ProfileFrame {
  pose: "left" | "right";
  /** Card on the cheek — self-calibration reference. Optional for back-compat. */
  card?: { left: Point; right: Point };
  outerEyeCorner: Point;
  tragus: Point;
  noseBridgeTop: Point;
  noseBridgeBottom: Point;
  browLine: { inner: Point; outer: Point };
  confidence: number;
  glassesDetected?: boolean;
}

export interface BespokeProfile {
  faceWidthMm: number;
  noseBridgeWidthMm: number;
  noseBridgeHeightMm: number;
  templeLengthLeftMm: number;
  templeLengthRightMm: number;
  pantoscopicAngleDeg: number;
  asymmetryMm: number;
  pdMm: number | null;
  confidence: {
    faceWidth: number;
    noseBridge: number;
    temple: number;
    angle: number;
    overall: number;
  };
  warnings: string[];
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** mm/pixel for a frame containing a card with a horizontal long edge. */
function cardMmPerPx(card: { left: Point; right: Point }): number | null {
  const px = dist(card.left, card.right);
  if (px <= 0) return null;
  return CARD_LONG_EDGE_MM / px;
}

/** mm/pixel for the FRONT frame, using card long edge as reference. */
export function frontMmPerPx(front: FrontFrame): number {
  const v = cardMmPerPx(front.card);
  if (v == null) throw new Error("invalid_card_pixels");
  return v;
}

/**
 * Fuse 3 frames into a single BespokeProfile. Profile frames are optional —
 * if missing, the profile carries face width + nose bridge width only and
 * confidence drops accordingly. When a profile frame has a card, it is
 * self-calibrated; otherwise it falls back to anatomical ratios from face
 * width.
 */
export function fuseBespokeProfile(
  front: FrontFrame,
  left?: ProfileFrame,
  right?: ProfileFrame,
): BespokeProfile {
  const warnings: string[] = [];
  if (front.glassesDetected) warnings.push("front_glasses_detected");
  if (left?.glassesDetected) warnings.push("left_glasses_detected");
  if (right?.glassesDetected) warnings.push("right_glasses_detected");

  const mmPerPx = frontMmPerPx(front);

  // FRONT-derived measurements
  const faceWidthRaw = dist(front.face.left, front.face.right) * mmPerPx;
  const faceWidthMm = clamp(faceWidthRaw, 100, MAX_FACE_WIDTH_MM);
  const noseBridgeWidthRaw = dist(front.noseBridge.left, front.noseBridge.right) * mmPerPx;
  const noseBridgeWidthMm = clamp(noseBridgeWidthRaw, 12, MAX_NOSE_WIDTH_MM);

  /** Profile-frame mm/px: prefer the card on the cheek (direct measurement).
   *  When the card is missing, fall back to face-width-based scaling using
   *  the eye→tragus pixel distance and TEMPLE_LENGTH_RATIO. */
  const profileMmPerPx = (p: ProfileFrame): number | null => {
    if (p.card) {
      const v = cardMmPerPx(p.card);
      if (v != null) return v;
      warnings.push(`${p.pose}_card_invalid`);
    }
    const eyeToTragusPx = dist(p.outerEyeCorner, p.tragus);
    if (eyeToTragusPx <= 0) return null;
    return (faceWidthMm * TEMPLE_LENGTH_RATIO) / eyeToTragusPx;
  };

  // PROFILE-derived temple length (eye corner → tragus, in mm)
  const templeMmFromProfile = (p?: ProfileFrame): number | null => {
    if (!p) return null;
    const scale = profileMmPerPx(p);
    if (scale == null) return null;
    const eyeToTragusPx = dist(p.outerEyeCorner, p.tragus);
    if (eyeToTragusPx <= 0) return null;
    return clamp(eyeToTragusPx * scale, 110, 160);
  };

  const templeLengthLeftMm = templeMmFromProfile(left) ?? faceWidthMm * TEMPLE_LENGTH_RATIO;
  const templeLengthRightMm = templeMmFromProfile(right) ?? faceWidthMm * TEMPLE_LENGTH_RATIO;

  // Nose bridge height (top → bottom of the bridge, in mm), averaged across
  // available profiles.
  const bridgeHeightFromProfile = (p?: ProfileFrame): number | null => {
    if (!p) return null;
    const scale = profileMmPerPx(p);
    if (scale == null) return null;
    const bridgePx = dist(p.noseBridgeTop, p.noseBridgeBottom);
    if (bridgePx <= 0) return null;
    return bridgePx * scale;
  };

  const bridgeSamples = [bridgeHeightFromProfile(left), bridgeHeightFromProfile(right)]
    .filter((v): v is number => v != null);
  const noseBridgeHeightMm = bridgeSamples.length
    ? clamp(bridgeSamples.reduce((s, v) => s + v, 0) / bridgeSamples.length, 8, 30)
    : faceWidthMm * BRIDGE_HEIGHT_RATIO;

  // Pantoscopic angle — angle between brow line and eye→tragus line on a
  // profile frame, averaged when both present.
  const pantoscopicFromProfile = (p?: ProfileFrame): number | null => {
    if (!p) return null;
    const browVec = { x: p.browLine.outer.x - p.browLine.inner.x, y: p.browLine.outer.y - p.browLine.inner.y };
    const eyeVec = { x: p.tragus.x - p.outerEyeCorner.x, y: p.tragus.y - p.outerEyeCorner.y };
    const dot = browVec.x * eyeVec.x + browVec.y * eyeVec.y;
    const mag = Math.hypot(browVec.x, browVec.y) * Math.hypot(eyeVec.x, eyeVec.y);
    if (mag <= 0) return null;
    const rad = Math.acos(clamp(dot / mag, -1, 1));
    const deg = (rad * 180) / Math.PI;
    return clamp(Math.abs(deg), 0, 20);
  };

  const angleSamples = [pantoscopicFromProfile(left), pantoscopicFromProfile(right)]
    .filter((v): v is number => v != null);
  const pantoscopicAngleDeg = angleSamples.length
    ? angleSamples.reduce((s, v) => s + v, 0) / angleSamples.length
    : 8;

  const asymmetryMm = left && right
    ? Math.abs(templeLengthLeftMm - templeLengthRightMm)
    : 0;

  // Confidence — driven by per-frame model confidence + presence of profiles
  // with cards (self-calibrated profiles get a small boost).
  const faceWidthConf = front.confidence;
  const noseBridgeConf = front.confidence;
  const profileConf = (p?: ProfileFrame) => {
    if (!p) return 0;
    const base = p.confidence;
    return p.card ? Math.min(1, base + 0.05) : base * 0.85;
  };
  const templeConf = (profileConf(left) + profileConf(right)) / 2;
  const angleConf = angleSamples.length ? templeConf : 0.3;
  const overall = (faceWidthConf + noseBridgeConf + templeConf + angleConf) / 4;

  return {
    faceWidthMm: round1(faceWidthMm),
    noseBridgeWidthMm: round1(noseBridgeWidthMm),
    noseBridgeHeightMm: round1(noseBridgeHeightMm),
    templeLengthLeftMm: round1(templeLengthLeftMm),
    templeLengthRightMm: round1(templeLengthRightMm),
    pantoscopicAngleDeg: round1(pantoscopicAngleDeg),
    asymmetryMm: round1(asymmetryMm),
    pdMm: null,
    confidence: {
      faceWidth: round1(faceWidthConf),
      noseBridge: round1(noseBridgeConf),
      temple: round1(templeConf),
      angle: round1(angleConf),
      overall: round1(overall),
    },
    warnings,
  };
}

