/**
 * Shared with the frontend. Keep in sync with the copy in the web repo —
 * these shapes are the contract between the two.
 */

export type Role = 'admin' | 'manager' | 'standard'

export type PublicUser = {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  role: Role
}

export type LoginBody = { email: string; password: string }
export type RegisterBody = { email: string; password: string; firstName?: string; lastName?: string }
export type ChangePasswordBody = { currentPassword: string; newPassword: string }

export type AuthResponse = { user: PublicUser }

/** Error codes the client is allowed to branch on. */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_DISABLED'
  | 'EMAIL_TAKEN'
  | 'NOT_AUTHENTICATED'
  | 'WEAK_PASSWORD'
  | 'VALIDATION'
