/**
 * MainLayout — App shell with sidebar navigation and header.
 * 
 * Premium dark glassmorphism layout inspired by Linear/Raycast.
 * Contains animated sidebar with navigation links and a content area.
 */

import { Outlet, NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useUIStore } from '@/stores/uiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ROUTES, APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  Home,
  MessageSquare,
  BarChart3,
  History,
  Star,
  AlertTriangle,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Hand,
  Menu,
} from 'lucide-react'

/** Navigation items configuration */
const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Home', icon: Home, section: 'main' },
  { path: ROUTES.CONVERSATION, label: 'Conversation', icon: MessageSquare, section: 'main' },
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: BarChart3, section: 'main' },
  { path: ROUTES.HISTORY, label: 'History', icon: History, section: 'tools' },
  { path: ROUTES.FAVORITES, label: 'Favorites', icon: Star, section: 'tools' },
  { path: ROUTES.EMERGENCY, label: 'Emergency', icon: AlertTriangle, section: 'tools' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings, section: 'bottom' },
  { path: ROUTES.PROFILE, label: 'Profile', icon: User, section: 'bottom' },
] as const

export function MainLayout() {
  const location = useLocation()
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)
  const sidebarOpen = useUIStore(state => state.sidebarOpen)
  const toggleSidebar = useUIStore(state => state.toggleSidebar)
  const setSidebarCollapsed = useUIStore(state => state.setSidebarCollapsed)
  const highContrast = useSettingsStore(state => state.highContrast)
  const largeFont = useSettingsStore(state => state.largeFont)

  const mainItems = NAV_ITEMS.filter(i => i.section === 'main')
  const toolItems = NAV_ITEMS.filter(i => i.section === 'tools')
  const bottomItems = NAV_ITEMS.filter(i => i.section === 'bottom')

  return (
    <div
      className={cn(
        'flex h-screen bg-background overflow-hidden',
        highContrast && 'high-contrast',
        largeFont && 'large-font'
      )}
    >
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed lg:relative z-50 h-full flex flex-col glass-strong',
          'border-r border-border/50 transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/30 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-lg text-text whitespace-nowrap overflow-hidden"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-4 px-3 overflow-y-auto scrollbar-thin">
          {/* Main section */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-3 mb-2 block">
                Main
              </span>
            )}
            {mainItems.map(item => (
              <SidebarLink key={item.path} item={item} collapsed={sidebarCollapsed} isActive={location.pathname === item.path} />
            ))}
          </div>

          {/* Tools section */}
          <div className="mt-6 space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-3 mb-2 block">
                Tools
              </span>
            )}
            {toolItems.map(item => (
              <SidebarLink key={item.path} item={item} collapsed={sidebarCollapsed} isActive={location.pathname === item.path} />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom section */}
          <div className="space-y-1 border-t border-border/30 pt-4 mt-4">
            {bottomItems.map(item => (
              <SidebarLink key={item.path} item={item} collapsed={sidebarCollapsed} isActive={location.pathname === item.path} />
            ))}
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-border/30 
                     text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border/30 glass-strong shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Hand className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-text">{APP_NAME}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/** Individual sidebar navigation link */
function SidebarLink({
  item,
  collapsed,
  isActive,
}: {
  item: (typeof NAV_ITEMS)[number]
  collapsed: boolean
  isActive: boolean
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-text-secondary hover:text-text hover:bg-surface-hover',
        collapsed && 'justify-center px-0'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive && 'text-primary')} />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-surface text-text text-xs
                        whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity shadow-elevated border border-border/50 z-50">
          {item.label}
        </div>
      )}
    </NavLink>
  )
}
