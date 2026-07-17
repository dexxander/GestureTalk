import { Play, Square, FlipHorizontal, Eye, EyeOff, Maximize2, Video, VideoOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCameraStore } from '@/stores/cameraStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useCameraDevices } from '../hooks/useCameraDevices'
import { useShallow } from 'zustand/react/shallow'
import { Tooltip } from '@/components/ui/Tooltip'

interface CameraControlsProps {
  onToggleCamera: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

export function CameraControls({ onToggleCamera, onToggleFullscreen, isFullscreen }: CameraControlsProps) {
  const isActive = useCameraStore(state => state.isActive)
  const { devices, selectedDevice, selectDevice } = useCameraDevices()
  
  const { mirrorCamera, setMirrorCamera, showLandmarks, setShowLandmarks } = useSettingsStore(
    useShallow(state => ({
      mirrorCamera: state.mirrorCamera,
      setMirrorCamera: state.setMirrorCamera,
      showLandmarks: state.showLandmarks,
      setShowLandmarks: state.setShowLandmarks
    }))
  )

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 shadow-elevated z-30 transition-all duration-300">
      
      {/* Start/Stop Button */}
      <Tooltip content={isActive ? "Stop Camera" : "Start Camera"} position="top">
        <button
          onClick={onToggleCamera}
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-xl transition-all",
            isActive 
              ? "bg-danger/20 text-danger hover:bg-danger/30" 
              : "bg-primary text-white hover:bg-primary-hover shadow-sm"
          )}
        >
          {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
      </Tooltip>

      <div className="w-[1px] h-8 bg-border/50 mx-1" />

      {/* Device Selector */}
      {devices.length > 1 && (
        <Tooltip content="Switch Camera" position="top">
          <div className="relative group">
            <select
              value={selectedDevice || ''}
              onChange={(e) => selectDevice(e.target.value)}
              className="appearance-none bg-transparent hover:bg-surface-hover text-text w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors focus:outline-none opacity-0 absolute inset-0 z-10"
              title="Select Camera"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId} className="bg-surface text-text">
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-secondary transition-colors group-hover:text-text pointer-events-none">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </Tooltip>
      )}

      {/* Mirror Toggle */}
      <Tooltip content="Mirror Camera" position="top">
        <button
          onClick={() => setMirrorCamera(!mirrorCamera)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-xl transition-colors",
            mirrorCamera ? "bg-primary/20 text-primary" : "hover:bg-surface-hover text-text-secondary hover:text-text"
          )}
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </Tooltip>

      {/* Landmarks Toggle */}
      <Tooltip content={showLandmarks ? "Hide Landmarks" : "Show Landmarks"} position="top">
        <button
          onClick={() => setShowLandmarks(!showLandmarks)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-xl transition-colors",
            showLandmarks ? "bg-primary/20 text-primary" : "hover:bg-surface-hover text-text-secondary hover:text-text"
          )}
        >
          {showLandmarks ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </Tooltip>

      <div className="w-[1px] h-8 bg-border/50 mx-1" />

      {/* Fullscreen Toggle */}
      <Tooltip content="Fullscreen" position="top">
        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-secondary hover:text-text transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </Tooltip>

    </div>
  )
}
