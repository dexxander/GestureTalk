import type { DetectionResult, NormalizedLandmark } from '@/features/mediapipe/types/landmarks'
import { RELEVANT_POSE_INDICES } from '@/features/mediapipe/types/landmarks'

export const FEATURE_DIM = 63 + 63 + 27 // Left Hand (63) + Right Hand (63) + Pose (27) = 153

export class LandmarkNormalizer {
  /**
   * Converts a DetectionResult into a flat Float32Array of length 153.
   * Format: [LeftHand(63), RightHand(63), Pose(27)]
   * Missing features are zero-padded.
   */
  public normalize(result: DetectionResult): Float32Array {
    const features = new Float32Array(FEATURE_DIM)
    
    // 1. Process Hands
    let leftHand: NormalizedLandmark[] | null = null
    let rightHand: NormalizedLandmark[] | null = null

    for (const hand of result.hands) {
      if (hand.handedness === 'Left' && !leftHand) {
        leftHand = hand.landmarks
      } else if (hand.handedness === 'Right' && !rightHand) {
        rightHand = hand.landmarks
      }
    }

    if (leftHand) {
      const normalized = this.normalizePoints(leftHand, 0)
      features.set(normalized, 0)
    }

    if (rightHand) {
      const normalized = this.normalizePoints(rightHand, 0)
      features.set(normalized, 63)
    }

    // 2. Process Pose
    if (result.pose && result.pose.landmarks.length > 0) {
      const poseLandmarks = RELEVANT_POSE_INDICES.map(i => result.pose!.landmarks[i])
      
      // Use midpoint of shoulders as base for pose (indices 11 and 12 in full pose, but they are index 1 and 2 in our filtered array)
      const leftShoulder = poseLandmarks[1]
      const rightShoulder = poseLandmarks[2]
      
      let basePoint = poseLandmarks[0] // Fallback to nose
      if (leftShoulder && rightShoulder) {
        basePoint = {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2,
          z: (leftShoulder.z + rightShoulder.z) / 2
        }
      }

      const normalized = this.normalizePoints(poseLandmarks, null, basePoint)
      features.set(normalized, 126)
    }

    return features
  }

  /**
   * Normalizes a set of points to be translation and scale invariant.
   */
  private normalizePoints(
    points: NormalizedLandmark[], 
    baseIndex: number | null, 
    customBase?: NormalizedLandmark
  ): number[] {
    if (points.length === 0) return []

    // 1. Translation: make coordinates relative to the base point
    const base = customBase || (baseIndex !== null ? points[baseIndex] : points[0])
    
    const relativeCoords = points.map(p => ({
      x: p.x - base.x,
      y: p.y - base.y,
      z: p.z - base.z
    }))

    // 2. Flatten to 1D array
    const flat = relativeCoords.flatMap(p => [p.x, p.y, p.z])

    // 3. Scale: normalize by max absolute value to be distance-independent
    const maxVal = Math.max(...flat.map(Math.abs), 1e-6) // avoid div by zero
    
    return flat.map(val => val / maxVal)
  }
}

export const landmarkNormalizer = new LandmarkNormalizer()
