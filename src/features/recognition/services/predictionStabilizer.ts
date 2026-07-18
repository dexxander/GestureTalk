import type { Prediction } from '../types/recognition'

export class PredictionStabilizer {
  private windowSize: number
  private confidenceThreshold: number
  private requiredConsecutiveWins: number
  private debounceMs: number

  private recentPredictions: Prediction[] = []
  private recentWinners: string[] = []
  private lastEmittedSign: string | null = null
  private lastEmittedTime: number = 0

  constructor(
    windowSize: number = 10,
    confidenceThreshold: number = 0.55,
    requiredConsecutiveWins: number = 3,
    debounceMs: number = 300
  ) {
    this.windowSize = windowSize
    this.confidenceThreshold = confidenceThreshold
    this.requiredConsecutiveWins = requiredConsecutiveWins
    this.debounceMs = debounceMs
  }

  public process(prediction: Prediction): Prediction | null {
    // 1. Add to sliding window
    this.recentPredictions.push(prediction)
    if (this.recentPredictions.length > this.windowSize) {
      this.recentPredictions.shift()
    }

    // 2. Exponentially-weighted majority voting
    const scores = new Map<string, number>()
    
    this.recentPredictions.forEach((p, index) => {
      if (p.sign === 'UNKNOWN' || p.confidence < this.confidenceThreshold) return
      
      // Weight increases exponentially towards the end of the window
      // Weight ranges roughly from 0.36 to 1.0
      const weight = Math.exp((index - this.windowSize + 1) / this.windowSize)
      const currentScore = scores.get(p.sign) || 0
      
      // Multiply by confidence so highly confident recent frames matter most
      scores.set(p.sign, currentScore + (weight * p.confidence))
    })

    // Find the winner of this window
    let windowWinner: string | null = null
    let maxScore = 0
    
    for (const [sign, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score
        windowWinner = sign
      }
    }

    // 3. Temporal smoothing: track consecutive wins
    this.recentWinners.push(windowWinner || 'UNKNOWN')
    if (this.recentWinners.length > this.requiredConsecutiveWins) {
      this.recentWinners.shift()
    }

    // Check if the winner has been consistent for the required number of frames
    const isConsistent = windowWinner !== null && 
      this.recentWinners.length === this.requiredConsecutiveWins &&
      this.recentWinners.every(w => w === windowWinner)

    if (isConsistent && windowWinner) {
      // 4. Debouncing: enforce minimum time between emissions of NEW signs
      const now = Date.now()
      
      if (windowWinner !== this.lastEmittedSign) {
        if (now - this.lastEmittedTime > this.debounceMs) {
          this.lastEmittedSign = windowWinner
          this.lastEmittedTime = now
          
          // Return the actual prediction object corresponding to the winner
          const originalPrediction = this.recentPredictions.slice().reverse().find(p => p.sign === windowWinner)
          return originalPrediction || null
        }
      } else {
        // Same sign as before, just return null (already emitted)
        return null
      }
    } else if (windowWinner === null) {
      // If we dropped below threshold, clear the current emitted sign so it can be re-emitted later
      this.lastEmittedSign = null
    }

    return null
  }

  public clear(): void {
    this.recentPredictions = []
    this.recentWinners = []
    this.lastEmittedSign = null
    this.lastEmittedTime = 0
  }
}

export const predictionStabilizer = new PredictionStabilizer()
