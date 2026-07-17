import * as tf from '@tensorflow/tfjs'
import type { NormalizedLandmark } from '@/features/mediapipe/types/landmarks'
import type { Prediction } from '../types/recognition'
import { ruleBasedClassifier } from './ruleBasedClassifier'

class MLClassifier {
  private model: tf.LayersModel | null = null
  private labelMap: Record<number, string> = {}
  private isLoaded = false
  private loadAttempted = false

  constructor() {
    this.loadModel()
  }

  private async loadModel() {
    if (this.loadAttempted) return
    this.loadAttempted = true

    try {
      console.log('[MLClassifier] Attempting to load TensorFlow.js model...')
      
      // Load the trained neural network model
      this.model = await tf.loadLayersModel('/model/model.json')
      
      // Load the label mapping
      const response = await fetch('/model/labels.json')
      if (response.ok) {
        this.labelMap = await response.json()
        this.isLoaded = true
        console.log('[MLClassifier] Successfully loaded ML model and labels!')
      } else {
        throw new Error('Could not fetch labels.json')
      }
    } catch (err) {
      console.warn('[MLClassifier] ML Model not found or failed to load. The app will fall back to the Rule-Based Classifier. To use ML, please go to the Data Studio, collect data, and run the Python training script.', err)
      this.isLoaded = false
    }
  }

  public classify(landmarks: NormalizedLandmark[], handedness: 'Left' | 'Right'): Prediction {
    // Fallback to the rule-based classifier if the ML model hasn't been trained/loaded yet
    if (!this.isLoaded || !this.model) {
      return ruleBasedClassifier.classify(landmarks, handedness)
    }

    try {
      // Pre-process landmarks exactly as the Kaggle dataset did
      const imageWidth = 640
      const imageHeight = 480

      // 1. Convert to pixel coordinates
      const pixelCoords = landmarks.map(l => ({
        x: Math.min(Math.floor(l.x * imageWidth), imageWidth - 1),
        y: Math.min(Math.floor(l.y * imageHeight), imageHeight - 1)
      }))

      // 2. Make relative to wrist (index 0)
      const baseX = pixelCoords[0].x
      const baseY = pixelCoords[0].y
      
      const relativeCoords = pixelCoords.map(p => ({
        x: p.x - baseX,
        y: p.y - baseY
      }))

      // 3. Flatten to 1D array of 42 values
      const flatCoords = relativeCoords.flatMap(p => [p.x, p.y])

      // 4. Normalize by max absolute value
      const maxVal = Math.max(...flatCoords.map(Math.abs), 1)
      const normalizedCoords = flatCoords.map(val => val / maxVal)

      // Run inference
      return tf.tidy(() => {
        const inputTensor = tf.tensor2d([normalizedCoords]) // Shape: [1, 42]
        
        // Predict
        const prediction = this.model!.predict(inputTensor) as tf.Tensor
        
        // Get the highest probability index
        const scores = prediction.dataSync()
        const maxIndex = prediction.argMax(1).dataSync()[0]
        const maxScore = scores[maxIndex]
        
        // Get the actual letter from the label map
        const predictedLabel = this.labelMap[maxIndex] || 'UNKNOWN'

        // Only return it if confidence is somewhat decent (e.g. > 0.4)
        if (maxScore > 0.4) {
          return {
            sign: predictedLabel,
            confidence: maxScore,
            timestamp: Date.now(),
            type: 'letter' as const
          }
        }
        
        return {
          sign: 'UNKNOWN',
          confidence: 0,
          timestamp: Date.now(),
          type: 'gesture' as const
        }
      })
    } catch (err) {
      console.error('[MLClassifier] Inference error:', err)
      return {
        sign: 'UNKNOWN',
        confidence: 0,
        timestamp: Date.now(),
        type: 'gesture' as const
      }
    }
  }
}

export const mlClassifier = new MLClassifier()
