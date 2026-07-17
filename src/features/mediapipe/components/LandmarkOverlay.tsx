import { useEffect, useRef } from 'react'
import { HAND_CONNECTIONS } from '../types/landmarks'
import { useSettingsStore } from '@/stores/settingsStore'

interface LandmarkOverlayProps {
  videoElement: HTMLVideoElement | null
}

export function LandmarkOverlay({ videoElement }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const showLandmarks = useSettingsStore(state => state.showLandmarks)
  const mirrorCamera = useSettingsStore(state => state.mirrorCamera)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoElement) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResults = (e: Event) => {
      const customEvent = e as CustomEvent
      const results = customEvent.detail

      // Match canvas size to video display size
      canvas.width = videoElement.clientWidth
      canvas.height = videoElement.clientHeight
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!showLandmarks) return
      if (!results || !results.hands || results.hands.length === 0) return

      const isMirrored = mirrorCamera
      if (isMirrored) {
        ctx.save()
        ctx.scale(-1, 1)
        ctx.translate(-canvas.width, 0)
      }

      // Draw each hand
      results.hands.forEach((hand: any) => {
        const landmarks = hand.landmarks
        
        // Draw connections
        ctx.strokeStyle = '#06b6d4' // Accent color
        ctx.lineWidth = 2
        
        for (const connection of HAND_CONNECTIONS) {
          const start = landmarks[connection.start]
          const end = landmarks[connection.end]
          
          ctx.beginPath()
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
          ctx.stroke()
        }

        // Draw landmarks
        ctx.fillStyle = '#6366f1' // Primary color
        landmarks.forEach((landmark: any) => {
          ctx.beginPath()
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI)
          ctx.fill()
        })
      })

      if (isMirrored) {
        ctx.restore()
      }
    }

    window.addEventListener('mediapipe-results', handleResults)
    
    return () => {
      window.removeEventListener('mediapipe-results', handleResults)
    }
  }, [videoElement, showLandmarks, mirrorCamera])

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
