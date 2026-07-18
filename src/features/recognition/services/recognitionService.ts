import { mlClassifier } from './mlClassifier'
import { SequenceBuffer } from './sequenceBuffer'
import { transformerPipeline } from './transformerPipeline'
import { modelManager } from './modelManager'
import { useRecognitionStore } from '@/stores/recognitionStore'

class RecognitionService {
  private buffer = new SequenceBuffer()
  private isProcessing = false
  private lastEmittedSign: string | null = null

  public async processFrame(results: any): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      // Primary Route: Use the new ONNX Transformer Pipeline
      if (modelManager.getIsLoaded()) {
        await transformerPipeline.processFrame(results)
        return
      }

      // Fallback Route: Use the old ML MLP classifier / rule-based classifier
      const { setRecognizing, setPrediction, addToPredictionHistory, appendToSentence } = useRecognitionStore.getState()

      if (!results || !results.hands || results.hands.length === 0) {
        setRecognizing(false)
        setPrediction(null, 0)
        this.buffer.clear()
        this.lastEmittedSign = null
        return
      }

      setRecognizing(true)

      // Get first hand detected
      const hand = results.hands[0]
      const landmarks = hand.worldLandmarks && hand.worldLandmarks.length > 0 ? hand.worldLandmarks : hand.landmarks
      const handedness = hand.handedness || 'Right'

      const prediction = mlClassifier.classify(landmarks, handedness as 'Left' | 'Right')
      
      this.buffer.push(prediction)
      setPrediction(prediction.sign, prediction.confidence)

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
