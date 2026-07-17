import { motion } from 'motion/react'
import { Camera } from 'lucide-react'
import { useCameraStore } from '@/stores/cameraStore'

export function CameraPermission() {
  const permissionState = useCameraStore(state => state.permissionState)
  const setPermission = useCameraStore(state => state.setPermission)

  // Don't render if granted
  if (permissionState === 'granted') return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-md rounded-2xl"
    >
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary">
        <Camera className="w-8 h-8" />
      </div>
      
      <h2 className="text-xl font-bold text-text mb-2">Camera Access Required</h2>
      <p className="text-text-secondary text-center max-w-sm mb-8 px-4">
        {permissionState === 'denied' 
          ? 'Camera access is currently blocked. Please update your browser settings to allow GestureTalk to see your signs.'
          : 'GestureTalk needs access to your camera to recognize sign language.'}
      </p>

      {permissionState !== 'denied' && (
        <button
          onClick={() => setPermission('prompt')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover active:bg-primary-active transition-colors shadow-elevated"
        >
          Enable Camera
        </button>
      )}

      {permissionState === 'denied' && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl max-w-xs text-center">
          <p className="text-danger text-sm font-medium">
            Please click the camera icon in your browser's address bar to reset permissions, then refresh the page.
          </p>
        </div>
      )}
    </motion.div>
  )
}
