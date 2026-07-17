import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UI state store – manages transient layout state such as the sidebar,
 * modals, toast notifications, and fullscreen mode.
 *
 * Only `sidebarCollapsed` is persisted to localStorage so the user's
 * preferred sidebar width is remembered across sessions.
 *
 * @example Selecting an object slice (wrap with useShallow):
 * ```ts
 * import { useShallow } from 'zustand/react/shallow'
 * const { sidebarOpen, sidebarCollapsed } = useUIStore(
 *   useShallow(s => ({ sidebarOpen: s.sidebarOpen, sidebarCollapsed: s.sidebarCollapsed }))
 * )
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  /** Unique identifier for this notification. */
  id: string
  /** Visual style / severity. */
  type: 'success' | 'error' | 'warning' | 'info'
  /** Short headline. */
  title: string
  /** Optional longer description. */
  message?: string
  /** Auto-dismiss duration in milliseconds. Omit or set to 0 for sticky. */
  duration?: number
}

export interface UIState {
  /** Whether the sidebar drawer is open (on mobile or when toggled). */
  sidebarOpen: boolean
  /** Whether the sidebar is in collapsed / icon-only mode. */
  sidebarCollapsed: boolean
  /** The currently open modal identifier, or null. */
  activeModal: string | null
  /** Active toast notifications. */
  notifications: Notification[]
  /** Whether the app is in browser fullscreen mode. */
  isFullscreen: boolean

  // ── Actions ──────────────────────────────────────────────────────────
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  setFullscreen: (fullscreen: boolean) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let notificationCounter = 0

/** Generate a short unique ID for notifications. */
function createNotificationId(): string {
  notificationCounter += 1
  return `notif_${Date.now()}_${notificationCounter}`
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeModal: null,
      notifications: [],
      isFullscreen: false,

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      openModal: (modalId) => {
        set({ activeModal: modalId })
      },

      closeModal: () => {
        set({ activeModal: null })
      },

      addNotification: (notification) => {
        const id = createNotificationId()
        const full: Notification = { ...notification, id }

        set((state) => ({
          notifications: [...state.notifications, full],
        }))

        // Auto-dismiss after duration (default 5 000 ms)
        const duration = notification.duration ?? 5_000
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }))
          }, duration)
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      setFullscreen: (fullscreen) => {
        set({ isFullscreen: fullscreen })
      },
    }),
    {
      name: 'gesturetalk-ui',
      version: 1,
      // Only persist the sidebar collapsed preference
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
