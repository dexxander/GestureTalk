import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { CameraView } from '@/features/camera/components/CameraView'
import { Database, Download, Play, Square, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMediaPipe } from '@/features/mediapipe/hooks/useMediaPipe'
import type { DetectionResult } from '@/features/mediapipe/types/landmarks'

export function DataStudioPage() {
  const { isReady, error: mpError } = useMediaPipe()
  const [currentLabel, setCurrentLabel] = useState('A')
  const [isRecording, setIsRecording] = useState(false)
  const [dataset, setDataset] = useState<{ label: string; landmarks: number[] }[]>([])
  const [framesRecorded, setFramesRecorded] = useState(0)
  const targetFrames = 100

  // The labels we want to train on (A-Z)
  const LABELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

  // Listen for MediaPipe results
  useEffect(() => {
    if (!isRecording) return

    const handleResults = (e: Event) => {
      const customEvent = e as CustomEvent<DetectionResult | null>
      const results = customEvent.detail
      
      // If no hands detected, don't record the frame
      if (!results || !results.hands || results.hands.length === 0) return

      // Flatten the 21 landmarks into a 63-number array (x, y, z)
      // Using worldLandmarks for true 3D spatial properties that are independent of camera angle
      const hand = results.hands[0]
      const landmarks = hand.worldLandmarks && hand.worldLandmarks.length > 0 ? hand.worldLandmarks : hand.landmarks
      
      const flatLandmarks = landmarks.flatMap(l => [l.x, l.y, l.z || 0])

      setDataset(prev => [...prev, { label: currentLabel, landmarks: flatLandmarks }])
      setFramesRecorded(prev => {
        const next = prev + 1
        if (next >= targetFrames) {
          setIsRecording(false)
        }
        return next
      })
    }

    window.addEventListener('mediapipe-results', handleResults)
    return () => window.removeEventListener('mediapipe-results', handleResults)
  }, [isRecording, currentLabel])

  const startRecording = useCallback(() => {
    setFramesRecorded(0)
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  const downloadDataset = useCallback(() => {
    const dataStr = JSON.stringify(dataset, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gesture_dataset_${dataset.length}_samples.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [dataset])

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-8 bg-surface">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 text-primary rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">Data Collection Studio</h1>
            <p className="text-text-muted">Record custom hand signs to train your Neural Network.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Camera */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-elevated rounded-2xl p-4 ring-1 ring-white/10">
              <CameraView />
            </div>

            {mpError && (
              <div className="p-4 bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span>MediaPipe Error: {mpError}</span>
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            
            {/* Label Selector */}
            <div className="bg-surface-elevated rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
              <h2 className="text-lg font-semibold text-text border-b border-white/10 pb-2">1. Select Target Sign</h2>
              <div className="grid grid-cols-5 gap-2">
                {LABELS.map(label => (
                  <button
                    key={label}
                    onClick={() => setCurrentLabel(label)}
                    disabled={isRecording}
                    className={`h-12 rounded-xl text-lg font-bold transition-all ${
                      currentLabel === label
                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                        : 'bg-surface hover:bg-surface-hover text-text disabled:opacity-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-surface-elevated rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
              <h2 className="text-lg font-semibold text-text border-b border-white/10 pb-2">2. Record Data</h2>
              <p className="text-sm text-text-muted">
                Hold your hand up in the sign for "{currentLabel}". Click record and hold still until it finishes capturing 100 frames.
              </p>
              
              <div className="flex flex-col gap-4 pt-2">
                {!isRecording ? (
                  <Button onClick={startRecording} disabled={!isReady} className="w-full h-14 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Recording '{currentLabel}'
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="danger" className="w-full h-14 text-lg animate-pulse">
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-text font-medium">{framesRecorded} / {targetFrames} frames</span>
                  </div>
                  <div className="h-3 bg-surface rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${(framesRecorded / targetFrames) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dataset Management */}
            <div className="bg-surface-elevated rounded-2xl p-6 ring-1 ring-white/10 space-y-4">
              <h2 className="text-lg font-semibold text-text border-b border-white/10 pb-2">3. Export Dataset</h2>
              
              <div className="flex justify-between items-center bg-surface p-4 rounded-xl">
                <div>
                  <div className="text-2xl font-bold text-text">{dataset.length}</div>
                  <div className="text-sm text-text-muted">Total Samples</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setDataset([])} title="Clear Dataset">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button variant="primary" onClick={downloadDataset} disabled={dataset.length === 0}>
                    <Download className="w-5 h-5 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
