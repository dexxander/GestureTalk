
import { CameraView } from '@/features/camera/components/CameraView'
import { LandmarkOverlay } from '@/features/mediapipe/components/LandmarkOverlay'
import { TranslationPanel } from '@/features/recognition/components/TranslationPanel'
import { useMediaPipe } from '@/features/mediapipe/hooks/useMediaPipe'
import { useDetectionLoop } from '@/features/mediapipe/hooks/useDetectionLoop'
import { useCamera } from '@/features/camera/hooks/useCamera'
import { useCameraStore } from '@/stores/cameraStore'
import { AlertCircle } from 'lucide-react'

export function HomePage() {
  const { isReady: isMediaPipeReady, error: mpError } = useMediaPipe()
  const isActive = useCameraStore(state => state.isActive)
  const { videoRef } = useCamera() // Just to pass the ref to detection loop

  // Initialize detection loop
  useDetectionLoop(videoRef.current, isActive, isMediaPipeReady)

  return (
    <div className="flex flex-col h-full gap-6">
      <header>
        <h1 className="text-3xl font-display font-bold tracking-tight text-text mb-2">Live Translation</h1>
        <p className="text-text-secondary text-lg">Real-time ASL fingerspelling recognition.</p>
      </header>

      {mpError && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">Failed to load MediaPipe models: {mpError}</p>
        </div>
      )}

      <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column - Camera */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
          <div className="flex-1 bg-surface rounded-3xl border border-border/50 shadow-elevated overflow-hidden p-2">
            <CameraView 
              LandmarkOverlay={LandmarkOverlay}
              className="h-full w-full object-cover rounded-2xl" 
            />
          </div>
        </div>

        {/* Right Column - Translation Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0">
          <TranslationPanel />
        </div>

      </div>
    </div>
  )
}
