import { useRef, useCallback, useEffect } from 'react'
import { useCameraStore } from '@/stores/cameraStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useShallow } from 'zustand/react/shallow'

const RESOLUTION_MAP = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
} as const

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const { 
    isActive, 
    stream, 
    setActive, 
    setStream, 
    setError, 
    setPermission, 
    setDevices, 
    selectedDeviceId 
  } = useCameraStore(
    useShallow(state => ({
      isActive: state.isActive,
      stream: state.stream,
      setActive: state.setActive,
      setStream: state.setStream,
      setError: state.setError,
      setPermission: state.setPermission,
      setDevices: state.setDevices,
      selectedDeviceId: state.selectedDeviceId
    }))
  )

  const { cameraResolution } = useSettingsStore(
    useShallow(state => ({
      cameraResolution: state.cameraResolution
    }))
  )
  
  const start = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: RESOLUTION_MAP[cameraResolution].width },
          height: { ideal: RESOLUTION_MAP[cameraResolution].height },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false,
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setStream(mediaStream)
      setPermission('granted')
      setActive(true)
      setError(null)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure the video plays and handles the promise correctly
        videoRef.current.play().catch(e => {
          console.error("Error playing video:", e)
        })
      }
      
      // Enumerate devices after permission granted
      const devices = await navigator.mediaDevices.enumerateDevices()
      setDevices(devices.filter(d => d.kind === 'videoinput'))
      
    } catch (err) {
      console.error("Camera start error:", err)
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermission('denied')
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
         setError('No camera found. Please ensure your camera is connected.')
      } else {
        setError(err instanceof Error ? err.message : 'Camera error')
      }
      setActive(false)
    }
  }, [selectedDeviceId, cameraResolution, setStream, setPermission, setActive, setError, setDevices])
  
  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
    }
    setStream(null)
    setActive(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream, setStream, setActive])
  
  // Cleanup on unmount or when dependencies change such that we want to stop the old stream
  useEffect(() => { 
    return () => { stop() } 
  }, [stop])
  
  return { videoRef, isActive, start, stop }
}
