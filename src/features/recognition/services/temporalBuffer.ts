export class TemporalBuffer {
  private buffer: Float32Array[] = []
  private readonly maxFrames: number
  private readonly featureDim: number

  constructor(maxFrames: number = 30, featureDim: number = 1629) {
    this.maxFrames = maxFrames
    this.featureDim = featureDim
  }

  /**
   * Add a new frame of features to the buffer.
   */
  public push(features: Float32Array): void {
    if (features.length !== this.featureDim) {
      console.warn(`[TemporalBuffer] Expected ${this.featureDim} features, got ${features.length}`)
    }
    
    this.buffer.push(features)
    
    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift()
    }
  }

  /**
   * Returns a flattened Float32Array of shape [maxFrames * featureDim].
   * If the buffer is not full, the missing frames at the beginning are zero-padded.
   */
  public getSequence(): Float32Array {
    const sequence = new Float32Array(this.maxFrames * this.featureDim)
    
    // Calculate how many frames to pad at the start
    const padFrames = this.maxFrames - this.buffer.length
    
    // Copy existing frames into the sequence array
    for (let i = 0; i < this.buffer.length; i++) {
      const offset = (padFrames + i) * this.featureDim
      sequence.set(this.buffer[i], offset)
    }
    
    return sequence
  }

  /**
   * Checks if the buffer has enough frames to make a reliable prediction.
   * e.g., at least 15 frames (half a second at 30 FPS).
   */
  public isWarm(minFrames: number = 15): boolean {
    return this.buffer.length >= minFrames
  }

  /**
   * Clear the buffer
   */
  public clear(): void {
    this.buffer = []
  }
}

// Export a singleton instance for the main pipeline
export const temporalBuffer = new TemporalBuffer()
