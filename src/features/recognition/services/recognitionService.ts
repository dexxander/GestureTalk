import { ruleBasedClassifier } from './ruleBasedClassifier'
import { SequenceBuffer } from './sequenceBuffer'
import { useRecognitionStore } from '@/stores/recognitionStore'

class RecognitionService {
  private buffer = new SequenceBuffer()
  private isProcessing = false
  private lastEmittedSign: string | null = null

  public processFrame(results: any): void {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      const { setRecognizing, setPrediction, addToPredictionHistory, appendToSentence } = useRecognitionStore.getState()

      if (!results || !results.hands || results.hands.length === 0) {
        setRecognizing(false)
        setPrediction(null, 0)
        this.buffer.clear()
        this.lastEmittedSign = null
        this.isProcessing = false
        return
      }

      setRecognizing(true)

      // Get first hand detected
      const hand = results.hands[0]
      const landmarks = hand.landmarks
      const handedness = hand.handedness || 'Right'

      // Process via rule-based classifier
      const prediction = ruleBasedClassifier.classify(landmarks, handedness as 'Left' | 'Right')
      
      this.buffer.push(prediction)
      
      // Always update raw prediction for the UI meter
      setPrediction(prediction.sign, prediction.confidence)

      // Get stabilized prediction
      const stablePrediction = this.buffer.getStablePrediction()
      if (stablePrediction && stablePrediction.sign !== this.lastEmittedSign) {
        addToPredictionHistory(stablePrediction)
        appendToSentence(stablePrediction.sign)
        this.lastEmittedSign = stablePrediction.sign
        this.buffer.clear() 
      } else if (stablePrediction && stablePrediction.sign === 'UNKNOWN') {
         this.lastEmittedSign = null
      }

    } catch (err) {
      console.error("Recognition processing error:", err)
    } finally {
      this.isProcessing = false
    }
  }
}

export const recognitionService = new RecognitionService()
