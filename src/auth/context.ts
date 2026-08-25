import { createContext, useContext } from 'react'
import type { PublicUser } from '../contracts/auth'

export type AuthValue = {
  user: PublicUser | null
  /** true until the initial /auth/me check settles — render nothing decisive before then */
  loading: boolean
  /** resolves to null on success, or a message to show on the form */
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (input: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => Promise<string | null>
  signOut: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
