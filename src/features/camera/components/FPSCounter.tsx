import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface FPSCounterProps {
  className?: string
  onFpsChange?: (fps: number) => void
}

export function FPSCounter({ className, onFpsChange }: FPSCounterProps) {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const tick = () => {
      const now = performance.now()
      frameCount++

      if (now - lastTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastTime))
        setFps(currentFps)
        onFpsChange?.(currentFps)
        frameCount = 0
        lastTime = now
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [onFpsChange])

  // Determine color
  const colorClass = fps >= 24 ? 'text-success' : fps >= 15 ? 'text-warning' : 'text-danger'

  return (
    <div 
      className={cn(
        'px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-mono font-medium border border-white/10 shadow-sm',
        colorClass,
        className
      )}
    >
      {fps} FPS
    </div>
  )
}
