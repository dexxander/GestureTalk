/**
 * Recognition engine type definitions
 */

/** A single prediction result from the classifier */
export interface Prediction {
  sign: string
  confidence: number
  timestamp: number
  type: 'letter' | 'number' | 'word' | 'phrase' | 'gesture'
}

/** Top-K prediction results */
export interface PredictionResult {
  topPrediction: Prediction
  alternatives: Prediction[]
  isStable: boolean
  frameCount: number
}

/** Classifier interface — both rule-based and transformer implement this */
export interface SignClassifier {
  predict(features: Float32Array): PredictionResult
  isReady(): boolean
  getType(): 'rule-based' | 'transformer'
}

/** Recognition configuration */
export interface RecognitionConfig {
  /** Minimum confidence to accept a prediction (0-1) */
  confidenceThreshold: number
  /** Number of consistent frames needed before accepting prediction */
  stabilityFrames: number
  /** Target frames per second for recognition */
  targetFPS: number
  /** Maximum sequence length for temporal models */
  sequenceLength: number
  /** Whether to use the transformer model (if available) */
  useTransformer: boolean
}

/** Sequence buffer frame */
export interface SequenceFrame {
  features: Float32Array
  timestamp: number
}

/** ASL sign labels */
export const ASL_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
] as const

export const ASL_NUMBERS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
] as const

export const ASL_COMMON_WORDS = [
  'hello', 'thank you', 'please', 'sorry', 'yes', 'no',
  'help', 'stop', 'more', 'water', 'food', 'bathroom',
  'love', 'friend', 'family', 'name', 'what', 'where',
  'when', 'how', 'why', 'good', 'bad', 'want', 'need',
] as const

export type ASLAlphabet = typeof ASL_ALPHABET[number]
export type ASLNumber = typeof ASL_NUMBERS[number]
export type ASLSign = ASLAlphabet | ASLNumber | typeof ASL_COMMON_WORDS[number]

/** Finger extension state */
export interface FingerState {
  thumb: boolean
  index: boolean
  middle: boolean
  ring: boolean
  pinky: boolean
}

/** Hand geometry features for rule-based classification */
export interface HandGeometry {
  fingerExtensions: FingerState
  fingerSpreads: number[]
  thumbPosition: 'across' | 'out' | 'up' | 'tucked'
  handOrientation: 'palm-forward' | 'palm-back' | 'palm-down' | 'palm-up' | 'palm-side'
  wristAngle: number
}
