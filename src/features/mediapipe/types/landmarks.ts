/**
 * MediaPipe landmark type definitions
 * Used across the detection pipeline and recognition engine
 */

/** A single normalized landmark point (0.0 to 1.0 range) */
export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

/** A single world landmark point (in meters) */
export interface WorldLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}

/** Hand detection result for a single hand */
export interface HandResult {
  landmarks: NormalizedLandmark[]
  worldLandmarks: WorldLandmark[]
  handedness: 'Left' | 'Right'
  score: number
}

/** Pose detection result */
export interface PoseResult {
  landmarks: NormalizedLandmark[]
  worldLandmarks: WorldLandmark[]
}

/** Face detection result */
export interface FaceResult {
  landmarks: NormalizedLandmark[]
}

/** Combined detection results from all MediaPipe detectors */
export interface DetectionResult {
  hands: HandResult[]
  pose: PoseResult | null
  face: FaceResult | null
  timestamp: number
}

/** Connection pair for drawing skeleton lines */
export interface LandmarkConnection {
  start: number
  end: number
}

/** MediaPipe pipeline loading state */
export interface MediaPipeLoadState {
  handLandmarker: boolean
  poseLandmarker: boolean
  faceLandmarker: boolean
  allLoaded: boolean
  error: string | null
}

/** Hand landmark indices */
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const

/** Fingertip indices for quick access */
export const FINGERTIPS = [4, 8, 12, 16, 20] as const

/** Finger MCP (knuckle) indices */
export const FINGER_MCPS = [5, 9, 13, 17] as const

/** Finger chains (base to tip) */
export const FINGER_CHAINS = {
  THUMB: [1, 2, 3, 4],
  INDEX: [5, 6, 7, 8],
  MIDDLE: [9, 10, 11, 12],
  RING: [13, 14, 15, 16],
  PINKY: [17, 18, 19, 20],
} as const

/** Hand skeleton connections for drawing */
export const HAND_CONNECTIONS: LandmarkConnection[] = [
  // Thumb
  { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 4 },
  // Index
  { start: 0, end: 5 }, { start: 5, end: 6 }, { start: 6, end: 7 }, { start: 7, end: 8 },
  // Middle
  { start: 0, end: 9 }, { start: 9, end: 10 }, { start: 10, end: 11 }, { start: 11, end: 12 },
  // Ring
  { start: 0, end: 13 }, { start: 13, end: 14 }, { start: 14, end: 15 }, { start: 15, end: 16 },
  // Pinky
  { start: 0, end: 17 }, { start: 17, end: 18 }, { start: 18, end: 19 }, { start: 19, end: 20 },
  // Palm
  { start: 5, end: 9 }, { start: 9, end: 13 }, { start: 13, end: 17 },
]

/** Upper body pose connections relevant for sign language */
export const POSE_CONNECTIONS: LandmarkConnection[] = [
  // Shoulders
  { start: 11, end: 12 },
  // Left arm
  { start: 11, end: 13 }, { start: 13, end: 15 },
  // Right arm
  { start: 12, end: 14 }, { start: 14, end: 16 },
]

/** Pose landmark indices relevant for sign language (upper body) */
export const RELEVANT_POSE_INDICES = [
  0,   // Nose
  11, 12,  // Shoulders
  13, 14,  // Elbows
  15, 16,  // Wrists
  23, 24,  // Hips
] as const
