import type { DetectionResult } from '@/features/mediapipe/types/landmarks'
import { landmarkNormalizer } from './landmarkNormalizer'
import { temporalBuffer } from './temporalBuffer'
import { modelManager } from './modelManager'
import { predictionStabilizer } from './predictionStabilizer'
import { useRecognitionStore } from '@/stores/recognitionStore'

class TransformerPipeline {
  private isProcessing = false
  private lastEmittedSign: string | null = null

  public async processFrame(results: DetectionResult): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      const { setRecognizing, setPrediction, addToPredictionHistory, appendToSentence } = useRecognitionStore.getState()

      if (!results || (!results.hands?.length && !results.pose)) {
        setRecognizing(false)
        setPrediction(null, 0)
        temporalBuffer.clear()
        predictionStabilizer.clear()
        this.lastEmittedSign = null
        this.isProcessing = false
        return
      }

      setRecognizing(true)

      // 1. Normalize landmarks
      const features = landmarkNormalizer.normalize(results)

      // 2. Add to sequence buffer
      temporalBuffer.push(features)

      // 3. Predict if buffer is warm and model is loaded
      if (modelManager.getIsLoaded() && temporalBuffer.isWarm()) {
        const sequence = temporalBuffer.getSequence()
        const rawPrediction = await modelManager.predict(sequence)

        if (rawPrediction) {
          // Update raw prediction for UI (like the confidence meter)
          setPrediction(rawPrediction.sign, rawPrediction.confidence)

          // 4. Stabilize prediction
          const stablePrediction = predictionStabilizer.process(rawPrediction)

          // 5. Emit if a stable, new sign was detected
          if (stablePrediction && stablePrediction.sign !== this.lastEmittedSign) {
            addToPredictionHistory(stablePrediction)
            appendToSentence(stablePrediction.sign)
            this.lastEmittedSign = stablePrediction.sign
            
            // Optionally clear temporal buffer after emitting to enforce distinct gestures,
            // but for continuous sequence models, keeping the buffer might be better.
            // temporalBuffer.clear()
            
            // Clear just the stabilizer to prevent rapid re-emissions
            predictionStabilizer.clear()
          } else if (stablePrediction && stablePrediction.sign === 'UNKNOWN') {
            this.lastEmittedSign = null
          }
        }
      }
    } catch (err) {
      console.error('[TransformerPipeline] Error processing frame:', err)
    } finally {
      this.isProcessing = false
    }
  }
  
  public reset() {
    temporalBuffer.clear()
    predictionStabilizer.clear()
    this.lastEmittedSign = null
    this.isProcessing = false
  }
}

export const transformerPipeline = new TransformerPipeline()
