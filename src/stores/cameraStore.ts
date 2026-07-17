import { create } from 'zustand'

/**
 * Camera state store – session-only, never persisted.
 *
 * Manages the lifecycle of the camera stream, device enumeration,
 * permission state, and real-time FPS metrics.
 *
 * @example Selecting an object slice (wrap with useShallow):
 * ```ts
 * import { useShallow } from 'zustand/react/shallow'
 * const { isActive, stream } = useCameraStore(
 *   useShallow(s => ({ isActive: s.isActive, stream: s.stream }))
 * )
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PermissionState = 'prompt' | 'granted' | 'denied'

export interface CameraState {
  /** Whether the camera is currently active and streaming. */
  isActive: boolean
  /** The active MediaStream instance, or null when inactive. */
  stream: MediaStream | null
  /** List of available video input devices. */
  devices: MediaDeviceInfo[]
  /** The currently selected device ID, or null for default. */
  selectedDeviceId: string | null
  /** Current measured frames per second. */
  fps: number
  /** Whether camera permission has been granted at least once this session. */
  isPermissionGranted: boolean
  /** Current browser permission state for the camera. */
  permissionState: PermissionState
  /** Human-readable error message, or null when healthy. */
  error: string | null

  // ── Actions ──────────────────────────────────────────────────────────
  setActive: (active: boolean) => void
  setStream: (stream: MediaStream | null) => void
  setDevices: (devices: MediaDeviceInfo[]) => void
  setSelectedDevice: (deviceId: string) => void
  setFps: (fps: number) => void
  setPermission: (state: PermissionState) => void
  setError: (error: string | null) => void
  /** Stop all tracks and reset the store to its initial state. */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Initial state (everything except actions)
// ---------------------------------------------------------------------------

const INITIAL_STATE: Omit<
  CameraState,
  'setActive' | 'setStream' | 'setDevices' | 'setSelectedDevice' | 'setFps' | 'setPermission' | 'setError' | 'reset'
> = {
  isActive: false,
  stream: null,
  devices: [],
  selectedDeviceId: null,
  fps: 0,
  isPermissionGranted: false,
  permissionState: 'prompt',
  error: null,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCameraStore = create<CameraState>()((set, get) => ({
  ...INITIAL_STATE,

  setActive: (active) => {
    set({ isActive: active })
  },

  setStream: (stream) => {
    set({ stream, isActive: stream !== null, error: null })
  },

  setDevices: (devices) => {
    set({ devices })
  },

  setSelectedDevice: (deviceId) => {
    set({ selectedDeviceId: deviceId })
  },

  setFps: (fps) => {
    set({ fps })
  },

  setPermission: (state) => {
    set({
      permissionState: state,
      isPermissionGranted: state === 'granted',
    })
  },

  setError: (error) => {
    set({ error })
  },

  reset: () => {
    // Stop any active tracks before resetting
    const { stream } = get()
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    set(INITIAL_STATE)
  },
}))
