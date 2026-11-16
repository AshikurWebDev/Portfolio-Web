import { useEffect, useState } from 'react'
import { onAuthChange, refreshSession } from './client'
import type { CurrentUser } from './types'

type AuthState = { status: 'checking' } | { status: 'signed-out' } | { status: 'signed-in'; user: CurrentUser }

/** Current admin session. On first use it tries to restore the session from the refresh cookie. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'checking' })
  useEffect(() => {
    const off = onAuthChange((auth) => setState(auth ? { status: 'signed-in', user: auth.user } : { status: 'signed-out' }))
    refreshSession()
    return off
  }, [])
  return state
}
