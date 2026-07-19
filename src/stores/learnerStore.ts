import { create } from 'zustand'

interface LearnerState {
  targetWord: string
  score: number
  streak: number
  isSuccess: boolean
  wordList: string[]
  
  // Actions
  initialize: (words: string[]) => void
  setTargetWord: (word: string) => void
  nextWord: () => void
  checkPrediction: (prediction: string, confidence: number) => void
  skipWord: () => void
}

export const useLearnerStore = create<LearnerState>((set, get) => ({
  targetWord: '',
  score: 0,
  streak: 0,
  isSuccess: false,
  wordList: [],

  initialize: (words: string[]) => {
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)]
      set({ wordList: words, targetWord: randomWord, isSuccess: false })
    }
  },

  setTargetWord: (word: string) => set({ targetWord: word, isSuccess: false }),

  nextWord: () => {
    const { wordList } = get()
    if (wordList.length === 0) return
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
    set({ targetWord: randomWord, isSuccess: false })
  },

  checkPrediction: (prediction: string, confidence: number) => {
    const { targetWord, isSuccess } = get()
    
    // Ignore if already succeeded (waiting for next word) or if prediction is wrong/low confidence
    if (isSuccess || !targetWord) return
    
    if (prediction === targetWord && confidence > 0.65) {
      set(state => ({
        isSuccess: true,
        score: state.score + 10,
        streak: state.streak + 1
      }))
      
      // Auto-advance after 2.5 seconds
      setTimeout(() => {
        get().nextWord()
      }, 2500)
    }
  },

  skipWord: () => {
    set({ streak: 0 }) // Reset streak on skip
    get().nextWord()
  }
}))
