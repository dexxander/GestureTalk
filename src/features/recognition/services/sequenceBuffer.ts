import type { Prediction } from '../types/recognition'
import { SEQUENCE_BUFFER_SIZE, STABILITY_FRAMES } from '@/lib/constants'

/**
 * Manages a rolling buffer of predictions to smooth out noise
 * and determine a stable consensus prediction.
 */
export class SequenceBuffer {
  private buffer: Prediction[] = []
  private size: number
  private stabilityThreshold: number

  constructor(size: number = SEQUENCE_BUFFER_SIZE, stabilityThreshold: number = STABILITY_FRAMES) {
    this.size = size
    this.stabilityThreshold = stabilityThreshold
  }

  /** Add a new prediction to the buffer */
  public push(prediction: Prediction): void {
    this.buffer.push(prediction)
    if (this.buffer.length > this.size) {
      this.buffer.shift() // Remove oldest
    }
  }

  /** Clear the buffer */
  public clear(): void {
    this.buffer = []
  }

  /** Get the most frequent sign in the recent frames (consensus) */
  public getStablePrediction(): Prediction | null {
    if (this.buffer.length < this.stabilityThreshold) {
      return null
    }

    // Look at the most recent N frames (stabilityThreshold)
    const recent = this.buffer.slice(-this.stabilityThreshold)
    
    const counts = new Map<string, number>()
    let maxCount = 0
    let mostFrequentSign = ''

    for (const p of recent) {
      if (p.sign === 'UNKNOWN') continue
      const count = (counts.get(p.sign) || 0) + 1
      counts.set(p.sign, count)
      if (count > maxCount) {
        maxCount = count
        mostFrequentSign = p.sign
      }
    }

    // If the most frequent sign appears in a majority of the recent frames
    if (maxCount >= Math.ceil(this.stabilityThreshold / 2)) {
      // Find the most recent prediction of this sign to return its confidence
      const latestPrediction = [...recent].reverse().find(p => p.sign === mostFrequentSign)
      return latestPrediction || null
    }

    return null
  }

  public getRawLatest(): Prediction | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null
  }
}
