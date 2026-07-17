import type { NormalizedLandmark } from '@/features/mediapipe/types/landmarks'
import { HAND_LANDMARKS } from '@/features/mediapipe/types/landmarks'
import type { Prediction, PredictionResult } from '../types/recognition'

interface FingerState {
  isOpen: boolean
  isCurled: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward'
}

/** Calculate 3D distance between two landmarks */
function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/** Calculate distance considering only X and Y (screen space) */
function distance2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/** 
 * Rule-Based ASL Fingerspelling Classifier.
 * Uses geometric heuristics (distances and relative positions of joints) 
 * to classify static hand poses into ASL alphabet letters.
 */
export class RuleBasedClassifier {
  
  public classify(landmarks: NormalizedLandmark[], handedness: 'Left' | 'Right'): PredictionResult {
    const states = this.getFingerStates(landmarks, handedness)
    const letter = this.matchRules(landmarks, states, handedness)
    
    if (letter) {
      return {
        sign: letter,
        confidence: 0.85, // Rule-based is highly confident when rules match
        source: 'rule-based',
        timestamp: Date.now()
      }
    }

    return {
      sign: 'UNKNOWN',
      confidence: 0,
      source: 'rule-based',
      timestamp: Date.now()
    }
  }

  private getFingerStates(landmarks: NormalizedLandmark[], handedness: 'Left' | 'Right') {
    const wrist = landmarks[HAND_LANDMARKS.WRIST]

    // Helper to determine if a finger is open based on distance from wrist
    // A finger is generally open if its tip is further from the wrist than its PIP joint
    const isOpen = (tipIdx: number, pipIdx: number) => {
      const tipDist = distance2D(landmarks[tipIdx], wrist)
      const pipDist = distance2D(landmarks[pipIdx], wrist)
      return tipDist > pipDist
    }

    // Thumb is special - check relative to index MCP
    const thumbIsOpen = () => {
      const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
      const thumbMcp = landmarks[HAND_LANDMARKS.THUMB_MCP]
      const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP]
      
      // In 2D, thumb tip should be further outward than index MCP
      const isOutward = handedness === 'Right' 
        ? thumbTip.x > indexMcp.x // Right hand: thumb is to the right of index (x is larger if mirrored, wait, MediaPipe x is 0 left, 1 right. If right hand faces camera, thumb is on left side of image -> smaller x. Actually let's use distance)
        : thumbTip.x < indexMcp.x

      const dist = distance(thumbTip, thumbMcp)
      return dist > 0.05 // rough threshold
    }

    return {
      thumb: { isOpen: thumbIsOpen(), isCurled: false },
      index: { isOpen: isOpen(HAND_LANDMARKS.INDEX_FINGER_TIP, HAND_LANDMARKS.INDEX_FINGER_PIP), isCurled: false },
      middle: { isOpen: isOpen(HAND_LANDMARKS.MIDDLE_FINGER_TIP, HAND_LANDMARKS.MIDDLE_FINGER_PIP), isCurled: false },
      ring: { isOpen: isOpen(HAND_LANDMARKS.RING_FINGER_TIP, HAND_LANDMARKS.RING_FINGER_PIP), isCurled: false },
      pinky: { isOpen: isOpen(HAND_LANDMARKS.PINKY_TIP, HAND_LANDMARKS.PINKY_PIP), isCurled: false }
    }
  }

  private matchRules(landmarks: NormalizedLandmark[], states: ReturnType<typeof this.getFingerStates>, handedness: 'Left' | 'Right'): string | null {
    const { thumb, index, middle, ring, pinky } = states

    // A: All fingers closed, thumb straight up/out alongside index
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumb.isOpen) {
      // Check if thumb tip is near index PIP (A) vs tucked in (S)
      const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
      const indexPip = landmarks[HAND_LANDMARKS.INDEX_FINGER_PIP]
      const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP]
      
      if (thumbTip.y < indexMcp.y) return 'A'
    }

    // B: All fingers open, thumb closed/tucked over palm
    if (index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && !thumb.isOpen) {
      return 'B'
    }

    // C: Curved hand (approximate by checking if tips are near each other but not closed)
    // Complex to do with simple rules, skipped for basic implementation

    // D: Index open, others closed, thumb touching middle tip
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
      const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]
      if (distance(thumbTip, middleTip) < 0.08) {
        return 'D'
      }
    }

    // E: All fingers curled, thumb tucked under them
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && !thumb.isOpen) {
       // Tips should be near palm
       return 'E'
    }

    // F: Index and thumb touching (circle), others open
    if (!index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen) {
      const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
      const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
      if (distance(thumbTip, indexTip) < 0.08) {
        return 'F'
      }
    }

    // I: Only pinky open
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen) {
      // Thumb might be over index/middle or tucked
      return 'I'
    }

    // L: Index and thumb open, others closed
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumb.isOpen) {
      return 'L'
    }

    // V: Index and middle open, apart
    if (index.isOpen && middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
      const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]
      // Check if they are separated (V) vs together (U)
      if (distance(indexTip, middleTip) > 0.05) {
        return 'V'
      } else {
        return 'U'
      }
    }

    // W: Index, middle, ring open
    if (index.isOpen && middle.isOpen && ring.isOpen && !pinky.isOpen) {
      return 'W'
    }

    // Y: Thumb and pinky open, others closed
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && thumb.isOpen) {
      return 'Y'
    }

    // Basic rule match failed
    return null
  }
}

export const ruleBasedClassifier = new RuleBasedClassifier()
