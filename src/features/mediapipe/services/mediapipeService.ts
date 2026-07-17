/**
 * MediaPipe Tasks Vision service
 * 
 * Initializes and manages HandLandmarker, PoseLandmarker, and FaceLandmarker
 * for real-time sign language detection from webcam video.
 * 
 * Uses the VIDEO running mode for synchronous per-frame detection.
 */

import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  FaceLandmarker,
} from '@mediapipe/tasks-vision'
import type {
  DetectionResult,
  MediaPipeLoadState,
} from '../types/landmarks'

const MEDIAPIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'

const MODEL_URLS = {
  hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  pose: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  face: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
} as const

/** Singleton MediaPipe pipeline service */
class MediaPipeService {
  private handLandmarker: HandLandmarker | null = null
  private poseLandmarker: PoseLandmarker | null = null
  private faceLandmarker: FaceLandmarker | null = null
  private loadState: MediaPipeLoadState = {
    handLandmarker: false,
    poseLandmarker: false,
    faceLandmarker: false,
    allLoaded: false,
    error: null,
  }
  private initPromise: Promise<void> | null = null

  /** Get current loading state */
  getLoadState(): MediaPipeLoadState {
    return { ...this.loadState }
  }

  /**
   * Initialize all MediaPipe detectors.
   * Safe to call multiple times — subsequent calls return the same promise.
   */
  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise

    this.initPromise = this._doInitialize()
    return this.initPromise
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('[MediaPipe] Loading WASM runtime...')
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN)

      console.log('[MediaPipe] Initializing detectors in parallel...')
      const results = await Promise.allSettled([
        this._initHand(vision),
        this._initPose(vision),
        this._initFace(vision),
      ])

      // Check for failures
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        const errors = failures.map(
          (r) => (r as PromiseRejectedResult).reason?.message || 'Unknown error'
        )
        console.warn('[MediaPipe] Some detectors failed to load:', errors)
        // Continue with whatever loaded successfully
      }

      this.loadState.allLoaded =
        this.loadState.handLandmarker &&
        this.loadState.poseLandmarker &&
        this.loadState.faceLandmarker

      console.log('[MediaPipe] Initialization complete:', this.loadState)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize MediaPipe'
      this.loadState.error = message
      console.error('[MediaPipe] Critical initialization error:', error)
      throw error
    }
  }

  private async _initHand(vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>) {
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URLS.hand,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    this.loadState.handLandmarker = true
    console.log('[MediaPipe] HandLandmarker ready')
  }

  private async _initPose(vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>) {
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URLS.pose,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    this.loadState.poseLandmarker = true
    console.log('[MediaPipe] PoseLandmarker ready')
  }

  private async _initFace(vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>) {
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URLS.face,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    this.loadState.faceLandmarker = true
    console.log('[MediaPipe] FaceLandmarker ready')
  }

  /**
   * Run detection on a video frame.
   * All three detectors run sequentially on the same frame and timestamp.
   * Returns combined results for hands, pose, and face.
   */
  detectFrame(video: HTMLVideoElement, timestampMs: number): DetectionResult {
    const result: DetectionResult = {
      hands: [],
      pose: null,
      face: null,
      timestamp: timestampMs,
    }

    // Hand detection
    if (this.handLandmarker) {
      try {
        const handResults = this.handLandmarker.detectForVideo(video, timestampMs)
        if (handResults.landmarks && handResults.landmarks.length > 0) {
          result.hands = handResults.landmarks.map((landmarks, i) => ({
            landmarks: landmarks.map(l => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility })),
            worldLandmarks: handResults.worldLandmarks[i]?.map(l => ({
              x: l.x, y: l.y, z: l.z, visibility: l.visibility,
            })) || [],
            handedness: (handResults.handedness[i]?.[0]?.categoryName as 'Left' | 'Right') || 'Right',
            score: handResults.handedness[i]?.[0]?.score || 0,
          }))
        }
      } catch (e) {
        // Silently skip frame errors (e.g., timestamp issues)
        if (import.meta.env.DEV) console.warn('[MediaPipe] Hand detection error:', e)
      }
    }

    // Pose detection
    if (this.poseLandmarker) {
      try {
        const poseResults = this.poseLandmarker.detectForVideo(video, timestampMs)
        if (poseResults.landmarks && poseResults.landmarks.length > 0) {
          result.pose = {
            landmarks: poseResults.landmarks[0].map(l => ({
              x: l.x, y: l.y, z: l.z, visibility: l.visibility,
            })),
            worldLandmarks: poseResults.worldLandmarks[0]?.map(l => ({
              x: l.x, y: l.y, z: l.z, visibility: l.visibility,
            })) || [],
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[MediaPipe] Pose detection error:', e)
      }
    }

    // Face detection
    if (this.faceLandmarker) {
      try {
        const faceResults = this.faceLandmarker.detectForVideo(video, timestampMs)
        if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
          result.face = {
            landmarks: faceResults.faceLandmarks[0].map(l => ({
              x: l.x, y: l.y, z: l.z,
            })),
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[MediaPipe] Face detection error:', e)
      }
    }

    return result
  }

  /** Clean up all detectors */
  async dispose(): Promise<void> {
    try {
      this.handLandmarker?.close()
      this.poseLandmarker?.close()
      this.faceLandmarker?.close()
    } catch {
      // Ignore cleanup errors
    }
    this.handLandmarker = null
    this.poseLandmarker = null
    this.faceLandmarker = null
    this.initPromise = null
    this.loadState = {
      handLandmarker: false,
      poseLandmarker: false,
      faceLandmarker: false,
      allLoaded: false,
      error: null,
    }
    console.log('[MediaPipe] Disposed all detectors')
  }
}

/** Singleton instance */
export const mediaPipeService = new MediaPipeService()
