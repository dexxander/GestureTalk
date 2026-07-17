import { ruleBasedClassifier } from './ruleBasedClassifier'
import { SequenceBuffer } from './sequenceBuffer'
import type { PredictionResult } from '../types/recognition'
import { useRecognitionStore } from '@/stores/recognitionStore'

class RecognitionService {
  private buffer = new SequenceBuffer()
  private isProcessing = false

  public processFrame(results: any): void {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      const { setIsRecognizing, setRawPrediction, addStableSign } = useRecognitionStore.getState()

      if (!results || !results.landmarks || results.landmarks.length === 0) {
        setIsRecognizing(false)
        setRawPrediction(null)
        this.buffer.clear()
        this.isProcessing = false
        return
      }

      setIsRecognizing(true)

      // Get first hand detected
      const landmarks = results.landmarks[0]
      const handedness = results.handednesses?.[0]?.[0]?.categoryName || 'Right'

      // Process via rule-based classifier
      const prediction = ruleBasedClassifier.classify(landmarks, handedness as 'Left' | 'Right')
      
      this.buffer.push(prediction)
      
      // Always update raw prediction for the UI meter
      setRawPrediction(prediction)

      // Get stabilized prediction
      const stablePrediction = this.buffer.getStablePrediction()
      if (stablePrediction) {
        addStableSign(stablePrediction.sign, stablePrediction.confidence)
        // Clear buffer after a stable sign is emitted to prevent repeating the same sign instantly
        this.buffer.clear() 
      }

    } catch (err) {
      console.error("Recognition processing error:", err)
    } finally {
      this.isProcessing = false
    }
  }
}

export const recognitionService = new RecognitionService()
