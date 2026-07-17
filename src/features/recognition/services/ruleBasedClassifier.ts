import type { NormalizedLandmark } from '@/features/mediapipe/types/landmarks'
import { HAND_LANDMARKS } from '@/features/mediapipe/types/landmarks'
import type { Prediction } from '../types/recognition'

/** Calculate 3D distance between two landmarks */
function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
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
    // In screen coordinates, y=0 is the top. A finger is "open" (pointing up) if its tip is higher (lower Y) than its PIP joint.
    const isUp = (tipIdx: number, pipIdx: number) => {
      return landmarks[tipIdx].y < landmarks[pipIdx].y
    }

    // Thumb is open if it sticks out far from the index finger knuckle horizontally
    const thumbIsOpen = () => {
      const dx = Math.abs(landmarks[HAND_LANDMARKS.THUMB_TIP].x - landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP].x)
      const palmWidth = Math.abs(landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP].x - landmarks[HAND_LANDMARKS.PINKY_MCP].x)
      return dx > palmWidth * 1.2
    }

    return {
      thumb: { isOpen: thumbIsOpen() },
      index: { isOpen: isUp(HAND_LANDMARKS.INDEX_FINGER_TIP, HAND_LANDMARKS.INDEX_FINGER_PIP) },
      middle: { isOpen: isUp(HAND_LANDMARKS.MIDDLE_FINGER_TIP, HAND_LANDMARKS.MIDDLE_FINGER_PIP) },
      ring: { isOpen: isUp(HAND_LANDMARKS.RING_FINGER_TIP, HAND_LANDMARKS.RING_FINGER_PIP) },
      pinky: { isOpen: isUp(HAND_LANDMARKS.PINKY_TIP, HAND_LANDMARKS.PINKY_PIP) }
    }
  }

  private matchRules(landmarks: NormalizedLandmark[], states: ReturnType<typeof this.getFingerStates>): string | null {
    const { thumb, index, middle, ring, pinky } = states
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
    const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
    const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]
    const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP]

    const isTouching = (a: NormalizedLandmark, b: NormalizedLandmark) => {
      return distance(a, b) < 0.05 // 5% of screen
    }

    // A: All fingers closed, thumb pointing up alongside index
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumbTip.y < indexMcp.y && thumbTip.x > landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP].x) return 'A'

    // B: 4 fingers open, thumb closed (tucked in front of palm)
    if (index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'B'

    // C: Curved hand (tips are below PIPs but not a tight fist, so isOpen is false, but X distances create a C shape - skip for now, C is hard to distinguish from O without depth)
    
    // D: Index open, others closed, thumb touching middle tip
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && isTouching(thumbTip, middleTip)) return 'D'

    // E: All fingers closed tightly, thumb tucked under
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumbTip.y > indexMcp.y && !thumb.isOpen) return 'E'

    // F: 3 fingers open (middle, ring, pinky), index and thumb touching (circle)
    if (!index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && isTouching(thumbTip, indexTip)) return 'F'

    // I: Only pinky open
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'I'

    // K: Index and middle open (V shape), thumb resting on middle PIP. Hard to distinguish from V. 
    
    // L: Index and thumb open (90 deg), others closed
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumb.isOpen) return 'L'

    // U / V / R: Index and middle open, others closed
    if (index.isOpen && middle.isOpen && !ring.isOpen && !pinky.isOpen && !thumb.isOpen) {
      if (indexTip.x > middleTip.x) return 'R' // Crossed fingers
      const gap = Math.abs(indexTip.x - middleTip.x)
      if (gap > 0.05) return 'V' // Apart
      return 'U' // Together
    }

    // W: Index, middle, ring open, pinky closed, thumb touching pinky
    if (index.isOpen && middle.isOpen && ring.isOpen && !pinky.isOpen && !thumb.isOpen) return 'W'

    // X: Index hooked (tip below PIP but above MCP), others closed.
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && indexTip.y < indexMcp.y && !thumb.isOpen) return 'X'

    // Y: Thumb and pinky open, others closed
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && thumb.isOpen) return 'Y'

    return null
  }
}

export const ruleBasedClassifier = new RuleBasedClassifier()
