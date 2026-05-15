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

async function createLandmarker(runningMode: "IMAGE" | "VIDEO"): Promise<FaceLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode,
    numFaces: 2,
    minFaceDetectionConfidence: 0.7,
    minFacePresenceConfidence: 0.7,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

export async function getImageLandmarker(): Promise<FaceLandmarker> {
  if (!imageLandmarker) imageLandmarker = await createLandmarker("IMAGE");
  return imageLandmarker;
}

export async function getVideoLandmarker(): Promise<FaceLandmarker> {
  if (!videoLandmarker) videoLandmarker = await createLandmarker("VIDEO");
  return videoLandmarker;
}

export type { FaceLandmarkerResult };
