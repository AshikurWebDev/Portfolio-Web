import type { AuthResponse, Problem } from './types'

/*
  HTTP client for the admin. The access token lives only in memory (never in
  localStorage, where any injected script could read it). The refresh token is
  an HttpOnly cookie the browser sends to /api/auth/* automatically.
  On a 401 the client refreshes once and retries the request.
*/

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')

export const adminApiConfigured = API_BASE.length > 0

/** Absolute URL for an API path such as an image URL returned by the API ("/api/..."). */
export const apiUrl = (path: string) => `${API_BASE}${path}`

let accessToken: string | null = null
let refreshing: Promise<AuthResponse | null> | null = null
const listeners = new Set<(auth: AuthResponse | null) => void>()

/** Notified whenever the session starts, refreshes or ends. */
export function onAuthChange(cb: (auth: AuthResponse | null) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setSession(auth: AuthResponse | null) {
  accessToken = auth?.accessToken ?? null
  listeners.forEach((l) => l(auth))
}

export class ApiError extends Error {
  status: number
  problem: Problem
  constructor(status: number, problem: Problem) {
    super(problem.detail || problem.title || `Request failed (${status})`)
    this.status = status
    this.problem = problem
  }
  /** First validation message per field, for showing next to inputs. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(this.problem.errors ?? {})) out[k.charAt(0).toLowerCase() + k.slice(1)] = v[0]
    return out
  }
}

async function raw(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  // JSON by default. FormData (file uploads) must not get a Content-Type here: the browser
  // sets multipart/form-data with the boundary itself.
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' })
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const body = res.headers.get('content-type')?.includes('json') ? await res.json() : null
  if (!res.ok) throw new ApiError(res.status, (body as Problem) ?? { title: res.statusText })
  return body as T
}

/** Try to restore or extend the session from the refresh cookie. Concurrent callers share one request. */
export function refreshSession(): Promise<AuthResponse | null> {
  refreshing ??= raw('/api/auth/refresh', { method: 'POST' })
    .then(async (res) => {
      if (!res.ok) {
        setSession(null)
        return null
      }
      const auth = (await res.json()) as AuthResponse
      setSession(auth)
      return auth
    })
    .catch(() => {
      setSession(null)
      return null
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/** Authenticated request. Refreshes the access token once on 401. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await raw(path, init)
  if (res.status === 401 && (await refreshSession())) res = await raw(path, init)
  return parse<T>(res)
}

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const auth = await parse<AuthResponse>(await raw('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }))
  setSession(auth)
  return auth
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
  const auth = await parse<AuthResponse>(await raw('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }))
  setSession(auth)
  return auth
}

export async function signOut(): Promise<void> {
  try {
    await raw('/api/auth/logout', { method: 'POST' })
  } finally {
    setSession(null)
  }
}
