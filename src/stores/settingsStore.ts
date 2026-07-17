import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Application-wide user settings.
 *
 * Persisted to localStorage under the key `gesturetalk-settings`.
 *
 * @example Selecting a single primitive value (no useShallow needed):
 * ```ts
 * const sensitivity = useSettingsStore(s => s.recognitionSensitivity)
 * ```
 *
 * @example Selecting an object slice (wrap with useShallow to avoid re-renders):
 * ```ts
 * import { useShallow } from 'zustand/react/shallow'
 * const { speechRate, speechPitch } = useSettingsStore(
 *   useShallow(s => ({ speechRate: s.speechRate, speechPitch: s.speechPitch }))
 * )
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecognitionModel = 'rule-based' | 'transformer'
export type CameraResolution = '480p' | '720p' | '1080p'
export type Theme = 'dark' | 'light' | 'system'
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
export type SignLanguage = 'asl' | 'bsl' | 'bim' | 'jsl'

export interface SettingsState {
  // ── Recognition ──────────────────────────────────────────────────────
  /** Sensitivity of the gesture recognition (0-100). Higher = more responsive. */
  recognitionSensitivity: number
  /** Minimum confidence percentage to accept a prediction (0-100). */
  confidenceThreshold: number
  /** Which recognition model to use for classification. */
  recognitionModel: RecognitionModel

  // ── Camera ───────────────────────────────────────────────────────────
  /** Device ID of the user-selected camera, or null for the default camera. */
  selectedCameraId: string | null
  /** Preferred camera capture resolution. */
  cameraResolution: CameraResolution
  /** Whether to horizontally flip the camera feed (selfie mode). */
  mirrorCamera: boolean
  /** Whether to render hand/pose/face landmarks on the video overlay. */
  showLandmarks: boolean

  // ── Speech ───────────────────────────────────────────────────────────
  /** The SpeechSynthesis voice URI to use, or null for the browser default. */
  selectedVoiceURI: string | null
  /** Speech synthesis rate (0.5 – 2.0). */
  speechRate: number
  /** Speech synthesis pitch (0.5 – 2.0). */
  speechPitch: number
  /** Speech synthesis volume (0 – 1). */
  speechVolume: number
  /** Automatically speak recognized sentences once completed. */
  autoSpeak: boolean

  // ── Appearance ───────────────────────────────────────────────────────
  /** Color theme preference. */
  theme: Theme
  /** Enable high-contrast mode for better visibility. */
  highContrast: boolean
  /** Increase base font size for readability. */
  largeFont: boolean
  /** Color-blind simulation / palette adjustment. */
  colorBlindMode: ColorBlindMode
  /** Reduce or disable non-essential animations. */
  reducedMotion: boolean

  // ── Language ─────────────────────────────────────────────────────────
  /** The sign language variant used for recognition & learning. */
  signLanguage: SignLanguage
  /** BCP 47 language tag for the UI locale (e.g. "en-US"). */
  uiLanguage: string

  // ── Actions ──────────────────────────────────────────────────────────
  /** Update a single setting by key. */
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  /** Reset all settings to their defaults. */
  resetSettings: () => void
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: Omit<SettingsState, 'updateSetting' | 'resetSettings'> = {
  // Recognition
  recognitionSensitivity: 70,
  confidenceThreshold: 60,
  recognitionModel: 'rule-based',

  // Camera
  selectedCameraId: null,
  cameraResolution: '720p',
  mirrorCamera: true,
  showLandmarks: true,

  // Speech
  selectedVoiceURI: null,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 0.8,
  autoSpeak: false,

  // Appearance
  theme: 'dark',
  highContrast: false,
  largeFont: false,
  colorBlindMode: 'none',
  reducedMotion: false,

  // Language
  signLanguage: 'asl',
  uiLanguage: 'en-US',
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => {
        set({ [key]: value } as Partial<SettingsState>)
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS)
      },
    }),
    {
      name: 'gesturetalk-settings',
      version: 1,
      partialize: (state) => {
        // Persist everything except action functions
        const { updateSetting: _, resetSettings: __, ...persisted } = state
        return persisted
      },
    },
  ),
)
