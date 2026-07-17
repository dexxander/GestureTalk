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
    const wrist = landmarks[HAND_LANDMARKS.WRIST]
    const middleMcp = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP]
    const palmSize = distance(wrist, middleMcp)

    // Helper to determine if a finger is open based on distance from wrist
    // A finger is generally open if its tip is further from the wrist than its PIP joint
    const isOpen = (tipIdx: number, pipIdx: number) => {
      const tipDist = distance(landmarks[tipIdx], wrist)
      const pipDist = distance(landmarks[pipIdx], wrist)
      return tipDist > pipDist
    }

    // Thumb is special - check relative to index MCP
    const thumbIsOpen = () => {
      const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
      const thumbMcp = landmarks[HAND_LANDMARKS.THUMB_MCP]

      const dist = distance(thumbTip, thumbMcp)
      return dist > (palmSize * 0.4) // Scale invariant threshold
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
    
    const wrist = landmarks[HAND_LANDMARKS.WRIST]
    const middleMcp = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_MCP]
    const palmSize = distance(wrist, middleMcp)
    
    // Helper distances
    const thumbIndexDist = distance(thumbTip, indexTip)
    const thumbMiddleDist = distance(thumbTip, middleTip)
    const indexMiddleDist = distance(indexTip, middleTip)
    const allTipsToThumb = distance(indexTip, thumbTip) + distance(middleTip, thumbTip) + distance(ringTip, thumbTip) + distance(pinkyTip, thumbTip)

    // B: 4 open, thumb closed
    if (index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'B'

    // W: 3 open (index, middle, ring), pinky closed, thumb closed
    if (index.isOpen && middle.isOpen && ring.isOpen && !pinky.isOpen && !thumb.isOpen) return 'W'

    // F: 3 open (middle, ring, pinky), index closed, thumb closed/touching
    if (!index.isOpen && middle.isOpen && ring.isOpen && pinky.isOpen && thumbIndexDist < (palmSize * 0.8)) return 'F'

    // Y: 2 open (thumb, pinky), others closed
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && thumb.isOpen) return 'Y'

    // I: 1 open (pinky), others closed, thumb closed
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && pinky.isOpen && !thumb.isOpen) return 'I'

    // L: 2 open (thumb, index), others closed
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumb.isOpen) return 'L'

    // U / V / R: 2 open (index, middle), others closed, thumb closed
    if (index.isOpen && middle.isOpen && !ring.isOpen && !pinky.isOpen && !thumb.isOpen) {
      if (indexTip.y > landmarks[HAND_LANDMARKS.INDEX_FINGER_PIP].y) return 'R' 
      if (indexMiddleDist > (palmSize * 0.4)) return 'V'
      return 'U'
    }

    // D: 1 open (index), others closed, thumb touching middle tip
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && thumbMiddleDist < (palmSize * 0.8)) return 'D'
    
    // Z / 1: 1 open (index), others closed, thumb closed (not touching middle tip)
    if (index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen && !thumb.isOpen && thumbMiddleDist >= (palmSize * 0.8)) return 'Z'

    // C or O: 0 open, curved. Check distance of all tips to thumb.
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      if (allTipsToThumb < (palmSize * 1.5)) return 'O'
      if (allTipsToThumb > (palmSize * 1.5) && allTipsToThumb < (palmSize * 3.5)) return 'C'
    }

    // A, E, S, M, N, T: 0 open, tight fist.
    if (!index.isOpen && !middle.isOpen && !ring.isOpen && !pinky.isOpen) {
      if (thumb.isOpen && thumbTip.y < indexMcp.y) return 'A'
      if (thumbTip.x > landmarks[HAND_LANDMARKS.MIDDLE_FINGER_PIP].x) return 'S'
      if (!thumb.isOpen && thumbTip.y > indexMcp.y) return 'E'
    }

    return null
  }
}

export const ruleBasedClassifier = new RuleBasedClassifier()
