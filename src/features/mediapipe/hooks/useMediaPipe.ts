import { useEffect, useState } from 'react'
import { mediaPipeService } from '../services/mediapipeService'

export function useMediaPipe() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await mediaPipeService.initialize()
        if (mounted) setIsReady(true)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to initialize MediaPipe')
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  return { isReady, error }
}
