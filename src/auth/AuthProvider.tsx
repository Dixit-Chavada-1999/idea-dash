import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  AuthContext,
  DEMO_CREDENTIALS,
  SESSION_KEY,
  type AuthValue,
  type Session,
} from './context'

/** sessionStorage, not localStorage: closing the browser ends the session. */
function readStored(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function writeStored(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // private mode / storage blocked — the session simply won't survive a reload
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStored)

  const signIn = useCallback<AuthValue['signIn']>((email, password) => {
    const e = email.trim().toLowerCase()
    if (!e || !password) return 'Enter both an email address and a password.'
    if (e !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return 'Those credentials are not recognised on this wireframe.'
    }
    const next = { email: DEMO_CREDENTIALS.email }
    setSession(next)
    writeStored(next)
    return null
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    writeStored(null)
  }, [])

  const value = useMemo<AuthValue>(() => ({ session, signIn, signOut }), [session, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
