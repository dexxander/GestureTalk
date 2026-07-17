import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Environment variables
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

if (!supabaseUrl) {
  console.warn(
    '[GestureTalk] Missing VITE_SUPABASE_URL — Supabase features will not work.\n' +
      'Add VITE_SUPABASE_URL to your .env file.',
  )
}

if (!supabaseAnonKey) {
  console.warn(
    '[GestureTalk] Missing VITE_SUPABASE_ANON_KEY — Supabase features will not work.\n' +
      'Add VITE_SUPABASE_ANON_KEY to your .env file.',
  )
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Shared Supabase client instance.
 *
 * Falls back to empty strings when env vars are missing so the app still
 * boots (unauthenticated features remain functional), but all Supabase
 * calls will fail gracefully.
 */
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve the current Supabase session's access token.
 * Returns `null` when no user is authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
