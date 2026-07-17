import { useEffect, useRef } from 'react'
import { mediaPipeService } from '../services/mediapipeService'
import { recognitionService } from '@/features/recognition/services/recognitionService'
import { useSettingsStore } from '@/stores/settingsStore'

export function useDetectionLoop(
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
  isReady: boolean
) {
  const requestRef = useRef<number>(0)
  const lastVideoTimeRef = useRef<number>(-1)
  const showLandmarks = useSettingsStore(state => state.showLandmarks)

  useEffect(() => {
    if (!isActive || !isReady || !videoElement) return

    const detectFrame = async () => {
      // Ensure video is playing and has valid dimensions
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
        // Only process if the video frame has advanced
        if (videoElement.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoElement.currentTime

          try {
            // Use performance.now() to ensure strictly monotonically increasing timestamps
            // across page navigation, since MediaPipe throws if the timestamp goes backwards.
            const results = await mediaPipeService.detectFrame(videoElement, performance.now())
            
            // Send results to recognition engine
            recognitionService.processFrame(results)
            
            // Dispatch event for UI overlays (like LandmarkOverlay)
            if (showLandmarks) {
              const event = new CustomEvent('mediapipe-results', { detail: results })
              window.dispatchEvent(event)
            } else {
              // Clear overlay if landmarks are hidden
              window.dispatchEvent(new CustomEvent('mediapipe-results', { detail: null }))
            }
          } catch (err) {
            console.error("Detection error:", err)
          }
        }
      }
      
      // Schedule next frame processing
      requestRef.current = requestAnimationFrame(detectFrame)
    }

    // Start loop
    requestRef.current = requestAnimationFrame(detectFrame)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      // Clear overlay on unmount
      window.dispatchEvent(new CustomEvent('mediapipe-results', { detail: null }))
    }
  }, [isActive, isReady, videoElement, showLandmarks])
}
