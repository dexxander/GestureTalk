import { useEffect, useCallback } from 'react'
import { useCameraStore } from '@/stores/cameraStore'
import { useShallow } from 'zustand/react/shallow'

export function useCameraDevices() {
  const { devices, selectedDeviceId, setDevices, setSelectedDevice } = useCameraStore(
    useShallow(state => ({
      devices: state.devices,
      selectedDeviceId: state.selectedDeviceId,
      setDevices: state.setDevices,
      setSelectedDevice: state.setSelectedDevice
    }))
  )

  const refresh = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput')
      setDevices(videoDevices)
      
      // Auto-select first device if none selected and devices exist
      if (!selectedDeviceId && videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId)
      } else if (selectedDeviceId) {
        // Verify selected device still exists
        const exists = videoDevices.some(d => d.deviceId === selectedDeviceId)
        if (!exists && videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }, [setDevices, setSelectedDevice, selectedDeviceId])

  // Listen for device changes (plugging/unplugging cameras)
  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refresh)
    
    // Initial fetch if permission might already be granted
    // (Actual permission prompt happens in useCamera start())
    refresh()

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refresh)
    }
  }, [refresh])

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId)
  }, [setSelectedDevice])

  return { devices, selectedDevice: selectedDeviceId, selectDevice, refresh }
}
