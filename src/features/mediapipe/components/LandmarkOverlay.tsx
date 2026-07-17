import { useEffect, useRef } from 'react'
import { HAND_CONNECTIONS } from '../types/landmarks'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRecognitionStore } from '@/stores/recognitionStore'

interface LandmarkOverlayProps {
  videoElement: HTMLVideoElement | null
}

export function LandmarkOverlay({ videoElement }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const showLandmarks = useSettingsStore(state => state.showLandmarks)
  const mirrorCamera = useSettingsStore(state => state.mirrorCamera)
  const currentSign = useRecognitionStore(state => state.currentSign)

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
        let minY = Infinity
        let minX = Infinity
        
        landmarks.forEach((landmark: any) => {
          const px = landmark.x * canvas.width
          const py = landmark.y * canvas.height
          if (py < minY) {
            minY = py
            minX = px
          }
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, 2 * Math.PI)
          ctx.fill()
        })

        // Draw predicted sign above hand
        if (currentSign && currentSign !== 'UNKNOWN') {
          ctx.save()
          // Undo mirror for text so it reads correctly
          if (isMirrored) {
            ctx.scale(-1, 1)
            minX = -minX // Flip X coordinate back to un-mirrored space for drawing text
          }
          
          ctx.font = 'bold 32px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          
          // Draw text shadow/stroke for visibility
          ctx.lineWidth = 4
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'
          ctx.strokeText(currentSign, minX, minY - 20)
          
          // Draw actual text
          ctx.fillStyle = '#10b981' // Success color
          ctx.fillText(currentSign, minX, minY - 20)
          
          ctx.restore()
        }
      })

      if (isMirrored) {
        ctx.restore()
      }
    }

    window.addEventListener('mediapipe-results', handleResults)
    
    return () => {
      window.removeEventListener('mediapipe-results', handleResults)
    }
  }, [videoElement, showLandmarks, mirrorCamera, currentSign])

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
