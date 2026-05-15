import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

let imageLandmarker: FaceLandmarker | null = null;
let videoLandmarker: FaceLandmarker | null = null;

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      (c.getContext as unknown as (t: string) => unknown)("experimental-webgl")
    );
  } catch {
    return false;
  }
}

async function createLandmarker(
  runningMode: "IMAGE" | "VIDEO",
  delegate: "GPU" | "CPU",
): Promise<FaceLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode,
    numFaces: 2,
    minFaceDetectionConfidence: 0.7,
    minFacePresenceConfidence: 0.7,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

async function createWithFallback(runningMode: "IMAGE" | "VIDEO"): Promise<FaceLandmarker> {
  const preferGpu = hasWebGL();
  if (preferGpu) {
    try {
      return await createLandmarker(runningMode, "GPU");
    } catch (err) {
      console.warn("[face-landmarker] GPU init failed, retrying on CPU", err);
    }
  }
  return createLandmarker(runningMode, "CPU");
}

export async function getImageLandmarker(): Promise<FaceLandmarker> {
  if (!imageLandmarker) imageLandmarker = await createWithFallback("IMAGE");
  return imageLandmarker;
}

export async function getVideoLandmarker(): Promise<FaceLandmarker> {
  if (!videoLandmarker) videoLandmarker = await createWithFallback("VIDEO");
  return videoLandmarker;
}

export function resetLandmarkers() {
  try { imageLandmarker?.close(); } catch { /* noop */ }
  try { videoLandmarker?.close(); } catch { /* noop */ }
  imageLandmarker = null;
  videoLandmarker = null;
}

export type { FaceLandmarkerResult };
