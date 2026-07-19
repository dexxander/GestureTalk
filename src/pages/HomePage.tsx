import { useEffect, useState } from 'react'
import { CameraView } from '@/features/camera/components/CameraView'
import { LandmarkOverlay } from '@/features/mediapipe/components/LandmarkOverlay'
import { LearningPanel } from '@/features/learning/components/LearningPanel'
import { useMediaPipe } from '@/features/mediapipe/hooks/useMediaPipe'
import { useLearnerStore } from '@/stores/learnerStore'
import { AlertCircle, Loader2 } from 'lucide-react'

export function HomePage() {
  const { isReady: isMediaPipeReady, error: mpError } = useMediaPipe()
  const initializeLearner = useLearnerStore(state => state.initialize)
  const [isLabelsLoaded, setIsLabelsLoaded] = useState(false)

  // Fetch the 250 words from labels.json on mount
  useEffect(() => {
    async function loadLabels() {
      try {
        const res = await fetch('/model/labels.json')
        if (res.ok) {
          const data = await res.json()
          // Extract the string values (the words)
          const words = Object.values(data) as string[]
          initializeLearner(words)
          setIsLabelsLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load labels.json', err)
      }
    }
    loadLabels()
  }, [initializeLearner])

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pb-4">
      <header className="shrink-0">
        <h1 className="text-3xl font-display font-bold tracking-tight text-text mb-2">ASL Learning Studio</h1>
        <p className="text-text-secondary text-lg">Practice your sign language. Copy the sign to earn points!</p>
      </header>

      {mpError && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">Failed to load MediaPipe models: {mpError}</p>
        </div>
      )}

      {!isLabelsLoaded ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading ASL Dictionary...</p>
        </div>
      ) : (
        <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-[500px] lg:min-h-0">
          
          {/* Left Column - Camera */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[300px] lg:min-h-0">
            <div className="flex-1 bg-surface rounded-3xl border border-border/50 shadow-elevated overflow-hidden p-2">
              <CameraView 
                LandmarkOverlay={LandmarkOverlay}
                isMediaPipeReady={isMediaPipeReady}
                className="h-full w-full object-cover rounded-2xl" 
              />
            </div>
          </div>

          {/* Right Column - Learning Panel */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-[400px] lg:min-h-0">
            <LearningPanel />
          </div>

        </div>
      )}
    </div>
  )
}
