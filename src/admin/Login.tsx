import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, signInWithGoogle, signInWithPassword } from './client'

/*
  Sign-in screen: a dark page with one white Google button (logo only).
  The button comes from Google Identity Services: Google renders it, the visitor picks an
  account, and Google hands back an ID token, which the API verifies. Only emails on the
  API's Admin:AllowedEmails list get in.

  Email + password appears only when Google sign-in is not configured (no
  VITE_GOOGLE_CLIENT_ID), for local development with the seeded admin account.
*/
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''
const GSI_SRC = 'https://accounts.google.com/gsi/client'

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    const s = existing ?? Object.assign(document.createElement('script'), { src: GSI_SRC, async: true, defer: true })
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('Google sign-in could not load.')))
    if (!existing) document.head.appendChild(s)
  })
}

export default function Login() {
  const btn = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    let alive = true
    loadGsi()
      .then(() => {
        if (!alive || !btn.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setBusy(true)
            setError('')
            try {
              await signInWithGoogle(credential)
            } catch (e) {
              setError(e instanceof ApiError ? e.message : 'Sign-in failed. Please try again.')
            } finally {
              setBusy(false)
            }
          },
        })
        // type "icon": just the Google "G" on a white circle, no text.
        window.google.accounts.id.renderButton(btn.current, { type: 'icon', theme: 'outline', size: 'large', shape: 'circle' })
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])

  const onPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      await signInWithPassword(String(data.get('email')), String(data.get('password')))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Is the API running?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-login">
      <title>Sign in · Admin</title>
      <div className="adm-login__card">
        <span className="adm-logo adm-logo--lg" aria-hidden="true" />
        <h1 className="sr-only">Admin sign-in</h1>

        {CLIENT_ID ? (
          // Google draws its own button (an iframe titled "Sign in with Google") inside this box.
          <div ref={btn} className="adm-login__google" aria-busy={busy} aria-label="Sign in with Google" role="group" />
        ) : (
          <p className="adm-login__note">Google sign-in is off: set VITE_GOOGLE_CLIENT_ID in web/.env and Authentication:Google:ClientId in the API.</p>
        )}

        {error ? (
          <p className="adm-error" role="alert">
            {error}
          </p>
        ) : null}

        {!CLIENT_ID ? (
          <form className="adm-form adm-login__form" onSubmit={onPassword}>
            <label className="adm-field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label className="adm-field">
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
