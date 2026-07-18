import type { DetectionResult } from '@/features/mediapipe/types/landmarks'

class LandmarkNormalizer {
  // Output shape per frame: 543 landmarks * 3 (x,y,z) = 1629 floats
  // Order: Face (468), Left Hand (21), Pose (33), Right Hand (21)
  
  public normalize(results: DetectionResult): Float32Array {
    const features = new Float32Array(543 * 3)
    features.fill(NaN) // Kaggle models expect NaN for missing landmarks

    let offset = 0

    // 1. Face (468)
    if (results.face && results.face.landmarks) {
      for (let i = 0; i < 468; i++) {
        const lm = results.face.landmarks[i]
        if (lm) {
          features[offset++] = lm.x
          features[offset++] = lm.y
          features[offset++] = lm.z || 0
        } else {
          offset += 3
        }
      }
    } else {
      offset += 468 * 3
    }

    // 2. Left Hand (21)
    let leftHand = null
    let rightHand = null
    
    if (results.hands) {
       for (let i = 0; i < results.hands.length; i++) {
          const hType = results.hands[i].handedness
          if (hType === 'Left') leftHand = results.hands[i]
          if (hType === 'Right') rightHand = results.hands[i]
       }
    }

    if (leftHand && leftHand.landmarks) {
      for (let i = 0; i < 21; i++) {
        const lm = leftHand.landmarks[i]
        if (lm) {
          features[offset++] = lm.x
          features[offset++] = lm.y
          features[offset++] = lm.z || 0
        } else {
          offset += 3
        }
      }
    } else {
      offset += 21 * 3
    }

    // 3. Pose (33)
    if (results.pose && results.pose.landmarks) {
      for (let i = 0; i < 33; i++) {
        const lm = results.pose.landmarks[i]
        if (lm) {
          features[offset++] = lm.x
          features[offset++] = lm.y
          features[offset++] = lm.z || 0
        } else {
          offset += 3
        }
      }
    } else {
      offset += 33 * 3
    }

    // 4. Right Hand (21)
    if (rightHand && rightHand.landmarks) {
      for (let i = 0; i < 21; i++) {
        const lm = rightHand.landmarks[i]
        if (lm) {
          features[offset++] = lm.x
          features[offset++] = lm.y
          features[offset++] = lm.z || 0
        } else {
          offset += 3
        }
      }
    } else {
      offset += 21 * 3
    }

    return features
  }
}

export const landmarkNormalizer = new LandmarkNormalizer()
