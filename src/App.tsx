import { Routes, Route } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { ConversationPage } from '@/pages/ConversationPage'
import { DataStudioPage } from '@/pages/DataStudioPage'
import { ROUTES } from '@/lib/constants'
import './styles/index.css'
import './styles/animations.css'

/**
 * Root application component.
 * Defines all routes within the main layout shell.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        {/* Phase 2 routes */}
        <Route path={ROUTES.CONVERSATION} element={<ConversationPage />} />
        <Route path={ROUTES.DATA_STUDIO} element={<DataStudioPage />} />
        {/* Phase 3 routes */}
        <Route path={ROUTES.DASHBOARD} element={<PlaceholderPage title="Dashboard" />} />
        <Route path={ROUTES.HISTORY} element={<PlaceholderPage title="History" />} />
        <Route path={ROUTES.FAVORITES} element={<PlaceholderPage title="Favorites" />} />
        <Route path={ROUTES.EMERGENCY} element={<PlaceholderPage title="Emergency" />} />
        <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Settings" />} />
        <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profile" />} />
      </Route>
      {/* Auth routes (no sidebar) */}
      <Route path={ROUTES.LOGIN} element={<PlaceholderPage title="Login" />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<PlaceholderPage title="Authenticating..." />} />
      {/* 404 */}
      <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
    </Routes>
  )
}

/**
 * Temporary placeholder for pages not yet built.
 * Will be replaced in Phase 2 and Phase 3.
 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text mb-2">{title}</h1>
        <p className="text-text-muted">Coming soon in the next phase</p>
      </div>
    </div>
  )
}
