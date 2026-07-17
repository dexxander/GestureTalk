import { create } from 'zustand'
import type { Prediction } from '@/features/recognition/types/recognition'

/**
 * Recognition state store – manages the real-time sign language
 * recognition pipeline state, prediction history, and sentence
 * composition.
 *
 * Not persisted — recognition state is ephemeral per session.
 *
 * @example Selecting an object slice (wrap with useShallow):
 * ```ts
 * import { useShallow } from 'zustand/react/shallow'
 * const { currentSign, currentConfidence } = useRecognitionStore(
 *   useShallow(s => ({ currentSign: s.currentSign, currentConfidence: s.currentConfidence }))
 * )
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Maximum number of predictions to keep in history. */
const MAX_HISTORY_SIZE = 200

export interface RecognitionState {
  /** Whether the recognition loop is actively processing frames. */
  isRecognizing: boolean
  /** The currently detected sign label, or null if nothing is detected. */
  currentSign: string | null
  /** Confidence of the current prediction (0 – 1). */
  currentConfidence: number
  /** Rolling buffer of recent predictions for analysis & display. */
  predictionHistory: Prediction[]
  /** The sentence currently being composed from recognized signs. */
  currentSentence: string
  /** Previously completed sentences. */
  completedSentences: string[]
  /** Whether the MediaPipe vision tasks have been loaded. */
  isMediaPipeLoaded: boolean
  /** Whether the sign classification model has been loaded. */
  isModelLoaded: boolean

  // ── Actions ──────────────────────────────────────────────────────────
  setRecognizing: (recognizing: boolean) => void
  /** Update the current prediction. Pass null/0 to clear. */
  setPrediction: (sign: string | null, confidence: number) => void
  /** Append a prediction to the rolling history buffer. */
  addToPredictionHistory: (prediction: Prediction) => void
  /** Clear the entire prediction history. */
  clearPredictionHistory: () => void
  /** Append recognized text to the current sentence. */
  appendToSentence: (text: string) => void
  /** Manually set the current sentence (for typing mode). */
  setSentence: (sentence: string) => void
  /** Finalize the current sentence and move it to completedSentences. */
  completeSentence: () => void
  /** Remove the last word from the current sentence. */
  undoLastWord: () => void
  /** Clear the current sentence without saving it. */
  clearSentence: () => void
  setMediaPipeLoaded: (loaded: boolean) => void
  setModelLoaded: (loaded: boolean) => void
  /** Reset all recognition state to initial values. */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE: Omit<
  RecognitionState,
  | 'setRecognizing'
  | 'setPrediction'
  | 'addToPredictionHistory'
  | 'clearPredictionHistory'
  | 'appendToSentence'
  | 'setSentence'
  | 'completeSentence'
  | 'undoLastWord'
  | 'clearSentence'
  | 'setMediaPipeLoaded'
  | 'setModelLoaded'
  | 'reset'
> = {
  isRecognizing: false,
  currentSign: null,
  currentConfidence: 0,
  predictionHistory: [],
  currentSentence: '',
  completedSentences: [],
  isMediaPipeLoaded: false,
  isModelLoaded: false,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRecognitionStore = create<RecognitionState>()((set) => ({
  ...INITIAL_STATE,

  setRecognizing: (recognizing) => {
    set({ isRecognizing: recognizing })
  },

  setPrediction: (sign, confidence) => {
    set({ currentSign: sign, currentConfidence: confidence })
  },

  addToPredictionHistory: (prediction) => {
    set((state) => {
      const history = [...state.predictionHistory, prediction]
      // Keep the buffer bounded
      if (history.length > MAX_HISTORY_SIZE) {
        history.splice(0, history.length - MAX_HISTORY_SIZE)
      }
      return { predictionHistory: history }
    })
  },

  clearPredictionHistory: () => {
    set({ predictionHistory: [] })
  },

  appendToSentence: (text) => {
    set((state) => {
      const separator = state.currentSentence.length > 0 ? ' ' : ''
      return { currentSentence: state.currentSentence + separator + text }
    })
  },

  setSentence: (sentence) => {
    set({ currentSentence: sentence })
  },

  completeSentence: () => {
    set((state) => {
      const trimmed = state.currentSentence.trim()
      if (trimmed.length === 0) return state
      return {
        currentSentence: '',
        completedSentences: [...state.completedSentences, trimmed],
      }
    })
  },

  undoLastWord: () => {
    set((state) => {
      const words = state.currentSentence.trim().split(/\s+/)
      words.pop()
      return { currentSentence: words.join(' ') }
    })
  },

  clearSentence: () => {
    set({ currentSentence: '' })
  },

  setMediaPipeLoaded: (loaded) => {
    set({ isMediaPipeLoaded: loaded })
  },

  setModelLoaded: (loaded) => {
    set({ isModelLoaded: loaded })
  },

  reset: () => {
    set(INITIAL_STATE)
  },
}))
