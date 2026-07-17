import { getAccessToken } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

if (!BASE_URL) {
  console.warn(
    '[GestureTalk] Missing VITE_API_URL — API calls will use relative URLs.\n' +
      'Add VITE_API_URL to your .env file.',
  )
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/**
 * Structured API error with HTTP status and optional server payload.
 */
export class ApiError extends Error {
  /** HTTP status code returned by the server. */
  readonly status: number
  /** Raw response body (JSON-parsed when possible). */
  readonly data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Standard envelope returned by the API. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Paginated list envelope. */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the full URL for an endpoint path.
 * If `path` already starts with "http", it is returned as-is.
 */
function buildUrl(path: string): string {
  if (path.startsWith('http')) return path
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${base}${clean}`
}

/**
 * Construct the default headers, optionally injecting the auth token.
 */
async function buildHeaders(custom: HeadersInit = {}): Promise<Headers> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...custom,
  })

  const token = await getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

/**
 * Execute a fetch request and return the JSON-parsed body,
 * throwing an {@link ApiError} on non-2xx responses.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const url = buildUrl(path)
  const headers = await buildHeaders(options.headers as HeadersInit | undefined)

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
    // Ensure our headers aren't overwritten by spread
    headers: Object.fromEntries(headers.entries()),
  })

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  let data: unknown
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? (data as { message: string }).message
        : undefined) ?? response.statusText

    throw new ApiError(message, response.status, data)
  }

  return data as T
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Type-safe REST API client.
 *
 * @example
 * ```ts
 * import { api } from '@/lib/api'
 *
 * const users = await api.get<User[]>('/users')
 * const user  = await api.post<User>('/users', { name: 'Alice' })
 * await api.delete('/users/123')
 * ```
 */
export const api = {
  /** Send a GET request. */
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('GET', path, undefined, options)
  },

  /** Send a POST request with a JSON body. */
  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('POST', path, body, options)
  },

  /** Send a PUT request with a JSON body. */
  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('PUT', path, body, options)
  },

  /** Send a PATCH request with a JSON body. */
  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('PATCH', path, body, options)
  },

  /** Send a DELETE request. */
  delete<T = void>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('DELETE', path, undefined, options)
  },
} as const
