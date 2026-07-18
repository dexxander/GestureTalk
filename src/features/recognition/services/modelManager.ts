import * as ort from 'onnxruntime-web'
import type { Prediction } from '../types/recognition'

// Point to the CDN for WASM binaries so we don't have to worry about Vite bundling them
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/'

export class ModelManager {
  private session: ort.InferenceSession | null = null
  private labelMap: Record<number, string> = {}
  private isLoaded = false
  private loadAttempted = false

  public async loadModel(): Promise<void> {
    if (this.loadAttempted) return
    this.loadAttempted = true

    try {
      console.log('[ModelManager] Initializing ONNX Runtime Web...')
      
      // Load labels
      const response = await fetch('/model/labels.json')
      if (response.ok) {
        this.labelMap = await response.json()
      } else {
        throw new Error('Could not fetch labels.json')
      }

      // Load ONNX model
      // We prefer webgl/wasm over webgpu for now due to stability, but you can configure execution providers here.
      this.session = await ort.InferenceSession.create('/model/transformer.onnx', {
        executionProviders: ['wasm']
      })
      
      // Warm up the model
      const dummyInput = new Float32Array(1 * 30 * 153)
      const tensor = new ort.Tensor('float32', dummyInput, [1, 30, 153])
      const feeds: Record<string, ort.Tensor> = {}
      feeds[this.session.inputNames[0]] = tensor
      await this.session.run(feeds)
      
      this.isLoaded = true
      console.log('[ModelManager] Successfully loaded ONNX Transformer model!')
    } catch (err) {
      console.warn('[ModelManager] Failed to load ONNX model. Falling back to rule-based or previous ML classifier.', err)
      this.isLoaded = false
    }
  }

  public getIsLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * Run inference on a 30-frame sequence.
   * Input should be a Float32Array of length 30 * 153.
   */
  public async predict(sequence: Float32Array): Promise<Prediction | null> {
    if (!this.isLoaded || !this.session) return null

    try {
      // Shape: batch_size=1, sequence_length=30, features=153
      const tensor = new ort.Tensor('float32', sequence, [1, 30, 153])
      const feeds: Record<string, ort.Tensor> = {}
      feeds[this.session.inputNames[0]] = tensor

      const results = await this.session.run(feeds)
      
      // Assume the output is the first output tensor
      const outputTensor = results[this.session.outputNames[0]]
      const logits = outputTensor.data as Float32Array

      // Find max logit (argmax)
      let maxIndex = 0
      let maxLogit = -Infinity
      for (let i = 0; i < logits.length; i++) {
        if (logits[i] > maxLogit) {
          maxLogit = logits[i]
          maxIndex = i
        }
      }

      // Simple softmax for confidence of the top class
      let sumExp = 0
      for (let i = 0; i < logits.length; i++) {
        sumExp += Math.exp(logits[i])
      }
      const confidence = Math.exp(maxLogit) / sumExp

      const sign = this.labelMap[maxIndex] || 'UNKNOWN'

      return {
        sign,
        confidence,
        timestamp: Date.now(),
        type: 'letter' // Or 'word', depending on what was trained
      }
    } catch (err) {
      console.error('[ModelManager] Inference error:', err)
      return null
    }
  }
}

export const modelManager = new ModelManager()
