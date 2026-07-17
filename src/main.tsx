/**
 * GestureTalk — Application Entry Point
 *
 * Bootstraps the React application with:
 *  - React 19 StrictMode
 *  - React Router v7 (BrowserRouter)
 *  - TanStack Query v5 (QueryClientProvider)
 *  - TailwindCSS v4 design system styles
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/index.css'

/**
 * Global TanStack Query client.
 *
 * - staleTime: 5 minutes — avoids unnecessary refetches for rarely-changing data
 * - retry: 1 — single retry on failure to balance UX and server load
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
