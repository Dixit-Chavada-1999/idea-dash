import { createContext, useContext } from 'react'

/**
 * Demo-only credentials. This is a wireframe gate, not authentication:
 * the check runs in the browser, so anyone can read it out of the bundle.
 * Swap for a real provider before this holds anything confidential.
 */
export const DEMO_CREDENTIALS = {
  email: 'admin@ideadesh.com',
  password: 'admin@123',
}

export const SESSION_KEY = 'idea-console-session'

export type Session = { email: string }

export type AuthValue = {
  session: Session | null
  /** returns null on success, or a message to show on the form */
  signIn: (email: string, password: string) => string | null
  signOut: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
