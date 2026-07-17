import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { VideoOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCameraStore } from '@/stores/cameraStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useCamera } from '../hooks/useCamera'
import { CameraControls } from './CameraControls'
import { CameraPermission } from './CameraPermission'
import { FPSCounter } from './FPSCounter'
import { useDetectionLoop } from '@/features/mediapipe/hooks/useDetectionLoop'

// Placeholder until MediaPipe component is built
function LandmarkOverlayPlaceholder({ videoElement: _ }: { videoElement: HTMLVideoElement | null }) {
  return null
}

interface CameraViewProps {
  className?: string
  LandmarkOverlay?: React.ComponentType<{ videoElement: HTMLVideoElement | null }>
  isMediaPipeReady?: boolean
}

export function CameraView({ className, LandmarkOverlay = LandmarkOverlayPlaceholder, isMediaPipeReady = false }: CameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { videoRef, isActive, start, stop } = useCamera()
  const error = useCameraStore(state => state.error)
  const mirrorCamera = useSettingsStore(state => state.mirrorCamera)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Initialize detection loop with the actual video ref
  useDetectionLoop(videoRef.current, isActive, isMediaPipeReady)

  // Start camera on mount if previously active or if we have permission
  useEffect(() => {
    // If not denied, attempt start. If prompt needed, useCamera will handle it via getUserMedia
    start()
    return () => stop()
  }, [start, stop])

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-surface-active rounded-2xl overflow-hidden group flex items-center justify-center",
        isFullscreen && "rounded-none",
        className
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0",
          mirrorCamera && "scale-x-[-1]",
          isActive && !error ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Landmark Overlay */}
      {isActive && !error && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <LandmarkOverlay videoElement={videoRef.current} />
        </div>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-danger/10 backdrop-blur-sm"
          >
            <AlertCircle className="w-12 h-12 text-danger mb-4" />
            <p className="text-danger font-medium text-center px-4 max-w-md">{error}</p>
            <button 
              onClick={start}
              className="mt-6 px-4 py-2 bg-surface hover:bg-surface-hover text-text rounded-lg border border-border shadow-sm transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline State */}
      <AnimatePresence>
        {!isActive && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
              <VideoOff className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-muted font-medium">Camera is off</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Overlay */}
      <CameraPermission />

      {/* FPS Counter */}
      {isActive && !error && (
        <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <FPSCounter />
        </div>
      )}

      {/* Controls */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <CameraControls 
          onToggleCamera={isActive ? stop : start}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>

    </div>
  )
}
