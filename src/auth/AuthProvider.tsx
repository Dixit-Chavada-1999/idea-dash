import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { authApi } from '../api/auth'
import type { PublicUser } from '../contracts/auth'
import { AuthContext, type AuthValue } from './context'

/**
 * Server-side messages for the codes the API returns. Anything unrecognised
 * falls back to a generic line — the API never sends text meant for display.
 */
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Those credentials are not recognised.',
  ACCOUNT_DISABLED: 'This account has been disabled. Contact an administrator.',
  EMAIL_TAKEN: 'An account already exists for that email address.',
  REGISTRATION_CLOSED: 'Accounts are created by an administrator. Ask for one to be set up.',
  WEAK_PASSWORD: 'Password is too short — use at least 8 characters.',
  VALIDATION: 'Check the details entered and try again.',
  NETWORK: 'Could not reach the server. Is the API running?',
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return MESSAGES[err.code] ?? err.detail ?? 'Something went wrong.'
  return 'Something went wrong.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  // The session lives in an httpOnly cookie, which JavaScript cannot read.
  // Asking the API who we are is the only way to restore it on a reload.
  useEffect(() => {
    let cancelled = false
    authApi
      .me()
      .then((r) => {
        if (!cancelled) setUser(r.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback<AuthValue['signIn']>(async (email, password) => {
    if (!email.trim() || !password) return 'Enter both an email address and a password.'
    try {
      const { user } = await authApi.login({ email, password })
      setUser(user)
      return null
    } catch (err) {
      return messageFor(err)
    }
  }, [])

  const signUp = useCallback<AuthValue['signUp']>(async (input) => {
    try {
      const { user } = await authApi.register(input)
      setUser(user)
      return null
    } catch (err) {
      return messageFor(err)
    }
  }, [])

  const signOut = useCallback(async () => {
    // clear locally even if the call fails — the user asked to leave
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const changePassword = useCallback<AuthValue['changePassword']>(async (current, next) => {
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next })
      return null
    } catch (err) {
      return messageFor(err)
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signUp, signOut, changePassword }),
    [user, loading, signIn, signUp, signOut, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
