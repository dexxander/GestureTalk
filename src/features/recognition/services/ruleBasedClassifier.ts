import type { NormalizedLandmark } from '@/features/mediapipe/types/landmarks'
import { HAND_LANDMARKS } from '@/features/mediapipe/types/landmarks'
import type { Prediction } from '../types/recognition'

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
  
  public classify(landmarks: NormalizedLandmark[], _handedness: 'Left' | 'Right'): Prediction {
    const states = this.getFingerStates(landmarks)
    const letter = this.matchRules(landmarks, states)
    
    if (letter) {
      return {
        sign: letter,
        confidence: 0.85, // Rule-based is highly confident when rules match
        timestamp: Date.now(),
        type: 'letter'
      }
    }

    return {
      sign: 'UNKNOWN',
      confidence: 0,
      timestamp: Date.now(),
      type: 'gesture'
    }
  }

  private getFingerStates(landmarks: NormalizedLandmark[]) {
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

  private matchRules(landmarks: NormalizedLandmark[], states: ReturnType<typeof this.getFingerStates>): string | null {
    const { thumb, index, middle, ring, pinky } = states
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
    const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
    const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]
    const ringTip = landmarks[HAND_LANDMARKS.RING_FINGER_TIP]
    const pinkyTip = landmarks[HAND_LANDMARKS.PINKY_TIP]
    const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP]
    
    // Helper distances
    const thumbIndexDist = distance(thumbTip, indexTip)
    const thumbMiddleDist = distance(thumbTip, middleTip)
    const indexMiddleDist = distance(indexTip, middleTip)
    const allTipsToThumb = distance(indexTip, thumbTip) + distance(middleTip, thumbTip) + distance(ringTip, thumbTip) + distance(pinkyTip, thumbTip)

    // B: All fingers open, thumb closed/tucked
    if (index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'B'

    // W: Index, middle, ring open, pinky closed
    if (index.isOpen && middle.isOpen && ring.isOpen && !pinky.isOpen) return 'W'

    // F: Index and thumb touching (circle), others open
    if (!index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && thumbIndexDist < 0.08) return 'F'

    // Y: Thumb and pinky open, others closed
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && thumb.isOpen) return 'Y'

    // I: Only pinky open
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'I'

    // L: Index and thumb open (90 deg), others closed
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumb.isOpen) return 'L'

    // U or V or R: Index and middle open, others closed
    if (index.isOpen && middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      // If index and middle are crossed, it's R. (index.x and middle.x flipped)
      // If they are apart it's V, if together it's U.
      if (indexTip.y > landmarks[HAND_LANDMARKS.INDEX_FINGER_PIP].y) return 'R' // Rough heuristic for crossed
      if (indexMiddleDist > 0.05) return 'V'
      return 'U'
    }

    // D: Index open, others closed, thumb touching middle tip
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumbMiddleDist < 0.1) return 'D'
    
    // 1 / Z: Index open, others closed (similar to D but thumb tucked)
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && !thumb.isOpen) return 'Z'

    // C or O: All fingers curved. O is touching thumb, C is not.
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      if (allTipsToThumb < 0.3) return 'O'
      if (allTipsToThumb > 0.3 && allTipsToThumb < 0.6) return 'C'
    }

    // A, E, S, M, N, T: All fingers closed.
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      if (thumb.isOpen && thumbTip.y < indexMcp.y) return 'A'
      
      // S: Thumb crossed over middle/ring
      if (thumbTip.x > landmarks[HAND_LANDMARKS.MIDDLE_FINGER_PIP].x) return 'S'
      
      // E: Thumb tucked under curled fingers
      if (!thumb.isOpen && thumbTip.y > indexMcp.y) return 'E'
    }

    return null
  }
}

export const ruleBasedClassifier = new RuleBasedClassifier()
